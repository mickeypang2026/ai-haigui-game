import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Game from './pages/Game'
import Result from './pages/Result'

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game/:storyId" element={<Game />} />
        <Route path="/result/:sessionId" element={<Result />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
