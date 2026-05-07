import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// PayMongo webhook — called when payment is completed
// Set webhook URL in PayMongo dashboard: https://your-domain.com/api/subscription/webhook

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('paymongo-signature')

    // Verify webhook signature (recommended for production)
    // const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET
    // TODO: implement HMAC verification

    const event = JSON.parse(body)
    const eventType = event.data?.attributes?.type
    const paymentData = event.data?.attributes?.data

    if (eventType !== 'payment.paid') {
      return NextResponse.json({ received: true })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // service role for admin writes
    )

    const linkId = paymentData?.attributes?.source?.link_id ?? paymentData?.attributes?.payment_intent_id
    const paymentId = paymentData?.id

    if (!linkId) {
      return NextResponse.json({ received: true })
    }

    // Find the pending subscription by link ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('paymongo_link_id', linkId)
      .eq('status', 'pending')
      .single()

    if (!subscription) {
      console.warn('[webhook] No pending subscription found for linkId:', linkId)
      return NextResponse.json({ received: true })
    }

    const intervalDays = subscription.plan === 'yearly' ? 365 : 30
    const startsAt = new Date()
    const endsAt = new Date(startsAt.getTime() + intervalDays * 24 * 60 * 60 * 1000)

    // Activate subscription
    await supabase.from('subscriptions').update({
      status: 'active',
      paymongo_payment_id: paymentId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
    }).eq('id', subscription.id)

    // Grant premium to user
    await supabase.from('profiles').update({
      is_premium: true,
    }).eq('id', subscription.user_id)

    console.log('[webhook] Premium activated for user:', subscription.user_id)
    return NextResponse.json({ received: true, activated: true })
  } catch (error) {
    console.error('[webhook] Error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
