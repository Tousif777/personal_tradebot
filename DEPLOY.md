# Ubuntu Server Deployment Guide

This guide will help you deploy the trading bot on an Ubuntu server for 24/7 operation.

## 1. Server Setup

First, connect to your Ubuntu server via SSH:
```bash
ssh your_username@your_server_ip
```

## 2. Install Required Software

Update your system and install Node.js and other requirements:
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install PM2 globally
sudo npm install -g pm2

# Verify installations
node --version
npm --version
git --version
pm2 --version
```

## 3. Clone and Setup the Bot

```bash
# Create directory for the bot
mkdir -p ~/trading-bot
cd ~/trading-bot

# Clone your repository (replace with your actual repository URL)
git clone https://github.com/yourusername/trading-bot.git .

# Install dependencies
npm install

# Copy and edit environment file
cp .env.example .env
nano .env
```

## 4. Configure Environment Variables

Edit your `.env` file with your Binance API credentials and trading parameters:
```bash
# Press Ctrl + X to exit nano
# Press Y to save changes
# Press Enter to confirm the filename
```

## 5. Start the Bot

```bash
# Start the bot with PM2
pm2 start src/index.js --name trading-bot

# Make PM2 start the bot automatically on server reboot
pm2 startup ubuntu
# Run the command that PM2 outputs

# Save the PM2 process list
pm2 save
```

## 6. Monitoring

### View bot status:
```bash
pm2 status
```

### Monitor bot in real-time:
```bash
pm2 monit
```

### View logs:
```bash
# View all logs
pm2 logs trading-bot

# View only error logs
tail -f error.log

# View combined logs
tail -f combined.log
```

## 7. Maintenance Commands

```bash
# Stop the bot
pm2 stop trading-bot

# Restart the bot
pm2 restart trading-bot

# Delete the bot from PM2
pm2 delete trading-bot

# Update the bot (when you have new code)
git pull
npm install
pm2 restart trading-bot
```

## 8. Security Recommendations

1. Set up a firewall:
```bash
sudo ufw enable
sudo ufw allow ssh
```

2. Create a dedicated user for the bot:
```bash
sudo adduser trading-bot
sudo usermod -aG sudo trading-bot
```

3. Set proper file permissions:
```bash
chmod 600 .env
chmod 644 *.log
```

## 9. Backup

Set up daily log rotation:
```bash
sudo nano /etc/logrotate.d/trading-bot

# Add the following configuration:
/home/your_username/trading-bot/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

## 10. Troubleshooting

If the bot crashes:
1. Check error logs:
```bash
pm2 logs trading-bot --err
```

2. Verify API connectivity:
```bash
# Check if Binance is accessible
curl -v https://api.binance.com/api/v3/ping
```

3. Check system resources:
```bash
htop
```

## Important Notes

1. Always keep your `.env` file secure and never share it
2. Regularly monitor the bot's performance
3. Keep the system updated
4. Backup your configuration files
5. Monitor disk space for logs:
```bash
df -h
```

For any issues, check:
- PM2 logs
- Node.js application logs
- System logs (`/var/log/syslog`) 