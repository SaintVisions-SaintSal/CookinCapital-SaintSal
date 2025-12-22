export * from './database';

export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface APIError {
  error: string;
  message: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ChatRequest {
  message: string;
  conversationId?: string;
  model?: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface PropertyScoreRequest {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  purchasePrice: number;
  arv?: number;
  repairCost?: number;
  rentEstimate?: number;
}

export interface PropertyScoreResponse {
  id: string;
  overallScore: number;
  cashFlowScore: number;
  appreciationScore: number;
  riskScore: number;
  analysis: {
    summary: string;
    strengths: string[];
    concerns: string[];
    recommendation: string;
  };
}

export interface DealFormData {
  propertyAddress: string;
  dealType: 'purchase' | 'refinance' | 'construction';
  loanAmount: number;
  borrowerName: string;
  borrowerEmail: string;
  borrowerPhone?: string;
  notes?: string;
}

export type DealStatus =
  | 'lead'
  | 'application'
  | 'processing'
  | 'underwriting'
  | 'approved'
  | 'funded'
  | 'closed'
  | 'lost';

export interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarnings: number;
  pendingEarnings: number;
  monthlyEarnings: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
}
