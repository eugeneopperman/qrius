// Generated database types for Supabase
// Update this file when schema changes

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Plan = 'free' | 'pro' | 'business';
export type OrgRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          avatar_url: string | null;
          plan: Plan;
          stripe_customer_id: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          avatar_url?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          avatar_url?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
      };
      organizations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          plan: Plan;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          logo_url?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          slug?: string;
          logo_url?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          settings?: Json;
          updated_at?: string;
        };
      };
      organization_members: {
        Row: {
          id: string;
          organization_id: string;
          user_id: string;
          role: OrgRole;
          invited_by: string | null;
          invited_at: string | null;
          joined_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          user_id: string;
          role: OrgRole;
          invited_by?: string | null;
          invited_at?: string | null;
          joined_at?: string;
          created_at?: string;
        };
        Update: {
          role?: OrgRole;
        };
      };
      organization_invitations: {
        Row: {
          id: string;
          organization_id: string;
          email: string;
          role: OrgRole;
          token: string;
          invited_by: string;
          expires_at: string;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          email: string;
          role: OrgRole;
          token: string;
          invited_by: string;
          expires_at: string;
          accepted_at?: string | null;
          created_at?: string;
        };
        Update: {
          accepted_at?: string | null;
        };
      };
      api_keys: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          scopes: string[];
          rate_limit_per_day: number;
          last_used_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          key_hash: string;
          key_prefix: string;
          scopes?: string[];
          rate_limit_per_day?: number;
          last_used_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          scopes?: string[];
          rate_limit_per_day?: number;
          last_used_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          organization_id: string;
          stripe_subscription_id: string | null;
          stripe_price_id: string | null;
          status: SubscriptionStatus;
          current_period_start: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          status: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          stripe_subscription_id?: string | null;
          stripe_price_id?: string | null;
          status?: SubscriptionStatus;
          current_period_start?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        };
      };
      usage_records: {
        Row: {
          id: string;
          organization_id: string;
          month: string;
          qr_codes_created: number;
          scans_count: number;
          api_requests: number;
          storage_bytes: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          month: string;
          qr_codes_created?: number;
          scans_count?: number;
          api_requests?: number;
          storage_bytes?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          qr_codes_created?: number;
          scans_count?: number;
          api_requests?: number;
          storage_bytes?: number;
          updated_at?: string;
        };
      };
      qr_codes: {
        Row: {
          id: string;
          short_code: string;
          destination_url: string;
          qr_type: string;
          original_data: Json | null;
          is_active: boolean;
          total_scans: number;
          user_id: string | null;
          organization_id: string | null;
          name: string | null;
          description: string | null;
          tags: string[];
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          short_code: string;
          destination_url: string;
          qr_type?: string;
          original_data?: Json | null;
          is_active?: boolean;
          total_scans?: number;
          user_id?: string | null;
          organization_id?: string | null;
          name?: string | null;
          description?: string | null;
          tags?: string[];
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          destination_url?: string;
          qr_type?: string;
          original_data?: Json | null;
          is_active?: boolean;
          name?: string | null;
          description?: string | null;
          tags?: string[];
          metadata?: Json;
          updated_at?: string;
        };
      };
      scan_events: {
        Row: {
          id: string;
          qr_code_id: string;
          scanned_at: string;
          country_code: string | null;
          city: string | null;
          device_type: string | null;
          user_agent: string | null;
          ip_hash: string | null;
        };
        Insert: {
          id?: string;
          qr_code_id: string;
          scanned_at?: string;
          country_code?: string | null;
          city?: string | null;
          device_type?: string | null;
          user_agent?: string | null;
          ip_hash?: string | null;
        };
        Update: never;
      };
      plan_limits: {
        Row: {
          plan: Plan;
          qr_codes_limit: number;
          scans_per_month: number;
          scan_history_days: number;
          team_members: number;
          api_requests_per_day: number;
          custom_branding: boolean;
          white_label: boolean;
          priority_support: boolean;
        };
        Insert: never;
        Update: never;
      };
    };
    Functions: {
      get_user_organization: {
        Args: { p_user_id: string };
        Returns: string | null;
      };
      user_has_permission: {
        Args: { p_user_id: string; p_org_id: string; p_required_roles: string[] };
        Returns: boolean;
      };
      can_create_qr_code: {
        Args: { p_org_id: string };
        Returns: boolean;
      };
    };
  };
}

// Convenience types for table rows
export type User = Database['public']['Tables']['users']['Row'];
export type Organization = Database['public']['Tables']['organizations']['Row'];
export type OrganizationMember = Database['public']['Tables']['organization_members']['Row'];
export type OrganizationInvitation = Database['public']['Tables']['organization_invitations']['Row'];
export type ApiKey = Database['public']['Tables']['api_keys']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type UsageRecord = Database['public']['Tables']['usage_records']['Row'];
export type QRCode = Database['public']['Tables']['qr_codes']['Row'];
export type ScanEvent = Database['public']['Tables']['scan_events']['Row'];
export type PlanLimits = Database['public']['Tables']['plan_limits']['Row'];

// Extended types with relations
export interface OrganizationWithMembers extends Organization {
  members: (OrganizationMember & { user: User })[];
}

export interface UserWithOrganizations extends User {
  organizations: (OrganizationMember & { organization: Organization })[];
}

export interface QRCodeWithStats extends QRCode {
  scans_today: number;
  scans_this_week: number;
  scans_this_month: number;
}
