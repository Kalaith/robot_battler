import React from 'react';
import { useGameStore } from './stores/gameStore';
import { MainMenu } from './pages/MainMenu';
import { EnemySelection } from './pages/EnemySelection';
import { Combat } from './pages/Combat';
import { PartsShop } from './pages/PartsShop';
import { Tournament } from './pages/Tournament';
import { NotificationSystem } from './components/ui/NotificationSystem';
import './styles/index.css';

const App: React.FC = () => {
  const { currentScreen } = useGameStore();

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'main-menu':
        return <MainMenu />;
      case 'enemy-selection':
        return <EnemySelection />;
      case 'combat-screen':
        return <Combat />;
      case 'parts-shop':
        return <PartsShop />;
      case 'tournament':
        return <Tournament />;
      default:
        return <MainMenu />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {renderCurrentScreen()}
      <NotificationSystem />
    </div>
  );
};

export default App;
