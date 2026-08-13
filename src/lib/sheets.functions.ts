import { createServerFn } from "@tanstack/react-start";
import { loadAllItems } from "./sheets-data";
import type { SheetSnapshot } from "./sheets-data";

export const getAllItems = createServerFn({ method: "GET" }).handler(
  async (): Promise<SheetSnapshot> => loadAllItems(),
);
