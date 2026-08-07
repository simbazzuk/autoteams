"use client";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createOwnedWorkspace } from "@/lib/access-bootstrap";
import {
  TalentPool,
  Workspace,
  WorkspacePerson,
  WorkspaceType,
  createWorkspaceId,
  loadActiveWorkspaceId,
  loadPeople,
  loadTalentPools,
  loadWorkspaces,
  saveActiveWorkspaceId,
  savePeople,
  saveWorkspaces,
  workspaceTypeLabel,
} from "@/lib/workspaces";
import { ProductIcon } from "@/components/ui/ProductIcon";
import styles from "./MyGroupDashboard.module.css";

type Tab =
  | "overview"
  | "people"
  | "invitations"
  | "saved-groups"
  | "settings";

type FriendlyWorkspaceType = Exclude<WorkspaceType, "personal">;

type GroupInvitation = {
  id: string;
  workspaceId: string;
  email: string;
  role: "member" | "team-leader" | "administrator";
  status: "pending" | "accepted" | "cancelled";
  createdAt: string;
};

const INVITATION_KEY = "autoteams-v20-group-invitations";

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

export function MyGroupDashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [pools, setPools] = useState<TalentPool[]>([]);
  const [invitations, setInvitations] = useState<GroupInvitation[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState("");
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  const [groupName, setGroupName] = useState("");
  const [groupType, setGroupType] =
    useState<FriendlyWorkspaceType>("organisation");
  const [groupDescription, setGroupDescription] = useState("");

  const [personName, setPersonName] = useState("");
  const [personEmail, setPersonEmail] = useState("");
  const [personRole, setPersonRole] = useState("");
  const [personDepartment, setPersonDepartment] =
    useState("General");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] =
    useState<GroupInvitation["role"]>("member");

  const [settingsName, setSettingsName] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");

  useEffect(() => {
    refresh();
  }, []);

  const activeWorkspace = workspaces.find(
    (workspace) => workspace.id === activeWorkspaceId,
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

  const inactivePeople = useMemo(
    () =>
      people.filter(
        (person) =>
          person.workspaceId === activeWorkspaceId &&
          person.status === "inactive",
      ),
    [people, activeWorkspaceId],
  );

  const activePools = useMemo(
    () =>
      pools.filter(
        (pool) => pool.workspaceId === activeWorkspaceId,
      ),
    [pools, activeWorkspaceId],
  );

  const activeInvitations = useMemo(
    () =>
      invitations.filter(
        (invitation) =>
          invitation.workspaceId === activeWorkspaceId &&
          invitation.status !== "cancelled",
      ),
    [invitations, activeWorkspaceId],
  );

  const departments = useMemo(
    () =>
      Array.from(
        new Set(
          activePeople
            .map((person) => person.department)
            .filter(Boolean),
        ),
      ).sort(),
    [activePeople],
  );

  function refresh() {
    const loadedWorkspaces = loadWorkspaces();
    const activeId = loadActiveWorkspaceId();

    setWorkspaces(loadedWorkspaces);
    setPeople(loadPeople());
    setPools(loadTalentPools());
    setInvitations(loadInvitations());
    setActiveWorkspaceId(activeId);

    const active = loadedWorkspaces.find(
      (workspace) => workspace.id === activeId,
    );

    setSettingsName(active?.name || "");
    setSettingsDescription(active?.description || "");
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
    setMessage(`${created.name} is now your active group.`);
    refresh();
  }

  function changeGroup(id: string) {
    saveActiveWorkspaceId(id);
    setActiveWorkspaceId(id);

    const selected = workspaces.find(
      (workspace) => workspace.id === id,
    );

    setSettingsName(selected?.name || "");
    setSettingsDescription(selected?.description || "");
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
      department: personDepartment.trim() || "General",
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

  function deactivatePerson(id: string) {
    const updated = people.map((person) =>
      person.id === id
        ? { ...person, status: "inactive" as const }
        : person,
    );

    savePeople(updated);
    setPeople(updated);
  }

  function reactivatePerson(id: string) {
    const updated = people.map((person) =>
      person.id === id
        ? { ...person, status: "active" as const }
        : person,
    );

    savePeople(updated);
    setPeople(updated);
  }

  function sendInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeWorkspace) return;

    const invitation: GroupInvitation = {
      id: createWorkspaceId("invite"),
      workspaceId: activeWorkspace.id,
      email: inviteEmail.trim(),
      role: inviteRole,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const updated = [...invitations, invitation];

    saveInvitations(updated);
    setInvitations(updated);
    setInviteEmail("");
    setInviteRole("member");
    setMessage(`Invitation prepared for ${invitation.email}.`);
  }

  function cancelInvitation(id: string) {
    const updated = invitations.map((invitation) =>
      invitation.id === id
        ? { ...invitation, status: "cancelled" as const }
        : invitation,
    );

    saveInvitations(updated);
    setInvitations(updated);
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!activeWorkspace) return;

    const updated = workspaces.map((workspace) =>
      workspace.id === activeWorkspace.id
        ? {
            ...workspace,
            name: settingsName.trim(),
            description: settingsDescription.trim(),
          }
        : workspace,
    );

    saveWorkspaces(updated);
    setWorkspaces(updated);
    setMessage("Group settings were updated.");
  }

  if (!ready) {
    return (
      <section className={styles.loading}>
        Preparing My Group…
      </section>
    );
  }

  if (!activeWorkspace) {
    return (
      <main className={styles.page}>
        <section className={styles.hero}>
          <div className="container">
            <span className="eyebrow">My Group</span>
            <h1>Create the place where your people collaborate.</h1>
            <p>
              A group can be a company, community, sports club,
              education group, friends or family.
            </p>
          </div>
        </section>

        <section className={styles.body}>
          <div className="container">
            <CreateGroupPanel
              groupName={groupName}
              groupType={groupType}
              groupDescription={groupDescription}
              setGroupName={setGroupName}
              setGroupType={setGroupType}
              setGroupDescription={setGroupDescription}
              onSubmit={createGroup}
              workspaces={workspaces}
              onChoose={changeGroup}
            />
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">My Group</span>
            <h1>{activeWorkspace.name}</h1>
            <p>
              Manage the people, invitations and saved groups used
              when creating teams.
            </p>
          </div>

          <aside className={styles.groupCard}>
            <ProductIcon label="Current group" size="lg">
              {groupIcon(activeWorkspace.type)}
            </ProductIcon>

            <div>
              <small>Current group</small>
              <strong>
                {workspaceTypeLabel(activeWorkspace.type)}
              </strong>
              <p>
                {activePeople.length} active{" "}
                {activePeople.length === 1 ? "person" : "people"}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className="container">
          {message && (
            <div className={styles.message}>{message}</div>
          )}

          <section className={styles.groupSwitcher}>
            <div>
              <span className="eyebrow">Current group</span>
              <strong>{activeWorkspace.name}</strong>
            </div>

            <label>
              Change group
              <select
                value={activeWorkspaceId}
                onChange={(event) =>
                  changeGroup(event.target.value)
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

            <button
              className="button secondary"
              onClick={() => setTab("settings")}
              type="button"
            >
              Group Settings
            </button>
          </section>

          <nav
            className={styles.tabs}
            aria-label="Group management"
          >
            <TabButton
              active={tab === "overview"}
              label="Overview"
              onClick={() => setTab("overview")}
            />
            <TabButton
              active={tab === "people"}
              label={`People (${activePeople.length})`}
              onClick={() => setTab("people")}
            />
            <TabButton
              active={tab === "invitations"}
              label={`Invitations (${activeInvitations.length})`}
              onClick={() => setTab("invitations")}
            />
            <TabButton
              active={tab === "saved-groups"}
              label={`Saved Groups (${activePools.length})`}
              onClick={() => setTab("saved-groups")}
            />
            <TabButton
              active={tab === "settings"}
              label="Settings"
              onClick={() => setTab("settings")}
            />
          </nav>

          {tab === "overview" && (
            <OverviewTab
              workspace={activeWorkspace}
              people={activePeople}
              invitations={activeInvitations}
              pools={activePools}
              departments={departments}
              onOpenPeople={() => setTab("people")}
              onOpenInvitations={() => setTab("invitations")}
              onOpenPools={() => setTab("saved-groups")}
            />
          )}

          {tab === "people" && (
            <PeopleTab
              people={activePeople}
              inactivePeople={inactivePeople}
              personName={personName}
              personEmail={personEmail}
              personRole={personRole}
              personDepartment={personDepartment}
              setPersonName={setPersonName}
              setPersonEmail={setPersonEmail}
              setPersonRole={setPersonRole}
              setPersonDepartment={setPersonDepartment}
              onSubmit={addPerson}
              onDeactivate={deactivatePerson}
              onReactivate={reactivatePerson}
            />
          )}

          {tab === "invitations" && (
            <InvitationsTab
              invitations={activeInvitations}
              inviteEmail={inviteEmail}
              inviteRole={inviteRole}
              setInviteEmail={setInviteEmail}
              setInviteRole={setInviteRole}
              onSubmit={sendInvitation}
              onCancel={cancelInvitation}
            />
          )}

          {tab === "saved-groups" && (
            <SavedGroupsTab
              pools={activePools}
              people={activePeople}
            />
          )}

          {tab === "settings" && (
            <SettingsTab
              workspace={activeWorkspace}
              settingsName={settingsName}
              settingsDescription={settingsDescription}
              setSettingsName={setSettingsName}
              setSettingsDescription={setSettingsDescription}
              onSubmit={saveSettings}
              workspaces={workspaces}
              groupName={groupName}
              groupType={groupType}
              groupDescription={groupDescription}
              setGroupName={setGroupName}
              setGroupType={setGroupType}
              setGroupDescription={setGroupDescription}
              onCreate={createGroup}
            />
          )}
        </div>
      </section>
    </main>
  );
}

function OverviewTab({
  workspace,
  people,
  invitations,
  pools,
  departments,
  onOpenPeople,
  onOpenInvitations,
  onOpenPools,
}: {
  workspace: Workspace;
  people: WorkspacePerson[];
  invitations: GroupInvitation[];
  pools: TalentPool[];
  departments: string[];
  onOpenPeople: () => void;
  onOpenInvitations: () => void;
  onOpenPools: () => void;
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeading}>
        <div>
          <span className="eyebrow">Overview</span>
          <h2>Everything needed to build teams.</h2>
          <p>
            This page brings group setup and people management into one
            place.
          </p>
        </div>

        <Link className="button" href="/team-builder">
          Build a Team →
        </Link>
      </div>

      <div className={styles.metrics}>
        <MetricCard
          icon="♙"
          label="Active people"
          value={people.length}
          action="Manage"
          onClick={onOpenPeople}
        />
        <MetricCard
          icon="↗"
          label="Pending invitations"
          value={invitations.filter(
            (invitation) => invitation.status === "pending",
          ).length}
          action="Review"
          onClick={onOpenInvitations}
        />
        <MetricCard
          icon="◎"
          label="Saved people groups"
          value={pools.length}
          action="Open"
          onClick={onOpenPools}
        />
        <MetricCard
          icon="▤"
          label="Departments or areas"
          value={departments.length}
          action="View people"
          onClick={onOpenPeople}
        />
      </div>

      <div className={styles.overviewGrid}>
        <article className={styles.infoCard}>
          <ProductIcon label="Group details" size="md">
            ◇
          </ProductIcon>
          <div>
            <span className="eyebrow">Group details</span>
            <h3>{workspace.name}</h3>
            <p>{workspace.description || "No description added."}</p>
            <small>{workspaceTypeLabel(workspace.type)}</small>
          </div>
        </article>

        <article className={styles.infoCard}>
          <ProductIcon label="Next action" size="md">
            ✦
          </ProductIcon>
          <div>
            <span className="eyebrow">Recommended next action</span>
            <h3>
              {people.length > 0
                ? "Build your next team."
                : "Add your first people."}
            </h3>
            <p>
              {people.length > 0
                ? `${people.length} people are currently available to Team Builder.`
                : "Team Builder needs at least one active person."}
            </p>
            <Link
              href={people.length > 0 ? "/team-builder" : "#"}
              onClick={
                people.length > 0
                  ? undefined
                  : (event) => {
                      event.preventDefault();
                      onOpenPeople();
                    }
              }
            >
              {people.length > 0
                ? "Open Team Builder →"
                : "Add People →"}
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

function PeopleTab({
  people,
  inactivePeople,
  personName,
  personEmail,
  personRole,
  personDepartment,
  setPersonName,
  setPersonEmail,
  setPersonRole,
  setPersonDepartment,
  onSubmit,
  onDeactivate,
  onReactivate,
}: {
  people: WorkspacePerson[];
  inactivePeople: WorkspacePerson[];
  personName: string;
  personEmail: string;
  personRole: string;
  personDepartment: string;
  setPersonName: (value: string) => void;
  setPersonEmail: (value: string) => void;
  setPersonRole: (value: string) => void;
  setPersonDepartment: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDeactivate: (id: string) => void;
  onReactivate: (id: string) => void;
}) {
  return (
    <section className={styles.twoColumns}>
      <article className={styles.panel}>
        <div className={styles.sectionHeading}>
          <div>
            <span className="eyebrow">People</span>
            <h2>{people.length} active people</h2>
            <p>
              These are the people AutoTeams may consider when building
              teams.
            </p>
          </div>
        </div>

        {people.length > 0 ? (
          <div className={styles.peopleList}>
            {people.map((person) => (
              <article key={person.id}>
                <span className={styles.avatar}>
                  {person.name.charAt(0).toUpperCase()}
                </span>

                <div>
                  <strong>{person.name}</strong>
                  <small>
                    {person.jobTitle} · {person.department}
                  </small>
                  <em>{person.email}</em>
                </div>

                <button
                  onClick={() => onDeactivate(person.id)}
                  type="button"
                >
                  Deactivate
                </button>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No active people yet."
            text="Use the form to add the first person."
          />
        )}

        {inactivePeople.length > 0 && (
          <details className={styles.inactive}>
            <summary>
              Inactive people ({inactivePeople.length})
            </summary>

            <div>
              {inactivePeople.map((person) => (
                <article key={person.id}>
                  <div>
                    <strong>{person.name}</strong>
                    <small>{person.email}</small>
                  </div>

                  <button
                    onClick={() => onReactivate(person.id)}
                    type="button"
                  >
                    Reactivate
                  </button>
                </article>
              ))}
            </div>
          </details>
        )}
      </article>

      <aside className={styles.panel}>
        <span className="eyebrow">Add a person</span>
        <h2>Add someone directly.</h2>
        <p className={styles.panelIntro}>
          Direct addition is useful for development, demos and
          administrator-managed groups.
        </p>

        <form className={styles.form} onSubmit={onSubmit}>
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
            Department or area
            <input
              value={personDepartment}
              onChange={(event) =>
                setPersonDepartment(event.target.value)
              }
              placeholder="General"
            />
          </label>

          <button className="button" type="submit">
            Add Person
          </button>
        </form>
      </aside>
    </section>
  );
}

function InvitationsTab({
  invitations,
  inviteEmail,
  inviteRole,
  setInviteEmail,
  setInviteRole,
  onSubmit,
  onCancel,
}: {
  invitations: GroupInvitation[];
  inviteEmail: string;
  inviteRole: GroupInvitation["role"];
  setInviteEmail: (value: string) => void;
  setInviteRole: (value: GroupInvitation["role"]) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: (id: string) => void;
}) {
  return (
    <section className={styles.twoColumns}>
      <article className={styles.panel}>
        <div className={styles.sectionHeading}>
          <div>
            <span className="eyebrow">Invitations</span>
            <h2>Invite people to join.</h2>
            <p>
              Assign the access level they should receive when they
              accept.
            </p>
          </div>
        </div>

        {invitations.length > 0 ? (
          <div className={styles.inviteList}>
            {invitations.map((invitation) => (
              <article key={invitation.id}>
                <ProductIcon label="Invitation" size="sm" subtle>
                  ↗
                </ProductIcon>

                <div>
                  <strong>{invitation.email}</strong>
                  <small>
                    {invitationRoleLabel(invitation.role)} ·{" "}
                    {invitation.status}
                  </small>
                </div>

                {invitation.status === "pending" && (
                  <button
                    onClick={() => onCancel(invitation.id)}
                    type="button"
                  >
                    Cancel
                  </button>
                )}
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No invitations yet."
            text="Use the form to prepare the first invitation."
          />
        )}
      </article>

      <aside className={styles.panel}>
        <span className="eyebrow">New invitation</span>
        <h2>Invite by email.</h2>
        <p className={styles.panelIntro}>
          This prototype stores invitation state locally. Connect the
          send action to your email service when the backend is ready.
        </p>

        <form className={styles.form} onSubmit={onSubmit}>
          <label>
            Email address
            <input
              required
              type="email"
              value={inviteEmail}
              onChange={(event) =>
                setInviteEmail(event.target.value)
              }
              placeholder="person@example.com"
            />
          </label>

          <label>
            Group role
            <select
              value={inviteRole}
              onChange={(event) =>
                setInviteRole(
                  event.target.value as GroupInvitation["role"],
                )
              }
            >
              <option value="member">Member</option>
              <option value="team-leader">Team Leader</option>
              <option value="administrator">Administrator</option>
            </select>
          </label>

          <button className="button" type="submit">
            Prepare Invitation
          </button>
        </form>
      </aside>
    </section>
  );
}

function SavedGroupsTab({
  pools,
  people,
}: {
  pools: TalentPool[];
  people: WorkspacePerson[];
}) {
  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeading}>
        <div>
          <span className="eyebrow">Saved People Groups</span>
          <h2>Reusable groups of people.</h2>
          <p>
            These can represent departments, project populations or
            specialist groups used by Team Builder.
          </p>
        </div>

        <Link className="button" href="/talent-pools">
          Manage Saved Groups
        </Link>
      </div>

      {pools.length > 0 ? (
        <div className={styles.poolGrid}>
          {pools.map((pool) => (
            <article key={pool.id}>
              <ProductIcon label="Saved people group" size="md">
                ◎
              </ProductIcon>

              <h3>{pool.name}</h3>
              <p>{pool.description}</p>
              <small>{pool.personIds.length} people</small>

              <div>
                {pool.personIds.slice(0, 4).map((personId) => (
                  <span key={personId}>
                    {people.find(
                      (person) => person.id === personId,
                    )?.name || "Unknown person"}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No saved people groups yet."
          text="Create one when you need to reuse a particular population in Team Builder."
          action={
            <Link className="button" href="/talent-pools">
              Create Saved People Group
            </Link>
          }
        />
      )}
    </section>
  );
}

function SettingsTab({
  workspace,
  settingsName,
  settingsDescription,
  setSettingsName,
  setSettingsDescription,
  onSubmit,
  workspaces,
  groupName,
  groupType,
  groupDescription,
  setGroupName,
  setGroupType,
  setGroupDescription,
  onCreate,
}: {
  workspace: Workspace;
  settingsName: string;
  settingsDescription: string;
  setSettingsName: (value: string) => void;
  setSettingsDescription: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  workspaces: Workspace[];
  groupName: string;
  groupType: FriendlyWorkspaceType;
  groupDescription: string;
  setGroupName: (value: string) => void;
  setGroupType: (value: FriendlyWorkspaceType) => void;
  setGroupDescription: (value: string) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <section className={styles.twoColumns}>
      <article className={styles.panel}>
        <span className="eyebrow">Group settings</span>
        <h2>Update {workspace.name}.</h2>

        <form className={styles.form} onSubmit={onSubmit}>
          <label>
            Group name
            <input
              required
              value={settingsName}
              onChange={(event) =>
                setSettingsName(event.target.value)
              }
            />
          </label>

          <label>
            Description
            <textarea
              value={settingsDescription}
              onChange={(event) =>
                setSettingsDescription(event.target.value)
              }
            />
          </label>

          <label>
            Group type
            <input
              disabled
              value={workspaceTypeLabel(workspace.type)}
            />
            <small>
              Group type is fixed in this phase to preserve existing
              profile and recommendation context.
            </small>
          </label>

          <button className="button" type="submit">
            Save Group Settings
          </button>
        </form>
      </article>

      <aside className={styles.panel}>
        <span className="eyebrow">Create another group</span>
        <h2>Manage more than one context.</h2>
        <p className={styles.panelIntro}>
          You currently have {workspaces.length}{" "}
          {workspaces.length === 1 ? "group" : "groups"}.
        </p>

        <form className={styles.form} onSubmit={onCreate}>
          <label>
            Group name
            <input
              required
              value={groupName}
              onChange={(event) =>
                setGroupName(event.target.value)
              }
              placeholder="Community Volunteers"
            />
          </label>

          <label>
            Group type
            <select
              value={groupType}
              onChange={(event) =>
                setGroupType(
                  event.target.value as FriendlyWorkspaceType,
                )
              }
            >
              {groupTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

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

          <button className="button secondary" type="submit">
            Create Another Group
          </button>
        </form>
      </aside>
    </section>
  );
}

function CreateGroupPanel({
  groupName,
  groupType,
  groupDescription,
  setGroupName,
  setGroupType,
  setGroupDescription,
  onSubmit,
  workspaces,
  onChoose,
}: {
  groupName: string;
  groupType: FriendlyWorkspaceType;
  groupDescription: string;
  setGroupName: (value: string) => void;
  setGroupType: (value: FriendlyWorkspaceType) => void;
  setGroupDescription: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  workspaces: Workspace[];
  onChoose: (id: string) => void;
}) {
  return (
    <section className={styles.createPanel}>
      <article className={styles.panel}>
        <span className="eyebrow">Create My Group</span>
        <h2>Start with where people collaborate.</h2>

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
              {groupTypes.map((type) => (
                <label
                  className={
                    groupType === type.value
                      ? `${styles.typeOption} ${styles.selectedType}`
                      : styles.typeOption
                  }
                  key={type.value}
                >
                  <input
                    checked={groupType === type.value}
                    name="group-type"
                    onChange={() => setGroupType(type.value)}
                    type="radio"
                  />
                  <span>{type.icon}</span>
                  <strong>{type.label}</strong>
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
            Create My Group
          </button>
        </form>
      </article>

      {workspaces.length > 0 && (
        <aside className={styles.panel}>
          <span className="eyebrow">Existing groups</span>
          <h2>Select one instead.</h2>

          <div className={styles.existingGroups}>
            {workspaces.map((workspace) => (
              <button
                key={workspace.id}
                onClick={() => onChoose(workspace.id)}
                type="button"
              >
                <ProductIcon label={workspace.name} size="sm">
                  {groupIcon(workspace.type)}
                </ProductIcon>

                <div>
                  <strong>{workspace.name}</strong>
                  <small>
                    {workspaceTypeLabel(workspace.type)}
                  </small>
                </div>

                <span>Use →</span>
              </button>
            ))}
          </div>
        </aside>
      )}
    </section>
  );
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? styles.activeTab : ""}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function MetricCard({
  icon,
  label,
  value,
  action,
  onClick,
}: {
  icon: string;
  label: string;
  value: number;
  action: string;
  onClick: () => void;
}) {
  return (
    <button onClick={onClick} type="button">
      <ProductIcon label={label} size="sm" subtle>
        {icon}
      </ProductIcon>

      <div>
        <small>{label}</small>
        <strong>{value}</strong>
      </div>

      <span>{action} →</span>
    </button>
  );
}

function EmptyState({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className={styles.empty}>
      <ProductIcon label={title} size="md" subtle>
        ○
      </ProductIcon>
      <h3>{title}</h3>
      <p>{text}</p>
      {action}
    </div>
  );
}

function loadInvitations(): GroupInvitation[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(INVITATION_KEY);
    return raw ? (JSON.parse(raw) as GroupInvitation[]) : [];
  } catch {
    return [];
  }
}

function saveInvitations(
  invitations: GroupInvitation[],
): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(
    INVITATION_KEY,
    JSON.stringify(invitations),
  );
}

function invitationRoleLabel(
  role: GroupInvitation["role"],
): string {
  const labels: Record<GroupInvitation["role"], string> = {
    member: "Member",
    "team-leader": "Team Leader",
    administrator: "Administrator",
  };

  return labels[role];
}

function groupIcon(type: WorkspaceType): string {
  const icons: Record<WorkspaceType, string> = {
    organisation: "⌂",
    community: "♙",
    sports: "◎",
    education: "▤",
    friends_family: "♡",
    personal: "♡",
  };

  return icons[type];
}
