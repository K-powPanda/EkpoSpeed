import crypto from 'crypto';

const COOKIE_NAME = 'esp_admin_session';
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

function getSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || '';
}

function sign(value) {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

function timingSafeEqual(a, b) {
  const left = Buffer.from(a || '');
  const right = Buffer.from(b || '');
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function createSessionCookie() {
  const issuedAt = Date.now().toString();
  const signature = sign(issuedAt);
  const value = `${issuedAt}.${signature}`;
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

  return `${COOKIE_NAME}=${value}; HttpOnly; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function clearSessionCookie() {
  const secure = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  return `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function isAuthorized(req) {
  const secret = getSecret();
  if (!secret) return false;

  const cookieHeader = req.headers.cookie || '';
  const cookie = cookieHeader
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return false;

  const token = decodeURIComponent(cookie.split('=').slice(1).join('='));
  const [issuedAt, signature] = token.split('.');
  if (!issuedAt || !signature) return false;

  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0 || ageMs > SESSION_MAX_AGE_SECONDS * 1000) {
    return false;
  }

  return timingSafeEqual(signature, sign(issuedAt));
}

export function requireAdmin(req, res) {
  if (isAuthorized(req)) return true;
  res.status(401).json({ error: 'Unauthorized' });
  return false;
}
