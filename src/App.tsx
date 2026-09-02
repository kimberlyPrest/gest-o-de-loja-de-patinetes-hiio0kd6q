import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BadgeDollarSign,
  Bell,
  Bike,
  Bot,
  Box,
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Command,
  CreditCard,
  FileText,
  Headphones,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageCircle,
  Mic,
  MoreHorizontal,
  PackagePlus,
  Paperclip,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  WalletCards,
  X,
  Zap,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { useToast } from '@/hooks/use-toast'
import { Toaster } from '@/components/ui/toaster'
import {
  askScooterPro,
  createFollowup,
  listConversations,
  listCustomers,
  listDeals,
  listFollowups,
  listInteractions,
  listMessages,
  listProducts,
  listTransactions,
  sendWhatsApp,
  updateDeal,
  updateDealStage,
  type Conversation,
  type Customer,
  type Deal,
  type FollowUp,
  type Interaction,
  type Product,
  type Transaction,
  type WhatsAppMessage,
} from '@/services/store'

type Page =
  | 'dashboard'
  | 'pipeline'
  | 'whatsapp'
  | 'customers'
  | 'inventory'
  | 'finance'
  | 'followups'
  | 'assistant'
const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const date = (v?: string) =>
  v
    ? new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(v))
    : '—'
const daysAgo = (v?: string) =>
  v ? Math.max(0, Math.floor((Date.now() - new Date(v).getTime()) / 86400000)) : 0
const stages: { id: Deal['stage']; label: string; dot: string }[] = [
  { id: 'new', label: 'Novo Lead', dot: '#00D1FF' },
  { id: 'contact', label: 'Contato Inicial', dot: '#8B7CFF' },
  { id: 'drive', label: 'Test Drive Agendado', dot: '#FFB547' },
  { id: 'negotiation', label: 'Negociação', dot: '#E56BFF' },
  { id: 'won', label: 'Ganho / Perdido', dot: '#44D492' },
]
const nav = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['pipeline', 'Pipeline', Activity],
  ['whatsapp', 'WhatsApp', MessageCircle],
  ['customers', 'Clientes', Users],
  ['inventory', 'Estoque', Box],
  ['finance', 'Financeiro', WalletCards],
  ['followups', 'Cadências', CalendarClock],
  ['assistant', 'Assistente IA', Bot],
] as const

function Login() {
  const [mode, setMode] = useState<'login' | 'reset'>('login')
  const [email, setEmail] = useState('kimberly@adapta.org')
  const [password, setPassword] = useState('Skip@Pass')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    try {
      if (mode === 'reset') {
        await pb.collection('users').requestPasswordReset(email)
        setMessage('Link de recuperação enviado. Verifique seu e-mail.')
      } else await pb.collection('users').authWithPassword(email, password)
    } catch {
      setMessage(
        mode === 'login' ? 'E-mail ou senha inválidos.' : 'Não foi possível enviar o link.',
      )
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="login-page">
      <div className="login-art">
        <div className="login-brand">
          <div className="brand-mark">
            <Zap size={19} />
          </div>
          <b>NEW WAY</b>
          <span>MANAGEMENT</span>
        </div>
        <div className="hero-copy">
          <span className="eyebrow">MOBILIDADE. PERFORMANCE. CONTROLE.</span>
          <h1>
            O futuro da sua loja,
            <br />
            <em>em movimento.</em>
          </h1>
          <p>Gestão inteligente para uma nova era da mobilidade elétrica.</p>
        </div>
        <div className="orb orb-a" />
        <div className="orb orb-b" />
      </div>
      <div className="login-panel">
        <form onSubmit={submit} className="login-card">
          <div className="mobile-logo">
            <Zap /> NEW WAY
          </div>
          <span className="section-tag">ÁREA DA EQUIPE</span>
          <h2>{mode === 'login' ? 'Bem-vindo de volta' : 'Recuperar acesso'}</h2>
          <p>
            {mode === 'login'
              ? 'Acesse o cockpit de gestão da sua loja.'
              : 'Enviaremos um link seguro para seu e-mail.'}
          </p>
          <label>
            E-mail corporativo
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
              placeholder="nome@loja.com"
            />
          </label>
          {mode === 'login' && (
            <label>
              Senha
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                required
              />
            </label>
          )}
          {message && <div className="form-message">{message}</div>}
          <button className="primary-btn auth-btn" disabled={loading}>
            {loading ? (
              <Loader2 className="spin" />
            ) : mode === 'login' ? (
              <>
                Entrar <ChevronRight />
              </>
            ) : (
              'Enviar link'
            )}
          </button>
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setMode(mode === 'login' ? 'reset' : 'login')
              setMessage('')
            }}
          >
            {mode === 'login' ? 'Esqueci minha senha' : 'Voltar ao login'}
          </button>
          <div className="security">
            <ShieldCheck /> Acesso protegido e criptografado
          </div>
        </form>
      </div>
    </div>
  )
}

function Shell() {
  const [page, setPage] = useState<Page>('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [search, setSearch] = useState('')
  const [deals, setDeals] = useState<Deal[]>([]),
    [customers, setCustomers] = useState<Customer[]>([]),
    [products, setProducts] = useState<Product[]>([]),
    [conversations, setConversations] = useState<Conversation[]>([]),
    [transactions, setTransactions] = useState<Transaction[]>([]),
    [followups, setFollowups] = useState<FollowUp[]>([])
  const load = useCallback(async () => {
    const [d, c, p, w, t, f] = await Promise.all([
      listDeals(),
      listCustomers(),
      listProducts(),
      listConversations(),
      listTransactions(),
      listFollowups(),
    ])
    setDeals(d)
    setCustomers(c)
    setProducts(p)
    setConversations(w)
    setTransactions(t)
    setFollowups(f)
  }, [])
  useEffect(() => {
    load().catch(console.error)
  }, [load])
  useRealtime<Deal>('deals', load)
  useRealtime<WhatsAppMessage>('whatsapp_messages', load)
  useRealtime<Conversation>('whatsapp_conversations', load)
  const go = (p: Page) => {
    setPage(p)
    setMobileNav(false)
  }
  const data = {
    deals,
    setDeals,
    customers,
    products,
    conversations,
    transactions,
    followups,
    reload: load,
    go,
  }
  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileNav ? 'open' : ''}`}>
        <div className="side-logo">
          <div className="brand-mark">
            <Zap size={18} />
          </div>
          <div>
            <b>NEW WAY</b>
            <span>MANAGEMENT</span>
          </div>
          <button onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft />
          </button>
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button key={id} className={page === id ? 'active' : ''} onClick={() => go(id)}>
              <Icon />
              <span>{label}</span>
              {id === 'whatsapp' && conversations.reduce((s, c) => s + c.unread, 0) > 0 && (
                <i>{conversations.reduce((s, c) => s + c.unread, 0)}</i>
              )}
            </button>
          ))}
        </nav>
        <div className="store-status">
          <div className="status-icon">
            <ShoppingBag />
          </div>
          <div>
            <span>STATUS DA LOJA</span>
            <b>
              <i /> Operação normal
            </b>
          </div>
        </div>
      </aside>
      <header>
        <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)}>
          <Menu />
        </button>
        <div className="global-search">
          <Search />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar clientes, negócios, produtos..."
          />
          <kbd>
            <Command /> K
          </kbd>
        </div>
        <div className="header-actions">
          <button className="icon-btn">
            <Bell />
            <i />
          </button>
          <div className="profile">
            <div className="avatar">KA</div>
            <div>
              <b>Kimberly</b>
              <span>Administradora</span>
            </div>
            <ChevronRight />
          </div>
          <button className="icon-btn logout" onClick={() => pb.authStore.clear()}>
            <LogOut />
          </button>
        </div>
      </header>
      <main key={page} className="page-enter">
        {page === 'dashboard' && <Dashboard {...data} />}{' '}
        {page === 'pipeline' && <Pipeline {...data} />}{' '}
        {page === 'whatsapp' && <WhatsApp {...data} />}{' '}
        {page === 'customers' && <Customers customers={customers} />}{' '}
        {page === 'inventory' && <Inventory products={products} />}{' '}
        {page === 'finance' && <Finance transactions={transactions} />}{' '}
        {page === 'followups' && <FollowUps items={followups} />}{' '}
        {page === 'assistant' && <Assistant />}
      </main>
      <div className="bottom-nav">
        {nav.slice(0, 5).map(([id, label, Icon]) => (
          <button className={page === id ? 'active' : ''} onClick={() => go(id)} key={id}>
            <Icon />
            <span>{label}</span>
          </button>
        ))}
      </div>
      {mobileNav && <div className="scrim" onClick={() => setMobileNav(false)} />}
      <Toaster />
    </div>
  )
}

type Data = {
  deals: Deal[]
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>
  customers: Customer[]
  products: Product[]
  conversations: Conversation[]
  transactions: Transaction[]
  followups: FollowUp[]
  reload: () => Promise<void>
  go: (p: Page) => void
}
function PageTitle({
  tag,
  title,
  desc,
  action,
}: {
  tag: string
  title: string
  desc: string
  action?: React.ReactNode
}) {
  return (
    <div className="page-title">
      <div>
        <span className="section-tag">{tag}</span>
        <h1>{title}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  )
}
function Dashboard({ deals, products, transactions, customers, go }: Data) {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    active = deals.filter((d) => !['won', 'lost'].includes(d.stage)).length,
    low = products.filter((p) => p.stock <= 2).length
  const bars = [32, 38, 29, 48, 42, 55, 51, 64, 59, 72, 68, 85, 78, 91, 88, 97]
  return (
    <>
      <PageTitle
        tag="VISÃO EXECUTIVA"
        title="Bom dia, Kimberly."
        desc="Aqui está o pulso da sua operação hoje."
        action={
          <button className="outline-btn">
            <FileText /> Exportar relatório
          </button>
        }
      />
      <div className="kpi-grid">
        <Kpi
          icon={CircleDollarSign}
          label="VENDAS NO MÊS"
          value={money.format(income)}
          delta="+18,4%"
        />
        <Kpi icon={Users} label="LEADS NO PIPELINE" value={String(active)} delta="+3 esta semana" />
        <Kpi
          icon={Box}
          label="ALERTA DE ESTOQUE"
          value={`${low} itens`}
          delta="Requer atenção"
          danger
        />
        <Kpi icon={TrendingUp} label="CRESCIMENTO" value="+24,8%" delta="vs. mês anterior" />
      </div>
      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <span>RECEITA</span>
              <h3>Performance de vendas</h3>
            </div>
            <div className="legend">
              <i /> Últimos 30 dias
            </div>
          </div>
          <div className="chart">
            <div className="y-axis">
              <span>20k</span>
              <span>15k</span>
              <span>10k</span>
              <span>5k</span>
              <span>0</span>
            </div>
            <div className="bars">
              {bars.map((h, i) => (
                <div key={i} style={{ height: `${h}%` }}>
                  <i />
                </div>
              ))}
            </div>
          </div>
          <div className="chart-foot">
            <b>{money.format(income)}</b>
            <span>Receita consolidada no período</span>
          </div>
        </section>
        <section className="panel activity-panel">
          <div className="panel-head">
            <div>
              <span>TEMPO REAL</span>
              <h3>Atividade recente</h3>
            </div>
            <button>
              <MoreHorizontal />
            </button>
          </div>
          <div className="timeline">
            <Timeline
              icon={MessageCircle}
              text={
                <>
                  <b>João Mendes</b> enviou uma mensagem
                </>
              }
              time="há 4 min"
            />
            <Timeline
              icon={BadgeDollarSign}
              text={
                <>
                  Negócio <b>Explorer Premium</b> foi ganho
                </>
              }
              time="há 35 min"
              green
            />
            <Timeline
              icon={Bike}
              text={
                <>
                  <b>Marina Costa</b> confirmou test drive
                </>
              }
              time="há 1h"
            />
            <Timeline
              icon={UserPlus}
              text={
                <>
                  Novo lead <b>Alex Ribeiro</b> adicionado
                </>
              }
              time="há 3h"
            />
          </div>
        </section>
      </div>
      <section className="quick-actions">
        <div>
          <span className="section-tag">ATALHOS</span>
          <h3>Ações rápidas</h3>
        </div>
        <div>
          <button onClick={() => go('pipeline')}>
            <span>
              <CreditCard />
            </span>
            <b>Nova venda</b>
            <small>Iniciar negociação</small>
            <ChevronRight />
          </button>
          <button onClick={() => go('customers')}>
            <span>
              <UserPlus />
            </span>
            <b>Adicionar cliente</b>
            <small>Novo lead ou cliente</small>
            <ChevronRight />
          </button>
          <button onClick={() => go('inventory')}>
            <span>
              <PackagePlus />
            </span>
            <b>Novo produto</b>
            <small>Atualizar catálogo</small>
            <ChevronRight />
          </button>
        </div>
      </section>
      <div className="customer-strip">
        <span>BASE DE RELACIONAMENTO</span>
        <b>{customers.length} perfis ativos no CRM</b>
        <button onClick={() => go('customers')}>
          Ver clientes <ChevronRight />
        </button>
      </div>
    </>
  )
}
function Kpi({
  icon: Icon,
  label,
  value,
  delta,
  danger,
}: {
  icon: typeof Activity
  label: string
  value: string
  delta: string
  danger?: boolean
}) {
  return (
    <div className={`kpi ${danger ? 'danger' : ''}`}>
      <div className="kpi-top">
        <span>
          <Icon />
        </span>
        <i>
          <TrendingUp /> {delta}
        </i>
      </div>
      <p>{label}</p>
      <h2>{value}</h2>
      <div className="kpi-line" />
    </div>
  )
}
function Timeline({
  icon: Icon,
  text,
  time,
  green,
}: {
  icon: typeof Activity
  text: React.ReactNode
  time: string
  green?: boolean
}) {
  return (
    <div className="timeline-item">
      <span className={green ? 'green' : ''}>
        <Icon />
      </span>
      <div>
        <p>{text}</p>
        <small>{time}</small>
      </div>
    </div>
  )
}
function Pipeline({ deals, setDeals, reload }: Data) {
  const [selected, setSelected] = useState<Deal | null>(null),
    [drag, setDrag] = useState<string | null>(null)
  async function move(id: string, stage: Deal['stage']) {
    const old = deals
    setDeals((d) => d.map((x) => (x.id === id ? { ...x, stage } : x)))
    try {
      await updateDealStage(id, stage)
    } catch {
      setDeals(old)
    }
  }
  return (
    <>
      <PageTitle
        tag="CRM · PIPELINE"
        title="Pipeline de vendas"
        desc={`${deals.filter((d) => !['won', 'lost'].includes(d.stage)).length} oportunidades ativas · ${money.format(deals.reduce((s, d) => s + d.value, 0))} em potencial`}
        action={
          <button className="primary-btn">
            <Plus /> Novo negócio
          </button>
        }
      />
      <div className="pipeline-toolbar">
        <div>
          <button className="active">Todos os negócios</button>
          <button>Meus negócios</button>
        </div>
        <span>
          <span className="live-dot" /> Sincronizado em tempo real
        </span>
      </div>
      <div className="kanban">
        {stages.map((stage) => {
          const rows = deals.filter((d) =>
            stage.id === 'won' ? ['won', 'lost'].includes(d.stage) : d.stage === stage.id,
          )
          return (
            <div
              className="kanban-col"
              key={stage.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (drag) move(drag, stage.id)
                setDrag(null)
              }}
            >
              <div className="kanban-head">
                <div>
                  <i style={{ background: stage.dot }} />
                  {stage.label}
                  <b>{rows.length}</b>
                </div>
                <span>{money.format(rows.reduce((s, d) => s + d.value, 0))}</span>
              </div>
              <div className="kanban-list">
                {rows.map((d) => (
                  <div
                    draggable
                    onDragStart={() => setDrag(d.id)}
                    onDragEnd={() => setDrag(null)}
                    onClick={() => setSelected(d)}
                    className={`deal-card ${drag === d.id ? 'dragging' : ''}`}
                    key={d.id}
                  >
                    <div className="deal-top">
                      <span className={`urgency u${Math.min(3, daysAgo(d.last_contact))}`} />
                      <MoreHorizontal />
                    </div>
                    <small>{d.title}</small>
                    <h4>{d.expand?.customer?.name || 'Cliente'}</h4>
                    <b>{money.format(d.value)}</b>
                    <div className="deal-foot">
                      <span>
                        <Clock3 /> {daysAgo(d.last_contact)} dias sem contato
                      </span>
                      <div className="mini-avatar">
                        {(d.expand?.customer?.name || 'NW')
                          .split(' ')
                          .map((x) => x[0])
                          .join('')
                          .slice(0, 2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      {selected && (
        <DealDrawer
          deal={selected}
          onClose={() => setSelected(null)}
          onSaved={() => {
            reload()
            setSelected(null)
          }}
        />
      )}
    </>
  )
}
function DealDrawer({
  deal,
  onClose,
  onSaved,
}: {
  deal: Deal
  onClose: () => void
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [notes, setNotes] = useState(deal.notes || ''),
    [when, setWhen] = useState(''),
    [history, setHistory] = useState<Interaction[]>([])
  useEffect(() => {
    listInteractions(deal.customer)
      .then(setHistory)
      .catch(() => {})
  }, [deal.customer])
  async function save() {
    await updateDeal(deal.id, { notes })
    if (when)
      await createFollowup({
        customer: deal.customer,
        deal: deal.id,
        title: 'Follow-up de negociação',
        channel: 'whatsapp',
        due_at: new Date(when).toISOString(),
        status: 'pending',
        owner: pb.authStore.record?.id,
      })
    toast({ title: 'Negócio atualizado', description: 'Notas e cadência foram salvas.' })
    onSaved()
  }
  return (
    <div className="drawer-wrap">
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer-head">
          <div>
            <span className="section-tag">DETALHES DO NEGÓCIO</span>
            <h2>{deal.expand?.customer?.name}</h2>
            <p>
              {deal.title} · {money.format(deal.value)}
            </p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="drawer-body">
          <label>
            Estágio
            <select
              value={deal.stage}
              onChange={(e) => updateDealStage(deal.id, e.target.value as Deal['stage'])}
            >
              {stages.map((s) => (
                <option value={s.id} key={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <div className="drawer-section">
            <h3>Histórico completo</h3>
            {history.length ? (
              history.map((h) => (
                <div className="history-row" key={h.id}>
                  <span>
                    <MessageCircle />
                  </span>
                  <div>
                    <b>{h.kind}</b>
                    <p>{h.content}</p>
                    <small>{date(h.occurred_at)}</small>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">Nenhuma interação registrada.</p>
            )}
          </div>
          <label>
            Notas
            <textarea
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione contexto para a equipe..."
            />
          </label>
          <div className="drawer-section">
            <h3>Cadência de follow-up</h3>
            <label>
              Próximo contato
              <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
            </label>
            <div className="cadence-options">
              <button className="active">WhatsApp</button>
              <button>Ligação</button>
              <button>E-mail</button>
            </div>
          </div>
        </div>
        <div className="drawer-foot">
          <button className="outline-btn" onClick={onClose}>
            Cancelar
          </button>
          <button className="primary-btn" onClick={save}>
            <Check /> Salvar alterações
          </button>
        </div>
      </aside>
    </div>
  )
}
function WhatsApp({ conversations, reload }: Data) {
  const [selected, setSelected] = useState<Conversation | null>(null),
    [messages, setMessages] = useState<WhatsAppMessage[]>([]),
    [query, setQuery] = useState(''),
    [text, setText] = useState(''),
    [sending, setSending] = useState(false),
    [ai, setAi] = useState('')
  const current = selected || conversations[0]
  const load = useCallback(() => {
    if (current) listMessages(current.id).then(setMessages)
  }, [current])
  useEffect(() => {
    load()
  }, [load])
  useRealtime<WhatsAppMessage>('whatsapp_messages', load, !!current)
  async function send() {
    if (!current || !text.trim()) return
    setSending(true)
    try {
      await sendWhatsApp({
        phone: current.phone,
        message: text,
        conversation_id: current.id,
        customer_id: current.customer,
      })
      setText('')
      await load()
      await reload()
    } catch (e) {
      setAi(e instanceof Error ? e.message : 'Falha no envio')
    } finally {
      setSending(false)
    }
  }
  async function prompt(kind: 'summary' | 'draft') {
    if (!current) return
    setAi('Consultando ScooterPro...')
    const transcript = messages
      .slice(-12)
      .map((m) => `${m.direction === 'in' ? 'Cliente' : 'Consultor'}: ${m.content}`)
      .join('\n')
    try {
      const r = await askScooterPro(
        kind === 'summary'
          ? `Resuma esta conversa e indique próximos passos:\n${transcript}`
          : `Crie uma resposta curta, elegante e comercial para a última mensagem desta conversa:\n${transcript}`,
      )
      setAi(r.content)
      if (kind === 'draft') setText(r.content)
    } catch (e) {
      setAi(e instanceof Error ? e.message : 'IA indisponível')
    }
  }
  return (
    <>
      <PageTitle
        tag="CENTRAL DE CONVERSAS"
        title="WhatsApp"
        desc="Atendimento, vendas e relacionamento em um só lugar."
        action={
          <div className="wa-status">
            <i /> Evolution API conectada
          </div>
        }
      />
      <div className="whatsapp-shell">
        <aside className="chat-list">
          <div className="chat-list-top">
            <div>
              <h3>Conversas</h3>
              <button>
                <Settings2 />
              </button>
            </div>
            <label>
              <Search />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar conversa..."
              />
            </label>
          </div>
          <div className="conversations">
            {conversations
              .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
              .map((c) => (
                <button
                  className={current?.id === c.id ? 'active' : ''}
                  onClick={() => setSelected(c)}
                  key={c.id}
                >
                  <div className="contact-avatar">
                    {c.name
                      .split(' ')
                      .map((x) => x[0])
                      .join('')
                      .slice(0, 2)}
                    <i className={c.status} />
                  </div>
                  <div>
                    <div>
                      <b>{c.name}</b>
                      <time>{date(c.last_message_at).split(' ')[0]}</time>
                    </div>
                    <p>{c.last_message}</p>
                  </div>
                  {c.unread > 0 && <em>{c.unread}</em>}
                </button>
              ))}
          </div>
        </aside>
        {current ? (
          <section className="chat-area">
            <div className="chat-head">
              <div className="contact-avatar">
                {current.name
                  .split(' ')
                  .map((x) => x[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div>
                <b>{current.name}</b>
                <span>
                  <i /> {current.status === 'online' ? 'online agora' : 'visto recentemente'}
                </span>
              </div>
              <div>
                <button onClick={() => prompt('summary')}>
                  <Sparkles /> Resumir
                </button>
                <button onClick={() => prompt('draft')}>
                  <Bot /> Rascunhar
                </button>
                <button>
                  <MoreHorizontal />
                </button>
              </div>
            </div>
            {ai && (
              <div className="ai-banner">
                <Sparkles />
                <p>{ai}</p>
                <button onClick={() => setAi('')}>
                  <X />
                </button>
              </div>
            )}
            <div className="messages">
              <div className="day-pill">HOJE</div>
              {messages.map((m) => (
                <div className={`message ${m.direction === 'out' ? 'out' : 'in'}`} key={m.id}>
                  {m.type === 'image' && (
                    <div className="image-placeholder">
                      <Bike />
                    </div>
                  )}
                  {m.type === 'audio' && (
                    <div className="audio-row">
                      <button>
                        <Headphones />
                      </button>
                      <i />
                      <span>0:18</span>
                    </div>
                  )}
                  <p>{m.content}</p>
                  <span>
                    {date(m.sent_at).split(' ').slice(-1)}{' '}
                    {m.direction === 'out' && (
                      <small className={m.status}>
                        {m.status === 'read' ? '✓✓' : m.status === 'delivered' ? '✓✓' : '✓'}
                      </small>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="composer">
              <button>
                <Plus />
              </button>
              <button>
                <Paperclip />
              </button>
              <div>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') send()
                  }}
                  placeholder="Digite uma mensagem"
                />
                <button>
                  <Sparkles />
                </button>
              </div>
              {text ? (
                <button className="send" onClick={send} disabled={sending}>
                  {sending ? <Loader2 className="spin" /> : <Send />}
                </button>
              ) : (
                <button>
                  <Mic />
                </button>
              )}
            </div>
          </section>
        ) : (
          <div className="empty-chat">
            <MessageCircle />
            <h3>Selecione uma conversa</h3>
          </div>
        )}
      </div>
    </>
  )
}
function Customers({ customers }: { customers: Customer[] }) {
  const [q, setQ] = useState('')
  return (
    <>
      <PageTitle
        tag="RELACIONAMENTO"
        title="Clientes"
        desc="Leads e clientes em uma visão unificada."
        action={
          <button className="primary-btn">
            <UserPlus /> Adicionar cliente
          </button>
        }
      />
      <div className="table-panel">
        <div className="table-tools">
          <label>
            <Search />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome, telefone ou e-mail"
            />
          </label>
          <button className="outline-btn">
            Todos os status <ChevronRight />
          </button>
        </div>
        <div className="data-table">
          <div className="tr th">
            <span>Cliente</span>
            <span>Contato</span>
            <span>Status</span>
            <span>Última interação</span>
            <span />
          </div>
          {customers
            .filter((c) => (c.name + c.email + c.phone).toLowerCase().includes(q.toLowerCase()))
            .map((c) => (
              <div className="tr" key={c.id}>
                <span className="customer-cell">
                  <div className="mini-avatar">
                    {c.name
                      .split(' ')
                      .map((x) => x[0])
                      .join('')
                      .slice(0, 2)}
                  </div>
                  <div>
                    <b>{c.name}</b>
                    <small>Desde {date(c.created).split(' ')[0]}</small>
                  </div>
                </span>
                <span>
                  <b>{c.phone}</b>
                  <small>{c.email}</small>
                </span>
                <span>
                  <em className={`status-pill ${c.status}`}>
                    {c.status === 'lead' ? 'Lead' : c.status === 'active' ? 'Ativo' : 'Inativo'}
                  </em>
                </span>
                <span>
                  <b>{date(c.last_interaction)}</b>
                  <small>{c.interaction_summary}</small>
                </span>
                <button>
                  <MoreHorizontal />
                </button>
              </div>
            ))}
        </div>
      </div>
    </>
  )
}
function Inventory({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null)
  return (
    <>
      <PageTitle
        tag="CATÁLOGO & ESTOQUE"
        title="Produtos"
        desc={`${products.length} itens no catálogo · ${products.reduce((s, p) => s + p.stock, 0)} unidades disponíveis`}
        action={
          <button className="primary-btn">
            <PackagePlus /> Novo produto
          </button>
        }
      />
      <div className="inventory-grid">
        {products.map((p, i) => (
          <article
            className={`product-card ${p.stock <= 2 ? 'low' : ''}`}
            key={p.id}
            onClick={() => setSelected(p)}
          >
            <div className="product-image">
              <img
                src={`https://img.usecurling.com/p/800/600?q=${i === 3 ? 'carbon+helmet' : i === 1 ? 'electric+scooter' : i === 2 ? 'urban+scooter' : 'luxury+scooter'}&color=111111`}
                alt={p.name}
              />
              <span className={p.stock <= 2 ? 'danger' : ''}>
                {p.stock <= 2 ? 'ESTOQUE BAIXO' : `${p.stock} EM ESTOQUE`}
              </span>
            </div>
            <div className="product-info">
              <small>{p.sku}</small>
              <h3>{p.name}</h3>
              <div>
                <b>{money.format(p.price)}</b>
                <span>Margem {Math.round((1 - p.internal_cost / p.price) * 100)}%</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      {selected && (
        <div className="product-modal">
          <div className="drawer-scrim" onClick={() => setSelected(null)} />
          <div className="product-detail">
            <button onClick={() => setSelected(null)}>
              <X />
            </button>
            <span className="section-tag">FICHA TÉCNICA</span>
            <h2>{selected.name}</h2>
            <p>{selected.sku}</p>
            <div className="specs">
              {Object.entries(selected.specs || {}).map(([k, v]) => (
                <div key={k}>
                  <span>{k}</span>
                  <b>{v}</b>
                </div>
              ))}
            </div>
            <div className="price-compare">
              <div>
                <span>Custo interno</span>
                <b>{money.format(selected.internal_cost)}</b>
              </div>
              <div>
                <span>Preço de venda</span>
                <b>{money.format(selected.price)}</b>
              </div>
            </div>
            <div className="stock-count">
              <Box />
              <div>
                <span>Disponibilidade</span>
                <b>{selected.stock} unidades</b>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
function Finance({ transactions }: { transactions: Transaction[] }) {
  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0),
    expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  return (
    <>
      <PageTitle
        tag="FINANCEIRO"
        title="Fluxo de caixa"
        desc="Liquidez, receitas e despesas da operação."
        action={
          <button className="primary-btn">
            <Plus /> Nova transação
          </button>
        }
      />
      <div className="finance-kpis">
        <div>
          <span>Saldo disponível</span>
          <h2>{money.format(income - expense)}</h2>
          <small>
            <TrendingUp /> +12,6% no período
          </small>
        </div>
        <div>
          <span>Receitas</span>
          <h2>{money.format(income)}</h2>
          <i className="income" />
        </div>
        <div>
          <span>Despesas</span>
          <h2>{money.format(expense)}</h2>
          <i className="expense" />
        </div>
      </div>
      <div className="table-panel">
        <div className="panel-head">
          <div>
            <span>LEDGER</span>
            <h3>Extrato de transações</h3>
          </div>
          <button className="outline-btn">Todas as categorias</button>
        </div>
        <div className="data-table finance-table">
          <div className="tr th">
            <span>Descrição</span>
            <span>Categoria</span>
            <span>Data</span>
            <span>Tipo</span>
            <span>Valor</span>
          </div>
          {transactions.map((t) => (
            <div className="tr" key={t.id}>
              <span>
                <b>{t.description || t.category}</b>
                <small>#{t.id.slice(-6).toUpperCase()}</small>
              </span>
              <span>
                <em className="category">{t.category}</em>
              </span>
              <span>{date(t.occurred_at)}</span>
              <span>{t.type === 'income' ? 'Receita' : 'Despesa'}</span>
              <span className={t.type}>
                {t.type === 'income' ? '+' : '−'} {money.format(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
function FollowUps({ items }: { items: FollowUp[] }) {
  return (
    <>
      <PageTitle
        tag="CADÊNCIA COMERCIAL"
        title="Follow-ups"
        desc="Próximos contatos e compromissos do pipeline."
        action={
          <button className="primary-btn">
            <Plus /> Agendar follow-up
          </button>
        }
      />
      <div className="follow-layout">
        <section className="panel">
          <div className="panel-head">
            <div>
              <span>HOJE</span>
              <h3>Agenda de contatos</h3>
            </div>
            <CalendarClock />
          </div>
          {items.map((f, i) => (
            <div className="follow-row" key={f.id}>
              <div className={`time-block ${i === 0 ? 'now' : ''}`}>
                <b>
                  {new Date(f.due_at).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </b>
                <span>{i === 0 ? 'AGORA' : 'HOJE'}</span>
              </div>
              <div>
                <h4>{f.title}</h4>
                <p>
                  {f.expand?.customer?.name || 'Cliente'} ·{' '}
                  {f.expand?.deal?.title || 'Relacionamento'}
                </p>
                <em>
                  <MessageCircle /> {f.channel}
                </em>
              </div>
              <button>
                <Check />
              </button>
            </div>
          ))}
        </section>
        <aside className="panel cadence-card">
          <Sparkles />
          <span className="section-tag">SCOOTERPRO INSIGHT</span>
          <h3>Melhor janela de contato</h3>
          <p>Seus leads têm 32% mais respostas entre 16h e 18h. Priorize João Mendes hoje.</p>
          <button className="outline-btn">Otimizar agenda</button>
        </aside>
      </div>
    </>
  )
}
function Assistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
      {
        role: 'assistant',
        content:
          'Olá, Kimberly. Sou o ScooterPro. Posso consultar estoque, analisar negócios e sugerir a melhor abordagem para cada cliente. Como posso ajudar?',
      },
    ]),
    [text, setText] = useState(''),
    [loading, setLoading] = useState(false),
    [conversation, setConversation] = useState<string | null>(null)
  async function send(prompt?: string) {
    const q = prompt || text
    if (!q.trim()) return
    setMessages((m) => [...m, { role: 'user', content: q }])
    setText('')
    setLoading(true)
    try {
      const r = await askScooterPro(q, conversation)
      setConversation(r.conversation_id)
      setMessages((m) => [...m, { role: 'assistant', content: r.content }])
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: e instanceof Error ? e.message : 'Assistente indisponível' },
      ])
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      <PageTitle
        tag="INTELIGÊNCIA COMERCIAL"
        title="ScooterPro AI"
        desc="Seu especialista em mobilidade premium, conectado ao CRM e estoque."
        action={
          <div className="agent-live">
            <i /> AGENTE ATIVO
          </div>
        }
      />
      <div className="assistant-shell">
        <aside>
          <div className="agent-orb">
            <Bot />
          </div>
          <h3>ScooterPro</h3>
          <p>Sales Assistant</p>
          <div className="agent-scope">
            <span>
              <Box /> Produtos <Check />
            </span>
            <span>
              <Activity /> Negócios <Check />
            </span>
            <span>
              <Users /> Clientes <Check />
            </span>
          </div>
          <button className="outline-btn">
            <Settings2 /> Configurar agente
          </button>
        </aside>
        <section>
          <div className="agent-messages">
            {messages.map((m, i) => (
              <div className={`agent-message ${m.role}`} key={i}>
                {m.role === 'assistant' && (
                  <div className="agent-mini">
                    <Bot />
                  </div>
                )}
                <div>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="agent-message assistant">
                <div className="agent-mini">
                  <Bot />
                </div>
                <div>
                  <Loader2 className="spin" />
                </div>
              </div>
            )}
          </div>
          <div className="suggestions">
            <button onClick={() => send('Quais produtos estão com estoque baixo?')}>
              Analisar estoque baixo
            </button>
            <button onClick={() => send('Qual negócio devo priorizar hoje e por quê?')}>
              Priorizar oportunidades
            </button>
            <button onClick={() => send('Crie um roteiro de follow-up para os leads ativos.')}>
              Criar cadência
            </button>
          </div>
          <div className="agent-composer">
            <Sparkles />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
              placeholder="Pergunte sobre produtos, clientes ou negócios..."
            />
            <button onClick={() => send()}>
              <Send />
            </button>
          </div>
          <small className="agent-note">
            ScooterPro pode consultar dados e recomendar alterações. Ações de escrita exigem sua
            confirmação.
          </small>
        </section>
      </div>
    </>
  )
}

export default function App() {
  const [authed, setAuthed] = useState(pb.authStore.isValid)
  useEffect(() => pb.authStore.onChange(() => setAuthed(pb.authStore.isValid), true), [])
  return authed ? <Shell /> : <Login />
}
