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

export const HomeIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Home" symbol="⌂" />
);

export const PeopleIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="People" symbol="♙" />
);

export const AtlasIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Atlas" symbol="✦" />
);

export const TeamIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Team" symbol="▥" />
);

export const RecommendationIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Recommendations" symbol="◎" />
);

export const DnaIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Team DNA" symbol="◌" />
);

export const WorkspaceIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Workspace" symbol="◇" />
);

export const LearningIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Learning" symbol="▤" />
);

export const NotificationIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Notifications" symbol="◔" />
);

export const SettingsIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Settings" symbol="⚙" />
);

export const TalentPoolIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Talent Pool" symbol="◎" />
);

export const InsightIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Insights" symbol="▥" />
);

export const BusinessIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Organisation" symbol="⌂" />
);

export const CommunityIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Community Group" symbol="♙" />
);

export const SportsIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Sports Club" symbol="◎" />
);

export const EducationIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Education" symbol="▤" />
);

export const FriendshipIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Friends and Family" symbol="♡" />
);

export const PersonalGroupIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Personal Group" symbol="♙" />
);

export const PrivacyIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Privacy" symbol="◇" />
);

export const SecurityIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Security" symbol="✓" />
);

export const SuccessIcon = (props: NamedIconProps) => (
  <NamedIcon {...props} label="Success" symbol="✓" />
);
