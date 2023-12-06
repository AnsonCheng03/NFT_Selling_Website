import React from "react";
import Web3 from "web3";
import { useState } from "react";

const ConnectWalletButton = ({ setAddress, mode = "login" }) => {
  const [loading, setLoading] = useState(false);

  const onPressConnect = async () => {
    setLoading(true);

    try {
      if (window?.ethereum?.isMetaMask) {
        // Desktop browser
        const accounts = await window.ethereum
          .request({
            method: "wallet_requestPermissions",
            params: [
              {
                eth_accounts: {},
              },
            ],
          })
          .then(() =>
            window.ethereum.request({
              method: "eth_requestAccounts",
            })
          );

        const account = Web3.utils.toChecksumAddress(accounts[0]);
        setAddress(account);
      }
    } catch (error) {
      console.log(error);
    }

    setLoading(false);
  };
  const onPressLogout = async () => {
    setAddress("");
  };
  return (
    <div>
      <button onClick={mode === "login" ? onPressConnect : onPressLogout}>
        {mode === "login" ? "Login Using Meta Mask" : "Logout"}
      </button>
    </div>
  );
};

export default ConnectWalletButton;

// Reference: https://dapps-studio.medium.com/web3-login-with-metamask-react-and-node-a966ca4c7d89
