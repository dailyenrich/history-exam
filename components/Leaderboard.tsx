import React from 'react';
import { User } from '../types';

interface LeaderboardProps {
  currentScore: number;
  users: { username: string; score: number }[];
  onRestart: () => void;
  isGameOver: boolean;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ currentScore, users, onRestart, isGameOver }) => {
  const sortedUsers = [...users].sort((a, b) => b.score - a.score).slice(0, 5);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-paper w-full max-w-md rounded-lg shadow-2xl overflow-hidden border-4 border-wood relative">
        <div className="bg-seal-red text-white p-4 text-center">
          <h2 className="text-3xl font-serif font-bold">
            {isGameOver ? "闯关失败" : "金榜题名"}
          </h2>
        </div>

        <div className="p-6 text-center">
          {isGameOver && (
             <div className="mb-6">
                <div className="text-6xl mb-2">📜</div>
                <p className="text-xl text-ink font-bold">本次得分: {currentScore}</p>
                <p className="text-sm text-gray-600">历史长河浩浩汤汤，少侠请重新来过。</p>
             </div>
          )}

          <div className="bg-white/50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-bold text-wood mb-3 border-b border-wood/30 pb-2">英雄榜</h3>
            <ul className="space-y-2">
              {sortedUsers.map((user, index) => (
                <li key={index} className="flex justify-between items-center text-ink">
                  <span className="flex items-center gap-2">
                    <span className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs text-white font-bold
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-wood'}
                    `}>
                      {index + 1}
                    </span>
                    {user.username}
                  </span>
                  <span className="font-mono font-bold">{user.score} 关</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={onRestart}
            className="w-full bg-seal-red hover:bg-red-800 text-white font-bold py-3 px-6 rounded shadow-lg transition-transform transform active:scale-95 text-lg"
          >
            {isGameOver ? "再次挑战" : "继续"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
