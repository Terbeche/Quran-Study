import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  // Exclude /api, /_next, static files
  matcher: ['/', '/(ar|en|fr)/:path*']
};
