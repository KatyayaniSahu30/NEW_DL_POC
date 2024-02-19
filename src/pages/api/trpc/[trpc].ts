import * as trpcNext from '@trpc/server/adapters/next';
import { appRouter } from '../../../server/routers/_app';


// export API handler- sets up an API route handler compatible with Next.js.
// @see https://trpc.io/docs/api-handler

export default trpcNext.createNextApiHandler({
  //defines the available procedures and routes for the API.
  router: appRouter,
  //function that could be used to create the context for the TRPC operations. 
  createContext: () => ({}),
  
});