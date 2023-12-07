import { component$ } from "@builder.io/qwik";
import Web3 from "web3";
import nftList from "~/contracts.json";
import { ShowNFT } from "./ShowNFT";

export const View = component$(({ account }: any) => {
  console.log(nftList);
  const address = Web3.utils.toChecksumAddress(account.value);

  // const configuration;
  // const networkID = Object.keys(configuration?.networks)[0];
  // const contractAddress = (configuration as any)?.networks[networkID]?.address;
  // const contractABI = configuration?.abi;
  // const web3 = new Web3("http://127.0.0.1:8545");
  // const contract = new web3.eth.Contract(contractABI, contractAddress);

  // const RunMethod = async () => {
  //   console.log(await (contract.methods as any).name().call());
  //   console.log(
  //     await (contract.methods as any).mint("123").send({ from: account })
  //   );
  // };

  // RunMethod();

  return (
    <div class="viewNFT">
      <h1>My Contract</h1>
      {
        // get all NFTs of key is my address from contract
        nftList[address] &&
          nftList[address].map((nft: any) => {
            return <ShowNFT nft={nft} owned={true} key={nft.name} />;
          })
      }
      <h1>Other NFTs</h1>
      {
        // get all NFTs of key is not my address from contract
        Object.keys(nftList).map((key: any) => {
          if (key !== address) {
            return (
              <div key={key}>
                <h2>{key}</h2>
                {nftList[key].map((nft: any) => {
                  return <showNFT nft={nft} owned={false} key={nft.name} />;
                })}
              </div>
            );
          }
        })
      }
    </div>
  );
});
