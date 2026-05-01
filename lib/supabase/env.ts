// Next.js / Turbopack only inline `process.env.NEXT_PUBLIC_*` when the access
// uses a literal property name. Reading them through a computed key
// (`process.env[name]`) leaves them as a plain runtime lookup that returns
// `undefined` in the client bundle, even when the variable is set in Vercel.
// Keep both reads literal.

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

export function requireSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Missing required public env: NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!anonKey) {
    throw new Error(
      "Missing required public env: NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return { url, anonKey };
}
