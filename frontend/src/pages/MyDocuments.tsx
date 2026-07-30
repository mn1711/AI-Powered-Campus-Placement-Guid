import { useState } from 'react';
import { UploadCloud, FileText, Building, Briefcase, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function MyDocuments() {
  const [file, setFile] = useState<File | null>(null);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    setStatus('idle');

    const formData = new FormData();
    formData.append('file', file);
    if (company) formData.append('company', company);
    if (role) formData.append('role', role);

    try {
      const res = await fetch('http://localhost:8000/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (res.ok) {
        setStatus('success');
        setMessage(data.message || 'File successfully processed and added to your knowledge base!');
        setFile(null);
        setCompany('');
        setRole('');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to upload document.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Could not connect to the backend server. Is it running?');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">My Documents</h1>
        <p className="text-slate-400">Upload your own interview experiences or notes to train your personalized AI.</p>
      </div>

      <div className="glassmorphism rounded-2xl p-6 md:p-8">
        <form onSubmit={handleUpload} className="space-y-6">
          
          {/* File Dropzone */}
          <div className="relative border-2 border-dashed border-slate-700 rounded-2xl p-8 hover:bg-dark-800/50 transition-colors group cursor-pointer text-center">
            <input 
              type="file" 
              accept=".txt,.pdf,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-dark-900 border border-slate-700 flex items-center justify-center group-hover:border-primary-500 transition-colors">
                <UploadCloud className="w-8 h-8 text-primary-400" />
              </div>
              <div>
                <p className="text-slate-200 font-medium">Click to upload or drag and drop</p>
                <p className="text-slate-500 text-sm mt-1">PDF, TXT, or DOCX (Max 10MB)</p>
              </div>
              
              {file && (
                <div className="mt-4 flex items-center gap-2 text-primary-400 bg-primary-500/10 px-4 py-2 rounded-full border border-primary-500/20">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Company (Optional)</label>
              <div className="relative">
                <Building className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Meta"
                  value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Role (Optional)</label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Data Scientist"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!file || isUploading}
            className="w-full bg-primary-600 hover:bg-primary-500 text-white rounded-xl py-3 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Processing and Embedding...
              </>
            ) : (
              'Upload and Process Document'
            )}
          </button>
        </form>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="mt-6 flex items-start gap-3 bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-6 flex items-start gap-3 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">{message}</p>
          </div>
        )}

      </div>
    </div>
  );
}
