import { ReactNode } from "react";
import {
  Box,
  Flex,
  Link,
  Button,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import AccountModal from "@components/AccountModal";
import ConnectWallet from "@components/ConnectWallet";

const NavLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <Link
    px={2}
    py={1}
    rounded={"md"}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    href={href}
  >
    {children}
  </Link>
);

export default function Nav() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  return (
    <>
      <Box bg={useColorModeValue("gray.700", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Box>
            <NavLink href="/">
              <span>Home</span>
            </NavLink>
            <NavLink href="/campaign/create">
              <span>Create Project</span>
            </NavLink>
            <Button onClick={toggleColorMode} margin={3}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Box>

          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={7}>
              <ConnectWallet handleOpenModal={onOpen} />
              <AccountModal isOpen={isOpen} onClose={onClose} />
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
