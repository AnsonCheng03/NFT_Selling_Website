import { useState } from "react";

import "./App.css";

import ConnectWalletButton from "./components/ConnectWalletButton";
import { NavBar } from "./components/NavBar";

const App = () => {
  const [address, setAddress] = useState("");

  return (
    <div className="App">
      {
        <main className="main">
          <login className={address === "" ? "login" : "login done"}>
            <ConnectWalletButton setAddress={setAddress} />
          </login>
          <NavBar address={address} setAddress={setAddress} />
        </main>
      }
    </div>
  );
};

export default App;
