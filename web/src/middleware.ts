import { authMiddleware } from '@clerk/nextjs';
export default authMiddleware({
  publicRoutes: ['/', '/nyheter', '/nyheter/:slug', '/about'],
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
