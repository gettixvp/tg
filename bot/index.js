require('dotenv').config()

const { Telegraf, Markup } = require('telegraf')

const BOT_TOKEN = process.env.BOT_TOKEN
const BOT_USERNAME = (process.env.BOT_USERNAME || '').replace(/^@/, '') || 'kvpoiskby_bot'
const WEBAPP_SHORTNAME = (process.env.WEBAPP_SHORTNAME || '').trim() || 'app'

if (!BOT_TOKEN) {
  console.error('Missing BOT_TOKEN in tg/bot/.env')
  process.exit(1)
}

const bot = new Telegraf(BOT_TOKEN)

function buildStartAppUrl(startParam) {
  // Telegram Mini App start link format
  // https://t.me/<botUsername>/<shortname>?startapp=<payload>
  return `https://t.me/${BOT_USERNAME}/${WEBAPP_SHORTNAME}?startapp=${encodeURIComponent(startParam)}`
}

function isValidTgId(x) {
  return /^\d{4,20}$/.test(String(x || ''))
}

bot.start(async (ctx) => {
  const payload = (ctx.startPayload || '').trim()

  const me = ctx.from
  const myId = me?.id

  const lines = []
  lines.push('Кошелёк: мини‑приложение в Telegram.')

  if (payload) {
    lines.push('')
    lines.push('Похоже, вы пришли по приглашению.')
    lines.push('Нажмите кнопку ниже, чтобы открыть приложение и автоматически подключиться.')

    const url = buildStartAppUrl(payload)

    return ctx.reply(lines.join('\n'),
      Markup.inlineKeyboard([
        Markup.button.url('Открыть кошелёк', url),
      ])
    )
  }

  // No payload: provide self invite link
  if (isValidTgId(myId)) {
    const startParam = `tg_${myId}`
    const url = buildStartAppUrl(startParam)
    lines.push('')
    lines.push('Ваша личная ссылка-приглашение:')

    return ctx.reply(lines.join('\n'),
      Markup.inlineKeyboard([
        Markup.button.url('Открыть кошелёк', url),
      ])
    )
  }

  return ctx.reply(lines.join('\n'))
})

bot.command('invite', async (ctx) => {
  const me = ctx.from
  const myId = me?.id

  if (!isValidTgId(myId)) {
    return ctx.reply('Не удалось определить ваш Telegram ID')
  }

  const startParam = `tg_${myId}`
  const url = buildStartAppUrl(startParam)

  return ctx.reply(
    'Ссылка-приглашение готова. Отправьте её другу в Telegram:',
    Markup.inlineKeyboard([
      Markup.button.url('Пригласить (открыть ссылку)', url),
    ])
  )
})

bot.command('link', async (ctx) => {
  // /link <tg_user_id>
  const text = (ctx.message?.text || '').trim()
  const parts = text.split(/\s+/)
  const tgId = parts[1]

  if (!isValidTgId(tgId)) {
    return ctx.reply('Использование: /link <tg_user_id>')
  }

  const startParam = `tg_${tgId}`
  const url = buildStartAppUrl(startParam)

  return ctx.reply(
    `Вот ссылка для подключения к пользователю TG ${tgId}:`,
    Markup.inlineKeyboard([
      Markup.button.url('Открыть кошелёк', url),
    ])
  )
})

bot.command('help', async (ctx) => {
  return ctx.reply(
    [
      'Команды:',
      '/start — открыть',
      '/invite — получить свою ссылку-приглашение',
      '/link <tg_user_id> — выдать ссылку для подключения к указанному TG ID',
    ].join('\n')
  )
})

bot.catch((err, ctx) => {
  console.error('Bot error', err)
})

bot.launch()
  .then(() => console.log('✅ Bot started'))
  .catch((e) => {
    console.error('Failed to start bot', e)
    process.exit(1)
  })

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
