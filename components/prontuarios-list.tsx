"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Calendar, User, Eye, Edit, Loader2 } from "lucide-react"
import Link from "next/link"

interface Prontuario {
  id: string
  paciente_nome: string
  input_original: string
  input_tipo: "texto" | "audio"
  audio_url?: string
  conteudo_processado?: string
  status: "processando" | "concluido" | "erro"
  erro_mensagem?: string
  palavras_chave?: string[]
  data_sessao: string
  created_at: string
  updated_at: string
}

export default function ProntuariosList() {
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProntuarios() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("Usuário não autenticado")
          setLoading(false)
          return
        }

        const { data, error: fetchError } = await supabase
          .from("prontuarios")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (fetchError) {
          console.error("Erro ao buscar prontuários:", fetchError)
          setError("Erro ao carregar prontuários")
        } else {
          setProntuarios(data || [])
        }
      } catch (err) {
        console.error("Erro geral:", err)
        setError("Erro ao carregar prontuários")
      } finally {
        setLoading(false)
      }
    }

    fetchProntuarios()
  }, [])

  if (loading) {
    return (
      <Card className="pluma-card">
        <CardContent className="p-6 text-center">
          <Loader2 className="h-8 w-8 text-purple-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando prontuários...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="pluma-card">
        <CardContent className="p-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!prontuarios || prontuarios.length === 0) {
    return (
      <Card className="pluma-card">
        <CardContent className="p-6 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum prontuário encontrado</h3>
          <p className="text-gray-600">Crie seu primeiro prontuário usando o formulário acima.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Biblioteca de Prontuários</h2>
      <div className="grid gap-4">
        {prontuarios.map((prontuario) => (
          <Card key={prontuario.id} className="pluma-card">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{prontuario.paciente_nome}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(prontuario.data_sessao).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {prontuario.status === "processando" && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Processando
                    </Badge>
                  )}
                  {prontuario.status === "concluido" && (
                    <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                  )}
                  {prontuario.status === "erro" && <Badge variant="destructive">Erro</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {prontuario.conteudo_processado && (
                  <p className="text-gray-700 line-clamp-3">{prontuario.conteudo_processado.substring(0, 150)}...</p>
                )}

                {prontuario.palavras_chave && prontuario.palavras_chave.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {prontuario.palavras_chave.slice(0, 3).map((palavra, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {palavra}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/prontuario/${prontuario.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/prontuario/${prontuario.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
