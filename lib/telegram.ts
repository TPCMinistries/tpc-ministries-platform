// Minimal Telegram sender for ops notifications.
// No-ops safely (returns skipped) when TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID
// aren't configured, so deploys are safe before creds are wired.
//
// Setup (one-time, by Lorenzo):
//   1. Message @BotFather → /newbot → get the bot token
//   2. DM your new bot once, then visit
//      https://api.telegram.org/bot<TOKEN>/getUpdates to find your chat id
//   3. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in Vercel env

export async function sendTelegramMessage(
  text: string,
): Promise<{ ok: boolean; skipped?: boolean }> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID missing — skipping send')
    return { ok: false, skipped: true }
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      console.error(`[telegram] send failed ${res.status}: ${body.slice(0, 200)}`)
      return { ok: false }
    }
    return { ok: true }
  } catch (err) {
    console.error('[telegram] send error:', err)
    return { ok: false }
  }
}
