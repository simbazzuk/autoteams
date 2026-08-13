"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {academyCourses,availableAcademyCourses} from "@/lib/academy/course-catalogue";
import styles from "./CourseCatalogue.module.css";
import journey from "./LearningPaths.module.css";
const KEY="autoteams-academy-progress-v71";
const ASSESSMENT_KEY="autoteams-academy-assessments-v72";
type Progress=Record<string,string[]>;
type Assessments=Record<string,{score:number;passed:boolean}>;
function read<T>(key:string,fallback:T):T{try{return JSON.parse(localStorage.getItem(key)||JSON.stringify(fallback))}catch{return fallback}}
export function CourseCatalogue(){
 const [progress,setProgress]=useState<Progress>({});
 const [assessments,setAssessments]=useState<Assessments>({});
 useEffect(()=>{setProgress(read(KEY,{}));setAssessments(read(ASSESSMENT_KEY,{}))},[]);
 const total=availableAcademyCourses.reduce((n,c)=>n+c.modules.length,0);
 const done=availableAcademyCourses.reduce((n,c)=>n+Math.min(progress[c.slug]?.length||0,c.modules.length),0);
 const passed=availableAcademyCourses.filter(c=>assessments[c.slug]?.passed).length;
 const overall=total?Math.round(done/total*100):0;
 const recommended=useMemo(()=>availableAcademyCourses.find(c=>(progress[c.slug]?.length||0)>0&&!assessments[c.slug]?.passed)||availableAcademyCourses.find(c=>!assessments[c.slug]?.passed)||availableAcademyCourses[0],[progress,assessments]);
 return <main className={`${styles.page} ${journey.page}`} data-autoteams-academy-refresh="v7.13.81">
  <section className={journey.hero}><div><span>TEAM SCIENCE ACADEMY</span><h1>Your Team Science learning journey.</h1><p>Learn the principles, apply them in AutoTeams, and progressively develop the skills to understand, build and improve better teams.</p></div><aside><strong>{overall}%</strong><span>overall progress</span><div><i style={{width:`${overall}%`}}/></div><small>{done}/{total} lessons · {passed}/{availableAcademyCourses.length} courses passed</small></aside></section>
  {recommended&&<section className={journey.recommended}><b>✦</b><div><small>ATLAS RECOMMENDS NEXT</small><strong>{recommended.title}</strong><p>{progress[recommended.slug]?.length?"Continue where you left off and complete the remaining lessons.":"This is the next recommended step in your Team Science learning journey."}</p></div><Link href={`/academy/course/${recommended.slug}`}>{progress[recommended.slug]?.length?"Continue course":"Start course"} →</Link></section>}
  <section><div className={journey.heading}><div><span>LEARNING PATH</span><h2>Build capability step by step.</h2></div><p>Start with the foundations, then move through practical team design, explainable AI and team development.</p></div>
  <div className={journey.path}>{availableAcademyCourses.map((c,i)=>{const d=Math.min(progress[c.slug]?.length||0,c.modules.length),pct=Math.round(d/c.modules.length*100),ok=assessments[c.slug]?.passed;return <article key={c.slug}><b>{ok?"✓":i+1}</b><div><span>{c.pathway}</span><strong>{c.title}</strong><small>{c.level} · {c.minutes} mins · {c.modules.length} modules</small><div><i style={{width:`${pct}%`}}/></div></div></article>})}</div></section>
  <section><div className={journey.heading}><div><span>AVAILABLE NOW</span><h2>Team Science courses</h2></div><p>Complete modules, take the assessment and earn your certificate.</p></div>
  <div className={styles.grid}>{availableAcademyCourses.map(c=>{const d=Math.min(progress[c.slug]?.length||0,c.modules.length),pct=Math.round(d/c.modules.length*100),ok=assessments[c.slug]?.passed;return <article className={styles.card} key={c.slug}><header><b>{c.icon}</b><em>{ok?"PASSED":"AVAILABLE"}</em></header><small>{c.level} · {c.modules.length} modules · {c.minutes} mins</small><h2>{c.title}</h2><p>{c.summary}</p><div className={styles.progress}><span>Progress <strong>{pct}%</strong></span><div><i style={{width:`${pct}%`}}/></div></div><div className={journey.actions}><Link href={`/academy/course/${c.slug}`}>{d?"Continue course":"Start course"} →</Link>{ok&&<span>✓ Course passed · {assessments[c.slug].score}%</span>}</div></article>})}</div></section>
  <section><div className={journey.heading}><div><span>COMING SOON</span><h2>Continue your Team Science journey.</h2></div><p>Future learning expands into leadership, collaboration and advanced AI-assisted team design.</p></div><div className={journey.future}>{academyCourses.filter(c=>!c.available).map(c=><article key={c.slug}><div><b>{c.icon}</b><span>COMING SOON</span></div><small>{c.level} · {c.minutes} mins</small><h3>{c.title}</h3><p>{c.summary}</p></article>)}</div></section>
  <section className={journey.atlas}><b>✦</b><div><strong>Learn with Atlas</strong><p>Ask Atlas for simpler explanations, examples from work, sport or community, or how a lesson connects to the Team Science Engine.</p></div></section>
 </main>
}
