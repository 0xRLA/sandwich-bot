require("dotenv").config();

const isMainnet = process.argv[2] == "mainnet";

const httpProviderUrl = isMainnet
  ? process.env.MAINNET_NODE_URL
  : process.env.TESTNET_NODE_URL;

const wssProviderUrl = isMainnet
  ? process.env.MAINNET_NODE_URL_WSS
  : process.env.TESTNET_NODE_URL_WSS;

const uniswapUniversalRouterV3Address = isMainnet
  ? "0xEf1c6E67703c7BD7107eed8303Fbe6EC2554BF6B"
  : "0x4648a43B2C14Da09FdF82B161150d3F634f40491";

const wETHAddress = isMainnet
  ? "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  : "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6";

export {
  isMainnet,
  wssProviderUrl,
  httpProviderUrl,
  uniswapUniversalRouterV3Address,
  wETHAddress,
};
