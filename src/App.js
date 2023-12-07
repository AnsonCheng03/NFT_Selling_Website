import { useState } from "react";

import "./App.css";

import ConnectWalletButton from "./components/ConnectWalletButton";
import { NavBar } from "./components/NavBar";
import { UploadImage } from "./components/UploadImage";
import { ModeSelect } from "./components/ModeSelect";

const App = () => {
  const [account, setAccount] = useState("");
  const [mode, setMode] = useState("create");

  return (
    <div className="App">
      <main className="main">
        <login className={account === "" ? "login" : "login done"}>
          <ConnectWalletButton setAccount={setAccount} />
        </login>
        <NavBar account={account} setAccount={setAccount} />
        <ModeSelect mode={mode} setMode={setMode} />
        {mode === "create" ? <UploadImage /> : <div>Buy</div>}
      </main>
    </div>
  );
};

export default App;
