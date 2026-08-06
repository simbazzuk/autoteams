"use client";
import {useEffect,useState} from 'react';
import {loadActiveWorkspaceId,loadWorkspaces,saveActiveWorkspaceId,Workspace} from '@/lib/workspaces';
export function WorkspaceSwitcher({value,onChange}:{value?:string;onChange?:(id:string)=>void}){
 const [items,setItems]=useState<Workspace[]>([]); const [selected,setSelected]=useState(value||'');
 useEffect(()=>{const w=loadWorkspaces(), id=value||loadActiveWorkspaceId()||w[0]?.id||'';setItems(w);setSelected(id)},[value]);
 function change(id:string){setSelected(id);saveActiveWorkspaceId(id);onChange?.(id)}
 return <label className="workspace-switcher"><span>Active workspace</span><select value={selected} onChange={e=>change(e.target.value)}>{items.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}</select></label>
}
