import { useState } from "react";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { usePageHeader } from "@/hooks/usePageHeader";
import { GymTab } from "./GymTab";
import { ProfileTab } from "./ProfileTab";
import { SecurityTab } from "./SecurityTab";

type Tab = "profile" | "gym" | "security";

const TABS: { label: string; value: Tab }[] = [
  { label: "Profile", value: "profile" },
  { label: "Gym", value: "gym" },
  { label: "Security", value: "security" },
];

/** Not in the Figma frames; built in the same visual language for the documented account endpoints. */
export default function SettingsComponent() {
  usePageHeader("Settings", "Your account and gym details");
  const [tab, setTab] = useState<Tab>("profile");
  return (
    <div className="flex flex-col gap-6">
      <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      {tab === "profile" && <ProfileTab />}
      {tab === "gym" && <GymTab />}
      {tab === "security" && <SecurityTab />}
    </div>
  );
}
