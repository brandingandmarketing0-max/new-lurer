import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Analytics table interface
export interface AnalyticsData {
  id?: number
  page: string
  referrer: string
  readable_referrer: string
  user_agent: string
  ip_address: string
  timestamp: string
  pathname: string
  search_params: string
  created_at?: string
}

// Brooke analytics table interface
export interface BrookeAnalyticsData {
  id?: number
  page: string
  referrer: string
  readable_referrer: string
  user_agent: string
  ip_address: string
  timestamp: string
  pathname: string
  search_params: string
  created_at?: string
} 