-- Libera leitura pública nas tabelas/views para o dashboard
GRANT SELECT ON v_oportunidades_relevantes TO anon, authenticated;
GRANT SELECT ON licitacoes TO anon, authenticated;
GRANT SELECT ON analises_ia TO anon, authenticated;
GRANT SELECT ON capag_cache TO anon, authenticated;
GRANT SELECT ON execucoes_bot TO anon, authenticated;
GRANT SELECT ON portais TO anon, authenticated;

-- Ativa RLS nas tabelas (boa prática)
ALTER TABLE licitacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE analises_ia ENABLE ROW LEVEL SECURITY;

-- Permite leitura pública (sem auth)
CREATE POLICY "leitura_publica_licitacoes" ON licitacoes FOR SELECT USING (true);
CREATE POLICY "leitura_publica_analises"   ON analises_ia FOR SELECT USING (true);
