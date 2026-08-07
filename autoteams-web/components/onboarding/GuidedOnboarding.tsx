"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { createOwnedWorkspace } from "@/lib/access-bootstrap";
import {
  ContextualProfile,
  loadContextualProfiles,
} from "@/lib/contextual-profiles";
import {
  loadContextInterview,
} from "@/lib/atlas-interview-state";
import {
  Workspace,
  WorkspacePerson,
  WorkspaceType,
  createWorkspaceId,
  loadActiveWorkspaceId,
  loadPeople,
  loadWorkspaces,
  saveActiveWorkspaceId,
  savePeople,
  workspaceTypeLabel,
} from "@/lib/workspaces";
import { ProductIcon } from "@/components/ui/ProductIcon";
import styles from "./GuidedOnboarding.module.css";

type FriendlyWorkspaceType = Exclude<WorkspaceType, "personal">;

type SetupStatus = {
  group: boolean;
  people: boolean;
  profile: boolean;
  team: boolean;
};

const groupTypes: Array<{
  value: FriendlyWorkspaceType;
  label: string;
  icon: string;
}> = [
  { value: "organisation", label: "Organisation", icon: "⌂" },
  { value: "community", label: "Community Group", icon: "♙" },
  { value: "sports", label: "Sports Club", icon: "◎" },
  { value: "education", label: "Education Group", icon: "▤" },
  { value: "friends_family", label: "Friends & Family", icon: "♡" },
];

export function GuidedOnboarding() {
  const { user } = useAuth();

  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [profiles, setProfiles] = useState<ContextualProfile[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [hasTeam, setHasTeam] = useState(false);
  const [ready, setReady] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] =
    useState<FriendlyWorkspaceType>("organisation");
  const [groupDescription, setGroupDescription] = useState("");

  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [personRole, setPersonRole] = useState("");
  const [personArea, setPersonArea] = useState("General");

  const [message, setMessage] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
  );

  const activePeople = people.filter(
    (person) =>
      person.workspaceId === activeWorkspaceId &&
      person.status === "active",
  );

  const myProfiles = useMemo(
    () =>
      profiles.filter((profile) =>
        belongsToCurrentUser(
          profile,
          user?.displayName,
          user?.email,
        ),
      ),
    [profiles, user?.displayName, user?.email],
  );

  const completedProfiles = myProfiles.filter((profile) => {
    const interview = loadContextInterview(profile.id, profile.mode);
    return Boolean(interview.completedAt);
  }).length;

  const status: SetupStatus = {
    group: Boolean(activeWorkspace),
    people: activePeople.length > 0,
    profile: completedProfiles > 0,
    team: hasTeam,
  };

  const completedCount = Object.values(status).filter(Boolean).length;
  const progress = Math.round((completedCount / 4) * 100);
  const nextStep = getNextStep(status);

  function refresh() {
    setWorkspaces(loadWorkspaces());
    setPeople(loadPeople());
    setProfiles(loadContextualProfiles());
    setActiveWorkspaceId(loadActiveWorkspaceId());
    setHasTeam(detectSavedTeam());
    setReady(true);
  }

  function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const created = createOwnedWorkspace({
      name: groupName,
      type: groupType,
      description: groupDescription,
    });

    saveActiveWorkspaceId(created.id);
    setGroupName("");
    setGroupDescription("");
    setMessage(`${created.name} is ready. Add people next.`);
    refresh();
  }

  function selectGroup(id: string) {
    saveActiveWorkspaceId(id);
    setActiveWorkspaceId(id);
    setMessage("");
  }

  function addPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeWorkspace) return;

    const person: WorkspacePerson = {
      id: createWorkspaceId("person"),
      workspaceId: activeWorkspace.id,
      name: personName.trim(),
      email: personEmail.trim(),
      department: personArea.trim() || "General",
      jobTitle: personRole.trim() || "Member",
      location: "Not specified",
      status: "active",
      teamDnaStatus: "not-started",
      strengths: [],
    };

    const updated = [...people, person];

    savePeople(updated);
    setPeople(updated);
    setPersonName("");
    setPersonEmail("");
    setPersonRole("");
    setMessage(`${person.name} was added to ${activeWorkspace.name}.`);
  }

  function addDemoPeople() {
    if (!activeWorkspace) return;

    const currentEmails = new Set(
      people.map((person) => person.email.toLowerCase()),
    );

    const newPeople = demoPeople(activeWorkspace.type)
      .filter(
        (person) =>
          !currentEmails.has(person.email.toLowerCase()),
      )
      .map<WorkspacePerson>((person) => ({
        ...person,
        id: createWorkspaceId("person"),
        workspaceId: activeWorkspace.id,
        status: "active",
        teamDnaStatus: "ready",
      }));

    const updated = [...people, ...newPeople];

    savePeople(updated);
    setPeople(updated);
    setMessage(
      `${newPeople.length} demo people were added to ${activeWorkspace.name}.`,
    );
  }

  if (!ready) {
    return (
      <section className={styles.loading}>
        Preparing your setup…
      </section>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">Get Started</span>
            <h1>Let’s build your first team.</h1>
            <p>
              Complete four simple steps. AutoTeams highlights the next
              action and keeps setup on this page wherever possible.
            </p>
          </div>

          <aside className={styles.progressCard}>
            <div>
              <small>Your progress</small>
              <strong>{progress}%</strong>
            </div>

            <div className={styles.progressBar}>
              <i style={{ width: `${progress}%` }} />
            </div>

            <p>
              {completedCount} of 4 steps complete
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          {message && (
            <div className={styles.message}>{message}</div>
          )}

          <section className={styles.nextAction}>
            <ProductIcon label={nextStep.title} size="lg">
              {nextStep.icon}
            </ProductIcon>

            <div>
              <span className="eyebrow">Your next step</span>
              <h2>{nextStep.title}</h2>
              <p>{nextStep.text}</p>
            </div>

            {nextStep.href && (
              <Link className="button" href={nextStep.href}>
                {nextStep.label} →
              </Link>
            )}
          </section>

          <section className={styles.steps}>
            <StepCard
              number="1"
              title="Create your group"
              text="The company, club, community, education group, friends or family where teams belong."
              complete={status.group}
              active={!status.group}
            >
              {!status.group ? (
                <CreateGroupForm
                  groupName={groupName}
                  groupType={groupType}
                  groupDescription={groupDescription}
                  setGroupName={setGroupName}
                  setGroupType={setGroupType}
                  setGroupDescription={setGroupDescription}
                  onSubmit={createGroup}
                  workspaces={workspaces}
                  onSelectGroup={selectGroup}
                />
              ) : (
                <CompletedSummary
                  icon="◇"
                  title={activeWorkspace?.name || "Group ready"}
                  text={
                    activeWorkspace
                      ? workspaceTypeLabel(activeWorkspace.type)
                      : "Active group"
                  }
                  action={
                    workspaces.length > 1 ? (
                      <label className={styles.selectLabel}>
                        Change group
                        <select
                          value={activeWorkspaceId}
                          onChange={(event) =>
                            selectGroup(event.target.value)
                          }
                        >
                          {workspaces.map((workspace) => (
                            <option
                              key={workspace.id}
                              value={workspace.id}
                            >
                              {workspace.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : undefined
                  }
                />
              )}
            </StepCard>

            <StepCard
              number="2"
              title="Add people"
              text="Add or invite the people AutoTeams may consider when recommending a team."
              complete={status.people}
              active={status.group && !status.people}
              locked={!status.group}
            >
              {!status.group ? (
                <LockedMessage text="Create your group first." />
              ) : !status.people ? (
                <AddPeopleForm
                  groupName={activeWorkspace?.name || "your group"}
                  personName={personName}
                  personEmail={personEmail}
                  personRole={personRole}
                  personArea={personArea}
                  setPersonName={setPersonName}
                  setPersonEmail={setPersonEmail}
                  setPersonRole={setPersonRole}
                  setPersonArea={setPersonArea}
                  onSubmit={addPerson}
                  onAddDemo={addDemoPeople}
                />
              ) : (
                <CompletedSummary
                  icon="♙"
                  title={`${activePeople.length} active ${
                    activePeople.length === 1 ? "person" : "people"
                  }`}
                  text={`Available in ${activeWorkspace?.name}`}
                  action={
                    <Link
                      className="button secondary"
                      href="/people"
                    >
                      Manage People
                    </Link>
                  }
                />
              )}
            </StepCard>

            <StepCard
              number="3"
              title="Complete your profile"
              text="A short collaboration interview helps AutoTeams explain recommendations more clearly."
              complete={status.profile}
              active={status.group && status.people && !status.profile}
              locked={!status.people}
            >
              {!status.people ? (
                <LockedMessage text="Add at least one person first." />
              ) : !status.profile ? (
                <ActionPanel
                  icon="♡"
                  title="Tell AutoTeams how you work."
                  text="Your profile belongs to you and is separate from the group and its members."
                  href="/profile"
                  label="Start My Profile"
                />
              ) : (
                <CompletedSummary
                  icon="♡"
                  title={`${completedProfiles} completed ${
                    completedProfiles === 1 ? "profile" : "profiles"
                  }`}
                  text="Your collaboration preferences are ready."
                  action={
                    <Link
                      className="button secondary"
                      href="/profile"
                    >
                      Review My Profile
                    </Link>
                  }
                />
              )}
            </StepCard>

            <StepCard
              number="4"
              title="Build your first team"
              text="Describe the outcome you need and review an explainable recommendation."
              complete={status.team}
              active={
                status.group &&
                status.people &&
                status.profile &&
                !status.team
              }
              locked={!status.people}
            >
              {!status.people ? (
                <LockedMessage text="Add people before building a team." />
              ) : (
                <ActionPanel
                  icon="▥"
                  title={
                    status.team
                      ? "Build another team."
                      : "Everything is ready."
                  }
                  text={
                    status.profile
                      ? `${activePeople.length} people are available in ${activeWorkspace?.name}.`
                      : "You can build now, although completing your profile first will improve explainability."
                  }
                  href="/team-builder"
                  label={
                    status.team
                      ? "Build Another Team"
                      : "Build My First Team"
                  }
                />
              )}
            </StepCard>
          </section>

          <section className={styles.help}>
            <div>
              <span className="eyebrow">Need help?</span>
              <h2>Learn only what you need for the next step.</h2>
              <p>
                The Learning Centre explains groups, people, profiles
                and team recommendations in simple language.
              </p>
            </div>

            <Link
              className="button secondary"
              href="/learning-centre"
            >
              Open Learning Centre
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}

function StepCard({
  number,
  title,
  text,
  complete,
  active,
  locked = false,
  children,
}: {
  number: string;
  title: string;
  text: string;
  complete: boolean;
  active: boolean;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <article
      className={`${styles.stepCard} ${
        active ? styles.activeStep : ""
      } ${complete ? styles.completeCard : ""} ${
        locked ? styles.lockedCard : ""
      }`}
    >
      <header>
        <span
          className={
            complete
              ? styles.completeNumber
              : active
                ? styles.activeNumber
                : styles.pendingNumber
          }
        >
          {complete ? "✓" : number}
        </span>

        <div>
          <small>
            {complete
              ? "Complete"
              : active
                ? "Current step"
                : locked
                  ? "Not ready"
                  : "Next"}
          </small>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
      </header>

      <div className={styles.stepContent}>{children}</div>
    </article>
  );
}

function CreateGroupForm({
  groupName,
  groupType,
  groupDescription,
  setGroupName,
  setGroupType,
  setGroupDescription,
  onSubmit,
  workspaces,
  onSelectGroup,
}: {
  groupName: string;
  groupType: FriendlyWorkspaceType;
  groupDescription: string;
  setGroupName: (value: string) => void;
  setGroupType: (value: FriendlyWorkspaceType) => void;
  setGroupDescription: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  workspaces: Workspace[];
  onSelectGroup: (id: string) => void;
}) {
  return (
    <div className={styles.createLayout}>
      <form className={styles.form} onSubmit={onSubmit}>
        <label>
          Group name
          <input
            required
            value={groupName}
            onChange={(event) =>
              setGroupName(event.target.value)
            }
            placeholder="Sunday Football Club"
          />
        </label>

        <fieldset>
          <legend>Group type</legend>

          <div className={styles.typeGrid}>
            {groupTypes.map((option) => (
              <label
                className={
                  groupType === option.value
                    ? `${styles.typeOption} ${styles.selectedType}`
                    : styles.typeOption
                }
                key={option.value}
              >
                <input
                  checked={groupType === option.value}
                  name="group-type"
                  onChange={() => setGroupType(option.value)}
                  type="radio"
                />
                <span>{option.icon}</span>
                <strong>{option.label}</strong>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          Description
          <textarea
            value={groupDescription}
            onChange={(event) =>
              setGroupDescription(event.target.value)
            }
            placeholder="Who is this group for?"
          />
        </label>

        <button className="button" type="submit">
          Create Group
        </button>
      </form>

      {workspaces.length > 0 && (
        <aside className={styles.existing}>
          <span className="eyebrow">Existing groups</span>
          <h3>Already created one?</h3>

          <div>
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => onSelectGroup(workspace.id)}
                type="button"
              >
                <strong>{workspace.name}</strong>
                <small>
                  {workspaceTypeLabel(workspace.type)}
                </small>
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

function AddPeopleForm({
  groupName,
  personName,
  personEmail,
  personRole,
  personArea,
  setPersonName,
  setPersonEmail,
  setPersonRole,
  setPersonArea,
  onSubmit,
  onAddDemo,
}: {
  groupName: string;
  personName: string;
  personEmail: string;
  personRole: string;
  personArea: string;
  setPersonName: (value: string) => void;
  setPersonEmail: (value: string) => void;
  setPersonRole: (value: string) => void;
  setPersonArea: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onAddDemo: () => void;
}) {
  return (
    <div className={styles.createLayout}>
      <form className={styles.form} onSubmit={onSubmit}>
        <span className="eyebrow">Add to {groupName}</span>

        <label>
          Full name
          <input
            required
            value={personName}
            onChange={(event) =>
              setPersonName(event.target.value)
            }
            placeholder="Alex Murphy"
          />
        </label>

        <label>
          Email address
          <input
            required
            type="email"
            value={personEmail}
            onChange={(event) =>
              setPersonEmail(event.target.value)
            }
            placeholder="alex@example.com"
          />
        </label>

        <label>
          Role
          <input
            value={personRole}
            onChange={(event) =>
              setPersonRole(event.target.value)
            }
            placeholder="Team member"
          />
        </label>

        <label>
          Department or area
          <input
            value={personArea}
            onChange={(event) =>
              setPersonArea(event.target.value)
            }
            placeholder="General"
          />
        </label>

        <button className="button" type="submit">
          Add Person
        </button>
      </form>

      <aside className={styles.demo}>
        <ProductIcon label="Demo people" size="lg">
          ✦
        </ProductIcon>
        <span className="eyebrow">Demo environment</span>
        <h3>Add sample people for testing.</h3>
        <p>
          Generate five people appropriate to this group and continue
          the setup immediately.
        </p>
        <button
          className="button secondary"
          onClick={onAddDemo}
          type="button"
        >
          Generate Demo People
        </button>
      </aside>
    </div>
  );
}

function CompletedSummary({
  icon,
  title,
  text,
  action,
}: {
  icon: string;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={styles.completedSummary}>
      <ProductIcon label={title} size="md">
        {icon}
      </ProductIcon>

      <div>
        <strong>{title}</strong>
        <small>{text}</small>
      </div>

      {action}
    </div>
  );
}

function ActionPanel({
  icon,
  title,
  text,
  href,
  label,
}: {
  icon: string;
  title: string;
  text: string;
  href: string;
  label: string;
}) {
  return (
    <div className={styles.actionPanel}>
      <ProductIcon label={title} size="md">
        {icon}
      </ProductIcon>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>

      <Link className="button" href={href}>
        {label} →
      </Link>
    </div>
  );
}

function LockedMessage({ text }: { text: string }) {
  return (
    <div className={styles.lockedMessage}>
      <span>○</span>
      <p>{text}</p>
    </div>
  );
}

function getNextStep(status: SetupStatus): {
  icon: string;
  title: string;
  text: string;
  href?: string;
  label?: string;
} {
  if (!status.group) {
    return {
      icon: "◇",
      title: "Create your group",
      text:
        "Start with the place where your people collaborate. You can create it below without leaving this page.",
    };
  }

  if (!status.people) {
    return {
      icon: "♙",
      title: "Add people",
      text:
        "Add at least one person or generate a demo population below.",
    };
  }

  if (!status.profile) {
    return {
      icon: "♡",
      title: "Complete your profile",
      text:
        "Tell AutoTeams how you prefer to collaborate before building your first team.",
      href: "/profile",
      label: "Start My Profile",
    };
  }

  if (!status.team) {
    return {
      icon: "▥",
      title: "Build your first team",
      text:
        "Your group, people and profile are ready. Continue to Team Builder.",
      href: "/team-builder",
      label: "Build My Team",
    };
  }

  return {
    icon: "✓",
    title: "Your setup is complete",
    text:
      "You can now manage people, review your profile or build another team.",
    href: "/home",
    label: "Return Home",
  };
}

function detectSavedTeam(): boolean {
  if (typeof window === "undefined") return false;

  try {
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key || !key.toLowerCase().includes("team")) continue;

      const raw = window.localStorage.getItem(key);
      if (!raw) continue;

      const value = JSON.parse(raw);

      if (Array.isArray(value) && value.length > 0) {
        return true;
      }

      if (
        value &&
        typeof value === "object" &&
        Array.isArray(value.teams) &&
        value.teams.length > 0
      ) {
        return true;
      }
    }
  } catch {
    return false;
  }

  return false;
}

function belongsToCurrentUser(
  profile: ContextualProfile,
  displayName?: string | null,
  email?: string | null,
): boolean {
  const profileName = normalise(profile.preferredName);
  const fullName = normalise(displayName);
  const emailName = normalise(
    (email || "")
      .split("@")[0]
      .replace(/[._-]+/g, " "),
  );

  if (!profileName) return false;

  return (
    profileName === fullName ||
    profileName === emailName ||
    Boolean(
      fullName &&
        profileName === normalise(fullName.split(" ")[0]),
    )
  );
}

function normalise(value?: string | null): string {
  return (value || "").trim().toLowerCase();
}

function demoPeople(
  type: WorkspaceType,
): Array<
  Omit<
    WorkspacePerson,
    "id" | "workspaceId" | "status" | "teamDnaStatus"
  >
> {
  const base = [
    {
      name: "Alex Murphy",
      email: "alex.murphy@example.com",
      department: "General",
      jobTitle: "Coordinator",
      location: "Leeds",
      strengths: ["Communication", "Organisation"],
    },
    {
      name: "Jay Singh",
      email: "jay.singh@example.com",
      department: "General",
      jobTitle: "Member",
      location: "Leeds",
      strengths: ["Reliability", "Planning"],
    },
    {
      name: "Morgan Lee",
      email: "morgan.lee@example.com",
      department: "General",
      jobTitle: "Member",
      location: "Manchester",
      strengths: ["Adaptability", "Collaboration"],
    },
    {
      name: "Samira Khan",
      email: "samira.khan@example.com",
      department: "General",
      jobTitle: "Member",
      location: "Bradford",
      strengths: ["Leadership", "Empathy"],
    },
    {
      name: "Owen Price",
      email: "owen.price@example.com",
      department: "General",
      jobTitle: "Member",
      location: "Wakefield",
      strengths: ["Delivery", "Problem solving"],
    },
  ];

  if (type === "organisation") {
    const departments = [
      "Engineering",
      "Product",
      "Delivery",
      "Design",
      "Operations",
    ];

    return base.map((person, index) => ({
      ...person,
      department: departments[index],
    }));
  }

  if (type === "sports") {
    return base.map((person, index) => ({
      ...person,
      department: index === 2 ? "Coaching" : "Players",
      jobTitle: index === 2 ? "Coach" : index === 0 ? "Captain" : "Player",
    }));
  }

  if (type === "education") {
    return base.map((person, index) => ({
      ...person,
      department: index === 2 ? "Tutors" : "Study Group",
      jobTitle: index === 2 ? "Tutor" : "Student",
    }));
  }

  if (type === "community") {
    return base.map((person, index) => ({
      ...person,
      department: index === 2 ? "Planning" : "Volunteers",
      jobTitle: index === 0 ? "Volunteer Lead" : "Volunteer",
    }));
  }

  return base.map((person) => ({
    ...person,
    department: "Friends & Family",
    jobTitle: "Group Member",
  }));
}
