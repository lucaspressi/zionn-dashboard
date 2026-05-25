'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { supabase, type Oportunidade } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import {
  RefreshCw, Settings, Search, ExternalLink, TrendingUp,
  Globe, BarChart3, Star, AlertTriangle, ChevronDown, ChevronUp,
  Zap, X, MapPin, DollarSign, Calendar, CheckCircle
} from 'lucide-react'

const DEFAULT_CONFIG = {
  ufs_alvo: ['SP', 'RJ', 'MG', 'ES', 'PR', 'SC'],
  score_minimo: 60,
}

const TODAS_UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

// ── Score helpers ──────────────────────────────────────────────────
function scoreStyle(score: number): string {
  if (score >= 80) return 'color:#34d399;background:#064e3b;border-color:#065f46'
  if (score >= 60) return 'color:#60a5fa;background:#1e3a5f;border-color:#1d4ed8'
  return 'color:#fbbf24;background:#451a03;border-color:#92400e'
}

function scoreBgStyle(score: number, pct: boolean = false): string {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : '#f59e0b'
  if (pct) return `background:${color};width:${score}%`
  return `background:${color}`
}

// ── CAPAG helpers ──────────────────────────────────────────────────
function capagStyle(capag: string | null): string {
  if (!capag) return 'color:#6b7280;background:#1f2937;border-color:#374151'
  const map: Record<string, string> = {
    A: 'color:#34d399;background:#064e3b;border-color:#065f46',
    B: 'color:#60a5fa;background:#1e3a5f;border-color:#1d4ed8',
    C: 'color:#fbbf24;background:#451a03;border-color:#92400e',
    D: 'color:#f87171;background:#450a0a;border-color:#991b1b',
  }
  return map[capag] || 'color:#6b7280;background:#1f2937;border-color:#374151'
}

// ── Componentes ────────────────────────────────────────────────────
function StatCard({ label, value, Icon, accent }: { label: string; value: string | number; Icon: any; accent: string }) {
  return (
    <div style={{ background: '#111827', border: `1px solid ${accent}33`, borderRadius: 12, padding: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <Icon size={15} style={{ color: accent, opacity: 0.7 }} />
      </div>
      <p style={{ fontSize: 24, fontWeight: 700, color: accent }}>{typeof value === 'number' ? value.toLocaleString('pt-BR') : value}</p>
    </div>
  )
}

function CardLicitacao({ item, expanded, onToggle }: { item: Oportunidade; expanded: boolean; onToggle: () => void }) {
  const urgente = item.dias_restantes !== null && item.dias_restantes <= 3 && item.dias_restantes >= 0

  return (
    <div style={{
      background: expanded ? '#111827' : '#0d1117',
      border: `1px solid ${expanded ? '#4f46e5' : '#1f2937'}`,
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'all 0.2s',
      marginBottom: 8,
    }}>
      {/* Header clicável */}
      <div
        onClick={onToggle}
        style={{ padding: '14px 16px', cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          {/* Coluna esquerda */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Badges linha */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, border: '1px solid', ...parseStyle(scoreStyle(item.score)) }}>
                ⭐ {item.score}
              </span>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#1f2937', color: '#9ca3af', border: '1px solid #374151', fontWeight: 600 }}>
                {item.uf}
              </span>
              {item.modalidade && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#1f2937', color: '#6b7280', border: '1px solid #374151' }}>
                  {item.modalidade.replace('Pregão - ', '')}
                </span>
              )}
              {urgente && (
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#450a0a', color: '#f87171', border: '1px solid #991b1b', fontWeight: 600 }}>
                  ⚠️ Urgente
                </span>
              )}
            </div>
            {/* Título */}
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#f3f4f6', lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.titulo}
            </p>
            {/* Órgão */}
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {item.orgao}
            </p>
          </div>

          {/* Coluna direita */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
            {/* CAPAG */}
            <div style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, ...parseStyle(capagStyle(item.capag)) }}>
              {item.capag || '—'}
            </div>
            {/* Valor */}
            {item.valor_estimado && (
              <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>
                {formatCurrency(item.valor_estimado)}
              </span>
            )}
            {/* Chevron */}
            {expanded ? <ChevronUp size={14} style={{ color: '#4b5563' }} /> : <ChevronDown size={14} style={{ color: '#4b5563' }} />}
          </div>
        </div>

        {/* Score bar */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 4, background: '#1f2937', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 4, transition: 'width 0.3s', ...parseStyle(scoreBgStyle(item.score, true)) }} />
          </div>
        </div>
      </div>

      {/* Detalhes expandidos */}
      {expanded && (
        <div style={{ borderTop: '1px solid #1f2937', padding: 16 }}>
          {/* Box IA */}
          <div style={{ background: '#1e1b4b', border: '1px solid #312e81', borderRadius: 10, padding: 12, marginBottom: 16 }}>
            <p style={{ margin: '0 0 6px', fontSize: 12, fontWeight: 600, color: '#818cf8' }}>🤖 Análise da IA</p>
            <p style={{ margin: 0, fontSize: 13, color: '#c7d2fe', lineHeight: 1.5 }}>{item.justificativa}</p>
            {item.palavras_chave?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                {item.palavras_chave.map(p => (
                  <span key={p} style={{ fontSize: 11, background: '#312e81', color: '#a5b4fc', padding: '2px 8px', borderRadius: 6 }}>#{p}</span>
                ))}
              </div>
            )}
          </div>

          {/* Objeto */}
          {item.descricao && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 600, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Objeto</p>
              <p style={{ margin: 0, fontSize: 13, color: '#d1d5db', lineHeight: 1.6 }}>{item.descricao}</p>
            </div>
          )}

          {/* Grid info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
            {[
              { label: 'Município', value: `${item.municipio}/${item.uf}` },
              { label: 'Encerramento', value: formatDate(item.data_encerramento_real || item.data_encerramento), urgente },
              { label: 'Valor estimado', value: formatCurrency(item.valor_estimado), green: true },
              { label: 'CAPAG', value: item.capag ? `${item.capag} ${item.capag_icf || ''}` : '—' },
            ].map(({ label, value, urgente: u, green }) => (
              <div key={label}>
                <p style={{ margin: '0 0 2px', fontSize: 11, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: u ? '#f87171' : green ? '#34d399' : '#d1d5db' }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Alertas */}
          {item.alertas?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {item.alertas.map(a => (
                <span key={a} style={{ fontSize: 11, background: '#451a03', border: '1px solid #92400e', color: '#fbbf24', padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <AlertTriangle size={10} /> {a}
                </span>
              ))}
            </div>
          )}

          {/* Ação */}
          {item.url_pncp && (
            <a href={item.url_pncp} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, background: '#4f46e5', color: '#fff', padding: '8px 16px', borderRadius: 8, textDecoration: 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background = '#4338ca')}
              onMouseLeave={e => (e.currentTarget.style.background = '#4f46e5')}
            >
              <ExternalLink size={13} /> Ver no PNCP
            </a>
          )}
        </div>
      )}
    </div>
  )
}

// ── Painel config ──────────────────────────────────────────────────
function PainelConfig({ config, onChange, onClose }: { config: typeof DEFAULT_CONFIG; onChange: (c: typeof DEFAULT_CONFIG) => void; onClose: () => void }) {
  const [local, setLocal] = useState({ ...config })

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#111827', border: '1px solid #374151', borderRadius: 16, width: '100%', maxWidth: 480, boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1f2937' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Settings size={16} style={{ color: '#818cf8' }} />
            <span style={{ fontWeight: 600, color: '#f3f4f6' }}>Configurações</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 20 }}>
          {/* Score mínimo */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#d1d5db', marginBottom: 8 }}>
              Score mínimo: <span style={{ color: '#818cf8', fontWeight: 700 }}>{local.score_minimo}</span>
            </label>
            <input type="range" min={0} max={100} step={5} value={local.score_minimo}
              onChange={e => setLocal({ ...local, score_minimo: +e.target.value })}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#4b5563', marginTop: 4 }}>
              <span>0 — tudo</span><span>60 — recomendado</span><span>80 — certeiros</span>
            </div>
          </div>

          {/* UFs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: '#d1d5db' }}>Estados ({local.ufs_alvo.length})</label>
              <button onClick={() => setLocal({ ...local, ufs_alvo: local.ufs_alvo.length === TODAS_UFS.length ? ['SP','RJ','MG','ES','PR','SC'] : [...TODAS_UFS] })}
                style={{ fontSize: 12, color: '#818cf8', background: 'none', border: 'none', cursor: 'pointer' }}>
                {local.ufs_alvo.length === TODAS_UFS.length ? 'Só região' : 'Todos'}
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {TODAS_UFS.map(uf => {
                const sel = local.ufs_alvo.includes(uf)
                return (
                  <button key={uf} onClick={() => setLocal({ ...local, ufs_alvo: sel ? local.ufs_alvo.filter(u => u !== uf) : [...local.ufs_alvo, uf] })}
                    style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s', background: sel ? '#4f46e5' : '#1f2937', color: sel ? '#fff' : '#6b7280', borderColor: sel ? '#4338ca' : '#374151' }}>
                    {uf}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderTop: '1px solid #1f2937' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '9px 0', borderRadius: 8, border: '1px solid #374151', background: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: 13 }}>
            Cancelar
          </button>
          <button onClick={() => { onChange(local); onClose() }}
            style={{ flex: 1, padding: '9px 0', borderRadius: 8, background: '#4f46e5', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
            Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Util: converte "key:val;key2:val2" em objeto style ─────────────
function parseStyle(s: string): React.CSSProperties {
  const obj: any = {}
  s.split(';').forEach(p => {
    const [k, v] = p.split(':')
    if (k && v) {
      const camel = k.trim().replace(/-([a-z])/g, (_, c) => c.toUpperCase())
      obj[camel] = v.trim()
    }
  })
  return obj
}

// ── Página principal ───────────────────────────────────────────────
export default function Dashboard() {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [filtroUF, setFiltroUF] = useState('')
  const [filtroCapag, setFiltroCapag] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [stats, setStats] = useState({ total: 0, analisadas: 0, relevantes: 0 })

  const fetchDados = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('v_oportunidades_relevantes')
        .select('*')
        .gte('score', config.score_minimo)
        .in('uf', config.ufs_alvo)
        .order('score', { ascending: false })
        .limit(300)
      if (data) { setOportunidades(data as Oportunidade[]); setLastUpdate(new Date()) }

      const [{ count: t }, { count: a }, { count: r }] = await Promise.all([
        supabase.from('licitacoes').select('*', { count: 'exact', head: true }),
        supabase.from('analises_ia').select('*', { count: 'exact', head: true }),
        supabase.from('analises_ia').select('*', { count: 'exact', head: true }).eq('relevante', true),
      ])
      setStats({ total: t || 0, analisadas: a || 0, relevantes: r || 0 })
    } finally { setLoading(false) }
  }, [config])

  useEffect(() => {
    fetchDados()
    const ch = supabase.channel('analises')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'analises_ia' }, fetchDados)
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [fetchDados])

  const filtradas = oportunidades.filter(o => {
    const q = search.toLowerCase()
    return (!q || [o.titulo, o.orgao, o.descricao, o.municipio].some(t => t?.toLowerCase().includes(q)))
      && (!filtroUF || o.uf === filtroUF)
      && (!filtroCapag || o.capag === filtroCapag)
  })

  const ufs = [...new Set(oportunidades.map(o => o.uf))].sort()
  const capags = [...new Set(oportunidades.map(o => o.capag).filter(Boolean))].sort()

  return (
    <div style={{ minHeight: '100vh', background: '#030712' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(3,7,18,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #111827' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={16} color="#fff" />
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: '#f9fafb', lineHeight: 1.2 }}>Zionn Licitações</p>
              <p style={{ margin: 0, fontSize: 11, color: '#4b5563' }}>Móveis Soltos · {config.ufs_alvo.join('/')} </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lastUpdate && (
              <span style={{ fontSize: 11, color: '#374151' }}>
                {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button onClick={fetchDados} disabled={loading}
              style={{ padding: 7, borderRadius: 8, background: '#111827', border: '1px solid #1f2937', color: '#6b7280', cursor: 'pointer', display: 'flex' }}>
              <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            </button>
            <button onClick={() => setShowConfig(true)}
              style={{ padding: 7, borderRadius: 8, background: '#111827', border: '1px solid #1f2937', color: '#6b7280', cursor: 'pointer', display: 'flex' }}>
              <Settings size={14} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#052e16', border: '1px solid #14532d', padding: '5px 10px', borderRadius: 8 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 12, color: '#34d399', fontWeight: 600 }}>Live</span>
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          <StatCard label="No banco" value={stats.total} Icon={Globe} accent="#60a5fa" />
          <StatCard label="Analisadas" value={stats.analisadas} Icon={BarChart3} accent="#818cf8" />
          <StatCard label="Relevantes" value={stats.relevantes} Icon={Star} accent="#fbbf24" />
          <StatCard label="Exibindo" value={filtradas.length} Icon={TrendingUp} accent="#34d399" />
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar título, órgão, cidade..."
              style={{ width: '100%', background: '#0d1117', border: '1px solid #1f2937', borderRadius: 8, padding: '8px 10px 8px 30px', fontSize: 13, color: '#d1d5db', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {[
            { value: filtroUF, onChange: setFiltroUF, options: ufs, placeholder: 'Todos estados' },
            { value: filtroCapag, onChange: setFiltroCapag, options: capags as string[], placeholder: 'CAPAG: todos' },
          ].map(({ value, onChange, options, placeholder }) => (
            <select key={placeholder} value={value} onChange={e => onChange(e.target.value)}
              style={{ background: '#0d1117', border: '1px solid #1f2937', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#d1d5db', outline: 'none' }}>
              <option value="">{placeholder}</option>
              {options.map(o => <option key={o} value={o}>{placeholder.includes('CAPAG') ? `CAPAG ${o}` : o}</option>)}
            </select>
          ))}
          {(search || filtroUF || filtroCapag) && (
            <button onClick={() => { setSearch(''); setFiltroUF(''); setFiltroCapag('') }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', borderRadius: 8, background: '#1f2937', border: '1px solid #374151', color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>
              <X size={12} /> Limpar
            </button>
          )}
        </div>

        {/* Lista */}
        {loading ? (
          <div>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ height: 88, background: '#0d1117', borderRadius: 12, border: '1px solid #111827', marginBottom: 8, opacity: 0.6 }} />
            ))}
          </div>
        ) : filtradas.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px', color: '#374151' }}>
            <Search size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: 16, fontWeight: 500 }}>Nenhuma oportunidade encontrada</p>
            <p style={{ margin: '4px 0 0', fontSize: 13 }}>Ajuste os filtros ou aguarde a próxima coleta</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 12, color: '#374151', marginBottom: 10 }}>
              {filtradas.length} oportunidade{filtradas.length !== 1 ? 's' : ''}
            </p>
            {filtradas.map(item => (
              <CardLicitacao
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId(expandedId === item.id ? null : item.id)}
              />
            ))}
          </div>
        )}
      </main>

      {showConfig && (
        <PainelConfig
          config={config}
          onChange={c => { setConfig(c); setTimeout(fetchDados, 100) }}
          onClose={() => setShowConfig(false)}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        input:focus { border-color: #4f46e5 !important; }
        select option { background: #111827; }
      `}</style>
    </div>
  )
}
