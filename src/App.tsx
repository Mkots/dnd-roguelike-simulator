import { Routes, Route } from 'react-router';
import StartScreen from './pages/StartScreen';
import GameScreen from './pages/GameScreen';
import ResultsScreen from './pages/ResultsScreen';
import ShopScreen from './pages/ShopScreen';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartScreen />} />
      <Route path="/game" element={<GameScreen />} />
      <Route path="/results" element={<ResultsScreen />} />
      <Route path="/shop" element={<ShopScreen />} />
    </Routes>
  );
}
