# Crypto Trading Bot

A safe and conservative trading bot designed for small accounts, using AI-enhanced technical analysis on the Binance platform.

## Features

- 🤖 AI-powered market analysis using OpenAI
- 📊 Technical analysis (RSI, MACD)
- ⚠️ Conservative risk management
- 🔄 Position scaling capabilities
- 📈 Trailing stop-loss
- 📝 Comprehensive logging

## Requirements

- Node.js (v14 or higher)
- Binance account with API access
- OpenAI API key
- Minimum 10 USDT for trading

## Safety Features

- ✅ Strict risk management
- ✅ Position size limits
- ✅ Maximum daily trade limits
- ✅ Trailing stops for profit protection
- ✅ Multiple technical indicators confirmation
- ✅ AI sentiment analysis

## Installation

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
   - Trading preferences

## Configuration

The bot uses safe default settings:
- Initial investment: $10 per trade
- Maximum 4 trades per day
- 0.35% stop loss
- 0.25% trailing stop
- Conservative RSI ranges (35-65)

## Usage

Start the bot:
```bash
npm start
```

Monitor logs:
```bash
tail -f combined.log
```

## Expected Returns

With $10 initial investment:
- Target per trade: ~0.3%
- Expected daily: ~$0.12 (4 trades)
- Focus on capital preservation
- Conservative profit targets

## Warning

- This is a conservative bot designed for capital preservation
- Never invest more than you can afford to lose
- Start with paper trading
- Monitor the bot regularly
- Past performance doesn't guarantee future results

## Files Structure

```
├── src/
│   ├── index.js          # Main bot logic
│   ├── ai_analysis.js    # AI integration
│   ├── technical_analysis.js # Technical indicators
│   ├── position_manager.js   # Position management
│   └── logger.js         # Logging configuration
├── .env.example          # Configuration template
├── package.json          # Dependencies
└── README.md            # Documentation
```

## Logging

The bot maintains two log files:
- `combined.log`: All activities
- `error.log`: Error messages only

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