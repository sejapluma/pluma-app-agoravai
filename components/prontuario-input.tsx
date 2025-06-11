"use client"

import { useState, useRef } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Mic, MicOff, FileText } from "lucide-react"
import { createProntuario } from "@/lib/actions/prontuarios"

export default function ProntuarioInput() {
  const [state, formAction] = useActionState(createProntuario, null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [inputMode, setInputMode] = useState<"texto" | "audio">("texto")
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        setAudioBlob(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Erro ao acessar microfone:", error)
      alert("Erro ao acessar microfone. Verifique as permissões.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <Card className="pluma-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <FileText className="h-5 w-5" />
          Novo Prontuário
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paciente_nome">Nome do Paciente</Label>
              <Input
                id="paciente_nome"
                name="paciente_nome"
                placeholder="Digite o nome do paciente"
                required
                className="pluma-input"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_sessao">Data da Sessão</Label>
              <Input
                id="data_sessao"
                name="data_sessao"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                className="pluma-input"
              />
            </div>
          </div>

          <Tabs value={inputMode} onValueChange={(value) => setInputMode(value as "texto" | "audio")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="texto" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Texto
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Áudio
              </TabsTrigger>
            </TabsList>

            <TabsContent value="texto" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="input_original">Conteúdo da Sessão</Label>
                <Textarea
                  id="input_original"
                  name="input_original"
                  placeholder="Descreva o conteúdo da sessão, observações, evolução do paciente..."
                  rows={8}
                  required={inputMode === "texto"}
                  className="pluma-input resize-none"
                />
              </div>
            </TabsContent>

            <TabsContent value="audio" className="space-y-4">
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-gray-300 rounded-lg">
                  {!isRecording && !audioBlob && (
                    <Button type="button" onClick={startRecording} className="pluma-gradient text-white">
                      <Mic className="h-4 w-4 mr-2" />
                      Iniciar Gravação
                    </Button>
                  )}

                  {isRecording && (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2 text-red-600">
                        <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                        <span>Gravando...</span>
                      </div>
                      <Button type="button" onClick={stopRecording} variant="outline">
                        <MicOff className="h-4 w-4 mr-2" />
                        Parar Gravação
                      </Button>
                    </div>
                  )}

                  {audioBlob && (
                    <div className="flex flex-col items-center gap-2">
                      <audio controls src={URL.createObjectURL(audioBlob)} className="w-full max-w-md" />
                      <Button
                        type="button"
                        onClick={() => {
                          setAudioBlob(null)
                          setIsRecording(false)
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Gravar Novamente
                      </Button>
                    </div>
                  )}
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>Ou faça upload de um arquivo de áudio</p>
                  <Input
                    type="file"
                    accept="audio/*"
                    className="mt-2"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        setAudioBlob(file)
                      }
                    }}
                  />
                </div>
              </div>

              {/* Campo hidden para o tipo de input */}
              <input type="hidden" name="input_original" value={audioBlob ? "Arquivo de áudio enviado" : ""} />
            </TabsContent>
          </Tabs>

          <input type="hidden" name="input_tipo" value={inputMode} />

          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{state.error}</div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Prontuário criado com sucesso! Processando conteúdo...
            </div>
          )}

          <Button
            type="submit"
            disabled={
              (inputMode === "texto" && !document.querySelector<HTMLTextAreaElement>("#input_original")?.value) ||
              (inputMode === "audio" && !audioBlob)
            }
            className="w-full pluma-gradient text-white py-6 text-lg"
          >
            <FileText className="h-5 w-5 mr-2" />
            Criar Prontuário
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
