'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Gauge, Route, Wallet, Fuel, Pencil, Bike, Camera } from 'lucide-react'
import { formatMonth, formatMoney, type TelemetrySummary } from '@/lib/calculations'
import type { Moto } from '@/app/actions'

interface DashboardMetricsProps {
  moto: Moto
  motosCount: number
  currentOdometer: number
  fuelingsCount: number
  computed: TelemetrySummary
  selectedMonth: string
  availableMonths: string[]
  onSelectMonth: (month: string) => void
  onOpenMotoDialog: () => void
  onOpenGarageDialog: () => void
}

export function DashboardMetrics({
  moto,
  motosCount,
  currentOdometer,
  fuelingsCount,
  computed,
  selectedMonth,
  availableMonths,
  onSelectMonth,
  onOpenMotoDialog,
  onOpenGarageDialog
}: DashboardMetricsProps) {
  return (
    <div className="space-y-6">
      {/* Compact Vehicle Header Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4">
          {/* Motorcycle Photo */}
          <div
            onClick={onOpenMotoDialog}
            className="relative group w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-border bg-muted/40 shrink-0 flex items-center justify-center cursor-pointer shadow-xs hover:ring-2 hover:ring-primary/40 transition-all"
          >
            {moto.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={moto.photoUrl}
                alt={moto.model}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground p-2 text-center">
                <Camera className="h-6 w-6 mb-1 text-primary opacity-80 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-medium">Foto</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
              <Pencil className="h-3.5 w-3.5 mr-1" /> Editar
            </div>
          </div>

          {/* Moto Info & Stats */}
          <div className="flex-1 flex flex-col justify-between text-center sm:text-left gap-2.5">
            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  {moto.name || 'Minha Moto'}
                </span>
                {moto.plate && (
                  <Badge
                    variant="outline"
                    className="font-mono text-[11px] tracking-wider uppercase border-border font-semibold"
                  >
                    {moto.plate}
                  </Badge>
                )}
                {moto.year && (
                  <Badge variant="secondary" className="text-[11px] font-normal">
                    {moto.year}
                  </Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-0.5 text-foreground">
                {moto.model || 'Defina o modelo da sua moto'}
              </h1>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-2.5 py-1">
                <Gauge className="h-3.5 w-3.5 text-primary" />
                <span>
                  Odômetro:{' '}
                  <strong className="text-foreground">{currentOdometer.toLocaleString('pt-BR')} km</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-2.5 py-1">
                <Fuel className="h-3.5 w-3.5 text-primary" />
                <span>
                  Abastecimentos: <strong className="text-foreground">{fuelingsCount}</strong>
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={onOpenMotoDialog}
                className="h-7.5 gap-1 text-xs ml-auto hidden sm:flex cursor-pointer hover:border-primary/40 hover:text-primary"
              >
                <Pencil className="h-3 w-3" />
                Editar Veículo
              </Button>
            </div>

            <div className="flex gap-2 sm:hidden w-full mt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenMotoDialog}
                className="flex-1 h-8 text-xs cursor-pointer"
              >
                <Pencil className="h-3 w-3 mr-1" /> Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenGarageDialog}
                className="flex-1 h-8 text-xs cursor-pointer border-primary/40 text-primary"
              >
                <Bike className="h-3 w-3 mr-1" /> Garagem ({motosCount})
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Month Selector Pills */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <h2 className="text-lg font-bold tracking-tight text-foreground">Métricas de Consumo</h2>
          <p className="text-xs text-muted-foreground">Acompanhamento da eficiência e gastos recentes</p>
        </div>

        <div
          className="flex overflow-x-auto gap-1.5 py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <Button
            variant={selectedMonth === 'all' ? 'default' : 'outline'}
            className={`rounded-lg text-xs h-8 cursor-pointer font-medium ${
              selectedMonth === 'all' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
            }`}
            onClick={() => onSelectMonth('all')}
            size="sm"
          >
            Todo o período
          </Button>
          {availableMonths.map(month => (
            <Button
              key={month}
              variant={selectedMonth === month ? 'default' : 'outline'}
              className={`rounded-lg text-xs h-8 cursor-pointer font-medium ${
                selectedMonth === month ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''
              }`}
              onClick={() => onSelectMonth(month)}
              size="sm"
            >
              {formatMonth(month)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Média Ponderada Real
            </CardTitle>
            <Gauge className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-primary">
              {computed.average.toFixed(1)}{' '}
              <span className="text-sm font-normal text-muted-foreground">km/L</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {selectedMonth === 'all'
                ? 'Km total / Litros totais medidos'
                : `Média ponderada em ${formatMonth(selectedMonth)}`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Distância Percorrida
            </CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {computed.distance.toLocaleString('pt-BR')}{' '}
              <span className="text-sm font-normal text-muted-foreground">km</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {selectedMonth === 'all'
                ? 'Total rodado registrado'
                : `Rodados em ${formatMonth(selectedMonth)}`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Custo por Km
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatMoney(computed.costPerKm)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {selectedMonth === 'all' ? 'Custo real médio por km' : `Custo em ${formatMonth(selectedMonth)}`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Total Investido
            </CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatMoney(computed.spent)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {selectedMonth === 'all' ? 'Combustível no período' : `Combustível em ${formatMonth(selectedMonth)}`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
