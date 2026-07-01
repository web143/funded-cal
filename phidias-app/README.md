# Phidias E2L — Calendario + Calculadora (versión Vercel)

App web de un solo proyecto con:
- Tu **calendario/tracker Phidias E2L $25K** (con sincronización en la nube).
- La **Calculadora de Equivalencias Spot/CFD ↔ Futuros** con botón **"↻ Actualizar"** que trae el *basis* del día automáticamente.

## 📁 Estructura

```
phidias-app/
├── index.html        ← la app completa (calendario + calculadora)
└── api/
    └── basis.js      ← función serverless: calcula basis = futuro − spot
```

No hace falta `vercel.json`: Vercel detecta automáticamente `index.html` (sitio estático) y cualquier archivo dentro de `/api` como función serverless.

## 🚀 Cómo publicarlo GRATIS en Vercel

### Opción A — Arrastrar la carpeta (lo más fácil)
1. Crea una cuenta gratis en https://vercel.com (plan **Hobby**).
2. Instala la CLI: en tu terminal, `npm i -g vercel`.
3. Entra a la carpeta `phidias-app` y ejecuta: `vercel`.
4. Sigue el asistente (acepta los valores por defecto). Al terminar te da una URL tipo `https://tu-app.vercel.app`.

### Opción B — Desde GitHub
1. Sube esta carpeta a un repositorio de GitHub.
2. En Vercel: **Add New → Project → Import** ese repo.
3. Deja todo por defecto y pulsa **Deploy**.

## 🔘 Cómo funciona el botón

- En la vista **Calculadora**, junto al campo *Diferencial de Puntos/Pips*, hay un botón **↻ Actualizar**.
- Al pulsarlo, la app llama a `/api/basis?asset=<activo>`.
- La función consulta Yahoo Finance (spot + futuro), calcula `basis = futuro − spot` y lo devuelve.
- El valor se aplica al campo, se guarda y se recalculan Entrada/SL/TP en el acto.

## ⚠️ Notas importantes

- **Datos de Yahoo Finance**: gratuitos pero **no oficiales** y con **~15 min de retraso**. Perfecto para el *basis* (se mueve lento), no para HFT.
- El futuro usa el **contrato continuo (front month)** de Yahoo; el basis es prácticamente igual al de tu contrato Ago/Sep.
- Símbolos usados: Oro `XAUUSD=X` vs `GC=F` · Euro `EURUSD=X` vs `6E=F` · Nasdaq `^NDX` vs `NQ=F` · US30 `^DJI` vs `YM=F` · S&P `^GSPC` vs `ES=F`.
- Los **activos personalizados** no tienen fuente automática (el botón lo avisa); su basis se ajusta a mano.
- El plan **Hobby** de Vercel es para **uso personal/no comercial**. Suficiente para ti de sobra (1.000.000 de llamadas a la función al mes).
- Si abres `index.html` en local (doble clic), todo funciona MENOS el botón (no existe `/api`); mostrará un aviso. El botón solo funciona ya publicado.

## 🔧 Si algún día Yahoo deja de responder

Es una fuente no oficial. Si un día falla, se puede cambiar la fuente dentro de `api/basis.js` (por ejemplo a Stooq u otro proveedor). El resto de la app seguirá funcionando igual.
