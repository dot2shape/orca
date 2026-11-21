import { useEffect, useMemo } from 'react'
import { useAppStore } from '@/store'
import {
  getProjectGroupHeaderDragBucketKey,
  type ProjectGroupHeaderDragItem
} from '@/components/sidebar/worktree-list/drag/project-group-header-drop'
import {
  botSidebarFolderGroupKey,
  layoutBotSidebarFolderRows,
  type BotSidebarFolderRow
} from '../../../../shared/bots/bot-sidebar-folders'

type FolderedEntry = {
  id: string
} & (
  | { kind: 'bot'; bot: { sidebarOrder?: number } }
  | { kind: 'group'; group: { sidebarOrder?: number } }
)

// A folder's rows drag among themselves, as a project group's subgroups do under their parent.
const folderDragParentId = (folderId: string): string => `bot-folder:${folderId}`

/** The Bots section's rows with folders, and the drag buckets they make: the top level and each
 *  folder. Each row's order is still saved on its host, so a folder keeps the rows' relative order. */
export function useBotSidebarFolderLayout<E extends FolderedEntry>(
  entries: readonly E[],
  /** A row being revealed; its folder unfolds so the row can be scrolled to. */
  revealEntryId: string | undefined
) {
  const folderState = useAppStore((s) => s.botSidebarFolders)
  const collapsedGroups = useAppStore((s) => s.collapsedGroups)
  const toggleCollapsedGroup = useAppStore((s) => s.toggleCollapsedGroup)
  const revealFolderId = revealEntryId ? folderState.membership[revealEntryId] : undefined
  const revealFolderKey = revealFolderId ? botSidebarFolderGroupKey(revealFolderId) : null
  const revealFolderFolded = revealFolderKey !== null && collapsedGroups.has(revealFolderKey)
  useEffect(() => {
    if (revealFolderKey && revealFolderFolded) {
      toggleCollapsedGroup(revealFolderKey)
    }
  }, [revealFolderKey, revealFolderFolded, toggleCollapsedGroup])
  const rows: BotSidebarFolderRow<E>[] = useMemo(
    () => layoutBotSidebarFolderRows(entries, folderState, collapsedGroups),
    [entries, folderState, collapsedGroups]
  )
  const dragItemById = useMemo(() => {
    const items = new Map<string, ProjectGroupHeaderDragItem>()
    for (const folder of folderState.folders) {
      items.set(folderDragParentId(folder.id), { parentGroupId: null, tabOrder: 0 })
    }
    for (const row of rows) {
      if (row.kind === 'entry') {
        const owner = row.entry.kind === 'bot' ? row.entry.bot : row.entry.group
        items.set(row.id, {
          parentGroupId: row.folderId ? folderDragParentId(row.folderId) : null,
          // An entry never placed takes no order, so the first drop writes one for every entry.
          tabOrder: owner.sidebarOrder ?? -1
        })
      }
    }
    return items
  }, [rows, folderState.folders])
  const { idsByBucket, placeById } = useMemo(() => {
    const buckets = new Map<string, string[]>()
    const places = new Map<string, { bucket: string; index: number }>()
    for (const row of rows) {
      const item = row.kind === 'entry' ? dragItemById.get(row.id) : undefined
      if (!item) {
        continue
      }
      const bucket = getProjectGroupHeaderDragBucketKey(item, dragItemById)
      const ids = buckets.get(bucket) ?? []
      places.set(row.id, { bucket, index: ids.length })
      ids.push(row.id)
      buckets.set(bucket, ids)
    }
    return { idsByBucket: buckets, placeById: places }
  }, [rows, dragItemById])
  return { rows, folders: folderState.folders, dragItemById, idsByBucket, placeById }
}
