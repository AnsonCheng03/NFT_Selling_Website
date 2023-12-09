import { $, component$, useSignal } from "@builder.io/qwik";
import { server$, type DocumentHead } from "@builder.io/qwik-city";
import { ConnectWalletButton } from "./components/ConnectWalletButton";
import UploadImage from "./components/UploadImage";
import { NavBar } from "./components/NavBar";
import { ModeSelect } from "./components/ModeSelect";
import { View } from "./components/ViewNFT";
import * as fs from "fs";

const Loading = () => (
  <div class="loadingContainer">
    <div class="loading" />
  </div>
);

export default component$(() => {
  const account = useSignal("");
  const mode = useSignal("create");
  const loading = useSignal(false);

  const resetAll = server$(() => {
    fs.writeFile("src/contracts.json", JSON.stringify({}), (err) => {
      if (err) {
        console.log(err);
      }
      // console.log("contracts.json updated");
    });

    // remove all files in src/contracts
    const directory = "src/contracts";
    fs.readdir(directory, (err, files) => {
      files.forEach((file) => {
        fs.unlinkSync(`${directory}/${file}`);
      });
    });
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
          </div>
        </login>
        <NavBar account={account} />
        <ModeSelect mode={mode} />
        {account.value && mode.value === "create" ? (
          <UploadImage account={account} mode={mode} loading={loading} />
        ) : (
          <View account={account} loading={loading} />
        )}
        {loading.value && <Loading />}
      </main>
    </div>
  );
});

export const head: DocumentHead = {
  title: "CSCI2730",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
