export type TeamContext="work"|"sports"|"friendship"|"community"|"education"|"unknown";

const text=(v:unknown):string =>
  v==null
    ? ""
    : Array.isArray(v)
      ? v.map(text).join(" ")
      : typeof v==="object"
        ? Object.values(v as Record<string,unknown>).map(text).join(" ")
        : String(v).toLowerCase().replace(/[_-]+/g," ");

export function inferTeamContext(v:unknown):TeamContext{
  const t=text(v);

  if(/football|soccer|rugby|cricket|basketball|netball|hockey|sport|squad|goalkeeper|defender|midfielder|forward/.test(t)) return "sports";
  if(/friendship|friend|social circle/.test(t)) return "friendship";
  if(/community|volunteer|charity|fundrais/.test(t)) return "community";
  if(/education|student|study|school|university|college|course/.test(t)) return "education";
  if(/work|business|project|data science|engineering|software|technology|product|finance|marketing|professional/.test(t)) return "work";

  return "unknown";
}

export function inferProfileContext(v:unknown):TeamContext{
  const t=text(v);

  if(/football|soccer|rugby|cricket|basketball|netball|hockey|sport|player|goalkeeper|defender|midfielder|forward|coach/.test(t)) return "sports";
  if(/friendship|friend|social profile/.test(t)) return "friendship";
  if(/community|volunteer|charity/.test(t)) return "community";
  if(/education|student|study|school|university|college/.test(t)) return "education";
  if(/work|business|professional|employee|engineer|developer|data science|analyst|manager|product|finance|marketing/.test(t)) return "work";

  return "unknown";
}

export function filterCandidatesForRequirement<T>(
  candidates:T[],
  requirement:unknown,
):T[]{
  const wanted=inferTeamContext(requirement);

  if(wanted==="unknown") return candidates;

  return candidates.filter((candidate)=>{
    const actual=inferProfileContext(candidate);
    return actual==="unknown" || actual===wanted;
  });
}
