import { jwtVerify, SignJWT } from 'jose';

// JWT Secret - should match your backend
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
);

// JWT payload interface - matches your NestJS backend structure
export interface JWTPayload {
  sub: string; // User ID (matches your backend JWT payload)
  email: string;
  role: 'ADMIN' | 'AGENT';
  iat?: number;
  exp?: number;
}

// Token expiration times
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '1d', // 1 day (backend tokens should define actual expiration)
  REFRESH_TOKEN: '7d', // 7 days
} as const;

/**
 * Verify a JWT token
 * @param token - The JWT token to verify
 * @returns The decoded payload or null if invalid
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Create a JWT token
 * @param payload - The payload to encode
 * @param expiresIn - Token expiration time (default: 15m)
 * @returns The signed JWT token
 */
export async function createToken(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  expiresIn: string = TOKEN_EXPIRY.ACCESS_TOKEN
): Promise<string> {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);

  return token;
}

/**
 * Check if a token is expired
 * @param token - The JWT token to check
 * @returns True if token is expired, false otherwise
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time
 * @param token - The JWT token
 * @returns Expiration timestamp or null if invalid
 */
export async function getTokenExpiration(token: string): Promise<number | null> {
  try {
    const payload = await verifyToken(token);
    return payload?.exp || null;
  } catch {
    return null;
  }
}

/**
 * Check if token expires within a certain time
 * @param token - The JWT token
 * @param minutes - Minutes before expiration to check
 * @returns True if token expires within the specified time
 */
export async function isTokenExpiringSoon(
  token: string,
  minutes: number = 5
): Promise<boolean> {
  try {
    const payload = await verifyToken(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = payload.exp;
    const timeUntilExpiry = expirationTime - currentTime;
    
    return timeUntilExpiry < (minutes * 60);
  } catch {
    return true;
  }
}
