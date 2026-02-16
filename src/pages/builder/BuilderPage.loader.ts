import { getAll } from "@/services/component";

export async function builderPageLoader() {
  return { components: await getAll() };
}
