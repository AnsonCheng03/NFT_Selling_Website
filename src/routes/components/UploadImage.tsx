import axios from "axios";
import { $, component$, useSignal, noSerialize } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
// const FormData = require("form-data");

export default component$(() => {
  const inputFile = useSignal<any>();
  const files = useSignal<any>([]);
  const handleFileChange = $((event: any) => {
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

    files.value = [noSerialize(file), ...files.value];
  });

  const pinFileToIPFS = $(async (file: any) => {
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
          // maxBodyLength: "Infinity",
          headers: {
            // "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
            Authorization: `Bearer ${import.meta.env.PUBLIC_IPFSapiKey!}`,
          },
        }
      );
      console.log(res.data);
      window.alert("NFT Contract Created!");
    } catch (error) {
      console.log(error);
      window.alert("Error creating NFT Contract");
    } finally {
      inputFile.value = null;
    }
  });

  return (
    <div class="uploadImage">
      <p>
        You are going to create a NFT contract
        {files.value.length === 0
          ? ". Please Upload:"
          : ` with ${files.value.length} images.`}
      </p>
      <div class="uploadImageContainer">
        {files.value.map((file: any, index: any) => (
          <div class="uploadImagePreview" key={index}>
            <img src={URL.createObjectURL(file)} alt="" />
            <p>{file.name}</p>
          </div>
        ))}
        <input
          type="file"
          id="file"
          ref={inputFile}
          accept="image/*"
          onChange$={handleFileChange}
          style={{ display: "none" }}
        />
        <button
          class="uploadButton"
          onClick$={() => {
            inputFile.value?.click();
          }}
        >
          Upload NFT Image
        </button>
        {files.value.length > 0 && (
          <button
            class="submitButton"
            onClick$={() => {
              files.value.forEach((file: any) => pinFileToIPFS(file));
              files.value = [];
            }}
          >
            Create NFT Contract
          </button>
        )}
      </div>
    </div>
  );
});
