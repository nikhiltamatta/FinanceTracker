"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Household = {
  id: string;
  name: string;
  inviteCode: string;
  members: { user: { email: string; name: string | null } }[];
};

export function HouseholdPanel({
  household: initial,
}: {
  household: Household | null;
}) {
  const router = useRouter();
  const [household, setHousehold] = useState(initial);
  const [name, setName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [message, setMessage] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/household", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    if (res.ok) {
      setHousehold(data.household);
      setMessage("Household created.");
      router.refresh();
    } else {
      setMessage(data.error);
    }
  }

  async function join(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/household", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "join", inviteCode }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage("Joined household.");
      router.refresh();
    } else {
      setMessage(data.error);
    }
  }

  if (household) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-medium">Household: {household.name}</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Invite code:{" "}
          <code className="rounded bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
            {household.inviteCode}
          </code>
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Share obligations with &quot;Share with household&quot; when editing
          bills.
        </p>
        <ul className="mt-2 text-sm text-zinc-600">
          {household.members.map((m, i) => (
            <li key={i}>{m.user.name ?? m.user.email}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="font-medium">Household</h2>
      <p className="text-sm text-zinc-500">
        Share rent and utilities with a partner. Each person keeps their own
        login.
      </p>
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
      <form onSubmit={create} className="flex flex-wrap gap-2">
        <input
          placeholder="Household name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-3 py-2 text-sm text-white"
        >
          Create
        </button>
      </form>
      <form onSubmit={join} className="flex flex-wrap gap-2">
        <input
          placeholder="Invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
        <button
          type="submit"
          className="rounded-lg border px-3 py-2 text-sm dark:border-zinc-700"
        >
          Join
        </button>
      </form>
    </div>
  );
}
