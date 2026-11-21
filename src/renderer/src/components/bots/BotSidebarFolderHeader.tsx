import React from 'react'
import { ArrowDown, ArrowUp, Folder, Pencil, Trash2 } from 'lucide-react'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu'
import { useTranslate } from '@/i18n/use-translate'
import { useAppStore } from '@/store'
import {
  moveBotSidebarFolder,
  removeBotSidebarFolder,
  type BotSidebarFolder
} from '../../../../shared/bots/bot-sidebar-folders'
import { BotFoldChevron } from './BotFoldChevron'

/** A folder's header in the Bots section: click folds it; right-click renames, moves or deletes it. */
export function BotSidebarFolderHeader({
  folder,
  groupKey,
  count,
  collapsed,
  isFirst,
  isLast,
  onRename
}: {
  folder: BotSidebarFolder
  /** Its `collapsedGroups` key. */
  groupKey: string
  count: number
  collapsed: boolean
  isFirst: boolean
  isLast: boolean
  onRename: () => void
}): React.JSX.Element {
  const t = useTranslate()
  const toggleCollapsedGroup = useAppStore((s) => s.toggleCollapsedGroup)
  const updateFolders = useAppStore((s) => s.updateBotSidebarFolders)
  const label = collapsed
    ? t('bots.folders.expand', 'Expand {{name}}', { name: folder.name })
    : t('bots.folders.collapse', 'Collapse {{name}}', { name: folder.name })
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          data-bot-sidebar-folder={folder.id}
          aria-expanded={!collapsed}
          aria-label={label}
          className="flex h-7 w-full min-w-0 items-center gap-1.5 rounded-md px-2 text-left text-xs font-medium text-muted-foreground outline-none hover:bg-accent/60 hover:text-foreground focus-visible:ring-1 focus-visible:ring-ring"
          onClick={() => toggleCollapsedGroup(groupKey)}
        >
          <BotFoldChevron open={!collapsed} className="size-3.5" />
          <Folder className="size-3.5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate">{folder.name}</span>
          <span className="shrink-0 tabular-nums text-muted-foreground/70">{count}</span>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onSelect={onRename}>
          <Pencil className="size-3.5" />
          {t('bots.folders.renameMenu', 'Rename folder')}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={isFirst}
          onSelect={() => updateFolders((state) => moveBotSidebarFolder(state, folder.id, -1))}
        >
          <ArrowUp className="size-3.5" />
          {t('bots.folders.moveUp', 'Move up')}
        </ContextMenuItem>
        <ContextMenuItem
          disabled={isLast}
          onSelect={() => updateFolders((state) => moveBotSidebarFolder(state, folder.id, 1))}
        >
          <ArrowDown className="size-3.5" />
          {t('bots.folders.moveDown', 'Move down')}
        </ContextMenuItem>
        <ContextMenuSeparator />
        {/* Its rows go back to the top level; no bot or chat is removed. */}
        <ContextMenuItem
          variant="destructive"
          onSelect={() => updateFolders((state) => removeBotSidebarFolder(state, folder.id))}
        >
          <Trash2 className="size-3.5" />
          {t('bots.folders.deleteMenu', 'Delete folder')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
