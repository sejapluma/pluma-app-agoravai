"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export async function logSecurityEvent(
  event: string,
  details: Record<string, any>,
  severity: "low" | "medium" | "high" | "critical" = "medium",
) {
  try {
    const headersList = headers()
    const ip = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Em produção, você salvaria isso em uma tabela de auditoria
    console.log(`[SECURITY ${severity.toUpperCase()}]`, {
      timestamp: new Date().toISOString(),
      event,
      user_id: user?.id || "anonymous",
      ip,
      userAgent,
      details,
    })

    // Aqui você poderia enviar alertas para serviços como Slack, Discord, etc.
    if (severity === "critical") {
      // await sendCriticalAlert(event, details)
    }
  } catch (error) {
    console.error("Failed to log security event:", error)
  }
}
