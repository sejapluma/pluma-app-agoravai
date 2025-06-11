import { updateSession } from "@/lib/supabase/middleware"
import { addSecurityHeaders } from "@/lib/security/headers"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // Rate limiting básico (em produção use Upstash Redis)
  const ip = request.ip || request.headers.get("x-forwarded-for") || "unknown"

  // Bloquear IPs suspeitos (exemplo básico)
  const suspiciousIPs = ["192.168.1.100"] // Lista de IPs bloqueados
  if (suspiciousIPs.includes(ip)) {
    return new NextResponse("Access Denied", { status: 403 })
  }

  // Verificar User-Agent suspeito
  const userAgent = request.headers.get("user-agent") || ""
  const suspiciousAgents = ["bot", "crawler", "spider"]
  const isSuspicious = suspiciousAgents.some((agent) => userAgent.toLowerCase().includes(agent))

  if (isSuspicious && !userAgent.includes("Googlebot")) {
    return new NextResponse("Access Denied", { status: 403 })
  }

  // Processar autenticação
  const response = await updateSession(request)

  // Adicionar headers de segurança
  return addSecurityHeaders(response)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
