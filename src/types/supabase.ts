export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1";
  };
  public: {
    Tables: {
      confirmations: {
        Row: {
          civil_attending: boolean;
          confirmed_at: string;
          confirmed_by_id: string;
          group_id: string | null;
          guest_id: string;
          id: string;
          party_attending: boolean;
          updated_at: string;
        };
        Insert: {
          civil_attending?: boolean;
          confirmed_at?: string;
          confirmed_by_id: string;
          group_id?: string | null;
          guest_id: string;
          id?: string;
          party_attending?: boolean;
          updated_at?: string;
        };
        Update: {
          civil_attending?: boolean;
          confirmed_at?: string;
          confirmed_by_id?: string;
          group_id?: string | null;
          guest_id?: string;
          id?: string;
          party_attending?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_confirmations_confirmed_by";
            columns: ["confirmed_by_id"];
            isOneToOne: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_confirmations_group";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fk_confirmations_guest";
            columns: ["guest_id"];
            isOneToOne: false;
            referencedRelation: "guests";
            referencedColumns: ["id"];
          },
        ];
      };
      groups: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      guests: {
        Row: {
          code: string;
          created_at: string;
          first_name: string;
          group_id: string | null;
          id: string;
          last_name: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          code?: string;
          created_at?: string;
          first_name: string;
          group_id?: string | null;
          id?: string;
          last_name: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          first_name?: string;
          group_id?: string | null;
          id?: string;
          last_name?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "fk_guests_group";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "groups";
            referencedColumns: ["id"];
          },
        ];
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
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];
