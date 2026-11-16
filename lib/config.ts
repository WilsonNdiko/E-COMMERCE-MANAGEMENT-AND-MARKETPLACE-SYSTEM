const isServer = typeof window === 'undefined';

const config = {
  apiBaseUrl: isServer
    ? process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:3001'
    : process.env.NEXT_PUBLIC_API_BASE_URL || '',
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
};

export default config;
