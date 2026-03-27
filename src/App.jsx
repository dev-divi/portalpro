import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { encryptProject, decryptProject } from './crypto';
import {
  Lock, Unlock, Check, CheckCircle2, Clock, FileText, FolderOpen,
  Link2, Download, Upload, Copy, Eye, EyeOff, Palette, Plus, Trash2,
  Calendar, Shield, ExternalLink, Settings, ArrowLeft, Sparkles,
  Image, X, ChevronRight,
} from 'lucide-react';

/* ══════════════════════════════════════════════════════════
   DEMO / DEFAULT PROJECT DATA
   ══════════════════════════════════════════════════════════ */
const DEMO_PROJECT = {
  clientName: 'Sarah Mitchell',
  projectName: 'Brand Identity & Website Redesign',
  status: 'In Review',
  deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
  accentColor: '#7c3aed',
  logoUrl: '',
  milestones: [
    { id: 1, title: 'Discovery Call', description: 'Initial consultation and scope definition', done: true, approvedAt: '2026-03-10' },
    { id: 2, title: 'Deposit Paid', description: '50% project deposit received', done: true, approvedAt: '2026-03-12' },
    { id: 3, title: 'Concept Presentation', description: 'Mood boards and initial concepts', done: true, approvedAt: '2026-03-20' },
    { id: 4, title: 'Design Review', description: 'Client reviews final design comps', done: false, approvedAt: null },
    { id: 5, title: 'Final Delivery', description: 'All assets delivered and project wrap-up', done: false, approvedAt: null },
  ],
  resources: [
    { id: 1, label: 'Signed Contract', type: 'document', url: '#', icon: 'file' },
    { id: 2, label: 'Project Invoice', type: 'document', url: '#', icon: 'file' },
    { id: 3, label: 'Brand Guidelines', type: 'deliverable', url: '#', icon: 'folder' },
    { id: 4, label: 'Final Gallery', type: 'deliverable', url: '#', icon: 'folder' },
    { id: 5, label: 'Mood Board', type: 'deliverable', url: '#', icon: 'image' },
  ],
};

/* ══════════════════════════════════════════════════════════
   UTILITY: Days until deadline
   ══════════════════════════════════════════════════════════ */
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
  return diff;
}

/* ══════════════════════════════════════════════════════════
   LOCK SCREEN — Password entry with animation
   ══════════════════════════════════════════════════════════ */
function LockScreen({ onUnlock, error, loading }) {
  const [pw, setPw] = useState('');
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center bg-stone-50 px-4"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-violet-100 flex items-center justify-center">
          <Lock size={36} className="text-violet-600" />
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Private Portal
        </h1>
        <p className="text-slate-500 text-sm mb-8">Enter your access key to view this project</p>
        <form onSubmit={e => { e.preventDefault(); onUnlock(pw); }} className="space-y-4">
          <input
            type="password" value={pw} onChange={e => setPw(e.target.value)}
            placeholder="Access Key"
            autoFocus
            className="w-full px-5 py-4 rounded-xl bg-white border border-stone-200 text-slate-900 text-center text-lg tracking-widest placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-violet-400 transition shadow-sm"
          />
          {error && <p className="text-red-500 text-sm">Incorrect password. Please try again.</p>}
          <button
            type="submit" disabled={loading || !pw}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold text-base hover:bg-slate-800 disabled:opacity-40 transition flex items-center justify-center gap-2"
          >
            {loading ? <span className="animate-spin">...</span> : <><Unlock size={18} /> Unlock Portal</>}
          </button>
        </form>
        <p className="text-xs text-stone-400 mt-6 flex items-center justify-center gap-1">
          <Shield size={12} /> End-to-end encrypted
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   SUCCESS ANIMATION — after milestone approval
   ══════════════════════════════════════════════════════════ */
function ApprovalSuccess({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        className="bg-white rounded-3xl p-10 text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.2, damping: 10 }}
        >
          <CheckCircle2 size={72} className="mx-auto text-emerald-500 mb-4" />
        </motion.div>
        <h2 className="text-2xl font-semibold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
          Approved
        </h2>
        <p className="text-slate-500 text-sm mt-1">Milestone signed off successfully</p>
      </motion.div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════
   PROJECT HEADER
   ══════════════════════════════════════════════════════════ */
function ProjectHeader({ project }) {
  const days = daysUntil(project.deadline);
  const accent = project.accentColor || '#7c3aed';
  return (
    <div className="mb-12">
      {project.logoUrl && (
        <img src={project.logoUrl} alt="logo" className="h-10 mb-6 object-contain" />
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-1">Project for</p>
          <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
            {project.clientName}
          </h1>
          <p className="text-lg text-slate-600 mt-2">{project.projectName}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-white"
            style={{ backgroundColor: accent }}>
            <Clock size={14} /> {project.status}
          </span>
          {days !== null && (
            <span className={`text-sm font-medium ${days <= 3 ? 'text-red-500' : days <= 7 ? 'text-amber-500' : 'text-slate-400'}`}>
              <Calendar size={14} className="inline mr-1" />
              {days > 0 ? `${days} days until deadline` : days === 0 ? 'Deadline is today' : `${Math.abs(days)} days overdue`}
            </span>
          )}
        </div>
      </div>
      <div className="mt-6 h-px bg-stone-200" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   VERTICAL TIMELINE
   ══════════════════════════════════════════════════════════ */
function Timeline({ milestones, accent, onApprove }) {
  const currentIdx = milestones.findIndex(m => !m.done);
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        Project Timeline
      </h2>
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-stone-200" />

        {milestones.map((m, i) => {
          const isCurrent = i === currentIdx;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative mb-8 last:mb-0"
            >
              {/* Dot */}
              <div className="absolute -left-8 top-1 flex items-center justify-center">
                {m.done ? (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: accent }}>
                    <Check size={16} />
                  </div>
                ) : isCurrent ? (
                  <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center bg-white animate-pulse"
                    style={{ borderColor: accent }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: accent }} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-stone-300 bg-white" />
                )}
              </div>

              {/* Content */}
              <div className={`rounded-xl p-5 transition ${m.done ? 'bg-stone-50' : isCurrent ? 'bg-white border border-stone-200 shadow-sm' : 'bg-stone-50/50 opacity-60'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{m.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{m.description}</p>
                    {m.approvedAt && (
                      <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                        <Check size={12} /> Approved {new Date(m.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  {isCurrent && !m.done && (
                    <button onClick={() => onApprove(m.id)}
                      className="shrink-0 px-5 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition flex items-center gap-1.5"
                      style={{ backgroundColor: accent }}>
                      <CheckCircle2 size={16} /> Approve
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   RESOURCE VAULT
   ══════════════════════════════════════════════════════════ */
function ResourceVault({ resources, accent }) {
  const docs = resources.filter(r => r.type === 'document');
  const deliverables = resources.filter(r => r.type !== 'document');

  const iconMap = { file: FileText, folder: FolderOpen, image: Image };

  const Card = ({ r }) => {
    const Icon = iconMap[r.icon] || FileText;
    return (
      <motion.a
        href={r.url} target="_blank" rel="noopener"
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="group rounded-xl border border-stone-200 bg-white p-5 hover:shadow-md hover:border-stone-300 transition flex items-start gap-4"
      >
        <div className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: accent + '18' }}>
          <Icon size={22} style={{ color: accent }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-900 text-sm group-hover:text-slate-700 truncate">{r.label}</div>
          <div className="text-xs text-stone-400 mt-0.5 flex items-center gap-1">
            <ExternalLink size={11} /> Open
          </div>
        </div>
        <ChevronRight size={16} className="text-stone-300 group-hover:text-stone-500 mt-0.5 shrink-0 transition" />
      </motion.a>
    );
  };

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold text-slate-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
        Resource Vault
      </h2>
      {docs.length > 0 && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Documents</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {docs.map(r => <Card key={r.id} r={r} />)}
          </div>
        </div>
      )}
      {deliverables.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">Deliverables</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {deliverables.map(r => <Card key={r.id} r={r} />)}
          </div>
        </div>
      )}
    </section>
  );
}

/* ══════════════════════════════════════════════════════════
   CLIENT PORTAL VIEW — The beautiful public-facing dashboard
   ══════════════════════════════════════════════════════════ */
function PortalView({ project, setProject }) {
  const [showApproval, setShowApproval] = useState(false);
  const accent = project.accentColor || '#7c3aed';

  const handleApprove = (milestoneId) => {
    const updated = {
      ...project,
      milestones: project.milestones.map(m =>
        m.id === milestoneId ? { ...m, done: true, approvedAt: new Date().toISOString().split('T')[0] } : m
      ),
    };
    setProject(updated);
    setShowApproval(true);
    // Save approval to localStorage
    localStorage.setItem('portalpro_approvals', JSON.stringify(
      updated.milestones.filter(m => m.done).map(m => ({ id: m.id, approvedAt: m.approvedAt }))
    ));
  };

  const progress = Math.round((project.milestones.filter(m => m.done).length / project.milestones.length) * 100);

  return (
    <div className="min-h-screen bg-stone-50">
      <AnimatePresence>
        {showApproval && <ApprovalSuccess onDone={() => setShowApproval(false)} />}
      </AnimatePresence>

      {/* Progress bar at very top */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-stone-100">
        <div className="h-1 bg-stone-100">
          <motion.div
            className="h-full rounded-r-full" style={{ backgroundColor: accent }}
            initial={{ width: 0 }} animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-xs font-medium text-stone-400">{progress}% complete</span>
          <span className="text-xs font-medium text-stone-400 flex items-center gap-1"><Shield size={11} /> Secure Portal</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        <ProjectHeader project={project} />
        <Timeline milestones={project.milestones} accent={accent} onApprove={handleApprove} />
        <ResourceVault resources={project.resources} accent={accent} />

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-stone-200 text-center">
          <p className="text-xs text-stone-400">Powered by PortalPro — Private & Encrypted</p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   BUILDER VIEW — Freelancer creates / edits projects
   ══════════════════════════════════════════════════════════ */
function BuilderView({ onPreview }) {
  const [project, setProject] = useState(() => {
    const saved = localStorage.getItem('portalpro_draft');
    return saved ? JSON.parse(saved) : { ...DEMO_PROJECT };
  });
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [exported, setExported] = useState('');
  const [copyMsg, setCopyMsg] = useState('');

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem('portalpro_draft', JSON.stringify(project));
  }, [project]);

  const up = (key, val) => setProject(prev => ({ ...prev, [key]: val }));

  const addMilestone = () => {
    const id = Date.now();
    up('milestones', [...project.milestones, { id, title: '', description: '', done: false, approvedAt: null }]);
  };

  const updateMilestone = (id, key, val) => {
    up('milestones', project.milestones.map(m => m.id === id ? { ...m, [key]: val } : m));
  };

  const removeMilestone = (id) => {
    up('milestones', project.milestones.filter(m => m.id !== id));
  };

  const addResource = () => {
    const id = Date.now();
    up('resources', [...project.resources, { id, label: '', type: 'document', url: '', icon: 'file' }]);
  };

  const updateResource = (id, key, val) => {
    up('resources', project.resources.map(r => r.id === id ? { ...r, [key]: val } : r));
  };

  const removeResource = (id) => {
    up('resources', project.resources.filter(r => r.id !== id));
  };

  const handleExport = async () => {
    if (!password) return;
    try {
      const bundle = await encryptProject(project, password);
      setExported(bundle);
    } catch (e) {
      console.error('Encryption failed', e);
    }
  };

  const handleExportJSON = () => {
    const blob = new Blob([exported], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `portalpro-${project.clientName.replace(/\s+/g, '-').toLowerCase()}.enc`;
    a.click(); URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    const magicUrl = `${window.location.origin}${window.location.pathname}#${exported}`;
    navigator.clipboard.writeText(magicUrl);
    setCopyMsg('Copied!');
    setTimeout(() => setCopyMsg(''), 2000);
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => up('logoUrl', reader.result);
    reader.readAsDataURL(file);
  };

  const accent = project.accentColor || '#7c3aed';

  const Field = ({ label, value, onChange, type = 'text', placeholder }) => (
    <div>
      <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1 block">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white border border-stone-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 transition" />
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <Settings size={20} className="text-violet-600" />
          <span className="font-bold text-slate-900 text-lg">PortalPro Builder</span>
        </div>
        <button onClick={() => onPreview(project)}
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition flex items-center gap-1.5">
          <Eye size={16} /> Preview Portal
        </button>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Project details */}
        <section className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Project Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Client Name" value={project.clientName} onChange={v => up('clientName', v)} placeholder="Sarah Mitchell" />
            <Field label="Project Name" value={project.projectName} onChange={v => up('projectName', v)} placeholder="Brand Redesign" />
            <Field label="Status" value={project.status} onChange={v => up('status', v)} placeholder="In Review" />
            <Field label="Deadline" value={project.deadline} onChange={v => up('deadline', v)} type="date" />
          </div>
        </section>

        {/* Branding */}
        <section className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Branding</h3>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Accent Color</label>
              <div className="flex items-center gap-2">
                <input type="color" value={accent} onChange={e => up('accentColor', e.target.value)}
                  className="w-12 h-12 rounded-xl border border-stone-200 cursor-pointer" />
                <span className="text-sm text-stone-500 font-mono">{accent}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1 block">Logo</label>
              <div className="flex items-center gap-2">
                {project.logoUrl ? (
                  <img src={project.logoUrl} alt="" className="h-12 object-contain rounded" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center"><Image size={20} className="text-stone-400" /></div>
                )}
                <label className="px-4 py-2 rounded-lg bg-stone-100 text-stone-600 text-sm font-medium cursor-pointer hover:bg-stone-200 transition">
                  Upload <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {project.logoUrl && (
                  <button onClick={() => up('logoUrl', '')} className="text-red-400 text-sm">Remove</button>
                )}
              </div>
            </div>
          </div>
          {/* Live preview swatch */}
          <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: accent + '10', border: `1px solid ${accent}30` }}>
            <Palette size={18} style={{ color: accent }} />
            <span className="text-sm" style={{ color: accent }}>Live preview — your portal will use this color</span>
          </div>
        </section>

        {/* Milestones */}
        <section className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Milestones</h3>
            <button onClick={addMilestone} className="text-sm font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition" style={{ color: accent }}>
              <Plus size={16} /> Add
            </button>
          </div>
          {project.milestones.map((m, i) => (
            <div key={m.id} className="flex gap-3 items-start p-3 rounded-xl bg-stone-50 border border-stone-100">
              <span className="text-xs font-bold text-stone-400 mt-3 w-6 text-center">{i + 1}</span>
              <div className="flex-1 space-y-2">
                <input value={m.title} onChange={e => updateMilestone(m.id, 'title', e.target.value)} placeholder="Milestone title"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-violet-300" />
                <input value={m.description} onChange={e => updateMilestone(m.id, 'description', e.target.value)} placeholder="Description"
                  className="w-full px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm text-slate-500 focus:outline-none focus:ring-1 focus:ring-violet-300" />
              </div>
              <label className="flex items-center gap-1 mt-3 text-xs text-stone-400 cursor-pointer select-none">
                <input type="checkbox" checked={m.done} onChange={e => updateMilestone(m.id, 'done', e.target.checked)} className="accent-emerald-500" />
                Done
              </label>
              <button onClick={() => removeMilestone(m.id)} className="mt-3 text-red-400 hover:text-red-600 transition">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </section>

        {/* Resources */}
        <section className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>Resources</h3>
            <button onClick={addResource} className="text-sm font-semibold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition" style={{ color: accent }}>
              <Plus size={16} /> Add
            </button>
          </div>
          {project.resources.map(r => (
            <div key={r.id} className="flex gap-3 items-center p-3 rounded-xl bg-stone-50 border border-stone-100">
              <select value={r.type} onChange={e => updateResource(r.id, 'type', e.target.value)}
                className="px-2 py-2 rounded-lg bg-white border border-stone-200 text-xs text-slate-600">
                <option value="document">Document</option>
                <option value="deliverable">Deliverable</option>
              </select>
              <select value={r.icon} onChange={e => updateResource(r.id, 'icon', e.target.value)}
                className="px-2 py-2 rounded-lg bg-white border border-stone-200 text-xs text-slate-600">
                <option value="file">File</option>
                <option value="folder">Folder</option>
                <option value="image">Image</option>
              </select>
              <input value={r.label} onChange={e => updateResource(r.id, 'label', e.target.value)} placeholder="Label"
                className="flex-1 px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300" />
              <input value={r.url} onChange={e => updateResource(r.id, 'url', e.target.value)} placeholder="URL"
                className="flex-1 px-3 py-2 rounded-lg bg-white border border-stone-200 text-sm focus:outline-none focus:ring-1 focus:ring-violet-300" />
              <button onClick={() => removeResource(r.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
        </section>

        {/* Encrypt & Export */}
        <section className="bg-white rounded-2xl p-6 border border-stone-200 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900" style={{ fontFamily: "'Playfair Display', serif" }}>
            <Lock size={18} className="inline mr-2 text-violet-600" />
            Secure & Export
          </h3>
          <p className="text-sm text-stone-500">Set a master password. Your client will use this to unlock their portal.</p>
          <div className="relative">
            <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Master Password"
              className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white border border-stone-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300" />
            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400">
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button onClick={handleExport} disabled={!password}
            className="w-full py-4 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 disabled:opacity-40 transition flex items-center justify-center gap-2">
            <Shield size={18} /> Encrypt & Generate
          </button>

          {exported && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 pt-2">
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <Sparkles size={20} className="mx-auto text-emerald-500 mb-1" />
                <p className="text-sm font-semibold text-emerald-700">Encrypted successfully!</p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopyLink}
                  className="flex-1 py-3 rounded-xl bg-violet-100 text-violet-700 font-semibold text-sm hover:bg-violet-200 transition flex items-center justify-center gap-1.5">
                  <Copy size={16} /> {copyMsg || 'Copy Magic Link'}
                </button>
                <button onClick={handleExportJSON}
                  className="flex-1 py-3 rounded-xl bg-stone-100 text-stone-700 font-semibold text-sm hover:bg-stone-200 transition flex items-center justify-center gap-1.5">
                  <Download size={16} /> Download .enc File
                </button>
              </div>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   APP ROOT — Router between Builder, Portal, and Lock
   ══════════════════════════════════════════════════════════ */
export default function App() {
  const [view, setView] = useState('boot'); // boot | builder | portal | lock
  const [project, setProject] = useState(null);
  const [lockError, setLockError] = useState(false);
  const [lockLoading, setLockLoading] = useState(false);
  const [encBundle, setEncBundle] = useState('');

  // On mount: check for hash data (Magic Link) or encrypted file
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && hash.length > 50) {
      // Looks like encrypted data in URL
      setEncBundle(hash);
      setView('lock');
    } else {
      setView('builder');
    }
  }, []);

  const handleUnlock = async (password) => {
    setLockLoading(true);
    setLockError(false);
    try {
      const data = await decryptProject(encBundle, password);
      // Merge any locally saved approvals
      const saved = localStorage.getItem('portalpro_approvals');
      if (saved) {
        const approvals = JSON.parse(saved);
        data.milestones = data.milestones.map(m => {
          const a = approvals.find(x => x.id === m.id);
          return a ? { ...m, done: true, approvedAt: a.approvedAt } : m;
        });
      }
      setProject(data);
      setView('portal');
    } catch {
      setLockError(true);
    } finally {
      setLockLoading(false);
    }
  };

  const handlePreview = (proj) => {
    setProject(proj);
    setView('portal');
  };

  return (
    <AnimatePresence mode="wait">
      {view === 'boot' && (
        <div key="boot" className="min-h-screen bg-stone-50 flex items-center justify-center">
          <Sparkles size={40} className="text-violet-500 animate-pulse" />
        </div>
      )}

      {view === 'lock' && (
        <LockScreen key="lock" onUnlock={handleUnlock} error={lockError} loading={lockLoading} />
      )}

      {view === 'builder' && (
        <motion.div key="builder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <BuilderView onPreview={handlePreview} />
        </motion.div>
      )}

      {view === 'portal' && project && (
        <motion.div key="portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {/* Back button (only in preview mode, not magic link) */}
          {!encBundle && (
            <button onClick={() => setView('builder')}
              className="fixed top-4 left-4 z-50 px-4 py-2 rounded-xl bg-white/90 backdrop-blur border border-stone-200 text-sm font-semibold text-slate-700 hover:bg-white transition flex items-center gap-1.5 shadow-sm">
              <ArrowLeft size={16} /> Back to Builder
            </button>
          )}
          <PortalView project={project} setProject={setProject} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
