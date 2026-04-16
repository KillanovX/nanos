"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  Package, 
  Users, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { useSidebarStore } from "@/store/sidebar-store"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Fluxo de Caixa", href: "/fluxo-de-caixa", icon: ArrowUpDown },
  { label: "Produtos", href: "/produtos", icon: Package },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Inadimplência", href: "/inadimplencia", icon: AlertCircle },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebarStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isCollapsed = mounted ? collapsed : false

  return (
    <aside 
      className={cn(
        "fixed left-0 top-0 h-full bg-surface border-r border-border z-50 overflow-hidden flex flex-col transition-[width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      <div className="flex flex-col h-full py-6">
        {/* Logo/Header */}
        <div className="px-6 mb-8 flex items-center justify-between h-8 overflow-hidden">
          {!isCollapsed && (
            <span className="font-display font-bold text-xl text-accent tracking-tight whitespace-nowrap">
              MAKRO
            </span>
          )}
          <button 
            onClick={toggle}
            className={cn(
              "p-1.5 rounded-md hover:bg-surface-hover text-text-tertiary hover:text-text transition-colors",
              isCollapsed && "mx-auto"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group relative",
                  isActive ? "bg-surface-elevated text-accent" : "text-text-secondary hover:bg-surface-hover hover:text-text"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <div className="absolute left-0 w-1 h-5 rounded-full bg-accent" />
                )}
                <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-accent" : "text-text-tertiary group-hover:text-text")} />
                <span 
                  className={cn(
                    "font-medium text-sm whitespace-nowrap overflow-hidden transition-[max-width,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
                    isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
