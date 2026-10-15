/**
 * Beta paper trader: historical spot simulation using public Binance market data.
 * This module contains no authenticated endpoints and cannot place real orders.
 */

interface Candle {
  openTime: number;
  open: number;
  close: number;
}

interface SimulatedTrade {
  entryTime: number;
  exitTime: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
}

const CONFIG = {
  symbol: "BTCUSDT",
  interval: "1h",
  candleCount: 500,
  startingCash: 1_000,
  fastEma: 20,
  slowEma: 50,
  maxPositionFraction: 0.1,
  feeRate: 0.001,
  slippageRate: 0.0005,
};

function finitePositive(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Giá nến Binance không hợp lệ: ${String(value)}`);
  }
  return parsed;
}

async function fetchCandles(): Promise<Candle[]> {
  const url = new URL("https://api.binance.com/api/v3/klines");
  url.searchParams.set("symbol", CONFIG.symbol);
  url.searchParams.set("interval", CONFIG.interval);
  url.searchParams.set("limit", String(CONFIG.candleCount));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Binance market data trả HTTP ${response.status}`);
  }

  const rows = await response.json() as unknown[][];
  const now = Date.now();
  return rows
    .filter(row => Number(row[6]) < now) // bỏ cây nến hiện tại chưa đóng
    .map(row => ({
      openTime: Number(row[0]),
      open: finitePositive(row[1]),
      close: finitePositive(row[4]),
    }));
}

function ema(values: number[], period: number): number[] {
  const result = Array<number>(values.length).fill(Number.NaN);
  if (values.length < period) return result;

  const seed = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  result[period - 1] = seed;
  const alpha = 2 / (period + 1);
  for (let i = period; i < values.length; i++) {
    result[i] = values[i] * alpha + result[i - 1] * (1 - alpha);
  }
  return result;
}

function formatUsd(value: number): string {
  return `${value.toFixed(2)} USDT`;
}

function simulate(candles: Candle[]): { trades: SimulatedTrade[]; finalEquity: number; maxDrawdownPct: number } {
  if (candles.length <= CONFIG.slowEma + 1) {
    throw new Error(`Cần ít nhất ${CONFIG.slowEma + 2} nến đã đóng để mô phỏng.`);
  }

  const closes = candles.map(candle => candle.close);
  const fast = ema(closes, CONFIG.fastEma);
  const slow = ema(closes, CONFIG.slowEma);
  const trades: SimulatedTrade[] = [];
  let cash = CONFIG.startingCash;
  let quantity = 0;
  let entryPrice = 0;
  let entryCost = 0;
  let entryTime = 0;
  let peakEquity = cash;
  let maxDrawdownPct = 0;

  // A signal uses a closed candle and executes at the next candle's open.
  for (let i = CONFIG.slowEma; i < candles.length - 1; i++) {
    const crossedUp = fast[i - 1] <= slow[i - 1] && fast[i] > slow[i];
    const crossedDown = fast[i - 1] >= slow[i - 1] && fast[i] < slow[i];
    const execution = candles[i + 1];

    if (quantity === 0 && crossedUp) {
      const notional = Math.min(cash * CONFIG.maxPositionFraction, cash / (1 + CONFIG.feeRate));
      const buyPrice = execution.open * (1 + CONFIG.slippageRate);
      const fee = notional * CONFIG.feeRate;
      quantity = notional / buyPrice;
      cash -= notional + fee;
      entryPrice = buyPrice;
      entryCost = notional + fee;
      entryTime = execution.openTime;
    } else if (quantity > 0 && crossedDown) {
      const sellPrice = execution.open * (1 - CONFIG.slippageRate);
      const gross = quantity * sellPrice;
      const fee = gross * CONFIG.feeRate;
      const proceeds = gross - fee;
      cash += proceeds;
      trades.push({
        entryTime,
        exitTime: execution.openTime,
        entryPrice,
        exitPrice: sellPrice,
        quantity,
        pnl: proceeds - entryCost,
      });
      quantity = 0;
      entryPrice = 0;
      entryCost = 0;
      entryTime = 0;
    }

    const markedEquity = cash + quantity * execution.close;
    peakEquity = Math.max(peakEquity, markedEquity);
    maxDrawdownPct = Math.max(maxDrawdownPct, (peakEquity - markedEquity) / peakEquity);
  }

  // Close any remaining paper position at the last completed candle.
  if (quantity > 0) {
    const last = candles[candles.length - 1];
    const sellPrice = last.close * (1 - CONFIG.slippageRate);
    const gross = quantity * sellPrice;
    const proceeds = gross * (1 - CONFIG.feeRate);
    cash += proceeds;
    trades.push({
      entryTime,
      exitTime: last.openTime,
      entryPrice,
      exitPrice: sellPrice,
      quantity,
      pnl: proceeds - entryCost,
    });
  }

  peakEquity = Math.max(peakEquity, cash);
  maxDrawdownPct = Math.max(maxDrawdownPct, (peakEquity - cash) / peakEquity);
  return { trades, finalEquity: cash, maxDrawdownPct };
}

async function main(): Promise<void> {
  console.log("BETA PAPER TRADING — chỉ mô phỏng, không gửi lệnh thật");
  console.log(`Cặp ${CONFIG.symbol} · nến ${CONFIG.interval} · EMA ${CONFIG.fastEma}/${CONFIG.slowEma}`);
  console.log(`Vốn mô phỏng ${formatUsd(CONFIG.startingCash)} · tối đa ${(CONFIG.maxPositionFraction * 100).toFixed(0)}% vốn/lệnh spot`);
  console.log(`Phí giả lập ${(CONFIG.feeRate * 100).toFixed(2)}% mỗi chiều · trượt giá giả lập ${(CONFIG.slippageRate * 100).toFixed(2)}% mỗi chiều`);

  const candles = await fetchCandles();
  const result = simulate(candles);
  const pnl = result.finalEquity - CONFIG.startingCash;
  const wins = result.trades.filter(trade => trade.pnl > 0).length;
  const losses = result.trades.filter(trade => trade.pnl <= 0).length;
  const winRate = result.trades.length ? wins / result.trades.length * 100 : 0;

  console.log(`Đã mô phỏng ${candles.length} nến, từ ${new Date(candles[0].openTime).toISOString()} đến ${new Date(candles[candles.length - 1].openTime).toISOString()}.`);
  console.log(`Số lệnh đóng: ${result.trades.length} · thắng ${wins} · hòa/thua ${losses} · tỷ lệ thắng ${winRate.toFixed(1)}%`);
  console.log(`Vốn cuối mô phỏng: ${formatUsd(result.finalEquity)} · P/L: ${pnl >= 0 ? "+" : ""}${formatUsd(pnl)}`);
  console.log(`Drawdown tối đa trong lịch sử mô phỏng: ${(result.maxDrawdownPct * 100).toFixed(2)}%`);
  console.log("Kết quả lịch sử không dự báo lợi nhuận tương lai; phí và trượt giá thực tế có thể khác.");
}

main().catch(error => {
  console.error(`Paper trader lỗi: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});
