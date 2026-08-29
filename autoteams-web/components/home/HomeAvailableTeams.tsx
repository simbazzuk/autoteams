"use client";

import Link from "next/link";

const opportunities = [
  { id:"ai-for-good-hackathon", category:"Hackathon", icon:"⚡", title:"AI for Good Hackathon", description:"Join a small cross-functional team to prototype an AI idea with a positive community impact.", joined:3, capacity:5, location:"Leeds · Hybrid", tags:["AI / Data","Product","Design"], tone:"hackathon", badge:"2 places", avatars:["A","J","P"] },
  { id:"community-support-project", category:"Community", icon:"♥", title:"Community Support Project", description:"Help organise a local initiative bringing together volunteers, planning and outreach.", joined:6, capacity:8, location:"Leeds · Local", tags:["Community","Planning","Outreach"], tone:"community", badge:"2 places", avatars:["M","S","D","R"] },
  { id:"weekend-football-squad", category:"Sports", icon:"◎", title:"Weekend Football Squad", description:"A friendly local squad looking for people who enjoy playing, teamwork and meeting new people.", joined:8, capacity:11, location:"Leeds · In person", tags:["Football","Teamwork","Social"], tone:"sports", badge:"3 places", avatars:["T","K","A","L"] },
];

export function HomeAvailableTeams() {
  return (
    <section className="home-open-teams-v715714" aria-labelledby="home-open-teams-title-v715714">
      <div className="container">
        <div className="home-open-teams-v715714__intro">
          <div>
            <span className="home-open-teams-v715714__eyebrow">FIND YOUR NEXT TEAM</span>
            <h2 id="home-open-teams-title-v715714">Teams looking for people.</h2>
            <p>See what teams are open, what they are trying to achieve and where your strengths could contribute.</p>
          </div>
          <div className="home-open-teams-v715714__signal">
            <span className="home-open-teams-v715714__pulse" aria-hidden="true" />
            <div><strong>Open opportunities</strong><small>Early-access examples</small></div>
          </div>
        </div>

        <div className="home-open-teams-v715714__grid">
          {opportunities.map((team) => {
            const percent = Math.round((team.joined / team.capacity) * 100);
            return (
              <article className={`home-open-team-card-v715714 home-open-team-card-v715714--${team.tone}`} key={team.id}>
                <header>
                  <div className="home-open-team-card-v715714__icon" aria-hidden="true">{team.icon}</div>
                  <div><span>{team.category}</span><small>{team.location}</small></div>
                  <em>{team.badge} left</em>
                </header>
                <h3>{team.title}</h3>
                <p>{team.description}</p>
                <div className="home-open-team-card-v715714__avatars">
                  <div>{team.avatars.map((a,i)=><span aria-hidden="true" key={`${team.id}-${a}-${i}`}>{a}</span>)}</div>
                  <strong>{team.joined} of {team.capacity} joined</strong>
                </div>
                <div className="home-open-team-card-v715714__progress"><i style={{width:`${percent}%`}} /></div>
                <div className="home-open-team-card-v715714__tags">{team.tags.map(tag=><span key={tag}>{tag}</span>)}</div>
                <Link href={`/signup?team=${encodeURIComponent(team.id)}&intent=join`} className="home-open-team-card-v715714__cta">
                  Create profile to explore <span aria-hidden="true">→</span>
                </Link>
              </article>
            );
          })}
        </div>

        <div className="home-open-teams-v715714__note">
          <span aria-hidden="true">✦</span>
          <p><strong>Early-access preview.</strong> These examples show how public team discovery will work. Live opportunities can replace them as teams opt in to public recruitment.</p>
        </div>
      </div>
    </section>
  );
}
