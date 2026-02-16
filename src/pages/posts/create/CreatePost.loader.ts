import { getAll } from "@/services/component";

export async function CreatePostPageLoader() {
  return { components: await getAll() }
}
