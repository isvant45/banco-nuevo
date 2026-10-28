import React, { useState } from 'react';
import { GameState, TradeFinanceLetterOfCredit } from '../game/types';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';
import { 
  Globe, 
  FileCheck, 
  Ship, 
  Building, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Percent,
  Layers
} from 'lucide-react';

interface CorporateTradeTabProps {
  state: GameState;
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
}

export const CorporateTradeTab: React.FC<CorporateTradeTabProps> = ({
  state,
  onIssueLetterOfCredit,
  onStructureTrust
}) => {
  const letters = state.lettersOfCredit || [];
  const fxRate = state.bch.exchangeRateHNLtoUSD;

  // Formulario Carta de Crédito
  const [applicant, setApplicant] = useState<string>('Corporación Ferretera del Sur S.A.');
  const [beneficiary, setBeneficiary] = useState<string>('Caterpillar Financial Services Corp (USA)');
  const [amountUSD, setAmountUSD] = useState<number>(250000);
  const [expiryMonths, setExpiryMonths] = useState<number>(3);
  const [goods, setGoods] = useState<string>('Maquinaria pesada para construcción e infraestructura vial');

  // Formulario Fideicomiso Davivienda style
  const [trustName, setTrustName] = useState<string>('Fideicomiso de Garantía Residencial Las Hadas');
  const [trustAssets, setTrustAssets] = useState<number>(45000000);
  const [trustPurpose, setTrustPurpose] = useState<string>('Aislamiento patrimonial de flujos de preventa inmobiliaria');

  const commissionHNL = Math.round((amountUSD * fxRate) * 0.0075); // 0.75% comisión trimestral

  const handleLcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicant.trim() || amountUSD <= 0) return;
    sound.playApprovalStamp();
    onIssueLetterOfCredit({
      applicantName: applicant,
      beneficiaryName: beneficiary,
      amountUSD,
      expiryMonths,
      goodsDescription: goods
    });
  };

  const handleTrustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trustName.trim() || trustAssets <= 0) return;
    sound.playApprovalStamp();
    onStructureTrust({
      trustName,
      fiduciaryAssetHNL: trustAssets,
      purpose: trustPurpose
    });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs uppercase tracking-wider text-amber-400 font-semibold">
                Banca Corporativa & Comercio Exterior (Trade Finance)
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">Benchmark: Promerica Trade Finance & Davivienda Fiduciaria</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <Globe className="w-6 h-6 text-blue-400" />
              Cartas de Crédito (Trade Finance) & Fideicomisos
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Emisión de cartas de crédito comerciales de importación irrevocables confirmadas por <strong className="text-blue-300">Citibank N.A. New York</strong>, 
              factoraje digital de proveedores y estructuración de patrimonios fiduciarios autónomos de garantía y administración.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-slate-300">
              Red Corresponsal: Citi / JPMorgan / Wells Fargo
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cartas de Crédito Trade Finance */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Ship className="w-4 h-4 text-blue-400" />
              Emisión de Carta de Crédito de Importación (LC)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Instrumento irrevocable confirmado en EE.UU. con comisión trimestral de 0.75%.
            </p>
          </div>

          <form onSubmit={handleLcSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Empresa Importadora (Ordenante)
              </label>
              <input
                type="text"
                value={applicant}
                onChange={(e) => setApplicant(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Beneficiario en el Extranjero (Exportador)
              </label>
              <input
                type="text"
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Monto de la Carta (USD)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="10000"
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(Math.max(1000, Number(e.target.value)))}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Vigencia en Meses
                </label>
                <select
                  value={expiryMonths}
                  onChange={(e) => setExpiryMonths(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value={3}>3 Meses (Estándar)</option>
                  <option value={6}>6 Meses</option>
                  <option value={12}>12 Meses</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Descripción de Mercancías / Embarque
              </label>
              <input
                type="text"
                value={goods}
                onChange={(e) => setGoods(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Equivalente en Lempiras:</span>
                <span className="text-slate-200">{formatHNL(amountUSD * fxRate)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Comisión de Apertura (0.75%):</span>
                <span className="text-amber-300 font-bold">{formatHNL(commissionHNL)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Banco Asesor Confirmador:</span>
                <span className="text-blue-400">Citibank N.A. New York</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow transition flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              Emitir Carta de Crédito Irrevocable
            </button>
          </form>
        </div>

        {/* Fideicomisos de Garantía y Administración */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-400" />
              Estructuración de Fideicomiso de Garantía
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Patrimonio autónomo fiduciario con aislamiento de flujos corporativos.
            </p>
          </div>

          <form onSubmit={handleTrustSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Denominación del Fideicomiso
              </label>
              <input
                type="text"
                value={trustName}
                onChange={(e) => setTrustName(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Activos Fideicomitidos en Garantía (HNL)
              </label>
              <input
                type="number"
                step="1000000"
                min="5000000"
                value={trustAssets}
                onChange={(e) => setTrustAssets(Number(e.target.value))}
                required
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Finalidad Fiduciaria / Objeto
              </label>
              <input
                type="text"
                value={trustPurpose}
                onChange={(e) => setTrustPurpose(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-xs font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Comisión de Estructuración (1.0% Flat):</span>
                <span className="text-amber-300 font-bold">{formatHNL(trustAssets * 0.01)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Honorario Fiduciario Mensual:</span>
                <span className="text-emerald-400 font-bold">L. 35,000.00/mes</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Régimen Jurídico:</span>
                <span className="text-slate-300">Código de Comercio de Honduras</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow transition flex items-center justify-center gap-2"
            >
              <Layers className="w-4 h-4" />
              Constituir Patrimonio Autónomo Fiduciario
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
