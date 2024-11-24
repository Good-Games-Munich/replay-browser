"use client";

import { api } from "@/trpc/react";

export default function StreamConsumer() {
  const { data, status, error } = api.replay.onReplayComplete.useSubscription();

  return (
    <div>
      Status: {status} <br />
      Data: {JSON.stringify(data)}
      <br />
      Error: {error?.message}
    </div>
  );
}
