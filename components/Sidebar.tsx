"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ArrowUpRight, 
  ArrowDownRight,
  Package, 
  Users,
  AlertCircle,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react"
import { useSidebarStore } from "@/store/sidebar-store"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Vendas", href: "/vendas", icon: ArrowUpRight },
  { label: "Despesas", href: "/despesas", icon: ArrowDownRight },
  { label: "Produtos", href: "/produtos", icon: Package },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { label: "Inadimplência", href: "/inadimplencia", icon: AlertCircle },
]

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({ isMobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname()
  const { collapsed, toggle } = useSidebarStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isCollapsed = mounted ? collapsed : false

  return (
    <>
      {/* Overlay para mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden" 
          onClick={onCloseMobile}
        />
      )}

      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-surface border-r border-border z-[110] flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          // Desktop behavior
          isCollapsed ? "lg:w-[72px]" : "lg:w-[260px]",
          // Mobile behavior
          isMobileOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full py-6">
          {/* Logo/Header */}
          <div className="px-6 mb-8 flex items-center justify-between h-8 overflow-hidden">
            <span className="font-display font-bold text-xl text-accent tracking-tight whitespace-nowrap">
              MAKRO
            </span>
            
            {/* Botão para fechar no mobile */}
            <button onClick={onCloseMobile} className="lg:hidden p-1 text-text-tertiary">
              <X size={20} />
            </button>

            {/* Botão de colapso no desktop */}
            <button 
              onClick={toggle}
              className={cn(
                "hidden lg:block p-1.5 rounded-md hover:bg-surface-hover text-text-tertiary hover:text-text transition-colors",
                isCollapsed && "mx-auto"
              )}
            >
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-none">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
              const Icon = item.icon

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative",
                    isActive 
                      ? "bg-accent/10 text-accent font-semibold" 
                      : "text-text-secondary hover:bg-surface-hover hover:text-text"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-5 rounded-full bg-accent" />
                  )}
                  <Icon className={cn("h-4 w-4 shrink-0 transition-colors", isActive ? "text-accent" : "text-text-tertiary group-hover:text-text")} />
                  <span 
                    className={cn(
                      "text-sm whitespace-nowrap overflow-hidden transition-all duration-300",
                      isCollapsed ? "lg:max-w-0 lg:opacity-0" : "max-w-[150px] opacity-100"
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
    </>
  )
}
