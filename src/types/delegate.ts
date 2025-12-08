export type Delegate = {
  name: string;
  avatar: string;
  wallet: string;
  pitch: {
    intro: string;
    url?: string;
  };
  proposals?: {
    all: {
      created: number;
      voted: number;
    };
  };
  votingPower?: {
    [chainId: string]: number;
  };
};
