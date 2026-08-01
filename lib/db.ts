import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { EmailTemplate } from './types';

// In-memory fallback user store when DATABASE_URL is not provided
interface MemoryUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

const memoryUsersStore: MemoryUser[] = [];
const memoryTemplatesStore: Record<string, EmailTemplate[]> = {};

// Initialize PostgreSQL Connection Pool if DATABASE_URL is present
let pool: Pool | null = null;

if (process.env.DATABASE_URL) {
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  } catch (err) {
    console.error('PostgreSQL Connection Pool Init Error:', err);
  }
}

// Auto-create users and templates tables on boot
let tableInitialized = false;

async function ensureTablesExist() {
  if (!pool || tableInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS user_templates (
        user_email VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        subject TEXT NOT NULL,
        body TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_email, role)
      );
    `);
    tableInitialized = true;
  } catch (err) {
    console.error('Error creating PostgreSQL tables:', err);
  }
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
}

/**
 * Register a new user in PostgreSQL
 */
export async function registerUser(name: string, email: string, password: string): Promise<UserRecord> {
  const normalizedEmail = email.toLowerCase().trim();
  const hashedPassword = await bcrypt.hash(password, 10);
  const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

  if (pool) {
    await ensureTablesExist();
    const existing = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (existing.rows.length > 0) {
      throw new Error('An account with this email address already exists.');
    }

    const res = await pool.query(
      'INSERT INTO users (id, name, email, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email',
      [userId, name, normalizedEmail, hashedPassword]
    );
    return res.rows[0];
  } else {
    const existing = memoryUsersStore.find((u) => u.email === normalizedEmail);
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: MemoryUser = {
      id: userId,
      name: name || normalizedEmail.split('@')[0],
      email: normalizedEmail,
      passwordHash: hashedPassword,
    };
    memoryUsersStore.push(newUser);
    return { id: newUser.id, name: newUser.name, email: newUser.email };
  }
}

/**
 * Authenticate existing user credentials against PostgreSQL
 */
export async function authenticateUser(email: string, password: string): Promise<UserRecord | null> {
  const normalizedEmail = email.toLowerCase().trim();

  if (pool) {
    await ensureTablesExist();
    const res = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (res.rows.length === 0) {
      return null;
    }

    const userRow = res.rows[0];
    const isPasswordValid = await bcrypt.compare(password, userRow.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: userRow.id,
      name: userRow.name || userRow.email.split('@')[0],
      email: userRow.email,
    };
  } else {
    const user = memoryUsersStore.find((u) => u.email === normalizedEmail);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<UserRecord | null> {
  const normalizedEmail = email.toLowerCase().trim();

  if (pool) {
    await ensureTablesExist();
    const res = await pool.query('SELECT id, name, email FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    return res.rows[0] || null;
  } else {
    const user = memoryUsersStore.find((u) => u.email === normalizedEmail);
    if (!user) return null;
    return { id: user.id, name: user.name, email: user.email };
  }
}

/**
 * Save user custom templates to PostgreSQL
 */
export async function saveUserTemplates(userEmail: string, templates: EmailTemplate[]): Promise<void> {
  const normalizedEmail = userEmail.toLowerCase().trim();

  if (pool) {
    await ensureTablesExist();
    for (const t of templates) {
      await pool.query(
        `INSERT INTO user_templates (user_email, role, subject, body, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (user_email, role)
         DO UPDATE SET subject = EXCLUDED.subject, body = EXCLUDED.body, updated_at = CURRENT_TIMESTAMP`,
        [normalizedEmail, t.role, t.subject, t.body]
      );
    }
  } else {
    memoryTemplatesStore[normalizedEmail] = templates;
  }
}

/**
 * Fetch custom user templates from PostgreSQL
 */
export async function getUserTemplates(userEmail: string): Promise<EmailTemplate[] | null> {
  const normalizedEmail = userEmail.toLowerCase().trim();

  if (pool) {
    await ensureTablesExist();
    const res = await pool.query('SELECT role, subject, body FROM user_templates WHERE LOWER(user_email) = $1', [normalizedEmail]);
    if (res.rows.length === 0) return null;

    return res.rows.map((row, idx) => ({
      id: `custom-template-${idx}`,
      role: row.role as any,
      name: `${row.role} Application`,
      isDefault: true,
      subject: row.subject,
      body: row.body,
    }));
  } else {
    return memoryTemplatesStore[normalizedEmail] || null;
  }
}
