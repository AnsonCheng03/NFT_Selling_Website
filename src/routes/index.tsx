import { component$, useSignal } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { ConnectWalletButton } from "./components/ConnectWalletButton";
import UploadImage from "./components/UploadImage";
import { NavBar } from "./components/NavBar";
import { ModeSelect } from "./components/ModeSelect";
import { View } from "./components/ViewNFT";

export default component$(() => {
  const account = useSignal("");
  const mode = useSignal("create");

  return (
    <div class="App">
      <main class="main">
        <login class={account.value === "" ? "login" : "login done"}>
          <ConnectWalletButton account={account} />
        </login>
        <NavBar account={account} />
        <ModeSelect mode={mode} />
        {mode.value === "create" ? (
          <UploadImage account={account} />
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
