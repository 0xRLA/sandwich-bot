import { BigNumber, Transaction } from "ethers";

type DecodedTransactionProps = {
  transaction: Transaction;
  amountIn: BigNumber;
  minAmountOut: BigNumber;
  targetToken: string;
};

export default DecodedTransactionProps;
