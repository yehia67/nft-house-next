import toast from "react-hot-toast";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";

import type { Web3Provider } from "@ethersproject/providers";

import { networkHandler } from "./networkHandler";
import CampaignFactory from "@artifacts/CampaignFactory.json";
import Campaign from "@artifacts/Campaign.json";

export interface MetamaskError {
  message: string;
  code: number;
}
export interface Web3I {
  userAddress: string;
  contractAddress?: string;
  provider: Web3Provider;
}

export interface CampaignI {
  name: string;
  description: string;
  ipfsHash: string;
  goal: string;
}
export interface CampaignInfoI {
  contractAddress: string;
  info: {
    owner: string;
    status: string;
    name: string;
    description: string;
    ipfsHash: string;
    goal: number;
    amountRaised: number;
  };
}
const status = Object.freeze(["Funding", "Ended"]);
export const getCampaignInfo = async (
  campaignAddress: string
): Promise<CampaignInfoI | undefined> => {
  try {
    const localProvider = new ethers.providers.AlchemyProvider("ropsten");
    const contract = new Contract(campaignAddress, Campaign.abi, localProvider);
    const campaignInfo = await contract.callStatic["campaignInfo"]();
    return {
      contractAddress: campaignAddress,
      info: {
        owner: campaignInfo.owner,
        name: campaignInfo.name,
        description: campaignInfo.description,
        ipfsHash: campaignInfo.ipfsHash,
        status: status[campaignInfo.state],
        goal: Number(ethers.utils.formatEther(campaignInfo.goal.toString())),
        amountRaised: Number(
          ethers.utils.formatEther(campaignInfo.amountRaised.toString())
        ),
      },
    };
  } catch (error) {
    console.error(error);
  }
};

export const getCampaigns = async () => {
  try {
    const localProvider = new ethers.providers.AlchemyProvider("ropsten");

    const contract = new Contract(
      CampaignFactory.address,
      CampaignFactory.abi,
      localProvider
    );
    const deployedCampaigns = await contract.callStatic[
      "getDeployedCampaigns"
    ]();
    return await Promise.all(
      deployedCampaigns.map(async (address: string) => {
        return await getCampaignInfo(address);
      })
    );
  } catch (error) {
    console.error(error);
  }
};

export const createCampaign = async (
  { name, description, ipfsHash, goal }: CampaignI,
  { userAddress, provider }: Web3I
) => {
  try {
    if (!provider || !userAddress) {
      console.log("no provider found");
      return;
    }
    await networkHandler(provider);
    const contract = new Contract(
      CampaignFactory.address,
      CampaignFactory.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const deployedCampaigns = await contract.createCampaign(
      name,
      description,
      ipfsHash,
      ethers.utils.parseEther(goal)
    );
    toast.success("Transaction Pending...Check your metamask wallet");
    await provider.waitForTransaction(deployedCampaigns.hash);
    toast.success("Transaction Confirmed...Campaign Created!");
    return deployedCampaigns;
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

export const fund = async (
  fundAmount: string,
  { userAddress, provider, contractAddress }: Web3I
) => {
  try {
    if (!provider || !userAddress || !contractAddress) {
      console.log("no provider found");
      return;
    }

    await networkHandler(provider);

    const contract = new Contract(
      contractAddress,
      Campaign.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const funds = await contract.fund({
      value: ethers.utils.parseEther(fundAmount),
    });
    toast.success("Transaction Pending...Check your metamask wallet");
    return funds.hash;
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

export const refund = async ({
  userAddress,
  provider,
  contractAddress,
}: Web3I) => {
  try {
    if (!provider || !userAddress || !contractAddress) {
      console.log("no provider found");
      return;
    }

    await networkHandler(provider);

    const contract = new Contract(
      contractAddress,
      Campaign.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const refund = await contract.refund();
    toast.success("Transaction Pending...Check your metamask wallet");
    return refund.hash;
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

export const claimFunds = async ({
  userAddress,
  provider,
  contractAddress,
}: Web3I) => {
  try {
    if (!provider || !userAddress || !contractAddress) {
      console.log("no provider found");
      return;
    }

    await networkHandler(provider);

    const contract = new Contract(
      contractAddress,
      Campaign.abi,
      provider.getSigner(userAddress).connectUnchecked()
    );
    const funds = await contract.claimFunds();
    toast.success("Transaction Pending...Check your metamask wallet");
    return funds.hash;
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

export const getUserFundsAmount = async ({
  userAddress,
  provider,
  contractAddress,
}: Web3I) => {
  try {
    if (!provider || !userAddress || !contractAddress) {
      console.log("no provider found");
      return;
    }
    const contract = new Contract(contractAddress, Campaign.abi, provider);
    const funds = await contract.connect(userAddress).getFunds();
    return Number(ethers.utils.formatEther(funds.toString()));
  } catch (error) {
    console.error(error);
  }
};
