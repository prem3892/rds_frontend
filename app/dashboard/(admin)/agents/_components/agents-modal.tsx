"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Card, CardContent } from "@/components/ui/card"
import { Building } from "lucide-react"

// Minimal local type so you can drop-in without relying on '@/types'
type AgentProfile = {
  _id: string
  user: {
    firstName?: string
    lastName?: string
  }
}

interface AgentsCellProps {

  departmentName: string
  agents?: AgentProfile[]
  isOpen: boolean
  onClose: () => void
}

function getInitials(first?: string, last?: string) {
  const a = (first?.[0] || "").toUpperCase()
  const b = (last?.[0] || "").toUpperCase()
  const res = `${a}${b}`.trim()
  return res || "??"
}

export function AgentsModal({ departmentName, agents, isOpen, onClose }: AgentsCellProps) {
  const list = agents ?? []


  const count = list.length

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
        <div className="flex flex-col h-[80vh]">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-pretty">
              <Building className="h-5 w-5" aria-hidden="true" />
              <span className="font-semibold">{departmentName}</span>
              <span className="text-muted-foreground">— Agents</span>
              <Badge variant="secondary" className="ml-1">
                {count}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <div
              role="list"
              className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {list.map((agent) => {
                const first = agent.user?.firstName ?? ""
                const last = agent.user?.lastName ?? ""
                return (
                  <div
                    key={agent._id}
                    role="listitem"
                    aria-label={`${first} ${last}`.trim()}
                    className="group h-full rounded-md transition-colors p-3 hover:bg-muted/50"
                  >
                    <div className="flex flex-col items-center text-center gap-2">
                      <Avatar className="h-9 w-9 ring-1 ring-blue-100 dark:ring-blue-300/20">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-medium">
                          {getInitials(first, last)}
                        </AvatarFallback>
                      </Avatar>
                      <h3 className="text-xs font-medium text-foreground">
                        {(first || "").trim()} {(last || "").trim()}
                      </h3>
                    </div>
                  </div>
                )
              })}
            </div>

            {count === 0 && (
              <div className="mt-10">
                <div className="mx-auto max-w-md rounded-lg border border-dashed p-10 text-center">
                  <Building className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">No agents assigned to this department.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
