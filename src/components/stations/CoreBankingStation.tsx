import React, { useState } from 'react';
import { GameState, IndividualClient, PosMerchant, BankingDivisionId } from '../../game/types';
import { BackToBackLendingTab } from '../BackToBackLendingTab';
import { TermDepositsTab } from '../TermDepositsTab';
import { DemandDepositsTab } from '../DemandDepositsTab';
import { CreditOriginationTab } from '../CreditOriginationTab';
import { BankingDivisionsTab } from '../BankingDivisionsTab';
import { PosAcquiringView } from '../PosAcquiringView';
import { sound } from '../../game/audioFx';
import { 
  CreditCard, 
  Coins, 
  Wallet, 
  UserCheck, 
  Users, 
  Store 
} from 'lucide-react';
import { BulkAllocationParams } from '../../game/economyEngine';

interface CoreBankingStationProps {
  state: GameState;
  initialSubView?: 'back_to_back' | 'term_deposits' | 'demand_accounts' | 'origination' | 'divisions' | 'pos_acquiring';
  onOriginateBackToBack: (params: {
    dpfCertificateId: string;
    type: 'prestamo_garantizado' | 'tarjeta_garantizada';
    coverageRatioPct: number;
    termMonths: number;
    spreadRatePct: number;
  }) => void;
  onPayBackToBack: (facilityId: string, amountHNL?: number) => void;
  onForecloseBackToBack: (facilityId: string) => void;
  onUseCreditCard?: (facilityId: string, chargeAmountHNL: number) => void;
  onCloseCard?: (facilityId: string) => void;
  onIssueTermDeposit: (params: {
    clientName: string;
    clientCif?: string;
    division: BankingDivisionId;
    principalHNL: number;
    termDays: number;
    interestRateAnnualPct: number;
    couponPaymentFrequency: 'mensual' | 'al_vencimiento';
    autoRenew: boolean;
  }) => void;
  onExecuteAch: (params: {
    sourceAccountNumber: string;
    sourceClientName: string;
    destinationBank: 'Banco Atlántida' | 'Banco Ficohsa' | 'BAC Credomatic' | 'Banpaís' | 'Banco de Occidente' | 'Davivienda' | 'Promerica';
    destinationAccount: string;
    recipientName: string;
    amountHNL: number;
    referenceNote: string;
  }) => void;
  onProcessPayroll: (params: {
    companyName: string;
    companyAccountNumber?: string;
    employeeCount: number;
    totalPayrollAmountHNL: number;
    feePerEmployeeHNL?: number;
  }) => void;
  onApproveCredit: (appId: string) => void;
  onRejectCredit: (appId: string) => void;
  onUpdateAdvisorLimit: (limit: number) => void;
  onUpdateAdvisorAmountThreshold: (thresholdHNL: number) => void;
  onUpdateDivisionRates: (divisionId: BankingDivisionId, depositRate: number, lendingRate: number) => void;
  onSelectClientToEdit: (client: IndividualClient) => void;
  onOpenClient360: (client: IndividualClient) => void;
  onToggleClientGuaranteed: (clientId: string) => void;
  onAddClient: (divisionId: BankingDivisionId) => void;
  onOpenClientActions?: (client: IndividualClient) => void;
  onApplyBulkAllocation?: (params: BulkAllocationParams) => void;
  onBulkDivisionMoraRelief?: (divisionId: BankingDivisionId) => void;
  onWaiveSingleClientMora?: (client: IndividualClient) => void;
  onGrantMerchantLoan: (merchantId: string, loanAmount: number) => void;
  onGrantMerchantCard: (merchantId: string) => void;
  onAffiliateNewMerchant: (merchantName: string, category: PosMerchant['businessCategory'], city: string) => void;
  onUpdateMerchantFee: (merchantId: string, newFeePct: number) => void;
  onSaveMerchant?: (merchant: PosMerchant, isNew: boolean) => void;
}

export const CoreBankingStation: React.FC<CoreBankingStationProps> = ({
  state,
  initialSubView = 'back_to_back',
  onOriginateBackToBack,
  onPayBackToBack,
  onForecloseBackToBack,
  onUseCreditCard,
  onCloseCard,
  onIssueTermDeposit,
  onExecuteAch,
  onProcessPayroll,
  onApproveCredit,
  onRejectCredit,
  onUpdateAdvisorLimit,
  onUpdateAdvisorAmountThreshold,
  onUpdateDivisionRates,
  onSelectClientToEdit,
  onOpenClient360,
  onToggleClientGuaranteed,
  onAddClient,
  onOpenClientActions,
  onApplyBulkAllocation,
  onBulkDivisionMoraRelief,
  onWaiveSingleClientMora,
  onGrantMerchantLoan,
  onGrantMerchantCard,
  onAffiliateNewMerchant,
  onUpdateMerchantFee,
  onSaveMerchant
}) => {
  const [subView, setSubView] = useState<'back_to_back' | 'term_deposits' | 'demand_accounts' | 'origination' | 'divisions' | 'pos_acquiring'>(initialSubView);

  const b2bCount = (state.backToBackFacilities || []).length;
  const dpfCount = (state.termDeposits || []).length;
  const demandCount = (state.demandAccounts || []).length;
  const pendingAppsCount = state.pendingApplications.length;
  const totalClients = state.divisions.personas.clientCount;
  const posCount = state.posMerchants.length;

  const subViews = [
    { id: 'back_to_back', label: 'Back-to-Back & Tarjetas', icon: CreditCard, count: `${b2bCount} Fac.` },
    { id: 'term_deposits', label: 'Depósitos a Plazo (DPF)', icon: Coins, count: `${dpfCount} Cert.` },
    { id: 'demand_accounts', label: 'Cuentas Vista & ACH', icon: Wallet, count: `${demandCount} Cuentas` },
    { id: 'origination', label: 'Bandeja de Asesores', icon: UserCheck, count: `${pendingAppsCount} Solicitudes` },
    { id: 'divisions', label: 'Bancas & Cartera 360°', icon: Users, count: `${totalClients.toLocaleString()} Clientes` },
    { id: 'pos_acquiring', label: 'Red Adquirente POS', icon: Store, count: `${posCount} Comercios` }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Selector de Sub-Estación Estilo Bloomberg Terminal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded">
            ESTACIÓN 2
          </span>
          <span className="text-sm font-semibold text-white">
            Core Bancario, Captación & Originación Crediticia
          </span>
        </div>

        {/* Botones de navegación contextual */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {subViews.map((v) => {
            const Icon = v.icon;
            const isActive = subView === v.id;
            return (
              <button
                key={v.id}
                onClick={() => {
                  sound.playClick();
                  setSubView(v.id);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{v.label}</span>
                <span className="text-[10px] font-mono text-slate-500 ml-0.5">· {v.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Renderizado de la Sub-Estación Seleccionada */}
      {subView === 'back_to_back' && (
        <BackToBackLendingTab
          state={state}
          onOriginateFacility={onOriginateBackToBack}
          onPayInstallment={onPayBackToBack}
          onForecloseCollateral={onForecloseBackToBack}
          onNavigateToTermDeposits={() => setSubView('term_deposits')}
          onUseCreditCard={onUseCreditCard}
          onCloseCard={onCloseCard}
        />
      )}

      {subView === 'term_deposits' && (
        <TermDepositsTab
          state={state}
          onIssueCertificate={onIssueTermDeposit}
          onNavigateToBackToBack={() => setSubView('back_to_back')}
        />
      )}

      {subView === 'demand_accounts' && (
        <DemandDepositsTab
          state={state}
          onExecuteAch={onExecuteAch}
          onProcessPayroll={onProcessPayroll}
        />
      )}

      {subView === 'origination' && (
        <CreditOriginationTab
          state={state}
          onApproveApplication={onApproveCredit}
          onRejectApplication={onRejectCredit}
          onUpdateAdvisorLimit={onUpdateAdvisorLimit}
          onUpdateAdvisorAmountThreshold={onUpdateAdvisorAmountThreshold}
        />
      )}

      {subView === 'divisions' && (
        <BankingDivisionsTab
          state={state}
          onUpdateRates={onUpdateDivisionRates}
          onSelectClientToEdit={onSelectClientToEdit}
          onOpenClient360={onOpenClient360}
          onToggleClientGuaranteed={onToggleClientGuaranteed}
          onAddClient={onAddClient}
          onOpenClientActions={onOpenClientActions}
          onApplyBulkAllocation={onApplyBulkAllocation}
          onBulkDivisionMoraRelief={onBulkDivisionMoraRelief}
          onWaiveSingleClientMora={onWaiveSingleClientMora}
        />
      )}

      {subView === 'pos_acquiring' && (
        <PosAcquiringView
          state={state}
          onGrantMerchantLoan={onGrantMerchantLoan}
          onGrantMerchantCard={onGrantMerchantCard}
          onAffiliateNewMerchant={onAffiliateNewMerchant}
          onUpdateMerchantFee={onUpdateMerchantFee}
          onSaveMerchant={onSaveMerchant}
        />
      )}
    </div>
  );
};
