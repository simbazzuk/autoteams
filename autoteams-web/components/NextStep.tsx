import Link from "next/link";

export function NextStep({
  eyebrow = "Next step",
  title,
  text,
  href,
  label = "Continue",
  time,
}: {
  eyebrow?: string;
  title: string;
  text: string;
  href: string;
  label?: string;
  time?: string;
}) {
  return (
    <section className="ux14-next-step-block">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
      <div>
        {time && <span>{time}</span>}
        <Link className="button" href={href}>{label}</Link>
      </div>
    </section>
  );
}
