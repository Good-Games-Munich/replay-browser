import { z } from "zod";
import { WiiSchema } from "./wii";

export const replayCompleteMessageBodySchema = z.object({
  console: WiiSchema,
  fileURL: z.string().url("File URL must be a valid URL"),
});

export type ReplayCompleteMessageBody = z.infer<
  typeof replayCompleteMessageBodySchema
>;
