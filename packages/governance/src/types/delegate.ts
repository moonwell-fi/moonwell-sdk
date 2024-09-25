export type Delegate = {
  name: string;
  avatar: string;
  wallet: string;
  pitch: {
    intro: string;
    url: string;
  };
  proposals?: {
    [chainId: string]: {
      created: number;
      voted: number;
    };
  };
  votingPower?: {
    [chainId: string]: number;
  };
};
