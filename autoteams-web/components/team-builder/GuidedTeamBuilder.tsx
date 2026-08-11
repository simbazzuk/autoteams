"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { filterCandidatesForRequirement } from "@/lib/team-builder/context-candidate-filter";
import { SportsTeamRequirements } from "@/components/team-builder/SportsTeamRequirements";
import { ContextAwareSkills } from "@/components/team-builder/ContextAwareSkills";

import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
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
import { ProductIcon } from "@/components/ui/ProductIcon";
import { requestTeamRecommendation } from "@/lib/ai/recommendation-client";
import { persistRecommendation } from "@/lib/firebase/recommendation-persistence";
import type { GeminiTeamRecommendation } from "@/lib/ai/recommendation-types";
import styles from "./GuidedTeamBuilder.module.css";

type FriendlyWorkspaceType = Exclude<
  WorkspaceType,
  "personal"
>;

type BuilderStep =
  | "group"
  | "people"
  | "requirement"
  | "recommendation"
  | "confirm";

type TeamRequirement = {
  name: string;
  purpose: string;
  size: number;
  skills: string[];
  location: string;
  workingStyle: string;
};

type RankedPerson = {
  person: WorkspacePerson;
  score: number;
  reasons: string[];
  concerns: string[];
};

type SavedTeam = {
  id: string;
  workspaceId: string;
  name: string;
  purpose: string;
  personIds: string[];
  createdAt: string;
  confidence: number;
  recommendation?: {
    source: "gemini" | "fallback";
    model?: string;
    summary: string;
    teamStrengths: string[];
    skillGaps: string[];
    risks: string[];
    responseTimeMs?: number;
    totalTokens?: number;
  };
};

const TEAM_KEY =
  "autoteams-v20-saved-teams";

const groupTypes: Array<{
  value: FriendlyWorkspaceType;
  label: string;
  icon: string;
}> = [
  {
    value: "organisation",
    label: "Organisation",
    icon: "âŒ‚",
  },
  {
    value: "community",
    label: "Community Group",
    icon: "â™™",
  },
  {
    value: "sports",
    label: "Sports Club",
    icon: "â—Ž",
  },
  {
    value: "education",
    label: "Education Group",
    icon: "â–¤",
  },
  {
    value: "friends_family",
    label: "Friends & Family",
    icon: "â™¡",
  },
];

const suggestedSkills = [
  "Leadership",
  "Communication",
  "Planning",
  "Delivery",
  "Problem solving",
  "Collaboration",
  "Organisation",
  "Adaptability",
];

export function GuidedTeamBuilder() {
  const [step, setStep] =
    useState<BuilderStep>("group");
  const [workspaces, setWorkspaces] =
    useState<Workspace[]>([]);
  const [people, setPeople] =
    useState<WorkspacePerson[]>([]);
  const [
    activeWorkspaceId,
    setActiveWorkspaceId,
  ] = useState("");
  const [
    selectedPeople,
    setSelectedPeople,
  ] = useState<string[]>([]);
  const [
    rankedPeople,
    setRankedPeople,
  ] = useState<RankedPerson[]>([]);
  const [finalPeople, setFinalPeople] =
    useState<string[]>([]);
  const [ready, setReady] =
    useState(false);
  const [message, setMessage] =
    useState("");

  // Gemini state
  const [aiResult, setAiResult] =
    useState<GeminiTeamRecommendation | null>(
      null,
    );
  const [isGenerating, setIsGenerating] =
    useState(false);
  const [
    generationError,
    setGenerationError,
  ] = useState("");

  const [groupName, setGroupName] =
    useState("");
  const [groupType, setGroupType] =
    useState<FriendlyWorkspaceType>(
      "organisation",
    );
  const [
    groupDescription,
    setGroupDescription,
  ] = useState("");

  const [personName, setPersonName] =
    useState("");
  const [personEmail, setPersonEmail] =
    useState("");
  const [personRole, setPersonRole] =
    useState("");
  const [
    personDepartment,
    setPersonDepartment,
  ] = useState("General");

  const [requirement, setRequirement] =
    useState<TeamRequirement>({
      name: "",
      purpose: "",
      size: 5,
      skills: [],
      location: "Any",
      workingStyle: "Balanced",
    });

  useEffect(() => {
    const loadedWorkspaces =
      loadWorkspaces();
    const activeId =
      loadActiveWorkspaceId();
    const loadedPeople = loadPeople();

    setWorkspaces(loadedWorkspaces);
    setPeople(loadedPeople);
    setActiveWorkspaceId(activeId);

    const activePeople =
      loadedPeople.filter(
        (person) =>
          person.workspaceId ===
            activeId &&
          person.status === "active",
      );

    if (
      !activeId ||
      !loadedWorkspaces.some(
        (item) => item.id === activeId,
      )
    ) {
      setStep("group");
    } else if (
      activePeople.length === 0
    ) {
      setStep("people");
    } else {
      setSelectedPeople(
        activePeople.map(
          (person) => person.id,
        ),
      );
      setStep("requirement");
    }

    setReady(true);
  }, []);

  const activeWorkspace =
    workspaces.find(
      (workspace) =>
        workspace.id === activeWorkspaceId,
    );

  const activePeople = useMemo(
    () =>
      people.filter(
        (person) =>
          person.workspaceId ===
            activeWorkspaceId &&
          person.status === "active",
      ),
    [people, activeWorkspaceId],
  );

  const candidatePeople =
    activePeople.filter((person) =>
      selectedPeople.includes(person.id),
    );

  /*
   * v7.13.8
   *
   * Do not restrict restored team members to activePeople here. During an
   * adjustment the team can have been persisted with a cloud workspace/context
   * identifier that is different from the browser-local workspace identifier.
   * finalPeople is normalised to local WorkspacePerson ids by the adjustment
   * loader below, so resolve from the full people collection.
   */
  const selectedTeam = finalPeople
    .map((id) =>
      people.find(
        (person) => person.id === id,
      ),
    )
    .filter(
      (
        person,
      ): person is WorkspacePerson =>
        Boolean(person),
    );

  const currentStepIndex =
    stepIndex(step);

  function createGroup(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const created =
      createOwnedWorkspace({
        name: groupName,
        type: groupType,
        description:
          groupDescription,
      });

    saveActiveWorkspaceId(created.id);
    setWorkspaces(loadWorkspaces());
    setActiveWorkspaceId(created.id);
    setGroupName("");
    setGroupDescription("");
    setMessage(
      `${created.name} is ready. Add people next.`,
    );
    setStep("people");
  }

  function chooseGroup(id: string) {
    saveActiveWorkspaceId(id);
    setActiveWorkspaceId(id);

    const groupPeople =
      people.filter(
        (person) =>
          person.workspaceId === id &&
          person.status === "active",
      );

    setSelectedPeople(
      groupPeople.map(
        (person) => person.id,
      ),
    );
    setMessage("");
    setAiResult(null);

    if (
      groupPeople.length === 0
    ) {
      setStep("people");
    } else {
      setStep("requirement");
    }
  }

  function addPerson(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!activeWorkspace) return;

    const person: WorkspacePerson = {
      id: createWorkspaceId("person"),
      workspaceId:
        activeWorkspace.id,
      name: personName.trim(),
      email: personEmail.trim(),
      department:
        personDepartment.trim() ||
        "General",
      jobTitle:
        personRole.trim() ||
        "Member",
      location: "Not specified",
      status: "active",
      teamDnaStatus:
        "not-started",
      strengths: [],
    };

    const updated = [
      ...people,
      person,
    ];

    savePeople(updated);
    setPeople(updated);
    setSelectedPeople(
      (current) => [
        ...current,
        person.id,
      ],
    );
    setPersonName("");
    setPersonEmail("");
    setPersonRole("");
    setMessage(
      `${person.name} was added.`,
    );
  }

  function addDemoPeople() {
    if (!activeWorkspace) return;

    const existingEmails =
      new Set(
        people.map((person) =>
          person.email.toLowerCase(),
        ),
      );

    const samples = demoPeople(
      activeWorkspace.type,
    )
      .filter(
        (person) =>
          !existingEmails.has(
            person.email.toLowerCase(),
          ),
      )
      .map<WorkspacePerson>(
        (person) => ({
          ...person,
          id: createWorkspaceId(
            "person",
          ),
          workspaceId:
            activeWorkspace.id,
          status: "active",
          teamDnaStatus: "ready",
        }),
      );

    const updated = [
      ...people,
      ...samples,
    ];

    savePeople(updated);
    setPeople(updated);
    setSelectedPeople(
      samples.map(
        (person) => person.id,
      ),
    );
    setMessage(
      `${samples.length} demo people were added and selected.`,
    );
  }

  function continueFromPeople() {
    const available =
      people.filter(
        (person) =>
          person.workspaceId ===
            activeWorkspaceId &&
          person.status === "active",
      );

    if (available.length === 0) {
      return;
    }

    if (
      selectedPeople.length === 0
    ) {
      setSelectedPeople(
        available.map(
          (person) => person.id,
        ),
      );
    }

    setAiResult(null);
    setStep("requirement");
  }

  function togglePerson(id: string) {
    setSelectedPeople(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) =>
                item !== id,
            )
          : [...current, id],
    );
  }

  function toggleSkill(
    skill: string,
  ) {
    setRequirement((current) => ({
      ...current,
      skills:
        current.skills.includes(skill)
          ? current.skills.filter(
              (item) =>
                item !== skill,
            )
          : [
              ...current.skills,
              skill,
            ],
    }));
  }

  // LIVE GEMINI INTEGRATION
  async function generateRecommendation(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsGenerating(true);
    setGenerationError("");
    setMessage("");

    try {
      if (!activeWorkspaceId) {
        throw new Error(
          "Please select a group before generating a recommendation.",
        );
      }

      if (
        candidatePeople.length === 0
      ) {
        throw new Error(
          "Please select at least one person before generating a recommendation.",
        );
      }

      const contextCandidates =
        filterCandidatesForRequirement(
          candidatePeople,
          requirement,
        );

      if (contextCandidates.length === 0) {
        throw new Error(
          "No selected people match this team context. Review the selected people or choose profiles that match the requirement.",
        );
      }

      const result =
        await requestTeamRecommendation({
          workspaceId:
            activeWorkspaceId,
          requirement,
          candidates:
            contextCandidates.map(
              (person) => ({
                id: person.id,
                name: person.name,
                jobTitle:
                  person.jobTitle,
                department:
                  person.department,
                location:
                  person.location,
                strengths:
                  person.strengths,
                profileReady:
                  person.teamDnaStatus ===
                  "ready",
              }),
            ),
        });

      const personById =
        new Map(
          contextCandidates.map(
            (person) => [
              person.id,
              person,
            ],
          ),
        );

      const ranked =
        result.rankedPeople
          .map((item) => {
            const person =
              personById.get(
                item.personId,
              );

            if (!person) {
              return undefined;
            }

            return {
              person,
              score:
                item.score,
              reasons:
                item.reasons,
              concerns:
                item.concerns,
            };
          })
          .filter(
            (
              item,
            ): item is RankedPerson =>
              Boolean(item),
          );

      if (ranked.length === 0) {
        throw new Error(
          "The recommendation service returned no valid candidates.",
        );
      }

      setAiResult(result);

      try {
        await persistRecommendation({
          workspaceId: activeWorkspaceId,
          requirement,
          candidates: contextCandidates.map(
            (person) => ({
              id: person.id,
              name: person.name,
              jobTitle: person.jobTitle,
              department: person.department,
              location: person.location,
              strengths: person.strengths,
              profileReady:
                person.teamDnaStatus === "ready",
            }),
          ),
          result,
        });
      } catch (persistenceError) {
        console.warn(
          "Recommendation generated successfully but cloud history could not be saved.",
          persistenceError,
        );
      }
      setRankedPeople(ranked);
      setFinalPeople(
        result.recommendedPersonIds,
      );
      setStep("recommendation");
    } catch (error) {
      setGenerationError(
        error instanceof Error
          ? error.message
          : "Unable to generate recommendation.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  const adjustSearchParams =
    useSearchParams();
  const router = useRouter();
  const [isRebuildFlow, setIsRebuildFlow] =
    useState(false);

  /*
   * v7.13.10
   *
   * Rebuild Team starts a fresh team design rather than attempting to
   * reconstruct the existing team.
   * The previous restore logic depended on Firestore membership ids matching
   * the browser-local WorkspacePerson ids, which is not guaranteed.
   *
   * Instead, an adjust request deliberately starts the standard Create New
   * Team journey. The active workspace and its available people remain in
   * place, but all previous recommendation/final-team state is cleared.
   */
  useEffect(() => {
    if (!ready) {
      return;
    }

    const mode =
      adjustSearchParams.get(
        "mode",
      );
    const flow =
      adjustSearchParams.get(
        "flow",
      );

    if (flow === "rebuild") {
      setIsRebuildFlow(true);
      return;
    }

    if (
      mode !== "adjust" &&
      mode !== "rebuild"
    ) {
      return;
    }

    // Keep compatibility with existing links that still use mode=adjust.
    // Both routes now intentionally enter the Rebuild Team experience.
    setIsRebuildFlow(true);
    setRankedPeople([]);
    setFinalPeople([]);
    setAiResult(null);
    setGenerationError("");
    setMessage("");
    setRequirement({
      name: "",
      purpose: "",
      size: 5,
      skills: [],
      location: "Any",
      workingStyle: "Balanced",
    });

    // Remove stale adjustment metadata from earlier patches.
    localStorage.removeItem(
      "autoteams-adjust-team-v7136",
    );
    localStorage.removeItem(
      "autoteams-adjust-team-v7137",
    );
    localStorage.removeItem(
      "autoteams-v7136-fix2-team-context",
    );
    localStorage.removeItem(
      "autoteams-v7137-team-context",
    );

    const availablePeople =
      people.filter(
        (person) =>
          person.workspaceId ===
            activeWorkspaceId &&
          person.status === "active",
      );

    if (!activeWorkspaceId) {
      setSelectedPeople([]);
      setStep("group");
    } else if (
      availablePeople.length === 0
    ) {
      setSelectedPeople([]);
      setStep("people");
    } else {
      // Standard Create New Team candidate pool.
      setSelectedPeople(
        availablePeople.map(
          (person) => person.id,
        ),
      );
      setStep("requirement");
    }

    // Canonicalise the URL so refresh/back does not restart the rebuild.
    router.replace(
      "/team-builder?flow=rebuild",
    );
  }, [
    activeWorkspaceId,
    adjustSearchParams,
    people,
    ready,
    router,
  ]);

function toggleFinalPerson(
    id: string,
  ) {
    setFinalPeople(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) =>
                item !== id,
            )
          : current.length <
              requirement.size
            ? [...current, id]
            : current,
    );
  }

  function confirmTeam() {
    setStep("confirm");
  }

  function saveTeam() {
    if (
      !activeWorkspace ||
      selectedTeam.length === 0
    ) {
      return;
    }

    const confidence =
      aiResult?.confidence ??
      calculateConfidence(
        selectedTeam,
        requirement,
      );

    const team: SavedTeam = {
      id: createWorkspaceId("team"),
      workspaceId:
        activeWorkspace.id,
      name:
        requirement.name.trim() ||
        `${activeWorkspace.name} Team`,
      purpose:
        requirement.purpose.trim(),
      personIds:
        selectedTeam.map(
          (person) => person.id,
        ),
      createdAt:
        new Date().toISOString(),
      confidence,
      recommendation:
        aiResult
          ? {
              source:
                aiResult.source,
              model:
                aiResult.model,
              summary:
                aiResult.summary,
              teamStrengths:
                aiResult.teamStrengths,
              skillGaps:
                aiResult.skillGaps,
              risks:
                aiResult.risks,
              responseTimeMs:
                aiResult.telemetry
                  ?.responseTimeMs,
              totalTokens:
                aiResult.telemetry
                  ?.usage
                  ?.totalTokens,
            }
          : undefined,
    };

    const teams =
      loadSavedTeams();

    saveSavedTeams([
      ...teams,
      team,
    ]);

    setMessage(
      `${team.name} was saved.`,
    );
  }

  function startAgain() {
    setRequirement({
      name: "",
      purpose: "",
      size: 5,
      skills: [],
      location: "Any",
      workingStyle: "Balanced",
    });
    setRankedPeople([]);
    setFinalPeople([]);
    setAiResult(null);
    setGenerationError("");
    setMessage("");
    setStep("requirement");
  }

  if (!ready) {
    return (
      <section
        className={styles.loading}
      >
        Preparing Team Builder…
      </section>
    );
  }

  return (
    <main className={styles.page}>
      <section
        className={styles.hero}
      >
        <div
          className={`container ${styles.heroGrid}`}
        >
          <div>
            <span className="eyebrow">
              {isRebuildFlow
                ? "Rebuild Team"
                : "Build a Team"}
            </span>
            <h1>
              {isRebuildFlow
                ? "Build a fresh version of your team."
                : "Create the right team in five clear steps."}
            </h1>
            <p>
              {isRebuildFlow
                ? "Create a new team recommendation while keeping the existing team unchanged. Choose the people and requirements you want Atlas to consider."
                : "AutoTeams guides you from group selection to a human-reviewed Gemini recommendation without sending you to other setup pages."}
            </p>
          </div>

          <aside
            className={
              styles.contextCard
            }
          >
            <ProductIcon
              label="Current group"
              size="lg"
            >
              â—‡
            </ProductIcon>

            <div>
              <small>
                Current group
              </small>
              <strong>
                {activeWorkspace
                  ?.name ||
                  "Not selected"}
              </strong>
              <p>
                {activeWorkspace
                  ? `${workspaceTypeLabel(
                      activeWorkspace.type,
                    )} · ${
                      activePeople.length
                    } active people`
                  : "Create or choose a group in Step 1."}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section
        className={styles.body}
      >
        <div className="container">
          {isRebuildFlow && (
            <div className={styles.message}>
              Rebuild Team creates a new team. Your existing team will remain unchanged.
            </div>
          )}

          {message && (
            <div
              className={
                styles.message
              }
            >
              {message}
            </div>
          )}

          <StepNavigation
            currentStepIndex={
              currentStepIndex
            }
            onNavigate={(
              nextStep,
            ) => {
              if (
                canNavigateTo(
                  nextStep,
                  currentStepIndex,
                )
              ) {
                setStep(nextStep);
              }
            }}
          />

          {step === "group" && (
            <GroupStep
              workspaces={
                workspaces
              }
              groupName={groupName}
              groupType={groupType}
              groupDescription={
                groupDescription
              }
              setGroupName={
                setGroupName
              }
              setGroupType={
                setGroupType
              }
              setGroupDescription={
                setGroupDescription
              }
              onCreate={
                createGroup
              }
              onChoose={
                chooseGroup
              }
            />
          )}

          {step === "people" && (
            <PeopleStep
              workspace={
                activeWorkspace
              }
              people={
                activePeople
              }
              selectedPeople={
                selectedPeople
              }
              personName={
                personName
              }
              personEmail={
                personEmail
              }
              personRole={
                personRole
              }
              personDepartment={
                personDepartment
              }
              setPersonName={
                setPersonName
              }
              setPersonEmail={
                setPersonEmail
              }
              setPersonRole={
                setPersonRole
              }
              setPersonDepartment={
                setPersonDepartment
              }
              onTogglePerson={
                togglePerson
              }
              onAddPerson={
                addPerson
              }
              onAddDemo={
                addDemoPeople
              }
              onContinue={
                continueFromPeople
              }
            />
          )}

          {step ===
            "requirement" && (
            <RequirementStep
              workspace={
                activeWorkspace
              }
              availablePeople={
                candidatePeople.length
              }
              requirement={
                requirement
              }
              setRequirement={
                setRequirement
              }
              onToggleSkill={
                toggleSkill
              }
              onSubmit={
                generateRecommendation
              }
              onBack={() =>
                setStep("people")
              }
              isGenerating={
                isGenerating
              }
              generationError={
                generationError
              }
            />
          )}

          {step ===
            "recommendation" && (
            <RecommendationStep
              requirement={
                requirement
              }
              rankedPeople={
                rankedPeople
              }
              finalPeople={
                finalPeople
              }
              aiResult={aiResult}
              onToggleFinalPerson={
                toggleFinalPerson
              }
              onBack={() =>
                setStep(
                  "requirement",
                )
              }
              onContinue={
                confirmTeam
              }
            />
          )}

          {step ===
            "confirm" && (
            <ConfirmStep
              workspace={
                activeWorkspace
              }
              requirement={
                requirement
              }
              team={selectedTeam}
              confidence={
                aiResult
                  ?.confidence ??
                calculateConfidence(
                  selectedTeam,
                  requirement,
                )
              }
              aiResult={aiResult}
              onBack={() =>
                setStep(
                  "recommendation",
                )
              }
              onSave={saveTeam}
              onStartAgain={
                startAgain
              }
            />
          )}
        </div>
      </section>
    </main>
  );
}

function StepNavigation({
  currentStepIndex,
  onNavigate,
}: {
  currentStepIndex: number;
  onNavigate: (
    step: BuilderStep,
  ) => void;
}) {
  const steps: Array<{
    id: BuilderStep;
    number: number;
    label: string;
    text: string;
  }> = [
    {
      id: "group",
      number: 1,
      label: "Choose group",
      text:
        "Where the team belongs",
    },
    {
      id: "people",
      number: 2,
      label: "Choose people",
      text:
        "Who can be considered",
    },
    {
      id: "requirement",
      number: 3,
      label: "Describe team",
      text:
        "What outcome is needed",
    },
    {
      id: "recommendation",
      number: 4,
      label: "Review",
      text:
        "Understand the recommendation",
    },
    {
      id: "confirm",
      number: 5,
      label: "Confirm",
      text:
        "Save the human decision",
    },
  ];

  return (
    <nav
      className={styles.steps}
      aria-label="Team Builder steps"
    >
      {steps.map((step) => {
        const active =
          currentStepIndex ===
          step.number;
        const complete =
          currentStepIndex >
          step.number;

        return (
          <button
            className={
              active
                ? styles.activeStep
                : complete
                  ? styles.completeStep
                  : ""
            }
            key={step.id}
            onClick={() =>
              onNavigate(step.id)
            }
            type="button"
          >
            <span>
              {complete
                ? "✓"
                : step.number}
            </span>
            <div>
              <strong>
                {step.label}
              </strong>
              <small>
                {step.text}
              </small>
            </div>
          </button>
        );
      })}
    </nav>
  );
}

function GroupStep({
  workspaces,
  groupName,
  groupType,
  groupDescription,
  setGroupName,
  setGroupType,
  setGroupDescription,
  onCreate,
  onChoose,
}: {
  workspaces: Workspace[];
  groupName: string;
  groupType: FriendlyWorkspaceType;
  groupDescription: string;
  setGroupName: (
    value: string,
  ) => void;
  setGroupType: (
    value: FriendlyWorkspaceType,
  ) => void;
  setGroupDescription: (
    value: string,
  ) => void;
  onCreate: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
  onChoose: (id: string) => void;
}) {
  return (
    <section
      className={styles.twoColumns}
    >
      <article
        className={styles.panel}
      >
        <span className="eyebrow">
          Step 1
        </span>
        <h2>
          Choose where this team belongs.
        </h2>
        <p className={styles.intro}>
          Select an existing group
          or create one without
          leaving Team Builder.
        </p>

        {workspaces.length > 0 ? (
          <div
            className={
              styles.groupList
            }
          >
            {workspaces.map(
              (workspace) => (
                <button
                  key={
                    workspace.id
                  }
                  onClick={() =>
                    onChoose(
                      workspace.id,
                    )
                  }
                  type="button"
                >
                  <ProductIcon
                    label={
                      workspace.name
                    }
                    size="md"
                  >
                    {groupIcon(
                      workspace.type,
                    )}
                  </ProductIcon>

                  <div>
                    <strong>
                      {
                        workspace.name
                      }
                    </strong>
                    <small>
                      {workspaceTypeLabel(
                        workspace.type,
                      )}
                    </small>
                    <p>
                      {
                        workspace.description
                      }
                    </p>
                  </div>

                  <span>
                    Use group →
                  </span>
                </button>
              ),
            )}
          </div>
        ) : (
          <EmptyState
            title="No groups are available."
            text="Create the first group using the form."
          />
        )}
      </article>

      <aside
        className={styles.panel}
      >
        <span className="eyebrow">
          Create a group
        </span>
        <h2>
          Start a new group.
        </h2>

        <form data-autoteams-team-builder="true"
          className={styles.form}
          onSubmit={onCreate}
        >
          <label>
            Group name
            <input
              required
              value={groupName}
              onChange={(event) =>
                setGroupName(
                  event.target.value,
                )
              }
              placeholder="Sunday Football Club"
            />
          </label>

          <label>
            Group type
            <select
              value={groupType}
              onChange={(event) =>
                setGroupType(
                  event.target
                    .value as FriendlyWorkspaceType,
                )
              }
            >
              {groupTypes.map(
                (type) => (
                  <option
                    key={type.value}
                    value={
                      type.value
                    }
                  >
                    {type.label}
                  </option>
                ),
              )}
            </select>
          </label>

          <label>
            Description
            <textarea
              value={
                groupDescription
              }
              onChange={(event) =>
                setGroupDescription(
                  event.target.value,
                )
              }
              placeholder="Who is this group for?"
            />
          </label>

          <button
            className="button"
            type="submit"
          >
            Create Group and Continue
          </button>
        </form>
      </aside>
    </section>
  );
}

function PeopleStep({
  workspace,
  people,
  selectedPeople,
  personName,
  personEmail,
  personRole,
  personDepartment,
  setPersonName,
  setPersonEmail,
  setPersonRole,
  setPersonDepartment,
  onTogglePerson,
  onAddPerson,
  onAddDemo,
  onContinue,
}: {
  workspace?: Workspace;
  people: WorkspacePerson[];
  selectedPeople: string[];
  personName: string;
  personEmail: string;
  personRole: string;
  personDepartment: string;
  setPersonName: (
    value: string,
  ) => void;
  setPersonEmail: (
    value: string,
  ) => void;
  setPersonRole: (
    value: string,
  ) => void;
  setPersonDepartment: (
    value: string,
  ) => void;
  onTogglePerson: (
    id: string,
  ) => void;
  onAddPerson: (
    event: FormEvent<HTMLFormElement>,
  ) => void;
  onAddDemo: () => void;
  onContinue: () => void;
}) {
  return (
    <section
      className={styles.twoColumns}
    >
      <article
        className={styles.panel}
      >
        <div
          className={
            styles.sectionHeading
          }
        >
          <div>
            <span className="eyebrow">
              Step 2
            </span>
            <h2>
              Choose who AutoTeams can consider.
            </h2>
            <p>
              Select the people
              relevant to this team
              requirement.
            </p>
          </div>

          <strong>
            {selectedPeople.length}/
            {people.length} selected
          </strong>
        </div>

        {people.length > 0 ? (
          <div
            className={
              styles.peopleGrid
            }
          >
            {people.map(
              (person) => (
                <label
                  className={
                    selectedPeople.includes(
                      person.id,
                    )
                      ? styles.selectedPerson
                      : ""
                  }
                  key={person.id}
                >
                  <input
                    checked={selectedPeople.includes(
                      person.id,
                    )}
                    onChange={() =>
                      onTogglePerson(
                        person.id,
                      )
                    }
                    type="checkbox"
                  />

                  <span
                    className={
                      styles.avatar
                    }
                  >
                    {person.name
                      .charAt(0)
                      .toUpperCase()}
                  </span>

                  <div>
                    <strong>
                      {
                        person.name
                      }
                    </strong>
                    <small>
                      {
                        person.jobTitle
                      }{" "}
                      ·{" "}
                      {
                        person.department
                      }
                    </small>
                    <em>
                      {person
                        .strengths
                        .length
                        ? person.strengths
                            .slice(0, 2)
                            .join(
                              " · ",
                            )
                        : "Profile not completed"}
                    </em>
                  </div>
                </label>
              ),
            )}
          </div>
        ) : (
          <EmptyState
            title={`No people in ${
              workspace?.name ||
              "this group"
            }.`}
            text="Add a person or generate demo people using the options alongside."
          />
        )}

        <div
          className={
            styles.footerActions
          }
        >
          <button
            className="button"
            disabled={
              people.length === 0
            }
            onClick={onContinue}
            type="button"
          >
            Continue with Available People →
          </button>
        </div>
      </article>

      <aside
        className={styles.sideStack}
      >
        <section
          className={styles.panel}
        >
          <span className="eyebrow">
            Add a person
          </span>

          <form
            className={styles.form}
            onSubmit={onAddPerson}
          >
            <label>
              Full name
              <input
                required
                value={personName}
                onChange={(event) =>
                  setPersonName(
                    event.target
                      .value,
                  )
                }
                placeholder="Alex Murphy"
              />
            </label>

            <label>
              Email
              <input
                required
                type="email"
                value={
                  personEmail
                }
                onChange={(event) =>
                  setPersonEmail(
                    event.target
                      .value,
                  )
                }
                placeholder="alex@example.com"
              />
            </label>

            <label>
              Role
              <input
                value={
                  personRole
                }
                onChange={(event) =>
                  setPersonRole(
                    event.target
                      .value,
                  )
                }
                placeholder="Team member"
              />
            </label>

            <label>
              Department or area
              <input
                value={
                  personDepartment
                }
                onChange={(event) =>
                  setPersonDepartment(
                    event.target
                      .value,
                  )
                }
                placeholder="General"
              />
            </label>

            <button
              className="button secondary"
              type="submit"
            >
              Add Person
            </button>
          </form>
        </section>

        <section
          className={
            styles.demoCard
          }
        >
          <ProductIcon
            label="Demo people"
            size="md"
          >
            ✦
          </ProductIcon>
          <h3>
            Need people for testing?
          </h3>
          <p>
            Add five relevant demo
            people and continue
            immediately.
          </p>
          <button
            className="button secondary"
            onClick={onAddDemo}
            type="button"
          >
            Generate Demo People
          </button>
        </section>
      </aside>
    </section>
  );
}

function RequirementStep({
  workspace,
  availablePeople,
  requirement,
  setRequirement,
  onToggleSkill,
  onSubmit,
  onBack,
  isGenerating,
  generationError,
}: {
  workspace?: Workspace;
  availablePeople: number;
  requirement: TeamRequirement;
  setRequirement: (
    value:
      | TeamRequirement
      | ((
          current: TeamRequirement,
        ) => TeamRequirement),
  ) => void;
  onToggleSkill: (
    skill: string,
  ) => void;
  onSubmit: (
    event: FormEvent<HTMLFormElement>,
  ) => void | Promise<void>;
  onBack: () => void;
  isGenerating: boolean;
  generationError: string;
}) {
  return (
    <section
      className={styles.panel}
      data-autoteams-v633={"AUTOTEAMS_V633_INLINE_READABILITY"}
      style={{
        padding: 30,
      }}
    >
      <div
        className={
          styles.sectionHeading
        }
      >
        <div>
          <span className="eyebrow">
            Step 3
          </span>
          <h2
            style={{
              fontSize: 32,
              lineHeight: 1.18,
              letterSpacing: "-0.03em",
              marginBottom: 8,
            }}
          >
            Describe the team you need.
          </h2>
          <p
            style={{
              fontSize: 14,
              lineHeight: 1.6,
              maxWidth: 760,
            }}
          >
            Gemini will analyse the
            authorised candidate
            population and explain
            how each recommendation
            fits the requirement.
          </p>
        </div>

        <strong>
          {availablePeople} people
          available
        </strong>
      </div>

      <form
        className={
          styles.requirementForm
        }
        onSubmit={onSubmit}
        style={{
          gap: 18,
          marginTop: 22,
        }}
      >
        <label
          style={{
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.4,
            gap: 8,
          }}
        >
          Team name
          <input
            required
            value={
              requirement.name
            }
            onChange={(event) =>
              setRequirement(
                (current) => ({
                  ...current,
                  name:
                    event.target
                      .value,
                }),
              )
            }
            placeholder="Cloud Migration Team"
            style={{
              minHeight: 52,
              padding: "13px 15px",
              fontSize: 16,
              lineHeight: 1.45,
            }}
          />
        </label>

        <label
          className={
            styles.fullWidth
          }
          style={{
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.4,
            gap: 8,
          }}
        >
          What outcome should this team achieve?
          <textarea
            required
            value={
              requirement.purpose
            }
            onChange={(event) =>
              setRequirement(
                (current) => ({
                  ...current,
                  purpose:
                    event.target
                      .value,
                }),
              )
            }
            placeholder="Create a five-person team to migrate customer services to the cloud within six months."
            style={{
              minHeight: 122,
              padding: "14px 15px",
              fontSize: 16,
              lineHeight: 1.55,
              resize: "vertical",
            }}
          />
        </label>

        <label
          style={{
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.4,
            gap: 8,
          }}
        >
          Team size
          <input
            min={1}
            max={Math.max(
              availablePeople,
              1,
            )}
            type="number"
            value={
              requirement.size
            }
            onChange={(event) =>
              setRequirement(
                (current) => ({
                  ...current,
                  size: Number(
                    event.target
                      .value,
                  ),
                }),
              )
            }
            style={{
              minHeight: 52,
              padding: "13px 15px",
              fontSize: 16,
            }}
          />
        </label>

        <label
          style={{
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.4,
            gap: 8,
          }}
        >
          Location preference
          <select
            value={
              requirement.location
            }
            onChange={(event) =>
              setRequirement(
                (current) => ({
                  ...current,
                  location:
                    event.target
                      .value,
                }),
              )
            }
            style={{
              minHeight: 52,
              padding: "13px 15px",
              fontSize: 16,
            }}
          >
            <option>Any</option>
            <option>
              Same location preferred
            </option>
            <option>Remote</option>
            <option>Hybrid</option>
          </select>
        </label>

        <label
          style={{
            fontSize: 14,
            fontWeight: 700,
            lineHeight: 1.4,
            gap: 8,
          }}
        >
          Team style
          <select
            value={
              requirement.workingStyle
            }
            onChange={(event) =>
              setRequirement(
                (current) => ({
                  ...current,
                  workingStyle:
                    event.target
                      .value,
                }),
              )
            }
            style={{
              minHeight: 52,
              padding: "13px 15px",
              fontSize: 16,
            }}
          >
            <option>
              Balanced
            </option>
            <option>
              Delivery focused
            </option>
            <option>
              Collaborative
            </option>
            <option>
              Creative
            </option>
            <option>
              Structured
            </option>
          </select>
        </label>

        <ContextAwareSkills
          outcome={requirement.purpose}
          teamName={requirement.name}
          selectedSkills={requirement.skills}
          onToggleSkill={onToggleSkill}
        />

          <SportsTeamRequirements teamName={requirement.name} outcome={requirement.purpose} />

        <fieldset
          className={
            styles.fullWidth
          }
        >
          <legend
            style={{
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            Important skills or strengths
          </legend>

          <div
            className={
              styles.skillGrid
            }
          >
            {suggestedSkills.map(
              (skill) => (
                <label
                  className={
                    requirement.skills.includes(
                      skill,
                    )
                      ? styles.selectedSkill
                      : ""
                  }
                  key={skill}
                  style={{
                    minHeight: 50,
                    padding: "12px 14px",
                    gap: 10,
                    fontSize: 13,
                    fontWeight: 650,
                    alignItems: "center",
                  }}
                >
                  <input
                    checked={requirement.skills.includes(
                      skill,
                    )}
                    onChange={() =>
                      onToggleSkill(
                        skill,
                      )
                    }
                    type="checkbox"
                    style={{
                      width: 18,
                      height: 18,
                      minWidth: 18,
                      minHeight: 18,
                    }}
                  />
                  {skill}
                </label>
              ),
            )}
          </div>
        </fieldset>

        {generationError && (
          <div
            className={
              styles.fullWidth
            }
            role="alert"
            style={{
              padding: 12,
              borderRadius: 10,
              background:
                "rgba(226,178,103,.08)",
              border:
                "1px solid rgba(226,178,103,.25)",
              color: "#e2b267",
              fontSize: 11,
            }}
          >
            {generationError}
          </div>
        )}

        <div
          className={`${styles.formActions} ${styles.fullWidth}`}
        >
          <button
            className="button secondary"
            onClick={onBack}
            type="button"
            disabled={isGenerating}
            style={{
              minHeight: 50,
              padding: "12px 20px",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            ← Back
          </button>

          <button
            className="button"
            type="submit"
            disabled={
              isGenerating ||
              availablePeople === 0
            }
            style={{
              minHeight: 50,
              padding: "12px 20px",
              fontSize: 15,
              fontWeight: 800,
            }}
          >
            {isGenerating
              ? "Gemini is analysing…"
              : "Generate Recommendation →"}
          </button>
        </div>
      </form>
    </section>
  );
}

function RecommendationStep({
  requirement,
  rankedPeople,
  finalPeople,
  aiResult,
  onToggleFinalPerson,
  onBack,
  onContinue,
}: {
  requirement: TeamRequirement;
  rankedPeople: RankedPerson[];
  finalPeople: string[];
  aiResult: GeminiTeamRecommendation | null;
  onToggleFinalPerson: (
    id: string,
  ) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  const selected =
    rankedPeople.filter(
      (item) =>
        finalPeople.includes(
          item.person.id,
        ),
    );

  const confidence =
    aiResult?.confidence ??
    calculateConfidence(
      selected.map(
        (item) => item.person,
      ),
      requirement,
    );

  return (
    <section
      className={styles.panel}
    >
      <div
        className={
          styles.sectionHeading
        }
      >
        <div>
          <span className="eyebrow">
            Step 4
          </span>
          <h2>
            Review the recommendation.
          </h2>
          <p>
            AutoTeams ranks the
            authorised people using
            the requirement and
            available evidence. You
            remain responsible for
            the final choice.
          </p>
        </div>

        <strong>
          {finalPeople.length}/
          {requirement.size} selected
        </strong>
      </div>

      {aiResult && (
        <AiTelemetryBanner
          result={aiResult}
        />
      )}

      <div
        className={`${styles.summaryBanner} ${styles.aiSummaryBanner}`}
      >
        <ProductIcon
          label="Recommendation"
          size="lg"
        >
          ✦
        </ProductIcon>

        <div>
          <small className={styles.aiRecommendationLabel}>
            {aiResult?.source === "gemini"
              ? "Gemini Recommendation"
              : "Team Recommendation"}
          </small>

          <strong className={styles.aiRecommendationTitle}>
            {requirement.name}
          </strong>

          <p className={styles.aiRecommendationSummary}>
            {aiResult?.summary ||
              requirement.purpose}
          </p>
        </div>

        <span className={styles.aiConfidenceBadge}>
          {confidence}% confidence
        </span>
      </div>

      {aiResult && (
        <div className={styles.aiEvidenceGrid}>
          <AiEvidenceList
            title="Team strengths"
            items={
              aiResult.teamStrengths
            }
          />
          <AiEvidenceList
            title="Skill gaps"
            items={
              aiResult.skillGaps
            }
            attention
          />
          <AiEvidenceList
            title="Risks to review"
            items={aiResult.risks}
            attention
          />
        </div>
      )}

      <div
        className={
          styles.rankingList
        }
      >
        {rankedPeople.map(
          (item, index) => {
            const chosen =
              finalPeople.includes(
                item.person.id,
              );

            return (
              <article
                className={
                  chosen
                    ? styles.chosenPerson
                    : ""
                }
                key={item.person.id}
              >
                <span
                  className={
                    styles.rank
                  }
                >
                  {index + 1}
                </span>

                <span
                  className={
                    styles.avatar
                  }
                >
                  {item.person.name
                    .charAt(0)
                    .toUpperCase()}
                </span>

                <div
                  className={
                    styles.personEvidence
                  }
                >
                  <header>
                    <div>
                      <strong>
                        {
                          item.person
                            .name
                        }
                      </strong>
                      <small>
                        {
                          item.person
                            .jobTitle
                        }{" "}
                        ·{" "}
                        {
                          item.person
                            .department
                        }
                      </small>
                    </div>

                    <em>
                      {item.score}%
                      match
                    </em>
                  </header>

                  <div>
                    {item.reasons.map(
                      (reason) => (
                        <span
                          key={
                            reason
                          }
                        >
                          ✓ {reason}
                        </span>
                      ),
                    )}
                    {item.concerns.map(
                      (concern) => (
                        <span
                          className={
                            styles.concern
                          }
                          key={
                            concern
                          }
                        >
                          △{" "}
                          {
                            concern
                          }
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    onToggleFinalPerson(
                      item.person
                        .id,
                    )
                  }
                  type="button"
                >
                  {chosen
                    ? "Selected"
                    : "Add"}
                </button>
              </article>
            );
          },
        )}
      </div>

      <div
        className={
          styles.formActions
        }
      >
        <button
          className="button secondary"
          onClick={onBack}
          type="button"
        >
          ← Edit Requirement
        </button>

        <button
          className="button"
          disabled={
            finalPeople.length === 0
          }
          onClick={onContinue}
          type="button"
        >
          Review Final Team →
        </button>
      </div>
    </section>
  );
}

function ConfirmStep({
  workspace,
  requirement,
  team,
  confidence,
  aiResult,
  onBack,
  onSave,
  onStartAgain,
}: {
  workspace?: Workspace;
  requirement: TeamRequirement;
  team: WorkspacePerson[];
  confidence: number;
  aiResult: GeminiTeamRecommendation | null;
  onBack: () => void;
  onSave: () => void;
  onStartAgain: () => void;
}) {
  return (
    <section
      className={styles.panel}
    >
      <div
        className={
          styles.sectionHeading
        }
      >
        <div>
          <span className="eyebrow">
            Step 5
          </span>
          <h2>
            Confirm the human decision.
          </h2>
          <p>
            Review the team and save
            only when you are
            satisfied with the
            recommendation.
          </p>
        </div>

        <span
          className={
            styles.confidence
          }
        >
          {confidence}% confidence
        </span>
      </div>

      {aiResult && (
        <AiTelemetryBanner
          result={aiResult}
        />
      )}

      <div
        className={
          styles.confirmGrid
        }
      >
        <article
          className={
            styles.finalTeam
          }
        >
          <span className="eyebrow">
            Final team
          </span>
          <h3>
            {requirement.name}
          </h3>
          <p>
            {requirement.purpose}
          </p>

          <div
            className={
              styles.finalPeople
            }
          >
            {team.map((person) => (
              <article
                key={person.id}
              >
                <span
                  className={
                    styles.avatar
                  }
                >
                  {person.name
                    .charAt(0)
                    .toUpperCase()}
                </span>
                <div>
                  <strong>
                    {person.name}
                  </strong>
                  <small>
                    {
                      person.jobTitle
                    }{" "}
                    ·{" "}
                    {
                      person.department
                    }
                  </small>
                </div>
              </article>
            ))}
          </div>
        </article>

        <aside
          className={
            styles.decisionCard
          }
        >
          <ProductIcon
            label="Human review"
            size="md"
          >
            ✓
          </ProductIcon>
          <span className="eyebrow">
            Human reviewed
          </span>
          <h3>
            Why this team?
          </h3>

          <div>
            <span>
              ✓ Team size matches
              the requirement
            </span>
            <span>
              ✓ Authorised
              candidate population
              used
            </span>
            <span>
              ✓ Skills and
              collaboration evidence
              considered
            </span>
            <span>
              ✓ Final selection
              reviewed by a person
            </span>
          </div>

          <p>
            Group:{" "}
            {workspace?.name ||
              "Current group"}
          </p>
        </aside>
      </div>

      <div
        className={
          styles.formActions
        }
      >
        <button
          className="button secondary"
          onClick={onBack}
          type="button"
        >
          ← Adjust Selection
        </button>

        <button
          className="button"
          onClick={onSave}
          type="button"
        >
          Save Team
        </button>

        <button
          className="button secondary"
          onClick={onStartAgain}
          type="button"
        >
          Build Another Team
        </button>

        <Link
          className="button secondary"
          href="/teams"
        >
          View Saved Teams
        </Link>
      </div>
    </section>
  );
}

function AiTelemetryBanner({
  result,
}: {
  result: GeminiTeamRecommendation;
}) {
  const telemetry = result.telemetry;
  const live = result.source === "gemini";
  const developmentMode =
    telemetry?.mode === "development";

  const statusTitle = live
    ? "Live Gemini Recommendation"
    : developmentMode
      ? "Development Mode"
      : "Deterministic Fallback";

  const statusText = live
    ? "This recommendation was generated by Google Gemini and remains subject to human review."
    : developmentMode
      ? "Gemini calls are disabled. AutoTeams is using the deterministic recommendation engine to control development costs."
      : "Gemini could not complete the request, so AutoTeams used the deterministic recommendation engine.";

  return (
    <div
      className={`${styles.aiSourceBanner} ${
        live
          ? styles.aiSourceLive
          : styles.aiSourceFallback
      }`}
    >
      <div className={styles.aiSourceMain}>
        <span className={styles.aiSourceStatus}>
          {live ? "✓" : developmentMode ? "â—‡" : "△"}
        </span>

        <div>
          <strong>{statusTitle}</strong>
          <p>{statusText}</p>
        </div>
      </div>

      <details className={styles.aiDeveloperDetails}>
        <summary>Developer details</summary>

        <div>
          <span>
            <small>Engine</small>
            <strong>
              {live ? "Gemini" : "Deterministic"}
            </strong>
          </span>

          <span>
            <small>Model</small>
            <strong>
              {result.model ||
                telemetry?.model ||
                "Not used"}
            </strong>
          </span>

          <span>
            <small>Response</small>
            <strong>
              {telemetry
                ? `${telemetry.responseTimeMs} ms`
                : "—"}
            </strong>
          </span>

          <span>
            <small>Tokens</small>
            <strong>
              {telemetry?.usage?.totalTokens !==
              undefined
                ? String(
                    telemetry.usage.totalTokens,
                  )
                : live
                  ? "Not reported"
                  : "0"}
            </strong>
          </span>
        </div>
      </details>
    </div>
  );
}

function AiEvidenceList({
  title,
  items,
  attention = false,
}: {
  title: string;
  items: string[];
  attention?: boolean;
}) {
  return (
    <article className={styles.aiEvidenceCard}>
      <strong>{title}</strong>

      {items.length ? (
        <div>
          {items
            .slice(0, 5)
            .map((item) => (
              <span
                className={
                  attention
                    ? styles.aiEvidenceAttention
                    : styles.aiEvidencePositive
                }
                key={item}
              >
                {attention ? "△" : "✓"} {item}
              </span>
            ))}
        </div>
      ) : (
        <span className={styles.aiEvidenceEmpty}>
          None identified.
        </span>
      )}
    </article>
  );
}

function EmptyState({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div
      className={styles.empty}
    >
      <ProductIcon
        label={title}
        size="md"
        subtle
      >
        â—‹
      </ProductIcon>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function calculateConfidence(
  team: WorkspacePerson[],
  requirement: TeamRequirement,
): number {
  if (team.length === 0) {
    return 0;
  }

  const readiness =
    team.filter(
      (person) =>
        person.teamDnaStatus ===
        "ready",
    ).length / team.length;

  const sizeFit = Math.min(
    team.length /
      Math.max(
        requirement.size,
        1,
      ),
    1,
  );

  const skills = new Set(
    team.flatMap((person) =>
      person.strengths.map(
        (strength) =>
          strength.toLowerCase(),
      ),
    ),
  );

  const requiredCoverage =
    requirement.skills.length ===
    0
      ? 1
      : requirement.skills.filter(
          (skill) =>
            Array.from(skills).some(
              (strength) =>
                strength.includes(
                  skill.toLowerCase(),
                ) ||
                skill
                  .toLowerCase()
                  .includes(
                    strength,
                  ),
            ),
        ).length /
        requirement.skills.length;

  return Math.round(
    55 +
      readiness * 15 +
      sizeFit * 15 +
      requiredCoverage * 15,
  );
}

function stepIndex(
  step: BuilderStep,
): number {
  const indexes: Record<
    BuilderStep,
    number
  > = {
    group: 1,
    people: 2,
    requirement: 3,
    recommendation: 4,
    confirm: 5,
  };

  return indexes[step];
}

function canNavigateTo(
  next: BuilderStep,
  currentIndex: number,
): boolean {
  return (
    stepIndex(next) <=
    currentIndex
  );
}

function groupIcon(
  type: WorkspaceType,
): string {
  const icons: Record<
    WorkspaceType,
    string
  > = {
    organisation: "âŒ‚",
    community: "â™™",
    sports: "â—Ž",
    education: "â–¤",
    friends_family: "â™¡",
    personal: "â™¡",
  };

  return icons[type];
}

function loadSavedTeams(): SavedTeam[] {
  if (
    typeof window === "undefined"
  ) {
    return [];
  }

  try {
    const raw =
      window.localStorage.getItem(
        TEAM_KEY,
      );

    return raw
      ? (JSON.parse(
          raw,
        ) as SavedTeam[])
      : [];
  } catch {
    return [];
  }
}

function saveSavedTeams(
  teams: SavedTeam[],
): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  window.localStorage.setItem(
    TEAM_KEY,
    JSON.stringify(teams),
  );
}

function demoPeople(
  type: WorkspaceType,
): Array<
  Omit<
    WorkspacePerson,
    | "id"
    | "workspaceId"
    | "status"
    | "teamDnaStatus"
  >
> {
  const base = [
    {
      name: "Alex Murphy",
      email:
        "alex.murphy@example.com",
      department: "General",
      jobTitle: "Coordinator",
      location: "Leeds",
      strengths: [
        "Communication",
        "Organisation",
      ],
    },
    {
      name: "Jay Singh",
      email:
        "jay.singh@example.com",
      department: "General",
      jobTitle: "Member",
      location: "Leeds",
      strengths: [
        "Reliability",
        "Planning",
      ],
    },
    {
      name: "Morgan Lee",
      email:
        "morgan.lee@example.com",
      department: "General",
      jobTitle: "Member",
      location: "Manchester",
      strengths: [
        "Adaptability",
        "Collaboration",
      ],
    },
    {
      name: "Samira Khan",
      email:
        "samira.khan@example.com",
      department: "General",
      jobTitle: "Member",
      location: "Bradford",
      strengths: [
        "Leadership",
        "Empathy",
      ],
    },
    {
      name: "Owen Price",
      email:
        "owen.price@example.com",
      department: "General",
      jobTitle: "Member",
      location: "Wakefield",
      strengths: [
        "Delivery",
        "Problem solving",
      ],
    },
  ];

  if (
    type === "organisation"
  ) {
    const departments = [
      "Engineering",
      "Product",
      "Delivery",
      "Design",
      "Operations",
    ];

    const roles = [
      "Software Engineer",
      "Product Manager",
      "Delivery Manager",
      "Service Designer",
      "Operations Analyst",
    ];

    return base.map(
      (person, index) => ({
        ...person,
        department:
          departments[index],
        jobTitle: roles[index],
      }),
    );
  }

  if (type === "sports") {
    return base.map(
      (person, index) => ({
        ...person,
        department:
          index === 2
            ? "Coaching"
            : "Players",
        jobTitle:
          index === 2
            ? "Coach"
            : index === 0
              ? "Captain"
              : "Player",
      }),
    );
  }

  if (
    type === "education"
  ) {
    return base.map(
      (person, index) => ({
        ...person,
        department:
          index === 2
            ? "Tutors"
            : "Study Group",
        jobTitle:
          index === 2
            ? "Tutor"
            : "Student",
      }),
    );
  }

  if (
    type === "community"
  ) {
    return base.map(
      (person, index) => ({
        ...person,
        department:
          index === 2
            ? "Planning"
            : "Volunteers",
        jobTitle:
          index === 0
            ? "Volunteer Lead"
            : "Volunteer",
      }),
    );
  }

  return base.map((person) => ({
    ...person,
    department:
      "Friends & Family",
    jobTitle: "Group Member",
  }));
}

