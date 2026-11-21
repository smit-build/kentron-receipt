import { Add01Icon, GridViewIcon } from "hugeicons-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

interface WorkspacesEmptyProps {
  onCreate: () => void
}

export function WorkspacesEmpty({ onCreate }: WorkspacesEmptyProps) {
  return (
    <div className="flex min-h-svh flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center border-b border-border px-6">
        <span className="text-[13px] font-medium text-foreground">
          All workspaces
        </span>
      </header>

      <div className="flex w-full max-w-[1600px] flex-1 flex-col px-6 py-8">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Workspaces
            </h1>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Keep connected apps, tools, and access scoped together in each
              workspace.
            </p>
          </div>
          <Button onClick={onCreate}>
            <Add01Icon data-icon="inline-start" />
            New workspace
          </Button>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <Empty className="max-w-md">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <GridViewIcon />
              </EmptyMedia>
              <EmptyTitle>No workspaces yet</EmptyTitle>
              <EmptyDescription>
                A workspace scopes which apps your AI clients can reach
                through the MCP Gateway.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button onClick={onCreate}>
                <Add01Icon data-icon="inline-start" />
                Create workspace
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      </div>
    </div>
  )
}
