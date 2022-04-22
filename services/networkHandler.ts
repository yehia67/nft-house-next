import type { Web3Provider } from "@ethersproject/providers";

export const networkHandler = async (provider: Web3Provider) => {
  try {
    if (!provider) {
      console.log("provider is null");
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
    console.log(error);
  }
};
