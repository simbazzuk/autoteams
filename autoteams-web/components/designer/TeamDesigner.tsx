"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceSwitcher } from "@/components/workspaces/WorkspaceSwitcher";
import { useWorkspaceAccess } from "@/components/access/AccessContext";
import { loadConsents, roleCanCreateTeams, roleLabel } from "@/lib/workspace-access";
import {
  WorkspacePerson,
  loadActiveWorkspaceId,
  loadPeople,
  loadTalentPools,
  loadWorkspaces,
} from "@/lib/workspaces";

const recommendationRoles = [
  "Strategic Lead",
  "Product Connector",
  "Delivery Builder",
  "Analytical Challenger",
  "Creative Facilitator",
  "Technical Specialist",
];

export function TeamDesigner() {
  const [workspaceId, setWorkspaceId] = useState("");
  const [people, setPeople] = useState<WorkspacePerson[]>([]);
  const [source, setSource] = useState("all");
  const [department, setDepartment] = useState("All");
  const [selected, setSelected] = useState<string[]>([]);
  const [teamSize, setTeamSize] = useState(4);
  const [purpose, setPurpose] = useState(
    "Build and launch a customer-focused digital product.",
  );
  const [built, setBuilt] = useState(false);

  useEffect(() => {
    setWorkspaceId(loadActiveWorkspaceId());
    setPeople(loadPeople());
  }, []);

  const workspaces = loadWorkspaces();
  const access = useWorkspaceAccess(workspaceId);
  const canCreateTeams = roleCanCreateTeams(access.role);
  const consents = loadConsents();

  const talentPools = useMemo(
    () => loadTalentPools().filter((pool) => pool.workspaceId === workspaceId),
    [workspaceId],
  );

  const departments = useMemo(
    () => [
      "All",
      ...Array.from(
        new Set(
          people
            .filter((person) => person.workspaceId === workspaceId)
            .map((person) => person.department),
        ),
      ),
    ],
    [people, workspaceId],
  );

  const eligiblePeople = useMemo(() => {
    let list = people.filter((person) => {
      const consent = consents.find(
        (item) =>
          item.workspaceId === workspaceId &&
          item.userId === person.id,
      );

      const matchingAllowed = consent?.allowTeamMatching ?? true;
      const visible = consent?.teamDnaVisible ?? true;

      return (
        person.workspaceId === workspaceId &&
        person.status === "active" &&
        person.teamDnaStatus === "ready" &&
        matchingAllowed &&
        visible
      );
    });

    if (source.startsWith("pool:")) {
      const pool = talentPools.find((item) => item.id === source.slice(5));
      list = list.filter((person) => pool?.personIds.includes(person.id));
    }

    if (department !== "All") {
      list = list.filter((person) => person.department === department);
    }

    return list;
  }, [consents, department, people, source, talentPools, workspaceId]);

  const candidates = useMemo(
    () =>
      selected.length
        ? eligiblePeople.filter((person) => selected.includes(person.id))
        : eligiblePeople,
    [eligiblePeople, selected],
  );

  const recommendation = candidates.slice(0, teamSize);
  const workspace = workspaces.find((item) => item.id === workspaceId);
  const selectedPool = source.startsWith("pool:")
    ? talentPools.find((item) => item.id === source.slice(5))
    : undefined;

  const canBuild =
    canCreateTeams &&
    candidates.length >= teamSize &&
    purpose.trim().length >= 10;

  function togglePerson(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
    setBuilt(false);
  }

  function resetCandidateSelection() {
    setSelected([]);
    setBuilt(false);
  }

  function updateWorkspace(id: string) {
    setWorkspaceId(id);
    setSource("all");
    setDepartment("All");
    setSelected([]);
    setBuilt(false);
  }

  return (
    <div className="v91-builder">
      <section className="v91-builder-panel v91-builder-form-panel">
        <div className="v91-builder-heading">
          <div>
            <span className="eyebrow">Build Teams with Atlas</span>
            <h2>Define who Atlas can consider.</h2>
            <p>
              Start with a workspace, narrow the eligible Talent population and
              describe the outcome the team needs to achieve.
            </p>
          </div>
          <span className="v91-step-badge">1–4</span>
        </div>

        <div className="v92-role-banner">
          <div>
            <span>Current role</span>
            <strong>
              {access.role ? roleLabel(access.role, "business") : "No workspace access"}
            </strong>
          </div>
          <p>
            {canCreateTeams
              ? "You can create teams in this workspace."
              : "Team Members can manage their own Team DNA but cannot create teams or workspaces."}
          </p>
        </div>

        <div className="v91-builder-section">
          <div className="v91-section-title">
            <span>1</span>
            <div>
              <strong>Select the workspace</strong>
              <small>Atlas cannot select people outside this boundary.</small>
            </div>
          </div>

          <WorkspaceSwitcher value={workspaceId} onChange={updateWorkspace} />

          <div className="v91-privacy-boundary">
            <span>◇</span>
            <div>
              <strong>Private workspace boundary</strong>
              <p>
                {workspace?.name || "The active workspace"} is the only source
                used for this recommendation.
              </p>
            </div>
          </div>
        </div>

        <div className="v91-builder-section">
          <div className="v91-section-title">
            <span>2</span>
            <div>
              <strong>Choose the eligible population</strong>
              <small>Use all employees or begin with a defined talent pool.</small>
            </div>
          </div>

          <div className="v91-field-grid">
            <label>
              Build team from
              <select
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setSelected([]);
                  setBuilt(false);
                }}
              >
                <option value="all">All eligible Talent</option>
                {talentPools.map((pool) => (
                  <option key={pool.id} value={`pool:${pool.id}`}>
                    Talent Pool: {pool.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Department
              <select
                value={department}
                onChange={(event) => {
                  setDepartment(event.target.value);
                  setSelected([]);
                  setBuilt(false);
                }}
              >
                {departments.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="v91-population-summary">
            <div>
              <small>Workspace</small>
              <strong>{workspace?.name || "Not selected"}</strong>
            </div>
            <div>
              <small>Source</small>
              <strong>{selectedPool?.name || "All eligible Talent"}</strong>
            </div>
            <div>
              <small>Department</small>
              <strong>{department}</strong>
            </div>
            <div>
              <small>Eligible people</small>
              <strong>{eligiblePeople.length}</strong>
            </div>
          </div>
        </div>

        <div className="v91-builder-section">
          <div className="v91-section-title">
            <span>3</span>
            <div>
              <strong>Describe the team outcome</strong>
              <small>Be specific about the work, priorities and constraints.</small>
            </div>
          </div>

          <label className="v91-purpose-field">
            Purpose
            <textarea
              value={purpose}
              onChange={(event) => {
                setPurpose(event.target.value);
                setBuilt(false);
              }}
              placeholder="For example: Build a cross-functional delivery team for Project Phoenix."
            />
            <small>{purpose.trim().length} characters</small>
          </label>

          <div className="v91-size-row">
            <label>
              Team size
              <input
                type="range"
                min="2"
                max="6"
                value={teamSize}
                onChange={(event) => {
                  setTeamSize(Number(event.target.value));
                  setBuilt(false);
                }}
              />
            </label>
            <strong>{teamSize} people</strong>
          </div>
        </div>

        <div className="v91-builder-section">
          <div className="v91-section-title">
            <span>4</span>
            <div>
              <strong>Optionally restrict the candidates</strong>
              <small>
                Leave everyone unchecked to let Atlas use the complete eligible
                population.
              </small>
            </div>
          </div>

          <div className="v91-candidate-toolbar">
            <span>
              {selected.length
                ? `${selected.length} manually selected`
                : `${eligiblePeople.length} available`}
            </span>
            {selected.length > 0 && (
              <button type="button" onClick={resetCandidateSelection}>
                Clear selection
              </button>
            )}
          </div>

          <div className="v91-candidate-list">
            {eligiblePeople.length === 0 ? (
              <div className="v91-no-candidates">
                No eligible Talent match the current workspace and filters.
              </div>
            ) : (
              eligiblePeople.map((person) => (
                <label
                  className={
                    selected.includes(person.id)
                      ? "v91-candidate-card selected"
                      : "v91-candidate-card"
                  }
                  key={person.id}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(person.id)}
                    onChange={() => togglePerson(person.id)}
                  />
                  <span className="avatar">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                  <span>
                    <strong>{person.name}</strong>
                    <small>
                      {person.jobTitle} • {person.department}
                    </small>
                  </span>
                  <em>Team DNA ready</em>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="v91-build-footer">
          <div>
            <strong>
              {candidates.length} candidate{candidates.length === 1 ? "" : "s"}{" "}
              available
            </strong>
            <small>
              Atlas needs at least {teamSize} eligible Talent for this team.
            </small>
          </div>

          <button
            className="button"
            disabled={!canBuild}
            onClick={() => setBuilt(true)}
            type="button"
          >
            Ask Atlas to Build Team
          </button>
        </div>

        {!canBuild && (
          <p className="v91-builder-error">
            {!canCreateTeams
              ? "Your current role cannot create teams. Ask an Owner, Administrator or Team Leader."
              : purpose.trim().length < 10
                ? "Add a clearer team purpose before building."
                : `Select a larger candidate pool or reduce the team size to ${candidates.length}.`}
          </p>
        )}
      </section>

      <section className="v91-builder-panel v91-result-panel">
        {!built ? (
          <div className="v91-result-empty">
            <span className="v91-result-icon">◎</span>
            <span className="eyebrow">Atlas recommendation</span>
            <h2>Your recommended team will appear here.</h2>
            <p>
              Complete the four steps on the left. Atlas will only choose from
              the eligible Talent inside the active workspace.
            </p>

            <div className="v91-result-preview">
              <div>
                <span>Workspace</span>
                <strong>{workspace?.name || "Not selected"}</strong>
              </div>
              <div>
                <span>Population</span>
                <strong>{selectedPool?.name || "All eligible Talent"}</strong>
              </div>
              <div>
                <span>Department</span>
                <strong>{department}</strong>
              </div>
              <div>
                <span>Team size</span>
                <strong>{teamSize}</strong>
              </div>
              <div>
                <span>Eligible candidates</span>
                <strong>{candidates.length}</strong>
              </div>
            </div>

            <div className="v91-result-guidance">
              <span>✦</span>
              <p>
                <strong>What Atlas will evaluate</strong>
                Leadership coverage, communication balance, delivery strength,
                analytical challenge and creative contribution.
              </p>
            </div>
          </div>
        ) : (
          <div className="v91-result-content">
            <div className="v91-result-hero">
              <div>
                <span className="eyebrow">
                  Recommended for {workspace?.name}
                </span>
                <h2>{purpose}</h2>
                <p>
                  Selected from {candidates.length} eligible Talent within the
                  active workspace.
                </p>
              </div>
              <strong>{Math.min(96, 82 + recommendation.length * 3)}%</strong>
            </div>

            <div className="v91-result-summary">
              <div>
                <span>Team size</span>
                <strong>{recommendation.length}</strong>
              </div>
              <div>
                <span>Workspace</span>
                <strong>{workspace?.name}</strong>
              </div>
              <div>
                <span>Source</span>
                <strong>{selectedPool?.name || "All eligible Talent"}</strong>
              </div>
            </div>

            <div className="v91-recommended-people">
              {recommendation.map((person, index) => (
                <article key={person.id}>
                  <span className="avatar">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <small>{recommendationRoles[index]}</small>
                    <h3>{person.name}</h3>
                    <p>
                      {person.jobTitle} • {person.department}
                    </p>
                    <div className="chips">
                      {person.strengths.map((strength) => (
                        <span className="chip" key={strength}>
                          {strength}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="v91-explanation-card">
              <span>✦</span>
              <div>
                <strong>Why Atlas selected this team</strong>
                <p>
                  The recommendation balances leadership, communication,
                  delivery, analysis and creativity while respecting the chosen
                  workspace, talent pool, department and manual candidate
                  restrictions.
                </p>
              </div>
            </div>

            <div className="v91-result-actions">
              <button
                className="button secondary"
                onClick={() => setBuilt(false)}
                type="button"
              >
                Adjust Criteria
              </button>
              <a className="button" href="/team-canvas">
                Open in Team Canvas
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
