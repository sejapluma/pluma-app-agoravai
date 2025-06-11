"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function createProntuario(prevState: any, formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Usuário não autenticado" }
    }

    const pacienteNome = formData.get("paciente_nome")?.toString()
    const inputOriginal = formData.get("input_original")?.toString()
    const inputTipo = formData.get("input_tipo")?.toString()
    const audioUrl = formData.get("audio_url")?.toString() // Captura a URL do áudio
    const dataSessao = formData.get("data_sessao")?.toString()
    const conteudoProcessado = formData.get("conteudo_processado")?.toString()
    const status = formData.get("status")?.toString() || "concluido"

    if (!pacienteNome || !inputOriginal || !inputTipo || !conteudoProcessado) {
      return { error: "Dados obrigatórios não fornecidos" }
    }

    // Extrair palavras-chave simples do conteúdo
    const palavrasChave = [
      pacienteNome.toLowerCase(),
      "sessão",
      "atendimento",
      ...conteudoProcessado
        .toLowerCase()
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .slice(0, 5),
    ]

    // Inserir prontuário no banco
    const { data: prontuario, error } = await supabase
      .from("prontuarios")
      .insert({
        user_id: user.id,
        paciente_nome: pacienteNome,
        input_original: inputOriginal,
        input_tipo: inputTipo,
        audio_url: audioUrl, // Salva a URL do áudio no banco
        data_sessao: dataSessao || new Date().toISOString().split("T")[0],
        conteudo_processado: conteudoProcessado,
        status: status,
        palavras_chave: palavrasChave,
      })
      .select()
      .single()

    if (error) {
      console.error("Erro ao criar prontuário:", error)
      return { error: "Erro ao salvar prontuário" }
    }

    revalidatePath("/")
    return { success: true, prontuario }
  } catch (error) {
    console.error("Erro geral:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function updateProntuario(id: string, formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Usuário não autenticado" }
    }

    const conteudoProcessado = formData.get("conteudo_processado")?.toString()
    const pacienteNome = formData.get("paciente_nome")?.toString()
    const dataSessao = formData.get("data_sessao")?.toString()

    const { error } = await supabase
      .from("prontuarios")
      .update({
        conteudo_processado,
        paciente_nome: pacienteNome,
        data_sessao: dataSessao,
      })
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Erro ao atualizar prontuário:", error)
      return { error: "Erro ao atualizar prontuário" }
    }

    revalidatePath("/")
    revalidatePath(`/prontuario/${id}`)
    return { success: true }
  } catch (error) {
    console.error("Erro geral:", error)
    return { error: "Erro interno do servidor" }
  }
}

export async function deleteProntuario(id: string) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "Usuário não autenticado" }
    }

    const { error } = await supabase.from("prontuarios").delete().eq("id", id).eq("user_id", user.id)

    if (error) {
      console.error("Erro ao deletar prontuário:", error)
      return { error: "Erro ao deletar prontuário" }
    }

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Erro geral:", error)
    return { error: "Erro interno do servidor" }
  }
}
