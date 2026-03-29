import { prisma } from '../../db/prisma'

export async function listDonors() {
  return prisma.donation.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      donorName: true,
      message: true,
      amount: true,
      isAnonymous: true,
      createdAt: true,
    },
  })
}

export async function createDonation(data: {
  donorName: string
  message: string | null
  amount: number | null
  isAnonymous: boolean
  paymentId: string | null
}) {
  return prisma.donation.create({
    data: {
      donorName: data.donorName,
      message: data.message,
      amount: data.amount,
      isAnonymous: data.isAnonymous,
      paymentId: data.paymentId,
      isPublic: true,
    },
    select: {
      id: true,
      donorName: true,
      message: true,
      amount: true,
      isAnonymous: true,
      createdAt: true,
    },
  })
}
