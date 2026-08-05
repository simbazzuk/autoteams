"use client";

import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "./AuthProvider";
import { getPersona, updatePersona } from "@/lib/personas";

export function PersonaEditor() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const [accountName, setAccountName] = useState("");
  const [city, setCity] = useState("");
  const [teamType, setTeamType] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      if (!user || !params.id) return;

      try {
        const persona = await getPersona(user.uid, params.id);
        if (!persona) {
          setError("Team Persona not found.");
          return;
        }

        setAccountName(persona.accountName);
        setCity(persona.city);
        setTeamType(persona.teamType);
        setValues(persona.values);
      } catch (caught) {
        console.error(caught);
        setError("Unable to load this Team Persona.");
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [params.id, user]);

  function updateValue(index: number, value: string) {
    setValues((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? value : item
      )
    );
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      await updatePersona(user.uid, params.id, {
        accountName,
        city,
        teamType,
        values,
      });
      router.push("/dashboard");
    } catch (caught) {
      console.error(caught);
      setError("Unable to save your changes.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="card">Loading Team Persona…</div>;

  return (
    <form className="wizard" onSubmit={submit}>
      <span className="eyebrow">Edit Team Persona</span>
      <h2>{teamType} Persona</h2>

      <div className="form-grid">
        <label>
          Display name
          <input
            required
            value={accountName}
            onChange={(event) => setAccountName(event.target.value)}
          />
        </label>
        <label>
          City
          <input
            required
            value={city}
            onChange={(event) => setCity(event.target.value)}
          />
        </label>
        <label>
          Team type
          <select
            value={teamType}
            onChange={(event) => setTeamType(event.target.value)}
          >
            {[
              "Friendship",
              "Business",
              "Sports",
              "Education",
              "Events",
              "Community",
            ].map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </label>

        {values.map((value, index) => (
          <label key={index}>
            Matching signal {index + 1}
            <input
              value={value}
              onChange={(event) => updateValue(index, event.target.value)}
            />
          </label>
        ))}
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="wizard-actions">
        <button
          className="button secondary"
          onClick={() => router.push("/dashboard")}
          type="button"
        >
          Cancel
        </button>
        <button className="button" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
