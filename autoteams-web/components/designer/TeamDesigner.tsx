"use client";

import { useMemo, useState } from "react";
import { candidates } from "@/data/candidates";

const roleTemplates: Record<string,string[]> = {
  "AI Product Team":["Technical Lead","Product Connector","Delivery Builder","Analytical Challenger"],
  "Innovation Squad":["Vision Lead","Creative Explorer","Delivery Builder","Customer Advocate"],
  "Friendship Circle":["Social Organiser","Conversation Starter","Activity Motivator","Reliable Connector"],
  "Community Project":["Community Lead","Organiser","Data & Insight","Volunteer Coordinator"],
};

export function TeamDesigner() {
  const [template,setTemplate]=useState("AI Product Team");
  const [purpose,setPurpose]=useState("Design and launch an AI-powered platform with strong delivery, customer focus and responsible governance.");
  const [teamSize,setTeamSize]=useState(4);
  const [priority,setPriority]=useState("Balanced delivery");
  const [designed,setDesigned]=useState(false);

  const members = useMemo(() => {
    const roles = roleTemplates[template];
    const pool = template==="Friendship Circle"
      ? candidates.filter((candidate)=>candidate.teamType==="Friendship")
      : candidates.filter((candidate)=>candidate.teamType==="Business");
    return Array.from({length:teamSize},(_,index)=>{
      const candidate=pool[index%Math.max(pool.length,1)];
      return {
        name:candidate?.name || `Candidate ${index+1}`,
        role:roles[index%roles.length],
        rationale:[
          "Provides direction and keeps the team aligned.",
          "Connects people, goals and stakeholder needs.",
          "Adds delivery discipline and reliable follow-through.",
          "Challenges assumptions and improves decision quality.",
        ][index%4],
      };
    });
  },[teamSize,template]);

  const confidence=Math.min(96,78+teamSize*3);

  return (
    <div className="designer-layout">
      <section className="card designer-form">
        <span className="eyebrow">AI Team Designer</span><h2>Describe the team you need.</h2>
        <label>Team template<select value={template} onChange={(event)=>setTemplate(event.target.value)}>{Object.keys(roleTemplates).map((item)=><option key={item}>{item}</option>)}</select></label>
        <label>Purpose<textarea value={purpose} onChange={(event)=>setPurpose(event.target.value)} /></label>
        <label>Team size: {teamSize}<input type="range" min="3" max="6" value={teamSize} onChange={(event)=>setTeamSize(Number(event.target.value))} /></label>
        <label>Design priority<select value={priority} onChange={(event)=>setPriority(event.target.value)}>
          <option>Balanced delivery</option><option>Maximum innovation</option><option>Low conflict risk</option><option>Strong leadership</option><option>High social connection</option>
        </select></label>
        <div className="notice">This prototype uses an explainable deterministic design model and a sample candidate pool.</div>
        <button className="button" onClick={()=>setDesigned(true)} type="button">Design my team</button>
      </section>

      <section className="designer-result">
        {!designed ? (
          <div className="card designer-placeholder"><span className="icon">👥</span><h2>Your recommended team will appear here.</h2><p>AutoTeams balances roles, Team DNA, practical constraints and your selected priority.</p></div>
        ) : (
          <>
            <div className="dark-panel designer-summary"><span className="dark-badge">Recommended team design</span><h2>{template}</h2><div className="confidence-score">{confidence}%</div><p>Design confidence</p><div className="chips"><span className="chip">{teamSize} people</span><span className="chip">{priority}</span><span className="chip">Explainable roles</span></div></div>
            <div className="designer-member-list">{members.map((member,index)=>(
              <article className="card designer-member" key={`${member.name}-${index}`}><span className="avatar">{member.name.charAt(0)}</span><div><span className="badge">{member.role}</span><h3>{member.name}</h3><p>{member.rationale}</p></div></article>
            ))}</div>
            <div className="card designer-explanation"><h3>Why this team design?</h3><ul><li>✓ Roles cover direction, connection, delivery and challenge.</li><li>✓ Team size supports practical collaboration.</li><li>✓ The selected priority influences the overall balance.</li><li>✓ Every role contributes to the stated purpose.</li></ul><div className="notice"><strong>Purpose:</strong> {purpose}</div></div>
          </>
        )}
      </section>
    </div>
  );
}
