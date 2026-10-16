/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { CatalogView } from './components/CatalogView';
import { TransactionsView } from './components/TransactionsView';
import { ReportsView } from './components/ReportsView';
import { RbacView } from './components/RbacView';
import { AuditLogView } from './components/AuditLogView';
import { SwitchUserModal } from './components/modals/SwitchUserModal';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [switchUserModalOpen, setSwitchUserModalOpen] = useState(false);

  return (
    <InventoryProvider>
      <div className="flex h-screen bg-neutral-100/70 font-sans text-neutral-900 overflow-hidden">
        {/* Main Fixed Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSwitchUserModal={() => setSwitchUserModalOpen(true)}
        />

        {/* Content Viewport */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <TopHeader
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            onOpenSwitchUserModal={() => setSwitchUserModalOpen(true)}
          />

          <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && <DashboardView onNavigate={setActiveTab} />}
              {activeTab === 'catalog' && <CatalogView />}
              {activeTab === 'transactions' && <TransactionsView />}
              {activeTab === 'reports' && <ReportsView />}
              {activeTab === 'rbac' && <RbacView />}
              {activeTab === 'audit' && <AuditLogView />}
            </div>
          </main>
        </div>

        {/* Switch Persona Dialog */}
        <SwitchUserModal
          isOpen={switchUserModalOpen}
          onClose={() => setSwitchUserModalOpen(false)}
        />

        {/* Real-time Toast Notifications */}
        <ToastContainer />
      </div>
    </InventoryProvider>
  );
}
