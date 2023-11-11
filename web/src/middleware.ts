import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/:lang',
    '/:lang/:slug',
    '/nyheter',
    '/nyheter/:slug',
    '/nyheter/:lang/:slug',
    '/about',
    '/api/og-image/:slug',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
