import { BigNumber, ethers } from "ethers";
import uniswapPairByteCode from "../bytecode/uniswapPairByteCode";
import uniswapV2FactoryByteCode from "../bytecode/uniswapV2FactoryByteCode";
import UniswapV2PairAbi from "../abi/UniswapV2Pair.json";
import UniswapV2FactoryAbi from "../abi/UniswapV2Factory.json";
import {
  gasBribe,
  buyAmount,
  httpProviderUrl,
  privateKey,
  uniswapV2FactoryAddress,
  wETHAddress,
} from "../constants";
import DecodedTransactionProps from "../types/DecodedTransactionProps";
import PairProps from "../types/PairProps";

const provider = ethers.getDefaultProvider(httpProviderUrl);
const signer = new ethers.Wallet(privateKey!, provider);

const getPair = async (token: string) => {
  const pairFactory = new ethers.ContractFactory(
    UniswapV2PairAbi,
    uniswapPairByteCode,
    signer
  );

  const factoryUniswapFactory = new ethers.ContractFactory(
    UniswapV2FactoryAbi,
    uniswapV2FactoryByteCode,
    signer
  ).attach(uniswapV2FactoryAddress);

  const pairAddress = await factoryUniswapFactory.getPair(wETHAddress, token);

  try {
    const pair = pairFactory.attach(pairAddress);
    const reserves = await pair.getReserves();
    return { token0: reserves._reserve0, token1: reserves._reserve1 };
  } catch (e) {
    return false;
  }
};

const decodeSwap = async (input: string) => {
  const abiCoder = new ethers.utils.AbiCoder();
  const decodedParameters = abiCoder.decode(
    ["address", "uint256", "uint256", "bytes", "bool"],
    input
  );
  const breakdown = input.substring(2).match(/.{1,64}/g);

  let path: string[] = [];
  let hasTwoPath = true;
  if (!breakdown) return;
  if (breakdown.length != 9) {
    const pathOne = "0x" + breakdown[breakdown.length - 2].substring(24);
    const pathTwo = "0x" + breakdown[breakdown.length - 1].substring(24);
    path = [pathOne, pathTwo];
  } else {
    hasTwoPath = false;
  }

  return {
    //@ts-expect-error
    recipient: parseInt(decodedParameters[(0, 16)]),
    amountIn: decodedParameters[1],
    minAmountOut: decodedParameters[2],
    path,
    hasTwoPath,
  };
};

const getAmountOut = (
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber
) => {
  const amountInWithFee = amountIn.mul(997); // Uniswap fee of 0.3%
  const numerator = amountInWithFee.mul(reserveOut);
  const denominator = reserveIn.mul(1000).add(amountInWithFee);
  const amountOut = numerator.div(denominator);
  return amountOut;
};

const getAmounts = (decoded: DecodedTransactionProps, pairs: PairProps) => {
  const { transaction, amountIn, minAmountOut } = decoded;
  const { token0, token1 } = pairs;

  const maxGasFee = transaction.maxFeePerGas
    ? transaction.maxFeePerGas.add(gasBribe ?? 0)
    : gasBribe;

  const priorityFee = transaction.maxPriorityFeePerGas
    ? transaction.maxPriorityFeePerGas.add(gasBribe ?? 0)
    : gasBribe;

  let firstAmountOut = getAmountOut(BigNumber.from(buyAmount), token0, token1);
  const updatedReserveA = token0.add(buyAmount!);
  const updatedReserveB = token1.add(firstAmountOut.mul(997).div(1000));

  let secondBuyAmount = getAmountOut(
    amountIn,
    updatedReserveA,
    updatedReserveB
  );

  if (secondBuyAmount.lt(minAmountOut)) return false;
  const updatedReserveA2 = updatedReserveA.add(amountIn);
  const updatedReserveB2 = updatedReserveB.add(
    secondBuyAmount.mul(997).div(1000)
  );

  let thirdAmountOut = getAmountOut(
    firstAmountOut,
    updatedReserveB2,
    updatedReserveA2
  );

  return {
    maxGasFee,
    priorityFee,
    firstAmountOut,
    secondBuyAmount,
    thirdAmountOut,
  };
};

export { getPair, decodeSwap, getAmounts };
