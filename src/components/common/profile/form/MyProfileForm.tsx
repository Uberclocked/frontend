import type { UserDataDto } from "@/types/UserDataDto";
import { useState } from "react";

interface MyProfileFormProps {
  profile: UserDataDto;
  loading: boolean;
  onSave: (data: UserDataDto) => void;
  onDelete: () => void;
  onCancel: () => void;
}

export function MyProfileForm({ profile, loading, onSave, onDelete, onCancel }: MyProfileFormProps) {
  const [form, setForm] = useState<UserDataDto>(profile);

  return (
    <div className="w-full max-w-md rounded-xl shadow-lg p-6 bg-white">
      <h1 className="text-2xl font-semibold mb-6 text-center">Profile</h1>

      <div className="flex flex-col gap-4">
        <div>
          <label className="block text-sm mb-1">Username</label>
          <input
            value={form.userName ?? ""}
            onChange={(e) => setForm({ ...form, userName: e.target.value })}
            className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
            placeholder="Username"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            value={form.email ?? ""}
            disabled
            className="w-full px-3 py-2 rounded border cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Country</label>
          <input
            value={form.country ?? ""}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
            placeholder="Country"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Cellphone</label>
          <input
            value={form.cellPhone ?? ""}
            onChange={(e) => setForm({ ...form, cellPhone: e.target.value })}
            className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
            placeholder="Cellphone"
          />
        </div>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button onClick={onDelete} className="text-sm text-red-600">
          Delete account
        </button>

        <div className="flex gap-4">
          <button onClick={onCancel} className="px-4 py-2 rounded border">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading}
            className="px-5 py-2 rounded font-semibold bg-primary text-white"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
