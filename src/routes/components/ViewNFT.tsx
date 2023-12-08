import { component$, useSignal, useTask$ } from "@builder.io/qwik";
import Web3 from "web3";
import * as fs from "fs";
import { ShowNFT } from "./ShowNFT";
import { server$ } from "@builder.io/qwik-city";

export const View = component$(({ account }: any) => {
  const nftList = useSignal<any>({});

  const getNFTList = server$(() => {
    const nftListText = fs.readFileSync("src/contracts.json", "utf8");
    return JSON.parse(nftListText);
  });

  useTask$(async () => {
    nftList.value = await getNFTList();
  });

  const address = account.value && Web3.utils.toChecksumAddress(account.value);

  return (
    <div class="viewNFT">
      <h1>My Contract</h1>
      {
        // get all NFTs of key is my address from contract
        (nftList.value as any)[address]?.length > 0 &&
          (nftList.value as any)[address].map((nft: any) => {
            return (
              <ShowNFT
                nft={nft}
                owned={true}
                key={nft.name}
                account={account}
              />
            );
          })
      }
      <h1>Other NFTs</h1>
      {
        // get all NFTs of key is not my address from contract
        Object.keys(nftList.value).map((key: any) => {
          if (key !== address) {
            return (
              <div key={key}>
                {/* <h4>{key}</h4> */}
                {(nftList.value as any)[key].map((nft: any) => {
                  // console.log(nft);
                  return (
                    <ShowNFT
                      nft={nft}
                      owned={false}
                      key={nft.name}
                      account={account}
                    />
                  );
                })}
              </div>
            );
          }
        })
      }
    </div>
  );
});
