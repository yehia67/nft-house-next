import { Toaster } from "react-hot-toast";
import { ChakraProvider } from "@chakra-ui/react";
import { DAppProvider } from "@usedapp/core";

import Header from "@components/Header";

export interface LayoutProps {
  children: React.ReactElement;
}
export default function Layout({ children }: LayoutProps) {
  return (
    <DAppProvider config={{ readOnlyChainId: 3 }}>
      <ChakraProvider>
        <Header></Header>
        <Toaster />
        {children}
      </ChakraProvider>
    </DAppProvider>
  );
}
