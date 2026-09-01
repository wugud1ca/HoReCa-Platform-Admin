import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AuthView } from './components/auth/AuthView';
import { hasPermission, ROLE_DEFINITIONS } from './lib/permissions';
import { Sparkles, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { UserRole } from './types';

// Views
import { DashboardView } from './components/dashboard/DashboardView';
import { ApplicationsView } from './components/applications/ApplicationsView';
import { EstablishmentsView } from './components/establishments/EstablishmentsView';
import { BranchesDirectoryView } from './components/branches/BranchesDirectoryView';
import { OrdersView } from './components/orders/OrdersView';
import { FinanceLedgerView } from './components/finance/FinanceLedgerView';
import { PayoutsView } from './components/payouts/PayoutsView';
import { RiskComplianceView } from './components/risks/RiskComplianceView';
import { DocumentsAuditView } from './components/documents/DocumentsAuditView';
import { UsersRolesView } from './components/users/UsersRolesView';
import { SystemSettingsView } from './components/settings/SystemSettingsView';

// Modals
import { CreateApplicationModal } from './components/modals/CreateApplicationModal';
import { CreateEstablishmentModal } from './components/modals/CreateEstablishmentModal';
import { CreateRiskModal } from './components/modals/CreateRiskModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    isAuthenticated,
    isDemoMode,
    exitDemoMode,
    currentUser,
    switchUserRole,
    navigateTo,
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Creation modals
  const [isCreateAppModalOpen, setIsCreateAppModalOpen] = useState(false);
  const [isCreateEstModalOpen, setIsCreateEstModalOpen] = useState(false);
  const [isCreateRiskModalOpen, setIsCreateRiskModalOpen] = useState(false);

  // If user is not authenticated and not in demo, show the Authorization screen
  if (!isAuthenticated) {
    return (
      <>
        <AuthView />
        <ToastContainer />
      </>
    );
  }

  // Check tab permission
  const isTabAllowed = hasPermission.canViewTab(currentUser.role, activeTab);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased font-sans selection:bg-indigo-500 selection:text-white flex-col">
      {/* Demo Mode Top Announcement Bar */}
      {isDemoMode && (
        <div className="w-full bg-slate-900 border-b border-amber-500/30 px-4 py-2 text-xs text-slate-200 flex flex-wrap items-center justify-between gap-2 z-40">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center space-x-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>DEMO MODE</span>
            </span>
            <span className="text-slate-300">
              Вы находитесь в презентационном контуре. Текущая роль: <strong className="text-white">{ROLE_DEFINITIONS[currentUser.role]?.title}</strong>.
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-slate-400">Переключить тестовую роль:</span>
              <select
                value={currentUser.role}
                onChange={e => switchUserRole(e.target.value as UserRole)}
                className="bg-slate-800 border border-slate-700 text-xs text-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="super_admin">Владелец (Super Admin)</option>
                <option value="admin_manager">Руководитель (Manager)</option>
                <option value="moderator">Модератор кафе</option>
                <option value="support">Оператор поддержки</option>
                <option value="demo_user">Демо-пользователь</option>
              </select>
            </div>

            <button
              onClick={exitDemoMode}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span>Выйти из Демо</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 relative">
        {/* Navigation Sidebar */}
        <Sidebar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${isCollapsed ? 'lg:pl-18' : 'lg:pl-64'}`}>
          {/* Sticky Top Header Bar */}
          <TopBar
            setMobileOpen={setMobileOpen}
            onOpenCreateAppModal={() => setIsCreateAppModalOpen(true)}
            onOpenCreateEstModal={() => setIsCreateEstModalOpen(true)}
            onOpenCreateRiskModal={() => setIsCreateRiskModalOpen(true)}
          />

          {/* Dynamic Route View with RBAC Guard */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {!isTabAllowed ? (
              <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-sm max-w-lg mx-auto mt-12">
                <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-slate-900">Доступ ограничен политиками безопасности</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Для вашей роли ({ROLE_DEFINITIONS[currentUser.role]?.title}) раздел «{activeTab}» недоступен.
                  </p>
                </div>
                <button
                  onClick={() => navigateTo('dashboard')}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
                >
                  Вернуться на дашборд
                </button>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && <DashboardView />}
                {activeTab === 'applications' && <ApplicationsView />}
                {activeTab === 'establishments' && (
                  <EstablishmentsView onOpenCreateEstModal={() => setIsCreateEstModalOpen(true)} />
                )}
                {activeTab === 'branches' && <BranchesDirectoryView />}
                {activeTab === 'orders' && <OrdersView />}
                {activeTab === 'finance' && <FinanceLedgerView />}
                {activeTab === 'payouts' && <PayoutsView />}
                {activeTab === 'risks' && (
                  <RiskComplianceView onOpenCreateRiskModal={() => setIsCreateRiskModalOpen(true)} />
                )}
                {activeTab === 'documents' && <DocumentsAuditView />}
                {activeTab === 'users' && <UsersRolesView />}
                {activeTab === 'settings' && <SystemSettingsView />}
                {activeTab === 'audit' && <DocumentsAuditView />}

                {/* Fallback if route does not match */}
                {![
                  'dashboard',
                  'applications',
                  'establishments',
                  'branches',
                  'orders',
                  'finance',
                  'payouts',
                  'risks',
                  'documents',
                  'users',
                  'settings',
                  'audit'
                ].includes(activeTab) && <DashboardView />}
              </>
            )}
          </main>
        </div>
      </div>

      {/* Overlays and Modals */}
      <GlobalSearchModal />
      <ToastContainer />

      <CreateApplicationModal
        isOpen={isCreateAppModalOpen}
        onClose={() => setIsCreateAppModalOpen(false)}
      />

      <CreateEstablishmentModal
        isOpen={isCreateEstModalOpen}
        onClose={() => setIsCreateEstModalOpen(false)}
      />

      <CreateRiskModal
        isOpen={isCreateRiskModalOpen}
        onClose={() => setIsCreateRiskModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ErrorBoundary>
  );
}
