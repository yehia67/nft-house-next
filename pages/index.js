import React from "react";

import { Grid, Link, Spinner } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";

import Card from "@components/Card";
import { getHouses } from "@services/smartContracts";

export default function Home() {
  const { library, account } = useEthers();
  const [provider, setProvider] = React.useState();
  const [houses, setHouses] = React.useState([]);

  const handleGetHouses = React.useCallback(async () => {
    const newHouses = await getHouses();
    setHouses(newHouses);
  }, []);
  React.useEffect(() => {
    handleGetHouses();
    if (library) {
      setProvider(library);
    }
  }, [library, handleGetHouses]);

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap={3}>
      {houses.length === 0 ? (
        <Spinner
          display="flex"
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="blue.500"
          size="xl"
        />
      ) : (
        houses
          .slice(0)
          .reverse()
          .map((house) => (
            <Link
              key={`house/${house.tokenId}`}
              href={`house/${house.tokenId}`}
            >
              <Card
                name={house.name}
                imageUrl={house.image}
                goal={house.rentPrice}
                raisedAmount={house.numberOfRenters}
              />
            </Link>
          ))
      )}
    </Grid>
  );
}
