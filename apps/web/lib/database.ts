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

// Check if we're running on Vercel
const isVercel = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const DB_FILE_PATH = path.join(process.cwd(), 'data', 'database.json');

// In-memory storage for Vercel (will reset on each deployment, but works for demo)
let memoryDb: Database | null = null;

// Ensure data directory exists (local only)
async function ensureDataDir() {
    if (isVercel) return; // Skip on Vercel

    const dataDir = path.dirname(DB_FILE_PATH);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Initialize database with clean data
async function initializeDatabase(): Promise<Database> {
    const defaultData: Database = {
        users: [],
        organizations: []
    };

    if (isVercel) {
        // On Vercel, use memory storage
        memoryDb = defaultData;
        console.log('Database initialized in memory (Vercel environment)');
    } else {
        // Local development, use file storage
        await ensureDataDir();
        await fs.writeFile(DB_FILE_PATH, JSON.stringify(defaultData, null, 2));
        console.log('Database initialized with clean data (local file)');
    }

    return defaultData;
}

// Read database
async function readDatabase(): Promise<Database> {
    if (isVercel) {
        // On Vercel, use memory storage
        if (!memoryDb) {
            console.log('Memory database not found, initializing...');
            return await initializeDatabase();
        }
        return memoryDb;
    } else {
        // Local development, use file storage
        try {
            await ensureDataDir();
            const data = await fs.readFile(DB_FILE_PATH, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.log('Database file not found, initializing clean database...');
            return await initializeDatabase();
        }
    }
}

// Write database
async function writeDatabase(data: Database): Promise<void> {
    if (isVercel) {
        // On Vercel, update memory storage
        memoryDb = data;
        console.log('Database updated in memory');
    } else {
        // Local development, write to file
        await ensureDataDir();
        await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2));
        console.log('Database written to file');
    }
}

// Generate unique ID
function generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
    console.log(`Creating user in ${isVercel ? 'Vercel' : 'local'} environment`);

    const db = await readDatabase();

    // Check if user already exists
    const existingUser = db.users.find(u => u.email === userData.email);
    if (existingUser) {
        throw new Error('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await hash(userData.password, 12);

    // Create organization
    const organizationId = generateId();
    const organization: Organization = {
        id: organizationId,
        name: userData.organizationName,
        slug: userData.organizationSlug || userData.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Create user
    const userId = generateId();
    const user: User = {
        id: userId,
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        organizationId,
        organizationName: userData.organizationName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Add to database
    db.users.push(user);
    db.organizations.push(organization);

    await writeDatabase(db);

    console.log(`User created successfully: ${user.email}`);

    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword as User,
        organization
    };
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const db = await readDatabase();
    const user = db.users.find(u => u.email === email);
    console.log(`Finding user ${email}: ${user ? 'found' : 'not found'} in ${isVercel ? 'Vercel' : 'local'} environment`);
    return user || null;
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

export async function getAllUsers(): Promise<User[]> {
    const db = await readDatabase();
    return db.users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword as User;
    });
}

export async function getUserById(id: string): Promise<User | null> {
    const db = await readDatabase();
    const user = db.users.find(u => u.id === id);
    if (!user) return null;

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
}

// Organization operations
export async function findOrganizationById(id: string): Promise<Organization | null> {
    const db = await readDatabase();
    return db.organizations.find(o => o.id === id) || null;
}

export async function getAllOrganizations(): Promise<Organization[]> {
    const db = await readDatabase();
    return db.organizations;
}

// Reset database (remove all users and organizations)
export async function resetDatabase(): Promise<void> {
    console.log(`Resetting database in ${isVercel ? 'Vercel' : 'local'} environment`);
    await initializeDatabase();
} 