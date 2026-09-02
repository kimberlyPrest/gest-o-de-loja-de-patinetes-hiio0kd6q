routerAdd(
  'POST',
  '/backend/v1/ai/scooter-pro',
  (e) => {
    try {
      const body = e.requestInfo().body || {}
      const userId = e.auth?.id
      if (!userId) return e.unauthorizedError('Autenticação necessária')
      if (!body.message || !String(body.message).trim())
        return e.badRequestError('Mensagem obrigatória')
      const result = $ai
        .agent('scooter-pro')
        .chat({
          user_id: userId,
          conversation_id: body.conversation_id || null,
          message: String(body.message),
        })
      return e.json(200, result)
    } catch (err) {
      if (err instanceof SkipAiConfigError)
        return e.json(503, { error: 'Assistente temporariamente indisponível' })
      if (err instanceof SkipAiAgentsError || err instanceof SkipAiError) {
        const status = err.status || 500
        return e.json(status, {
          error: status >= 500 ? 'Não foi possível consultar o assistente' : err.message,
        })
      }
      throw err
    }
  },
  $apis.requireAuth(),
)
