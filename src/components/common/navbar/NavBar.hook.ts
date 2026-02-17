import { useAuth0 } from "@auth0/auth0-react";

export function useNavBarLogic() {
  const {
    loginWithRedirect,
    isAuthenticated,
    isLoading,
    user,
  } = useAuth0();

  const roles = user?.["https://uberclocked.com/roles"] ?? [];

  const isAdmin =
    roles.includes("ADMIN") || roles.includes("Admin") || roles.includes("admin");

  return {
    loginWithRedirect,
    isAuthenticated,
    isLoading,
    isAdmin,
  };
}
