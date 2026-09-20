'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { Menu, ChevronRight, Bike, Plus } from 'lucide-react'
import type { Moto } from '@/app/actions'
import type { TabId } from './app-sidebar'

interface AppHeaderProps {
  activeTab: TabId
  moto: Moto
  onOpenSidebar: () => void
  onOpenGarageDialog: () => void
  onOpenFuelingDialog: () => void
}

export function AppHeader({
  activeTab,
  moto,
  onOpenSidebar,
  onOpenGarageDialog,
  onOpenFuelingDialog
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 md:px-8 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          className="md:hidden h-9 w-9 rounded-lg"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Breadcrumb style title */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground hidden sm:inline">Moto Tracker</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground/60 hidden sm:inline" />
          <span className="font-semibold text-foreground">
            {activeTab === 'dashboard' && 'Painel Geral'}
            {activeTab === 'statistics' && 'Estatísticas & Análises'}
            {activeTab === 'history' && 'Histórico de Abastecimentos'}
            {activeTab === 'garage' && 'Minha Garagem'}
            {activeTab === 'settings' && 'Configurações'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Vehicle Switcher on Mobile */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenGarageDialog}
          className="h-8.5 px-2.5 gap-1.5 text-xs md:hidden border-border/80 bg-muted/30 cursor-pointer shadow-2xs"
          title="Alternar veículo ativo"
        >
          <Bike className="h-3.5 w-3.5 text-primary" />
          <span className="font-semibold truncate max-w-[95px]">
            {moto.model ? `${moto.model.split(' ')[0]} ${moto.model.split(' ')[1] || ''}` : 'Minha Moto'}
          </span>
        </Button>

        <ThemeToggle className="hidden sm:inline-flex" />
        <Button
          size="sm"
          onClick={onOpenFuelingDialog}
          className="h-8.5 sm:h-9 px-2.5 sm:px-3 gap-1.5 font-medium shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Abastecimento</span>
          <span className="sm:hidden text-xs">Abastecer</span>
        </Button>
      </div>
    </header>
  )
}
