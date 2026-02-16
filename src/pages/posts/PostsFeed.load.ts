import { getPostsPublic } from "@/services/Market";


export async function postsFeedLoader() {
  return { posts: await getPostsPublic() }
}
