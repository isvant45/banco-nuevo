import React, { useState, useEffect } from 'react';
import { 
  GameState, 
  BankingDivisionId, 
  CreditApplication, 
  SwiftTransaction, 
  IndividualClient, 
  PosMerchant, 
  PensionFund,
  OtherBankProduct,
  SecondaryMarketSecurity,
  CorporatePayrollAgreement,
  CompetitorId
} from './game/types';
import { INITIAL_GAME_STATE } from './game/initialState';
import { 
  advanceGameMonth, 
  formatHNL, 
  evaluateClientDivisionUpgrade,
  executeExtraordinaryLoanPrepayment,
  recalibrateClientCreditLimit,
  openBchRepoOperation,
  executeInterbankCallDeal,
  createFxForwardContract,
  runMacroStressScenario,
  setAdvisorCreditLimit,
  applyBulkPortfolioAllocation,
  BulkAllocationParams,
  executeSingleClientMoraWaiver,
  executeBulkDivisionMoraWaiver
} from './game/economyEngine';
import { sound } from './game/audioFx';
import { TopExecutiveHUD } from './components/TopExecutiveHUD';
import { OverviewDashboard } from './components/OverviewDashboard';
import { BankingDivisionsTab } from './components/BankingDivisionsTab';
import { ClearingAndPayrollTab } from './components/ClearingAndPayrollTab';
import { CreditOriginationTab } from './components/CreditOriginationTab';
import { TreasuryMarketTab } from './components/TreasuryMarketTab';
import { BoardAndStaffTab } from './components/BoardAndStaffTab';
import { BranchesTab } from './components/BranchesTab';
import { MonthSummaryModal } from './components/MonthSummaryModal';
import { ClientEditModal } from './components/ClientEditModal';
import { Client360Modal } from './components/Client360Modal';
import { PensionFundsView } from './components/PensionFundsView';
import { PosAcquiringView } from './components/PosAcquiringView';
import { CreditRiskDashboard } from './components/CreditRiskDashboard';
import { OperationsAndEfficiencyTab } from './components/OperationsAndEfficiencyTab';
import { ExpertOpinionsTab } from './components/ExpertOpinionsTab';
import { BankingInnovationsTab } from './components/BankingInnovationsTab';
import { FinancialStatementsModal } from './components/FinancialStatementsModal';
import { InterbankPortfolioMarketModal } from './components/InterbankPortfolioMarketModal';
import { BchMoneyDeskView } from './components/BchMoneyDeskView';
import { MonthlyClosingSummaryModal } from './components/MonthlyClosingSummaryModal';
import { FxAndForwardsModal } from './components/FxAndForwardsModal';
import { ClientActionsModal } from './components/ClientActionsModal';
import { StressTestingModal } from './components/StressTestingModal';
import { ProgramsSuite20View } from './components/ProgramsSuite20View';
import { AdvancedOperationsHub } from './components/AdvancedOperationsHub';
import { DividendRankingDashboard } from './components/DividendRankingDashboard';
import { PolicySandboxPanel } from './components/PolicySandboxPanel';
import { StrategicImprovementsHub } from './components/StrategicImprovementsHub';
import { AmlFraudComplianceHub } from './components/AmlFraudComplianceHub';
import { ExecutiveDilemmasModal } from './components/ExecutiveDilemmasModal';
import { restoreGameState } from './game/savedState';

const STORAGE_KEY = 'aureo-bank-sim-state-v5';

export default function App() {
  const [isExecutiveDilemmasModalOpen, setIsExecutiveDilemmasModalOpen] = useState<boolean>(false);
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return restoreGameState(parsed);
      }
    } catch {
      // Ignorar error al parsear storage
    }
    return INITIAL_GAME_STATE;
  });

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  // Modales de Cierre Contable Obligatorio, Mesa de Dinero y Estrés
  const [isMonthlyClosingModalOpen, setIsMonthlyClosingModalOpen] = useState<boolean>(false);
  const [isFxForwardsModalOpen, setIsFxForwardsModalOpen] = useState<boolean>(false);
  const [isStressTestingModalOpen, setIsStressTestingModalOpen] = useState<boolean>(false);

  // Estado del Modal de Acciones Financieras Directas del Cliente
  const [selectedClientForActions, setSelectedClientForActions] = useState<IndividualClient | null>(null);
  const [isClientActionsModalOpen, setIsClientActionsModalOpen] = useState<boolean>(false);

  // Estado del Modal de Edición de Cliente
  const [selectedClientToEdit, setSelectedClientToEdit] = useState<IndividualClient | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState<boolean>(false);

  // Estado del Modal de Expediente 360°
  const [selectedClientFor360, setSelectedClientFor360] = useState<IndividualClient | null>(null);
  const [isClient360ModalOpen, setIsClient360ModalOpen] = useState<boolean>(false);

  // Estado del Modal de Estados Financieros Auditados CNBS
  const [isFinancialsModalOpen, setIsFinancialsModalOpen] = useState<boolean>(false);

  // Estado del Modal de Mercado Interbancario M&A
  const [isInterbankModalOpen, setIsInterbankModalOpen] = useState<boolean>(false);

  // Persistir en cada cambio
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
    } catch {
      // Storage lleno o privado
    }
  }, [gameState]);

  // Avanzar un mes con liquidación obligatoria y apertura de auditoría
  const handleAdvanceMonth = () => {
    sound.playMonthEndBell();
    const updated = advanceGameMonth(gameState);
    setGameState(updated);
    setIsMonthlyClosingModalOpen(true);
  };

  // Operaciones de Mesa de Dinero BCH y Reportos
  const handleOpenRepo = (amountHNL: number, termDays: 7 | 14 | 28, ratePct: number) => {
    const res = openBchRepoOperation(gameState, amountHNL, termDays, ratePct);
    setGameState(res.updatedState);
  };

  // Préstamos Interbancarios Call Money
  const handleExecuteCallDeal = (bankId: CompetitorId, amountHNL: number, direction: 'prestar' | 'pedir_prestado') => {
    const res = executeInterbankCallDeal(gameState, bankId, amountHNL, direction);
    setGameState(res.updatedState);
  };

  // Coberturas Cambiarias Forward USD/HNL
  const handleCreateForward = (
    clientName: string, 
    companyName: string, 
    amountUSD: number, 
    agreedRateHNL: number, 
    termDays: 30 | 60 | 90 | 180
  ) => {
    const res = createFxForwardContract(gameState, clientName, companyName, amountUSD, agreedRateHNL, termDays);
    setGameState(res.updatedState);
  };

  // Acciones Directas del Cliente: Abono a capital y Límite de Crédito
  const handleExtraordinaryPrepayment = (clientId: string, amountHNL: number) => {
    const res = executeExtraordinaryLoanPrepayment(gameState, clientId, amountHNL);
    setGameState(res.updatedState);
  };

  const handleRecalibrateLimit = (clientId: string, newLimitHNL: number, notes: string) => {
    const res = recalibrateClientCreditLimit(gameState, clientId, newLimitHNL, notes);
    setGameState(res.updatedState);
  };

  // Pruebas de Estrés Macroeconómicas CNBS
  const handleRunStressTestScenario = (scenario: 'cafe_remesas' | 'fed_rate_hike' | 'sequia_agro') => {
    const res = runMacroStressScenario(gameState, scenario);
    setGameState(res.updatedState);
  };

  // Reiniciar partida
  const handleResetGame = () => {
    if (window.confirm('¿Deseas reiniciar la simulación de Áureo Bank desde Enero 2026? Se restablecerán todos los valores iniciales y la base de datos de clientes.')) {
      sound.playClick();
      localStorage.removeItem(STORAGE_KEY);
      setGameState(INITIAL_GAME_STATE);
      setActiveTab('overview');
      setShowSummaryModal(false);
    }
  };

  // Actualizar tasas de interés de una división
  const handleUpdateDivisionRates = (divisionId: BankingDivisionId, depositRate: number, lendingRate: number) => {
    setGameState(prev => ({
      ...prev,
      divisions: {
        ...prev.divisions,
        [divisionId]: {
          ...prev.divisions[divisionId],
          avgDepositRate: depositRate,
          avgLendingRate: lendingRate
        }
      }
    }));
  };

  // Abrir modal de edición de cliente
  const handleSelectClientToEdit = (client: IndividualClient) => {
    setSelectedClientToEdit(client);
    setIsClientModalOpen(true);
  };

  // Abrir modal de Expediente 360
  const handleOpenClient360 = (client: IndividualClient) => {
    setSelectedClientFor360(client);
    setIsClient360ModalOpen(true);
  };

  // Guardar modificaciones del cliente y evaluar reclasificación automática
  const handleSaveClient = (updatedClient: IndividualClient) => {
    setGameState(prev => {
      const oldClient = prev.clients.find(c => c.id === updatedClient.id);
      const oldDivId = oldClient?.division || 'personas';
      const newDivId = updatedClient.division;

      const updatedList = prev.clients.map(c => c.id === updatedClient.id ? updatedClient : c);
      
      const newDivisions = { ...prev.divisions };
      // Si cambió de banca por el saldo
      if (oldDivId !== newDivId) {
        newDivisions[oldDivId] = {
          ...newDivisions[oldDivId],
          clientCount: Math.max(0, newDivisions[oldDivId].clientCount - 1),
          totalDeposits: Math.max(0, newDivisions[oldDivId].totalDeposits - (oldClient?.accountBalanceHNL || 0))
        };
        newDivisions[newDivId] = {
          ...newDivisions[newDivId],
          clientCount: newDivisions[newDivId].clientCount + 1,
          totalDeposits: newDivisions[newDivId].totalDeposits + updatedClient.accountBalanceHNL
        };
      }

      return {
        ...prev,
        clients: updatedList,
        divisions: newDivisions
      };
    });
  };

  // Alternar cláusula de Pago Garantizado directamente
  const handleToggleClientGuaranteed = (clientId: string) => {
    sound.playApprovalStamp();
    setGameState(prev => {
      const updatedList = prev.clients.map(c => {
        if (c.id === clientId) {
          return { ...c, guaranteedPayment: !c.guaranteedPayment };
        }
        return c;
      });
      return {
        ...prev,
        clients: updatedList
      };
    });
  };

  // Agregar nuevo cliente a una división
  const handleAddClientToDivision = (divisionId: BankingDivisionId) => {
    const randomId = `CLI-${divisionId.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    const newClient: IndividualClient = {
      id: randomId,
      cif: `CIF-0501-2026-${Math.floor(10000 + Math.random() * 89999)}`,
      name: `Cliente Nuevo ${divisionId.toUpperCase()}`,
      division: divisionId,
      city: 'San Pedro Sula',
      notes: 'Nuevo cliente captado mediante campaña institucional.',
      joinedMonth: 1,
      accountType: 'Cuenta de Ahorro Rendimiento',
      accountBalanceHNL: 35000,
      hasCreditCard: true,
      creditCardBrand: 'Visa Clásica',
      creditCardLimitHNL: 30000,
      creditCardBalanceHNL: 5000,
      hasLoan: false,
      loanType: 'Ninguno',
      loanPrincipalHNL: 0,
      loanBalanceHNL: 0,
      loanMonthlyPaymentHNL: 0,
      loanInterestRateAnnual: 0,
      loanMonthsRemaining: 0,
      guaranteedPayment: true,
      pastDueDays: 0,
      pastDueAmountHNL: 0,
      equifaxScore: 720,
      cnbsCategory: 'I - Normal',
      pensionFundEnrolled: false,
      otherBankProducts: [
        {
          id: `obp-new-${Date.now()}`,
          bankName: 'Banco Ficohsa',
          productType: 'Tarjeta de Crédito',
          balanceHNL: 15000,
          interestRatePct: 42.0,
          details: 'Tarjeta Visa Oro activa en Ficohsa.'
        }
      ]
    };

    setGameState(prev => ({
      ...prev,
      clients: [newClient, ...prev.clients],
      divisions: {
        ...prev.divisions,
        [divisionId]: {
          ...prev.divisions[divisionId],
          clientCount: prev.divisions[divisionId].clientCount + 1,
          totalDeposits: prev.divisions[divisionId].totalDeposits + 35000
        }
      }
    }));
    setSelectedClientToEdit(newClient);
    setIsClientModalOpen(true);
  };

  // Expediente 360: Comprar Préstamo de Banco Rival
  const handleBuyoutRivalLoan = (client: IndividualClient, product: OtherBankProduct, proposedRate: number) => {
    const loanAmount = product.balanceHNL;
    const monthlyPayment = Math.round((loanAmount * (proposedRate / 100 / 12)) / (1 - Math.pow(1 + (proposedRate / 100 / 12), -36)));

    setGameState(prev => {
      const updatedClients = prev.clients.map(c => {
        if (c.id === client.id) {
          const remainingProducts = (c.otherBankProducts || []).filter(p => p.id !== product.id);
          return {
            ...c,
            hasLoan: true,
            loanType: `Compra de Cartera (${product.bankName})`,
            loanPrincipalHNL: (c.loanPrincipalHNL || 0) + loanAmount,
            loanBalanceHNL: (c.loanBalanceHNL || 0) + loanAmount,
            loanMonthlyPaymentHNL: (c.loanMonthlyPaymentHNL || 0) + monthlyPayment,
            loanInterestRateAnnual: proposedRate,
            loanMonthsRemaining: 36,
            guaranteedPayment: true,
            pastDueDays: 0,
            pastDueAmountHNL: 0,
            cnbsCategory: 'I - Normal' as const,
            otherBankProducts: remainingProducts
          };
        }
        return c;
      });

      return {
        ...prev,
        clients: updatedClients,
        financials: {
          ...prev.financials,
          cashAndBCHReserves: prev.financials.cashAndBCHReserves - loanAmount,
          loanPortfolioCurrent: prev.financials.loanPortfolioCurrent + loanAmount
        },
        divisions: {
          ...prev.divisions,
          [client.division]: {
            ...prev.divisions[client.division],
            totalLoans: prev.divisions[client.division].totalLoans + loanAmount
          }
        }
      };
    });
  };

  // Expediente 360: Traslado de Saldo de Tarjeta de Banco Rival (0% interés 12 meses)
  const handleTransferRivalCard = (client: IndividualClient, product: OtherBankProduct) => {
    setGameState(prev => {
      const updatedClients = prev.clients.map(c => {
        if (c.id === client.id) {
          const remainingProducts = (c.otherBankProducts || []).filter(p => p.id !== product.id);
          return {
            ...c,
            hasCreditCard: true,
            creditCardBrand: c.creditCardBrand === 'Sin Tarjeta' ? 'Mastercard Platinum' : c.creditCardBrand,
            creditCardLimitHNL: Math.max(c.creditCardLimitHNL, product.balanceHNL * 1.5),
            creditCardBalanceHNL: c.creditCardBalanceHNL + product.balanceHNL,
            otherBankProducts: remainingProducts
          };
        }
        return c;
      });

      return {
        ...prev,
        clients: updatedClients
      };
    });
  };

  // Expediente 360: Portabilidad de Depósitos / Fondos desde Banco Rival
  const handlePortRivalDeposits = (client: IndividualClient, product: OtherBankProduct) => {
    const depositAmount = product.balanceHNL;
    setGameState(prev => {
      const updatedClients = prev.clients.map(c => {
        if (c.id === client.id) {
          const remainingProducts = (c.otherBankProducts || []).filter(p => p.id !== product.id);
          const newBalance = c.accountBalanceHNL + depositAmount;
          
          // Verificar si sube de división automáticamente (ej. de 45k a 1M)
          const upgradeCheck = evaluateClientDivisionUpgrade(c, newBalance);
          const targetDivision = upgradeCheck.wasUpgraded ? upgradeCheck.upgradedDivision : c.division;

          return {
            ...c,
            division: targetDivision,
            accountBalanceHNL: newBalance,
            otherBankProducts: remainingProducts
          };
        }
        return c;
      });

      return {
        ...prev,
        clients: updatedClients,
        financials: {
          ...prev.financials,
          cashAndBCHReserves: prev.financials.cashAndBCHReserves + depositAmount,
          depositsPublicTotal: prev.financials.depositsPublicTotal + depositAmount
        },
        divisions: {
          ...prev.divisions,
          [client.division]: {
            ...prev.divisions[client.division],
            totalDeposits: prev.divisions[client.division].totalDeposits + depositAmount
          }
        }
      };
    });
  };

  // Reestructuración de Deuda en Mora
  const handleRestructureLoan = (clientId: string) => {
    setGameState(prev => {
      let restructuredBalance = 0;
      const updatedClients = prev.clients.map(c => {
        if (c.id === clientId) {
          restructuredBalance = c.loanBalanceHNL;
          return {
            ...c,
            pastDueDays: 0,
            pastDueAmountHNL: 0,
            cnbsCategory: 'I - Normal' as const,
            guaranteedPayment: true,
            isRestructured: true,
            loanInterestRateAnnual: 12.0
          };
        }
        return c;
      });

      return {
        ...prev,
        clients: updatedClients,
        financials: {
          ...prev.financials,
          loanPortfolioCurrent: prev.financials.loanPortfolioCurrent + restructuredBalance,
          loanPortfolioPastDue: Math.max(0, prev.financials.loanPortfolioPastDue - restructuredBalance)
        }
      };
    });
  };

  // Venta de Cartera en Mora a Banco Competidor con Descuento
  const handleSellNPLToCompetitor = (clientId: string, buyerBank: string, discountPct: number) => {
    setGameState(prev => {
      let debtAmount = 0;
      let clientName = '';
      const updatedClients = prev.clients.map(c => {
        if (c.id === clientId) {
          debtAmount = c.loanBalanceHNL;
          clientName = c.name;
          return {
            ...c,
            hasLoan: false,
            loanBalanceHNL: 0,
            loanMonthlyPaymentHNL: 0,
            pastDueDays: 0,
            pastDueAmountHNL: 0,
            isSoldToRival: true,
            soldToBankName: buyerBank
          };
        }
        return c;
      });

      const cashReceived = Math.round(debtAmount * (discountPct / 100));

      const newNotif = {
        id: `sale-npl-${Date.now()}`,
        month: prev.gameMonth,
        year: prev.bch.year,
        type: 'npl_sale' as const,
        title: `Venta de Cartera Castigada: ${clientName}`,
        message: `Se cedió la cartera de ${formatHNL(debtAmount)} a ${buyerBank} al ${discountPct}% de su valor. Se ingresaron ${formatHNL(cashReceived)} en efectivo a la reserva de caja.`,
        impactSummary: `Liquidez obtenida: +${formatHNL(cashReceived)}`
      };

      return {
        ...prev,
        clients: updatedClients,
        notifications: [newNotif, ...prev.notifications],
        financials: {
          ...prev.financials,
          cashAndBCHReserves: prev.financials.cashAndBCHReserves + cashReceived,
          loanPortfolioPastDue: Math.max(0, prev.financials.loanPortfolioPastDue - debtAmount)
        }
      };
    });
  };

  // Mercado Secundario: Comprar Título o Acción
  const handleBuySecondarySecurity = (securityId: string, units: number) => {
    setGameState(prev => {
      const sec = (prev.secondarySecurities || []).find(s => s.id === securityId);
      if (!sec) return prev;
      const totalCost = units * sec.pricePerUnitHNL;

      const updatedSecurities = prev.secondarySecurities.map(s => {
        if (s.id === securityId) {
          const newUnits = s.ownedUnits + units;
          return {
            ...s,
            ownedUnits: newUnits,
            totalInvestedHNL: newUnits * s.pricePerUnitHNL
          };
        }
        return s;
      });

      return {
        ...prev,
        secondarySecurities: updatedSecurities,
        financials: {
          ...prev.financials,
          cashAndBCHReserves: prev.financials.cashAndBCHReserves - totalCost,
          secondarySecuritiesValueHNL: (prev.financials.secondarySecuritiesValueHNL || 0) + totalCost
        }
      };
    });
  };

  // Mercado Secundario: Vender Título o Acción
  const handleSellSecondarySecurity = (securityId: string, units: number) => {
    setGameState(prev => {
      const sec = (prev.secondarySecurities || []).find(s => s.id === securityId);
      if (!sec) return prev;
      const totalGain = units * sec.pricePerUnitHNL;

      const updatedSecurities = prev.secondarySecurities.map(s => {
        if (s.id === securityId) {
          const newUnits = Math.max(0, s.ownedUnits - units);
          return {
            ...s,
            ownedUnits: newUnits,
            totalInvestedHNL: newUnits * s.pricePerUnitHNL
          };
        }
        return s;
      });

      return {
        ...prev,
        secondarySecurities: updatedSecurities,
        financials: {
          ...prev.financials,
          cashAndBCHReserves: prev.financials.cashAndBCHReserves + totalGain,
          secondarySecuritiesValueHNL: Math.max(0, (prev.financials.secondarySecuritiesValueHNL || 0) - totalGain)
        }
      };
    });
  };

  // Actualizar Límite de Aprobación por Asesor de Crédito (12 a 50)
  const handleUpdateAdvisorLimit = (newLimit: number) => {
    setGameState(prev => ({
      ...prev,
      advisorMonthlyLimitPerAdvisor: newLimit
    }));
  };

  // Actualizar rentabilidad y comisión de fondos de pensiones
  const handleUpdatePensionFundRates = (fundId: string, newReturnPct: number, newFeePct: number) => {
    setGameState(prev => ({
      ...prev,
      pensionFunds: prev.pensionFunds.map(f => {
        if (f.id === fundId) {
          return {
            ...f,
            currentAnnualReturnPct: newReturnPct,
            managementFeePct: newFeePct
          };
        }
        return f;
      })
    }));
  };

  // Otorgar crédito comercial preaprobado a comercio POS
  const handleGrantMerchantLoan = (merchantId: string, loanAmount: number) => {
    setGameState(prev => {
      const updatedMerchants = prev.posMerchants.map(m => {
        if (m.id === merchantId) {
          return {
            ...m,
            hasCommercialLoan: true,
            commercialLoanAmount: loanAmount,
            bankAccountBalanceHNL: m.bankAccountBalanceHNL + loanAmount
          };
        }
        return m;
      });

      return {
        ...prev,
        posMerchants: updatedMerchants,
        financials: {
          ...prev.financials,
          cashAndBCHReserves: prev.financials.cashAndBCHReserves - loanAmount,
          loanPortfolioCurrent: prev.financials.loanPortfolioCurrent + loanAmount
        },
        divisions: {
          ...prev.divisions,
          pyme: {
            ...prev.divisions.pyme,
            totalLoans: prev.divisions.pyme.totalLoans + loanAmount
          }
        }
      };
    });
  };

  // Otorgar tarjeta Visa Empresarial a comercio POS
  const handleGrantMerchantCard = (merchantId: string) => {
    setGameState(prev => ({
      ...prev,
      posMerchants: prev.posMerchants.map(m => {
        if (m.id === merchantId) {
          return { ...m, hasBusinessCard: true };
        }
        return m;
      })
    }));
  };

  // Afiliar nuevo comercio a POS
  const handleAffiliateNewMerchant = (name: string, category: PosMerchant['businessCategory'], city: string) => {
    const newMerchant: PosMerchant = {
      id: `pos-${Date.now().toString().slice(-4)}`,
      merchantName: name,
      businessCategory: category,
      city: city,
      physicalPosCount: 3,
      virtualPosCount: 1,
      hasTapToPay: true,
      monthlySalesVolumeHNL: 1450000,
      bankAccountBalanceHNL: 380000,
      transactionFeePct: 2.2,
      creditEligible: true,
      hasCommercialLoan: false,
      commercialLoanAmount: 0,
      hasBusinessCard: false
    };

    setGameState(prev => ({
      ...prev,
      posMerchants: [newMerchant, ...prev.posMerchants],
      divisions: {
        ...prev.divisions,
        pyme: {
          ...prev.divisions.pyme,
          clientCount: prev.divisions.pyme.clientCount + 1,
          totalDeposits: prev.divisions.pyme.totalDeposits + 380000
        }
      }
    }));
  };

  // Actualizar comisión por transacción POS
  const handleUpdateMerchantFee = (merchantId: string, newFeePct: number) => {
    setGameState(prev => ({
      ...prev,
      posMerchants: prev.posMerchants.map(m => m.id === merchantId ? { ...m, transactionFeePct: newFeePct } : m)
    }));
  };

  // Actualizar empleados y monto de nómina en convenio
  const handleUpdatePayrollAgreement = (agreementId: string, employeeCount: number, monthlyPayrollVolume: number) => {
    setGameState(prev => ({
      ...prev,
      payrollAgreements: prev.payrollAgreements.map(a => {
        if (a.id === agreementId) {
          return {
            ...a,
            employeeCount,
            monthlyPayrollVolume
          };
        }
        return a;
      })
    }));
  };

  // Aprobar solicitud de crédito respetando límite de asesores
  const handleApproveCredit = (applicationId: string) => {
    const app = gameState.pendingApplications.find(a => a.id === applicationId);
    if (!app) return;

    if (gameState.financials.cashAndBCHReserves < app.requestedAmount) {
      sound.playRejectBuzzer();
      alert('Liquidez en caja insuficiente para desembolsar este crédito.');
      return;
    }

    setGameState(prev => {
      const remainingApps = prev.pendingApplications.filter(a => a.id !== applicationId);
      const targetDiv = prev.divisions[app.division];
      const newClient: IndividualClient = {
        id: `CLI-APR-${app.id}`,
        cif: `CIF-0501-2026-${Math.floor(10000 + Math.random() * 89999)}`,
        name: app.applicantName,
        division: app.division,
        city: app.location,
        notes: `Crédito de ${formatHNL(app.requestedAmount)} aprobado de inmediato bajo política delegada.`,
        joinedMonth: prev.gameMonth,
        accountType: 'Cuenta de Ahorro Rendimiento',
        accountBalanceHNL: 0,
        hasCreditCard: true,
        creditCardBrand: 'Visa Clásica',
        creditCardLimitHNL: Math.round(app.monthlyIncome * 1.5),
        creditCardBalanceHNL: 0,
        hasLoan: true,
        loanType: app.productType,
        loanPrincipalHNL: app.requestedAmount,
        loanBalanceHNL: app.requestedAmount,
        loanMonthlyPaymentHNL: Math.round((app.requestedAmount * (app.proposedRate / 100 / 12)) / (1 - Math.pow(1 + (app.proposedRate / 100 / 12), -app.termMonths))),
        loanInterestRateAnnual: app.proposedRate,
        loanMonthsRemaining: app.termMonths,
        guaranteedPayment: true,
        pastDueDays: 0,
        pastDueAmountHNL: 0,
        equifaxScore: app.equifaxScore,
        cnbsCategory: 'I - Normal',
        otherBankProducts: []
      };

      return {
        ...prev,
        clients: [newClient, ...prev.clients],
        pendingApplications: remainingApps,
        advisorApprovalsUsedThisMonth: (prev.advisorApprovalsUsedThisMonth || 0) + 1,
        divisions: {
          ...prev.divisions,
          [app.division]: {
            ...targetDiv,
            totalLoans: targetDiv.totalLoans + app.requestedAmount,
            clientCount: targetDiv.clientCount + 1
          }
        },
        financials: {
          ...prev.financials,
          cashAndBCHReserves: prev.financials.cashAndBCHReserves - app.requestedAmount,
          loanPortfolioCurrent: prev.financials.loanPortfolioCurrent + app.requestedAmount
        }
      };
    });
  };

  // Rechazar solicitud de crédito
  const handleRejectCredit = (applicationId: string) => {
    setGameState(prev => ({
      ...prev,
      pendingApplications: prev.pendingApplications.filter(a => a.id !== applicationId)
    }));
  };

  // Firmar nuevo convenio de planilla corporativa
  const handleSignPayrollAgreement = (agreementId: string) => {
    setGameState(prev => {
      const agreement = prev.payrollAgreements.find(a => a.id === agreementId);
      if (!agreement) return prev;

      return {
        ...prev,
        payrollAgreements: prev.payrollAgreements.map(a => a.id === agreementId ? { ...a, status: 'Activo' } : a),
        divisions: {
          ...prev.divisions,
          personas: {
            ...prev.divisions.personas,
            clientCount: prev.divisions.personas.clientCount + agreement.employeeCount,
            totalDeposits: prev.divisions.personas.totalDeposits + (agreement.monthlyPayrollVolume * 0.4)
          }
        }
      };
    });
  };

  // Actualizar tarifa ACH
  const handleUpdateAchFee = (feeHNL: number) => {
    setGameState(prev => ({
      ...prev,
      clearingHouse: {
        ...prev.clearingHouse,
        achFeePerTransfer: feeHNL
      }
    }));
  };

  // Comprar Bonos BCH en Tesorería
  const handleBuyBCHBond = (amountHNL: number) => {
    setGameState(prev => ({
      ...prev,
      financials: {
        ...prev.financials,
        cashAndBCHReserves: prev.financials.cashAndBCHReserves - amountHNL,
        treasuryBondsBCH: prev.financials.treasuryBondsBCH + amountHNL
      }
    }));
  };

  // Operación Mesa Cambiaria USD
  const handleTradeFX = (action: 'BUY_USD' | 'SELL_USD', amountUSD: number) => {
    const costHNL = amountUSD * gameState.bch.exchangeRateHNLtoUSD;
    setGameState(prev => {
      if (action === 'BUY_USD') {
        return {
          ...prev,
          financials: {
            ...prev.financials,
            cashAndBCHReserves: prev.financials.cashAndBCHReserves - costHNL,
            fxReservesUSDValueInHNL: prev.financials.fxReservesUSDValueInHNL + costHNL
          }
        };
      } else {
        return {
          ...prev,
          financials: {
            ...prev.financials,
            cashAndBCHReserves: prev.financials.cashAndBCHReserves + costHNL,
            fxReservesUSDValueInHNL: Math.max(0, prev.financials.fxReservesUSDValueInHNL - costHNL)
          }
        };
      }
    });
  };

  // Emitir transferencia SWIFT
  const handleSendSwiftTransfer = (newTransfer: Omit<SwiftTransaction, 'id' | 'settlementStatus'>) => {
    const transfer: SwiftTransaction = {
      ...newTransfer,
      id: `SW-2026-${Date.now().toString().slice(-4)}`,
      settlementStatus: 'Liquidado'
    };

    setGameState(prev => ({
      ...prev,
      swiftTransactions: [transfer, ...prev.swiftTransactions],
      financials: {
        ...prev.financials,
        feeIncomeSwiftAndFX: prev.financials.feeIncomeSwiftAndFX + (transfer.feeUSD * prev.bch.exchangeRateHNLtoUSD)
      }
    }));
  };

  // Contratar o Despedir Personal
  const handleModifyStaff = (roleId: string, delta: number) => {
    setGameState(prev => ({
      ...prev,
      staff: prev.staff.map(s => {
        if (s.id === roleId) {
          const newCount = Math.max(1, s.count + delta);
          return { ...s, count: newCount };
        }
        return s;
      })
    }));
  };

  // Ajustar Bono de Director de Junta Directiva
  const handleUpdateBoardBonus = (directorId: string, newBonusHNL: number) => {
    setGameState(prev => ({
      ...prev,
      board: prev.board.map(b => b.id === directorId ? { ...b, annualBonusHNL: newBonusHNL } : b)
    }));
  };

  // Abrir Sucursal
  const handleOpenBranch = (branchId: string) => {
    const branch = gameState.branches.find(b => b.id === branchId);
    if (!branch || branch.isOpen) return;

    if (gameState.financials.cashAndBCHReserves < branch.costToOpen) {
      sound.playRejectBuzzer();
      alert('Liquidez en caja insuficiente para la apertura de esta sucursal.');
      return;
    }

    sound.playApprovalStamp();
    setGameState(prev => {
      const updatedBranches = prev.branches.map(b => b.id === branchId ? { ...b, isOpen: true } : b);
      return {
        ...prev,
        branches: updatedBranches,
        financials: {
          ...prev.financials,
          cashAndBCHReserves: prev.financials.cashAndBCHReserves - branch.costToOpen,
          fixedAssetsBranches: prev.financials.fixedAssetsBranches + branch.costToOpen
        }
      };
    });
  };

  // Modernizar Tecnología
  const handleUpgradeTech = () => {
    const techCost = gameState.digitalTechLevel * 5000000;
    setGameState(prev => ({
      ...prev,
      digitalTechLevel: Math.min(5, prev.digitalTechLevel + 1),
      financials: {
        ...prev.financials,
        cashAndBCHReserves: prev.financials.cashAndBCHReserves - techCost,
        fixedAssetsBranches: prev.financials.fixedAssetsBranches + techCost
      }
    }));
  };

  // Guardar modificaciones o nuevo comercio POS
  const handleSavePosMerchant = (merchant: PosMerchant, isNew: boolean) => {
    sound.playApprovalStamp();
    setGameState(prev => {
      let updatedMerchants = [...prev.posMerchants];
      if (isNew) {
        updatedMerchants = [merchant, ...updatedMerchants];
      } else {
        updatedMerchants = updatedMerchants.map(m => m.id === merchant.id ? merchant : m);
      }
      return {
        ...prev,
        posMerchants: updatedMerchants
      };
    });
  };

  // Guardar modificaciones o nuevo convenio de planilla con cuenta obligatoria
  const handleSavePayrollAgreement = (agreement: CorporatePayrollAgreement, isNew: boolean) => {
    sound.playApprovalStamp();
    setGameState(prev => {
      let updatedAgreements = [...prev.payrollAgreements];
      if (isNew) {
        updatedAgreements = [agreement, ...updatedAgreements];
      } else {
        updatedAgreements = updatedAgreements.map(a => a.id === agreement.id ? agreement : a);
      }
      return {
        ...prev,
        payrollAgreements: updatedAgreements
      };
    });
  };

  // M&A Interbancario: Compra de cartera
  const handleBuyInterbankOffer = (offerId: string) => {
    sound.playCoinClink();
    setGameState(prev => {
      const offer = prev.interbankOffers?.find(o => o.id === offerId);
      if (!offer || prev.financials.cashAndBCHReserves < offer.offerPriceHNL) {
        alert('Fondos insuficientes en reservas de caja para adquirir esta cartera.');
        return prev;
      }
      const newOffers = prev.interbankOffers?.map(o => o.id === offerId ? { ...o, status: 'comprado' as const } : o);
      const isAsset = offer.portfolioType === 'activos_creditos';
      return {
        ...prev,
        interbankOffers: newOffers,
        financials: {
          ...prev.financials,
          cashAndBCHReserves: prev.financials.cashAndBCHReserves - offer.offerPriceHNL,
          loanPortfolioCurrent: isAsset ? prev.financials.loanPortfolioCurrent + offer.faceValueHNL : prev.financials.loanPortfolioCurrent,
          depositsPublicTotal: !isAsset ? prev.financials.depositsPublicTotal + offer.faceValueHNL : prev.financials.depositsPublicTotal
        }
      };
    });
  };

  // Cambiar estrategia de mercadeo
  const handleSetMarketing = (level: GameState['marketingAggressiveness']) => {
    sound.playClick();
    setGameState(prev => ({
      ...prev,
      marketingAggressiveness: level
    }));
  };

  // M&A Interbancario: Venta de cartera propia
  const handleSellOwnPortfolioToBank = (buyerBankId: CompetitorId, portfolioType: 'hipotecaria' | 'pyme_comercial' | 'consumo_mora', faceValueHNL: number) => {
    sound.playCoinClink();
    setGameState(prev => {
      const discountPct = portfolioType === 'consumo_mora' ? 0.35 : portfolioType === 'pyme_comercial' ? 0.08 : 0.03;
      const cashReceived = Math.round(faceValueHNL * (1 - discountPct));
      return {
        ...prev,
        financials: {
          ...prev.financials,
          cashAndBCHReserves: prev.financials.cashAndBCHReserves + cashReceived,
          loanPortfolioCurrent: Math.max(0, prev.financials.loanPortfolioCurrent - faceValueHNL)
        }
      };
    });
  };

  // Innovaciones Bancarias: Pruebas de estrés y operaciones de tesorería
  const handleRunStressTest = (scenario: string) => {
    sound.playWarningChime();
    setGameState(prev => ({
      ...prev,
      innovations: {
        ...(prev.innovations as any),
        stressTesting: {
          lastScenarioRun: scenario,
          simulatedCAR: scenario === 'devaluacion_severa' ? 12.8 : 11.9,
          simulatedLCR: 110.0,
          capitalGapHNL: 0
        }
      }
    }));
  };

  const handleExecuteFxBid = (amountUSD: number) => {
    sound.playCoinClink();
    setGameState(prev => ({
      ...prev,
      innovations: {
        ...(prev.innovations as any),
        fxDesk: {
          ...((prev.innovations as any)?.fxDesk || { openPositionUSD: 7450000, fxSpreadIncomeMonthly: 850000 }),
          bchAuctionBiddedUSD: amountUSD,
          bchAuctionWonUSD: Math.round(amountUSD * 0.8)
        }
      }
    }));
  };

  const handlePlaceCallMoney = (amountHNL: number, isLending: boolean) => {
    sound.playCoinClink();
    setGameState(prev => ({
      ...prev,
      innovations: {
        ...(prev.innovations as any),
        interbankCallMoney: {
          lentAmountHNL: isLending ? amountHNL : 0,
          borrowedAmountHNL: !isLending ? amountHNL : 0,
          callRatePct: prev.bch.tpmRate + 0.5
        }
      }
    }));
  };

  const handleApplyBulkAllocation = (params: BulkAllocationParams) => {
    sound.playApprovalStamp();
    setGameState(prev => {
      const { updatedState } = applyBulkPortfolioAllocation(prev, params);
      return updatedState;
    });
  };

  const handleWaiveClientMora = (client: IndividualClient) => {
    sound.playApprovalStamp();
    setGameState(prev => {
      const { updatedState } = executeSingleClientMoraWaiver(prev, client);
      return updatedState;
    });
    setSelectedClientForActions(prev => prev && prev.id === client.id ? { ...prev, pastDueDays: 0, cnbsCategory: 'I - Normal' } : prev);
  };

  const handleBulkDivisionMoraRelief = (divisionKey: BankingDivisionId) => {
    sound.playApprovalStamp();
    setGameState(prev => {
      const { updatedState } = executeBulkDivisionMoraWaiver(prev, divisionKey);
      return updatedState;
    });
  };

  const handleNegotiateDebtWorkout = (clientId: string, type: 'reestructurar_quitas' | 'ampliar_plazo' | 'dacion_pago') => {
    sound.playApprovalStamp();
    setGameState(prev => {
      const clientInList = prev.clients.find(c => c.id === clientId);
      const targetClient = clientInList || selectedClientForActions;
      if (!targetClient) return prev;

      let updatedTarget: IndividualClient;
      if (type === 'reestructurar_quitas') {
        updatedTarget = {
          ...targetClient,
          cnbsCategory: 'I - Normal' as const,
          pastDueDays: 0,
          pastDueAmountHNL: 0,
          loanBalanceHNL: Math.round(targetClient.loanBalanceHNL * 0.85),
          notes: 'Reestructurado con quita del 15% de intereses moratorios.'
        };
      } else if (type === 'ampliar_plazo') {
        updatedTarget = {
          ...targetClient,
          cnbsCategory: 'I - Normal' as const,
          pastDueDays: 0,
          pastDueAmountHNL: 0,
          loanMonthsRemaining: 36,
          loanMonthlyPaymentHNL: Math.round(targetClient.loanMonthlyPaymentHNL * 0.6),
          notes: 'Plazo extendido a 36 meses reduciendo cuota al 60%.'
        };
      } else {
        updatedTarget = {
          ...targetClient,
          cnbsCategory: 'I - Normal' as const,
          pastDueDays: 0,
          pastDueAmountHNL: 0,
          loanBalanceHNL: 0,
          notes: 'Liquidado mediante dación en pago de garantía hipotecaria/prendaria.'
        };
      }

      const clientExists = prev.clients.some(c => c.id === clientId);
      const updatedClients = clientExists
        ? prev.clients.map(c => c.id === clientId ? updatedTarget : c)
        : [updatedTarget, ...prev.clients];

      const divKey = updatedTarget.division || 'personas';
      const targetDiv = prev.divisions[divKey];
      const updatedDivisions = { ...prev.divisions };
      if (targetDiv) {
        updatedDivisions[divKey] = {
          ...targetDiv,
          delinquencyRate: Math.max(0, +(targetDiv.delinquencyRate * 0.9).toFixed(2))
        };
      }

      const updatedFinancials = {
        ...prev.financials,
        loanPortfolioPastDue: Math.max(0, prev.financials.loanPortfolioPastDue - (targetClient.pastDueAmountHNL || 10000))
      };

      return {
        ...prev,
        clients: updatedClients,
        divisions: updatedDivisions,
        financials: updatedFinancials
      };
    });
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 flex flex-col font-sans">
      {/* Barra Superior HUD Ejecutiva */}
      <TopExecutiveHUD
        state={gameState}
        onAdvanceMonth={handleAdvanceMonth}
        onResetGame={handleResetGame}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenFinancialStatements={() => setIsFinancialsModalOpen(true)}
        onOpenInterbankMarket={() => setIsInterbankModalOpen(true)}
        onOpenMonthlySummary={() => setIsMonthlyClosingModalOpen(true)}
        onOpenFxForwards={() => setIsFxForwardsModalOpen(true)}
        onOpenStressTesting={() => setIsStressTestingModalOpen(true)}
        onOpenExecutiveDilemmas={() => setIsExecutiveDilemmasModalOpen(true)}
      />

      {/* Contenido Principal según la Pestaña Activa */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'overview' && (
          <OverviewDashboard
            state={gameState}
            onSetMarketing={handleSetMarketing}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'aml_compliance' && (
          <AmlFraudComplianceHub
            state={gameState}
            onUpdateState={setGameState}
          />
        )}

        {activeTab === 'dividends' && (
          <DividendRankingDashboard
            state={gameState}
            onUpdateState={setGameState}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'sandbox' && (
          <PolicySandboxPanel
            state={gameState}
            onUpdateState={setGameState}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'strategic_improvements' && (
          <StrategicImprovementsHub
            state={gameState}
            onUpdateState={setGameState}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'advanced_ops' && (
          <AdvancedOperationsHub
            state={gameState}
            onUpdateState={setGameState}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'programs20' && (
          <ProgramsSuite20View
            state={gameState}
            onUpdateState={setGameState}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'bch_money_desk' && (
          <BchMoneyDeskView
            state={gameState}
            onOpenRepo={handleOpenRepo}
            onExecuteCallDeal={handleExecuteCallDeal}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'divisions' && (
          <BankingDivisionsTab
            state={gameState}
            onUpdateRates={handleUpdateDivisionRates}
            onSelectClientToEdit={handleSelectClientToEdit}
            onOpenClient360={handleOpenClient360}
            onToggleClientGuaranteed={handleToggleClientGuaranteed}
            onAddClient={handleAddClientToDivision}
            onOpenClientActions={(c) => {
              setSelectedClientForActions(c);
              setIsClientActionsModalOpen(true);
            }}
            onApplyBulkAllocation={handleApplyBulkAllocation}
            onBulkDivisionMoraRelief={handleBulkDivisionMoraRelief}
            onWaiveSingleClientMora={handleWaiveClientMora}
          />
        )}

        {activeTab === 'pos_acquiring' && (
          <PosAcquiringView
            state={gameState}
            onGrantMerchantLoan={handleGrantMerchantLoan}
            onGrantMerchantCard={handleGrantMerchantCard}
            onAffiliateNewMerchant={handleAffiliateNewMerchant}
            onUpdateMerchantFee={handleUpdateMerchantFee}
            onSaveMerchant={handleSavePosMerchant}
          />
        )}

        {activeTab === 'pension_funds' && (
          <PensionFundsView
            state={gameState}
            onUpdateFundRates={handleUpdatePensionFundRates}
          />
        )}

        {activeTab === 'credit_risk' && (
          <CreditRiskDashboard
            state={gameState}
            onRestructureLoan={handleRestructureLoan}
            onSellNPLToCompetitor={handleSellNPLToCompetitor}
            onNegotiateWorkout={handleNegotiateDebtWorkout}
          />
        )}

        {activeTab === 'clearing' && (
          <ClearingAndPayrollTab
            state={gameState}
            onUpdateAchFee={handleUpdateAchFee}
            onSignPayrollAgreement={handleSignPayrollAgreement}
            onUpdatePayrollAgreement={handleUpdatePayrollAgreement}
            onSavePayrollAgreement={handleSavePayrollAgreement}
          />
        )}

        {activeTab === 'origination' && (
          <CreditOriginationTab
            state={gameState}
            onApproveApplication={handleApproveCredit}
            onRejectApplication={handleRejectCredit}
            onUpdateAdvisorLimit={handleUpdateAdvisorLimit}
            onUpdateAdvisorAmountThreshold={(newThreshold) => {
              setGameState(prev => setAdvisorCreditLimit(prev, newThreshold));
            }}
          />
        )}

        {activeTab === 'treasury' && (
          <TreasuryMarketTab
            state={gameState}
            onBuyBCHBond={handleBuyBCHBond}
            onTradeFX={handleTradeFX}
            onSendSwiftTransfer={handleSendSwiftTransfer}
            onBuySecondarySecurity={handleBuySecondarySecurity}
            onSellSecondarySecurity={handleSellSecondarySecurity}
          />
        )}

        {activeTab === 'operations' && (
          <OperationsAndEfficiencyTab
            gameState={gameState}
            onUpgradeTech={handleUpgradeTech}
          />
        )}

        {activeTab === 'experts' && (
          <ExpertOpinionsTab
            opinions={gameState.expertOpinions || []}
            bch={gameState.bch}
          />
        )}

        {activeTab === 'innovations' && (
          <BankingInnovationsTab
            gameState={gameState}
            onRunStressTest={handleRunStressTest}
            onExecuteFxBid={handleExecuteFxBid}
            onPlaceInterbankCallMoney={handlePlaceCallMoney}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'board_staff' && (
          <BoardAndStaffTab
            state={gameState}
            onModifyStaff={handleModifyStaff}
            onUpdateBoardBonus={handleUpdateBoardBonus}
          />
        )}

        {activeTab === 'branches' && (
          <BranchesTab
            state={gameState}
            onOpenBranch={handleOpenBranch}
            onUpgradeTech={handleUpgradeTech}
          />
        )}
      </main>

      {/* Modal Interactivo de Edición de Cliente */}
      {isClientModalOpen && selectedClientToEdit && (
        <ClientEditModal
          client={selectedClientToEdit}
          isOpen={true}
          onClose={() => setIsClientModalOpen(false)}
          onSave={handleSaveClient}
        />
      )}

      {/* Modal de Expediente 360° y Robo/Captación de Cartera */}
      {isClient360ModalOpen && selectedClientFor360 && (
        <Client360Modal
          client={selectedClientFor360}
          isOpen={true}
          onClose={() => setIsClient360ModalOpen(false)}
          onBuyoutLoan={handleBuyoutRivalLoan}
          onTransferCardBalance={handleTransferRivalCard}
          onPortDeposits={handlePortRivalDeposits}
        />
      )}

      {/* Modal de Estados Financieros Auditados CNBS */}
      {isFinancialsModalOpen && (
        <FinancialStatementsModal
          isOpen={true}
          onClose={() => setIsFinancialsModalOpen(false)}
          financials={gameState.financials}
          bankName="Áureo Bank Honduras S.A."
          gameMonth={gameState.gameMonth}
        />
      )}

      {/* Modal de Mercado Interbancario de Carteras M&A */}
      {isInterbankModalOpen && (
        <InterbankPortfolioMarketModal
          isOpen={true}
          onClose={() => setIsInterbankModalOpen(false)}
          offers={gameState.interbankOffers || []}
          competitors={gameState.competitors}
          availableCashHNL={gameState.financials.cashAndBCHReserves}
          onBuyOffer={handleBuyInterbankOffer}
          onSellOwnPortfolio={handleSellOwnPortfolioToBank}
        />
      )}

      {/* Modal de Cierre Mensual con Boletín BCH */}
      {showSummaryModal && (
        <MonthSummaryModal
          state={gameState}
          onClose={() => setShowSummaryModal(false)}
        />
      )}

      {/* Modal de Cierre Contable Mensual Obligatorio (Auditoría de Cuotas, Límites y Tasas) */}
      {isMonthlyClosingModalOpen && (
        <MonthlyClosingSummaryModal
          isOpen={true}
          onClose={() => setIsMonthlyClosingModalOpen(false)}
          state={gameState}
          onRenegotiateDebt={handleNegotiateDebtWorkout}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* Modal de Subasta de Divisas BCH & Contratos Forward */}
      {isFxForwardsModalOpen && (
        <FxAndForwardsModal
          isOpen={true}
          onClose={() => setIsFxForwardsModalOpen(false)}
          state={gameState}
          onCreateForward={handleCreateForward}
          onTradeFxSpot={handleTradeFX}
        />
      )}

      {/* Modal de Pruebas de Estrés Macroeconómico CNBS */}
      {isStressTestingModalOpen && (
        <StressTestingModal
          isOpen={true}
          onClose={() => setIsStressTestingModalOpen(false)}
          state={gameState}
          onRunStressTest={handleRunStressTestScenario}
        />
      )}

      {/* Modal de Acciones Financieras Directas del Cliente (Abono capital, Límites) */}
      {isClientActionsModalOpen && selectedClientForActions && (
        <ClientActionsModal
          isOpen={true}
          onClose={() => setIsClientActionsModalOpen(false)}
          client={selectedClientForActions}
          onExtraordinaryPrepayment={handleExtraordinaryPrepayment}
          onRecalibrateLimit={handleRecalibrateLimit}
          onRenegotiateDebt={handleNegotiateDebtWorkout}
          onWaiveClientMora={handleWaiveClientMora}
        />
      )}

      {/* Modal de Dilemas Ejecutivos, Éticos y Simulador de Crisis de Directorio */}
      {isExecutiveDilemmasModalOpen && (
        <ExecutiveDilemmasModal
          state={gameState}
          isOpen={true}
          onClose={() => setIsExecutiveDilemmasModalOpen(false)}
          onUpdateState={setGameState}
        />
      )}

      {/* Pie de página institucional */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        Áureo Bank · Simulador educativo de operaciones bancarias en Honduras. No es una entidad financiera real ni está afiliado al BCH o la CNBS.
      </footer>
    </div>
  );
}
