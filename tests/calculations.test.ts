import { describe, it, expect } from 'vitest'
import {
  computeFuelingRows,
  aggregateTelemetryMetrics,
  formatDate,
  formatMoney,
  type ComputedFuelingRow
} from '../lib/calculations'
import type { Fueling } from '../app/actions'

describe('Automotive Calculation Engine (Moto Tracker PRO)', () => {
  it('should return an empty array when given no fuelings', () => {
    const result = computeFuelingRows([])
    expect(result).toEqual([])
  })

  it('should mark the first (baseline) fueling with zero trip distance and zero efficiency', () => {
    const fuelings: Fueling[] = [
      { id: 1, date: '2025-01-01', odometer: 10000, liters: 10, cost: 60, full: true }
    ]

    const result = computeFuelingRows(fuelings)
    expect(result).toHaveLength(1)
    expect(result[0].isBase).toBe(true)
    expect(result[0].distance).toBe(0)
    expect(result[0].efficiency).toBe(0)
    expect(result[0].pricePerLiter).toBe(6)
  })

  it('should compute exact km/L efficiency for consecutive full-tank fuelings', () => {
    const fuelings: Fueling[] = [
      { id: 1, date: '2025-01-01', odometer: 10000, liters: 10, cost: 60, full: true },
      { id: 2, date: '2025-01-10', odometer: 10350, liters: 10, cost: 60, full: true }
    ]

    const result = computeFuelingRows(fuelings)
    // Results are returned sorted descending (most recent first)
    const latest = result[0]
    expect(latest.id).toBe(2)
    expect(latest.distance).toBe(350)
    expect(latest.efficiency).toBe(35) // 350 km / 10 L = 35 km/L
    expect(latest.costPerKm).toBeCloseTo(60 / 350, 4)
  })

  it('should correctly accumulate liters and distance across multiple partial fill-ups until full tank', () => {
    const fuelings: Fueling[] = [
      { id: 1, date: '2025-01-01', odometer: 10000, liters: 10, cost: 60, full: true },
      // Partial refill: 5 liters, rode 150 km, tank not full
      { id: 2, date: '2025-01-05', odometer: 10150, liters: 5, cost: 30, full: false },
      // Another partial refill: 5 liters, rode 150 km, tank not full
      { id: 3, date: '2025-01-10', odometer: 10300, liters: 5, cost: 30, full: false },
      // Full tank: 5 liters, rode 150 km, now tank is full
      { id: 4, date: '2025-01-15', odometer: 10450, liters: 5, cost: 30, full: true }
    ]

    const result = computeFuelingRows(fuelings)
    const row4 = result.find(r => r.id === 4)!
    const row3 = result.find(r => r.id === 3)!
    const row2 = result.find(r => r.id === 2)!

    // Partial fill-ups should not register individual efficiency
    expect(row2.efficiency).toBe(0)
    expect(row3.efficiency).toBe(0)

    // Full tank on row 4 must resolve the entire cycle:
    // Total distance = 150 + 150 + 150 = 450 km
    // Total liters = 5 + 5 + 5 = 15 liters
    // Cycle efficiency = 450 / 15 = 30 km/L
    expect(row4.efficiency).toBe(30)
  })

  it('should calculate weighted average correctly instead of simple average of averages', () => {
    // Trip A: 400 km with 10 L = 40 km/L
    // Trip B: 100 km with 5 L = 20 km/L
    // Simple average would be: (40 + 20) / 2 = 30 km/L
    // Real weighted average: (400 + 100) / (10 + 5) = 500 / 15 = 33.33 km/L
    const computedRows: ComputedFuelingRow[] = [
      { id: 2, date: '2025-01-15', odometer: 10500, liters: 5, cost: 30, full: true, distance: 100, efficiency: 20, costPerKm: 0.3, pricePerLiter: 6, isBase: false },
      { id: 1, date: '2025-01-10', odometer: 10400, liters: 10, cost: 60, full: true, distance: 400, efficiency: 40, costPerKm: 0.15, pricePerLiter: 6, isBase: false }
    ]

    const summary = aggregateTelemetryMetrics(computedRows, 'all')
    expect(summary.distance).toBe(500)
    expect(summary.spent).toBe(90)
    expect(summary.average).toBeCloseTo(33.3333, 2)
    expect(summary.costPerKm).toBeCloseTo(90 / 500, 4)
  })

  it('should handle odometer regressions safely with Math.max(0, ...)', () => {
    const fuelings: Fueling[] = [
      { id: 1, date: '2025-01-01', odometer: 10000, liters: 10, cost: 60, full: true },
      { id: 2, date: '2025-01-05', odometer: 9500, liters: 10, cost: 60, full: true } // Regressive
    ]

    const result = computeFuelingRows(fuelings)
    // Distance should not be negative
    expect(result[0].distance).toBe(0)
  })

  it('should format money in Brazilian Real currency properly', () => {
    const formatted = formatMoney(1234.56)
    // Replace non-breaking spaces before assertion
    expect(formatted.replace(/\s/g, ' ')).toMatch(/R\$\s?1\.234,56/)
  })

  it('should format date to short Brazilian date format', () => {
    const formatted = formatDate('2025-03-15')
    expect(formatted.toLowerCase()).toContain('mar')
    expect(formatted).toContain('15')
    expect(formatted).toContain('2025')
  })
})
