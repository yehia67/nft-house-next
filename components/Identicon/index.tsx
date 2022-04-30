import React from "react";
import { useEthers } from "@usedapp/core";
// @ts-expect-error
import Jazzicon from "@metamask/jazzicon";
import styled from "@emotion/styled";

const StyledIdenticon = styled.div`
  height: 1rem;
  width: 1rem;
  border-radius: 1.125rem;
  background-color: black;
`;

export default function Identicon() {
  const ref = React.useRef<HTMLDivElement>();
  const { account } = useEthers();

  React.useEffect(() => {
    if (account && ref.current) {
      ref.current.innerHTML = "";
      ref.current.appendChild(Jazzicon(16, parseInt(account.slice(2, 10), 16)));
    }
  }, [account]);

  return <StyledIdenticon ref={ref as any} />;
}
