import { Router } from 'express'
import crypto from 'crypto'
import { prisma } from '../../db/prisma'
import { generalLimiter, paymentLimiter } from '../../middleware/rateLimit'
import { cache, TTL } from '../../utils/cache'
import { env } from '../../config/env'

const router = Router()

const AI_FUNDRAISER_GOAL = 10000 // INR
const FUNDRAISER_CACHE_KEY = 'fundraiser:totals'

// ─── Razorpay payment-link signature verification ────────────────────────────
// When a Razorpay payment link is paid, the redirect URL receives:
//   razorpay_payment_id, razorpay_payment_link_id,
//   razorpay_payment_link_reference_id, razorpay_payment_link_status,
//   razorpay_signature
//
// Signature = HMAC-SHA256(
//   payment_link_id|payment_link_reference_id|payment_link_status|payment_id,
//   key_secret
// )
function verifyRazorpaySignature(params: {
  razorpay_payment_id: string
  razorpay_payment_link_id: string
  razorpay_payment_link_reference_id: string
  razorpay_payment_link_status: string
  razorpay_signature: string
}): boolean {
  if (!env.RAZORPAY_KEY_SECRET) return true // skip if secret not configured
  const body =
    `${params.razorpay_payment_link_id}|` +
    `${params.razorpay_payment_link_reference_id}|` +
    `${params.razorpay_payment_link_status}|` +
    `${params.razorpay_payment_id}`
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')
  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(params.razorpay_signature))
}

// GET /api/fundraiser — public: total raised + goal (cached 1 min)
router.get('/', generalLimiter, async (_req, res, next) => {
  try {
    const cached = cache.get<object>(FUNDRAISER_CACHE_KEY)
    if (cached) {
      res.json(cached)
      return
    }

    const result = await prisma.aiFundraiserContribution.aggregate({
      _sum: { amount: true },
      _count: { id: true },
    })
    const totalRaised = result._sum.amount ?? 0
    const contributorCount = result._count.id
    const payload = {
      totalRaised,
      goal: AI_FUNDRAISER_GOAL,
      contributorCount,
      percentFunded: Math.min(100, Math.round((totalRaised / AI_FUNDRAISER_GOAL) * 100)),
    }

    cache.set(FUNDRAISER_CACHE_KEY, payload, TTL.FUNDRAISER)
    res.json(payload)
  } catch (err) {
    next(err)
  }
})

// POST /api/fundraiser/contribute — log a verified Razorpay payment
router.post('/contribute', paymentLimiter, async (req, res, next) => {
  try {
    const {
      amount,
      paymentId,
      donorName,
      // Razorpay payment-link signature params (optional but validated when present)
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
    } = req.body as {
      amount?: number
      paymentId?: string
      donorName?: string
      razorpay_payment_link_id?: string
      razorpay_payment_link_reference_id?: string
      razorpay_payment_link_status?: string
      razorpay_signature?: string
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ message: 'amount must be a positive number' })
      return
    }

    // Verify Razorpay signature when all params are provided
    if (
      paymentId &&
      razorpay_payment_link_id &&
      razorpay_payment_link_reference_id &&
      razorpay_payment_link_status &&
      razorpay_signature
    ) {
      const valid = verifyRazorpaySignature({
        razorpay_payment_id: paymentId,
        razorpay_payment_link_id,
        razorpay_payment_link_reference_id,
        razorpay_payment_link_status,
        razorpay_signature,
      })
      if (!valid) {
        res.status(400).json({ message: 'Payment signature verification failed.' })
        return
      }
    }

    // Prevent duplicate paymentId submissions
    if (paymentId) {
      const existing = await prisma.aiFundraiserContribution.findFirst({
        where: { paymentId },
        select: { id: true },
      })
      if (existing) {
        res.status(409).json({ message: 'This payment has already been recorded.' })
        return
      }
    }

    const contribution = await prisma.aiFundraiserContribution.create({
      data: {
        amount,
        paymentId: paymentId ?? null,
        donorName: donorName ? donorName.trim().slice(0, 100) : null,
      },
    })

    // Invalidate fundraiser cache so next read reflects the new total
    cache.del(FUNDRAISER_CACHE_KEY)

    res.status(201).json(contribution)
  } catch (err) {
    next(err)
  }
})

export default router
