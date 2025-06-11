-- Criar um bucket para armazenar os áudios dos prontuários
INSERT INTO storage.buckets (id, name, public)
VALUES ('prontuario-audios', 'prontuario-audios', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Remover políticas existentes se elas já existirem (para evitar erros de "already exists")
DROP POLICY IF EXISTS "Allow authenticated users to upload audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view their own audio" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own audio" ON storage.objects;

-- Política: Usuários autenticados podem fazer upload de áudios no bucket prontuario-audios
CREATE POLICY "Allow authenticated users to upload audio" ON storage.objects
  FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'prontuario-audios');

-- Política: Usuários autenticados podem visualizar e baixar seus próprios áudios
CREATE POLICY "Allow authenticated users to view their own audio" ON storage.objects
  FOR SELECT 
  TO authenticated
  USING (bucket_id = 'prontuario-audios' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política: Usuários autenticados podem deletar seus próprios áudios
CREATE POLICY "Allow authenticated users to delete their own audio" ON storage.objects
  FOR DELETE 
  TO authenticated
  USING (bucket_id = 'prontuario-audios' AND auth.uid()::text = (storage.foldername(name))[1]);
