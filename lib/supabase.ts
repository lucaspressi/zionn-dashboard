import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(url, key)

export type Oportunidade = {
  id: string
  portal: string
  titulo: string
  modalidade: string
  orgao: string
  cnpj: string
  municipio: string
  uf: string
  descricao: string
  valor_estimado: number | null
  situacao_id: number | null
  situacao_nome: string | null
  existe_resultado: boolean
  data_publicacao: string | null
  data_encerramento: string | null
  data_encerramento_real: string | null
  url_pncp: string | null
  capag: string | null
  capag_icf: string | null
  capag_ind1: string | null
  capag_ind2: string | null
  capag_ind3: string | null
  score: number
  relevante: boolean
  justificativa: string
  palavras_chave: string[]
  alertas: string[]
  // v2
  tem_pegadinha: boolean
  pegadinhas: string[]
  valor_por_item: number | null
  e_marcenaria: boolean | null
  material: string | null
  quantidade_itens: number | null
  recomendacao: 'PARTICIPAR' | 'AVALIAR' | 'IGNORAR' | null
  razao_recomendacao: string | null
  itens_detalhados: any[] | null
  arquivos: any[] | null
  versao: number
  dias_restantes: number | null
}

export type ConfigAnalise = {
  ufs_alvo: string[]
  score_minimo: number
  keywords_bot: string[]
}
