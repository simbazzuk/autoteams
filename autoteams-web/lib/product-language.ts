export const productLanguage = {
  workspace: "Group",
  workspacePlural: "Groups",
  atlasProfile: "Profile",
  atlasProfilePlural: "Profiles",
  talentPool: "Saved People Group",
  talentPoolPlural: "Saved People Groups",
  eligibleTalent: "Available People",
  teamDna: "Team Balance",
  playbook: "Team Template",
  playbookPlural: "Team Templates",
} as const;

export function friendlyWorkspaceType(
  type:
    | "organisation"
    | "community"
    | "sports"
    | "education"
    | "friends_family"
    | "personal",
): string {
  return {
    organisation: "Organisation",
    community: "Community Group",
    sports: "Sports Club",
    education: "Education Group",
    friends_family: "Friends & Family",
    personal: "Friends & Family",
  }[type];
}
