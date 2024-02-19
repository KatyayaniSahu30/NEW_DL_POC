// import the necessary modules and interfaces
import { z } from 'zod';
import { procedure, router } from '../trpc';
import { PrismaClient } from '@prisma/client';
import { appRouter } from './_app';

// create a Prisma client instance
const prisma = new PrismaClient();

// define the schema for the input parameter of the getBriefById procedure
const idSchema = z.object({
  id: z.number(),
});

// define the schema for the brief data
const briefSchema = z.object({
  title: z.string(),
  content: z.string()
});

const briefUpdateSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string()
});

// const briefUpdateSchema = z.object({
//   id: z.number(),
//   title: z.string().optional(), // Make title optional
//   content: z.string().optional(), // Make content optional
// });

// define the editRouter with procedures
export const editRouter = router({

  // procedure to add a brief
  addBrief: procedure.input(briefSchema).mutation(async ({ input }) => {
    const { title, content } = input;
    const addBrief = await prisma.brief.create({
      data: {
        title,
        content,
      },
    });
    return addBrief;
  }),

  // saveAndDraftBrief: publicProcedure
  //   .input(createBriefSchema)
  //   .mutation(({input, ctx})=>{
  //       return ctx.db.brief.create({
  //           data: createBriefSchema.parse(input)
  //       })
  //   }),


  // procedure to get a brief by ID
  getBriefById: procedure.input(idSchema).query(async ({ input }) => {
    const brief = await prisma.brief.findUnique({
      where: { id: input.id },
    });
    return brief;
  }),

  // Get all users
  getAll: procedure.query(async () => {
    const fetchAllBriefs = await prisma.brief.findMany();
    return { fetchAllBriefs };
  }),

  // Update brief
  updateBrief: procedure.input(briefUpdateSchema).mutation(async ({ input }) => {
    const { id, ...briefData } = input;
    const updateBrief = await prisma.brief.update({
      where: { id },
      data: briefData,
    });
    return updateBrief;
  }),

  // Define the updateBrief procedure with updated logic
// updateBrief: procedure.input(briefUpdateSchema).mutation(async ({ input }) => {
//   const { id, title, content } = input;

//   // Prepare data to be updated
//   const dataToUpdate: { title?: string; content?: string } = {};
//   if (title !== undefined) {
//     dataToUpdate.title = title;
//   }
//   if (content !== undefined) {
//     dataToUpdate.content = content;
//   }

//   // Update the brief based on the provided ID
//   const updatedBrief = await prisma.brief.update({
//     where: { id },
//     data: dataToUpdate,
//   });

//   return updatedBrief;
// }),

  
});

// export the type of appRouter
export type AppRouter = typeof appRouter;
