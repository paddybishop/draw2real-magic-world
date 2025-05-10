
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client with public credentials
// These are safe to include in client-side code
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or anon key missing. Please check your environment variables.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to call Supabase Edge Functions
export async function callEdgeFunction<T>(
  functionName: string,
  payload: any
): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke<T>(functionName, {
      body: payload,
    });

    if (error) {
      throw new Error(`Edge function error: ${error.message || 'Unknown error'}`);
    }

    return data;
  } catch (error) {
    console.error(`Error calling ${functionName}:`, error);
    throw error;
  }
}
