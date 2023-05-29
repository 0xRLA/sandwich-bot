import { Transaction, ethers } from "ethers";
import UniswapUniversalRouterV3Abi from "../abi/UniswapUniversalRouterV3.json";
import { uniswapUniversalRouterV3Address, wETHAddress } from "../constants";
import { decodeSwap } from "./utils";
import DecodedTransactionProps from "../types/DecodedTransactionProps";

const uniswapV3Interface = new ethers.utils.Interface(
  UniswapUniversalRouterV3Abi
);

const decodeTransaction = async (
  transaction: Transaction
): Promise<DecodedTransactionProps | boolean> => {
  if (!transaction || !transaction.to) return false;
  if (Number(transaction.value) == 0) return false;
  if (
    transaction.to.toLowerCase() !=
    uniswapUniversalRouterV3Address.toLowerCase()
  ) {
    return false;
  }

  let decoded;

  try {
    decoded = uniswapV3Interface.parseTransaction(transaction);
  } catch (e) {
    return false;
  }

  // Make sure it's a UniswapV2 swap
  if (!decoded.args.commands.includes("08")) return false;
  let swapPositionInCommands =
    decoded.args.commands.substring(2).indexOf("08") / 2;
  let inputPosition = decoded.args.inputs[swapPositionInCommands];
  decoded = await decodeSwap(inputPosition);
  if (!decoded) return false;
  if (!decoded.hasTwoPath) return false;
  if (decoded.recipient === 2) return false;
  if (decoded.path[0].toLowerCase() != wETHAddress.toLowerCase()) return false;

  return {
    transaction,
    amountIn: transaction.value,
    minAmountOut: decoded.minAmountOut,
    token: decoded.path[1],
  };
};

export default decodeTransaction;
