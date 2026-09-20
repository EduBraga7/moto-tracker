'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bike, Loader2, Check } from 'lucide-react'
import type { Moto } from '@/app/actions'

interface FuelingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentMoto: Moto
  currentOdometer: number
  onSaveFueling: (data: {
    odometer: number
    liters: number
    cost: number
    date: string
    full: boolean
  }) => Promise<void>
}

export function FuelingDialog({
  open,
  onOpenChange,
  currentMoto,
  currentOdometer,
  onSaveFueling
}: FuelingDialogProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    odometer: '',
    liters: '',
    cost: '',
    date: new Date().toISOString().split('T')[0],
    full: true
  })

  useEffect(() => {
    if (open) {
      setForm({
        odometer: currentOdometer > 0 ? String(currentOdometer + 250) : '',
        liters: '',
        cost: '',
        date: new Date().toISOString().split('T')[0],
        full: true
      })
    }
  }, [open, currentOdometer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const odo = Number(form.odometer)
    const lit = Number(form.liters)
    const val = Number(form.cost)

    if (isNaN(odo) || isNaN(lit) || lit <= 0) {
      alert('Por favor, informe valores válidos para o odômetro e litros.')
      return
    }

    try {
      setSaving(true)
      await onSaveFueling({
        odometer: odo,
        liters: lit,
        cost: val,
        date: form.date,
        full: form.full
      })
      onOpenChange(false)
    } catch (err) {
      console.error('Erro ao salvar abastecimento:', err)
      alert('Falha ao salvar abastecimento. Verifique os dados e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Abastecimento</DialogTitle>
          <DialogDescription>
            Insira os dados do painel e do cupom fiscal da sua moto.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="rounded-lg border border-border/80 bg-muted/40 p-2.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Bike className="h-3.5 w-3.5 text-primary" /> Moto Selecionada:
            </span>
            <span className="font-semibold text-foreground truncate max-w-[190px]">
              {currentMoto.model} {currentMoto.plate ? `(${currentMoto.plate})` : ''}
            </span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dialog-odometer">Quilometragem atual (km)</Label>
            <Input
              id="dialog-odometer"
              type="number"
              required
              min={currentOdometer > 0 ? currentOdometer + 1 : 1}
              placeholder={`Ex: ${currentOdometer > 0 ? currentOdometer + 250 : 65320}`}
              value={form.odometer}
              onChange={e => setForm({ ...form, odometer: e.target.value })}
            />
            {currentOdometer > 0 && (
              <span className="text-xs text-muted-foreground">
                Último odômetro registrado: {currentOdometer.toLocaleString('pt-BR')} km
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dialog-liters">Litros</Label>
              <Input
                id="dialog-liters"
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="Ex: 8.5"
                value={form.liters}
                onChange={e => setForm({ ...form, liters: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dialog-cost">Valor Total (R$)</Label>
              <Input
                id="dialog-cost"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ex: 50.00"
                value={form.cost}
                onChange={e => setForm({ ...form, cost: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dialog-date">Data</Label>
            <Input
              id="dialog-date"
              type="date"
              required
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
            />
          </div>

          <div className="space-y-1 mt-1">
            <Label className="text-xs text-muted-foreground">Tipo de Abastecimento</Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant={form.full ? 'default' : 'outline'}
                size="sm"
                className="flex-1 cursor-pointer"
                onClick={() => setForm({ ...form, full: true })}
              >
                Tanque Cheio
              </Button>
              <Button
                type="button"
                variant={!form.full ? 'default' : 'outline'}
                size="sm"
                className="flex-1 cursor-pointer"
                onClick={() => setForm({ ...form, full: false })}
              >
                Parcial
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1">
              {form.full
                ? 'Tanque cheio calcula o rendimento exato desde o último abastecimento.'
                : 'Abastecimento parcial acumula os litros até o próximo tanque cheio.'}
            </p>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="mt-2 w-full gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Salvando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" /> Salvar Registro
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
