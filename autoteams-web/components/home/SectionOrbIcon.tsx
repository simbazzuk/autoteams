type SectionOrbIconProps = {
  symbol: string;
  ariaLabel: string;
  variant?: "teams" | "academy";
};

export function SectionOrbIcon({
  symbol,
  ariaLabel,
  variant = "teams",
}: SectionOrbIconProps) {
  return (
    <div
      className={`home-section-orb-v71571428 home-section-orb-v71571428--${variant}`}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="home-section-orb-v71571428__core">
        <span aria-hidden="true">{symbol}</span>
      </div>

      <i className="home-section-orb-v71571428__orbit orbit-a">
        <b />
      </i>
      <i className="home-section-orb-v71571428__orbit orbit-b">
        <b />
      </i>
      <i className="home-section-orb-v71571428__orbit orbit-c">
        <b />
      </i>
    </div>
  );
}
