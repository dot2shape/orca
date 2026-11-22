// `orca://bot/<botId>?item=<number or uid>`: the bot's Items tab opens that item, once its Home is open.
import { toast } from 'sonner'
import { translate } from '@/i18n/i18n'
import type { BotRef } from '@/lib/bot-hosts'
import { botErrorMessage } from '../bot-presentation'
import { openBotItem } from './bot-item-open'
import { showBotItem } from './use-bot-items'

// Numbers are what `orca bot item` prints; the host reads an all-digit ref as one, anything else as a uid.
const ITEM_NUMBER = /^\d+$/

/** The item's uid: a number is looked up on the bot's host, and must be this bot's own item. */
export async function resolveBotItemLinkUid(bot: BotRef, ref: string): Promise<string | null> {
  if (!ITEM_NUMBER.test(ref)) {
    return ref
  }
  const { item } = await showBotItem(bot, ref, { newest: true })
  return item.owner.botId === bot.id ? item.uid : null
}

export async function openBotItemLink(bot: BotRef, ref: string): Promise<void> {
  try {
    const uid = await resolveBotItemLinkUid(bot, ref)
    if (uid) {
      openBotItem(bot, uid)
      return
    }
    toast.info(translate('bots.deepLink.itemNotThisBot', 'That item belongs to another bot.'))
  } catch (error) {
    toast.error(botErrorMessage(error))
  }
}
