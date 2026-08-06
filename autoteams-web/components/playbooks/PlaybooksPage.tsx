"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  DemoDatasetId,
  applyDemoDataset,
} from "@/lib/demo-environment";
import styles from "./PlaybooksPage.module.css";

type PlaybookId =
  | "business"
  | "friendship"
  | "community"
  | "sports"
  | "education"
  | "enterprise";

type InstructionStep = {
  title: string;
  purpose: string;
  instructions: string[];
  example?: string[];
  expected: string;
  href?: string;
  hrefLabel?: string;
};

type Playbook = {
  id: PlaybookId;
  icon: string;
  title: string;
  userStory: string;
  goal: string;
  estimatedTime: string;
  role: string;
  dataset?: DemoDatasetId;
  prerequisites: string[];
  evaluates: string[];
  outcome: string;
  successCriteria: string[];
  commonMistakes: string[];
  steps: InstructionStep[];
};

const STORAGE_KEY = "autoteams-playbook-progress";

const playbooks: Playbook[] = [
  {
    id: "business",
    icon: "⌂",
    title: "Build a Business Team",
    userStory:
      "Sarah is an Engineering Manager who needs to build a five-person cloud migration team.",
    goal:
      "Create a balanced delivery team using skills, availability, trust and Team DNA.",
    estimatedTime: "15–20 minutes",
    role: "Team Leader",
    dataset: "business",
    prerequisites: [
      "A Business workspace has been created.",
      "Sarah has Team Leader or Administrator access.",
      "Employees have been added to the workspace.",
      "Eligible employees have Business profiles.",
      "Atlas interviews have been completed.",
      "At least one Talent Pool is available.",
    ],
    evaluates: [
      "Required skills",
      "Availability",
      "Location",
      "Leadership",
      "Communication",
      "Planning",
      "Adaptability",
      "Reliability",
      "Trust",
      "Overall Team DNA balance",
    ],
    outcome:
      "A reviewed five-person team recommendation with a clear explanation for every candidate.",
    successCriteria: [
      "Acme Technology exists as the active workspace.",
      "The required employees appear in workspace membership.",
      "Eligible employees have completed Business Team DNA.",
      "A Cloud Engineering Talent Pool exists.",
      "Atlas produces an explainable recommendation.",
      "Sarah reviews and creates the final team.",
    ],
    commonMistakes: [
      "Building a team before profiles and Atlas interviews are complete.",
      "Selecting the whole workspace instead of a focused Talent Pool.",
      "Treating the highest individual match as automatically the best team.",
      "Ignoring availability or stale Team DNA warnings.",
      "Creating the team without reviewing Atlas explanations.",
    ],
    steps: [
      {
        title: "Create or select the Business workspace",
        purpose:
          "The workspace creates the private boundary for people, profiles and recommendations.",
        instructions: [
          "Open Workspaces.",
          "Create a new Business workspace or select an existing one.",
          "Confirm the workspace is private to the organisation.",
          "Confirm Sarah is the Owner, Administrator or Team Leader.",
        ],
        example: [
          "Workspace name: Acme Technology",
          "Workspace type: Business",
          "Description: Digital products, cloud platforms and AI engineering",
          "Visibility: Private",
        ],
        expected:
          "Acme Technology appears as the active workspace and Atlas cannot recommend anyone outside it.",
        href: "/workspaces",
        hrefLabel: "Open Workspaces",
      },
      {
        title: "Add employees and assign roles",
        purpose:
          "Workspace roles determine who manages the workspace and who may build teams.",
        instructions: [
          "Open Workspace Membership.",
          "Add or invite the employees needed for the scenario.",
          "Assign Sarah as Team Leader.",
          "Assign the remaining employees as Team Members.",
          "Check that invitations and role labels are correct.",
        ],
        example: [
          "Sarah Johnson — Team Leader",
          "Priya Patel — Team Member",
          "David Chen — Team Member",
          "Emma Brown — Team Member",
          "Tom Roberts — Team Member",
          "Michael Evans — Team Member",
        ],
        expected:
          "All employees appear inside the workspace with the correct role and membership status.",
        href: "/profile/membership",
        hrefLabel: "Open Membership",
      },
      {
        title: "Create Business profiles",
        purpose:
          "Each employee needs a contextual Business profile before Atlas can create workplace Team DNA.",
        instructions: [
          "Each employee opens My Profile.",
          "Create a Business profile.",
          "Add role, department, skills, availability and general location.",
          "Save the profile.",
          "Do not refresh the Atlas interview unless Team DNA also needs updating.",
        ],
        example: [
          "Job title: Data Engineer",
          "Department: Data",
          "Skills: BigQuery, Python, dbt",
          "Availability: Monday to Friday",
          "Location: Leeds",
        ],
        expected:
          "Each eligible employee has a separate Business profile with matching consent enabled.",
        href: "/profile",
        hrefLabel: "Open My Profile",
      },
      {
        title: "Complete the Atlas interview",
        purpose:
          "Atlas uses the interview to create an explainable collaboration profile.",
        instructions: [
          "Open Atlas Interview.",
          "Complete the reusable core questions if they have not been answered before.",
          "Complete the Business context questions.",
          "Answer honestly rather than trying to optimise the score.",
          "Finish the interview and confirm the profile is complete.",
        ],
        example: [
          "Core questions: communication, planning, leadership and conflict",
          "Business questions: stakeholders, deadlines, delivery and mentoring",
        ],
        expected:
          "Each employee has a completed Business Team DNA profile with a confidence and freshness status.",
        href: "/atlas",
        hrefLabel: "Open Atlas Interview",
      },
      {
        title: "Review Team DNA health",
        purpose:
          "Incomplete or stale profiles should not be relied on for important team decisions.",
        instructions: [
          "Open My Team DNA.",
          "Review interview completion.",
          "Review confidence and last updated date.",
          "Confirm Atlas matching consent is allowed.",
          "Refresh any profile that is stale or no longer represents the person.",
        ],
        example: [
          "Interview status: Complete",
          "Confidence: 90% or higher",
          "Freshness: Current",
          "Matching consent: Allowed",
        ],
        expected:
          "The employees used in the scenario show complete, current and eligible Business Team DNA.",
        href: "/team-dna",
        hrefLabel: "Open Team DNA",
      },
      {
        title: "Create the Cloud Engineering Talent Pool",
        purpose:
          "The Talent Pool narrows the population Atlas is allowed to consider.",
        instructions: [
          "Open Talent Pools.",
          "Create a focused pool for the cloud migration requirement.",
          "Add people from Engineering, Architecture, Data, AI and Delivery.",
          "Remove people who are not available or relevant.",
          "Save the pool before starting Team Builder.",
        ],
        example: [
          "Pool name: Cloud Engineering",
          "Departments: Engineering, Architecture, Data and AI",
          "Location: Leeds or Remote",
          "Status: Active",
        ],
        expected:
          "Cloud Engineering appears as an active Talent Pool containing only eligible people.",
        href: "/talent-pools",
        hrefLabel: "Open Talent Pools",
      },
      {
        title: "Describe the team requirement",
        purpose:
          "Team Builder turns the business need into a structured recommendation request.",
        instructions: [
          "Open Build with Atlas.",
          "Select Acme Technology.",
          "Select the Cloud Engineering Talent Pool.",
          "Describe the purpose, team size, location and required capabilities.",
          "Choose a balanced Team DNA target unless a specialist profile is required.",
        ],
        example: [
          "Team name: Cloud Migration Team",
          "Purpose: Migrate customer services to GCP",
          "Team size: 5",
          "Location: Leeds or Remote",
          "Required skills: Cloud architecture, Data engineering, DevOps, Security, Delivery leadership",
          "Team DNA target: Balanced",
        ],
        expected:
          "Atlas analyses only the selected Talent Pool against the stated requirement.",
        href: "/team-builder",
        hrefLabel: "Open Team Builder",
      },
      {
        title: "Review the Atlas recommendation",
        purpose:
          "The Team Leader must understand why each person is recommended before making a decision.",
        instructions: [
          "Open the Recommendation Studio.",
          "Review each candidate's match score.",
          "Read Why Atlas recommends this person.",
          "Review points to consider.",
          "Add or remove candidates and observe the live Team DNA.",
          "Check that the overall team confidence remains acceptable.",
        ],
        example: [
          "Purpose alignment",
          "Availability",
          "Shared skills",
          "Location",
          "Team DNA balance",
          "Trust",
        ],
        expected:
          "Sarah understands the contribution and risks of every proposed team member.",
        href: "/matches",
        hrefLabel: "Open Recommendations",
      },
      {
        title: "Create and review the final team",
        purpose:
          "Atlas provides evidence, but Sarah remains responsible for the final decision.",
        instructions: [
          "Confirm the selected people meet the business requirement.",
          "Confirm availability and role coverage.",
          "Select Create Recommended Team.",
          "Open Teams and confirm the new team appears.",
          "Review the saved purpose, members and recommendation details.",
        ],
        example: [
          "Team status: Active",
          "Team Leader: Sarah Johnson",
          "Members: 5",
          "Purpose: GCP cloud migration",
        ],
        expected:
          "The Cloud Migration Team appears in Teams with its members, purpose and recommendation summary.",
        href: "/teams",
        hrefLabel: "Open Teams",
      },
    ],
  },
  {
    id: "friendship",
    icon: "♡",
    title: "Create a Friendship Group",
    userStory:
      "Raj has moved to Leeds and wants to meet people who enjoy walking, technology and food.",
    goal:
      "Create a compatible social group using interests, availability, location and social preferences.",
    estimatedTime: "12–15 minutes",
    role: "Group Organiser",
    dataset: "friendship",
    prerequisites: [
      "A private Friendship workspace exists.",
      "Members have explicitly joined or accepted invitations.",
      "Friendship profiles have discovery and matching consent configured.",
      "Atlas Friendship questions have been completed.",
    ],
    evaluates: [
      "Shared interests",
      "Location",
      "Availability",
      "Social energy",
      "Reliability",
      "Inclusion",
      "Communication preferences",
    ],
    outcome:
      "A friendship group designed around compatibility and shared activities without exposing private answers.",
    successCriteria: [
      "The Friendship workspace is private.",
      "Members have Friendship profiles.",
      "Discovery and matching consent are appropriate.",
      "A focused activity pool exists.",
      "The organiser reviews the recommendation before creating the group.",
    ],
    commonMistakes: [
      "Using a Business profile for a friendship scenario.",
      "Enabling public discovery without clear consent.",
      "Matching only on interests and ignoring availability.",
      "Assuming similar personalities always create the best group.",
    ],
    steps: [
      {
        title: "Create or select a private Friendship workspace",
        purpose:
          "The workspace keeps the friendship network separate from workplace and public profiles.",
        instructions: [
          "Open Workspaces.",
          "Create a private Friendship workspace.",
          "Add a clear purpose and local area.",
          "Confirm only approved members can join.",
        ],
        example: [
          "Workspace name: Leeds Social Circle",
          "Type: Friendship",
          "Location: Leeds",
          "Visibility: Private",
        ],
        expected:
          "Leeds Social Circle is active and separate from all Business workspaces.",
        href: "/workspaces",
        hrefLabel: "Open Workspaces",
      },
      {
        title: "Create Friendship profiles",
        purpose:
          "Friendship profiles capture social preferences without changing Business Team DNA.",
        instructions: [
          "Open My Profile.",
          "Create a Friendship profile.",
          "Add interests, preferred activities, meeting frequency and general location.",
          "Review discovery and profile visibility settings.",
        ],
        example: [
          "Interests: Walking, Technology, Restaurants, Travel",
          "Preferred activities: Weekend walks and coffee",
          "Location: Leeds",
          "Availability: Weekends",
        ],
        expected:
          "Each participating member has a separate Friendship profile.",
        href: "/profile",
        hrefLabel: "Open My Profile",
      },
      {
        title: "Complete Friendship Atlas questions",
        purpose:
          "Atlas learns social preferences while reusing any previously completed core questions.",
        instructions: [
          "Open Atlas Interview.",
          "Select the Friendship profile.",
          "Complete the context questions.",
          "Review the completion confirmation.",
        ],
        example: [
          "Large groups or small groups",
          "Planned or spontaneous activities",
          "Preferred meeting frequency",
          "Quiet activities or nightlife",
        ],
        expected:
          "The Friendship profile has a completed and separate Team DNA.",
        href: "/atlas",
        hrefLabel: "Open Atlas",
      },
      {
        title: "Review privacy and discovery",
        purpose:
          "Friendship matching must only use information the member has agreed to share.",
        instructions: [
          "Open Profile Privacy.",
          "Select the Friendship profile.",
          "Review visibility, searchability and discovery consent.",
          "Confirm Atlas matching is allowed.",
        ],
        example: [
          "Visibility: Workspace only",
          "Discovery: Allowed",
          "Atlas matching: Allowed",
          "Profile photo: Optional",
        ],
        expected:
          "The profile is eligible for the intended friendship scenario without becoming publicly exposed.",
        href: "/profile/privacy",
        hrefLabel: "Open Profile Privacy",
      },
      {
        title: "Create an activity Talent Pool",
        purpose:
          "A focused activity pool prevents unrelated members from being included.",
        instructions: [
          "Open Talent Pools.",
          "Create a Weekend Activities pool.",
          "Add people interested in walking, food, technology or travel.",
          "Check availability before saving.",
        ],
        example: [
          "Pool name: Weekend Activities",
          "Interests: Walking, Food, Technology, Travel",
          "Availability: Saturday or Sunday",
        ],
        expected:
          "The pool contains only people who are relevant and available.",
        href: "/talent-pools",
        hrefLabel: "Open Talent Pools",
      },
      {
        title: "Build and review the group",
        purpose:
          "Atlas recommends a compatible group rather than simply choosing the most similar people.",
        instructions: [
          "Open Team Builder.",
          "Select Leeds Social Circle and Weekend Activities.",
          "Describe the activity and preferred group size.",
          "Review the recommendation and explanations.",
          "Create the group only after checking availability and comfort.",
        ],
        example: [
          "Group name: Leeds Weekend Explorers",
          "Activity: Walking and coffee",
          "Group size: 6",
          "Location: Leeds",
        ],
        expected:
          "A compatible friendship group is created with clear reasons and human approval.",
        href: "/matches",
        hrefLabel: "Open Recommendations",
      },
    ],
  },
  {
    id: "community",
    icon: "♙",
    title: "Organise Community Volunteers",
    userStory:
      "Emma coordinates a food bank and needs a dependable volunteer team for weekend outreach.",
    goal:
      "Build a volunteer group with practical skills, empathy, commitment and reliable coverage.",
    estimatedTime: "12–15 minutes",
    role: "Volunteer Coordinator",
    dataset: "community",
    prerequisites: [
      "A Community workspace exists.",
      "Volunteers have accepted membership.",
      "Community profiles are complete.",
      "Safeguarding and privacy expectations are understood.",
    ],
    evaluates: [
      "Volunteer experience",
      "Commitment",
      "Practical support",
      "Empathy",
      "Languages",
      "Availability",
      "Reliability",
    ],
    outcome:
      "A balanced volunteer group with explainable role coverage and availability.",
    successCriteria: [
      "The workspace purpose is clear.",
      "Volunteer profiles are complete.",
      "A suitable volunteer pool exists.",
      "Required shift and role coverage are visible.",
      "The coordinator approves the final team.",
    ],
    commonMistakes: [
      "Using sensitive personal information in recommendations.",
      "Ignoring safeguarding or accessibility needs.",
      "Failing to confirm shift availability.",
      "Treating Team DNA as a substitute for volunteer checks or training.",
    ],
    steps: [
      {
        title: "Create the Community workspace",
        purpose:
          "The workspace defines the volunteer organisation and keeps data inside an approved boundary.",
        instructions: [
          "Open Workspaces.",
          "Create a Community workspace.",
          "Add the cause, location and purpose.",
          "Confirm the correct Owner and Administrators.",
        ],
        example: [
          "Workspace name: Leeds Community Food Support",
          "Cause: Food bank and outreach",
          "Location: Leeds",
          "Visibility: Private",
        ],
        expected:
          "The Community workspace is active and ready for volunteer membership.",
        href: "/workspaces",
        hrefLabel: "Open Workspaces",
      },
      {
        title: "Create Community profiles",
        purpose:
          "Community profiles describe how volunteers prefer to contribute.",
        instructions: [
          "Open My Profile.",
          "Create a Community profile.",
          "Add causes, volunteer experience, preferred contribution and availability.",
          "Record accessibility needs only where appropriate and consented.",
        ],
        example: [
          "Preferred contribution: Food packing and outreach",
          "Experience: Two years volunteering",
          "Availability: Saturday mornings",
          "Languages: English and Punjabi",
        ],
        expected:
          "Each volunteer has a separate Community profile with matching consent.",
        href: "/profile",
        hrefLabel: "Open My Profile",
      },
      {
        title: "Complete Community Atlas questions",
        purpose:
          "Atlas identifies contribution style, empathy, commitment and organisation preferences.",
        instructions: [
          "Open Atlas.",
          "Select the Community profile.",
          "Complete the context questions.",
          "Review Team DNA confidence and freshness.",
        ],
        example: [
          "Working directly with people or behind the scenes",
          "Practical tasks or organising",
          "Commitment level",
          "Sensitive situations and support",
        ],
        expected:
          "The Community Team DNA is complete and current.",
        href: "/atlas",
        hrefLabel: "Open Atlas",
      },
      {
        title: "Create the volunteer Talent Pool",
        purpose:
          "The pool ensures Atlas considers only volunteers relevant to the activity.",
        instructions: [
          "Open Talent Pools.",
          "Create an Outreach Volunteers pool.",
          "Add volunteers with the required availability and contribution preferences.",
          "Check that inactive or unavailable people are excluded.",
        ],
        example: [
          "Pool name: Weekend Outreach Volunteers",
          "Availability: Saturday morning",
          "Skills: Food support, driving, languages, outreach",
        ],
        expected:
          "The pool contains enough volunteers to cover the activity safely.",
        href: "/talent-pools",
        hrefLabel: "Open Talent Pools",
      },
      {
        title: "Build and review the volunteer team",
        purpose:
          "Atlas helps balance roles and availability but does not replace safeguarding or operational checks.",
        instructions: [
          "Open Team Builder.",
          "Describe the activity, shifts, required roles and team size.",
          "Review the recommendation.",
          "Confirm driver, outreach and support coverage.",
          "Complete any required external safeguarding checks.",
        ],
        example: [
          "Activity: Weekend food delivery and outreach",
          "Team size: 8",
          "Required roles: Coordinator, Driver, Food support, Outreach volunteer",
        ],
        expected:
          "A reviewed volunteer team is created with the required practical and people-support coverage.",
        href: "/matches",
        hrefLabel: "Open Recommendations",
      },
    ],
  },
  {
    id: "sports",
    icon: "◎",
    title: "Build a Sports Squad",
    userStory:
      "James captains a local sports club and needs a balanced squad for the next fixture.",
    goal:
      "Create a squad using playing roles, teamwork, resilience, leadership and availability.",
    estimatedTime: "12–15 minutes",
    role: "Captain or Coach",
    dataset: "sports",
    prerequisites: [
      "A Sports workspace exists.",
      "Players have Sports profiles.",
      "Playing roles and availability are current.",
      "The relevant squad pool exists.",
    ],
    evaluates: [
      "Playing role",
      "Experience",
      "Teamwork",
      "Resilience",
      "Leadership",
      "Tactical awareness",
      "Availability",
    ],
    outcome:
      "A balanced sports squad with visible position coverage and Team DNA contribution.",
    successCriteria: [
      "Required positions are covered.",
      "Players are available.",
      "The squad has leadership and resilience.",
      "The captain reviews the final recommendation.",
    ],
    commonMistakes: [
      "Selecting only the highest individual match scores.",
      "Ignoring position coverage.",
      "Using outdated availability.",
      "Treating Team DNA as a measure of sporting ability.",
    ],
    steps: [
      {
        title: "Create the Sports workspace",
        purpose:
          "The workspace keeps club membership and squad decisions within the correct context.",
        instructions: [
          "Open Workspaces.",
          "Create a Sports workspace.",
          "Add the club, sport and location.",
          "Assign the Captain or Coach as Team Leader.",
        ],
        example: [
          "Workspace name: Northside Sports Club",
          "Sport: Football",
          "Location: Leeds",
        ],
        expected:
          "The Sports workspace is active and ready for player profiles.",
        href: "/workspaces",
        hrefLabel: "Open Workspaces",
      },
      {
        title: "Create Sports profiles",
        purpose:
          "Sports profiles keep playing information separate from Business or Friendship profiles.",
        instructions: [
          "Open My Profile.",
          "Create a Sports profile.",
          "Add sport, position, experience, competitive preference and availability.",
        ],
        example: [
          "Sport: Football",
          "Position: Midfield",
          "Experience: Experienced",
          "Availability: Sunday mornings",
          "Leadership interest: Yes",
        ],
        expected:
          "Each player has a current Sports profile.",
        href: "/profile",
        hrefLabel: "Open My Profile",
      },
      {
        title: "Complete Sports Atlas questions",
        purpose:
          "Atlas captures teamwork, resilience, motivation and leadership style.",
        instructions: [
          "Open Atlas.",
          "Select the Sports profile.",
          "Complete the contextual interview.",
          "Review the resulting Sports Team DNA.",
        ],
        example: [
          "Competitive or recreational",
          "Response after losing",
          "Communication during matches",
          "Captain or supporter preference",
        ],
        expected:
          "The Sports Team DNA is ready for squad matching.",
        href: "/atlas",
        hrefLabel: "Open Atlas",
      },
      {
        title: "Create the squad Talent Pool",
        purpose:
          "The pool identifies the players available for the particular fixture or competition.",
        instructions: [
          "Open Talent Pools.",
          "Create a Fixture Availability pool.",
          "Add available players.",
          "Check position and experience coverage.",
        ],
        example: [
          "Pool name: Sunday Fixture Squad",
          "Availability: Sunday morning",
          "Competition level: Local league",
        ],
        expected:
          "The Talent Pool contains only available players for the fixture.",
        href: "/talent-pools",
        hrefLabel: "Open Talent Pools",
      },
      {
        title: "Build and review the squad",
        purpose:
          "Atlas should improve balance while the Captain or Coach retains the final decision.",
        instructions: [
          "Open Team Builder.",
          "Set the squad size and required positions.",
          "Generate the recommendation.",
          "Review position coverage, Team DNA and confidence.",
          "Adjust the squad where sporting judgement requires it.",
        ],
        example: [
          "Squad name: Sunday XI",
          "Team size: 11",
          "Required roles: Goalkeeper, Defence, Midfield, Attack",
        ],
        expected:
          "A balanced squad is created with the required positions and an explainable recommendation.",
        href: "/matches",
        hrefLabel: "Open Recommendations",
      },
    ],
  },
  {
    id: "education",
    icon: "▥",
    title: "Create an Education Study Group",
    userStory:
      "Priya wants a university revision group with complementary learning and project styles.",
    goal:
      "Create a study group balancing research, planning, presentation and critical review.",
    estimatedTime: "10–12 minutes",
    role: "Student or Tutor",
    prerequisites: [
      "An Education profile exists.",
      "Education Atlas questions are complete.",
      "A private study workspace exists.",
      "Students have consented to participate.",
    ],
    evaluates: [
      "Learning preferences",
      "Subject interests",
      "Research",
      "Planning",
      "Critical review",
      "Presentation",
      "Availability",
    ],
    outcome:
      "A complementary study group where responsibilities can be shared effectively.",
    successCriteria: [
      "Students share the required module or subject.",
      "Availability overlaps.",
      "Research, planning and presentation roles are covered.",
      "The group is approved by the organiser.",
    ],
    commonMistakes: [
      "Using academic attainment as a proxy for Team DNA.",
      "Creating a group without checking timetable availability.",
      "Making sensitive or unsupported claims about learning ability.",
      "Ignoring accessibility requirements.",
    ],
    steps: [
      {
        title: "Create Education profiles",
        purpose:
          "Education profiles describe study and project preferences separately from other contexts.",
        instructions: [
          "Open My Profile.",
          "Create an Education profile.",
          "Add course, subject, study preferences and availability.",
        ],
        example: [
          "Course: Computer Science",
          "Module: Cloud Computing",
          "Study preference: Structured group study",
          "Availability: Tuesday and Thursday evenings",
        ],
        expected:
          "Each student has a separate Education profile.",
        href: "/profile",
        hrefLabel: "Open My Profile",
      },
      {
        title: "Complete Education Atlas questions",
        purpose:
          "Atlas identifies complementary learning and project contribution styles.",
        instructions: [
          "Open Atlas.",
          "Select the Education profile.",
          "Complete questions on research, planning, deadlines and presenting.",
        ],
        example: [
          "Independent or group study",
          "Research or presenting",
          "Deadline planning",
          "Critical review",
        ],
        expected:
          "Education Team DNA is complete and current.",
        href: "/atlas",
        hrefLabel: "Open Atlas",
      },
      {
        title: "Create the study workspace and pool",
        purpose:
          "The workspace and pool keep the recommendation limited to the relevant course or module.",
        instructions: [
          "Create a private Education workspace.",
          "Invite participating students.",
          "Create a Talent Pool for the module.",
          "Check availability and consent.",
        ],
        example: [
          "Workspace: Cloud Computing Study Group",
          "Talent Pool: Semester 1 Students",
          "Module: Cloud Computing",
        ],
        expected:
          "The eligible students are available inside one private pool.",
        href: "/talent-pools",
        hrefLabel: "Open Talent Pools",
      },
      {
        title: "Build and review the study group",
        purpose:
          "Atlas recommends complementary contribution styles rather than ranking academic ability.",
        instructions: [
          "Open Team Builder.",
          "Set the module, group size, deadline and availability.",
          "Generate the recommendation.",
          "Review research, planning, presentation and collaboration balance.",
        ],
        example: [
          "Group name: Cloud Revision Group",
          "Group size: 5",
          "Deadline: End of semester",
          "Meeting time: Thursday evening",
        ],
        expected:
          "A balanced study group is created with complementary working styles.",
        href: "/matches",
        hrefLabel: "Open Recommendations",
      },
    ],
  },
  {
    id: "enterprise",
    icon: "◈",
    title: "Roll Out AutoTeams in an Enterprise",
    userStory:
      "Acme Technology wants to introduce explainable team formation across several departments.",
    goal:
      "Establish a governed operating model for workspaces, roles, profiles, Talent Pools and recommendations.",
    estimatedTime: "30–45 minutes",
    role: "Workspace Owner or Administrator",
    dataset: "business",
    prerequisites: [
      "An agreed business owner exists.",
      "The organisation understands the role model.",
      "Privacy, security and consent expectations are defined.",
      "A pilot population has been selected.",
    ],
    evaluates: [
      "Workspace governance",
      "Role separation",
      "Profile coverage",
      "Consent",
      "Talent readiness",
      "Explainability",
      "Human decision ownership",
    ],
    outcome:
      "A controlled pilot where Administrators manage populations and Team Leaders review explainable recommendations.",
    successCriteria: [
      "Roles and responsibilities are documented.",
      "The pilot workspace is configured.",
      "Profile and Team DNA coverage are monitored.",
      "Talent Pools are governed.",
      "Recommendations remain human-reviewed.",
      "The pilot has clear success measures.",
    ],
    commonMistakes: [
      "Rolling out to the whole organisation before piloting.",
      "Allowing every user to create workspaces or teams.",
      "Using incomplete profiles for important decisions.",
      "Failing to explain how Atlas reaches recommendations.",
      "Treating prototype security controls as production enforcement.",
    ],
    steps: [
      {
        title: "Define the pilot and operating model",
        purpose:
          "A focused pilot reduces risk and helps the organisation learn before scaling.",
        instructions: [
          "Select one department or business area.",
          "Name the Workspace Owner.",
          "Identify Administrators and Team Leaders.",
          "Agree which team decisions are suitable for the pilot.",
          "Define success measures.",
        ],
        example: [
          "Pilot area: Technology",
          "Population: 50 employees",
          "Duration: 8 weeks",
          "Use case: Project team formation",
          "Success measures: Adoption, explainability, time saved and user trust",
        ],
        expected:
          "The pilot has a clear scope, owner, user population and success criteria.",
      },
      {
        title: "Create the enterprise workspace",
        purpose:
          "The workspace establishes the organisational boundary for the pilot.",
        instructions: [
          "Create the pilot workspace.",
          "Add the description and owner.",
          "Confirm the workspace is private.",
          "Avoid mixing Business and personal profile contexts.",
        ],
        example: [
          "Workspace: Acme Technology Pilot",
          "Type: Business",
          "Owner: Head of Engineering",
        ],
        expected:
          "The pilot workspace exists with a named accountable owner.",
        href: "/workspaces",
        hrefLabel: "Open Workspaces",
      },
      {
        title: "Configure roles and membership",
        purpose:
          "Role separation prevents Team Members from managing workspaces or creating unauthorised teams.",
        instructions: [
          "Assign one Owner.",
          "Assign a small number of Administrators.",
          "Assign approved Team Leaders.",
          "Add remaining employees as Team Members.",
          "Review pending invitations.",
        ],
        example: [
          "Owner: Platform Director",
          "Administrators: 2",
          "Team Leaders: 5",
          "Team Members: 42",
        ],
        expected:
          "Users have the minimum role needed for their responsibilities.",
        href: "/profile/membership",
        hrefLabel: "Open Membership",
      },
      {
        title: "Configure privacy and security",
        purpose:
          "The organisation must establish how profiles may be used and how privileged access will be protected.",
        instructions: [
          "Review contextual profile visibility.",
          "Review Atlas matching and aggregated insight consent.",
          "Review email verification.",
          "Document the future MFA requirement for privileged roles.",
          "Confirm sensitive characteristics are excluded from scoring.",
        ],
        example: [
          "Business profile visibility: Workspace only",
          "Atlas matching: Allowed",
          "Research use: Disabled",
          "MFA: Required before production launch",
        ],
        expected:
          "The pilot has an agreed privacy and security configuration.",
        href: "/profile/privacy",
        hrefLabel: "Open Privacy",
      },
      {
        title: "Onboard the pilot population",
        purpose:
          "Recommendations should not begin until sufficient profile and Team DNA coverage exists.",
        instructions: [
          "Invite the pilot population.",
          "Ask each employee to create a Business profile.",
          "Ask each employee to complete Atlas.",
          "Monitor incomplete and stale profiles.",
          "Provide support to users who need help.",
        ],
        example: [
          "Target Business profile coverage: 90%",
          "Target completed Atlas interviews: 80%",
          "Maximum stale profiles: 5%",
        ],
        expected:
          "The pilot reaches the agreed readiness threshold.",
        href: "/team-dna",
        hrefLabel: "Open Team DNA",
      },
      {
        title: "Create governed Talent Pools",
        purpose:
          "Talent Pools give Administrators control over which populations Team Leaders may use.",
        instructions: [
          "Create pools by department, capability, location or programme.",
          "Name an owner for each pool.",
          "Review membership regularly.",
          "Remove inactive or ineligible people.",
        ],
        example: [
          "Engineering and Product",
          "Data and AI",
          "Leeds Technology",
          "Cloud Migration Programme",
        ],
        expected:
          "Team Leaders can choose approved pools rather than searching the whole organisation.",
        href: "/talent-pools",
        hrefLabel: "Open Talent Pools",
      },
      {
        title: "Run a controlled Team Leader scenario",
        purpose:
          "The organisation should validate that recommendations are understandable and useful.",
        instructions: [
          "Select a real but low-risk project team requirement.",
          "Ask an approved Team Leader to use Team Builder.",
          "Review recommendation explanations.",
          "Record where human judgement changes the proposed team.",
          "Collect feedback from the Team Leader and selected members.",
        ],
        example: [
          "Use case: Internal cloud enablement team",
          "Team size: 5",
          "Duration: 12 weeks",
        ],
        expected:
          "The pilot produces an explainable recommendation and documented feedback.",
        href: "/matches",
        hrefLabel: "Open Recommendations",
      },
      {
        title: "Review trust, outcomes and next steps",
        purpose:
          "The pilot should only scale if users understand and trust the process.",
        instructions: [
          "Review adoption and completion data.",
          "Review user feedback.",
          "Review recommendation explanations and overrides.",
          "Identify privacy, security or usability gaps.",
          "Decide whether to extend, change or stop the pilot.",
        ],
        example: [
          "Time to create team",
          "Team Leader confidence",
          "Percentage of recommendations changed",
          "Profile completion",
          "User trust feedback",
        ],
        expected:
          "The organisation has evidence to decide whether AutoTeams should move to the next phase.",
        href: "/trust-centre",
        hrefLabel: "Open Trust Centre",
      },
    ],
  },
];

export function PlaybooksPage() {
  const [selectedId, setSelectedId] = useState<PlaybookId>("business");
  const [progress, setProgress] = useState<Record<string, number[]>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setProgress(raw ? JSON.parse(raw) : {});
    } catch {
      setProgress({});
    }
  }, []);

  const selected = useMemo(
    () => playbooks.find((item) => item.id === selectedId) || playbooks[0],
    [selectedId],
  );

  const completedSteps = progress[selected.id] || [];
  const completion = Math.round(
    (completedSteps.length / selected.steps.length) * 100,
  );

  function toggleStep(index: number) {
    const current = progress[selected.id] || [];
    const updated = current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index];

    const next = {
      ...progress,
      [selected.id]: updated,
    };

    setProgress(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function startScenario() {
    if (selected.dataset) {
      applyDemoDataset(selected.dataset);
      setMessage(
        `${selected.title} demo data loaded. Read the instructions below and begin at Step 1.`,
      );
    } else {
      setMessage("This playbook uses the current local workspace data.");
    }
  }

  function resetProgress() {
    const next = {
      ...progress,
      [selected.id]: [],
    };

    setProgress(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setMessage("Progress reset for this playbook.");
  }

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={`container ${styles.heroGrid}`}>
          <div>
            <span className="eyebrow">AutoTeams Playbooks</span>
            <h1>Follow complete instructions, not just links.</h1>
            <p>
              Each playbook explains the user story, prerequisites, example
              values, expected results and success criteria without requiring
              you to leave this page.
            </p>
          </div>

          <aside>
            <small>Selected playbook</small>
            <strong>{selected.title}</strong>
            <div>
              <span>{completion}% complete</span>
              <div className={styles.progressTrack}>
                <i style={{ width: `${completion}%` }} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className={styles.body}>
        <div className={`container ${styles.layout}`}>
          <aside className={styles.selector}>
            <span className="eyebrow">Playbook library</span>
            <h2>Choose a user story</h2>

            <div className={styles.playbookList}>
              {playbooks.map((playbook) => (
                <button
                  className={playbook.id === selected.id ? styles.active : ""}
                  key={playbook.id}
                  onClick={() => {
                    setSelectedId(playbook.id);
                    setMessage("");
                  }}
                  type="button"
                >
                  <span>{playbook.icon}</span>
                  <div>
                    <strong>{playbook.title}</strong>
                    <small>{playbook.role}</small>
                  </div>
                </button>
              ))}
            </div>

            <Link className="button secondary" href="/product-guide">
              Product Guide
            </Link>
          </aside>

          <section className={styles.main}>
            <article className={styles.storyCard}>
              <div className={styles.storyHeading}>
                <div>
                  <span className="eyebrow">User story</span>
                  <h2>{selected.title}</h2>
                </div>
                <span>{selected.icon}</span>
              </div>

              <blockquote>{selected.userStory}</blockquote>

              <div className={styles.storyMeta}>
                <div>
                  <small>Goal</small>
                  <strong>{selected.goal}</strong>
                </div>
                <div>
                  <small>Who performs it</small>
                  <strong>{selected.role}</strong>
                </div>
                <div>
                  <small>Estimated time</small>
                  <strong>{selected.estimatedTime}</strong>
                </div>
              </div>

              <div className={styles.actions}>
                <button className="button" onClick={startScenario} type="button">
                  Load Sample Data
                </button>
                <button
                  className="button secondary"
                  onClick={resetProgress}
                  type="button"
                >
                  Reset Progress
                </button>
              </div>

              {message && <div className={styles.success}>{message}</div>}
            </article>

            <article className={styles.prerequisiteCard}>
              <span className="eyebrow">Before starting</span>
              <h2>Prerequisites</h2>
              <div className={styles.checkList}>
                {selected.prerequisites.map((item) => (
                  <div key={item}>
                    <span>✓</span>
                    <p>{item}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.stepsCard}>
              <div className={styles.sectionHeading}>
                <div>
                  <span className="eyebrow">Detailed instructions</span>
                  <h2>Complete each step in sequence.</h2>
                  <p>
                    Read the full instruction first. The page button is optional
                    and is provided only when you are ready to perform the step.
                  </p>
                </div>
                <strong>
                  {completedSteps.length}/{selected.steps.length}
                </strong>
              </div>

              <div className={styles.instructionSteps}>
                {selected.steps.map((step, index) => {
                  const complete = completedSteps.includes(index);

                  return (
                    <article
                      className={complete ? styles.instructionComplete : ""}
                      key={step.title}
                    >
                      <header>
                        <button
                          aria-label={`Mark ${step.title} ${
                            complete ? "incomplete" : "complete"
                          }`}
                          onClick={() => toggleStep(index)}
                          type="button"
                        >
                          {complete ? "✓" : String(index + 1).padStart(2, "0")}
                        </button>

                        <div>
                          <span>Step {index + 1}</span>
                          <h3>{step.title}</h3>
                          <p>{step.purpose}</p>
                        </div>
                      </header>

                      <section className={styles.instructionBody}>
                        <div>
                          <h4>Instructions</h4>
                          <ol>
                            {step.instructions.map((instruction) => (
                              <li key={instruction}>{instruction}</li>
                            ))}
                          </ol>
                        </div>

                        {step.example && (
                          <div className={styles.exampleBox}>
                            <h4>Example values</h4>
                            <ul>
                              {step.example.map((example) => (
                                <li key={example}>{example}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className={styles.expectedBox}>
                          <h4>Expected result</h4>
                          <p>{step.expected}</p>
                        </div>
                      </section>

                      <footer>
                        <label>
                          <input
                            type="checkbox"
                            checked={complete}
                            onChange={() => toggleStep(index)}
                          />
                          Mark this step complete
                        </label>

                        {step.href && (
                          <Link className="button secondary" href={step.href}>
                            {step.hrefLabel || "Open Page"}
                          </Link>
                        )}
                      </footer>
                    </article>
                  );
                })}
              </div>
            </article>

            <section className={styles.outcomeGrid}>
              <article>
                <span className="eyebrow">Success criteria</span>
                <h2>How you know the story is complete</h2>
                <div className={styles.checkList}>
                  {selected.successCriteria.map((item) => (
                    <div key={item}>
                      <span>✓</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article>
                <span className="eyebrow">Common mistakes</span>
                <h2>What to avoid</h2>
                <div className={styles.mistakeList}>
                  {selected.commonMistakes.map((item) => (
                    <div key={item}>
                      <span>!</span>
                      <p>{item}</p>
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </section>

          <aside className={styles.side}>
            <article>
              <span className="eyebrow">Atlas evaluates</span>
              <h2>Signals used</h2>
              <div className={styles.signalList}>
                {selected.evaluates.map((item) => (
                  <span key={item}>✓ {item}</span>
                ))}
              </div>
            </article>

            <article>
              <span className="eyebrow">Expected outcome</span>
              <h2>What success looks like</h2>
              <p>{selected.outcome}</p>
            </article>

            <article>
              <span className="eyebrow">Human control</span>
              <h2>Atlas recommends. You decide.</h2>
              <p>
                Atlas provides evidence and explanations. A person remains
                responsible for reviewing the recommendation and making the
                final team or group decision.
              </p>
            </article>
          </aside>
        </div>
      </section>
    </main>
  );
}
