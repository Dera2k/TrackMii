"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {LayoutDashboard, Receipt, Tag, PiggyBank, BarChart2, ChevronLeft, ChevronRight,} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/expenses",   label: "Expenses",   icon: Receipt },
  { href: "/categories", label: "Categories", icon: Tag },
  { href: "/budgets",    label: "Budgets",    icon: PiggyBank },
  { href: "/analytics",  label: "Analytics",  icon: BarChart2 },
]

interface AppSidebarProps {
  collapsed: boolean
  onToggleCollapse: () => void
}

export function AppSidebar({ collapsed, onToggleCollapse }: AppSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      className={cn(
        "h-screen sticky top-0 flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border shrink-0">
        {collapsed ? (
          <span className="text-xl font-bold text-primary mx-auto">T</span>
        ) : (
          <span className="text-xl font-bold text-primary tracking-tight">Trackmii</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={onToggleCollapse}
        className="h-12 flex items-center justify-center border-t border-sidebar-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}

//desktop sidebar. Settings removed — accessed via profile menu in TopBar.