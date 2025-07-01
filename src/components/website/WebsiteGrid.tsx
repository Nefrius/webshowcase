"use client";

import { motion } from "framer-motion";
import WebsiteCard from "./WebsiteCard";
import { Website } from "@/types/website";
import { Loader2 } from "lucide-react";

interface WebsiteGridProps {
  websites: Website[];
  loading?: boolean;
  onLikeUpdate?: (websiteId: string, newLikes: number) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function WebsiteGrid({ 
  websites, 
  loading = false, 
  onLikeUpdate
}: WebsiteGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Websiteleri yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (websites.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <p className="text-lg font-medium mb-2">Henüz website bulunmuyor</p>
          <p className="text-sm">İlk websiteni ekleyerek başla!</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {websites.map((website) => (
        <motion.div key={website.id} variants={itemVariants}>
          <WebsiteCard
            website={website}
            onLikeUpdate={onLikeUpdate}
          />
        </motion.div>
      ))}
    </motion.div>
  );
} 