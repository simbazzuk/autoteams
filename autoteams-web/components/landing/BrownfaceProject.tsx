import Image from "next/image";
import styles from "./BrownfaceProject.module.css";

export function BrownfaceProject() {
  return (
    <section className={styles.wrap} data-autoteams-brownface-project="true">
      <div className={styles.card}>
        <Image src="/brownface-project.jpg" alt="Brownface" width={92} height={92} className={styles.logo} />
        <div>
          <span>A BROWNFACE PROJECT</span>
          <h2>Independent technology, built around people.</h2>
          <p>AutoTeams is a Brownface project exploring how Team Science and explainable AI can help people build stronger teams across work, sport, friendship and community.</p>
        </div>
      </div>
    </section>
  );
}
