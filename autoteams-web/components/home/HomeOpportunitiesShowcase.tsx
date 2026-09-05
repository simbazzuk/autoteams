"use client";
import Link from "next/link";
import styles from "./HomeOpportunitiesShowcase.module.css";

const items=[
["JOB","Data & AI Engineer","Technology team","92%","▥"],
["PROJECT","Sustainability Analytics","Innovation project","88%","◎"],
["STARTUP","Product Co-Founder","Early-stage venture","84%","↗"],
["COMMUNITY","Mentor Young Talent","Community initiative","81%","♥"],
];
const steps=[
["01","Discover","Find opportunities aligned to your strengths, interests and goals."],
["02","Understand","See why Atlas believes an opportunity could be a good match."],
["03","Connect","Start a conversation with the right people and teams."],
["04","Grow","Build experience, make an impact and unlock new possibilities."],
];

export function HomeOpportunitiesShowcase(){
return <section className={styles.section} aria-labelledby="opportunities-home-title" data-autoteams-home-opportunities="v7.15.7.15.15.3">
<div className={styles.top}>
<div className={styles.copy}>
<span className={styles.eyebrow}>OPPORTUNITIES</span>
<h2 id="opportunities-home-title">Find your next opportunity — <span>and the right people to help you get there.</span></h2>
<h3>A modern twist on the traditional job board.</h3>
<p>From jobs to projects, collaborations, startup roles and community initiatives — AutoTeams uses Atlas to help surface opportunities that fit your skills, interests and goals, and explain why they could be a good fit.</p>
<div className={styles.benefits}>
<div><b>✓</b> Personalised, explainable recommendations</div>
<div><b>✓</b> More than job titles — discover different ways to contribute</div>
<div><b>✓</b> Connect with people and teams, not just listings</div>
</div>
<Link className={styles.cta} href="/opportunities">Explore Opportunities <span>→</span></Link>
<small>Different opportunities. More possibilities.</small>
</div>
<div className={styles.visual}>
<div className={styles.sun}>A BRIGHTER<br/><strong>YOU</strong></div>
<div className={styles.road} aria-hidden="true"><i/><i/><i/></div>
<div className={`${styles.sign} ${styles.s1}`}>♟ Work with great people</div>
<div className={`${styles.sign} ${styles.s2}`}>✦ Build new skills</div>
<div className={`${styles.sign} ${styles.s3}`}>◇ Make a positive impact</div>
<div className={`${styles.sign} ${styles.s4}`}>● Be part of something bigger</div>
<div className={styles.panel}>
<header><strong>Featured opportunities</strong><Link href="/opportunities">See all →</Link></header>
{items.map(([type,title,org,match,icon])=><Link href="/opportunities" className={styles.item} key={title}>
<b className={styles.icon}>{icon}</b><span><small>{type}</small><strong>{title}</strong><em>{org}</em></span><mark>{match} match</mark><i>›</i>
</Link>)}
</div>
</div>
</div>
<div className={styles.steps}>{steps.map(([n,t,d])=><article key={n}><b>{n}</b><span><strong>{t}</strong><p>{d}</p></span></article>)}</div>
<div className={styles.strip}>
<div>◎ <span><strong>Jobs, projects, startups & more</strong><small>All in one place</small></span></div>
<div>✦ <span><strong>Atlas-powered matching</strong><small>Explainable recommendations</small></span></div>
<div>♟ <span><strong>People-first</strong><small>Real connections, real opportunities</small></span></div>
<div>◇ <span><strong>Positive impact</strong><small>For you, teams and communities</small></span></div>
</div>
</section>
}
