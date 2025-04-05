# Deployment Guide for Solana PumpSwap Sniper Bot

## Prerequisites
1. Node.js installed (v16+ recommended)
2. Git installed
3. API keys ready:
   - Helius API key
   - Sniperoo API key and wallet public key

## Deployment Steps

1. Clone the repository (if not already done):
   ```bash
   git clone <repository-url>
   cd sol_token_sniper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.backup` to `.env`
   - Fill in your API keys:
     ```
     HELIUS_HTTPS_URI="https://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY"
     HELIUS_WSS_URI="wss://mainnet.helius-rpc.com/?api-key=YOUR_HELIUS_API_KEY"
     SNIPEROO_API_KEY="YOUR_SNIPEROO_API_KEY"
     SNIPEROO_PUBKEY="YOUR_WALLET_PUBLIC_KEY"
     ```

4. Configure the bot in `src/config.ts`:
   - Set your desired SOL amount for trades
   - Configure stop loss and take profit percentages
   - Adjust rug check settings

5. Build the TypeScript code:
   ```bash
   npm run build
   ```

6. Start the bot:
   ```bash
   npm run start
   ```

## Production Deployment Tips

1. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name "solana-sniper"
   ```

2. Set up automatic restart:
   ```bash
   pm2 startup
   pm2 save
   ```

3. Monitor logs:
   ```bash
   pm2 logs solana-sniper
   ```

4. For VPS deployment:
   - Use a reliable VPS provider (AWS, DigitalOcean, etc.)
   - Minimum specs: 2GB RAM, 1 vCPU
   - Use a stable internet connection with low latency
   - Consider using a dedicated IP address

## Security Considerations

1. Never share your private keys
2. Keep your API keys secure
3. Regularly update dependencies
4. Monitor your bot's activity
5. Start with small amounts until you're confident in the bot's performance