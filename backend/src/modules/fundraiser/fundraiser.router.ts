import { Router } from 'express'
import { prisma } from '../../db/prisma'
import { generalLimiter } from '../../middleware/rateLimit'

const router = Router()

const AI_FUNDRAISER_GOAL = 10000 // INR

// GET /api/fundraiser — public: total raised + goal
router.get('/', generalLimiter, async (_req, res, next) => {
  try {
    const result = await prisma.aiFundraiserContribution.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    })
    const totalRaised = result._sum.amount ?? 0
    const contributorCount = result._count.id
    res.json({
      totalRaised,
      goal: AI_FUNDRAISER_GOAL,
      contributorCount,
      percentFunded: Math.min(100, Math.round((totalRaised / AI_FUNDRAISER_GOAL) * 100)),
    })
  } catch (err) {
    next(err)
  }
})

// POST /api/fundraiser/contribute — log a payment (called after Razorpay success)
router.post('/contribute', generalLimiter, async (req, res, next) => {
  try {
    const { amount, paymentId, donorName } = req.body as {
      amount?: number
      paymentId?: string
      donorName?: string
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ message: 'amount must be a positive number' })
      return
    }
    const contribution = await prisma.aiFundraiserContribution.create({
      data: {
        amount,
        paymentId: paymentId ?? null,
        donorName: donorName ?? null,
      },
    })
    res.status(201).json(contribution)
  } catch (err) {
    next(err)
  }
})

export default router
