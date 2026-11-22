import { beforeEach, expect, it, vi } from 'vitest'

const showBotItem = vi.hoisted(() => vi.fn())
vi.mock('./use-bot-items', () => ({ showBotItem }))
vi.mock('./bot-item-open', () => ({ openBotItem: vi.fn() }))

import { resolveBotItemLinkUid } from './bot-item-link-open'

const BOT = { hostId: 'local', id: 'bot-a' } as const

beforeEach(() => showBotItem.mockReset())

it('looks a number up on the bot’s host and opens its uid', async () => {
  showBotItem.mockResolvedValue({ item: { uid: 'itm-42', owner: { botId: 'bot-a' } }, events: [] })
  expect(await resolveBotItemLinkUid(BOT, '42')).toBe('itm-42')
  expect(showBotItem).toHaveBeenCalledWith(BOT, '42', { newest: true })
})

it('refuses a number that is another bot’s item', async () => {
  showBotItem.mockResolvedValue({ item: { uid: 'itm-9', owner: { botId: 'bot-b' } }, events: [] })
  expect(await resolveBotItemLinkUid(BOT, '9')).toBeNull()
})

it('opens a uid as is, without a host read', async () => {
  expect(await resolveBotItemLinkUid(BOT, 'itm-7')).toBe('itm-7')
  expect(showBotItem).not.toHaveBeenCalled()
})
