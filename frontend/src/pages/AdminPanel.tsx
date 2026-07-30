export default function AdminPanel() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Admin Panel</h1>
        <p className="text-slate-400 mt-2">Manage community contributions and platform analytics.</p>
      </div>
      
      <div className="glassmorphism rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4">Pending Approvals</h2>
        <div className="bg-dark-900 rounded-xl border border-slate-700/50 p-4">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-sm border-b border-slate-700/50">
                <th className="pb-3 font-medium">Document</th>
                <th className="pb-3 font-medium">User ID</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-700/50 last:border-0">
                <td className="py-4">google_sde_interview.pdf</td>
                <td className="py-4">42</td>
                <td className="py-4 flex gap-2">
                  <button className="bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-lg text-sm transition-colors">Approve</button>
                  <button className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1.5 rounded-lg text-sm transition-colors">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
