"use client"

import { useState } from "react"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Save, ArrowLeft, FileText, BookOpen, Plus } from "lucide-react"
import { createProntuario } from "@/lib/actions/prontuarios"

interface SalvarProntuarioProps {
  conteudoProcessado: string
  inputOriginal: string
  inputTipo: "texto" | "audio"
  audioUrl?: string
  onBack: () => void
  onSaved: () => void
  onNewProntuario?: () => void // Nova prop para criar novo prontuário
}

export default function SalvarProntuario({
  conteudoProcessado,
  inputOriginal,
  inputTipo,
  audioUrl,
  onBack,
  onSaved,
  onNewProntuario, // Nova prop
}: SalvarProntuarioProps) {
  const [state, formAction] = useActionState(createProntuario, null)
  const [editedContent, setEditedContent] = useState(conteudoProcessado)

  const handleSubmit = async (formData: FormData) => {
    formData.set("conteudo_processado", editedContent)
    formData.set("input_original", inputOriginal)
    formData.set("input_tipo", inputTipo)
    formData.set("status", "concluido")
    if (audioUrl) {
      formData.set("audio_url", audioUrl)
    }

    const result = await formAction(formData)
    if (result?.success) {
      // Não chama onSaved() imediatamente, deixa o usuário escolher o que fazer
    }
  }

  const handleViewLibrary = () => {
    onSaved() // Navega para a biblioteca
  }

  const handleNewProntuario = () => {
    if (onNewProntuario) {
      onNewProntuario() // Navega para criar novo prontuário
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          {!state?.success && (
            <Button onClick={onBack} variant="outline" size="sm" className="border-purple-200 hover:bg-purple-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="p-2 pluma-gradient rounded-lg shadow-lg">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {state?.success ? "Prontuário Salvo!" : "Salvar Prontuário"}
              </h1>
              <p className="text-gray-600">
                {state?.success ? "O que você gostaria de fazer agora?" : "Revise e complete as informações"}
              </p>
            </div>
          </div>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {/* Informações do Paciente */}
          <Card className="pluma-card border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
              <CardTitle className="text-purple-800">Informações da Sessão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paciente_nome" className="text-purple-700 font-medium">
                    Nome do Paciente *
                  </Label>
                  <Input
                    id="paciente_nome"
                    name="paciente_nome"
                    placeholder="Digite o nome do paciente"
                    required
                    disabled={state?.success} // Desabilita após salvar
                    className="border-purple-200 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_sessao" className="text-purple-700 font-medium">
                    Data da Sessão
                  </Label>
                  <Input
                    id="data_sessao"
                    name="data_sessao"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    disabled={state?.success} // Desabilita após salvar
                    className="border-purple-200 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo Processado */}
          <Card className="pluma-card border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
              <CardTitle className="text-purple-800">Conteúdo do Prontuário</CardTitle>
              <p className="text-sm text-purple-600">
                {state?.success
                  ? "Conteúdo salvo com sucesso"
                  : "Revise e edite o conteúdo processado conforme necessário"}
              </p>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                rows={15}
                disabled={state?.success} // Desabilita após salvar
                className="border-purple-200 focus:ring-purple-500 focus:border-purple-500 resize-none text-base leading-relaxed"
                placeholder="Conteúdo do prontuário..."
              />
            </CardContent>
          </Card>

          {/* Input Original */}
          <Card className="pluma-card border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl">
              <CardTitle className="text-sm font-medium text-purple-700">Conteúdo Original</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                <p className="text-sm text-purple-600 mb-2">
                  <strong>Tipo:</strong> {inputTipo === "texto" ? "Texto" : "Áudio"}
                </p>
                {inputTipo === "audio" && audioUrl ? (
                  <audio controls src={audioUrl} className="w-full max-w-md" />
                ) : (
                  <p className="text-sm text-gray-800">{inputOriginal}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mensagens */}
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{state.error}</div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              Prontuário salvo com sucesso!
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-4 justify-end">
            {!state?.success ? (
              // Botões antes de salvar
              <>
                <Button
                  type="button"
                  onClick={onBack}
                  variant="outline"
                  className="border-purple-200 hover:bg-purple-50"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="pluma-gradient text-white px-8 shadow-lg hover:shadow-xl">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Prontuário
                </Button>
              </>
            ) : (
              // Botões após salvar com sucesso
              <>
                <Button
                  type="button"
                  onClick={handleViewLibrary}
                  variant="outline"
                  className="border-purple-200 hover:bg-purple-50 text-purple-700"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Meus Prontuários
                </Button>
                <Button
                  type="button"
                  onClick={handleNewProntuario}
                  className="pluma-gradient text-white px-8 shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Prontuário
                </Button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
