'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import { Gauge, Route, Wallet, Fuel, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatMoney } from '@/lib/calculations'
import type { StatisticsData } from '@/hooks/use-fueling-calculations'

interface StatisticsTabProps {
  statisticsData: StatisticsData
  statView: 'monthly' | 'yearly'
  setStatView: (view: 'monthly' | 'yearly') => void
  statYear: string
  setStatYear: (year: string) => void
  availableYears: string[]
  activeColorHex: string
  isDark: boolean
}

export function StatisticsTab({
  statisticsData,
  statView,
  setStatView,
  statYear,
  setStatYear,
  availableYears,
  activeColorHex,
  isDark
}: StatisticsTabProps) {
  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Estatísticas & Análises</h1>
          <p className="text-xs text-muted-foreground">
            Cálculos consolidados com médias ponderadas automotivas reais
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Monthly vs Yearly Selector */}
          <div className="inline-flex rounded-lg border border-border p-1 bg-muted/40">
            <button
              type="button"
              onClick={() => setStatView('monthly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                statView === 'monthly'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mês a Mês
            </button>
            <button
              type="button"
              onClick={() => setStatView('yearly')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                statView === 'yearly'
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Ano a Ano
            </button>
          </div>

          {/* Year Filter Pills */}
          {statView === 'monthly' && availableYears.length > 0 && (
            <div className="flex items-center gap-1 border border-border rounded-lg p-1 bg-muted/20">
              <button
                type="button"
                onClick={() => setStatYear('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  statYear === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todos
              </button>
              {availableYears.map(yr => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setStatYear(yr)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                    statYear === yr
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* KPI Records Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Média Ponderada Real
            </CardTitle>
            <Gauge className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-primary">
              {statisticsData.overallAvgEff.toFixed(1)}{' '}
              <span className="text-sm font-normal text-muted-foreground">km/L</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
              <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> Max: {statisticsData.bestEfficiency.toFixed(1)}
              </span>
              <span>•</span>
              <span className="flex items-center text-rose-500 font-medium">
                <ArrowDownRight className="h-3 w-3 mr-0.5" /> Min: {statisticsData.worstEfficiency.toFixed(1)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Quilometragem Total
            </CardTitle>
            <Route className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {statisticsData.totalDistance.toLocaleString('pt-BR')}{' '}
              <span className="text-sm font-normal text-muted-foreground">km</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Média de{' '}
              {(statisticsData.activeList.length
                ? statisticsData.totalDistance / statisticsData.activeList.length
                : 0
              ).toFixed(0)}{' '}
              km por {statView === 'monthly' ? 'mês' : 'ano'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Investimento Total
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatMoney(statisticsData.totalSpent)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Em {statisticsData.totalLiters.toFixed(1)} litros abastecidos
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
              Preço Médio Ponderado / L
            </CardTitle>
            <Fuel className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatMoney(statisticsData.overallAvgPrice)}{' '}
              <span className="text-sm font-normal text-muted-foreground">/L</span>
            </div>
            <div className="flex items-center gap-2 mt-2 text-[11px] text-muted-foreground">
              <span>Mín: {formatMoney(statisticsData.lowestPrice)}</span>
              <span>•</span>
              <span>Máx: {formatMoney(statisticsData.highestPrice)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2 Main Detailed Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 1: Efficiency evolution */}
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Eficiência Média ({statView === 'monthly' ? 'km/L por Mês' : 'km/L por Ano'})</span>
              <Gauge className="h-4 w-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-xs">
              Autonomia média ponderada alcançada em cada período
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-1">
            <ChartContainer
              config={{ efficiency: { label: 'Média km/L', color: activeColorHex } }}
              className="h-[260px] w-full"
            >
              <AreaChart data={statisticsData.activeList} margin={{ left: -15, right: 12, top: 12, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillStatEff" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeColorHex} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={activeColorHex} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke={isDark ? '#a1a1aa' : '#71717a'}
                />
                <YAxis
                  domain={['dataMin - 3', 'dataMax + 3']}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke={isDark ? '#a1a1aa' : '#71717a'}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="efficiency"
                  stroke={activeColorHex}
                  strokeWidth={2.5}
                  fill="url(#fillStatEff)"
                  dot={{
                    r: 4,
                    fill: activeColorHex,
                    strokeWidth: 1.5,
                    stroke: isDark ? '#121215' : '#ffffff'
                  }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 2: Monthly / Yearly Cost Bar Chart */}
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Total Gasto com Combustível (R$)</span>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription className="text-xs">
              Valor investido em cada {statView === 'monthly' ? 'mês' : 'ano'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-1">
            <ChartContainer
              config={{ cost: { label: 'Gasto (R$)', color: activeColorHex } }}
              className="h-[260px] w-full"
            >
              <BarChart data={statisticsData.activeList} margin={{ left: -15, right: 12, top: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke={isDark ? '#a1a1aa' : '#71717a'}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="cost" fill={activeColorHex} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* 2 Secondary Detailed Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Chart 3: Distance Traveled Bar Chart */}
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Quilômetros Rodados (km)</span>
              <Route className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription className="text-xs">
              Distância total percorrida no período
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-1">
            <ChartContainer
              config={{
                distance: { label: 'Km Rodados', color: isDark ? '#ffffff' : '#18181b' }
              }}
              className="h-[240px] w-full"
            >
              <BarChart data={statisticsData.activeList} margin={{ left: -15, right: 12, top: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke={isDark ? '#a1a1aa' : '#71717a'}
                />
                <YAxis tickLine={false} axisLine={false} fontSize={12} stroke={isDark ? '#a1a1aa' : '#71717a'} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="distance"
                  fill={isDark ? '#27272a' : '#e4e4e7'}
                  stroke={isDark ? '#3f3f46' : '#d4d4d8'}
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Chart 4: Price per liter evolution */}
        <Card className="border-border shadow-xs">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span>Preço Médio da Gasolina (R$/L)</span>
              <Fuel className="h-4 w-4 text-primary" />
            </CardTitle>
            <CardDescription className="text-xs">
              Oscilação do preço do litro pago nos postos
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-1">
            <ChartContainer
              config={{
                pricePerLiter: { label: 'Preço/Litro (R$)', color: activeColorHex }
              }}
              className="h-[240px] w-full"
            >
              <LineChart data={statisticsData.activeList} margin={{ left: -15, right: 12, top: 12, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke={isDark ? '#a1a1aa' : '#71717a'}
                />
                <YAxis
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  stroke={isDark ? '#a1a1aa' : '#71717a'}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="pricePerLiter"
                  stroke={activeColorHex}
                  strokeWidth={2}
                  dot={{ r: 4, fill: activeColorHex }}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Consolidated Monthly/Yearly Table */}
      <Card className="border-border shadow-xs overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Tabela de Fechamento Consolidado</CardTitle>
              <CardDescription className="text-xs">
                {statView === 'monthly' ? 'Dados agrupados mês a mês' : 'Dados agrupados ano a ano'}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              {statisticsData.activeList.length} períodos
            </Badge>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-border">
                <TableHead className="font-semibold text-xs">Período</TableHead>
                <TableHead className="text-center font-semibold text-xs">Abastecimentos</TableHead>
                <TableHead className="text-right font-semibold text-xs">Km Rodados</TableHead>
                <TableHead className="text-right font-semibold text-xs">Volume (L)</TableHead>
                <TableHead className="text-right font-semibold text-xs">Total Gasto</TableHead>
                <TableHead className="text-right font-semibold text-xs">Preço Médio / L</TableHead>
                <TableHead className="text-right font-semibold text-xs">Custo / Km</TableHead>
                <TableHead className="text-right font-semibold text-xs">Média km/L</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statisticsData.activeList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground text-sm">
                    Nenhum registro encontrado para este período.
                  </TableCell>
                </TableRow>
              ) : (
                statisticsData.activeList.map(item => (
                  <TableRow key={item.key} className="border-b border-border hover:bg-muted/30">
                    <TableCell className="font-medium text-xs">
                      <span className="font-semibold text-foreground">{item.fullLabel}</span>
                    </TableCell>
                    <TableCell className="text-center text-xs font-mono">
                      <Badge variant="secondary" className="text-[10px] font-normal">
                        {item.fuelingsCount}x
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      {item.distance.toLocaleString('pt-BR')} km
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">{item.liters.toFixed(2)} L</TableCell>
                    <TableCell className="text-right text-xs font-mono font-medium text-foreground">
                      {formatMoney(item.cost)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      {formatMoney(item.pricePerLiter)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      {formatMoney(item.costPerKm)}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono">
                      <span className="font-bold text-primary">{item.efficiency.toFixed(1)} km/L</span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
