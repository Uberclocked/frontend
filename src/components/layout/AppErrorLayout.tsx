import ErrorCard from "../common/error/card/ErrorCard";

function AppErrorLayout({ status, statusText }: { status: string | number, statusText: string }) {
  return (
    <div className="flex flex-col justify-center items-center min-h-full w-full">
      <ErrorCard status={status} statusText={statusText} />
    </div>
  )
}

export default AppErrorLayout;
