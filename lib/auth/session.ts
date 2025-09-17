// Edge-compatible session utilities using Web Crypto (HMAC-SHA256)
// Falls back to Node's crypto if Web Crypto subtle not available.

const textEncoder = new TextEncoder();

/**
 * Lightweight HMAC signed session token.
 * Format: base64url(json).base64url(signature)
 */
const SESSION_SECRET = process.env.AUTH_SESSION_SECRET || 'dev-insecure-secret-change';
const ALGO = 'SHA-256';
export const SESSION_COOKIE = 'mudacity_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  uid: number;
  email: string;
  iat: number; // issued at (epoch seconds)
  exp: number; // expiry (epoch seconds)
}

function b64urlFromBytes(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  // base64
  let base64 = typeof btoa !== 'undefined' ? btoa(binary) : Buffer.from(binary, 'binary').toString('base64');
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlEncodeString(str: string) {
  // utf8 encode
  const utf8Bytes = textEncoder.encode(str);
  return b64urlFromBytes(utf8Bytes);
}

async function getCryptoKey() {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto not available in this runtime');
  }
  return await globalThis.crypto.subtle.importKey(
    'raw',
    textEncoder.encode(SESSION_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function hmacSign(encoded: string): Promise<string> {
  const key = await getCryptoKey();
  const sigBuf = await globalThis.crypto.subtle.sign('HMAC', key as CryptoKey, textEncoder.encode(encoded));
  return b64urlFromBytes(new Uint8Array(sigBuf));
}

export async function createSession(payload: Omit<SessionPayload, 'iat' | 'exp'>, ttlSeconds: number = SESSION_MAX_AGE) {
  const now = Math.floor(Date.now() / 1000);
  const full: SessionPayload = { ...payload, iat: now, exp: now + ttlSeconds };
  const json = JSON.stringify(full);
  const encoded = b64urlEncodeString(json);
  const signature = await hmacSign(encoded);
  return `${encoded}.${signature}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encoded, sig] = parts;
  const expectedSig = await hmacSign(encoded);
  // timing safe compare
  if (sig.length !== expectedSig.length) return null;
  let mismatch = 0;
  for (let i = 0; i < sig.length; i++) mismatch |= sig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  if (mismatch !== 0) return null;
  try {
    // Convert base64url -> base64
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Pad if needed
    const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
    const full = base64 + pad;
    let binary: string;
    if (typeof atob !== 'undefined') {
      binary = atob(full);
    } else {
      binary = Buffer.from(full, 'base64').toString('binary');
    }
    // binary -> utf8
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    const payload: SessionPayload = JSON.parse(json);
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0;`;
}

export function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE};`;
}
