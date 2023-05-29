require("dotenv").config();

const isMainnet = process.argv[2] == "mainnet";

const chainId = isMainnet ? 1 : 5;

const privateKey = isMainnet
  ? process.env.MAINNET_WALLET_PRIVATE_KEY
  : process.env.TESTNET_WALLET_PRIVATE_KEY;

const httpProviderUrl = isMainnet
  ? process.env.MAINNET_NODE_URL
  : process.env.TESTNET_NODE_URL;

const wssProviderUrl = isMainnet
  ? process.env.MAINNET_NODE_URL_WSS
  : process.env.TESTNET_NODE_URL_WSS;

const uniswapUniversalRouterAddress = isMainnet
  ? "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B"
  : "0x4648a43B2C14Da09FdF82B161150d3F634f40491";

const uniswapV2Router = isMainnet
  ? "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
  : "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D";

const wETHAddress = isMainnet
  ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  : "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

const uniswapV2FactoryAddress = isMainnet
  ? "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"
  : "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";

const gasBribe = process.env.GAS_BRIBE_IN_GWEI;
const buyAmount = process.env.BUY_AMOUNT_IN_WEI;

export {
  isMainnet,
  chainId,
  privateKey,
  wssProviderUrl,
  httpProviderUrl,
  uniswapUniversalRouterAddress,
  wETHAddress,
  uniswapV2FactoryAddress,
  uniswapV2Router,
  gasBribe,
  buyAmount,
};
