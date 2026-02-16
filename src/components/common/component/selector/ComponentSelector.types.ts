import type { Component } from "@/pages/builder/types/Component";

export interface Props {
  components: Component[],
  onSelect: (sku: string) => void,
}
