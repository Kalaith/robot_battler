import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { useTournamentStore } from '../stores/tournamentStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatDisplay } from '../components/ui/StatDisplay';

export const Tournament: React.FC = () => {
  const { setScreen, gold } = useGameStore();
  const { 
    isActive, 
    currentTournament,
    matches,
    wins,
    losses,
    totalRewards,
    startTournament,
    getTournamentProgress
  } = useTournamentStore();

  const progress = getTournamentProgress();

  const tournamentTypes = [
    {
      id: 'rookie',
      name: 'Rookie Tournament',
      description: 'For new pilots. Moderate rewards, easier opponents.',
      difficulty: 'Easy',
      difficultyColor: 'text-green-600',
      icon: '🥉',
      rewards: '120% gold + 100 bonus',
      enemies: 'Easy to Medium bots'
    },
    {
      id: 'veteran',
      name: 'Veteran Championship',
      description: 'For experienced fighters. Good rewards, challenging foes.',
      difficulty: 'Medium',
      difficultyColor: 'text-yellow-600',
      icon: '🥈',
      rewards: '150% gold + 250 bonus',
      enemies: 'Medium to Hard bots'
    },
    {
      id: 'champion',
      name: 'Champion League',
      description: 'For elite pilots only. Maximum rewards, brutal battles.',
      difficulty: 'Hard',
      difficultyColor: 'text-red-600',
      icon: '🥇',
      rewards: '200% gold + 500 bonus',
      enemies: 'Hard to Elite bots'
    }
  ] as const;

  const handleStartTournament = (type: 'rookie' | 'veteran' | 'champion') => {
    startTournament(type);
    setScreen('enemy-selection'); // Reuse enemy selection but with tournament context
  };

  if (isActive) {
    const currentType = tournamentTypes.find(t => t.id === currentTournament);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6"
      >
        <div className="max-w-4xl mx-auto">
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              {currentType?.icon} {currentType?.name}
            </h1>
            <p className="text-lg text-gray-600">
              Battle through consecutive opponents to claim victory!
            </p>
          </motion.header>

          {/* Tournament Progress */}
          <Card className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Tournament Progress</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatDisplay label="Matches Completed" value={`${progress.completed}/${progress.total}`} icon="⚔️" />
              <StatDisplay label="Wins" value={wins} icon="🏆" />
              <StatDisplay label="Losses" value={losses} icon="💀" />
              <StatDisplay label="Total Rewards" value={`${totalRewards} Gold`} icon="🪙" />
            </div>

            {/* Match Progress Bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Match Progress</span>
                <span className="text-sm text-gray-600">{Math.round(progress.winRate)}% Win Rate</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(progress.completed / progress.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Match List */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
              {matches.map((match, index) => (
                <div
                  key={match.id}
                  className={`
                    p-3 rounded-lg border-2 text-center text-sm font-medium
                    ${match.completed 
                      ? match.won 
                        ? 'bg-green-100 border-green-300 text-green-800'
                        : 'bg-red-100 border-red-300 text-red-800'
                      : index === progress.completed
                        ? 'bg-blue-100 border-blue-300 text-blue-800 ring-2 ring-blue-400'
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }
                  `}
                >
                  <div className="font-bold">Match {index + 1}</div>
                  <div className="text-xs">{match.enemy.name}</div>
                  {match.completed && (
                    <div className="text-xs mt-1">
                      {match.won ? '✅ Won' : '❌ Lost'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="text-center">
            <Button
              variant="secondary"
              onClick={() => setScreen('main-menu')}
            >
              ← Back to Menu
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6"
    >
      <div className="max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏆 Tournament Mode
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Face consecutive opponents in structured tournaments for greater rewards!
          </p>
          
          <Card className="inline-block bg-yellow-50 border-yellow-200">
            <StatDisplay
              label="Your Gold"
              value={gold}
              icon="🪙"
              size="lg"
              highlight
            />
          </Card>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tournamentTypes.map((tournament, index) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <Card hover className="text-center h-full flex flex-col">
                <div className="text-6xl mb-4">{tournament.icon}</div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {tournament.name}
                </h3>
                
                <p className="text-gray-600 mb-4 flex-1">
                  {tournament.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className={`font-bold ${tournament.difficultyColor}`}>
                    Difficulty: {tournament.difficulty}
                  </div>
                  
                  <div className="text-sm bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium mb-1">Opponents:</div>
                    <div className="text-gray-600">{tournament.enemies}</div>
                  </div>
                  
                  <div className="text-sm bg-yellow-50 p-3 rounded-lg">
                    <div className="font-medium mb-1">Rewards:</div>
                    <div className="text-yellow-700">{tournament.rewards}</div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleStartTournament(tournament.id as any)}
                >
                  Enter Tournament
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="secondary"
            onClick={() => setScreen('main-menu')}
          >
            ← Back to Menu
          </Button>
        </div>

        {/* Tournament Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8"
        >
          <Card className="bg-blue-50 border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3 text-center">
              📋 Tournament Rules
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <ul className="space-y-2">
                <li>• Face 5 consecutive opponents without healing between matches</li>
                <li>• Earn bonus gold multipliers for tournament victories</li>
                <li>• Losing any match ends the tournament early</li>
              </ul>
              <ul className="space-y-2">
                <li>• Complete tournaments to unlock achievement rewards</li>
                <li>• Higher difficulty tournaments offer better rewards</li>
                <li>• Your robot stays damaged between tournament battles</li>
              </ul>
            </div>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};