import { describe, expect, it } from 'vitest'
import {
  layoutBotSidebarFolderRows,
  normalizeBotSidebarFolders,
  removeBotSidebarFolder,
  setBotSidebarEntryFolder
} from './bot-sidebar-folders'

const entries = [{ id: 'local/a' }, { id: 'local/b' }, { id: 'remote/c' }, { id: 'local/d' }]
const state = {
  folders: [
    { id: 'active', name: 'Active projects' },
    { id: 'personal', name: 'Personal' }
  ],
  membership: { 'local/b': 'personal', 'remote/c': 'active', 'local/d': 'active' }
}

const shape = (rows: ReturnType<typeof layoutBotSidebarFolderRows>) =>
  rows.map((row) => (row.kind === 'folder' ? `[${row.folder.name} ${row.count}]` : row.id))

describe('layoutBotSidebarFolderRows', () => {
  it('lists top-level rows first, then each folder in its order with its rows in arrival order', () => {
    expect(shape(layoutBotSidebarFolderRows(entries, state, new Set()))).toEqual([
      'local/a',
      '[Active projects 2]',
      'remote/c',
      'local/d',
      '[Personal 1]',
      'local/b'
    ])
  })

  it('keeps a folded folder and its count but hides its rows', () => {
    expect(
      shape(layoutBotSidebarFolderRows(entries, state, new Set(['bot-folder:active'])))
    ).toEqual(['local/a', '[Active projects 2]', '[Personal 1]', 'local/b'])
  })

  it('lists an empty folder so rows can be filed into it', () => {
    const empty = { folders: [{ id: 'dash', name: 'Dashboard' }], membership: {} }
    expect(shape(layoutBotSidebarFolderRows(entries.slice(0, 1), empty, new Set()))).toEqual([
      'local/a',
      '[Dashboard 0]'
    ])
  })
})

describe('bot sidebar folder edits', () => {
  it('returns a deleted folder’s rows to the top level', () => {
    const next = removeBotSidebarFolder(state, 'active')
    expect(next.membership).toEqual({ 'local/b': 'personal' })
    expect(shape(layoutBotSidebarFolderRows(entries, next, new Set()))).toEqual([
      'local/a',
      'remote/c',
      'local/d',
      '[Personal 1]',
      'local/b'
    ])
  })

  it('does not file a row into a folder that does not exist', () => {
    expect(setBotSidebarEntryFolder(state, 'local/a', 'gone')).toBe(state)
  })

  it('drops unnamed or repeated folders and membership in unknown folders when loading', () => {
    expect(
      normalizeBotSidebarFolders({
        folders: [
          { id: 'x', name: '  Work  ' },
          { id: 'x', name: 'Duplicate' },
          { id: 'y', name: '   ' }
        ],
        membership: { 'local/a': 'x', 'local/b': 'y', 'local/c': 7 }
      })
    ).toEqual({ folders: [{ id: 'x', name: 'Work' }], membership: { 'local/a': 'x' } })
  })
})
