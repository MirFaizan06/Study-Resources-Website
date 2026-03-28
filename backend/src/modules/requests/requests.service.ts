import { Request as PrismaRequest, RequestStatus } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { CreateRequestInput } from './requests.schema';

export async function createRequest(
  data: CreateRequestInput
): Promise<PrismaRequest> {
  const request = await prisma.request.create({
    data: {
      studentName: data.studentName,
      requestedMaterial: data.requestedMaterial,
      contactEmail: data.contactEmail ?? null,
      status: 'PENDING',
    },
  });
  return request;
}

export async function getRequests(
  status?: RequestStatus
): Promise<PrismaRequest[]> {
  const requests = await prisma.request.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  });
  return requests;
}

export async function updateRequestStatus(
  id: string,
  status: RequestStatus
): Promise<PrismaRequest> {
  const existing = await prisma.request.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(`Request with id '${id}' not found.`, 404, 'NOT_FOUND');
  }

  const updated = await prisma.request.update({
    where: { id },
    data: { status },
  });
  return updated;
}
