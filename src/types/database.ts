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
          display_name: string | null;
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
          display_name?: string | null;
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
          display_name?: string | null;
          avatar_url?: string | null;
          plan?: Plan;
          stripe_customer_id?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: 'organization_members_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'organization_members_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'organization_invitations_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'organization_invitations_invited_by_fkey';
            columns: ['invited_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'api_keys_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'subscriptions_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: 'usage_records_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
        ];
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
          tracking_url?: string;
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
        Relationships: [
          {
            foreignKeyName: 'qr_codes_organization_id_fkey';
            columns: ['organization_id'];
            isOneToOne: false;
            referencedRelation: 'organizations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'qr_codes_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
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
          referrer: string | null;
          region: string | null;
          latitude: number | null;
          longitude: number | null;
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
          referrer?: string | null;
          region?: string | null;
          latitude?: number | null;
          longitude?: number | null;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: 'scan_events_qr_code_id_fkey';
            columns: ['qr_code_id'];
            isOneToOne: false;
            referencedRelation: 'qr_codes';
            referencedColumns: ['id'];
          },
        ];
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
        Relationships: [];
      };
    };
    Views: Record<string, never>;
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
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
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
