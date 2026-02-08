import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../stores/gameStore';
import { useCombatStore } from '../stores/combatStore';
import { useUIStore } from '../stores/uiStore';
import { Button } from '../components/ui/Button';
import { HealthBar } from '../components/ui/HealthBar';
import { RobotDisplay } from '../components/game/RobotDisplay';
import { BattleLog } from '../components/game/BattleLog';
import { Card } from '../components/ui/Card';

export const Combat: React.FC = () => {
  const { setScreen, getPlayerStats, addGold, addWin } = useGameStore();
  const {
    playerHealth,
    playerMaxHealth,
    enemyHealth,
    enemyMaxHealth,
    currentEnemy,
    turn,
    battleLog,
    isActive,
    playerAttack,
    playerDefend,
    playerSpecial,
    enemyTurn,
    endBattle,
    resetCombat
  } = useCombatStore();
  
  const { isSpecialOnCooldown, setSpecialCooldown, addNotification } = useUIStore();
  const [battleResult, setBattleResult] = useState<{ victory: boolean; goldEarned: number } | null>(null);
  const [isPlayerAnimating, setIsPlayerAnimating] = useState(false);
  const [isEnemyAnimating, setIsEnemyAnimating] = useState(false);

  const playerStats = getPlayerStats();

  // Handle enemy turns
  useEffect(() => {
    if (turn === 'enemy' && isActive && playerHealth > 0 && enemyHealth > 0) {
      const timer = setTimeout(() => {
        setIsEnemyAnimating(true);
        enemyTurn(playerStats);
        setTimeout(() => setIsEnemyAnimating(false), 600);
      }, 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [turn, isActive, playerHealth, enemyHealth, enemyTurn, playerStats]);

  // Check for battle end conditions
  useEffect(() => {
    if (isActive && (playerHealth <= 0 || enemyHealth <= 0)) {
      const victory = enemyHealth <= 0;
      const result = endBattle(victory);
      setBattleResult(result);
      
      if (victory) {
        addGold(result.goldEarned);
        addWin();
        addNotification({
          message: `Victory! You earned ${result.goldEarned} gold!`,
          type: 'success'
        });
      } else {
        addNotification({
          message: 'Defeat! Try upgrading your robot.',
          type: 'error'
        });
      }

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        handleContinue();
      }, 3000);
    }
  }, [playerHealth, enemyHealth, isActive, endBattle, addGold, addWin, addNotification, handleContinue]);

  const handlePlayerAttack = () => {
    if (turn !== 'player' || !isActive) return;
    
    setIsPlayerAnimating(true);
    playerAttack(playerStats);
    setTimeout(() => setIsPlayerAnimating(false), 600);
  };

  const handlePlayerDefend = () => {
    if (turn !== 'player' || !isActive) return;
    
    playerDefend();
  };

  const handlePlayerSpecial = () => {
    if (turn !== 'player' || !isActive || isSpecialOnCooldown) return;
    
    setIsPlayerAnimating(true);
    playerSpecial(playerStats);
    setSpecialCooldown(true);
    
    setTimeout(() => {
      setIsPlayerAnimating(false);
      setSpecialCooldown(false);
    }, 3000);
  };

  const handleContinue = useCallback(() => {
    resetCombat();
    setBattleResult(null);
    setScreen('main-menu');
  }, [resetCombat, setScreen]);

  if (!currentEnemy) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <p>No enemy selected. Returning to menu...</p>
        </Card>
      </div>
    );
  }

  const getEnemyTier = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return 'Basic';
      case 'medium': return 'Enhanced';
      case 'hard': return 'Advanced';
      case 'elite': return 'Elite';
      default: return 'Basic';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white p-6"
    >
      <div className="max-w-6xl mx-auto">
        {/* Battle Arena */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gray-800 border-gray-700 text-white">
            <div className="grid grid-cols-3 gap-8 items-center">
              {/* Player Side */}
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">Your Robot</h3>
                <RobotDisplay
                  stats={playerStats}
                  tier="Advanced" // Get from actual equipped parts
                  size="lg"
                  isAnimating={isPlayerAnimating}
                />
                <div className="mt-4">
                  <HealthBar
                    current={playerHealth}
                    max={playerMaxHealth}
                    label="Health"
                    size="lg"
                  />
                </div>
              </div>

              {/* VS Section */}
              <div className="text-center">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    textShadow: ['0 0 10px #ff0000', '0 0 20px #ff0000', '0 0 10px #ff0000']
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-6xl font-bold text-red-400 mb-4"
                >
                  VS
                </motion.div>
                
                <div className={`text-lg font-medium ${
                  turn === 'player' ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {turn === 'player' ? 'Your Turn' : 'Enemy Turn'}
                </div>
              </div>

              {/* Enemy Side */}
              <div className="text-center">
                <h3 className="text-xl font-bold mb-4">{currentEnemy.name}</h3>
                <RobotDisplay
                  stats={{
                    health: currentEnemy.health,
                    attack: currentEnemy.attack,
                    defense: currentEnemy.defense,
                    speed: currentEnemy.speed
                  }}
                  tier={getEnemyTier(currentEnemy.difficulty)}
                  size="lg"
                  isAnimating={isEnemyAnimating}
                />
                <div className="mt-4">
                  <HealthBar
                    current={enemyHealth}
                    max={enemyMaxHealth}
                    label="Health"
                    size="lg"
                  />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Combat Controls */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <h3 className="text-xl font-bold mb-6 text-center text-white">
                Combat Actions
              </h3>
              
              <div className="space-y-4">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={turn !== 'player' || !isActive}
                  onClick={handlePlayerAttack}
                >
                  ⚔️ Attack ({playerStats.attack} damage)
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  disabled={turn !== 'player' || !isActive}
                  onClick={handlePlayerDefend}
                >
                  🛡️ Defend (Heal 10%)
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  disabled={turn !== 'player' || !isActive || isSpecialOnCooldown}
                  onClick={handlePlayerSpecial}
                >
                  ⚡ Special Attack {isSpecialOnCooldown ? '(Cooldown)' : '(1.5x damage)'}
                </Button>
              </div>

              {/* Battle Result Overlay */}
              <AnimatePresence>
                {battleResult && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg"
                  >
                    <div className={`text-6xl mb-4 ${
                      battleResult.victory ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {battleResult.victory ? '🏆' : '💀'}
                    </div>
                    <h2 className={`text-4xl font-bold mb-4 ${
                      battleResult.victory ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {battleResult.victory ? 'Victory!' : 'Defeat!'}
                    </h2>
                    <p className="text-xl text-gray-300 mb-2">
                      {battleResult.victory 
                        ? `You defeated ${currentEnemy.name}!` 
                        : `You were defeated by ${currentEnemy.name}...`
                      }
                    </p>
                    {battleResult.victory && (
                      <p className="text-lg text-yellow-400 mb-6">
                        🪙 +{battleResult.goldEarned} Gold
                      </p>
                    )}
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleContinue}
                    >
                      Continue
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>

          {/* Battle Log */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <BattleLog entries={battleLog} maxHeight="max-h-96" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
