'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bike, Loader2, Check, Upload, Trash2 } from 'lucide-react'
import { compressImage } from '@/lib/image-utils'
import type { Moto } from '@/app/actions'

interface MotoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMoto: Moto
  onSaveMoto: (data: {
    name: string
    model: string
    plate: string
    year: string
    photoUrl: string
  }) => Promise<void>
}

export function MotoDialog({
  open,
  onOpenChange,
  currentMoto,
  onSaveMoto
}: MotoDialogProps) {
  const [saving, setSaving] = useState(false)
  const [compressing, setCompressing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [motoForm, setMotoForm] = useState({
    name: '',
    model: '',
    plate: '',
    year: '',
    photoUrl: ''
  })

  useEffect(() => {
    if (open && currentMoto) {
      setMotoForm({
        name: currentMoto.name || '',
        model: currentMoto.model || '',
        plate: currentMoto.plate || '',
        year: currentMoto.year || '',
        photoUrl: currentMoto.photoUrl || ''
      })
    }
  }, [open, currentMoto])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (JPG, PNG ou WebP).')
      return
    }

    try {
      setCompressing(true)
      const compressedBase64 = await compressImage(file, 1000, 0.75)
      setMotoForm(prev => ({ ...prev, photoUrl: compressedBase64 }))
    } catch (err) {
      console.error('Erro ao comprimir imagem:', err)
      alert('Não foi possível processar esta imagem. Tente uma foto de tamanho menor.')
    } finally {
      setCompressing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      await onSaveMoto(motoForm)
      onOpenChange(false)
    } catch (err) {
      console.error('Erro ao atualizar moto:', err)
      alert('Erro ao salvar informações do veículo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bike className="h-5 w-5 text-primary" />
            Cadastrar / Editar Minha Moto
          </DialogTitle>
          <DialogDescription>
            Personalize as informações e a foto da sua moto atual.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-3">
          {/* Photo preview and upload */}
          <div className="flex flex-col items-center gap-3 pb-2">
            <div className="relative group w-32 h-32 rounded-2xl overflow-hidden border border-border bg-muted/30 flex items-center justify-center shadow-inner">
              {compressing ? (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center gap-1.5">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-[10px] font-medium text-foreground">Otimizando foto...</span>
                </div>
              ) : motoForm.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={motoForm.photoUrl}
                  alt="Foto da Moto"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                  <Bike className="h-10 w-10 mb-1 opacity-40" />
                  <span className="text-[10px]">Sem foto</span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs h-8 gap-1.5 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                disabled={compressing}
              >
                <Upload className="h-3.5 w-3.5" />
                {motoForm.photoUrl ? 'Alterar Foto' : 'Enviar Foto da Moto'}
              </Button>

              {motoForm.photoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                  onClick={() => setMotoForm(prev => ({ ...prev, photoUrl: '' }))}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Remover
                </Button>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground">
              Comprimida automaticamente para ~90KB via Canvas no seu navegador
            </span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="moto-model-name">Modelo e Cilindrada</Label>
            <Input
              id="moto-model-name"
              placeholder="Ex: Honda CB 300F Twister"
              value={motoForm.model}
              onChange={e => setMotoForm({ ...motoForm, model: e.target.value })}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="moto-nickname">Apelido da Moto (Opcional)</Label>
            <Input
              id="moto-nickname"
              placeholder="Ex: Foguete Vermelho, Minha Guerreira"
              value={motoForm.name}
              onChange={e => setMotoForm({ ...motoForm, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="moto-plate-field">Placa</Label>
              <Input
                id="moto-plate-field"
                placeholder="Ex: BRA-2E19"
                value={motoForm.plate}
                onChange={e => setMotoForm({ ...motoForm, plate: e.target.value.toUpperCase() })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="moto-year-field">Ano de Fabricação</Label>
              <Input
                id="moto-year-field"
                placeholder="Ex: 2024"
                value={motoForm.year}
                onChange={e => setMotoForm({ ...motoForm, year: e.target.value })}
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={saving || compressing}
            className="mt-2 w-full gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Atualizar Informações
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
