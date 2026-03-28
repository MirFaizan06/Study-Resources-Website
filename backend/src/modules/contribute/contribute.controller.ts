import { Request, Response, NextFunction } from 'express';
import { submitContribution } from './contribute.service';
import { ContributeSchema } from './contribute.schema';

export async function submitContributionHandler(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = ContributeSchema.parse(req.body);
    const resource = await submitContribution(data);
    res.status(201).json({
      success: true,
      message:
        'Your contribution has been submitted and is pending admin review. Thank you for contributing!',
      data: { id: resource.id, title: resource.title, type: resource.type },
    });
  } catch (err) {
    next(err);
  }
}
