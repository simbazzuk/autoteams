"use client";
import Link from "next/link";
import {FormEvent,useEffect,useMemo,useState} from "react";
import {useAuth} from "@/components/AuthProvider";
import {Opportunity,OpportunityContext,OpportunityInterest,TeamBlueprint,createOpportunity,expressInterest,findBlueprint,formTeamFromOpportunity,generateTeamBlueprint,loadOpportunities,loadOpportunityInterest,opportunityContextLabel,updateInterestStatus} from "@/lib/opportunities";
import {loadActiveWorkspaceId} from "@/lib/workspaces";
import {loadCloudOpenOpportunities,loadCloudOwnedOpportunities,persistCloudOpportunity,persistCloudInterest,loadCloudInterestForUser,loadCloudInterestForOpportunity,updateCloudInterestStatus,updateCloudOpportunityStatus,persistCloudFormedTeam,linkCloudOpportunityToTeam,addAcceptedCandidateToCloudTeam,updateCloudOpportunityProgress} from "@/lib/opportunities-cloud";
import {OpportunityInvitation,attachTeamToOpportunityInvitations,createOpportunityInvitation,loadOpportunityInvitationsForUser,respondToOpportunityInvitation} from "@/lib/opportunity-invitations-cloud";
import styles from "./OpportunitiesPanel.module.css";

import { CvOpportunityMatch } from "@/components/opportunities/CvOpportunityMatch";
import { AtlasOpportunityRecommendations } from "@/components/opportunities/AtlasOpportunityRecommendations";
const demos:Opportunity[]=[
{id:"demo-ai-good",workspaceId:"public",ownerId:"demo",title:"AI for Good Hackathon",objective:"Form a balanced team to prototype an AI idea with measurable community benefit.",context:"hackathon",location:"Leeds",workingMode:"hybrid",places:2,skills:["AI","Product","Design"],status:"open",organisation:"AutoTeams Community",createdAt:"2026-09-01"},
{id:"demo-ai-transform",workspaceId:"public",ownerId:"demo",title:"Customer AI Transformation Team",objective:"Bring together a cross-functional team to explore and deliver a customer-facing AI capability.",context:"professional",location:"UK",workingMode:"hybrid",places:3,skills:["AI Engineering","Product","Risk"],status:"open",organisation:"Example organisation",createdAt:"2026-09-01"}];

export function OpportunitiesPanel(){
 const {user}=useAuth();const[items,setItems]=useState<Opportunity[]>([]),[interests,setInterests]=useState<OpportunityInterest[]>([]),[creating,setCreating]=useState(false),[message,setMessage]=useState(""),[manageId,setManageId]=useState(""),[blueprints,setBlueprints]=useState<Record<string,TeamBlueprint>>({}),[selected,setSelected]=useState<Record<string,string[]>>({}),[formedTeams,setFormedTeams]=useState<Record<string,{id:string;name:string;count:number}>>({});
 const[incomingInvites,setIncomingInvites]=useState<OpportunityInvitation[]>([]),[inviteBusy,setInviteBusy]=useState("");
 const[memberBusy,setMemberBusy]=useState("");
 const[memberFeedback,setMemberFeedback]=useState<Record<string,{type:"success"|"error"|"info";text:string}>>({});
 // AUTOTEAMS_V715715231_INTEREST_STATE
 const [interestTarget,setInterestTarget]=useState<Opportunity|null>(null);
 const [interestNote,setInterestNote]=useState("");
 const [shareCv,setShareCv]=useState(true);
 const refresh=async()=>{try{const open=await loadCloudOpenOpportunities();const owned=user?await loadCloudOwnedOpportunities(user.uid):[];const merged=[...owned,...open].filter((item,index,array)=>array.findIndex(x=>x.id===item.id)===index);setItems(merged);if(user){const ownInterest=await loadCloudInterestForUser(user.uid);const ownerInterestGroups=await Promise.all(owned.map(o=>loadCloudInterestForOpportunity(o.id)));setInterests([...ownInterest,...ownerInterestGroups.flat()].filter((item,index,array)=>array.findIndex(x=>x.id===item.id)===index));}else{setInterests([]);}}catch(error){console.error("[AutoTeams] Firestore Opportunities refresh failed",error);setItems(loadOpportunities());setInterests(loadOpportunityInterest());setMessage("Shared Opportunities could not be loaded. AutoTeams is showing the local fallback.");}};
useEffect(()=>{void refresh()},[user?.uid]);
/* AUTOTEAMS_V71571512_ATLAS_GAP_PREFILL */
useEffect(()=>{try{const params=new URLSearchParams(window.location.search);if(params.get("atlasGap")!=="1")return;const raw=localStorage.getItem("autoteams-atlas-gap-opportunity-v71512");if(!raw)return;const draft=JSON.parse(raw) as {title?:string;objective?:string;context?:string;places?:number;location?:string;workingMode?:string;skills?:string};setCreating(true);window.setTimeout(()=>{const form=document.getElementById("autoteams-opportunity-create-form") as HTMLFormElement|null;if(!form)return;const setField=(name:string,value:string)=>{const field=form.elements.namedItem(name);if(field instanceof HTMLInputElement||field instanceof HTMLTextAreaElement||field instanceof HTMLSelectElement){field.value=value}};setField("title",draft.title||"");setField("objective",draft.objective||"");setField("context",draft.context||"professional");setField("places",String(draft.places||1));setField("location",draft.location||"Flexible");setField("workingMode",draft.workingMode||"flexible");setField("skills",draft.skills||"");setMessage("Atlas has prepared this Opportunity from a team capability gap. Review it, then publish when ready.");localStorage.removeItem("autoteams-atlas-gap-opportunity-v71512");form.scrollIntoView({behavior:"smooth",block:"start"})},120)}catch(error){console.error("[AutoTeams] Atlas gap Opportunity prefill failed",error)}},[]);
 useEffect(()=>{if(!user){setIncomingInvites([]);return}void loadOpportunityInvitationsForUser(user.uid).then(setIncomingInvites).catch(error=>console.error("[AutoTeams] Opportunity invitations load failed",error))},[user?.uid]);
 const visible=useMemo(()=>[...items,...demos],[items]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();if(!user)return;const f=new FormData(e.currentTarget);const x=createOpportunity({workspaceId:loadActiveWorkspaceId()||"personal",ownerId:user.uid,title:String(f.get("title")||""),objective:String(f.get("objective")||""),context:String(f.get("context")||"professional") as OpportunityContext,location:String(f.get("location")||"Flexible"),workingMode:String(f.get("workingMode")||"flexible") as Opportunity["workingMode"],places:Math.max(1,Number(f.get("places")||1)),skills:String(f.get("skills")||"").split(",").map(s=>s.trim()).filter(Boolean),status:"open",organisation:user.displayName||"AutoTeams member"});try{/* AUTOTEAMS_V715715231_NETWORK_OPPORTUNITY */
const opportunityForm = f;
const networkOpportunity={
  ...x,
  organisation:String(opportunityForm.get("organisation")||x.organisation||user.displayName||"TeamScience member"),
  businessArea:String(opportunityForm.get("businessArea")||""),
  teamName:String(opportunityForm.get("teamName")||""),
  organisationType:String(opportunityForm.get("organisationType")||"Company"),
  aboutOrganisation:String(opportunityForm.get("aboutOrganisation")||""),
} as Opportunity & {
  businessArea?:string;
  teamName?:string;
  organisationType?:string;
  aboutOrganisation?:string;
};
await persistCloudOpportunity(networkOpportunity);await refresh();setManageId(x.id);setCreating(false);setMessage(`"${x.title}" is now published and shared with other signed-in AutoTeams users.`);setTimeout(()=>document.getElementById("autoteams-my-opportunities")?.scrollIntoView({behavior:"smooth",block:"start"}),80)}catch(error){console.error("[AutoTeams] Opportunity publish to Firestore failed",error);setMessage("The Opportunity was saved locally but could not be published to the shared AutoTeams network. Check Firestore rules and try again.");}}
 // AUTOTEAMS_V715715231_INTEREST_FLOW
 async function interest(o:Opportunity){
   if(!user)return;
   setInterestTarget(o);
   setInterestNote("");
   setShareCv(true);
 }

 async function submitInterest(e:FormEvent<HTMLFormElement>){
   e.preventDefault();
   if(!user||!interestTarget)return;

   const created=expressInterest({
     opportunityId:interestTarget.id,
     userId:user.uid,
     displayName:user.displayName||user.email||"TeamScience member",
     email:user.email||"",
   });

   const networkInterest={
     ...created,
     note:interestNote.trim(),
     shareCv,
     updatedAt:new Date().toISOString(),
   } as OpportunityInterest & {
     note?:string;
     shareCv?:boolean;
     updatedAt?:string;
   };

   try{
     await persistCloudInterest(networkInterest);
     await refresh();
     setMessage(`Interest sent for ${interestTarget.title}. The Opportunity owner can now review your profile and Atlas evidence.`);
     setInterestTarget(null);
     setInterestNote("");
     setShareCv(true);
   }catch(error){
     console.error("[TeamScience] Opportunity interest write failed",error);
     setMessage("Your interest could not be shared with the Opportunity owner. Please try again.");
   }
 }

 function opportunityOrg(o:Opportunity){
   return o as Opportunity & {
     businessArea?:string;
     teamName?:string;
     organisationType?:string;
     aboutOrganisation?:string;
   };
 }

 function interestNoteOf(p:OpportunityInterest){
   return (p as OpportunityInterest & {note?:string}).note||"";
 }

 function interestSharesCv(p:OpportunityInterest){
   return Boolean((p as OpportunityInterest & {shareCv?:boolean}).shareCv);
 }

 function interestStatusLabel(status:string){
   if(status==="shortlisted")return "Shortlisted";
   if(status==="invited")return "Invited to join";
   if(status==="declined")return "Not progressing";
   return "Interested";
 }

 function interestStep(status:string){
   if(status==="invited")return 4;
   if(status==="shortlisted")return 3;
   if(status==="declined")return 2;
   return 1;
 }
function openOpportunityManager(o:Opportunity){setManageId(o.id);const existing=blueprints[o.id]||findBlueprint(o.id);if(!existing){const b=generateTeamBlueprint(o);setBlueprints(c=>({...c,[o.id]:b}));setMessage("Opportunity Manager opened. Atlas created a starting Team Blueprint for you to review.");}else{setMessage("Opportunity Manager opened. Review the Team Blueprint and interested people below.");}setTimeout(()=>document.getElementById(`opportunity-manager-${o.id}`)?.scrollIntoView({behavior:"smooth",block:"start"}),60);} function blueprint(o:Opportunity){const b=generateTeamBlueprint(o);setBlueprints(c=>({...c,[o.id]:b}));setManageId(o.id);setMessage("Atlas Team Blueprint created. Review it before selecting people.")}
 async function status(o:Opportunity,p:OpportunityInterest,s:"shortlisted"|"invited"|"declined"){updateInterestStatus(p.id,s);try{await updateCloudInterestStatus(p.id,s);if(s==="invited"&&user){await createOpportunityInvitation({opportunityId:o.id,opportunityTitle:o.title,interestId:p.id,ownerId:user.uid,recipientId:p.userId,recipientName:p.displayName,recipientEmail:p.email,teamId:formedTeams[o.id]?.id});setMessage(`${p.displayName} has been invited to join ${o.title}.`)}await refresh()}catch(error){console.error("[AutoTeams] Opportunity interest status update failed",error);setMessage("The applicant status or invitation could not be updated.")}}
 function toggle(oid:string,id:string){setSelected(c=>{const a=c[oid]||[];return{...c,[oid]:a.includes(id)?a.filter(x=>x!==id):[...a,id]}})}
 async function form(o:Opportunity){if(!user){setMessage("Sign in before forming a team.");return}const ids=selected[o.id]||[];const people=interests.filter(x=>x.opportunityId===o.id&&ids.includes(x.id));if(!people.length){setMessage("Select at least one interested person before forming the team.");return}try{const t=formTeamFromOpportunity(o,people);try{localStorage.setItem("autoteams-team-insights-selected-team-v7121",t.id)}catch{}await persistCloudFormedTeam(t,user.uid,o.context);await attachTeamToOpportunityInvitations(o.id,t.id,user.uid);await linkCloudOpportunityToTeam(o.id,t.id,people.length,o.places,people.length>=o.places?"forming":"open");setFormedTeams(c=>({...c,[o.id]:{id:t.id,name:t.name,count:people.length}}));setMessage(`${t.name} created as an AutoTeams team with ${people.length} selected member(s).`);await refresh();setTimeout(()=>document.getElementById(`formed-team-${o.id}`)?.scrollIntoView({behavior:"smooth",block:"center"}),80)}catch(error){console.error("[AutoTeams] Form team failed",error);setMessage("AutoTeams could not form the team. Check the browser console for details and try again.")}}
 async function addAcceptedToTeam(o:Opportunity,p:OpportunityInterest){if(!user)return;const formed=formedTeams[o.id];if(!formed){const text="Form the AutoTeams team before adding accepted people.";setMemberFeedback(c=>({...c,[p.id]:{type:"info",text}}));setMessage(text);return}setMemberBusy(p.id);setMemberFeedback(c=>({...c,[p.id]:{type:"info",text:`Adding ${p.displayName} to ${formed.name}...`}}));try{const result=await addAcceptedCandidateToCloudTeam(formed.id,user.uid,p.userId);const recruitedCount=Math.max(0,result.memberIds.length-1);await updateCloudOpportunityProgress(o.id,recruitedCount,o.places);setFormedTeams(c=>({...c,[o.id]:{...formed,count:recruitedCount}}));setSelected(c=>({...c,[o.id]:Array.from(new Set([...(c[o.id]||[]),p.id]))}));const text=result.alreadyMember?`${p.displayName} is already a member of ${formed.name}.`:`${p.displayName} has been added to ${formed.name}. ${recruitedCount} of ${o.places} places are now filled.`;setMemberFeedback(c=>({...c,[p.id]:{type:result.alreadyMember?"info":"success",text}}));setMessage(text);await refresh()}catch(error){console.error("[AutoTeams] Accepted candidate add to team failed",error);const text=`Could not add ${p.displayName} to the team. Please try again.`;setMemberFeedback(c=>({...c,[p.id]:{type:"error",text}}));setMessage(text)}finally{setMemberBusy("")}}
 async function respondInvite(invitation:OpportunityInvitation,response:"accepted"|"declined"){if(!user)return;setInviteBusy(invitation.id);try{await respondToOpportunityInvitation(invitation,response);const next=await loadOpportunityInvitationsForUser(user.uid);setIncomingInvites(next);await refresh();setMessage(response==="accepted"?`You accepted the invitation to ${invitation.opportunityTitle}.`:`You declined the invitation to ${invitation.opportunityTitle}.`)}catch(error){console.error("[AutoTeams] Opportunity invitation response failed",error);setMessage("The invitation response could not be saved. Please try again.")}finally{setInviteBusy("")}}
 const myInterestIds=user?interests.filter(x=>x.userId===user.uid).map(x=>x.opportunityId):[];const owned=user?items.filter(x=>x.ownerId===user.uid):[];
 return <main className={styles.page}>
  <section className={styles.hero}><div><span className={styles.eyebrow}>AutoTeams Opportunities</span><h1>People looking for teams. Teams looking for people.</h1><p>Form teams around an objective. Opportunities are not freelance jobs: Atlas supports team formation and humans make the final selection.</p></div>{user&&<button className={styles.createOpportunityButton} type="button" onClick={()=>setCreating(x=>!x)}><span className={styles.createOpportunityIcon} aria-hidden="true">+</span><span>{creating?"Close":"Create Opportunity"}</span></button>}</section>
  
  {/* AUTOTEAMS_V715715222_POSITIONING */}
  <section
    data-opportunity-positioning="v715715222"
    aria-label="What makes TeamScience Opportunities different"
    style={{
      position: "relative",
      overflow: "hidden",
      margin: "18px 0 22px",
      borderRadius: 24,
      padding: "clamp(20px, 3vw, 30px)",
      border: "1px solid rgba(130,110,255,.36)",
      background:
        "radial-gradient(700px 260px at 4% 0%, rgba(195,57,255,.30), transparent 65%), radial-gradient(620px 280px at 100% 100%, rgba(0,211,181,.20), transparent 65%), linear-gradient(120deg, #43207f 0%, #173f91 52%, #087f78 100%)",
      boxShadow: "0 24px 58px rgba(20,25,76,.30)",
    }}
  >
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        width: 230,
        height: 230,
        borderRadius: "50%",
        left: -92,
        top: -112,
        border: "1px solid rgba(255,255,255,.16)",
        boxShadow:
          "0 0 0 34px rgba(255,255,255,.025), 0 0 0 68px rgba(255,255,255,.018)",
      }}
    />

    <div
      style={{
        position: "relative",
        zIndex: 1,
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit, minmax(min(100%, 330px), 1fr))",
        gap: 26,
        alignItems: "center",
      }}
    >
      <div>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            borderRadius: 999,
            padding: "6px 10px",
            marginBottom: 12,
            border: "1px solid rgba(255,255,255,.22)",
            background: "rgba(10,16,48,.20)",
            color: "#e8ddff",
            fontSize: 10,
            fontWeight: 900,
            letterSpacing: ".10em",
            textTransform: "uppercase",
          }}
        >
          <span aria-hidden="true">*</span>
          A different kind of talent network
        </span>

        <h2
          style={{
            margin: 0,
            color: "#fff",
            fontSize: "clamp(24px, 3vw, 38px)",
            lineHeight: 1.08,
            letterSpacing: "-.025em",
          }}
        >
          Not a job board.{" "}
          <span style={{ color: "#d7c4ff" }}>
            Not a CV database.
          </span>
        </h2>

        <div
          style={{
            marginTop: 8,
            color: "#ffe34f",
            fontSize: "clamp(20px, 2.5vw, 31px)",
            lineHeight: 1.15,
            fontWeight: 900,
            letterSpacing: "-.02em",
          }}
        >
          An AI-powered team and opportunity matching network.
        </div>

        <p
          style={{
            margin: "15px 0 0",
            maxWidth: 720,
            color: "rgba(255,255,255,.84)",
            fontSize: 14,
            lineHeight: 1.65,
          }}
        >
          Atlas connects people, skills, career evidence and team needs
          to discover opportunities where people can make an impact.
        </p>
      </div>

      <div
        style={{
          borderLeft: "1px solid rgba(255,255,255,.22)",
          paddingLeft: "clamp(0px, 2.4vw, 28px)",
          display: "grid",
          gap: 12,
        }}
      >
        {[
          ["People, not profiles", "Understand the person beyond a CV."],
          ["Skills, not keywords", "Match real capability with evidence."],
          ["Teams, not vacancies", "Connect people to genuine team needs."],
          ["Impact, not just jobs", "Find where people can make a difference."],
        ].map(([title, description], index) => (
          <div
            key={title}
            style={{
              display: "grid",
              gridTemplateColumns: "34px 1fr",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                width: 34,
                height: 34,
                display: "grid",
                placeItems: "center",
                borderRadius: 11,
                border: "1px solid rgba(255,255,255,.24)",
                background: "rgba(7,20,61,.22)",
                color: "#fff",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              {index === 0 ? "P" : index === 1 ? "S" : index === 2 ? "T" : "I"}
            </span>

            <div>
              <strong
                style={{
                  display: "block",
                  color: "#fff",
                  fontSize: 13,
                  marginBottom: 2,
                }}
              >
                {title}
              </strong>
              <span
                style={{
                  display: "block",
                  color: "rgba(255,255,255,.72)",
                  fontSize: 11,
                  lineHeight: 1.4,
                }}
              >
                {description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: 4,
        background:
          "linear-gradient(90deg, #ffe34f, #ff75dc, #7d77ff, #38e0c1)",
      }}
    />
  </section>
<section className={styles.modes}><article><b>Build from my people</b><span>Use people already in your workspace.</span></article><article><b>Find people</b><span>Publish an opportunity for people to discover.</span></article><article><b>Both</b><span>Start with your team and identify gaps.</span></article></section>
  {message&&<div className={styles.message}>{message}</div>}
  {creating&&<form id="autoteams-opportunity-create-form" className={styles.form} onSubmit={submit}><div className={styles.wide}><span className={styles.eyebrow}>Form a team</span><h2>What are you trying to achieve?</h2><p>Create a team opportunity, not a job advert.</p></div><label>Name<input name="title" required/></label><label>Context<select name="context"><option value="professional">Professional</option><option value="hackathon">Hackathon</option><option value="community">Community</option><option value="sports">Sports</option><option value="education">Education</option><option value="business">Business</option></select></label><label className={styles.wide}>Objective<textarea name="objective" required rows={4}/></label>
{/* AUTOTEAMS_V715715231_ORGANISATION_FIELDS */}
<div className={`${styles.wide} ${styles.organisationSection}`}>
  <div className={styles.organisationHeading}>
    <span className={styles.eyebrow}>Organisation &amp; Team</span>
    <strong>Who is offering this Opportunity?</strong>
    <p>Give people enough context to understand where the team sits and who they would be joining.</p>
  </div>
</div>
<label>Organisation name<input name="organisation" required placeholder="Example Company"/></label>
<label>Organisation type<select name="organisationType"><option>Company</option><option>Startup</option><option>Community</option><option>University</option><option>Public sector</option><option>Other</option></select></label>
<label>Business area / Department<input name="businessArea" placeholder="AI & Agentic Platform"/></label>
<label>Team / Group<input name="teamName" placeholder="Agent Engineering"/></label>
<label className={styles.wide}>About the organisation<textarea name="aboutOrganisation" rows={3} placeholder="A short description of the organisation or team context."/></label><label>Places needed<input name="places" type="number" min="1" defaultValue="3"/></label><label>Location<input name="location"/></label><label>Working style<select name="workingMode"><option value="flexible">Flexible</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label><label>Capabilities<input name="skills" placeholder="AI, Product, Design"/></label><div className={styles.wide}><button className={styles.publishOpportunityButton} type="submit">Publish Opportunity</button></div></form>}
  
  {/* AUTOTEAMS_V715715231_NETWORK_UI */}
  {interestTarget&&(
    <div className={styles.interestOverlay} role="presentation" onClick={()=>setInterestTarget(null)}>
      <form className={styles.interestPanel} onSubmit={submitInterest} onClick={e=>e.stopPropagation()}>
        <div className={styles.interestPanelHeader}>
          <div>
            <span className={styles.eyebrow}>Express interest</span>
            <h2>{interestTarget.title}</h2>
            <p>{interestTarget.organisation}</p>
          </div>
          <button type="button" className={styles.closeInterest} onClick={()=>setInterestTarget(null)} aria-label="Close">×</button>
        </div>

        <div className={styles.shareSummary}>
          <strong>Atlas will share</strong>
          <span>✓ Your TeamScience profile</span>
          <span>✓ Relevant capabilities</span>
          <span>✓ Atlas matching evidence available to the Opportunity</span>
        </div>

        <label className={styles.interestNote}>
          Message to the Opportunity owner
          <textarea
            rows={4}
            value={interestNote}
            onChange={e=>setInterestNote(e.target.value)}
            placeholder="Tell the team why this Opportunity interests you."
          />
        </label>

        <label className={styles.cvConsent}>
          <input type="checkbox" checked={shareCv} onChange={e=>setShareCv(e.target.checked)}/>
          <span>
            <strong>Share my CV intelligence</strong>
            <small>Allow the Opportunity owner to use your approved CV-derived career evidence when reviewing your fit.</small>
          </span>
        </label>

        <p className={styles.consentNote}>
          You remain in control. Expressing interest does not automatically add you to a team.
        </p>

        <div className={styles.interestActions}>
          <button type="button" className="button secondary" onClick={()=>setInterestTarget(null)}>Cancel</button>
          <button type="submit" className="button">Send interest</button>
        </div>
      </form>
    </div>
  )}

  {user&&interests.some(x=>x.userId===user.uid)&&(
    <section className={styles.myJourney}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>My Opportunities</span>
          <h2>Track what happens after you express interest.</h2>
        </div>
      </div>

      <div className={styles.journeyGrid}>
        {interests.filter(x=>x.userId===user.uid).map(p=>{
          const o=visible.find(item=>item.id===p.opportunityId);
          if(!o)return null;
          const step=interestStep(p.status);
          return (
            <article className={styles.journeyCard} key={p.id}>
              <div className={styles.journeyTop}>
                <div>
                  <strong>{o.title}</strong>
                  <span>{o.organisation||"TeamScience Opportunity"}</span>
                </div>
                <em>{interestStatusLabel(p.status)}</em>
{/* AUTOTEAMS_V71571524_OWNER_CHAT */}
{p.status==="invited"&&(
  <Link
    className="button secondary"
    href={`/messages?type=opportunity&id=${encodeURIComponent(o.id)}&scope=${encodeURIComponent(p.userId)}&ownerId=${encodeURIComponent(o.ownerId)}&title=${encodeURIComponent(o.title)}`}
  >
    Message candidate
  </Link>
)}
              </div>

              <div className={styles.lifecycle}>
                {["Interested","Review","Shortlist","Invite"].map((label,index)=>(
                  <div key={label} className={index+1<=step?styles.lifecycleActive:""}>
                    <b>{index+1}</b>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              <p>
                {p.status==="invited"
                  ?"You have been invited to move into the team-joining stage."
                  :p.status==="shortlisted"
                    ?"The Opportunity owner has shortlisted you for further consideration."
                    :p.status==="declined"
                      ?"This Opportunity is not progressing, but your profile remains available for other matches."
                      :"Your interest has been sent. The Opportunity owner can now review your profile and shared evidence."}
              </p>
              {/* AUTOTEAMS_V71571524_CANDIDATE_CHAT */}
              {p.status==="invited"&&user&&(
                <Link
                  className="button"
                  href={`/messages?type=opportunity&id=${encodeURIComponent(o.id)}&scope=${encodeURIComponent(user.uid)}&ownerId=${encodeURIComponent(o.ownerId)}&title=${encodeURIComponent(o.title)}`}
                >
                  Message team owner
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  )}
{owned.length>0&&<section id="autoteams-my-opportunities"><div className={styles.heading}><div><span className={styles.eyebrow}>Manage opportunities</span><h2>Shape the team, review people, then form it.</h2></div></div><div className={styles.ownerGrid}>{owned.map(o=>{const apps=interests.filter(x=>x.opportunityId===o.id),b=blueprints[o.id]||findBlueprint(o.id),expanded=manageId===o.id,sel=selected[o.id]||[];return <article className={styles.ownerCard} key={o.id}><div className={styles.ownerTop}><div><span className={styles.contextBadge}>{opportunityContextLabel(o.context)}</span><h3>{o.title}</h3></div><span className={styles.countBadge}>{apps.length} interested</span></div><div className={styles.ownerActions}><button className="button secondary" onClick={()=>blueprint(o)}>{b?"Refresh Atlas Blueprint":"Generate Atlas Blueprint"}</button><button className="button secondary" onClick={()=>expanded?setManageId(""):openOpportunityManager(o)}>{expanded?"Close manager":"Manage opportunity"}</button></div>{expanded&&<div id={`opportunity-manager-${o.id}`} className={styles.managePanel}><div className={styles.managerIntro}><div><span className={styles.eyebrow}>Opportunity Manager</span><h4>Manage this team formation.</h4><p>Review the Atlas blueprint, publish and recruit, then review people before selecting and forming the team.</p></div><div className={styles.managerSteps}><span className={b?styles.stepDone:styles.stepActive}>1 Blueprint</span><span className={apps.length>0?styles.stepDone:styles.stepActive}>2 Publish & Recruit</span><span className={apps.length>0?styles.stepActive:styles.stepMuted}>3 Review People</span><span className={sel.length>0?styles.stepActive:styles.stepMuted}>4 Select Team</span><span className={sel.length>0?styles.stepActive:styles.stepMuted}>5 Form Team</span></div></div>{b&&<section className={styles.blueprint}><span className={styles.eyebrow}>Atlas Team Blueprint</span><h4>Proposed {b.teamSize}-person team</h4><p>{b.summary}</p><div className={styles.roleGrid}>{b.roles.map(r=><article key={r.id}><strong>{r.title}</strong><span>{r.capabilities.join(", ")}</span><small>{r.reason}</small></article>)}</div><div className={styles.validation}><strong>Validate before forming</strong><span>{b.gapsToValidate.join(" - ")}</span></div></section>}<section className={styles.applicants}><h4>People interested</h4>{apps.length===0?<div className={styles.recruitEmpty}><div className={styles.recruitEmptyIcon} aria-hidden="true">+</div><div><strong>No one has expressed interest yet.</strong><p>Your opportunity is live. Invite people directly or share the opportunity so the right people can discover it.</p><div className={styles.recruitActions}><button type="button" onClick={()=>navigator.clipboard?.writeText(`${window.location.origin}/opportunities?opportunity=${encodeURIComponent(o.id)}`).then(()=>setMessage("Opportunity link copied. Share it with people you want to invite."))}>Copy opportunity link</button><button type="button" onClick={()=>document.getElementById("open-opportunities")?.scrollIntoView({behavior:"smooth",block:"start"})}>View public opportunity</button></div></div></div>:apps.map(p=><article className={styles.applicant} key={p.id}><input type="checkbox" checked={sel.includes(p.id)} onChange={()=>toggle(o.id,p.id)}/><div><strong>{p.displayName}</strong><span>{p.email}</span>
{/* AUTOTEAMS_V715715231_OWNER_INTEREST */}
{interestNoteOf(p)&&<small className={styles.interestMessage}>“{interestNoteOf(p)}”</small>}
<small className={styles.shareStatus}>{interestSharesCv(p)?"CV intelligence shared":"CV not shared"}</small>
</div>
<em>{interestStatusLabel(p.status)}</em><div className={styles.personActions}>
  {/* AUTOTEAMS_V7157152441_STATUS_ARITY_FIX */}
  {/* AUTOTEAMS_V7157152442_STATUS_ORDER_FIX */}
  {/* AUTOTEAMS_V715715244_OWNER_CHAT */}
  {p.status==="invited" ? (
    <>
      <Link
        className="button secondary"
        href={`/messages?type=opportunity&id=${encodeURIComponent(o.id)}&scope=${encodeURIComponent(p.userId)}&ownerId=${encodeURIComponent(o.ownerId)}&title=${encodeURIComponent(o.title)}`}
      >
        Message candidate
      </Link>
      <button onClick={()=>status(o,p,"declined")}>Pass</button>
    </>
  ) : p.status==="shortlisted" ? (
    <>
      <button onClick={()=>status(o,p,"invited")}>Invite</button>
      <button onClick={()=>status(o,p,"declined")}>Pass</button>
    </>
  ) : p.status==="declined" ? (
    <span>Not progressing</span>
  ) : (
    <>
      <button onClick={()=>status(o,p,"shortlisted")}>Shortlist</button>
      <button onClick={()=>status(o,p,"invited")}>Invite</button>
      <button onClick={()=>status(o,p,"declined")}>Pass</button>
    </>
  )}
</div>{memberFeedback[p.id]&&<small role="status">{memberFeedback[p.id].text}</small>}</article>)}</section>{apps.length>0&&<div className={styles.formTeamBar} id={`formed-team-${o.id}`}><div>{formedTeams[o.id]?<><strong>{formedTeams[o.id].name} formed</strong><span>{formedTeams[o.id].count} of {o.places} places filled</span></>:<><strong>{sel.length} selected</strong><span>Target: {o.places} people</span></>}</div>{formedTeams[o.id]?<Link className="button" href="/team-insights">View Team Insights</Link>:<button className="button" disabled={sel.length===0} onClick={()=>form(o)}>{sel.length===0?"Select people first":"Form AutoTeams Team"}</button>}</div>}</div>}</article>})}</div></section>}
  {user&&incomingInvites.filter(x=>x.status==="pending").length>0&&<section><div className={styles.heading}><div><span className={styles.eyebrow}>Opportunity invitations</span><h2>Teams inviting you to join.</h2></div></div><div className={styles.grid}>{incomingInvites.filter(x=>x.status==="pending").map(inv=><article className={styles.card} key={inv.id}><div className={styles.top}><span>Invitation</span><span>Pending</span></div><h3>{inv.opportunityTitle}</h3><b>{inv.recipientName}</b><p>You have been invited to join this team opportunity.</p><div className={styles.action}><button className="button" disabled={inviteBusy===inv.id} onClick={()=>respondInvite(inv,"accepted")}>{inviteBusy===inv.id?"Saving...":"Accept invitation"}</button><button className="button secondary" disabled={inviteBusy===inv.id} onClick={()=>respondInvite(inv,"declined")}>Decline</button></div></article>)}</div></section>}
    {/* AUTOTEAMS_V71571522_RECOMMENDATIONS */}
  {user ? (
    <AtlasOpportunityRecommendations
      opportunities={visible}
      userId={user.uid}
      interestedOpportunityIds={myInterestIds}
      onInterest={interest}
    />
  ) : null}

  {/* AUTOTEAMS_V715715231_NETWORK_FLOW */}
  <section className={styles.networkFlow}>
    <div>
      <span className={styles.eyebrow}>How it works</span>
      <strong>From match to team.</strong>
    </div>
    {["Discover","Express interest","Owner review","Shortlist","Invite","Join team"].map((label,index)=>(
      <div className={styles.networkStep} key={label}>
        <b>{index+1}</b>
        <span>{label}</span>
      </div>
    ))}
  </section>
<div className={styles.heading}><div><span className={styles.eyebrow}>Open opportunities</span><h2>Find a team you can contribute to.</h2></div>{!user&&<Link className="button secondary" href="/signup">Create profile</Link>}</div>
  <section id="open-opportunities" className={styles.grid}>{visible.filter(x=>x.status==="open").map(o=><article id={`opportunity-${o.id}`} className={styles.card} key={o.id}><div className={styles.top}><span>{opportunityContextLabel(o.context)}</span><span>{o.places} places</span></div><h3>{o.title}</h3><b>{o.organisation}</b>
{/* AUTOTEAMS_V715715231_ORG_TRAIL */}
{(opportunityOrg(o).businessArea||opportunityOrg(o).teamName)&&(
  <div className={styles.organisationTrail}>
    {opportunityOrg(o).businessArea&&<span>{opportunityOrg(o).businessArea}</span>}
    {opportunityOrg(o).teamName&&<span>{opportunityOrg(o).teamName}</span>}
  </div>
)}<p>{o.objective}</p><div className={styles.meta}>{o.location} - {o.workingMode}</div><div className={styles.skills}>{o.skills.map(s=><span key={s}>{s}</span>)}</div>
        {/* AUTOTEAMS_V715715214_CV_MATCH */}
        {user && user.uid !== o.ownerId ? (
          <CvOpportunityMatch opportunity={o} />
        ) : null}
<div className={styles.action}>{!user?<Link className="button" href={`/signup?opportunity=${o.id}&intent=join`}>Create profile to explore</Link>:user.uid===o.ownerId?<button className="button secondary" onClick={()=>openOpportunityManager(o)}>Manage opportunity</button>:<button className="button" disabled={myInterestIds.includes(o.id)} onClick={()=>interest(o)}>{myInterestIds.includes(o.id)?"Interest registered":"I'm interested"}</button>}</div></article>)}</section>
 </main>
}




