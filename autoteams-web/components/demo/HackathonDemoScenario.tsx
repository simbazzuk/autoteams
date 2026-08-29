"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createOwnedWorkspace } from "@/lib/access-bootstrap";
import {
  WorkspacePerson,
  loadActiveWorkspaceId,
  loadPeople,
  loadWorkspaces,
  saveActiveWorkspaceId,
  savePeople,
} from "@/lib/workspaces";

const HACKATHON_WORKSPACE_NAME = "AI Hackathon Challenge";

const hackathonPeople: Array<Pick<WorkspacePerson,
  "name" | "email" | "department" | "jobTitle" | "location" | "strengths">> = [
  { name:"Aisha Khan", email:"aisha.hackathon@autoteams.demo", department:"AI & Data", jobTitle:"AI Engineer", location:"Leeds", strengths:["AI","Machine Learning","Rapid prototyping","Problem solving"] },
  { name:"James Carter", email:"james.hackathon@autoteams.demo", department:"Engineering", jobTitle:"Full-stack Engineer", location:"Manchester", strengths:["Software Engineering","APIs","Delivery","Technical leadership"] },
  { name:"Priya Shah", email:"priya.hackathon@autoteams.demo", department:"Product", jobTitle:"Product Manager", location:"Leeds", strengths:["Product thinking","Customer focus","Prioritisation","Storytelling"] },
  { name:"Tom Wilson", email:"tom.hackathon@autoteams.demo", department:"Design", jobTitle:"UX Designer", location:"Sheffield", strengths:["UX Design","Prototyping","User research","Creativity"] },
  { name:"Maya Patel", email:"maya.hackathon@autoteams.demo", department:"Commercial", jobTitle:"Commercial Strategist", location:"Leeds", strengths:["Commercial thinking","Pitching","Market analysis","Communication"] },
  { name:"Daniel Green", email:"daniel.hackathon@autoteams.demo", department:"Platform", jobTitle:"Cloud Engineer", location:"Manchester", strengths:["Cloud","DevOps","Integration","Reliability"] },
  { name:"Sofia Ahmed", email:"sofia.hackathon@autoteams.demo", department:"Customer", jobTitle:"Service Designer", location:"Leeds", strengths:["Customer journeys","Facilitation","Research","Presentation"] },
  { name:"Ben Taylor", email:"ben.hackathon@autoteams.demo", department:"Data", jobTitle:"Data Analyst", location:"York", strengths:["Data analysis","Insights","Visualisation","Experimentation"] },
  { name:"Chloe Martin", email:"chloe.hackathon@autoteams.demo", department:"Engineering", jobTitle:"Mobile Engineer", location:"Leeds", strengths:["Frontend","Mobile","Prototyping","Collaboration"] },
  { name:"Omar Hussain", email:"omar.hackathon@autoteams.demo", department:"Architecture", jobTitle:"Solution Architect", location:"Manchester", strengths:["Architecture","Systems thinking","Security","Decision making"] },
  { name:"Lucy Brown", email:"lucy.hackathon@autoteams.demo", department:"Change", jobTitle:"Innovation Lead", location:"Leeds", strengths:["Innovation","Facilitation","Leadership","Challenge framing"] },
  { name:"Arjun Singh", email:"arjun.hackathon@autoteams.demo", department:"Business", jobTitle:"Domain Specialist", location:"Bradford", strengths:["Domain knowledge","Process design","Stakeholder management","Communication"] },
];

const recommendedCapabilities = [
  "Software Engineering","AI / Data","Product","UX / Design","Commercial thinking","Presentation",
];

export function HackathonDemoScenario() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => setReady(true), []);

  const workspace = useMemo(
    () => ready ? loadWorkspaces().find((item) => item.name === HACKATHON_WORKSPACE_NAME) : undefined,
    [ready, message],
  );

  const active = Boolean(workspace && loadActiveWorkspaceId() === workspace.id);

  function loadScenario() {
    let target = loadWorkspaces().find((item) => item.name === HACKATHON_WORKSPACE_NAME);

    if (!target) {
      target = createOwnedWorkspace({
        name: HACKATHON_WORKSPACE_NAME,
        type: "organisation",
        description: "Innovation challenge: build an AI-powered customer service prototype in 48 hours.",
      });
    }

    const people = loadPeople();
    const existingEmails = new Set(people.map((person) => person.email.toLowerCase()));

    const additions: WorkspacePerson[] = hackathonPeople
      .filter((person) => !existingEmails.has(person.email.toLowerCase()))
      .map((person, index) => ({
        id: `hackathon-demo-${index + 1}`,
        workspaceId: target!.id,
        name: person.name,
        email: person.email,
        department: person.department,
        jobTitle: person.jobTitle,
        location: person.location,
        status: "active",
        teamDnaStatus: "ready",
        strengths: person.strengths,
      }));

    if (additions.length) savePeople([...people, ...additions]);
    saveActiveWorkspaceId(target.id);

    try {
      window.localStorage.setItem("autoteams-hackathon-preset-v715713", JSON.stringify({
        name: "AI Customer Service Hackathon Team",
        purpose: "Build and pitch an AI-powered customer service prototype within 48 hours.",
        size: 5,
        skills: recommendedCapabilities,
        workingStyle: "Fast-paced, collaborative and experimental",
      }));
    } catch {}

    setMessage(
      additions.length
        ? `${additions.length} hackathon participants loaded. The Hackathon group is now active.`
        : "Hackathon demo is already loaded. The Hackathon group is now active."
    );
  }

  return (
    <section className="hackathon-demo-v715713" data-autoteams-hackathon-demo-v715713="true">
      <div className="hackathon-demo-v715713__heading">
        <div>
          <span>NEW SCENARIO</span>
          <h2>Hackathon & Innovation</h2>
          <p>Build a balanced five-person team for a time-boxed innovation challenge where complementary skills matter as much as individual talent.</p>
        </div>
        <div className="hackathon-demo-v715713__icon" aria-hidden="true">H</div>
      </div>

      <div className="hackathon-demo-v715713__challenge">
        <small>EXAMPLE CHALLENGE</small>
        <strong>Build and pitch an AI-powered customer service prototype in 48 hours.</strong>
      </div>

      <div className="hackathon-demo-v715713__capabilities">
        {recommendedCapabilities.map((item) => <span key={item}>{item}</span>)}
      </div>

      <div className="hackathon-demo-v715713__footer">
        <div>
          <strong>12 demo participants</strong>
          <small>Engineering, AI, Product, Design, Commercial, Cloud and domain expertise.</small>
        </div>
        <div className="hackathon-demo-v715713__actions">
          <button type="button" onClick={loadScenario}>{active ? "Reload Hackathon Demo" : "Load Hackathon Demo"}</button>
          {active && <Link href="/team-builder?context=hackathon">Build Hackathon Team →</Link>}
        </div>
      </div>

      {message && <p className="hackathon-demo-v715713__message">{message}</p>}
    </section>
  );
}
