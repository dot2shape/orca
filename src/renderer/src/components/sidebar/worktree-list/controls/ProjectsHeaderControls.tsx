import React from 'react'
import { createPortal } from 'react-dom'
import { FolderTree } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useTranslate } from '@/i18n/use-translate'
import type { ExecutionHostId } from '../../../../../../shared/execution-host/execution-host'
import { ProjectsCollapseAllButton } from './ProjectsCollapseAllButton'

/** WorktreeList's controls in the Projects header: New group while grouped by project, then collapse-all. */
export function ProjectsHeaderControls({
  target,
  hostId,
  onCreateGroup,
  allCollapsed,
  onToggleAll
}: {
  target: HTMLElement | null | undefined
  /** Where a new group is created: the focused host. */
  hostId: ExecutionHostId
  onCreateGroup: ((hostId: ExecutionHostId) => void) | null
  allCollapsed: boolean
  onToggleAll: (() => void) | null
}): React.JSX.Element | null {
  if (!target || (!onCreateGroup && !onToggleAll)) {
    return null
  }
  return createPortal(
    <>
      {onCreateGroup ? <NewProjectGroupButton onCreate={() => onCreateGroup(hostId)} /> : null}
      {onToggleAll ? (
        <ProjectsCollapseAllButton allCollapsed={allCollapsed} onToggle={onToggleAll} />
      ) : null}
    </>,
    target
  )
}

/** The Projects header's "New group": an empty top-level group that projects are then moved into. */
export function NewProjectGroupButton({ onCreate }: { onCreate: () => void }): React.JSX.Element {
  const t = useTranslate()
  const label = t('auto.components.sidebar.SidebarHeader.newProjectGroup', 'New group')
  return (
    <TooltipProvider delayDuration={1000} skipDelayDuration={0}>
      <Tooltip>
        {/* Revealed with the header's other hover controls, as the collapse-all toggle is. */}
        <span className="flex shrink-0 overflow-hidden text-muted-foreground can-hover:w-0 can-hover:opacity-0 can-hover:group-hover/sidebar-header:w-6 can-hover:group-hover/sidebar-header:opacity-100 can-hover:focus-within:w-6 can-hover:focus-within:opacity-100">
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              type="button"
              aria-label={label}
              data-new-project-group=""
              onClick={onCreate}
            >
              <FolderTree />
            </Button>
          </TooltipTrigger>
        </span>
        <TooltipContent side="top" sideOffset={4}>
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
