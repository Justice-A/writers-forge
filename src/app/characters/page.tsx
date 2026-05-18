"use client";

import { useState } from "react";

export default function CharactersPage() {

  const [characters, setCharacters] = useState([
    {
      id: 1,
      name: "Ade",
      role: "Protagonist",
    },

      {
    id: 2,
    name: "The Uncle",
    role: "Mystic Guardian",
    },

   {
    id: 3,
    name: "Sade",
    role: "Love Interest",
  },
  ]);

  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  function addCharacter() {

  if (!name || !role) return;

  const newCharacter = {
    id: Date.now(),
    name,
    role,
  };

  setCharacters([...characters, newCharacter]);

  setName("");
  setRole("");
}

  return (
    <main className="min-h-screen bg-zinc-950 text-white p-10">

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-5xl font-bold">
          Characters
        </h1>

        <div className="flex flex-col md:flex-row gap-4 items-center bg-zinc-800 p-6 rounded-2xl shadow-lg">

        <input
            type="text"
            placeholder="Character Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-700 border border-zinc-600 rounded-lg px-5 py-4 outline-nonetext-white placeholder-zinc-400 w-full md:w-auto"
        />

        <input
            type="text"
            placeholder="Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-zinc-700 border border-zinc-600 rounded-lg px-5 py-4 outline-none  text-white placeholder-zinc-400 w-full md:w-auto"
        />

        <button
            onClick={addCharacter}
            className="bg-orange-500 hover:bg-orange-400 transition px-8 py-4 rounded-lg font-semibold shadow-md focus:ring-2 focus:ring-orange-300 focus:outline-none w-full md:w-auto"
        >
            Add Character
        </button>

        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {characters.map((character) => (

          <div
            key={character.id}
            className="bg-zinc-800 border border-zinc-700 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-shadow"
          >

            <h2 className="text-2xl font-bold text-white">
              {character.name}
            </h2>

            <p className="text-zinc-400 mt-2">
              {character.role}
            </p>

          </div>

        ))}

      </div>

    </main>
  );
}