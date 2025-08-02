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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.sql = void 0;
exports.checkDatabaseConnection = checkDatabaseConnection;
exports.closeDatabaseConnection = closeDatabaseConnection;
const postgres_js_1 = require("drizzle-orm/postgres-js");
const postgres_1 = __importDefault(require("postgres"));
const schema = __importStar(require("./schema"));
// Database configuration
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:@localhost:5432/constructflow_prod';
// Configure postgres connection with optimizations
const connectionOptions = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'constructflow_prod',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Better for serverless
};
// Create connection
exports.sql = (0, postgres_1.default)(connectionString, connectionOptions);
// Create Drizzle database instance with schema
exports.db = (0, postgres_js_1.drizzle)(exports.sql, {
    schema,
    logger: process.env.NODE_ENV === 'development' && process.env.ENABLE_DB_LOGGING === 'true'
});
// Health check function
async function checkDatabaseConnection() {
    try {
        await (0, exports.sql) `SELECT 1`;
        return true;
    }
    catch (error) {
        console.error('Database connection failed:', error);
        return false;
    }
}
// Graceful shutdown
async function closeDatabaseConnection() {
    try {
        await exports.sql.end();
        console.log('Database connection closed gracefully');
    }
    catch (error) {
        console.error('Error closing database connection:', error);
    }
}
// Export schema and types
__exportStar(require("./schema"), exports);
__exportStar(require("./utils/auth"), exports);
