import React, { useRef, useState } from "react";
import axios from "axios";
const FormData = require("form-data");

export const UploadImage = () => {
  const inputFile = useRef();
  const [files, setFiles] = useState([]);
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

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

    setFiles([file, ...files]);
  };

  const pinFileToIPFS = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

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

  return (
    <div className="uploadImage">
      <p>
        You are going to create a NFT contract
        {files.length === 0
          ? ". Please Upload:"
          : ` with ${files.length} images.`}
      </p>
      <div className="uploadImageContainer">
        {files.map((file, index) => (
          <div className="uploadImagePreview" key={index}>
            <img src={URL.createObjectURL(file)} alt="" />
            <p>{file.name}</p>
          </div>
        ))}
        <input
          type="file"
          id="file"
          ref={inputFile}
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          className="uploadButton"
          onClick={() => inputFile.current.click()}
        >
          Upload NFT Image
        </button>
        {files.length > 0 && (
          <button
            className="submitButton"
            onClick={() => {
              // files.forEach((file) => pinFileToIPFS(file));
              // setFiles([]);
            }}
          >
            Create NFT Contract
          </button>
        )}
      </div>
    </div>
  );
};
