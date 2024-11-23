import type { ReplayCompleteMessageBody } from "@ggm-replays/core/schemas";
import EventEmitter from "node:events";
import "./client";

const eventEmitter = new EventEmitter<{
  replay_complete: [body: ReplayCompleteMessageBody];
}>();

export default eventEmitter;
