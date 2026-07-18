import {
  Activity,
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
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
  GitBranchPlus,
  Info,
  Layers3,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogIn,
  LogOut,
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
  Send,
  School,
  Search,
  SearchX,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Undo2,
  UsersRound,
  Waypoints,
  Wifi,
  WifiOff,
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
import { renderApprovals } from './pages/approvals.js';
import { renderNotifications } from './pages/notifications.js';
import { renderAi } from './pages/ai.js';
import { renderSubscription } from './pages/subscription.js';
import { renderPayments } from './pages/payments.js';
import { renderUsage } from './pages/usage.js';
import { renderAudit } from './pages/audit.js';
import { renderSessions } from './pages/sessions.js';
import { renderMigration } from './pages/migration.js';
import { renderFatal, renderMaintenance, renderOffline } from './pages/status.js';
import { toast } from './components/toast.js';
import { friendlyApiMessage, loadBootstrap } from './app/bootstrap.js';
import { canAccessRoute } from './app/guards.js';
import { installGlobalErrorBoundary, renderAppError } from './components/errorBoundary.js';
import { appConfig } from './config/api.js';

const toLucideDomKey = (name) =>
  name.replace(/(\w)(\w*)(_|-|\s*)/g, (_match, first, rest) => first.toUpperCase() + rest.toLowerCase());

const withLucideDomAliases = (icons) =>
  Object.entries(icons).reduce((registry, [name, icon]) => {
    registry[name] = icon;
    registry[toLucideDomKey(name)] = icon;
    return registry;
  }, {});

const iconRegistry = withLucideDomAliases({
  Activity,
  Archive,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
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
  GitBranchPlus,
  Info,
  Layers3,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  LogIn,
  LogOut,
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
  Send,
  School,
  Search,
  SearchX,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Sun,
  Target,
  Trash2,
  TrendingUp,
  TriangleAlert,
  Trophy,
  Undo2,
  UsersRound,
  Waypoints,
  Wifi,
  WifiOff,
  Workflow,
  X,
});

const applyTheme = () => {
  const { theme, uiPreferences = {} } = store.getState();
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.documentElement.classList.toggle('reduce-motion', uiPreferences.reduceMotion === true);
  document.documentElement.style.colorScheme = theme;
};

const refreshIcons = () => {
  createIcons({ icons: iconRegistry, attrs: { 'stroke-width': 1.8 } });
};

applyTheme();
store.subscribe(applyTheme);
window.addEventListener('retralabs:icons', () => requestAnimationFrame(refreshIcons));
installGlobalErrorBoundary();

const publicRoutes = new Set(['/login', '/offline', '/maintenance', '/fatal']);

router
  .setErrorHandler(({ error, retry }) => {
    renderAppError({
      title: 'Halaman tidak dapat dimuat',
      error,
      onRetry: retry,
    });
    toast(friendlyApiMessage(error), 'error');
  })
  .setAuthGuard(async ({ path, navigate }) => {
    if (appConfig.maintenanceMode && path !== '/maintenance') {
      navigate('/maintenance');
      return false;
    }

    if (publicRoutes.has(path)) {
      if (path === '/login' && store.getState().auth?.status === 'authenticated') {
        navigate('/dashboard');
        return false;
      }
      return true;
    }

    const currentAuth = store.getState().auth;
    if (currentAuth?.status === 'unauthenticated') {
      navigate('/login');
      return false;
    }

    const state = await loadBootstrap();
    if (state.auth?.status === 'unauthenticated') {
      if (state.auth?.lastError && !state.auth.lastError.silentUnauthenticated) {
        toast(friendlyApiMessage(state.auth.lastError), 'warning');
      }
      navigate('/login');
      return false;
    }
    if (!canAccessRoute(path)) {
      toast('Akses menu dibatasi oleh permission atau paket aktif.', 'warning');
      navigate('/dashboard');
      return false;
    }
    return true;
  })
  .register('/login', renderLogin)
  .register('/dashboard', renderDashboard)
  .register('/curriculum', renderCurriculum)
  .register('/teaching-tools', renderTeachingTools)
  .register('/assessment', renderAssessment)
  .register('/documents', renderDocuments)
  .register('/approvals', renderApprovals)
  .register('/notifications', renderNotifications)
  .register('/ai', renderAi)
  .register('/subscription', renderSubscription)
  .register('/payments', renderPayments)
  .register('/usage', renderUsage)
  .register('/audit', renderAudit)
  .register('/settings', renderSettings)
  .register('/settings/sessions', renderSessions)
  .register('/settings/migration', renderMigration)
  .register('/help', renderHelp)
  .register('/offline', renderOffline)
  .register('/maintenance', renderMaintenance)
  .register('/fatal', renderFatal)
  .register('/404', renderNotFound)
  .start();
