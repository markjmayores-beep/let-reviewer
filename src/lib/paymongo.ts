// ============================================================
// PAYMONGO INTEGRATION (GCash, Maya, Credit Card)
// Philippines payment gateway
// ============================================================

const PAYMONGO_BASE = 'https://api.paymongo.com/v1'
const PAYMONGO_SECRET = process.env.PAYMONGO_SECRET_KEY!

export const PLANS = {
  weekly: {
    name: 'Weekly Premium',
    amount: 9900, // ₱99.00 in centavos
    description: 'Full access for 7 days — No limits, all exam modes',
    interval: 7,
  },
  monthly: {
    name: 'Monthly Premium',
    amount: 29900, // ₱299.00 in centavos
    description: 'Full access for 30 days — Best value!',
    interval: 30,
  },
}

export type SubscriptionPlan = keyof typeof PLANS

interface CreatePaymentLinkParams {
  plan: SubscriptionPlan
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
