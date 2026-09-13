import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * The app runs fully local-first (Zustand + localStorage) without these
 * env vars set. Supply VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in a
 * .env file to enable cloud sync via the sync functions in store/sync.ts.
 */
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export const isCloudSyncEnabled = () => supabase !== null;
