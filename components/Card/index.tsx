import { Image, Box, Text } from '@chakra-ui/react';
import ProgressBar from '@components/ProgressBar';

interface CardProps {
  name: string;
  goal: number;
  raisedAmount: number;
  imageUrl: string;
}
export default function Card({
  name,
  goal,
  raisedAmount,
  imageUrl,
}: CardProps) {
  return (
    <Box
      borderWidth="1px"
      m={2}
      borderRadius="lg"
      overflow="hidden"
      height="20rem"
    >
      <Image
        p={5}
        width="100%"
        height="10rem"
        src={imageUrl}
        alt="Image of funded project"
      />

      <Box p="6">
        <Box
          mt="1"
          fontWeight="semibold"
          as="h4"
          lineHeight="tight"
          isTruncated
        >
          {name}
        </Box>

        <Box display="flex" alignItems="baseline">
          Rent Price:
          {' '}
          {goal}
          {' '}
          MATIC
        </Box>
        <Box display="flex" alignItems="baseline">
          Number Of Renter:
          {' '}
          {raisedAmount}
          {' '}
          Renter
        </Box>
      </Box>
    </Box>
  );
}
