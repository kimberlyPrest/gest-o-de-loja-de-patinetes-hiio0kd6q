import type { RecordModel } from 'pocketbase'
import pb from '@/lib/pocketbase/client'

export interface Customer extends RecordModel {
  name: string
  phone: string
  email: string
  status: 'lead' | 'active' | 'inactive'
  last_interaction?: string
  interaction_summary?: string
}
export interface Product extends RecordModel {
  name: string
  sku: string
  price: number
  internal_cost: number
  stock: number
  specs?: Record<string, string>
  images?: string[]
}
export interface Deal extends RecordModel {
  title: string
  customer: string
  value: number
  stage: 'new' | 'contact' | 'drive' | 'negotiation' | 'won' | 'lost'
  last_contact?: string
  follow_up_at?: string
  notes?: string
  expand?: { customer?: Customer }
}
export interface Conversation extends RecordModel {
  customer?: string
  name: string
  phone: string
  last_message: string
  last_message_at?: string
  unread: number
  status: 'online' | 'offline' | 'typing'
}
export interface WhatsAppMessage extends RecordModel {
  conversation: string
  customer?: string
  direction: 'in' | 'out'
  type: 'text' | 'image' | 'audio'
  content: string
  media_url?: string
  status: 'sent' | 'delivered' | 'read' | 'received' | 'failed'
  sent_at: string
}
export interface Transaction extends RecordModel {
  type: 'income' | 'expense'
  amount: number
  category: string
  description?: string
  occurred_at: string
}
export interface FollowUp extends RecordModel {
  customer: string
  deal?: string
  title: string
  channel: 'whatsapp' | 'call' | 'email'
  due_at: string
  status: 'pending' | 'done' | 'overdue'
  expand?: { customer?: Customer; deal?: Deal }
}
export interface Interaction extends RecordModel {
  customer: string
  deal?: string
  kind: string
  content: string
  occurred_at: string
}

export const listCustomers = () =>
  pb.collection<Customer>('customers').getFullList({ sort: '-updated' })
export const listProducts = () => pb.collection<Product>('products').getFullList({ sort: 'stock' })
export const listDeals = () =>
  pb.collection<Deal>('deals').getFullList({ sort: '-updated', expand: 'customer' })
export const updateDealStage = (id: string, stage: Deal['stage']) =>
  pb.collection<Deal>('deals').update(id, { stage })
export const updateDeal = (id: string, data: Partial<Deal>) =>
  pb.collection<Deal>('deals').update(id, data)
export const listConversations = () =>
  pb.collection<Conversation>('whatsapp_conversations').getFullList({ sort: '-last_message_at' })
export const listMessages = (conversation: string) =>
  pb
    .collection<WhatsAppMessage>('whatsapp_messages')
    .getFullList({ filter: `conversation = "${conversation}"`, sort: 'sent_at' })
export const listTransactions = () =>
  pb.collection<Transaction>('transactions').getFullList({ sort: '-occurred_at' })
export const listFollowups = () =>
  pb.collection<FollowUp>('followups').getFullList({ sort: 'due_at', expand: 'customer,deal' })
export const listInteractions = (customer: string) =>
  pb
    .collection<Interaction>('interactions')
    .getFullList({ filter: `customer = "${customer}"`, sort: '-occurred_at' })
export const createFollowup = (data: Record<string, unknown>) =>
  pb.collection<FollowUp>('followups').create(data)
export const updateFollowup = (id: string, data: Partial<FollowUp>) =>
  pb.collection<FollowUp>('followups').update(id, data)
export const deleteFollowup = (id: string) => pb.collection<FollowUp>('followups').delete(id)

export const createCustomer = (data: Partial<Customer>) =>
  pb.collection<Customer>('customers').create(data)
export const updateCustomer = (id: string, data: Partial<Customer>) =>
  pb.collection<Customer>('customers').update(id, data)
export const deleteCustomer = (id: string) => pb.collection<Customer>('customers').delete(id)

export const createProduct = (data: Partial<Product>) =>
  pb.collection<Product>('products').create(data)
export const updateProduct = (id: string, data: Partial<Product>) =>
  pb.collection<Product>('products').update(id, data)
export const deleteProduct = (id: string) => pb.collection<Product>('products').delete(id)

export const createDeal = (data: Partial<Deal>) => pb.collection<Deal>('deals').create(data)
export const deleteDeal = (id: string) => pb.collection<Deal>('deals').delete(id)

export const createTransaction = (data: Partial<Transaction>) =>
  pb.collection<Transaction>('transactions').create(data)
export const deleteTransaction = (id: string) =>
  pb.collection<Transaction>('transactions').delete(id)

export const createInteraction = (data: Partial<Interaction>) =>
  pb.collection<Interaction>('interactions').create(data)

export async function sendWhatsApp(payload: {
  phone: string
  message: string
  conversation_id: string
  customer_id?: string
}) {
  const response = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/whatsapp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: pb.authStore.token },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Falha no envio')
  return data
}

export async function askScooterPro(message: string, conversationId?: string | null) {
  const response = await fetch(`${import.meta.env.VITE_POCKETBASE_URL}/backend/v1/ai/scooter-pro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: pb.authStore.token },
    body: JSON.stringify({ message, conversation_id: conversationId || null }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || 'Assistente indisponível')
  return data as { content: string; conversation_id: string }
}
