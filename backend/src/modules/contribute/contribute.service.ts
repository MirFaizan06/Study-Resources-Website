import { Resource } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { ContributeInput } from './contribute.schema';

export async function submitContribution(
  data: ContributeInput
): Promise<Resource> {
  // Validate that the subject exists
  const subject = await prisma.subject.findUnique({ where: { id: data.subjectId } });
  if (!subject) {
    throw new AppError(`Subject with id '${data.subjectId}' not found.`, 404, 'NOT_FOUND');
  }

  // Find or skip linking to an existing user — contributions are anonymous or linked by email
  const existingUser = await prisma.user.findUnique({
    where: { email: data.uploaderEmail },
  });

  const resource = await prisma.resource.create({
    data: {
      title: data.title,
      type: data.type,
      fileUrl: data.fileUrl,
      subjectId: data.subjectId,
      uploaderId: existingUser?.id ?? null,
      year: data.year ?? null,
      isAiGenerated: false,
      isApproved: false, // pending admin review
    },
    include: {
      subject: {
        include: {
          program: {
            include: { institution: true },
          },
        },
      },
    },
  });

  return resource;
}
