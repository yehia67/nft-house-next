import toast from "react-hot-toast";
import { ethers, utils } from "ethers";
import { Contract } from "@ethersproject/contracts";

import type { Web3Provider } from "@ethersproject/providers";

import { networkHandler } from "./networkHandler";
import NftHouse from "@artifacts/NftHouse.json";

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
      console.log("no provider found");
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
    return mintedHouseTokenId;
  } catch (error) {
    if ((error as MetamaskError).message.includes("revert")) {
      toast.error("Transaction Reverted");
    }
    if ((error as MetamaskError).code === 4001) {
      toast.error("Transaction Rejected");
    }
    console.error(error);
  }
};

export const rent = async ({
  tokenId,
  amount,
  userAddress,
  provider,
}: NftPriceI) => {
  try {
    if (!provider || !userAddress) {
      console.log("no provider found");
      return;
    }

    await networkHandler(provider);

    const contract = new Contract(
      NftHouse.address,
      NftHouse.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const rent = await contract.payRent(tokenId, {
      value: ethers.utils.parseEther(String(amount)),
    });
    toast.success("Transaction Pending...Check your metamask wallet");
    return rent.hash;
  } catch (error) {
    console.log("error", error);
    if ((error as MetamaskError).message.includes("revert")) {
      toast.error("transaction reverted");
    }
    if ((error as MetamaskError).code === 4001) {
      toast.error("transaction rejected");
    }
    console.error(error);
  }
};

export const buy = async ({
  tokenId,
  amount,
  userAddress,
  provider,
}: NftPriceI) => {
  try {
    if (!provider || !userAddress) {
      console.log("no provider found");
      return;
    }

    await networkHandler(provider);

    const contract = new Contract(
      NftHouse.address,
      NftHouse.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const rent = await contract.buy(tokenId, {
      value: ethers.utils.parseEther(String(amount)),
    });
    toast.success("Transaction Pending...Check your metamask wallet");
    return rent.hash;
  } catch (error) {
    if ((error as MetamaskError).message.includes("revert")) {
      toast.error("transaction reverted");
    }
    if ((error as MetamaskError).code === 4001) {
      toast.error("transaction rejected");
    }
    console.error(error);
  }
};

export const sell = async ({
  tokenId,
  amount,
  userAddress,
  provider,
}: NftPriceI) => {
  try {
    if (!provider || !userAddress) {
      console.log("no provider found");
      return;
    }

    await networkHandler(provider);

    const contract = new Contract(
      NftHouse.address,
      NftHouse.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const sell = await contract.sell(
      tokenId,
      ethers.utils.parseEther(String(amount))
    );
    toast.success("Transaction Pending...Check your metamask wallet");
    return sell.hash;
  } catch (error) {
    if ((error as MetamaskError).message.includes("revert")) {
      toast.error("transaction reverted");
    }
    if ((error as MetamaskError).code === 4001) {
      toast.error("transaction rejected");
    }
    console.error(error);
  }
};
export const getHouseByTokenId = async (tokenId: number) => {
  try {
    const localProvider = new ethers.providers.AlchemyProvider("ropsten");

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
    console.error(error);
  }
};
export const getHouses = async () => {
  try {
    const localProvider = new ethers.providers.AlchemyProvider("ropsten");

    const contract = new Contract(
      NftHouse.address,
      NftHouse.abi,
      localProvider
    );
    const numberOfHouses = await contract.getHousesCount();
    const houses = new Array(numberOfHouses.toNumber()).fill(0);

    const housesInfo = await Promise.all(
      houses.map(async (house, index) => {
        return await getHouseByTokenId(index);
      })
    );
    return housesInfo;
  } catch (error) {
    console.error(error);
  }
};
const fetchHouse = async (tokenUri: string) => {
  const houseInfo = await fetch(`https://infura-ipfs.io/ipfs/${tokenUri}`);
  const houseInfoJson = await houseInfo.json();

  return {
    name: String(houseInfoJson.name),
    description: String(houseInfoJson.description),
    image: `https://infura-ipfs.io/ipfs/${houseInfoJson.image}`,
  };
};
