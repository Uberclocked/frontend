import AppErrorLayout from "@/components/layout/AppErrorLayout";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function RootErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <AppErrorLayout status={error.status.toString()} statusText={error.statusText} />
    );
  }

  return (
    <AppErrorLayout status="Something went wrong" statusText="Please try again later." />
  );
}
