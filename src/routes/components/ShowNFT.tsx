import { $, component$ } from "@builder.io/qwik";
import Web3 from "web3";

const getJSONContent = async (nftName: string) => {
  const response = await fetch(`src/contracts/${nftName}.json`);
  const json = await response.json();
  return json;
};

export const ShowNFT = component$(({ nft, owned, account }: any) => {
  const getContract = $(async (nftName: string) => {
    const configuration = await getJSONContent(nftName);
    const networkID = Object.keys(configuration?.networks)[0];
    const contractAddress = configuration?.networks[networkID]?.address;
    const contractABI = configuration?.abi;
    const web3 = new Web3("http://127.0.0.1:8545");
    console.log(configuration, networkID, contractAddress, contractABI);

    const contract = new web3.eth.Contract(contractABI, contractAddress);
    return contract;
  });

  return (
    <div class="nft" key={nft.name}>
      <p>{nft.name}</p>
      <div class="nftImages">
        {nft.images.map((image: any) => (
          <img
            src={`https://amber-above-snake-734.mypinata.cloud/ipfs/${image}`}
            alt=""
            width={50}
            height={50}
            key={image}
            onClick$={async () => {
              try {
                // prompt for price
                const priceString = prompt("Enter price in ETH");
                const price = parseFloat(priceString ? priceString : "0");
                // call mint function
                const contract: any = await getContract(nft.name);
                const mintRes = contract.methods.mint(image).send({
                  from: account,
                  value: Web3.utils.toWei(price, "ether"),
                });
                console.log(mintRes);
              } catch (e) {
                console.log(e);
                window.alert("Error minting NFT");
              }
            }}
          />
        ))}
      </div>
      {owned ? (
        <button
          class="mintButton"
          onClick$={async () => {
            try {
              // prompt for address
              const address = prompt("Enter address to add to whitelist");
              // add address to whitelist
              const contract: any = await getContract(nft.name);
              const whiteListRes = contract.methods
                .whitelist(address, 1)
                .send({ from: account });
              console.log(whiteListRes);
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
