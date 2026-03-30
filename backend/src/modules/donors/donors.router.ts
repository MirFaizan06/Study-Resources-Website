import { Router } from 'express'
import crypto from 'crypto'
import { listDonors, createDonation } from './donors.service'
import { generalLimiter } from '../../middleware/rateLimit'
import { cache, TTL } from '../../utils/cache'
import { env } from '../../config/env'

const router = Router()
const DONORS_CACHE_KEY = 'donors:public'

// ─── Razorpay payment-link signature verification ────────────────────────────
function verifyRazorpaySignature(params: {
  razorpay_payment_id: string
  razorpay_payment_link_id: string
  razorpay_payment_link_reference_id: string
  razorpay_payment_link_status: string
  razorpay_signature: string
}): boolean {
  if (!env.RAZORPAY_KEY_SECRET) return true // skip if secret not configured (dev mode)
  const body =
    `${params.razorpay_payment_link_id}|` +
    `${params.razorpay_payment_link_reference_id}|` +
    `${params.razorpay_payment_link_status}|` +
    `${params.razorpay_payment_id}`
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex')
  // Constant-time comparison prevents timing-based side-channel attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(params.razorpay_signature, 'hex'))
  } catch {
    return false
  }
}

// GET /api/donors — public: list donors (cached 2 min)
router.get('/', generalLimiter, async (_req, res, next) => {
  try {
    const cached = cache.get<unknown[]>(DONORS_CACHE_KEY)
    if (cached) { res.json(cached); return }

    const donors = await listDonors()
    cache.set(DONORS_CACHE_KEY, donors, TTL.DONORS)
    res.json(donors)
  } catch (err) {
    next(err)
  }
})

// POST /api/donors/thank — log a donation after Razorpay redirect
router.post('/thank', generalLimiter, async (req, res, next) => {
  try {
    const {
      donorName,
      message,
      amount,
      isAnonymous,
      paymentId,
      razorpay_payment_link_id,
      razorpay_payment_link_reference_id,
      razorpay_payment_link_status,
      razorpay_signature,
    } = req.body as {
      donorName?: string
      message?: string
      amount?: number
      isAnonymous?: boolean
      paymentId?: string
      razorpay_payment_link_id?: string
      razorpay_payment_link_reference_id?: string
      razorpay_payment_link_status?: string
      razorpay_signature?: string
    }

    // Verify Razorpay signature when params are provided
    if (paymentId && razorpay_payment_link_id && razorpay_payment_link_reference_id &&
        razorpay_payment_link_status && razorpay_signature) {
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
      const { prisma } = await import('../../db/prisma')
      const existing = await prisma.donation.findFirst({
        where: { paymentId },
        select: { id: true },
      })
      if (existing) {
        res.status(409).json({ message: 'This payment has already been recorded.' })
        return
      }
    }

    const donor = await createDonation({
      donorName: donorName ? donorName.trim().slice(0, 100) : 'Anonymous',
      message: message ? message.trim().slice(0, 300) : null,
      amount: typeof amount === 'number' && amount > 0 ? amount : null,
      isAnonymous: isAnonymous ?? false,
      paymentId: paymentId ?? null,
    })

    cache.del(DONORS_CACHE_KEY)
    res.status(201).json(donor)
  } catch (err) {
    next(err)
  }
})

export default router
