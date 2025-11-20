import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/DashboardPage'
import AgentPerformancePage from './pages/AgentPerformancePage'
import TeamMetricsPage from './pages/TeamMetricsPage'
import TrendsPage from './pages/TrendsPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="agents" element={<AgentPerformancePage />} />
        <Route path="teams" element={<TeamMetricsPage />} />
        <Route path="trends" element={<TrendsPage />} />
      </Route>
    </Routes>
  )
}

export default App
