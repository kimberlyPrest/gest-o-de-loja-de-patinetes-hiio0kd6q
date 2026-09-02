migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    let user
    try {
      user = app.findAuthRecordByEmail('_pb_users_auth_', 'kimberly@adapta.org')
    } catch (_) {
      user = new Record(users)
      user.setEmail('kimberly@adapta.org')
      user.setPassword('Skip@Pass')
      user.setVerified(true)
      user.set('name', 'Kimberly Adapta')
      app.save(user)
    }
    const owner = user.id
    const now = '2026-01-15 14:00:00.000Z'
    const customersCol = app.findCollectionByNameOrId('customers')
    const customerData = [
      [
        'cstjohn00000001',
        'João Mendes',
        '+5511991122334',
        'joao.mendes@email.com',
        'lead',
        'Busca autonomia para deslocamento executivo.',
      ],
      [
        'cstjane00000002',
        'Marina Costa',
        '+5511982233445',
        'marina.costa@email.com',
        'active',
        'Fez test drive e prefere acabamento grafite.',
      ],
      [
        'cstalex00000003',
        'Alex Ribeiro',
        '+5511973344556',
        'alex.ribeiro@email.com',
        'lead',
        'Interesse em modelo para trajetos longos e acessórios.',
      ],
    ]
    for (let i = 0; i < customerData.length; i++) {
      try {
        app.findFirstRecordByData('customers', 'phone', customerData[i][2])
      } catch (_) {
        const r = new Record(customersCol)
        r.set('id', customerData[i][0])
        r.set('name', customerData[i][1])
        r.set('phone', customerData[i][2])
        r.set('email', customerData[i][3])
        r.set('status', customerData[i][4])
        r.set('owner', owner)
        r.set('last_interaction', now)
        r.set('interaction_summary', customerData[i][5])
        app.save(r)
      }
    }
    const productsCol = app.findCollectionByNameOrId('products')
    const productData = [
      [
        'prdmodel0000001',
        'New Way Model S',
        'NW-MS-2026',
        8900,
        5650,
        5,
        { autonomia: '45 km', velocidade: '35 km/h', motor: '800W', peso: '21 kg' },
      ],
      [
        'prdexplr0000002',
        'New Way Explorer',
        'NW-EX-2026',
        12500,
        7900,
        2,
        {
          autonomia: '65 km',
          velocidade: '45 km/h',
          motor: '1200W',
          suspensao: 'Dupla hidráulica',
        },
      ],
      [
        'prdurban0000003',
        'New Way Urban X',
        'NW-UX-2026',
        7450,
        4800,
        8,
        { autonomia: '38 km', velocidade: '32 km/h', motor: '650W', peso: '18 kg' },
      ],
      [
        'prdhelmet000004',
        'Capacete Carbon One',
        'NW-HC-2026',
        890,
        390,
        1,
        { material: 'Fibra de carbono', tamanhos: 'P / M / G', peso: '980 g' },
      ],
    ]
    for (let i = 0; i < productData.length; i++) {
      try {
        app.findFirstRecordByData('products', 'sku', productData[i][2])
      } catch (_) {
        const r = new Record(productsCol)
        r.set('id', productData[i][0])
        r.set('name', productData[i][1])
        r.set('sku', productData[i][2])
        r.set('price', productData[i][3])
        r.set('internal_cost', productData[i][4])
        r.set('stock', productData[i][5])
        r.set('specs', productData[i][6])
        r.set('owner', owner)
        app.save(r)
      }
    }
    const dealsCol = app.findCollectionByNameOrId('deals')
    const deals = [
      [
        'dealnew00000001',
        'Model S · João',
        'cstjohn00000001',
        8900,
        'new',
        'Primeiro contato via Instagram.',
      ],
      [
        'dealcont0000002',
        'Urban X · Alex',
        'cstalex00000003',
        7450,
        'contact',
        'Catálogo enviado, aguardando retorno.',
      ],
      [
        'dealdriv0000003',
        'Explorer · Marina',
        'cstjane00000002',
        12500,
        'drive',
        'Test drive sábado às 10h.',
      ],
      [
        'dealnego0000004',
        'Model S + Kit',
        'cstjohn00000001',
        9790,
        'negotiation',
        'Condição em 10x apresentada.',
      ],
      [
        'dealwon00000005',
        'Explorer Premium',
        'cstjane00000002',
        13900,
        'won',
        'Venda concluída com acessórios.',
      ],
    ]
    for (let i = 0; i < deals.length; i++) {
      try {
        app.findFirstRecordByData('deals', 'title', deals[i][1])
      } catch (_) {
        const r = new Record(dealsCol)
        r.set('id', deals[i][0])
        r.set('title', deals[i][1])
        r.set('customer', deals[i][2])
        r.set('value', deals[i][3])
        r.set('stage', deals[i][4])
        r.set('owner', owner)
        r.set('last_contact', now)
        r.set('notes', deals[i][5])
        app.save(r)
      }
    }
    const interactionsCol = app.findCollectionByNameOrId('interactions')
    const interactionData = [
      [
        'intjohn00000001',
        'cstjohn00000001',
        'dealnew00000001',
        'whatsapp',
        'Cliente pediu simulação de financiamento.',
      ],
      [
        'intjane00000002',
        'cstjane00000002',
        'dealdriv0000003',
        'meeting',
        'Test drive confirmado; levar Explorer grafite.',
      ],
      [
        'intalex00000003',
        'cstalex00000003',
        'dealcont0000002',
        'call',
        'Apresentadas diferenças entre Urban X e Model S.',
      ],
    ]
    for (let i = 0; i < interactionData.length; i++) {
      try {
        app.findFirstRecordByData('interactions', 'id', interactionData[i][0])
      } catch (_) {
        const r = new Record(interactionsCol)
        r.set('id', interactionData[i][0])
        r.set('customer', interactionData[i][1])
        r.set('deal', interactionData[i][2])
        r.set('kind', interactionData[i][3])
        r.set('content', interactionData[i][4])
        r.set('owner', owner)
        r.set('occurred_at', now)
        app.save(r)
      }
    }
    const conversationsCol = app.findCollectionByNameOrId('whatsapp_conversations')
    const convs = [
      [
        'convjohn0000001',
        'cstjohn00000001',
        'João Mendes',
        '+5511991122334',
        'Consigo fazer um test drive amanhã?',
        2,
        'online',
      ],
      [
        'convjane0000002',
        'cstjane00000002',
        'Marina Costa',
        '+5511982233445',
        'Adorei o Explorer grafite!',
        0,
        'offline',
      ],
      [
        'convalex0000003',
        'cstalex00000003',
        'Alex Ribeiro',
        '+5511973344556',
        'Qual a autonomia real na cidade?',
        1,
        'online',
      ],
    ]
    for (let i = 0; i < convs.length; i++) {
      try {
        app.findFirstRecordByData('whatsapp_conversations', 'phone', convs[i][3])
      } catch (_) {
        const r = new Record(conversationsCol)
        r.set('id', convs[i][0])
        r.set('customer', convs[i][1])
        r.set('name', convs[i][2])
        r.set('phone', convs[i][3])
        r.set('last_message', convs[i][4])
        r.set('last_message_at', now)
        r.set('unread', convs[i][5])
        r.set('status', convs[i][6])
        r.set('owner', owner)
        app.save(r)
      }
    }
    const messagesCol = app.findCollectionByNameOrId('whatsapp_messages')
    const msgs = [
      [
        'msgjohn00000001',
        'convjohn0000001',
        'cstjohn00000001',
        'in',
        'Oi! Vi o Model S no catálogo e gostei muito.',
        'received',
      ],
      [
        'msgjohn00000002',
        'convjohn0000001',
        'cstjohn00000001',
        'out',
        'Olá, João! É uma excelente escolha. Posso separar uma unidade para você conhecer.',
        'read',
      ],
      [
        'msgjohn00000003',
        'convjohn0000001',
        'cstjohn00000001',
        'in',
        'Consigo fazer um test drive amanhã?',
        'received',
      ],
      [
        'msgjane00000001',
        'convjane0000002',
        'cstjane00000002',
        'out',
        'Marina, foi ótimo receber você hoje. O Explorer combinou com seu perfil.',
        'read',
      ],
      [
        'msgjane00000002',
        'convjane0000002',
        'cstjane00000002',
        'in',
        'Adorei o Explorer grafite!',
        'received',
      ],
    ]
    for (let i = 0; i < msgs.length; i++) {
      try {
        app.findFirstRecordByData('whatsapp_messages', 'id', msgs[i][0])
      } catch (_) {
        const r = new Record(messagesCol)
        r.set('id', msgs[i][0])
        r.set('conversation', msgs[i][1])
        r.set('customer', msgs[i][2])
        r.set('direction', msgs[i][3])
        r.set('type', 'text')
        r.set('content', msgs[i][4])
        r.set('status', msgs[i][5])
        r.set('sent_at', now)
        r.set('owner', owner)
        app.save(r)
      }
    }
    const txCol = app.findCollectionByNameOrId('transactions')
    const txs = [
      ['txincome0000001', 'income', 13900, 'Vendas', 'Venda Explorer Premium', 'dealwon00000005'],
      ['txrent000000002', 'expense', 4200, 'Aluguel', 'Aluguel do showroom', ''],
      ['txmarket0000003', 'expense', 1850, 'Marketing', 'Campanha de lançamento', ''],
    ]
    for (let i = 0; i < txs.length; i++) {
      try {
        app.findFirstRecordByData('transactions', 'id', txs[i][0])
      } catch (_) {
        const r = new Record(txCol)
        r.set('id', txs[i][0])
        r.set('type', txs[i][1])
        r.set('amount', txs[i][2])
        r.set('category', txs[i][3])
        r.set('description', txs[i][4])
        if (txs[i][5]) r.set('deal', txs[i][5])
        r.set('owner', owner)
        r.set('occurred_at', now)
        app.save(r)
      }
    }
    const fuCol = app.findCollectionByNameOrId('followups')
    const fus = [
      ['followjohn00001', 'cstjohn00000001', 'dealnew00000001', 'Confirmar test drive', 'whatsapp'],
      ['followalex00002', 'cstalex00000003', 'dealcont0000002', 'Retomar proposta Urban X', 'call'],
    ]
    for (let i = 0; i < fus.length; i++) {
      try {
        app.findFirstRecordByData('followups', 'id', fus[i][0])
      } catch (_) {
        const r = new Record(fuCol)
        r.set('id', fus[i][0])
        r.set('customer', fus[i][1])
        r.set('deal', fus[i][2])
        r.set('title', fus[i][3])
        r.set('channel', fus[i][4])
        r.set('due_at', now)
        r.set('status', 'pending')
        r.set('owner', owner)
        app.save(r)
      }
    }
  },
  (app) => {
    const cols = [
      'followups',
      'transactions',
      'whatsapp_messages',
      'whatsapp_conversations',
      'interactions',
      'deals',
      'products',
      'customers',
    ]
    for (let i = 0; i < cols.length; i++) {
      try {
        app.truncateCollection(app.findCollectionByNameOrId(cols[i]))
      } catch (_) {}
    }
    try {
      app.delete(app.findAuthRecordByEmail('_pb_users_auth_', 'kimberly@adapta.org'))
    } catch (_) {}
  },
)
