import { Request, Response, NextFunction } from 'express';
import {
  getResources,
  getResourceById,
  incrementDownloads,
  createResource,
} from './resources.service';
import {
  GetResourcesQuerySchema,
  CreateResourceSchema,
  ResourceIdParamSchema,
  RequestUploadUrlSchema,
} from './resources.schema';
import { generateUploadPresignedUrl } from '../../utils/s3Presign';
import { AppError } from '../../middleware/errorHandler';
import crypto from 'crypto';
import path from 'path';

export async function getResourcesHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = GetResourcesQuerySchema.parse(req.query);
    const result = await getResources(query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function getResourceByIdHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = ResourceIdParamSchema.parse(req.params);
    const resource = await getResourceById(id);
    res.status(200).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
}

export async function getDownloadUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = ResourceIdParamSchema.parse(req.params);
    const resource = await getResourceById(id);
    await incrementDownloads(id);
    res.status(200).json({
      success: true,
      data: {
        fileUrl: resource.fileUrl,
        title: resource.title,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function requestUploadUrl(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    }
    const { fileName, contentType } = RequestUploadUrlSchema.parse(req.body);
    const ext = path.extname(fileName).toLowerCase() || '.pdf';
    const uniqueKey = `resources/${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const { uploadUrl, fileUrl } = await generateUploadPresignedUrl(uniqueKey, contentType);
    res.status(200).json({
      success: true,
      data: { uploadUrl, fileUrl, key: uniqueKey },
    });
  } catch (err) {
    next(err);
  }
}

export async function createResourceHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'AUTH_REQUIRED');
    }
    const body = req.body as { fileUrl?: unknown } & Record<string, unknown>;
    if (!body.fileUrl || typeof body.fileUrl !== 'string') {
      throw new AppError('fileUrl is required in the request body.', 400, 'VALIDATION_ERROR');
    }
    const data = CreateResourceSchema.parse(body);
    const resource = await createResource(data, req.user.id, body.fileUrl);
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    next(err);
  }
}
