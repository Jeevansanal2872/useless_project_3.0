
import { useSessionStore } from './store/sessionStore';
import { HomePage } from './components/menu/HomePage';
import { LevelSelect } from './components/menu/LevelSelect';
import { GameCanvas } from './components/game/GameCanvas';
import { BugFixModal } from './components/modals/BugFixModal';
import { GameOverModal } from './components/modals/GameOverModal';
import { NavBar } from './components/hud/NavBar';

function App() {
  const status = useSessionStore((state) => state.status);

  return (
    <div className="w-screen h-screen overflow-hidden bg-zinc-950 font-sans">
      {status === 'IDLE' && <HomePage />}
      {status === 'LEVEL_SELECT' && <LevelSelect />}
      {status !== 'IDLE' && status !== 'LEVEL_SELECT' && (
        <>
          <NavBar />
          <GameCanvas />
          <BugFixModal />
          <GameOverModal />
        </>
      )}
    </div>
  );
}

export default App;
