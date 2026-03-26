export function getSupabasePublicKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
  if (!key) {
    throw new Error("Defina NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY");
  }
  return key;
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) {
    throw new Error("Defina NEXT_PUBLIC_SUPABASE_URL");
  }
  return url;
}
