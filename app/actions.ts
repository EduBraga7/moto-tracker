'use server'

import { sql } from '@/lib/db'

export type Moto = {
  id: number
  name: string
  model: string
  plate: string
  year: string
  photoUrl: string
}

export type Fueling = {
  id: number
  motoId?: number
  date: string
  odometer: number
  liters: number
  cost: number
  full: boolean
}

export async function getMoto(): Promise<Moto> {
  try {
    const rows = await sql`
      SELECT id, name, model, plate, year, photo_url as "photoUrl"
      FROM motos
      ORDER BY id ASC
      LIMIT 1;
    `
    if (rows.length === 0) {
      return {
        id: 1,
        name: 'Minha Moto',
        model: 'Honda CB 300F Twister',
        plate: 'BRA-2E19',
        year: '2024',
        photoUrl: ''
      }
    }
    return rows[0] as Moto
  } catch (error) {
    console.error('Error fetching moto:', error)
    return {
      id: 1,
      name: 'Minha Moto',
      model: 'Honda CB 300F Twister',
      plate: 'BRA-2E19',
      year: '2024',
      photoUrl: ''
    }
  }
}

export async function updateMotoAction(data: {
  name: string
  model: string
  plate: string
  year: string
  photoUrl: string
}) {
  try {
    const existing = await sql`SELECT id FROM motos LIMIT 1;`
    if (existing.length === 0) {
      await sql`
        INSERT INTO motos (name, model, plate, year, photo_url)
        VALUES (${data.name}, ${data.model}, ${data.plate}, ${data.year}, ${data.photoUrl});
      `
    } else {
      await sql`
        UPDATE motos
        SET name = ${data.name},
            model = ${data.model},
            plate = ${data.plate},
            year = ${data.year},
            photo_url = ${data.photoUrl},
            updated_at = NOW()
        WHERE id = ${existing[0].id};
      `
    }
    return { success: true }
  } catch (error) {
    console.error('Error updating moto:', error)
    return { success: false, error: String(error) }
  }
}

export async function getFuelings(): Promise<Fueling[]> {
  try {
    const rows = await sql`
      SELECT id, moto_id as "motoId", date, odometer, CAST(liters AS FLOAT) as liters, CAST(cost AS FLOAT) as cost, is_full as full
      FROM fuelings
      ORDER BY odometer DESC, date DESC;
    `
    return rows as Fueling[]
  } catch (error) {
    console.error('Error fetching fuelings:', error)
    return []
  }
}

export async function addFuelingAction(fueling: {
  date: string
  odometer: number
  liters: number
  cost: number
  full: boolean
}) {
  try {
    const motos = await sql`SELECT id FROM motos LIMIT 1;`
    const motoId = motos[0]?.id || 1

    const inserted = await sql`
      INSERT INTO fuelings (moto_id, date, odometer, liters, cost, is_full)
      VALUES (${motoId}, ${fueling.date}, ${fueling.odometer}, ${fueling.liters}, ${fueling.cost}, ${fueling.full})
      RETURNING id, date, odometer, CAST(liters AS FLOAT) as liters, CAST(cost AS FLOAT) as cost, is_full as full;
    `
    return { success: true, fueling: inserted[0] as Fueling }
  } catch (error) {
    console.error('Error adding fueling:', error)
    return { success: false, error: String(error) }
  }
}

export async function deleteFuelingAction(id: number) {
  try {
    await sql`
      DELETE FROM fuelings WHERE id = ${id};
    `
    return { success: true }
  } catch (error) {
    console.error('Error deleting fueling:', error)
    return { success: false, error: String(error) }
  }
}
