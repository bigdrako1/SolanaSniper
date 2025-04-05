export interface NewTokenRecord {
  id?: number; // Optional because it's added by the database
  time: number;
  name: string;
  mint: string;
  creator: string;
  duplicate_count?: number; // Added to track how many times this token/creator has appeared
  is_scam?: boolean; // Flag to mark tokens identified as scams
  is_rugged?: boolean; // Flag to mark tokens identified as rugged
}
export interface MintsDataReponse {
  tokenMint?: string;
  solMint?: string;
}
export interface RugResponseExtended {
  mint: string;
  tokenProgram: string;
  creator: string;
  token: {
    mintAuthority: string | null;
    supply: number;
    decimals: number;
    isInitialized: boolean;
    freezeAuthority: string | null;
  };
  token_extensions: unknown | null;
  tokenMeta: {
    name: string;
    symbol: string;
    uri: string;
    mutable: boolean;
    updateAuthority: string;
  };
  topHolders: {
    address: string;
    amount: number;
    decimals: number;
    pct: number;
    uiAmount: number;
    uiAmountString: string;
    owner: string;
    insider: boolean;
  }[];
  freezeAuthority: string | null;
  mintAuthority: string | null;
  risks: {
    name: string;
    value: string;
    description: string;
    score: number;
    level: string;
  }[];
  score: number;
  fileMeta: {
    description: string;
    name: string;
    symbol: string;
    image: string;
  };
  lockerOwners: Record<string, unknown>;
  lockers: Record<string, unknown>;
  lpLockers: unknown | null;
  markets: {
    pubkey: string;
    marketType: string;
    mintA: string;
    mintB: string;
    mintLP: string;
    liquidityA: string;
    liquidityB: string;
  }[];
  totalMarketLiquidity: number;
  totalLPProviders: number;
  rugged: boolean;
}

// New interface to track creator reputation
export interface CreatorReputation {
  creator: string;
  scam_count: number;
  rugged_count: number;
  total_tokens: number;
}
