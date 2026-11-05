import React from 'react';
import { sound } from '../../game/audioFx';

interface DailyClosingModalProps {
  isOpen: boolean;
  day: number;
  month: number;
  year: number;
  summary: {
    revenue: number;
    cogs: number;
    operatingCosts: number;
    netProfit: number;
    events: string[];
  } | null;
  onCloseAndContinue: () => void;
}

export const DailyClosingModal: React.FC<DailyClosingModalProps> = ({
  isOpen,
  day,
  month,
  year,
  summary,
  onCloseAndContinue
}) => {
  if (!isOpen || !summary) return null;

  const isProfitable = summary.netProfit >= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#404040] shadow-2xl w-full max-w-lg flex flex-col font-sans text-xs">
        {/* Barra de Título */}
        <div className="bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080] text-white px-2 py-1 flex items-center justify-between select-none border-b border-[#808080]">
          <div className="flex items-center gap-1.5 font-bold">
            <span>📊</span>
            <span>Auditoría de Cierre Diario · Día {day}, Mes {month} ({year})</span>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onCloseAndContinue();
            }}
            className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-[#404040] text-black font-bold text-[10px] flex items-center justify-center hover:bg-[#d4d4d4]"
          >
            ✕
          </button>
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-3 bg-[#f0f0f0]">
          {/* Resultado Neto */}
          <div className={`p-3 border-2 ${
            isProfitable ? 'bg-emerald-50 border-emerald-500 text-emerald-950' : 'bg-red-50 border-red-500 text-red-950'
          }`}>
            <span className="text-[11px] block font-semibold">Resultado Neto de la Jornada:</span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-2xl font-mono font-black">
                {isProfitable ? '+' : ''}L {summary.netProfit.toLocaleString()}
              </span>
              <span className={`px-2 py-0.5 border text-xs font-bold uppercase font-mono ${
                isProfitable ? 'bg-emerald-200 border-emerald-400 text-emerald-900' : 'bg-red-200 border-red-400 text-red-900'
              }`}>
                {isProfitable ? 'Superávit Diario' : 'Déficit Diario'}
              </span>
            </div>
          </div>

          {/* Desglose Contable */}
          <div className="bg-white border border-[#808080] p-3 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between text-slate-800">
              <span>(+) Ingresos Totales (Ventas / Intereses):</span>
              <span className="font-bold text-emerald-700">L {summary.revenue.toLocaleString()}</span>
            </div>
            {summary.cogs > 0 && (
              <div className="flex justify-between text-slate-700">
                <span>(-) Costo de Mercadería Vendida (COGS):</span>
                <span className="text-red-700">L {summary.cogs.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-700">
              <span>(-) Gastos Operativos (Personal / Renta / Bóveda):</span>
              <span className="text-red-700">L {summary.operatingCosts.toLocaleString()}</span>
            </div>
            <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-sm text-slate-900">
              <span>(=) Flujo Neto a Caja:</span>
              <span className={isProfitable ? 'text-emerald-800' : 'text-red-800'}>
                L {summary.netProfit.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Acontecimientos de la jornada */}
          {summary.events.length > 0 && (
            <div className="bg-[#eaeaea] border border-[#a0a0a0] p-2.5">
              <span className="font-bold text-slate-800 block mb-1">Acontecimientos del Día:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-700">
                {summary.events.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Botón de Siguiente Día */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                sound.playMonthEndBell();
                onCloseAndContinue();
              }}
              className="px-5 py-2 bg-[#1084d0] hover:bg-[#000080] text-white font-bold text-xs border-t border-l border-white border-b border-r border-[#000040] shadow-md flex items-center gap-1.5"
            >
              <span>🌅</span>
              <span>Comenzar Siguiente Día Laboral ▶</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
