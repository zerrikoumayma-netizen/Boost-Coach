import { AlertCircle, Eye, EyeOff, Lock, User } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/authApi";
import { useAuth } from "../auth/AuthProvider.jsx";
import s from "../styles/LoginPage.module.css";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const session = await login({ username, password });
      signIn(session);
      navigate(location.state?.from?.pathname || "/app", { replace: true });
    } catch (err) {
      setError(err.message || "Connexion impossible. Vérifiez vos identifiants.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={s.shell}>
      <section className={s.visual} aria-label="Boost Coach">
        <div className={s.logo}>
          <div className={s.logoMark}>BC</div>
          <span className={s.logoName}>Boost Coach</span>
        </div>

        <div className={s.visualBody}>
          <span className={s.visualKicker}>Plateforme sportive</span>
          <h2 className={s.visualTitle}>
            Dépassez vos limites.
            <br />
            Gardez le rythme.
          </h2>
          <p className={s.visualSub}>
            Coaching, séances guidées et produits sportifs réunis dans un espace simple,
            rapide et motivant.
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
          <div className={s.formHead}>
            <span className={s.eyebrow}>Connexion</span>
            <h1>Bienvenue sur Boost Coach</h1>
            <p>Connectez-vous pour retrouver vos séances, votre profil et vos produits.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={s.fields}>
              <div>
                <label className={s.fieldLabel} htmlFor="username">
                  Username
                </label>
                <div className={s.inputRow}>
                  <span className={s.inputIcon} aria-hidden="true">
                    <User size={18} strokeWidth={1.9} />
                  </span>
                  <input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Votre identifiant"
                    autoComplete="username"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div>
                <label className={s.fieldLabel} htmlFor="password">
                  Password
                </label>
                <div className={s.inputRow}>
                  <span className={s.inputIcon} aria-hidden="true">
                    <Lock size={18} strokeWidth={1.9} />
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                  />
                  <button
                    className={s.passwordToggle}
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className={s.alert} role="alert">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <button className={s.btn} type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className={s.spinner} />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter →"
              )}
            </button>
          </form>

          <p className={s.foot}>
            Pas encore de compte ? <Link to="/register">Créer un compte</Link>
          </p>
        </div>
      </main>
    </div>
  );
}
