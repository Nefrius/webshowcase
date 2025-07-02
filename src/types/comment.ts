export interface Comment {
  id: string;
  websiteId: string;
  userId: string;
  userDisplayName: string;
  userPhotoURL?: string;
  content: string;
  parentId?: string; // null for top-level comments, comment id for replies
  likes: number;
  likedBy: string[]; // Array of user IDs who liked this comment
  isModerated: boolean;
  isApproved: boolean;
  moderatedBy?: string;
  moderationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentThread {
  comment: Comment;
  replies: CommentThread[];
  replyCount: number;
}

export interface CommentFilters {
  websiteId: string;
  sortBy?: 'newest' | 'oldest' | 'most-liked';
  limit?: number;
  approved?: boolean;
}

export interface CommentModerationAction {
  commentId: string;
  action: 'approve' | 'reject' | 'delete';
  reason?: string;
  moderatorId: string;
}

export interface CommentStats {
  totalComments: number;
  approvedComments: number;
  pendingComments: number;
  rejectedComments: number;
} 