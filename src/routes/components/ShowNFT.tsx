import { $, component$, useTask$, useSignal } from "@builder.io/qwik";
import Web3 from "web3";
import * as fs from "fs";
import { server$ } from "@builder.io/qwik-city";

export const ShowNFT = component$(({ nft, owned, account }: any) => {
  const AvailableImage = useSignal<any>([]);
  const tokenURIs = useSignal<any>([]);

  const getConfig = server$(async (nftName: string) => {
    const response = fs.readFileSync(`src/contracts/${nftName}.json`);
    const configuration = JSON.parse(response.toString());
    return configuration;
  });

  const getContract = $(async (nftName: string) => {
    try {
      const configuration = await getConfig(nftName);
      const networkID = Object.keys(configuration?.networks)[0];
      const contractAddress = configuration?.networks[networkID]?.address;
      const contractABI = configuration?.abi;
      const web3 = new Web3("http://127.0.0.1:8545");

      const contract = new web3.eth.Contract(contractABI, contractAddress);
      return contract;
    } catch (e) {
      console.log(e);
      return null;
    }
  });

  const totalAvailable = nft.images.length;

  useTask$(async ({ track }) => {
    track(() => account.value);

    if (!account.value) return;
    const contract: any = await getContract(nft.name);
    const totalRemaining = parseInt(
      await contract?.methods.checkRemainingSupply().call({
        from: Web3.utils.toChecksumAddress(account.value),
        gas: 500000,
      })
    );
    console.log(totalAvailable, totalRemaining);
    const sold = totalAvailable - totalRemaining;

    // search for tokenURI in contract, use promise.all to get all tokenURIs
    const promises = [];
    for (let i = 0; i < sold; i++) {
      promises.push(
        contract?.methods.tokenURI(i).call({
          from: Web3.utils.toChecksumAddress(account.value),
          gas: 500000,
        })
      );
    }
    tokenURIs.value = await Promise.all(promises);

    AvailableImage.value = nft.images.filter((image: any) => {
      return !tokenURIs.value.includes(image);
    });
  });

  return (
    <div class="nft" key={nft.name}>
      <p>{nft.name}</p>
      {[tokenURIs.value, AvailableImage.value].map(
        (nftImage: any, index: any) =>
          nftImage.length > 0 && (
            <div class="nftImages" key={index}>
              <h3 key={index}>
                {index === 0 ? "Sold" : "Available"}: {nftImage.length}
              </h3>
              {nftImage.map((image: any, photoIndex: any) => {
                return (
                  <img
                    src={`https://amber-above-snake-734.mypinata.cloud/ipfs/${image}`}
                    alt=""
                    width={50}
                    height={50}
                    key={image}
                    onClick$={async () => {
                      try {
                        const contract: any = await getContract(nft.name);

                        if (index === 0) {
                          // announce owner
                          const owner = await contract.methods
                            .ownerOf(photoIndex)
                            .call({
                              from: Web3.utils.toChecksumAddress(account.value),
                              gas: 500000,
                            });
                          window.alert(`Owner: ${owner}`);
                        } else {
                          // call mint function
                          if (owned) return;
                          const mintRes = await contract.methods
                            .mint(image, {})
                            .send({
                              from: Web3.utils.toChecksumAddress(account.value),
                              gas: 500000,
                            });
                          console.log(mintRes);
                          window.alert("NFT minted");
                        }
                      } catch (e) {
                        console.log(e);
                        window.alert(
                          "Error minting NFT. Please check if you are in the whitelist."
                        );
                      }
                    }}
                  />
                );
              })}
            </div>
          )
      )}
      {owned ? (
        <button
          class="mintButton"
          onClick$={async () => {
            try {
              // prompt for address
              const address = prompt("Enter address to add to whitelist");
              // add address to whitelist
              const contract: any = await getContract(nft.name);

              const whiteListRes = await contract.methods
                .whitelist(address, 1, {})
                .send({
                  from: Web3.utils.toChecksumAddress(account.value),
                  gas: 500000,
                });
              console.log(whiteListRes);
              window.alert("Address added to whitelist");
            } catch (e) {
              console.log(e);
              window.alert("Error adding address to whitelist");
            }
          }}
        >
          Add Other to WhiteList
        </button>
      ) : (
        <h4>Click on image to buy</h4>
      )}
    </div>
  );
});
