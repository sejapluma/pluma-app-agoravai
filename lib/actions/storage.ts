"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function uploadAudio(formData: FormData) {
  try {
    const cookieStore = cookies()
    const supabase = createServerActionClient({ cookies: () => cookieStore })

    // Verificar autenticação de forma mais robusta
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Erro ao obter sessão:", sessionError)
      return { error: "Erro de autenticação. Tente fazer login novamente." }
    }

    if (!session || !session.user) {
      console.error("Sessão ou usuário não encontrado")
      return { error: "Usuário não autenticado. Faça login para continuar." }
    }

    const user = session.user
    const audioFile = formData.get("audio") as File

    if (!audioFile || audioFile.size === 0) {
      return { error: "Nenhum arquivo de áudio fornecido." }
    }

    // Validar tipo de arquivo
    if (!audioFile.type.startsWith("audio/")) {
      return { error: "Arquivo deve ser um áudio válido." }
    }

    // Validar tamanho do arquivo (máximo 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (audioFile.size > maxSize) {
      return { error: "Arquivo de áudio muito grande. Máximo 50MB." }
    }

    const fileExtension = audioFile.name.split(".").pop() || "wav"
    const fileName = `${uuidv4()}.${fileExtension}`
    const filePath = `${user.id}/${fileName}` // Caminho único por usuário

    console.log(`Fazendo upload do arquivo: ${filePath}, tamanho: ${audioFile.size} bytes`)

    const { data, error } = await supabase.storage
      .from("prontuario-audios") // Nome do bucket que criamos
      .upload(filePath, audioFile, {
        cacheControl: "3600",
        upsert: false,
        contentType: audioFile.type,
      })

    if (error) {
      console.error("Erro ao fazer upload do áudio para o Supabase Storage:", error)
      return { error: `Falha no upload do áudio: ${error.message}` }
    }

    console.log("Upload realizado com sucesso:", data)

    // Obter a URL pública do arquivo
    const { data: publicUrlData } = supabase.storage.from("prontuario-audios").getPublicUrl(filePath)

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return { error: "Não foi possível obter a URL pública do áudio." }
    }

    console.log("URL pública gerada:", publicUrlData.publicUrl)

    return { success: true, audioUrl: publicUrlData.publicUrl, filePath }
  } catch (error: any) {
    console.error("Erro geral no upload de áudio:", error)
    return { error: `Erro interno do servidor ao fazer upload: ${error.message}` }
  }
}
