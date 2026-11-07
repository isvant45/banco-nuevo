import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json());

// Inicialización de cliente Gemini server-side con User-Agent mandatorio
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Endpoint de Negociación Crediticia con Asesor Bancario (Gemini 3.8 Flash)
 * Integra las 4 bancas (Personas, Pyme, Corporativo, Privada) y las entidades bancarias.
 */
app.post('/api/gemini/negotiate-credit', async (req, res) => {
  try {
    const { 
      bankId, 
      bankName, 
      segment, 
      clientProfile, 
      requestDetails, 
      conversationHistory, 
      playerCounterOffer, 
      creditScore,
      deterministicLimits
    } = req.body;

    const systemPrompt = `Eres un Asesor y Ejecutivo de Crédito senior en ${bankName || 'el banco'} en Honduras.
Atiendes la división de "${segment || 'Banca Pyme'}".
Tu rol es evaluar solicitudes de crédito, explicar con claridad financiera las condiciones (monto, tasa anual %, plazo en meses, cuota mensual, garantías o avalúos requeridos y comisiones) y negociar con el cliente.

DATOS DEL CLIENTE Y NEGOCIO:
- Nombre: ${clientProfile?.name || 'Cliente'}
- Segmento: ${segment || 'Banca Pyme'}
- Ventas mensuales: L ${Number(clientProfile?.monthlySales || 0).toLocaleString()}
- Patrimonio neto: L ${Number(clientProfile?.netWorth || 0).toLocaleString()}
- Deuda actual: L ${Number(clientProfile?.currentDebt || 0).toLocaleString()}
- Score Crediticio Explicable: ${creditScore?.score || 650}/1000 (${creditScore?.rating || 'BB'})
- Razón DTI (Deuda/Ingreso): ${creditScore?.dtiPct || 35}%
- Garantías aportadas: ${clientProfile?.collateralsSummary || 'Garantía fiduciaria estándar'}

LÍMITES MÁXIMOS PERMITIDOS POR EL MOTOR DETERMINISTA (NO PUEDES VIOLAR ESTOS LÍMITES):
- Monto máximo pre-aprobado: L ${Number(deterministicLimits?.maxAmountHNL || 1000000).toLocaleString()}
- Tasa mínima permitida: ${deterministicLimits?.minInterestRatePct || 11.5}% anual
- Plazo máximo permitido: ${deterministicLimits?.maxTermMonths || 48} meses

REGLAS DE RESPUESTA:
1. Responde de forma cordial, profesional y firme en español, con lenguaje financiero claro.
2. Si la contraoferta del jugador está dentro de los límites deterministas, acéptala o acércate a ella justificando los términos.
3. Si la contraoferta excede los límites (pide más dinero del límite o tasa menor a la mínima), explica por qué no es viable según su endeudamiento o garantías, y ofrece una alternativa realista ("Podríamos llegar a esa tasa si aportas un bien inmueble o un avalúo vehicular libre de gravamen").
4. Genera una respuesta estructurada en formato JSON con la siguiente forma:
{
  "advisorSpeech": "Mensaje en tono ejecutivo explicando la postura del banco...",
  "proposedAmountHNL": 1500000,
  "proposedRatePct": 12.5,
  "proposedTermMonths": 36,
  "collateralRequired": "Hipoteca sobre almacén principal o maquinaria",
  "approvedByBank": true,
  "explanationReason": "Explicación breve de los factores evaluados (DTI, ventas, score)"
}`;

    // Si hay cliente AI activo disponible
    if (ai) {
      try {
        const contents = [
          {
            role: 'user',
            parts: [
              {
                text: `Historial de conversación previo: ${JSON.stringify(conversationHistory || [])}
Contraoferta o mensaje actual del jugador: "${playerCounterOffer || 'Solicito revisión de mis condiciones de crédito'}".
Solicitud del jugador: Monto L ${Number(requestDetails?.amountHNL || 0).toLocaleString()}, Plazo ${requestDetails?.termMonths || 36} meses, Tasa deseada ${requestDetails?.targetRatePct || 12}%.
Por favor evalúa y responde en formato JSON válido.`
              }
            ]
          }
        ];

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
          }
        });

        const responseText = response.text || '{}';
        const parsed = JSON.parse(responseText);
        // Garantizar que la propuesta respete los límites deterministas
        parsed.proposedAmountHNL = Math.min(parsed.proposedAmountHNL, deterministicLimits?.maxAmountHNL || 2000000);
        parsed.proposedRatePct = Math.max(parsed.proposedRatePct, deterministicLimits?.minInterestRatePct || 10.5);
        return res.json(parsed);
      } catch (geminiError) {
        console.warn('Gemini API no disponible o en alta demanda, utilizando motor determinista:', geminiError);
      }
    }

    // Fallback Determinista Inteligente (Offline o sin API Key)
    const maxAmount = deterministicLimits?.maxAmountHNL || 1500000;
    const minRate = deterministicLimits?.minInterestRatePct || 11.5;
    const requestedAmount = Number(requestDetails?.amountHNL || 1000000);
    const requestedRate = Number(requestDetails?.targetRatePct || 12);

    const isViableAmount = requestedAmount <= maxAmount;
    const approvedAmount = isViableAmount ? requestedAmount : maxAmount;
    const approvedRate = Math.max(minRate, requestedRate >= minRate ? requestedRate : minRate + 1.2);
    const isApproved = creditScore?.score >= 580;

    let speech = '';
    if (!isApproved) {
      speech = `Estimado cliente, tras evaluar su índice de endeudamiento DTI del ${creditScore?.dtiPct || 48}% y su puntaje de ${creditScore?.score || 550} puntos, lamentamos informarle que actualmente no calificamos la operación bajo condiciones convencionales. Le recomendamos amortizar deudas activas o presentar colateral inmobiliario.`;
    } else if (!isViableAmount) {
      speech = `Hemos revisado su solicitud. El monto solicitado de L ${requestedAmount.toLocaleString()} supera la capacidad autorizada por nuestro comité para el segmento ${segment}. Con su flujo actual podemos aprobarle hasta L ${approvedAmount.toLocaleString()} al ${approvedRate}% anual.`;
    } else {
      speech = `Su récord crediticio (${creditScore?.rating || 'A'} con ${creditScore?.score} puntos) y ventas de L ${Number(clientProfile?.monthlySales || 0).toLocaleString()} respaldan la operación. Hemos aprobado L ${approvedAmount.toLocaleString()} a una tasa preferencial del ${approvedRate}% anual.`;
    }

    return res.json({
      advisorSpeech: speech,
      proposedAmountHNL: approvedAmount,
      proposedRatePct: approvedRate,
      proposedTermMonths: requestDetails?.termMonths || 36,
      collateralRequired: approvedAmount > 2000000 ? 'Garantía Hipotecaria Primer Rango' : 'Fianza Solidaria y Pagaré Libre',
      approvedByBank: isApproved,
      explanationReason: `Evaluación basada en DTI del ${creditScore?.dtiPct || 35}%, Score ${creditScore?.score || 650} pts y flujo operativo mensual.`
    });
  } catch (error: any) {
    console.error('Error en /api/gemini/negotiate-credit:', error);
    return res.status(500).json({ 
      error: 'Error interno en la negociación crediticia', 
      details: error?.message || 'Error desconocido' 
    });
  }
});

// Configuración de Vite Middleware en Desarrollo
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Aureo Bank Sim] Servidor activo en puerto ${PORT}`);
  });
}

startServer();
