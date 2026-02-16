import { fetchWithAuth } from "@/services/api";
import type { UserDataDto } from "@/types/UserDataDto";
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useCallback } from "react";

export function useMyProfile() {
  const { isAuthenticated, getAccessTokenSilently, logout } = useAuth0();
  const [profile, setProfile] = useState<UserDataDto | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const token = await getAccessTokenSilently();
      const data = await fetchWithAuth<UserDataDto>("http://localhost:8080/me", token);
      setProfile(data);
    } catch (e) {
      console.error(e);
    }
  }, [getAccessTokenSilently, isAuthenticated]);

  const saveProfile = useCallback(async (updated: UserDataDto) => {
    if (!profile) return;
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      await fetchWithAuth<UserDataDto>("http://localhost:8080/me", token, {
        method: "PATCH",
        body: JSON.stringify(updated),
      });
      alert("Profile updated");
      setProfile(updated);
    } catch (e) {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, profile]);

  const deleteAccount = useCallback(async () => {
    const ok = confirm("Are you sure you want to delete your account?");
    if (!ok) return;

    try {
      const token = await getAccessTokenSilently();
      await fetchWithAuth("http://localhost:8080/me", token, { method: "DELETE" });
      alert("Account deleted");
      logout({ logoutParams: { returnTo: window.location.origin } });
    } catch (e) {
      alert("Error deleting account");
    }
  }, [getAccessTokenSilently, logout]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return { profile, loading, loadProfile, saveProfile, deleteAccount, isAuthenticated };
}
