export default [
  {
    inputs: [
      {
        internalType: "contract MGlimmer",
        name: "mGlimmer_",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    constant: true,
    inputs: [],
    name: "mGlimmer",
    outputs: [
      {
        internalType: "contract MGlimmer",
        name: "",
        type: "address",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "borrower",
        type: "address",
      },
    ],
    name: "repayBehalf",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "address",
        name: "borrower",
        type: "address",
      },
      {
        internalType: "contract MGlimmer",
        name: "mGlimmer_",
        type: "address",
      },
    ],
    name: "repayBehalfExplicit",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
] as const;
