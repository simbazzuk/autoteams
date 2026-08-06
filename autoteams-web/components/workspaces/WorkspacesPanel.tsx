"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { createOwnedWorkspace } from "@/lib/access-bootstrap";
import {
  Workspace,
  WorkspaceType,
  defaultContextForWorkspace,
  loadActiveWorkspaceId,
  loadPeople,
  loadWorkspaces,
  saveActiveWorkspaceId,
  workspaceContextLabel,
  workspaceTypeLabel,
} from "@/lib/workspaces";
import { useWorkspaceAccess } from "@/components/access/AccessContext";
import { roleLabel } from "@/lib/workspace-access";
import {
  BusinessIcon,
  CommunityIcon,
  EducationIcon,
  FriendshipIcon,
  SportsIcon,
  SuccessIcon,
  WorkspaceIcon,
} from "@/components/ui/AppIcons";
import styles from "./WorkspacesPanel.module.css";

const workspaceTypes: Array<{
  value: Exclude<WorkspaceType, "personal">;
  title: string;
  description: string;
  example: string;
}> = [
  {
    value: "organisation",
    title: "Organisation",
    description:
      "Companies, departments, programmes and professional teams.",
    example: "Example Company",
  },
  {
    value: "community",
    title: "Community Group",
    description:
      "Volunteers, charities, faith groups and local communities.",
    example: "Leeds Community Network",
  },
  {
    value: "sports",
    title: "Sports Club",
    description:
      "Clubs, squads, coaching groups and sporting activities.",
    example: "Leeds Cricket Club",
  },
  {
    value: "education",
    title: "Education",
    description:
      "Schools, universities, study groups and learning programmes.",
    example: "Engineering Study Cohort",
  },
  {
    value: "friends_family",
    title: "Friends & Family",
    description:
      "Friendship groups, family activities and private social groups.",
    example: "Weekend Hiking Group",
  },
];

export function WorkspacesPanel() {
  const [items, setItems] = useState<Workspace[]>([]);
  const [active, setActive] = useState("");
  const [name, setName] = useState("");
  const [type, setType] =
    useState<Exclude<WorkspaceType, "personal">>(
      "organisation",
    );
  const [description, setDescription] = useState("");
  const [created, setCreated] = useState("");

  const access = useWorkspaceAccess(active);
  const people = useMemo(() => loadPeople(), []);

  useEffect(() => {
    setItems(loadWorkspaces());
    setActive(loadActiveWorkspaceId());
  }, []);

  function choose(id: string) {
    setActive(id);
    saveActiveWorkspaceId(id);
    setCreated("");
  }

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const workspace = createOwnedWorkspace({
      name,
      type,
      description,
    });

    setItems(loadWorkspaces());
    setActive(workspace.id);
    setCreated(workspace.name);
    setName("");
    setDescription("");
  }

  const selectedType =
    workspaceTypes.find((item) => item.value === type) ||
    workspaceTypes[0];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className="container">
          <span className="eyebrow">Workspaces</span>
          <h1>Create the right boundary for your people and teams.</h1>
          <p>
            Choose the kind of group you are creating. AutoTeams uses
            that choice to recommend the most relevant Atlas Profile
            context for members.
          </p>
        </div>
      </section>

      <section className={styles.body}>
        <div className={`container ${styles.layout}`}>
          <section className={styles.listPanel}>
            <div className={styles.heading}>
              <div>
                <span className="eyebrow">Your workspaces</span>
                <h2>Select where you are working.</h2>
                <p>
                  People, Talent Pools, recommendations and teams remain
                  inside the active workspace.
                </p>
              </div>
              <span>{items.length}</span>
            </div>

            <div className={styles.grid}>
              {items.map((workspace) => {
                const count = people.filter(
                  (person) =>
                    person.workspaceId === workspace.id,
                ).length;

                const isActive = workspace.id === active;

                return (
                  <article
                    className={`${styles.card} ${
                      isActive ? styles.activeCard : ""
                    }`}
                    key={workspace.id}
                  >
                    <div className={styles.cardTop}>
                      <WorkspaceTypeIcon
                        type={workspace.type}
                        size="lg"
                      />
                      <em>
                        {workspaceTypeLabel(workspace.type)}
                      </em>
                    </div>

                    <h3>{workspace.name}</h3>
                    <p>{workspace.description}</p>

                    <div className={styles.context}>
                      <small>Default member profile</small>
                      <strong>
                        {workspaceContextLabel(workspace)}
                      </strong>
                    </div>

                    <div className={styles.cardMeta}>
                      <span>{count} people</span>
                      {isActive && access.role && (
                        <span>
                          {roleLabel(access.role, "business")}
                        </span>
                      )}
                    </div>

                    <button
                      className={
                        isActive
                          ? "button secondary"
                          : "button"
                      }
                      onClick={() => choose(workspace.id)}
                      type="button"
                    >
                      {isActive
                        ? "Active workspace"
                        : "Use workspace"}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className={styles.actions}>
              <Link className="button" href="/members">
                Invite Members
              </Link>
              <Link
                className="button secondary"
                href="/people"
              >
                Manage People
              </Link>
              <Link
                className="button secondary"
                href="/talent-pools"
              >
                Talent Pools
              </Link>
              <Link
                className="button secondary"
                href="/team-builder"
              >
                Team Builder
              </Link>
            </div>
          </section>

          <aside className={styles.createPanel}>
            <div className={styles.createHeading}>
              <WorkspaceIcon size="lg" />
              <div>
                <span className="eyebrow">Create workspace</span>
                <h2>What kind of group are you creating?</h2>
              </div>
            </div>

            <p className={styles.createIntro}>
              You become the Workspace Owner automatically and can
              invite Team Leaders and Team Members.
            </p>

            {created && (
              <div className={styles.createdMessage}>
                <SuccessIcon size="md" />
                <div>
                  <strong>{created} created</strong>
                  <p>
                    You are now the Workspace Owner. Atlas will use the
                    recommended profile context for this workspace.
                  </p>
                </div>
              </div>
            )}

            <form className={styles.form} onSubmit={add}>
              <label>
                Workspace name
                <input
                  required
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder={selectedType.example}
                />
              </label>

              <fieldset>
                <legend>Workspace type</legend>

                <div className={styles.typeGrid}>
                  {workspaceTypes.map((option) => (
                    <label
                      className={`${styles.typeOption} ${
                        type === option.value
                          ? styles.selected
                          : ""
                      }`}
                      key={option.value}
                    >
                      <input
                        checked={type === option.value}
                        name="workspace-type"
                        onChange={() => setType(option.value)}
                        type="radio"
                      />

                      <WorkspaceTypeIcon
                        type={option.value}
                        size="md"
                      />

                      <div>
                        <strong>{option.title}</strong>
                        <small>{option.description}</small>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className={styles.atlasDefault}>
                <span className="eyebrow">
                  Recommended Atlas Profile
                </span>
                <div>
                  <WorkspaceTypeIcon type={type} size="md" />
                  <div>
                    <strong>
                      {contextName(
                        defaultContextForWorkspace(type),
                      )}
                    </strong>
                    <p>
                      Members will be guided to this profile first.
                      They can still create other contextual profiles.
                    </p>
                  </div>
                </div>
              </div>

              <label>
                Description
                <textarea
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder={`Describe the ${selectedType.title.toLowerCase()}, its members and the teams or groups you expect to create.`}
                />
                <small>
                  Explain who the workspace is for and what outcomes
                  its members are working towards.
                </small>
              </label>

              <button className="button" type="submit">
                Create Workspace and Become Owner
              </button>
            </form>

            <div className={styles.nextSteps}>
              <WorkspaceIcon size="md" />
              <div>
                <strong>What happens next?</strong>
                <ol>
                  <li>You become Workspace Owner.</li>
                  <li>You invite people and assign their roles.</li>
                  <li>
                    Members complete the recommended Atlas Profile and
                    give consent.
                  </li>
                  <li>
                    Team Leaders build teams from eligible members.
                  </li>
                  <li>Atlas calculates the combined Team DNA.</li>
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function WorkspaceTypeIcon({
  type,
  size,
}: {
  type: WorkspaceType;
  size: "md" | "lg";
}) {
  if (type === "organisation") {
    return <BusinessIcon size={size} />;
  }

  if (type === "community") {
    return <CommunityIcon size={size} />;
  }

  if (type === "sports") {
    return <SportsIcon size={size} />;
  }

  if (type === "education") {
    return <EducationIcon size={size} />;
  }

  return <FriendshipIcon size={size} />;
}

function contextName(
  context:
    | "business"
    | "community"
    | "sports"
    | "education"
    | "friendship",
): string {
  return {
    business: "Business Atlas Profile",
    community: "Community Atlas Profile",
    sports: "Sports Atlas Profile",
    education: "Education Atlas Profile",
    friendship: "Friendship Atlas Profile",
  }[context];
}
