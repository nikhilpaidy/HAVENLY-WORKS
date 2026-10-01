import { Request, Response, NextFunction } from 'express';
import {
  getPublishedBlogs,
  getPublishedBlogBySlug,
  getAllBlogsAdmin,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost
} from './blog.service.js';
import { apiSuccess } from '../../utils/response.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getPublicBlogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { category, tag, search, limit, skip } = req.query;
    const result = await getPublishedBlogs({
      category: category as string,
      tag: tag as string,
      search: search as string,
      limit: limit ? parseInt(limit as string, 10) : 12,
      skip: skip ? parseInt(skip as string, 10) : 0
    });

    return apiSuccess(res, result.posts, 'Public blogs fetched', 200, {
      total: result.total
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicBlogBySlugHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug as string;
    const post = await getPublishedBlogBySlug(slug);
    return apiSuccess(res, post);
  } catch (error) {
    next(error);
  }
}

export async function getAdminBlogsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status, search, limit, skip } = req.query;
    const result = await getAllBlogsAdmin({
      status: status as string,
      search: search as string,
      limit: limit ? parseInt(limit as string, 10) : 20,
      skip: skip ? parseInt(skip as string, 10) : 0
    });

    return apiSuccess(res, result.posts, 'Admin blogs fetched', 200, {
      total: result.total
    });
  } catch (error) {
    next(error);
  }
}

export async function createBlogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const post = await createBlogPost(req.body, req.user!.userId);
    return apiSuccess(res, post, 'Blog post created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function updateBlogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const updated = await updateBlogPost(id, req.body);
    return apiSuccess(res, updated, 'Blog post updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function deleteBlogHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await deleteBlogPost(id);
    return apiSuccess(res, null, 'Blog post deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function uploadBlogImageHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { image, filename: originalName } = req.body;
    if (!image) {
      throw new AppError('No image data provided', 400);
    }

    const fs = await import('fs');
    const path = await import('path');

    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    let base64Data = image;
    let ext = 'png';
    const matches = image.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (matches) {
      ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      base64Data = matches[2];
    }

    const cleanBase = (originalName || 'blog-image')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .slice(0, 30);
    const filename = `blog-${Date.now()}-${cleanBase}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const relativeUrl = `/uploads/${filename}`;
    return apiSuccess(
      res,
      {
        url: relativeUrl,
        filename
      },
      'Image uploaded successfully',
      201
    );
  } catch (error) {
    next(error);
  }
}
