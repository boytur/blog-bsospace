"use client";

import React from "react";
import Link from "next/link";
import { Post } from "../interfaces";
import { Calendar, Eye, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import Image from "next/image";

interface BlogCardProps {
  post: Post;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: th });
    } catch {
      return "";
    }
  };

  const formatReadTime = (readTime: number) => {
    if (!readTime || readTime === 0) return "5 min read";
    return `${Math.round(readTime)} min read`;
  };

  return (
    <div className="bg-slate-900 border border-slate-700/50 rounded-lg overflow-hidden hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-300 group h-96 flex flex-col">
      {/* Thumbnail */}
      {post.thumbnail && (
        <div className="relative h-48 overflow-hidden flex-shrink-0">
          <Image
            src={post.thumbnail}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          {/* Tech overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/50 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </div>
      )}

      {/* Content */}
      <div className="p-3 sm:p-4 md:p-6 flex flex-col flex-1 min-h-0">
        {/* Date and Read Time */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
            <span className="truncate">{formatDate(post.published_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
            <span>{formatReadTime(post.read_time)}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base text-black sm:text-lg md:text-xl font-bold dark:text-white mb-2 sm:mb-3 line-clamp-2 group-hover:text-orange-400 transition-colors leading-tight">
          <Link href={`/posts/@${post.author?.username}/${post.slug}`}>
            {post.title}
          </Link>
        </h3>

        {/* Description */}
        {post.description && (
          <p className="text-slate-300 mb-3 sm:mb-4 line-clamp-3 leading-relaxed text-sm sm:text-base">
            {post.description}
          </p>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="px-2 sm:px-3 py-1 text-xs font-medium bg-orange-500/20 text-orange-300 rounded-full border border-orange-500/30 hover:bg-orange-500/30 transition-colors cursor-pointer"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Stats and Read More */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mt-auto">
          <div className="flex items-center gap-1 text-xs sm:text-sm text-slate-400">
            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
            <span>{post.views?.toLocaleString() || "0"} views</span>
          </div>
          
          <Link
            href={`/posts/@${post.author?.username}/${post.slug}`}
            className="text-orange-400 hover:text-orange-300 font-medium text-xs sm:text-sm transition-colors self-start sm:self-auto"
          >
            Read More →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogCard;
