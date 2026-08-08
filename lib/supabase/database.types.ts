/**
 * Placeholder Database types.
 * Replace with generated output from Supabase CLI:
 *   npx supabase gen types typescript --project-id <id> > lib/supabase/database.types.ts
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      properties: {
        Row: {
          id: string
          slug: string
          name: string
          price_label: string
          currency: "MXN" | "USD"
          status: "published" | "hidden" | "draft"
          stay_type: "private" | "shared" | "events"
          featured: boolean
          featured_order: number | null
          max_guests: number
          bedrooms: number
          full_bathrooms: number
          half_bathrooms: number
          includes: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["properties"]["Row"], "created_at" | "updated_at"> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["properties"]["Insert"]>
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          storage_path: string
          public_url: string
          sort_order: number
          is_cover: boolean
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["property_images"]["Row"], "created_at"> & {
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["property_images"]["Insert"]>
      }
      custom_amenities: {
        Row: {
          id: string
          label: string
          icon_id: string
          created_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["custom_amenities"]["Row"], "created_at"> & {
          created_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["custom_amenities"]["Insert"]>
      }
      property_amenities: {
        Row: { property_id: string; amenity_id: string }
        Insert: Database["public"]["Tables"]["property_amenities"]["Row"]
        Update: Partial<Database["public"]["Tables"]["property_amenities"]["Insert"]>
      }
      property_highlight_amenities: {
        Row: { property_id: string; amenity_id: string }
        Insert: Database["public"]["Tables"]["property_highlight_amenities"]["Row"]
        Update: Partial<Database["public"]["Tables"]["property_highlight_amenities"]["Insert"]>
      }
      property_custom_amenities: {
        Row: { property_id: string; custom_amenity_id: string; is_highlight: boolean }
        Insert: Database["public"]["Tables"]["property_custom_amenities"]["Row"]
        Update: Partial<Database["public"]["Tables"]["property_custom_amenities"]["Insert"]>
      }
      pre_reservation_leads: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          guests: number
          property_ids: Json
          check_in: string
          check_out: string
          locale: "es" | "en"
          status: "new" | "contacted" | "scheduled" | "rejected" | "archived"
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["pre_reservation_leads"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["pre_reservation_leads"]["Insert"]>
      }
      property_inquiry_leads: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          property_details: string
          locale: "es" | "en"
          status: "new" | "contacted" | "scheduled" | "rejected" | "archived"
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database["public"]["Tables"]["property_inquiry_leads"]["Row"], "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database["public"]["Tables"]["property_inquiry_leads"]["Insert"]>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type PropertyRow = Database["public"]["Tables"]["properties"]["Row"]
export type PropertyImageRow = Database["public"]["Tables"]["property_images"]["Row"]
export type PreReservationLeadRow = Database["public"]["Tables"]["pre_reservation_leads"]["Row"]
export type PropertyInquiryLeadRow = Database["public"]["Tables"]["property_inquiry_leads"]["Row"]
