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
import {
  fund,
  refund,
  claimFunds,
  getCampaignInfo,
  getUserFundsAmount,
} from "@services/smartContracts";

export interface CampaignProps {
  owner: string;
  contractAddress: string;
  name: string;
  description: string;
  goal: number;
  raisedAmount: number;
  status: string;
  ipfsHash: string;
}
interface CampaignState {
  raisedAmount: number;
  status: string;
}
function Campaign({
  owner,
  contractAddress,
  name,
  description,
  goal,
  raisedAmount,
  status,
  ipfsHash,
}: CampaignProps) {
  const { library, account } = useEthers();
  const [campaignInfo, setCampaignInfo] =
    React.useState<CampaignState | null>();

  const [fundAmount, setFundAmount] = React.useState("0");
  const [transactionHash, setTransactionHash] = React.useState("");
  const [currentUserFunding, setCurrentUserFunding] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleUserCurrentFunding = async () => {
    if (!account || !library) {
      return;
    }
    const userFunding = await getUserFundsAmount({
      userAddress: account,
      provider: library,
      contractAddress,
    });
    if (userFunding || userFunding === 0) {
      setCurrentUserFunding(userFunding);
    }
  };

  React.useEffect(() => {
    setCampaignInfo({ raisedAmount, status });
  }, [raisedAmount, status]);

  React.useEffect(() => {
    handleUserCurrentFunding();
  }, [account, library]);

  React.useEffect(() => {
    const updateCampaignInfo = async () => {
      if (transactionHash && transactionHash.length > 0 && library) {
        // wait for transaction to confirm
        await library.waitForTransaction(transactionHash);
        await handleUserCurrentFunding();
        const newCampaignInfo = await getCampaignInfo(contractAddress);
        if (!newCampaignInfo) {
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        setCampaignInfo({
          raisedAmount: newCampaignInfo.info.amountRaised,
          status: newCampaignInfo.info.status,
        });
        toast.success("Transaction confirmed!");
      }
    };
    updateCampaignInfo();
  }, [transactionHash, library, contractAddress]);

  const handleFund = async () => {
    if (!account || !library) {
      toast.error("Connect To Metamask Please");
      return;
    }
    setIsLoading(true);
    const hash = await fund(fundAmount, {
      userAddress: account as string,
      provider: library as Web3Provider,
      contractAddress,
    });
    if (!hash) {
      setIsLoading(false);
    }
    setTransactionHash(hash);
  };
  const handleClaimFund = async () => {
    if (!account || !library) {
      toast.error("Connect To Metamask Please");
      return;
    }
    setIsLoading(true);
    const hash = await claimFunds({
      userAddress: account as string,
      provider: library as Web3Provider,
      contractAddress,
    });
    if (!hash) {
      setIsLoading(false);
    }
    setTransactionHash(hash);
  };

  const handleRefund = async () => {
    if (!account || !library) {
      toast.error("Connect To Metamask Please");
      return;
    }
    setIsLoading(true);
    const hash = await refund({
      userAddress: account as string,
      provider: library as Web3Provider,
      contractAddress,
    });
    if (!hash) {
      setIsLoading(false);
    }
    setTransactionHash(hash);
  };

  return campaignInfo ? (
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
          {campaignInfo.status === "Funding" && (
            <Badge colorScheme="green">Active</Badge>
          )}
          {campaignInfo.status === "Ended" && (
            <Badge colorScheme="purple">Campaign Ended</Badge>
          )}
          {owner === account && (
            <Badge colorScheme="red">Your Own This Campaign</Badge>
          )}
          <Badge colorScheme="blue">
            {campaignInfo.raisedAmount} ETH Raised
          </Badge>
          <Badge colorScheme="purple"> {goal} ETH Campaign Goal </Badge>
        </Stack>
        <Text
          fontSize={["1rem", "1rem", "1.2rem", "1.3rem"]}
          marginBottom="2.5rem"
          fontWeight="400"
          padding="1rem"
        >
          {description}
        </Text>
        <Box display="flex" p={1} m={1} alignItems="center">
          {campaignInfo.status === "Ended" ? (
            <Text>Campaign Ended</Text>
          ) : (
            <ProgressBar
              collected={campaignInfo.raisedAmount}
              goal={goal}
              max={100}
            />
          )}
        </Box>

        {campaignInfo.status !== "Ended" && (
          <Box display="flex" p={1} alignItems="center">
            <Text m={1} p={1}>
              Amount You Want To Fund
            </Text>
            <NumberInput
              defaultValue={fundAmount}
              min={0}
              onChange={(valueAsString: string, valueAsNumber: number) =>
                setFundAmount(valueAsString)
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
            onClick={() => handleRefund()}
            disabled={
              campaignInfo.status === "Ended" || currentUserFunding === 0
            }
          >
            <Text mr="8px">&#9889;</Text>
            Refund
          </Button>
          <Button
            m={1}
            padding="30px 30px"
            fontWeight="600"
            fontSize={["15px", "16px", "16px", "18px"]}
            _hover={{
              backgroundColor: "orange.500",
              color: "white",
            }}
            onClick={() => handleFund()}
            disabled={campaignInfo.status === "Ended"}
          >
            <Text mr="8px">&#128239;</Text> Fund
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
                handleClaimFund();
              }}
              disabled={campaignInfo.status === "Ended"}
            >
              <Text mr="8px">&#128239;</Text> Claim Funds
            </Button>
          )}
          {isLoading && <Spinner m={5} />}
        </Box>
      </Box>

      <Box p={5}>
        <Img
          className={styles.image}
          src={`https://ipfs.io/ipfs/${ipfsHash}`}
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

export default Campaign;
