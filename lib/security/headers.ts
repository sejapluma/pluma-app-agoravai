import type { NextResponse } from "next/server"

export function addSecurityHeaders(response: NextResponse) {
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co wss://*.supabase.co;",
  )

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY")

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff")

  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block")

  // Referrer Policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Permissions Policy
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")

  // HSTS (HTTP Strict Transport Security)
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

  return response
}
