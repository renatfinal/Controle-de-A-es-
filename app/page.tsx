'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Transaction, UserProfile } from '@/lib/types';
import {
  loadTransactions,
  saveTransactions,
  loadUserProfile,
  saveUserProfile,
  INITIAL_DEMO_DATA,
} from '@/lib/storage';
import { Sidebar } from '@/components/Sidebar';
import { DashboardCalendar } from '@/components/DashboardCalendar';
import { FoldersGrid } from '@/components/FoldersGrid';
import { BalanceteView } from '@/components/BalanceteView';
import { TransactionModal } from '@/components/TransactionModal';
import { DividendModal } from '@/components/DividendModal';
import { EditTickerModal } from '@/components/EditTickerModal';
import { ProfileModal } from '@/components/ProfileModal';
import { RegisterModal } from '@/components/RegisterModal';
import { ForgotModal } from '@/components/ForgotModal';
import { BackupModal } from '@/components/BackupModal';
import { LoginScreen } from '@/components/LoginScreen';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { ToastContainer, ToastMessage } from '@/components/Toast';
import { useIsMounted } from '@/hooks/use-is-mounted';

export default function Home() {
  const isMounted = useIsMounted();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'folders' | 'balancete'>('dashboard');

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    if (typeof window === 'undefined') return [];
    return loadTransactions();
  });

  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    if (typeof window === 'undefined') return null;
    return loadUserProfile();
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const sessionActive = sessionStorage.getItem('rf_session_active');
    const profile = loadUserProfile();
    if (!sessionActive && profile && profile.email) {
      return false;
    }
    return true;
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txModalDate, setTxModalDate] = useState<string | undefined>(undefined);
  const [txModalTicker, setTxModalTicker] = useState<string | undefined>(undefined);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const [isDividendModalOpen, setIsDividendModalOpen] = useState(false);
  const [dividendTicker, setDividendTicker] = useState<string | null>(null);

  const [isEditTickerModalOpen, setIsEditTickerModalOpen] = useState(false);
  const [editTicker, setEditTicker] = useState<string | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const [foldersFilterSearch, setFoldersFilterSearch] = useState<string>('');

  // Toast handler
  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Register service worker for offline PWA functionality
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }, []);

  // Save changes to localStorage whenever transactions change
  const handleTransactionsChange = (newTxs: Transaction[]) => {
    setTransactions(newTxs);
    saveTransactions(newTxs);
  };

  // Keyboard shortcut for Escape to close all modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsTxModalOpen(false);
        setIsDividendModalOpen(false);
        setIsEditTickerModalOpen(false);
        setIsProfileModalOpen(false);
        setIsRegisterModalOpen(false);
        setIsForgotModalOpen(false);
        setIsBackupModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers for transactions
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id'>,
    existingId?: number
  ) => {
    if (existingId) {
      const updated = transactions.map(t =>
        t.id === existingId ? { ...t, ...txData } : t
      );
      handleTransactionsChange(updated);
      addToast('success', `Lançamento em ${txData.ticker} atualizado!`);
    } else {
      const newTx: Transaction = {
        ...txData,
        id: Date.now(),
      };
      const updated = [...transactions, newTx];
      handleTransactionsChange(updated);
      addToast('success', `Lançamento em ${txData.ticker} registrado com sucesso!`);
    }
  };

  const handleDeleteTransaction = (id: number) => {
    const updated = transactions.filter(t => t.id !== id);
    handleTransactionsChange(updated);
    addToast('info', 'Lançamento excluído com sucesso.');
  };

  const handleDeleteAllTickerTransactions = (ticker: string) => {
    const updated = transactions.filter(t => t.ticker !== ticker);
    handleTransactionsChange(updated);
    addToast('info', `Ativo ${ticker} e seus lançamentos foram excluídos.`);
  };

  const handleSaveDividend = (ticker: string, date: string, value: number) => {
    const matching = transactions.find(t => t.ticker === ticker);
    const newTx: Transaction = {
      id: Date.now(),
      date,
      nome: matching?.nome || ticker,
      ticker,
      classe: matching?.classe || 'Ação',
      qtd: 0,
      valorUn: 0,
      valorTotal: 0,
      tipo: 'DIVIDENDO',
      dividendo: value,
    };
    const updated = [...transactions, newTx];
    handleTransactionsChange(updated);
    addToast('success', `R$ ${value.toFixed(2)} em proventos adicionados a ${ticker}!`);
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
  };

  const handleRegister = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
    setIsLoggedIn(true);
    sessionStorage.setItem('rf_session_active', 'true');
    addToast('success', 'Cadastro realizado com sucesso! Bem-vindo.');
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    sessionStorage.setItem('rf_session_active', 'true');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('rf_session_active');
    setIsLoggedIn(false);
    addToast('info', 'Sessão encerrada.');
  };

  const handleRestoreData = (newTxs: Transaction[], newProf?: UserProfile) => {
    handleTransactionsChange(newTxs);
    if (newProf) {
      setUserProfile(newProf);
      saveUserProfile(newProf);
    }
  };

  const handleSearchAndRedirect = (ticker: string) => {
    setFoldersFilterSearch(ticker);
    setActiveTab('folders');
  };

  // Find asset name for dividend modal
  const dividendAssetName = dividendTicker
    ? transactions.find(t => t.ticker === dividendTicker)?.nome || dividendTicker
    : '';

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F0C]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-black font-black text-xl flex items-center justify-center animate-pulse">
            RF
          </div>
          <p className="text-xs text-zinc-400">Carregando carteira de investimentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F0C] text-[#F3F4F6] flex flex-col md:flex-row">
      {/* Login Screen Overlay if not logged in */}
      {!isLoggedIn && (
        <LoginScreen
          userProfile={userProfile}
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsLoggedIn(true)}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          onOpenForgot={() => setIsForgotModalOpen(true)}
          onNotify={addToast}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'folders') setFoldersFilterSearch('');
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onLogout={handleLogout}
        userProfile={userProfile}
      />

      {/* Main Content Area with bottom padding for mobile navigation */}
      <main className="flex-1 p-3.5 sm:p-4 md:p-8 max-w-7xl mx-auto w-full min-w-0 flex flex-col justify-between pb-24 md:pb-8">
        <div className="space-y-5 sm:space-y-6">
          {/* Active View */}
          {activeTab === 'dashboard' && (
            <DashboardCalendar
              transactions={transactions}
              onOpenNewTransaction={(dateStr) => {
                setEditingTx(null);
                setTxModalTicker(undefined);
                setTxModalDate(dateStr);
                setIsTxModalOpen(true);
              }}
              onSearchAndRedirect={handleSearchAndRedirect}
            />
          )}

          {activeTab === 'folders' && (
            <FoldersGrid
              transactions={transactions}
              initialSearch={foldersFilterSearch}
              onOpenEditTicker={(ticker) => {
                setEditTicker(ticker);
                setIsEditTickerModalOpen(true);
              }}
              onOpenAddDividend={(ticker) => {
                setDividendTicker(ticker);
                setIsDividendModalOpen(true);
              }}
              onOpenNewTransaction={(dateStr, prefillTicker) => {
                setEditingTx(null);
                setTxModalDate(dateStr || new Date().toISOString().slice(0, 10));
                setTxModalTicker(prefillTicker);
                setIsTxModalOpen(true);
              }}
            />
          )}

          {activeTab === 'balancete' && (
            <BalanceteView
              transactions={transactions}
              onNotify={addToast}
            />
          )}
        </div>

        {/* Footer info & Offline Status */}
        <footer className="mt-12 pt-6 border-t border-[#243027] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>RF Investimentos — Sistema Profissional de Performance & IRPF</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="hover:text-emerald-400 transition"
            >
              Exportar Backup JSON
            </button>
            <span>•</span>
            <button
              onClick={() => {
                handleTransactionsChange(INITIAL_DEMO_DATA);
                addToast('success', 'Carteira demonstrativa restaurada!');
              }}
              className="hover:text-emerald-400 transition"
            >
              Recarregar Carteira Demo
            </button>
          </div>
        </footer>
      </main>

      {/* Modals with individual keys for fresh state on mount */}
      <TransactionModal
        key={editingTx ? `edit-${editingTx.id}` : `new-${txModalDate}-${txModalTicker || 'any'}`}
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTx(null);
        }}
        onSave={handleSaveTransaction}
        initialDate={txModalDate}
        initialTicker={txModalTicker}
        editingTransaction={editingTx}
      />

      <DividendModal
        key={`div-${dividendTicker || 'none'}`}
        isOpen={isDividendModalOpen}
        onClose={() => setIsDividendModalOpen(false)}
        ticker={dividendTicker}
        assetName={dividendAssetName}
        onSaveDividend={handleSaveDividend}
      />

      <EditTickerModal
        isOpen={isEditTickerModalOpen}
        onClose={() => setIsEditTickerModalOpen(false)}
        ticker={editTicker}
        transactions={transactions}
        onEditTransaction={(tx) => {
          setIsEditTickerModalOpen(false);
          setEditingTx(tx);
          setIsTxModalOpen(true);
        }}
        onDeleteTransaction={handleDeleteTransaction}
        onDeleteAllTickerTransactions={handleDeleteAllTickerTransactions}
        onAddForTicker={(ticker) => {
          setIsEditTickerModalOpen(false);
          setEditingTx(null);
          setTxModalTicker(ticker);
          setTxModalDate(new Date().toISOString().slice(0, 10));
          setIsTxModalOpen(true);
        }}
      />

      <ProfileModal
        key={userProfile?.email || 'profile'}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        onNotify={addToast}
      />

      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={handleRegister}
      />

      <ForgotModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onNotify={addToast}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        transactions={transactions}
        userProfile={userProfile}
        onRestoreData={handleRestoreData}
        onNotify={addToast}
      />

      {/* Connectivity Banner & Toast Container */}
      <OfflineIndicator />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
