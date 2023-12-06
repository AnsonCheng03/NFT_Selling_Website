import React from "react";
import Web3 from "web3";

const ConnectWalletButton = ({ setAddress, mode = "login" }) => {
  const onPressConnect = async () => {
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
      } else window.alert("Please install MetaMask to use this dApp!");
    } catch (error) {
      console.log(error);
    }
  };
  const onPressLogout = async () => {
    setAddress("");
  };
  return (
    <div>
      <button onClick={mode === "login" ? onPressConnect : onPressLogout}>
        {mode === "login" ? "Login Using MetaMask" : "Logout"}
      </button>
    </div>
  );
};

export default ConnectWalletButton;

// Reference: https://dapps-studio.medium.com/web3-login-with-metamask-react-and-node-a966ca4c7d89
