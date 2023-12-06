import React, { useRef, useState } from "react";
import axios from "axios";
const FormData = require("form-data");

export const UploadImage = () => {
  const inputFile = useRef();

  const pinFileToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    // check if file is an image
    if (!file.type.match(/image.*/)) {
      window.alert("This file is not an image");
      return;
    }

    // check file size < 1MB
    if (file.size > 1048576) {
      window.alert("File size must be less than 1MB");
      return;
    }

    const pinataMetadata = JSON.stringify({ name: file.name });
    formData.append("pinataMetadata", pinataMetadata);

    const pinataOptions = JSON.stringify({ cidVersion: 0 });
    formData.append("pinataOptions", pinataOptions);

    try {
      const res = await axios.post(
        // https://app.pinata.cloud/
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        formData,
        {
          maxBodyLength: "Infinity",
          headers: {
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: `Bearer ${process.env.REACT_APP_IPFSapiKey}`,
          },
        }
      );
      console.log(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      inputFile.current.value = null;
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      pinFileToIPFS(file);
    }
  };

  return (
    <div className="uploadImage">
      <input
        type="file"
        id="file"
        ref={inputFile}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      <button
        className="uploadButton"
        onClick={() => inputFile.current.click()}
      >
        Upload NFT Image
      </button>
    </div>
  );
};
