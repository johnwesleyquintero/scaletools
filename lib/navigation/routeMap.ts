import { 
  LayoutDashboard, 
  Users, 
  Zap, 
  ShoppingBag, 
  PieChart, 
  Target, 
  Activity,
  Settings,
  Scale,
  Database,
  Cpu,
  ShieldCheck,
  History
} from 'lucide-react';

export type RouteSection = 'intelligence' | 'finance' | 'system';

export interface RouteConfig {
  id: string;
  label: string;
  path: string;
  icon: any;
  description: string;
  section: RouteSection;
  status?: 'alpha' | 'beta' | 'stable' | 'hidden';
}

export const APP_ROUTES: RouteConfig[] = [
  // Intelligence Layer
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'System overview and key performance indicators.',
    section: 'intelligence',
    status: 'stable'
  },
  {
    id: 'suppliers',
    label: 'Supplier Hub',
    path: '/suppliers',
    icon: Database,
    description: 'Manage your wholesale supplier network.',
    section: 'intelligence',
    status: 'stable'
  },
  {
    id: 'supplier-scoring',
    label: 'Supplier Scoring',
    path: '/suppliers/scoring',
    icon: ShieldCheck,
    description: 'Historical performance and reliability metrics.',
    section: 'intelligence',
    status: 'beta'
  },
  {
    id: 'intelligence',
    label: 'Market Intel',
    path: '/products',
    icon: Zap,
    description: 'Analyze Amazon ASINs and match with suppliers.',
    section: 'intelligence',
    status: 'stable'
  },
  {
    id: 'market-view',
    label: 'Market Explorer',
    path: '/intelligence/market',
    icon: Activity,
    description: 'Real-time market signal detection.',
    section: 'intelligence',
    status: 'beta'
  },
  {
    id: 'procurement',
    label: 'Procurement',
    path: '/procurement/drafts',
    icon: ShoppingBag,
    description: 'Manage draft purchase orders and exports.',
    section: 'intelligence',
    status: 'stable'
  },
  
  // Finance Layer
  {
    id: 'allocation',
    label: 'Capital Engine',
    path: '/procurement/allocation',
    icon: Target,
    description: 'Risk-adjusted capital distribution engine.',
    section: 'finance',
    status: 'beta'
  },
  {
    id: 'rebalancing',
    label: 'Portfolio Health',
    path: '/procurement/rebalance',
    icon: Scale,
    description: 'Continuous portfolio optimization and drift detection.',
    section: 'finance',
    status: 'beta'
  },
  {
    id: 'outcomes',
    label: 'Truth Layer',
    path: '/procurement/outcomes',
    icon: Activity,
    description: 'Historical performance tracking and feedback loop.',
    section: 'finance',
    status: 'stable'
  },
  
  // System Layer
  {
    id: 'history',
    label: 'Order History',
    path: '/intelligence/history',
    icon: History,
    description: 'Historical purchase orders and outcome reports.',
    section: 'system',
    status: 'stable'
  },
  {
    id: 'logs',
    label: 'System Logs',
    path: '/system/logs',
    icon: Activity,
    description: 'Real-time engine diagnostics and audit trails.',
    section: 'system',
    status: 'beta'
  },
  {
    id: 'integrity',
    label: 'Integrity',
    path: '/system/routes',
    icon: ShieldCheck,
    description: 'Route validation and system accessibility check.',
    section: 'system',
    status: 'stable'
  },
  {
    id: 'settings',
    label: 'Config',
    path: '/settings',
    icon: Settings,
    description: 'System configuration and API keys.',
    section: 'system',
    status: 'stable'
  }
];

/**
 * Validates if a given path is registered in the system.
 */
export const isValidRoute = (path: string): boolean => {
  return APP_ROUTES.some(route => route.path === path || path.startsWith(route.path + '/'));
};

/**
 * Retrieves route configuration by path.
 */
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return APP_ROUTES.find(route => path === route.path || path.startsWith(route.path + '/'));
};

/**
 * Sections configuration for UI display.
 */
export const ROUTE_SECTIONS: { id: RouteSection; label: string; icon: any }[] = [
  { id: 'intelligence', label: 'Intelligence Layer', icon: Cpu },
  { id: 'finance', label: 'Capital Layer', icon: Target },
  { id: 'system', label: 'System Layer', icon: ShieldCheck }
];
