export default [
  {
    type: "function",
    name: "getVaultInfo",
    inputs: [
      {
        name: "_vault",
        type: "address",
        internalType: "address",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple",
        internalType: "struct MorphoViewsV2.VaultInfo",
        components: [
          {
            name: "vault",
            type: "address",
            internalType: "address",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "symbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "asset",
            type: "address",
            internalType: "address",
          },
          {
            name: "assetName",
            type: "string",
            internalType: "string",
          },
          {
            name: "assetSymbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "assetDecimals",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalAssets",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "underlyingPrice",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "curator",
            type: "address",
            internalType: "address",
          },
          {
            name: "adapterRegistry",
            type: "address",
            internalType: "address",
          },
          {
            name: "adapters",
            type: "tuple[]",
            internalType: "struct MorphoViewsV2.AdapterInfo[]",
            components: [
              {
                name: "adapter",
                type: "address",
                internalType: "address",
              },
              {
                name: "realAssets",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingVault",
                type: "address",
                internalType: "address",
              },
              {
                name: "underlyingVaultName",
                type: "string",
                internalType: "string",
              },
              {
                name: "underlyingVaultTotalAssets",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingVaultFee",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingVaultTimelock",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "allocationPercentage",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingMarkets",
                type: "tuple[]",
                internalType: "struct MorphoViewsV2.UnderlyingMarket[]",
                components: [
                  {
                    name: "marketId",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "collateralToken",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "collateralName",
                    type: "string",
                    internalType: "string",
                  },
                  {
                    name: "collateralSymbol",
                    type: "string",
                    internalType: "string",
                  },
                  {
                    name: "marketLiquidity",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "marketLltv",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "marketSupplyApy",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "marketBorrowApy",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getVaultsInfo",
    inputs: [
      {
        name: "morphoVaults",
        type: "address[]",
        internalType: "address[]",
      },
    ],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        internalType: "struct MorphoViewsV2.VaultInfo[]",
        components: [
          {
            name: "vault",
            type: "address",
            internalType: "address",
          },
          {
            name: "name",
            type: "string",
            internalType: "string",
          },
          {
            name: "symbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "asset",
            type: "address",
            internalType: "address",
          },
          {
            name: "assetName",
            type: "string",
            internalType: "string",
          },
          {
            name: "assetSymbol",
            type: "string",
            internalType: "string",
          },
          {
            name: "assetDecimals",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalAssets",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "totalSupply",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "underlyingPrice",
            type: "uint256",
            internalType: "uint256",
          },
          {
            name: "owner",
            type: "address",
            internalType: "address",
          },
          {
            name: "curator",
            type: "address",
            internalType: "address",
          },
          {
            name: "adapterRegistry",
            type: "address",
            internalType: "address",
          },
          {
            name: "adapters",
            type: "tuple[]",
            internalType: "struct MorphoViewsV2.AdapterInfo[]",
            components: [
              {
                name: "adapter",
                type: "address",
                internalType: "address",
              },
              {
                name: "realAssets",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingVault",
                type: "address",
                internalType: "address",
              },
              {
                name: "underlyingVaultName",
                type: "string",
                internalType: "string",
              },
              {
                name: "underlyingVaultTotalAssets",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingVaultFee",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingVaultTimelock",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "allocationPercentage",
                type: "uint256",
                internalType: "uint256",
              },
              {
                name: "underlyingMarkets",
                type: "tuple[]",
                internalType: "struct MorphoViewsV2.UnderlyingMarket[]",
                components: [
                  {
                    name: "marketId",
                    type: "bytes32",
                    internalType: "bytes32",
                  },
                  {
                    name: "collateralToken",
                    type: "address",
                    internalType: "address",
                  },
                  {
                    name: "collateralName",
                    type: "string",
                    internalType: "string",
                  },
                  {
                    name: "collateralSymbol",
                    type: "string",
                    internalType: "string",
                  },
                  {
                    name: "marketLiquidity",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "marketLltv",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "marketSupplyApy",
                    type: "uint256",
                    internalType: "uint256",
                  },
                  {
                    name: "marketBorrowApy",
                    type: "uint256",
                    internalType: "uint256",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    stateMutability: "view",
  },
] as const;
