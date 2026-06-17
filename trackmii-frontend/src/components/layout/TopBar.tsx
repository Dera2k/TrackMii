"use client"

import Image from "next/image"
import { Bell, Sun, Moon, LogOut, Settings } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useIsMobile } from "@/hooks/use-mobile"
import { useNotifications, useUnreadCount, useMarkNotificationsRead } from "@/hooks/queries/useNotifications"
import { useAuth } from "@/lib/contexts/auth-context"
import { useLogout } from "@/hooks/queries/useAuth"
import Link from "next/link"

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
  const { user } = useAuth()
  const logout = useLogout()
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: notifications = [] } = useNotifications()
  const markRead = useMarkNotificationsRead()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const handleMarkAllRead = () => {
    markRead.mutate([])
    setShowNotifications(false)
  }

  return (
    <header className="h-16 border-b border-border bg-background flex items-center px-4 gap-3 shrink-0 sticky top-0 z-40">

      {/* Mobile: Logo as menu trigger */}
      {isMobile && (
        <button
          onClick={onMenuClick}
          className="flex items-center p-1.5 rounded-lg hover:bg-accent transition-colors shrink-0"
          aria-label="Menu"
        >
          <Image
            src="/logos/trackmii32.png"
            alt="Trackmii"
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
            priority
          />
        </button>
      )}

      {/* Page title */}
      <h1 className="text-base font-semibold text-foreground flex-1">{title}</h1>

      {/* Right actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <Sun size={18} className="dark:hidden" />
          <Moon size={18} className="hidden dark:block" />
        </Button>

        {/* Notifications */}
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
            <div className="absolute right-0 top-12 w-96 bg-popover border border-border rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold text-sm">Notifications</h3>
              </div>

              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Bell size={20} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">All caught up!</p>
                  <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
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
                  {unreadCount > 0 && (
                    <div className="p-3 border-t border-border">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleMarkAllRead}
                        className="w-full text-xs"
                      >
                        Mark all as read
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative ml-2">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-lg hover:bg-accent transition-colors"
            aria-label="Profile menu"
          >
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-xs">
                {user?.name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? 'U'}
              </AvatarFallback>
            </Avatar>
          </button>

          {showProfile && (
            <div className="absolute right-0 top-12 w-48 bg-popover border border-border rounded-xl shadow-xl z-50">
              <div className="p-4 border-b border-border">
                <p className="text-sm font-medium text-foreground">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>

              <div className="p-2 space-y-1">
                <Link
                  href="/settings"
                  onClick={() => setShowProfile(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-accent rounded-lg transition-colors"
                >
                  <Settings size={16} />
                  Settings
                </Link>

                <button
                  onClick={() => {
                    logout()
                    setShowProfile(false)
                  }}
                  className="flex items-center gap-3 px-3 py-2 w-full text-sm text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}