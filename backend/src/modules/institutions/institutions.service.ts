import { Institution, Program, Subject } from '@prisma/client';
import { prisma } from '../../db/prisma';
import { AppError } from '../../middleware/errorHandler';
import { cache, TTL } from '../../utils/cache';

export type ProgramWithSubjects = Program & {
  subjects: Subject[];
  institution: Institution;
};

export type SubjectWithProgram = Subject & {
  program: Program & {
    institution: Institution;
  };
};

export type InstitutionWithPrograms = Institution & {
  programs: Program[];
};

export async function getInstitutionBySlug(
  slug: string
): Promise<InstitutionWithPrograms> {
  const cacheKey = `institution:${slug}`;
  const cached = cache.get<InstitutionWithPrograms>(cacheKey);
  if (cached) return cached;

  const institution = await prisma.institution.findUnique({
    where: { slug },
    include: { programs: { orderBy: { name: 'asc' } } },
  });

  if (!institution) {
    throw new AppError(`Institution with slug '${slug}' not found.`, 404, 'NOT_FOUND');
  }

  cache.set(cacheKey, institution, TTL.INSTITUTION_SLUG);
  return institution;
}

export async function getInstitutionsWithPrograms(): Promise<InstitutionWithPrograms[]> {
  const cacheKey = 'institutions:all';
  const cached = cache.get<InstitutionWithPrograms[]>(cacheKey);
  if (cached) return cached;

  const institutions = await prisma.institution.findMany({
    include: { programs: { orderBy: { name: 'asc' } } },
    orderBy: { name: 'asc' },
  });

  cache.set(cacheKey, institutions, TTL.INSTITUTIONS);
  return institutions;
}

export async function getProgramWithSubjects(
  programId: string
): Promise<ProgramWithSubjects> {
  const cacheKey = `program:${programId}`;
  const cached = cache.get<ProgramWithSubjects>(cacheKey);
  if (cached) return cached;

  const program = await prisma.program.findUnique({
    where: { id: programId },
    include: {
      institution: true,
      subjects: { orderBy: [{ semester: 'asc' }, { name: 'asc' }] },
    },
  });

  if (!program) {
    throw new AppError(`Program with id '${programId}' not found.`, 404, 'NOT_FOUND');
  }

  cache.set(cacheKey, program, TTL.PROGRAM);
  return program;
}

export async function getSubjectById(
  subjectId: string
): Promise<SubjectWithProgram> {
  const cacheKey = `subject:${subjectId}`;
  const cached = cache.get<SubjectWithProgram>(cacheKey);
  if (cached) return cached;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: { program: { include: { institution: true } } },
  });

  if (!subject) {
    throw new AppError(`Subject with id '${subjectId}' not found.`, 404, 'NOT_FOUND');
  }

  cache.set(cacheKey, subject, TTL.PROGRAM);
  return subject;
}
