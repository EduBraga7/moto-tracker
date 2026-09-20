'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, LogOut, CheckCircle2, Sun, Moon, Laptop } from 'lucide-react'
import { type AccentColor, ACCENT_CONFIG } from '@/components/accent-picker'
import type { AuthUser, Moto, Fueling } from '@/app/actions'

interface SettingsTabProps {
  userProfile: AuthUser
  moto: Moto
  fuelingsCount: number
  accent: AccentColor
  onChangeAccent: (color: AccentColor) => void
  resolvedTheme?: string
  theme?: string
  setTheme: (theme: string) => void
  onOpenUserDialog: () => void
  onLogout: () => void
}

export function SettingsTab({
  userProfile,
  moto,
  fuelingsCount,
  accent,
  onChangeAccent,
  resolvedTheme,
  theme,
  setTheme,
  onOpenUserDialog,
  onLogout
}: SettingsTabProps) {
  const userInitials = userProfile.name
    ? userProfile.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Configurações</h1>
        <p className="text-xs text-muted-foreground">
          Personalize seu perfil, aparência e preferências do aplicativo
        </p>
      </div>

      {/* Connected User Profile Card */}
      <Card className="border-border shadow-xs">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-semibold">Perfil do Usuário Conectado</CardTitle>
            <CardDescription className="text-xs">
              Identificação do usuário associado a este painel
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenUserDialog}
              className="text-xs h-8 gap-1.5 cursor-pointer hover:border-primary/40 hover:text-primary"
            >
              <Pencil className="h-3.5 w-3.5" /> Editar Perfil
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              className="text-xs h-8 gap-1.5 cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
              title="Encerrar sessão e voltar para tela de login"
            >
              <LogOut className="h-3.5 w-3.5" /> Sair
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-border/80 bg-muted/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-xs">
                  {userInitials}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-card" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{userProfile.name}</p>
                  <Badge
                    variant="outline"
                    className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-mono"
                  >
                    Online
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-mono">{userProfile.email}</p>
              </div>
            </div>
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-foreground">{userProfile.role}</span>
              <span className="text-[11px] text-muted-foreground font-mono">Plano Pro Ativo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accent Color Section */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Cor de Destaque da Moto</CardTitle>
          <CardDescription className="text-xs">
            Escolha a identidade visual inspirada nas marcas e montadoras esportivas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(Object.keys(ACCENT_CONFIG) as AccentColor[]).map(color => {
              const cfg = ACCENT_CONFIG[color]
              const isSelected = accent === color

              return (
                <div
                  key={color}
                  onClick={() => onChangeAccent(color)}
                  className={`relative flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                      : 'border-border/80 bg-card hover:bg-muted/40 hover:border-border'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`h-6 w-6 rounded-full shadow-xs flex-shrink-0 ${cfg.bgClass}`} />
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{cfg.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{cfg.brand}</p>
                    </div>
                  </div>

                  {isSelected && <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Theme Mode Section */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Modo de Exibição</CardTitle>
          <CardDescription className="text-xs">
            Alterne entre a base clara (branco nítido) e a base escura (preto profundo)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              onClick={() => setTheme('light')}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                resolvedTheme === 'light'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                  : 'border-border/80 bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 border border-zinc-200">
                  <Sun className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Modo Claro</p>
                  <p className="text-[11px] text-muted-foreground">Branco e nítido</p>
                </div>
              </div>
              {resolvedTheme === 'light' && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>

            <div
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                resolvedTheme === 'dark'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                  : 'border-border/80 bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700">
                  <Moon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Modo Escuro</p>
                  <p className="text-[11px] text-muted-foreground">Preto e imersivo</p>
                </div>
              </div>
              {resolvedTheme === 'dark' && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>

            <div
              onClick={() => setTheme('system')}
              className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                theme === 'system'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary/40 shadow-xs'
                  : 'border-border/80 bg-card hover:bg-muted/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted text-muted-foreground border border-border">
                  <Laptop className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Automático</p>
                  <p className="text-[11px] text-muted-foreground">Segue o sistema</p>
                </div>
              </div>
              {theme === 'system' && <CheckCircle2 className="h-4 w-4 text-primary" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* App Information Section */}
      <Card className="border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Informações do Aplicativo</CardTitle>
          <CardDescription className="text-xs">Dados gerais do Moto Tracker</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <span className="text-muted-foreground">Versão do App</span>
              <p className="font-semibold text-foreground mt-0.5">v1.0.0 PRO</p>
            </div>

            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <span className="text-muted-foreground">Finalidade</span>
              <p className="font-semibold text-foreground mt-0.5">Controle de Combustível & Odômetro</p>
            </div>

            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <span className="text-muted-foreground">Total de Abastecimentos</span>
              <p className="font-semibold text-foreground mt-0.5 font-mono">{fuelingsCount} registros</p>
            </div>

            <div className="rounded-lg border border-border p-3 bg-muted/20">
              <span className="text-muted-foreground">Moto Atual</span>
              <p className="font-semibold text-foreground mt-0.5">{moto.model || 'Não cadastrada'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
