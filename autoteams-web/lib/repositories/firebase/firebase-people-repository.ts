"use client";
import { collection, doc, getDocs, query, setDoc, where } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { waitForFirebaseUser } from "@/lib/firebase/auth-ready";
import type { WorkspacePerson } from "@/lib/workspaces";
import type { PeopleRepository } from "@/lib/repositories/types";
export class FirebasePeopleRepository implements PeopleRepository {
  async list(): Promise<WorkspacePerson[]> {
    const user=await requireCurrentUser(); const db=getFirebaseFirestore();
    const memberships=await getDocs(query(collection(db,"workspaceMemberships"),where("userId","==",user.uid),where("status","==","active")));
    const ids=memberships.docs.map(d=>d.data().workspaceId).filter((v):v is string=>typeof v==="string"&&v.length>0);
    const groups=await Promise.all(ids.map(async workspaceId=>{const s=await getDocs(query(collection(db,"people"),where("workspaceId","==",workspaceId)));return s.docs.map(d=>d.data() as WorkspacePerson)}));
    return groups.flat();
  }
  async save(people:WorkspacePerson[]):Promise<void>{const user=await requireCurrentUser();const db=getFirebaseFirestore();await Promise.all(people.map(p=>setDoc(doc(db,"people",p.id),{...clean(p),updatedBy:user.uid,updatedAt:new Date().toISOString()},{merge:true})))}
  async listByWorkspace(workspaceId:string):Promise<WorkspacePerson[]>{await requireCurrentUser();const db=getFirebaseFirestore();const s=await getDocs(query(collection(db,"people"),where("workspaceId","==",workspaceId)));return s.docs.map(d=>d.data() as WorkspacePerson)}
}
async function requireCurrentUser(){const u=await waitForFirebaseUser();if(!u)throw new Error("A Firebase-authenticated user is required to access Firestore people.");return u}
function clean<T extends object>(v:T):Record<string,unknown>{return Object.fromEntries(Object.entries(v).filter(([,x])=>x!==undefined))}
