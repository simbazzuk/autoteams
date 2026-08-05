import type { ReactNode } from "react";

export function ProductPage({
  eyebrow,
  title,
  text,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: ReactNode;
}) {
  return (
    <>
      <section className="product-page-hero">
        <div className="container">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{text}</p>
        </div>
      </section>
      <section className="product-page-content">
        <div className="container">{children}</div>
      </section>
    </>
  );
}
