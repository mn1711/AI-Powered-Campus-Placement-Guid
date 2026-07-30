import { useState } from 'react';
import { Calendar, Building, Briefcase, Trophy, Bot, Loader2 } from 'lucide-react';

export default function StudyPlan() {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    days: '',
    level: 'Beginner'
  });
  
  const [plan, setPlan] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.role || !formData.days) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await fetch('http://localhost:8000/api/v1/ai/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      setPlan(data.plan || 'Sorry, no plan was generated.');
    } catch (err) {
      console.error(err);
      setError('Could not connect to the backend server. Make sure it is running.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Company Prep: Study Plan</h1>
        <p className="text-slate-400">Generate a custom AI-driven preparation roadmap for your target role.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
        
        {/* Form Column */}
        <div className="lg:col-span-1 glassmorphism rounded-2xl p-6 h-fit">
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Target Company</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon, Google"
                  value={formData.company}
                  onChange={e => setFormData({...formData, company: e.target.value})}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Target Role</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. SDE II, Frontend"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Days Until Interview</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 14"
                  value={formData.days}
                  onChange={e => setFormData({...formData, days: e.target.value})}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Current Skill Level</label>
              <div className="relative">
                <Trophy className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <select
                  value={formData.level}
                  onChange={e => setFormData({...formData, level: e.target.value})}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 appearance-none"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bot className="w-5 h-5" />}
              Generate Roadmap
            </button>
          </form>
        </div>

        {/* Result Column */}
        <div className="lg:col-span-2 glassmorphism rounded-2xl p-6 overflow-y-auto">
          {error ? (
            <div className="text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
              {error}
            </div>
          ) : plan ? (
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-slate-300 font-mono text-sm leading-relaxed">
              {plan}
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4 min-h-[300px]">
               <Calendar className="w-16 h-16 opacity-20" />
               <p>Fill out your target details to generate a custom day-by-day plan.</p>
             </div>
          )}
        </div>

      </div>
    </div>
  );
}
