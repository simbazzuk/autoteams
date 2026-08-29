"use client";

const steps = [
  { n:"01", icon:"◯", title:"Create profiles", text:"Add the people AutoTeams is allowed to consider.", tone:"blue" },
  { n:"02", icon:"👥", title:"Choose people", text:"Select the available group or candidate population.", tone:"purple" },
  { n:"03", icon:"🎯", title:"Describe the objective", text:"Explain what the team or group needs to achieve.", tone:"orange" },
  { n:"04", icon:"🤖", title:"Atlas analyses", text:"Atlas evaluates fit, strengths, gaps and risks.", tone:"cyan" },
  { n:"05", icon:"💡", title:"Review the recommendation", text:"Understand the evidence behind the proposed group.", tone:"amber" },
  { n:"06", icon:"✓", title:"Human decision", text:"Approve, reject or refine the recommendation.", tone:"green" },
];

export function HomeHowAutoTeamsWorksV2() {
  return (
    <section className="how-v2-v71571425" aria-labelledby="how-v2-title-v71571425">
      <div className="container">
        <div className="how-v2-v71571425__hero">
          <div className="how-v2-v71571425__copy">
            <span className="how-v2-v71571425__eyebrow">How AutoTeams works</span>
            <h2 id="how-v2-title-v71571425">
              From people to purpose to explainable recommendation.
            </h2>
            <p>
              The same simple process can be used for a project team, sports squad,
              friendship circle, community group or event.
            </p>
          </div>

          <div className="how-v2-v71571425__visual" aria-hidden="true">
            <div className="how-v2-v71571425__orb">
              <span>👥</span>
            </div>
            <i className="orbit orbit-a"><b /></i>
            <i className="orbit orbit-b"><b /></i>
            <i className="orbit orbit-c"><b /></i>
          </div>
        </div>

        <div className="how-v2-v71571425__journey">
          {steps.map((step, index) => (
            <div className={`how-v2-v71571425__step tone-${step.tone}`} key={step.n}>
              <span className="how-v2-v71571425__number">{step.n}</span>
              <div className="how-v2-v71571425__icon" aria-hidden="true">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <span className="how-v2-v71571425__accent" />
              {index < steps.length - 1 && <span className="how-v2-v71571425__arrow" aria-hidden="true">→</span>}
            </div>
          ))}
        </div>

        <div className="how-v2-v71571425__benefits">
          <div>
            <span>✦</span>
            <div><strong>Explainable AI</strong><small>Clear reasons and confidence behind recommendations.</small></div>
          </div>
          <div>
            <span>🛡</span>
            <div><strong>Privacy by design</strong><small>You control what information is used and who can see it.</small></div>
          </div>
          <div>
            <span>👥</span>
            <div><strong>Better teams, better outcomes</strong><small>Build balanced teams with stronger shared fit.</small></div>
          </div>
        </div>
      </div>
    </section>
  );
}
