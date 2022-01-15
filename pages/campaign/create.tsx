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
import { createCampaign } from "@services/smartContracts";

interface CreateFormI {
  projectName: string;
  description: string;
  ethAmount: number;
}

const initialValues = {
  projectName: "",
  description: "",
  ethAmount: 0,
  projectImage: "",
};
const validationSchema = Yup.object({
  projectName: Yup.string().required(),
  description: Yup.string().required(),
  ethAmount: Yup.number().required().min(0),
  projectImage: Yup.object().nullable(),
});

const Create = () => {
  const [ipfsHash, setIpfsHash] = React.useState("");
  const { account, library, activateBrowserWallet } = useEthers();

  const onSubmit = async (values: CreateFormI) => {
    if (!account || account.length === 0 || typeof library === "undefined") {
      activateBrowserWallet();
    }
    await createCampaign(
      {
        name: values.projectName,
        description: values.description,
        ipfsHash,
        goal: `${values.ethAmount}`,
      },
      { userAddress: `${account}`, provider: library as Web3Provider }
    );
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
          <InputControl name="projectName" label="Your Project Name" />
          <>
            <InputControl
              name="projectImage"
              label="Your project image will be uploaded to ipfs"
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
          <TextareaControl
            name="description"
            label="Your project description"
          />

          <NumberInputControl
            name="ethAmount"
            label="Amount of ETH that you need (max 120)"
          />

          <ButtonGroup mt={5}>
            <SubmitButton loadingText={"Tx Pending.."}>Submit</SubmitButton>
            <ResetButton>Reset</ResetButton>
          </ButtonGroup>
        </Box>
      )}
    </Formik>
  );
};

export default Create;
