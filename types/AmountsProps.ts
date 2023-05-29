import { BigNumber } from "ethers";

type AmountsProps = {
  maxGasFee: BigNumber | undefined;
  priorityFee: BigNumber | undefined;
  firstAmountOut: BigNumber | undefined;
  secondBuyAmount: BigNumber | undefined;
  thirdAmountOut: BigNumber | undefined;
};

export default AmountsProps;
