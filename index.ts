import { ethers } from "ethers";
import { httpProviderUrl, wssProviderUrl } from "./constants";
import decodeTransaction from "./scripts/decodeTransaction";
import sandwichTransaction from "./scripts/sandwichTransaction";

const provider = new ethers.providers.JsonRpcProvider(httpProviderUrl);
const wssProvider = new ethers.providers.WebSocketProvider(wssProviderUrl!);

console.log("Listen for swaps on UniswapV2 to sandwich...");

// Listen to transaction hashes in the mempool
wssProvider.on("pending", (txHash) => handleTransaction(txHash));

// Get transaction, decode it and sandwich
const handleTransaction = async (txHash: string) => {
  try {
    const targetTransaction = await provider.getTransaction(txHash);
    const decoded = await decodeTransaction(targetTransaction);
    const sandwich = await sandwichTransaction(decoded);
    if (sandwich) console.log("Sandwich successful!");
  } catch (error) {
    console.log(error);
  }
};
