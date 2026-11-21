import { defineFixture } from '../../../../component-fixtures/component-fixture'
import { NewProjectGroupButton } from '../controls/ProjectsHeaderControls'
import { ProjectGroupHeaderMenu } from './project-group-header-actions'

/** The Projects header's New group control beside a group header and its menu (New subgroup). */
export const newGroupAndSubgroup = defineFixture({
  width: 300,
  render: () => (
    <div className="flex flex-col gap-1 bg-worktree-sidebar p-2 text-worktree-sidebar-foreground">
      <div className="group/sidebar-header flex h-7 items-center gap-1 px-1 text-xs font-semibold">
        <span className="flex-1">Projects</span>
        <NewProjectGroupButton onCreate={() => {}} />
      </div>
      <div className="group/repo-header flex h-7 items-center gap-1 px-1 text-[13px] font-semibold">
        <span className="flex-1">활성 프로젝트</span>
        <ProjectGroupHeaderMenu
          groupId="active"
          hostId="local"
          label="활성 프로젝트"
          projectGroup={null}
          onRename={() => {}}
          onCreateSubgroup={() => {}}
          onDelete={() => {}}
        />
      </div>
    </div>
  )
})
