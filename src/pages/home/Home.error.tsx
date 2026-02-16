import AppErrorLayout from "@/components/layout/AppErrorLayout";

function HomeErrorPage() {
  return (
    <AppErrorLayout status="Error loading the available products" statusText="Please try again later." />
  );
}

export default HomeErrorPage;
