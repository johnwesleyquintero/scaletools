import { 
  BarChart3, 
  Database, 
  History, 
  Layers, 
  LayoutDashboard, 
  Settings, 
  ShieldCheck, 
  Upload, 
  Activity,
  Terminal,
  FileText,
  Search,
  ShoppingBag,
  Cpu,
  LineChart,
  UserCheck,
  ClipboardList
} from 'lucide-react';

export type RouteSection = 'intelligence' | 'suppliers' | 'procurement' | 'system';

export interface Route {
  path: string;
  label: string;
  icon: any;
  section: RouteSection;
  status: 'active' | 'beta' | 'hidden';
  description: string;
}

export const ROUTE_MAP: Route[] = [
  // Intelligence Layer
  {
    path: '/products',
    label: 'Opportunity Engine',
    icon: Search,
    section: 'intelligence',
    status: 'active',
    description: 'ASIN analysis and profit matching engine.'
  },
  {
    path: '/intelligence/market',
    label: 'Market Signals',
    icon: Activity,
    section: 'intelligence',
    status: 'beta',
    description: 'Real-time market signal monitor.'
  },
  {
    path: '/intelligence/history',
    label: 'Keepa Intelligence',
    icon: History,
    section: 'intelligence',
    status: 'active',
    description: 'Temporal market behavior analysis.'
  },
  
  // Supplier Layer
  {
    path: '/dashboard',
    label: 'Suppliers CRM',
    icon: Database,
    section: 'suppliers',
    status: 'active',
    description: 'Core supplier management and lifecycle tracking.'
  },
  {
    path: '/suppliers/scoring',
    label: 'Supplier Scoring',
    icon: BarChart3,
    section: 'suppliers',
    status: 'beta',
    description: 'Intelligence-based supplier performance ranking.'
  },
  
  // Procurement Layer
  {
    path: '/procurement',
    label: 'Procurement Engine',
    icon: ShoppingBag,
    section: 'procurement',
    status: 'active',
    description: 'Centralized purchase order management.'
  },
  {
    path: '/procurement/drafts',
    label: 'Draft POs',
    icon: ClipboardList,
    section: 'procurement',
    status: 'active',
    description: 'Manage and review pending purchase orders.'
  },
  
  // System Layer
  {
    path: '/',
    label: 'Command Center',
    icon: LayoutDashboard,
    section: 'system',
    status: 'active',
    description: 'System-wide overview and key metrics.'
  },
  {
    path: '/system/routes',
    label: 'System Integrity',
    icon: ShieldCheck,
    section: 'system',
    status: 'active',
    description: 'Route validation and system health monitor.'
  },
  {
    path: '/system/logs',
    label: 'Event Logs',
    icon: FileText,
    section: 'system',
    status: 'active',
    description: 'Full audit trail of system events.'
  }
];
