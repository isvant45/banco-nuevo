import React, { useState } from 'react';
import { 
  Building2, 
  Store, 
  HardHat, 
  Car, 
  MapPin, 
  Landmark, 
  Users, 
  TrendingUp, 
  Percent, 
  Eye, 
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { formatHNL, formatPct } from '../game/economyEngine';
import { sound } from '../game/audioFx';

export interface CityDistrict {
  id: string;
  name: string;
  zoneType: 'comercial' | 'financiero' | 'residencial' | 'industrial';
  populationTraffic: number; // Clientes potenciales diarios
  averageIncomeLevel: 'Alto' | 'Medio-Alto' | 'Medio' | 'Popular';
  rentIndexHNL: number;
  businessesPresent: {
    id: string;
    name: string;
    type: 'jugador_tienda' | 'jugador_supermercado' | 'jugador_constructora' | 'jugador_autolote' | 'rival_supermercado' | 'banco_sucursal';
    brandColor: string;
    revenueSharePct: number;
  }[];
}

interface CityBusinessMapProps {
  currentCityName: string;
  onSelectDistrict: (districtId: string) => void;
  onOpenBusinessStation: (stationType: 'retail' | 'construction' | 'dealership' | 'banking') => void;
  onOpenCreditNegotiation: (bankName: string) => void;
  playerSegment: string;
  playerCashHNL: number;
}

export const CityBusinessMap: React.FC<CityBusinessMapProps> = ({
  currentCityName = 'San Pedro Sula',
  onSelectDistrict,
  onOpenBusinessStation,
  onOpenCreditNegotiation,
  playerSegment,
  playerCashHNL
}) => {
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('dist_circunvalacion');

  const districts: CityDistrict[] = [
    {
      id: 'dist_circunvalacion',
      name: 'Avenida Circunvalación & Zona Rosa',
      zoneType: 'comercial',
      populationTraffic: 42000,
      averageIncomeLevel: 'Alto',
      rentIndexHNL: 35000,
      businessesPresent: [
        { id: 'b_01', name: 'Supermercado Central Áureo', type: 'jugador_supermercado', brandColor: '#10B981', revenueSharePct: 28 },
        { id: 'b_02', name: 'Supermercados La Colonia', type: 'rival_supermercado', brandColor: '#DC2626', revenueSharePct: 44 },
        { id: 'b_03', name: 'Banco Ficohsa - Sucursal Principal', type: 'banco_sucursal', brandColor: '#003882', revenueSharePct: 15 },
        { id: 'b_04', name: 'Autolote Premium San Pedro', type: 'jugador_autolote', brandColor: '#8B5CF6', revenueSharePct: 13 }
      ]
    },
    {
      id: 'dist_centro_financiero',
      name: 'Distrito Financiero Central (Parque Central)',
      zoneType: 'financiero',
      populationTraffic: 68000,
      averageIncomeLevel: 'Medio-Alto',
      rentIndexHNL: 48000,
      businessesPresent: [
        { id: 'b_05', name: 'Banco Atlántida - Sede Histórica', type: 'banco_sucursal', brandColor: '#c4121a', revenueSharePct: 35 },
        { id: 'b_06', name: 'BAC Credomatic Centro', type: 'banco_sucursal', brandColor: '#e30613', revenueSharePct: 30 },
        { id: 'b_07', name: 'Banco de Occidente Plaza', type: 'banco_sucursal', brandColor: '#006837', revenueSharePct: 22 },
        { id: 'b_08', name: 'Minimarket San Pedro (Inicial)', type: 'jugador_tienda', brandColor: '#F59E0B', revenueSharePct: 13 }
      ]
    },
    {
      id: 'dist_noroeste_expansion',
      name: 'Sector Noroeste & Bulevar Mackay',
      zoneType: 'residencial',
      populationTraffic: 29000,
      averageIncomeLevel: 'Alto',
      rentIndexHNL: 28000,
      businessesPresent: [
        { id: 'b_09', name: 'Condominios Los Alpes (36 Apts)', type: 'jugador_constructora', brandColor: '#F97316', revenueSharePct: 52 },
        { id: 'b_10', name: 'Walmart / Paiz Noroeste', type: 'rival_supermercado', brandColor: '#0284C7', revenueSharePct: 38 },
        { id: 'b_11', name: 'Agencia Áureo Bank Noroeste', type: 'banco_sucursal', brandColor: '#F59E0B', revenueSharePct: 10 }
      ]
    },
    {
      id: 'dist_bulevar_sur',
      name: 'Bulevar del Sur & Complejos Industriales',
      zoneType: 'industrial',
      populationTraffic: 34000,
      averageIncomeLevel: 'Medio',
      rentIndexHNL: 22000,
      businessesPresent: [
        { id: 'b_12', name: 'Patio de Acopio & Plantas Constructora', type: 'jugador_constructora', brandColor: '#F97316', revenueSharePct: 45 },
        { id: 'b_13', name: 'Autolote & Concesionaria Diésel', type: 'jugador_autolote', brandColor: '#8B5CF6', revenueSharePct: 35 },
        { id: 'b_14', name: 'Almacén Mayorista de Víveres', type: 'jugador_supermercado', brandColor: '#10B981', revenueSharePct: 20 }
      ]
    }
  ];

  const activeDistrict = districts.find(d => d.id === selectedDistrictId) || districts[0];

  return (
    <div className="space-y-4">
      {/* Barra de Contexto del Mapa Urbano */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <MapPin className="w-4 h-4 text-amber-400" />
            <span className="uppercase tracking-wider">Territorio Económico Integrado</span>
            <span>·</span>
            <span className="text-white font-semibold">{currentCityName}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-0.5">
            Mapa de Distritos Comerciales, Sucursales y Proyectos
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Segmento Actual: </span>
            <span className="font-bold text-amber-400 uppercase">{playerSegment}</span>
          </div>
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <span className="text-slate-400">Caja Disponible: </span>
            <span className="font-bold text-emerald-400">{formatHNL(playerCashHNL)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Visualizador Cartográfico + Panel Detallado del Distrito */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Visualizador de Distritos */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>SELECCIONA UN DISTRITO PARA INSPECCIONAR ACTIVIDAD:</span>
            <span>4 DISTRITOS ACTIVOS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {districts.map(dist => {
              const isSelected = dist.id === selectedDistrictId;
              return (
                <div
                  key={dist.id}
                  onClick={() => {
                    sound.playClick();
                    setSelectedDistrictId(dist.id);
                    onSelectDistrict(dist.id);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/60 shadow-md shadow-amber-500/5'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-bold text-white tracking-tight">
                      {dist.name}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      dist.zoneType === 'comercial' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                      dist.zoneType === 'financiero' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                      dist.zoneType === 'residencial' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                      'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                      {dist.zoneType.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 font-mono">
                    <div className="flex items-center justify-between">
                      <span>Tráfico diario:</span>
                      <span className="text-slate-200 font-bold">{dist.populationTraffic.toLocaleString()} personas</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Poder adquisitivo:</span>
                      <span className="text-slate-300 font-medium">{dist.averageIncomeLevel}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Alquiler comercial:</span>
                      <span className="text-amber-300">{formatHNL(dist.rentIndexHNL)}/mes</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{dist.businessesPresent.length} establecimientos</span>
                    <span className={`flex items-center gap-1 font-semibold ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                      Inspeccionar <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Accesos Rápidos a Estaciones Operativas del Jugador */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-xs font-mono text-slate-400 block mb-2">
              ESTACIONES OPERATIVAS DEL NEGOCIO:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenBusinessStation('retail');
                }}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors flex items-center gap-2"
              >
                <Store className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Supermercado</div>
                  <div className="text-[10px] text-slate-400">Stock & Mermas</div>
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenBusinessStation('construction');
                }}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors flex items-center gap-2"
              >
                <HardHat className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Constructora</div>
                  <div className="text-[10px] text-slate-400">Obras & Fases</div>
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenBusinessStation('dealership');
                }}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors flex items-center gap-2"
              >
                <Car className="w-4 h-4 text-purple-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Autolote</div>
                  <div className="text-[10px] text-slate-400">Venta Autos</div>
                </div>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenBusinessStation('banking');
                }}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left transition-colors flex items-center gap-2"
              >
                <Landmark className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-white">Banca & ALM</div>
                  <div className="text-[10px] text-slate-400">Bóveda & Récord</div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Panel Detallado del Distrito Seleccionado */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
              Análisis Territorial
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              {activeDistrict.name}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Zona estratégica con demanda comercial activa y presencia bancaria.
            </p>
          </div>

          {/* Cuota de Mercado Local */}
          <div>
            <span className="text-xs font-mono text-slate-300 block mb-2 font-semibold">
              CUOTA DE MERCADO Y PARTICIPACIÓN LOCAL:
            </span>
            <div className="space-y-2">
              {activeDistrict.businessesPresent.map(b => (
                <div key={b.id} className="p-2 rounded bg-slate-950 border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.brandColor }} />
                      {b.name}
                    </span>
                    <span className="font-mono font-bold text-amber-400">{b.revenueSharePct}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all" 
                      style={{ width: `${b.revenueSharePct}%`, backgroundColor: b.brandColor }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botón de Negociación Directa con la Banca Local */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-xs font-mono text-slate-400 block mb-2">
              BANCOS CON PRESENCIA EN EL DISTRITO:
            </span>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCreditNegotiation('Banco Atlántida S.A.');
                }}
                className="w-full p-2 bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 rounded text-left text-xs font-semibold text-red-200 flex items-center justify-between transition-colors"
              >
                <span>🦁 Negociar Crédito con Banco Atlántida</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCreditNegotiation('Banco Ficohsa S.A.');
                }}
                className="w-full p-2 bg-blue-950/40 hover:bg-blue-900/50 border border-blue-800/60 rounded text-left text-xs font-semibold text-blue-200 flex items-center justify-between transition-colors"
              >
                <span>🏛️ Negociar Crédito con Banco Ficohsa</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  onOpenCreditNegotiation('BAC Credomatic');
                }}
                className="w-full p-2 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 rounded text-left text-xs font-semibold text-rose-200 flex items-center justify-between transition-colors"
              >
                <span>💳 Negociar Crédito con BAC Credomatic</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
