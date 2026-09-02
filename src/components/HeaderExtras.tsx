import React from 'react'
import {
  Bell,
  Check,
  Clock,
  Sparkles,
  MessageCircle,
  Bike,
  User,
  Shield,
  LogOut,
  Mail,
  X,
  FileSpreadsheet,
  FileText,
  Download,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import type { Deal, Product, Customer, Transaction } from '@/services/store'

// Menu de Notificações
export function NotificationsDropdown({
  open,
  onClose,
  onNavigate,
}: {
  open: boolean
  onClose: () => void
  onNavigate: (page: any) => void
}) {
  if (!open) return null

  const notifications = [
    {
      id: 1,
      icon: MessageCircle,
      title: 'Nova mensagem de WhatsApp',
      desc: 'João Mendes: "Gostaria de agendar o test drive"',
      time: 'há 4 min',
      unread: true,
      action: () => onNavigate('whatsapp'),
    },
    {
      id: 2,
      icon: Bike,
      title: 'Alerta de Estoque Baixo',
      desc: 'Capacete Carbon One possui apenas 1 unidade restante.',
      time: 'há 18 min',
      unread: true,
      action: () => onNavigate('inventory'),
    },
    {
      id: 3,
      icon: Sparkles,
      title: 'Insight do ScooterPro AI',
      desc: '3 oportunidades quentes para fechar antes do fim do dia.',
      time: 'há 1 hora',
      unread: false,
      action: () => onNavigate('assistant'),
    },
  ]

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={onClose} />
      <div
        style={{
          position: 'absolute',
          top: 65,
          right: 180,
          width: 320,
          background: '#141417',
          border: '1px solid #28282c',
          borderRadius: 9,
          boxShadow: '0 10px 30px #00000088',
          zIndex: 50,
          overflow: 'hidden',
          animation: 'pageIn 0.2s ease-out',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid #222225',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <b style={{ fontSize: 12 }}>Notificações da Loja</b>
          <span
            style={{
              fontSize: 9,
              color: '#00d1ff',
              background: '#11252a',
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            2 novas
          </span>
        </div>

        <div style={{ maxHeight: 300, overflowY: 'auto' }}>
          {notifications.map((n) => {
            const Icon = n.icon
            return (
              <div
                key={n.id}
                onClick={() => {
                  n.action()
                  onClose()
                }}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #1f1f22',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                  cursor: 'pointer',
                  background: n.unread ? '#18181c' : 'transparent',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#11252a',
                    color: '#00d1ff',
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  <Icon size={14} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#eee' }}>{n.title}</div>
                  <div
                    style={{
                      fontSize: 10,
                      color: '#888',
                      marginTop: 2,
                      whiteSpace: 'normal',
                      lineHeight: 1.4,
                    }}
                  >
                    {n.desc}
                  </div>
                  <div style={{ fontSize: 8, color: '#666', marginTop: 4 }}>{n.time}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div
          style={{
            padding: '10px 16px',
            background: '#0e0e11',
            textAlign: 'center',
            borderTop: '1px solid #202024',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 0,
              color: '#00d1ff',
              fontSize: 10,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Marcar todas como lidas
          </button>
        </div>
      </div>
    </>
  )
}

// Modal do Perfil / Configurações do Usuário
export function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { toast } = useToast()
  const user = pb.authStore.record
  const [name, setName] = React.useState(user?.name || 'Kimberly Adapta')
  const [email] = React.useState(user?.email || 'kimberly@adapta.org')

  if (!open) return null

  return (
    <div className="product-modal">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="product-detail" style={{ maxWidth: 440 }}>
        <button type="button" onClick={onClose}>
          <X />
        </button>
        <span className="section-tag">CONTA & ACESSO</span>
        <h2>Meu Perfil</h2>
        <p>Gerencie suas credenciais e permissões na loja.</p>

        <div className="drawer-body" style={{ padding: '16px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <div className="avatar" style={{ width: 50, height: 50, fontSize: 16 }}>
              {name
                .split(' ')
                .map((x) => x[0])
                .join('')
                .slice(0, 2)}
            </div>
            <div>
              <b style={{ fontSize: 14 }}>{name}</b>
              <div style={{ fontSize: 11, color: '#00d1ff' }}>Administradora Executiva</div>
              <div style={{ fontSize: 10, color: '#666' }}>{email}</div>
            </div>
          </div>

          <label>
            Nome de exibição
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <label>
            E-mail de login
            <input
              type="email"
              disabled
              value={email}
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            />
          </label>

          <div
            style={{
              marginTop: 14,
              padding: 12,
              background: '#11181c',
              borderRadius: 7,
              border: '1px solid #1c363d',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 600, color: '#00d1ff' }}>Permissões Ativas</div>
            <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>
              Acesso total ao CRM, Catálogo, Fluxo Financeiro, WhatsApp e Parâmetros IA.
            </div>
          </div>

          <div
            className="drawer-foot"
            style={{
              padding: '16px 0 0',
              marginTop: 20,
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              className="outline-btn"
              style={{ color: '#ff6969', borderColor: '#4a2225' }}
              onClick={() => {
                onClose()
                pb.authStore.clear()
              }}
            >
              <LogOut size={13} /> Sair da conta
            </button>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                toast({
                  title: 'Perfil atualizado',
                  description: 'Informações salvas com sucesso.',
                })
                onClose()
              }}
            >
              Salvar Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal de Exportação de Relatório Executivo
export function ExportReportModal({
  open,
  onClose,
  deals,
  products,
  transactions,
  customers,
}: {
  open: boolean
  onClose: () => void
  deals: Deal[]
  products: Product[]
  transactions: Transaction[]
  customers: Customer[]
}) {
  const { toast } = useToast()
  const [format, setFormat] = React.useState<'csv' | 'json' | 'print'>('csv')

  if (!open) return null

  function handleExport() {
    if (format === 'csv') {
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [
          ['Tipo', 'Identificador', 'Descricao', 'Valor/Status', 'Data'].join(','),
          ...deals.map(
            (d) => `Negocio,${d.id},"${d.title.replace(/"/g, '""')}",${d.value},${d.created}`,
          ),
          ...transactions.map(
            (t) =>
              `Transacao,${t.id},"${(t.description || t.category).replace(/"/g, '""')}",${t.amount},${t.occurred_at}`,
          ),
          ...products.map(
            (p) =>
              `Produto,${p.sku},"${p.name.replace(/"/g, '""')}",Estoque: ${p.stock},${p.created}`,
          ),
          ...customers.map(
            (c) => `Cliente,${c.id},"${c.name.replace(/"/g, '""')}",${c.status},${c.created}`,
          ),
        ].join('\n')

      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute(
        'download',
        `relatorio_new_way_${new Date().toISOString().slice(0, 10)}.csv`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: 'Relatório exportado', description: 'Arquivo CSV baixado com sucesso.' })
    } else if (format === 'json') {
      const report = {
        exported_at: new Date().toISOString(),
        summary: {
          total_revenue: transactions
            .filter((t) => t.type === 'income')
            .reduce((s, t) => s + t.amount, 0),
          active_deals: deals.filter((d) => !['won', 'lost'].includes(d.stage)).length,
          total_customers: customers.length,
          total_products: products.length,
        },
        deals,
        transactions,
        products,
        customers,
      }
      const dataStr =
        'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2))
      const link = document.createElement('a')
      link.setAttribute('href', dataStr)
      link.setAttribute(
        'download',
        `relatorio_new_way_${new Date().toISOString().slice(0, 10)}.json`,
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({ title: 'Relatório exportado', description: 'Dados JSON baixados com sucesso.' })
    } else {
      window.print()
    }
    onClose()
  }

  return (
    <div className="product-modal">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="product-detail" style={{ maxWidth: 480 }}>
        <button type="button" onClick={onClose}>
          <X />
        </button>
        <span className="section-tag">EXPORTAÇÃO DE DADOS</span>
        <h2>Exportar Relatório</h2>
        <p>Gere um consolidado da operação da loja para análise.</p>

        <div className="drawer-body" style={{ padding: '16px 0 0' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 10,
              margin: '14px 0',
            }}
          >
            <button
              type="button"
              onClick={() => setFormat('csv')}
              style={{
                padding: '14px 8px',
                background: format === 'csv' ? '#11282d' : '#17171a',
                border: format === 'csv' ? '1px solid #00d1ff' : '1px solid #29292e',
                borderRadius: 8,
                color: format === 'csv' ? '#00d1ff' : '#aaa',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <FileSpreadsheet size={20} style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: 11, fontWeight: 700 }}>Planilha CSV</div>
              <div style={{ fontSize: 8, color: '#666' }}>Excel / Sheets</div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('json')}
              style={{
                padding: '14px 8px',
                background: format === 'json' ? '#11282d' : '#17171a',
                border: format === 'json' ? '1px solid #00d1ff' : '1px solid #29292e',
                borderRadius: 8,
                color: format === 'json' ? '#00d1ff' : '#aaa',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <FileText size={20} style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: 11, fontWeight: 700 }}>Dados JSON</div>
              <div style={{ fontSize: 8, color: '#666' }}>Sistemas / API</div>
            </button>

            <button
              type="button"
              onClick={() => setFormat('print')}
              style={{
                padding: '14px 8px',
                background: format === 'print' ? '#11282d' : '#17171a',
                border: format === 'print' ? '1px solid #00d1ff' : '1px solid #29292e',
                borderRadius: 8,
                color: format === 'print' ? '#00d1ff' : '#aaa',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <Download size={20} style={{ margin: '0 auto 6px' }} />
              <div style={{ fontSize: 11, fontWeight: 700 }}>Imprimir / PDF</div>
              <div style={{ fontSize: 8, color: '#666' }}>Documento A4</div>
            </button>
          </div>

          <div
            style={{
              background: '#101013',
              padding: 12,
              borderRadius: 7,
              border: '1px solid #222226',
            }}
          >
            <div style={{ fontSize: 10, color: '#777' }}>CONTEÚDO INCLUSO:</div>
            <div style={{ fontSize: 11, color: '#ccc', marginTop: 4 }}>
              • {deals.length} negócios do pipeline
              <br />• {customers.length} clientes e leads cadastrados
              <br />• {products.length} itens do estoque e catálogo
              <br />• {transactions.length} transações financeiras consolidadas
            </div>
          </div>

          <div className="drawer-foot" style={{ padding: '16px 0 0', marginTop: 20 }}>
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="button" className="primary-btn" onClick={handleExport}>
              <Download size={14} /> Confirmar & Baixar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
