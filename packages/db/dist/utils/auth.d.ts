/**
 * Hash a password using crypto.pbkdf2
 */
export declare function hashPassword(password: string): Promise<string>;
/**
 * Verify a password against its hash
 */
export declare function verifyPassword(password: string, hash: string): Promise<boolean>;
/**
 * Generate a secure random token
 */
export declare function generateToken(length?: number): string;
/**
 * Generate a UUID v4
 */
export declare function generateUUID(): string;
//# sourceMappingURL=auth.d.ts.map