import { useState } from "react";
import { create as ipfsHttpClient } from "ipfs-http-client";

const projectSecretKey = process.env.IPFSapiKey;

export const UploadImage = () => {
  const [uploadedImages, setUploadedImages] = useState([]);

  console.log(process.env);

  const ipfs = ipfsHttpClient({
    // https://console.web3.storage/
    url: "https://api.filebase.io/v1/ipfs",
    headers: {
      projectSecretKey,
    },
  });

  return <button className="uploadButton">Upload NFT Image</button>;
};
