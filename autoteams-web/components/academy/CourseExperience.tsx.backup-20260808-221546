"use client";
import { CourseAssessment } from "@/components/academy/CourseAssessment";
import Link from "next/link";
import {useEffect,useState} from "react";
import type {AcademyCourse} from "@/lib/academy/course-catalogue";
import styles from "./CourseExperience.module.css";
const KEY="autoteams-academy-progress-v71";
function read(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}}
export function CourseExperience({course}:{course:AcademyCourse}){
 const [selected,setSelected]=useState(course.modules[0]?.id||"");
 const [done,setDone]=useState<string[]>([]);
 useEffect(()=>{setDone(read()[course.slug]||[])},[course.slug]);
 const module=course.modules.find(m=>m.id===selected)||course.modules[0];
 const pct=Math.round(done.length/course.modules.length*100);
 function complete(){if(done.includes(selected))return;const n=[...done,selected],p=read();p[course.slug]=n;localStorage.setItem(KEY,JSON.stringify(p));setDone(n)}
 function next(){const i=course.modules.findIndex(m=>m.id===selected);if(course.modules[i+1])setSelected(course.modules[i+1].id)}
 return <main className={styles.page}><Link href="/academy">← Team Science Academy</Link>
 <header><b>{course.icon}</b><div><small>{course.level} · {course.minutes} mins</small><h1>{course.title}</h1><p>{course.summary}</p></div></header>
 <div className={styles.topProgress}>Course progress <strong>{pct}%</strong><div><i style={{width:`${pct}%`}}/></div></div>
 <section className={styles.layout}><aside><strong>Course modules</strong>{course.modules.map((m,i)=><button key={m.id} className={selected===m.id?styles.active:""} onClick={()=>setSelected(m.id)}><span>{done.includes(m.id)?"✓":i+1}</span><div><strong>{m.title}</strong><small>{m.minutes} mins</small></div></button>)}</aside>
 <article><small>LESSON · {module.minutes} mins</small><h2>{module.title}</h2><p>{module.summary}</p><p>In Team Science, this matters because a team is a system of people working around a shared purpose. AutoTeams uses evidence to support the decision, while final judgement remains human.</p><p>Think about a real team you know. What was strong, what was missing, and did the team's composition support its intended outcome?</p>
 <div className={styles.reflect}><strong>TEAM SCIENCE REFLECTION</strong><p>How has this principle affected a team you have been part of? What would you deliberately do differently next time?</p></div>
 <div className={styles.atlas}>✦ <div><strong>Ask Atlas about this lesson</strong><p>Ask for another example, a simpler explanation or how this connects to Build Team.</p></div></div>
 <footer><button onClick={complete} disabled={done.includes(selected)}>{done.includes(selected)?"✓ Lesson completed":"Mark lesson complete"}</button><button onClick={next}>Next lesson →</button></footer></article></section>
 <CourseAssessment
   courseSlug={course.slug}
   courseTitle={course.title}
   enabled={done.length === course.modules.length}
 />
</main>
}
