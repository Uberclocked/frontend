import { MyProfileForm } from "@/components/common/profile/form/MyProfileForm";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyProfile } from "./MyProfile.hooks";



export default function MyProfilePage() {
  const navigate = useNavigate();
  const { profile, loading, saveProfile, deleteAccount, isAuthenticated } = useMyProfile();
  const [open, setOpen] = useState(true);

  if (!isAuthenticated) return <p>You must login to see your profile</p>;
  if (!profile) return <p>Loading...</p>;
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <MyProfileForm
        profile={profile}
        loading={loading}
        onSave={saveProfile}
        onDelete={deleteAccount}
        onCancel={() => {
          setOpen(false);
          navigate("/");
        }}
      />
    </div>
  );
}
