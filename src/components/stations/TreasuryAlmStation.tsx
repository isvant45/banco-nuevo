import React, { useState } from 'react';
import { GameState, SwiftTransaction, CompetitorId } from '../../game/types';
import { BchMoneyDeskView } from '../BchMoneyDeskView';
import { SyndicatedLendingTab } from '../SyndicatedLendingTab';
import { TreasuryAndAlmTab } from '../TreasuryAndAlmTab';
import { CorporateTradeTab } from '../CorporateTradeTab';
import { TreasuryMarketTab } from '../TreasuryMarketTab';
import { sound } from '../../game/audioFx';
import { 
  Building2, 
  Layers, 
  DollarSign, 
  Briefcase, 
  TrendingUp 
} from 'lucide-react';

interface TreasuryAlmStationProps {
  state: GameState;
  initialSubView?: 'bch_money_desk' | 'syndicated_lending' | 'treasury_alm' | 'corporate_trade' | 'secondary_securities';
  onOpenRepo: (amountHNL: number, termDays: 7 | 14 | 28, ratePct: number) => void;
  onExecuteCallDeal: (bankId: CompetitorId, amountHNL: number, direction: 'prestar' | 'pedir_prestado') => void;
  onStructureSyndicatedDeal: (dealId: string, playerRole: 'Lead Arranger' | 'Participant', commitmentHNL?: number) => void;
  onTradeSpotUSD: (amountUSD: number, direction: 'comprar' | 'vender') => void;
  onBuyBchBill: (amountHNL: number, termMonths: number, yieldPct: number) => void;
  onIssueLetterOfCredit: (params: {
    applicantName: string;
    beneficiaryName: string;
    amountUSD: number;
    expiryMonths: number;
    goodsDescription: string;
  }) => void;
  onStructureTrust: (params: {
    trustName: string;
    fiduciaryAssetHNL: number;
    purpose: string;
  }) => void;
  onBuyBCHBond?: (amountHNL: number) => void;
  onTradeFX?: (action: 'BUY_USD' | 'SELL_USD', amountUSD: number) => void;
  onSendSwiftTransfer?: (newTransfer: Omit<SwiftTransaction, 'id' | 'settlementStatus'>) => void;
  onBuySecondarySecurity?: (securityId: string, units: number) => void;
  onSellSecondarySecurity?: (securityId: string, units: number) => void;
  onNavigateTab: (tabId: string) => void;
}

export const TreasuryAlmStation: React.FC<TreasuryAlmStationProps> = ({
  state,
  initialSubView = 'bch_money_desk',
  onOpenRepo,
  onExecuteCallDeal,
  onStructureSyndicatedDeal,
  onTradeSpotUSD,
  onBuyBchBill,
  onIssueLetterOfCredit,
  onStructureTrust,
  onBuyBCHBond,
  onTradeFX,
  onSendSwiftTransfer,
  onBuySecondarySecurity,
  onSellSecondarySecurity,
  onNavigateTab
}) => {
  const [subView, setSubView] = useState<'bch_money_desk' | 'syndicated_lending' | 'treasury_alm' | 'corporate_trade' | 'secondary_securities'>(initialSubView);

  const activeSyndicatedDeals = (state.syndicatedLending?.activeDeals || []).length;
  const isReserveCompliant = state.financials.cashAndBCHReserves >= state.financials.requiredReserveAmount;
  const activeLcCount = (state.lettersOfCredit || []).length;

  const subViews = [
    { 
      id: 'bch_money_desk', 
      label: 'Mesa de Dinero BCH', 
      icon: Building2, 
      count: isReserveCompliant ? 'Encaje 12% OK' : 'Déficit Encaje' 
    },
    { 
      id: 'syndicated_lending', 
      label: 'Préstamos Sindicados', 
      icon: Layers, 
      count: `${activeSyndicatedDeals} Deals JPM` 
    },
    { 
      id: 'treasury_alm', 
      label: 'ALCO & Divisas FX', 
      icon: DollarSign, 
      count: 'Spot & Letras' 
    },
    { 
      id: 'corporate_trade', 
      label: 'Trade Finance & Fideicomisos', 
      icon: Briefcase, 
      count: `${activeLcCount} Cartas Créd.` 
    },
    { 
      id: 'secondary_securities', 
      label: 'Mercado Secundario', 
      icon: TrendingUp, 
      count: 'Bonos SEFIN' 
    }
  ] as const;

  return (
    <div className="space-y-6">
      {/* Selector de Sub-Estación Estilo Bloomberg Terminal */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded">
            ESTACIÓN 3
          </span>
          <span className="text-sm font-semibold text-white">
            Mesa de Dinero, Tesorería ALCO & Banca de Inversión
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
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{v.label}</span>
                <span className="text-[10px] font-mono text-slate-500 ml-0.5">· {v.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Renderizado de la Sub-Estación Seleccionada */}
      {subView === 'bch_money_desk' && (
        <BchMoneyDeskView
          state={state}
          onOpenRepo={onOpenRepo}
          onExecuteCallDeal={onExecuteCallDeal}
          onNavigateTab={onNavigateTab}
        />
      )}

      {subView === 'syndicated_lending' && (
        <SyndicatedLendingTab
          state={state}
          onStructureDeal={onStructureSyndicatedDeal}
        />
      )}

      {subView === 'treasury_alm' && (
        <TreasuryAndAlmTab
          state={state}
          onTradeSpotUSD={onTradeSpotUSD}
          onBuyBchBill={onBuyBchBill}
        />
      )}

      {subView === 'corporate_trade' && (
        <CorporateTradeTab
          state={state}
          onIssueLetterOfCredit={onIssueLetterOfCredit}
          onStructureTrust={onStructureTrust}
        />
      )}

      {subView === 'secondary_securities' && (
        <TreasuryMarketTab
          state={state}
          onBuyBCHBond={onBuyBCHBond || (() => {})}
          onTradeFX={onTradeFX || (() => {})}
          onSendSwiftTransfer={onSendSwiftTransfer || (() => {})}
          onBuySecondarySecurity={onBuySecondarySecurity || (() => {})}
          onSellSecondarySecurity={onSellSecondarySecurity || (() => {})}
        />
      )}
    </div>
  );
};
