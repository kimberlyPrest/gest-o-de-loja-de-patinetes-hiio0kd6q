migrate(
  (app) => {
    const authOnly = "@request.auth.id != ''"
    const usersId = '_pb_users_auth_'

    const customers = new Collection({
      name: 'customers',
      type: 'base',
      listRule: authOnly,
      viewRule: authOnly,
      createRule: authOnly,
      updateRule: authOnly,
      deleteRule: authOnly,
      fields: [
        { name: 'name', type: 'text', required: true, max: 160 },
        { name: 'phone', type: 'text', required: true, max: 30 },
        { name: 'email', type: 'email' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['lead', 'active', 'inactive'],
          maxSelect: 1,
        },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'last_interaction', type: 'date' },
        { name: 'interaction_summary', type: 'text', max: 4000 },
        { name: 'vector', type: 'vector', dimensions: 1536, distance: 'cosine' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_customers_phone ON customers (phone)',
        'CREATE INDEX idx_customers_owner ON customers (owner)',
        'CREATE INDEX idx_customers_status ON customers (status)',
      ],
    })
    app.save(customers)

    const products = new Collection({
      name: 'products',
      type: 'base',
      listRule: authOnly,
      viewRule: authOnly,
      createRule: authOnly,
      updateRule: authOnly,
      deleteRule: authOnly,
      fields: [
        { name: 'name', type: 'text', required: true, max: 180 },
        { name: 'sku', type: 'text', required: true, max: 80 },
        { name: 'price', type: 'number', required: true, min: 0 },
        { name: 'internal_cost', type: 'number', min: 0 },
        { name: 'stock', type: 'number', required: true, min: 0, onlyInt: true },
        {
          name: 'images',
          type: 'file',
          maxSelect: 6,
          maxSize: 10485760,
          mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        },
        { name: 'specs', type: 'json', maxSize: 30000 },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_products_sku ON products (sku)',
        'CREATE INDEX idx_products_stock ON products (stock)',
        'CREATE INDEX idx_products_owner ON products (owner)',
      ],
    })
    app.save(products)

    const deals = new Collection({
      name: 'deals',
      type: 'base',
      listRule: authOnly,
      viewRule: authOnly,
      createRule: authOnly,
      updateRule: authOnly,
      deleteRule: authOnly,
      fields: [
        { name: 'title', type: 'text', required: true, max: 200 },
        {
          name: 'customer',
          type: 'relation',
          required: true,
          collectionId: customers.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'value', type: 'number', required: true, min: 0 },
        {
          name: 'stage',
          type: 'select',
          required: true,
          values: ['new', 'contact', 'drive', 'negotiation', 'won', 'lost'],
          maxSelect: 1,
        },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'last_contact', type: 'date' },
        { name: 'follow_up_at', type: 'date' },
        { name: 'notes', type: 'text', max: 5000 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_deals_stage ON deals (stage)',
        'CREATE INDEX idx_deals_owner ON deals (owner)',
        'CREATE INDEX idx_deals_customer ON deals (customer)',
      ],
    })
    app.save(deals)

    const transactions = new Collection({
      name: 'transactions',
      type: 'base',
      listRule: authOnly,
      viewRule: authOnly,
      createRule: authOnly,
      updateRule: authOnly,
      deleteRule: authOnly,
      fields: [
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['income', 'expense'],
          maxSelect: 1,
        },
        { name: 'amount', type: 'number', required: true, min: 0 },
        { name: 'category', type: 'text', required: true, max: 80 },
        { name: 'description', type: 'text', max: 240 },
        {
          name: 'deal',
          type: 'relation',
          collectionId: deals.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'occurred_at', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_transactions_owner ON transactions (owner)',
        'CREATE INDEX idx_transactions_date ON transactions (occurred_at)',
      ],
    })
    app.save(transactions)

    const conversations = new Collection({
      name: 'whatsapp_conversations',
      type: 'base',
      listRule: authOnly,
      viewRule: authOnly,
      createRule: authOnly,
      updateRule: authOnly,
      deleteRule: authOnly,
      fields: [
        {
          name: 'customer',
          type: 'relation',
          collectionId: customers.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'name', type: 'text', required: true, max: 160 },
        { name: 'phone', type: 'text', required: true, max: 30 },
        { name: 'last_message', type: 'text', max: 1000 },
        { name: 'last_message_at', type: 'date' },
        { name: 'unread', type: 'number', min: 0, onlyInt: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['online', 'offline', 'typing'],
          maxSelect: 1,
        },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE UNIQUE INDEX idx_whatsapp_phone ON whatsapp_conversations (phone)',
        'CREATE INDEX idx_whatsapp_owner ON whatsapp_conversations (owner)',
      ],
    })
    app.save(conversations)

    const messages = new Collection({
      name: 'whatsapp_messages',
      type: 'base',
      listRule: authOnly,
      viewRule: authOnly,
      createRule: authOnly,
      updateRule: authOnly,
      deleteRule: authOnly,
      fields: [
        {
          name: 'conversation',
          type: 'relation',
          required: true,
          collectionId: conversations.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'customer',
          type: 'relation',
          collectionId: customers.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'direction', type: 'select', required: true, values: ['in', 'out'], maxSelect: 1 },
        {
          name: 'type',
          type: 'select',
          required: true,
          values: ['text', 'image', 'audio'],
          maxSelect: 1,
        },
        { name: 'content', type: 'text', max: 10000 },
        { name: 'media', type: 'file', maxSelect: 1, maxSize: 26214400 },
        { name: 'media_url', type: 'url' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['sent', 'delivered', 'read', 'received', 'failed'],
          maxSelect: 1,
        },
        { name: 'external_id', type: 'text', max: 200 },
        { name: 'sent_at', type: 'date', required: true },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_messages_conversation_sent ON whatsapp_messages (conversation, sent_at)',
        'CREATE INDEX idx_messages_external ON whatsapp_messages (external_id)',
      ],
    })
    app.save(messages)

    const interactions = new Collection({
      name: 'interactions',
      type: 'base',
      listRule: authOnly,
      viewRule: authOnly,
      createRule: authOnly,
      updateRule: authOnly,
      deleteRule: authOnly,
      fields: [
        {
          name: 'customer',
          type: 'relation',
          required: true,
          collectionId: customers.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'deal',
          type: 'relation',
          collectionId: deals.id,
          cascadeDelete: false,
          maxSelect: 1,
        },
        {
          name: 'kind',
          type: 'select',
          required: true,
          values: ['note', 'call', 'whatsapp', 'email', 'meeting', 'stage_change'],
          maxSelect: 1,
        },
        { name: 'content', type: 'text', required: true, max: 5000 },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'occurred_at', type: 'date', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE INDEX idx_interactions_customer ON interactions (customer, occurred_at)'],
    })
    app.save(interactions)

    const followups = new Collection({
      name: 'followups',
      type: 'base',
      listRule: authOnly,
      viewRule: authOnly,
      createRule: authOnly,
      updateRule: authOnly,
      deleteRule: authOnly,
      fields: [
        {
          name: 'customer',
          type: 'relation',
          required: true,
          collectionId: customers.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'deal',
          type: 'relation',
          collectionId: deals.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        { name: 'title', type: 'text', required: true, max: 240 },
        {
          name: 'channel',
          type: 'select',
          required: true,
          values: ['whatsapp', 'call', 'email'],
          maxSelect: 1,
        },
        { name: 'due_at', type: 'date', required: true },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pending', 'done', 'overdue'],
          maxSelect: 1,
        },
        {
          name: 'owner',
          type: 'relation',
          required: true,
          collectionId: usersId,
          cascadeDelete: false,
          maxSelect: 1,
        },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: [
        'CREATE INDEX idx_followups_due ON followups (status, due_at)',
        'CREATE INDEX idx_followups_owner ON followups (owner)',
      ],
    })
    app.save(followups)
  },
  (app) => {
    const names = [
      'followups',
      'interactions',
      'whatsapp_messages',
      'whatsapp_conversations',
      'transactions',
      'deals',
      'products',
      'customers',
    ]
    for (let i = 0; i < names.length; i++) {
      try {
        app.delete(app.findCollectionByNameOrId(names[i]))
      } catch (_) {}
    }
  },
)
