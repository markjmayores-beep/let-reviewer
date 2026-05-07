// ============================================================
// PAYMONGO INTEGRATION (GCash, Maya, Credit Card)
// Philippines payment gateway
// ============================================================

const PAYMONGO_BASE = 'https://api.paymongo.com/v1'
const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY!

export const PLANS = {
  monthly: {
    name: 'Monthly Premium',
    amount: 19900, // ₱199.00 in centavos
    description: 'Full access for 1 month — No ads, unlimited review, all exam modes',
    interval: 30,
  },
  yearly: {
    name: 'Yearly Premium',
    amount: 99900, // ₱999.00 in centavos
    description: 'Full access for 1 year — Best value! Save ₱1,389 vs monthly',
    interval: 365,
  },
}

interface CreatePaymentLinkParams {
  plan: 'monthly' | 'yearly'
  userId: string
  userEmail: string
  userName: string
}

export async function createPaymentLink({
  plan,
  userId,
  userEmail,
  userName,
}: CreatePaymentLinkParams) {
  const planDetails = PLANS[plan]

  const response = await fetch(`${PAYMONGO_BASE}/links`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      data: {
        attributes: {
          amount: planDetails.amount,
          description: planDetails.description,
          remarks: `${plan}_${userId}`,
          payment_method_allowed: ['card', 'gcash', 'maya', 'billease'],
        },
      },
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.errors?.[0]?.detail ?? 'Failed to create payment link')
  }

  const data = await response.json()
  return {
    linkId: data.data.id,
    checkoutUrl: data.data.attributes.checkout_url,
    referenceNumber: data.data.attributes.reference_number,
  }
}

export async function getPaymentLink(linkId: string) {
  const response = await fetch(`${PAYMONGO_BASE}/links/${linkId}`, {
    headers: {
      Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET + ':').toString('base64')}`,
    },
  })

  if (!response.ok) throw new Error('Failed to fetch payment link')
  const data = await response.json()
  return data.data
}

export function isPaidStatus(status: string): boolean {
  return status === 'paid'
}
