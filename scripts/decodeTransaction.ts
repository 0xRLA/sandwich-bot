import { Transaction, ethers } from "ethers";
import UniswapUniversalRouterV3Abi from "../abi/UniswapUniversalRouterV3.json";
import { uniswapUniversalRouterAddress, wETHAddress } from "../constants";
import { decodeSwap } from "./utils";
import DecodedTransactionProps from "../types/DecodedTransactionProps";

const uniswapV3Interface = new ethers.utils.Interface(
  UniswapUniversalRouterV3Abi
);

const decodeTransaction = async (
  transaction: Transaction
): Promise<DecodedTransactionProps | undefined> => {
  if (!transaction || !transaction.to) return;
  if (Number(transaction.value) == 0) return;
  if (
    transaction.to.toLowerCase() != uniswapUniversalRouterAddress.toLowerCase()
  ) {
    return;
  }

  let decoded;

  try {
    decoded = uniswapV3Interface.parseTransaction(transaction);
  } catch (e) {
    return;
  }

  // Make sure it's a UniswapV2 swap
  if (!decoded.args.commands.includes("08")) return;
  let swapPositionInCommands =
    decoded.args.commands.substring(2).indexOf("08") / 2;
  let inputPosition = decoded.args.inputs[swapPositionInCommands];
  decoded = await decodeSwap(inputPosition);
  if (!decoded) return;
  if (!decoded.hasTwoPath) return;
  if (decoded.recipient === 2) return;
  if (decoded.path[0].toLowerCase() != wETHAddress.toLowerCase()) return;

  return {
    transaction,
    amountIn: transaction.value,
    minAmountOut: decoded.minAmountOut,
    targetToken: decoded.path[1],
  };
};

export default decodeTransaction;
