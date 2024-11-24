"use client";

import { DataTable } from "@/components/ui/data-table";
import type { replays } from "@/server/db/schema";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";

const columnHelper = createColumnHelper<typeof replays.$inferSelect>();

export default function ReplayTable() {
  const columns = useMemo(
    () => [
      columnHelper.accessor("id", { header: "ID" }),
      columnHelper.accessor("url", { header: "URL" }),
      columnHelper.accessor("startedAt", { header: "Started At" }),
      columnHelper.accessor("duration", { header: "Duration" }),
      columnHelper.accessor("wiiNickname", { header: "Wii Nickname" }),
    ],
    [],
  );

  const table = useReactTable({
    data: [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return <DataTable table={table} />;
}
