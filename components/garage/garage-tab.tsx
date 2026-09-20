'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bike, Plus, Check, CheckCircle2, Pencil } from 'lucide-react'
import type { Moto, Fueling } from '@/app/actions'

interface GarageTabProps {
  motos: Moto[]
  activeMotoId: number
  fuelings: Fueling[]
  onSelectMoto: (motoId: number) => void
  onOpenEditMoto: (motoId: number) => void
  onOpenGarageDialog: () => void
}

export function GarageTab({
  motos,
  activeMotoId,
  fuelings,
  onSelectMoto,
  onOpenEditMoto,
  onOpenGarageDialog
}: GarageTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Minha Garagem</h1>
          <p className="text-xs text-muted-foreground">
            Gerencie todos os seus veículos, alterne a moto ativa e acompanhe odômetros individuais
          </p>
        </div>
        <Button
          onClick={onOpenGarageDialog}
          className="text-xs h-9 gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Veículo</span>
        </Button>
      </div>

      {/* Grid of registered motorcycles */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {motos.map(m => {
          const isActive = m.id === activeMotoId
          const motoFuelings = fuelings.filter(f => f.motoId === m.id)
          const motoOdometer =
            motoFuelings.length > 0 ? Math.max(...motoFuelings.map(f => f.odometer)) : 0

          return (
            <Card
              key={m.id}
              className={`overflow-hidden transition-all border ${
                isActive
                  ? 'border-primary shadow-sm ring-1 ring-primary/40 bg-card'
                  : 'border-border/80 hover:border-primary/40 bg-card'
              }`}
            >
              {/* Photo header */}
              <div className="relative aspect-video w-full bg-muted/40 flex items-center justify-center border-b border-border overflow-hidden group">
                {m.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.photoUrl}
                    alt={m.model}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                    <Bike className="h-12 w-12 mb-1 opacity-30" />
                    <p className="text-[11px]">Sem foto cadastrada</p>
                  </div>
                )}
                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                  {isActive ? (
                    <Badge className="bg-emerald-600 text-white text-[10px] font-semibold shadow-xs">
                      Ativa no Painel
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-background/80 backdrop-blur-xs text-[10px]">
                      Garagem
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-foreground truncate">
                      {m.model || m.name}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{m.name || 'Sem apelido'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-border/80 p-2 bg-muted/20">
                    <span className="text-[10px] text-muted-foreground block">Placa</span>
                    <span className="font-semibold font-mono text-foreground">{m.plate || '—'}</span>
                  </div>
                  <div className="rounded-lg border border-border/80 p-2 bg-muted/20">
                    <span className="text-[10px] text-muted-foreground block">Ano</span>
                    <span className="font-semibold text-foreground">{m.year || '—'}</span>
                  </div>
                  <div className="rounded-lg border border-border/80 p-2 bg-muted/20">
                    <span className="text-[10px] text-muted-foreground block">Odômetro</span>
                    <span className="font-semibold font-mono text-foreground">
                      {motoOdometer > 0 ? `${motoOdometer.toLocaleString('pt-BR')} km` : '0 km'}
                    </span>
                  </div>
                  <div className="rounded-lg border border-border/80 p-2 bg-muted/20">
                    <span className="text-[10px] text-muted-foreground block">Abastecimentos</span>
                    <span className="font-semibold text-foreground">{motoFuelings.length} reg.</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {!isActive ? (
                    <Button
                      size="sm"
                      onClick={() => onSelectMoto(m.id)}
                      className="flex-1 text-xs h-8 gap-1.5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Usar no Painel
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="flex-1 text-xs h-8 gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold bg-emerald-500/5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Em Uso
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => onOpenEditMoto(m.id)}
                    className="h-8 w-8 cursor-pointer hover:border-primary/40"
                    title="Editar dados da moto"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Add new card placeholder */}
        <Card
          onClick={onOpenGarageDialog}
          className="border-dashed border-2 border-border/80 hover:border-primary/60 bg-muted/10 hover:bg-muted/30 transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[280px]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-3">
            <Plus className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-foreground">Adicionar Outro Veículo</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
            Cadastre uma nova moto para gerenciar consumo e odômetro separadamente
          </p>
        </Card>
      </div>
    </div>
  )
}
