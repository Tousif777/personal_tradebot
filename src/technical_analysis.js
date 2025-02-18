class TechnicalAnalysis {
    static calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const difference = prices[i] - prices[i - 1];
            if (difference >= 0) gains += difference;
            else losses -= difference;
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        if (avgLoss === 0) return 100;
        const rs = avgGain / avgLoss;
        return 100 - (100 / (1 + rs));
    }

    static calculateEMA(prices, period) {
        const multiplier = 2 / (period + 1);
        let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;

        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] - ema) * multiplier + ema;
        }

        return ema;
    }

    static calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        if (prices.length < slowPeriod + signalPeriod) return null;

        const fastEMA = this.calculateEMA(prices, fastPeriod);
        const slowEMA = this.calculateEMA(prices, slowPeriod);
        const macdLine = fastEMA - slowEMA;
        const signalLine = this.calculateEMA([...Array(slowPeriod - signalPeriod).fill(0), macdLine], signalPeriod);

        return {
            macd: macdLine,
            signal: signalLine,
            histogram: macdLine - signalLine
        };
    }

    static detectVolumePeak(volumes, threshold = 2.0) {
        const avgVolume = volumes.slice(-10).reduce((a, b) => a + b) / 10;
        const currentVolume = volumes[volumes.length - 1];
        return currentVolume / avgVolume >= threshold;
    }

    static calculateTrendStrength(prices) {
        const sma20 = prices.slice(-20).reduce((a, b) => a + b) / 20;
        const sma50 = prices.slice(-50).reduce((a, b) => a + b) / 50;
        const currentPrice = prices[prices.length - 1];

        let strength = 0;
        if (currentPrice > sma20) strength += 0.4;
        if (currentPrice > sma50) strength += 0.3;
        if (sma20 > sma50) strength += 0.3;

        return strength;
    }
}

module.exports = TechnicalAnalysis; 