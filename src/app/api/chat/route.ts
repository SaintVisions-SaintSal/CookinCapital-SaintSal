import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chat, type AIModel, type ChatMessage } from '@/lib/ai';
import { SUBSCRIPTION_TIERS } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
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
    const queriesLimit = tierConfig.queries;

    if (queriesLimit !== -1 && profile.queries_used >= queriesLimit) {
      return NextResponse.json(
        { error: 'Query limit reached. Please upgrade your plan.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { message, conversationId, model = 'gpt-4' } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let convId = conversationId;

    // Create or get conversation
    if (!convId) {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title: message.slice(0, 100),
          model,
        })
        .select()
        .single();

      if (convError) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }

      convId = newConv.id;
    }

    // Get conversation history
    const { data: history } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
      .limit(20);

    // Build messages array
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are SaintSal, an AI assistant created by Saint Vision Technologies LLC. You help users with business intelligence, real estate analysis, deal management, and general questions. Be helpful, concise, and professional. Current date: ${new Date().toLocaleDateString()}.`,
      },
      ...(history || []).map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];

    // Save user message
    await supabase.from('messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message,
      model,
    });

    // Get AI response
    const response = await chat(messages, model as AIModel);

    // Save assistant message
    await supabase.from('messages').insert({
      conversation_id: convId,
      role: 'assistant',
      content: response.content,
      model,
      tokens_used: response.usage?.totalTokens || null,
    });

    // Update usage count
    await supabase
      .from('profiles')
      .update({ queries_used: profile.queries_used + 1 })
      .eq('id', user.id);

    return NextResponse.json({
      message: response.content,
      conversationId: convId,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      // Get specific conversation with messages
      const { data: conversation, error } = await supabase
        .from('conversations')
        .select('*, messages(*)')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (error || !conversation) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }

      return NextResponse.json(conversation);
    }

    // Get all conversations
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
