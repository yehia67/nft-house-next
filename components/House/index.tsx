import React from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  Button,
  NumberInput,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputField,
  NumberInputStepper,
  Spinner,
  Stack,
  Badge,
} from "@chakra-ui/react";
import toast from "react-hot-toast";
import Img from "next/image";
import { useEthers } from "@usedapp/core";
import type { Web3Provider } from "@ethersproject/providers";

import ProgressBar from "@components/ProgressBar";
import styles from "./styles.module.css";
import { buy, rent, sell } from "@services/smartContracts";

export interface HouseProps {
  name: string;
  description: string;
  imageUrl: string;
  owner: string;
  tokenId: string;
  tokenUri: string;
  numberOfRenters: number;
  rentPrice: number;
  sellingPrice: number;
  availableForRent: boolean;
}

function House({
  name,
  description,
  imageUrl,
  owner,
  tokenId,
  rentPrice,
  sellingPrice,
  availableForRent,
}: HouseProps) {
  const { library, account } = useEthers();
  const [transactionHash, setTransactionHash] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [ethAmount, setEthAmount] = React.useState(0);

  const handleRent = async () => {
    if (!account || !library) {
      toast.error("Connect To Metamask Please");
      return;
    }
    setIsLoading(true);
    const hash = await rent({
      userAddress: account as string,
      provider: library as Web3Provider,
      tokenId,
      amount: rentPrice,
    });
    if (!hash) {
      setIsLoading(false);
    }
    setTransactionHash(hash);
  };
  const handleBuy = async () => {
    if (!account || !library) {
      toast.error("Connect To Metamask Please");
      return;
    }
    setIsLoading(true);
    const hash = await buy({
      userAddress: account as string,
      provider: library as Web3Provider,
      tokenId,
      amount: sellingPrice,
    });
    if (!hash) {
      setIsLoading(false);
    }
    setTransactionHash(hash);
  };

  const handleSetPrice = async () => {
    if (!account || !library) {
      toast.error("Connect To Metamask Please");
      return;
    }
    setIsLoading(true);
    const hash = await sell({
      userAddress: account as string,
      provider: library as Web3Provider,
      tokenId,
      amount: ethAmount,
    });
    if (!hash) {
      setIsLoading(false);
    }
    setTransactionHash(hash);
  };

  return imageUrl && imageUrl.length > 0 ? (
    <Flex
      margin={["1.5rem 0", "1.5rem 0", "1.5rem 0", "4.5rem 0"]}
      flexDirection={["column-reverse", "column-reverse", "row"]}
      justifyContent="space-between"
    >
      <Box maxW="600px">
        <Heading
          fontSize={["1.6rem", "2rem", "2.3rem", "2.6rem"]}
          lineHeight="1.4"
          marginBottom="2rem"
          marginTop={["0.6rem", "0", "0", "0"]}
          padding="1rem"
          fontWeight="bold"
        >
          {name}
        </Heading>
        <Stack direction="row" spacing="1.5rem" margin="1rem">
          {owner === account && (
            <Badge colorScheme="red">You Own This House</Badge>
          )}
          {availableForRent && (
            <Badge colorScheme="green">Available For Rent</Badge>
          )}
          {sellingPrice > 0 && (
            <Badge colorScheme="green">For Sale {sellingPrice}</Badge>
          )}
          <Badge colorScheme="blue">House Rent {rentPrice}</Badge>
        </Stack>
        <Text
          fontSize={["1rem", "1rem", "1.2rem", "1.3rem"]}
          marginBottom="2.5rem"
          fontWeight="400"
          padding="1rem"
        >
          {description}
        </Text>
        {owner === account && (
          <Box display="flex" p={1} alignItems="center">
            <Text m={1} p={1}>
              Set Selling Price
            </Text>
            <NumberInput
              defaultValue={ethAmount}
              min={0}
              onChange={(valueAsString: string, valueAsNumber: number) =>
                setEthAmount(valueAsNumber)
              }
            >
              <NumberInputField />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
          </Box>
        )}

        <Box m={1} flexDirection={["column", "column", "row", "row"]} d="flex">
          <Button
            m={1}
            padding="30px 30px"
            fontWeight="600"
            fontSize={["15px", "16px", "16px", "18px"]}
            _hover={{
              backgroundColor: "orange.500",
              color: "white",
            }}
            onClick={() => handleRent()}
          >
            <Text mr="8px">&#9889;</Text>
            Rent
          </Button>
          {owner === account && (
            <Button
              m={1}
              padding="30px 30px"
              fontWeight="600"
              fontSize={["15px", "16px", "16px", "18px"]}
              _hover={{
                backgroundColor: "orange.500",
                color: "white",
              }}
              onClick={() => {
                handleSetPrice();
              }}
            >
              <Text mr="8px">&#128239;</Text> Sell
            </Button>
          )}
          {owner !== account && sellingPrice > 0 && (
            <Button
              m={1}
              padding="30px 30px"
              fontWeight="600"
              fontSize={["15px", "16px", "16px", "18px"]}
              _hover={{
                backgroundColor: "orange.500",
                color: "white",
              }}
              onClick={() => {
                handleBuy();
              }}
            >
              <Text mr="8px">&#128239;</Text> Buy for {sellingPrice}{" "}
              https://infura-ipfs.io
            </Button>
          )}
        </Box>
      </Box>

      <Box p={5}>
        <Img
          className={styles.image}
          src={imageUrl}
          alt="Image of funded project"
          width="700px"
          height="500px"
        />
      </Box>
    </Flex>
  ) : (
    <Spinner />
  );
}

export default House;
