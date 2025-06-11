-- Criar tabela de prontuários
CREATE TABLE IF NOT EXISTS prontuarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  paciente_nome TEXT NOT NULL,
  input_original TEXT,
  input_tipo TEXT CHECK (input_tipo IN ('texto', 'audio')) NOT NULL,
  audio_url TEXT, -- Adicionado para armazenar a URL do áudio
  conteudo_processado TEXT,
  status TEXT CHECK (status IN ('processando', 'concluido', 'erro')) DEFAULT 'processando',
  erro_mensagem TEXT,
  palavras_chave TEXT[],
  data_sessao DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE prontuarios ENABLE ROW LEVEL SECURITY;

-- Remover a política se ela já existir antes de criá-la
DROP POLICY IF EXISTS "Users can only see their own prontuarios" ON prontuarios;

-- Política: usuários só veem seus próprios prontuários
CREATE POLICY "Users can only see their own prontuarios" ON prontuarios
  FOR ALL USING (auth.uid() = user_id);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_prontuarios_user_id ON prontuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_prontuarios_paciente_nome ON prontuarios(paciente_nome);
CREATE INDEX IF NOT EXISTS idx_prontuarios_data_sessao ON prontuarios(data_sessao);
CREATE INDEX IF NOT EXISTS idx_prontuarios_created_at ON prontuarios(created_at DESC);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_prontuarios_updated_at') THEN
    CREATE TRIGGER update_prontuarios_updated_at
      BEFORE UPDATE ON prontuarios
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
