'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ShieldCheck, Award, Sparkles, LogOut } from 'lucide-react'
import type { AuthUser } from '@/app/actions'

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userProfile: AuthUser
  onSaveProfile: (updatedUser: AuthUser) => Promise<void> | void
  onRestartOnboarding: () => void
  onLogout: () => void
}

export function UserProfileDialog({
  open,
  onOpenChange,
  userProfile,
  onSaveProfile,
  onRestartOnboarding,
  onLogout
}: UserProfileDialogProps) {
  const [name, setName] = useState(userProfile.name)
  const [saving, setSaving] = useState(false)

  // Sync internal state only when dialog opens
  useEffect(() => {
    if (open) {
      setName(userProfile.name)
    }
  }, [open, userProfile.name])

  const userInitials = (() => {
    const parts = (name || userProfile.name).trim().split(' ').filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return (name || userProfile.name).slice(0, 2).toUpperCase() || 'MT'
  })()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setSaving(true)
    try {
      await onSaveProfile({
        ...userProfile,
        name: name.trim()
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-base shadow-sm">
                {userInitials}
              </div>
              <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                {name || userProfile.name}
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-mono">
                  Online
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs">
                {userProfile.email}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="rounded-lg border border-border/80 bg-muted/40 p-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Status da Sessão
            </span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 font-mono">Ativa & Conectada</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-primary" /> Conta
            </span>
            <span className="font-medium text-foreground">
              {userProfile.authProvider === 'google' ? 'Google' : userProfile.authProvider === 'github' ? 'GitHub' : 'Verificada'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 pt-2">
          <div className="grid gap-1.5">
            <Label htmlFor="profile-user-name" className="text-xs font-semibold">Nome Completo</Label>
            <Input
              id="profile-user-name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Eduardo Ramos"
              required
              className="text-xs"
              autoFocus
            />
          </div>

          <div className="grid gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="profile-user-email" className="text-xs font-semibold">E-mail</Label>
              <span className="text-[10px] text-muted-foreground">Vinculado ao login</span>
            </div>
            <Input
              id="profile-user-email"
              type="email"
              value={userProfile.email}
              disabled
              readOnly
              className="text-xs bg-muted/60 text-muted-foreground cursor-not-allowed border-dashed select-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="flex-1 cursor-pointer text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={saving}
              className="flex-1 cursor-pointer text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? 'Salvando...' : 'Salvar Perfil'}
            </Button>
          </div>
        </form>

        <div className="border-t border-border pt-3 mt-1 space-y-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onRestartOnboarding()
            }}
            className="w-full text-xs gap-2 cursor-pointer border-dashed text-muted-foreground hover:text-foreground"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Refazer Tour de Boas-Vindas & Questionário
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onOpenChange(false)
              onLogout()
            }}
            className="w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            Encerrar Sessão / Sair da Conta
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
