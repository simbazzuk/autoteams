"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AtlasIcon,
  BusinessIcon,
  PeopleIcon,
  PersonalGroupIcon,
  SuccessIcon,
  TalentPoolIcon,
  WorkspaceIcon,
} from "@/components/ui/AppIcons";
import { createOwnedWorkspace } from "@/lib/access-bootstrap";
import {
  Workspace,
  loadActiveWorkspaceId,
  loadPeople,
  loadWorkspaces,
  saveActiveWorkspaceId,
} from "@/lib/workspaces";
import { useWorkspaceAccess } from "@/components/access/AccessContext";
import { roleLabel } from "@/lib/workspace-access";

export function WorkspacesPanel() {
  const [items, setItems] = useState<Workspace[]>([]);
  const [active, setActive] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState<"personal" | "organisation">("organisation");
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

  return (
    <main className="v10-workspace-page">
      <section className="v10-workspace-hero">
        <div className="container">
          <span className="eyebrow">AutoTeams v10.0</span>
          <h1>Create a workspace and become its Owner automatically.</h1>
          <p>
            New users no longer choose or simulate a role. The person who creates
            a workspace becomes its Owner; everyone else joins through an
            invitation with the role assigned by the Owner or Administrator.
          </p>
        </div>
      </section>

      <section className="v10-workspace-body">
        <div className="container v10-workspace-layout">
          <section className="v10-workspace-list-panel">
            <div className="v10-workspace-heading">
              <div>
                <span className="eyebrow">Your workspaces</span>
                <h2>Select where you are working.</h2>
                <p>
                  Team Builder, People and Talent Pools always remain inside the
                  active workspace.
                </p>
              </div>
              <span>{items.length}</span>
            </div>

            <div className="v10-workspace-grid">
              {items.map((workspace) => {
                const count = people.filter(
                  (person) => person.workspaceId === workspace.id,
                ).length;
                const isActive = workspace.id === active;

                return (
                  <article
                    className={
                      isActive
                        ? "v10-workspace-card active"
                        : "v10-workspace-card"
                    }
                    key={workspace.id}
                  >
                    <div className="v10-workspace-card-top">
                      {workspace.type === "organisation" ? (
                        <BusinessIcon size="lg" />
                      ) : (
                        <PersonalGroupIcon size="lg" />
                      )}
                      <em>
                        {workspace.type === "organisation"
                          ? "Organisation"
                          : "Personal group"}
                      </em>
                    </div>

                    <h3>{workspace.name}</h3>
                    <p>{workspace.description}</p>

                    <div className="v10-workspace-card-meta">
                      <span>{count} people</span>
                      {isActive && access.role && (
                        <span>{roleLabel(access.role, "business")}</span>
                      )}
                    </div>

                    <button
                      className={isActive ? "button secondary" : "button"}
                      onClick={() => choose(workspace.id)}
                      type="button"
                    >
                      {isActive ? "Active workspace" : "Use workspace"}
                    </button>
                  </article>
                );
              })}
            </div>

            <div className="v10-workspace-actions">
              <Link className="button" href="/members">
                Invite Members
              </Link>
              <Link className="button secondary" href="/people">
                Manage People
              </Link>
              <Link className="button secondary" href="/talent-pools">
                Talent Pools
              </Link>
              <Link className="button secondary" href="/team-builder">
                Team Builder
              </Link>
            </div>
          </section>

          <aside className="v10-create-panel">
            <div className="v10-create-heading">
              <WorkspaceIcon size="lg" />
              <div>
                <span className="eyebrow">Create workspace</span>
                <h2>Start a company or personal group.</h2>
              </div>
            </div>

            <p className="v10-create-intro">
              You will automatically become the Workspace Owner and can then
              invite Team Leaders and Team Members.
            </p>

            {created && (
              <div className="v10-created-message">
                <SuccessIcon size="md" />
                <div>
                  <strong>{created} created</strong>
                  <p>You are now the Workspace Owner.</p>
                </div>
              </div>
            )}

            <form className="v10-create-form" onSubmit={add}>
              <label>
                Workspace name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder={
                    type === "organisation"
                      ? "Example Company"
                      : "Weekend Hiking Group"
                  }
                />
              </label>

              <fieldset>
                <legend>Workspace type</legend>

                <label
                  className={
                    type === "organisation"
                      ? "v10-type-option selected"
                      : "v10-type-option"
                  }
                >
                  <input
                    type="radio"
                    name="workspace-type"
                    checked={type === "organisation"}
                    onChange={() => setType("organisation")}
                  />
                  <BusinessIcon size="md" />
                  <div>
                    <strong>Organisation</strong>
                    <small>
                      Employees, departments, Team Leaders and company teams.
                    </small>
                  </div>
                </label>

                <label
                  className={
                    type === "personal"
                      ? "v10-type-option selected"
                      : "v10-type-option"
                  }
                >
                  <input
                    type="radio"
                    name="workspace-type"
                    checked={type === "personal"}
                    onChange={() => setType("personal")}
                  />
                  <PersonalGroupIcon size="md" />
                  <div>
                    <strong>Personal or friendship group</strong>
                    <small>
                      Friends, community members, activities and social groups.
                    </small>
                  </div>
                </label>
              </fieldset>

              <label>
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={
                    type === "organisation"
                      ? "Describe the company, department or programme."
                      : "Describe the friendship, community or activity group."
                  }
                />
                <small>
                  Explain who the workspace is for and what teams or groups you
                  expect to create.
                </small>
              </label>

              <button className="button v10-create-button" type="submit">
                Create Workspace and Become Owner
              </button>
            </form>

            <div className="v10-owner-explanation">
              <WorkspaceIcon size="md" />
              <div>
                <strong>What happens next?</strong>
                <ol>
                  <li>You become Workspace Owner.</li>
                  <li>You invite people and assign their roles.</li>
                  <li>Members complete their Atlas Profile and give consent.</li>
                  <li>Team Leaders build teams from eligible members.</li>
                </ol>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
