import { Request, Response, NextFunction } from 'express';
import {
  getInstitutionsWithPrograms,
  getInstitutionBySlug,
  getProgramWithSubjects,
  getSubjectById,
  createInstitution,
  createProgram,
  createSubject,
} from './institutions.service';
import {
  GetProgramParamsSchema,
  GetSubjectParamsSchema,
  GetInstitutionBySlugParamsSchema,
  CreateInstitutionSchema,
  CreateProgramSchema,
  CreateSubjectSchema,
} from './institutions.schema';

export async function getInstitutions(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const institutions = await getInstitutionsWithPrograms();
    res.status(200).json({
      success: true,
      data: institutions,
    });
  } catch (err) {
    next(err);
  }
}

export async function getInstitutionBySlugHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { slug } = GetInstitutionBySlugParamsSchema.parse(req.params);
    const institution = await getInstitutionBySlug(slug);
    res.status(200).json({ success: true, data: institution });
  } catch (err) {
    next(err);
  }
}

export async function getProgramDetails(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { programId } = GetProgramParamsSchema.parse(req.params);
    const program = await getProgramWithSubjects(programId);
    res.status(200).json({
      success: true,
      data: program,
    });
  } catch (err) {
    next(err);
  }
}

export async function getSubjectDetails(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { subjectId } = GetSubjectParamsSchema.parse(req.params);
    const subject = await getSubjectById(subjectId);
    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (err) {
    next(err);
  }
}

export async function createInstitutionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payload = CreateInstitutionSchema.parse(req.body);
    const created = await createInstitution(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
}

export async function createProgramHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payload = CreateProgramSchema.parse(req.body);
    const created = await createProgram(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
}

export async function createSubjectHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payload = CreateSubjectSchema.parse(req.body);
    const created = await createSubject(payload);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    next(err);
  }
}
