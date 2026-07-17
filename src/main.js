import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  BookOpen,
  BookOpenCheck,
  Cable,
  CalendarDays,
  CalendarRange,
  ChartColumnIncreasing,
  ChartNoAxesCombined,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CircleX,
  ClipboardCheck,
  Clock3,
  CloudUpload,
  CopyPlus,
  createIcons,
  Crown,
  Database,
  DatabaseBackup,
  Download,
  Ellipsis,
  EllipsisVertical,
  Eye,
  FileCheck2,
  FileClock,
  FileCog,
  FileDown,
  FileJson2,
  FilePlus2,
  FileQuestion,
  Files,
  FolderKanban,
  FolderOpen,
  Gauge,
  GraduationCap,
  Info,
  Layers3,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogIn,
  MapPinned,
  Menu,
  MessageCircleQuestion,
  MessageSquareText,
  MessageSquareWarning,
  MessagesSquare,
  Milestone,
  Moon,
  Network,
  NotebookPen,
  Palette,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Rocket,
  RotateCcw,
  Save,
  ScanSearch,
  School,
  Search,
  SearchX,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Trophy,
  UsersRound,
  Waypoints,
  Workflow,
  X,
} from 'lucide';
import './styles/app.css';
import { router } from './app/router.js';
import { store } from './app/store.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderCurriculum } from './pages/curriculum.js';
import { renderTeachingTools } from './pages/teachingTools.js';
import { renderDocuments } from './pages/documents.js';
import { renderAssessment } from './pages/assessment.js';
import { renderSettings } from './pages/settings.js';
import { renderHelp } from './pages/help.js';
import { renderLogin } from './pages/login.js';
import { renderNotFound } from './pages/notFound.js';
import { toast } from './components/toast.js';

const iconRegistry = {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  BookOpen,
  BookOpenCheck,
  Cable,
  CalendarDays,
  CalendarRange,
  ChartColumnIncreasing,
  ChartNoAxesCombined,
  ChevronRight,
  CircleCheck,
  CircleHelp,
  CircleX,
  ClipboardCheck,
  Clock3,
  CloudUpload,
  CopyPlus,
  Crown,
  Database,
  DatabaseBackup,
  Download,
  Ellipsis,
  EllipsisVertical,
  Eye,
  FileCheck2,
  FileClock,
  FileCog,
  FileDown,
  FileJson2,
  FilePlus2,
  FileQuestion,
  Files,
  FolderKanban,
  FolderOpen,
  Gauge,
  GraduationCap,
  Info,
  Layers3,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogIn,
  MapPinned,
  Menu,
  MessageCircleQuestion,
  MessageSquareText,
  MessageSquareWarning,
  MessagesSquare,
  Milestone,
  Moon,
  Network,
  NotebookPen,
  Palette,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Rocket,
  RotateCcw,
  Save,
  ScanSearch,
  School,
  Search,
  SearchX,
  Settings2,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Trophy,
  UsersRound,
  Waypoints,
  Workflow,
  X,
};

const applyTheme = () => {
  const { theme } = store.getState();
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.style.colorScheme = theme;
};

const refreshIcons = () => {
  createIcons({ icons: iconRegistry, attrs: { 'stroke-width': 1.8 } });
};

applyTheme();
window.addEventListener('retralabs:icons', () => requestAnimationFrame(refreshIcons));
window.addEventListener('error', (event) => {
  console.error(event.error || event.message);
  toast('Terjadi kesalahan pada antarmuka. Silakan muat ulang halaman.', 'error');
});
window.addEventListener('unhandledrejection', (event) => {
  console.error(event.reason);
  toast('Proses tidak dapat diselesaikan.', 'error');
});

router
  .register('/login', renderLogin)
  .register('/dashboard', renderDashboard)
  .register('/curriculum', renderCurriculum)
  .register('/teaching-tools', renderTeachingTools)
  .register('/assessment', renderAssessment)
  .register('/documents', renderDocuments)
  .register('/settings', renderSettings)
  .register('/help', renderHelp)
  .register('/404', renderNotFound)
  .start();
