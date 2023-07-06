import { useState } from "react";

export const ProfileCard = ({
  profile,
  pubkey,
}: {
  profile: Profile;
  pubkey: string;
}) => {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(pubkey);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  console.log(profile);

  return (
    <button onClick={copy} className="cursor-pointer">
      <div className="flex items-center space-x-2 rounded bg-white p-4 font-medium shadow-md">
        <img
          className="rounded bg-slate-200"
          src={profile?.picture || ""}
          alt="my-picture"
          width={40}
          height={40}
        />
        <p className="overflow-hidden">{profile?.name}</p>
        {copied && (
          <p className="text-sm leading-none text-orange-600">Pubkey Copied!</p>
        )}
      </div>
    </button>
  );
};
