import toast from "react-hot-toast";
import { ethers, utils } from "ethers";
import { Contract } from "@ethersproject/contracts";

import type { Web3Provider } from "@ethersproject/providers";

import NftHouse from "@artifacts/NftHouse.json";
import { networkHandler } from "./networkHandler";

export interface MetamaskError {
  message: string;
  code: number;
}
export interface Web3I {
  userAddress: string;
  provider: Web3Provider;
}

export interface HouseI extends Web3I {
  tokenUri: string;
  numberOfRenters: number;
  rentPrice: number;
  sellingPrice: number;
}

export interface NftPriceI extends Web3I {
  tokenId: string;
  amount: number;
}

export const mintHouse = async ({
  tokenUri,
  numberOfRenters,
  rentPrice,
  sellingPrice,
  provider,
  userAddress,
}: HouseI) => {
  try {
    if (!provider || !userAddress) {
      toast("no provider found");
      return;
    }
    await networkHandler(provider);
    const contract = new Contract(
      NftHouse.address,
      NftHouse.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const mintedHouseTokenId = await contract.mintHouse(
      tokenUri,
      numberOfRenters,
      ethers.utils.parseEther(String(rentPrice)),
      ethers.utils.parseEther(String(sellingPrice))
    );
    toast.success("Transaction Pending...Check your metamask wallet");
    await provider.waitForTransaction(mintedHouseTokenId.hash);
    toast.success("Transaction Confirmed...Campaign Created!");
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

export const rent = async ({
  tokenId,
  amount,
  userAddress,
  provider,
}: // eslint-disable-next-line consistent-return
NftPriceI) => {
  try {
    if (!provider || !userAddress) {
      toast("No provider found");
      return "";
    }

    await networkHandler(provider);

    const contract = new Contract(
      NftHouse.address,
      NftHouse.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const rentTransaction = await contract.payRent(tokenId, {
      value: ethers.utils.parseEther(String(amount)),
    });
    toast.success("Transaction Pending...Check your metamask wallet");
    return rentTransaction.hash;
  } catch (error) {
    if ((error as MetamaskError).code === 4001) {
      toast.error("transaction rejected");
      return "";
    }
    if ((error as MetamaskError).message.includes("revert")) {
      toast.error((error as MetamaskError).message || "transaction reverted");
    }
    toast.error("transaction failed");
  }
};

export const buy = async ({
  tokenId,
  amount,
  userAddress,
  provider,
}: // eslint-disable-next-line consistent-return
NftPriceI) => {
  try {
    if (!provider || !userAddress) {
      toast("No provider found");
      return "";
    }

    await networkHandler(provider);

    const contract = new Contract(
      NftHouse.address,
      NftHouse.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const buyTransaction = await contract.buy(tokenId, {
      value: ethers.utils.parseEther(String(amount)),
    });
    toast.success("Transaction Pending...Check your metamask wallet");
    return buyTransaction.hash;
  } catch (error) {
    if ((error as MetamaskError).code === 4001) {
      toast.error("transaction rejected");
      return "";
    }
    if ((error as MetamaskError).message.includes("revert")) {
      toast.error((error as MetamaskError).message || "transaction reverted");
    }
    toast.error("transaction failed");
  }
};

export const sell = async ({
  tokenId,
  amount,
  userAddress,
  provider,
}: // eslint-disable-next-line consistent-return
NftPriceI) => {
  try {
    if (!provider || !userAddress) {
      toast("No provider found");
      return "";
    }

    await networkHandler(provider);

    const contract = new Contract(
      NftHouse.address,
      NftHouse.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const sellTransaction = await contract.sell(
      tokenId,
      ethers.utils.parseEther(String(amount))
    );
    toast.success("Transaction Pending...Check your metamask wallet");
    return sellTransaction.hash;
  } catch (error) {
    if ((error as MetamaskError).code === 4001) {
      toast.error("transaction rejected");
      return "";
    }
    if ((error as MetamaskError).message.includes("revert")) {
      toast.error((error as MetamaskError).message || "transaction reverted");
    }
    toast.error("transaction failed");
  }
};

async function fetchHouse(tokenUri: string) {
  const houseInfo = await fetch(`https://infura-ipfs.io/ipfs/${tokenUri}`);
  const houseInfoJson = await houseInfo.json();

  return {
    name: String(houseInfoJson.name),
    description: String(houseInfoJson.description),
    image: `https://infura-ipfs.io/ipfs/${houseInfoJson.image}`,
  };
}

const getHouseByTokenId = async (tokenId: number) => {
  try {
    const localProvider = new ethers.providers.JsonRpcProvider(
      "https://matic-mumbai.chainstacklabs.com",
      {
        name: "polygon_testnet",
        chainId: 80001,
      }
    );

    const contract = new Contract(
      NftHouse.address,
      NftHouse.abi,
      localProvider
    );
    const house = await contract.getHouseByTokenId(tokenId);
    const { name, description, image } = await fetchHouse(house[2]);
    return {
      name,
      description,
      image,
      owner: house[0],
      tokenId: Number(house[1].toNumber()),
      tokenUri: house[2],
      numberOfRenters: Number(house[3].toNumber()),
      numberOfCurrentRenter: Number(house[4].toNumber()),
      rentPrice: utils.formatEther(house[5].toString()),
      sellingPrice: utils.formatEther(house[6].toString()),
    };
  } catch (error) {
    toast.error(`Error on fetching: ${error}`);
    return null;
  }
};
export const getHouses = async () => {
  try {
    const localProvider = new ethers.providers.JsonRpcProvider(
      "https://matic-mumbai.chainstacklabs.com",
      {
        name: "polygon_testnet",
        chainId: 80001,
      }
    );

    const contract = new Contract(
      NftHouse.address,
      NftHouse.abi,
      localProvider
    );
    const numberOfHouses = await contract.getHousesCount();
    const houses = new Array(numberOfHouses.toNumber()).fill(0);

    const housesInfo = await Promise.all(
      houses.map(async (house, index) => getHouseByTokenId(index))
    );
    return housesInfo;
  } catch (error) {
    toast.error(`Error on fetching: ${error}`);
    return null;
  }
};
