import { router } from '../trpc';
import { exampleRouter } from "../routers/example";
import { editRouter } from './edit';

export const appRouter = router({
  example: exampleRouter,
  edit:  editRouter 
});

// export type definition of API
export type AppRouter = typeof appRouter;

