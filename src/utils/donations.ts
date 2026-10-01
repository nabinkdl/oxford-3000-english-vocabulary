export interface DonationWallet {
  id: string;
  label: string;
  network: string;
  symbol: string;
  address: string;
  explorerUrl: string;
  note: string;
  icon: string;
}

export const DONATION_WALLETS: DonationWallet[] = [
  {
    id: 'solana',
    label: 'Solana',
    network: 'Solana',
    symbol: 'SOL',
    address: 'B7hKfKzg8VfRk4wmG7eBFKEXqwwC8p3VYc2A1BG9sSKm',
    explorerUrl: 'https://solscan.io/account/B7hKfKzg8VfRk4wmG7eBFKEXqwwC8p3VYc2A1BG9sSKm',
    note: 'Send only SOL or Solana tokens to this address.',
    icon: '/coins/sol.svg',
  },
  {
    id: 'tron',
    label: 'Tron',
    network: 'Tron',
    symbol: 'TRX',
    address: 'TRbsuapFCZi8h7Je49Jzjhz2oSeLnKN8Ej',
    explorerUrl: 'https://tronscan.org/#/address/TRbsuapFCZi8h7Je49Jzjhz2oSeLnKN8Ej',
    note: 'Send only TRX or TRC-20 tokens to this address.',
    icon: '/coins/trx.svg',
  },
  {
    id: 'bnb',
    label: 'BNB Chain',
    network: 'BNB Chain',
    symbol: 'BNB',
    address: '0xcf6102a38f0c620236c479E53A3988Aa1BF8B817',
    explorerUrl: 'https://bscscan.com/address/0xcf6102a38f0c620236c479E53A3988Aa1BF8B817',
    note: 'Send only BNB or BEP-20 tokens on BNB Chain.',
    icon: '/coins/bnb.svg',
  },
  {
    id: 'ethereum',
    label: 'Ethereum',
    network: 'Ethereum',
    symbol: 'ETH',
    address: '0xcf6102a38f0c620236c479E53A3988Aa1BF8B817',
    explorerUrl: 'https://etherscan.io/address/0xcf6102a38f0c620236c479E53A3988Aa1BF8B817',
    note: 'Send only ETH or ERC-20 tokens on Ethereum.',
    icon: '/coins/eth.svg',
  },
  {
    id: 'bitcoin',
    label: 'Bitcoin',
    network: 'Bitcoin',
    symbol: 'BTC',
    address: 'bc1qp5y66zacyjas0qk8xz0g443tlpvpanzwhncche',
    explorerUrl: 'https://mempool.space/address/bc1qp5y66zacyjas0qk8xz0g443tlpvpanzwhncche',
    note: 'Send only BTC to this SegWit address.',
    icon: '/coins/btc.svg',
  },
];
