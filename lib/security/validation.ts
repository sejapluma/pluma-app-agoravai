import { z } from "zod"

// Schemas de validação
export const emailSchema = z
  .string()
  .email("Email inválido")
  .min(5, "Email muito curto")
  .max(100, "Email muito longo")
  .refine((email) => !email.includes("<script"), "Conteúdo suspeito detectado")

export const passwordSchema = z
  .string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .max(128, "Senha muito longa")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Senha deve conter: maiúscula, minúscula, número e símbolo",
  )

export const textSchema = z
  .string()
  .max(1000, "Texto muito longo")
  .refine((text) => !text.includes("<script"), "Conteúdo suspeito detectado")
  .refine((text) => !text.includes("javascript:"), "Conteúdo suspeito detectado")

// Função para sanitizar HTML
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;")
}

// Função para validar CSRF token
export function validateCSRFToken(token: string, expected: string): boolean {
  return token === expected && token.length > 20
}
