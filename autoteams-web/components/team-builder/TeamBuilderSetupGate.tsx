"use client";

import type { ReactNode } from "react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { createOwnedWorkspace } from "@/lib/access-bootstrap";
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
import styles from "./TeamBuilderSetupGate.module.css";

type FriendlyWorkspaceType = Exclude<WorkspaceType, "personal">;

const groupTypes: Array<{
  value: FriendlyWorkspaceType;
  title: string;
  text: string;
  icon: string;
}> = [
  {
    value: "organisation",
    title: "Company or organisation",
    text: "A business, department, programme or professional team.",
    icon: "⌂",
  },
  {
    value: "community",
    title: "Community group",
    text: "A charity, volunteer group, faith group or local community.",
    icon: "♙",
  },
  {
    value: "sports",
    title: "Sports club",
    text: "A club, squad, coaching group or sporting activity.",
    icon: "◎",
  },
  {
    value: "education",
    title: "Education group",
    text: "A school, university, study group or learning programme.",
    icon: "▤",
  },
  {
    value: "friends_family",
    title: "Friends or family",
    text: "A friendship group, family activity or private social group.",
    icon: "♡",
  },
];

export function TeamBuilderSetupGate({
  children,
}: {
  children: ReactNode;
}) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [ready, setReady] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] =
    useState<FriendlyWorkspaceType>("organisation");
  const [groupDescription, setGroupDescription] = useState("");

  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [personRole, setPersonRole] = useState("");
  const [personGroup, setPersonGroup] = useState("General");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    refreshState();
  }, []);

  const activeWorkspace = useMemo(
    () =>
      workspaces.find(
        (workspace) => workspace.id === activeWorkspaceId,
      ),
    [workspaces, activeWorkspaceId],
  );

  const activePeople = useMemo(
    () =>
      people.filter(
        (person) =>
          person.workspaceId === activeWorkspaceId &&
          person.status === "active",
      ),
    [people, activeWorkspaceId],
  );

  function refreshState() {
    setWorkspaces(loadWorkspaces());
    setPeople(loadPeople());
    setActiveWorkspaceId(loadActiveWorkspaceId());
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
    setNotice(`${created.name} is ready. Now add the people TeamScience.ai can consider.`);
    refreshState();
  }

  function chooseWorkspace(id: string) {
    saveActiveWorkspaceId(id);
    setActiveWorkspaceId(id);
    setNotice("");
  }

  function addPerson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeWorkspace) return;

    const person: WorkspacePerson = {
      id: createWorkspaceId("person"),
      workspaceId: activeWorkspace.id,
      name: personName.trim(),
      email: personEmail.trim(),
      department: personGroup.trim() || "General",
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
    setNotice(`${person.name} was added to ${activeWorkspace.name}.`);
  }

  function addDemoPeople() {
    if (!activeWorkspace) return;

    const existingEmails = new Set(
      people.map((person) => person.email.toLowerCase()),
    );

    const samples = demoPeopleFor(activeWorkspace.type)
      .filter(
        (person) =>
          !existingEmails.has(person.email.toLowerCase()),
      )
      .map<WorkspacePerson>((person) => ({
        ...person,
        id: createWorkspaceId("person"),
        workspaceId: activeWorkspace.id,
        status: "active",
        teamDnaStatus: "ready",
        strengths: person.strengths,
      }));

    const updated = [...people, ...samples];

    savePeople(updated);
    setPeople(updated);
    setNotice(
      `${samples.length} demo people were added to ${activeWorkspace.name}.`,
    );
  }

  if (!ready) {
    return (
      <section className={styles.loading}>
        Preparing Team Builder…
      </section>
    );
  }

  if (!activeWorkspace) {
    return (
      <SetupShell currentStep={1}>
        <section className={styles.setupCard}>
          <header className={styles.setupHeader}>
            <span className={styles.largeIcon}>◇</span>
            <div>
              <span className="eyebrow">Step 1 of 3</span>
              <h1>Create the group where this team belongs.</h1>
              <p>
                This could be your company, sports club, community,
                education group, friends or family.
              </p>
            </div>
          </header>

          {workspaces.length > 0 && (
            <div className={styles.existingGroups}>
              <span className="eyebrow">Or choose an existing group</span>
              <div>
                {workspaces.map((workspace) => (
                  <button
                    key={workspace.id}
                    onClick={() => chooseWorkspace(workspace.id)}
                    type="button"
                  >
                    <strong>{workspace.name}</strong>
                    <small>{workspaceTypeLabel(workspace.type)}</small>
                  </button>
                ))}
              </div>
            </div>
          )}

          <form className={styles.form} onSubmit={createGroup}>
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
              <legend>What kind of group is it?</legend>

              <div className={styles.typeGrid}>
                {groupTypes.map((option) => (
                  <label
                    className={
                      option.value === groupType
                        ? `${styles.typeOption} ${styles.selected}`
                        : styles.typeOption
                    }
                    key={option.value}
                  >
                    <input
                      checked={option.value === groupType}
                      name="group-type"
                      onChange={() => setGroupType(option.value)}
                      type="radio"
                    />
                    <span>{option.icon}</span>
                    <div>
                      <strong>{option.title}</strong>
                      <small>{option.text}</small>
                    </div>
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
                placeholder="Who is this group for and what teams will you create?"
              />
            </label>

            <button className="button" type="submit">
              Create Group and Continue →
            </button>
          </form>
        </section>
      </SetupShell>
    );
  }

  if (activePeople.length === 0) {
    return (
      <SetupShell currentStep={2}>
        <section className={styles.setupCard}>
          <header className={styles.setupHeader}>
            <span className={styles.largeIcon}>♙</span>
            <div>
              <span className="eyebrow">Step 2 of 3</span>
              <h1>Add people to {activeWorkspace.name}.</h1>
              <p>
                These are the people TeamScience.ai may consider when
                recommending a team.
              </p>
            </div>
          </header>

          {notice && (
            <div className={styles.notice}>{notice}</div>
          )}

          <div className={styles.groupSummary}>
            <div>
              <small>Current group</small>
              <strong>{activeWorkspace.name}</strong>
              <span>
                {workspaceTypeLabel(activeWorkspace.type)}
              </span>
            </div>

            {workspaces.length > 1 && (
              <label>
                Change group
                <select
                  value={activeWorkspace.id}
                  onChange={(event) =>
                    chooseWorkspace(event.target.value)
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
            )}
          </div>

          <div className={styles.peopleOptions}>
            <form className={styles.form} onSubmit={addPerson}>
              <span className="eyebrow">Add a person</span>

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
                Role or position
                <input
                  value={personRole}
                  onChange={(event) =>
                    setPersonRole(event.target.value)
                  }
                  placeholder="Team member"
                />
              </label>

              <label>
                Department or group
                <input
                  value={personGroup}
                  onChange={(event) =>
                    setPersonGroup(event.target.value)
                  }
                  placeholder="General"
                />
              </label>

              <button className="button" type="submit">
                Add Person
              </button>
            </form>

            <aside className={styles.demoOption}>
              <span className={styles.largeIcon}>✦</span>
              <span className="eyebrow">Demo environment</span>
              <h2>Need people for testing?</h2>
              <p>
                Add a relevant sample population to this group so you
                can test Team Builder immediately.
              </p>
              <button
                className="button secondary"
                onClick={addDemoPeople}
                type="button"
              >
                Generate Demo People
              </button>
            </aside>
          </div>
        </section>
      </SetupShell>
    );
  }

  return (
    <>
      <section className={styles.readyBanner}>
        <div>
          <span className={styles.readyIcon}>✓</span>
          <div>
            <small>Ready to build</small>
            <strong>{activeWorkspace.name}</strong>
            <p>
              {activePeople.length} active{" "}
              {activePeople.length === 1 ? "person is" : "people are"}{" "}
              available.
            </p>
          </div>
        </div>

        <label>
          Change group
          <select
            value={activeWorkspace.id}
            onChange={(event) =>
              chooseWorkspace(event.target.value)
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
      </section>

      {children}
    </>
  );
}

function SetupShell({
  currentStep,
  children,
}: {
  currentStep: 1 | 2 | 3;
  children: ReactNode;
}) {
  const steps = [
    {
      number: 1,
      title: "Create a group",
      text: "Where the team belongs",
    },
    {
      number: 2,
      title: "Add people",
      text: "Who TeamScience.ai can consider",
    },
    {
      number: 3,
      title: "Build the team",
      text: "Describe and review",
    },
  ];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <span className="eyebrow">Build a Team</span>
          <h1>Let’s get everything ready in one place.</h1>
          <p>
            You do not need to leave Team Builder. Complete each step
            below and TeamScience.ai will move you forward automatically.
          </p>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          <div className={styles.steps}>
            {steps.map((step) => {
              const complete = currentStep > step.number;
              const active = currentStep === step.number;

              return (
                <article
                  className={
                    active
                      ? styles.activeStep
                      : complete
                        ? styles.completedStep
                        : ""
                  }
                  key={step.number}
                >
                  <span>{complete ? "✓" : step.number}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <small>{step.text}</small>
                  </div>
                </article>
              );
            })}
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}

function demoPeopleFor(
  type: WorkspaceType,
): Array<
  Omit<
    WorkspacePerson,
    "id" | "workspaceId" | "status" | "teamDnaStatus"
  >
> {
  const common = [
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
      jobTitle: "Team Member",
      location: "Leeds",
      strengths: ["Reliability", "Planning"],
    },
    {
      name: "Morgan Lee",
      email: "morgan.lee@example.com",
      department: "General",
      jobTitle: "Team Member",
      location: "Manchester",
      strengths: ["Adaptability", "Collaboration"],
    },
    {
      name: "Samira Khan",
      email: "samira.khan@example.com",
      department: "General",
      jobTitle: "Team Member",
      location: "Bradford",
      strengths: ["Leadership", "Empathy"],
    },
    {
      name: "Owen Price",
      email: "owen.price@example.com",
      department: "General",
      jobTitle: "Team Member",
      location: "Wakefield",
      strengths: ["Delivery", "Problem solving"],
    },
  ];

  if (type === "organisation") {
    return common.map((person, index) => ({
      ...person,
      department:
        ["Engineering", "Product", "Delivery", "Design", "Operations"][
          index
        ],
      jobTitle:
        [
          "Software Engineer",
          "Product Manager",
          "Delivery Manager",
          "Service Designer",
          "Operations Analyst",
        ][index],
    }));
  }

  if (type === "sports") {
    return common.map((person, index) => ({
      ...person,
      department:
        ["Players", "Players", "Coaching", "Players", "Support"][
          index
        ],
      jobTitle:
        ["Captain", "Player", "Coach", "Player", "Coordinator"][index],
    }));
  }

  if (type === "education") {
    return common.map((person, index) => ({
      ...person,
      department:
        ["Study Group", "Study Group", "Tutors", "Study Group", "Support"][
          index
        ],
      jobTitle:
        ["Student", "Student", "Tutor", "Student", "Coordinator"][index],
    }));
  }

  if (type === "community") {
    return common.map((person, index) => ({
      ...person,
      department:
        ["Volunteers", "Volunteers", "Planning", "Volunteers", "Support"][
          index
        ],
      jobTitle:
        [
          "Volunteer Lead",
          "Volunteer",
          "Event Planner",
          "Volunteer",
          "Support Coordinator",
        ][index],
    }));
  }

  return common.map((person) => ({
    ...person,
    department: "Friends & Family",
    jobTitle: "Group Member",
  }));
}
