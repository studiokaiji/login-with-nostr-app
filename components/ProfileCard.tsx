import { OutlinedButton } from "./OutlinedButton";

export const ProfileCard = ({
  profile,
  pubkey,
  remove,
  isProcessing,
}: {
  profile: Profile;
  pubkey: string;
  remove?: () => void;
  isProcessing?: boolean;
}) => {
  return (
    <div className="space-y-2 rounded bg-white p-4 font-medium shadow-md">
      <div className="flex items-center space-x-2">
        <img
          className="rounded bg-slate-200"
          src={profile?.picture || ""}
          alt="my-picture"
          width={40}
          height={40}
        />
        <p className="overflow-hidden">{profile?.name}</p>
      </div>
      {remove && (
        <div>
          <OutlinedButton onClick={remove} isProcessing={isProcessing}>Remove User Data</OutlinedButton>
        </div>
      )}
    </div>
  );
};
