const OpenAI = require('openai');
const logger = require('./logger');

class AIAnalysis {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY
        });
    }

    async analyzeMarket(marketData) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are a crypto trading analyst. Analyze the market data and provide a clear trading signal. Include sentiment (bullish/bearish/neutral), trend (up/down/sideways), and confidence level (0.0-1.0)."
                    },
                    {
                        role: "user",
                        content: JSON.stringify(marketData)
                    }
                ],
                temperature: 0.7
            });

            const analysis = response.choices[0].message.content;
            return this.parseAnalysis(analysis);
        } catch (error) {
            logger.error('AI Analysis Error:', error.message);
            return null;
        }
    }

    parseAnalysis(analysis) {
        try {
            const sentiment = this.extractSentiment(analysis);
            const trend = this.extractTrend(analysis);
            const confidence = this.extractConfidence(analysis);

            return {
                sentiment,
                trend,
                confidence,
                raw: analysis
            };
        } catch (error) {
            logger.error('Analysis parsing error:', error);
            return null;
        }
    }

    extractSentiment(analysis) {
        const text = analysis.toLowerCase();
        if (text.includes('bullish')) return 'bullish';
        if (text.includes('bearish')) return 'bearish';
        return 'neutral';
    }

    extractTrend(analysis) {
        const text = analysis.toLowerCase();
        if (text.includes('upward') || text.includes('up trend')) return 'up';
        if (text.includes('downward') || text.includes('down trend')) return 'down';
        return 'sideways';
    }

    extractConfidence(analysis) {
        const match = analysis.match(/confidence:\s*(0\.\d+)/i);
        return match ? parseFloat(match[1]) : 0.5;
    }
}

module.exports = AIAnalysis; 