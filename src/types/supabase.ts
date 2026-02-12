/**
 * Database Types - Generated from Prisma Schema
 *
 * These types represent the database schema for use with Supabase client.
 * Based on prisma/schema.prisma
 */

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
      groups: {
        Row: {
          id: string;
          name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      guests: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          code: string;
          group_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          code?: string;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          code?: string;
          group_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      confirmations: {
        Row: {
          id: string;
          civil_attending: boolean;
          party_attending: boolean;
          guest_id: string;
          confirmed_by_id: string;
          group_id: string | null;
          confirmed_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          civil_attending?: boolean;
          party_attending?: boolean;
          guest_id: string;
          confirmed_by_id: string;
          group_id?: string | null;
          confirmed_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          civil_attending?: boolean;
          party_attending?: boolean;
          guest_id?: string;
          confirmed_by_id?: string;
          group_id?: string | null;
          confirmed_at?: string;
          updated_at?: string;
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
