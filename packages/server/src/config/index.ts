import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const defaultCorsOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const configuredCorsOrigins =
  process.env.CORS_ORIGIN?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) || defaultCorsOrigins;

/**
 * 判断当前主机名是否为本地回环地址。
 */
function isLoopbackHost(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
}

/**
 * 判断当前主机名是否为局域网 IPv4 地址。
 */
function isPrivateIpv4(hostname: string): boolean {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)) {
    return false;
  }

  const parts = hostname.split('.').map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => part < 0 || part > 255)) {
    return false;
  }

  const first = parts[0] ?? -1;
  const second = parts[1] ?? -1;
  return (
    first === 10 ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

/**
 * 校验浏览器请求来源，允许本地地址、局域网 IP 和显式配置的来源访问。
 */
function isAllowedCorsOrigin(origin?: string): boolean {
  if (!origin) {
    return true;
  }

  if (configuredCorsOrigins.includes(origin)) {
    return true;
  }

  try {
    const url = new URL(origin);
    return isLoopbackHost(url.hostname) || isPrivateIpv4(url.hostname);
  } catch {
    return false;
  }
}

export const config = {
  host: process.env.HOST || '0.0.0.0',
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',

  database: {
    url: process.env.DATABASE_URL || 'mysql://root:root@localhost:3306/noteapp',
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cors: {
    origin: configuredCorsOrigins,
    isAllowedOrigin: isAllowedCorsOrigin,
  },
} as const;

export type Config = typeof config;
