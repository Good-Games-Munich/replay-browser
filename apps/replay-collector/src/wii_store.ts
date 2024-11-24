import type { Wii } from "@ggm-replays/core/schemas";

/**
 * Stores currently connected Wii consoles.
 */
export interface WiiStore {
  getList: () => Wii[];
  add: (wii: Wii) => boolean;
  remove: (ip: string) => boolean;
}

export const createWiiStore = (): WiiStore => {
  let wiiList: Wii[] = [];

  return {
    getList: () => wiiList,

    add: (wii: Wii): boolean => {
      if (wiiList.find((w) => w.ip === wii.ip)) {
        return false;
      }

      wiiList.push(wii);
      return true;
    },

    remove: (ip: string): boolean => {
      if (!wiiList.find((w) => w.ip === ip)) {
        return false;
      }

      wiiList = wiiList.filter((wii) => wii.ip !== ip);
      return true;
    },
  };
};
