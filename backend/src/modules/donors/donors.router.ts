import { Router } from 'express'
import { listDonors, createDonation } from './donors.service'
import { requireAuth } from '../../middleware/auth'
import { apiLimiter } from '../../middleware/rateLimit'

const router = Router()

// Public: list public donors
router.get('/', apiLimiter, async (_req, res, next) => {
  try {
    const donors = await listDonors()
    res.json(donors)
  } catch (err) {
    next(err)
  }
})

// Public: log a donation after Razorpay redirect (voluntary — no auth needed)
router.post('/thank', apiLimiter, async (req, res, next) => {
  try {
    const { donorName, message, amount, isAnonymous, paymentId } = req.body as {
      donorName?: string
      message?: string
      amount?: number
      isAnonymous?: boolean
      paymentId?: string
    }
    const donor = await createDonation({
      donorName: donorName ?? 'Anonymous',
      message: message ?? null,
      amount: amount ?? null,
      isAnonymous: isAnonymous ?? false,
      paymentId: paymentId ?? null,
    })
    res.status(201).json(donor)
  } catch (err) {
    next(err)
  }
})

export default router
