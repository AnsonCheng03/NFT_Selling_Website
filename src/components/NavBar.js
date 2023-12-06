import ConnectWalletButton from "./ConnectWalletButton";

export const NavBar = ({ address, setAddress }) => (
  <nav className="navBar">
    <div>Wallet: {address}</div>
    <ConnectWalletButton setAddress={setAddress} mode={"logout"} />
  </nav>
);
