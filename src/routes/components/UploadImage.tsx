import axios from "axios";
import { $, component$, useSignal, noSerialize } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { spawn } from "child_process";
import * as fs from "fs";
import Web3 from "web3";
import { contractCode } from "./contractCode";

export default component$(({ account }: any) => {
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

  const generateContract = server$(
    async (
      numberOfImages: number = 0,
      DateInSec: number = Date.now() / 1000
    ) => {
      const error = false;
      // write contract code to file
      fs.writeFile(
        `contracts/ERC721Token${DateInSec}.sol`,
        contractCode(numberOfImages, DateInSec),
        (err) => {
          if (err) {
            console.log(err);
            return;
          }
        }
      );

      console.log("contract code file created");

      try {
        await new Promise((resolve, reject) => {
          const migrate = spawn("truffle", ["migrate"], {
            cwd: process.cwd(),
            shell: true,
            detached: true,
          });

          // migrate.stdout.on("data", (data) => {
          // console.log(`stdout: ${data}`);
          // });

          migrate.on("close", (code) => {
            if (code === 0) {
              migrate.unref();
              resolve("done");
            } else {
              console.log(`Process exited with code: ${code}`);
              reject(`Process exited with code: ${code}`);
            }
          });
        });
      } catch (error) {
        console.log("truffle migrate error", error);
        throw error;
      } finally {
        // remove contract code file after compiling
        await fs.unlink(`contracts/ERC721Token${DateInSec}.sol`, (err) => {
          if (err) {
            console.log(err);
          }
        });
      }

      console.log("contract deployed");

      return `ERC721Token${DateInSec}`;
    }
  );

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
      // console.log(res.data);
      return res.data.IpfsHash;
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      inputFile.value = null;
    }
  });

  const saveContractToJSON = server$((contract: any) => {
    console.log("saveContractToJSON", contract);

    const contracts: any = JSON.parse(
      fs.readFileSync("src/contracts.json", "utf-8")
    );

    // Add new contract to contracts (key: account)
    const address = Web3.utils.toChecksumAddress(account.value);
    contracts[address] = contract;

    // Write contracts to json file
    fs.writeFile("src/contracts.json", JSON.stringify(contracts), (err) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log("contracts.json updated");
    });
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
        {
          // files.value.length > 0 &&
          <button
            class="submitButton"
            onClick$={async () => {
              try {
                const currentTimeInSeconds = Math.floor(Date.now());
                const contract: any = {
                  name: "",
                  images: [],
                };
                contract.name = await generateContract(
                  files.value.length,
                  currentTimeInSeconds
                );
                for (let i = 0; i < files.value.length; i++) {
                  const ipfsID = await pinFileToIPFS(files.value[i]);
                  contract.images.push(ipfsID);
                  console.log(ipfsID);
                }
                files.value = [];

                await saveContractToJSON(contract);

                window.alert("NFT contract created");
              } catch (error) {
                console.log(error);
                window.alert("Error creating NFT contract");
              }
            }}
          >
            Create NFT Contract
          </button>
        }
      </div>
    </div>
  );
});
