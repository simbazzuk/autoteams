import type { TeamDna } from "@/lib/team-intelligence";

const labels: Record<keyof TeamDna, string> = {
  leadership: "Leadership",
  collaboration: "Collaboration",
  communication: "Communication",
  planning: "Planning",
  creativity: "Creativity",
  adaptability: "Adaptability",
  socialEnergy: "Social energy",
  reliability: "Reliability",
};

export function TeamDnaChart({ dna }: { dna: TeamDna }) {
  return (
    <div className="dna-chart">
      {(Object.keys(labels) as (keyof TeamDna)[]).map((key) => (
        <div className="dna-row" key={key}>
          <div className="dna-label">
            <strong>{labels[key]}</strong>
            <span>{dna[key]}%</span>
          </div>
          <div className="bar">
            <span style={{ width: `${dna[key]}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
