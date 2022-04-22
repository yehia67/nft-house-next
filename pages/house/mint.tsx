import { Box, ButtonGroup } from "@chakra-ui/react";
import { Formik } from "formik";
import { useEthers } from "@usedapp/core";
import type { Web3Provider } from "@ethersproject/providers";

import {
  InputControl,
  NumberInputControl,
  ResetButton,
  SubmitButton,
  TextareaControl,
} from "formik-chakra-ui";
import * as React from "react";
import * as Yup from "yup";

import { uploadIPFS } from "@frameworks/ipfs/ipfs";
import { mintHouse } from "@services/smartContracts";

interface MintFormI {
  houseName: string;
  description: string;
  rentAmount: number;
  numberOfRenters: number;
}

const initialValues = {
  houseName: "",
  description: "",
  rentAmount: 0,
  numberOfRenters: 0,
  houseImage: "",
};
const validationSchema = Yup.object({
  houseName: Yup.string().required(),
  description: Yup.string().required(),
  rentAmount: Yup.number().required().min(0),
  numberOfRenters: Yup.number().required().min(1),
  houseImage: Yup.object().nullable(),
});

function Mint() {
  const [ipfsHash, setIpfsHash] = React.useState("");
  const { account, library, activateBrowserWallet } = useEthers();

  const onSubmit = async (values: MintFormI) => {
    if (!account || account.length === 0 || typeof library === "undefined") {
      activateBrowserWallet();
    }
    const tokenUri = await uploadIPFS({
      content: JSON.stringify({
        name: values.houseName,
        description: values.description,
        image: ipfsHash,
        rentAmount: values.rentAmount,
        numberOfRenters: values.numberOfRenters,
      }),
    });

    await mintHouse({
      tokenUri: String(tokenUri),
      rentPrice: Number(values.rentAmount),
      numberOfRenters: Number(values.numberOfRenters),
      sellingPrice: 0,
      userAddress: `${account}`,
      provider: library as Web3Provider,
    });
  };
  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={validationSchema}
    >
      {({ handleSubmit, values, errors }) => (
        <Box
          borderWidth="1px"
          rounded="lg"
          shadow="1px 1px 3px rgba(0,0,0,0.3)"
          maxWidth={800}
          p={6}
          m="10px auto"
          as="form"
          onSubmit={handleSubmit as any}
        >
          <InputControl name="houseName" label="Your House Address" />
          <>
            <InputControl
              name="houseImage"
              label="Your house image will be uploaded to ipfs"
              inputProps={{
                type: "file",
                accept: "image/*",
                onChangeCapture: (
                  event: React.ChangeEvent<HTMLInputElement>
                ) => {
                  if (event && event.target && event.target.files) {
                    uploadIPFS({
                      content: event.target.files[0],
                    }).then((hash) => {
                      console.log("hash", hash);
                      setIpfsHash(hash as string);
                    });
                  }
                },
              }}
            />
          </>
          <TextareaControl name="description" label="Your house description" />

          <NumberInputControl name="rentAmount" label="Rent price" />
          <NumberInputControl
            name="numberOfRenters"
            label="Number of renters to your house"
          />

          <ButtonGroup mt={5}>
            <SubmitButton loadingText="Tx Pending..">Submit</SubmitButton>
            <ResetButton>Reset</ResetButton>
          </ButtonGroup>
        </Box>
      )}
    </Formik>
  );
}

export default Mint;
