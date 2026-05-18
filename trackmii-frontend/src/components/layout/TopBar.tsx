"use client"

import { Bell, Menu, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"
import { useNotifications, useUnreadCount, useMarkNotificationsRead } from "@/hooks/queries/useNotifications"

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
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: notifications = [] } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleMarkAllRead = () => {
    markRead.mutate([])
  }

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

        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            )}
          </Button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-96 bg-popover border border-border rounded-xl shadow-xl p-0 z-50">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleMarkAllRead}
                    className="text-xs h-7"
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-muted-foreground">All caught up!</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto divide-y divide-border">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 hover:bg-accent transition-colors ${!n.is_read ? 'bg-accent/50' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${!n.is_read ? 'bg-primary' : 'bg-muted'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm leading-tight">{n.title}</p>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(n.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

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
//Notifications bell shows unread count as a red dot and opens themed dropdown on click.