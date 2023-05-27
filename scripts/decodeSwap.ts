import { ethers } from "ethers";

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

export { decodeSwap };
