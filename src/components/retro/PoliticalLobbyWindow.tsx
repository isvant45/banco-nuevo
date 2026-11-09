import React, { useState } from 'react';
import { DailySimulationState } from '../../game/retroSimTypes';
import {
  donateToPoliticalCampaign,
  enactImportTariffLobby,
  requestTooBigToFailBailout
} from '../../game/tycoonAdvancedEngine';
import { CustomAmountInput } from './CustomAmountInput';

interface PoliticalLobbyWindowProps {
  state: DailySimulationState;
  onUpdateState: (newState: DailySimulationState) => void;
  onClose: () => void;
}

export const PoliticalLobbyWindow: React.FC<PoliticalLobbyWindowProps> = ({
  state,
  onUpdateState,
  onClose
}) => {
  const lobby = state.politicalLobby || {
    campaignDonationsTotalHNL: 0,
    politicalInfluencePoints: 0,
    importTariffActive: false,
    importTariffDaysRemaining: 0,
    subsidiesGrantedHNL: 0,
    tooBigToFailWorkforcePct: 8.5,
    bailoutRequested: false,
    bailoutReceivedHNL: 0,
    governmentRelationsScore: 45
  };

  const [donationAmount, setDonationAmount] = useState<number>(100000);
  const [message, setMessage] = useState<string | null>(null);

  const handleDonate = () => {
    const res = donateToPoliticalCampaign(state, donationAmount);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  const handleEnactTariff = () => {
    const res = enactImportTariffLobby(state);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  const handleBailout = () => {
    const res = requestTooBigToFailBailout(state);
    setMessage(res.message);
    if (res.success) {
      onUpdateState(res.updatedState);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#c0c0c0] text-black font-sans text-xs select-none">
      {/* Top Banner */}
      <div className="bg-[#000080] text-white px-3 py-1 font-bold flex justify-between items-center shadow-inner">
        <span className="flex items-center gap-1.5">
          <span>🏛️</span>
          <span>RELACIONES GUBERNAMENTALES & LOBBY POLÍTICO</span>
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
        {/* Métricas de Influencia */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2">
            <div className="text-[10px] text-gray-500 font-bold">Puntos de Influencia</div>
            <div className="text-lg font-mono font-bold text-blue-900">
              {lobby.politicalInfluencePoints} ⭐
            </div>
            <div className="text-[10px] text-gray-500">1 punto por cada L 50k donados</div>
          </div>

          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2">
            <div className="text-[10px] text-gray-500 font-bold">Donaciones Acumuladas</div>
            <div className="text-lg font-mono font-bold text-gray-900">
              L {lobby.campaignDonationsTotalHNL.toLocaleString()}
            </div>
            <div className="text-[10px] text-gray-500">Financiamiento de campañas</div>
          </div>

          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2">
            <div className="text-[10px] text-gray-500 font-bold">Peso en Empleo Urbano</div>
            <div className="text-lg font-mono font-bold text-purple-900">
              {lobby.tooBigToFailWorkforcePct.toFixed(1)}%
            </div>
            <div className="text-[10px] text-gray-500">Too Big to Fail si ≥ 7.0%</div>
          </div>

          <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-2">
            <div className="text-[10px] text-gray-500 font-bold">Guerra Arancelaria</div>
            <div className="text-lg font-mono font-bold text-green-700">
              {lobby.importTariffActive ? `ACTIVA (${lobby.importTariffDaysRemaining}d)` : 'INACTIVA'}
            </div>
            <div className="text-[10px] text-gray-500">+25% costo a rivales extranjeros</div>
          </div>
        </div>

        {/* Módulo 1: Donaciones Corporativas */}
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <div className="font-bold text-sm text-[#000080] border-b pb-1 mb-2">
            💼 Financiamiento Corporativo de Campañas Electorales
          </div>
          <p className="text-gray-700 mb-2">
            Los grandes directores ejecutivos no solo sobreviven a las leyes; invierten para moldearlas a favor de su grupo empresarial. Canalizar fondos a los comités de campaña otorga acceso directo a ministerios y bancadas del Congreso Nacional.
          </p>

          <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-bold text-gray-700 mb-1">
                Monto de Donación (Lempiras):
              </label>
              <CustomAmountInput
                value={donationAmount}
                onChange={(num) => setDonationAmount(num)}
                maxAmount={state.storeBankBalance}
                label="Aporte al Comité Político"
              />
            </div>
            <button
              onClick={handleDonate}
              disabled={donationAmount <= 0 || donationAmount > state.storeBankBalance}
              className="px-4 py-2 bg-[#000080] text-white hover:bg-blue-900 font-bold border-t-2 border-l-2 border-blue-400 border-b-2 border-r-2 border-black disabled:opacity-50 h-10"
            >
              Donar a la Campaña
            </button>
          </div>
        </div>

        {/* Módulo 2: Decretos de Aranceles (Ataque Legislativo) */}
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <div className="font-bold text-sm text-[#000080] border-b pb-1 mb-2 flex justify-between items-center">
            <span>🛡️ Guerra de Aranceles a la Importación (Coste: 4 Puntos de Influencia)</span>
            <span className={`px-2 py-0.5 text-xs font-bold ${lobby.importTariffActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {lobby.importTariffActive ? 'DECRETO VIGENTE' : 'DISPONIBLE'}
            </span>
          </div>
          <p className="text-gray-700 mb-2">
            Si su empresa cuenta con producción o compras integradas localmente, puede cabildear un arancel del 25% contra materias primas e insumos extranjeros. Esto pulveriza los márgenes operativos de los competidores que dependen de importaciones baratas.
          </p>
          <button
            onClick={handleEnactTariff}
            disabled={lobby.importTariffActive || lobby.politicalInfluencePoints < 4}
            className="w-full py-2 bg-[#c0c0c0] hover:bg-gray-300 font-bold border-t-2 border-l-2 border-white border-b-2 border-r-2 border-black disabled:opacity-50"
          >
            {lobby.importTariffActive
              ? `Aranceles Vigentes (${lobby.importTariffDaysRemaining} días restantes)`
              : `Promover Decreto Arancelario (Requiere 4 Pts - Posee: ${lobby.politicalInfluencePoints})`}
          </button>
        </div>

        {/* Módulo 3: Rescate "Too Big to Fail" */}
        <div className="bg-white border-2 border-t-gray-800 border-l-gray-800 border-b-white border-r-white p-3 shadow-inner">
          <div className="font-bold text-sm text-red-900 border-b pb-1 mb-2 flex justify-between items-center">
            <span>🚨 Rescate de Emergencia del Banco Central ("Too Big to Fail")</span>
            <span className="font-mono text-xs text-purple-900">
              Empleo Urbano: {lobby.tooBigToFailWorkforcePct.toFixed(1)}% / Requerido: 7.0%
            </span>
          </div>
          <p className="text-gray-700 mb-2">
            Cuando una corporación emplea a una porción sustancial de la ciudad o del sector productivo, su quiebra desestabilizaría el indicador nacional de desempleo. En caso de apuro financiero, el Banco Central desembolsará una inyección no reembolsable de L 2,500,000 para salvaguardar la estabilidad social.
          </p>
          <button
            onClick={handleBailout}
            disabled={lobby.bailoutRequested || lobby.tooBigToFailWorkforcePct < 7.0}
            className="w-full py-2 bg-red-800 text-white hover:bg-red-900 font-bold border-t-2 border-l-2 border-red-400 border-b-2 border-r-2 border-black disabled:opacity-50"
          >
            {lobby.bailoutRequested
              ? '✓ Rescate de Emergencia Otorgado Anteriormente (L 2,500,000)'
              : lobby.tooBigToFailWorkforcePct < 7.0
              ? 'No Califica: Requiere representar al menos el 7% del empleo'
              : 'Solicitar Rescate Extraordinario al Banco Central (L 2,500,000)'}
          </button>
        </div>
      </div>
    </div>
  );
};
