import React from "react";

import House from "@components/House";
import type { HouseProps } from "@components/House";

import { getHouseByTokenId } from "@services/smartContracts";

const HousePage = (props: HouseProps) => {
  return <House {...props} />;
};

export default HousePage;

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
  const house = await getHouseByTokenId(Number(id));
  if (!house) {
    return {
      props: {
        house: null,
      },
    };
  }

  const props = {
    name: house.name,
    description: house.description,
    imageUrl: house.image,
    owner: house.owner,
    tokenId: house.tokenId,
    tokenUri: house.tokenUri,
    numberOfRenters: house.numberOfRenters,
    rentPrice: house.rentPrice,
    sellingPrice: house.sellingPrice,
    availableForRent: house.numberOfRenters !== house.numberOfCurrentRenter,
  };
  return {
    props,
    revalidate: 120, // In seconds
  };
}
