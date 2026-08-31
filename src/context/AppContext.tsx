import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  InternalUser,
  Establishment,
  OnboardingApplication,
  Order,
  PartnerPayout,
  RiskCase,
  DocumentItem,
  AuditLogEntry,
  SystemSettings,
  ApplicationStatus,
  EstablishmentStatus,
  OrderStatus,
  RiskLevel,
  UserRole
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ESTABLISHMENTS,
  INITIAL_APPLICATIONS,
  INITIAL_ORDERS,
  INITIAL_PAYOUTS,
  INITIAL_RISK_CASES,
  INITIAL_DOCUMENTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SETTINGS
} from '../data/mockData';

export type TimePeriod = 'today' | '7days' | 'month' | 'quarter' | 'year';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  timestamp: number;
}

interface AppContextType {
  currentUser: InternalUser;
  setCurrentUser: (user: InternalUser) => void;
  switchUserRole: (role: UserRole) => void;
  allUsers: InternalUser[];
  
  establishments: Establishment[];
  applications: OnboardingApplication[];
  orders: Order[];
  payouts: PartnerPayout[];
  riskCases: RiskCase[];
  documents: DocumentItem[];
  auditLogs: AuditLogEntry[];
  settings: SystemSettings;

  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedEstablishmentId: string | null;
  setSelectedEstablishmentId: (id: string | null) => void;
  selectedApplicationId: string | null;
  setSelectedApplicationId: (id: string | null) => void;
  
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
  
  isGlobalSearchOpen: boolean;
  setIsGlobalSearchOpen: (open: boolean) => void;
  
  toasts: ToastNotification[];
  showToast: (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;

  // Actions
  navigateTo: (tab: string, entityId?: string) => void;
  convertApplicationToEstablishment: (applicationId: string) => Establishment | null;
  updateApplicationStatus: (
    applicationId: string,
    status: ApplicationStatus,
    notes?: { lawyer?: string; manager?: string },
    rejectionReason?: string
  ) => void;
  createApplication: (data: Partial<OnboardingApplication>) => void;
  
  updateEstablishment: (establishment: Establishment, auditReason?: string) => void;
  createEstablishment: (establishment: Partial<Establishment>) => Establishment;
  toggleEstablishmentBlock: (
    establishmentId: string,
    isBlocked: boolean,
    reason: string,
    isStopOps: boolean,
    isStopPayouts: boolean
  ) => void;
  toggleBranchStop: (establishmentId: string, branchId: string, isStopped: boolean, reason?: string) => void;
  
  createRiskCase: (caseData: Partial<RiskCase>) => void;
  applyRiskActions: (riskId: string, isStopOps: boolean, isStopPayouts: boolean, reason?: string) => void;
  resolveRiskCase: (riskId: string, resolutionComment: string) => void;
  
  adjustPayout: (payoutId: string, adjustmentAmount: number, reason: string) => void;
  approvePayout: (payoutId: string) => void;
  freezePayout: (payoutId: string, reason: string) => void;
  executePayoutPayment: (payoutId: string, paymentDocNumber: string) => void;
  calculatePayoutsForPeriod: (periodLabel: string) => void;

  addDocument: (doc: Partial<DocumentItem>) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string, reason: string) => void;
  bumpKdsOrder: (orderId: string) => void;
  simulatePwaGuestOrder: (
    establishmentId: string,
    branchId: string,
    items: { name: string; quantity: number; price: number }[],
    tableNumber?: number,
    channel?: 'qr_table' | 'qr_takeaway'
  ) => Order;
  toggleMenuItemStopList: (establishmentId: string, itemId: string) => void;
  updatePwaSettings: (establishmentId: string, branchId: string, pwaData: Partial<import('../types').PwaSettings>) => void;
  updateSettings: (newSettings: SystemSettings) => void;
  addAuditLog: (entry: {
    entityType: AuditLogEntry['entityType'];
    entityId: string;
    entityName: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    reason?: string;
  }) => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed = JSON.parse(saved);
    return parsed ?? fallback;
  } catch (e) {
    console.warn(`Failed to parse localStorage for ${key}`, e);
    return fallback;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial from localStorage or mockData safely
  const [currentUser, setCurrentUserState] = useState<InternalUser>(() =>
    loadFromStorage('horeca_admin_current_user', INITIAL_USERS[0])
  );

  const [establishments, setEstablishments] = useState<Establishment[]>(() =>
    loadFromStorage('horeca_admin_establishments', INITIAL_ESTABLISHMENTS)
  );

  const [applications, setApplications] = useState<OnboardingApplication[]>(() =>
    loadFromStorage('horeca_admin_applications', INITIAL_APPLICATIONS)
  );

  const [orders, setOrders] = useState<Order[]>(() =>
    loadFromStorage('horeca_admin_orders', INITIAL_ORDERS)
  );

  const [payouts, setPayouts] = useState<PartnerPayout[]>(() =>
    loadFromStorage('horeca_admin_payouts', INITIAL_PAYOUTS)
  );

  const [riskCases, setRiskCases] = useState<RiskCase[]>(() =>
    loadFromStorage('horeca_admin_risks', INITIAL_RISK_CASES)
  );

  const [documents, setDocuments] = useState<DocumentItem[]>(() =>
    loadFromStorage('horeca_admin_documents', INITIAL_DOCUMENTS)
  );

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() =>
    loadFromStorage('horeca_admin_audit', INITIAL_AUDIT_LOGS)
  );

  const [settings, setSettings] = useState<SystemSettings>(() =>
    loadFromStorage('horeca_admin_settings', INITIAL_SETTINGS)
  );

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedEstablishmentId, setSelectedEstablishmentId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('horeca_admin_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('horeca_admin_establishments', JSON.stringify(establishments));
  }, [establishments]);

  useEffect(() => {
    localStorage.setItem('horeca_admin_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('horeca_admin_payouts', JSON.stringify(payouts));
  }, [payouts]);

  useEffect(() => {
    localStorage.setItem('horeca_admin_risks', JSON.stringify(riskCases));
  }, [riskCases]);

  useEffect(() => {
    localStorage.setItem('horeca_admin_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('horeca_admin_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('horeca_admin_settings', JSON.stringify(settings));
  }, [settings]);

  // URL Hash Sync for standard browser navigation & reload support
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        const parts = hash.split('/');
        const tab = parts[0] || 'dashboard';
        const entityId = parts[1] || null;
        setActiveTab(tab);
        if (tab === 'establishments' && entityId) {
          setSelectedEstablishmentId(entityId);
        } else if (tab === 'applications' && entityId) {
          setSelectedApplicationId(entityId);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (tab: string, entityId?: string) => {
    setActiveTab(tab);
    if (tab === 'establishments') {
      setSelectedEstablishmentId(entityId || null);
    }
    if (tab === 'applications') {
      setSelectedApplicationId(entityId || null);
    }
    const hashUrl = entityId ? `#/${tab}/${entityId}` : `#/${tab}`;
    window.location.hash = hashUrl;
  };

  const showToast = (toast: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = { ...toast, id, timestamp: Date.now() };
    setToasts(prev => [newToast, ...prev.slice(0, 4)]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const addAuditLog = (entry: {
    entityType: AuditLogEntry['entityType'];
    entityId: string;
    entityName: string;
    action: string;
    oldValue?: string;
    newValue?: string;
    reason?: string;
  }) => {
    const newLog: AuditLogEntry = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      userName: currentUser.name,
      userRole: currentUser.role,
      ipAddress: '192.168.1.104',
      ...entry,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchUserRole = (role: UserRole) => {
    const user = INITIAL_USERS.find(u => u.role === role) || {
      ...currentUser,
      role,
      name: `Сотрудник (${role})`,
    };
    setCurrentUserState(user);
    showToast({
      type: 'info',
      title: 'Роль переключена',
      message: `Текущая роль: ${user.name} [${role.toUpperCase()}]`,
    });
  };

  // Convert application to establishment workflow
  const convertApplicationToEstablishment = (applicationId: string): Establishment | null => {
    const app = applications.find(a => a.id === applicationId);
    if (!app) return null;

    const newEstId = 'est-' + (establishments.length + 1);
    const newEst: Establishment = {
      id: newEstId,
      status: 'approved',
      legalName: app.legalName,
      brandName: app.brandName,
      inn: app.inn,
      kpp: app.kpp,
      ogrn: app.ogrn || '1234567890123',
      type: app.type,
      serviceFormat: app.serviceFormat,
      contactPerson: app.contactPerson,
      phone: app.phone,
      email: app.email,
      timezone: 'UTC+3 (Москва)',
      region: app.city === 'Санкт-Петербург' ? 'Санкт-Петербург' : app.city === 'Казань' ? 'Республика Татарстан' : 'Москва и МО',
      city: app.city,
      registrationDate: new Date().toISOString().substring(0, 10),
      activationDate: new Date().toISOString().substring(0, 10),
      responsibleManager: currentUser.name,
      riskStatus: 'none',
      isBlocked: false,
      isStopOperations: false,
      isStopPayouts: false,
      bankDetails: {
        bik: '044525974',
        bankName: 'АО "ТБанк"',
        accountNumber: '40702810000009988776',
        corrAccount: '30101810145250000974',
        taxSystem: 'USN_INCOME',
      },
      commercialTerms: {
        type: 'agent',
        commissionRate: settings.platformDefaultCommission,
        fixedFeePerOrder: 0,
        minCommissionMonth: settings.minCommissionRub,
        payoutFrequency: 'weekly',
        payoutBasis: 'orders_delivered',
        freezePayoutsOnRisk: true,
        validFrom: new Date().toISOString().substring(0, 10),
        contractNumber: `AG-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        contractDate: new Date().toISOString().substring(0, 10),
        contractStatus: 'active',
      },
      operationalSettings: {
        orderModes: { preorder: true, onSite: true, takeaway: true, tableDelivery: false },
        pickupMethod: 'order_number',
        slaPrepTimeMin: 8,
        slaAssemblyTimeMin: 3,
        orderAvailabilityWindows: '08:00 - 22:00',
        integrations: {
          cashRegister: 'iiko',
          crm: true,
          acquiring: 'tinkoff',
          telegramBot: true,
          pushNotifications: true,
          smsNotifications: false,
        },
        autoStopRules: {
          maxUnprocessedOrders: 10,
          maxSlaBreachesPerHour: 4,
          stopOnPaymentErrorStreak: 3,
        },
      },
      branches: [
        {
          id: `br-${newEstId}-1`,
          establishmentId: newEstId,
          name: `Точка 1 (${app.brandName})`,
          address: `${app.city}, Центральный район`,
          city: app.city,
          workingHours: '08:00 - 22:00',
          status: 'active',
          isTemporarilyStopped: false,
          serviceChannels: { qrTable: true, qrTakeaway: true, counterOrder: true, delivery: false },
          activeOrdersCount: 0,
          todayGmv: 0,
          managerName: app.contactPerson,
          managerPhone: app.phone,
        },
      ],
      internalNotes: [`Создано на основании заявки #${app.id} пользователем ${currentUser.name}`],
      metrics: {
        totalGmv: 0,
        totalOrders: 0,
        avgCheck: 0,
        platformCommissionEarned: 0,
        pendingPayout: 0,
        cancelRate: 0,
        slaComplianceRate: 100,
        activeIncidents: 0,
      },
    };

    setEstablishments(prev => [newEst, ...prev]);

    // Update application state
    setApplications(prev =>
      prev.map(a =>
        a.id === applicationId
          ? { ...a, status: 'converted', verificationStage: 'completed', decisionDate: new Date().toISOString().substring(0, 10) }
          : a
      )
    );

    addAuditLog({
      entityType: 'establishment',
      entityId: newEstId,
      entityName: newEst.brandName,
      action: 'Создание заведения из заявки',
      oldValue: `Заявка #${applicationId}`,
      newValue: 'Статус: Одобрено к подключению',
      reason: 'Успешная модерация и генерация договора',
    });

    showToast({
      type: 'success',
      title: 'Заведение создано',
      message: `Заведение "${newEst.brandName}" успешно зарегистрировано в системе.`,
    });

    return newEst;
  };

  const updateApplicationStatus = (
    applicationId: string,
    status: ApplicationStatus,
    notes?: { lawyer?: string; manager?: string },
    rejectionReason?: string
  ) => {
    setApplications(prev =>
      prev.map(a => {
        if (a.id !== applicationId) return a;
        return {
          ...a,
          status,
          lawyerNote: notes?.lawyer !== undefined ? notes.lawyer : a.lawyerNote,
          managerNote: notes?.manager !== undefined ? notes.manager : a.managerNote,
          rejectionReason: rejectionReason !== undefined ? rejectionReason : a.rejectionReason,
          decisionDate: status === 'approved' || status === 'rejected' ? new Date().toISOString().substring(0, 10) : a.decisionDate,
        };
      })
    );

    addAuditLog({
      entityType: 'application',
      entityId: applicationId,
      entityName: `Заявка #${applicationId}`,
      action: 'Смена статуса модерации',
      newValue: status,
      reason: rejectionReason || notes?.lawyer || notes?.manager || 'Обновление этапа проверки',
    });

    showToast({
      type: 'success',
      title: 'Статус заявки обновлен',
      message: `Новый статус: ${status}`,
    });
  };

  const createApplication = (data: Partial<OnboardingApplication>) => {
    const id = 'app-' + (100 + applications.length + 1);
    const newApp: OnboardingApplication = {
      id,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      source: data.source || 'website',
      legalForm: data.legalForm || 'OOO',
      legalName: data.legalName || 'ООО "Новое Кафе"',
      brandName: data.brandName || 'Новое Кафе',
      inn: data.inn || '7700000000',
      contactPerson: data.contactPerson || 'Иван Иванов',
      phone: data.phone || '+7 (999) 000-00-00',
      email: data.email || 'partner@cafe.ru',
      city: data.city || 'Москва',
      branchCount: data.branchCount || 1,
      type: data.type || 'coffee_shop',
      serviceFormat: data.serviceFormat || 'mixed',
      status: 'new',
      verificationStage: 'primary_check',
      assignedTo: currentUser.name,
      foundRisks: [],
      attachedDocs: [],
      ...data,
    };

    // Check duplicate INN
    const duplicate = establishments.find(e => e.inn === newApp.inn) || applications.find(a => a.inn === newApp.inn);
    if (duplicate) {
      newApp.isDuplicateSuspected = true;
      newApp.foundRisks.push(`Обнаружен дубликат ИНН ${newApp.inn} с существующей записью`);
    }

    setApplications(prev => [newApp, ...prev]);

    addAuditLog({
      entityType: 'application',
      entityId: id,
      entityName: newApp.brandName,
      action: 'Создание входящей заявки',
      newValue: 'Статус: Новая',
      reason: `Заявка через канал: ${newApp.source}`,
    });

    showToast({
      type: 'success',
      title: 'Заявка добавлена',
      message: `Заявка #${id} успешно сохранена.`,
    });
  };

  const updateEstablishment = (establishment: Establishment, auditReason?: string) => {
    setEstablishments(prev => prev.map(e => (e.id === establishment.id ? establishment : e)));

    addAuditLog({
      entityType: 'establishment',
      entityId: establishment.id,
      entityName: establishment.brandName,
      action: 'Редактирование карточки заведения',
      newValue: `Статус: ${establishment.status}`,
      reason: auditReason || 'Обновление параметров заведения',
    });

    showToast({
      type: 'success',
      title: 'Данные заведения сохранены',
      message: `Изменения для "${establishment.brandName}" зафиксированы.`,
    });
  };

  const createEstablishment = (data: Partial<Establishment>): Establishment => {
    const id = 'est-' + (establishments.length + 1);
    const newEst: Establishment = {
      id,
      status: data.status || 'approved',
      legalName: data.legalName || 'ООО "Новый Клиент"',
      brandName: data.brandName || 'Новое Заведение',
      inn: data.inn || '7700112233',
      ogrn: data.ogrn || '1207700112233',
      type: data.type || 'coffee_shop',
      serviceFormat: data.serviceFormat || 'mixed',
      contactPerson: data.contactPerson || 'Управляющий',
      phone: data.phone || '+7 (999) 111-22-33',
      email: data.email || 'info@brand.ru',
      timezone: 'UTC+3 (Москва)',
      region: data.region || 'Москва и МО',
      city: data.city || 'Москва',
      registrationDate: new Date().toISOString().substring(0, 10),
      activationDate: new Date().toISOString().substring(0, 10),
      responsibleManager: currentUser.name,
      riskStatus: 'none',
      isBlocked: false,
      isStopOperations: false,
      isStopPayouts: false,
      bankDetails: data.bankDetails || {
        bik: '044525974',
        bankName: 'АО "ТБанк"',
        accountNumber: '40702810000001122334',
        corrAccount: '30101810145250000974',
        taxSystem: 'USN_INCOME',
      },
      commercialTerms: data.commercialTerms || {
        type: 'agent',
        commissionRate: settings.platformDefaultCommission,
        fixedFeePerOrder: 0,
        minCommissionMonth: settings.minCommissionRub,
        payoutFrequency: 'weekly',
        payoutBasis: 'orders_delivered',
        freezePayoutsOnRisk: true,
        validFrom: new Date().toISOString().substring(0, 10),
        contractNumber: `AG-${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
        contractDate: new Date().toISOString().substring(0, 10),
        contractStatus: 'active',
      },
      operationalSettings: data.operationalSettings || {
        orderModes: { preorder: true, onSite: true, takeaway: true, tableDelivery: true },
        pickupMethod: 'order_number',
        slaPrepTimeMin: 8,
        slaAssemblyTimeMin: 3,
        orderAvailabilityWindows: '08:00 - 22:00',
        integrations: {
          cashRegister: 'iiko',
          crm: true,
          acquiring: 'tinkoff',
          telegramBot: true,
          pushNotifications: true,
          smsNotifications: false,
        },
        autoStopRules: {
          maxUnprocessedOrders: 10,
          maxSlaBreachesPerHour: 4,
          stopOnPaymentErrorStreak: 3,
        },
      },
      branches: data.branches || [
        {
          id: `br-${id}-1`,
          establishmentId: id,
          name: `Точка 1 (${data.brandName || 'Главная'})`,
          address: `${data.city || 'Москва'}, Центральный проезд, 1`,
          city: data.city || 'Москва',
          workingHours: '08:00 - 22:00',
          status: 'active',
          isTemporarilyStopped: false,
          serviceChannels: { qrTable: true, qrTakeaway: true, counterOrder: true, delivery: false },
          activeOrdersCount: 0,
          todayGmv: 0,
        },
      ],
      internalNotes: [`Создано напрямую пользователем ${currentUser.name}`],
      metrics: {
        totalGmv: 0,
        totalOrders: 0,
        avgCheck: 0,
        platformCommissionEarned: 0,
        pendingPayout: 0,
        cancelRate: 0,
        slaComplianceRate: 100,
        activeIncidents: 0,
      },
      ...data,
    };

    setEstablishments(prev => [newEst, ...prev]);

    addAuditLog({
      entityType: 'establishment',
      entityId: id,
      entityName: newEst.brandName,
      action: 'Создание заведения',
      newValue: 'Статус: Одобрено к подключению',
      reason: 'Прямая регистрация администратором/менеджером',
    });

    showToast({
      type: 'success',
      title: 'Заведение успешно создано',
      message: `Заведение "${newEst.brandName}" добавлено в реестр.`,
    });

    return newEst;
  };

  const toggleEstablishmentBlock = (
    establishmentId: string,
    isBlocked: boolean,
    reason: string,
    isStopOps: boolean,
    isStopPayouts: boolean
  ) => {
    setEstablishments(prev =>
      prev.map(e => {
        if (e.id !== establishmentId) return e;
        const newStatus: EstablishmentStatus = isBlocked
          ? 'blocked'
          : isStopOps
          ? 'temporarily_stopped'
          : isStopPayouts
          ? 'risk_limited'
          : 'active';

        return {
          ...e,
          status: newStatus,
          isBlocked,
          isStopOperations: isStopOps,
          isStopPayouts,
          blockReason: isBlocked || isStopOps || isStopPayouts ? reason : undefined,
          blockedBy: isBlocked || isStopOps || isStopPayouts ? `${currentUser.name} (${currentUser.role})` : undefined,
          blockedAt: isBlocked || isStopOps || isStopPayouts ? new Date().toISOString().replace('T', ' ').substring(0, 16) : undefined,
          riskStatus: isBlocked ? 'critical' : isStopPayouts ? 'high' : e.riskStatus,
        };
      })
    );

    addAuditLog({
      entityType: 'establishment',
      entityId: establishmentId,
      entityName: establishments.find(e => e.id === establishmentId)?.brandName || establishmentId,
      action: isBlocked ? 'Блокировка заведения' : 'Изменение статуса ограничений',
      newValue: isBlocked ? `Блокировка (StopOps: ${isStopOps}, StopPayouts: ${isStopPayouts})` : 'Разблокировано / Ограничения сняты',
      reason,
    });

    showToast({
      type: isBlocked ? 'error' : 'success',
      title: isBlocked ? 'Заведение заблокировано' : 'Статус заведения изменен',
      message: reason,
    });
  };

  const toggleBranchStop = (establishmentId: string, branchId: string, isStopped: boolean, reason?: string) => {
    setEstablishments(prev =>
      prev.map(e => {
        if (e.id !== establishmentId) return e;
        return {
          ...e,
          branches: e.branches.map(b => {
            if (b.id !== branchId) return b;
            return {
              ...b,
              status: isStopped ? 'stopped' : 'active',
              isTemporarilyStopped: isStopped,
              stopReason: isStopped ? reason || 'Остановлено вручную' : undefined,
            };
          }),
        };
      })
    );

    addAuditLog({
      entityType: 'establishment',
      entityId: establishmentId,
      entityName: `Точка #${branchId}`,
      action: isStopped ? 'Остановка точки продаж' : 'Возобновление работы точки',
      newValue: isStopped ? 'Остановлена' : 'Активна',
      reason: reason || 'Операционное решение',
    });

    showToast({
      type: isStopped ? 'warning' : 'success',
      title: isStopped ? 'Точка остановлена' : 'Точка возобновила прием заказов',
      message: reason || 'Статус успешно обновлен',
    });
  };

  const createRiskCase = (caseData: Partial<RiskCase>) => {
    const id = 'RISK-' + (200 + riskCases.length + 1);
    const newCase: RiskCase = {
      id,
      establishmentId: caseData.establishmentId || 'est-1',
      establishmentName: caseData.establishmentName || 'Заведение',
      category: caseData.category || 'customer_complaints',
      level: caseData.level || 'medium',
      detectedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      source: caseData.source || 'manager_report',
      description: caseData.description || 'Выявлен инцидент операционной деятельности',
      responsibleUser: `${currentUser.name} (${currentUser.role})`,
      recommendedAction: caseData.recommendedAction || 'warning',
      status: 'open',
      isStopOperationsApplied: false,
      isStopPayoutsApplied: false,
      ...caseData,
    };

    setRiskCases(prev => [newCase, ...prev]);

    // Update establishment risk status if level is higher
    if (newCase.level === 'critical' || newCase.level === 'high') {
      setEstablishments(prev =>
        prev.map(e => {
          if (e.id !== newCase.establishmentId) return e;
          return {
            ...e,
            riskStatus: newCase.level as RiskLevel,
          };
        })
      );
    }

    addAuditLog({
      entityType: 'risk_case',
      entityId: id,
      entityName: `${newCase.establishmentName} [${newCase.level.toUpperCase()}]`,
      action: 'Создание инцидента риска',
      newValue: newCase.description,
      reason: `Категория: ${newCase.category}`,
    });

    showToast({
      type: 'warning',
      title: 'Риск-кейс зарегистрирован',
      message: `Кейс #${id} [${newCase.level}] открыт для проверки.`,
    });
  };

  const applyRiskActions = (riskId: string, isStopOps: boolean, isStopPayouts: boolean, reason?: string) => {
    const targetCase = riskCases.find(r => r.id === riskId);
    if (!targetCase) return;

    setRiskCases(prev =>
      prev.map(r =>
        r.id === riskId
          ? {
              ...r,
              status: 'action_applied',
              isStopOperationsApplied: isStopOps,
              isStopPayoutsApplied: isStopPayouts,
              blockReason: reason,
              blockedBy: currentUser.name,
              blockedDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
            }
          : r
      )
    );

    // Apply to establishment
    setEstablishments(prev =>
      prev.map(e => {
        if (e.id !== targetCase.establishmentId) return e;
        return {
          ...e,
          isStopOperations: isStopOps,
          isStopPayouts: isStopPayouts,
          status: isStopOps ? 'temporarily_stopped' : isStopPayouts ? 'risk_limited' : e.status,
          blockReason: reason || `Применены меры по кейсу #${riskId}`,
        };
      })
    );

    // Freeze payout if stop payouts
    if (isStopPayouts) {
      setPayouts(prev =>
        prev.map(p => {
          if (p.establishmentId !== targetCase.establishmentId || p.status === 'paid') return p;
          return {
            ...p,
            status: 'frozen_by_risk',
            isFrozen: true,
            frozenReason: `Заморозка выплат по риск-кейсу #${riskId}: ${reason || targetCase.description}`,
          };
        })
      );
    }

    addAuditLog({
      entityType: 'risk_case',
      entityId: riskId,
      entityName: targetCase.establishmentName,
      action: 'Применение мер комплаенса по риску',
      newValue: `StopOps: ${isStopOps}, StopPayouts: ${isStopPayouts}`,
      reason: reason || 'Решение уполномоченного сотрудника',
    });

    showToast({
      type: 'error',
      title: 'Меры по риску применены',
      message: `Ограничения активированы для заведения ${targetCase.establishmentName}.`,
    });
  };

  const resolveRiskCase = (riskId: string, resolutionComment: string) => {
    const targetCase = riskCases.find(r => r.id === riskId);
    if (!targetCase) return;

    setRiskCases(prev =>
      prev.map(r =>
        r.id === riskId
          ? {
              ...r,
              status: 'resolved',
              lawyerComment: `${r.lawyerComment ? r.lawyerComment + ' | ' : ''}Закрыт: ${resolutionComment}`,
            }
          : r
      )
    );

    // If no other open high/critical risks, un-risk establishment
    const otherOpenRisks = riskCases.filter(
      r => r.establishmentId === targetCase.establishmentId && r.id !== riskId && (r.status === 'open' || r.status === 'action_applied')
    );

    if (otherOpenRisks.length === 0) {
      setEstablishments(prev =>
        prev.map(e => {
          if (e.id !== targetCase.establishmentId) return e;
          return {
            ...e,
            riskStatus: 'none',
            isStopOperations: false,
            isStopPayouts: false,
            status: e.isBlocked ? 'blocked' : 'active',
          };
        })
      );
    }

    addAuditLog({
      entityType: 'risk_case',
      entityId: riskId,
      entityName: targetCase.establishmentName,
      action: 'Закрытие риск-кейса',
      newValue: 'Статус: Урегулирован',
      reason: resolutionComment,
    });

    showToast({
      type: 'success',
      title: 'Риск-кейс урегулирован',
      message: `Кейс #${riskId} успешно закрыт.`,
    });
  };

  const adjustPayout = (payoutId: string, adjustmentAmount: number, reason: string) => {
    setPayouts(prev =>
      prev.map(p => {
        if (p.id !== payoutId) return p;
        const newAdjustment = adjustmentAmount;
        const newFinal = p.totalGmv - p.platformFeeAmount + newAdjustment;
        return {
          ...p,
          adjustmentsAmount: newAdjustment,
          adjustmentsReason: reason,
          finalPayoutAmount: Math.max(0, newFinal),
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              user: `${currentUser.name} (${currentUser.role})`,
              action: `Ручная корректировка: ${adjustmentAmount > 0 ? '+' : ''}${adjustmentAmount} ₽`,
              comment: reason,
            },
            ...p.history,
          ],
        };
      })
    );

    addAuditLog({
      entityType: 'payout',
      entityId: payoutId,
      entityName: `Выплата #${payoutId}`,
      action: 'Корректировка суммы выплаты',
      newValue: `Корректировка: ${adjustmentAmount} ₽`,
      reason,
    });

    showToast({
      type: 'success',
      title: 'Выплата скорректирована',
      message: `Сумма корректировки ${adjustmentAmount} ₽ учтена в расчете.`,
    });
  };

  const approvePayout = (payoutId: string) => {
    setPayouts(prev =>
      prev.map(p => {
        if (p.id !== payoutId) return p;
        return {
          ...p,
          status: 'ready_to_pay',
          isFrozen: false,
          approvals: {
            ...p.approvals,
            financierApproved: true,
            adminApproved: currentUser.role === 'admin' ? true : p.approvals.adminApproved,
            approverName: currentUser.name,
            approvedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          },
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              user: `${currentUser.name} (${currentUser.role})`,
              action: 'Согласование выплаты в банк',
            },
            ...p.history,
          ],
        };
      })
    );

    addAuditLog({
      entityType: 'payout',
      entityId: payoutId,
      entityName: `Выплата #${payoutId}`,
      action: 'Согласование выплаты партнеру',
      newValue: 'Статус: Готово к оплате',
      reason: 'Проверено финансистом/администратором',
    });

    showToast({
      type: 'success',
      title: 'Выплата согласована',
      message: `Реестр #${payoutId} переведен в статус "К выплате".`,
    });
  };

  const freezePayout = (payoutId: string, reason: string) => {
    setPayouts(prev =>
      prev.map(p => {
        if (p.id !== payoutId) return p;
        return {
          ...p,
          status: 'frozen_by_risk',
          isFrozen: true,
          frozenReason: reason,
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              user: `${currentUser.name} (${currentUser.role})`,
              action: 'Заморозка выплаты',
              comment: reason,
            },
            ...p.history,
          ],
        };
      })
    );

    addAuditLog({
      entityType: 'payout',
      entityId: payoutId,
      entityName: `Выплата #${payoutId}`,
      action: 'Заморозка выплаты',
      newValue: 'Статус: Заморожено',
      reason,
    });

    showToast({
      type: 'warning',
      title: 'Выплата заморожена',
      message: reason,
    });
  };

  const executePayoutPayment = (payoutId: string, paymentDocNumber: string) => {
    setPayouts(prev =>
      prev.map(p => {
        if (p.id !== payoutId) return p;
        return {
          ...p,
          status: 'paid',
          isFrozen: false,
          paidDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
          paymentDocNumber,
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              user: `${currentUser.name} (${currentUser.role})`,
              action: `Платеж исполнен (ПП №${paymentDocNumber})`,
            },
            ...p.history,
          ],
        };
      })
    );

    addAuditLog({
      entityType: 'payout',
      entityId: payoutId,
      entityName: `Выплата #${payoutId}`,
      action: 'Исполнение платежа по реестру',
      newValue: `Статус: Оплачено (ПП №${paymentDocNumber})`,
      reason: 'Банковское списание проведено',
    });

    showToast({
      type: 'success',
      title: 'Платеж успешно отправлен',
      message: `Платежное поручение №${paymentDocNumber} сохранено.`,
    });
  };

  const calculatePayoutsForPeriod = (periodLabel: string) => {
    // Generate calculated payouts for all active establishments
    const newCalculated: PartnerPayout[] = establishments
      .filter(e => e.status === 'active' || e.status === 'risk_limited')
      .map((est, idx) => {
        const gmv = Math.floor(150000 + Math.random() * 450000);
        const feeRate = est.commercialTerms.commissionRate || settings.platformDefaultCommission;
        const feeAmount = (gmv * feeRate) / 100;
        const adj = est.riskStatus === 'high' ? -2500 : 0;
        const final = gmv - feeAmount + adj;
        const id = `payout-calc-${Date.now()}-${idx}`;

        return {
          id,
          establishmentId: est.id,
          establishmentName: est.brandName,
          period: periodLabel,
          ordersCount: Math.floor(gmv / 450),
          totalGmv: gmv,
          platformFeeRate: feeRate,
          platformFeeAmount: feeAmount,
          adjustmentsAmount: adj,
          adjustmentsReason: adj !== 0 ? 'Удержание по претензиям' : undefined,
          finalPayoutAmount: final,
          status: est.isStopPayouts ? 'frozen_by_risk' : 'calculated',
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().substring(0, 10),
          isFrozen: est.isStopPayouts,
          frozenReason: est.isStopPayouts ? 'Стоп по флагам риска заведения' : undefined,
          approvals: {
            accountantApproved: false,
            financierApproved: false,
            adminApproved: false,
          },
          history: [
            {
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              user: currentUser.name,
              action: `Автоматический расчет реестра за период ${periodLabel}`,
            },
          ],
        };
      });

    setPayouts(prev => [...newCalculated, ...prev]);

    addAuditLog({
      entityType: 'payout',
      entityId: `calc-${Date.now()}`,
      entityName: `Реестр ${periodLabel}`,
      action: 'Массовый расчет агентских выплат',
      newValue: `Рассчитано ${newCalculated.length} заведений`,
      reason: 'Плановый пересчет агентского вознаграждения',
    });

    showToast({
      type: 'success',
      title: 'Расчет выплат завершен',
      message: `Сформировано ${newCalculated.length} новых расчетных ведомостей.`,
    });
  };

  const addDocument = (doc: Partial<DocumentItem>) => {
    const id = 'doc-' + (documents.length + 1);
    const newDoc: DocumentItem = {
      id,
      establishmentId: doc.establishmentId || 'est-1',
      establishmentName: doc.establishmentName || 'Surf & Coffee Lab',
      category: doc.category || 'contract',
      title: doc.title || 'Новый документ',
      docNumber: doc.docNumber || `ДОК-${Math.floor(1000 + Math.random() * 9000)}`,
      issueDate: doc.issueDate || new Date().toISOString().substring(0, 10),
      status: 'valid',
      fileSize: '1.4 МБ',
      uploadedBy: currentUser.name,
      version: 1,
      ...doc,
    };

    setDocuments(prev => [newDoc, ...prev]);

    addAuditLog({
      entityType: 'document',
      entityId: id,
      entityName: newDoc.title,
      action: 'Загрузка документа',
      newValue: `Номер: ${newDoc.docNumber}`,
      reason: `Привязан к заведению: ${newDoc.establishmentName}`,
    });

    showToast({
      type: 'success',
      title: 'Документ прикреплен',
      message: `Документ "${newDoc.title}" добавлен в реестр.`,
    });
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    showToast({
      type: 'info',
      title: 'Статус заказа изменен',
      message: `Заказ #${orderId} переведен в статус "${status}".`,
    });
  };

  const cancelOrder = (orderId: string, reason: string) => {
    setOrders(prev =>
      prev.map(o =>
        o.id === orderId
          ? { ...o, status: 'cancelled', cancelReason: reason }
          : o
      )
    );
    showToast({
      type: 'warning',
      title: 'Заказ отменен',
      message: `Заказ #${orderId} отменен. Причина: ${reason}`,
    });
  };

  const bumpKdsOrder = (orderId: string) => {
    setOrders(prev =>
      prev.map(o => {
        if (o.id !== orderId) return o;
        let nextStatus: OrderStatus = o.status;
        let station = o.kdsStation;
        if (o.status === 'accepted') {
          nextStatus = 'preparing';
        } else if (o.status === 'preparing') {
          nextStatus = 'ready_for_pickup';
        } else if (o.status === 'ready_for_pickup') {
          nextStatus = 'completed';
        }
        return {
          ...o,
          status: nextStatus,
          actualReadyAt: nextStatus === 'ready_for_pickup' ? new Date().toLocaleTimeString().substring(0, 5) : o.actualReadyAt,
          completedAt: nextStatus === 'completed' ? new Date().toLocaleTimeString().substring(0, 5) : o.completedAt
        };
      })
    );
    showToast({
      type: 'success',
      title: 'KDS 2 Remix: Заказ обновлен',
      message: `Заказ #${orderId} переведен на следующий шаг приготовления.`
    });
  };

  const simulatePwaGuestOrder = (
    establishmentId: string,
    branchId: string,
    items: { name: string; quantity: number; price: number }[],
    tableNumber?: number,
    channel: 'qr_table' | 'qr_takeaway' = 'qr_table'
  ): Order => {
    const est = establishments.find(e => e.id === establishmentId);
    const branch = est?.branches.find(b => b.id === branchId) || est?.branches[0];
    const total = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const commRate = est?.commercialTerms?.commissionRate || 9.5;
    const commAmount = (total * commRate) / 100;
    const netPayout = total - commAmount;
    const orderNum = `#${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(100 + Math.random() * 900)}`;
    const rrn = `RRN-${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      orderNumber: orderNum,
      establishmentId: establishmentId,
      establishmentName: est?.brandName || 'Партнер',
      branchId: branch?.id || branchId,
      branchName: branch?.name || 'Точка',
      channel: channel,
      tableNumber: tableNumber,
      customerName: 'Гость PWA',
      customerPhone: '+7 (999) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(10 + Math.random() * 90) + '-' + Math.floor(10 + Math.random() * 90),
      createdAt: new Date().toLocaleTimeString().substring(0, 5),
      plannedReadyAt: new Date(Date.now() + 10 * 60000).toLocaleTimeString().substring(0, 5),
      items: items.map((it, idx) => ({ id: `it-${idx}`, name: it.name, quantity: it.quantity, price: it.price })),
      totalAmount: total,
      discount: 0,
      platformCommission: Number(commAmount.toFixed(2)),
      netPayoutToPartner: Number(netPayout.toFixed(2)),
      paymentStatus: 'paid',
      paymentMethod: 'sbp',
      acquiringRrn: rrn,
      fiscalReceiptUrl: `https://check.horeca.app/receipt/${rrn}`,
      status: 'accepted',
      kdsStation: 'bar',
      kdsElapsedSec: 10,
      kdsEstimatedPrepMin: 6,
      pickupCode: orderNum.replace('#', ''),
      clientComment: channel === 'qr_table' ? `Стол №${tableNumber || 1}` : 'Навынос',
      internalComment: 'Оплачено через наш СБП-эквайринг, передано в KDS 2 Remix',
      responsibleStaff: 'KDS Router Auto',
      slaBreached: false,
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update branch active orders
    setEstablishments(prev =>
      prev.map(e => {
        if (e.id !== establishmentId) return e;
        return {
          ...e,
          branches: e.branches.map(b =>
            b.id === branchId ? { ...b, activeOrdersCount: b.activeOrdersCount + 1, todayGmv: b.todayGmv + total } : b
          )
        };
      })
    );

    addAuditLog({
      entityType: 'order',
      entityId: newOrder.id,
      entityName: `Заказ ${newOrder.orderNumber}`,
      action: 'Новый заказ из HoReCa Order PWA (СБП)',
      newValue: `Сумма: ${total} ₽, Комиссия агента: ${newOrder.platformCommission} ₽`,
      reason: `Клиент оплатил через наш шлюз СБП, заказ отправлен на KDS ${est?.brandName}`,
    });

    showToast({
      type: 'success',
      title: 'HoReCa Order PWA: Оплата СБП успешна!',
      message: `Заказ ${newOrder.orderNumber} на сумму ${total} ₽ принят и передан в KDS 2 Remix.`
    });

    return newOrder;
  };

  const toggleMenuItemStopList = (establishmentId: string, itemId: string) => {
    setEstablishments(prev =>
      prev.map(e => {
        if (e.id !== establishmentId || !e.menuItems) return e;
        const updatedMenu = e.menuItems.map(item => {
          if (item.id !== itemId) return item;
          const newStop = !item.isStopList;
          showToast({
            type: newStop ? 'warning' : 'success',
            title: newStop ? 'Блюдо поставлено в стоп-лист' : 'Блюдо возвращено в меню',
            message: `"${item.name}" ${newStop ? 'скрыто из PWA и KDS' : 'доступно для заказа'}.`
          });
          return { ...item, isStopList: newStop };
        });
        return { ...e, menuItems: updatedMenu };
      })
    );
  };

  const updatePwaSettings = (establishmentId: string, branchId: string, pwaData: Partial<import('../types').PwaSettings>) => {
    setEstablishments(prev =>
      prev.map(e => {
        if (e.id !== establishmentId) return e;
        return {
          ...e,
          branches: e.branches.map(b => {
            if (b.id !== branchId) return b;
            return {
              ...b,
              pwaSettings: { ...b.pwaSettings, ...pwaData }
            };
          })
        };
      })
    );
    showToast({
      type: 'success',
      title: 'Настройки HoReCa Order PWA сохранены',
      message: 'Изменения витрины и эквайринга применены.'
    });
  };

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);

    addAuditLog({
      entityType: 'system_settings',
      entityId: 'global_config',
      entityName: 'Параметры платформы',
      action: 'Обновление системных настроек',
      newValue: `Базовая комиссия: ${newSettings.platformDefaultCommission}%`,
      reason: 'Изменение политик администратором',
    });

    showToast({
      type: 'success',
      title: 'Настройки платформы обновлены',
      message: 'Все изменения вступили в силу.',
    });
  };

  const resetAllData = () => {
    setEstablishments(INITIAL_ESTABLISHMENTS);
    setApplications(INITIAL_APPLICATIONS);
    setOrders(INITIAL_ORDERS);
    setPayouts(INITIAL_PAYOUTS);
    setRiskCases(INITIAL_RISK_CASES);
    setDocuments(INITIAL_DOCUMENTS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSettings(INITIAL_SETTINGS);
    setCurrentUserState(INITIAL_USERS[0]);
    localStorage.clear();
    showToast({
      type: 'info',
      title: 'Данные сброшены',
      message: 'Загружены исходные демонстрационные данные платформы.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser: setCurrentUserState,
        switchUserRole,
        allUsers: INITIAL_USERS,
        establishments,
        applications,
        orders,
        payouts,
        riskCases,
        documents,
        auditLogs,
        settings,
        activeTab,
        setActiveTab,
        selectedEstablishmentId,
        setSelectedEstablishmentId,
        selectedApplicationId,
        setSelectedApplicationId,
        timePeriod,
        setTimePeriod,
        isGlobalSearchOpen,
        setIsGlobalSearchOpen,
        toasts,
        showToast,
        removeToast,
        navigateTo,
        convertApplicationToEstablishment,
        updateApplicationStatus,
        createApplication,
        updateEstablishment,
        createEstablishment,
        toggleEstablishmentBlock,
        toggleBranchStop,
        createRiskCase,
        applyRiskActions,
        resolveRiskCase,
        adjustPayout,
        approvePayout,
        freezePayout,
        executePayoutPayment,
        calculatePayoutsForPeriod,
        addDocument,
        updateOrderStatus,
        cancelOrder,
        bumpKdsOrder,
        simulatePwaGuestOrder,
        toggleMenuItemStopList,
        updatePwaSettings,
        updateSettings,
        addAuditLog,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
