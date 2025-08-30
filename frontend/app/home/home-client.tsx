/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Meta } from "../interfaces";
import BlogCard from "../components/Blog";
import { Post } from "../interfaces";
import { FiCode, FiCpu, FiSearch, FiTrendingUp, FiZap, FiBookOpen, FiClock, FiEye, FiHeart } from "react-icons/fi";
import Loading from "../components/Loading";
import { CookiesConsentModal } from "../components/cookies-consent-modal";
import { formatDate } from "@/lib/utils";

export default function HomePageClient({ 
  fetchPosts, 
  fetchPopularPosts 
}: { 
  fetchPosts: (page: number, limit: number, search: string) => Promise<{ data: Post[]; meta: Meta }>;
  fetchPopularPosts: () => Promise<{ data: Post[]; meta: Meta }>;
}) {
  // Constants
  const NO_SEARCH_QUERY = "";
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [popularPosts, setPopularPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Improved debounced search
  const debouncedSearch = useCallback((query: string) => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(query);
      setPage(1);
      setPosts([]);
    }, 300);
  }, []);

  const getPosts = useCallback(async (pageNum = 1, isLoadMore = false) => {
    try {
      if (pageNum === 1 && !isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await fetchPosts(pageNum, 5, searchQuery);

      if (pageNum === 1) {
        setPosts(res.data);
      } else {
        setPosts(prevPosts => [...prevPosts, ...res.data]);
      }

      setHasNextPage(res.meta.hasNextPage);
      setPage(pageNum);

    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsFirstLoad(false);
    }
  }, [searchQuery, fetchPosts]);

  const getPopularPosts = useCallback(async () => {
    try {
      setLoadingPopular(true);
      const popularPostsData = await fetchPopularPosts();
      setPopularPosts(popularPostsData.data);
    } catch (err) {
      console.error("Failed to load popular posts:", err);
    } finally {
      setLoadingPopular(false);
    }
  }, []);

  // Improved Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasNextPage &&
          !loadingMore &&
          !loading &&
          posts?.length > 0
        ) {
          getPosts(page + 1, true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [hasNextPage, loadingMore, loading, posts?.length, page, getPosts]);

  // Initial load and search effect
  useEffect(() => {
    if (isFirstLoad) {
      getPosts(1);
      getPopularPosts();
    } else {
      getPosts(1);
    }
  }, [searchQuery]);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-6">
        {/* Header Section - More Compact */}
        <div className="absolute inset-0 overflow-hidden mt-16">
          <div className="absolute top-10 left-1/4 w-48 h-48 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-40 h-40 bg-gradient-to-br from-red-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
        </div>

        <header className="text-center mb-12 relative">
          <div className="relative z-10">
            <div className="flex justify-center items-center mb-4">
              <FiCode className="w-6 h-6 text-orange-400 mr-2" />
              <h1 className="text-2xl md:text-5xl font-bold" style={{
                background: 'linear-gradient(to right, #fb923c, #f87171, #facc15)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.2'
              }}>
                Be Simple but Outstanding
              </h1>
              <FiCpu className="w-6 h-6 text-red-400 ml-2" />
            </div>

            {/* Compact search bar */}
            <div className="relative max-w-xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาบทความ..."
                  className="w-full p-3 pl-10 pr-20 text-sm rounded-xl bg-slate-800/50 backdrop-blur-md border border-slate-700/50 dark:text-white placeholder-slate-400 focus:outline-none focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 transition-all duration-300"
                  onChange={handleSearchChange}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />

                {/* Search button */}
                <button className="absolute right-1.5 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 rounded-lg text-white text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-300">
                  <FiZap className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Posts Section */}
          <div className="lg:col-span-2 order-2 lg:order-none">
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FiTrendingUp className="w-5 h-5 text-orange-400 mr-2" />
                  <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mt-3">
                    Latest From the BSO Blog
                  </h2>
                </div>
              </div>

              {/* Blog Posts - Compact layout */}
              <div className="space-y-4">
                {loading && posts?.length === 0 ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700/30 animate-pulse">
                        <div className="flex flex-col md:flex-row">
                          {/* Thumbnail skeleton */}
                          <div className="w-full md:w-2/5 flex-shrink-0">
                            <div className="h-40 sm:h-48 md:h-56 bg-slate-700 rounded-lg"></div>
                          </div>
                          
                          {/* Content skeleton */}
                          <div className="w-full md:w-3/5 p-4 flex flex-col">
                            {/* Tags skeleton */}
                            <div className="flex gap-2 mb-3">
                              <div className="w-16 h-6 bg-slate-700 rounded-full"></div>
                              <div className="w-20 h-6 bg-slate-700 rounded-full"></div>
                              <div className="w-14 h-6 bg-slate-700 rounded-full"></div>
                            </div>
                            
                            {/* Title skeleton */}
                            <div className="h-5 bg-slate-700 rounded mb-3 w-3/4"></div>
                            <div className="h-5 bg-slate-700 rounded mb-4 w-1/2"></div>
                            
                            {/* Description skeleton */}
                            <div className="space-y-2 mb-4 flex-grow">
                              <div className="h-4 bg-slate-700 rounded w-full"></div>
                              <div className="h-4 bg-slate-700 rounded w-4/5"></div>
                              <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                            </div>
                            
                            {/* Bottom section skeleton */}
                            <div className="border-t border-slate-700/50 pt-4">
                              <div className="flex items-center justify-between">
                                {/* Author skeleton */}
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-slate-700 rounded-full"></div>
                                  <div className="space-y-1">
                                    <div className="w-20 h-3 bg-slate-700 rounded"></div>
                                    <div className="w-16 h-3 bg-slate-700 rounded"></div>
                                  </div>
                                </div>
                                
                                {/* Stats skeleton */}
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-3 bg-slate-700 rounded"></div>
                                  <div className="w-8 h-3 bg-slate-700 rounded"></div>
                                  <div className="w-8 h-3 bg-slate-700 rounded"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : posts && posts?.length > 0 ? (
                  <>
                    {posts.map((post, index) => (
                      <div key={`${post.id}-${index}`} className="bg-slate-800/50 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300">
                        <BlogCard post={post} />
                      </div>
                    ))}

                    {/* Lazy loading trigger */}
                    {hasNextPage && (
                      <div
                        ref={observerRef}
                        className="text-center py-6 w-full flex justify-center"
                      >
                        {loadingMore && (
                          <Loading label="Loading more..." />
                        )}
                      </div>
                    )}

                    {/* End of content indicator */}
                    {!hasNextPage && posts?.length > 5 && (
                      <div className="text-center py-6">
                        <p className="text-slate-400 text-sm">
                          You have already read all stories 🎉
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-3">
                      <FiSearch className="w-12 h-12 text-slate-600 mx-auto" />
                    </div>
                    <p className="text-base text-slate-400 mb-2">
                      Not found any posts
                    </p>
                    <p className="text-sm text-slate-500">
                      Try searching for something else or check back later.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Popular Posts Section - Sidebar */}
          <div className="lg:col-span-1 order-1 lg:order-none">
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <FiBookOpen className="w-5 h-5 text-orange-400 mr-2 flex-shrink-0" />
                  <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mt-3">
                    Popular Posts
                  </h2>
                </div>
                <div className="text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
                  Top 10
                </div>
              </div>

              {loadingPopular ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 animate-pulse">
                      <div className="h-4 bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : popularPosts && popularPosts.length > 0 ? (
                <div className="space-y-4">
                  {popularPosts.slice(0, 10).map((post, index) => (
                    <Link 
                      key={post.id} 
                      href={`/posts/@${post.author?.username}/${post.slug}`}
                      className="group cursor-pointer bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 block"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200 line-clamp-2 mb-2">
                            {post.title}
                          </h3>
                          
                          {/* Author info */}
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-5 h-5 rounded-full bg-slate-700 overflow-hidden">
                              {post.author?.avatar && (
                                <img 
                                  src={post.author.avatar} 
                                  alt={post.author.username}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <span className="text-xs dark:text-white">
                              @{post.author?.username || "ผู้เขียน"}
                            </span>
                          </div>

                          {/* Date */}
                          <div className="flex items-center text-xs text-slate-400">
                            <FiClock className="w-3 h-3 mr-1" />
                            <span>
                              {post.published_at ? formatDate(post.published_at) : 'ไม่มีวันที่'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm">No popular posts available</p>
                </div>
              )}
            </section>
          </div>
        </div>

        {/* Cookies Consent Modal */}
        <CookiesConsentModal />
      </div>
    </div>
  );
}