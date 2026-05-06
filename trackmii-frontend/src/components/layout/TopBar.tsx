"use client"

import { Bell, Menu, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"

const pageTitles: Record<string, string> = {
  "/":           "Dashboard",
  "/expenses":   "Expenses",
  "/categories": "Categories",
  "/budgets":    "Budgets",
  "/analytics":  "Analytics",
  "/settings":   "Settings",
}

interface TopBarProps {
  onMenuClick: () => void
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const isMobile = useIsMobile()
  const title = pageTitles[pathname] ?? "Trackmii"

  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-4 gap-3 shrink-0 sticky top-0 z-40">

      {/* Hamburger — mobile only */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </Button>
      )}

      {/* Page title */}
      <h1 className="text-base font-semibold text-foreground flex-1">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun size={18} className="dark:hidden" />
          <Moon size={18} className="hidden dark:block" />
        </Button>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell size={18} />
        </Button>

        <Avatar className="w-8 h-8 cursor-pointer ml-1">
          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
            TM
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

//Sticky header. Shows hamburger on mobile to open the sidebar drawer. Reads current route to display page title.