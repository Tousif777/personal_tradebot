class PositionManager {
    constructor(config) {
        this.config = config;
        this.positions = new Map();
        this.profitLocks = new Map();
        this.scaleInAttempts = new Map();
    }

    openPosition(orderId, quantity, entryPrice) {
        const stopPrice = entryPrice * (1 - this.config.initialStopLoss / 100);
        
        this.positions.set(orderId, {
            quantity,
            entryPrice,
            stopPrice,
            highestPrice: entryPrice,
            scaleOutLevels: []
        });
    }

    updatePosition(orderId, currentPrice) {
        const position = this.positions.get(orderId);
        if (!position) return null;

        // Update highest price and trailing stop
        if (currentPrice > position.highestPrice) {
            position.highestPrice = currentPrice;
            const trailingStop = currentPrice * (1 - this.config.trailingStop / 100);
            position.stopPrice = Math.max(position.stopPrice, trailingStop);
        }

        // Check if stop is hit
        if (currentPrice <= position.stopPrice) {
            return this.closePosition(orderId, currentPrice);
        }

        return null;
    }

    closePosition(orderId, exitPrice) {
        const position = this.positions.get(orderId);
        if (!position) return null;

        const profit = (exitPrice - position.entryPrice) * position.quantity;
        this.positions.delete(orderId);
        this.profitLocks.delete(orderId);
        this.scaleInAttempts.delete(orderId);

        return {
            profit,
            quantity: position.quantity,
            entryPrice: position.entryPrice,
            exitPrice
        };
    }

    canScaleIn(orderId, currentPrice) {
        const position = this.positions.get(orderId);
        if (!position) return false;

        const attempts = this.scaleInAttempts.get(orderId) || 0;
        if (attempts >= this.config.maxScaleInAttempts) return false;

        const priceChange = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
        return priceChange <= -this.config.scaleInDip;
    }

    scaleIn(orderId, quantity, price) {
        const position = this.positions.get(orderId);
        if (!position) return false;

        const attempts = (this.scaleInAttempts.get(orderId) || 0) + 1;
        this.scaleInAttempts.set(orderId, attempts);

        const totalQuantity = position.quantity + quantity;
        position.entryPrice = (position.entryPrice * position.quantity + price * quantity) / totalQuantity;
        position.quantity = totalQuantity;

        return true;
    }

    shouldScaleOut(orderId, currentPrice) {
        const position = this.positions.get(orderId);
        if (!position) return false;

        const profit = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
        const nextLevel = this.config.scaleOutLevels.find(level => 
            profit >= level && !position.scaleOutLevels.includes(level));

        return nextLevel ? {
            level: nextLevel,
            percentage: this.config.scaleOutPercentages[this.config.scaleOutLevels.indexOf(nextLevel)]
        } : false;
    }

    scaleOut(orderId, percentage) {
        const position = this.positions.get(orderId);
        if (!position) return null;

        const scaleOutQuantity = position.quantity * (percentage / 100);
        position.quantity -= scaleOutQuantity;

        return scaleOutQuantity;
    }
}

module.exports = PositionManager; 