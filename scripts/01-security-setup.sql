-- Criar tabela de auditoria de segurança
CREATE TABLE IF NOT EXISTS security_audit (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  details JSONB,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de auditoria
ALTER TABLE security_audit ENABLE ROW LEVEL SECURITY;

-- Remover a política se ela já existir antes de criá-la
DROP POLICY IF EXISTS "Admin can view audit logs" ON security_audit;

-- Política: Apenas admins podem ver logs de auditoria
CREATE POLICY "Admin can view audit logs" ON security_audit
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

-- Função para limpar logs antigos (executar via cron)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM security_audit 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_security_audit_user_id ON security_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_created_at ON security_audit(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_severity ON security_audit(severity);
