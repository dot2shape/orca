import * as z from 'zod'

/** `ui.set`'s Bots section folders, as `normalizeBotSidebarFolders` reads them back. */
export const BotSidebarFoldersParam = z.object({
  folders: z.array(z.object({ id: z.string(), name: z.string() })),
  membership: z.record(z.string(), z.string())
})
