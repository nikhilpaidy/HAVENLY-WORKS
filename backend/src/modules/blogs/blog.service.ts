import { BlogPost, IBlogPost } from './blog.model.js';
import { BlogPostStatus } from '../../types/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getPublishedBlogs(params: {
  category?: string;
  tag?: string;
  search?: string;
  limit?: number;
  skip?: number;
}) {
  const query: any = { status: BlogPostStatus.PUBLISHED };

  if (params.category) {
    query.categories = params.category;
  }
  if (params.tag) {
    query.tags = params.tag;
  }
  if (params.search) {
    query.$or = [
      { title: { $regex: params.search, $options: 'i' } },
      { excerpt: { $regex: params.search, $options: 'i' } }
    ];
  }

  const [posts, total] = await Promise.all([
    BlogPost.find(query)
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(params.skip || 0)
      .limit(params.limit || 12),
    BlogPost.countDocuments(query)
  ]);

  return { posts, total };
}

export async function getPublishedBlogBySlug(slug: string): Promise<IBlogPost> {
  const post = await BlogPost.findOne({
    slug: slug.toLowerCase().trim(),
    status: BlogPostStatus.PUBLISHED
  });

  if (!post) {
    throw new AppError('Blog article not found', 404);
  }

  return post;
}

export async function getAllBlogsAdmin(params: {
  status?: string;
  search?: string;
  limit?: number;
  skip?: number;
}) {
  const query: any = {};
  if (params.status) query.status = params.status;
  if (params.search) {
    query.title = { $regex: params.search, $options: 'i' };
  }

  const [posts, total] = await Promise.all([
    BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(params.skip || 0)
      .limit(params.limit || 20),
    BlogPost.countDocuments(query)
  ]);

  return { posts, total };
}

export async function createBlogPost(data: Partial<IBlogPost>, authorUserId: string): Promise<IBlogPost> {
  let slug = data.slug
    ? data.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
    : data.title?.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-') || 'post';

  const existing = await BlogPost.findOne({ slug });
  if (existing) {
    slug = `${slug}-${Date.now().toString().slice(-4)}`;
  }

  const publishedAt = data.status === BlogPostStatus.PUBLISHED ? new Date() : undefined;

  const post = await BlogPost.create({
    ...data,
    slug,
    publishedAt,
    createdBy: authorUserId
  });

  return post;
}

export async function updateBlogPost(id: string, data: Partial<IBlogPost>): Promise<IBlogPost> {
  const post = await BlogPost.findById(id);
  if (!post) {
    throw new AppError('Blog post not found', 404);
  }

  if (data.status === BlogPostStatus.PUBLISHED && post.status !== BlogPostStatus.PUBLISHED) {
    data.publishedAt = new Date();
  }

  const updated = await BlogPost.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  return updated!;
}

export async function deleteBlogPost(id: string): Promise<void> {
  const result = await BlogPost.findByIdAndDelete(id);
  if (!result) {
    throw new AppError('Blog post not found', 404);
  }
}
