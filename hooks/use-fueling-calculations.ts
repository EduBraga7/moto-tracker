import { useMemo } from 'react'
import type { Fueling } from '@/app/actions'
import {
  computeFuelingRows,
  aggregateTelemetryMetrics,
  formatDate,
  formatMonth,
  type ComputedFuelingRow,
  type TelemetrySummary
} from '@/lib/calculations'

export interface StatItem {
  key: string
  label: string
  fullLabel: string
  distance: number
  liters: number
  cost: number
  efficiency: number
  pricePerLiter: number
  costPerKm: number
  fuelingsCount: number
}

export interface StatisticsData {
  monthlyList: StatItem[]
  yearlyList: StatItem[]
  activeList: StatItem[]
  totalDistance: number
  totalSpent: number
  totalLiters: number
  overallAvgEff: number
  overallAvgPrice: number
  bestEfficiency: number
  worstEfficiency: number
  lowestPrice: number
  highestPrice: number
}

export interface UseFuelingCalculationsParams {
  fuelings: Fueling[]
  selectedMotoId: number
  selectedMonth: string
  statYear: string
  statView: 'monthly' | 'yearly'
}

export function useFuelingCalculations({
  fuelings,
  selectedMotoId,
  selectedMonth,
  statYear,
  statView
}: UseFuelingCalculationsParams) {
  const activeMotoFuelings = useMemo(() => {
    return fuelings.filter(f => !f.motoId || f.motoId === selectedMotoId)
  }, [fuelings, selectedMotoId])

  const computedRows: ComputedFuelingRow[] = useMemo(() => {
    return computeFuelingRows(activeMotoFuelings)
  }, [activeMotoFuelings])

  const computed: TelemetrySummary = useMemo(() => {
    return aggregateTelemetryMetrics(computedRows, selectedMonth)
  }, [computedRows, selectedMonth])

  const chartData = useMemo(() => {
    return [...computed.filteredRows]
      .reverse()
      .filter(row => row.efficiency > 0)
      .map(row => ({
        name: formatDate(row.date).split(' de ')[0],
        consumo: Number(row.efficiency.toFixed(1))
      }))
  }, [computed.filteredRows])

  const statisticsData: StatisticsData = useMemo(() => {
    const baseList =
      statYear === 'all'
        ? computedRows
        : computedRows.filter(row => row.date.startsWith(statYear))

    const monthMap = new Map<string, {
      monthKey: string
      year: string
      fuelingsCount: number
      distance: number
      liters: number
      cost: number
      efficiencies: number[]
    }>()

    const yearMap = new Map<string, {
      yearKey: string
      fuelingsCount: number
      distance: number
      liters: number
      cost: number
      efficiencies: number[]
    }>()

    for (const row of baseList) {
      const monthKey = row.date.substring(0, 7)
      const yearKey = row.date.substring(0, 4)

      // Month
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, {
          monthKey,
          year: yearKey,
          fuelingsCount: 0,
          distance: 0,
          liters: 0,
          cost: 0,
          efficiencies: []
        })
      }
      const m = monthMap.get(monthKey)!
      m.fuelingsCount += 1
      m.distance += row.distance
      m.liters += row.liters
      m.cost += row.cost
      if (row.efficiency > 0) m.efficiencies.push(row.efficiency)

      // Year
      if (!yearMap.has(yearKey)) {
        yearMap.set(yearKey, {
          yearKey,
          fuelingsCount: 0,
          distance: 0,
          liters: 0,
          cost: 0,
          efficiencies: []
        })
      }
      const y = yearMap.get(yearKey)!
      y.fuelingsCount += 1
      y.distance += row.distance
      y.liters += row.liters
      y.cost += row.cost
      if (row.efficiency > 0) y.efficiencies.push(row.efficiency)
    }

    const monthlyList: StatItem[] = Array.from(monthMap.values())
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map(m => {
        const weightedEff = m.distance > 0 && m.liters > 0 ? m.distance / m.liters : 0
        const weightedPrice = m.liters > 0 ? m.cost / m.liters : 0
        const costPerKm = m.distance > 0 ? m.cost / m.distance : 0

        const [y, mon] = m.monthKey.split('-')
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
        const shortName = `${monthNames[Number(mon) - 1]}/${y.slice(2)}`

        return {
          key: m.monthKey,
          label: shortName,
          fullLabel: formatMonth(m.monthKey),
          distance: m.distance,
          liters: Number(m.liters.toFixed(2)),
          cost: Number(m.cost.toFixed(2)),
          efficiency: Number(weightedEff.toFixed(1)),
          pricePerLiter: Number(weightedPrice.toFixed(2)),
          costPerKm: Number(costPerKm.toFixed(2)),
          fuelingsCount: m.fuelingsCount
        }
      })

    const yearlyList: StatItem[] = Array.from(yearMap.values())
      .sort((a, b) => a.yearKey.localeCompare(b.yearKey))
      .map(y => {
        const weightedEff = y.distance > 0 && y.liters > 0 ? y.distance / y.liters : 0
        const weightedPrice = y.liters > 0 ? y.cost / y.liters : 0
        const costPerKm = y.distance > 0 ? y.cost / y.distance : 0

        return {
          key: y.yearKey,
          label: y.yearKey,
          fullLabel: `Ano ${y.yearKey}`,
          distance: y.distance,
          liters: Number(y.liters.toFixed(2)),
          cost: Number(y.cost.toFixed(2)),
          efficiency: Number(weightedEff.toFixed(1)),
          pricePerLiter: Number(weightedPrice.toFixed(2)),
          costPerKm: Number(costPerKm.toFixed(2)),
          fuelingsCount: y.fuelingsCount
        }
      })

    const validEfficiencies = baseList.filter(r => r.efficiency > 0).map(r => r.efficiency)
    const validPrices = baseList.filter(r => r.pricePerLiter > 0).map(r => r.pricePerLiter)
    const totalDistance = baseList.reduce((acc, r) => acc + r.distance, 0)
    const totalSpent = baseList.reduce((acc, r) => acc + r.cost, 0)
    const totalLiters = baseList.reduce((acc, r) => acc + r.liters, 0)

    const overallAvgEff = totalDistance > 0 && totalLiters > 0 ? totalDistance / totalLiters : 0
    const overallAvgPrice = totalLiters > 0 ? totalSpent / totalLiters : 0

    const bestEfficiency = validEfficiencies.length ? Math.max(...validEfficiencies) : 0
    const worstEfficiency = validEfficiencies.length ? Math.min(...validEfficiencies) : 0
    const lowestPrice = validPrices.length ? Math.min(...validPrices) : 0
    const highestPrice = validPrices.length ? Math.max(...validPrices) : 0

    return {
      monthlyList,
      yearlyList,
      activeList: statView === 'monthly' ? monthlyList : yearlyList,
      totalDistance,
      totalSpent,
      totalLiters,
      overallAvgEff,
      overallAvgPrice,
      bestEfficiency,
      worstEfficiency,
      lowestPrice,
      highestPrice
    }
  }, [computedRows, statYear, statView])

  return {
    activeMotoFuelings,
    computedRows,
    computed,
    chartData,
    statisticsData
  }
}
