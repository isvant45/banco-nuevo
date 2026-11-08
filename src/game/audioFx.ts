/**
 * Generador de efectos de audio sintetizados con la Web Audio API nativa.
 * Compatible con todos los navegadores modernos y libre de dependencias externas.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Clic suave en botones e interacción de pestañas
  public playClick() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(480, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Ignorar errores en navegadores restrictivos
    }
  }

  // Aprobación de crédito (sello positivo firme)
  public playApprovalStamp() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(330, now); // E4
      osc.frequency.setValueAtTime(440, now + 0.07); // A4
      osc.frequency.setValueAtTime(659.25, now + 0.14); // E5

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignorar
    }
  }

  // Rechazo de crédito o alerta de riesgo
  public playRejectBuzzer() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(140, now + 0.08);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignorar
    }
  }

  // Ganancias / Cobro de comisiones (timbre metálico elegante)
  public playCashChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [880, 1174.66, 1760].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.06, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.3);
      });
    } catch {
      // Ignorar
    }
  }

  // Campana de cierre de mes contable / comunicado oficial BCH
  public playMonthEndBell() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99, 1046.50]; // Acorde C Mayor brillante
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.07, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.6);
      });
    } catch {
      // Ignorar
    }
  }

  // Alias para clink de monedas
  public playCoinClink() {
    this.playCashChime();
  }

  // Alias para campana de advertencia
  public playWarningChime() {
    this.playRejectBuzzer();
  }

  // Alias para caja registradora / operaciones monetarias
  public playCashRegister() {
    this.playCashChime();
  }

  // Alias para sirena de advertencia / estrés
  public playWarningSiren() {
    this.playRejectBuzzer();
  }

  // Alias para inversión estratégica o resolución directiva
  public playInvest() {
    this.playCashChime();
  }

  // Alias para alerta de riesgo o crisis
  public playAlert() {
    this.playRejectBuzzer();
  }

  // Caja registradora auténtica (doble impacto metálico + anillo armónico agudo)
  public playCaChing() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Impacto mecánico de la caja
      const clickOsc = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(600, now);
      clickOsc.frequency.exponentialRampToValueAtTime(120, now + 0.04);
      clickGain.gain.setValueAtTime(0.08, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      clickOsc.connect(clickGain);
      clickGain.connect(this.ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.04);

      // Anillo metálico de monedas cayendo (dos notas agudas brillantes)
      [1318.51, 2093.00, 2637.02].forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        const start = now + 0.04 + i * 0.06;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.09, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.45);
      });
    } catch {
      // Ignorar
    }
  }

  // Golpe pesado de mazo/sanción o embargo judicial
  public playHeavyStamp() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Golpe grave de impacto sordo
      const thudOsc = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thudOsc.type = 'triangle';
      thudOsc.frequency.setValueAtTime(140, now);
      thudOsc.frequency.exponentialRampToValueAtTime(35, now + 0.25);
      thudGain.gain.setValueAtTime(0.18, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      thudOsc.connect(thudGain);
      thudGain.connect(this.ctx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.28);

      // Clank metálico de sello o esposas
      const slamOsc = this.ctx.createOscillator();
      const slamGain = this.ctx.createGain();
      slamOsc.type = 'sawtooth';
      slamOsc.frequency.setValueAtTime(260, now + 0.02);
      slamOsc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
      slamGain.gain.setValueAtTime(0.09, now + 0.02);
      slamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      slamOsc.connect(slamGain);
      slamGain.connect(this.ctx.destination);
      slamOsc.start(now + 0.02);
      slamOsc.stop(now + 0.15);
    } catch {
      // Ignorar
    }
  }

  // Campana triunfal de salida a bolsa (IPO Bell)
  public playIpoBell() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      // Secuencia de toques rítmicos de campana de bolsa
      const strikes = [0, 0.18, 0.36, 0.54, 0.72];
      strikes.forEach((st) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1760, now + st); // A6 campana
        gain.gain.setValueAtTime(0.1, now + st);
        gain.gain.exponentialRampToValueAtTime(0.001, now + st + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + st);
        osc.stop(now + st + 0.3);
      });
    } catch {
      // Ignorar
    }
  }

  // Fanfarria de victoria o logro de campaña
  public playVictoryFanfare() {
    this.playMonthEndBell();
  }

  // Alias para jingle de mejora técnica
  public playUpgradeJingle() {
    this.playApprovalStamp();
  }
}

export const sound = new SoundEngine();
