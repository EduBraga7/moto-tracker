'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import { TrendingUp, Zap, Droplet, Calendar } from 'lucide-react'
import { formatDate, type TelemetrySummary } from '@/lib/calculations'

interface DashboardChartProps {
  chartData: { name: string; consumo: number }[]
  computed: TelemetrySummary
  activeColorHex: string
  isDark: boolean
}

export function DashboardChart({
  chartData,
  computed,
  activeColorHex,
  isDark
}: DashboardChartProps) {
  const bestAutonomy =
    chartData.length > 0 ? Math.max(...chartData.map(item => item.consumo), 0) : 0
  const totalVolume = computed.rows.reduce((sum, row) => sum + row.liters, 0)
  const lastRecordDate = computed.rows[0] ? formatDate(computed.rows[0].date) : '—'

  return (
    <div className="grid gap-4 md:grid-cols-7">
      <Card className="md:col-span-4 border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Consumo ao Longo do Tempo</CardTitle>
          <CardDescription className="text-xs">
            Evolução da eficiência (km/L) a cada abastecimento registrado
          </CardDescription>
        </CardHeader>
        <CardContent className="pl-1">
          <ChartContainer
            config={{ consumo: { label: 'Consumo (km/L)', color: activeColorHex } }}
            className="h-[250px] w-full"
          >
            <AreaChart data={chartData} margin={{ left: -20, right: 12, top: 12, bottom: 0 }}>
              <defs>
                <linearGradient id="fillConsumption" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={activeColorHex} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={activeColorHex} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDark ? '#27272a' : '#e4e4e7'} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                stroke={isDark ? '#a1a1aa' : '#71717a'}
              />
              <YAxis
                domain={['dataMin - 2', 'dataMax + 2']}
                tickLine={false}
                axisLine={false}
                fontSize={12}
                stroke={isDark ? '#a1a1aa' : '#71717a'}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="consumo"
                stroke={activeColorHex}
                strokeWidth={2.5}
                fill="url(#fillConsumption)"
                dot={{
                  r: 4,
                  fill: activeColorHex,
                  strokeWidth: 1.5,
                  stroke: isDark ? '#121215' : '#ffffff'
                }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="md:col-span-3 border-border shadow-xs">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Resumo Operacional</CardTitle>
          <CardDescription className="text-xs">
            Indicadores de rendimento ponderados
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-3.5 rounded-xl border border-border bg-muted/30 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-foreground">
                {computed.average.toFixed(1)}{' '}
                <span className="text-xs font-normal text-muted-foreground">km/L</span>
              </div>
              <p className="text-xs text-muted-foreground">Média ponderada do período</p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Melhor autonomia</span>
            </div>
            <div className="font-semibold text-xs text-foreground font-mono">
              {bestAutonomy.toFixed(1)} km/L
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Droplet className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Volume total abastecido</span>
            </div>
            <div className="font-semibold text-xs text-foreground font-mono">
              {totalVolume.toFixed(1)} L
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium">Último registro</span>
            </div>
            <span className="text-xs font-medium text-foreground font-mono">
              {lastRecordDate}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
