"use client";

import { useState } from 'react';
import Header from "@/components/custom/Header";
interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
}

export default function LeaderboardPage() {
  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: "0x934...G27EM", score: 3000 },
    { rank: 2, name: "0x17A...P54KW", score: 2900 },
    { rank: 3, name: "0x83D...X89JQ", score: 2700 },
    { rank: 4, name: "0x92B...Z72LP", score: 2500 },
    { rank: 5, name: "0xA45...T43MQ", score: 2300 },
    { rank: 6, name: "0xC56...R12OP", score: 2100 },
    { rank: 7, name: "0xDF6...Q56NR", score: 1900 },
    { rank: 8, name: "0xE78...K34LM", score: 1700 },
    { rank: 9, name: "0xF45...W89KT", score: 1500 },
    { rank: 10, name: "0xB78...V23LP", score: 1300 },
  ]);

  return (
    <div className="min-h-screen bg-black text-white">
        <Header />
      <div className="max-w-3xl mx-auto py-[60px]">
        <h1 className="text-4xl font-bold text-center mb-8">Leaderboard for <span className="text-yellow-400">Nov</span></h1>
        
        <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden p-6">
          {leaderboard.map((entry, index) => (
            <div key={entry.rank} className={`flex justify-between items-center py-4 ${index !== leaderboard.length - 1 ? 'border-b border-gray-700' : ''}`}>
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-4">{entry.rank}</span>
                <span className="text-xl">{entry.name}</span>
              </div>
              <span className="text-xl font-semibold">{entry.score}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}