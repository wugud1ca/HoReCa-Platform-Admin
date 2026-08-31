import { UserRole } from '../types';

export interface RoleMeta {
  role: UserRole;
  title: string;
  badgeColor: string;
  description: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleMeta> = {
  admin: {
    role: 'admin',
    title: 'Администратор',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    description: 'Полный доступ ко всем модулям, блокировкам, финансам, системным настройкам и ролям',
  },
  manager: {
    role: 'manager',
    title: 'Менеджер / Оператор',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Обработка заявок, заведение точек, операционный контроль заказов, инициирование проверок',
  },
  accountant: {
    role: 'accountant',
    title: 'Бухгалтер',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Акты, начисления, сверки, первичные документы, проверка платежных реквизитов',
  },
  financier: {
    role: 'financier',
    title: 'Финансист',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'P&L, управление тарифами, утверждение и заморозка агентских выплат, контроль маржинальности',
  },
  lawyer: {
    role: 'lawyer',
    title: 'Юрист',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    description: 'Юридическая экспертиза, согласование договоров, выставление risk flags, согласование блокировок',
  },
};

export const hasPermission = {
  // Establishments
  canViewEstablishments: (_role: UserRole) => true,
  canCreateEstablishment: (role: UserRole) => role === 'admin' || role === 'manager',
  canEditGeneralData: (role: UserRole) => role === 'admin' || role === 'manager',
  canEditLegalData: (role: UserRole) => role === 'admin' || role === 'lawyer' || role === 'manager',
  canChangeFinancialTerms: (role: UserRole) => role === 'admin' || role === 'financier',
  
  // Applications & Moderation
  canViewApplications: (_role: UserRole) => true,
  canProcessApplication: (role: UserRole) => role === 'admin' || role === 'manager',
  canLegalReviewApplication: (role: UserRole) => role === 'admin' || role === 'lawyer',
  canFinanceReviewApplication: (role: UserRole) => role === 'admin' || role === 'financier' || role === 'accountant',
  canConvertApplicationToEstablishment: (role: UserRole) => role === 'admin' || role === 'manager',

  // Orders
  canViewOrders: (_role: UserRole) => true,
  canManageOrderIssue: (role: UserRole) => role === 'admin' || role === 'manager',

  // Finance & Payouts
  canViewFinance: (role: UserRole) => role === 'admin' || role === 'accountant' || role === 'financier',
  canViewPayouts: (_role: UserRole) => true,
  canAdjustPayout: (role: UserRole) => role === 'admin' || role === 'financier' || role === 'accountant',
  canApprovePayout: (role: UserRole) => role === 'admin' || role === 'financier',
  canExecutePaymentDoc: (role: UserRole) => role === 'admin' || role === 'accountant',

  // Risks & Blocks
  canViewRisks: (_role: UserRole) => true,
  canInitiateRiskCase: (role: UserRole) => role === 'admin' || role === 'manager' || role === 'lawyer' || role === 'financier',
  canApplyRiskStop: (role: UserRole) => role === 'admin' || role === 'lawyer' || role === 'financier',
  canBlockEstablishment: (role: UserRole) => role === 'admin' || role === 'lawyer',
  canUnblockEstablishment: (role: UserRole) => role === 'admin' || role === 'lawyer',

  // Documents
  canViewDocuments: (_role: UserRole) => true,
  canUploadDocuments: (role: UserRole) => role === 'admin' || role === 'manager' || role === 'lawyer' || role === 'accountant',
  canVerifyDocuments: (role: UserRole) => role === 'admin' || role === 'lawyer' || role === 'accountant',

  // Users & Settings
  canManageUsers: (role: UserRole) => role === 'admin',
  canManageSystemSettings: (role: UserRole) => role === 'admin',
  canViewFullAuditLog: (role: UserRole) => role === 'admin',
};
