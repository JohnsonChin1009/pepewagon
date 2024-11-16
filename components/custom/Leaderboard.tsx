"use client";

import { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export default function Leaderboard() {
  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: "Player 1", score: 1000 },
    { rank: 2, name: "Player 2", score: 900 },
    { rank: 3, name: "Player 3", score: 800 },
    // Add more entries as needed
  ]);

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Leaderboard for <span className="text-yellow-400">Nov</span></h1>
        
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {leaderboard.map((entry) => (
                <tr key={entry.rank} className="hover:bg-gray-800 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">{entry.rank}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{entry.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}