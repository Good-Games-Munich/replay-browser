/**
 * Manages the file system for the application.
 */

import { put as putVercelBlob } from "@vercel/blob";

interface FileManager {
  put(filePath: string): Promise<string>;
}

export const createFileManager = (): FileManager => {
  return {
    put: async (path: string): Promise<string> => {
      const file = Bun.file(path);
      const blob = await file.arrayBuffer();
      const result = await putVercelBlob(
        `/replays/${file.name ?? path.split("/").pop()}`,
        blob,
        {
          access: "public",
        },
      );

      return result.url;
    },
  };
};
