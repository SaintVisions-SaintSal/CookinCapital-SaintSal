export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          subscription_tier: 'free' | 'starter' | 'pro' | 'teams' | 'enterprise';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          queries_used: number;
          property_scores_used: number;
          referral_code: string | null;
          referred_by: string | null;
          affiliate_status: 'none' | 'junior' | 'vp' | null;
          stripe_connect_id: string | null;
          total_earnings: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'starter' | 'pro' | 'teams' | 'enterprise';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          queries_used?: number;
          property_scores_used?: number;
          referral_code?: string | null;
          referred_by?: string | null;
          affiliate_status?: 'none' | 'junior' | 'vp' | null;
          stripe_connect_id?: string | null;
          total_earnings?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          subscription_tier?: 'free' | 'starter' | 'pro' | 'teams' | 'enterprise';
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          queries_used?: number;
          property_scores_used?: number;
          referral_code?: string | null;
          referred_by?: string | null;
          affiliate_status?: 'none' | 'junior' | 'vp' | null;
          stripe_connect_id?: string | null;
          total_earnings?: number;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          model: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          model?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          model?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          model: string | null;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: 'user' | 'assistant' | 'system';
          content: string;
          model?: string | null;
          tokens_used?: number | null;
          created_at?: string;
        };
        Update: {
          content?: string;
        };
      };
      property_scores: {
        Row: {
          id: string;
          user_id: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          property_type: string;
          purchase_price: number;
          arv: number | null;
          repair_cost: number | null;
          rent_estimate: number | null;
          overall_score: number;
          cash_flow_score: number;
          appreciation_score: number;
          risk_score: number;
          ai_analysis: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          property_type: string;
          purchase_price: number;
          arv?: number | null;
          repair_cost?: number | null;
          rent_estimate?: number | null;
          overall_score?: number;
          cash_flow_score?: number;
          appreciation_score?: number;
          risk_score?: number;
          ai_analysis?: Json | null;
          created_at?: string;
        };
        Update: {
          arv?: number | null;
          repair_cost?: number | null;
          rent_estimate?: number | null;
          overall_score?: number;
          cash_flow_score?: number;
          appreciation_score?: number;
          risk_score?: number;
          ai_analysis?: Json | null;
        };
      };
      deals: {
        Row: {
          id: string;
          user_id: string;
          property_address: string;
          deal_type: 'purchase' | 'refinance' | 'construction';
          loan_amount: number;
          status: 'lead' | 'application' | 'processing' | 'underwriting' | 'approved' | 'funded' | 'closed' | 'lost';
          borrower_name: string;
          borrower_email: string;
          borrower_phone: string | null;
          notes: string | null;
          ghl_contact_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          property_address: string;
          deal_type: 'purchase' | 'refinance' | 'construction';
          loan_amount: number;
          status?: 'lead' | 'application' | 'processing' | 'underwriting' | 'approved' | 'funded' | 'closed' | 'lost';
          borrower_name: string;
          borrower_email: string;
          borrower_phone?: string | null;
          notes?: string | null;
          ghl_contact_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          property_address?: string;
          deal_type?: 'purchase' | 'refinance' | 'construction';
          loan_amount?: number;
          status?: 'lead' | 'application' | 'processing' | 'underwriting' | 'approved' | 'funded' | 'closed' | 'lost';
          borrower_name?: string;
          borrower_email?: string;
          borrower_phone?: string | null;
          notes?: string | null;
          ghl_contact_id?: string | null;
          updated_at?: string;
        };
      };
      affiliate_referrals: {
        Row: {
          id: string;
          affiliate_id: string;
          referred_user_id: string;
          status: 'pending' | 'active' | 'cancelled';
          commission_rate: number;
          total_paid: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          affiliate_id: string;
          referred_user_id: string;
          status?: 'pending' | 'active' | 'cancelled';
          commission_rate?: number;
          total_paid?: number;
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'active' | 'cancelled';
          total_paid?: number;
        };
      };
      affiliate_payouts: {
        Row: {
          id: string;
          affiliate_id: string;
          amount: number;
          stripe_transfer_id: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          affiliate_id: string;
          amount: number;
          stripe_transfer_id?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          created_at?: string;
        };
        Update: {
          stripe_transfer_id?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type PropertyScore = Database['public']['Tables']['property_scores']['Row'];
export type Deal = Database['public']['Tables']['deals']['Row'];
export type AffiliateReferral = Database['public']['Tables']['affiliate_referrals']['Row'];
export type AffiliatePayout = Database['public']['Tables']['affiliate_payouts']['Row'];
