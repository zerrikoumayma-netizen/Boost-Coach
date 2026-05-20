import { Save, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMe, getProfile, saveProfile } from "../api/profileApi";
import { Badge, ErrorState, LoadingState, PageHeader } from "../components/ui.jsx";
import { saveRecommendationProfile } from "../data/recommendationEngine";
import s from "../styles/ProfilePage.module.css";

const levels = [
  { value: "BEGINNER",     label: "Débutant" },
  { value: "INTERMEDIATE", label: "Intermédiaire" },
  { value: "ADVANCED",     label: "Avancé" },
];

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const me      = useQuery({ queryKey: ["me"],      queryFn: getMe });
  const profile = useQuery({ queryKey: ["profile"], queryFn: getProfile, retry: false });

  const [form, setForm] = useState({
    age: 18,
    city: "",
    level: "BEGINNER",
    objectives: "",
    hobby: "",
    budget: 0,
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!profile.data) return;
    setForm({
      age:        profile.data.age        || 18,
      city:       profile.data.city       || "",
      level:      profile.data.level      || "BEGINNER",
      hobby:      profile.data.hobby      || "",
      budget:     profile.data.budget     || 0,
      objectives: Array.isArray(profile.data.objectives)
        ? profile.data.objectives.join(", ")
        : [...(profile.data.objectives || [])].join(", "),
    });
  }, [profile.data]);

  const mutation = useMutation({
    mutationFn: (payload) => saveProfile(payload),
    onSuccess: (savedProfile) => {
      setMessage("Profil mis à jour.");
      saveRecommendationProfile(savedProfile);
      queryClient.setQueryData(["profile"], savedProfile);
      queryClient.setQueryData(["profile", "dashboard"], savedProfile);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    const payload = {
      age:        Number(form.age),
      city:       form.city,
      level:      form.level,
      hobby:      form.hobby,
      budget:     Number(form.budget),
      objectives: form.objectives.split(",").map((v) => v.trim()).filter(Boolean),
    };
    mutation.mutate(payload);
  }

  const initials = me.data?.username?.slice(0, 2).toUpperCase() ?? "??";

  return (
    <>
      <PageHeader
        eyebrow="Profil"
        title="Mon profil sportif"
        description="Ces informations servent à orienter les programmes et les recommandations."
      />

      <div className={s.layout}>

        {/* ── Sidebar ── */}
        <aside className={s.summary}>
          {me.isLoading ? (
            <LoadingState />
          ) : me.isError ? (
            <ErrorState error={me.error} />
          ) : (
            <>
              <span className={s.avatar}>{initials}</span>
              <div>
                <h2 className={s.summaryName}>{me.data?.username}</h2>
                <p className={s.summaryEmail}>{me.data?.email}</p>
              </div>
              <Badge tone="green">{me.data?.loyaltyPoints ?? 0} points</Badge>
            </>
          )}
        </aside>

        {/* ── Form card ── */}
        <form className={s.formCard} onSubmit={handleSubmit}>
          <div className={s.sectionHeading}>
            <User size={13} />
            <span>Informations personnelles</span>
          </div>

          {profile.isLoading && <LoadingState />}
          {profile.isError && profile.error?.status !== 404 && (
            <ErrorState error={profile.error} />
          )}

          <div className={s.twoCol}>
            {/* Age */}
            <div className={s.field}>
              <label className={s.fieldLabel}>Âge</label>
              <input
                className={s.input}
                type="number"
                min="10"
                max="100"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
            </div>

            {/* City */}
            <div className={s.field}>
              <label className={s.fieldLabel}>Ville</label>
              <input
                className={s.input}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Casablanca"
              />
            </div>
          </div>

          <div className={s.twoCol}>
            {/* Level */}
            <div className={s.field}>
              <label className={s.fieldLabel}>Niveau</label>
              <select
                className={s.select}
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                {levels.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div className={s.field}>
              <label className={s.fieldLabel}>Budget mensuel (MAD)</label>
              <input
                className={s.input}
                type="number"
                min="0"
                max="100000"
                step="50"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
              />
            </div>
          </div>

          {/* Hobby */}
          <div className={s.field}>
            <label className={s.fieldLabel}>Loisir préféré</label>
            <input
              className={s.input}
              value={form.hobby}
              onChange={(e) => setForm({ ...form, hobby: e.target.value })}
              placeholder="running, yoga, football…"
            />
          </div>

          {/* Objectives */}
          <div className={s.field}>
            <label className={s.fieldLabel}>Objectifs</label>
            <input
              className={s.input}
              value={form.objectives}
              onChange={(e) => setForm({ ...form, objectives: e.target.value })}
              placeholder="endurance, musculation, flexibilité…"
            />
          </div>

          {/* Alerts */}
          {mutation.error && (
            <div className={s.alert}>{mutation.error.message}</div>
          )}
          {message && (
            <div className={`${s.alert} ${s.alertSuccess}`}>{message}</div>
          )}

          <button className={s.btn} type="submit" disabled={mutation.isPending}>
            <Save size={16} />
            {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </form>

      </div>
    </>
  );
}
