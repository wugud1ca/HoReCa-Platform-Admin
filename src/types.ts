export type AdminRole = 'super_admin' | 'admin_manager' | 'moderator' | 'support' | 'demo_user';
export type LegacyRole = 'admin' | 'manager' | 'accountant' | 'financier' | 'lawyer';
export type UserRole = AdminRole | LegacyRole;

export type UserStatus = 'active' | 'invited' | 'blocked' | 'archived' | 'inactive' | 'suspended';

export interface InternalUser {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  status: UserStatus;
  isBlocked?: boolean;
  lastLogin?: string;
  lastLoginAt?: string;
  createdAt?: string;
  createdBy?: string;
  team?: string;
  isDemo?: boolean;
  permissions: string[];
}

export type User = InternalUser;

export interface Invite {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  team?: string;
  token: string;
  expiresAt: string; // ISO or string timestamp (e.g. +24h)
  status: 'pending' | 'used' | 'expired' | 'revoked';
  createdBy: string;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  userId: string;
  user: InternalUser;
  issuedAt: string;
  expiresAt: string;
  deviceInfo?: string;
  ip?: string;
  isDemo: boolean;
}

export type AuthScreenMode = 'login' | 'invite_activation' | 'forgot_password' | 'reset_password';

export interface AuthFeatureFlags {
  googleAuthEnabled: boolean;
  magicLinkEnabled: boolean;
  ssoEnabled: boolean;
}

export interface AuthLogEntry {
  id: string;
  timestamp: string;
  event:
    | 'login_success'
    | 'login_failed'
    | 'logout'
    | 'invite_created'
    | 'invite_accepted'
    | 'invite_revoked'
    | 'password_reset'
    | 'password_reset_request'
    | 'role_changed'
    | 'user_blocked'
    | 'user_unblocked'
    | 'demo_access';
  email: string;
  userId?: string;
  ip?: string;
  userAgent?: string;
  details?: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export type EstablishmentStatus =
  | 'draft'               // Черновик
  | 'new_application'    // Новая заявка
  | 'in_review'          // На проверке
  | 'docs_requested'     // Запрошены документы
  | 'legal_review'       // На юридической проверке
  | 'financial_review'   // На финансовой проверке
  | 'approved'           // Одобрено к подключению
  | 'onboarding'         // Подключается
  | 'active'             // Активно
  | 'temporarily_stopped'// Временно приостановлено
  | 'risk_limited'       // Ограничено по риску
  | 'blocked'            // Заблокировано
  | 'terminated'         // Расторгнуто
  | 'archived';          // Архив

export type RiskLevel = 'none' | 'low' | 'medium' | 'high' | 'critical';

export type ServiceFormat = 'counter' | 'table' | 'takeaway' | 'delivery' | 'mixed';
export type EstablishmentType = 'coffee_shop' | 'cafe' | 'restaurant' | 'dark_kitchen' | 'foodcourt' | 'bar' | 'bakery';

export interface KdsTerminal {
  id: string;
  name: string;
  station: 'kitchen' | 'bar' | 'assembly' | 'pickup_display';
  stationType?: string;
  appVersion: string; // 'KDS 2 Remix v2.4.1'
  isOnline: boolean;
  lastPing?: string;
  lastPingAt?: string;
  ipAddress?: string;
  screenOrientation?: 'landscape' | 'portrait';
  soundAlerts?: boolean;
  autoReadyMin?: number;
  activeOrdersCount?: number;
  activeTicketsCount?: number;
}

export interface PwaSettings {
  slug?: string; // e.g. 'surf-coffee-nikolskaya'
  pwaUrl?: string; // 'https://order.horeca.app/surf-coffee-nikolskaya'
  brandColor?: string;
  accentColor?: string;
  logoUrl?: string;
  bannerUrl?: string;
  bannerText?: string;
  welcomeMessage?: string;
  minOrderAmount?: number;
  tipPercentages?: number[];
  tableCount?: number;
  qrTableEnabled?: boolean;
  qrTakeawayEnabled?: boolean;
  isQrOrderingActive?: boolean;
  isTakeawayActive?: boolean;
  isTipsEnabled?: boolean;
  defaultTipPercent?: number;
  guestAuthRequired?: boolean; // phone SMS or instant guest
  acquiringProvider?: string;
  acquiringFeeRate?: number;
  acquiringConfig?: {
    gateway: 'platform_sbp_hub' | 'platform_card_acquiring';
    sbpEnabled: boolean;
    cardEnabled: boolean;
    sbpFeeRate: number; // 0.7% interchange
    agentFiscalizationMode: 'agent_54_fz'; // Наш чек агента с ИНН кафе
  };
}

export interface MenuItem {
  id: string;
  establishmentId: string;
  name: string;
  category: 'coffee' | 'drinks' | 'pastry' | 'breakfast' | 'main' | 'dessert' | string;
  price: number;
  isStopList: boolean;
  prepTimeMin: number;
  station: 'kitchen' | 'bar' | 'assembly' | string;
  kdsStation?: string;
  description?: string;
  imageUrl?: string;
  calories?: number;
  weightGram?: number;
  volumeMl?: number;
}

export interface Branch {
  id: string;
  establishmentId: string;
  name: string;
  address: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  workingHours: string;
  status: 'active' | 'stopped' | 'maintenance';
  isTemporarilyStopped: boolean;
  stopReason?: string;
  serviceChannels: {
    qrTable: boolean;
    qrTakeaway: boolean;
    counterOrder: boolean;
    delivery: boolean;
  };
  activeOrdersCount: number;
  todayGmv: number;
  managerName?: string;
  managerPhone?: string;
  kdsTerminals?: KdsTerminal[];
  pwaSettings?: PwaSettings;
}

export interface BankDetails {
  bik: string;
  bankName: string;
  accountNumber: string;
  corrAccount: string;
  taxSystem: 'OSNO' | 'USN_INCOME' | 'USN_PROFIT' | 'PSN' | 'NPD';
}

export interface CommercialTerms {
  type: 'agent' | 'direct' | 'custom';
  commissionRate: number; // percentage (e.g. 10%)
  fixedFeePerOrder: number; // fixed rub per order (e.g. 5)
  minCommissionMonth: number; // minimum commission in rub (e.g. 3000)
  payoutFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  payoutBasis: 'orders_delivered' | 'calendar_month' | 'act_signed';
  freezePayoutsOnRisk: boolean;
  validFrom: string;
  validTo?: string;
  contractNumber: string;
  contractDate: string;
  contractStatus: 'active' | 'in_signing' | 'expired' | 'terminated';
}

export interface OperationalSettings {
  orderModes: {
    preorder: boolean;
    onSite: boolean;
    takeaway: boolean;
    tableDelivery: boolean;
  };
  pickupMethod: 'order_number' | 'client_name' | 'qr_scanner' | 'pickup_screen' | 'waiter';
  slaPrepTimeMin: number; // minutes
  slaAssemblyTimeMin: number; // minutes
  orderAvailabilityWindows: string; // e.g. "08:00 - 22:00"
  integrations: {
    cashRegister: 'iiko' | 'r_keeper' | 'poster' | '1C_restaurant' | 'custom_api' | 'none';
    crm: boolean;
    acquiring: 'sberbank' | 'tinkoff' | 'yookassa' | 'alfa';
    telegramBot: boolean;
    pushNotifications: boolean;
    smsNotifications: boolean;
  };
  autoStopRules: {
    maxUnprocessedOrders: number;
    maxSlaBreachesPerHour: number;
    stopOnPaymentErrorStreak: number;
  };
}

export interface Establishment {
  id: string;
  status: EstablishmentStatus;
  legalName: string; // Юридическое название (ООО/ИП)
  brandName: string; // Коммерческое/брендовое название
  inn: string;
  kpp?: string;
  ogrn: string;
  type: EstablishmentType;
  serviceFormat: ServiceFormat;
  contactPerson: string;
  phone: string;
  email: string;
  timezone: string;
  region: string;
  city: string;
  registrationDate: string;
  activationDate?: string;
  responsibleManager: string;
  riskStatus: RiskLevel;
  isBlocked: boolean;
  blockReason?: string;
  blockedBy?: string;
  blockedAt?: string;
  isStopOperations: boolean;
  isStopPayouts: boolean;
  bankDetails: BankDetails;
  commercialTerms: CommercialTerms;
  operationalSettings: OperationalSettings;
  branches: Branch[];
  menuItems?: MenuItem[];
  lkCafeAccess?: {
    loginEmail?: string;
    loginUsername?: string;
    kdsAccessPin?: string;
    lastKdsActivity?: string;
    lastLoginAt?: string;
    portalUrl?: string;
    assignedRoles?: string[];
    is2faActive?: boolean;
    kdsStatus?: 'connected' | 'offline' | 'idle';
  };
  internalNotes: string[];
  metrics: {
    totalGmv: number;
    totalOrders: number;
    avgCheck: number;
    platformCommissionEarned: number;
    pendingPayout: number;
    cancelRate: number; // percentage
    slaComplianceRate: number; // percentage
    activeIncidents: number;
  };
}

export type ApplicationStatus =
  | 'new'
  | 'in_verification'
  | 'docs_requested'
  | 'legal_check'
  | 'finance_check'
  | 'approved'
  | 'rejected'
  | 'converted';

export interface OnboardingApplication {
  id: string;
  createdAt: string;
  source: 'website' | 'sales_rep' | 'franchise_portal' | 'partner_referral';
  legalForm: 'OOO' | 'IP' | 'SelfEmployed';
  legalName: string;
  brandName: string;
  inn: string;
  kpp?: string;
  ogrn?: string;
  contactPerson: string;
  phone: string;
  email: string;
  city: string;
  branchCount: number;
  type: EstablishmentType;
  serviceFormat: ServiceFormat;
  status: ApplicationStatus;
  verificationStage: 'primary_check' | 'legal_audit' | 'finance_scoring' | 'ready_to_approve' | 'completed' | 'rejected';
  rejectionReason?: string;
  assignedTo: string;
  decisionDate?: string;
  lawyerNote?: string;
  managerNote?: string;
  foundRisks: string[];
  attachedDocs: {
    id: string;
    title: string;
    type: string;
    verified: boolean;
  }[];
  isDuplicateSuspected?: boolean;
}

export type OrderStatus =
  | 'created'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'completed'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: string[];
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "A-108"
  establishmentId: string;
  establishmentName: string;
  branchId: string;
  branchName: string;
  channel: 'mobile_app' | 'qr_table' | 'qr_takeaway' | 'counter';
  customerName?: string;
  customerPhone?: string;
  tableNumber?: number;
  createdAt: string;
  plannedReadyAt: string;
  actualReadyAt?: string;
  completedAt?: string;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  platformCommission: number;
  netPayoutToPartner: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'sbp' | 'bank_card' | 'apple_pay' | 'cash_counter';
  acquiringRrn?: string; // e.g. "RRN-9948201482"
  fiscalReceiptUrl?: string; // 54-ФЗ Чек Агента
  status: OrderStatus;
  refundStatus?: 'none' | 'partial' | 'full';
  kdsStation?: 'kitchen' | 'bar' | 'assembly';
  kdsElapsedSec?: number;
  kdsEstimatedPrepMin?: number;
  pickupCode?: string;
  clientComment?: string;
  internalComment?: string;
  cancelReason?: string;
  responsibleStaff?: string;
  slaBreached?: boolean;
}

export type FinancialOperationType =
  | 'order_commission'
  | 'partner_payout'
  | 'manual_adjustment'
  | 'penalty'
  | 'subscription_fee'
  | 'refund_reversal';

export interface FinancialOperation {
  id: string;
  type: FinancialOperationType;
  date: string;
  period: string; // e.g. "2026-08"
  establishmentId: string;
  establishmentName: string;
  basis: string; // e.g. "Заказы #1024-1090" or "Штраф за срыв SLA"
  grossAmount: number;
  commission: number;
  vatTax?: number;
  netAmount: number; // К выплате или к списанию
  payoutStatus: 'draft' | 'calculated' | 'under_review' | 'approved' | 'ready_to_pay' | 'paid' | 'frozen_by_risk' | 'cancelled';
  plannedPayoutDate?: string;
  actualPayoutDate?: string;
  actNumber?: string;
  paymentOrderNumber?: string;
  accountantNote?: string;
  financierNote?: string;
}

export interface PartnerPayout {
  id: string;
  establishmentId: string;
  establishmentName: string;
  period: string; // "01.08.2026 - 15.08.2026"
  ordersCount: number;
  totalGmv: number;
  platformFeeRate: number; // %
  platformFeeAmount: number;
  adjustmentsAmount: number; // deductions/penalties or bonuses
  adjustmentsReason?: string;
  finalPayoutAmount: number;
  status: 'draft' | 'calculated' | 'under_review' | 'approved' | 'ready_to_pay' | 'paid' | 'frozen_by_risk' | 'cancelled';
  dueDate: string;
  paidDate?: string;
  paymentDocNumber?: string;
  isFrozen: boolean;
  frozenReason?: string;
  approvals: {
    accountantApproved: boolean;
    financierApproved: boolean;
    adminApproved: boolean;
    approverName?: string;
    approvedAt?: string;
  };
  history: {
    timestamp: string;
    user: string;
    action: string;
    comment?: string;
  }[];
}

export interface RiskCase {
  id: string;
  establishmentId: string;
  establishmentName: string;
  category: 'legal_sanction' | 'tax_risk' | 'high_chargeback' | 'customer_complaints' | 'sla_breach' | 'financial_fraud' | 'license_expired';
  level: RiskLevel;
  detectedAt: string;
  source: 'auto_monitoring' | 'bank_notification' | 'manager_report' | 'legal_audit' | 'tax_service';
  description: string;
  responsibleUser: string;
  recommendedAction: 'warning' | 'stop_payouts' | 'stop_operations' | 'full_block' | 'legal_audit';
  status: 'open' | 'under_investigation' | 'action_applied' | 'resolved' | 'dismissed';
  isStopOperationsApplied: boolean;
  isStopPayoutsApplied: boolean;
  blockedDate?: string;
  blockReason?: string;
  blockedBy?: string;
  unblockedBy?: string;
  lawyerComment?: string;
  financierComment?: string;
}

export interface DocumentItem {
  id: string;
  establishmentId: string;
  establishmentName: string;
  category: 'contract' | 'supplementary_agreement' | 'act' | 'invoice' | 'statutory_document' | 'nda_offer' | 'legal_opinion';
  title: string;
  docNumber: string;
  issueDate: string;
  expiryDate?: string;
  status: 'valid' | 'pending_signature' | 'expired' | 'terminated';
  fileSize: string;
  uploadedBy: string;
  version: number;
  isExpiringSoon?: boolean;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  entityType: 'establishment' | 'application' | 'order' | 'payout' | 'risk_case' | 'document' | 'system_settings' | 'user';
  entityId: string;
  entityName: string;
  action: string; // e.g. "Изменение статуса", "Блокировка заведения", "Корректировка выплаты"
  oldValue?: string;
  newValue?: string;
  reason?: string;
  ipAddress?: string;
}

export interface SystemSettings {
  platformDefaultCommission: number;
  minCommissionRub: number;
  autoStopOrdersThreshold: number;
  autoRiskThresholdScore: number;
  payoutHoldDaysOnRisk: number;
  requireDualApprovalForPayoutOver: number; // e.g. 500,000 rub
  notificationChannels: {
    telegramAlerts: boolean;
    emailAlerts: boolean;
    smsUrgent: boolean;
  };
  taxDefaultSystem: string;
}
