import { z } from 'zod';
import { procedure, router } from '../trpc';
import { PrismaClient } from '@prisma/client';
import { appRouter } from './_app';

const prisma = new PrismaClient();

const idSchema = z.object({ id: z.number() });

const userSchema = z.object({
  name: z.string(),
  email: z.string(),
});

const userUpdateSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
});

export const exampleRouter = router({

// Display Sample Text
  displayText: procedure
  .input(z.object({ text: z.string() }))
  .query(({ input }) => {
    return {
      displayedText: input.text,
    };
  }),

  //Add user 
  createUser: procedure.input(userSchema).mutation(async ({ input }) => {
    const createdUser = await prisma.user.create({
      data: userSchema.parse(input),
    });
    return createdUser;
  }),

  // Get all users
  getAll: procedure.query(async () => {
    const fetchAllUsers = await prisma.user.findMany();
    return { fetchAllUsers };
  }),
  
  // Update user
  updateUser: procedure.input(userUpdateSchema).mutation(async ({ input }) => {
    const { id, ...userData } = input;
    const updatedUser = await prisma.user.update({
      where: {  id },   
      data: userData,
    });
    return updatedUser;
  }),

  // Delete user
  deleteUser: procedure.input(idSchema).mutation(async ({ input }) => {
    const id = idSchema.parse(input).id;
    const deletedUser = await prisma.user.delete({
      where: { id },
    });
    return deletedUser;
  }),

   // Get user by ID without using ctx
//  getOne: procedure.input(idSchema).query(async ({ input }) => {
//   const user = await prisma.user.findUnique({
//     where: idSchema.parse(input),
//   });
//   return user;
// }),
  
});

export type AppRouter = typeof appRouter;
