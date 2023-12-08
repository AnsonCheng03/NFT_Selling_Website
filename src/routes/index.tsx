import { $, component$, useSignal } from "@builder.io/qwik";
import { server$, type DocumentHead } from "@builder.io/qwik-city";
import { ConnectWalletButton } from "./components/ConnectWalletButton";
import UploadImage from "./components/UploadImage";
import { NavBar } from "./components/NavBar";
import { ModeSelect } from "./components/ModeSelect";
import { View } from "./components/ViewNFT";
import * as fs from "fs";

export default component$(() => {
  const account = useSignal("");
  const mode = useSignal("create");

  const resetAll = server$(() => {
    fs.writeFile("src/contracts.json", JSON.stringify({}), (err) => {
      if (err) {
        // console.log;
      }
      // console.log(contracts.json updated");
    });

    // remove all files in src/contracts
    const directory = "src/contracts";
    fs.readdir(directory, (err, files) => {
      files.forEach((file) => {
        fs.unlinkSync(`${directory}/${file}`);
      });
    });
  });

  const getAccountFromServer = server$(() => {
    const keys = fs.readFileSync("keys.json", "utf8");
    const keysJSON = JSON.parse(keys);
    return keysJSON;
  });

  const getAllAccount = $(async () => {
    const keys = await getAccountFromServer();
    if (keys["private_keys"]) {
      // format: key: address, value: private key
      const keys_in_string = Object.keys(keys["private_keys"]).reduce(
        (acc, cur) => {
          return acc + cur + ": " + keys["private_keys"][cur] + "\n\n";
        },
        ""
      );

      console.log(keys_in_string);
    }
  });

  return (
    <div class="App">
      <main class="main">
        <login class={account.value === "" ? "login" : "login done"}>
          <ConnectWalletButton account={account} />
          <div class="developmentTools">
            <button class="resetAll" onClick$={() => resetAll()}>
              Reset All (For Demo)
            </button>
            <button class="resetAll" onClick$={getAllAccount}>
              Get All Account in Console (For Demo)
            </button>
          </div>
        </login>
        <NavBar account={account} />
        <ModeSelect mode={mode} />
        {account.value && mode.value === "create" ? (
          <UploadImage account={account} mode={mode} />
        ) : (
          <View account={account} />
        )}
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
