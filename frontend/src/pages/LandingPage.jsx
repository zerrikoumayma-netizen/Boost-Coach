import { ArrowRight, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import s from "./LandingPage.module.css";

const WORDS = ["PERFORMER", "PROGRESSER", "DÉPASSER", "GAGNER", "ÉVOLUER"];

export default function LandingPage() {
  const [entered, setEntered] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setWordIndex((index) => (index + 1) % WORDS.length);
        setVisible(true);
      }, 400);
    }, 2200);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <main className={`${s.page} ${entered ? s.entered : ""}`}>
      <div className={s.bg} aria-hidden="true" />
      <div className={s.overlay} aria-hidden="true" />

      <div className={s.particles} aria-hidden="true">
        {Array.from({ length: 18 }).map((_, index) => (
          <span
            className={s.particle}
            key={index}
            style={{ "--i": index }}
          />
        ))}
      </div>

      <header className={s.logo}>
        <span className={s.logoMark}>BC</span>
        <span className={s.logoName}>Boost Coach</span>
      </header>

      <section className={s.content}>
        <div className={s.kicker}>
          <span className={s.kickerDot} />
          PLATEFORME SPORTIVE · MAROC
        </div>

        <h1 className={s.headline}>
          <span>Chaque jour,</span>
          <span>
            une raison de{" "}
            <strong className={visible ? s.rotatingIn : s.rotatingOut}>
              {WORDS[wordIndex]}
            </strong>
          </span>
          <span className={s.stroke}>plus fort.</span>
        </h1>

        <p className={s.subtitle}>
          Coaching personnalisé, séances guidées et équipements BoostCoach — tout pour
          franchir vos limites au quotidien.
        </p>

        <div className={s.actions}>
          <button className={`${s.cta} ${s.primary}`} type="button" onClick={() => navigate("/login")}>
            <span>Se connecter</span>
            <ArrowRight size={20} />
          </button>
          <button className={`${s.cta} ${s.secondary}`} type="button" onClick={() => navigate("/register")}>
            <span>Créer un compte</span>
            <Plus size={20} />
          </button>
        </div>

        <div className={s.metrics}>
          <div className={s.metric}>
            <span className={s.metricVal}>4.8k</span>
            <span className={s.metricLbl}>Athletes</span>
          </div>
          <div className={s.metric}>
            <span className={s.metricVal}>320</span>
            <span className={s.metricLbl}>Séances</span>
          </div>
          <div className={s.metric}>
            <span className={s.metricVal}>98%</span>
            <span className={s.metricLbl}>Satisfaction</span>
          </div>
        </div>
      </section>

      <div className={s.scrollHint} aria-hidden="true">
        <span />
        <em>scroll</em>
      </div>
    </main>
  );
}
