# Áureo Bank — Simulador Financiero Hondureño

Simulador educativo de gestión bancaria ambientado en Honduras. Incluye operaciones de banca comercial, tesorería, crédito, riesgo, cumplimiento y gestión ejecutiva.

> **Aviso:** proyecto de simulación educativa. No es una entidad financiera real ni sustituye la normativa, tasas o datos oficiales vigentes del BCH o la CNBS.

## Funcionalidades

- Panel ejecutivo e indicadores financieros del banco.
- Segmentos de banca, expedientes de clientes y originación de crédito.
- Riesgo crediticio, mora y escenarios de estrés macroeconómico.
- Tesorería, mercado interbancario, operaciones BCH simuladas y contratos cambiarios.
- Compensación, convenios de nómina, comercios POS y fondos de pensiones.
- Gestión de sucursales, personal, gobierno corporativo y estados financieros simulados.
- Guardado local de la partida en el navegador; los datos se conservan en ese navegador y dispositivo.

## Ejecutar localmente

Requisitos: Node.js compatible con Vite 8 y npm.

```bash
npm install
npm run dev
```

## Validación y compilación

```bash
npm run lint
npm test
npm run build
npm run preview
```

## Publicación en GitHub Pages

El sitio publicado está disponible en https://isvant45.github.io/banco-nuevo/ . Si se publica como proyecto de GitHub Pages, revisa que la configuración de Vite use la base `/banco-nuevo/` para producción y que el despliegue publique el contenido de `dist/`. Las rutas de los recursos deben funcionar bajo ese prefijo.

## Datos guardados y reinicio

El progreso de la simulación se almacena en `localStorage` del navegador. Borrar los datos del sitio o utilizar otro navegador puede hacer que la partida guardada no esté disponible. Usa la opción de reinicio dentro del simulador solo si deseas comenzar una nueva partida.
