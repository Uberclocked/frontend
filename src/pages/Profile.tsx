import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

import { fetchWithAuth } from "../services/api";
import type { UserDataDto } from "../user/types/UserDataDto";

export default function Profile() {
    const { isAuthenticated, getAccessTokenSilently, logout } = useAuth0();
    const [form, setForm] = useState<UserDataDto | null>(null);
    const [loading, setLoading] = useState(false);

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

            alert("Account eliminated");

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

    return (
        <div style={{ maxWidth: 400, margin: "auto" }}>
            <h1>Profile</h1>

            <input
                value={form.userName ?? ""}
                onChange={e =>
                    setForm({ ...form, userName: e.target.value })
                }
                placeholder="Username"
            />

            <input
                value={form.email ?? ""}
                disabled
                placeholder="Email"
            />

            <input
                value={form.country ?? ""}
                onChange={e =>
                    setForm({ ...form, country: e.target.value })
                }
                placeholder="Country"
            />

            <input
                value={form.cellPhone ?? ""}
                onChange={e =>
                    setForm({ ...form, cellPhone: e.target.value })
                }
                placeholder="Cellphone"
            />

            <div style={{ marginTop: 16 }}>
                <button onClick={save} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </button>
            </div>

            <hr style={{ margin: "24px 0" }} />

            <button
                onClick={deleteAccount}
                style={{
                    backgroundColor: "#c62828",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    cursor: "pointer"
                }}
            >
                Delete account
            </button>
        </div>
    );
}