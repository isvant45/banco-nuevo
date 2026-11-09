import React, { useState } from 'react';
import { DailySimulationState } from '../../game/retroSimTypes';

interface TwitHNWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
}

export const TwitHNWindow: React.FC<TwitHNWindowProps> = ({
  state,
  onUpdateState,
  onClose
}) => {
  const pr = state.publicRelations || {
    esgScore: 72,
    carbonNeutralCertified: false,
    boycottActive: false,
    boycottDaysRemaining: 0,
    prCampaignActive: false,
    prCampaignBudgetDailyHNL: 0,
    tweets: []
  };

  const [campaignBudget, setCampaignBudget] = useState<number>(15000);
  const [message, setMessage] = useState<string | null>(null);

  const handleTogglePrCampaign = () => {
    const isActivating = !pr.prCampaignActive;
    const updatedState = {
      ...state,
      publicRelations: {
        ...pr,
        prCampaignActive: isActivating,
        prCampaignBudgetDailyHNL: isActivating ? campaignBudget : 0
      }
    };
    onUpdateState(updatedState);
    setMessage(isActivating
      ? `¡Campaña de Relaciones Públicas Desplegada! Se invertirán L ${campaignBudget.toLocaleString()} diarios en medios y líderes de opinión para subir el ESG y calmar boicots.`
      : 'Campaña de imagen suspendida.');
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-xs select-none">
      {/* Top Banner */}
      <div className="bg-[#1DA1F2] text-white px-3 py-1 font-bold flex justify-between items-center shadow-inner">
        <span className="flex items-center gap-1.5">
          <span>🐦</span>
          <span>TwitHN 2000 — Red Social & Opinión Pública en Tiempo Real</span>
        </span>
        <button
          onClick={onClose}
          className="bg-[#c0c0c0] text-black hover:bg-red-600 hover:text-white px-1.5 py-0.5 font-bold border-t border-l border-white border-b-2 border-r-2 border-black"
        >
          ✕
        </button>
      </div>

      {message && (
        <div className="m-2 p-2 bg-yellow-100 border border-yellow-700 text-yellow-900 text-xs font-semibold">
          {message}
        </div>
      )}

      <div className="p-3 flex-1 overflow-y-auto space-y-3">
        {/* Panel de Métricas ESG & Boicot */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2.5">
            <div className="text-[10px] text-gray-500 font-bold">Índice ESG (Ética & Gobernanza)</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className={`text-2xl font-mono font-bold ${pr.esgScore >= 70 ? 'text-green-700' : pr.esgScore >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                {pr.esgScore} / 100
              </span>
              <span className="text-[10px] text-gray-500">
                {pr.esgScore >= 70 ? 'Excelente reputación' : 'Riesgo de boicot'}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-2 border border-gray-400 mt-1.5">
              <div
                className={`h-full ${pr.esgScore >= 70 ? 'bg-green-600' : pr.esgScore >= 40 ? 'bg-yellow-500' : 'bg-red-600'}`}
                style={{ width: `${pr.esgScore}%` }}
              />
            </div>
          </div>

          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2.5">
            <div className="text-[10px] text-gray-500 font-bold">Estado de Boicot Ciudadano</div>
            <div className="mt-1">
              {pr.boycottActive ? (
                <div className="text-red-700 font-bold text-sm flex items-center gap-1">
                  <span>🚨 BOICOT ACTIVO</span>
                  <span className="text-xs">({pr.boycottDaysRemaining} días)</span>
                </div>
              ) : (
                <div className="text-green-700 font-bold text-sm">✓ Ningún boicot en curso</div>
              )}
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              {pr.boycottActive ? 'Clientes de clase media/alta rechazan tus productos' : 'Ventas estables sin penalización'}
            </div>
          </div>

          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2.5">
            <div className="text-[10px] text-gray-500 font-bold">Campaña de Relaciones Públicas</div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-bold text-xs text-blue-900">
                {pr.prCampaignActive ? `ACTIVA (L ${pr.prCampaignBudgetDailyHNL.toLocaleString()}/d)` : 'INACTIVA'}
              </span>
              <button
                onClick={handleTogglePrCampaign}
                className="px-2 py-1 bg-[#c0c0c0] hover:bg-gray-300 font-bold text-[10px] border-t border-l border-white border-b-2 border-r-2 border-black"
              >
                {pr.prCampaignActive ? 'Pausar' : 'Activar Campaña'}
              </button>
            </div>
            <div className="text-[10px] text-gray-500 mt-1">
              Inyecta +2 puntos ESG diarios
            </div>
          </div>
        </div>

        {/* Feed de Tweets Simulados */}
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <div className="font-bold text-xs text-gray-700 border-b pb-1.5 mb-2 flex justify-between items-center">
            <span>🔥 Tendencias en Honduras: #AureoBank #SAR #HuelgaGeneral #PreciosCanasta</span>
            <span className="text-[10px] text-gray-500 font-mono">En vivo</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto">
            {pr.tweets.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                No hay publicaciones registradas aún en la red.
              </div>
            ) : (
              pr.tweets.map(tw => (
                <div
                  key={tw.id}
                  className="p-2.5 bg-gray-50 border border-gray-300 flex items-start gap-2.5 hover:bg-blue-50 transition-colors"
                >
                  <span className="text-2xl p-1 bg-white border border-gray-200 rounded">{tw.avatar}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-gray-900">{tw.authorName}</span>
                      <span className="text-gray-500 text-[10px]">{tw.handle}</span>
                      <span className="text-gray-400 text-[10px]">• Día {tw.simDay}</span>
                      <span className={`ml-auto px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                        tw.sentiment === 'positivo' ? 'bg-green-100 text-green-800' :
                        tw.sentiment === 'negativo' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {tw.sentiment}
                      </span>
                    </div>

                    <p className="text-xs text-gray-800 mt-1 leading-snug">
                      {tw.content}
                    </p>

                    <div className="flex gap-4 text-[10px] text-gray-500 mt-2 font-mono">
                      <span>🔁 {tw.retweets}</span>
                      <span>❤️ {tw.likes}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
