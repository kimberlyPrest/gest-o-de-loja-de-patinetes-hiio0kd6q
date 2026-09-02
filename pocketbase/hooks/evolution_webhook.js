routerAdd('POST', '/backend/v1/webhook/evolution', (e) => {
  const secret = $os.getenv('EVOLUTION_WEBHOOK_SECRET') || ''
  const provided = e.request.header.get('x-webhook-secret') || e.requestInfo().query?.token || ''
  if (secret && provided !== secret) return e.forbiddenError('Webhook inválido')
  const body = e.requestInfo().body || {}
  const event = String(body.event || '').toLowerCase()
  const data = body.data || body
  const key = data.key || {}
  const externalId = key.id || data.messageId || data.id || ''
  if (event.indexOf('messages.update') >= 0 || event.indexOf('message.update') >= 0) {
    if (externalId) {
      try {
        const msg = $app.findFirstRecordByData('whatsapp_messages', 'external_id', externalId)
        const raw = String(data.status || data.update?.status || '').toLowerCase()
        const status =
          raw.indexOf('read') >= 0 ? 'read' : raw.indexOf('deliver') >= 0 ? 'delivered' : 'sent'
        msg.set('status', status)
        $app.save(msg)
      } catch (_) {}
    }
    return e.json(200, { ok: true })
  }
  const remote = key.remoteJid || data.remoteJid || data.sender || ''
  const phone = String(remote).split('@')[0].replace(/\D/g, '')
  if (!phone) return e.json(200, { ignored: true })
  let conv
  try {
    conv = $app.findFirstRecordByData('whatsapp_conversations', 'phone', phone)
  } catch (_) {
    try {
      conv = $app.findFirstRecordByData('whatsapp_conversations', 'phone', '+' + phone)
    } catch (_) {
      return e.json(200, { ignored: true, reason: 'conversation_not_found' })
    }
  }
  const text =
    data.message?.conversation ||
    data.message?.extendedTextMessage?.text ||
    data.text ||
    data.body ||
    'Mídia recebida'
  const fromMe = key.fromMe === true
  const type = data.message?.audioMessage ? 'audio' : data.message?.imageMessage ? 'image' : 'text'
  const msg = new Record($app.findCollectionByNameOrId('whatsapp_messages'))
  msg.set('conversation', conv.id)
  if (conv.getString('customer')) msg.set('customer', conv.getString('customer'))
  msg.set('direction', fromMe ? 'out' : 'in')
  msg.set('type', type)
  msg.set('content', text)
  msg.set('status', fromMe ? 'sent' : 'received')
  msg.set('external_id', externalId)
  msg.set('sent_at', new Date().toISOString())
  msg.set('owner', conv.getString('owner'))
  $app.save(msg)
  conv.set('last_message', text)
  conv.set('last_message_at', new Date().toISOString())
  if (!fromMe) conv.set('unread', conv.getInt('unread') + 1)
  $app.save(conv)
  if (conv.getString('customer')) {
    try {
      const customer = $app.findRecordById('customers', conv.getString('customer'))
      customer.set('last_interaction', new Date().toISOString())
      customer.set('interaction_summary', text)
      $app.save(customer)
    } catch (_) {}
  }
  return e.json(200, { ok: true, id: msg.id })
})
