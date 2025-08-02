import { sql } from '@vercel/postgres';
import { compare, hash } from 'bcryptjs';
import { promises as fs } from 'fs';
import path from 'path';

export interface User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationId: string;
    organizationName: string;
    createdAt: string;
    updatedAt: string;
}

export interface Organization {
    id: string;
    name: string;
    slug?: string;
    createdAt: string;
    updatedAt: string;
}

interface Database {
    users: User[];
    organizations: Organization[];
}

// Check if we have Vercel Postgres available
const hasPostgres = !!process.env.POSTGRES_URL;
const isVercel = process.env.VERCEL === '1';
const DB_FILE_PATH = path.join(process.cwd(), 'data', 'database.json');

// In-memory fallback for local development without Postgres
let memoryDb: Database | null = null;

// Generate unique ID
function generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Initialize database tables (Postgres only)
async function initializePostgresTables(): Promise<void> {
    if (!hasPostgres) return;

    try {
        console.log('Initializing Postgres tables...');

        // Create organizations table
        await sql`
            CREATE TABLE IF NOT EXISTS organizations (
                id VARCHAR(255) PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                slug VARCHAR(255),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `;

        // Create users table
        await sql`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                organization_id VARCHAR(255) NOT NULL,
                organization_name VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            )
        `;

        // Create indexes
        await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug)`;

        console.log('Postgres tables initialized successfully');
    } catch (error) {
        console.error('Error initializing Postgres tables:', error);
        throw error;
    }
}

// Fallback functions for local development (file-based)
async function ensureDataDir() {
    const dataDir = path.dirname(DB_FILE_PATH);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

async function initializeFileDatabase(): Promise<Database> {
    const defaultData: Database = {
        users: [],
        organizations: []
    };

    await ensureDataDir();
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(defaultData, null, 2));
    console.log('File database initialized');
    return defaultData;
}

async function readFileDatabase(): Promise<Database> {
    try {
        await ensureDataDir();
        const data = await fs.readFile(DB_FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.log('Database file not found, initializing...');
        return await initializeFileDatabase();
    }
}

async function writeFileDatabase(data: Database): Promise<void> {
    await ensureDataDir();
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2));
}

// User operations
export async function createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    organizationSlug?: string;
}): Promise<{ user: User; organization: Organization }> {
    console.log(`Creating user using ${hasPostgres ? 'Postgres' : 'file/memory'} database`);

    // Hash password
    const hashedPassword = await hash(userData.password, 12);

    // Generate IDs
    const organizationId = generateId();
    const userId = generateId();
    const now = new Date().toISOString();

    const organization: Organization = {
        id: organizationId,
        name: userData.organizationName,
        slug: userData.organizationSlug || userData.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        createdAt: now,
        updatedAt: now
    };

    const user: User = {
        id: userId,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        organizationId,
        organizationName: userData.organizationName,
        createdAt: now,
        updatedAt: now
    };

    if (hasPostgres) {
        // Use Postgres
        try {
            await initializePostgresTables();

            // Check if user already exists
            const existingUser = await sql`
                SELECT id FROM users WHERE email = ${userData.email}
            `;

            if (existingUser.rows.length > 0) {
                throw new Error('User with this email already exists');
            }

            // Insert organization
            await sql`
                INSERT INTO organizations (id, name, slug, created_at, updated_at)
                VALUES (${organization.id}, ${organization.name}, ${organization.slug}, ${organization.createdAt}, ${organization.updatedAt})
            `;

            // Insert user
            await sql`
                INSERT INTO users (id, email, password, first_name, last_name, organization_id, organization_name, created_at, updated_at)
                VALUES (${user.id}, ${user.email}, ${user.password}, ${user.firstName}, ${user.lastName}, ${user.organizationId}, ${user.organizationName}, ${user.createdAt}, ${user.updatedAt})
            `;

            console.log(`User created successfully in Postgres: ${user.email}`);
        } catch (error) {
            console.error('Postgres error:', error);
            throw error;
        }
    } else {
        // Use file/memory fallback
        const db = isVercel ?
            (memoryDb || { users: [], organizations: [] }) :
            await readFileDatabase();

        // Check if user already exists
        const existingUser = db.users.find(u => u.email === userData.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Add to database
        db.users.push(user);
        db.organizations.push(organization);

        if (isVercel) {
            memoryDb = db;
            console.log('Database updated in memory');
        } else {
            await writeFileDatabase(db);
            console.log('Database written to file');
        }
    }

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword as User,
        organization
    };
}

export async function findUserByEmail(email: string): Promise<User | null> {
    console.log(`Finding user ${email} using ${hasPostgres ? 'Postgres' : 'file/memory'} database`);

    if (hasPostgres) {
        try {
            await initializePostgresTables();

            const result = await sql`
                SELECT id, email, password, first_name, last_name, organization_id, organization_name, created_at, updated_at
                FROM users 
                WHERE email = ${email}
            `;

            if (result.rows.length === 0) {
                console.log(`User ${email} not found in Postgres`);
                return null;
            }

            const row = result.rows[0];
            const user: User = {
                id: row.id,
                email: row.email,
                password: row.password,
                firstName: row.first_name,
                lastName: row.last_name,
                organizationId: row.organization_id,
                organizationName: row.organization_name,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };

            console.log(`User ${email} found in Postgres`);
            return user;
        } catch (error) {
            console.error('Postgres error finding user:', error);
            return null;
        }
    } else {
        // Use file/memory fallback
        const db = isVercel ?
            (memoryDb || { users: [], organizations: [] }) :
            await readFileDatabase();

        const user = db.users.find(u => u.email === email);
        console.log(`User ${email} ${user ? 'found' : 'not found'} in ${isVercel ? 'memory' : 'file'}`);
        return user || null;
    }
}

export async function validateUserPassword(email: string, password: string): Promise<User | null> {
    const user = await findUserByEmail(email);
    if (!user) {
        console.log(`Password validation failed: user ${email} not found`);
        return null;
    }

    const isValid = await compare(password, user.password);
    if (!isValid) {
        console.log(`Password validation failed: incorrect password for ${email}`);
        return null;
    }

    console.log(`Password validation successful for ${email}`);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
}

export async function updateUserPassword(email: string, newPassword: string): Promise<boolean> {
    console.log(`Updating password for ${email} using ${hasPostgres ? 'Postgres' : 'file/memory'} database`);

    try {
        // Hash the new password
        const hashedPassword = await hash(newPassword, 12);
        const now = new Date().toISOString();

        if (hasPostgres) {
            // Use Postgres
            try {
                await initializePostgresTables();

                const result = await sql`
                    UPDATE users 
                    SET password = ${hashedPassword}, updated_at = ${now}
                    WHERE email = ${email}
                `;

                if (result.rowCount === 0) {
                    console.log(`User ${email} not found in Postgres`);
                    return false;
                }

                console.log(`Password updated successfully in Postgres for ${email}`);
                return true;
            } catch (error) {
                console.error('Postgres error updating password:', error);
                return false;
            }
        } else {
            // Use file/memory fallback
            const db = isVercel ?
                (memoryDb || { users: [], organizations: [] }) :
                await readFileDatabase();

            const userIndex = db.users.findIndex(u => u.email === email);
            if (userIndex === -1) {
                console.log(`User ${email} not found in ${isVercel ? 'memory' : 'file'}`);
                return false;
            }

            // Update password
            db.users[userIndex].password = hashedPassword;
            db.users[userIndex].updatedAt = now;

            if (isVercel) {
                memoryDb = db;
                console.log('Password updated in memory');
            } else {
                await writeFileDatabase(db);
                console.log('Password updated in file');
            }

            return true;
        }
    } catch (error) {
        console.error('Error updating password:', error);
        return false;
    }
}

export async function getAllUsers(): Promise<User[]> {
    console.log(`Getting all users using ${hasPostgres ? 'Postgres' : 'file/memory'} database`);

    if (hasPostgres) {
        try {
            await initializePostgresTables();

            const result = await sql`
                SELECT id, email, first_name, last_name, organization_id, organization_name, created_at, updated_at
                FROM users 
                ORDER BY created_at DESC
            `;

            return result.rows.map(row => ({
                id: row.id,
                email: row.email,
                password: '', // Don't include password
                firstName: row.first_name,
                lastName: row.last_name,
                organizationId: row.organization_id,
                organizationName: row.organization_name,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));
        } catch (error) {
            console.error('Postgres error getting users:', error);
            return [];
        }
    } else {
        // Use file/memory fallback
        const db = isVercel ?
            (memoryDb || { users: [], organizations: [] }) :
            await readFileDatabase();

        return db.users.map(u => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword as User;
        });
    }
}

export async function getUserById(id: string): Promise<User | null> {
    if (hasPostgres) {
        try {
            await initializePostgresTables();

            const result = await sql`
                SELECT id, email, first_name, last_name, organization_id, organization_name, created_at, updated_at
                FROM users 
                WHERE id = ${id}
            `;

            if (result.rows.length === 0) return null;

            const row = result.rows[0];
            return {
                id: row.id,
                email: row.email,
                password: '', // Don't include password
                firstName: row.first_name,
                lastName: row.last_name,
                organizationId: row.organization_id,
                organizationName: row.organization_name,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
        } catch (error) {
            console.error('Postgres error getting user by id:', error);
            return null;
        }
    } else {
        // Use file/memory fallback
        const db = isVercel ?
            (memoryDb || { users: [], organizations: [] }) :
            await readFileDatabase();

        const user = db.users.find(u => u.id === id);
        if (!user) return null;

        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword as User;
    }
}

// Organization operations
export async function findOrganizationById(id: string): Promise<Organization | null> {
    if (hasPostgres) {
        try {
            await initializePostgresTables();

            const result = await sql`
                SELECT id, name, slug, created_at, updated_at
                FROM organizations 
                WHERE id = ${id}
            `;

            if (result.rows.length === 0) return null;

            const row = result.rows[0];
            return {
                id: row.id,
                name: row.name,
                slug: row.slug,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            };
        } catch (error) {
            console.error('Postgres error finding organization:', error);
            return null;
        }
    } else {
        // Use file/memory fallback
        const db = isVercel ?
            (memoryDb || { users: [], organizations: [] }) :
            await readFileDatabase();

        return db.organizations.find(o => o.id === id) || null;
    }
}

export async function getAllOrganizations(): Promise<Organization[]> {
    if (hasPostgres) {
        try {
            await initializePostgresTables();

            const result = await sql`
                SELECT id, name, slug, created_at, updated_at
                FROM organizations 
                ORDER BY created_at DESC
            `;

            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                slug: row.slug,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }));
        } catch (error) {
            console.error('Postgres error getting organizations:', error);
            return [];
        }
    } else {
        // Use file/memory fallback
        const db = isVercel ?
            (memoryDb || { users: [], organizations: [] }) :
            await readFileDatabase();

        return db.organizations;
    }
}

// Reset database (for development/testing only)
export async function resetDatabase(): Promise<void> {
    console.log(`Resetting database using ${hasPostgres ? 'Postgres' : 'file/memory'}`);

    if (hasPostgres) {
        try {
            await sql`DELETE FROM users`;
            await sql`DELETE FROM organizations`;
            console.log('Postgres database reset successfully');
        } catch (error) {
            console.error('Error resetting Postgres database:', error);
            throw error;
        }
    } else {
        if (isVercel) {
            memoryDb = { users: [], organizations: [] };
            console.log('Memory database reset');
        } else {
            await initializeFileDatabase();
            console.log('File database reset');
        }
    }
} 