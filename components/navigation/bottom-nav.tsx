'use client'

import React from 'react'
import type { NavItem, TabId } from './app-sidebar'

interface BottomNavProps {
  navItems: readonly NavItem[]
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
}

export function BottomNav({ navItems, activeTab, onSelectTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-card/95 backdrop-blur-md border-t border-border px-2 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] flex items-center justify-around shadow-lg">
      {navItems.map(item => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => {
              onSelectTab(item.id)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer relative min-w-[54px] ${
              isActive
                ? 'text-primary font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="relative">
              <Icon className={`h-4.5 w-4.5 transition-transform ${isActive ? 'scale-110' : ''}`} />
              {'count' in item && item.count !== undefined && item.count > 0 && (
                <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary text-[8px] font-mono font-bold text-primary-foreground">
                  {item.count}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">
              {item.id === 'dashboard'
                ? 'Painel'
                : item.id === 'statistics'
                ? 'Métricas'
                : item.id === 'history'
                ? 'Histórico'
                : item.id === 'garage'
                ? 'Garagem'
                : 'Ajustes'}
            </span>
            {isActive && (
              <div className="absolute -bottom-0.5 h-0.5 w-5 rounded-full bg-primary" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
