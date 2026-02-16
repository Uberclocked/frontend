import type { Component } from "@/pages/builder/types/Component";

export async function getAll(): Promise<Component[]> {
  const components = [
    {
      id: "1",
      sku_prefix: "a",
      display_name: "A",
    },
    {
      id: "2",
      sku_prefix: "b",
      display_name: "B",
    },
    {
      id: "3",
      sku_prefix: "c",
      display_name: "C",
    },
    {
      id: "4",
      sku_prefix: "d",
      display_name: "D",
    },
    {
      id: "5",
      sku_prefix: "e",
      display_name: "E",
    },
  ] as Component[];
  return components;
}
