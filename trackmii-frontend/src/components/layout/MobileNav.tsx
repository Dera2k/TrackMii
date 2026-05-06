"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {  LayoutDashboard, Receipt, PiggyBank, BarChart2, Settings,} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/",          label: "Home",     icon: LayoutDashboard },
  { href: "/expenses",  label: "Expenses", icon: Receipt },
  { href: "/budgets",   label: "Budgets",  icon: PiggyBank },
  { href: "/analytics", label: "Charts",   icon: BarChart2 },
  { href: "/settings",  label: "Settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 h-16 bg-background border-t border-border flex items-center safe-area-inset-bottom">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

//Fixed bottom navigation for mobile. 5 items — Categories is excluded since it's accessible from the sidebar on desktop and less frequently visited on mobile. Active item gets primary color.