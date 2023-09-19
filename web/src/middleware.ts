import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/nyheter',
    '/nyheter/:slug',
    '/about',
    '/api/og-image/:slug',
  ],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(trpc)(.*)'],
};
