# Crypto Trading Bot

A safe and conservative trading bot designed for small to large accounts, using AI-enhanced technical analysis on the Binance platform.

## Expected Monthly Returns

| Investment Amount | Expected Monthly Return* | Daily Trades | Risk Level |
|------------------|-------------------------|--------------|------------|
| $10              | $2 - $3                | 4            | Minimal    |
| $50              | $10 - $15              | 4            | Low        |
| $100             | $20 - $30              | 4            | Low        |
| $500             | $100 - $150            | 4            | Moderate   |
| $1,000           | $200 - $300            | 4            | Moderate   |

*Based on:
- 0.2-0.3% profit per successful trade
- 22 trading days per month
- 60-70% trade success rate
- Includes trading fees
- Conservative risk management

⚠️ **Important Risk Disclaimer**
- Returns are NOT guaranteed
- Past performance doesn't predict future results
- Crypto markets are highly volatile
- Never invest more than you can afford to lose
- Start with small amounts to test
- Some months may be profitable, others may show losses

## Features

- 🤖 AI-powered market analysis using OpenAI
- 📊 Technical analysis (RSI, MACD)
- ⚠️ Conservative risk management
- 🔄 Position scaling capabilities
- 📈 Trailing stop-loss
- 📝 Comprehensive logging

## Safety Features

- ✅ Tight stop-loss (0.20%)
- ✅ Daily loss limits (2.0%)
- ✅ Position size limits (25% max)
- ✅ Maximum 4 trades per day
- ✅ Automatic shutdown after 2 losses
- ✅ Volatility protection
- ✅ Minimum volume requirements
- ✅ Spread monitoring

## Requirements

- Node.js (v14 or higher)
- Binance account with API access
- OpenAI API key
- Minimum 10 USDT for trading

## Quick Start

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd crypto-trading-bot
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up configuration:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your:
   - Binance API credentials
   - OpenAI API key
   - Investment amount (INITIAL_INVESTMENT)

## Usage

Start the bot:
```bash
npm start
```

Monitor logs:
```bash
tail -f combined.log
```

## Monthly Performance Monitoring

The bot maintains detailed logs of:
- Daily profit/loss
- Trade success rate
- Risk management triggers
- Account balance changes

Monitor your monthly performance:
1. Check `combined.log` for daily summaries
2. Review error.log for any issues
3. Track monthly profit in the console output

## Safety Checklist

Before running:
- [ ] API keys are set correctly
- [ ] Withdrawals are disabled on API
- [ ] IP restrictions are set
- [ ] Sufficient USDT balance
- [ ] Test with paper trading first
- [ ] Understand all parameters
- [ ] Monitor initial trades closely

## Support

For issues or questions:
1. Check the logs
2. Review configuration
3. Open an issue on GitHub

## License

MIT License 