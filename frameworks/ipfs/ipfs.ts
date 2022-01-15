import uint8ArrayConcat from "uint8arrays/concat";
import all from "it-all";
import ipfs from "./ipfsClient";
export type AwaitIterable<T> = Iterable<T> | AsyncIterable<T>;

export type ToContent =
  | string
  | InstanceType<typeof String>
  | ArrayBufferView
  | ArrayBuffer
  | Blob
  | AwaitIterable<Uint8Array>
  | ReadableStream<Uint8Array>;

export interface IpfsMedia {
  content: ToContent;
}

export const uploadIPFS = async (
  ipfsMedia: IpfsMedia
): Promise<string | undefined> => {
  try {
    if (!ipfsMedia.content) {
      return "No content found";
    } else {
      const { cid } = await ipfs.add({
        content: ipfsMedia.content,
      });
      return cid.toString(); // To fetch data you need to use the full url ex: `https://ipfs.io/ipfs/${cid.toString()}/${fileName}`
    }
  } catch (error) {
    console.log(error);
  }
};

