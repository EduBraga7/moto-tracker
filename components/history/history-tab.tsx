'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Trash2, CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDate, formatMoney, type ComputedFuelingRow } from '@/lib/calculations'

interface HistoryTabProps {
  rows: ComputedFuelingRow[]
  onOpenNewFueling: () => void
  onDeleteFueling: (id: number) => void
}

export function HistoryTab({
  rows,
  onOpenNewFueling,
  onDeleteFueling
}: HistoryTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Histórico de Abastecimentos</h1>
          <p className="text-xs text-muted-foreground">
            Todos os registros de consumo e quilometragem da sua moto
          </p>
        </div>
        <Button
          size="sm"
          onClick={onOpenNewFueling}
          className="h-8.5 sm:h-9 px-2.5 sm:px-3 gap-1.5 font-medium shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Novo Abastecimento</span>
          <span className="sm:hidden text-xs">Abastecer</span>
        </Button>
      </div>

      {/* Mobile View: Cards */}
      <div className="space-y-3 sm:hidden">
        {rows.length === 0 ? (
          <Card className="border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum abastecimento cadastrado ainda. Clique em "Abastecer" para começar!
          </Card>
        ) : (
          rows.map((row, index) => (
            <motion.div
              key={row.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
            >
              <Card className="border-border bg-card p-3.5 shadow-2xs hover:border-primary/40 transition-colors">
                <div className="flex items-center justify-between pb-2.5 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">{formatDate(row.date)}</span>
                    {row.full ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                      >
                        Tanque Cheio
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Parcial
                      </Badge>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                    onClick={() => onDeleteFueling(row.id)}
                    title="Excluir abastecimento"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2.5 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Odômetro</span>
                    <span className="font-mono font-bold text-foreground">
                      {row.odometer.toLocaleString('pt-BR')} km
                    </span>
                    {row.distance ? (
                      <span className="text-[10px] text-primary font-mono block">+{row.distance} km</span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground block">Inicial</span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-muted-foreground block">Volume / Custo</span>
                    <span className="font-mono font-medium text-foreground block">
                      {row.liters.toFixed(2)} L
                    </span>
                    {row.cost ? (
                      <span className="text-[10px] text-muted-foreground font-mono">{formatMoney(row.cost)}</span>
                    ) : null}
                  </div>

                  <div className="text-right flex flex-col justify-center">
                    <span className="text-[10px] text-muted-foreground block">Rendimento</span>
                    {row.efficiency > 0 ? (
                      <span className="text-sm font-bold font-mono text-primary">
                        {row.efficiency.toFixed(1)} km/L
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-mono">
                        {row.isBase ? '—' : 'Parcial'}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Desktop & Tablet View: Table */}
      <Card className="border-border shadow-xs overflow-hidden hidden sm:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border">
                <TableHead className="font-semibold text-xs">Data</TableHead>
                <TableHead className="text-right font-semibold text-xs">Odômetro</TableHead>
                <TableHead className="text-right font-semibold text-xs">Distância</TableHead>
                <TableHead className="text-right font-semibold text-xs">Volume (L)</TableHead>
                <TableHead className="text-right font-semibold text-xs hidden sm:table-cell">Valor</TableHead>
                <TableHead className="text-right font-semibold text-xs">Rendimento</TableHead>
                <TableHead className="text-right w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum abastecimento cadastrado ainda. Clique em "Novo Abastecimento" para começar!
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row, index) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-b border-border transition-colors hover:bg-muted/40"
                  >
                    <TableCell className="font-medium text-xs">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                        <span>{formatDate(row.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      {row.odometer.toLocaleString('pt-BR')} km
                    </TableCell>
                    <TableCell className="text-right text-xs">
                      {row.distance ? (
                        <Badge variant="secondary" className="font-mono text-[10px] font-normal">
                          +{row.distance} km
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Inicial</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">{row.liters.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-xs font-mono hidden sm:table-cell">
                      {formatMoney(row.cost)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono font-semibold text-primary">
                      {row.efficiency > 0 ? (
                        <span>{row.efficiency.toFixed(1)} km/L</span>
                      ) : (
                        <span className="text-muted-foreground font-normal">{row.isBase ? '—' : 'Parcial'}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive cursor-pointer"
                        onClick={() => onDeleteFueling(row.id)}
                        title="Excluir abastecimento"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
