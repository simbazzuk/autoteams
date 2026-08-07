"use client";
import { loadPeople } from "@/lib/workspaces";
import { FirebasePeopleRepository } from "@/lib/repositories/firebase/firebase-people-repository";
import { waitForFirebaseUser } from "@/lib/firebase/auth-ready";
export type PeopleWorkspaceCount={workspaceId:string;local:number;cloud:number}; export type PeopleCloudStatus={signedIn:boolean;localPeopleCount:number;cloudPeopleCount:number;workspaceCounts:PeopleWorkspaceCount[]};
export async function getPeopleCloudStatus():Promise<PeopleCloudStatus>{const lp=loadPeople();const local=count(lp.map(p=>p.workspaceId));const user=await waitForFirebaseUser();if(!user)return{signedIn:false,localPeopleCount:lp.length,cloudPeopleCount:0,workspaceCounts:Object.entries(local).map(([workspaceId,n])=>({workspaceId,local:n,cloud:0}))};const cp=await new FirebasePeopleRepository().list();const cloud=count(cp.map(p=>p.workspaceId));const ids=new Set([...Object.keys(local),...Object.keys(cloud)]);return{signedIn:true,localPeopleCount:lp.length,cloudPeopleCount:cp.length,workspaceCounts:[...ids].map(workspaceId=>({workspaceId,local:local[workspaceId]||0,cloud:cloud[workspaceId]||0}))}}
function count(ids:string[]):Record<string,number>{return ids.reduce<Record<string,number>>((a,id)=>{a[id]=(a[id]||0)+1;return a},{})}
