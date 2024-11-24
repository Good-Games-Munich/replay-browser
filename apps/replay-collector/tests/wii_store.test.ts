import { beforeEach, describe, expect, it } from "bun:test";
import { createWiiStore, type WiiStore } from "../src/wii_store";

describe("WiiStore", () => {
  let store: WiiStore;

  beforeEach(() => {
    store = createWiiStore();
  });

  it("should add multiple Wiis", () => {
    const wii1 = {
      ip: "192.168.1.1",
      mac: "00:11:22:33:44:55",
      nickname: "test1",
    };
    const wii2 = {
      ip: "192.168.1.2",
      mac: "00:11:22:33:44:56",
      nickname: "test2",
    };
    store.add(wii1);
    store.add(wii2);
    expect(store.getList()).toEqual([wii1, wii2]);
  });

  it("should not add duplicate Wiis (by ip)", () => {
    const wii = {
      ip: "192.168.1.1",
      mac: "00:11:22:33:44:55",
      nickname: "test",
    };
    store.add(wii);
    const result = store.add(wii);
    expect(result).toBe(false);
    expect(store.getList()).toEqual([wii]);
  });

  it("should be empty initially", () => {
    expect(store.getList()).toEqual([]);
  });

  it("should return true when removing a Wii by ip", () => {
    const wii = {
      ip: "192.168.1.1",
      mac: "00:11:22:33:44:55",
      nickname: "test",
    };
    store.add(wii);
    const result = store.remove(wii.ip);
    expect(result).toBe(true);
    expect(store.getList()).toEqual([]);
  });

  it("should return false when removing a Wii by ip that does not exist", () => {
    const result = store.remove("192.168.1.1");
    expect(result).toBe(false);
    expect(store.getList()).toEqual([]);
  });
});
