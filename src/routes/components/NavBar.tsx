import { ConnectWalletButton } from "./ConnectWalletButton";
import Web3 from "web3";

export const NavBar = ({ account }: any) => {
  if (!account.value) return null;

  const address = Web3.utils.toChecksumAddress(account.value);
  // let balance = 0;
  // const getBalance = await web3.eth.getBalance(walletAddress)
  // const ethBalance = web3.utils.fromWei(getBalance, "ether");
  // const getBalance = async () => {
  //   const web3 = new Web3(Web3.givenProvider);
  //   const ethBalance = await web3.eth.getBalance(account);
  //   balance = web3.utils.fromWei(ethBalance, "ether");
    // console.log(balance);
  // };
  // getBalance();
  return (
    <nav class="navBar">
      <div>
        Wallet: {address}
        {/* (Balance: {balance} ETH) */}
      </div>
      <ConnectWalletButton account={account} mode={"logout"} />
    </nav>
  );
};
