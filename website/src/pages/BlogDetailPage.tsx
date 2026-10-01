import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogBySlug, BlogPostItem, getMediaUrl } from '../services/api.js';
import { ArrowLeft, Clock, Calendar, User } from 'lucide-react';

export const BlogDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPostItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      getBlogBySlug(slug)
        .then((data) => setPost(data))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return <div className="text-center py-32 text-slate-500">Loading article...</div>;
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Article Not Found</h1>
        <p className="text-slate-500 text-sm">The article you are looking for does not exist or has been archived.</p>
        <Link
          to="/blog"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-[#B6925A] dark:text-[#C5A880] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Journal</span>
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-10">
      {/* Back button */}
      <div>
        <Link
          to="/blog"
          className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </Link>
      </div>

      {/* Header Info */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {post.categories?.map((c, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-[#B6925A] dark:text-[#C5A880] border border-amber-500/20"
            >
              {c}
            </span>
          ))}
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 dark:text-white leading-[1.15]">
          {post.title}
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
          {post.excerpt}
        </p>

        {/* Metadata Bar */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 overflow-hidden">
              {post.author?.avatarUrl ? (
                <img src={post.author.avatarUrl} alt={post.author.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-900 dark:text-white text-sm">
                {post.author?.name}
              </div>
              <div>{post.author?.role}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1" />
              {post.readTimeMinutes} min read
            </span>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImageUrl && (
        <div className="rounded-3xl overflow-hidden glass-panel border border-slate-200 dark:border-slate-800 shadow-xl max-h-[460px]">
          <img src={getMediaUrl(post.coverImageUrl)} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      {/* Rich Article Body */}
      <div
        className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed pt-4 border-t border-slate-200 dark:border-slate-800"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags footer */}
      {post.tags && post.tags.length > 0 && (
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mr-2">
            Related Tags:
          </span>
          {post.tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};
