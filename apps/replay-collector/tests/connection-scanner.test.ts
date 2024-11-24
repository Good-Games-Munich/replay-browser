import { expect, test, mock, beforeEach, afterEach, describe } from "bun:test";
import dgram from "dgram";
import createConnectionScanner from "../src/connection-scanner";

// Mock dgram Socket
const mockSocket = {
  on: mock((event: string, callback) => {}),
  removeAllListeners: mock(() => {}),
  bind: mock((port, ip, callback) => callback()),
  close: mock(() => {}),
};

// Mock dgram.createSocket
mock.module("dgram", () => ({
  createSocket: () => mockSocket,
}));

describe("ConnectionScanner", () => {
  let connectionScanner: ReturnType<typeof createConnectionScanner>;

  beforeEach(() => {
    // Reset all mocks before each test
    mock.restore();
    connectionScanner = createConnectionScanner();
  });

  afterEach(() => {
    connectionScanner.stopScanning();
  });

  test("should initialize with empty discovered consoles", () => {
    expect(connectionScanner.discoveredConsoles).toEqual([]);
  });

  test("should handle valid Slippi broadcast message", () => {
    const callback = mock(() => {});
    connectionScanner.onConsoleDiscovered(callback);

    // Create a mock Slippi broadcast message
    const message = Buffer.alloc(48);
    message.write("SLIP_READY", 0);
    message.write("00:11:22:33:44:55", 10); // MAC address
    message.write("TestConsole", 16); // Nickname

    const remoteInfo = {
      address: "192.168.1.100",
      family: "IPv4",
      port: 12345,
      size: 48,
    };

    // Simulate receiving a message
    const messageHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "message",
    )?.[1];

    expect(messageHandler).toBeDefined();

    messageHandler(message, remoteInfo);

    expect(callback).toHaveBeenCalledWith({
      mac: "00:11:22:33:44:55",
      nickname: "TestConsole",
      ip: "192.168.1.100",
    });

    expect(connectionScanner.discoveredConsoles).toHaveLength(1);
  });

  test("should ignore invalid Slippi broadcast messages", () => {
    const callback = mock(() => {});
    connectionScanner.onConsoleDiscovered(callback);

    // Create an invalid message
    const message = Buffer.from("INVALID_MESSAGE");
    const remoteInfo = {
      address: "192.168.1.100",
      family: "IPv4",
      port: 12345,
      size: 48,
    };

    // Simulate receiving a message
    const messageHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "message",
    )?.[1];
    messageHandler?.(message, remoteInfo);

    expect(callback).not.toHaveBeenCalled();
    expect(connectionScanner.discoveredConsoles).toHaveLength(0);
  });

  test("should not add duplicate consoles", () => {
    const callback = mock(() => {});
    connectionScanner.onConsoleDiscovered(callback);

    // Create a mock Slippi broadcast message
    const message = Buffer.alloc(48);
    message.write("SLIP_READY", 0);
    message.write("00:11:22:33:44:55", 10);
    message.write("TestConsole", 16);

    const remoteInfo = {
      address: "192.168.1.100",
      family: "IPv4",
      port: 12345,
      size: 48,
    };

    // Simulate receiving the same message twice
    const messageHandler = mockSocket.on.mock.calls.find(
      (call) => call[0] === "message",
    )?.[1];
    messageHandler?.(message, remoteInfo);
    messageHandler?.(message, remoteInfo);

    expect(callback).toHaveBeenCalledTimes(1);
    expect(connectionScanner.discoveredConsoles).toHaveLength(1);
  });
});
