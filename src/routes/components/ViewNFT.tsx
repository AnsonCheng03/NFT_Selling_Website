import { component$ } from "@builder.io/qwik";
import Web3 from "web3";
import nftList from "~/contracts.json";
import { ShowNFT } from "./ShowNFT";

export const View = component$(({ account }: any) => {
  console.log(nftList);
  const address = account.value && Web3.utils.toChecksumAddress(account.value);

  return (
    <div class="viewNFT">
      <h1>My Contract</h1>
      {
        // get all NFTs of key is my address from contract
        (nftList as any)[address]?.length > 0 &&
          (nftList as any)[address].map((nft: any) => {
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
        Object.keys(nftList).map((key: any) => {
          if (key !== address) {
            return (
              <div key={key}>
                {/* <h4>{key}</h4> */}
                {(nftList as any)[key].map((nft: any) => {
                  console.log(nft);
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
