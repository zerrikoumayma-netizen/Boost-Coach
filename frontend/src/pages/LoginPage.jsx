import { AlertCircle, Lock, LogIn, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../auth/AuthProvider.jsx";
import s from "../styles/LoginPage.module.css";

export default function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
 
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const session = await login(form);
      signIn(session);
      navigate(location.state?.from?.pathname || "/app", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
 
  return (
    <div className={s.shell}>
 
      <div className={s.visual}>
        <div className={s.logo}>
          <div className={s.logoMark}>BC</div>
          <span className={s.logoName}>Boost Coach</span>
        </div>
        <div className={s.visualBody}>
          <span className={s.visualKicker}>Plateforme sportive</span>
          <h2 className={s.visualTitle}>
            Chaque séance<br />
            compte. <em>Chaque</em><br />
            <em>performance</em> aussi.
          </h2>
          <p className={s.visualSub}>
            Événements, coaching et équipements Decathlon —
            tout pour progresser au quotidien.
          </p>
          <div className={s.metrics}>
            <div className={s.metric}>
              <span className={s.metricVal}>4.8k</span>
              <span className={s.metricLbl}>Athlètes</span>
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
      </div>
 
      <div className={s.panel}>
        <div className={s.formWrap}>
 
          <div className={s.formHead}>
            <span className={s.eyebrow}>Connexion</span>
            <h1>Accéder à votre espace</h1>
            <p>Consultez votre catalogue, vos séances et votre profil.</p>
          </div>
 
          <form onSubmit={handleSubmit}>
            <div className={s.fields}>
 
              <div>
                <label className={s.fieldLabel}>Nom Utilisateur</label>
                <div className={s.inputRow}>
                  <span className={s.inputIcon}><User size={15} /></span>
                  <input
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    placeholder="votre_identifiant"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>
 
              <div>
                <label className={s.fieldLabel}>Mot de passe</label>
                <div className={s.inputRow}>
                  <span className={s.inputIcon}><Lock size={15} /></span>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                </div>
              </div>
 
            </div>
 
            {error && (
              <div className={s.alert}>
                <AlertCircle size={14} />
                {error}
              </div>
            )}
 
            <button className={s.btn} type="submit" disabled={loading}>
              {loading
                ? <><span className={s.spinner} />Connexion…</>
                : <><LogIn size={16} />Se connecter</>
              }
            </button>
          </form>
 
          <p className={s.foot}>
            Pas encore de compte ?{" "}
            <Link to="/register">Créer un compte</Link>
          </p>
 
        </div>
      </div>
 
    </div>
  );
}