// import the necessary modules and interfaces
import { z } from 'zod';
import { procedure, router } from '../trpc';
import { PrismaClient } from '@prisma/client';
import { appRouter } from './_app';
import cron from 'node-cron';
import schedule from 'node-schedule';
import { type } from 'os';

// create a Prisma client instance
const prisma = new PrismaClient();

interface PublishInput {
  id: number;
  publishedOn: string | Date | null;
}

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
  const minute = '0 */2 * * * *'; // Cron schedule for every 2 minutes
  // const hour = '0 */2  15 * *'; // Cron schedule run every 2 minutes each day at 3 PM
  schedule.scheduleJob(minute, async () => {
    try {
      // Find briefs with a scheduled publishing date that has passed
      const pendingBriefs = await prisma.brief.findMany({
        where: {
          publishedLater: {
            not: null,
            lt: new Date(), // Check if the publishLater date is less than the current date/time
          },
        },
      });

      // Publish briefs that match the criteria
      for (const brief of pendingBriefs) {
        await publish({ id: brief.id, publishedOn: brief.publishedLater });
      }
    } catch (error) {
      console.error('Error publishing briefs:', error);
    }
  });
};


const publish = async (input: PublishInput) => {
  const { id, publishedOn } = input;

  // Fetch the brief by ID
  const brief = await prisma.brief.findUnique({
    where: { id },
  });

  if (!brief) {
    throw new Error(`Brief with ID ${id} not found.`);
  }

  // Convert the provided publishedOn date string to a Date object
  const publishedDate = publishedOn ? new Date(publishedOn) : new Date();

  // Determine if the brief should be published immediately or scheduled for later
  // const isPublishedLater = publishedDate.getTime() > new Date().getTime();
 const isPublishedLater = publishedDate > new Date();
  console.log(isPublishedLater)
  const isPublishedImmediately = !isPublishedLater; // Determine if the brief should be published immediately
  console.log(isPublishedImmediately);

  // Update the brief based on the publishing scenario
  let updatedBrief;
  if (isPublishedImmediately) {
    // Update the brief for immediate publishing
    updatedBrief = await prisma.brief.update({
      where: { id },
      data: {
        draftContent: brief.draftContent,
        publishedContent: brief.draftContent,
        isPublished: true,
        isDraft: false,
        publishedOn: publishedDate,
        publishedLater: null,
      },
    });
  } else {
    // Update the brief for scheduled publishing
    updatedBrief = await prisma.brief.update({
      where: { id },
      data: {
        draftContent: brief.draftContent,
        publishedContent: null,
        isPublished: false,
        isDraft: true,
        publishedOn: null,
        publishedLater: publishedDate,
      },
    });
  }

  return updatedBrief;
};


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


});


// export the type of appRouter
export type AppRouter = typeof appRouter;





