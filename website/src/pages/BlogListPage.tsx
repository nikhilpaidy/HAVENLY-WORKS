import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedBlogs, BlogPostItem, getMediaUrl } from '../services/api.js';
import { Clock, Search, BookOpen } from 'lucide-react';

export const BlogListPage: React.FC = () => {
  const [blogs, setBlogs] = useState<BlogPostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Workplace Trends', 'Operations', 'Architecture', 'Engineering'];

  useEffect(() => {
    setLoading(true);
    getPublishedBlogs({
      category: selectedCategory === 'All' ? undefined : selectedCategory,
      search: search || undefined
    })
      .then((data) => setBlogs(data))
      .finally(() => setLoading(false));
  }, [selectedCategory, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-14">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#B6925A] dark:text-[#C5A880]">
          Articles & Architecture
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white">
          The Workspace Journal
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300">
          Strategic perspectives on spatial design, quota accounting, and high-concurrency reservation algorithms.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-panel p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-[#C5A880]"
          />
        </div>
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-500">Loading articles from API...</div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 glass-panel rounded-3xl border border-slate-200 dark:border-slate-800 p-10 space-y-3">
          <BookOpen className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No articles found</h3>
          <p className="text-sm text-slate-500">Try adjusting your category or search filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((post) => (
            <Link
              key={post._id}
              to={`/blog/${post.slug}`}
              className="group rounded-3xl overflow-hidden glass-panel border border-slate-200/80 dark:border-slate-800/80 hover:border-[#C5A880]/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-52 overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                  {post.coverImageUrl && (
                    <img
                      src={getMediaUrl(post.coverImageUrl)}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    {post.categories?.[0] || 'Trends'}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-[#B6925A] dark:group-hover:text-[#C5A880] transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span>{post.author?.name}</span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> {post.readTimeMinutes} min read
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
