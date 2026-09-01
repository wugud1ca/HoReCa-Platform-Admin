import React from 'react';
import { useApp } from '../../context/AppContext';
import { ROLE_DEFINITIONS, hasPermission } from '../../lib/permissions';
import {
  LayoutDashboard,
  Inbox,
  Store,
  MapPin,
  ShoppingBag,
  CircleDollarSign,
  HandCoins,
  ShieldAlert,
  FolderOpen,
  Users,
  Settings,
  History,
  Coffee,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building2,
  QrCode
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const {
    activeTab,
    navigateTo,
    applications,
    establishments,
    payouts,
    riskCases,
    currentUser,
  } = useApp();

  // Badges
  const pendingAppsCount = applications.filter(a => a.status !== 'approved' && a.status !== 'rejected' && a.status !== 'converted').length;
  const criticalRisksCount = riskCases.filter(r => (r.level === 'critical' || r.level === 'high') && (r.status === 'open' || r.status === 'action_applied')).length;
  const pendingPayoutsCount = payouts.filter(p => p.status === 'ready_to_pay' || p.status === 'calculated' || p.status === 'approved').length;
  const blockedEstCount = establishments.filter(e => e.isBlocked || e.status === 'risk_limited').length;

  const roleMeta = ROLE_DEFINITIONS[currentUser.role] || {
    title: currentUser.role,
    badgeColor: 'bg-slate-100 text-slate-700',
    description: '',
  };

  interface NavItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
    section?: string;
  }

  const allNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Дашборд агента',
      icon: LayoutDashboard,
      section: 'Главное',
    },
    {
      id: 'applications',
      label: 'Заявки заведений',
      icon: Inbox,
      badge: pendingAppsCount,
      badgeColor: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
      section: 'Онбординг',
    },
    {
      id: 'establishments',
      label: 'Реестр кафе & ресторанов',
      icon: Store,
      badge: blockedEstCount > 0 ? blockedEstCount : undefined,
      badgeColor: 'bg-rose-100 text-rose-800 border border-rose-300',
      section: 'Заведения',
    },
    {
      id: 'branches',
      label: 'Точки, QR и KDS 2 Remix',
      icon: MapPin,
      section: 'Заведения',
    },
    {
      id: 'orders',
      label: 'Заказы & Чеки СБП',
      icon: ShoppingBag,
      section: 'Операции',
    },
    {
      id: 'finance',
      label: 'Финансовый учет & Эквайринг',
      icon: CircleDollarSign,
      section: 'Финансы',
    },
    {
      id: 'payouts',
      label: 'Выплаты кафе и комиссии',
      icon: HandCoins,
      badge: pendingPayoutsCount > 0 ? pendingPayoutsCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
      section: 'Финансы',
    },
    {
      id: 'risks',
      label: 'Риск-мониторинг & Чарджбэки',
      icon: ShieldAlert,
      badge: criticalRisksCount > 0 ? criticalRisksCount : undefined,
      badgeColor: 'bg-red-100 text-red-800 border border-red-300 font-bold',
      section: 'Комплаенс',
    },
    {
      id: 'documents',
      label: 'Агентские договоры',
      icon: FolderOpen,
      section: 'Комплаенс',
    },
    {
      id: 'users',
      label: 'Сотрудники, Инвайты & RBAC',
      icon: Users,
      section: 'Администрирование',
    },
    {
      id: 'settings',
      label: 'Настройки платформы',
      icon: Settings,
      section: 'Администрирование',
    },
    {
      id: 'audit',
      label: 'Журнал аудита',
      icon: History,
      section: 'Администрирование',
    },
  ];

  // Filter items by role permission
  const navItems = allNavItems.filter(item => hasPermission.canViewTab(currentUser.role, item.id));

  // Group by section
  const sections = Array.from(new Set(navItems.map(i => i.section)));

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-all duration-200 ease-in-out shadow-xs ${
          isCollapsed ? 'w-18' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 shrink-0 bg-white">
          <div
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-xs shrink-0 text-white">
              <Building2 className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-sm font-bold tracking-tight text-slate-900 whitespace-nowrap">
                  HoReCa <span className="text-emerald-600">Agent</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono tracking-wider uppercase">
                  PWA & KDS Back-Office
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Role Card */}
        {!isCollapsed && (
          <div className="px-3 py-2.5 mx-2 my-2 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-700">
                    {currentUser.name.substring(0, 1)}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</div>
                <div className={`inline-block text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 border ${roleMeta.badgeColor}`}>
                  {roleMeta.title}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3.5 text-xs">
          {sections.map(secName => {
            const items = navItems.filter(i => i.section === secName);
            return (
              <div key={secName} className="space-y-0.5">
                {!isCollapsed && (
                  <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                    {secName}
                  </div>
                )}
                {items.map(item => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigateTo(item.id);
                        if (mobileOpen) setMobileOpen(false);
                      }}
                      title={isCollapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors group relative ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`}
                    >
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      {!isCollapsed && (
                        <span className="flex-1 truncate tracking-tight text-[12px]">{item.label}</span>
                      )}
                      {item.badge !== undefined && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                            item.badgeColor || 'bg-slate-100 text-slate-700'
                          } ${isCollapsed ? 'absolute -top-1 -right-1 scale-90' : ''}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer State */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>RBAC v2.4</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">Agent Secured</span>
          </div>
        )}
      </aside>
    </>
  );
};

