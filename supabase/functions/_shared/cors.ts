const ALLOWED_ORIGINS = [
  "http://localhost:3000",              // dev
  "http://localhost:3001",              // dev
  "https://dyscalc-thesis.vercel.app",  // prod
  "https://xsgrzkcmubjonahltpqx.supabase.co", // supabase
];

export function getCorsHeaders(origin: string | null) {
  const isAllowed = origin && ALLOWED_ORIGINS.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : "",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, rpc-access-token, x-api-key, x-password",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}