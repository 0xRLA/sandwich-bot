import { ethers } from "ethers";
import { httpProviderUrl, wssProviderUrl } from "./constants";
import decodeTransaction from "./scripts/decodeTransaction";
import getPair from "./scripts/utils";
import sandwichTransaction from "./scripts/sandwichTransaction";

const provider = new ethers.providers.JsonRpcProvider(httpProviderUrl);
const wssProvider = new ethers.providers.WebSocketProvider(wssProviderUrl!);

// Listen to all transaction hashes available in the mem pool
wssProvider.on("pending", (txHash) => handleTransaction(txHash));

// Get transaction, decode it and sandwich
const handleTransaction = async (txHash: string) => {
  try {
    const transaction = await provider.getTransaction(txHash);
    const decoded = await decodeTransaction(transaction);
    if (!decoded) return false
    const sandwich = await sandwichTransaction(decoded)
  } catch (error) {
    return;
  }
};
