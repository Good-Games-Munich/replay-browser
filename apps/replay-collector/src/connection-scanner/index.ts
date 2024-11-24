import dgram from "dgram";
import { EventEmitter } from "events";
import type { Wii } from "../schemas";
import { type WiiStore, createWiiStore } from "../wii_store";

type ConnectionScannerEventMap = {
  consoleDiscovered: [Wii];
  receivedMessage: [Wii];
  scanningStarted: [];
  scanningStopped: [];
  error: [Error];
  timeout: [Wii];
};

export class ConnectionScanner extends EventEmitter<ConnectionScannerEventMap> {
  private wiiStore: WiiStore;
  private socket: dgram.Socket;
  private timeouts = new Map<string, Timer>();
  private timeout = 30_000;
  constructor(wiiStore: WiiStore, options: { timeout?: number } = {}) {
    super();
    this.wiiStore = wiiStore;
    this.socket = dgram.createSocket({
      type: "udp4",
      reuseAddr: true,
    });

    if (options?.timeout) {
      this.timeout = options.timeout;
    }

    this.socket.on("error", this.handleError);
    this.setupMessageHandler();
  }

  private extractMacAddress(message: Buffer): string {
    const mac = [];
    for (let i = 10; i <= 15; i += 1) {
      mac.push(message.readUInt8(i).toString(16).padStart(2, "0"));
    }
    return mac.join(":");
  }

  private extractNickname(message: Buffer): string {
    return message.subarray(16, 48).toString().split("\0").shift() ?? "";
  }

  private handleTimeout(console: Wii): void {
    this.wiiStore.remove(console.ip);
    this.timeouts.delete(console.ip);
    this.emit("timeout", console);
  }

  private handleMessage(message: Buffer, remoteInfo: dgram.RemoteInfo): void {
    /* The structure of broadcast messages from the Wii should be:
     *  unsigned char cmd[10]; // 0 - 10
     *  u8 mac_addr[6]; // 10 - 16
     *  unsigned char nickname[32]; // 16 - 48
     */
    if (message.subarray(0, 10).toString() !== "SLIP_READY") {
      // This is not a Slippi broadcast message, do nothing
      return;
    }

    const discoveredConsole: Wii = {
      mac: this.extractMacAddress(message),
      nickname: this.extractNickname(message),
      ip: remoteInfo.address,
    };

    this.emit("receivedMessage", discoveredConsole);

    // Use WiiStore's add method which handles duplicate checking
    if (this.wiiStore.add(discoveredConsole)) {
      this.emit("consoleDiscovered", discoveredConsole);
    } else {
      // find the timeout and clear it
      const timeout = this.timeouts.get(discoveredConsole.ip);
      if (timeout) {
        clearTimeout(timeout);
      }

      // set a new timeout
      this.timeouts.set(
        discoveredConsole.ip,
        setTimeout(() => {
          this.handleTimeout(discoveredConsole);
        }, this.timeout),
      );
    }
  }

  private handleError = (error: Error): void => {
    console.error(error);
    this.emit("error", error);
  };

  private setupMessageHandler(): void {
    this.socket.on("message", (message, remoteInfo) => {
      this.handleMessage(message, remoteInfo);
    });
  }

  public startScanning(callback?: () => void): void {
    this.socket.bind(20582, "0.0.0.0", () => {
      if (callback) callback();
      this.emit("scanningStarted");
    });
  }

  public stopScanning(): void {
    this.socket.close();
    this.emit("scanningStopped");
  }

  public getSocket(): dgram.Socket {
    return this.socket;
  }

  public getDiscoveredConsoles(): Wii[] {
    return this.wiiStore.getList();
  }
}
