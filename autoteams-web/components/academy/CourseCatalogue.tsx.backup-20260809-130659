"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {academyCourses} from "@/lib/academy/course-catalogue";
import styles from "./CourseCatalogue.module.css";
const KEY="autoteams-academy-progress-v71";
const ASSESSMENT_KEY="autoteams-academy-assessments-v72";
export function CourseCatalogue(){
 const [progress,setProgress]=useState<Record<string,string[]>>({});
 const [assessments,setAssessments]=useState<Record<string,{score:number;passed:boolean}>>({});
 useEffect(()=>{try{setProgress(JSON.parse(localStorage.getItem(KEY)||"{}"));setAssessments(JSON.parse(localStorage.getItem(ASSESSMENT_KEY)||"{}"))}catch{}},[]);
 const total=academyCourses.reduce((n,c)=>n+c.modules.length,0);
 const done=academyCourses.reduce((n,c)=>n+Math.min(progress[c.slug]?.length||0,c.modules.length),0);
 return <main className={styles.page}>
  <section className={styles.hero}><div><span>TEAM SCIENCE ACADEMY</span><h1>Learn how better teams are built.</h1><p>Structured practical courses connecting Team Science, AutoTeams and Atlas.</p></div><aside><strong>{done}/{total}</strong><small> lessons completed</small><div><i style={{width:`${total?done/total*100:0}%`}}/></div></aside></section>
  <section className={styles.atlas}>✦ <div><strong>Atlas is your learning companion</strong><p>Use Ask Atlas to explain a concept, give another example or connect learning back to AutoTeams.</p></div></section>
  <section className={styles.grid}>{academyCourses.map(c=>{const d=Math.min(progress[c.slug]?.length||0,c.modules.length),pct=Math.round(d/c.modules.length*100);return <article className={styles.card} key={c.slug}><header><b>{c.icon}</b><em>FREE</em></header><small>{c.level} · {c.modules.length} modules · {c.minutes} mins</small><h2>{c.title}</h2><p>{c.summary}</p><div className={styles.progress}><span>Progress <strong>{pct}%</strong></span><div><i style={{width:`${pct}%`}}/></div></div><div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}><Link href={`/academy/course/${c.slug}`}>{d?"Continue course":"Start course"} →</Link>{assessments[c.slug]?.passed&&<span style={{color:"#8fe1ba",fontSize:9,fontWeight:900}}>✓ COURSE PASSED · {assessments[c.slug].score}%</span>}</div></article>})}</section>
  <section className={styles.future}><span>COMING LATER</span><h2>Professional Team Science learning</h2><p>Future releases can add assessments, certificates and practitioner learning.</p></section>
 </main>
}
