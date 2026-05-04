import { useState } from 'react';
import {
  Newspaper,
  Tag,
  FolderOpen,
  Layers,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'news', label: 'News', icon: <Newspaper size={18} /> },
  { id: 'news-categories', label: 'News Categories', icon: <Tag size={18} /> },
  { id: 'projects', label: 'Projects', icon: <FolderOpen size={18} /> },
  { id: 'project-categories', label: 'Project Categories', icon: <Layers size={18} /> },
];

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { logout, user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-60'
      } min-h-screen`}
    >
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
          <Zap size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="text-white font-bold text-base tracking-tight truncate">SAO ARC</span>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            title={collapsed ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
              activeTab === item.id
                ? 'bg-blue-500/15 text-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            } ${collapsed ? 'justify-center' : ''}`}
          >
            <span className={`flex-shrink-0 ${activeTab === item.id ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {item.icon}
            </span>
            {!collapsed && <span>{item.label}</span>}
            {!collapsed && activeTab === item.id && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400" />
            )}
          </button>
        ))}
      </nav>

      <div className="px-2 py-4 border-t border-slate-800 space-y-2">
        <div className={`flex items-center gap-3 px-3 py-2 ${collapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.email?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 text-xs font-medium truncate">{user?.email}</p>
              <p className="text-slate-500 text-xs">Administrator</p>
            </div>
          )}
        </div>

        <button
          onClick={logout}
          title={collapsed ? 'Sign out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-600 transition-all z-10"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
