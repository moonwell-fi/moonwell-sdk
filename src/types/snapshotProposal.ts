export type SnapshotProposal = {
  id: string;
  title: string;
  discussion: string;
  start: number;
  end: number;
  created: number;
  state: string;
  scores: {
    choice: string;
    percent: number;
    votes: number;
  }[];
  network: {
    id: number;
    name: string;
  };
};
