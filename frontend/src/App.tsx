import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import StudyPlan from './pages/StudyPlan';
import MockInterview from './pages/MockInterview';
import MyDocuments from './pages/MyDocuments';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-dark-900 text-slate-100 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/prep" element={<StudyPlan />} />
            <Route path="/mock" element={<MockInterview />} />
            <Route path="/documents" element={<MyDocuments />} />
            <Route path="/settings" element={<div className="p-8 text-slate-400">Settings coming soon</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
