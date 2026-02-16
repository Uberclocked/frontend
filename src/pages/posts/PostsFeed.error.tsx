import AppErrorLayout from "@/components/layout/AppErrorLayout";


function PostsFeedErrorPage() {
  return (
    <AppErrorLayout status={"Error loading the available posts"} statusText="Please try again later." />
  )
}

export default PostsFeedErrorPage;
