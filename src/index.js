require('dotenv').config();
const Binance = require('binance-api-node').default;
const schedule = require('node-schedule');
const logger = require('./logger');
const AIAnalysis = require('./ai_analysis');
const TechnicalAnalysis = require('./technical_analysis');
const PositionManager = require('./position_manager');

class TradingBot {
    constructor() {
        this.timeOffset = 0;
        this.client = Binance({
            apiKey: process.env.BINANCE_API_KEY,
            apiSecret: process.env.BINANCE_API_SECRET,
            getTime: () => Date.now() + this.timeOffset
        });

        this.config = {
            tradingPair: process.env.TRADING_PAIR,
            investment: parseFloat(process.env.INITIAL_INVESTMENT),
            maxDailyTrades: parseInt(process.env.MAX_TRADES_PER_DAY),
            initialStopLoss: parseFloat(process.env.INITIAL_STOP_LOSS_PERCENTAGE),
            trailingStop: parseFloat(process.env.TRAILING_STOP_PERCENTAGE),
            scaleInDip: parseFloat(process.env.SCALE_IN_ON_DIP_PERCENTAGE),
            maxScaleInAttempts: parseInt(process.env.MAX_SCALE_IN_ATTEMPTS)
        };

        this.ai = new AIAnalysis();
        this.positionManager = new PositionManager(this.config);
        this.dailyTrades = 0;
        this.lastTradeTime = null;
    }

    async syncTime() {
        try {
            const serverTime = await this.client.time();
            const localTime = Date.now();
            this.timeOffset = serverTime - localTime;
            
            if (isNaN(this.timeOffset)) {
                throw new Error('Calculated time offset is NaN');
            }

            if (Math.abs(this.timeOffset) > 1000) {
                logger.warn(`Time offset detected: ${this.timeOffset}ms. Adjusted timestamp.`);
            }
            
            return true;
        } catch (error) {
            logger.error('Time sync failed:', error);
            return false;
        }
    }

    async start() {
        try {
            // Sync time with Binance server before any operation
            await this.syncTime();
            
            // Wait a short moment for the time sync to take effect
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Test API connection
            await this.client.ping();
            logger.info('Connected to Binance API');

            // Re-sync time after connection test
            await this.syncTime();

            // Validate trading pair
            const exchangeInfo = await this.client.exchangeInfo({ symbol: this.config.tradingPair });
            if (!exchangeInfo.symbols || exchangeInfo.symbols.length === 0) {
                throw new Error(`Invalid trading pair: ${this.config.tradingPair}`);
            }

            // Validate account
            const accountInfo = await this.client.accountInfo();
            const usdtBalance = parseFloat(accountInfo.balances.find(b => b.asset === 'USDT')?.free || '0');
            
            if (usdtBalance < this.config.investment) {
                throw new Error(`Insufficient USDT balance. Need ${this.config.investment} USDT but only found ${usdtBalance} USDT`);
            }

            logger.info('Account validated', { 
                balance: usdtBalance,
                tradingPair: this.config.tradingPair
            });

            this.scheduleTrading();
            logger.info('Trading bot started successfully');
        } catch (error) {
            logger.error('Failed to start trading bot:', error);
            process.exit(1);
        }
    }

    async analyzeMarket() {
        try {
            const candles = await this.client.candles({ 
                symbol: this.config.tradingPair, 
                interval: '5m', 
                limit: 100 
            });
            
            const prices = candles.map(c => parseFloat(c.close));
            const volumes = candles.map(c => parseFloat(c.volume));

            const technicalData = {
                rsi: TechnicalAnalysis.calculateRSI(prices),
                macd: TechnicalAnalysis.calculateMACD(prices),
                volumePeak: TechnicalAnalysis.detectVolumePeak(volumes),
                trendStrength: TechnicalAnalysis.calculateTrendStrength(prices)
            };

            const aiAnalysis = await this.ai.analyzeMarket({
                prices,
                volumes,
                technicalData
            });

            return {
                technical: technicalData,
                ai: aiAnalysis,
                currentPrice: prices[prices.length - 1]
            };
        } catch (error) {
            logger.error('Market analysis error:', error);
            throw error;
        }
    }

    async executeTrade(analysis) {
        if (this.dailyTrades >= this.config.maxDailyTrades) {
            logger.info('Maximum daily trades reached');
            return;
        }

        // Minimum time between trades (5 minutes)
        if (this.lastTradeTime && Date.now() - this.lastTradeTime < 5 * 60 * 1000) {
            logger.info('Minimum time between trades not met');
            return;
        }

        try {
            // Check account balance
            const accountInfo = await this.client.accountInfo();
            const balance = parseFloat(accountInfo.balances.find(b => b.asset === 'USDT')?.free || '0');
            
            if (balance < this.config.investment) {
                logger.warn('Insufficient balance for trading');
                return;
            }

            // Check 24h market data
            const ticker24h = await this.client.ticker24hr({ symbol: this.config.tradingPair });
            
            // Check if volume is sufficient
            if (parseFloat(ticker24h.volume) < 500000) { // Minimum 24h volume
                logger.info('Insufficient 24h volume');
                return;
            }

            // Check for unusual price movements
            const priceChange = Math.abs(parseFloat(ticker24h.priceChangePercent));
            if (priceChange > 5) { // More than 5% price change
                logger.info('Unusual price movement detected');
                return;
            }

            const { technical, ai, currentPrice } = analysis;

            const shouldTrade = 
                ai.sentiment === 'bullish' &&
                ai.confidence > 0.7 &&
                technical.trendStrength > 0.6 &&
                technical.rsi > 30 && technical.rsi < 70;

            if (shouldTrade) {
                const quantity = (this.config.investment / currentPrice).toFixed(6);
                
                // Verify minimum notional
                if (quantity * currentPrice < 10) { // Minimum order value in USDT
                    logger.info('Order value too small');
                    return;
                }

                const order = await this.client.order({
                    symbol: this.config.tradingPair,
                    side: 'BUY',
                    type: 'MARKET',
                    quantity
                });

                this.positionManager.openPosition(order.orderId, quantity, currentPrice);
                this.dailyTrades++;
                this.lastTradeTime = Date.now();

                logger.info('Trade executed', { 
                    order, 
                    analysis,
                    balance: balance,
                    investment: this.config.investment,
                    quantity: quantity
                });
            }
        } catch (error) {
            logger.error('Trade execution error:', error);
        }
    }

    scheduleTrading() {
        // Market analysis every hour
        schedule.scheduleJob('0 * * * *', async () => {
            try {
                const analysis = await this.analyzeMarket();
                await this.executeTrade(analysis);
            } catch (error) {
                logger.error('Scheduled trading error:', error);
            }
        });

        // Position management every minute
        schedule.scheduleJob('* * * * *', async () => {
            try {
                if (this.positionManager.positions.size > 0) {
                    const prices = await this.client.prices({ 
                        symbol: this.config.tradingPair 
                    });
                    const currentPrice = parseFloat(prices[this.config.tradingPair]);

                    for (const [orderId, position] of this.positionManager.positions) {
                        const result = this.positionManager.updatePosition(orderId, currentPrice);
                        if (result) {
                            await this.client.order({
                                symbol: this.config.tradingPair,
                                side: 'SELL',
                                type: 'MARKET',
                                quantity: result.quantity
                            });
                            logger.info('Position closed', result);
                        }
                    }
                }
            } catch (error) {
                logger.error('Position management error:', error);
            }
        });

        // Reset daily counters at midnight
        schedule.scheduleJob('0 0 * * *', () => {
            this.dailyTrades = 0;
            logger.info('Daily counters reset');
        });
    }
}

// Start the bot
const bot = new TradingBot();
bot.start()
    .then(() => logger.info('Trading bot started successfully'))
    .catch(error => {
        logger.error('Failed to start trading bot:', error);
        process.exit(1);
    });

// Handle graceful shutdown
process.on('SIGTERM', () => {
    logger.info('Received SIGTERM signal. Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('Received SIGINT signal. Shutting down gracefully...');
    process.exit(0);
});