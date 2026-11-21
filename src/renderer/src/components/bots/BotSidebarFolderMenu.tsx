import React, { createContext, useContext, useState } from 'react'
import { FolderInput, FolderMinus, FolderPlus } from 'lucide-react'
import {
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger
} from '@/components/ui/context-menu'
import { ProjectGroupNameDialog } from '@/components/sidebar/worktree-list/rows/ProjectGroupNameDialog'
import { useTranslate } from '@/i18n/use-translate'
import { useAppStore } from '@/store'
import {
  addBotSidebarFolder,
  renameBotSidebarFolder,
  setBotSidebarEntryFolder,
  type BotSidebarFolder
} from '../../../../shared/bots/bot-sidebar-folders'
import { createNonSecureContextUuid } from '../../../../shared/identifiers/non-secure-context-uuid'

/** What a row's menu needs to file it: its entry id and the section's folder name dialog. */
type BotSidebarFolderMenuContextValue = {
  entryId: string
  requestFolderName: (request: BotSidebarFolderNameRequest) => void
}

export type BotSidebarFolderNameRequest =
  | { type: 'create'; entryId: string | null }
  | { type: 'rename'; folder: BotSidebarFolder }

const BotSidebarFolderMenuContext = createContext<BotSidebarFolderMenuContextValue | null>(null)

export const BotSidebarFolderMenuProvider = BotSidebarFolderMenuContext.Provider

/** A bot or group-chat row's "Move to folder" items; nothing outside the Bots section's list. */
export function BotSidebarFolderMenuItems(): React.JSX.Element | null {
  const t = useTranslate()
  const context = useContext(BotSidebarFolderMenuContext)
  const folders = useAppStore((s) => s.botSidebarFolders.folders)
  const currentFolderId = useAppStore((s) =>
    context ? s.botSidebarFolders.membership[context.entryId] : undefined
  )
  const updateFolders = useAppStore((s) => s.updateBotSidebarFolders)
  if (!context) {
    return null
  }
  const { entryId, requestFolderName } = context
  const moveTo = (folderId: string | null): void =>
    updateFolders((state) => setBotSidebarEntryFolder(state, entryId, folderId))
  return (
    <>
      <ContextMenuSeparator />
      <ContextMenuSub>
        <ContextMenuSubTrigger>
          <FolderInput className="size-3.5" />
          {t('bots.folders.moveTo', 'Move to folder')}
        </ContextMenuSubTrigger>
        <ContextMenuSubContent>
          {folders.map((folder) => (
            <ContextMenuItem
              key={folder.id}
              disabled={folder.id === currentFolderId}
              onSelect={() => moveTo(folder.id)}
            >
              <span className="max-w-48 truncate">{folder.name}</span>
            </ContextMenuItem>
          ))}
          {folders.length > 0 ? <ContextMenuSeparator /> : null}
          <ContextMenuItem onSelect={() => requestFolderName({ type: 'create', entryId })}>
            <FolderPlus className="size-3.5" />
            {t('bots.folders.newFolderMenu', 'New folder…')}
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
      {currentFolderId ? (
        <ContextMenuItem onSelect={() => moveTo(null)}>
          <FolderMinus className="size-3.5" />
          {t('bots.folders.removeFromFolder', 'Remove from folder')}
        </ContextMenuItem>
      ) : null}
    </>
  )
}

/** The section's one folder name dialog: a new folder (optionally filing a row into it) or a rename. */
export function useBotSidebarFolderNameDialog(): {
  request: (request: BotSidebarFolderNameRequest) => void
  dialog: React.JSX.Element
} {
  const t = useTranslate()
  const updateFolders = useAppStore((s) => s.updateBotSidebarFolders)
  const [pending, setPending] = useState<BotSidebarFolderNameRequest | null>(null)
  const renaming = pending?.type === 'rename'
  const submit = (name: string): void => {
    if (!pending) {
      return
    }
    if (pending.type === 'rename') {
      updateFolders((state) => renameBotSidebarFolder(state, pending.folder.id, name))
      return
    }
    const id = createNonSecureContextUuid()
    updateFolders((state) => {
      const added = addBotSidebarFolder(state, { id, name })
      return pending.entryId ? setBotSidebarEntryFolder(added, pending.entryId, id) : added
    })
  }
  return {
    request: setPending,
    dialog: (
      <ProjectGroupNameDialog
        open={pending !== null}
        title={
          renaming
            ? t('bots.folders.renameTitle', 'Rename Folder')
            : t('bots.folders.newTitle', 'New Folder')
        }
        description={
          renaming
            ? t('bots.folders.renameDescription', 'Update the folder name shown in Bots.')
            : t(
                'bots.folders.newDescription',
                'Sort bots and group chats into a folder you can fold.'
              )
        }
        initialName={renaming ? pending.folder.name : ''}
        nameLabel={t('bots.folders.nameLabel', 'Folder Name')}
        confirmLabel={
          renaming ? t('bots.folders.rename', 'Rename') : t('bots.folders.create', 'Create')
        }
        onOpenChange={(open) => {
          if (!open) {
            setPending(null)
          }
        }}
        onSubmit={submit}
      />
    )
  }
}
