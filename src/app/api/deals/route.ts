import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: deals, error } = await supabase
      .from('deals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
    }

    return NextResponse.json(deals);
  } catch (error) {
    console.error('Deals GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      propertyAddress,
      dealType,
      loanAmount,
      borrowerName,
      borrowerEmail,
      borrowerPhone,
      notes,
    } = body;

    if (!propertyAddress || !dealType || !loanAmount || !borrowerName || !borrowerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: deal, error } = await supabase
      .from('deals')
      .insert({
        user_id: user.id,
        property_address: propertyAddress,
        deal_type: dealType,
        loan_amount: loanAmount,
        borrower_name: borrowerName,
        borrower_email: borrowerEmail,
        borrower_phone: borrowerPhone || null,
        notes: notes || null,
        status: 'lead',
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
    }

    return NextResponse.json(deal);
  } catch (error) {
    console.error('Deals POST error:', error);
    return NextResponse.json({ error: 'Failed to create deal' }, { status: 500 });
  }
}
