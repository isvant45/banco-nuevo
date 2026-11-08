// ============================================================================
// TIPOS E INTERFACES DEL SISTEMA ERP CORPORATIVO & LIBRO MAYOR
// ============================================================================

export type ErpInvoiceStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface IErpInvoiceInstallment {
  installmentNumber: number;
  dueDateStr: string;
  amountHNL: number;
  isPaid: boolean;
  paidDateStr?: string;
  receiptVoucherId?: string;
}

export interface IErpSupplierInvoice {
  id: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  supplierCategory: 'MERCADERIA' | 'MATERIALES' | 'SERVICIOS' | 'MAQUINARIA' | 'TECNOLOGIA';
  issueDateStr: string;
  dueDateStr: string;
  totalAmountHNL: number;
  paidAmountHNL: number;
  remainingAmountHNL: number;
  status: ErpInvoiceStatus;
  installments: IErpInvoiceInstallment[];
  concept: string;
  taxIncludedHNL: number;
}

export type ErpAccountCategory = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

export interface ILedgerEntry {
  entryId: string;
  timestampStr: string;
  simDay: number;
  simMonth: number;
  simYear: number;
  accountCategory: ErpAccountCategory;
  accountCode: string; // ej: 1101 (Caja), 1102 (Bancos), 2101 (Cuentas por Pagar), 5101 (Costos)
  accountName: string;
  debitHNL: number;
  creditHNL: number;
  concept: string;
  authorizedByRole: 'CONTADOR' | 'GERENTE_FINANCIERO' | 'AUDITOR_INTERNO' | 'DIRECTORIO';
  referenceVoucherId?: string;
}

export interface IErpBranchOffice {
  branchId: string;
  name: string;
  city: 'Tegucigalpa' | 'San Pedro Sula' | 'La Ceiba' | 'Choluteca' | 'Comayagua' | 'Roatán';
  openedDay: number;
  openedMonth: number;
  openedYear: number;
  setupCostHNL: number;
  staffAssigned: number;
  monthlyOperatingCostHNL: number;
  dailySalesBoostHNL: number;
  status: 'OPERATING' | 'EXPANDING' | 'MAINTENANCE';
}

export interface IErpMarketingCampaign {
  id: string;
  name: string;
  channel: 'DIGITAL_ADS' | 'RADIO_PRENSA' | 'VALLAS_BTL' | 'PATROCINIO_DEPORTIVO';
  costHNL: number;
  brandEquityBoost: number;
  dailyRevenueMultiplier: number; // Factor sobre ventas (ej: +8%)
  executedDay: number;
  executedMonth: number;
  executedYear: number;
  durationDays: number;
}

export interface IErpStaffWelfareProgram {
  id: string;
  title: string;
  costMonthlyHNL: number;
  moraleBoostPct: number;
  productivityBoostPct: number;
  isActive: boolean;
  description: string;
}

export interface IErpCorporateState {
  supplierInvoices: IErpSupplierInvoice[];
  generalLedger: ILedgerEntry[];
  branches: IErpBranchOffice[];
  marketingCampaigns: IErpMarketingCampaign[];
  staffWelfarePrograms: IErpStaffWelfareProgram[];
  brandEquityScore: number; // 0 a 100
  employeeMoraleScore: number; // 0 a 100
  taxProvisionAccumulatedHNL: number;
}
