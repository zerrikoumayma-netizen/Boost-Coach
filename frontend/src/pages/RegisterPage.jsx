import { Activity, Dumbbell, HeartPulse, MapPin, Scale, Smile, Target, Trophy, TrendingUp, UserPlus, Wallet } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authApi";
import { saveRecommendationProfile, sportHobbies, sportLevels } from "../data/recommendationEngine";
import s from "../styles/Register.module.css";

const OBJECTIVES = [
  {
    value: "Perte de poids",
    label: "Perte de poids",
    sub: "Brûler des calories, affiner la silhouette",
    icon: Scale,
  },
  {
    value: "Prise de poids",
    label: "Prise de poids",
    sub: "Gagner en masse musculaire",
    icon: TrendingUp,
  },
  {
    value: "Loisir & Détente",
    label: "Loisir & Détente",
    sub: "Sport plaisir, bien-être au quotidien",
    icon: Smile,
  },
  {
    value: "Préparation compétition",
    label: "Préparation compétition",
    sub: "Performance, endurance et résultats",
    icon: Trophy,
  },
];

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    objective: "",
    hobby: "",
    city: "",
    age: "",
    level: "BEGINNER",
    budget: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!form.objective) {
      setError("Choisissez un objectif principal.");
      return;
    }
    if (!form.hobby) {
      setError("Choisissez un loisir préféré pour personnaliser les recommandations.");
      return;
    }
    setLoading(true);
    try {
      await register({ ...form, age: Number(form.age), budget: Number(form.budget) });
      saveRecommendationProfile({
        fullName: form.username,
        username: form.username,
        age: Number(form.age),
        city: form.city,
        level: form.level,
        objective: form.objective,
        hobby: form.hobby,
        budget: Number(form.budget),
      });
      setMessage("Compte créé. Redirection vers la connexion…");
      setTimeout(() => navigate("/login"), 650);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentLevel = sportLevels.find((l) => l.value === form.level)?.label ?? "Débutant";

  return (
    <div className={s.shell}>

      <div className={s.visual}>
        <div className={s.logo}>
          <div className={s.logoMark}>BC</div>
          <span className={s.logoName}>Boost Coach</span>
        </div>
        <div className={s.visualBody}>
          <span className={s.visualKicker}>Rejoignez la communauté</span>
          <h2 className={s.visualTitle}>
            Votre sport,<br />
            vos <em>objectifs,</em><br />
            votre <em>programme.</em>
          </h2>
          <p className={s.visualSub}>
            Créez votre profil en quelques secondes et accédez à des plans
            personnalisés, des séances guidées et des événements près de chez vous.
          </p>
          <div className={s.metrics}>
            <div className={s.metric}>
              <span className={s.metricVal}><Dumbbell size={20} /></span>
              <span className={s.metricLbl}>Programmes</span>
            </div>
            <div className={s.metric}>
              <span className={s.metricVal}><Activity size={20} /></span>
              <span className={s.metricLbl}>Sessions</span>
            </div>
            <div className={s.metric}>
              <span className={s.metricVal}><HeartPulse size={20} /></span>
              <span className={s.metricLbl}>Fidélité</span>
            </div>
          </div>
        </div>
      </div>

      <div className={s.panel}>
        <div className={s.formWrap}>

          <div className={s.formHead}>
            <span className={s.eyebrow}>Inscription</span>
            <h1>Créer un compte sportif</h1>
            <p>Quelques informations pour personnaliser vos programmes, produits et événements.</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* ── Section 1: Account ── */}
            <div className={s.formSection}>
              <div className={s.sectionHeading}>
                <UserPlus size={14} />
                <span>Accès au compte</span>
              </div>

              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>Nom complet</label>
                <div className={s.inputRow}>
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="Votre nom"
                    minLength={3}
                    maxLength={50}
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>Email</label>
                <div className={s.inputRow}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="vous@exemple.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>Mot de passe</label>
                <div className={s.inputRow}>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    minLength={6}
                    autoComplete="new-password"
                    required
                  />
                </div>
              </div>
            </div>

            {/* ── Section 2: Sport profile ── */}
            <div className={s.formSection}>
              <div className={s.sectionHeading}>
                <Target size={14} />
                <span>Profil sportif</span>
              </div>

              {/* Objective cards */}
              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>Objectif principal</label>
                <div className={s.objectiveGrid}>
                  {OBJECTIVES.map(({ value, label, sub, icon: Icon }) => {
                    const isActive = form.objective !== "" && form.objective === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        className={isActive ? `${s.objectiveCard} ${s.objectiveActive}` : s.objectiveCard}
                        onClick={() => setForm({ ...form, objective: value })}
                      >
                        <span className={s.objectiveIcon}><Icon size={20} /></span>
                        <span className={s.objectiveLabel}>{label}</span>
                        <span className={s.objectiveSub}>{sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Hobby chips */}
              <div className={s.fieldWrap}>
                <label className={s.fieldLabel}>Loisir sportif préféré</label>
                <div className={s.chipGrid}>
                  {sportHobbies.map((hobby) => {
                    const isActive = form.hobby !== "" && form.hobby === hobby;
                    return (
                      <button
                        key={hobby}
                        type="button"
                        className={isActive ? `${s.chip} ${s.chipActive}` : s.chip}
                        onClick={() => setForm({ ...form, hobby })}
                      >
                        {hobby}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={s.twoCol}>
                <div className={s.fieldWrap}>
                  <label className={s.fieldLabel}>Ville</label>
                  <div className={s.inputRow}>
                    <input
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      placeholder="Casablanca"
                      maxLength={100}
                      autoComplete="address-level2"
                      required
                    />
                  </div>
                </div>
                <div className={s.fieldWrap}>
                  <label className={s.fieldLabel}>Âge</label>
                  <div className={s.inputRow}>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setForm({ ...form, age: e.target.value })}
                      min="10"
                      max="100"
                      placeholder="28"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className={s.twoCol}>
                <div className={s.fieldWrap}>
                  <label className={s.fieldLabel}>Niveau sportif</label>
                  <div className={s.inputRow}>
                    <select
                      value={form.level}
                      onChange={(e) => setForm({ ...form, level: e.target.value })}
                      required
                    >
                      {sportLevels.map((l) => (
                        <option key={l.value} value={l.value}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className={s.fieldWrap}>
                  <label className={s.fieldLabel}>Budget mensuel</label>
                  <div className={s.inputRow}>
                    <span className={s.inputIcon}><Wallet size={15} /></span>
                    <input
                      type="number"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      min="0"
                      max="100000"
                      step="50"
                      placeholder="500"
                      required
                    />
                    <span className={s.inputSuffix}>MAD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile preview */}
            <div className={s.profilePreview} aria-live="polite">
              <MapPin size={15} />
              <span>
                {form.city || "Votre ville"} — {currentLevel} — {form.budget || "0"} MAD/mois
              </span>
            </div>

            {error   && <div className={s.alert}>{error}</div>}
            {message && <div className={`${s.alert} ${s.alertSuccess}`}>{message}</div>}

            <button className={s.btn} type="submit" disabled={loading}>
              {loading
                ? <><span className={s.spinner} />Création en cours…</>
                : <><UserPlus size={16} />Créer le compte</>
              }
            </button>
          </form>

          <p className={s.foot}>
            Déjà un compte ?{" "}
            <Link to="/login">Se connecter</Link>
          </p>

        </div>
      </div>

    </div>
  );
}