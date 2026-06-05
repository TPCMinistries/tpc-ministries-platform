"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calendar, CreditCard, Settings, User,
  BookOpen, Heart, MessageSquare, Gift, Sparkles, Users,
  Home, PenLine, Music, Video, FileText
} from "lucide-react"

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command"

interface CommandMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const router = useRouter()
  
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsOpen(!isOpen)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [isOpen, setIsOpen])

  const runCommand = React.useCallback((command: () => void) => {
    setIsOpen(false)
    command()
  }, [setIsOpen])

  return (
    <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
      <CommandInput placeholder="Search or jump to..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/journal/new"))}>
            <PenLine className="mr-2 h-4 w-4" />
            <span>Start Today&apos;s Journal</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/prayer/new"))}>
            <Heart className="mr-2 h-4 w-4" />
            <span>Add Prayer Request</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/give"))}>
            <Gift className="mr-2 h-4 w-4" />
            <span>Make a Donation</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/my-prophecies"))}>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>View My Prophecies</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <Home className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/library"))}>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Teaching Library</span>
            <CommandShortcut>⌘L</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/prayer"))}>
            <Heart className="mr-2 h-4 w-4" />
            <span>Prayer Wall</span>
            <CommandShortcut>⌘P</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/groups"))}>
            <Users className="mr-2 h-4 w-4" />
            <span>Community Groups</span>
            <CommandShortcut>⌘G</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/events"))}>
            <Calendar className="mr-2 h-4 w-4" />
            <span>Events</span>
            <CommandShortcut>⌘E</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/messages"))}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Messages</span>
            <CommandShortcut>⌘M</CommandShortcut>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Content Types">
          <CommandItem onSelect={() => runCommand(() => router.push("/library?type=video"))}>
            <Video className="mr-2 h-4 w-4" />
            <span>Video Teachings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/library?type=audio"))}>
            <Music className="mr-2 h-4 w-4" />
            <span>Audio Messages</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/resources"))}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Resources & Downloads</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Account">
          <CommandItem onSelect={() => runCommand(() => router.push("/account"))}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/my-giving"))}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Giving History</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/account/settings"))}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
            <CommandShortcut>⌘,</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
