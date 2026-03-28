import { Router } from 'express';
import {
  getInstitutions,
  getInstitutionBySlugHandler,
  getProgramDetails,
  getSubjectDetails,
} from './institutions.controller';

const router = Router();

// GET /api/institutions
router.get('/', getInstitutions);

// Static sub-paths before dynamic :slug
// GET /api/institutions/programs/:programId
router.get('/programs/:programId', getProgramDetails);

// GET /api/institutions/subjects/:subjectId
router.get('/subjects/:subjectId', getSubjectDetails);

// GET /api/institutions/:slug  (dynamic — must come after statics)
router.get('/:slug', getInstitutionBySlugHandler);

export default router;
