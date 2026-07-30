import { BarChart3, Users, FileQuestion, Target } from 'lucide-react';

const stats = [
  { name: 'Questions Answered', value: '1,240', icon: FileQuestion, change: '+12%' },
  { name: 'Mock Interviews', value: '8', icon: Users, change: '+2' },
  { name: 'Accuracy', value: '92%', icon: Target, change: '+4.1%' },
  { name: 'Overall Score', value: '85/100', icon: BarChart3, change: '+2.3' },
];

export default function Dashboard() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Welcome back, User 👋</h1>
        <p className="text-slate-400 mt-2">Here is your interview preparation progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="glassmorphism rounded-2xl p-6 hover-glow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-400">{stat.name}</p>
                  <p className="text-3xl font-bold text-slate-100 mt-2">{stat.value}</p>
                </div>
                <div className="p-3 bg-primary-500/10 rounded-xl">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <span className="text-primary-400 font-medium">{stat.change}</span>
                <span className="text-slate-500 ml-2">from last week</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Placeholder for Study Plan / Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glassmorphism rounded-2xl p-6 h-96">
          <h2 className="text-xl font-semibold mb-4">Recommended Study Plan</h2>
          <div className="flex items-center justify-center h-full text-slate-500">
            Study Plan Graph goes here
          </div>
        </div>
        <div className="glassmorphism rounded-2xl p-6 h-96">
          <h2 className="text-xl font-semibold mb-4">Recent Experiences</h2>
          <div className="flex items-center justify-center h-full text-slate-500">
            Activity list goes here
          </div>
        </div>
      </div>
    </div>
  );
}
