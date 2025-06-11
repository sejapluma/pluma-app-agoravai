"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, FileText } from "lucide-react"
import { signOut } from "@/lib/actions"
import InputInicial from "@/components/input-inicial"
import SalvarProntuario from "@/components/salvar-prontuario"
import ProntuariosList from "@/components/prontuarios-list"
import { uploadAudioClient } from "@/lib/client-storage"

type FlowStep = "input" | "processing" | "save" | "library"

interface ProcessedData {
  content: string
  type: "texto" | "audio"
  audioBlob?: Blob
  audioUrl?: string
  processedContent: string
}

export default function Home() {
  const [currentStep, setCurrentStep] = useState<FlowStep>("input")
  const [processedData, setProcessedData] = useState<ProcessedData | null>(null)
  const [processingError, setProcessingError] = useState<string | null>(null)

  const handleInputSubmit = async (data: { content: string; type: "texto" | "audio"; audioBlob?: Blob }) => {
    setCurrentStep("processing")
    setProcessingError(null) // Limpa erros anteriores
    console.log("Iniciando processamento. Estado: processing")

    const webhookUrl = "https://primary-production-90ca.up.railway.app/webhook/f7e7d4cc-fa41-45ef-8cdd-ba1374dee375"
    let response: Response | undefined
    let audioUrl: string | undefined

    try {
      if (data.type === "texto") {
        console.log("Enviando texto para o webhook...")
        response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: data.content }),
        })
      } else if (data.type === "audio" && data.audioBlob) {
        console.log("Iniciando upload do áudio para Supabase Storage...")
        const uploadResult = await uploadAudioClient(data.audioBlob)

        if (!uploadResult.success) {
          throw new Error(`Erro no upload do áudio: ${uploadResult.error}`)
        }
        audioUrl = uploadResult.audioUrl
        console.log("Upload concluído. URL do áudio:", audioUrl)

        console.log("Enviando URL do áudio para o webhook...")
        response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audioUrl: audioUrl }),
        })
      }

      if (!response || !response.ok) {
        const errorText = response ? await response.text() : "Sem resposta"
        throw new Error(`Falha ao processar prontuário. Status: ${response?.status || "N/A"}. Erro: ${errorText}`)
      }

      // Lendo a resposta como texto puro
      const processedContent = await response.text()
      console.log("Resposta do webhook recebida (texto puro):", processedContent)

      setProcessedData({
        content: data.content,
        type: data.type,
        audioBlob: data.audioBlob,
        audioUrl: audioUrl,
        processedContent, // Já é o texto processado
      })

      // Adiciona um atraso artificial para a tela de processamento ser visível
      console.log("Aguardando 1.5 segundos antes de mudar de tela...")
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Atraso de 1.5 segundos

      setCurrentStep("save")
      console.log("Processamento concluído. Estado: save")
    } catch (error: any) {
      console.error("Erro no processamento do webhook:", error)
      setProcessingError(error.message || "Falha ao processar prontuário. Tente novamente.")
      setCurrentStep("input") // Volta para a tela de input em caso de erro
      console.log("Erro no processamento. Estado: input")
    }
  }

  const handleBack = () => {
    setCurrentStep("input")
    setProcessedData(null)
    setProcessingError(null)
  }

  const handleSaved = () => {
    setCurrentStep("library")
  }

  const handleNewProntuario = () => {
    setCurrentStep("input")
    setProcessedData(null)
    setProcessingError(null)
  }

  // Nova função para navegar para a biblioteca
  const handleViewLibrary = () => {
    setCurrentStep("library")
  }

  if (currentStep === "input" || currentStep === "processing") {
    return (
      <InputInicial
        onSubmit={handleInputSubmit}
        onViewLibrary={handleViewLibrary}
        isProcessing={currentStep === "processing"}
        processingError={processingError}
      />
    )
  }

  if (currentStep === "save" && processedData) {
    return (
      <SalvarProntuario
        conteudoProcessado={processedData.processedContent}
        inputOriginal={processedData.content}
        inputTipo={processedData.type}
        audioUrl={processedData.audioUrl}
        onBack={handleBack}
        onSaved={handleSaved}
        onNewProntuario={handleNewProntuario} // Passando a função para criar novo prontuário
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 pluma-gradient rounded-lg shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Prontuário Pluma
                </h1>
                <p className="text-sm text-purple-600">Biblioteca de Prontuários</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleNewProntuario} className="pluma-gradient text-white shadow-lg hover:shadow-xl">
                <FileText className="h-4 w-4 mr-2" />
                Novo Prontuário
              </Button>
              <form action={signOut}>
                <Button type="submit" variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProntuariosList />
      </main>
    </div>
  )
}
