"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
// import { Card, CardContent } from "@/components/ui/card"
import { Building } from "lucide-react"

// Minimal local type so you can drop-in without relying on '@/types'
type AgentProfile = {
  _id: string
  user: {
    firstName?: string
    lastName?: string
    role?: "AGENT" | "ADMIN" | "MANAGER"
  }
  profilePicture?: string
}

interface AgentsCellProps {

  departmentName: string
  agents?: AgentProfile[]
  isOpen: boolean
  onClose: () => void
}

const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return undefined;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
    return `${API_BASE_URL}${imagePath}`;
};

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
      <DialogContent className="max-w-4xl max-h-[90vh] sm:max-h-[85vh] p-0 flex flex-col">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-pretty text-sm sm:text-base">
            <Building className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            <span className="font-semibold">{departmentName}</span>
            <span className="text-muted-foreground hidden sm:inline">— Agents</span>
            <Badge variant="secondary" className="ml-1 text-xs">
              {count}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div
              role="list"
              className="grid gap-3 sm:gap-5 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
            >
              {list.map((agent) => {
                const first = agent.user?.firstName ?? ""
                const last = agent.user?.lastName ?? ""
                return (
                  <div
                    key={agent._id}
                    role="listitem"
                    aria-label={`${first} ${last}`.trim()}
                    className="group h-full rounded-md transition-colors p-2 sm:p-3 hover:bg-muted/50"
                  >
                    <div className="flex flex-col items-center text-center gap-1 sm:gap-2">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-1 ring-blue-100 dark:ring-blue-300/20">
                        <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-medium">
                          {getInitials(first, last)}
                        </AvatarFallback>
                        <AvatarImage
                          src={agent.profilePicture ? getFullImageUrl(agent.profilePicture) : undefined}
                          alt={`${agent.user.firstName} ${agent.user.lastName}`}
                        />
                      </Avatar>
                      <h3 className="text-xs font-medium text-foreground leading-tight">
                        {(first || "").trim()} {(last || "").trim()}
                      </h3>
                    </div>
                  </div>
                )
              })}
            </div>

            {count === 0 && (
              <div className="mt-8 sm:mt-10">
                <div className="mx-auto max-w-md rounded-lg border border-dashed p-8 sm:p-10 text-center">
                  <Building className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-muted-foreground/50" aria-hidden="true" />
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
