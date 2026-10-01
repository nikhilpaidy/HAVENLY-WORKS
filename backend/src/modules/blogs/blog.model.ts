import mongoose, { Document, Schema, Types } from 'mongoose';
import { BlogPostStatus } from '../../types/index.js';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl?: string;
  author: {
    name: string;
    role: string;
    avatarUrl?: string;
  };
  categories: string[];
  tags: string[];
  status: BlogPostStatus;
  seo: {
    title?: string;
    description?: string;
    canonicalUrl?: string;
    keywords?: string[];
  };
  readTimeMinutes: number;
  publishedAt?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    excerpt: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true
    },
    coverImageUrl: String,
    author: {
      name: { type: String, required: true },
      role: { type: String, default: 'Workspace Strategist' },
      avatarUrl: String
    },
    categories: {
      type: [String],
      default: ['Workplace Trends']
    },
    tags: {
      type: [String],
      default: []
    },
    status: {
      type: String,
      enum: Object.values(BlogPostStatus),
      default: BlogPostStatus.DRAFT,
      index: true
    },
    seo: {
      title: String,
      description: String,
      canonicalUrl: String,
      keywords: [String]
    },
    readTimeMinutes: {
      type: Number,
      default: 5
    },
    publishedAt: {
      type: Date,
      index: true
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

BlogPostSchema.index({ status: 1, publishedAt: -1 });

export const BlogPost = mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
