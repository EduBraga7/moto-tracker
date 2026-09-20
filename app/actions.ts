'use server'

import { sql } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth'
import { setSession, getSessionUser, clearSession, type SessionUser } from '@/lib/session'

export type AuthUser = SessionUser

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

// ======================== AUTHENTICATION ACTIONS ========================

export async function getCurrentUserAction(): Promise<AuthUser | null> {
  return await getSessionUser()
}

export async function logoutAction(): Promise<{ success: boolean }> {
  await clearSession()
  return { success: true }
}

export async function loginAction(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail || !password) {
      return { success: false, error: 'Por favor, preencha e-mail e senha.' }
    }

    const rows = await sql`
      SELECT id, name, email, password_hash, role
      FROM users
      WHERE LOWER(email) = ${normalizedEmail}
      LIMIT 1;
    `

    if (rows.length === 0) {
      return {
        success: false,
        error: 'E-mail não cadastrado. Verifique o endereço ou crie uma nova conta.'
      }
    }

    const user = rows[0]
    const isValid = verifyPassword(password, user.password_hash)

    if (!isValid) {
      return {
        success: false,
        error: 'Senha incorreta. Verifique suas credenciais e tente novamente.'
      }
    }

    const authUser: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || 'Usuário'
    }

    await setSession(authUser)

    return {
      success: true,
      user: authUser
    }
  } catch (error) {
    console.error('Erro na ação de login:', error)
    return {
      success: false,
      error: 'Erro de conexão com o servidor. Tente novamente em instantes.'
    }
  }
}

export async function registerAction(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const trimmedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'O nome deve conter ao menos 2 caracteres.' }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      return { success: false, error: 'Formato de e-mail inválido.' }
    }

    if (!password || password.length < 6) {
      return { success: false, error: 'A senha deve conter no mínimo 6 caracteres.' }
    }

    // Check if user already exists
    const existing = await sql`
      SELECT id FROM users
      WHERE LOWER(email) = ${normalizedEmail}
      LIMIT 1;
    `

    if (existing.length > 0) {
      return {
        success: false,
        error: 'Este e-mail já está cadastrado no sistema. Tente fazer login.'
      }
    }

    // Hash password & insert user
    const passwordHash = hashPassword(password)
    const inserted = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${trimmedName}, ${normalizedEmail}, ${passwordHash}, 'Usuário')
      RETURNING id, name, email, role;
    `

    const newUser = inserted[0]

    // Create starter motorcycle for this new user
    await sql`
      INSERT INTO motos (user_id, name, model, plate, year, photo_url)
      VALUES (${newUser.id}, 'Minha Moto', 'Honda CB 300F Twister', 'BRA-2E19', '2024', '');
    `

    const authUser: AuthUser = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role
    }

    await setSession(authUser)

    return {
      success: true,
      user: authUser
    }
  } catch (error) {
    console.error('Erro na ação de registro:', error)
    return {
      success: false,
      error: 'Falha ao registrar novo usuário. Verifique os dados e tente novamente.'
    }
  }
}

export async function quickDemoLoginAction(
  type: 'recruiter' | 'pilot'
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const targetEmail =
      type === 'recruiter' ? 'recrutador@tech-review.com' : 'eduardo@mototracker.app'

    const rows = await sql`
      SELECT id, name, email, role
      FROM users
      WHERE LOWER(email) = ${targetEmail}
      LIMIT 1;
    `

    let authUser: AuthUser

    if (rows.length > 0) {
      const u = rows[0]
      authUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
      }
    } else if (type === 'recruiter') {
      authUser = {
        id: 2,
        name: 'Avaliador / Recrutador',
        email: 'recrutador@tech-review.com',
        role: 'Avaliador Convidado (Acesso Completo)'
      }
    } else {
      authUser = {
        id: 1,
        name: 'Eduardo Ramos',
        email: 'eduardo@mototracker.app',
        role: 'Proprietário'
      }
    }

    await setSession(authUser)

    return {
      success: true,
      user: authUser
    }
  } catch (error) {
    console.error('Erro no quickDemoLoginAction:', error)
    const fallbackUser: AuthUser =
      type === 'recruiter'
        ? {
            id: 2,
            name: 'Avaliador / Recrutador',
            email: 'recrutador@tech-review.com',
            role: 'Avaliador Convidado (Acesso Completo)'
          }
        : {
            id: 1,
            name: 'Eduardo Ramos',
            email: 'eduardo@mototracker.app',
            role: 'Proprietário'
          }

    await setSession(fallbackUser)

    return {
      success: true,
      user: fallbackUser
    }
  }
}

export async function socialLoginAction(payload: {
  provider: 'google' | 'github'
  name: string
  email: string
  avatarUrl?: string
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const normalizedEmail = payload.email.trim().toLowerCase()
    if (!normalizedEmail) {
      return { success: false, error: 'E-mail inválido fornecido pelo provedor social.' }
    }

    const existing = await sql`
      SELECT id, name, email, role, auth_provider as "authProvider", avatar_url as "avatarUrl"
      FROM users
      WHERE LOWER(email) = ${normalizedEmail}
      LIMIT 1;
    `

    let authUser: AuthUser

    if (existing.length > 0) {
      const u = existing[0]
      await sql`
        UPDATE users
        SET auth_provider = ${payload.provider},
            avatar_url = COALESCE(NULLIF(${payload.avatarUrl || ''}, ''), avatar_url),
            updated_at = NOW()
        WHERE id = ${u.id};
      `
      authUser = {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role || (payload.provider === 'github' ? 'GitHub' : 'Google'),
        authProvider: payload.provider,
        avatarUrl: payload.avatarUrl || u.avatarUrl || ''
      }
    } else {
      // New user registered via social provider
      const randomPass = hashPassword(`social_${Date.now()}_${Math.random()}`)
      const role = payload.provider === 'github' ? 'GitHub' : 'Google'

      const inserted = await sql`
        INSERT INTO users (name, email, password_hash, role, auth_provider, avatar_url)
        VALUES (${payload.name.trim()}, ${normalizedEmail}, ${randomPass}, ${role}, ${payload.provider}, ${payload.avatarUrl || ''})
        RETURNING id, name, email, role, auth_provider as "authProvider", avatar_url as "avatarUrl";
      `
      const newUser = inserted[0]

      // Create starter motorcycle for this new social user
      await sql`
        INSERT INTO motos (user_id, name, model, plate, year, photo_url)
        VALUES (${newUser.id}, 'Minha Moto', 'Honda CB 300F Twister', 'BRA-2E19', '2024', '');
      `

      authUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        authProvider: payload.provider,
        avatarUrl: newUser.avatarUrl || ''
      }
    }

    await setSession(authUser)

    return {
      success: true,
      user: authUser
    }
  } catch (error) {
    console.error('Erro na ação de socialLoginAction:', error)
    return {
      success: false,
      error: 'Erro ao conectar com provedor social. Tente novamente.'
    }
  }
}

export async function syncClerkUserAction(payload: {
  clerkId: string
  name: string
  email: string
  avatarUrl?: string
  provider?: string
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const normalizedEmail = payload.email.trim().toLowerCase()
    if (!normalizedEmail) {
      return { success: false, error: 'E-mail do Clerk inválido.' }
    }

    const existing = await sql`
      SELECT id, name, email, role, auth_provider as "authProvider", avatar_url as "avatarUrl"
      FROM users
      WHERE LOWER(email) = ${normalizedEmail}
      LIMIT 1;
    `

    const authProvider = (payload.provider as any) || 'google'
    let authUser: AuthUser

    if (existing.length > 0) {
      const u = existing[0]
      await sql`
        UPDATE users
        SET auth_provider = ${authProvider},
            avatar_url = COALESCE(NULLIF(${payload.avatarUrl || ''}, ''), avatar_url),
            updated_at = NOW()
        WHERE id = ${u.id};
      `
      authUser = {
        id: u.id,
        name: payload.name || u.name,
        email: u.email,
        role: u.role || 'Conta Verificada',
        authProvider,
        avatarUrl: payload.avatarUrl || u.avatarUrl || ''
      }
    } else {
      const randomPass = hashPassword(`clerk_${Date.now()}_${payload.clerkId}`)
      const inserted = await sql`
        INSERT INTO users (name, email, password_hash, role, auth_provider, avatar_url)
        VALUES (${payload.name.trim() || 'Usuário'}, ${normalizedEmail}, ${randomPass}, 'Conta Verificada', ${authProvider}, ${payload.avatarUrl || ''})
        RETURNING id, name, email, role, auth_provider as "authProvider", avatar_url as "avatarUrl";
      `
      const newUser = inserted[0]
      await sql`
        INSERT INTO motos (user_id, name, model, plate, year, photo_url)
        VALUES (${newUser.id}, 'Minha Moto', 'Honda CB 300F Twister', 'BRA-2E19', '2024', '');
      `

      authUser = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        authProvider: newUser.authProvider,
        avatarUrl: newUser.avatarUrl || ''
      }
    }

    await setSession(authUser)

    return {
      success: true,
      user: authUser
    }
  } catch (error) {
    console.error('Erro no syncClerkUserAction:', error)
    return { success: false, error: 'Erro ao sincronizar com banco Neon.' }
  }
}

export async function updateUserProfileAction(
  userId?: number,
  data?: { name: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSessionUser()
    const targetUserId = session?.id || userId
    if (!targetUserId) {
      return { success: false, error: 'Usuário não autenticado.' }
    }
    if (!data?.name?.trim()) {
      return { success: false, error: 'Nome não pode ser vazio.' }
    }

    await sql`
      UPDATE users
      SET name = ${data.name.trim()},
          updated_at = NOW()
      WHERE id = ${targetUserId};
    `

    if (session) {
      await setSession({ ...session, name: data.name.trim() })
    }

    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar perfil do usuário:', error)
    return { success: false, error: 'Falha ao atualizar dados no banco de dados.' }
  }
}

// ======================== MOTORCYCLE ACTIONS ========================

export async function getMoto(userId?: number): Promise<Moto> {
  const motos = await getMotos(userId)
  return motos[0]
}

export async function getMotos(userId?: number): Promise<Moto[]> {
  try {
    const session = await getSessionUser()
    const targetUserId = session?.id || userId

    let rows: any[] = []
    if (targetUserId) {
      rows = await sql`
        SELECT id, name, model, plate, year, photo_url as "photoUrl"
        FROM motos
        WHERE user_id = ${targetUserId}
        ORDER BY id ASC;
      `
    }

    if (rows.length === 0) {
      rows = await sql`
        SELECT id, name, model, plate, year, photo_url as "photoUrl"
        FROM motos
        ORDER BY id ASC;
      `
    }

    if (rows.length === 0) {
      return [{
        id: 1,
        name: 'Minha Moto',
        model: 'Honda CB 300F Twister',
        plate: 'BRA-2E19',
        year: '2024',
        photoUrl: ''
      }]
    }
    return rows as Moto[]
  } catch (error) {
    console.error('Error fetching motos:', error)
    return [{
      id: 1,
      name: 'Minha Moto',
      model: 'Honda CB 300F Twister',
      plate: 'BRA-2E19',
      year: '2024',
      photoUrl: ''
    }]
  }
}

export async function addMotoAction(
  data: {
    name: string
    model: string
    plate: string
    year: string
    photoUrl: string
  },
  userId?: number
): Promise<{ success: boolean; moto?: Moto; error?: string }> {
  try {
    const session = await getSessionUser()
    const targetUserId = session?.id || userId || null

    const inserted = await sql`
      INSERT INTO motos (user_id, name, model, plate, year, photo_url)
      VALUES (${targetUserId}, ${data.name}, ${data.model}, ${data.plate}, ${data.year}, ${data.photoUrl})
      RETURNING id, name, model, plate, year, photo_url as "photoUrl";
    `
    return { success: true, moto: inserted[0] as Moto }
  } catch (error) {
    console.error('Error adding moto:', error)
    return { success: false, error: String(error) }
  }
}

export async function updateMotoAction(
  data: {
    name: string
    model: string
    plate: string
    year: string
    photoUrl: string
  },
  userId?: number,
  motoId?: number
) {
  try {
    const session = await getSessionUser()
    const targetUserId = session?.id || userId

    if (motoId) {
      if (targetUserId) {
        await sql`
          UPDATE motos
          SET name = ${data.name},
              model = ${data.model},
              plate = ${data.plate},
              year = ${data.year},
              photo_url = ${data.photoUrl},
              updated_at = NOW()
          WHERE id = ${motoId} AND (user_id = ${targetUserId} OR user_id IS NULL);
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
          WHERE id = ${motoId};
        `
      }
      return { success: true }
    }

    let existing: any[] = []
    if (targetUserId) {
      existing = await sql`SELECT id FROM motos WHERE user_id = ${targetUserId} ORDER BY id ASC LIMIT 1;`
    } else {
      existing = await sql`SELECT id FROM motos ORDER BY id ASC LIMIT 1;`
    }

    if (existing.length === 0) {
      await sql`
        INSERT INTO motos (user_id, name, model, plate, year, photo_url)
        VALUES (${targetUserId || null}, ${data.name}, ${data.model}, ${data.plate}, ${data.year}, ${data.photoUrl});
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

export async function deleteMotoAction(motoId: number, userId?: number) {
  try {
    const session = await getSessionUser()
    const targetUserId = session?.id || userId

    if (targetUserId) {
      const userMotos = await sql`SELECT id FROM motos WHERE user_id = ${targetUserId};`
      if (userMotos.length <= 1) {
        return { success: false, error: 'Você precisa manter pelo menos um veículo cadastrado na sua garagem.' }
      }
      // Check ownership
      const belongs = userMotos.some(m => m.id === motoId)
      if (!belongs) {
        return { success: false, error: 'Veículo não encontrado ou você não tem permissão para excluí-lo.' }
      }

      await sql`DELETE FROM fuelings WHERE moto_id = ${motoId} AND user_id = ${targetUserId};`
      await sql`DELETE FROM motos WHERE id = ${motoId} AND user_id = ${targetUserId};`
    } else {
      await sql`DELETE FROM fuelings WHERE moto_id = ${motoId};`
      await sql`DELETE FROM motos WHERE id = ${motoId};`
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting moto:', error)
    return { success: false, error: String(error) }
  }
}

// ======================== FUELING ACTIONS ========================

export async function getFuelings(userId?: number): Promise<Fueling[]> {
  try {
    const session = await getSessionUser()
    const targetUserId = session?.id || userId

    let rows: any[] = []
    if (targetUserId) {
      rows = await sql`
        SELECT id, moto_id as "motoId", date, odometer, CAST(liters AS FLOAT) as liters, CAST(cost AS FLOAT) as cost, is_full as full
        FROM fuelings
        WHERE user_id = ${targetUserId}
        ORDER BY odometer DESC, date DESC;
      `
    } else {
      rows = await sql`
        SELECT id, moto_id as "motoId", date, odometer, CAST(liters AS FLOAT) as liters, CAST(cost AS FLOAT) as cost, is_full as full
        FROM fuelings
        ORDER BY odometer DESC, date DESC;
      `
    }
    return rows as Fueling[]
  } catch (error) {
    console.error('Error fetching fuelings:', error)
    return []
  }
}

export async function addFuelingAction(
  fueling: {
    motoId?: number
    date: string
    odometer: number
    liters: number
    cost: number
    full: boolean
  },
  userId?: number
) {
  try {
    const session = await getSessionUser()
    const targetUserId = session?.id || userId || null

    let motoId = fueling.motoId
    if (!motoId) {
      let motos: any[] = []
      if (targetUserId) {
        motos = await sql`SELECT id FROM motos WHERE user_id = ${targetUserId} ORDER BY id ASC LIMIT 1;`
      } else {
        motos = await sql`SELECT id FROM motos ORDER BY id ASC LIMIT 1;`
      }
      motoId = motos[0]?.id || 1
    }

    const inserted = await sql`
      INSERT INTO fuelings (moto_id, user_id, date, odometer, liters, cost, is_full)
      VALUES (${motoId}, ${targetUserId}, ${fueling.date}, ${fueling.odometer}, ${fueling.liters}, ${fueling.cost}, ${fueling.full})
      RETURNING id, moto_id as "motoId", date, odometer, CAST(liters AS FLOAT) as liters, CAST(cost AS FLOAT) as cost, is_full as full;
    `
    return { success: true, fueling: inserted[0] as Fueling }
  } catch (error) {
    console.error('Error adding fueling:', error)
    return { success: false, error: String(error) }
  }
}

export async function deleteFuelingAction(id: number, userId?: number) {
  try {
    const session = await getSessionUser()
    const targetUserId = session?.id || userId

    if (targetUserId) {
      await sql`
        DELETE FROM fuelings 
        WHERE id = ${id} AND (user_id = ${targetUserId} OR user_id IS NULL);
      `
    } else {
      await sql`
        DELETE FROM fuelings WHERE id = ${id};
      `
    }
    return { success: true }
  } catch (error) {
    console.error('Error deleting fueling:', error)
    return { success: false, error: String(error) }
  }
}
