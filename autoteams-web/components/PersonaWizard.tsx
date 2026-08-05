"use client";
import { useState } from "react";

const types = [
  ["Friendship","🤝","Meaningful local groups"],["Business","💼","Project and innovation teams"],
  ["Sports","⚽","Balanced practical teams"],["Education","🎓","Study and project groups"],
  ["Events","🎟️","Networking groups"],["Community","🌍","Volunteer and local teams"],
] as const;

const prompts: Record<string,string[]> = {
  Friendship:["Genuine local friendships","Weekends","Within 10 miles","Technology, football, restaurants, travel","4–6 people"],
  Business:["Principal AI Engineer","Financial services","AI architecture, GCP, platform engineering","Collaborative and structured","Balanced project team"],
  Sports:["Five-a-side football","Intermediate","Midfield","Friendly but competitive","Weekend mornings"],
  Education:["Computer Science","Architecture, research, presentation","Discussion and practical work","Weekday afternoons","Reliable study group"],
  Events:["AI and Cloud conference","Agentic AI, GCP","Meet collaborators","Senior technical leaders","4–6 people"],
  Community:["Homelessness support","Technology, data, organising","Weekends","Leeds area","Deliver local initiatives"],
};

export function PersonaWizard() {
  const [step,setStep]=useState(1);
  const [name,setName]=useState("Sukh");
  const [city,setCity]=useState("Leeds");
  const [type,setType]=useState("Friendship");
  const [values,setValues]=useState(prompts.Friendship);

  function choose(t:string){setType(t);setValues(prompts[t]);}
  function update(i:number,v:string){setValues(current=>current.map((x,index)=>index===i?v:x));}

  return <div className="wizard">
    <div className="wizard-progress">{[1,2,3,4].map(n=><span className={n<=step?"active":""} key={n}/>)}</div>
    {step===1 && <section><span className="eyebrow">Step 1</span><h2>Create your account</h2><div className="form-grid"><label>First name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Email<input defaultValue="sukh@example.com"/></label><label>City<input value={city} onChange={e=>setCity(e.target.value)}/></label><label>Country<select defaultValue="United Kingdom"><option>United Kingdom</option></select></label></div><div className="wizard-actions end"><button className="button" onClick={()=>setStep(2)}>Continue</button></div></section>}
    {step===2 && <section><span className="eyebrow">Step 2</span><h2>What kind of team are you looking for?</h2><div className="type-grid">{types.map(([t,i,d])=><button className={`type-card ${type===t?"selected":""}`} onClick={()=>choose(t)} key={t}><span>{i}</span><strong>{t}</strong><small>{d}</small></button>)}</div><div className="wizard-actions"><button className="button secondary" onClick={()=>setStep(1)}>Back</button><button className="button" onClick={()=>setStep(3)}>Continue</button></div></section>}
    {step===3 && <section><span className="eyebrow">Step 3</span><h2>Create your {type} Persona</h2><p className="lead">Questions change based on the selected team experience.</p><div className="form-grid">{values.map((v,i)=><label key={i}>Matching signal {i+1}<input value={v} onChange={e=>update(i,e.target.value)}/></label>)}</div><div className="notice">Sensitive information should be optional and collected only where relevant, lawful and clearly explained.</div><div className="wizard-actions"><button className="button secondary" onClick={()=>setStep(2)}>Back</button><button className="button" onClick={()=>setStep(4)}>Create Persona</button></div></section>}
    {step===4 && <section><span className="eyebrow">Persona created</span><h2>Your profile is ready for matching.</h2><div className="persona"><div className="persona-head"><div className="persona-id"><span className="avatar">{name.charAt(0).toUpperCase()}</span><span><strong>{name}</strong><small>{type} Persona • {city}</small></span></div><span className="badge">Ready for matching</span></div><div className="chips">{values.map(v=><span className="chip" key={v}>{v}</span>)}</div></div><div className="wizard-actions"><button className="button secondary" onClick={()=>setStep(2)}>Create another Persona</button><button className="button">Find My Team</button></div></section>}
  </div>;
}
