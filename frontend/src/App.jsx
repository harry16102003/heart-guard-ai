import { useEffect, useMemo, useState } from 'react';
import './App.css';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const apiUrl = (path) => `${API_BASE_URL}${path}`;
const API_URL = apiUrl('/api/landing');
const HISTORY_API_URL = apiUrl('/api/predictions/history');

const fallback = {
  badge: 'AI model accuracy 91.7% · ROC-AUC 0.946',
  hero: {
    title: ['Preventive insights', 'for heart failure', 'readmission.'],
    subtitle:
      'HeartGuard forecasts 30/60/180-day readmission risk for cardiac patients — empowering doctors to intervene before the next emergency.',
  },
  monitor: {
    patient: 'Demo Patient',
    title: 'Real-time risk monitor',
    severity: 'CRITICAL',
    risk: 86,
    window: '14 days',
    metrics: [
      { label: 'EF', value: '32%' },
      { label: 'BP', value: '162/98' },
      { label: 'Creatinine', value: '1.8' },
    ],
  },
  stats: [
    { value: '91.7%', label: 'MODEL ACCURACY' },
    { value: '0.946', label: 'ROC-AUC SCORE' },
    { value: '−38%', label: 'READMISSIONS AVOIDED' },
    { value: '<3s', label: 'TIME TO PREDICTION' },
  ],
  featuresHeading: 'A complete preventive cardiology workspace',
  featuresSubheading: 'From intake to intervention, HeartGuard fuses clinical data with ML forecasts.',
  features: [
    { title: 'XGBoost predictive model', icon: 'brain', description: 'Ensemble model trained on cardiac admissions with 12 clinical features.' },
    { title: 'Risk forecasting', icon: 'pulse', description: '30 / 60 / 180-day readmission probability with confidence intervals.' },
    { title: 'Analytics dashboards', icon: 'chart', description: 'Cohort trends, risk distribution, and outcome tracking.' },
    { title: 'AI clinical assistant', icon: 'bot', description: 'Explain results, summarize charts, and suggest evidence-based actions.' },
    { title: 'Emergency alerts', icon: 'alert', description: 'Realtime flags for critical patients with ICU escalation suggestions.' },
    { title: 'Secure & auditable', icon: 'shield', description: 'Role-based access, JWT auth, and every prediction is traceable.' },
  ],
  cta: {
    title: 'Start forecasting readmissions today',
    subtitle: "Enter a patient's clinical profile and receive an AI risk assessment in seconds.",
    button: 'Run a prediction',
  },
  footer: '© 2026 HeartGuard · AI-assisted clinical decision support — not a substitute for medical judgment.',
};

const demoPatients = [
  { id: 'PT-1000', name: 'Aarav Sharma', age: '49', ageSex: '49y · M', ef: '47%', bp: '138/86', creatinine: '1.1', riskScore: 46, riskLabel: 'Moderate', lastVisit: '2026-06-05', bmi: '27.1', cholesterol: '202', glucose: '112', heartRate: '82' },
  { id: 'PT-1001', name: 'Priya Patel', age: '51', ageSex: '51y · F', ef: '49%', bp: '134/84', creatinine: '1.0', riskScore: 42, riskLabel: 'Moderate', lastVisit: '2026-06-05', bmi: '26.5', cholesterol: '194', glucose: '118', heartRate: '78' },
  { id: 'PT-1002', name: 'Rohan Mehta', age: '52', ageSex: '52y · M', ef: '39%', bp: '154/92', creatinine: '1.4', riskScore: 66, riskLabel: 'High', lastVisit: '2026-06-05', bmi: '30.2', cholesterol: '228', glucose: '138', heartRate: '91' },
  { id: 'PT-1003', name: 'Neha Gupta', age: '54', ageSex: '54y · F', ef: '35%', bp: '160/96', creatinine: '1.6', riskScore: 78, riskLabel: 'High', lastVisit: '2026-06-05', bmi: '31.4', cholesterol: '241', glucose: '148', heartRate: '96' },
  { id: 'PT-1004', name: 'Vikram Singh', age: '56', ageSex: '56y · M', ef: '48%', bp: '142/88', creatinine: '1.2', riskScore: 42, riskLabel: 'Moderate', lastVisit: '2026-06-05', bmi: '28.0', cholesterol: '210', glucose: '121', heartRate: '84' },
  { id: 'PT-1005', name: 'Anjali Rao', age: '58', ageSex: '58y · F', ef: '50%', bp: '132/82', creatinine: '0.9', riskScore: 39, riskLabel: 'Moderate', lastVisit: '2026-06-05', bmi: '25.9', cholesterol: '188', glucose: '106', heartRate: '76' },
  { id: 'PT-1006', name: 'Kabir Khan', age: '33', ageSex: '33y · M', ef: '58%', bp: '118/76', creatinine: '0.8', riskScore: 18, riskLabel: 'Low', lastVisit: '2026-06-04', bmi: '23.4', cholesterol: '172', glucose: '91', heartRate: '70' },
  { id: 'PT-1007', name: 'Isha Nair', age: '37', ageSex: '37y · F', ef: '56%', bp: '122/78', creatinine: '0.9', riskScore: 21, riskLabel: 'Low', lastVisit: '2026-06-04', bmi: '24.6', cholesterol: '180', glucose: '94', heartRate: '72' },
  { id: 'PT-1008', name: 'Dev Malhotra', age: '42', ageSex: '42y · M', ef: '53%', bp: '128/80', creatinine: '0.9', riskScore: 24, riskLabel: 'Low', lastVisit: '2026-06-03', bmi: '25.1', cholesterol: '184', glucose: '98', heartRate: '74' },
  { id: 'PT-1009', name: 'Meera Iyer', age: '44', ageSex: '44y · F', ef: '46%', bp: '136/84', creatinine: '1.1', riskScore: 34, riskLabel: 'Moderate', lastVisit: '2026-06-03', bmi: '27.4', cholesterol: '205', glucose: '116', heartRate: '81' },
  { id: 'PT-1010', name: 'Arjun Reddy', age: '47', ageSex: '47y · M', ef: '45%', bp: '140/86', creatinine: '1.2', riskScore: 36, riskLabel: 'Moderate', lastVisit: '2026-06-02', bmi: '28.1', cholesterol: '211', glucose: '119', heartRate: '83' },
  { id: 'PT-1011', name: 'Sara Thomas', age: '48', ageSex: '48y · F', ef: '44%', bp: '142/88', creatinine: '1.1', riskScore: 41, riskLabel: 'Moderate', lastVisit: '2026-06-02', bmi: '27.8', cholesterol: '216', glucose: '124', heartRate: '85' },
  { id: 'PT-1012', name: 'Nikhil Bose', age: '61', ageSex: '61y · M', ef: '41%', bp: '148/90', creatinine: '1.3', riskScore: 52, riskLabel: 'Moderate', lastVisit: '2026-06-01', bmi: '29.2', cholesterol: '222', glucose: '130', heartRate: '88' },
  { id: 'PT-1013', name: 'Pooja Shah', age: '63', ageSex: '63y · F', ef: '40%', bp: '150/92', creatinine: '1.4', riskScore: 56, riskLabel: 'Moderate', lastVisit: '2026-06-01', bmi: '29.6', cholesterol: '226', glucose: '132', heartRate: '89' },
  { id: 'PT-1014', name: 'Rahul Verma', age: '66', ageSex: '66y · M', ef: '37%', bp: '156/94', creatinine: '1.5', riskScore: 61, riskLabel: 'High', lastVisit: '2026-05-31', bmi: '30.4', cholesterol: '236', glucose: '142', heartRate: '93' },
  { id: 'PT-1015', name: 'Lata Menon', age: '69', ageSex: '69y · F', ef: '38%', bp: '152/90', creatinine: '1.5', riskScore: 60, riskLabel: 'High', lastVisit: '2026-05-31', bmi: '30.0', cholesterol: '231', glucose: '139', heartRate: '90' },
  { id: 'PT-1016', name: 'Sanjay Kulkarni', age: '72', ageSex: '72y · M', ef: '34%', bp: '164/96', creatinine: '1.7', riskScore: 69, riskLabel: 'High', lastVisit: '2026-05-30', bmi: '31.6', cholesterol: '244', glucose: '151', heartRate: '97' },
  { id: 'PT-1017', name: 'Asha Pillai', age: '75', ageSex: '75y · F', ef: '33%', bp: '166/98', creatinine: '1.8', riskScore: 72, riskLabel: 'High', lastVisit: '2026-05-30', bmi: '31.9', cholesterol: '248', glucose: '154', heartRate: '99' },
  { id: 'PT-1018', name: 'Manav Joshi', age: '78', ageSex: '78y · M', ef: '36%', bp: '158/94', creatinine: '1.6', riskScore: 67, riskLabel: 'High', lastVisit: '2026-05-29', bmi: '30.8', cholesterol: '239', glucose: '145', heartRate: '94' },
  { id: 'PT-1019', name: 'Rekha Sinha', age: '82', ageSex: '82y · F', ef: '32%', bp: '168/98', creatinine: '1.9', riskScore: 81, riskLabel: 'High', lastVisit: '2026-05-29', bmi: '32.2', cholesterol: '252', glucose: '160', heartRate: '101' },
  { id: 'PT-1020', name: 'Omar Qureshi', age: '84', ageSex: '84y · M', ef: '35%', bp: '162/96', creatinine: '1.8', riskScore: 79, riskLabel: 'High', lastVisit: '2026-05-28', bmi: '31.8', cholesterol: '247', glucose: '156', heartRate: '98' },
  { id: 'PT-1021', name: 'Tara Kapoor', age: '86', ageSex: '86y · F', ef: '31%', bp: '170/100', creatinine: '2.0', riskScore: 82, riskLabel: 'High', lastVisit: '2026-05-28', bmi: '32.6', cholesterol: '255', glucose: '164', heartRate: '103' },
  { id: 'PT-1022', name: 'Harish Batra', age: '46', ageSex: '46y · M', ef: '47%', bp: '138/86', creatinine: '1.1', riskScore: 43, riskLabel: 'Moderate', lastVisit: '2026-05-27', bmi: '27.6', cholesterol: '207', glucose: '117', heartRate: '82' },
  { id: 'PT-1023', name: 'Kavya Desai', age: '64', ageSex: '64y · F', ef: '43%', bp: '146/90', creatinine: '1.3', riskScore: 55, riskLabel: 'Moderate', lastVisit: '2026-05-27', bmi: '28.9', cholesterol: '220', glucose: '128', heartRate: '87' },
  { id: 'PT-1024', name: 'Sameer Ali', age: '73', ageSex: '73y · M', ef: '40%', bp: '148/90', creatinine: '1.3', riskScore: 58, riskLabel: 'Moderate', lastVisit: '2026-05-26', bmi: '29.4', cholesterol: '224', glucose: '131', heartRate: '88' },
];

const demoPredictionSeed = demoPatients.slice(0, 6);
const demoDataVersion = 'heartguard-demo-v3';

const demoPredictions = [
  ...Array.from({ length: 32 }, (_, index) => {
    const patient = demoPatients[(index + 6) % demoPatients.length];
    return {
      id: patient.id,
      name: patient.name,
      age: patient.age,
      date: '2026-06-05',
      riskScore: patient.riskScore,
      riskLabel: patient.riskLabel,
    };
  }),
  ...demoPredictionSeed.map((patient) => ({
    id: patient.id,
    name: patient.name,
    age: patient.age,
    date: '2026-06-05',
    riskScore: patient.riskScore,
    riskLabel: patient.riskLabel,
  })),
];

function FeatureIcon({ type }) {
  const common = { className: 'feature-svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' };
  if (type === 'brain') return <svg {...common}><path d="M8 5a3 3 0 0 0-3 3v1a3 3 0 0 0-2 2.8v.4A3 3 0 0 0 5 15v1a3 3 0 0 0 3 3h1"/><path d="M16 5a3 3 0 0 1 3 3v1a3 3 0 0 1 2 2.8v.4A3 3 0 0 1 19 15v1a3 3 0 0 1-3 3h-1"/><path d="M10 8a2 2 0 0 1 2-2"/><path d="M14 8a2 2 0 0 0-2-2"/><path d="M10 13h4"/><path d="M12 11v8"/></svg>;
  if (type === 'pulse') return <svg {...common}><path d="M2 12h4l2.2-5.5L12 18l2.6-6H22"/></svg>;
  if (type === 'chart') return <svg {...common}><path d="M3 3v18h18"/><path d="m7.5 14.5 3 2.5 4.5-5 2.5 2"/></svg>;
  if (type === 'bot') return <svg {...common}><rect x="4" y="9" width="16" height="10" rx="2"/><path d="M12 9V6"/><path d="M9 13h.01M15 13h.01"/><path d="M9 17h6"/></svg>;
  if (type === 'alert') return <svg {...common}><path d="M12 3a5.5 5.5 0 0 1 5.5 5.5V13l2 2v2h-15v-2l2-2V8.5A5.5 5.5 0 0 1 12 3Z"/><path d="M10.2 20a2 2 0 0 0 3.6 0"/></svg>;
  return <svg {...common}><path d="M12 3 5 6v6c0 4.7 3 7.8 7 9 4-1.2 7-4.3 7-9V6l-7-3Z"/><path d="m9.5 12 1.7 1.7L14.8 10"/></svg>;
}

function UiIcon({ type }) {
  const common = { className: 'ui-icon-svg', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' };
  if (type === 'stethoscope') return <svg {...common}><path d="M6 3v5a4 4 0 0 0 8 0V3"/><path d="M10 3v5"/><path d="M18 10a2 2 0 1 1 4 0v1a6 6 0 0 1-6 6h-1a5 5 0 0 1-5-5v-1"/></svg>;
  if (type === 'shield') return <svg {...common}><path d="M12 3 5 6v6c0 4.7 3 7.8 7 9 4-1.2 7-4.3 7-9V6l-7-3Z"/><path d="m9.5 12 1.7 1.7L14.8 10"/></svg>;
  if (type === 'mail') return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
  if (type === 'lock') return <svg {...common}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
  if (type === 'menu-dashboard') return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>;
  if (type === 'menu-patients') return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  if (type === 'menu-prediction') return <svg {...common}><path d="M3 12h4l2.2-5.5L13 18l2.6-6H21"/></svg>;
  if (type === 'menu-analytics') return <svg {...common}><path d="M3 3v18h18"/><path d="M7 13v4"/><path d="M12 9v8"/><path d="M17 6v11"/></svg>;
  if (type === 'menu-ai') return <svg {...common}><rect x="4" y="9" width="16" height="10" rx="2"/><path d="M12 9V6"/><path d="M9 13h.01M15 13h.01"/><path d="M9 17h6"/></svg>;
  if (type === 'menu-alert') return <svg {...common}><path d="M12 3a5.5 5.5 0 0 1 5.5 5.5V13l2 2v2h-15v-2l2-2V8.5A5.5 5.5 0 0 1 12 3Z"/><path d="M10.2 20a2 2 0 0 0 3.6 0"/></svg>;
  if (type === 'heart') return <svg {...common}><path d="M12 21c-5-4.35-8-7.3-8-11a4.8 4.8 0 0 1 8-3.4A4.8 4.8 0 0 1 20 10c0 3.7-3 6.65-8 11Z"/></svg>;
  if (type === 'search') return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>;
  if (type === 'plus') return <svg {...common}><path d="M12 5v14"/><path d="M5 12h14"/></svg>;
  if (type === 'edit') return <svg {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>;
  if (type === 'upload') return <svg {...common}><path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 21h14a2 2 0 0 0 2-2v-3"/><path d="M3 16v3a2 2 0 0 0 2 2"/></svg>;
  if (type === 'chevron-down') return <svg {...common}><path d="m6 9 6 6 6-6"/></svg>;
  if (type === 'bell') return <svg {...common}><path d="M12 3a5 5 0 0 1 5 5v2.9c0 .7.28 1.37.78 1.87L19 14v1H5v-1l1.22-1.23c.5-.5.78-1.17.78-1.87V8a5 5 0 0 1 5-5Z"/><path d="M10 18a2 2 0 0 0 4 0"/></svg>;
  if (type === 'signout') return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>;
  if (type === 'arrow-right') return <svg {...common}><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>;
  return <svg {...common}><path d="M12 21c-5-4.35-8-7.3-8-11a4.8 4.8 0 0 1 8-3.4A4.8 4.8 0 0 1 20 10c0 3.7-3 6.65-8 11Z"/></svg>;
}

const getCurrentRoute = () => {
  if (typeof window === 'undefined') return '/';
  const hashRoute = window.location.hash.replace(/^#/, '');
  if (hashRoute.startsWith('/')) return hashRoute;
  return window.location.pathname === '/' || window.location.pathname === '/index.html'
    ? '/'
    : `${window.location.pathname}${window.location.search}`;
};

const routeHref = (path) => `#${path}`;

function App() {
  const [route, setRoute] = useState(getCurrentRoute);
  const [pathname, routeQuery = ''] = route.split('?');
  const isLoginPage = pathname === '/login';
  const isDashboardPage = pathname === '/dashboard';
  const isPatientsPage = pathname === '/patients';
  const isPredictPage = pathname === '/predict';
  const isAnalyticsPage = pathname === '/analytics';
  const isAssistantPage = pathname === '/assistant';
  const isAlertsPage = pathname === '/alerts';
  const [data, setData] = useState(fallback);
  const [role, setRole] = useState(() => {
    if (typeof window === 'undefined') return 'doctor';
    return window.localStorage.getItem('heartguard_user_role') || 'doctor';
  });
  const [email, setEmail] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('heartguard_user_email') || '';
  });
  const [password, setPassword] = useState('');
  const [clinicianName, setClinicianName] = useState(() => {
    if (typeof window === 'undefined') return '';
    return window.localStorage.getItem('heartguard_clinician_name') || '';
  });
  const [hospitalName, setHospitalName] = useState(() => {
    if (typeof window === 'undefined') return 'HeartGuard Medical Center';
    return window.localStorage.getItem('heartguard_hospital_name') || 'HeartGuard Medical Center';
  });
  const [loginError, setLoginError] = useState('');
  const [patientRiskFilter, setPatientRiskFilter] = useState('all');
  const [patientSearch, setPatientSearch] = useState(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(getCurrentRoute().split('?')[1] || '').get('search') || '';
  });
  const [expandedPatientId, setExpandedPatientId] = useState('');
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [addPatientError, setAddPatientError] = useState('');
  const [editingPatientId, setEditingPatientId] = useState('');
  const [editPatientError, setEditPatientError] = useState('');
  const [reportUploadMessage, setReportUploadMessage] = useState('');
  const [uploadPatient, setUploadPatient] = useState(null);
  const [selectedReportFiles, setSelectedReportFiles] = useState([]);
  const [newPatient, setNewPatient] = useState({
    name: '',
    age: '',
    sex: '',
    bmi: '',
    cholesterol: '',
    systolicBp: '',
    diastolicBp: '',
    glucose: '',
    heartRate: '',
    ef: '',
    creatinine: '',
  });
  const [editPatient, setEditPatient] = useState({
    id: '',
    name: '',
    age: '',
    sex: '',
    bmi: '',
    cholesterol: '',
    systolicBp: '',
    diastolicBp: '',
    glucose: '',
    heartRate: '',
    ef: '',
    creatinine: '',
    riskScore: '',
    riskLabel: 'Low',
    lastVisit: '',
    smoking: false,
    diabetes: false,
    hypertension: false,
  });
  const [dashboardSearch, setDashboardSearch] = useState('');
  const [predictionStep, setPredictionStep] = useState(1);
  const [predictLoading, setPredictLoading] = useState(false);
  const [predictResult, setPredictResult] = useState(null);
  const [reportPatient, setReportPatient] = useState(null);
  const [predictError, setPredictError] = useState('');
  const [predictionPatientQuery, setPredictionPatientQuery] = useState('');
  const [selectedPredictionPatientId, setSelectedPredictionPatientId] = useState('');
  const [assistantInput, setAssistantInput] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantMessages, setAssistantMessages] = useState([
    {
      role: 'assistant',
      text: "Hello. I'm your HeartGuard AI assistant. Ask me about patient risk, clinical guidelines, or treatment plans.",
    },
  ]);
  const [predictForm, setPredictForm] = useState({
    age: '',
    bmi: '',
    systolic_bp: '',
    diastolic_bp: '',
    cholesterol: '',
    glucose: '',
    heart_rate: '',
    ejection_fraction: '',
    serum_creatinine: '',
    activity_hours: '',
    smoking: false,
    diabetes: false,
    hypertension: false,
    previous_visit_enabled: false,
    days_since_last_visit: '',
    prev_ejection_fraction: '',
    prev_serum_creatinine: '',
    prev_systolic_bp: '',
    prev_cholesterol: '',
    prev_glucose: '',
    prev_bmi: '',
  });
  const navItems = [
    { key: 'Dashboard', icon: 'menu-dashboard', href: routeHref('/dashboard'), active: isDashboardPage },
    { key: 'Patients', icon: 'menu-patients', href: routeHref('/patients'), active: isPatientsPage },
    { key: 'Prediction', icon: 'menu-prediction', href: routeHref('/predict'), active: isPredictPage },
    { key: 'Analytics', icon: 'menu-analytics', href: routeHref('/analytics'), active: isAnalyticsPage },
    { key: 'AI Assistant', icon: 'menu-ai', href: routeHref('/assistant'), active: isAssistantPage },
    { key: 'Emergency Alerts', icon: 'menu-alert', href: routeHref('/alerts'), active: isAlertsPage },
  ];
  const [patientRows, setPatientRows] = useState(() => {
    if (typeof window === 'undefined') return demoPatients;
    try {
      if (window.localStorage.getItem('heartguard_demo_version') !== demoDataVersion) return demoPatients;
      const stored = window.localStorage.getItem('heartguard_patients');
      return stored ? JSON.parse(stored) : demoPatients;
    } catch {
      return demoPatients;
    }
  });
  const [predictionHistory, setPredictionHistory] = useState(() => {
    if (typeof window === 'undefined') return demoPredictions;
    try {
      if (window.localStorage.getItem('heartguard_demo_version') !== demoDataVersion) return demoPredictions;
      const stored = window.localStorage.getItem('heartguard_prediction_history');
      return stored ? JSON.parse(stored) : demoPredictions;
    } catch {
      return demoPredictions;
    }
  });
  const riskFilters = ['all', 'low', 'moderate', 'high', 'critical'];
  const clinicianDisplayName = useMemo(() => {
    const savedName = clinicianName.trim();
    if (savedName) return savedName;
    const local = email.trim().split('@')[0] || 'Clinician';
    return local
      .split(/[._-]+/)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(' ') || 'Clinician';
  }, [clinicianName, email]);
  const clinicianTitle = role === 'doctor' ? `Dr. ${clinicianDisplayName.replace(/^Dr\.?\s+/i, '')}` : clinicianDisplayName;

  const dashboardRisk = useMemo(
    () => [
      { label: 'Low', value: patientRows.filter((r) => String(r.riskLabel || '').toLowerCase() === 'low').length, cls: 'low' },
      { label: 'Moderate', value: patientRows.filter((r) => String(r.riskLabel || '').toLowerCase() === 'moderate').length, cls: 'moderate' },
      { label: 'High', value: patientRows.filter((r) => String(r.riskLabel || '').toLowerCase() === 'high').length, cls: 'high' },
      { label: 'Critical', value: patientRows.filter((r) => String(r.riskLabel || '').toLowerCase() === 'critical').length, cls: 'critical-risk' },
    ],
    [patientRows],
  );
  const recentList = useMemo(
    () =>
      predictionHistory
        .slice()
        .reverse()
        .slice(0, 6)
        .map((p, index) => ({
          key: `${p.id || 'PT-UNK'}-${p.date || ''}-${p.riskScore || 0}-${index}`,
          name: p.name || p.id || 'Predicted case',
          meta: `${p.id || 'PT-UNK'} · Age ${p.age || '--'}`,
          risk: `${p.riskScore || 0}%`,
          riskLabel: p.riskLabel || 'Low',
        })),
    [predictionHistory],
  );
  const recentPredictions = recentList;
  const todayIso = new Date().toISOString().slice(0, 10);
  const predictionsToday = predictionHistory.filter((p) => p.date === todayIso).length;
  const highRiskCount = patientRows.filter((r) => {
    const v = String(r.riskLabel || '').toLowerCase();
    return v === 'high' || v === 'critical';
  }).length;
  const emergencyAlertCount = patientRows.filter((r) => String(r.riskLabel || '').toLowerCase() === 'critical').length;
  const dashboardKpis = [
    { label: 'TOTAL PATIENTS', value: String(patientRows.length), delta: '+12% vs last week' },
    { label: 'HIGH RISK', value: String(highRiskCount), delta: '+4% vs last week' },
    { label: 'PREDICTIONS TODAY', value: String(predictionsToday), delta: '+18% vs last week' },
    { label: 'EMERGENCY ALERTS', value: String(emergencyAlertCount), delta: 'Active vs last week' },
  ];
  const kpiCards = [
    { label: 'TOTAL PATIENTS', value: String(patientRows.length), delta: '+12% vs last week', icon: 'menu-patients' },
    { label: 'HIGH RISK', value: String(highRiskCount), delta: '+4% vs last week', icon: 'alert' },
    { label: 'PREDICTIONS TODAY', value: String(predictionsToday), delta: '+18% vs last week', icon: 'pulse' },
    { label: 'EMERGENCY ALERTS', value: String(emergencyAlertCount), delta: 'Active vs last week', icon: 'heart' },
  ];
  const hasCriticalAlert = dashboardRisk.some((r) => r.cls === 'critical' && r.value > 0);
  const hasAnalyticsData =
    recentPredictions.length > 0 ||
    dashboardRisk.some((r) => r.value > 0) ||
    dashboardKpis.some((kpi) => String(kpi.value || '').trim() !== '');
  const filteredPatients = useMemo(() => {
    const q = patientSearch.trim().toLowerCase();
    return patientRows
      .filter((row) => (patientRiskFilter === 'all' ? true : row.riskLabel.toLowerCase() === patientRiskFilter))
      .filter((row) => {
        if (!q) return true;
        return row.name.toLowerCase().includes(q) || row.id.toLowerCase().includes(q);
      });
  }, [patientRows, patientRiskFilter, patientSearch]);
  const emergencyPatients = useMemo(
    () =>
      patientRows.filter((row) => {
        const label = String(row.riskLabel || '').toLowerCase();
        return label === 'high' || label === 'critical';
      }),
    [patientRows],
  );
  const emergencyCritical = emergencyPatients.filter((row) => String(row.riskLabel || '').toLowerCase() === 'critical');
  const emergencyHigh = emergencyPatients.filter((row) => String(row.riskLabel || '').toLowerCase() === 'high');
  const nextPredictionPatientId = useMemo(() => {
    const numbers = patientRows
      .map((row) => Number(String(row.id || '').replace(/\D/g, '')))
      .filter((n) => Number.isFinite(n));
    return `PT-${Math.max(1000, ...numbers, 999) + 1}`;
  }, [patientRows]);
  const selectedPredictionPatient = useMemo(
    () => patientRows.find((row) => row.id === selectedPredictionPatientId) || null,
    [patientRows, selectedPredictionPatientId],
  );
  const predictionPatientSuggestions = useMemo(() => {
    const q = predictionPatientQuery.trim().toLowerCase();
    if (!q) return [];
    return patientRows
      .filter((row) => row.name.toLowerCase().includes(q) || row.id.toLowerCase().includes(q))
      .slice(0, 6);
  }, [patientRows, predictionPatientQuery]);
  const canUsePreviousVisit = Boolean(selectedPredictionPatient);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('heartguard_demo_version', demoDataVersion);
    window.localStorage.setItem('heartguard_patients', JSON.stringify(patientRows));
  }, [patientRows]);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('heartguard_prediction_history', JSON.stringify(predictionHistory));
  }, [predictionHistory]);

  const saveNewPatient = () => {
    if (!newPatient.name.trim() || !newPatient.age.trim()) {
      setAddPatientError('Name and Age are required');
      return;
    }
    const nextNumber = 1000 + patientRows.length;
    const id = `PT-${nextNumber}`;
    const today = new Date().toISOString().slice(0, 10);
    const record = {
      id,
      name: newPatient.name.trim(),
      age: newPatient.age.trim(),
      ageSex: `${newPatient.age.trim()}y · ${newPatient.sex.trim() || '-'}`,
      ef: newPatient.ef.trim() ? `${newPatient.ef.trim()}%` : '--',
      bp: `${newPatient.systolicBp.trim() || '--'}/${newPatient.diastolicBp.trim() || '--'}`,
      creatinine: newPatient.creatinine.trim() || '--',
      riskScore: 0,
      riskLabel: 'Low',
      lastVisit: today,
      bmi: newPatient.bmi.trim(),
      cholesterol: newPatient.cholesterol.trim(),
      glucose: newPatient.glucose.trim(),
      heartRate: newPatient.heartRate.trim(),
      reports: [],
    };
    setPatientRows((prev) => [record, ...prev]);
    setExpandedPatientId(id);
    setShowAddPatientModal(false);
    setAddPatientError('');
    setNewPatient({
      name: '',
      age: '',
      sex: '',
      bmi: '',
      cholesterol: '',
      systolicBp: '',
      diastolicBp: '',
      glucose: '',
      heartRate: '',
      ef: '',
      creatinine: '',
    });
  };

  const openEditPatient = (row) => {
    setEditingPatientId(row.id);
    setEditPatientError('');
    setReportUploadMessage('');
    setEditPatient({
      id: row.id,
      name: row.name || '',
      age: parsePatientAge(row),
      sex: String(row.ageSex || '').split('·')[1]?.trim() || '',
      bmi: row.bmi || '',
      cholesterol: row.cholesterol || '',
      systolicBp: parseBpValue(row.bp, 0),
      diastolicBp: parseBpValue(row.bp, 1),
      glucose: row.glucose || '',
      heartRate: row.heartRate || '',
      ef: parsePercentValue(row.ef),
      creatinine: row.creatinine && row.creatinine !== '--' ? String(row.creatinine) : '',
      riskScore: row.riskScore ?? '',
      riskLabel: row.riskLabel || 'Low',
      lastVisit: row.lastVisit || new Date().toISOString().slice(0, 10),
      smoking: Boolean(row.smoking),
      diabetes: Boolean(row.diabetes),
      hypertension: Boolean(row.hypertension),
    });
  };

  const closeEditPatient = () => {
    setEditingPatientId('');
    setEditPatientError('');
  };

  const saveEditedPatient = () => {
    const cleanField = (value) => String(value ?? '').trim();
    if (!cleanField(editPatient.name) || !cleanField(editPatient.age)) {
      setEditPatientError('Name and Age are required');
      return;
    }
    const patientId = editPatient.id || editingPatientId;
    const score = Number(editPatient.riskScore);
    const cleanRiskScore = Number.isFinite(score) ? Math.max(0, Math.min(100, Math.round(score))) : null;
    const savedPatient = {
      id: patientId,
      name: cleanField(editPatient.name),
      age: cleanField(editPatient.age),
      ageSex: `${cleanField(editPatient.age)}y · ${cleanField(editPatient.sex) || '-'}`,
      ef: cleanField(editPatient.ef) ? `${cleanField(editPatient.ef)}%` : '--',
      bp: `${cleanField(editPatient.systolicBp) || '--'}/${cleanField(editPatient.diastolicBp) || '--'}`,
      creatinine: cleanField(editPatient.creatinine) || '--',
      riskLabel: cleanField(editPatient.riskLabel) || 'Low',
      lastVisit: editPatient.lastVisit || new Date().toISOString().slice(0, 10),
      bmi: cleanField(editPatient.bmi),
      cholesterol: cleanField(editPatient.cholesterol),
      glucose: cleanField(editPatient.glucose),
      heartRate: cleanField(editPatient.heartRate),
      smoking: editPatient.smoking,
      diabetes: editPatient.diabetes,
      hypertension: editPatient.hypertension,
    };
    setPatientRows((prev) =>
      prev.map((row) =>
        row.id === patientId
          ? {
              ...row,
              ...savedPatient,
              riskScore: cleanRiskScore ?? row.riskScore,
            }
          : row,
      ),
    );
    if (cleanRiskScore !== null) {
      setPredictionHistory((prev) =>
        prev.map((item) =>
          item.id === patientId
            ? { ...item, name: savedPatient.name, age: savedPatient.age, riskScore: cleanRiskScore, riskLabel: savedPatient.riskLabel }
            : item,
        ),
      );
    }
    setExpandedPatientId(patientId);
    setReportUploadMessage('Patient changes saved');
    closeEditPatient();
  };

  const savePatientReports = () => {
    if (!uploadPatient || !selectedReportFiles.length) return;
    const uploadedAt = new Date().toISOString();
    const reports = selectedReportFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || 'report',
      uploadedAt,
    }));
    setPatientRows((prev) =>
      prev.map((patient) =>
        patient.id === uploadPatient.id
          ? { ...patient, reports: [...reports, ...((patient.reports || []))] }
          : patient,
      ),
    );
    setExpandedPatientId(uploadPatient.id);
    setReportUploadMessage(`${reports.length} report${reports.length === 1 ? '' : 's'} uploaded for ${uploadPatient.name}`);
    setUploadPatient(null);
    setSelectedReportFiles([]);
  };
  const searchFromDashboard = () => {
    const q = dashboardSearch.trim();
    goTo(`/patients${q ? `?search=${encodeURIComponent(q)}` : ''}`);
  };

  const parsePatientAge = (row) => {
    const fromAge = Number(row?.age);
    if (Number.isFinite(fromAge) && fromAge > 0) return String(fromAge);
    const match = String(row?.ageSex || '').match(/\d+/);
    return match ? match[0] : '';
  };

  const parsePercentValue = (value) => String(value || '').replace('%', '').trim();

  const parseBpValue = (bp, index) => {
    const parts = String(bp || '').split('/');
    return parts[index] && parts[index] !== '--' ? parts[index].trim() : '';
  };

  const fillPreviousVisitFromPatient = (row) => {
    if (!row) return;
    setSelectedPredictionPatientId(row.id);
    setPredictionPatientQuery(`${row.name} (${row.id})`);
    setPredictForm((p) => ({
      ...p,
      age: parsePatientAge(row),
      bmi: row.bmi || '',
      previous_visit_enabled: true,
      days_since_last_visit: '',
      prev_ejection_fraction: parsePercentValue(row.ef),
      prev_serum_creatinine: row.creatinine && row.creatinine !== '--' ? String(row.creatinine) : '',
      prev_systolic_bp: parseBpValue(row.bp, 0),
      prev_cholesterol: row.cholesterol || '',
      prev_glucose: row.glucose || '',
      prev_bmi: row.bmi || '',
    }));
  };

  const handlePredictionPatientQuery = (value) => {
    setPredictionPatientQuery(value);
    setSelectedPredictionPatientId('');
    setPredictForm((p) => ({
      ...p,
      previous_visit_enabled: false,
      days_since_last_visit: '',
      prev_ejection_fraction: '',
      prev_serum_creatinine: '',
      prev_systolic_bp: '',
      prev_cholesterol: '',
      prev_glucose: '',
      prev_bmi: '',
    }));
    const q = value.trim().toLowerCase();
    const exact = patientRows.find((row) => row.id.toLowerCase() === q || row.name.toLowerCase() === q);
    if (exact) fillPreviousVisitFromPatient(exact);
  };

  const goToNextPredictionStep = () => {
    if (predictionStep === 1 && !predictionPatientQuery.trim()) {
      setPredictError('Enter a patient name or select an existing patient before entering clinical data.');
      return;
    }
    setPredictError('');
    setPredictionStep((s) => Math.min(5, s + 1));
  };

  const runPrediction = async () => {
    const patientQuery = predictionPatientQuery.trim();
    const exactPatientMatch = patientRows.find((row) => {
      const q = patientQuery.toLowerCase();
      return row.id.toLowerCase() === q || row.name.toLowerCase() === q || `${row.name} (${row.id})`.toLowerCase() === q;
    });
    const activePatient = selectedPredictionPatient || exactPatientMatch || null;
    const patientName = activePatient?.name || patientQuery;
    const patientId = activePatient?.id || nextPredictionPatientId;

    if (!patientName) {
      setPredictError('Enter a patient name or patient ID before running forecast.');
      setPredictionStep(1);
      return;
    }

    const hasAnyNumericInput = [
      predictForm.age,
      predictForm.bmi,
      predictForm.systolic_bp,
      predictForm.diastolic_bp,
      predictForm.cholesterol,
      predictForm.glucose,
      predictForm.heart_rate,
      predictForm.ejection_fraction,
      predictForm.serum_creatinine,
      predictForm.activity_hours,
    ].some((v) => Number(v) > 0);
    const hasAnyBooleanFlag = predictForm.smoking || predictForm.diabetes || predictForm.hypertension;
    if (!hasAnyNumericInput && !hasAnyBooleanFlag) {
      setPredictError('Enter at least one clinical value before running prediction.');
      return;
    }
    const toNumber = (v) => {
      if (v === '' || v === null || typeof v === 'undefined') return 0;
      const n = Number(v);
      return Number.isFinite(n) ? n : 0;
    };
    const payload = {
      ...predictForm,
      patient_id: patientId,
      patient_name: patientName,
      age: toNumber(predictForm.age),
      bmi: toNumber(predictForm.bmi),
      systolic_bp: toNumber(predictForm.systolic_bp),
      diastolic_bp: toNumber(predictForm.diastolic_bp),
      cholesterol: toNumber(predictForm.cholesterol),
      glucose: toNumber(predictForm.glucose),
      heart_rate: toNumber(predictForm.heart_rate),
      ejection_fraction: toNumber(predictForm.ejection_fraction),
      serum_creatinine: toNumber(predictForm.serum_creatinine),
      activity_hours: toNumber(predictForm.activity_hours),
      previous_visit_enabled: Boolean(activePatient && predictForm.previous_visit_enabled),
      days_since_last_visit: toNumber(predictForm.days_since_last_visit),
      prev_ejection_fraction: toNumber(predictForm.prev_ejection_fraction),
      prev_serum_creatinine: toNumber(predictForm.prev_serum_creatinine),
      prev_systolic_bp: toNumber(predictForm.prev_systolic_bp),
      prev_cholesterol: toNumber(predictForm.prev_cholesterol),
      prev_glucose: toNumber(predictForm.prev_glucose),
      prev_bmi: toNumber(predictForm.prev_bmi),
    };
    setPredictError('');
    setPredictLoading(true);
    setPredictResult(null);
    try {
      const res = await fetch(apiUrl('/api/predict'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setPredictError(json?.detail || 'Prediction failed. Please provide valid inputs.');
        setPredictLoading(false);
        return;
      }
      await new Promise((r) => setTimeout(r, 1400));
      setPredictResult(json);
      const normalizeRiskLabel = (label, score) => {
        if (label) return label;
        if (score >= 75) return 'Critical';
        if (score >= 60) return 'High';
        if (score >= 40) return 'Moderate';
        return 'Low';
      };
      const riskLabel = normalizeRiskLabel(json?.risk_category, Number(json?.risk_score || 0));
      const now = new Date();
      const dateIso = now.toISOString().slice(0, 10);
      const predictionRecord = {
        id: patientId,
        name: patientName,
        age: payload.age || '',
        ageSex: `${payload.age || '--'}y · -`,
        ef: payload.ejection_fraction ? `${payload.ejection_fraction}%` : '--',
        bp: `${payload.systolic_bp || '--'}/${payload.diastolic_bp || '--'}`,
        creatinine: payload.serum_creatinine || '--',
        riskScore: Number(json?.risk_score || 0),
        riskLabel,
        lastVisit: dateIso,
        bmi: payload.bmi || '',
        cholesterol: payload.cholesterol || '',
        glucose: payload.glucose || '',
        heartRate: payload.heart_rate || '',
      };
      setReportPatient(predictionRecord);
      setSelectedPredictionPatientId(patientId);
      setPredictionPatientQuery(`${patientName} (${patientId})`);
      setPatientRows((prev) => {
        const exists = prev.some((row) => row.id === patientId);
        if (exists) {
          return prev.map((row) => (row.id === patientId ? { ...row, ...predictionRecord } : row));
        }
        return [predictionRecord, ...prev];
      });
      setPredictionHistory((prev) => [
        ...prev,
        {
          id: predictionRecord.id,
          name: predictionRecord.name,
          age: predictionRecord.age || payload.age || '',
          date: dateIso,
          riskScore: predictionRecord.riskScore,
          riskLabel: predictionRecord.riskLabel,
        },
      ]);
    } catch {
      setPredictError('Prediction service is unavailable. Please try again when backend is running.');
    } finally {
      setPredictLoading(false);
    }
  };

  const escapeHtml = (value) =>
    String(value ?? '')
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const printPredictionReport = () => {
    if (!predictResult || typeof window === 'undefined') return;
    const patient = reportPatient || {};
    const issuedAt = new Date();
    const generatedOn = issuedAt.toLocaleString();
    const forecastRows = (predictResult.forecast_points || [])
      .map((point) => `<tr><td>${escapeHtml(point.label)}</td><td>${escapeHtml(point.value)}%</td></tr>`)
      .join('');
    const factorRows = (predictResult.top_factors || [])
      .map((factor) => `<tr><td>${escapeHtml(factor.name)}</td><td>${escapeHtml(factor.weight)}%</td></tr>`)
      .join('');
    const recommendationItems = (predictResult.recommendations || [])
      .map((rec) => `<li>${escapeHtml(rec)}</li>`)
      .join('');
    const deltaRows = currentVsPrevious
      .filter((row) => String(row.current).trim() || String(row.previous).trim())
      .map((row) => `<tr><td>${escapeHtml(row.label)}</td><td>${escapeHtml(row.previous || '--')}</td><td>${escapeHtml(row.current || '--')}</td></tr>`)
      .join('');
    const reportHtml = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>HeartGuard Prediction Report</title>
  <style>
    @page { size: A4; margin: 16mm; }
    body { margin: 0; color: #142331; font-family: Arial, Helvetica, sans-serif; background: #fff; }
    .report { max-width: 900px; margin: 0 auto; }
    .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 3px solid #12bfe8; padding-bottom: 18px; }
    .brand { color: #07263a; font-size: 28px; font-weight: 800; }
    .sub { margin-top: 5px; color: #577084; font-size: 13px; }
    .meta { text-align: right; color: #40596d; font-size: 12px; line-height: 1.65; }
    h1 { margin: 22px 0 8px; color: #08263b; font-size: 24px; }
    h2 { margin: 0 0 12px; color: #0a344e; font-size: 16px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin: 18px 0; }
    .card { border: 1px solid #cfe3ee; border-radius: 10px; padding: 14px; background: #f7fbfd; }
    .score { display: grid; grid-template-columns: 160px 1fr; gap: 14px; align-items: center; border: 2px solid #12bfe8; background: #edfaff; }
    .score-number { border-radius: 50%; width: 132px; height: 132px; display: grid; place-items: center; background: #08263b; color: #fff; font-size: 42px; font-weight: 800; }
    .badge { display: inline-block; border-radius: 999px; padding: 7px 12px; background: #ffe9ee; color: #c0163a; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th, td { padding: 8px 9px; border-bottom: 1px solid #dcebf2; text-align: left; vertical-align: top; }
    th { background: #e8f6fb; color: #0a344e; font-size: 11px; letter-spacing: .6px; text-transform: uppercase; }
    ul { margin: 0; padding-left: 18px; }
    li { margin: 6px 0; }
    .footer { margin-top: 18px; padding-top: 12px; border-top: 1px solid #dcebf2; color: #607789; font-size: 11px; line-height: 1.5; }
    .signature { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 30px; }
    .sig-line { border-top: 1px solid #9fb6c5; padding-top: 8px; color: #40596d; font-size: 12px; }
    @media print { .no-print { display: none; } body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <main class="report">
    <section class="top">
      <div>
        <div class="brand">${escapeHtml(hospitalName || 'HeartGuard Medical Center')}</div>
        <div class="sub">HeartGuard AI Cardiology · Readmission Risk Forecast</div>
      </div>
      <div class="meta">
        <strong>Report ID:</strong> HG-${issuedAt.getTime()}<br />
        <strong>Generated:</strong> ${escapeHtml(generatedOn)}<br />
        <strong>Prepared by:</strong> ${escapeHtml(clinicianTitle)}
      </div>
    </section>

    <h1>Prediction Report</h1>
    <section class="card score">
      <div class="score-number">${escapeHtml(predictResult.risk_score)}%</div>
      <div>
        <h2>Readmission Risk Summary</h2>
        <p><span class="badge">${escapeHtml(predictResult.risk_category)}</span></p>
        <p><strong>Predicted readmission window:</strong> ~${escapeHtml(predictResult.predicted_days)} days</p>
        <p>${escapeHtml(predictResult.summary || '')}</p>
        ${predictResult?.trajectory?.enabled ? `<p><strong>Trajectory:</strong> ${escapeHtml(predictResult.trajectory.direction)} (${escapeHtml(predictResult.trajectory.pts_per_day)} pts/day)</p>` : ''}
      </div>
    </section>

    <section class="grid">
      <div class="card">
        <h2>Patient Details</h2>
        <table>
          <tr><th>Patient</th><td>${escapeHtml(patient.name || 'Not specified')}</td></tr>
          <tr><th>Patient ID</th><td>${escapeHtml(patient.id || 'Not specified')}</td></tr>
          <tr><th>Age / Sex</th><td>${escapeHtml(patient.ageSex || `${predictForm.age || '--'}y · -`)}</td></tr>
          <tr><th>Last Visit</th><td>${escapeHtml(patient.lastVisit || new Date().toISOString().slice(0, 10))}</td></tr>
        </table>
      </div>
      <div class="card">
        <h2>Current Clinical Inputs</h2>
        <table>
          <tr><th>BP</th><td>${escapeHtml(patient.bp || `${predictForm.systolic_bp || '--'}/${predictForm.diastolic_bp || '--'}`)}</td></tr>
          <tr><th>EF</th><td>${escapeHtml(patient.ef || `${predictForm.ejection_fraction || '--'}%`)}</td></tr>
          <tr><th>Creatinine</th><td>${escapeHtml(patient.creatinine || predictForm.serum_creatinine || '--')}</td></tr>
          <tr><th>BMI / Chol / Glucose</th><td>${escapeHtml(predictForm.bmi || '--')} / ${escapeHtml(predictForm.cholesterol || '--')} / ${escapeHtml(predictForm.glucose || '--')}</td></tr>
        </table>
      </div>
    </section>

    <section class="grid">
      <div class="card">
        <h2>60-Day Forecast</h2>
        <table><thead><tr><th>Time point</th><th>Risk</th></tr></thead><tbody>${forecastRows}</tbody></table>
      </div>
      <div class="card">
        <h2>Top Risk Factors</h2>
        <table><thead><tr><th>Factor</th><th>Weight</th></tr></thead><tbody>${factorRows}</tbody></table>
      </div>
    </section>

    ${deltaRows ? `<section class="card"><h2>Previous vs Current Visit</h2><table><thead><tr><th>Metric</th><th>Previous</th><th>Current</th></tr></thead><tbody>${deltaRows}</tbody></table></section>` : ''}

    <section class="card">
      <h2>Recommendations</h2>
      <ul>${recommendationItems}</ul>
    </section>

    <section class="signature">
      <div class="sig-line">Physician signature</div>
      <div class="sig-line">Hospital seal / authorized review</div>
    </section>

    <p class="footer">
      This report is AI-assisted clinical decision support and is not a substitute for professional medical judgment.
      Interpret results with the full clinical history, examination, and institutional protocol.
    </p>
  </main>
  <script>window.onload = () => { window.focus(); window.print(); };</script>
</body>
</html>`;
    const reportWindow = window.open('', '_blank', 'width=980,height=1200');
    if (!reportWindow) return;
    reportWindow.document.open();
    reportWindow.document.write(reportHtml);
    reportWindow.document.close();
  };

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const syncRoute = () => setRoute(getCurrentRoute());
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  useEffect(() => {
    if (isPatientsPage) {
      setPatientSearch(new URLSearchParams(routeQuery).get('search') || '');
    }
  }, [isPatientsPage, routeQuery]);

  useEffect(() => {
    if (isLoginPage) return;
    fetch(API_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('API not available'))))
      .then((payload) => setData(payload))
      .catch(() => setData(fallback));
  }, [isLoginPage]);

  useEffect(() => {
    if (isLoginPage) return;
    fetch(HISTORY_API_URL)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('History API not available'))))
      .then((payload) => {
        if (Array.isArray(payload?.predictions)) {
          setPredictionHistory(payload.predictions);
        }
        if (Array.isArray(payload?.patients)) {
          setPatientRows(payload.patients);
        }
      })
      .catch(() => {});
  }, [isLoginPage]);

  const ringStyle = useMemo(() => {
    const risk = data?.monitor?.risk ?? 86;
    const safeRisk = Math.max(0, Math.min(100, risk));
    const circumference = 2 * Math.PI * 78;
    const dash = (safeRisk / 100) * circumference;
    return {
      strokeDasharray: `${dash} ${circumference}`,
      strokeDashoffset: `${circumference * 0.025}`,
    };
  }, [data]);

  const goTo = (path) => {
    if (typeof window === 'undefined') return;
    const nextHash = routeHref(path);
    if (window.location.hash === nextHash) {
      setRoute(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    window.location.hash = path;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const forecastPoints = predictResult?.forecast_points || [];
  const forecastMax = Math.max(100, ...forecastPoints.map((p) => Number(p.value) || 0));
  const chartWidth = 860;
  const chartHeight = 230;
  const chartPad = 26;
  const forecastPath = forecastPoints
    .map((p, i) => {
      const x = chartPad + (i * (chartWidth - chartPad * 2)) / Math.max(1, forecastPoints.length - 1);
      const y = chartHeight - chartPad - ((Number(p.value) || 0) / forecastMax) * (chartHeight - chartPad * 2);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
  const currentVsPrevious = predictForm.previous_visit_enabled
    ? [
        { label: 'Ejection Fraction (%)', current: predictForm.ejection_fraction, previous: predictForm.prev_ejection_fraction },
        { label: 'Serum Creatinine (mg/dL)', current: predictForm.serum_creatinine, previous: predictForm.prev_serum_creatinine },
        { label: 'Systolic BP (mmHg)', current: predictForm.systolic_bp, previous: predictForm.prev_systolic_bp },
        { label: 'Cholesterol (mg/dL)', current: predictForm.cholesterol, previous: predictForm.prev_cholesterol },
        { label: 'Glucose (mg/dL)', current: predictForm.glucose, previous: predictForm.prev_glucose },
        { label: 'BMI (kg/m²)', current: predictForm.bmi, previous: predictForm.prev_bmi },
      ]
    : [];

  const makeLinePath = (points, width = 520, height = 190, pad = 18) => {
    if (!points.length) return '';
    const max = Math.max(1, ...points.map((p) => Number(p.value) || 0));
    return points
      .map((p, i) => {
        const x = pad + (i * (width - pad * 2)) / Math.max(1, points.length - 1);
        const y = height - pad - ((Number(p.value) || 0) / max) * (height - pad * 2);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const makeAreaPath = (points, width = 520, height = 190, pad = 18) => {
    const line = makeLinePath(points, width, height, pad);
    if (!line || points.length < 2) return '';
    const lastX = pad + ((points.length - 1) * (width - pad * 2)) / Math.max(1, points.length - 1);
    return `${line} L ${lastX} ${height - pad} L ${pad} ${height - pad} Z`;
  };

  const makeScaledLinePath = (points, minValue, maxValue, width = 520, height = 190, pad = 18) => {
    const span = Math.max(1, maxValue - minValue);
    return points
      .map((p, i) => {
        const x = pad + (i * (width - pad * 2)) / Math.max(1, points.length - 1);
        const normalized = (Number(p.value) - minValue) / span;
        const y = height - pad - Math.max(0, Math.min(1, normalized)) * (height - pad * 2);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const makeScaledAreaPath = (points, minValue, maxValue, width = 520, height = 190, pad = 18) => {
    const line = makeScaledLinePath(points, minValue, maxValue, width, height, pad);
    if (!line || points.length < 2) return '';
    const lastX = pad + ((points.length - 1) * (width - pad * 2)) / Math.max(1, points.length - 1);
    return `${line} L ${lastX} ${height - pad} L ${pad} ${height - pad} Z`;
  };

  const dashboardForecastPoints = useMemo(() => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const fallback = [40, 43, 48, 51, 57, 64, 71, 76, 82];
    return labels.map((label, idx) => ({ label, value: fallback[idx] || 0 }));
  }, []);

  const dashboardForecastPath = makeLinePath(dashboardForecastPoints);
  const dashboardForecastArea = makeAreaPath(dashboardForecastPoints);
  const dashboardReadmissionPath = makeLinePath(dashboardForecastPoints.map((p) => ({ ...p, value: Math.max(0, p.value - 3) })));
  const riskTotal = Math.max(1, dashboardRisk.reduce((sum, row) => sum + row.value, 0));
  const riskDisplayTotal = dashboardRisk.reduce((sum, row) => sum + row.value, 0);
  const dashboardDonutStyle = {
    background: `conic-gradient(#4dc05a 0 ${dashboardRisk[0].value / riskTotal}turn, #f0c220 0 ${(dashboardRisk[0].value + dashboardRisk[1].value) / riskTotal}turn, #ff851a 0 ${(dashboardRisk[0].value + dashboardRisk[1].value + dashboardRisk[2].value) / riskTotal}turn, #ff2346 0 1turn)`,
  };
  const ageRiskGroups = useMemo(() => {
    const groups = [
      { label: '30-40', min: 30, max: 40, values: [] },
      { label: '40-50', min: 40, max: 50, values: [] },
      { label: '50-60', min: 50, max: 60, values: [] },
      { label: '60-70', min: 60, max: 70, values: [] },
      { label: '70-80', min: 70, max: 80, values: [] },
      { label: '80+', min: 80, max: 200, values: [] },
    ];
    patientRows.forEach((row) => {
      const age = Number(row.age || String(row.ageSex || '').match(/\d+/)?.[0] || 0);
      const bucket = groups.find((g) => age >= g.min && age < g.max);
      if (bucket) bucket.values.push(Number(row.riskScore || 0));
    });
    return groups.map((g) => ({
      label: g.label,
      patients: g.values.length,
      value: g.values.length ? Math.round(g.values.reduce((a, b) => a + b, 0) / g.values.length) : 0,
    }));
  }, [patientRows]);

  const analyticsAdmissionPoints = [142, 158, 170, 176, 194, 207, 224, 232, 240].map((value, idx) => ({ label: idx, value }));
  const analyticsReadmissionPoints = [128, 142, 156, 166, 180, 196, 216, 226, 240].map((value, idx) => ({ label: idx, value }));
  const analyticsTrendPath = makeScaledLinePath(analyticsAdmissionPoints, 110, 250);
  const analyticsTrendArea = makeScaledAreaPath(analyticsAdmissionPoints, 110, 250);
  const analyticsReadmissionPath = makeScaledLinePath(analyticsReadmissionPoints, 110, 250);
  const analyticsMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const modelFeatureImportance = [
    ['Ejection Fraction', 0.21],
    ['Serum Creatinine', 0.18],
    ['Age', 0.14],
    ['Systolic BP', 0.11],
    ['Diabetes', 0.09],
    ['BMI', 0.08],
    ['Cholesterol', 0.06],
    ['Smoking', 0.05],
    ['Glucose', 0.05],
  ];
  const rocPoints = [
    { label: '0', value: 0 },
    { label: '.04', value: 58 },
    { label: '.10', value: 66 },
    { label: '.18', value: 73 },
    { label: '.25', value: 78 },
    { label: '.40', value: 85 },
    { label: '.55', value: 90 },
    { label: '.75', value: 95 },
    { label: '1', value: 100 },
  ];
  const rocPath = makeLinePath(rocPoints, 520, 190, 18);
  const rocArea = makeAreaPath(rocPoints, 520, 190, 18);
  const riskHasData = dashboardRisk.some((row) => row.value > 0);
  const riskDistributionRows = dashboardRisk.map((row) => ({
    ...row,
    pct: riskHasData ? Math.round((row.value / riskTotal) * 100) : 0,
  }));
  const heatmapRows = [
    { age: '30-40', risk: 22 },
    { age: '40-50', risk: 34 },
    { age: '50-60', risk: 48 },
    { age: '60-70', risk: 61 },
    { age: '70-80', risk: 72 },
    { age: '80+', risk: 81 },
  ];
  const assistantFocusPatient = useMemo(() => {
    if (!patientRows.length) return null;
    return [...patientRows].sort((a, b) => Number(b.riskScore || 0) - Number(a.riskScore || 0))[0];
  }, [patientRows]);
  const assistantPatientQuestion = assistantFocusPatient
    ? `Explain why patient ${assistantFocusPatient.id} is ${String(assistantFocusPatient.riskLabel || 'high').toLowerCase()} risk`
    : 'Run a prediction first, then ask why a patient is high risk';

  const assistantQuestionGroups = [
    {
      title: 'Risk & Triage',
      items: [
        assistantPatientQuestion,
        "Summarize today's critical cases",
        'When should I trigger emergency escalation?',
      ],
    },
    {
      title: 'Treatment Planning',
      items: [
        'What precautions for reduced ejection fraction?',
        'How should I adjust care for uncontrolled BP in HF?',
        'Provide a discharge checklist for high-risk patient',
      ],
    },
    {
      title: 'Follow-up & Monitoring',
      items: [
        'How do I lower readmission risk after discharge?',
        'What follow-up schedule is best for CKD + HF patient?',
        'What labs should be repeated in next 7 days?',
      ],
    },
  ];

  const sendAssistantQuestion = async (questionText) => {
    const question = questionText.trim();
    if (!question || assistantLoading) return;
    setAssistantMessages((prev) => [...prev, { role: 'user', text: question }]);
    setAssistantLoading(true);
    try {
      const res = await fetch(apiUrl('/api/assistant/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, patients: patientRows }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAssistantMessages((prev) => [...prev, { role: 'assistant', text: json?.detail || 'Unable to answer right now.' }]);
      } else {
        setAssistantMessages((prev) => [...prev, { role: 'assistant', text: json?.answer || 'No answer generated.' }]);
      }
    } catch {
      setAssistantMessages((prev) => [...prev, { role: 'assistant', text: 'Assistant service is unavailable. Check backend and OpenAI key.' }]);
    } finally {
      setAssistantLoading(false);
      setAssistantInput('');
    }
  };
  const lastAssistantAnswer = [...assistantMessages].reverse().find((m) => m.role === 'assistant' && m.text)?.text || '';
  const copyLastAssistantAnswer = async () => {
    if (!lastAssistantAnswer || typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(lastAssistantAnswer);
    } catch {
      // Ignore clipboard failures in unsupported contexts.
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!emailOk) {
      setLoginError(trimmedEmail ? 'Enter a valid email' : 'Email is required');
      return;
    }
    if (!password.trim()) {
      setLoginError('Password is required');
      return;
    }
    if (password.trim().length < 4) {
      setLoginError('Password must be at least 4 characters');
      return;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('heartguard_user_email', trimmedEmail);
      window.localStorage.setItem('heartguard_clinician_name', clinicianName.trim());
      window.localStorage.setItem('heartguard_hospital_name', hospitalName.trim() || 'HeartGuard Medical Center');
      window.localStorage.setItem('heartguard_user_role', role);
    }
    setLoginError('');
    goTo('/dashboard');
  };

  if (isLoginPage) {
    return (
      <div className="login-page">
        <form className="login-card" onSubmit={handleLoginSubmit} noValidate>
          <div className="login-brand"><span className="brand-icon">♡</span>HeartGuard</div>
          <h1>Welcome back</h1>
          <p>Sign in to your clinical workspace</p>

          <div className="login-role-switch" role="tablist" aria-label="Select role">
            <button
              type="button"
              className={role === 'doctor' ? 'active' : ''}
              onClick={() => setRole('doctor')}
            >
              <span className="role-icon"><UiIcon type="stethoscope" /></span>
              Doctor
            </button>
            <button
              type="button"
              className={role === 'admin' ? 'active' : ''}
              onClick={() => setRole('admin')}
            >
              <span className="role-icon"><UiIcon type="shield" /></span>
              Admin
            </button>
          </div>

          <div className="login-input">
            <span className="input-icon"><UiIcon type="stethoscope" /></span>
            <input
              type="text"
              value={clinicianName}
              onChange={(e) => setClinicianName(e.target.value)}
              placeholder={role === 'doctor' ? 'Doctor full name' : 'Admin full name'}
            />
          </div>
          <div className="login-input">
            <span className="input-icon"><UiIcon type="shield" /></span>
            <input
              type="text"
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="Hospital / clinic name"
            />
          </div>
          <div className="login-input">
            <span className="input-icon"><UiIcon type="mail" /></span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === 'doctor' ? 'doctor@hospital.org' : 'admin@hospital.org'}
            />
          </div>
          <div className="login-input">
            <span className="input-icon"><UiIcon type="lock" /></span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          {loginError ? <p className="login-error">{loginError}</p> : null}
          <button type="submit" className="primary-btn login-submit">Sign in securely</button>
          <p className="login-note">Demo credentials: any email + any 4+ char password</p>
        </form>
      </div>
    );
  }

  if (isDashboardPage || isPatientsPage || isAnalyticsPage || isAssistantPage || isAlertsPage) {
    return (
      <div className="dashboard-page">
        <aside className="dash-sidebar">
          <div className="dash-logo">
            <div className="dash-logo-main"><span className="brand-icon">♡</span>HeartGuard</div>
            <div className="dash-logo-sub">AI CARDIOLOGY</div>
          </div>
          <nav className="dash-nav">
            {navItems.map((item) => (
              <a key={item.key} className={item.active ? 'active' : ''} href={item.href || '#0'}>
                <UiIcon type={item.icon} />
                <span>{item.key}</span>
              </a>
            ))}
          </nav>
          <button className="dash-signout" onClick={() => goTo('/')}>
            <UiIcon type="signout" />
            <span>Sign out</span>
          </button>
        </aside>

        <section className="dash-main">
          {isAlertsPage ? (
            <>
              <header className="dash-header alerts-header">
                <div>
                  <h1>Emergency Alerts</h1>
                  <p>{emergencyCritical.length} critical · {emergencyHigh.length} high-risk patients requiring attention</p>
                </div>
                <span className="alerts-live">LIVE MONITORING</span>
              </header>

              <div className="alerts-label critical">CRITICAL — IMMEDIATE ACTION</div>
              <div className="alerts-label high">HIGH RISK — MONITOR CLOSELY</div>

              <section className="alerts-list dash-panel">
                {emergencyPatients.length ? (
                  emergencyPatients.map((row) => {
                    const initial = (row.name || '?').trim().charAt(0).toUpperCase();
                    const riskValue = Number(row.riskScore || 0);
                    return (
                      <article key={row.id} className="alerts-row">
                        <div className="alerts-avatar">{initial}</div>
                        <div className="alerts-main">
                          <h3>{row.name}</h3>
                          <p>{row.id} · EF {row.ef || '--'} · BP {row.bp || '--'}</p>
                        </div>
                        <div className="alerts-risk">
                          <small>Risk</small>
                          <strong>{riskValue}%</strong>
                        </div>
                        <button className="alerts-review" onClick={() => goTo(`/patients?search=${encodeURIComponent(row.id)}`)}>Review</button>
                      </article>
                    );
                  })
                ) : (
                  <div className="alerts-empty">
                    <p>No high/critical alerts right now.</p>
                    <div className="chart-empty">
                      <div className="chart-empty-grid">
                        {Array.from({ length: 24 }).map((_, i) => <span key={i} className="chart-cell" />)}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          ) : isAssistantPage ? (
            <>
              <header className="dash-header assistant-header">
                <div>
                  <h1>HeartGuard AI Assistant</h1>
                  <p>GPT-powered clinical reasoning · trained on 50k+ cardiac records</p>
                </div>
              </header>

              <section className="assistant-panel dash-panel">
                <div className="assistant-layout">
                  <aside className="assistant-prompts">
                    <h3>Suggested Questions</h3>
                    {assistantQuestionGroups.map((group) => (
                      <div className="assistant-group" key={group.title}>
                        <h4>{group.title}</h4>
                        <div className="assistant-group-chips">
                          {group.items.map((q) => (
                            <button key={q} onClick={() => sendAssistantQuestion(q)}>{q}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </aside>

                  <div className="assistant-chat">
                    <div className="assistant-messages">
                      {assistantMessages.map((m, idx) => (
                        <div key={`${m.role}-${idx}`} className={`assistant-msg ${m.role === 'user' ? 'user' : 'bot'}`}>
                          <p>{m.text}</p>
                        </div>
                      ))}
                      {assistantLoading ? <div className="assistant-typing">Thinking...</div> : null}
                    </div>

                    <div className="assistant-tools-row">
                      <button onClick={() => setAssistantMessages([{ role: 'assistant', text: `Hello ${clinicianTitle}. I'm your HeartGuard AI assistant. Ask me about patient risk, clinical guidelines, or treatment plans.` }])}>
                        New chat
                      </button>
                      <button onClick={() => sendAssistantQuestion('Summarize the last assistant answer into 3 bullet points with next actions.')}>
                        Summarize last answer
                      </button>
                      <button onClick={copyLastAssistantAnswer}>
                        Copy last answer
                      </button>
                    </div>

                    <div className="assistant-input-row">
                      <input
                        value={assistantInput}
                        onChange={(e) => setAssistantInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') sendAssistantQuestion(assistantInput);
                        }}
                        placeholder="Ask anything about your patients..."
                      />
                      <button className="primary-btn" onClick={() => sendAssistantQuestion(assistantInput)}>Send</button>
                    </div>
                  </div>
                </div>
              </section>
            </>
          ) : isPatientsPage ? (
            <>
              <header className="dash-header patients-header">
                <div>
                  <h1>Patient Management</h1>
                  <p>{filteredPatients.length} patients matching filters</p>
                </div>
                <button className="primary-btn add-patient-btn" onClick={() => setShowAddPatientModal(true)}>
                  <UiIcon type="plus" />
                  <span>Add Patient</span>
                </button>
              </header>

              <section className="patients-filter-bar dash-panel">
                <div className="dash-search patients-search">
                  <UiIcon type="search" />
                  <input
                    value={patientSearch}
                    onChange={(e) => setPatientSearch(e.target.value)}
                    placeholder="Search by name or ID"
                  />
                </div>
                <div className="patients-risk-tabs">
                  {riskFilters.map((risk) => (
                    <button
                      key={risk}
                      className={patientRiskFilter === risk ? 'active' : ''}
                      onClick={() => setPatientRiskFilter(risk)}
                    >
                      {risk === 'all' ? 'All' : `${risk.charAt(0).toUpperCase()}${risk.slice(1)}`}
                    </button>
                  ))}
                </div>
              </section>

              <section className="patients-table-wrap dash-panel">
                <div className="patients-table-head">
                  <span>PATIENT</span>
                  <span>AGE / SEX</span>
                  <span>EF</span>
                  <span>BP</span>
                  <span>CREATININE</span>
                  <span>RISK</span>
                  <span>LAST VISIT</span>
                  <span />
                </div>
                <div className="patients-table-body">
                  {filteredPatients.length ? (
                    filteredPatients.map((row) => {
                      const isExpanded = expandedPatientId === row.id;
                      const reports = row.reports || [];
                      return (
                        <article className={`patient-record ${isExpanded ? 'expanded' : ''}`} key={row.id}>
                          <button
                            type="button"
                            className="patients-row"
                            aria-expanded={isExpanded}
                            onClick={() => {
                              setExpandedPatientId((current) => (current === row.id ? '' : row.id));
                              setReportUploadMessage('');
                            }}
                          >
                            <div className="patient-col-main"><strong>{row.name}</strong><small>{row.id}</small></div>
                            <span data-label="Age / Sex">{row.ageSex}</span>
                            <span data-label="EF">{row.ef}</span>
                            <span data-label="BP">{row.bp}</span>
                            <span data-label="Creatinine">{row.creatinine}</span>
                            <span data-label="Risk" className={`risk-chip ${String(row.riskLabel || 'low').toLowerCase()}`}>{row.riskScore}% · {row.riskLabel}</span>
                            <span data-label="Last Visit" className="patient-visit">{row.lastVisit}</span>
                            <span className="patient-expand"><UiIcon type="chevron-down" /></span>
                          </button>
                          {isExpanded ? (
                            <div className="patient-detail-panel">
                              <div className="patient-detail-grid">
                                <div><span>BMI</span><strong>{row.bmi || '--'}</strong></div>
                                <div><span>Cholesterol</span><strong>{row.cholesterol ? `${row.cholesterol} mg/dL` : '--'}</strong></div>
                                <div><span>Glucose</span><strong>{row.glucose ? `${row.glucose} mg/dL` : '--'}</strong></div>
                                <div><span>Heart Rate</span><strong>{row.heartRate ? `${row.heartRate} bpm` : '--'}</strong></div>
                                <div><span>Smoking</span><strong>{row.smoking ? 'Yes' : 'No'}</strong></div>
                                <div><span>Diabetes</span><strong>{row.diabetes ? 'Yes' : 'No'}</strong></div>
                                <div><span>Hypertension</span><strong>{row.hypertension ? 'Yes' : 'No'}</strong></div>
                                <div><span>Predicted readmission</span><strong>{row.predictedDays ? `~${row.predictedDays} days` : '--'}</strong></div>
                              </div>
                              <div className="patient-detail-actions">
                                <button type="button" className="primary-btn patient-action-btn" onClick={() => openEditPatient(row)}>
                                  <UiIcon type="edit" />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  className="ghost-btn patient-action-btn patient-upload-btn"
                                  onClick={() => {
                                    setUploadPatient(row);
                                    setSelectedReportFiles([]);
                                    setReportUploadMessage('');
                                  }}
                                >
                                  <UiIcon type="upload" />
                                  <span>Upload Reports</span>
                                </button>
                              </div>
                              {reports.length ? (
                                <div className="patient-report-list">
                                  <strong>Reports</strong>
                                  {reports.slice(0, 3).map((report) => (
                                    <span key={`${report.name}-${report.uploadedAt}`}>
                                      {report.name}
                                      <small>{new Date(report.uploadedAt).toLocaleDateString()}</small>
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              {reportUploadMessage && reportUploadMessage.includes(row.name) ? (
                                <p className="patient-upload-status">{reportUploadMessage}</p>
                              ) : null}
                            </div>
                          ) : null}
                        </article>
                      );
                    })
                  ) : (
                    <div className="patients-empty-state">
                      <p>No patients yet. Add a patient to start monitoring.</p>
                      <div className="patients-skeleton-rows">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div className="patients-skeleton-row" key={i}>
                            {Array.from({ length: 8 }).map((__, j) => (
                              <span className="patients-skeleton-cell" key={j} />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
              {showAddPatientModal ? (
                <div className="patient-modal-overlay">
                  <div className="patient-modal-card">
                    <div className="patient-modal-head">
                      <h3>Add Patient</h3>
                      <button onClick={() => setShowAddPatientModal(false)}>×</button>
                    </div>
                    <div className="patient-modal-grid">
                      <input value={newPatient.name} onChange={(e) => setNewPatient((p) => ({ ...p, name: e.target.value }))} placeholder="Name" />
                      <input value={newPatient.age} onChange={(e) => setNewPatient((p) => ({ ...p, age: e.target.value }))} placeholder="Age" />
                      <input value={newPatient.sex} onChange={(e) => setNewPatient((p) => ({ ...p, sex: e.target.value }))} placeholder="Sex (M/F)" />
                      <input value={newPatient.bmi} onChange={(e) => setNewPatient((p) => ({ ...p, bmi: e.target.value }))} placeholder="BMI" />
                      <input value={newPatient.cholesterol} onChange={(e) => setNewPatient((p) => ({ ...p, cholesterol: e.target.value }))} placeholder="Cholesterol" />
                      <input value={newPatient.systolicBp} onChange={(e) => setNewPatient((p) => ({ ...p, systolicBp: e.target.value }))} placeholder="Systolic BP" />
                      <input value={newPatient.diastolicBp} onChange={(e) => setNewPatient((p) => ({ ...p, diastolicBp: e.target.value }))} placeholder="Diastolic BP" />
                      <input value={newPatient.ef} onChange={(e) => setNewPatient((p) => ({ ...p, ef: e.target.value }))} placeholder="Ejection Fraction" />
                      <input value={newPatient.creatinine} onChange={(e) => setNewPatient((p) => ({ ...p, creatinine: e.target.value }))} placeholder="Creatinine" />
                      <input value={newPatient.glucose} onChange={(e) => setNewPatient((p) => ({ ...p, glucose: e.target.value }))} placeholder="Glucose" />
                      <input value={newPatient.heartRate} onChange={(e) => setNewPatient((p) => ({ ...p, heartRate: e.target.value }))} placeholder="Heart Rate" />
                    </div>
                    {addPatientError ? <p className="add-patient-error">{addPatientError}</p> : null}
                    <button className="primary-btn patient-save-btn" onClick={saveNewPatient}>Save patient</button>
                  </div>
                </div>
              ) : null}
              {editingPatientId ? (
                <div className="patient-modal-overlay">
                  <div className="patient-modal-card edit-patient-modal" role="dialog" aria-modal="true" aria-labelledby="edit-patient-title">
                    <div className="patient-modal-head">
                      <div><h3 id="edit-patient-title">Edit Patient</h3><p>{editPatient.id} · {editPatient.name}</p></div>
                      <button onClick={closeEditPatient} aria-label="Close edit patient">×</button>
                    </div>
                    <div className="edit-patient-body">
                      <div className="patient-modal-grid">
                        <label className="patient-field"><span>Name</span><input value={editPatient.name} onChange={(e) => setEditPatient((p) => ({ ...p, name: e.target.value }))} /></label>
                        <label className="patient-field"><span>Age</span><input value={editPatient.age} onChange={(e) => setEditPatient((p) => ({ ...p, age: e.target.value }))} /></label>
                        <label className="patient-field"><span>Ejection Fraction (%)</span><input value={editPatient.ef} onChange={(e) => setEditPatient((p) => ({ ...p, ef: e.target.value }))} /></label>
                        <label className="patient-field"><span>Systolic BP</span><input value={editPatient.systolicBp} onChange={(e) => setEditPatient((p) => ({ ...p, systolicBp: e.target.value }))} /></label>
                        <label className="patient-field"><span>Diastolic BP</span><input value={editPatient.diastolicBp} onChange={(e) => setEditPatient((p) => ({ ...p, diastolicBp: e.target.value }))} /></label>
                        <label className="patient-field"><span>Serum Creatinine</span><input value={editPatient.creatinine} onChange={(e) => setEditPatient((p) => ({ ...p, creatinine: e.target.value }))} /></label>
                        <label className="patient-field"><span>BMI</span><input value={editPatient.bmi} onChange={(e) => setEditPatient((p) => ({ ...p, bmi: e.target.value }))} /></label>
                        <label className="patient-field"><span>Cholesterol</span><input value={editPatient.cholesterol} onChange={(e) => setEditPatient((p) => ({ ...p, cholesterol: e.target.value }))} /></label>
                        <label className="patient-field"><span>Glucose</span><input value={editPatient.glucose} onChange={(e) => setEditPatient((p) => ({ ...p, glucose: e.target.value }))} /></label>
                        <label className="patient-field"><span>Heart Rate</span><input value={editPatient.heartRate} onChange={(e) => setEditPatient((p) => ({ ...p, heartRate: e.target.value }))} /></label>
                        <label className="patient-field"><span>Risk Score</span><input value={editPatient.riskScore} onChange={(e) => setEditPatient((p) => ({ ...p, riskScore: e.target.value }))} /></label>
                        <label className="patient-field"><span>Risk Label</span><input value={editPatient.riskLabel} onChange={(e) => setEditPatient((p) => ({ ...p, riskLabel: e.target.value }))} /></label>
                        <label className="patient-field"><span>Last Visit</span><input type="date" value={editPatient.lastVisit} onChange={(e) => setEditPatient((p) => ({ ...p, lastVisit: e.target.value }))} /></label>
                      </div>
                      <div className="patient-modal-toggles">
                        <label><input type="checkbox" checked={editPatient.smoking} onChange={(e) => setEditPatient((p) => ({ ...p, smoking: e.target.checked }))} />Smoking</label>
                        <label><input type="checkbox" checked={editPatient.diabetes} onChange={(e) => setEditPatient((p) => ({ ...p, diabetes: e.target.checked }))} />Diabetes</label>
                        <label><input type="checkbox" checked={editPatient.hypertension} onChange={(e) => setEditPatient((p) => ({ ...p, hypertension: e.target.checked }))} />Hypertension</label>
                      </div>
                    </div>
                    {editPatientError ? <p className="add-patient-error">{editPatientError}</p> : null}
                    <div className="patient-modal-actions">
                      <button className="ghost-btn" onClick={closeEditPatient}>Cancel</button>
                      <button className="primary-btn" onClick={saveEditedPatient}>Save changes</button>
                    </div>
                  </div>
                </div>
              ) : null}
              {uploadPatient ? (
                <div className="patient-modal-overlay">
                  <div className="patient-modal-card report-upload-modal" role="dialog" aria-modal="true" aria-labelledby="upload-report-title">
                    <div className="patient-modal-head">
                      <div><h3 id="upload-report-title">Upload Reports</h3><p>{uploadPatient.id} · {uploadPatient.name}</p></div>
                      <button onClick={() => setUploadPatient(null)} aria-label="Close report upload">×</button>
                    </div>
                    <label className="report-drop-zone">
                      <UiIcon type="upload" />
                      <strong>Click to upload or drag files here</strong>
                      <span>PDF, JPG, PNG · ECG, Echo, Labs, Discharge summary</span>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.txt,.csv"
                        onChange={(event) => setSelectedReportFiles(Array.from(event.target.files || []))}
                      />
                    </label>
                    {selectedReportFiles.length ? (
                      <div className="selected-report-files">
                        {selectedReportFiles.map((file) => <span key={`${file.name}-${file.size}`}>{file.name}</span>)}
                      </div>
                    ) : null}
                    <div className="patient-modal-actions">
                      <button className="ghost-btn" onClick={() => setUploadPatient(null)}>Cancel</button>
                      <button className="primary-btn" disabled={!selectedReportFiles.length} onClick={savePatientReports}>Save reports</button>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : isAnalyticsPage ? (
            <>
              <header className="dash-header">
                <div>
                  <h1>Analytics & Model Performance</h1>
                  <p>Cohort insights and ML model evaluation.</p>
                </div>
              </header>

              <section className="dash-stat-grid analytics-kpi-grid">
                {[
                  { label: 'ACCURACY', value: '91.7%' },
                  { label: 'PRECISION', value: '89.3%' },
                  { label: 'RECALL', value: '88.1%' },
                  { label: 'F1 SCORE', value: '88.7%' },
                  { label: 'ROC-AUC', value: '0.946' },
                ].map((kpi) => (
                  <article className="dash-card analytics-kpi" key={kpi.label}>
                    <p>{kpi.label}</p>
                    <h3>{kpi.value}</h3>
                  </article>
                ))}
              </section>

              <section className="dash-panels-top">
                <article className="dash-panel">
                  <h2>Monthly Patient Trends</h2>
                  <p>Admissions vs readmissions</p>
                  <div className="line-chart-card">
                    <svg viewBox="0 0 520 190" className="line-chart-svg" aria-hidden="true">
                      <path className="chart-grid-line" d="M18 42 H502 M18 90 H502 M18 138 H502 M18 18 V172 M139 18 V172 M260 18 V172 M381 18 V172 M502 18 V172" />
                      <path className="line-area admissions-area" d={analyticsTrendArea} />
                      <path className="line admissions" d={analyticsTrendPath} />
                      <path className="line readmissions" d={analyticsReadmissionPath} />
                      {analyticsAdmissionPoints.map((pt, idx) => {
                        const x = 18 + (idx * (520 - 36)) / 8;
                        const y = 190 - 18 - ((pt.value - 110) / 140) * (190 - 36);
                        return <circle key={`admission-dot-${idx}`} className="line-dot admissions-dot" cx={x} cy={y} r="4" />;
                      })}
                      {analyticsReadmissionPoints.map((pt, idx) => {
                        const x = 18 + (idx * (520 - 36)) / 8;
                        const y = 190 - 18 - ((pt.value - 110) / 140) * (190 - 36);
                        return <circle key={`readmission-dot-${idx}`} className="line-dot readmissions-dot" cx={x} cy={y} r="4" />;
                      })}
                    </svg>
                    <div className="chart-label-row analytics-months">
                      {analyticsMonths.map((month) => <span key={month}>{month}</span>)}
                    </div>
                    <div className="chart-legend">
                      <span><i className="legend-dot admissions" />Admissions</span>
                      <span><i className="legend-dot readmissions" />Readmissions</span>
                    </div>
                  </div>
                </article>
                <article className="dash-panel">
                  <h2>Risk Distribution</h2>
                  <p>Cohort segmentation</p>
                  <div className="risk-summary-card">
                    <div className={riskHasData ? 'risk-pie' : 'risk-pie empty'} style={riskHasData ? dashboardDonutStyle : undefined}>
                      <div>
                        <strong>{riskDisplayTotal}</strong>
                        <span>{riskHasData ? 'patients' : 'no data'}</span>
                      </div>
                    </div>
                    <div className="analytics-risk-list">
                      {riskDistributionRows.map((row) => (
                        <div className="analytics-risk-row" key={row.label}>
                          <span><i className={`dot ${row.cls}`} />{row.label}</span>
                          <div><b className={row.cls} style={{ width: `${Math.max(3, row.pct)}%` }} /></div>
                          <strong>{row.value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              </section>

              <section className="dash-panels-bottom analytics-detail-grid">
                <article className="dash-panel">
                  <h2>Feature Importance</h2>
                  <p>Top predictors used by the model</p>
                  <div className="feature-bars">
                    {modelFeatureImportance.map(([label, value]) => (
                      <div className="feature-bar-row" key={label}>
                        <span>{label}</span>
                        <div><i style={{ width: `${(value / 0.22) * 100}%` }} /></div>
                        <strong>{value.toFixed(2)}</strong>
                      </div>
                    ))}
                  </div>
                </article>
                <article className="dash-panel">
                  <h2>ROC Curve</h2>
                  <p>AUC = 0.946</p>
                  <div className="line-chart-card roc-card">
                    <svg viewBox="0 0 520 190" className="line-chart-svg" aria-hidden="true">
                      <path className="chart-grid-line" d="M18 42 H502 M18 90 H502 M18 138 H502 M120 18 V172 M220 18 V172 M320 18 V172 M420 18 V172" />
                      <path className="line-area" d={rocArea} />
                      <path className="line admissions" d={rocPath} />
                      <path className="roc-baseline" d="M18 172 L502 18" />
                      {rocPoints.map((pt, idx) => {
                        const x = 18 + (idx * (520 - 36)) / Math.max(1, rocPoints.length - 1);
                        const y = 190 - 18 - (pt.value / 100) * (190 - 36);
                        return <circle key={pt.label} className="line-dot admissions-dot" cx={x} cy={y} r="4" />;
                      })}
                    </svg>
                    <div className="roc-axis-labels">
                      <span>False positive rate</span>
                      <span>True positive rate</span>
                    </div>
                  </div>
                </article>
              </section>

              <section className="dash-panels-bottom">
                <article className="dash-panel">
                  <h2>Confusion Matrix</h2>
                  <p>Predicted vs actual on hold-out set</p>
                  <div className="confusion-grid">
                    <span className="matrix-axis matrix-top">Predicted Low</span>
                    <span className="matrix-axis matrix-top">Predicted High</span>
                    <span className="ok"><strong>842</strong><small>True negative</small></span>
                    <span className="bad"><strong>38</strong><small>False positive</small></span>
                    <span className="bad"><strong>54</strong><small>False negative</small></span>
                    <span className="ok"><strong>466</strong><small>True positive</small></span>
                  </div>
                </article>
                <article className="dash-panel">
                  <h2>Risk Heatmap by Age</h2>
                  <p>Average risk score per cohort</p>
                  <div className="age-heatmap">
                    {heatmapRows.map((row, i) => (
                      <span key={row.age} className={`heat heat-${i + 1}`}>
                        <strong>{row.risk}%</strong>
                        <small>{row.age}</small>
                      </span>
                    ))}
                  </div>
                </article>
              </section>
            </>
          ) : (
            <>
          <header className="dash-header">
            <div>
              <h1>Welcome back, {clinicianTitle}</h1>
              <p>Here&apos;s your clinical overview for today.</p>
            </div>
            <div className="dash-header-actions">
              <div className="dash-search">
                <UiIcon type="search" />
                <input
                  value={dashboardSearch}
                  onChange={(e) => setDashboardSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') searchFromDashboard();
                  }}
                  placeholder="Search patients, predictions..."
                />
              </div>
              <button className="dash-bell" onClick={() => goTo('/alerts')}><UiIcon type="bell" />{hasCriticalAlert ? <span className="bell-dot" /> : null}</button>
            </div>
          </header>

          {hasAnalyticsData ? (
            <>
              <section className="dash-stat-grid">
                {kpiCards.map((kpi) => (
                  <article className="dash-card" key={kpi.label}>
                    <div className="dash-card-top">
                      <p>{kpi.label}</p>
                      <UiIcon type={kpi.icon} />
                    </div>
                    <h3>{kpi.value}</h3>
                    <small>{kpi.delta}</small>
                  </article>
                ))}
              </section>

              <section className="dash-panels-top">
                <article className="dash-panel">
                  <h2>Readmission Forecast</h2>
                  <p>Actual vs AI predicted readmissions</p>
                  <div className="line-chart-card">
                    <svg viewBox="0 0 520 190" className="line-chart-svg" aria-hidden="true">
                      <path className="chart-grid-line" d="M18 42 H502 M18 90 H502 M18 138 H502" />
                      <path className="line-area" d={dashboardForecastArea} />
                      <path className="line readmissions" d={dashboardReadmissionPath} />
                      <path className="line admissions" d={dashboardForecastPath} />
                      {dashboardForecastPoints.map((pt, idx) => {
                        const max = Math.max(1, ...dashboardForecastPoints.map((p) => Number(p.value) || 0));
                        const x = 18 + (idx * (520 - 36)) / Math.max(1, dashboardForecastPoints.length - 1);
                        const y = 190 - 18 - ((Number(pt.value) || 0) / max) * (190 - 36);
                        return <circle key={`${pt.label}-${idx}`} className="line-dot" cx={x} cy={y} r="5" />;
                      })}
                    </svg>
                    <div className="chart-label-row">
                      {dashboardForecastPoints.map((pt, idx) => <span key={`${pt.label}-label-${idx}`}>{pt.label}</span>)}
                    </div>
                  </div>
                </article>
                <article className="dash-panel">
                  <h2>Risk Distribution</h2>
                  <p>Across all monitored patients</p>
                  <div className="risk-donut-wrap">
                    <div className="risk-donut" style={dashboardDonutStyle} />
                  </div>
                  <ul className="risk-list">
                    {dashboardRisk.map((row) => (
                      <li key={row.label}><span className={`dot ${row.cls}`} />{row.label}<strong>{row.value}</strong></li>
                    ))}
                  </ul>
                </article>
              </section>

              <section className="dash-panels-bottom">
                <article className="dash-panel">
                  <div className="panel-head">
                    <h2>Risk by Age Group</h2>
                    <a href="#0">View analytics</a>
                  </div>
                  <div className="age-bar-chart">
                    {ageRiskGroups.map((row) => (
                      <div className="age-bar" key={row.label}>
                        <div className="age-bar-pair">
                          <span className="patient-count-bar" style={{ height: `${Math.max(8, row.patients * 13)}%` }} title={`${row.patients} patients`} />
                          <span className="risk-score-bar" style={{ height: `${Math.max(8, row.value)}%` }} title={`${row.value}% average risk`} />
                        </div>
                        <small>{row.label}</small>
                      </div>
                    ))}
                  </div>
                  <div className="age-chart-legend">
                    <span><i className="legend-dot admissions" />Patients</span>
                    <span><i className="legend-dot readmissions" />Average risk</span>
                  </div>
                </article>
                <article className="dash-panel">
                  <div className="panel-head">
                    <h2>Recent Predictions</h2>
                    <a href="#0">All</a>
                  </div>
                  <ul className="recent-list">
                    {recentList.length ? (
                      recentList.map((item) => (
                        <li key={item.key}>
                          <div><span>{item.name}</span><small>{item.meta}</small></div>
                          <em>{item.risk} · {item.riskLabel}</em>
                        </li>
                      ))
                    ) : (
                      <li className="recent-empty">No predictions yet</li>
                    )}
                  </ul>
                </article>
              </section>
            </>
          ) : (
            <section className="dash-panel">
              <h2>Analytics</h2>
              <p>No analytics data yet. Add patients and run predictions to unlock KPIs and charts.</p>
              <div className="kpi-skeleton-grid">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="kpi-skeleton-card">
                    <span />
                    <strong />
                    <small />
                  </div>
                ))}
              </div>
              <div className="chart-empty">
                <div className="chart-empty-grid">
                  {Array.from({ length: 30 }).map((_, i) => <span key={i} className="chart-cell" />)}
                </div>
              </div>
            </section>
          )}
            </>
          )}
        </section>
      </div>
    );
  }

  if (isPredictPage) {
    return (
      <div className="dashboard-page">
        <aside className="dash-sidebar">
          <div className="dash-logo">
            <div className="dash-logo-main"><span className="brand-icon">♡</span>HeartGuard</div>
            <div className="dash-logo-sub">AI CARDIOLOGY</div>
          </div>
          <nav className="dash-nav">
            {navItems.map((item) => (
              <a key={item.key} className={item.active ? 'active' : ''} href={item.href || '#0'}>
                <UiIcon type={item.icon} />
                <span>{item.key}</span>
              </a>
            ))}
          </nav>
          <button className="dash-signout" onClick={() => goTo('/')}>
            <UiIcon type="signout" />
            <span>Sign out</span>
          </button>
        </aside>
        <section className="dash-main predict-main">
          <h1>AI Readmission Forecasting</h1>
          <p>Combines previous visit + current report to forecast risk trajectory.</p>

          {!predictResult ? (
            <>
              <div className="predict-steps">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} className={predictionStep === s ? 'active' : ''} onClick={() => setPredictionStep(s)}>
                    {s === 1 ? '1. Patient' : s === 2 ? '2. Demographics' : s === 3 ? '3. Vitals & Labs' : s === 4 ? '4. History & Lifestyle' : '5. Previous Visit'}
                  </button>
                ))}
              </div>
              <div className="predict-card">
                {predictionStep === 1 ? (
                  <div className="predict-identity">
                    <label>
                      Patient name or ID
                      <input
                        type="text"
                        value={predictionPatientQuery}
                        onChange={(e) => handlePredictionPatientQuery(e.target.value)}
                        placeholder="Search existing patient or type new patient name"
                      />
                    </label>
                    <div className="patient-id-preview">
                      <span>Patient ID</span>
                      <strong>{selectedPredictionPatient?.id || nextPredictionPatientId}</strong>
                    </div>
                    {predictionPatientSuggestions.length ? (
                      <div className="prediction-suggestions">
                        {predictionPatientSuggestions.map((row) => (
                          <button type="button" key={row.id} onClick={() => fillPreviousVisitFromPatient(row)}>
                            <strong>{row.name}</strong>
                            <span>{row.id} · Age {parsePatientAge(row) || '--'} · Last risk {row.riskScore || 0}%</span>
                          </button>
                        ))}
                      </div>
                    ) : predictionPatientQuery.trim() && !selectedPredictionPatient ? (
                      <p className="prediction-new-patient">New patient will be created as {nextPredictionPatientId}</p>
                    ) : null}
                  </div>
                ) : null}
                {predictionStep === 2 ? (
                  <div className="predict-grid two">
                    <label>Age (years)<input type="number" value={predictForm.age} onChange={(e) => setPredictForm((p) => ({ ...p, age: e.target.value }))} /></label>
                    <label>BMI (kg/m²)<input type="number" value={predictForm.bmi} onChange={(e) => setPredictForm((p) => ({ ...p, bmi: e.target.value }))} /></label>
                  </div>
                ) : null}
                {predictionStep === 3 ? (
                  <div className="predict-grid two">
                    <label>Systolic BP (mmHg)<input type="number" value={predictForm.systolic_bp} onChange={(e) => setPredictForm((p) => ({ ...p, systolic_bp: e.target.value }))} /></label>
                    <label>Diastolic BP (mmHg)<input type="number" value={predictForm.diastolic_bp} onChange={(e) => setPredictForm((p) => ({ ...p, diastolic_bp: e.target.value }))} /></label>
                    <label>Cholesterol (mg/dL)<input type="number" value={predictForm.cholesterol} onChange={(e) => setPredictForm((p) => ({ ...p, cholesterol: e.target.value }))} /></label>
                    <label>Glucose (mg/dL)<input type="number" value={predictForm.glucose} onChange={(e) => setPredictForm((p) => ({ ...p, glucose: e.target.value }))} /></label>
                    <label>Heart Rate (bpm)<input type="number" value={predictForm.heart_rate} onChange={(e) => setPredictForm((p) => ({ ...p, heart_rate: e.target.value }))} /></label>
                    <label>Ejection Fraction (%)<input type="number" value={predictForm.ejection_fraction} onChange={(e) => setPredictForm((p) => ({ ...p, ejection_fraction: e.target.value }))} /></label>
                    <label>Serum Creatinine (mg/dL)<input type="number" value={predictForm.serum_creatinine} onChange={(e) => setPredictForm((p) => ({ ...p, serum_creatinine: e.target.value }))} /></label>
                  </div>
                ) : null}
                {predictionStep === 4 ? (
                  <div className="predict-grid">
                    <label>Physical activity (hours/week)<input type="range" min="0" max="20" value={predictForm.activity_hours || 0} onChange={(e) => setPredictForm((p) => ({ ...p, activity_hours: e.target.value }))} /></label>
                    <div className="predict-toggles">
                      <button className={predictForm.smoking ? 'on' : ''} onClick={() => setPredictForm((p) => ({ ...p, smoking: !p.smoking }))}>Smoking {predictForm.smoking ? 'Yes' : 'No'}</button>
                      <button className={predictForm.diabetes ? 'on' : ''} onClick={() => setPredictForm((p) => ({ ...p, diabetes: !p.diabetes }))}>Diabetes {predictForm.diabetes ? 'Yes' : 'No'}</button>
                      <button className={predictForm.hypertension ? 'on' : ''} onClick={() => setPredictForm((p) => ({ ...p, hypertension: !p.hypertension }))}>Hypertension {predictForm.hypertension ? 'Yes' : 'No'}</button>
                    </div>
                  </div>
                ) : null}
                {predictionStep === 5 ? (
                  <div className="predict-grid two">
                    <div className="prev-visit-head">
                      <div>
                        <h4>Previous visit report</h4>
                        <p>The model compares previous vs current values to compute trajectory and forecast risk over the next 60 days.</p>
                      </div>
                      <button
                        type="button"
                        disabled={!canUsePreviousVisit}
                        className={predictForm.previous_visit_enabled ? 'on' : ''}
                        onClick={() => {
                          if (!canUsePreviousVisit) return;
                          setPredictForm((p) => ({ ...p, previous_visit_enabled: !p.previous_visit_enabled }));
                        }}
                      >
                        {canUsePreviousVisit && predictForm.previous_visit_enabled ? 'Enabled' : 'Disabled'}
                      </button>
                    </div>
                    {!canUsePreviousVisit ? (
                      <p className="previous-visit-disabled">Previous visit fields are available only after selecting an existing patient.</p>
                    ) : null}
                    {canUsePreviousVisit && predictForm.previous_visit_enabled ? (
                      <>
                        <label>Days since last visit (days)<input type="number" value={predictForm.days_since_last_visit} onChange={(e) => setPredictForm((p) => ({ ...p, days_since_last_visit: e.target.value }))} /></label>
                        <label>Prev. Ejection Fraction (%)<input type="number" value={predictForm.prev_ejection_fraction} onChange={(e) => setPredictForm((p) => ({ ...p, prev_ejection_fraction: e.target.value }))} /></label>
                        <label>Prev. Serum Creatinine (mg/dL)<input type="number" value={predictForm.prev_serum_creatinine} onChange={(e) => setPredictForm((p) => ({ ...p, prev_serum_creatinine: e.target.value }))} /></label>
                        <label>Prev. Systolic BP (mmHg)<input type="number" value={predictForm.prev_systolic_bp} onChange={(e) => setPredictForm((p) => ({ ...p, prev_systolic_bp: e.target.value }))} /></label>
                        <label>Prev. Cholesterol (mg/dL)<input type="number" value={predictForm.prev_cholesterol} onChange={(e) => setPredictForm((p) => ({ ...p, prev_cholesterol: e.target.value }))} /></label>
                        <label>Prev. Glucose (mg/dL)<input type="number" value={predictForm.prev_glucose} onChange={(e) => setPredictForm((p) => ({ ...p, prev_glucose: e.target.value }))} /></label>
                        <label>Prev. BMI (kg/m²)<input type="number" value={predictForm.prev_bmi} onChange={(e) => setPredictForm((p) => ({ ...p, prev_bmi: e.target.value }))} /></label>
                      </>
                    ) : null}
                  </div>
                ) : null}
                <div className="predict-actions">
                  <button className="ghost-btn" disabled={predictionStep === 1} onClick={() => setPredictionStep((s) => Math.max(1, s - 1))}>Back</button>
                  {predictionStep < 5 ? (
                    <button className="primary-btn" onClick={goToNextPredictionStep}>Next</button>
                  ) : (
                    <button className="primary-btn" onClick={runPrediction}>Run Forecast</button>
                  )}
                </div>
                {predictError ? <p className="add-patient-error">{predictError}</p> : null}
              </div>
              {predictLoading ? (
                <div className="predict-loading">
                  <div className="spinner">✶</div>
                  <h3>AI processing clinical data...</h3>
                  <p>Evaluating 12 features against trained model</p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="predict-result-wrap">
              <div className="predict-result-top">
                <div className="predict-score-ring"><strong>{predictResult.risk_score}</strong><span>RISK SCORE</span></div>
                <div>
                  <p className="muted">RISK CATEGORY</p>
                  <h2>{predictResult.risk_category}</h2>
                  <p>Predicted readmission window</p>
                  <h3>~ {predictResult.predicted_days} days</h3>
                  {predictResult?.trajectory?.enabled ? (
                    <div className="trajectory-badge">
                      Trajectory: {predictResult.trajectory.direction} ({predictResult.trajectory.pts_per_day >= 0 ? '+' : ''}{predictResult.trajectory.pts_per_day} pts/day)
                    </div>
                  ) : null}
                  <div className="predict-result-actions">
                    <button className="ghost-btn" onClick={() => { setPredictResult(null); setPredictionStep(1); }}>New prediction</button>
                    <button className="primary-btn" onClick={printPredictionReport}>Print PDF report</button>
                  </div>
                </div>
              </div>
              <article className="predict-result-card chart-card">
                <h4>60-Day Risk Forecast</h4>
                <p>Projection based on previous → current trajectory</p>
                <div className="forecast-chart-wrap">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="forecast-chart" aria-hidden="true">
                    <path d={forecastPath} className="forecast-line" />
                    {forecastPoints.map((pt, i) => {
                      const x = chartPad + (i * (chartWidth - chartPad * 2)) / Math.max(1, forecastPoints.length - 1);
                      const y = chartHeight - chartPad - ((Number(pt.value) || 0) / forecastMax) * (chartHeight - chartPad * 2);
                      return <circle key={pt.label} cx={x} cy={y} r="4.6" className="forecast-dot" />;
                    })}
                  </svg>
                  <div className="forecast-labels">
                    {forecastPoints.map((pt) => (
                      <span key={pt.label}>{pt.label}</span>
                    ))}
                  </div>
                </div>
              </article>
              {currentVsPrevious.length ? (
                <article className="predict-result-card">
                  <h4>Previous vs Current — Clinical Deltas</h4>
                  <div className="delta-grid">
                    {currentVsPrevious
                      .filter((x) => String(x.current).trim() !== '' || String(x.previous).trim() !== '')
                      .map((x) => {
                        const c = Number(x.current || 0);
                        const p = Number(x.previous || 0);
                        const d = c - p;
                        const sign = d > 0 ? '+' : '';
                        return (
                          <div className="delta-card" key={x.label}>
                            <p>{x.label}</p>
                            <h5>{String(x.current).trim() || '--'} <small>from {String(x.previous).trim() || '--'}</small></h5>
                            <em>{sign}{Number.isFinite(d) ? d.toFixed(1) : '--'}</em>
                          </div>
                        );
                      })}
                  </div>
                </article>
              ) : null}
              <div className="predict-result-grid">
                <article className="predict-result-card">
                  <h4>Top Risk Factors</h4>
                  {(predictResult.top_factors || []).map((f) => (
                    <div className="factor-row" key={f.name}>
                      <div className="factor-head"><span>{f.name}</span><strong>{f.weight}%</strong></div>
                      <div className="factor-track"><i style={{ width: `${f.weight}%` }} /></div>
                    </div>
                  ))}
                </article>
                <article className="predict-result-card">
                  <h4>AI Explanation & Recommendations</h4>
                  <p>{predictResult.summary}</p>
                  <ul>
                    {(predictResult.recommendations || []).map((rec) => (
                      <li key={rec}>{rec}</li>
                    ))}
                  </ul>
                </article>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand"><span className="brand-icon">♡</span>HeartGuard</div>
        <nav>
          <a href="#features">Features</a>
          <a href="#impact">Impact</a>
          <a href="#how-it-works">How it works</a>
        </nav>
        <div className="top-actions">
          <a href={routeHref('/login')} className="login-link">Login</a>
          <button className="primary-btn" onClick={() => goTo('/dashboard')}>Open Dashboard</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-left">
            <div className="badge">{data.badge}</div>
            <h1>
              {data.hero.title[0]}<br />
              {data.hero.title[1].split(' ')[0]} <span>{data.hero.title[1].split(' ').slice(1).join(' ')}</span><br />
              {data.hero.title[2]}
            </h1>
            <p>{data.hero.subtitle}</p>
            <div className="hero-cta">
              <button className="primary-btn large start-btn" onClick={() => goTo('/predict')}>Start Prediction <span className="inline-icon"><UiIcon type="arrow-right" /></span></button>
              <button className="ghost-btn" onClick={() => goTo('/dashboard')}><span className="inline-icon"><UiIcon type="stethoscope" /></span>Explore Dashboard</button>
            </div>
          </div>

          <div className="monitor-card">
            <div className="monitor-head">
              <div>
                <small>{data.monitor.patient}</small>
                <h3>{data.monitor.title}</h3>
              </div>
              <span className="critical">{data.monitor.severity}</span>
            </div>
            <div className="ring">
              <svg className="ring-svg" viewBox="0 0 200 200" aria-hidden="true">
                <defs>
                  <linearGradient id="riskGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#28c8f1" />
                    <stop offset="60%" stopColor="#8ab0c8" />
                    <stop offset="100%" stopColor="#f06469" />
                  </linearGradient>
                </defs>
                <circle className="ring-track" cx="100" cy="100" r="78" />
                <circle className="ring-progress" cx="100" cy="100" r="78" style={ringStyle} />
              </svg>
              <div className="ring-inner">
                <strong>{data.monitor.risk}%</strong>
                <small>RISK</small>
              </div>
            </div>
            <div className="monitor-metrics">
              {data.monitor.metrics.map((item) => (
                <div className="metric" key={item.label}>
                  <small>{item.label}</small>
                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
            <p className="window">Predicted readmission window: <strong>{data.monitor.window}</strong></p>
          </div>
        </section>

        <section className="stats-grid" id="impact">
          {data.stats.map((stat) => (
            <article className="card stat-card" key={stat.label}>
              <h4>{stat.value}</h4>
              <p>{stat.label}</p>
            </article>
          ))}
        </section>

        <section className="feature-intro" id="features">
          <h2>{data.featuresHeading}</h2>
          <p>{data.featuresSubheading}</p>
        </section>

        <section className="features-grid">
          {data.features.map((feature) => (
            <article className="card feature-card" key={feature.title}>
              <div className="feature-icon"><FeatureIcon type={feature.icon} /></div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="cta-panel" id="how-it-works">
          <h2>{data.cta.title}</h2>
          <p>{data.cta.subtitle}</p>
          <button className="primary-btn large" onClick={() => goTo('/predict')}>{data.cta.button} <span className="inline-icon"><UiIcon type="arrow-right" /></span></button>
        </section>
      </main>
    </div>
  );
}

export default App;
