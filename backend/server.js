// server.js
require("dotenv").config()
const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const fetch = require("node-fetch")
const crypto = require('crypto')
const pool = require("./db")

const app = express()
app.set('trust proxy', true)
app.use(express.json())
app.use(cors())

function getClientIp(req) {
  try {
    const xff = req.headers['x-forwarded-for']
    if (xff) {
      const first = String(xff).split(',')[0].trim()
      if (first) return first
    }
    const xri = req.headers['x-real-ip']
    if (xri) return String(xri).trim()
    const ip = req.ip
    if (ip) return ip
    const ra = req.socket?.remoteAddress
    return ra || null
  } catch (e) {
    return req.ip || null
  }
}

async function callCloudflareChat({ apiToken, accountId, model, messages }) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`

  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.6,
    }),
  })

  if (!resp.ok) {
    const text = await resp.text().catch(() => '')
    throw new Error(`Cloudflare Workers AI error: ${resp.status} ${text}`)
  }

  const json = await resp.json()
  if (json && json.success === false) {
    throw new Error(`Cloudflare Workers AI error: ${JSON.stringify(json.errors || json)}`)
  }

  // Cloudflare returns OpenAI-like response under result
  return json.result || json
}

// --- Получить лайки для кошелька ---
app.get('/api/likes', async (req, res) => {
  const { wallet_email } = req.query
  if (!wallet_email) return res.status(400).json({ error: 'wallet_email обязателен' })

  try {
    const r = await pool.query(
      `SELECT transaction_id, liker_key
       FROM transaction_likes
       WHERE wallet_email = $1`,
      [wallet_email],
    )

    const likesByTx = {}

    for (const row of r.rows) {
      const txId = String(row.transaction_id)
      const liker = String(row.liker_key)
      if (!likesByTx[txId]) likesByTx[txId] = []
      likesByTx[txId].push(liker)
    }

    res.json({ success: true, likesByTx })
  } catch (e) {
    console.error('Likes get error:', e)
    res.status(500).json({ error: 'Ошибка получения лайков: ' + e.message })
  }
})

// --- Toggle лайк ---
app.post('/api/likes/toggle', async (req, res) => {
  const { wallet_email, transaction_id, liker_key } = req.body || {}
  if (!wallet_email || !transaction_id || !liker_key) {
    return res.status(400).json({ error: 'wallet_email, transaction_id, liker_key обязательны' })
  }

  try {
    const del = await pool.query(
      `DELETE FROM transaction_likes
       WHERE wallet_email=$1 AND transaction_id=$2::bigint AND liker_key=$3
       RETURNING id`,
      [wallet_email, String(transaction_id), String(liker_key)],
    )

    if (del.rowCount > 0) {
      return res.json({ success: true, liked: false })
    }

    await pool.query(
      `INSERT INTO transaction_likes (wallet_email, transaction_id, liker_key)
       VALUES ($1, $2::bigint, $3)
       ON CONFLICT (wallet_email, transaction_id, liker_key) DO NOTHING`,
      [wallet_email, String(transaction_id), String(liker_key)],
    )

    res.json({ success: true, liked: true })
  } catch (e) {
    console.error('Likes toggle error:', e)
    res.status(500).json({ error: 'Ошибка лайка: ' + e.message })
  }
})

// --- Список заблокированных участников ---
app.get("/api/wallet/:ownerEmail/blocked", async (req, res) => {
  const { ownerEmail } = req.params
  if (!ownerEmail) return res.status(400).json({ error: "ownerEmail обязателен" })

  try {
    const r = await pool.query(
      `SELECT wm.owner_email,
              wm.member_telegram_id,
              COALESCE(ta.telegram_name, '') AS telegram_name,
              COALESCE(ta.photo_url, '') AS photo_url,
              ta.last_seen_at,
              ta.last_ip,
              ta.last_user_agent,
              wm.status,
              wm.created_at,
              wm.updated_at,
              'member'::text AS role
       FROM wallet_members wm
       LEFT JOIN telegram_accounts ta ON ta.telegram_id = wm.member_telegram_id
       WHERE wm.owner_email = $1 AND wm.status = 'blocked'
       ORDER BY wm.updated_at DESC`,
      [ownerEmail],
    )
    res.json({ success: true, members: r.rows })
  } catch (e) {
    console.error('Wallet blocked members get error:', e)
    res.status(500).json({ error: 'Ошибка получения заблокированных: ' + e.message })
  }
})

// --- Разблокировать участника ---
app.post("/api/wallet/:ownerEmail/unblock/:telegramId", async (req, res) => {
  const { ownerEmail, telegramId } = req.params
  if (!ownerEmail || !telegramId) return res.status(400).json({ error: 'ownerEmail и telegramId обязательны' })

  try {
    const r = await pool.query(
      `UPDATE wallet_members SET status='active', updated_at=NOW() WHERE owner_email=$1 AND member_telegram_id=$2::bigint RETURNING *`,
      [ownerEmail, String(telegramId)],
    )
    if (r.rowCount === 0) return res.status(404).json({ error: 'Участник не найден' })
    res.json({ success: true })
  } catch (e) {
    console.error('Wallet member unblock error:', e)
    res.status(500).json({ error: 'Ошибка разблокировки: ' + e.message })
  }
})

// --- Создать одноразовый инвайт ---
app.post('/api/invite/create', async (req, res) => {
  const { owner_email, created_by_telegram_id } = req.body || {}
  if (!owner_email) return res.status(400).json({ error: 'owner_email обязателен' })

  try {
    const token = crypto.randomBytes(16).toString('hex')
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24) // 24h
    await pool.query(
      `INSERT INTO invite_tokens (token, owner_email, created_by_telegram_id, expires_at)
       VALUES ($1, $2, $3::bigint, $4)`,
      [token, owner_email, created_by_telegram_id ? String(created_by_telegram_id) : null, expiresAt],
    )
    res.json({ success: true, token })
  } catch (e) {
    console.error('Invite create error:', e)
    res.status(500).json({ error: 'Не удалось создать приглашение: ' + e.message })
  }
})

// --- Использовать одноразовый инвайт ---
app.post('/api/invite/consume', async (req, res) => {
  const { token, currentTelegramId, currentEmail, currentUserName } = req.body || {}
  if (!token || !currentTelegramId) return res.status(400).json({ error: 'token и currentTelegramId обязательны' })

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const inv = await client.query(
      `SELECT token, owner_email, used_at, used_by_telegram_id, expires_at
       FROM invite_tokens
       WHERE token = $1
       FOR UPDATE`,
      [token],
    )

    if (inv.rowCount === 0) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Приглашение не найдено' })
    }

    const row = inv.rows[0]
    if (row.used_at || row.used_by_telegram_id) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'Приглашение уже использовано' })
    }
    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
      await client.query('ROLLBACK')
      return res.status(410).json({ error: 'Срок действия приглашения истёк' })
    }

    // Enforce blocked users cannot join
    const statusCheck = await client.query(
      `SELECT status FROM wallet_members WHERE owner_email=$1 AND member_telegram_id=$2::bigint`,
      [row.owner_email, String(currentTelegramId)],
    )
    if (statusCheck.rowCount > 0 && statusCheck.rows[0].status === 'blocked') {
      await client.query('ROLLBACK')
      return res.status(403).json({ error: 'Вас заблокировали в этом кошельке' })
    }

    await client.query(
      `UPDATE invite_tokens SET used_at = NOW(), used_by_telegram_id = $2::bigint WHERE token = $1`,
      [token, String(currentTelegramId)],
    )

    // Persist membership + active wallet for invited user
    await client.query(
      `INSERT INTO telegram_accounts (telegram_id, telegram_name, wallet_email, email, active_wallet_email)
       VALUES ($1::bigint, $2, $3, $4, $5)
       ON CONFLICT (telegram_id)
       DO UPDATE SET
         telegram_name = COALESCE(EXCLUDED.telegram_name, telegram_accounts.telegram_name),
         wallet_email = COALESCE(telegram_accounts.wallet_email, EXCLUDED.wallet_email),
         email = COALESCE(EXCLUDED.email, telegram_accounts.email),
         active_wallet_email = EXCLUDED.active_wallet_email,
         updated_at = NOW()`,
      [
        String(currentTelegramId),
        currentUserName || null,
        `tg_${String(currentTelegramId)}@telegram.user`,
        currentEmail || null,
        row.owner_email,
      ],
    )

    await client.query(
      `INSERT INTO wallet_members (owner_email, member_telegram_id, status)
       VALUES ($1, $2::bigint, 'active')
       ON CONFLICT (owner_email, member_telegram_id)
       DO UPDATE SET status='active', updated_at=NOW()`,
      [row.owner_email, String(currentTelegramId)],
    )

    await client.query('COMMIT')
    res.json({ success: true, walletEmail: row.owner_email })
  } catch (e) {
    try {
      await client.query('ROLLBACK')
    } catch (err) {
      // ignore
    }
    console.error('Invite consume error:', e)
    res.status(500).json({ error: 'Не удалось применить приглашение: ' + e.message })
  } finally {
    client.release()
  }
})

// --- Авто-регистрация Telegram аккаунта ---
app.post("/api/telegram/ensure", async (req, res) => {
  const { telegram_id, telegram_name, photo_url } = req.body || {}

  if (!telegram_id) return res.status(400).json({ error: "telegram_id обязателен" })

  try {
    const tgId = String(telegram_id)
    const walletEmail = `tg_${tgId}@telegram.user`

    await pool.query(
      `INSERT INTO telegram_accounts (telegram_id, telegram_name, photo_url, last_seen_at, last_ip, last_user_agent)
       VALUES ($1::bigint, $2, $3, NOW(), $4, $5)
       ON CONFLICT (telegram_id) DO UPDATE
       SET telegram_name = COALESCE(EXCLUDED.telegram_name, telegram_accounts.telegram_name),
           photo_url = COALESCE(EXCLUDED.photo_url, telegram_accounts.photo_url),
           last_seen_at = NOW(),
           last_ip = EXCLUDED.last_ip,
           last_user_agent = EXCLUDED.last_user_agent,
           updated_at = NOW()`,
      [tgId, telegram_name || null, photo_url || null, getClientIp(req), String(req.headers['user-agent'] || '')],
    )

    // Ensure wallet_email is set (Telegram-first identity)
    await pool.query(
      `UPDATE telegram_accounts
       SET wallet_email = COALESCE(wallet_email, $2), updated_at = NOW()
       WHERE telegram_id = $1::bigint`,
      [tgId, walletEmail],
    )

    const r = await pool.query(
      `SELECT telegram_id, telegram_name, email, active_wallet_email, status
       , wallet_email, photo_url, last_seen_at, last_ip, last_user_agent
       FROM telegram_accounts WHERE telegram_id = $1::bigint`,
      [tgId],
    )

    res.json({ success: true, telegramAccount: r.rows[0] })
  } catch (e) {
    console.error("Telegram ensure error:", e)
    res.status(500).json({ error: "Ошибка Telegram регистрации: " + e.message })
  }
})

// --- Telegram-first login (no email required) ---
app.post("/api/telegram/login", async (req, res) => {
  const { telegram_id, telegram_name, photo_url } = req.body || {}
  if (!telegram_id) return res.status(400).json({ error: "telegram_id обязателен" })

  try {
    const tgId = String(telegram_id)
    const walletEmail = `tg_${tgId}@telegram.user`

    // Ensure telegram account exists and wallet_email is set
    await pool.query(
      `INSERT INTO telegram_accounts (telegram_id, telegram_name, wallet_email, photo_url, last_seen_at, last_ip, last_user_agent)
       VALUES ($1::bigint, $2, $3, $4, NOW(), $5, $6)
       ON CONFLICT (telegram_id) DO UPDATE
       SET telegram_name = COALESCE(EXCLUDED.telegram_name, telegram_accounts.telegram_name),
           wallet_email = COALESCE(telegram_accounts.wallet_email, EXCLUDED.wallet_email),
           photo_url = COALESCE(EXCLUDED.photo_url, telegram_accounts.photo_url),
           last_seen_at = NOW(),
           last_ip = EXCLUDED.last_ip,
           last_user_agent = EXCLUDED.last_user_agent,
           updated_at = NOW()`,
      [tgId, telegram_name || null, walletEmail, photo_url || null, getClientIp(req), String(req.headers['user-agent'] || '')],
    )

    // Create user profile for this wallet if missing
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [walletEmail])
    if (existing.rowCount === 0) {
      await pool.query(
        `INSERT INTO users (email, password_hash, first_name, balance, income, expenses, savings_usd, goal_savings)
         VALUES ($1, NULL, $2, 0, 0, 0, 0, 50000)`,
        [walletEmail, telegram_name || 'Пользователь'],
      )
    }

    const userRes = await pool.query("SELECT * FROM users WHERE email = $1", [walletEmail])
    const tx = await pool.query("SELECT * FROM transactions WHERE user_email = $1 ORDER BY date DESC", [walletEmail])

    const tgAcc = await pool.query(
      `SELECT telegram_id, telegram_name, email, active_wallet_email, wallet_email, status
       , photo_url, last_seen_at, last_ip, last_user_agent
       FROM telegram_accounts WHERE telegram_id = $1::bigint`,
      [tgId],
    )

    res.json({
      success: true,
      user: convertUser(userRes.rows[0]),
      transactions: tx.rows,
      telegramAccount: tgAcc.rows[0],
    })
  } catch (e) {
    console.error("Telegram login error:", e)
    res.status(500).json({ error: "Ошибка Telegram входа: " + e.message })
  }
})

// --- Выйти из семейного аккаунта (вернуться к своему) ---
app.post("/api/wallet/leave", async (req, res) => {
  const { telegram_id } = req.body || {}
  if (!telegram_id) return res.status(400).json({ error: "telegram_id обязателен" })

  try {
    await pool.query(
      `UPDATE telegram_accounts SET active_wallet_email = NULL, updated_at = NOW() WHERE telegram_id = $1::bigint`,
      [String(telegram_id)],
    )
    res.json({ success: true })
  } catch (e) {
    console.error("Wallet leave error:", e)
    res.status(500).json({ error: "Ошибка выхода: " + e.message })
  }
})

// --- Список участников кошелька владельца ---
app.get("/api/wallet/:ownerEmail/members", async (req, res) => {
  const { ownerEmail } = req.params
  if (!ownerEmail) return res.status(400).json({ error: "ownerEmail обязателен" })

  try {
    const ownerTgId = (() => {
      const m = String(ownerEmail || '').match(/^tg_(\d+)@telegram\.user$/)
      return m ? m[1] : null
    })()

    try {
      const r = await pool.query(
        `WITH members AS (
           SELECT wm.owner_email,
                  wm.member_telegram_id,
                  COALESCE(ta.telegram_name, '') AS telegram_name,
                  COALESCE(ta.photo_url, '') AS photo_url,
                  ta.last_seen_at,
                  ta.last_ip,
                  ta.last_user_agent,
                  wm.status,
                  wm.created_at,
                  wm.updated_at,
                  'member'::text AS role,
                  1::int AS sort_order
           FROM wallet_members wm
           LEFT JOIN telegram_accounts ta ON ta.telegram_id = wm.member_telegram_id
           WHERE wm.owner_email = $1
         ), owner_row AS (
           SELECT $1::text AS owner_email,
                  $2::bigint AS member_telegram_id,
                  COALESCE(ta.telegram_name, '') AS telegram_name,
                  COALESCE(ta.photo_url, '') AS photo_url,
                  ta.last_seen_at,
                  ta.last_ip,
                  ta.last_user_agent,
                  'active'::text AS status,
                  NOW() AS created_at,
                  NOW() AS updated_at,
                  'owner'::text AS role,
                  0::int AS sort_order
           FROM telegram_accounts ta
           WHERE $2::bigint IS NOT NULL
             AND ta.telegram_id = $2::bigint
             AND NOT EXISTS (
               SELECT 1 FROM wallet_members wm2 WHERE wm2.owner_email = $1 AND wm2.member_telegram_id = $2::bigint
             )
         )
         SELECT * FROM owner_row
         UNION ALL
         SELECT * FROM members
         ORDER BY sort_order, created_at`,
        [ownerEmail, ownerTgId],
      )
      res.json({ success: true, members: r.rows })
    } catch (e) {
      // Fallback for older DBs where new columns might not exist yet
      const msg = String(e && e.message ? e.message : '')
      const needsFallback =
        msg.includes('column') &&
        (msg.includes('photo_url') || msg.includes('last_seen_at') || msg.includes('last_ip') || msg.includes('last_user_agent'))

      if (!needsFallback) throw e

      const r2 = await pool.query(
        `WITH members AS (
           SELECT wm.owner_email,
                  wm.member_telegram_id,
                  COALESCE(ta.telegram_name, '') AS telegram_name,
                  ''::text AS photo_url,
                  NULL::timestamp AS last_seen_at,
                  NULL::text AS last_ip,
                  NULL::text AS last_user_agent,
                  wm.status,
                  wm.created_at,
                  wm.updated_at,
                  'member'::text AS role,
                  1::int AS sort_order
           FROM wallet_members wm
           LEFT JOIN telegram_accounts ta ON ta.telegram_id = wm.member_telegram_id
           WHERE wm.owner_email = $1
         ), owner_row AS (
           SELECT $1::text AS owner_email,
                  $2::bigint AS member_telegram_id,
                  COALESCE(ta.telegram_name, '') AS telegram_name,
                  ''::text AS photo_url,
                  NULL::timestamp AS last_seen_at,
                  NULL::text AS last_ip,
                  NULL::text AS last_user_agent,
                  'active'::text AS status,
                  NOW() AS created_at,
                  NOW() AS updated_at,
                  'owner'::text AS role,
                  0::int AS sort_order
           FROM telegram_accounts ta
           WHERE $2::bigint IS NOT NULL
             AND ta.telegram_id = $2::bigint
             AND NOT EXISTS (
               SELECT 1 FROM wallet_members wm2 WHERE wm2.owner_email = $1 AND wm2.member_telegram_id = $2::bigint
             )
         )
         SELECT * FROM owner_row
         UNION ALL
         SELECT * FROM members
         ORDER BY sort_order, created_at`,
        [ownerEmail, ownerTgId],
      )
      res.json({ success: true, members: r2.rows })
    }
  } catch (e) {
    // Safety net: on partially migrated DBs, tables might be missing.
    // Don't crash the whole mini-app; return at least an owner row.
    const msg = String(e && e.message ? e.message : '')
    if (msg.includes('relation') && (msg.includes('telegram_accounts') || msg.includes('wallet_members'))) {
      const ownerTgId = (() => {
        const m = String(ownerEmail || '').match(/^tg_(\d+)@telegram\.user$/)
        return m ? m[1] : null
      })()
      return res.json({
        success: true,
        members: ownerTgId
          ? [
              {
                owner_email: ownerEmail,
                member_telegram_id: Number(ownerTgId),
                telegram_name: '',
                photo_url: '',
                last_seen_at: null,
                last_ip: null,
                last_user_agent: null,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                role: 'owner',
              },
            ]
          : [],
      })
    }

    console.error("Wallet members get error:", e)
    res.status(500).json({ error: "Ошибка получения участников: " + e.message })
  }
})

// --- Удалить участника кошелька ---
app.delete("/api/wallet/:ownerEmail/members/:telegramId", async (req, res) => {
  const { ownerEmail, telegramId } = req.params
  if (!ownerEmail || !telegramId) return res.status(400).json({ error: "ownerEmail и telegramId обязательны" })

  try {
    const del = await pool.query(
      `DELETE FROM wallet_members WHERE owner_email=$1 AND member_telegram_id=$2::bigint RETURNING *`,
      [ownerEmail, String(telegramId)],
    )
    if (del.rowCount === 0) return res.status(404).json({ error: "Участник не найден" })

    // Force exit from this wallet
    await pool.query(
      `UPDATE telegram_accounts SET active_wallet_email = NULL, updated_at = NOW()
       WHERE telegram_id = $1::bigint AND active_wallet_email = $2`,
      [String(telegramId), ownerEmail],
    )

    res.json({ success: true })
  } catch (e) {
    console.error("Wallet member delete error:", e)
    res.status(500).json({ error: "Ошибка удаления: " + e.message })
  }
})

// --- Изменить статус участника (active/blocked) ---
app.put("/api/wallet/:ownerEmail/members/:telegramId/status", async (req, res) => {
  const { ownerEmail, telegramId } = req.params
  const { status } = req.body || {}
  if (!ownerEmail || !telegramId) return res.status(400).json({ error: "ownerEmail и telegramId обязательны" })
  if (status !== 'active' && status !== 'blocked') return res.status(400).json({ error: "Неверный status" })

  try {
    const r = await pool.query(
      `UPDATE wallet_members SET status=$1, updated_at=NOW() WHERE owner_email=$2 AND member_telegram_id=$3::bigint RETURNING *`,
      [status, ownerEmail, String(telegramId)],
    )
    if (r.rowCount === 0) return res.status(404).json({ error: "Участник не найден" })

    // If blocked - also force exit from that wallet
    if (status === 'blocked') {
      await pool.query(
        `UPDATE telegram_accounts SET active_wallet_email = NULL, updated_at = NOW()
         WHERE telegram_id = $1::bigint AND active_wallet_email = $2`,
        [String(telegramId), ownerEmail],
      )
    }

    res.json({ success: true, member: r.rows[0] })
  } catch (e) {
    console.error("Wallet member status error:", e)
    res.status(500).json({ error: "Ошибка обновления статуса: " + e.message })
  }
})

// --- Health check ---
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    build_id: (process.env.BUILD_ID || process.env.RENDER_GIT_COMMIT || "").toString(),
  })
})

// --- ПИНГ ДЛЯ RENDER (чтобы не засыпал) ---
app.get("/ping", (req, res) => {
  res.send("pong");
});

// --- AI finance analyzer (Cloudflare Workers AI via backend proxy) ---
app.post('/api/ai/analyze', async (req, res) => {
  const { user_email, message } = req.body || {}

  if (!user_email) {
    return res.status(400).json({ error: 'user_email обязателен' })
  }

  const accountId = (process.env.CF_ACCOUNT_ID || '').trim()
  const apiToken = (process.env.CF_API_TOKEN || '').trim()
  const model = (process.env.CF_AI_MODEL || '@cf/meta/llama-3.1-8b-instruct').trim()

  if (!accountId || !apiToken) {
    return res.status(500).json({
      error: 'Cloudflare AI is not configured on server (CF_ACCOUNT_ID/CF_API_TOKEN)',
    })
  }

  try {
    const userRes = await pool.query('SELECT * FROM users WHERE email = $1', [user_email])
    if (userRes.rowCount === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }
    const user = userRes.rows[0]

    const txRes = await pool.query(
      'SELECT * FROM transactions WHERE user_email = $1 ORDER BY date DESC LIMIT 200',
      [user_email],
    )
    const transactions = txRes.rows || []

    const totals = transactions.reduce(
      (acc, t) => {
        const amt = Number(t.amount || 0)
        if (t.type === 'income') acc.income += amt
        else if (t.type === 'expense') acc.expenses += amt
        else if (t.type === 'savings') acc.savings += amt
        return acc
      },
      { income: 0, expenses: 0, savings: 0 },
    )

    const topExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => {
        const cat = t.category || 'Другое'
        acc[cat] = (acc[cat] || 0) + Number(t.amount || 0)
        return acc
      }, {})

    const topExpensesArr = Object.entries(topExpenses)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    const system =
      'Ты — финансовый консультант. Дай конкретные рекомендации по экономии, планированию бюджета и улучшению привычек. ' +
      'Отвечай по-русски. Структурируй: 1) краткий вывод, 2) 5-10 конкретных советов, 3) 3 риска/ошибки, 4) план на 7 дней. '

    const context = {
      user: {
        email: user.email,
        balance: Number(user.balance || 0),
        income: Number(user.income || 0),
        expenses: Number(user.expenses || 0),
        savings_usd: Number(user.savings_usd || 0),
        goal_savings: Number(user.goal_savings || 0),
      },
      recentTotals: totals,
      topExpenseCategories: topExpensesArr,
      recentTransactions: transactions.slice(0, 30).map((t) => ({
        type: t.type,
        amount: Number(t.amount || 0),
        category: t.category,
        description: t.description,
        date: t.date || t.created_at,
      })),
    }

    const userPrompt =
      (message && String(message).trim()) ||
      'Проанализируй мои финансы и дай советы. Если данных мало — предложи, что начать отслеживать.'

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: `Данные пользователя (JSON):\n${JSON.stringify(context)}` },
      { role: 'user', content: userPrompt },
    ]

    const cf = await callCloudflareChat({ apiToken, accountId, model, messages })
    const content = cf?.choices?.[0]?.message?.content || ''

    res.json({ success: true, content })
  } catch (e) {
    console.error('AI analyze error:', e)
    res.status(500).json({ error: 'Ошибка AI: ' + e.message })
  }
})

// --- Получить пользователя ---
app.get("/api/user/:email", async (req, res) => {
  const { email } = req.params

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    const r = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    if (r.rowCount === 0) {
      return res.status(404).json({ error: "Пользователь не найден" })
    }
    res.json(convertUser(r.rows[0]))
  } catch (e) {
    console.error("User get error:", e)
    res.status(500).json({ error: "Ошибка получения: " + e.message })
  }
})

// --- Регистрация / Вход ---
app.post("/api/auth", async (req, res) => {
  const { email, password, first_name, telegram_id, telegram_name, mode } = req.body

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email])

    // Режим входа
    if (mode === 'login') {
      if (existing.rowCount === 0) {
        return res.status(404).json({ error: "Данного аккаунта не существует. Зарегистрируйтесь." })
      }
      
      const user = existing.rows[0]
      if (user.password_hash && password) {
        const ok = await bcrypt.compare(password, user.password_hash)
        if (!ok) return res.status(401).json({ error: "Неверный пароль" })
      }

      if (telegram_id && telegram_name) {
        await pool.query(
          `INSERT INTO linked_telegram_users (user_email, telegram_id, telegram_name)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_email, telegram_id) DO UPDATE SET telegram_name = $3`,
          [email, telegram_id, telegram_name],
        )

        await pool.query(
          `INSERT INTO telegram_accounts (telegram_id, telegram_name, email)
           VALUES ($1::bigint, $2, $3)
           ON CONFLICT (telegram_id) DO UPDATE
           SET telegram_name = COALESCE(EXCLUDED.telegram_name, telegram_accounts.telegram_name),
               email = $3,
               updated_at = NOW()`,
          [String(telegram_id), telegram_name, email],
        )
      }

      const tx = await pool.query("SELECT * FROM transactions WHERE user_email = $1 ORDER BY date DESC", [email])
      return res.json({ user: convertUser(user), transactions: tx.rows })
    }

    // Режим регистрации
    if (mode === 'register') {
      if (existing.rowCount > 0) {
        return res.status(409).json({ error: "Аккаунт с таким email уже существует" })
      }
      
      const password_hash = password ? await bcrypt.hash(password, 10) : null
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, balance, income, expenses, savings_usd, goal_savings)
         VALUES ($1, $2, $3, 0, 0, 0, 0, 50000) RETURNING *`,
        [email, password_hash, first_name || email.split("@")[0]],
      )
      const user = userResult.rows[0]

      if (telegram_id && telegram_name) {
        await pool.query(
          `INSERT INTO linked_telegram_users (user_email, telegram_id, telegram_name)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_email, telegram_id) DO UPDATE SET telegram_name = $3`,
          [email, telegram_id, telegram_name],
        )

        await pool.query(
          `INSERT INTO telegram_accounts (telegram_id, telegram_name, email)
           VALUES ($1::bigint, $2, $3)
           ON CONFLICT (telegram_id) DO UPDATE
           SET telegram_name = COALESCE(EXCLUDED.telegram_name, telegram_accounts.telegram_name),
               email = $3,
               updated_at = NOW()`,
          [String(telegram_id), telegram_name, email],
        )
      }

      return res.json({ user: convertUser(user), transactions: [] })
    }

    // Старая логика (для обратной совместимости)
    if (existing.rowCount === 0) {
      // Регистрация
      const password_hash = password ? await bcrypt.hash(password, 10) : null
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash, first_name, balance, income, expenses, savings_usd, goal_savings)
         VALUES ($1, $2, $3, 0, 0, 0, 0, 50000) RETURNING *`,
        [email, password_hash, first_name || email.split("@")[0]],
      )
      const user = userResult.rows[0]

      if (telegram_id && telegram_name) {
        await pool.query(
          `INSERT INTO linked_telegram_users (user_email, telegram_id, telegram_name)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_email, telegram_id) DO UPDATE SET telegram_name = $3`,
          [email, telegram_id, telegram_name],
        )

        await pool.query(
          `INSERT INTO telegram_accounts (telegram_id, telegram_name, email)
           VALUES ($1::bigint, $2, $3)
           ON CONFLICT (telegram_id) DO UPDATE
           SET telegram_name = COALESCE(EXCLUDED.telegram_name, telegram_accounts.telegram_name),
               email = $3,
               updated_at = NOW()`,
          [String(telegram_id), telegram_name, email],
        )
      }

      return res.json({ user: convertUser(user), transactions: [] })
    }

    // Вход
    const user = existing.rows[0]
    if (user.password_hash && password) {
      const ok = await bcrypt.compare(password, user.password_hash)
      if (!ok) return res.status(401).json({ error: "Неверный пароль" })
    }

    if (telegram_id && telegram_name) {
      await pool.query(
        `INSERT INTO linked_telegram_users (user_email, telegram_id, telegram_name)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_email, telegram_id) DO UPDATE SET telegram_name = $3`,
        [email, telegram_id, telegram_name],
      )

      await pool.query(
        `INSERT INTO telegram_accounts (telegram_id, telegram_name, email)
         VALUES ($1::bigint, $2, $3)
         ON CONFLICT (telegram_id) DO UPDATE
         SET telegram_name = COALESCE(EXCLUDED.telegram_name, telegram_accounts.telegram_name),
             email = $3,
             updated_at = NOW()`,
        [String(telegram_id), telegram_name, email],
      )
    }

    const tx = await pool.query("SELECT * FROM transactions WHERE user_email = $1 ORDER BY date DESC", [email])

    res.json({ user: convertUser(user), transactions: tx.rows })
  } catch (e) {
    console.error("Auth error:", e)
    res.status(500).json({ error: "Ошибка сервера: " + e.message })
  }
})

// --- Обновить пользователя ---
app.put("/api/user/:email", async (req, res) => {
  const { email } = req.params
  const { balance, income, expenses, savings, goalSavings, balanceWidgetTitle, balanceWidgetEmoji, balanceWidgetGradient } = req.body

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    await pool.query(
      `UPDATE users
       SET balance = COALESCE($1, balance),
           income = COALESCE($2, income),
           expenses = COALESCE($3, expenses),
           savings_usd = COALESCE($4, savings_usd),
           goal_savings = COALESCE($5, goal_savings),
           balance_widget_title = COALESCE($6, balance_widget_title),
           balance_widget_emoji = COALESCE($7, balance_widget_emoji),
           balance_widget_gradient = COALESCE($8, balance_widget_gradient)
       WHERE email=$9`,
      [
        balance === undefined ? null : Number(balance || 0),
        income === undefined ? null : Number(income || 0),
        expenses === undefined ? null : Number(expenses || 0),
        savings === undefined ? null : Number(savings || 0),
        goalSavings === undefined ? null : Number(goalSavings || 50000),
        balanceWidgetTitle === undefined ? null : String(balanceWidgetTitle),
        balanceWidgetEmoji === undefined ? null : String(balanceWidgetEmoji),
        balanceWidgetGradient === undefined ? null : String(balanceWidgetGradient),
        email,
      ],
    )
    res.json({ success: true })
  } catch (e) {
    console.error("User update error:", e)
    res.status(500).json({ error: "Не удалось сохранить: " + e.message })
  }
})

// --- Сброс данных ---
app.post("/api/user/:email/reset", async (req, res) => {
  const { email } = req.params
  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    await pool.query("DELETE FROM transactions WHERE user_email = $1", [email])
    await pool.query(`UPDATE users SET balance=0, income=0, expenses=0, savings_usd=0 WHERE email=$1`, [email])
    res.json({ success: true })
  } catch (e) {
    console.error("Reset error:", e)
    res.status(500).json({ error: "Не удалось сбросить: " + e.message })
  }
})

// --- Смена пароля ---
app.post("/api/user/:email/change-password", async (req, res) => {
  const { email } = req.params
  const { oldPassword, newPassword } = req.body

  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ error: "Email, старый и новый пароль обязательны" })
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: "Новый пароль должен быть не менее 6 символов" })
  }

  try {
    // Проверяем существующего пользователя и старый пароль
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" })
    }

    const user = result.rows[0]

    // Проверяем старый пароль
    if (user.password !== oldPassword) {
      return res.status(401).json({ error: "Неверный старый пароль" })
    }

    // Обновляем пароль
    await pool.query("UPDATE users SET password = $1 WHERE email = $2", [newPassword, email])

    console.log(`✅ Password changed for user: ${email}`)
    res.json({ success: true, message: "Пароль успешно изменен" })
  } catch (e) {
    console.error("Change password error:", e)
    res.status(500).json({ error: "Не удалось изменить пароль: " + e.message })
  }
})

// --- Добавить транзакцию ---
app.post("/api/transactions", async (req, res) => {
  const { user_email, type, amount, converted_amount_usd, description, category, created_by_telegram_id, created_by_name, savings_goal } = req.body

  if (!user_email) {
    return res.status(400).json({ error: "Email пользователя обязателен" })
  }

  try {
    const r = await pool.query(
      `INSERT INTO transactions (user_email, type, amount, converted_amount_usd, description, category, created_by_telegram_id, created_by_name, savings_goal)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        user_email,
        type,
        amount || 0,
        converted_amount_usd,
        description,
        category,
        created_by_telegram_id,
        created_by_name,
        savings_goal || 'main',
      ],
    )
    res.json(r.rows[0])
  } catch (e) {
    console.error("TX insert error:", e)
    res.status(500).json({ error: "Ошибка добавления: " + e.message })
  }
})

// --- Удалить транзакцию ---
app.delete("/api/transactions/:id", async (req, res) => {
  const id = Number.parseInt(req.params.id, 10)
  if (isNaN(id)) return res.status(400).json({ error: "Неверный ID" })

  try {
    // Сначала удаляем все комментарии к этой транзакции
    await pool.query("DELETE FROM transaction_comments WHERE transaction_id = $1", [id])
    // И лайки
    await pool.query("DELETE FROM transaction_likes WHERE transaction_id = $1", [id])
    
    // Затем удаляем саму транзакцию
    const result = await pool.query("DELETE FROM transactions WHERE id = $1 RETURNING *", [id])
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Транзакция не найдена" })
    }
    res.json({ success: true })
  } catch (e) {
    console.error("TX delete error:", e)
    res.status(500).json({ error: "Ошибка удаления: " + e.message })
  }
})

// --- Получить транзакции ---
app.get("/api/transactions", async (req, res) => {
  const { user_email } = req.query
  if (!user_email) return res.status(400).json({ error: "Email обязателен" })

  try {
    const r = await pool.query("SELECT * FROM transactions WHERE user_email = $1 ORDER BY date DESC", [user_email])
    res.json(r.rows)
  } catch (e) {
    console.error("TX get error:", e)
    res.status(500).json({ error: "Ошибка получения: " + e.message })
  }
})

// --- Получить связанных пользователей ---
app.get("/api/linked-users/:email", async (req, res) => {
  const { email } = req.params

  if (!email) {
    return res.status(400).json({ error: "Email обязателен" })
  }

  try {
    const result = await pool.query(
      "SELECT telegram_id, telegram_name, linked_at FROM linked_telegram_users WHERE user_email = $1 ORDER BY linked_at",
      [email],
    )
    res.json({ linkedUsers: result.rows })
  } catch (e) {
    console.error("Linked users error:", e)
    res.status(500).json({ error: "Ошибка получения пользователей: " + e.message })
  }
})

// --- Удалить связанный пользователя ---
app.delete("/api/linked-users/:email/:telegram_id", async (req, res) => {
  const { email, telegram_id } = req.params

  if (!email || !telegram_id) {
    return res.status(400).json({ error: "Email и Telegram ID обязательны" })
  }

  try {
    const result = await pool.query(
      "DELETE FROM linked_telegram_users WHERE user_email = $1 AND telegram_id = $2 RETURNING *",
      [email, telegram_id],
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Связанный пользователь не найден" })
    }

    res.json({ success: true, deletedUser: result.rows[0] })
  } catch (e) {
    console.error("Delete linked user error:", e)
    res.status(500).json({ error: "Ошибка удаления пользователя: " + e.message })
  }
})

// --- Добавить комментарий к транзакции ---
app.post("/api/transactions/:txId/comment", async (req, res) => {
  const { txId } = req.params
  const { user_email, comment } = req.body

  if (!user_email || !comment) {
    return res.status(400).json({ error: "Email и комментарий обязательны" })
  }

  try {
    const result = await pool.query(
      `INSERT INTO transaction_comments (transaction_id, author, text, date, telegram_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [txId, comment.author, comment.text, comment.date, comment.telegram_id]
    )
    res.json({ success: true, comment: result.rows[0] })
  } catch (e) {
    console.error("Comment add error:", e)
    res.status(500).json({ error: "Ошибка добавления комментария: " + e.message })
  }
})

// --- Удалить комментарий ---
app.delete("/api/transactions/:txId/comment/:commentId", async (req, res) => {
  const { txId, commentId } = req.params
  const { user_email } = req.body

  if (!user_email) {
    return res.status(400).json({ error: "Email обязателен" })
  }

  try {
    const result = await pool.query(
      "DELETE FROM transaction_comments WHERE id = $1 AND transaction_id = $2 RETURNING *",
      [commentId, txId]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Комментарий не найден" })
    }

    res.json({ success: true })
  } catch (e) {
    console.error("Comment delete error:", e)
    res.status(500).json({ error: "Ошибка удаления комментария: " + e.message })
  }
})

// --- Получить комментарии транзакции ---
app.get("/api/transactions/:txId/comments", async (req, res) => {
  const { txId } = req.params

  try {
    const result = await pool.query(
      "SELECT * FROM transaction_comments WHERE transaction_id = $1 ORDER BY date ASC",
      [txId]
    )
    res.json({ comments: result.rows })
  } catch (e) {
    console.error("Comments get error:", e)
    res.status(500).json({ error: "Ошибка получения комментариев: " + e.message })
  }
})

// --- Обновить настройки копилки ---
app.put("/api/user/:email/savings-settings", async (req, res) => {
  const { email } = req.params
  const {
    goalName,
    initialSavingsAmount,
    secondGoalName,
    secondGoalAmount,
    secondGoalSavings,
    secondGoalInitialAmount,
    thirdGoalName,
    thirdGoalAmount,
    thirdGoalSavings,
    thirdGoalInitialAmount,
  } = req.body

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    await pool.query(
      `UPDATE users
       SET goal_name=$1, initial_savings_amount=$2,
           second_goal_name=$3, second_goal_amount=$4, second_goal_savings=$5, second_goal_initial_amount=$6,
           third_goal_name=$7, third_goal_amount=$8, third_goal_savings=$9, third_goal_initial_amount=$10
       WHERE email=$11`,
      [
        goalName,
        initialSavingsAmount || 0,
        secondGoalName,
        secondGoalAmount || 0,
        secondGoalSavings || 0,
        secondGoalInitialAmount || 0,
        thirdGoalName || '',
        thirdGoalAmount || 0,
        thirdGoalSavings || 0,
        thirdGoalInitialAmount || 0,
        email,
      ],
    )
    res.json({ success: true })
  } catch (e) {
    console.error("Savings settings update error:", e)
    res.status(500).json({ error: "Не удалось сохранить настройки: " + e.message })
  }
})

// --- Обновить бюджеты ---
app.put("/api/user/:email/budgets", async (req, res) => {
  const { email } = req.params
  const { budgets } = req.body

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    const budgetsJson = JSON.stringify(budgets || {})
    await pool.query(
      `UPDATE users SET budgets=$1 WHERE email=$2`,
      [budgetsJson, email],
    )
    res.json({ success: true })
  } catch (e) {
    console.error("Budgets update error:", e)
    res.status(500).json({ error: "Не удалось сохранить бюджеты: " + e.message })
  }
})

// --- Пересчитать баланс пользователя на основе транзакций ---
app.post("/api/user/:email/recalculate", async (req, res) => {
  const { email } = req.params

  if (!email) return res.status(400).json({ error: "Email обязателен" })

  try {
    // Получаем все транзакции пользователя
    const txResult = await pool.query(
      `SELECT * FROM transactions WHERE user_email = $1 ORDER BY created_at ASC`,
      [email]
    )

    const transactions = txResult.rows

    // Пересчитываем баланс, доходы, расходы и копилку
    let income = 0
    let expenses = 0
    let savingsUSD = 0

    transactions.forEach(tx => {
      const amount = Number(tx.amount || 0)
      const convertedUSD = Number(tx.converted_amount_usd || 0)

      if (tx.type === 'income') {
        income += amount
      } else if (tx.type === 'expense') {
        expenses += amount
      } else if (tx.type === 'savings') {
        // Для копилки используем converted_amount_usd
        if (tx.savings_goal === 'second' || tx.savings_goal === 'third') {
          // Вторая/третья цель - не трогаем, они отдельно
        } else {
          savingsUSD += convertedUSD
        }
      }
    })

    // Баланс = доходы - расходы - копилка (в рублях)
    const savingsInRUB = transactions
      .filter(tx => tx.type === 'savings')
      .reduce((sum, tx) => sum + Number(tx.amount || 0), 0)
    
    const balance = income - expenses - savingsInRUB

    // Обновляем пользователя
    await pool.query(
      `UPDATE users SET balance = $1, income = $2, expenses = $3, savings_usd = $4 WHERE email = $5`,
      [balance, income, expenses, savingsUSD, email]
    )

    res.json({
      success: true,
      recalculated: {
        balance,
        income,
        expenses,
        savings_usd: savingsUSD,
        total_transactions: transactions.length
      }
    })
  } catch (e) {
    console.error("Recalculate error:", e)
    res.status(500).json({ error: "Не удалось пересчитать баланс: " + e.message })
  }
})

// --- Helper ---
function convertUser(u) {
  return {
    email: u.email,
    first_name: u.first_name,
    balance: Number(u.balance || 0),
    income: Number(u.income || 0),
    expenses: Number(u.expenses || 0),
    savings_usd: Number(u.savings_usd || 0),
    goal_savings: Number(u.goal_savings || 50000),
    goal_name: u.goal_name || "Моя цель",
    initial_savings_amount: Number(u.initial_savings_amount || 0),
    second_goal_name: u.second_goal_name || "",
    second_goal_amount: Number(u.second_goal_amount || 0),
    second_goal_savings: Number(u.second_goal_savings || 0),
    second_goal_initial_amount: Number(u.second_goal_initial_amount || 0),
    third_goal_name: u.third_goal_name || "",
    third_goal_amount: Number(u.third_goal_amount || 0),
    third_goal_savings: Number(u.third_goal_savings || 0),
    third_goal_initial_amount: Number(u.third_goal_initial_amount || 0),
    balance_widget_title: u.balance_widget_title || "Общий баланс",
    balance_widget_emoji: u.balance_widget_emoji || "💳",
    balance_widget_gradient: u.balance_widget_gradient || "default",
    budgets: u.budgets || {},
  }
}

// --- Получить долги пользователя ---
app.get("/api/user/:email/debts", async (req, res) => {
  const { email } = req.params
  
  try {
    const result = await pool.query(
      `SELECT * FROM debts WHERE user_email = $1 ORDER BY created_at DESC`,
      [email]
    )
    res.json({ debts: result.rows })
  } catch (e) {
    console.error("Get debts error:", e)
    res.status(500).json({ error: "Не удалось получить долги: " + e.message })
  }
})

// --- Добавить долг ---
app.post("/api/user/:email/debts", async (req, res) => {
  const { email } = req.params
  const { type, person, amount, description } = req.body
  
  if (!type || !person || !amount) {
    return res.status(400).json({ error: "Заполните все обязательные поля" })
  }
  
  try {
    const result = await pool.query(
      `INSERT INTO debts (user_email, type, person, amount, description, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [email, type, person, amount, description || '']
    )
    res.json({ debt: result.rows[0] })
  } catch (e) {
    console.error("Add debt error:", e)
    res.status(500).json({ error: "Не удалось добавить долг: " + e.message })
  }
})

// --- Удалить долг ---
app.delete("/api/user/:email/debts/:debtId", async (req, res) => {
  const { email, debtId } = req.params
  
  try {
    await pool.query(
      `DELETE FROM debts WHERE id = $1 AND user_email = $2`,
      [debtId, email]
    )
    res.json({ success: true })
  } catch (e) {
    console.error("Delete debt error:", e)
    res.status(500).json({ error: "Не удалось удалить долг: " + e.message })
  }
})

// --- Связывание пользователей (совместный кошелек) ---
app.post("/api/user/:email/link", async (req, res) => {
  const { email } = req.params
  const { linkedEmail } = req.body

  if (!linkedEmail) {
    return res.status(400).json({ error: "linkedEmail обязателен" })
  }

  try {
    // Проверяем, существует ли связь
    const existing = await pool.query(
      `SELECT * FROM linked_users WHERE user_email = $1 AND linked_email = $2`,
      [email, linkedEmail]
    )

    if (existing.rows.length > 0) {
      return res.json({ success: true, message: "Пользователи уже связаны" })
    }

    // Создаем двустороннюю связь
    await pool.query(
      `INSERT INTO linked_users (user_email, linked_email) VALUES ($1, $2)`,
      [email, linkedEmail]
    )
    await pool.query(
      `INSERT INTO linked_users (user_email, linked_email) VALUES ($1, $2)`,
      [linkedEmail, email]
    )

    res.json({ success: true, message: "Пользователи успешно связаны" })
  } catch (e) {
    console.error("Link users error:", e)
    res.status(500).json({ error: "Не удалось связать пользователей: " + e.message })
  }
})

// --- Получить связанных пользователей ---
app.get("/api/user/:email/linked", async (req, res) => {
  const { email } = req.params

  try {
    const result = await pool.query(
      `SELECT linked_email, created_at FROM linked_users WHERE user_email = $1`,
      [email]
    )
    res.json({ linkedUsers: result.rows })
  } catch (e) {
    console.error("Get linked users error:", e)
    res.status(500).json({ error: "Не удалось получить связанных пользователей: " + e.message })
  }
})

// --- Универсальное связывание пользователей (email + Telegram ID) ---
app.post("/api/link", async (req, res) => {
  const { 
    currentTelegramId, 
    currentEmail, 
    currentUserName,
    referrerTelegramId, 
    referrerEmail,
    referrerName 
  } = req.body

  if (!currentTelegramId || !referrerTelegramId) {
    return res.status(400).json({ error: "Telegram ID обязательны" })
  }

  try {
    // Owner wallet is always the inviter's Telegram wallet_email
    let resolvedReferrerEmail = null
    const inviterAcc = await pool.query(
      `SELECT wallet_email FROM telegram_accounts WHERE telegram_id = $1::bigint`,
      [String(referrerTelegramId)],
    )
    resolvedReferrerEmail = inviterAcc.rows?.[0]?.wallet_email || null

    // Fallback: allow legacy owner_email via referrerEmail if present
    if (!resolvedReferrerEmail && referrerEmail) {
      resolvedReferrerEmail = referrerEmail
    }

    // As a last resort, derive it from telegram id format
    if (!resolvedReferrerEmail) {
      resolvedReferrerEmail = `tg_${String(referrerTelegramId)}@telegram.user`
    }

    // Проверяем, существует ли связь по Telegram ID
    const existingTg = await pool.query(
      `SELECT * FROM telegram_links WHERE telegram_id = $1 AND linked_telegram_id = $2`,
      [currentTelegramId, referrerTelegramId]
    )

    // If we know the owner's email - enforce wallet membership status (blocked users cannot join)
    if (resolvedReferrerEmail) {
      const statusCheck = await pool.query(
        `SELECT status FROM wallet_members WHERE owner_email=$1 AND member_telegram_id=$2::bigint`,
        [resolvedReferrerEmail, String(currentTelegramId)],
      )
      if (statusCheck.rowCount > 0 && statusCheck.rows[0].status === 'blocked') {
        return res.status(403).json({ error: "Вас заблокировали в этом кошельке" })
      }
    }

    // Persist membership + active wallet for invited user (idempotent)
    if (resolvedReferrerEmail) {
      // Ensure telegram_accounts row exists so active_wallet_email update always works
      await pool.query(
        `INSERT INTO telegram_accounts (telegram_id, telegram_name, wallet_email, email, active_wallet_email)
         VALUES ($1::bigint, $2, $3, $4, $5)
         ON CONFLICT (telegram_id)
         DO UPDATE SET
           telegram_name = COALESCE(EXCLUDED.telegram_name, telegram_accounts.telegram_name),
           wallet_email = COALESCE(telegram_accounts.wallet_email, EXCLUDED.wallet_email),
           email = COALESCE(EXCLUDED.email, telegram_accounts.email),
           active_wallet_email = EXCLUDED.active_wallet_email,
           updated_at = NOW()`,
        [
          String(currentTelegramId),
          currentUserName || null,
          `tg_${String(currentTelegramId)}@telegram.user`,
          currentEmail || null,
          resolvedReferrerEmail,
        ],
      )

      await pool.query(
        `INSERT INTO wallet_members (owner_email, member_telegram_id, status)
         VALUES ($1, $2::bigint, 'active')
         ON CONFLICT (owner_email, member_telegram_id)
         DO UPDATE SET status='active', updated_at=NOW()`,
        [resolvedReferrerEmail, String(currentTelegramId)],
      )
    }

    if (existingTg.rows.length > 0) {
      return res.json({ success: true, message: "Пользователи уже связаны", walletEmail: resolvedReferrerEmail })
    }

    // Создаем двустороннюю связь по Telegram ID
    await pool.query(
      `INSERT INTO telegram_links (telegram_id, linked_telegram_id, user_name, linked_email) VALUES ($1, $2, $3, $4)`,
      [currentTelegramId, referrerTelegramId, currentUserName, referrerEmail]
    )
    await pool.query(
      `INSERT INTO telegram_links (telegram_id, linked_telegram_id, user_name, linked_email) VALUES ($1, $2, $3, $4)`,
      [referrerTelegramId, currentTelegramId, referrerName, currentEmail]
    )

    console.log(`✅ Linked users: TG ${currentTelegramId} (${currentEmail || 'no email'}) <-> TG ${referrerTelegramId} (${referrerEmail || 'no email'})`)

    // Если оба пользователя имеют email, создаем также связь по email
    if (currentEmail && resolvedReferrerEmail) {
      const existingEmail = await pool.query(
        `SELECT * FROM linked_users WHERE user_email = $1 AND linked_email = $2`,
        [currentEmail, resolvedReferrerEmail]
      )

      if (existingEmail.rows.length === 0) {
        await pool.query(
          `INSERT INTO linked_users (user_email, linked_email) VALUES ($1, $2)`,
          [currentEmail, resolvedReferrerEmail]
        )
        await pool.query(
          `INSERT INTO linked_users (user_email, linked_email) VALUES ($1, $2)`,
          [resolvedReferrerEmail, currentEmail]
        )
        console.log(`✅ Also linked by email: ${currentEmail} <-> ${resolvedReferrerEmail}`)
      }
    }

    res.json({
      success: true,
      message: "Пользователи успешно связаны",
      walletEmail: resolvedReferrerEmail,
    })
  } catch (e) {
    console.error("Link users error:", e)
    res.status(500).json({ error: "Не удалось связать пользователей: " + e.message })
  }
})

// --- Связывание пользователей по Telegram ID (старый эндпоинт для совместимости) ---
app.post("/api/telegram/:telegramId/link", async (req, res) => {
  const { telegramId } = req.params
  const { linkedTelegramId, userName, referrerName } = req.body

  if (!linkedTelegramId) {
    return res.status(400).json({ error: "linkedTelegramId обязателен" })
  }

  try {
    // Проверяем, существует ли связь
    const existing = await pool.query(
      `SELECT * FROM telegram_links WHERE telegram_id = $1 AND linked_telegram_id = $2`,
      [telegramId, linkedTelegramId]
    )

    if (existing.rows.length > 0) {
      return res.json({ success: true, message: "Пользователи уже связаны" })
    }

    // Создаем двустороннюю связь
    await pool.query(
      `INSERT INTO telegram_links (telegram_id, linked_telegram_id, user_name) VALUES ($1, $2, $3)`,
      [telegramId, linkedTelegramId, userName]
    )
    await pool.query(
      `INSERT INTO telegram_links (telegram_id, linked_telegram_id, user_name) VALUES ($1, $2, $3)`,
      [linkedTelegramId, telegramId, referrerName]
    )

    console.log(`✅ Linked Telegram users: ${telegramId} <-> ${linkedTelegramId}`)
    res.json({ success: true, message: "Пользователи успешно связаны" })
  } catch (e) {
    console.error("Link Telegram users error:", e)
    res.status(500).json({ error: "Не удалось связать пользователей: " + e.message })
  }
})

// --- Получить связанных пользователей по Telegram ID ---
app.get("/api/telegram/:telegramId/linked", async (req, res) => {
  const { telegramId } = req.params

  try {
    const result = await pool.query(
      `SELECT linked_telegram_id, user_name, created_at FROM telegram_links WHERE telegram_id = $1`,
      [telegramId]
    )
    res.json({ linkedUsers: result.rows })
  } catch (e) {
    console.error("Get linked Telegram users error:", e)
    res.status(500).json({ error: "Не удалось получить связанных пользователей: " + e.message })
  }
})

// --- Инициализация таблиц ---
async function initTables() {
  try {
    // Таблица debts
    await pool.query(`
      CREATE TABLE IF NOT EXISTS debts (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        type VARCHAR(10) NOT NULL,
        person VARCHAR(255) NOT NULL,
        amount DECIMAL(12, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_debts_user_email ON debts(user_email)
    `)
    
    console.log('✅ Таблица debts инициализирована')
    
    // Таблица linked_users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS linked_users (
        id SERIAL PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        linked_email VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_email, linked_email)
      )
    `)
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_linked_users_email ON linked_users(user_email)
    `)
    
    console.log('✅ Таблица linked_users инициализирована')
    
    // Таблица telegram_links (для связывания по Telegram ID)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS telegram_links (
        id SERIAL PRIMARY KEY,
        telegram_id VARCHAR(50) NOT NULL,
        linked_telegram_id VARCHAR(50) NOT NULL,
        user_name VARCHAR(255),
        linked_email VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(telegram_id, linked_telegram_id)
      )
    `)
    
    // Добавляем колонку linked_email если её нет (для существующих таблиц)
    await pool.query(`
      ALTER TABLE telegram_links 
      ADD COLUMN IF NOT EXISTS linked_email VARCHAR(255)
    `).catch(() => {
      // Игнорируем ошибку если колонка уже существует
    })
    
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_telegram_links_id ON telegram_links(telegram_id)
    `)
    
    console.log('✅ Таблица telegram_links инициализирована')
  } catch (e) {
    console.error('❌ Ошибка инициализации таблиц:', e.message)
  }
}

const PORT = process.env.PORT || 10000
app.listen(PORT, async () => {
  console.log(`Сервер на порту ${PORT}`)
  await initTables()
})