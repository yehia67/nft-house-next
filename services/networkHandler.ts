import toast from "react-hot-toast";

import type { Web3Provider } from "@ethersproject/providers";
import type { MetamaskError } from "./smartContracts";

const networkHandler = async (provider: Web3Provider) => {
  try {
    if (!provider) {
      toast("provider is null");
      return;
    }
    const { chainId } = await provider.getNetwork();
    if (chainId !== 8001) {
      // @ts-ignore
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x13881" }], // chainId must be in hexadecimal numbers
      });
    }
  } catch (error) {
    if ((error as MetamaskError).message.includes("revert")) {
      toast.error("Transaction Reverted");
    }
    if ((error as MetamaskError).code === 4001) {
      toast.error("Transaction Rejected");
    }
    // eslint-disable-next-line no-console
    console.error(error);
  }
};

export default networkHandler;
