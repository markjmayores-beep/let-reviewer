import { createClient } from '@/lib/supabase/server'
import { createPaymentLink, PLANS } from '@/lib/paymongo'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json() as { plan: 'monthly' | 'yearly' }

    if (!plan || !PLANS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const { linkId, checkoutUrl, referenceNumber } = await createPaymentLink({
      plan,
      userId: user.id,
      userEmail: user.email ?? profile?.email ?? '',
      userName: profile?.full_name ?? 'LET Reviewer User',
    })

    // Save pending subscription record
    await supabase.from('subscriptions').insert({
      user_id: user.id,
      plan,
      status: 'pending',
      paymongo_link_id: linkId,
      amount: PLANS[plan].amount,
    })

    return NextResponse.json({ checkoutUrl, referenceNumber })
  } catch (error: any) {
    console.error('[subscription/create]', error)
    return NextResponse.json({ error: error.message ?? 'Internal server error' }, { status: 500 })
  }
}
