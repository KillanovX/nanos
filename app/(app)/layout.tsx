"use client"

import Sidebar from "@/components/Sidebar"
import { useSidebarStore } from "@/store/sidebar-store"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { collapsed } = useSidebarStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isCollapsed = mounted ? collapsed : false

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main 
        className={cn(
          "flex-1 transition-[margin-left] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] min-h-screen px-8 pt-6 pb-8",
          isCollapsed ? "ml-[72px]" : "ml-[260px]"
        )}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
