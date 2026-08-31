import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ToastContainer } from './components/common/ToastContainer';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { ErrorBoundary } from './components/common/ErrorBoundary';

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
  const { activeTab } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Creation modals
  const [isCreateAppModalOpen, setIsCreateAppModalOpen] = useState(false);
  const [isCreateEstModalOpen, setIsCreateEstModalOpen] = useState(false);
  const [isCreateRiskModalOpen, setIsCreateRiskModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 antialiased font-sans selection:bg-indigo-500 selection:text-white">
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

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
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
        </main>
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
