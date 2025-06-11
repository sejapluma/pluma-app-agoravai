import { supabase } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

export async function uploadAudioClient(
  audioBlob: Blob,
): Promise<{ success: boolean; audioUrl?: string; error?: string }> {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error("Erro ao obter sessão:", sessionError)
      return { success: false, error: "Erro de autenticação. Tente fazer login novamente." }
    }

    if (!session || !session.user) {
      console.error("Sessão ou usuário não encontrado")
      return { success: false, error: "Usuário não autenticado. Faça login para continuar." }
    }

    const user = session.user

    const maxSize = 50 * 1024 * 1024 // 50MB
    if (audioBlob.size > maxSize) {
      return { success: false, error: "Arquivo de áudio muito grande. Máximo 50MB." }
    }

    const fileName = `${uuidv4()}.webm` // Altera a extensão para .webm
    const filePath = `${user.id}/${fileName}`

    console.log(`Fazendo upload do arquivo: ${filePath}, tamanho: ${audioBlob.size} bytes`)

    const { data, error } = await supabase.storage.from("prontuario-audios").upload(filePath, audioBlob, {
      cacheControl: "3600",
      upsert: false,
      contentType: "audio/webm", // Define o contentType como audio/webm
    })

    if (error) {
      console.error("Erro ao fazer upload do áudio para o Supabase Storage:", error)
      return { success: false, error: `Falha no upload do áudio: ${error.message}` }
    }

    console.log("Upload realizado com sucesso:", data)

    const { data: publicUrlData } = supabase.storage.from("prontuario-audios").getPublicUrl(filePath)

    if (!publicUrlData || !publicUrlData.publicUrl) {
      return { success: false, error: "Não foi possível obter a URL pública do áudio." }
    }

    console.log("URL pública gerada:", publicUrlData.publicUrl)

    return { success: true, audioUrl: publicUrlData.publicUrl }
  } catch (error: any) {
    console.error("Erro geral no upload de áudio:", error)
    return { success: false, error: `Erro interno do servidor ao fazer upload: ${error.message}` }
  }
}
