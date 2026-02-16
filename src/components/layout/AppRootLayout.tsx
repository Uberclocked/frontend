import { Outlet, useNavigation } from "react-router-dom";

function AppRootLayout() {
  const navigation = useNavigation();

  const isLoading = navigation.state === "loading";
  return (
    <div className="h-screen flex flex-col">
      {isLoading && (
        <div className="h-1 w-full bg-blue-500 animate-pulse" />
      )}
      <Outlet />
    </div>
  )
}

export default AppRootLayout;
