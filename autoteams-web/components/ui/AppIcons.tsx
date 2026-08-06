import type { ReactNode } from "react";
import { AppIcon, AppIconSize } from "./AppIcon";

type NamedIconProps = {
  size?: AppIconSize;
  subtle?: boolean;
  className?: string;
};

function NamedIcon({
  symbol,
  label,
  size,
  subtle,
  className,
}: NamedIconProps & {
  symbol: ReactNode;
  label: string;
}) {
  return (
    <AppIcon
      className={className}
      label={label}
      size={size}
      subtle={subtle}
    >
      {symbol}
    </AppIcon>
  );
}

export function HomeIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Home" symbol="⌂" />;
}

export function PeopleIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="People" symbol="♙" />;
}

export function AtlasIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Atlas" symbol="✦" />;
}

export function TeamIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Team" symbol="▥" />;
}

export function RecommendationIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Recommendations" symbol="◎" />;
}

export function DnaIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Team DNA" symbol="◌" />;
}

export function WorkspaceIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Workspace" symbol="◇" />;
}

export function LearningIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Learning" symbol="▤" />;
}

export function NotificationIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Notifications" symbol="◔" />;
}

export function SettingsIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Settings" symbol="⚙" />;
}

export function TalentPoolIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Talent Pool" symbol="◎" />;
}

export function InsightIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Insights" symbol="▥" />;
}

export function BusinessIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Business profile" symbol="⌂" />;
}

export function FriendshipIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Friendship profile" symbol="♡" />;
}

export function CommunityIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Community profile" symbol="♙" />;
}

export function SportsIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Sports profile" symbol="◎" />;
}

export function EducationIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Education profile" symbol="▥" />;
}

export function PersonalGroupIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Personal group" symbol="♙" />;
}

export function PrivacyIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Privacy" symbol="◇" />;
}

export function SecurityIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Security" symbol="✓" />;
}

export function SuccessIcon(props: NamedIconProps) {
  return <NamedIcon {...props} label="Success" symbol="✓" />;
}
