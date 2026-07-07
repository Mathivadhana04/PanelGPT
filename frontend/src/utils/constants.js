// ─── Persona Config ──────────────────────────────────────────────
export const PERSONAS = {
  scientist: {
    id: 'scientist',
    name: 'Dr. Elena Voss',
    role: 'Empirical Scientist',
    description: 'Data-driven, evidence-based, methodically challenges every assumption',
    color: '#3B82F6',
    icon: '🔬',
    glowClass: 'persona-glow-scientist',
  },
  contrarian: {
    id: 'contrarian',
    name: 'Rex Holloway',
    role: 'The Fierce Contrarian',
    description: 'Argues the opposite of whatever the consensus is — brilliantly',
    color: '#EF4444',
    icon: '⚡',
    glowClass: 'persona-glow-contrarian',
  },
  visionary: {
    id: 'visionary',
    name: 'Zara Osei',
    role: 'Futurist Visionary',
    description: 'Sees opportunity and transformation in every problem — decades ahead',
    color: '#10B981',
    icon: '🚀',
    glowClass: 'persona-glow-visionary',
  },
  philosopher: {
    id: 'philosopher',
    name: 'Prof. Kiran Mehta',
    role: 'Stoic Philosopher',
    description: 'Deconstructs ideas to first principles — Socratic, calm, illuminating',
    color: '#8B5CF6',
    icon: '🏛️',
    glowClass: 'persona-glow-philosopher',
  },
  street_voice: {
    id: 'street_voice',
    name: 'Jordan Reyes',
    role: "The People's Voice",
    description: 'Cuts through theory with raw, real-world human impact and common sense',
    color: '#F59E0B',
    icon: '🗣️',
    glowClass: 'persona-glow-street_voice',
  },
  satirist: {
    id: 'satirist',
    name: 'Maxine Draper',
    role: 'Political Satirist',
    description: 'Exposes absurdities with razor-sharp wit, irony, and uncomfortable truths',
    color: '#EC4899',
    icon: '🎭',
    glowClass: 'persona-glow-satirist',
  },
};

export const PERSONA_LIST = Object.values(PERSONAS);

// ─── Topic Suggestions ───────────────────────────────────────────
export const TOPIC_SUGGESTIONS = [
  { label: 'Should AI replace doctors?', category: 'Technology' },
  { label: 'Is democracy the best system of government?', category: 'Politics' },
  { label: 'Should we colonize Mars?', category: 'Science' },
  { label: 'Is social media making us lonelier?', category: 'Society' },
  { label: 'Should billionaires exist?', category: 'Ethics' },
  { label: 'Is free will an illusion?', category: 'Philosophy' },
  { label: 'Should universal basic income be implemented?', category: 'Economics' },
  { label: 'Is cancel culture good or bad?', category: 'Culture' },
  { label: 'Should nuclear energy be expanded?', category: 'Energy' },
  { label: 'Is remote work better than office work?', category: 'Work' },
  { label: 'Should voting be mandatory?', category: 'Politics' },
  { label: 'Is capitalism compatible with climate action?', category: 'Environment' },
];

// ─── Keyboard Shortcuts ──────────────────────────────────────────
export const KEYBOARD_SHORTCUTS = [
  { key: 'Enter', description: 'Start debate' },
  { key: 'Escape', description: 'Stop debate' },
  { key: 'Ctrl + E', description: 'Export debate' },
  { key: 'Ctrl + K', description: 'Clear debate' },
  { key: '?', description: 'Toggle shortcuts panel' },
];

// ─── API Endpoints ───────────────────────────────────────────────
export const API_BASE = '/api';

// ─── Animation Variants ──────────────────────────────────────────
export const FADE_IN_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

export const STAGGER_CHILDREN = {
  animate: { transition: { staggerChildren: 0.1 } },
};
