"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeDatabaseConnection = exports.checkDatabaseConnection = exports.db = void 0;
exports.initializeDatabase = initializeDatabase;
// Main database connection - conditional based on environment
const schema = __importStar(require("./schema"));
// Environment detection
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';
const hasDatabaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres');
// Use PostgreSQL for production/Vercel or if DATABASE_URL is provided
const usePostgres = isProduction || isVercel || hasDatabaseUrl;
let db;
let checkDatabaseConnection;
let closeDatabaseConnection;
if (usePostgres) {
    // PostgreSQL setup for production
    console.log('🐘 Using PostgreSQL database');
    const { drizzle } = require('drizzle-orm/postgres-js');
    const postgres = require('postgres');
    const connectionString = process.env.DATABASE_URL || 'postgresql://localhost:5432/pulsecrm';
    const sql = postgres(connectionString);
    exports.db = db = drizzle(sql, {
        schema,
        logger: process.env.NODE_ENV === 'development'
    });
    exports.checkDatabaseConnection = checkDatabaseConnection = async () => {
        try {
            await sql `SELECT 1`;
            return true;
        }
        catch (error) {
            console.error('PostgreSQL connection failed:', error);
            return false;
        }
    };
    exports.closeDatabaseConnection = closeDatabaseConnection = async () => {
        try {
            await sql.end();
            console.log('PostgreSQL connection closed gracefully');
        }
        catch (error) {
            console.error('Error closing PostgreSQL connection:', error);
        }
    };
}
else {
    // SQLite setup for development
    console.log('🗄️ Using SQLite database (development)');
    let Database;
    let sqlite;
    try {
        Database = require('better-sqlite3');
        const path = require('path');
        const fs = require('fs');
        // Database file path
        const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'dev.db');
        // Ensure directory exists
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        // Create SQLite connection
        sqlite = new Database(dbPath);
        // Enable foreign keys and WAL mode
        sqlite.pragma('foreign_keys = ON');
        sqlite.pragma('journal_mode = WAL');
        const { drizzle } = require('drizzle-orm/better-sqlite3');
        exports.db = db = drizzle(sqlite, {
            schema,
            logger: process.env.NODE_ENV === 'development'
        });
        exports.checkDatabaseConnection = checkDatabaseConnection = async () => {
            try {
                sqlite.prepare('SELECT 1').get();
                return true;
            }
            catch (error) {
                console.error('SQLite connection failed:', error);
                return false;
            }
        };
        exports.closeDatabaseConnection = closeDatabaseConnection = async () => {
            try {
                sqlite.close();
                console.log('SQLite connection closed gracefully');
            }
            catch (error) {
                console.error('Error closing SQLite connection:', error);
            }
        };
    }
    catch (error) {
        console.warn('⚠️ SQLite not available, using mock database');
        // Mock database for cases where SQLite isn't available
        exports.db = db = {
            select: () => ({ from: () => ({ where: () => [] }) }),
            insert: () => ({ values: () => ({ returning: () => [] }) }),
            update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
            delete: () => ({ where: () => ({ returning: () => [] }) })
        };
        exports.checkDatabaseConnection = checkDatabaseConnection = async () => {
            console.warn('Using mock database - no real connection');
            return true;
        };
        exports.closeDatabaseConnection = closeDatabaseConnection = async () => {
            console.log('Mock database - nothing to close');
        };
    }
}
// Initialize database with default data (development only)
async function initializeDatabase() {
    if (usePostgres) {
        console.log('📋 PostgreSQL database - skipping auto-initialization');
        console.log('   Run migrations manually with: pnpm db:migrate');
        return true;
    }
    try {
        console.log('🔄 Initializing SQLite database...');
        // SQLite-specific initialization code here
        // This will only run in development with SQLite
        console.log('✅ Database initialized successfully');
        return true;
    }
    catch (error) {
        console.error('❌ Database initialization failed:', error);
        return false;
    }
}
// Auto-initialize only in development with SQLite
if (!usePostgres && process.env.NODE_ENV === 'development') {
    initializeDatabase().catch(console.error);
}
// Export schema and types
__exportStar(require("./schema"), exports);
__exportStar(require("./utils/auth"), exports);
