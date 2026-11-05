import React, { useState } from 'react';
import { GameState } from '../game/types';
import { formatHNL, formatPct, getMonthName } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Building2, 
  Store, 
  HardHat, 
  Car, 
  Landmark, 
  ShieldCheck, 
  TrendingUp, 
  Scale, 
  MapPin, 
  Sparkles, 
  Users, 
  DollarSign, 
  BarChart3,
  ChevronRight,
  Vote,
  Coins
} from 'lucide-react';
import { CityBusinessMap } from './CityBusinessMap';
import { SupermarketOperationsView } from './SupermarketOperationsView';
import { RealEstateProjectsView } from './RealEstateProjectsView';
import { VehicleDealershipView } from './VehicleDealershipView';
import { CreditAdvisorNegotiationModal } from './CreditAdvisorNegotiationModal';
import { OverviewDashboard } from './OverviewDashboard';
import { CoreBankingStation } from './stations/CoreBankingStation';
import { TerminalMarketStation } from './stations/TerminalMarketStation';
import { TreasuryAlmStation } from './stations/TreasuryAlmStation';
import { RiskComplianceStation } from './stations/RiskComplianceStation';
import { TechModernizationStation } from './stations/TechModernizationStation';
import { Client360Modal } from './Client360Modal';
import {
  evaluateBankingSegment,
  calculateExplainableCreditScore,
  DEFAULT_SUPERMARKET_CATALOG,
  DEFAULT_INITIAL_CONSTRUCTION_PROJECT,
  DEFAULT_DEALERSHIP_STOCK,
  DEFAULT_INITIAL_COLLATERALS,
  BankingSegment
} from '../game/unifiedEconomyEngine';

interface ModernAppLayoutProps {
  gameState: GameState;
  onAdvanceMonth: () => void;
  onResetGame: () => void;
  onOpenNewGameSetup: () => void;
  onOpenAuditedReport: () => void;
}

export const ModernAppLayout: React.FC<ModernAppLayoutProps> = ({
  gameState,
  onAdvanceMonth,
  onResetGame,
  onOpenNewGameSetup,
  onOpenAuditedReport
}) => {
  // Pestaña principal activa
  const [activeView, setActiveView] = useState<'map' | 'supermarket' | 'construction' | 'dealership' | 'core_banking' | 'terminal_market' | 'treasury' | 'risk_compliance' | 'tech'>('map');

  // Modal de Negociación con Asesor Bancario (Gemini 3.8 Flash)
  const [isNegotiationOpen, setIsNegotiationOpen] = useState<boolean>(false);
  const [negotiatingBankName, setNegotiatingBankName] = useState<string>('Banco Atlántida S.A.');

  // Expediente 360° Modal
  const [selectedClientFor360, setSelectedClientFor360] = useState<any | null>(null);

  // Estados de economía profunda
  const [supermarketStock, setSupermarketStock] = useState(DEFAULT_SUPERMARKET_CATALOG);
  const [dealershipStock, setDealershipStock] = useState(DEFAULT_DEALERSHIP_STOCK);
  const [constructionProject, setConstructionProject] = useState(DEFAULT_INITIAL_CONSTRUCTION_PROJECT);
  const [collaterals, setCollaterals] = useState(DEFAULT_INITIAL_COLLATERALS);

  // Finanzas del Jugador (Tienda/Supermercado)
  const [storeCashHNL, setStoreCashHNL] = useState<number>(3850000);
  const [dailyRevenueHNL, setDailyRevenueHNL] = useState<number>(145000);
  const [monthlySpoilageHNL, setMonthlySpoilageHNL] = useState<number>(18500);

  // Segmentación en 4 bancas
  const monthlySalesEstimate = dailyRevenueHNL * 30;
  const personalNetWorth = storeCashHNL + collaterals.reduce((sum, c) => sum + c.appraisalValueHNL, 0);
  const segmentInfo = evaluateBankingSegment(monthlySalesEstimate, 2, personalNetWorth);
  const currentSegment: BankingSegment = segmentInfo.hasPrivateBanking ? 'privada' : segmentInfo.businessSegment;

  // Score Crediticio Explicable
  const currentDebtEstimate = 850000;
  const creditScore = calculateExplainableCreditScore(
    monthlySalesEstimate,
    currentDebtEstimate,
    42000,
    0,
    true,
    personalNetWorth
  );

  const { name: monthName, year, fullLabel } = getMonthName(gameState.gameMonth);

  // Handlers de Supermercado
  const handleOrderSupermarketStock = (productId: string, units: number) => {
    const prod = supermarketStock.find(p => p.id === productId);
    if (!prod) return;
    const totalCost = units * prod.costPriceHNL;
    setStoreCashHNL(prev => Math.max(0, prev - totalCost));
    setSupermarketStock(prev => prev.map(p => p.id === productId ? { ...p, currentStock: p.currentStock + units } : p));
  };

  const handleAdjustPrice = (productId: string, newPrice: number) => {
    setSupermarketStock(prev => prev.map(p => p.id === productId ? { ...p, sellingPriceHNL: newPrice } : p));
  };

  // Handlers de Construcción & Desembolsos
  const handleAdvanceStage = (projectId: string, investmentHNL: number) => {
    setStoreCashHNL(prev => Math.max(0, prev - investmentHNL));
    setConstructionProject(prev => {
      const curStage = prev.stages[prev.currentStageIndex];
      if (!curStage) return prev;
      const updatedSpent = curStage.spentSoFarHNL + investmentHNL;
      const newPct = Math.min(100, Math.round((updatedSpent / curStage.budgetRequiredHNL) * 100));
      const nextIndex = newPct >= 100 && prev.currentStageIndex < prev.stages.length - 1 ? prev.currentStageIndex + 1 : prev.currentStageIndex;

      const updatedStages = prev.stages.map((s, idx) => idx === prev.currentStageIndex ? {
        ...s,
        spentSoFarHNL: updatedSpent,
        completionPct: newPct,
        inspectionPassed: newPct >= 80
      } : s);

      return {
        ...prev,
        currentStageIndex: nextIndex,
        stages: updatedStages
      };
    });
  };

  const handleDisbursement = (projectId: string, stageNumber: number) => {
    const amount = 2500000;
    setStoreCashHNL(prev => prev + amount);
    setConstructionProject(prev => ({
      ...prev,
      totalDisbursedBankHNL: prev.totalDisbursedBankHNL + amount,
      stages: prev.stages.map(s => s.stageNumber === stageNumber ? { ...s, disbursedByBankHNL: s.disbursedByBankHNL + amount, inspectionPassed: true } : s)
    }));
  };

  const handleSellHousingUnit = (projectId: string) => {
    const unitPrice = constructionProject.unitSalePriceHNL;
    const developerProfit = Math.round(unitPrice * 0.45); // 55% amortiza el crédito constructor del banco
    setStoreCashHNL(prev => prev + developerProfit);
    setConstructionProject(prev => ({
      ...prev,
      unitsSold: Math.min(prev.totalHousingUnits, prev.unitsSold + 1),
      totalDisbursedBankHNL: Math.max(0, prev.totalDisbursedBankHNL - (unitPrice * 0.55))
    }));
  };

  // Handlers de Autolote
  const handleBuyVehicleInventory = (model: string, costHNL: number) => {
    setStoreCashHNL(prev => Math.max(0, prev - costHNL));
    setDealershipStock(prev => [
      {
        id: `veh-${Date.now()}`,
        make: model.split(' ')[0] || 'Toyota',
        model,
        year: 2025,
        condition: 'nuevo',
        mileageKm: 0,
        acquisitionCostHNL: costHNL,
        listPriceHNL: Math.round(costHNL * 1.2),
        monthlyDepreciationHNL: 8000,
        isPledgedInFloorPlan: false
      },
      ...prev
    ]);
  };

  const handleSellVehicleUnit = (vehicleId: string) => {
    const veh = dealershipStock.find(v => v.id === vehicleId);
    if (!veh) return;
    setStoreCashHNL(prev => prev + veh.listPriceHNL);
    setDealershipStock(prev => prev.filter(v => v.id !== vehicleId));
  };

  // Desembolso de Préstamo Aprobado por Asesor Bancario (Gemini)
  const handleDisburseNegotiatedLoan = (amountHNL: number, ratePct: number, termMonths: number, bank: string) => {
    setStoreCashHNL(prev => prev + amountHNL);
    alert(`¡CRÉDITO DESEMBOLSADO! ${bank} acreditó ${formatHNL(amountHNL)} al ${ratePct}% a ${termMonths} meses en tu cuenta corriente.`);
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
      {/* 1. Command Bar & Ticker Macroeconómico BCH/CNBS */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-slate-950 text-lg shadow-md shadow-amber-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                ÁUREO EMPIRES & BANKING TYCOON
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-amber-400 font-semibold">{fullLabel}</span>
              <span className="text-slate-500 font-mono text-[11px]">(Mes {gameState.gameMonth})</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
              <span className="px-2 py-0.2 rounded font-bold font-mono text-[10px] bg-amber-950/80 border border-amber-600/60 text-amber-300">
                Segmento: {currentSegment.toUpperCase()}
              </span>
              <span>·</span>
              <span>Score: <strong className="text-emerald-400">{creditScore.score} pts ({creditScore.rating})</strong></span>
            </div>
          </div>
        </div>

        {/* Indicadores Clave del BCH */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-mono text-slate-300">
          <div>
            <span className="text-slate-400">TPM BCH: </span>
            <strong className="text-blue-300">{formatPct(gameState.bch.tpmRate)}</strong>
          </div>
          <div>
            <span className="text-slate-400">Inflación: </span>
            <strong className="text-amber-300">{formatPct(gameState.bch.interannualInflation)}</strong>
          </div>
          <div>
            <span className="text-slate-400">USD/HNL: </span>
            <strong className="text-emerald-300">L {gameState.bch.exchangeRateHNLtoUSD}</strong>
          </div>
          <div>
            <span className="text-slate-400">Encaje Legal: </span>
            <strong className="text-slate-200">12.0% BCH</strong>
          </div>
        </div>

        {/* Controles de Tiempo y Auditoría */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              onOpenAuditedReport();
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>Auditoría SAR & BCH</span>
          </button>

          <button
            onClick={() => {
              sound.playClick();
              onOpenNewGameSetup();
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Nueva Partida</span>
          </button>

          <button
            onClick={() => {
              sound.playCashChime();
              onAdvanceMonth();
            }}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>▶ Cerrar Mes de Operación</span>
          </button>
        </div>
      </header>

      {/* 2. Barra de Navegación de Estaciones del Mundo Económico */}
      <nav className="bg-slate-900/90 border-b border-slate-800 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs font-mono shrink-0">
        <button
          onClick={() => { sound.playClick(); setActiveView('map'); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'map' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>1. Mapa Urbano & Territorio</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveView('supermarket'); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'supermarket' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>2. Supermercado & Perecederos</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveView('construction'); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'construction' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <HardHat className="w-3.5 h-3.5" />
          <span>3. Constructora & Fases</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveView('dealership'); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'dealership' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Car className="w-3.5 h-3.5" />
          <span>4. Autolote & Flota</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveView('core_banking'); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'core_banking' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>5. Core Bancario (Áureo)</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveView('terminal_market'); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'terminal_market' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>6. Rankings & Rivales</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveView('treasury'); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'treasury' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Coins className="w-3.5 h-3.5" />
          <span>7. Tesorería & Mesa BCH</span>
        </button>

        <button
          onClick={() => { sound.playClick(); setActiveView('risk_compliance'); }}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold transition-colors whitespace-nowrap shrink-0 ${
            activeView === 'risk_compliance' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>8. Riesgo & CNBS</span>
        </button>
      </nav>

      {/* 3. Área de Contenido Principal según Estación */}
      <main className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        {activeView === 'map' && (
          <CityBusinessMap
            currentCityName={gameState.gameSetup?.startingCity || 'San Pedro Sula'}
            onSelectDistrict={(id) => {}}
            onOpenBusinessStation={(st) => {
              if (st === 'retail') setActiveView('supermarket');
              else if (st === 'construction') setActiveView('construction');
              else if (st === 'dealership') setActiveView('dealership');
              else setActiveView('core_banking');
            }}
            onOpenCreditNegotiation={(bank) => {
              setNegotiatingBankName(bank);
              setIsNegotiationOpen(true);
            }}
            playerSegment={currentSegment}
            playerCashHNL={storeCashHNL}
          />
        )}

        {activeView === 'supermarket' && (
          <SupermarketOperationsView
            products={supermarketStock}
            storeCashHNL={storeCashHNL}
            monthlySpoilageHNL={monthlySpoilageHNL}
            dailyRevenueHNL={dailyRevenueHNL}
            onOrderStock={handleOrderSupermarketStock}
            onAdjustPrice={handleAdjustPrice}
            onOpenCreditNegotiation={() => {
              setNegotiatingBankName('Banco Ficohsa S.A.');
              setIsNegotiationOpen(true);
            }}
          />
        )}

        {activeView === 'construction' && (
          <RealEstateProjectsView
            project={constructionProject}
            developerCashHNL={storeCashHNL}
            onAdvanceStageProgress={handleAdvanceStage}
            onRequestDisbursement={handleDisbursement}
            onSellHousingUnit={handleSellHousingUnit}
            onOpenCreditNegotiation={() => {
              setNegotiatingBankName('Banco Atlántida S.A.');
              setIsNegotiationOpen(true);
            }}
          />
        )}

        {activeView === 'dealership' && (
          <VehicleDealershipView
            vehicles={dealershipStock}
            dealershipCashHNL={storeCashHNL}
            onBuyVehicleInventory={handleBuyVehicleInventory}
            onSellVehicleUnit={handleSellVehicleUnit}
            onOpenCreditNegotiation={() => {
              setNegotiatingBankName('BAC Credomatic');
              setIsNegotiationOpen(true);
            }}
          />
        )}

        {activeView === 'core_banking' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Core Bancario & Captación Institucional</h3>
                <p className="text-xs text-slate-400">Control de Depósitos, Bóveda, Encaje Legal 12% y Cartera de Crédito Áureo</p>
              </div>
              <span className="text-xs font-mono px-3 py-1 bg-blue-950 border border-blue-800 text-blue-300 rounded-lg">
                CAR CNBS: {formatPct(gameState.financials.capitalAdequacyRatioCAR)}
              </span>
            </div>
            <OverviewDashboard 
              state={gameState} 
              onSetMarketing={() => {}} 
              onNavigateTab={() => {}} 
            />
          </div>
        )}

        {activeView === 'terminal_market' && (
          <TerminalMarketStation
            state={gameState}
            onClaimCampaignReward={() => {}}
            onExecuteMarketOffensive={() => {}}
            onSetMarketing={() => {}}
            onNavigateToTab={() => {}}
          />
        )}

        {activeView === 'treasury' && (
          <TreasuryAlmStation
            state={gameState}
            onOpenRepo={() => {}}
            onExecuteCallDeal={() => {}}
            onStructureSyndicatedDeal={() => {}}
            onTradeSpotUSD={() => {}}
            onBuyBchBill={() => {}}
            onIssueLetterOfCredit={() => {}}
            onStructureTrust={() => {}}
            onNavigateTab={(tab) => console.log('Navigate tab:', tab)}
          />
        )}

        {activeView === 'risk_compliance' && (
          <RiskComplianceStation
            state={gameState}
            onRestructureLoan={() => {}}
            onSellNPLToCompetitor={() => {}}
            onUpdateState={() => {}}
            onNavigateTab={() => {}}
          />
        )}
      </main>

      {/* Modal de Negociación Crediticia con Asesor Gemini */}
      <CreditAdvisorNegotiationModal
        isOpen={isNegotiationOpen}
        onClose={() => setIsNegotiationOpen(false)}
        bankName={negotiatingBankName}
        segment={currentSegment}
        monthlySales={monthlySalesEstimate}
        currentDebt={currentDebtEstimate}
        creditScore={creditScore}
        collaterals={collaterals}
        onDisburseLoan={handleDisburseNegotiatedLoan}
      />

      {/* Modal Expediente 360° */}
      {selectedClientFor360 && (
        <Client360Modal
          client={selectedClientFor360}
          isOpen={!!selectedClientFor360}
          onClose={() => setSelectedClientFor360(null)}
          onBuyoutLoan={() => {}}
          onTransferCardBalance={() => {}}
          onPortDeposits={() => {}}
        />
      )}
    </div>
  );
};
