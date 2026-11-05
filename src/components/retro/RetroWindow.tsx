import React, { ReactNode, useState, useEffect, useRef } from 'react';

interface RetroWindowProps {
  id: string;
  title: string;
  icon?: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  initialX?: number;
  initialY?: number;
  width?: string;
  height?: string;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onFocus: () => void;
  children: ReactNode;
}

export const RetroWindow: React.FC<RetroWindowProps> = ({
  title,
  icon = '📁',
  isOpen,
  isMinimized,
  isMaximized,
  zIndex,
  initialX = 48,
  initialY = 48,
  width = 'max-w-4xl',
  height = 'max-h-[85vh]',
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  children
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Sincronizar posición inicial
  useEffect(() => {
    setPosition({ x: initialX, y: initialY });
  }, [initialX, initialY]);

  // Manejador de inicio de arrastre en la barra de título
  const handleTitleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    // Si se hizo clic en un botón de control, no iniciar arrastre
    if ((e.target as HTMLElement).closest('button')) return;

    onFocus();
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const maxX = Math.max(10, window.innerWidth - 120);
      const maxY = Math.max(10, window.innerHeight - 60);

      const newX = Math.min(maxX, Math.max(0, e.clientX - dragOffset.current.x));
      const newY = Math.min(maxY, Math.max(0, e.clientY - dragOffset.current.y));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (!isOpen || isMinimized) return null;

  return (
    <div
      onClick={onFocus}
      style={{
        zIndex,
        ...(isMaximized
          ? { top: 0, left: 0, right: 0, bottom: '40px', width: '100%', height: 'calc(100vh - 40px)' }
          : { top: `${position.y}px`, left: `${position.x}px` })
      }}
      className={`fixed ${
        isMaximized
          ? 'rounded-none'
          : `w-[94vw] md:w-auto ${width} ${height}`
      } flex flex-col bg-[#c0c0c0] border-t-2 border-l-2 border-white border-b-2 border-r-2 border-[#404040] shadow-2xl select-text transition-shadow`}
    >
      {/* Barra de Título Windows 98 / 2000 Clásica (Arrastrable con el Mouse) */}
      <div
        onMouseDown={handleTitleMouseDown}
        className={`bg-gradient-to-r from-[#000080] via-[#1084d0] to-[#000080] text-white px-2 py-1 flex items-center justify-between select-none border-b border-[#808080] ${
          isMaximized ? 'cursor-default' : 'cursor-move'
        }`}
        title="Arrastra para mover la ventana por la pantalla"
      >
        <div className="flex items-center gap-2 overflow-hidden text-xs font-bold tracking-wide pointer-events-none">
          <span className="text-sm shrink-0">{icon}</span>
          <span className="truncate">{title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0 ml-2">
          {/* Minimizar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            title="Minimizar"
            className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-[#404040] text-black font-bold text-[10px] leading-none flex items-center justify-center hover:bg-[#d4d4d4] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white cursor-pointer"
          >
            _
          </button>
          {/* Maximizar / Restaurar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            title={isMaximized ? 'Restaurar' : 'Maximizar'}
            className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-[#404040] text-black font-bold text-[10px] leading-none flex items-center justify-center hover:bg-[#d4d4d4] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white cursor-pointer"
          >
            {isMaximized ? '❐' : '□'}
          </button>
          {/* Cerrar */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Cerrar"
            className="w-4 h-4 bg-[#c0c0c0] border-t border-l border-white border-b border-r border-[#404040] text-black font-bold text-[10px] leading-none flex items-center justify-center hover:bg-[#d4d4d4] active:border-t-[#404040] active:border-l-[#404040] active:border-b-white active:border-r-white cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Contenido Interior con Scroll Beveled */}
      <div className="flex-1 overflow-y-auto p-3 text-slate-900 text-xs font-sans">
        {children}
      </div>

      {/* Barra de Estado Inferior Clásica */}
      <div className="bg-[#c0c0c0] border-t border-white px-2 py-0.5 text-[11px] text-slate-700 flex items-center justify-between border-b border-r border-[#404040]">
        <span className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 bg-emerald-600 rounded-full" />
          <span>Ventana Activa · Arrastrable</span>
        </span>
        <span className="font-mono text-[10px]">Windows Sim v2.0</span>
      </div>
    </div>
  );
};
