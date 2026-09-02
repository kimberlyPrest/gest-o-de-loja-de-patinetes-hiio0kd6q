routerAdd(
  'POST',
  '/backend/v1/whatsapp/send',
  (e) => {
    const userId = e.auth?.id
    if (!userId) return e.unauthorizedError('Autenticação necessária')
    const body = e.requestInfo().body || {}
    if (!body.phone || !body.message || !body.conversation_id)
      return e.badRequestError('Telefone, mensagem e conversa são obrigatórios')
    const apiUrl = ($os.getenv('EVOLUTION_API_URL') || '').replace(/\/$/, '')
    const apiKey = $os.getenv('EVOLUTION_API_KEY') || ''
    const instance = $os.getenv('EVOLUTION_INSTANCE') || ''
    if (!apiUrl || !apiKey || !instance)
      return e.json(503, { error: 'Evolution API ainda não configurada' })
    const res = $http.send({
      url: apiUrl + '/message/sendText/' + encodeURIComponent(instance),
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: apiKey },
      body: JSON.stringify({
        number: String(body.phone).replace(/\D/g, ''),
        text: String(body.message),
        delay: 600,
      }),
      timeout: 20,
    })
    if (res.statusCode < 200 || res.statusCode >= 300)
      return e.json(502, { error: 'Falha ao enviar pela Evolution API', status: res.statusCode })
    const payload = res.json || {}
    const msg = new Record($app.findCollectionByNameOrId('whatsapp_messages'))
    msg.set('conversation', body.conversation_id)
    if (body.customer_id) msg.set('customer', body.customer_id)
    msg.set('direction', 'out')
    msg.set('type', body.type || 'text')
    msg.set('content', body.message)
    msg.set('status', 'sent')
    msg.set('external_id', payload.key?.id || payload.messageId || '')
    msg.set('sent_at', new Date().toISOString())
    msg.set('owner', userId)
    $app.save(msg)
    try {
      const conv = $app.findRecordById('whatsapp_conversations', body.conversation_id)
      conv.set('last_message', body.message)
      conv.set('last_message_at', new Date().toISOString())
      $app.save(conv)
    } catch (_) {}
    return e.json(200, { ok: true, message: msg, provider: payload })
  },
  $apis.requireAuth(),
)
