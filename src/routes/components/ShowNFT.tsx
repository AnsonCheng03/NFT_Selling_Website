import { component$ } from "@builder.io/qwik";

export const ShowNFT = component$(({ nft, owned }: any) => {
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
          />
        ))}
      </div>
      <button class="mintButton">Add WhiteList</button>
    </div>
  );
});
