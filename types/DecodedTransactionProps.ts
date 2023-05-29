import { BigNumber, Transaction } from "ethers";

type DecodedTransactionProps = {
  transaction: Transaction;
  amountIn: BigNumber;
  minAmountOut: BigNumber;
  token: string;
};

export default DecodedTransactionProps;
