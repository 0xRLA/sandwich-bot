import DecodedTransactionProps from "../types/DecodedTransactionProps";
import { getAmounts, getPair } from "./utils";

const sandwichTransaction = async (decoded: DecodedTransactionProps) => {
  const pairs = await getPair(decoded.token);
  if (!pairs) return false;
  const amounts = getAmounts(decoded, pairs);
  if (!amounts) return false;
  const {
    maxGasFee,
    priorityFee,
    firstAmountOut,
    secondBuyAmount,
    thirdAmountOut,
  } = amounts;
};

export default sandwichTransaction;
