import {
  Activity,
  AtSign,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Scale,
  Smile,
  Target,
  Trophy,
  TrendingUp,
  User,
  UserPlus,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/authApi";
import { saveRecommendationProfile } from "../data/recommendationEngine";
import s from "../styles/Register.module.css";

const STEP_EXIT_MS = 300;

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

const SPORT_HOBBIES = [
  "Yoga",
  "Camping",
  "Running",
  "Badminton",
  "Natation",
  "Randonnée",
  "Padel",
  "Fitness",
  "Vélo",
  "Marche",
  "Roller",
  "Jeux de plage",
  "Snorkeling",
  "Stretching",
  "Tir à l'arc",
  "Ping-pong",
];

const LEVELS = [
  { value: "BEGINNER", label: "Débutant" },
  { value: "INTERMEDIATE", label: "Intermédiaire" },
  { value: "ADVANCED", label: "Avancé" },
  { value: "EXPERT", label: "Expert" },
];

const initialForm = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  objective: "",
  hobbies: [],
  city: "",
  age: "",
  level: "BEGINNER",
  budget: "",
};

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function updateField(name, value) {
    const nextForm = { ...form, [name]: value };
    setForm(nextForm);
    if (touched[name]) {
      setErrors((current) => ({ ...current, [name]: validateField(name, value, nextForm) }));
    }
    if (name === "password" && touched.confirmPassword) {
      setErrors((current) => ({
        ...current,
        confirmPassword: validateField("confirmPassword", nextForm.confirmPassword, nextForm),
      }));
    }
  }

  function toggleHobby(hobby) {
    setForm((current) => ({
      ...current,
      hobbies: toggleHobbyValue(current.hobbies, hobby),
    }));
  }

  function handleBlur(name) {
    setTouched((current) => ({ ...current, [name]: true }));
    setErrors((current) => ({ ...current, [name]: validateField(name, form[name], form) }));
  }

  function validateStepOne() {
    const fields = ["firstName", "lastName", "username", "email", "password", "confirmPassword"];
    const nextErrors = fields.reduce((result, field) => ({
      ...result,
      [field]: validateField(field, form[field], form),
    }), {});

    setTouched((current) => ({
      ...current,
      ...fields.reduce((result, field) => ({ ...result, [field]: true }), {}),
    }));
    setErrors((current) => ({ ...current, ...nextErrors }));
    return !Object.values(nextErrors).some(Boolean);
  }

  function continueToStepTwo(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!validateStepOne()) return;

    setIsTransitioning(true);
    window.setTimeout(() => {
      setStep(2);
      setIsTransitioning(false);
    }, STEP_EXIT_MS);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!form.objective) {
      setError("Choisissez un objectif principal.");
      return;
    }
    if (!form.hobbies.length) {
      setError("Choisissez au moins un loisir sportif préféré.");
      return;
    }

    setLoading(true);
    try {
      await register({
        username: form.username,
        email: form.email,
        password: form.password,
        objective: form.objective,
        hobby: form.hobbies.join(", "),
        city: form.city,
        age: Number(form.age),
        level: form.level === "EXPERT" ? "ADVANCED" : form.level,
        budget: Number(form.budget),
      });
      saveRecommendationProfile({
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        username: form.username,
        age: Number(form.age),
        city: form.city,
        level: form.level,
        objective: form.objective,
        hobby: form.hobbies.join(", "),
        budget: Number(form.budget),
      });
      setMessage("Compte créé avec succès !");
      window.setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const currentLevel = LEVELS.find((level) => level.value === form.level)?.label ?? "Débutant";
  const selectedObjective = OBJECTIVES.find((objective) => objective.value === form.objective);
  const SelectedObjectiveIcon = selectedObjective?.icon;
  const stepClassName = `${s.stepPanel} ${isTransitioning ? s.stepOut : s.stepIn}`;

  return (
    <div className={s.shell}>
      <section className={s.visual} aria-label="Boost Coach">
        <div className={s.logo}>
          <div className={s.logoMark}>BC</div>
          <span className={s.logoName}>Boost Coach</span>
        </div>

        <div className={s.visualBody}>
          <span className={s.visualKicker}>REJOIGNEZ LA COMMUNAUTE</span>
          <h2 className={s.visualTitle}>
            Votre sport,
            <br />
            vos objectifs,
            <br />
            vos programme.
          </h2>
          <p className={s.visualSub}>
            Creez votre espace sportif et suivez vos seances, vos objectifs et vos progres.
          </p>
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
        </div>
      </section>

      <main className={s.panel}>
        <div className={s.formWrap}>
          <div className={s.stepIndicator} aria-label={`Etape ${step} sur 2`}>
            <span>Step {step} of 2</span>
            <div>
              <span className={`${s.stepDot} ${step === 1 ? s.stepDotActive : ""}`}>1</span>
              <span className={`${s.stepDot} ${step === 2 ? s.stepDotActive : ""}`}>2</span>
            </div>
          </div>

          <div className={s.formHead}>
            <span className={s.eyebrow}>Inscription</span>
            <h1>{step === 1 ? "Creer votre compte" : "Votre profil sportif"}</h1>
            <p>
              {step === 1
                ? "Renseignez vos informations de connexion pour rejoindre Boost Coach."
                : "Ajoutez vos preferences pour personnaliser vos recommandations."}
            </p>
          </div>

          {step === 1 ? (
            <form className={stepClassName} onSubmit={continueToStepTwo} noValidate>
              <div className={s.formSection}>
                <div className={s.sectionHeading}>
                  <UserPlus size={14} />
                  <span>COMPTE</span>
                </div>

                <div className={s.fields}>
                  <div className={s.twoCol}>
                    <TextField
                      name="firstName"
                      label="Prenom"
                      value={form.firstName}
                      error={touched.firstName ? errors.firstName : ""}
                      icon={<User size={18} />}
                      placeholder="Votre prenom"
                      autoComplete="given-name"
                      onBlur={handleBlur}
                      onChange={updateField}
                    />
                    <TextField
                      name="lastName"
                      label="Nom"
                      value={form.lastName}
                      error={touched.lastName ? errors.lastName : ""}
                      icon={<User size={18} />}
                      placeholder="Votre nom"
                      autoComplete="family-name"
                      onBlur={handleBlur}
                      onChange={updateField}
                    />
                  </div>

                  <TextField
                    name="username"
                    label="Nom d'utilisateur"
                    value={form.username}
                    error={touched.username ? errors.username : ""}
                    icon={<AtSign size={18} />}
                    placeholder="boost_runner"
                    autoComplete="username"
                    onBlur={handleBlur}
                    onChange={updateField}
                  />

                  <TextField
                    name="email"
                    label="Email"
                    value={form.email}
                    error={touched.email ? errors.email : ""}
                    icon={<Mail size={18} />}
                    placeholder="vous@exemple.com"
                    type="email"
                    autoComplete="email"
                    onBlur={handleBlur}
                    onChange={updateField}
                  />

                  <TextField
                    name="password"
                    label="Mot de passe"
                    value={form.password}
                    error={touched.password ? errors.password : ""}
                    icon={<Lock size={18} />}
                    placeholder="Minimum 8 caracteres"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    onBlur={handleBlur}
                    onChange={updateField}
                    after={
                      <button
                        className={s.passwordToggle}
                        type="button"
                        onClick={() => setShowPassword((value) => !value)}
                        aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />

                  <TextField
                    name="confirmPassword"
                    label="Confirmer mot de passe"
                    value={form.confirmPassword}
                    error={touched.confirmPassword ? errors.confirmPassword : ""}
                    icon={<Lock size={18} />}
                    placeholder="Repetez le mot de passe"
                    type="password"
                    autoComplete="new-password"
                    onBlur={handleBlur}
                    onChange={updateField}
                  />
                </div>
              </div>

              <button className={s.btn} type="submit">
                Continuer →
              </button>
            </form>
          ) : (
            <form className={stepClassName} onSubmit={handleSubmit}>
              <div className={s.formSection}>
                <div className={s.sectionHeading}>
                  <Target size={14} />
                  <span>PROFIL SPORTIF</span>
                </div>

                <div className={s.fieldWrap}>
                  <label className={s.fieldLabel}>Objectif principal</label>
                  <div className={s.objectiveGrid}>
                    {OBJECTIVES.map(({ value, label, sub, icon: Icon }) => {
                      const isActive = form.objective === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          className={isActive ? `${s.objectiveCard} ${s.objectiveActive}` : s.objectiveCard}
                          onClick={() => updateField("objective", value)}
                        >
                          <span className={s.objectiveIcon}><Icon size={20} /></span>
                          <span className={s.objectiveLabel}>{label}</span>
                          <span className={s.objectiveSub}>{sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={s.fieldWrap}>
                  <label className={s.fieldLabel}>Loisir sportif préféré</label>
                  <div className={s.chipGrid}>
                    {SPORT_HOBBIES.map((hobby) => {
                      const isActive = form.hobbies.includes(hobby);
                      return (
                      <button
                        key={hobby}
                        type="button"
                        className={isActive ? `${s.chip} ${s.chipActive}` : s.chip}
                        onClick={() => toggleHobby(hobby)}
                      >
                        {hobby}
                      </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className={s.formSection}>
                <div className={s.sectionHeading}>
                  <Activity size={14} />
                  <span>INFOS COMPLÉMENTAIRES</span>
                </div>
                <div className={s.twoCol}>
                  <div className={s.fieldWrap}>
                    <label className={s.fieldLabel}>Ville</label>
                    <div className={s.inputRow}>
                      <MapPin className={s.inputIcon} size={18} />
                      <input
                        value={form.city}
                        onChange={(e) => updateField("city", e.target.value)}
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
                      <Activity className={s.inputIcon} size={18} />
                      <input
                        type="number"
                        value={form.age}
                        onChange={(e) => updateField("age", e.target.value)}
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
                        onChange={(e) => updateField("level", e.target.value)}
                        required
                      >
                        {LEVELS.map((level) => (
                          <option key={level.value} value={level.value}>{level.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className={s.fieldWrap}>
                    <label className={s.fieldLabel}>Budget mensuel</label>
                    <div className={s.inputRow}>
                      <Wallet className={s.inputIcon} size={18} />
                      <input
                        type="number"
                        value={form.budget}
                        onChange={(e) => updateField("budget", e.target.value)}
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

              {selectedObjective && (
                <div className={s.profilePreview} aria-live="polite">
                  {SelectedObjectiveIcon && <SelectedObjectiveIcon size={17} />}
                  <span>
                    Profil: {selectedObjective.label} · {form.hobbies.length} sport(s)
                  </span>
                </div>
              )}

              {error && <div className={s.alert}>{error}</div>}
              {message && <div className={`${s.alert} ${s.alertSuccess}`}>{message}</div>}

              <button className={s.btn} type="submit" disabled={loading}>
                {loading ? <><span className={s.spinner} />Création en cours...</> : "Créer mon compte"}
              </button>
            </form>
          )}

          <p className={s.foot}>
            Déjà un compte ? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function toggleHobbyValue(hobbies, hobby) {
  return hobbies.includes(hobby)
    ? hobbies.filter((item) => item !== hobby)
    : [...hobbies, hobby];
}

function TextField({
  name,
  label,
  value,
  error,
  icon,
  placeholder,
  type = "text",
  autoComplete,
  after,
  onBlur,
  onChange,
}) {
  const inputId = `register-${name}`;
  return (
    <div className={`${s.fieldWrap} ${error ? s.fieldInvalid : ""}`}>
      <label className={s.fieldLabel} htmlFor={inputId}>{label}</label>
      <div className={s.inputRow}>
        <span className={s.inputIcon} aria-hidden="true">{icon}</span>
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          onBlur={() => onBlur(name)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {after}
      </div>
      {error && <small className={s.fieldError} id={`${inputId}-error`}>{error}</small>}
    </div>
  );
}

function validateField(name, value, form) {
  const text = String(value || "").trim();
  if (!text) return "Ce champ est obligatoire.";
  if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
    return "Adresse email invalide.";
  }
  if (name === "password" && value.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caracteres.";
  }
  if (name === "confirmPassword" && value !== form.password) {
    return "Les mots de passe ne correspondent pas.";
  }
  return "";
}
