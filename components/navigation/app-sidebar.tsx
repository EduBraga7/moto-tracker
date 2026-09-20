'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bike, X, ChevronsUpDown } from 'lucide-react'
import type { Moto, AuthUser } from '@/app/actions'

export type TabId = 'dashboard' | 'statistics' | 'history' | 'garage' | 'settings'

export interface NavItem {
  id: TabId
  label: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
}

interface AppSidebarProps {
  open: boolean
  onClose: () => void
  moto: Moto
  motosCount: number
  currentOdometer: number
  navItems: readonly NavItem[]
  activeTab: TabId
  onSelectTab: (tab: TabId) => void
  userProfile: AuthUser
  onOpenGarageDialog: () => void
  onOpenUserDialog: () => void
}

export function AppSidebar({
  open,
  onClose,
  moto,
  motosCount,
  currentOdometer,
  navItems,
  activeTab,
  onSelectTab,
  userProfile,
  onOpenGarageDialog,
  onOpenUserDialog
}: AppSidebarProps) {
  const userInitials = userProfile.name
    ? userProfile.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <>
      {/* Backdrop for mobile drawer */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 ease-in-out md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold shadow-xs">
              <Bike className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold tracking-tight text-sm">Moto Tracker</span>
                <span className="rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground font-mono">v1.0</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Motorcycle Quick Card in Sidebar */}
        <div className="p-3 border-b border-border">
          <div
            onClick={onOpenGarageDialog}
            className="group flex items-center gap-3 rounded-xl border border-border/80 bg-muted/40 p-2.5 transition-all hover:bg-muted cursor-pointer hover:border-primary/40"
            title="Minha Garagem - Clique para alternar ou cadastrar veículos"
          >
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/80">
              {moto.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={moto.photoUrl} alt={moto.model} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                  <Bike className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold truncate text-foreground leading-tight">
                  {moto.model || 'Minha Moto'}
                </p>
                {motosCount > 1 && (
                  <Badge
                    variant="outline"
                    className="text-[9px] px-1 py-0 border-primary/40 text-primary font-mono shrink-0 ml-1"
                  >
                    {motosCount} motos
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono uppercase text-muted-foreground">
                  {moto.plate || 'SEM PLACA'}
                </span>
                <span className="text-[10px] text-muted-foreground">•</span>
                <span className="text-[10px] text-muted-foreground">
                  {currentOdometer > 0 ? `${currentOdometer.toLocaleString('pt-BR')} km` : '0 km'}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary transition-colors" />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Menu Principal
          </p>
          {navItems.map(item => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id)
                  onClose()
                }}
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {'count' in item && item.count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                      isActive
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Sidebar Footer - Usuário Conectado */}
        <div className="border-t border-border p-3">
          <button
            type="button"
            onClick={onOpenUserDialog}
            className="group flex items-center justify-between w-full p-2 rounded-xl border border-border/70 bg-card hover:bg-muted/60 hover:border-border transition-all cursor-pointer shadow-2xs text-left"
            title="Gerenciar perfil do usuário conectado"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xs shadow-xs tracking-wider">
                  {userInitials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors leading-tight">
                    {userProfile.name}
                  </span>
                  {userProfile.authProvider === 'google' && (
                    <span className="text-[9px] bg-blue-500/10 text-blue-500 font-mono px-1 py-0.2 rounded border border-blue-500/30 shrink-0">
                      Google
                    </span>
                  )}
                  {userProfile.authProvider === 'github' && (
                    <span className="text-[9px] bg-zinc-800 text-zinc-300 font-mono px-1 py-0.2 rounded border border-zinc-700 shrink-0">
                      GitHub
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-muted-foreground truncate leading-tight font-mono">
                  {userProfile.email}
                </span>
              </div>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/70 group-hover:text-foreground transition-colors flex-shrink-0 ml-1.5" />
          </button>
        </div>
      </aside>
    </>
  )
}
