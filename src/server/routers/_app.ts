import { router } from '../trpc';
import { exampleRouter } from "../routers/example";
import { editRouter } from './edit';
// import { publishRouter } from './publish';

export const appRouter = router({
  example: exampleRouter,
  edit:  editRouter
//  publish: publishRouter 
});

// export type definition of API
export type AppRouter = typeof appRouter;

