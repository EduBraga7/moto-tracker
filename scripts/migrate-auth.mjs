import { neon } from '@neondatabase/serverless'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

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

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64)
  return `${salt}:${derivedKey.toString('hex')}`
}

async function main() {
  console.log('--- Iniciando migração de autenticação no Neon Postgres ---')

  // 1. Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(150) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role VARCHAR(50) DEFAULT 'Piloto Proprietário',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `
  console.log('✓ Tabela "users" criada / verificada.')

  // 2. Alter motos and fuelings to include user_id
  await sql`
    ALTER TABLE motos ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
  `
  await sql`
    ALTER TABLE fuelings ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
  `
  console.log('✓ Colunas "user_id" adicionadas em motos e fuelings.')

  // 3. Seed Pilot Eduardo
  const eduardoEmail = 'eduardo@mototracker.app'
  const existingEduardo = await sql`SELECT id FROM users WHERE email = ${eduardoEmail};`
  let eduardoId = existingEduardo[0]?.id

  if (!eduardoId) {
    const eduardoHash = hashPassword('moto-tracker-pro')
    const insertedEduardo = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Eduardo Ramos', ${eduardoEmail}, ${eduardoHash}, 'Piloto Proprietário')
      RETURNING id;
    `
    eduardoId = insertedEduardo[0].id
    console.log(`✓ Usuário Eduardo criado com ID: ${eduardoId}`)
  } else {
    console.log(`✓ Usuário Eduardo já existe com ID: ${eduardoId}`)
  }

  // 4. Seed Demo Recruiter
  const recruiterEmail = 'recrutador@tech-review.com'
  const existingRecruiter = await sql`SELECT id FROM users WHERE email = ${recruiterEmail};`
  let recruiterId = existingRecruiter[0]?.id

  if (!recruiterId) {
    const recruiterHash = hashPassword('demo-portfolio-2026')
    const insertedRecruiter = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES ('Avaliador / Recrutador', ${recruiterEmail}, ${recruiterHash}, 'Avaliador Convidado (Acesso Completo)')
      RETURNING id;
    `
    recruiterId = insertedRecruiter[0].id
    console.log(`✓ Usuário Recrutador criado com ID: ${recruiterId}`)
  } else {
    console.log(`✓ Usuário Recrutador já existe com ID: ${recruiterId}`)
  }

  // 5. Link existing motos/fuelings to Eduardo if user_id is null
  await sql`
    UPDATE motos SET user_id = ${eduardoId} WHERE user_id IS NULL;
  `
  await sql`
    UPDATE fuelings SET user_id = ${eduardoId} WHERE user_id IS NULL;
  `
  console.log('✓ Dados existentes vinculados ao perfil do Eduardo.')

  // 6. Ensure Recruiter has their own demo moto and telemetry records
  const recruiterMotos = await sql`SELECT id FROM motos WHERE user_id = ${recruiterId};`
  if (recruiterMotos.length === 0) {
    const insertedMoto = await sql`
      INSERT INTO motos (user_id, name, model, plate, year, photo_url)
      VALUES (${recruiterId}, 'Honda CB 650R', 'CB 650R Neo Sports Cafe', 'MTO-2026', '2024', '')
      RETURNING id;
    `
    const demoMotoId = insertedMoto[0].id

    const demoFuelings = [
      { date: '2025-02-28', odometer: 18450, liters: 12.4, cost: 74.40, is_full: true },
      { date: '2025-02-18', odometer: 18180, liters: 12.1, cost: 72.60, is_full: true },
      { date: '2025-02-08', odometer: 17910, liters: 11.9, cost: 71.40, is_full: true },
      { date: '2025-01-29', odometer: 17640, liters: 12.3, cost: 73.80, is_full: true },
      { date: '2025-01-19', odometer: 17360, liters: 12.0, cost: 72.00, is_full: true },
      { date: '2025-01-09', odometer: 17090, liters: 11.8, cost: 70.80, is_full: true },
    ]

    for (const f of demoFuelings) {
      await sql`
        INSERT INTO fuelings (moto_id, user_id, date, odometer, liters, cost, is_full)
        VALUES (${demoMotoId}, ${recruiterId}, ${f.date}, ${f.odometer}, ${f.liters}, ${f.cost}, ${f.is_full});
      `
    }
    console.log('✓ Garagem e telemetria demonstrativa criadas para o Recrutador.')
  }

  console.log('--- Migração concluída com sucesso no Neon Postgres! ---')
}

main().catch(err => {
  console.error('Erro na migração:', err)
  process.exit(1)
})
