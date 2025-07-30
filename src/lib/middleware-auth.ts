// Lightweight JWT verification for Edge Runtime middleware with proper signature validation

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Base64URL decode function
function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padding = base64.length % 4;
  const padded = padding ? base64 + '='.repeat(4 - padding) : base64;
  return atob(padded);
}

// Base64URL encode function
function base64UrlEncode(str: string): string {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// HMAC-SHA256 implementation for Edge Runtime
async function hmacSha256(key: string, data: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(key);
  const messageData = encoder.encode(data);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  return base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)));
}

export async function verifyJWTForMiddleware(token: string): Promise<JWTPayload | null> {
  try {
    // Get JWT secret - in Edge Runtime, we need to be explicit about env access
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('🚨 [MIDDLEWARE_AUTH] JWT_SECRET not available in Edge Runtime');
      return null;
    }

    console.log('🔐 [MIDDLEWARE_AUTH] JWT_SECRET available, length:', JWT_SECRET.length);

    // Split the JWT into its parts
    const parts = token.split('.');

    if (parts.length !== 3) {
      console.log('❌ [MIDDLEWARE_AUTH] Invalid JWT format');
      return null;
    }

    const [headerB64, payloadB64, signatureB64] = parts;

    try {
      // Decode the header and payload
      const header = JSON.parse(base64UrlDecode(headerB64));
      const payload = JSON.parse(base64UrlDecode(payloadB64));

      console.log('🔍 [MIDDLEWARE_AUTH] Decoded payload:', {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        exp: payload.exp,
        iss: payload.iss,
        aud: payload.aud
      });

      // Check algorithm
      if (header.alg !== 'HS256') {
        console.log('❌ [MIDDLEWARE_AUTH] Unsupported algorithm:', header.alg);
        return null;
      }

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.log('⏰ [MIDDLEWARE_AUTH] Token expired');
        return null;
      }

      // Check issuer and audience if present
      if (payload.iss && payload.iss !== 'my-tooth-clinic') {
        console.log('❌ [MIDDLEWARE_AUTH] Invalid issuer');
        return null;
      }

      if (payload.aud && payload.aud !== 'my-tooth-users') {
        console.log('❌ [MIDDLEWARE_AUTH] Invalid audience');
        return null;
      }

      // Verify signature
      const dataToSign = headerB64 + '.' + payloadB64;
      const expectedSignature = await hmacSha256(JWT_SECRET, dataToSign);

      if (expectedSignature !== signatureB64) {
        console.log('❌ [MIDDLEWARE_AUTH] Invalid signature');
        return null;
      }

      console.log('✅ [MIDDLEWARE_AUTH] Token verified successfully');

      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp
      };

    } catch (decodeError) {
      console.error('🚨 [MIDDLEWARE_AUTH] Token decode error:', decodeError);
      return null;
    }

  } catch (error) {
    console.error('🚨 [MIDDLEWARE_AUTH] Token verification error:', error);
    return null;
  }
}

// Fallback synchronous version for backwards compatibility (less secure)
export function verifyJWTForMiddlewareSync(token: string): JWTPayload | null {
  try {
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!JWT_SECRET) {
      console.error('🚨 [MIDDLEWARE_AUTH] JWT_SECRET not available');
      return null;
    }

    const parts = token.split('.');

    if (parts.length !== 3) {
      console.log('❌ [MIDDLEWARE_AUTH] Invalid JWT format');
      return null;
    }

    try {
      const payload = JSON.parse(base64UrlDecode(parts[1]));

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        console.log('⏰ [MIDDLEWARE_AUTH] Token expired');
        return null;
      }

      // NOTE: This version doesn't verify signature - use only for development/testing
      console.log('⚠️ [MIDDLEWARE_AUTH] Using sync verification - signature not validated');

      return {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
        iat: payload.iat,
        exp: payload.exp
      };

    } catch (decodeError) {
      console.error('🚨 [MIDDLEWARE_AUTH] Token decode error:', decodeError);
      return null;
    }

  } catch (error) {
    console.error('🚨 [MIDDLEWARE_AUTH] Token verification error:', error);
    return null;
  }
}
