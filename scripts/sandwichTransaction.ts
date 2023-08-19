import { Transaction, ethers } from "ethers";
import {
  FlashbotsBundleProvider,
  FlashbotsBundleResolution,
} from "@flashbots/ethers-provider-bundle";
import DecodedTransactionProps from "../types/DecodedTransactionProps";
import { uniswapV2Router, getAmounts, getPair, erc20Factory } from "./utils";
import {
  chainId,
  httpProviderUrl,
  privateKey,
  wETHAddress,
  buyAmount,
} from "../constants";
import AmountsProps from "../types/AmountsProps";

const provider = ethers.getDefaultProvider(httpProviderUrl);
const signer = new ethers.Wallet(privateKey!, provider);
const deadline = Math.floor(Date.now() / 1000) + 60 * 60; // 1 hour from now

const sandwichTransaction = async (
  decoded: DecodedTransactionProps | undefined
): Promise<boolean> => {
  if (!decoded) return false;
  console.log(decoded.targetToken);
  const pairs = await getPair(decoded.targetToken);
  if (!pairs) return false;
  const amounts = getAmounts(decoded, pairs);
  if (!amounts) return false;

  const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    signer
  );

  // 1. Swap ETH for tokens
  const t1 = await firstTransaction(decoded, amounts);

  console.log(t1);

  // 2. Wrap target transacton
  const t2 = secondTransaction(decoded.transaction);

  // 3. Approve UniswapV2Router to spend token
  const t3 = await thirdTransaction(decoded, amounts);

  // 4. Swap tokens for ETH
  const t4 = await forthTransaction(decoded, amounts);

  // Sign sandwich transaction
  const bundle = await signBundle([t1, t2, t3, t4], flashbotsProvider);

  // Finally try to get sandwich transaction included in block
  const result = await sendBundle(bundle, flashbotsProvider);

  if (result) console.log("bundle: ", bundle);

  return result ?? false;
};

const firstTransaction = async (
  decoded: DecodedTransactionProps,
  amounts: AmountsProps
) => {
  console.log(amounts);
  const transaction = await uniswapV2Router.swapExactETHForTokens(
    amounts.firstAmountOut,
    [wETHAddress, decoded.targetToken],
    signer.address,
    deadline,
    {
      value: buyAmount,
      type: 2,
      maxFeePerGas: amounts.maxGasFee,
      maxPriorityFeePerGas: amounts.priorityFee,
      gasLimit: 300000,
    }
  );

  let firstTransaction = {
    signer: signer,
    transaction: transaction,
  };

  firstTransaction.transaction = {
    ...firstTransaction.transaction,
    chainId,
  };
  return firstTransaction;
};

const secondTransaction = (transaction: Transaction) => {
  const victimsTransactionWithChainId = {
    //@ts-expect-error
    chainId,
    ...transaction,
  };
  let signedMiddleTransaction;

  try {
    signedMiddleTransaction = {
      signedTransaction: ethers.utils.serializeTransaction(
        victimsTransactionWithChainId,
        {
          r: victimsTransactionWithChainId.r!,
          s: victimsTransactionWithChainId.s,
          v: victimsTransactionWithChainId.v,
        }
      ),
    };
  } catch (error: any) {
    console.log("Error signedMiddleTransaction: ", error);
    return;
  }
  return signedMiddleTransaction;
};

const thirdTransaction = async (
  decoded: DecodedTransactionProps,
  amounts: AmountsProps
) => {
  const erc20 = erc20Factory.attach(decoded.targetToken);
  let thirdTransaction = {
    signer: signer,
    transaction: await erc20.populateTransaction.approve(
      uniswapV2Router,
      amounts.firstAmountOut,
      {
        value: "0",
        type: 2,
        maxFeePerGas: amounts.maxGasFee,
        maxPriorityFeePerGas: amounts.priorityFee,
        gasLimit: 300000,
      }
    ),
  };
  thirdTransaction.transaction = {
    ...thirdTransaction.transaction,
    chainId,
  };
  return thirdTransaction;
};

const forthTransaction = async (
  decoded: DecodedTransactionProps,
  amounts: AmountsProps
) => {
  let fourthTransaction = {
    signer: signer,
    transaction: await uniswapV2Router.swapExactTokensForETH(
      amounts.firstAmountOut,
      amounts.thirdAmountOut,
      [decoded.targetToken, wETHAddress],
      signer.address,
      deadline,
      {
        value: "0",
        type: 2,
        maxFeePerGas: amounts.maxGasFee,
        maxPriorityFeePerGas: amounts.priorityFee,
        gasLimit: 300000,
      }
    ),
  };
  fourthTransaction.transaction = {
    ...fourthTransaction.transaction,
    chainId,
  };
  return fourthTransaction;
};

const signBundle = async (
  transactions: any,
  flashbotsProvider: FlashbotsBundleProvider
) => {
  const transactionsArray = [...transactions];
  const signedBundle = await flashbotsProvider.signBundle(transactionsArray);
  console.log(signedBundle);
  return signedBundle;
};

const sendBundle = async (
  bundle: any,
  flashbotsProvider: FlashbotsBundleProvider
) => {
  const blockNumber = await provider.getBlockNumber();
  console.log("Simulating...");
  const simulation = await flashbotsProvider.simulate(bundle, blockNumber + 1);
  //@ts-expect-error
  if (simulation.firstRevert) {
    //@ts-expect-error
    console.log("Simulation error", simulation.firstRevert);
    return false;
  }
  console.log("Simulation success");

  // 12. Send transactions with flashbots
  let bundleSubmission: { bundleHash: any; wait: () => any };
  flashbotsProvider
    .sendRawBundle(bundle, blockNumber + 1)
    .then((_bundleSubmission: any) => {
      bundleSubmission = _bundleSubmission;
      console.log("Bundle submitted", bundleSubmission.bundleHash);
      return bundleSubmission.wait();
    })
    .then(async (waitResponse: any) => {
      console.log("Wait response", FlashbotsBundleResolution[waitResponse]);
      if (waitResponse == FlashbotsBundleResolution.BundleIncluded) {
        console.log("Bundle Included!");
        return true;
      } else if (
        waitResponse == FlashbotsBundleResolution.AccountNonceTooHigh
      ) {
        console.log("The transaction has been confirmed already");
      }
      return false;
    });
};

export default sandwichTransaction;
