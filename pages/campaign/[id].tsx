import React from "react";

import Campaign from "@components/Campaign";
import type { CampaignProps } from "@components/Campaign";

import { getCampaignInfo } from "@services/smartContracts";

const CampaignPage = (props: CampaignProps) => {
  return <Campaign {...props} />;
};

export default CampaignPage;

export const getStaticPaths = async () => {
  const staticPaths: {
    params: { id: string };
  }[] = [];

  return {
    paths: staticPaths,
    fallback: true,
  };
};

interface PageContext {
  params: {
    id: string;
  };
  fallback: true;
}

export async function getStaticProps(context: PageContext) {
  const { id } = context.params;

  const campaign = await getCampaignInfo(id);
  if (!campaign) {
    return {
      props: {
        campaign: null,
      },
    };
  }

  const props = {
    owner: campaign.info.owner,
    contractAddress: id,
    name: campaign.info.name,
    description: campaign.info.description,
    goal: campaign.info.goal,
    raisedAmount: campaign.info.amountRaised,
    ipfsHash: campaign.info.ipfsHash,
    status: campaign.info.status,
  };
  return {
    props,
    revalidate: 120, // In seconds
  };
}
