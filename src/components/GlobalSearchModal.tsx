import React, { useState } from 'react'
import {
  Search,
  X,
  Users,
  Activity,
  Box,
  CreditCard,
  MessageCircle,
  Sparkles,
  ChevronRight,
  Plus,
  Bot,
} from 'lucide-react'
import type { Customer, Deal, Product, Transaction } from '@/services/store'

export function GlobalSearchModal({
  open,
  onClose,
  customers,
  deals,
  products,
  onNavigate,
  onSelectDeal,
  onSelectProduct,
}: {
  open: boolean
  onClose: () => void
  customers: Customer[]
  deals: Deal[]
  products: Product[]
  onNavigate: (page: any) => void
  onSelectDeal?: (deal: Deal) => void
  onSelectProduct?: (product: Product) => void
}) {
  const [query, setQuery] = useState('')

  if (!open) return null

  const q = query.toLowerCase().trim()

  const matchCustomers = q
    ? customers.filter((c) => (c.name + c.phone + c.email).toLowerCase().includes(q))
    : customers.slice(0, 3)
  const matchDeals = q
    ? deals.filter((d) => (d.title + (d.expand?.customer?.name || '')).toLowerCase().includes(q))
    : deals.slice(0, 3)
  const matchProducts = q
    ? products.filter((p) => (p.name + p.sku).toLowerCase().includes(q))
    : products.slice(0, 3)

  return (
    <div className="product-modal">
      <div className="drawer-scrim" onClick={onClose} />
      <div
        className="product-detail"
        style={{
          maxWidth: 600,
          padding: 0,
          background: '#121214',
          border: '1px solid #2e2e34',
          overflow: 'hidden',
          borderRadius: 12,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid #242428',
            gap: 12,
          }}
        >
          <Search style={{ width: 18, color: '#00d1ff' }} />
          <input
            autoFocus
            style={{
              flex: 1,
              background: 'none',
              border: 0,
              outline: 0,
              color: '#fff',
              fontSize: 14,
            }}
            placeholder="Buscar por cliente, negócio, modelo de scooter, SKU..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 0, color: '#666', cursor: 'pointer' }}
          >
            <X style={{ width: 16 }} />
          </button>
        </div>

        <div style={{ maxHeight: 420, overflowY: 'auto', padding: '14px 16px' }}>
          {/* Navegação Rápida */}
          {!q && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#777',
                  marginBottom: 8,
                }}
              >
                NAVEGAÇÃO RÁPIDA
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('dashboard')
                    onClose()
                  }}
                  style={{
                    background: '#18181b',
                    border: '1px solid #242428',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#ccc',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Activity size={14} color="#00d1ff" /> Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('pipeline')
                    onClose()
                  }}
                  style={{
                    background: '#18181b',
                    border: '1px solid #242428',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#ccc',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <CreditCard size={14} color="#00d1ff" /> Pipeline de Vendas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('whatsapp')
                    onClose()
                  }}
                  style={{
                    background: '#18181b',
                    border: '1px solid #242428',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#ccc',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <MessageCircle size={14} color="#44d492" /> Central WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('assistant')
                    onClose()
                  }}
                  style={{
                    background: '#18181b',
                    border: '1px solid #242428',
                    padding: '8px 12px',
                    borderRadius: 6,
                    color: '#ccc',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <Bot size={14} color="#00d1ff" /> Assistente IA ScooterPro
                </button>
              </div>
            </div>
          )}

          {/* Clientes */}
          {matchCustomers.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#777',
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>CLIENTES & LEADS</span>
                <span
                  style={{ cursor: 'pointer', color: '#00d1ff' }}
                  onClick={() => {
                    onNavigate('customers')
                    onClose()
                  }}
                >
                  Ver todos
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {matchCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onNavigate('customers')
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#161619',
                      border: '1px solid #222226',
                      borderRadius: 6,
                      color: '#ddd',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Users size={14} color="#00d1ff" />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: '#666' }}>
                          {c.phone} · {c.email}
                        </div>
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        color: '#00d1ff',
                        background: '#11252a',
                        padding: '2px 6px',
                        borderRadius: 4,
                      }}
                    >
                      {c.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Negócios */}
          {matchDeals.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#777',
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>NEGÓCIOS NO PIPELINE</span>
                <span
                  style={{ cursor: 'pointer', color: '#00d1ff' }}
                  onClick={() => {
                    onNavigate('pipeline')
                    onClose()
                  }}
                >
                  Ver funil
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {matchDeals.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => {
                      onNavigate('pipeline')
                      onSelectDeal?.(d)
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#161619',
                      border: '1px solid #222226',
                      borderRadius: 6,
                      color: '#ddd',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Activity size={14} color="#FFB547" />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{d.title}</div>
                        <div style={{ fontSize: 10, color: '#666' }}>
                          Cliente: {d.expand?.customer?.name || 'Geral'}
                        </div>
                      </div>
                    </div>
                    <b style={{ fontSize: 12, color: '#44d492' }}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(d.value)}
                    </b>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Produtos */}
          {matchProducts.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: '#777',
                  marginBottom: 8,
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>PRODUTOS & ESTOQUE</span>
                <span
                  style={{ cursor: 'pointer', color: '#00d1ff' }}
                  onClick={() => {
                    onNavigate('inventory')
                    onClose()
                  }}
                >
                  Ver estoque
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {matchProducts.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onNavigate('inventory')
                      onSelectProduct?.(p)
                      onClose()
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: '#161619',
                      border: '1px solid #222226',
                      borderRadius: 6,
                      color: '#ddd',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Box size={14} color="#00d1ff" />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: '#666' }}>
                          SKU: {p.sku} · Estoque: {p.stock} un.
                        </div>
                      </div>
                    </div>
                    <b style={{ fontSize: 12, color: '#fff' }}>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(p.price)}
                    </b>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: '10px 16px',
            background: '#0d0d0f',
            borderTop: '1px solid #222226',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 10,
            color: '#666',
          }}
        >
          <span>
            Dica: Use <b>ESC</b> para fechar
          </span>
          <span>
            <b>NEW WAY</b> Cockpit
          </span>
        </div>
      </div>
    </div>
  )
}
