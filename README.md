# Áureo Bank — Simulador Financiero Hondureño

Simulador educativo de gestión bancaria ambientado en Honduras. Reúne operaciones de banca comercial, tesorería, crédito, riesgo, cumplimiento y gestión ejecutiva.

> **Aviso:** proyecto de simulación educativa. No es una entidad financiera real ni está afiliado al BCH o a la CNBS. Las tasas, comisiones, reglas fiscales y parámetros regulatorios que aparecen en el juego son supuestos de simulación y no deben interpretarse como tarifarios oficiales vigentes ni como asesoría financiera o legal.

## Funcionalidades

- Panel ejecutivo e indicadores financieros del banco.
- Segmentos de banca, expedientes de clientes, originación de crédito y gestión de cartera.
- Riesgo crediticio, mora, condonaciones y escenarios macroeconómicos.
- Tesorería, mercado interbancario, operaciones BCH simuladas y contratos cambiarios.
- Gestión de sucursales, personal, gobierno corporativo y estados financieros simulados.
- Cumplimiento y monitoreo de operaciones con alertas de prevención de lavado de activos.
- Compensación, convenios de nómina, comercios POS y fondos de pensiones.
- Asignación masiva de depósitos y cartera crediticia por segmento.
- **Depósitos a plazo fijo (DPF):** certificados, plazos, intereses, retención SAR configurada en la simulación y control de vencimiento/pignoración.
- **Crédito Back-to-Back:** originación de préstamos o tarjetas garantizadas por DPF, cálculo de cobertura y tasa, pagos, liberación de garantía y ejecución de garantía.
- **Transferencias ACH y nómina corporativa:** registro de transacciones y cálculo de comisiones simuladas.
- **Financiamiento de comercio exterior:** modelos de cartas de crédito y operaciones corporativas.
- Guardado local de la partida en el navegador; los datos se conservan en ese navegador y dispositivo.

## Ejecutar localmente

Requisitos: una versión de Node.js compatible con Vite 8 y npm.

```bash
npm install
npm run dev
```

Vite mostrará en la terminal la dirección local donde se ejecuta la aplicación.

## Validación y compilación

```bash
npm run lint
npm test
npm run build
npm run preview
```

Las pruebas automatizadas cubren el calendario financiero, el formato de moneda, los umbrales de segmento y operaciones del core bancario. El resultado debe confirmarse ejecutando los comandos o revisando la última ejecución de GitHub Actions.

## Publicación en GitHub Pages

El sitio publicado está disponible en https://isvant45.github.io/banco-nuevo/. El flujo de GitHub Actions se ejecuta al hacer push a `main` y también permite ejecución manual. El proceso instala dependencias, verifica tipos, ejecuta las pruebas disponibles, compila con la base `/banco-nuevo/` y publica el directorio `dist/`.

## Datos guardados y reinicio

El progreso de la simulación se almacena en `localStorage` del navegador. Borrar los datos del sitio o utilizar otro navegador puede hacer que la partida guardada no esté disponible. Usa la opción de reinicio dentro del simulador solo si deseas comenzar una nueva partida.

## Nota sobre el realismo bancario

El proyecto modela procesos inspirados en productos bancarios de la región, pero la presencia de una operación en el simulador no certifica que su tasa, comisión, tratamiento tributario, ponderación de riesgo o requisito de provisiones coincida con la normativa vigente. Antes de utilizar esos parámetros fuera del juego, deben verificarse con fuentes oficiales del BCH, la CNBS y la autoridad tributaria correspondiente.
