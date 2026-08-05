import type { ReactNode } from "react";

export function ProductPage({
  eyebrow,
  title,
  text,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <section className="v4-page-header">
        <div className="container v4-page-header-inner">
          <div>
            <span className="eyebrow">{eyebrow}</span>
            <h1>{title}</h1>
            <p>{text}</p>
          </div>
          {actions && <div className="v4-page-actions">{actions}</div>}
        </div>
      </section>

      <section className="v4-page-body">
        <div className="container">{children}</div>
      </section>
    </>
  );
}
