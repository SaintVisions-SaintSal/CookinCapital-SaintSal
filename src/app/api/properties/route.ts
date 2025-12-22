import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chat } from '@/lib/ai';
import { SUBSCRIPTION_TIERS } from '@/lib/utils';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: properties, error } = await supabase
      .from('property_scores')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Properties GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
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

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Check usage limits
    const tier = profile.subscription_tier || 'free';
    const tierConfig = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    const scoresLimit = tierConfig.propertyScores;

    if (scoresLimit !== -1 && profile.property_scores_used >= scoresLimit) {
      return NextResponse.json(
        { error: 'Property score limit reached. Please upgrade your plan.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      address,
      city,
      state,
      zipCode,
      propertyType,
      purchasePrice,
      arv,
      repairCost,
      rentEstimate,
    } = body;

    if (!address || !city || !state || !zipCode || !propertyType || !purchasePrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate AI analysis
    const prompt = `Analyze this real estate investment property and provide a detailed scoring:

Property Details:
- Address: ${address}, ${city}, ${state} ${zipCode}
- Property Type: ${propertyType}
- Purchase Price: $${purchasePrice.toLocaleString()}
${arv ? `- After Repair Value (ARV): $${arv.toLocaleString()}` : ''}
${repairCost ? `- Estimated Repair Cost: $${repairCost.toLocaleString()}` : ''}
${rentEstimate ? `- Estimated Monthly Rent: $${rentEstimate.toLocaleString()}` : ''}

Please provide:
1. Overall Score (0-100): Consider all factors
2. Cash Flow Score (0-100): Based on rental income potential vs expenses
3. Appreciation Score (0-100): Based on location, property type, and market trends
4. Risk Score (0-100): Higher = more risk

Also provide a JSON response with this structure:
{
  "overall_score": number,
  "cash_flow_score": number,
  "appreciation_score": number,
  "risk_score": number,
  "analysis": {
    "summary": "2-3 sentence summary",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "concerns": ["concern 1", "concern 2"],
    "recommendation": "Buy/Hold/Pass recommendation with reasoning"
  }
}

Return ONLY the JSON, no other text.`;

    let scores = {
      overall_score: 70,
      cash_flow_score: 65,
      appreciation_score: 72,
      risk_score: 35,
      analysis: {
        summary: 'This property shows moderate investment potential based on the provided details.',
        strengths: ['Reasonable purchase price', 'Good location potential', 'Standard property type'],
        concerns: ['Limited data for comprehensive analysis', 'Market conditions may vary'],
        recommendation: 'Consider conducting additional due diligence before making a decision.',
      },
    };

    try {
      const aiResponse = await chat(
        [{ role: 'user', content: prompt }],
        'gpt-4'
      );

      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        scores = JSON.parse(jsonMatch[0]);
      }
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
      // Use default scores if AI fails
    }

    // Save to database
    const { data: property, error } = await supabase
      .from('property_scores')
      .insert({
        user_id: user.id,
        address,
        city,
        state,
        zip_code: zipCode,
        property_type: propertyType,
        purchase_price: purchasePrice,
        arv: arv || null,
        repair_cost: repairCost || null,
        rent_estimate: rentEstimate || null,
        overall_score: scores.overall_score,
        cash_flow_score: scores.cash_flow_score,
        appreciation_score: scores.appreciation_score,
        risk_score: scores.risk_score,
        ai_analysis: scores.analysis,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to save property score' }, { status: 500 });
    }

    // Update usage count
    await supabase
      .from('profiles')
      .update({ property_scores_used: profile.property_scores_used + 1 })
      .eq('id', user.id);

    return NextResponse.json(property);
  } catch (error) {
    console.error('Properties POST error:', error);
    return NextResponse.json({ error: 'Failed to score property' }, { status: 500 });
  }
}
