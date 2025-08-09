import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

// Replace with your real auth if needed
const auth = async (_req: Request) => ({ id: "fakeId" as const });

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      return { uploadedBy: metadata.userId } as const;
    }),

  videoUploader: f({
    video: {
      maxFileSize: "1GB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth(req);
      if (!user) throw new UploadThingError("Unauthorized");
      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Video upload complete for userId:", metadata.userId);
      console.log("file url", file.url);
      console.log("file name:", file.name);
      console.log("file type:", file.type);
      return { uploadedBy: metadata.userId, url: file.url, name: file.name } as const;
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;



