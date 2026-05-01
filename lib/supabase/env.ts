function readPublicEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required public env: ${name}`);
  }

  return value;
}

function readPublicEnvOptional(name: string) {
  return process.env[name] ?? "";
}

export function getSupabasePublicConfig() {
  const url = readPublicEnvOptional("NEXT_PUBLIC_SUPABASE_URL");
  const anonKey = readPublicEnvOptional("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return {
    url,
    anonKey,
    isConfigured: Boolean(url && anonKey),
  };
}

export function requireSupabasePublicConfig() {
  return {
    url: readPublicEnv("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: readPublicEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}
