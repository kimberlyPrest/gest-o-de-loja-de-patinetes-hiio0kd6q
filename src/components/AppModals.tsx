import React, { useState } from 'react'
import {
  X,
  Plus,
  UserPlus,
  PackagePlus,
  CreditCard,
  CalendarClock,
  Download,
  Loader2,
  Trash2,
  Edit2,
  ExternalLink,
} from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createProduct,
  updateProduct,
  deleteProduct,
  createDeal,
  deleteDeal,
  createTransaction,
  deleteTransaction,
  createFollowup,
  type Customer,
  type Deal,
  type Product,
  type Transaction,
  type FollowUp,
} from '@/services/store'

interface ModalBaseProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Modal: Criar / Editar Cliente
export function CustomerModal({
  open,
  customer,
  onClose,
  onSuccess,
}: ModalBaseProps & { customer?: Customer | null }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(customer?.name || '')
  const [phone, setPhone] = useState(customer?.phone || '')
  const [email, setEmail] = useState(customer?.email || '')
  const [status, setStatus] = useState<'lead' | 'active' | 'inactive'>(customer?.status || 'lead')
  const [summary, setSummary] = useState(customer?.interaction_summary || '')

  React.useEffect(() => {
    if (customer) {
      setName(customer.name)
      setPhone(customer.phone)
      setEmail(customer.email)
      setStatus(customer.status)
      setSummary(customer.interaction_summary || '')
    } else {
      setName('')
      setPhone('')
      setEmail('')
      setStatus('lead')
      setSummary('')
    }
  }, [customer, open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (customer) {
        await updateCustomer(customer.id, {
          name,
          phone,
          email,
          status,
          interaction_summary: summary,
        })
        toast({ title: 'Cliente atualizado', description: `${name} foi atualizado com sucesso.` })
      } else {
        await createCustomer({
          name,
          phone,
          email,
          status,
          interaction_summary: summary || 'Cliente cadastrado no sistema.',
          last_interaction: new Date().toISOString(),
          owner: pb.authStore.record?.id,
        })
        toast({ title: 'Cliente criado', description: `${name} foi adicionado à base.` })
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      toast({
        title: 'Erro ao salvar cliente',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="product-modal">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="product-detail" style={{ maxWidth: 520 }}>
        <button type="button" onClick={onClose}>
          <X />
        </button>
        <span className="section-tag">{customer ? 'EDITAR CLIENTE' : 'NOVO CLIENTE'}</span>
        <h2>{customer ? customer.name : 'Adicionar Cliente / Lead'}</h2>
        <p>Preencha os dados de contato e relacionamento.</p>

        <form onSubmit={handleSubmit} className="drawer-body" style={{ padding: '16px 0 0' }}>
          <label>
            Nome completo *
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Carlos Eduardo Silva"
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Telefone / WhatsApp *
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+55 11 99999-9999"
              />
            </label>
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@email.com"
              />
            </label>
          </div>

          <label>
            Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'lead' | 'active' | 'inactive')}
            >
              <option value="lead">Lead (Em prospecção)</option>
              <option value="active">Cliente Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </label>

          <label>
            Resumo / Interesse
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Ex: Busca patinete potente para deslocamento diário de 15km."
            />
          </label>

          <div className="drawer-foot" style={{ padding: '16px 0 0', marginTop: 16 }}>
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" /> : customer ? 'Salvar' : 'Criar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal: Criar Negócio (Deal)
export function DealModal({
  open,
  customers,
  products,
  onClose,
  onSuccess,
}: ModalBaseProps & {
  customers: Customer[]
  products: Product[]
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [customer, setCustomer] = useState('')
  const [value, setValue] = useState('')
  const [stage, setStage] = useState<Deal['stage']>('new')
  const [notes, setNotes] = useState('')

  React.useEffect(() => {
    if (customers.length && !customer) {
      setCustomer(customers[0].id)
    }
  }, [customers, customer])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customer) {
      toast({ title: 'Atenção', description: 'Selecione um cliente.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await createDeal({
        title: title.trim() || 'Oportunidade Comercial',
        customer,
        value: Number(value) || 0,
        stage,
        notes,
        last_contact: new Date().toISOString(),
        owner: pb.authStore.record?.id,
      })
      toast({ title: 'Negócio criado', description: 'Oportunidade adicionada ao funil.' })
      setTitle('')
      setValue('')
      setNotes('')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast({
        title: 'Erro ao criar negócio',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="product-modal">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="product-detail" style={{ maxWidth: 520 }}>
        <button type="button" onClick={onClose}>
          <X />
        </button>
        <span className="section-tag">NOVO NEGÓCIO</span>
        <h2>Criar Oportunidade</h2>
        <p>Inicie uma negociação ou adicione um lead ao pipeline.</p>

        <form onSubmit={handleSubmit} className="drawer-body" style={{ padding: '16px 0 0' }}>
          <label>
            Título da oportunidade *
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Model S + Capacete · Carlos"
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Cliente *
              <select value={customer} onChange={(e) => setCustomer(e.target.value)} required>
                <option value="">Selecione o cliente...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            </label>

            <label>
              Valor estimado (R$) *
              <input
                type="number"
                step="0.01"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Ex: 8900.00"
              />
            </label>
          </div>

          <label>
            Estágio inicial
            <select value={stage} onChange={(e) => setStage(e.target.value as Deal['stage'])}>
              <option value="new">Novo Lead</option>
              <option value="contact">Contato Inicial</option>
              <option value="drive">Test Drive Agendado</option>
              <option value="negotiation">Negociação</option>
              <option value="won">Ganho (Venda Realizada)</option>
            </select>
          </label>

          <label>
            Anotações / Contexto
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Cliente tem interesse em financiamento em 10x sem juros..."
            />
          </label>

          <div className="drawer-foot" style={{ padding: '16px 0 0', marginTop: 16 }}>
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" /> : 'Criar Negócio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal: Criar / Editar Produto
export function ProductModal({
  open,
  product,
  onClose,
  onSuccess,
}: ModalBaseProps & { product?: Product | null }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(product?.name || '')
  const [sku, setSku] = useState(product?.sku || '')
  const [price, setPrice] = useState(product ? String(product.price) : '')
  const [cost, setCost] = useState(product ? String(product.internal_cost) : '')
  const [stock, setStock] = useState(product ? String(product.stock) : '')
  const [autonomia, setAutonomia] = useState(product?.specs?.autonomia || '')
  const [motor, setMotor] = useState(product?.specs?.motor || '')
  const [velocidade, setVelocidade] = useState(product?.specs?.velocidade || '')

  React.useEffect(() => {
    if (product) {
      setName(product.name)
      setSku(product.sku)
      setPrice(String(product.price))
      setCost(String(product.internal_cost))
      setStock(String(product.stock))
      setAutonomia(product.specs?.autonomia || '')
      setMotor(product.specs?.motor || '')
      setVelocidade(product.specs?.velocidade || '')
    } else {
      setName('')
      setSku(`NW-PRO-${Math.floor(100 + Math.random() * 900)}`)
      setPrice('')
      setCost('')
      setStock('5')
      setAutonomia('40 km')
      setMotor('800W')
      setVelocidade('35 km/h')
    }
  }, [product, open])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const specs: Record<string, string> = {
        autonomia: autonomia || '40 km',
        motor: motor || '800W',
        velocidade: velocidade || '35 km/h',
      }
      if (product) {
        await updateProduct(product.id, {
          name,
          sku,
          price: Number(price) || 0,
          internal_cost: Number(cost) || 0,
          stock: Number(stock) || 0,
          specs,
        })
        toast({ title: 'Produto atualizado', description: `${name} foi atualizado.` })
      } else {
        await createProduct({
          name,
          sku,
          price: Number(price) || 0,
          internal_cost: Number(cost) || 0,
          stock: Number(stock) || 0,
          specs,
          owner: pb.authStore.record?.id,
        })
        toast({ title: 'Produto cadastrado', description: `${name} adicionado ao catálogo.` })
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      toast({
        title: 'Erro ao salvar produto',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="product-modal">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="product-detail" style={{ maxWidth: 540 }}>
        <button type="button" onClick={onClose}>
          <X />
        </button>
        <span className="section-tag">{product ? 'EDITAR PRODUTO' : 'NOVO PRODUTO'}</span>
        <h2>{product ? product.name : 'Cadastrar Produto no Catálogo'}</h2>
        <p>Defina preços, custos, estoque e especificações técnicas.</p>

        <form onSubmit={handleSubmit} className="drawer-body" style={{ padding: '16px 0 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <label>
              Nome do produto *
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: New Way Phantom GT"
              />
            </label>
            <label>
              SKU / Código *
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="NW-GT-2026"
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <label>
              Preço Venda (R$) *
              <input
                type="number"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="9500"
              />
            </label>
            <label>
              Custo Interno (R$) *
              <input
                type="number"
                step="0.01"
                required
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="5800"
              />
            </label>
            <label>
              Qtd Estoque *
              <input
                type="number"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="5"
              />
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <label>
              Autonomia
              <input
                type="text"
                value={autonomia}
                onChange={(e) => setAutonomia(e.target.value)}
                placeholder="50 km"
              />
            </label>
            <label>
              Motor
              <input
                type="text"
                value={motor}
                onChange={(e) => setMotor(e.target.value)}
                placeholder="1000W"
              />
            </label>
            <label>
              Velocidade Máx
              <input
                type="text"
                value={velocidade}
                onChange={(e) => setVelocidade(e.target.value)}
                placeholder="40 km/h"
              />
            </label>
          </div>

          <div className="drawer-foot" style={{ padding: '16px 0 0', marginTop: 16 }}>
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" /> : product ? 'Salvar' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal: Nova Transação Financeira
export function TransactionModal({ open, onClose, onSuccess }: ModalBaseProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [type, setType] = useState<'income' | 'expense'>('income')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Vendas')
  const [description, setDescription] = useState('')

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await createTransaction({
        type,
        amount: Number(amount) || 0,
        category,
        description:
          description || (type === 'income' ? 'Receita operacional' : 'Despesa operacional'),
        occurred_at: new Date().toISOString(),
        owner: pb.authStore.record?.id,
      })
      toast({
        title: 'Transação registrada',
        description: `${type === 'income' ? 'Receita' : 'Despesa'} de R$ ${amount} registrada com sucesso.`,
      })
      setAmount('')
      setDescription('')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast({
        title: 'Erro ao registrar transação',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="product-modal">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="product-detail" style={{ maxWidth: 480 }}>
        <button type="button" onClick={onClose}>
          <X />
        </button>
        <span className="section-tag">FINANCEIRO</span>
        <h2>Nova Transação</h2>
        <p>Lance uma receita ou despesa no fluxo de caixa.</p>

        <form onSubmit={handleSubmit} className="drawer-body" style={{ padding: '16px 0 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Tipo *
              <select
                value={type}
                onChange={(e) => {
                  const t = e.target.value as 'income' | 'expense'
                  setType(t)
                  setCategory(t === 'income' ? 'Vendas' : 'Operacional')
                }}
              >
                <option value="income">Receita (+)</option>
                <option value="expense">Despesa (−)</option>
              </select>
            </label>
            <label>
              Valor (R$) *
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 1500.00"
              />
            </label>
          </div>

          <label>
            Categoria *
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {type === 'income' ? (
                <>
                  <option value="Vendas">Vendas de Patinetes</option>
                  <option value="Acessórios">Acessórios / Peças</option>
                  <option value="Serviços">Oficina & Revisão</option>
                  <option value="Outros">Outras Receitas</option>
                </>
              ) : (
                <>
                  <option value="Aluguel">Aluguel do Showroom</option>
                  <option value="Marketing">Marketing / Tráfego Pago</option>
                  <option value="Fornecedores">Fornecedores de Peças</option>
                  <option value="Equipe">Salários & Comissões</option>
                  <option value="Operacional">Operacional Geral</option>
                </>
              )}
            </select>
          </label>

          <label>
            Descrição
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Sinal de entrada venda Model S"
            />
          </label>

          <div className="drawer-foot" style={{ padding: '16px 0 0', marginTop: 16 }}>
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" /> : 'Lançar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal: Novo Follow-up / Agendamento
export function FollowupModal({
  open,
  customers,
  deals,
  onClose,
  onSuccess,
}: ModalBaseProps & {
  customers: Customer[]
  deals: Deal[]
}) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [customer, setCustomer] = useState('')
  const [deal, setDeal] = useState('')
  const [title, setTitle] = useState('')
  const [channel, setChannel] = useState<'whatsapp' | 'call' | 'email'>('whatsapp')
  const [dueAt, setDueAt] = useState('')

  React.useEffect(() => {
    if (customers.length && !customer) {
      setCustomer(customers[0].id)
    }
  }, [customers, customer])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customer) {
      toast({ title: 'Atenção', description: 'Selecione um cliente.', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      await createFollowup({
        customer,
        deal: deal || undefined,
        title: title || 'Follow-up de contato',
        channel,
        due_at: dueAt ? new Date(dueAt).toISOString() : new Date().toISOString(),
        status: 'pending',
        owner: pb.authStore.record?.id,
      })
      toast({ title: 'Follow-up agendado', description: 'Compromisso salvo na cadência.' })
      setTitle('')
      setDueAt('')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast({
        title: 'Erro ao agendar follow-up',
        description: err instanceof Error ? err.message : 'Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="product-modal">
      <div className="drawer-scrim" onClick={onClose} />
      <div className="product-detail" style={{ maxWidth: 500 }}>
        <button type="button" onClick={onClose}>
          <X />
        </button>
        <span className="section-tag">CADÊNCIA</span>
        <h2>Agendar Follow-up</h2>
        <p>Defina o canal, horário e cliente para o próximo contato.</p>

        <form onSubmit={handleSubmit} className="drawer-body" style={{ padding: '16px 0 0' }}>
          <label>
            Assunto / Título *
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Confirmar test drive de sábado"
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Cliente *
              <select value={customer} onChange={(e) => setCustomer(e.target.value)} required>
                <option value="">Selecione...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Negócio Relacionado (Opcional)
              <select value={deal} onChange={(e) => setDeal(e.target.value)}>
                <option value="">Nenhum / Geral</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Canal de Contato
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as 'whatsapp' | 'call' | 'email')}
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="call">Ligação Telefônica</option>
                <option value="email">E-mail</option>
              </select>
            </label>

            <label>
              Data e Horário *
              <input
                type="datetime-local"
                required
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
              />
            </label>
          </div>

          <div className="drawer-foot" style={{ padding: '16px 0 0', marginTop: 16 }}>
            <button type="button" className="outline-btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? <Loader2 className="spin" /> : 'Agendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Modal de Configurações do Agente / Assistente
export function AgentSettingsModal({ open, onClose }: ModalBaseProps) {
  const { toast } = useToast()
  return (
    <div className="product-modal" style={{ display: open ? 'block' : 'none' }}>
      <div className="drawer-scrim" onClick={onClose} />
      <div className="product-detail" style={{ maxWidth: 500 }}>
        <button type="button" onClick={onClose}>
          <X />
        </button>
        <span className="section-tag">IA & AUTOMAÇÕES</span>
        <h2>Configurar ScooterPro</h2>
        <p>Ajuste os parâmetros do assistente inteligente de vendas.</p>

        <div className="drawer-body" style={{ padding: '16px 0 0' }}>
          <label>
            Tom de voz do agente
            <select defaultValue="consultivo">
              <option value="consultivo">Consultivo & Sofisticado (Padrão)</option>
              <option value="direto">Direto & Focado em Fechamento</option>
              <option value="tecnico">Técnico & Focado em Especificações</option>
            </select>
          </label>

          <label>
            Instrução adicional de sistema
            <textarea
              rows={3}
              defaultValue="Destaque sempre a garantia estendida de 2 anos e o serviço de test drive VIP na loja da Faria Lima."
            />
          </label>

          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: 11, color: '#00d1ff', fontWeight: 600 }}>
              Acessos autorizados:
            </span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 8,
                marginTop: 8,
                fontSize: 11,
                color: '#aaa',
              }}
            >
              <div>✓ Catálogo de produtos</div>
              <div>✓ Consulta a CRM</div>
              <div>✓ Sugestão de cadência</div>
              <div>✓ Rascunhos WhatsApp</div>
            </div>
          </div>

          <div className="drawer-foot" style={{ padding: '16px 0 0', marginTop: 20 }}>
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                toast({
                  title: 'Configurações salvas',
                  description: 'ScooterPro atualizado com as novas diretrizes.',
                })
                onClose()
              }}
            >
              Salvar Parâmetros
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
