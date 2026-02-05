import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { fetchWithAuth } from "@/services/api.ts";
import type { UserDataDto } from "@/types/UserDataDto.ts";


export default function Profile() {
  const navigate = useNavigate();
  const { isAuthenticated, getAccessTokenSilently, logout } = useAuth0();
  const [form, setForm] = useState<UserDataDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function loadProfile() {
      const token = await getAccessTokenSilently();
      const data = await fetchWithAuth<UserDataDto>(
        "http://localhost:8080/me",
        token
      );
      setForm(data);
    }

    loadProfile();
  }, [isAuthenticated, getAccessTokenSilently]);

  async function save() {
    if (!form) return;

    setLoading(true);
    try {
      const token = await getAccessTokenSilently();

      await fetchWithAuth<UserDataDto>(
        "http://localhost:8080/me",
        token,
        {
          method: "PATCH",
          body: JSON.stringify(form)
        }
      );

      alert("Profile updated");
      setOpen(false);
      navigate("/");
    } catch (e) {
      alert("Error updating profile");
    } finally {
      setLoading(false);
    }
  }

  async function deleteAccount() {
    const ok = confirm(
      "¿Sure to delete your user?."
    );
    if (!ok) return;

    try {
      const token = await getAccessTokenSilently();

      await fetchWithAuth(
        "http://localhost:8080/me",
        token,
        { method: "DELETE" }
      );

      alert("Account deleted");
      setOpen(false);
      logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    } catch (e) {
      alert("Error deleting account");
    }
  }

  if (!isAuthenticated) return <p>You must login to see your profile</p>;
  if (!form) return <p>Loading...</p>;
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-md rounded-xl shadow-lg p-6 relative">
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Profile
        </h1>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm mb-1">
              Username
            </label>
            <input
              value={form.userName ?? ""}
              onChange={e =>
                setForm({ ...form, userName: e.target.value })
              }
              className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
              placeholder="Username"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Email
            </label>
            <input
              value={form.email ?? ""}
              disabled
              className="w-full px-3 py-2 rounded border cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Country
            </label>
            <input
              value={form.country ?? ""}
              onChange={e =>
                setForm({ ...form, country: e.target.value })
              }
              className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
              placeholder="Country"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">
              Cellphone
            </label>
            <input
              value={form.cellPhone ?? ""}
              onChange={e =>
                setForm({ ...form, cellPhone: e.target.value })
              }
              className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
              placeholder="Cellphone"
            />
          </div>
        </div>
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={deleteAccount}
            className="text-sm"
          >
            Delete account
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => {
                setOpen(false);
                navigate("/");
              }}
              className="px-4 py-2 rounded border"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={loading}
              className="px-5 py-2 rounded font-semibold"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
