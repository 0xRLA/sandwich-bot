import { ethers } from "ethers";
import { httpProviderUrl, wssProviderUrl } from "./constants";
import decodeTransaction from "./scripts/decodeTransaction";
import sandwichTransaction from "./scripts/sandwichTransaction";

const provider = new ethers.providers.JsonRpcProvider(httpProviderUrl);
const wssProvider = new ethers.providers.WebSocketProvider(wssProviderUrl!);

// Listen to transaction hashes in the mempool
wssProvider.on("pending", (txHash) => handleTransaction(txHash));

// Get transaction, decode it and sandwich
const handleTransaction = async (txHash: string) => {
  try {
    const transaction = await provider.getTransaction(txHash);
    const decoded = await decodeTransaction(transaction);
    const sandwich = await sandwichTransaction(decoded);
    if (sandwich) console.log("Sandwich successful!");
  } catch (error) {
    return;
  }
};
