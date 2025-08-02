import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, type AppRouter } from '../../../../lib/api';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: () => ({}),
  });

export { handler as GET, handler as POST };
export type { AppRouter };