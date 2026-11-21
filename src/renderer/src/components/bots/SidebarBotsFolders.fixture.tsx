import { defineFixture } from '../../component-fixtures/component-fixture'
import { stubBots } from '../../component-fixtures/fixture-bots'
import { makeFolderWorkspace } from '@/store/folder-workspaces/folder-workspace.test-fixture'
import type { Bot } from '../../../../shared/bot-types'
import { mascotAvatar, type BotMascotId } from '../../../../shared/bot-avatar'
import { botSidebarFolderGroupKey } from '../../../../shared/bots/bot-sidebar-folders'
import { ConfirmationDialogProvider } from '../dismiss/confirmation/confirmation-dialog'
import { SidebarBotsSplit } from '../sidebar/SidebarBotsSplit'
import { SidebarContentViewport } from '../sidebar/SidebarContentViewport'
import { SidebarBotsSection } from './SidebarBotsSection'

function bot(id: string, name: string, mascot: BotMascotId, sidebarOrder: number): Bot {
  return {
    id,
    name,
    hostId: 'local',
    folder: id,
    folderWorkspaceId: `fw-${id}`,
    agent: 'claude',
    avatar: mascotAvatar(mascot),
    paused: false,
    notifications: { needsPermission: true, taskComplete: true, couldNotFinish: true },
    members: [],
    slack: null,
    linear: null,
    github: null,
    chatSessionId: `chat-${id}`,
    sidebarOrder,
    createdAt: 1,
    updatedAt: 1
  }
}

const BOTS = [
  bot('inbox', 'Inbox bot', 'D1', 0),
  bot('dash', 'Portfolio dashboard', 'K2', 1),
  bot('release', 'Release manager', 'H1', 2),
  bot('builder', 'Builder bot', 'F1', 3),
  bot('legacy', 'Legacy site', 'M1', 4),
  bot('journal', 'Journal', 'N1', 5),
  bot('settings', 'Settings keeper', 'H2', 6)
]

const FOLDERS = {
  folders: [
    { id: 'dashboard', name: '프로젝트 대시보드' },
    { id: 'active', name: '활성 프로젝트' },
    { id: 'inactive', name: '비활성 프로젝트' },
    { id: 'personal', name: '개인 활동' },
    { id: 'settings', name: '전체 설정' }
  ],
  membership: {
    'local/dash': 'dashboard',
    'local/release': 'active',
    'local/builder': 'active',
    'local/legacy': 'inactive',
    'local/journal': 'personal'
  }
}

function folders({ folded = [] }: { folded?: string[] } = {}) {
  return defineFixture({
    width: 300,
    store: {
      sidebarBotsHeight: 4000,
      botSidebarFolders: FOLDERS,
      collapsedGroups: new Set(folded.map(botSidebarFolderGroupKey)),
      folderWorkspaces: BOTS.map((owner) =>
        makeFolderWorkspace({
          id: owner.folderWorkspaceId,
          projectGroupId: 'bots',
          name: owner.name,
          folderPath: `/home/me/.orca/bots/${owner.folder}`
        })
      )
    },
    setup: () => stubBots(BOTS),
    render: () => (
      <ConfirmationDialogProvider>
        <div className="flex flex-col bg-worktree-sidebar text-worktree-sidebar-foreground">
          <SidebarContentViewport>
            <SidebarBotsSplit>
              <SidebarBotsSection onOpenBot={() => {}} />
            </SidebarBotsSplit>
          </SidebarContentViewport>
        </div>
      </ConfirmationDialogProvider>
    )
  })
}

/** Folders open: the unfiled bot on top, then each folder with its bots; empty folders still list. */
export const open = folders()
/** Two folders folded: their headers keep the count, their bots are hidden. */
export const someFolded = folders({ folded: ['inactive', 'personal'] })
