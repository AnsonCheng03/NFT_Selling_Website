import axios from "axios";
import { $, component$, useSignal, noSerialize } from "@builder.io/qwik";
import { server$ } from "@builder.io/qwik-city";
import { spawn } from "child_process";
import * as fs from "fs";
import Web3 from "web3";
import { contractCode } from "./contractCode";

export default component$(({ account, mode, loading }: any) => {
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
      // write contract code to file
      await fs.writeFile(
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
          const migrate = spawn("truffle", ["compile"], {
            cwd: process.cwd(),
            shell: true,
            detached: true,
          });

          migrate.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
          });

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

      console.log("contract compiled");

      // get the compiled contract
      const compiledContract = JSON.parse(
        fs.readFileSync(`src/contracts/ERC721Token${DateInSec}.json`, "utf-8")
      );

      console.log(compiledContract);

      return [
        `ERC721Token${DateInSec}`,
        compiledContract["abi"],
        compiledContract["bytecode"],
      ];
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
    if (contracts[address]) contracts[address].push(contract);
    else contracts[address] = [contract];

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
        {files.value.length > 0 && (
          <button
            class="submitButton"
            onClick$={async () => {
              loading.value = true;
              try {
                const currentTimeInSeconds = Math.floor(Date.now());
                const contractDetails: any = {
                  abi: "",
                  byteCode: "",
                };
                const contract: any = {
                  name: "",
                  address: "",
                  images: [],
                };
                [contract.name, contractDetails.abi, contractDetails.byteCode] =
                  await generateContract(
                    files.value.length,
                    currentTimeInSeconds
                  );

                // Configuring the connection to an Ethereum node
                const web3 = new Web3((window as any).ethereum);
                (window as any).ethereum.enable();

                // Using the signing account to deploy the contract
                const createdContract = new web3.eth.Contract(
                  contractDetails.abi
                );
                (createdContract as any).options.data =
                  contractDetails.byteCode;
                const deployTx = createdContract.deploy();
                const deployedContract = await deployTx
                  .send({
                    from: Web3.utils.toChecksumAddress(account.value),
                    gas: 5000000 as any,
                  })
                  .once("transactionHash", (txhash) => {
                    console.log(`Mining deployment transaction ...`);
                    console.log(`https://sepolia.etherscan.io/tx/${txhash}`);
                  });
                // The contract is now deployed on chain!
                console.log(
                  `Contract deployed at ${deployedContract.options.address}`
                );
                contract.address = deployedContract.options.address;

                for (let i = 0; i < files.value.length; i++) {
                  const ipfsID = await pinFileToIPFS(files.value[i]);
                  contract.images.push(ipfsID);
                  console.log(ipfsID);
                }
                files.value = [];

                await saveContractToJSON(contract);

                window.alert("NFT contract created at " + contract.address);

                mode.value = "view";
              } catch (error) {
                console.log(error);
                window.alert("Error creating NFT contract. ");
              } finally {
                loading.value = false;
              }
            }}
          >
            Create NFT Contract
          </button>
        )}
      </div>
    </div>
  );
});
