import type { Fueling } from '@/app/actions'

export interface ComputedFuelingRow extends Fueling {
  distance: number
  efficiency: number
  costPerKm: number
  pricePerLiter: number
  isBase: boolean
}

export interface TelemetrySummary {
  rows: ComputedFuelingRow[]
  filteredRows: ComputedFuelingRow[]
  average: number
  distance: number
  spent: number
  costPerKm: number
}

export interface MonthlyAggregation {
  monthKey: string
  year: string
  fuelingsCount: number
  distance: number
  liters: number
  cost: number
  efficiencies: number[]
}

export interface YearlyAggregation {
  yearKey: string
  fuelingsCount: number
  distance: number
  liters: number
  cost: number
  efficiencies: number[]
}

export const formatDate = (date: string): string => {
  try {
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
      new Date(`${date}T12:00:00`)
    )
  } catch {
    return date
  }
}

export const formatMonth = (dateString: string): string => {
  try {
    const [year, month] = dateString.split('-')
    const date = new Date(Number(year), Number(month) - 1, 1)
    const formatted = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date)
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  } catch {
    return dateString
  }
}

export const formatMoney = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/**
 * Standardized and weighted automotive calculation engine.
 * Computes trip distances, handles partial fill-ups accumulation,
 * and calculates fuel efficiency (km/L) upon full tank refills.
 */
export function computeFuelingRows(fuelings: Fueling[]): ComputedFuelingRow[] {
  if (!fuelings || fuelings.length === 0) return []

  // Sort ascending by date and odometer (chronological sequence)
  const chronological = [...fuelings].sort((a, b) => {
    const dateDiff = a.date.localeCompare(b.date)
    if (dateDiff !== 0) return dateDiff
    return a.odometer - b.odometer
  })

  let accumulatedDistance = 0
  let accumulatedLiters = 0

  const analyzed = chronological.map((current, index) => {
    if (index === 0) {
      return {
        ...current,
        distance: 0,
        efficiency: 0,
        costPerKm: 0,
        pricePerLiter: current.liters > 0 ? current.cost / current.liters : 0,
        isBase: true
      }
    }

    const previous = chronological[index - 1]
    const tripDistance = Math.max(0, current.odometer - previous.odometer)

    accumulatedDistance += tripDistance
    accumulatedLiters += current.liters

    let efficiency = 0
    const costPerKm = tripDistance > 0 && current.cost > 0 ? current.cost / tripDistance : 0
    const pricePerLiter = current.liters > 0 ? current.cost / current.liters : 0

    // If full tank, resolve efficiency for the accumulated cycle
    if (current.full && accumulatedLiters > 0) {
      efficiency = accumulatedDistance / accumulatedLiters
      accumulatedDistance = 0
      accumulatedLiters = 0
    } else if (!current.full) {
      efficiency = 0
    }

    return {
      ...current,
      distance: tripDistance,
      efficiency,
      costPerKm,
      pricePerLiter,
      isBase: false
    }
  })

  return analyzed.reverse()
}

/**
 * Calculates weighted averages and totals for a filtered set of fueling rows.
 * Uses engineering formula: Total Distance / Total Liters.
 */
export function aggregateTelemetryMetrics(
  computedRows: ComputedFuelingRow[],
  selectedMonth: string
): TelemetrySummary {
  const filteredRows =
    selectedMonth === 'all'
      ? computedRows
      : computedRows.filter(row => row.date.startsWith(selectedMonth))

  const totalDistance = filteredRows.reduce((sum, row) => sum + row.distance, 0)
  const totalSpent = filteredRows.reduce((sum, row) => sum + row.cost, 0)
  const tripsWithDistance = filteredRows.filter(row => row.distance > 0)
  const totalLitersForTrips = tripsWithDistance.reduce((sum, row) => sum + row.liters, 0)

  const weightedAverage =
    totalDistance > 0 && totalLitersForTrips > 0 ? totalDistance / totalLitersForTrips : 0

  const costPerKm = totalDistance > 0 ? totalSpent / totalDistance : 0

  return {
    rows: computedRows,
    filteredRows,
    average: weightedAverage,
    distance: totalDistance,
    spent: totalSpent,
    costPerKm
  }
}

/**
 * Aggregates fueling rows by month and by year for the statistics view.
 */
export function aggregateStatistics(
  computedRows: ComputedFuelingRow[],
  statYear: string
): {
  monthly: (MonthlyAggregation & { avgEfficiency: number; costPerKm: number })[]
  yearly: (YearlyAggregation & { avgEfficiency: number; costPerKm: number })[]
} {
  const baseList =
    statYear === 'all' ? computedRows : computedRows.filter(row => row.date.startsWith(statYear))

  const monthMap = new Map<string, MonthlyAggregation>()
  const yearMap = new Map<string, YearlyAggregation>()

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

  const monthly = Array.from(monthMap.values())
    .map(m => ({
      ...m,
      avgEfficiency:
        m.efficiencies.length > 0
          ? m.efficiencies.reduce((a, b) => a + b, 0) / m.efficiencies.length
          : m.distance > 0 && m.liters > 0
            ? m.distance / m.liters
            : 0,
      costPerKm: m.distance > 0 ? m.cost / m.distance : 0
    }))
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey))

  const yearly = Array.from(yearMap.values())
    .map(y => ({
      ...y,
      avgEfficiency:
        y.efficiencies.length > 0
          ? y.efficiencies.reduce((a, b) => a + b, 0) / y.efficiencies.length
          : y.distance > 0 && y.liters > 0
            ? y.distance / y.liters
            : 0,
      costPerKm: y.distance > 0 ? y.cost / y.distance : 0
    }))
    .sort((a, b) => b.yearKey.localeCompare(a.yearKey))

  return { monthly, yearly }
}
