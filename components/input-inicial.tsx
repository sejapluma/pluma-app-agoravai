"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Mic, MicOff, FileText, Send, Loader2, AlertCircle, BookOpen } from "lucide-react"

interface InputInicialProps {
  onSubmit: (data: { content: string; type: "texto" | "audio"; audioBlob?: Blob }) => void
  onViewLibrary: () => void // Nova prop para navegar para a biblioteca
  isProcessing?: boolean
  processingError?: string | null
}

export default function InputInicial({
  onSubmit,
  onViewLibrary, // Nova prop
  isProcessing = false,
  processingError = null,
}: InputInicialProps) {
  const [inputMode, setInputMode] = useState<"texto" | "audio">("texto")
  const [textContent, setTextContent] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      // Tenta usar audio/webm com codec opus para ampla compatibilidade e boa compressão
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm; codecs=opus" })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" }) // Cria o Blob como WebM
        setAudioBlob(audioBlob)
        console.log("Recorded audio Blob type:", audioBlob.type) // Log para verificar o tipo
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error: any) {
      // Adicionado :any para tipagem do erro
      console.error("Erro ao acessar microfone:", error)
      alert(`Erro ao acessar microfone: ${error.message}. Verifique as permissões e tente novamente.`)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSubmit = () => {
    if (inputMode === "texto" && textContent.trim()) {
      onSubmit({ content: textContent, type: "texto" })
    } else if (inputMode === "audio" && audioBlob) {
      onSubmit({ content: "Áudio gravado", type: "audio", audioBlob })
    }
  }

  const canSubmit = (inputMode === "texto" && textContent.trim()) || (inputMode === "audio" && audioBlob)

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md pluma-card">
          <CardContent className="p-8 text-center">
            <div className="space-y-4">
              <div className="p-4 pluma-gradient rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Prontuário em processamento</h3>
                <p className="text-gray-600 mt-1">Aguarde enquanto processamos seu prontuário...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="p-3 pluma-gradient rounded-xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Prontuário Pluma
            </h1>
            <p className="text-gray-600 mt-2">Registre o conteúdo da sua sessão</p>
          </div>

          {/* Botão Meus Prontuários */}
          <div className="mt-4">
            <Button
              onClick={onViewLibrary}
              variant="outline"
              className="border-purple-200 hover:bg-purple-50 text-purple-700"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Meus Prontuários
            </Button>
          </div>
        </div>

        {/* Mensagem de erro de processamento */}
        {processingError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{processingError}</span>
          </div>
        )}

        {/* Input Mode Selector */}
        <div className="flex justify-center">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-purple-100">
            <div className="flex">
              <button
                onClick={() => {
                  setInputMode("texto")
                  setAudioBlob(null)
                  setIsRecording(false)
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  inputMode === "texto"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <FileText className="h-4 w-4" />
                Texto
              </button>
              <button
                onClick={() => {
                  setInputMode("audio")
                  setTextContent("")
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                  inputMode === "audio"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                }`}
              >
                <Mic className="h-4 w-4" />
                Áudio
              </button>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <Card className="pluma-card border-purple-100">
          <CardContent className="p-6">
            {inputMode === "texto" ? (
              <div className="space-y-4">
                <Textarea
                  placeholder="Descreva o conteúdo da sessão, observações, evolução do paciente..."
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  rows={12}
                  className="pluma-input border-purple-200 focus:ring-purple-500 focus:border-purple-500 resize-none text-base leading-relaxed"
                />
                <div className="text-right text-sm text-purple-600">
                  {textContent.length > 0 && `${textContent.length} caracteres`}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col items-center gap-6 p-8 border-2 border-dashed border-purple-200 rounded-lg bg-purple-50/50">
                  {!isRecording && !audioBlob && (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-purple-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                        <Mic className="h-10 w-10 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">Gravar áudio</h3>
                        <p className="text-gray-600">Clique para iniciar a gravação</p>
                      </div>
                      <Button onClick={startRecording} className="pluma-gradient text-white px-8 py-3 shadow-lg">
                        <Mic className="h-5 w-5 mr-2" />
                        Iniciar Gravação
                      </Button>
                    </div>
                  )}

                  {isRecording && (
                    <div className="text-center space-y-4">
                      <div className="p-4 bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                        <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-red-600">Gravando...</h3>
                        <p className="text-gray-600">Fale naturalmente sobre a sessão</p>
                      </div>
                      <Button onClick={stopRecording} variant="outline" className="px-8 py-3 border-red-200">
                        <MicOff className="h-5 w-5 mr-2" />
                        Parar Gravação
                      </Button>
                    </div>
                  )}

                  {audioBlob && (
                    <div className="text-center space-y-4 w-full">
                      <div className="p-4 bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                        <FileText className="h-10 w-10 text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-green-600">Áudio gravado!</h3>
                        <p className="text-gray-600">Reproduza para conferir</p>
                      </div>
                      <audio controls src={URL.createObjectURL(audioBlob)} className="w-full max-w-md mx-auto" />
                      <Button
                        onClick={() => {
                          setAudioBlob(null)
                          setIsRecording(false)
                        }}
                        variant="outline"
                        size="sm"
                        className="border-purple-200"
                      >
                        Gravar Novamente
                      </Button>
                    </div>
                  )}
                </div>

                {/* Upload de arquivo */}
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Ou faça upload de um arquivo de áudio</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setAudioBlob(file)
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="pluma-gradient text-white px-8 py-4 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
          >
            <Send className="h-5 w-5 mr-2" />
            Processar Conteúdo
          </Button>
        </div>
      </div>
    </div>
  )
}
