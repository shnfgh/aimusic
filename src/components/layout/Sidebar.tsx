import React from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: 'create' | 'edit' | 'mix' | 'export') => void;
  hasProject: boolean;
}

const tabs = [
  { id: 'create' as const, label: 'Create', icon: '✨' },
  { id: 'edit' as const, label: 'Edit', icon: '🎵' },
  { id: 'mix' as const, label: 'Mix', icon: '🎛️' },
  { id: 'export' as const, label: 'Export', icon: '📦' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, hasProject }) => {
  return (
    <aside className="w-16 h-full flex flex-col items-center py-4 border-r border-[var(--border-color)] bg-[var(--bg-secondary)]">
      {/* Logo */}
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-900/30">
        <span className="text-white font-bold text-sm">FQ</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={tab.id !== 'create' && !hasProject}
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-[var(--accent-primary)] shadow-lg shadow-purple-900/40 scale-105'
                : 'hover:bg-[var(--bg-tertiary)] opacity-70 hover:opacity-100'
              }
              ${tab.id !== 'create' && !hasProject ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={tab.label}
          >
            {tab.icon}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="flex flex-col gap-2 items-center">
        <button className="w-10 h-10 rounded-lg flex items-center justify-center text-lg hover:bg-[var(--bg-tertiary)] transition-colors" title="Settings">
          ⚙️
        </button>
      </div>
    </aside>
  );
};
