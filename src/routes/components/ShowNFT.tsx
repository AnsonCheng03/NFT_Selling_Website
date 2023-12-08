import { $, component$, useTask$, useSignal } from "@builder.io/qwik";
import Web3 from "web3";
import * as fs from "fs";
import { server$ } from "@builder.io/qwik-city";

export const ShowNFT = component$(({ nft, owned, account, loading }: any) => {
  const AvailableImage = useSignal<any>([]);
  const tokenURIs = useSignal<any>([]);

  const getConfig = server$(async (nftName: string) => {
    const response = fs.readFileSync(`src/contracts/${nftName}.json`);
    const configuration = JSON.parse(response.toString());
    return configuration;
  });

  const getContract = $(async (nftName: string, nftAddress: string) => {
    try {
      const configuration = await getConfig(nftName);
      const contractABI = configuration?.abi;
      const web3 = new Web3((window as any).ethereum);
      (window as any).ethereum.enable();

      const contract = new web3.eth.Contract(contractABI, nftAddress);
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
    const contract: any = await getContract(nft.name, nft.address);
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
    <div class="nft" key={nft.address}>
      <p>{nft.address}</p>
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
                      loading.value = true;
                      try {
                        const contract: any = await getContract(
                          nft.name,
                          nft.address
                        );

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

                          // move image from Available to Sold
                          AvailableImage.value.splice(photoIndex, 1);
                          tokenURIs.value.push(image);
                        }
                      } catch (e) {
                        console.log(e);
                        window.alert(
                          "Error minting NFT. Please check if you are in the whitelist."
                        );
                      } finally {
                        loading.value = false;
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
            loading.value = true;
            try {
              // prompt for address
              const address = prompt("Enter address to add to whitelist");
              // add address to whitelist
              const contract: any = await getContract(nft.name, nft.address);

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
            } finally {
              loading.value = false;
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
