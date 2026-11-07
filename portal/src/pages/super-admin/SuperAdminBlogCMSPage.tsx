import React, { useEffect, useState } from 'react';
import { superAdminApi } from '../../services/api.js';
import { FileEdit, Plus, Trash2, Eye, Globe, Clock, CheckCircle2, Archive, Search } from 'lucide-react';
import { ConfirmationModal } from '../../components/ConfirmationModal.js';
import { AlertModal } from '../../components/AlertModal.js';
import { formatDateIST } from '../../utils/formatters.js';

export const SuperAdminBlogCMSPage: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ isOpen: boolean; title: string; message: string; type?: 'error' | 'success' }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'error'
  });

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImageUrl: '',
    authorName: 'Alexander Vance',
    authorRole: 'Platform Director',
    categories: 'Workplace Trends',
    tags: 'Architecture, Productivity',
    status: 'DRAFT',
    seoTitle: '',
    seoDescription: '',
    readTimeMinutes: 5
  });

  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploadingImage(true);
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const res = await superAdminApi.uploadBlogImage(base64, file.name);
          if (res && res.url) {
            setFormData((prev) => ({ ...prev, coverImageUrl: res.url }));
          }
        } catch (uploadErr: any) {
          setAlertInfo({
            isOpen: true,
            title: 'Upload Failed',
            message: uploadErr.message || 'Failed to process local image',
            type: 'error'
          });
        } finally {
          setUploadingImage(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadingImage(false);
      setAlertInfo({
        isOpen: true,
        title: 'Upload Failed',
        message: err.message || 'Failed to upload local image',
        type: 'error'
      });
    }
  };

  const loadBlogs = () => {
    setLoading(true);
    superAdminApi
      .getBlogs()
      .then((data) => setBlogs(data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
      authorName: 'Alexander Vance',
      authorRole: 'Platform Director',
      categories: 'Workplace Trends',
      tags: 'Architecture, Meeting Rooms',
      status: 'DRAFT',
      seoTitle: '',
      seoDescription: '',
      readTimeMinutes: 5
    });
    setIsModalOpen(true);
  };

  const openEditModal = (post: any) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      coverImageUrl: post.coverImageUrl || '',
      authorName: post.author?.name || 'Alexander Vance',
      authorRole: post.author?.role || 'Platform Director',
      categories: post.categories?.join(', ') || 'Workplace Trends',
      tags: post.tags?.join(', ') || '',
      status: post.status,
      seoTitle: post.seo?.title || '',
      seoDescription: post.seo?.description || '',
      readTimeMinutes: post.readTimeMinutes || 5
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        excerpt: formData.excerpt,
        content: formData.content,
        coverImageUrl: formData.coverImageUrl,
        author: {
          name: formData.authorName,
          role: formData.authorRole
        },
        categories: formData.categories.split(',').map((c) => c.trim()).filter(Boolean),
        tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
        status: formData.status,
        seo: {
          title: formData.seoTitle || formData.title,
          description: formData.seoDescription || formData.excerpt
        },
        readTimeMinutes: Number(formData.readTimeMinutes)
      };

      if (editingPost) {
        await superAdminApi.updateBlog(editingPost._id, payload);
      } else {
        await superAdminApi.createBlog(payload);
      }

      setIsModalOpen(false);
      loadBlogs();
    } catch (err: any) {
      setAlertInfo({
        isOpen: true,
        title: 'Error Saving Article',
        message: err.message || 'Failed to save blog post. Please check the required fields.',
        type: 'error'
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await superAdminApi.deleteBlog(deleteTargetId);
      setDeleteTargetId(null);
      loadBlogs();
    } catch (err: any) {
      setAlertInfo({
        isOpen: true,
        title: 'Failed to Delete Article',
        message: err.message || 'An error occurred while deleting the article.',
        type: 'error'
      });
    }
  };

  const handleQuickPublish = async (post: any) => {
    const nextStatus = post.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await superAdminApi.updateBlog(post._id, { status: nextStatus });
      loadBlogs();
    } catch (err: any) {
      setAlertInfo({
        isOpen: true,
        title: 'Status Update Failed',
        message: err.message || 'Failed to update publication status.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B6925A] dark:text-[#C5A880]">
            Content Management
          </span>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white mt-1">
            Blog & Journal CMS
          </h1>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold shadow-md hover:opacity-95 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Blogs Table */}
      <div className="glass-panel rounded-3xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider font-semibold text-slate-500">
              <tr>
                <th className="py-3.5 px-6">Article Title & Slug</th>
                <th className="py-3.5 px-6">Author</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">Loading articles...</td>
                </tr>
              ) : blogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">No blog posts found.</td>
                </tr>
              ) : (
                blogs.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-6 max-w-sm">
                      <div className="font-bold text-slate-900 dark:text-white line-clamp-1">{b.title}</div>
                      <div className="text-slate-400 text-[10px]">slug: {b.slug}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-700 dark:text-slate-300 font-medium">
                      {b.author?.name || 'HavenlyWork'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {b.categories?.[0] || 'General'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {b.status === 'PUBLISHED' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Published
                        </span>
                      ) : b.status === 'ARCHIVED' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                          Archived
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 text-[11px]">
                      {b.publishedAt ? formatDateIST(b.publishedAt) : 'Unpublished'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleQuickPublish(b)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        {b.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                      </button>
                      <button
                        onClick={() => openEditModal(b)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#B6925A] dark:text-[#C5A880] hover:bg-amber-500/10 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(b._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete article"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="glass-panel max-w-2xl w-full p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 my-8">
            <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white">
              {editingPost ? 'Edit Blog Article' : 'Compose New Article'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g. Acoustic Optimization in Executive Boardrooms"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Slug
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    placeholder="acoustic-optimization-boardrooms"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published (Live)</option>
                    <option value="ARCHIVED">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold uppercase tracking-wider text-slate-500">
                    Cover Image
                  </label>
                  <label className="cursor-pointer text-[11px] font-bold text-brand-600 dark:text-gold-400 hover:underline flex items-center space-x-1">
                    <span>{uploadingImage ? 'Uploading Image...' : '+ Upload from Computer'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploadingImage}
                      onChange={handleImageFileSelect}
                    />
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.coverImageUrl}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="https://... or /uploads/..."
                />
                {formData.coverImageUrl && (
                  <div className="mt-2 relative rounded-xl overflow-hidden h-28 border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                    <img
                      src={
                        formData.coverImageUrl.startsWith('/')
                          ? `http://localhost:6018${formData.coverImageUrl}`
                          : formData.coverImageUrl
                      }
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Summary Excerpt *
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="Brief synopsis displayed on article cards..."
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Rich Article Content (HTML allowed) *
                </label>
                <textarea
                  rows={6}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                  placeholder="<p>Write your detailed article body here...</p>"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Categories (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.categories}
                    onChange={(e) => setFormData({ ...formData, categories: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#141A29] dark:bg-[#C5A880] text-white dark:text-[#090D16] text-xs font-bold shadow-md"
                >
                  {editingPost ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDelete}
        title="Delete Blog Post"
        message="Are you sure you want to permanently delete this article? This action cannot be undone."
        confirmText="Delete Article"
        variant="danger"
      />

      {/* Alert / Feedback Modal */}
      <AlertModal
        isOpen={alertInfo.isOpen}
        onClose={() => setAlertInfo({ ...alertInfo, isOpen: false })}
        title={alertInfo.title}
        message={alertInfo.message}
        type={alertInfo.type}
      />
    </div>
  );
};
