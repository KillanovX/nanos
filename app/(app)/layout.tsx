"use client"

import Sidebar from "@/components/Sidebar"
import ThemeToggle from "@/components/ThemeToggle"
import { useSidebarStore } from "@/store/sidebar-store"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Menu } from "lucide-react"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { collapsed } = useSidebarStore()
  const [mounted, setMounted] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isCollapsed = mounted ? collapsed : false

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        isMobileOpen={isMobileMenuOpen} 
        onCloseMobile={() => setIsMobileMenuOpen(false)} 
      />
      
      <div 
        className={cn(
          "flex-1 flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          // No mobile, ml é 0. No desktop, varia conforme colapso.
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        <header className="h-14 border-b border-border flex items-center justify-between px-4 lg:px-8 sticky top-0 bg-background/60 backdrop-blur-md z-40">
          {/* Botão Hambúrguer Mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-surface-hover text-text-tertiary"
          >
            <Menu size={20} />
          </button>

          {/* Logo discreta no mobile */}
          <span className="lg:hidden font-display font-bold text-accent tracking-tighter">MAKRO</span>

          <ThemeToggle />
        </header>

        <main className="flex-1 px-4 lg:px-8 pt-6 lg:pt-8 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
