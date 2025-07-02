import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  FieldValue
} from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { Comment, CommentThread, CommentFilters, CommentModerationAction, CommentStats } from '@/types/comment';
import { hasModeratorPermissions } from './moderation';
import { User } from '@/types/user';

const db = getFirebaseDb();

// Add a new comment
export async function addComment(
  websiteId: string,
  content: string,
  userId: string,
  userDisplayName: string,
  userPhotoURL?: string,
  parentId?: string
): Promise<string> {
  try {
    const commentData = {
      websiteId,
      content: content.trim(),
      userId,
      userDisplayName,
      userPhotoURL: userPhotoURL || null,
      parentId: parentId || null,
      likes: 0,
      likedBy: [],
      isModerated: false,
      isApproved: true, // Auto-approve for now, can be changed for stricter moderation
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'comments'), commentData);

    // Update website comment count
    const websiteRef = doc(db, 'websites', websiteId);
    await updateDoc(websiteRef, {
      commentCount: increment(1)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw new Error('Failed to add comment');
  }
}

// Get comments for a website
export async function getComments(filters: CommentFilters): Promise<CommentThread[]> {
  try {
    const { websiteId, sortBy = 'newest', limit = 50, approved = true } = filters;

    let q = query(
      collection(db, 'comments'),
      where('websiteId', '==', websiteId),
      where('isApproved', '==', approved)
    );

    // Add sorting
    switch (sortBy) {
      case 'oldest':
        q = query(q, orderBy('createdAt', 'asc'));
        break;
      case 'most-liked':
        q = query(q, orderBy('likes', 'desc'));
        break;
      case 'newest':
      default:
        q = query(q, orderBy('createdAt', 'desc'));
        break;
    }

    if (limit) {
      q = query(q, firestoreLimit(limit));
    }

    const querySnapshot = await getDocs(q);
    const comments: Comment[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      comments.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as Comment);
    });

    // Build comment threads (nest replies under parent comments)
    return buildCommentThreads(comments);
  } catch (error) {
    console.error('Error getting comments:', error);
    throw new Error('Failed to load comments');
  }
}

// Build nested comment structure
function buildCommentThreads(comments: Comment[]): CommentThread[] {
  const commentMap = new Map<string, CommentThread>();
  const rootThreads: CommentThread[] = [];

  // First pass: create threads for all comments
  comments.forEach(comment => {
    const thread: CommentThread = {
      comment,
      replies: [],
      replyCount: 0
    };
    commentMap.set(comment.id, thread);
  });

  // Second pass: organize into tree structure
  comments.forEach(comment => {
    const thread = commentMap.get(comment.id)!;
    
    if (comment.parentId) {
      // This is a reply
      const parentThread = commentMap.get(comment.parentId);
      if (parentThread) {
        parentThread.replies.push(thread);
        parentThread.replyCount++;
      }
    } else {
      // This is a root comment
      rootThreads.push(thread);
    }
  });

  return rootThreads;
}

// Like/Unlike a comment
export async function toggleCommentLike(commentId: string, userId: string): Promise<{ liked: boolean; newLikeCount: number }> {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) {
      throw new Error('Comment not found');
    }

    const commentData = commentDoc.data() as Comment;
    const isLiked = commentData.likedBy.includes(userId);

    if (isLiked) {
      // Unlike
      await updateDoc(commentRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
        updatedAt: serverTimestamp()
      });
      return { liked: false, newLikeCount: commentData.likes - 1 };
    } else {
      // Like
      await updateDoc(commentRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
        updatedAt: serverTimestamp()
      });
      return { liked: true, newLikeCount: commentData.likes + 1 };
    }
  } catch (error) {
    console.error('Error toggling comment like:', error);
    throw new Error('Failed to update like');
  }
}

// Update comment content
export async function updateComment(commentId: string, content: string, userId: string): Promise<void> {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) {
      throw new Error('Comment not found');
    }

    const commentData = commentDoc.data() as Comment;
    
    // Check if user owns the comment
    if (commentData.userId !== userId) {
      throw new Error('Not authorized to edit this comment');
    }

    await updateDoc(commentRef, {
      content: content.trim(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    throw new Error('Failed to update comment');
  }
}

// Delete comment
export async function deleteComment(commentId: string, userId: string, user?: User): Promise<void> {
  try {
    const commentRef = doc(db, 'comments', commentId);
    const commentDoc = await getDoc(commentRef);
    
    if (!commentDoc.exists()) {
      throw new Error('Comment not found');
    }

    const commentData = commentDoc.data() as Comment;
    
    // Check if user owns the comment or has moderator permissions
    const canDelete = commentData.userId === userId || (user && hasModeratorPermissions(user));
    
    if (!canDelete) {
      throw new Error('Not authorized to delete this comment');
    }

    await deleteDoc(commentRef);

    // Update website comment count
    const websiteRef = doc(db, 'websites', commentData.websiteId);
    await updateDoc(websiteRef, {
      commentCount: increment(-1)
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment');
  }
}

// Moderate comment (for moderators/admins)
export async function moderateComment(action: CommentModerationAction, moderatorUser: User): Promise<void> {
  try {
    if (!hasModeratorPermissions(moderatorUser)) {
      throw new Error('Not authorized to moderate comments');
    }

    const { commentId, action: moderationAction, reason, moderatorId } = action;
    const commentRef = doc(db, 'comments', commentId);

    const updateData: {
      isModerated: boolean;
      moderatedBy: string;
      moderationReason: string | null;
      updatedAt: FieldValue;
      isApproved?: boolean;
    } = {
      isModerated: true,
      moderatedBy: moderatorId,
      moderationReason: reason || null,
      updatedAt: serverTimestamp()
    };

    switch (moderationAction) {
      case 'approve':
        updateData.isApproved = true;
        break;
      case 'reject':
        updateData.isApproved = false;
        break;
      case 'delete':
        await deleteComment(commentId, moderatorId, moderatorUser);
        return;
    }

    await updateDoc(commentRef, updateData);
  } catch (error) {
    console.error('Error moderating comment:', error);
    throw new Error('Failed to moderate comment');
  }
}

// Get comment statistics for a website
export async function getCommentStats(websiteId: string): Promise<CommentStats> {
  try {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('websiteId', '==', websiteId)
    );

    const querySnapshot = await getDocs(commentsQuery);
    const stats: CommentStats = {
      totalComments: 0,
      approvedComments: 0,
      pendingComments: 0,
      rejectedComments: 0
    };

    querySnapshot.forEach((doc) => {
      const comment = doc.data() as Comment;
      stats.totalComments++;
      
      if (comment.isApproved) {
        stats.approvedComments++;
      } else if (comment.isModerated) {
        stats.rejectedComments++;
      } else {
        stats.pendingComments++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error getting comment stats:', error);
    throw new Error('Failed to load comment statistics');
  }
}

// Real-time comment subscription
export function subscribeToComments(
  websiteId: string,
  callback: (comments: CommentThread[]) => void,
  filters: Omit<CommentFilters, 'websiteId'> = {}
): Unsubscribe {
  try {
    const { sortBy = 'newest', approved = true } = filters;

    let q = query(
      collection(db, 'comments'),
      where('websiteId', '==', websiteId),
      where('isApproved', '==', approved)
    );

    // Add sorting
    switch (sortBy) {
      case 'oldest':
        q = query(q, orderBy('createdAt', 'asc'));
        break;
      case 'most-liked':
        q = query(q, orderBy('likes', 'desc'));
        break;
      case 'newest':
      default:
        q = query(q, orderBy('createdAt', 'desc'));
        break;
    }

    return onSnapshot(q, (querySnapshot) => {
      const comments: Comment[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        comments.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as Comment);
      });

      const threads = buildCommentThreads(comments);
      callback(threads);
    });
  } catch (error) {
    console.error('Error subscribing to comments:', error);
    return () => {}; // Return empty unsubscribe function
  }
} 