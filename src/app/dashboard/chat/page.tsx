'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AI_MODELS, type AIModel } from '@/lib/ai';
import { cn, formatRelativeTime } from '@/lib/utils';
import { LogoIcon } from '@/components/ui/logo';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import {
  Send,
  Plus,
  MessageSquare,
  Loader2,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  Mic,
  Paperclip,
  Search,
  ChevronRight,
  Zap,
  Building2,
  TrendingUp,
  FileText,
  Code,
  Brain,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  model: string;
  updated_at: string;
  messages?: Message[];
}

const quickPrompts = [
  { icon: Building2, label: 'Property Analysis', prompt: 'Analyze this investment property for me:' },
  { icon: TrendingUp, label: 'Market Research', prompt: 'Give me a market analysis for:' },
  { icon: FileText, label: 'Business Strategy', prompt: 'Help me develop a strategy for:' },
  { icon: Code, label: 'Code Assistant', prompt: 'Help me write code for:' },
  { icon: Brain, label: 'Creative Ideas', prompt: 'Brainstorm creative ideas for:' },
  { icon: Zap, label: 'Quick Task', prompt: 'Help me quickly with:' },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [model, setModel] = useState<AIModel>('gpt-4');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chat');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat?conversationId=${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentConversation(data);
        setMessages(data.messages || []);
        setModel(data.model as AIModel);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
    }
  };

  const startNewConversation = () => {
    setCurrentConversation(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInput(prompt + ' ');
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          conversationId: currentConversation?.id,
          model,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        created_at: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (!currentConversation) {
        setCurrentConversation({
          id: data.conversationId,
          title: input.slice(0, 100),
          model,
          updated_at: new Date().toISOString(),
        });
        fetchConversations();
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 -mx-4 -my-4 md:-mx-8 md:-my-8">
      {/* Sidebar - Conversations */}
      <div
        className={cn(
          'border-r bg-muted/30 flex flex-col transition-all duration-300',
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        )}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b bg-background/50 backdrop-blur-sm">
          <Button
            variant="gold"
            onClick={startNewConversation}
            className="w-full justify-start gap-2 shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4" />
            New Conversation
            <Sparkles className="h-3 w-3 ml-auto" />
          </Button>
        </div>

        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="pl-9 bg-background/50"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {loadingConversations ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <div className="relative">
                <div className="h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
              <p className="text-xs text-muted-foreground">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center px-4">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                Start a new chat to begin
              </p>
            </div>
          ) : (
            filteredConversations.map((conv, index) => (
              <button
                key={conv.id}
                onClick={() => loadConversation(conv.id)}
                className={cn(
                  'w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-left transition-all duration-200 group',
                  currentConversation?.id === conv.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-muted/80 hover:shadow-sm'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div
                  className={cn(
                    'h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    currentConversation?.id === conv.id
                      ? 'bg-primary-foreground/20'
                      : 'bg-primary/10'
                  )}
                >
                  <MessageSquare
                    className={cn(
                      'h-4 w-4',
                      currentConversation?.id === conv.id
                        ? 'text-primary-foreground'
                        : 'text-primary'
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{conv.title}</p>
                  <p
                    className={cn(
                      'text-xs truncate',
                      currentConversation?.id === conv.id
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    )}
                  >
                    {formatRelativeTime(conv.updated_at)}
                  </p>
                </div>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                    currentConversation?.id === conv.id && 'opacity-100'
                  )}
                />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/20 min-w-0">
        {/* Chat Header */}
        <div className="flex-shrink-0 flex items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 py-3 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="shrink-0"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="font-semibold truncate">
                {currentConversation?.title || 'New Conversation'}
              </h1>
              <p className="text-xs text-muted-foreground">
                Powered by advanced AI models
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Select value={model} onValueChange={(v) => setModel(v as AIModel)}>
              <SelectTrigger className="w-36 bg-background/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    <div className="flex items-center gap-2">
                      <Zap className="h-3 w-3 text-primary" />
                      {m.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 py-12">
              {/* Hero Section */}
              <div className="relative mb-8">
                <div className="absolute inset-0 gold-gradient rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative h-24 w-24 rounded-full gold-gradient flex items-center justify-center shadow-2xl">
                  <LogoIcon size={48} className="drop-shadow-lg" />
                </div>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Welcome to <span className="text-gold-gradient">SaintSal</span> AI
              </h2>
              <p className="text-muted-foreground max-w-md mb-2">
                Your intelligent assistant for business, real estate, and beyond.
              </p>
              <p className="text-sm text-muted-foreground/70 italic mb-8">
                Cookin' Knowledge.
              </p>

              {/* Quick Prompts */}
              <div className="w-full max-w-2xl">
                <p className="text-sm font-medium text-muted-foreground mb-4">
                  Quick Start
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {quickPrompts.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => handleQuickPrompt(item.prompt)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 hover:bg-background hover:shadow-lg transition-all duration-200 text-left group"
                    >
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                        <item.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-4 animate-in',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.role === 'assistant' && (
                    <div className="shrink-0">
                      <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center shadow-lg">
                        <Bot className="h-5 w-5 text-black" />
                      </div>
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[85%] rounded-2xl px-4 py-3 shadow-sm',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'bg-card border rounded-bl-md'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            code({ className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              const isInline = !match;
                              return isInline ? (
                                <code
                                  className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm"
                                  {...props}
                                >
                                  {children}
                                </code>
                              ) : (
                                <div className="relative group my-4">
                                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-8 w-8"
                                      onClick={() =>
                                        copyToClipboard(String(children), message.id + '-code')
                                      }
                                    >
                                      {copiedId === message.id + '-code' ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <Copy className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                  <SyntaxHighlighter
                                    style={oneDark as Record<string, React.CSSProperties>}
                                    language={match?.[1] || 'text'}
                                    PreTag="div"
                                    className="rounded-lg !my-0"
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              );
                            },
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}

                    {/* Message Actions */}
                    {message.role === 'assistant' && (
                      <div className="flex items-center gap-1 mt-3 pt-2 border-t border-border/50">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => copyToClipboard(message.content, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3.5 w-3.5 text-green-500" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <span className="text-[10px] text-muted-foreground ml-auto">
                          {formatRelativeTime(message.created_at)}
                        </span>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex gap-4 animate-in">
                  <div className="shrink-0">
                    <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center shadow-lg">
                      <Bot className="h-5 w-5 text-black" />
                    </div>
                  </div>
                  <div className="bg-card border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 border-t bg-background/80 backdrop-blur-md p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="relative flex items-center gap-2">
              {/* Attachment Button */}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-foreground"
                disabled={loading}
              >
                <Paperclip className="h-5 w-5" />
              </Button>

              {/* Input Field */}
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask SaintSal anything..."
                  disabled={loading}
                  className="pr-12 py-6 text-base bg-background border-2 focus:border-primary/50 rounded-xl shadow-sm"
                />
                {/* Voice Button */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>

              {/* Send Button */}
              <Button
                type="submit"
                variant="gold"
                size="icon"
                disabled={loading || !input.trim()}
                className="shrink-0 h-12 w-12 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-3">
              SaintSal AI can make mistakes. Consider checking important information.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
