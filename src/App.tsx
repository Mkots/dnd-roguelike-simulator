import { Routes, Route } from 'react-router';
import StartScreen from './pages/StartScreen';
import GameScreen from './pages/GameScreen';
import ResultsScreen from './pages/ResultsScreen';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/game" element={<GameScreen />} />
      <Route path="/results" element={<ResultsScreen />} />
    </Routes>
  );
}
