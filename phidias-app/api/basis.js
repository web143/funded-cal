// ============================================================================
//  Funcion Serverless de Vercel:  GET /api/basis?asset=gold
// ----------------------------------------------------------------------------
//  Calcula el "basis" (diferencial) = precio del futuro - precio del spot,
//  usando datos GRATUITOS de Yahoo Finance.
//
//  IMPORTANTE:
//   - Los datos de futuros de Yahoo son NO OFICIALES y llegan con ~15 minutos
//     de retraso. Es mas que suficiente para el basis (que se mueve lento),
//     pero NO sirve para operativa de alta frecuencia.
//   - El futuro se toma del contrato "continuo" (front month) de Yahoo, que
//     puede no ser exactamente tu contrato (Ago/Sep), pero el basis es casi
//     identico.
//   - Corre en el servidor de Vercel, asi que NO hay problema de CORS.
// ============================================================================

// Mapa de cada activo -> simbolos de Yahoo (spot y futuro) + decimales de salida
const MAP = {
  gold:   { spot: 'XAUUSD=X', fut: 'GC=F', dec: 1 }, // Oro (MGC)
  euro:   { spot: 'EURUSD=X', fut: '6E=F', dec: 5 }, // Euro (M6E)
  nasdaq: { spot: '^NDX',     fut: 'NQ=F', dec: 1 }, // Nasdaq (MNQ)
  us30:   { spot: '^DJI',     fut: 'YM=F', dec: 0 }, // Dow (MYM)
  sp500:  { spot: '^GSPC',    fut: 'ES=F', dec: 1 }, // S&P 500 (MES)
};

// Consulta el precio actual de un simbolo en Yahoo Finance.
async function price(symbol) {
  const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' +
    encodeURIComponent(symbol) + '?interval=1d&range=1d';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error('Yahoo respondio ' + res.status + ' para ' + symbol);
  const j = await res.json();
  const meta = j && j.chart && j.chart.result && j.chart.result[0] && j.chart.result[0].meta;
  const p = meta && (meta.regularMarketPrice || meta.previousClose);
  if (typeof p !== 'number') throw new Error('Sin precio disponible para ' + symbol);
  return p;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=60'); // cachea 60s en el edge
  try {
    const asset = (req.query && req.query.asset) || '';
    const m = MAP[asset];
    if (!m) {
      res.status(400).json({ error: 'Activo no soportado: ' + asset });
      return;
    }
    // Pide spot y futuro en paralelo
    const results = await Promise.all([price(m.spot), price(m.fut)]);
    const spot = results[0];
    const fut = results[1];
    const basis = Number((fut - spot).toFixed(m.dec + 1));
    res.status(200).json({
      asset: asset,
      spot: Number(spot.toFixed(m.dec + 1)),
      future: Number(fut.toFixed(m.dec + 1)),
      basis: basis,
      note: 'Datos Yahoo Finance, no oficiales, ~15 min de retraso',
    });
  } catch (e) {
    res.status(502).json({ error: e.message });
  }
};
