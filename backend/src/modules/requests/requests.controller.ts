import { Request, Response, NextFunction } from 'express';
import {
  createRequest,
  getRequests,
  updateRequestStatus,
} from './requests.service';
import {
  CreateRequestSchema,
  GetRequestsQuerySchema,
  RequestIdParamSchema,
  UpdateRequestStatusSchema,
} from './requests.schema';

export async function createRequestHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = CreateRequestSchema.parse(req.body);
    const request = await createRequest(data);
    res.status(201).json({
      success: true,
      message: 'Your request has been submitted successfully. We will try to fulfill it soon.',
      data: request,
    });
  } catch (err) {
    next(err);
  }
}

export async function getRequestsHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = GetRequestsQuerySchema.parse(req.query);
    const requests = await getRequests(status);
    res.status(200).json({ success: true, data: requests });
  } catch (err) {
    next(err);
  }
}

export async function updateRequestStatusHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = RequestIdParamSchema.parse(req.params);
    const { status } = UpdateRequestStatusSchema.parse(req.body);
    const updated = await updateRequestStatus(id, status);
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}
