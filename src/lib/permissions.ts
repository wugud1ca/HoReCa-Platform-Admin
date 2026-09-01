import { UserRole } from '../types';

export interface RoleMeta {
  role: UserRole;
  title: string;
  badgeColor: string;
  description: string;
  accessLevel: 'full' | 'high' | 'medium' | 'low' | 'demo';
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleMeta> = {
  super_admin: {
    role: 'super_admin',
    title: 'Super Admin / Владелец',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Полный неограниченный доступ ко всем разделам, ролям, модерации кафе, настройкам безопасности и журналам',
    accessLevel: 'full',
  },
  admin: {
    role: 'admin',
    title: 'Super Admin (Владелец)',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Полный доступ ко всем модулям, блокировкам, финансам, системным настройкам и ролям',
    accessLevel: 'full',
  },
  admin_manager: {
    role: 'admin_manager',
    title: 'Admin Manager / Руководитель',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Управление модерацией, просмотр кафе, принятие решений по карточкам заведений, частичный менеджмент команды',
    accessLevel: 'high',
  },
  manager: {
    role: 'manager',
    title: 'Менеджер / Оператор',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Обработка заявок, заведение точек, операционный контроль заказов, инициирование проверок',
    accessLevel: 'high',
  },
  moderator: {
    role: 'moderator',
    title: 'Moderator / Модератор',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Проверка анкет кафе, документов, меню, стоп-листов, статусов публикации, комментарии к карточкам',
    accessLevel: 'medium',
  },
  support: {
    role: 'support',
    title: 'Support / Оператор',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Просмотр карточек, помощь по обращениям, ограниченный доступ без права изменять критичные статусы',
    accessLevel: 'low',
  },
  demo_user: {
    role: 'demo_user',
    title: 'Demo User / Презентация',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Демонстрационный режим с мок-данными: изменения симулируются локально без записи в боевую БД',
    accessLevel: 'demo',
  },
  accountant: {
    role: 'accountant',
    title: 'Бухгалтер',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Акты, начисления, сверки, первичные документы, проверка платежных реквизитов',
    accessLevel: 'medium',
  },
  financier: {
    role: 'financier',
    title: 'Финансист',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description: 'P&L, управление тарифами, утверждение и заморозка агентских выплат, контроль маржинальности',
    accessLevel: 'high',
  },
  lawyer: {
    role: 'lawyer',
    title: 'Юрист',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Юридическая экспертиза, согласование договоров, выставление risk flags, согласование блокировок',
    accessLevel: 'high',
  },
};

// Normalized helper for roles
export const isSuperAdmin = (role: UserRole) => role === 'super_admin' || role === 'admin';
export const isAdminManager = (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'manager';
export const isModerator = (role: UserRole) => isAdminManager(role) || role === 'moderator';
export const isSupport = (role: UserRole) => isModerator(role) || role === 'support';
export const isDemoUser = (role: UserRole) => role === 'demo_user';

export const hasPermission = {
  // Navigation Tabs Visibility
  canAccessTab: (role: UserRole, tabId: string): boolean => {
    switch (tabId) {
      case 'dashboard':
        return true; // All roles can see dashboard
      case 'applications':
      case 'establishments':
      case 'branches':
      case 'orders':
        return true; // All roles can view
      case 'finance':
      case 'payouts':
        return isSuperAdmin(role) || role === 'admin_manager' || role === 'financier' || role === 'accountant' || role === 'demo_user';
      case 'risks':
        return isSuperAdmin(role) || role === 'admin_manager' || role === 'lawyer' || role === 'financier' || role === 'demo_user';
      case 'documents':
        return isSuperAdmin(role) || role === 'admin_manager' || role === 'moderator' || role === 'lawyer' || role === 'accountant' || role === 'demo_user';
      case 'users':
        return isSuperAdmin(role) || role === 'admin_manager' || role === 'demo_user'; // Admin Manager has partial view
      case 'settings':
        return isSuperAdmin(role); // Only Super Admin
      case 'audit':
        return isSuperAdmin(role) || role === 'admin_manager' || role === 'moderator';
      default:
        return true;
    }
  },

  // Alias for tab view
  canViewTab: (role: UserRole, tabId: string): boolean => {
    return hasPermission.canAccessTab(role, tabId);
  },

  // Establishments & Moderation Actions
  canViewEstablishments: (_role: UserRole) => true,
  canCreateEstablishment: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'manager' || role === 'demo_user',
  canModerateEstablishment: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'moderator' || role === 'demo_user',
  canApproveRejectEstablishment: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'demo_user',
  canEditGeneralData: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'moderator' || role === 'manager' || role === 'demo_user',
  canEditLegalData: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'lawyer' || role === 'demo_user',
  canChangeFinancialTerms: (role: UserRole) => isSuperAdmin(role) || role === 'financier' || role === 'demo_user',
  canBlockEstablishment: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'lawyer' || role === 'demo_user',
  canUnblockEstablishment: (role: UserRole) => isSuperAdmin(role) || role === 'lawyer' || role === 'demo_user',

  // Applications
  canViewApplications: (_role: UserRole) => true,
  canProcessApplication: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'moderator' || role === 'manager' || role === 'demo_user',
  canLegalReviewApplication: (role: UserRole) => isSuperAdmin(role) || role === 'lawyer' || role === 'demo_user',
  canFinanceReviewApplication: (role: UserRole) => isSuperAdmin(role) || role === 'financier' || role === 'accountant' || role === 'demo_user',
  canConvertApplicationToEstablishment: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'manager' || role === 'demo_user',

  // Orders
  canViewOrders: (_role: UserRole) => true,
  canManageOrderIssue: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'support' || role === 'manager' || role === 'demo_user',

  // Finance & Payouts
  canViewFinance: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'accountant' || role === 'financier' || role === 'demo_user',
  canViewPayouts: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'accountant' || role === 'financier' || role === 'demo_user',
  canAdjustPayout: (role: UserRole) => isSuperAdmin(role) || role === 'financier' || role === 'accountant' || role === 'demo_user',
  canApprovePayout: (role: UserRole) => isSuperAdmin(role) || role === 'financier' || role === 'demo_user',
  canExecutePaymentDoc: (role: UserRole) => isSuperAdmin(role) || role === 'accountant' || role === 'demo_user',

  // Risks
  canViewRisks: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'lawyer' || role === 'financier' || role === 'demo_user',
  canInitiateRiskCase: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'moderator' || role === 'lawyer' || role === 'financier' || role === 'demo_user',
  canApplyRiskStop: (role: UserRole) => isSuperAdmin(role) || role === 'lawyer' || role === 'financier' || role === 'demo_user',

  // Documents
  canViewDocuments: (_role: UserRole) => true,
  canUploadDocuments: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'moderator' || role === 'lawyer' || role === 'accountant' || role === 'demo_user',
  canVerifyDocuments: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'moderator' || role === 'lawyer' || role === 'accountant' || role === 'demo_user',

  // Employees, Settings, and Audit
  canManageEmployees: (role: UserRole) => isSuperAdmin(role) || role === 'demo_user',
  canManageUsers: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'demo_user',
  canInviteEmployees: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'demo_user',
  canManageSystemSettings: (role: UserRole) => isSuperAdmin(role) || role === 'demo_user',
  canViewFullAuditLog: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'demo_user',
  canViewAuditLogs: (role: UserRole) => isSuperAdmin(role) || role === 'admin_manager' || role === 'moderator' || role === 'demo_user',
};
