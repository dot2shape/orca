// The Bots section's folders: named, foldable groups the owner sorts bot and group-chat rows into.
// A per-profile UI record; nothing on a bot, group or host changes.

export type BotSidebarFolder = { id: string; name: string }

export type BotSidebarFolders = {
  /** In the order the section lists them. */
  folders: BotSidebarFolder[]
  /** A row's host-keyed entry id → its folder id; absent means the row is at the top level. */
  membership: Record<string, string>
}

export const EMPTY_BOT_SIDEBAR_FOLDERS: BotSidebarFolders = { folders: [], membership: {} }

const FOLDER_GROUP_KEY_PREFIX = 'bot-folder:'
const MAX_FOLDER_NAME_LENGTH = 80

/** The folder's key in `collapsedGroups`, so its fold survives relaunch like the other sections'. */
export function botSidebarFolderGroupKey(folderId: string): string {
  return `${FOLDER_GROUP_KEY_PREFIX}${folderId}`
}

function cleanFolderName(name: unknown): string | null {
  if (typeof name !== 'string') {
    return null
  }
  const trimmed = name.trim().slice(0, MAX_FOLDER_NAME_LENGTH)
  return trimmed.length > 0 ? trimmed : null
}

/** Saved or relayed folders: unnamed or repeated folders drop, and so does membership in them. */
export function normalizeBotSidebarFolders(value: unknown): BotSidebarFolders {
  const saved: { folders?: unknown; membership?: unknown } =
    typeof value === 'object' && value !== null ? value : {}
  const folders: BotSidebarFolder[] = []
  const ids = new Set<string>()
  for (const candidate of Array.isArray(saved.folders) ? saved.folders : []) {
    const id: unknown = candidate?.id
    const name = cleanFolderName(candidate?.name)
    if (typeof id !== 'string' || id.length === 0 || ids.has(id) || name === null) {
      continue
    }
    ids.add(id)
    folders.push({ id, name })
  }
  const membership: Record<string, string> = {}
  const savedMembership =
    typeof saved.membership === 'object' && saved.membership !== null ? saved.membership : {}
  for (const [entryId, folderId] of Object.entries(savedMembership)) {
    if (typeof folderId === 'string' && ids.has(folderId)) {
      membership[entryId] = folderId
    }
  }
  return { folders, membership }
}

export function addBotSidebarFolder(
  state: BotSidebarFolders,
  folder: BotSidebarFolder
): BotSidebarFolders {
  const name = cleanFolderName(folder.name)
  if (name === null || state.folders.some(({ id }) => id === folder.id)) {
    return state
  }
  return { ...state, folders: [...state.folders, { id: folder.id, name }] }
}

export function renameBotSidebarFolder(
  state: BotSidebarFolders,
  folderId: string,
  name: string
): BotSidebarFolders {
  const cleaned = cleanFolderName(name)
  if (cleaned === null) {
    return state
  }
  return {
    ...state,
    folders: state.folders.map((folder) =>
      folder.id === folderId ? { ...folder, name: cleaned } : folder
    )
  }
}

/** Moves a folder one place up (-1) or down (+1); at either end it stays. */
export function moveBotSidebarFolder(
  state: BotSidebarFolders,
  folderId: string,
  step: -1 | 1
): BotSidebarFolders {
  const from = state.folders.findIndex(({ id }) => id === folderId)
  const to = from + step
  if (from === -1 || to < 0 || to >= state.folders.length) {
    return state
  }
  const folders = [...state.folders]
  const [moved] = folders.splice(from, 1)
  folders.splice(to, 0, moved!)
  return { ...state, folders }
}

/** Deletes a folder; its rows go back to the top level, nothing else is removed. */
export function removeBotSidebarFolder(
  state: BotSidebarFolders,
  folderId: string
): BotSidebarFolders {
  return {
    folders: state.folders.filter(({ id }) => id !== folderId),
    membership: Object.fromEntries(
      Object.entries(state.membership).filter(([, id]) => id !== folderId)
    )
  }
}

/** Puts a row into a folder, or back to the top level with `null`. */
export function setBotSidebarEntryFolder(
  state: BotSidebarFolders,
  entryId: string,
  folderId: string | null
): BotSidebarFolders {
  const membership = Object.fromEntries(
    Object.entries(state.membership).filter(([id]) => id !== entryId)
  )
  if (folderId === null) {
    return { ...state, membership }
  }
  if (!state.folders.some(({ id }) => id === folderId)) {
    return state
  }
  return { ...state, membership: { ...membership, [entryId]: folderId } }
}

export type BotSidebarFolderRow<E> =
  | { kind: 'folder'; id: string; folder: BotSidebarFolder; count: number; collapsed: boolean }
  | { kind: 'entry'; id: string; entry: E; folderId: string | null }

/** The section's rows: top-level entries first, as today, then each folder's header and, unless it
 *  is folded, its entries. Entries keep the order they arrive in, so Bot options sort inside folders.
 *  A row whose folder is gone lists at the top level. */
export function layoutBotSidebarFolderRows<E extends { id: string }>(
  entries: readonly E[],
  state: BotSidebarFolders,
  collapsedGroups: Pick<ReadonlySet<string>, 'has'>
): BotSidebarFolderRow<E>[] {
  const folderIds = new Set(state.folders.map(({ id }) => id))
  const byFolder = new Map<string, E[]>()
  const rows: BotSidebarFolderRow<E>[] = []
  for (const entry of entries) {
    const folderId = state.membership[entry.id]
    if (folderId !== undefined && folderIds.has(folderId)) {
      const list = byFolder.get(folderId) ?? []
      list.push(entry)
      byFolder.set(folderId, list)
    } else {
      rows.push({ kind: 'entry', id: entry.id, entry, folderId: null })
    }
  }
  for (const folder of state.folders) {
    const id = botSidebarFolderGroupKey(folder.id)
    const members = byFolder.get(folder.id) ?? []
    const collapsed = collapsedGroups.has(id)
    rows.push({ kind: 'folder', id, folder, count: members.length, collapsed })
    if (!collapsed) {
      for (const entry of members) {
        rows.push({ kind: 'entry', id: entry.id, entry, folderId: folder.id })
      }
    }
  }
  return rows
}
