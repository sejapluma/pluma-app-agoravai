"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { emailSchema, passwordSchema } from "@/lib/security/validation"
import { logSecurityEvent } from "@/lib/security/audit"

export async function signIn(prevState: any, formData: FormData) {
  try {
    // Validação de entrada
    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()

    if (!email || !password) {
      await logSecurityEvent("login_attempt_missing_fields", { email })
      return { error: "Email e senha são obrigatórios" }
    }

    // Validar formato do email e senha
    const emailValidation = emailSchema.safeParse(email)
    const passwordValidation = passwordSchema.safeParse(password)

    if (!emailValidation.success) {
      await logSecurityEvent("login_attempt_invalid_email", { email })
      return { error: "Email inválido" }
    }

    if (!passwordValidation.success) {
      await logSecurityEvent("login_attempt_weak_password", { email })
      return { error: "Formato de senha inválido" }
    }

    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const { error } = await supabase.auth.signInWithPassword({
      email: emailValidation.data,
      password: passwordValidation.data,
    })

    if (error) {
      await logSecurityEvent(
        "login_failed",
        {
          email: emailValidation.data,
          error: error.message,
        },
        "medium",
      )

      // Não revelar se o usuário existe ou não
      return { error: "Credenciais inválidas" }
    }

    await logSecurityEvent(
      "login_success",
      {
        email: emailValidation.data,
      },
      "low",
    )

    return { success: true }
  } catch (error) {
    await logSecurityEvent(
      "login_error",
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "high",
    )

    return { error: "Erro interno do servidor" }
  }
}

export async function signUp(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email")?.toString()
    const password = formData.get("password")?.toString()

    if (!email || !password) {
      await logSecurityEvent("signup_attempt_missing_fields", { email })
      return { error: "Email e senha são obrigatórios" }
    }

    // Validação rigorosa
    const emailValidation = emailSchema.safeParse(email)
    const passwordValidation = passwordSchema.safeParse(password)

    if (!emailValidation.success) {
      await logSecurityEvent("signup_attempt_invalid_email", { email })
      return { error: emailValidation.error.errors[0].message }
    }

    if (!passwordValidation.success) {
      await logSecurityEvent("signup_attempt_weak_password", { email })
      return { error: passwordValidation.error.errors[0].message }
    }

    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const { error } = await supabase.auth.signUp({
      email: emailValidation.data,
      password: passwordValidation.data,
    })

    if (error) {
      await logSecurityEvent(
        "signup_failed",
        {
          email: emailValidation.data,
          error: error.message,
        },
        "medium",
      )

      return { error: error.message }
    }

    await logSecurityEvent(
      "signup_success",
      {
        email: emailValidation.data,
      },
      "low",
    )

    return { success: "Verifique seu email para confirmar a conta." }
  } catch (error) {
    await logSecurityEvent(
      "signup_error",
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "high",
    )

    return { error: "Erro interno do servidor" }
  }
}

export async function signOut() {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    await supabase.auth.signOut()

    await logSecurityEvent(
      "logout_success",
      {
        user_id: user?.id,
      },
      "low",
    )

    redirect("/auth/login")
  } catch (error) {
    await logSecurityEvent(
      "logout_error",
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      "medium",
    )

    redirect("/auth/login")
  }
}
