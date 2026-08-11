"use client";
import {useEffect,useMemo,useState} from "react";
import styles from "./SportsTeamRequirements.module.css";

type Pos="Goalkeeper"|"Defender"|"Midfielder"|"Forward";
type Req={sport:"Football";formation:string;level:string;style:string;positions:Record<Pos,number>;notes:string};
type Props={teamName?:string;outcome?:string};
const KEY="autoteams-sports-requirement-v78";
const FORMS=[
{name:"5-a-side",size:5,positions:{Goalkeeper:1,Defender:1,Midfielder:2,Forward:1}},
{name:"7-a-side",size:7,positions:{Goalkeeper:1,Defender:2,Midfielder:2,Forward:2}},
{name:"9-a-side",size:9,positions:{Goalkeeper:1,Defender:3,Midfielder:3,Forward:2}},
{name:"11-a-side",size:11,positions:{Goalkeeper:1,Defender:4,Midfielder:4,Forward:2}}
] as const;
const LEVELS=["Social","Recreational","Club","Competitive"];
const STYLES=["Balanced","Possession","Counter-attacking","Defensive","Attacking"];
const sports=(v:string)=>/(football|soccer|sport|squad|club|match|player|training|team selection)/i.test(v);

export function SportsTeamRequirements({teamName="",outcome=""}:Props){
 const visible=useMemo(()=>sports(`${teamName} ${outcome}`),[teamName,outcome]);
 const [r,setR]=useState<Req>({sport:"Football",formation:"7-a-side",level:"Social",style:"Balanced",positions:{...FORMS[1].positions},notes:""});
 useEffect(()=>{try{const x=localStorage.getItem(KEY);if(x)setR(JSON.parse(x))}catch{}},[]);
 useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(r))}catch{}},[r]);
 if(!visible)return null;
 const form=FORMS.find(f=>f.name===r.formation)||FORMS[1];
 const total=Object.values(r.positions).reduce((a,b)=>a+b,0);
 const setForm=(name:string)=>{const f=FORMS.find(x=>x.name===name);if(f)setR(c=>({...c,formation:f.name,positions:{...f.positions}}))};
 const upd=(p:Pos,n:number)=>setR(c=>({...c,positions:{...c.positions,[p]:Math.max(0,n)}}));
 return <section className={styles.panel} data-autoteams-sports-intelligence="v7.8">
  <header><div><span>SPORTS INTELLIGENCE</span><h3>Define the team positions you need.</h3><p>AutoTeams has detected a sports-team context. Use structured positions so Atlas can reason about squad balance rather than relying on free text.</p></div><b>⚽ Football</b></header>
  <div className={styles.grid}>
   <label><span>Team format</span><select value={r.formation} onChange={e=>setForm(e.target.value)}>{FORMS.map(f=><option key={f.name}>{f.name}</option>)}</select></label>
   <label><span>Playing level</span><select value={r.level} onChange={e=>setR(c=>({...c,level:e.target.value}))}>{LEVELS.map(x=><option key={x}>{x}</option>)}</select></label>
   <label><span>Preferred style</span><select value={r.style} onChange={e=>setR(c=>({...c,style:e.target.value}))}>{STYLES.map(x=><option key={x}>{x}</option>)}</select></label>
  </div>
  <div className={styles.heading}><div><strong>Required positions</strong><small>Pre-populated from {form.name}</small></div><span>{total}/{form.size} players</span></div>
  <div className={styles.positions}>{(Object.keys(r.positions) as Pos[]).map(p=><article key={p}><div><span>{p==="Goalkeeper"?"🧤":p==="Defender"?"🛡️":p==="Midfielder"?"🎯":"⚡"}</span><div><strong>{p}</strong><small>{p==="Goalkeeper"?"Goal protection & distribution":p==="Defender"?"Defensive coverage & positioning":p==="Midfielder"?"Link play, control & creativity":"Attacking threat & finishing"}</small></div></div><div className={styles.counter}><button type="button" onClick={()=>upd(p,r.positions[p]-1)}>−</button><b>{r.positions[p]}</b><button type="button" onClick={()=>upd(p,r.positions[p]+1)}>+</button></div></article>)}</div>
  <label className={styles.notes}><span>Additional team context <small>Optional</small></span><textarea value={r.notes} onChange={e=>setR(c=>({...c,notes:e.target.value}))} placeholder="For example: need one defender comfortable playing midfield."/></label>
  <footer><span>✦</span><p><strong>Structured sports data.</strong> v7.8 stores this requirement locally while the Firebase sports profile and recommendation model are prepared for a later release.</p></footer>
 </section>
}
