import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'

// Load .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const [key, ...values] = trimmed.split('=')
    if (key && values.length > 0) {
      let val = values.join('=').trim()
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1)
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1)
      process.env[key.trim()] = val
    }
  }
}

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local')
  process.exit(1)
}

const sql = neon(dbUrl)

async function main() {
  console.log('Conectando ao Neon e criando tabelas...')

  await sql`
    CREATE TABLE IF NOT EXISTS motos (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL DEFAULT 'Minha Moto',
      model VARCHAR(150) NOT NULL DEFAULT 'Honda CB 300F Twister',
      plate VARCHAR(20) DEFAULT 'BRA-2E19',
      year VARCHAR(10) DEFAULT '2024',
      photo_url TEXT DEFAULT '',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  await sql`
    CREATE TABLE IF NOT EXISTS fuelings (
      id SERIAL PRIMARY KEY,
      moto_id INTEGER REFERENCES motos(id) ON DELETE CASCADE,
      date VARCHAR(20) NOT NULL,
      odometer INTEGER NOT NULL,
      liters NUMERIC(8, 2) NOT NULL,
      cost NUMERIC(10, 2) NOT NULL DEFAULT 0,
      is_full BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `

  // Insert initial moto if none exists
  const existingMotos = await sql`SELECT id FROM motos LIMIT 1;`
  let motoId = existingMotos[0]?.id

  if (!motoId) {
    const inserted = await sql`
      INSERT INTO motos (name, model, plate, year, photo_url)
      VALUES ('Minha Moto', 'Honda CB 300F Twister', 'BRA-2E19', '2024', '')
      RETURNING id;
    `
    motoId = inserted[0].id
    console.log(`Moto padrão criada com ID: ${motoId}`)
  }

  // Insert default fuelings if empty
  const existingFuelings = await sql`SELECT id FROM fuelings LIMIT 1;`
  if (existingFuelings.length === 0) {
    const initial = [
      { date: '2025-02-28', odometer: 65680, liters: 8.9, cost: 55.18, is_full: true },
      { date: '2025-02-19', odometer: 65362, liters: 8.45, cost: 52.39, is_full: true },
      { date: '2025-02-09', odometer: 65055, liters: 8.2, cost: 50.84, is_full: true },
      { date: '2025-01-31', odometer: 64740, liters: 8.7, cost: 53.94, is_full: true },
      { date: '2025-01-20', odometer: 64420, liters: 8.5, cost: 52.7, is_full: true },
    ]

    for (const f of initial) {
      await sql`
        INSERT INTO fuelings (moto_id, date, odometer, liters, cost, is_full)
        VALUES (${motoId}, ${f.date}, ${f.odometer}, ${f.liters}, ${f.cost}, ${f.is_full});
      `
    }
    console.log('Abastecimentos iniciais criados com sucesso!')
  }

  console.log('Tudo configurado com sucesso no Neon!')
}

main().catch(err => {
  console.error('Erro ao inicializar banco de dados:', err)
  process.exit(1)
})
