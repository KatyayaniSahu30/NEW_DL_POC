// import the necessary modules and interfaces
import { z } from 'zod';
import { procedure, router } from '../trpc';
import { PrismaClient } from '@prisma/client';
import { appRouter } from './_app';
import cron from 'node-cron';
import schedule from 'node-schedule';
import { type } from 'os';

// import { parseCronExpression } from 'cron-schedule'; 

// create a Prisma client instance
const prisma = new PrismaClient();

// define the schema for the input parameter of the getBriefById procedure
const idSchema = z.object({
  id: z.number(),
});

// define the schema for the brief data
const briefSchema = z.object({
  title: z.string(),
  draftContent: z.string()
});

const briefUpdateSchema = z.object({
  id: z.number(),
  title: z.string(),
  draftContent: z.string()
});

const publishBriefByIdSchema = z.object({
  id: z.number(),
  publishedOn: z.union([z.date(), z.string()]).optional(),
  //publishedLater: z.union([z.date(), z.string()]).optional(),
});

const idAndPublishLaterSchema = z.object({
  id: z.number(),
  publishedLater: z.union([z.date(), z.string()]).optional(),
});




// cron.schedule
// Cron job to check and publish briefs at their scheduled time
const triggerCronJob = () => {
  
  // Create a rule to run every minute
  // const rule = new schedule.RecurrenceRule();
  // rule.second = 0; // Run at the beginning of every minute

  // const job = schedule.scheduleJob(rule, () => {
  //   const now = new Date();
  //   console.log(Logging at ${now});
  // });


  // Schedule a cron job to check and publish briefs at their scheduled time
   const minute = '0 */5 * * * *'
  // const day = '59 * * * * *'
  // cron.schedule(minute, async () => { // Change the cron schedule as per your requirement
    schedule.scheduleJob(minute, async () => {
    try {
      // Find briefs with a scheduled publishing date
      const pendingBriefs = await prisma.brief.findMany({
        where: {
          publishedLater: {
            not: null,

            // lt: new Date(), // Check if the publishLater date is less than the current date/time
          },
        },
      });
      console.log('test', pendingBriefs);
      // console.log('typedemo', typeof pendingBriefs[0].publishedLater);

      // Publish briefs that match the criteria
      for (const brief of pendingBriefs) {
        // console.log('typedemo' , typeof brief.publishedLater);
        if (
          brief.publishedLater &&
          brief.publishedLater > new Date() &&
          brief.publishedLater < new Date(new Date().setDate(new Date().getDate() + 1))
        )  {
          const res = await publish({ id: brief.id, publishedOn: brief.publishedLater });
          console.log('published', res);
        }
      }
    } catch (error) {
      console.error('Error publishing briefs:', error);
    }
  });
};



const publish = async (input: { id: number, publishedOn: string | Date | null }, content?:string ) => {


  const { id, publishedOn } = input;

  // Fetch the brief by ID to get the draft content
  const brief = await prisma.brief.findUnique({
    where: { id },
    select: { draftContent: true }, // Select only the draftContent field
  });

  if (!brief) {
    throw new Error(`Brief with ID ${id} not found.`);
  }

  // Convert the provided publishedOn date string to a Date object
  const publishedDate = publishedOn ? new Date(publishedOn) : new Date();

  console.log(publishedDate);


  // Update the brief based on the provided ID
  const updatedBrief = await prisma.brief.update({
    where: { id },
    data: {
      publishedContent: brief.draftContent, // Update publishContent with draftContent
      isPublished: true,
      isDraft: false,
      publishedOn: publishedDate, // Use the provided publishedOn date or current date/time
      publishedLater: null,
    },
  });

  return updatedBrief;

}

//  // Define the cron job for testing purposes
// cron.schedule('0 */2 * * * *', () => {
//   console.log('Running a task every 5 minutes');
// });

// define the editRouter with procedures
export const editRouter = router({

  // Procedure to publish a brief based on its ID
  publishBriefById: procedure.input(publishBriefByIdSchema).mutation(async ({ input }) => {

    const { id, publishedOn } = input;
    return publish({ id, publishedOn: publishedOn ?? null }); // Use null if publishedOn is undefined
  }),

  // Procedure to schedule publishing of briefs
  schedulePublishing: procedure.input(idAndPublishLaterSchema).mutation(async ({ input }) => {
    const { id, publishedLater } = input;

    // Fetch the brief by ID to ensure it exists
    const brief = await prisma.brief.findUnique({
      where: { id },
      select: { draftContent: true }, // Select only the draftContent field
    });

    if (!brief) {
      throw new Error(`Brief with ID ${id} not found.`);
    }

    // Update the brief based on the provided ID
    const updatedBrief = await prisma.brief.update({
      where: { id },
      data: {
        publishedLater: publishedLater ? new Date(publishedLater) : null, // Set publishedLater field

      },
    });

    // Trigger cron job to publish briefs at their scheduled time
    triggerCronJob();

    return updatedBrief;
  }),


  // procedure to add a brief
  saveAndDraftBrief: procedure.input(briefSchema).mutation(async ({ input }) => {
    const { title, draftContent } = input;
    const addBrief = await prisma.brief.create({
      data: {
        title,
        draftContent
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

  //   getAll: procedure.query(async ({ input = {} as Input }) => {
  //   const { sortField = 'title', sortOrder = 'asc' } = input; // Default sorting by 'title' in ascending order

  //   const fetchAllBriefs = await prisma.brief.findMany({
  //     orderBy: {
  //       [sortField]: sortOrder // Pass sortOrder directly
  //     }
  //   });

  //   return { fetchAllBriefs };
  // }),

  // Update brief
  updateBrief: procedure.input(briefUpdateSchema).mutation(async ({ input }) => {
    const { id, title, draftContent } = input;

    // Fetch the brief by ID to get the draft content
    const brief = await prisma.brief.findUnique({
      where: { id },
      select: { draftContent: true }, // Select only the draftContent field
    });

    if (!brief) {
      throw new Error(`Brief with ID ${id} not found.`);
    }


    // Update the brief based on the provided ID
    const updatedBrief = await prisma.brief.update({
      where: { id },
      data: {
        title,
        draftContent,
        publishedContent: draftContent, // Update publishedContent with draftContent
        isDraft: true, // Set isDraft to true for editing in draft mode
        isPublished: false, // Set isPublished to false
        // publishedOn: null, // Clear publishedOn date
        // publishedOn: new Date()
      },
    });

    return updatedBrief;
  }),

  // Procedure to get published briefs
  //  getPublishedBriefs: procedure.query(async () => {
  //   const publishedBriefs = await prisma.brief.findMany({
  //     where: { isPublished: true },
  //   });
  //   return publishedBriefs;
  // }),




});

// export the type of appRouter
export type AppRouter = typeof appRouter;

