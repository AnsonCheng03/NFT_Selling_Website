import { $ } from "@builder.io/qwik";

export const ConnectWalletButton = ({ account, mode = "login" }: any) => {
  const onPressConnect = $(async () => {
    try {
      if ((window as any)?.ethereum?.isMetaMask) {
        const accounts = await (window as any).ethereum
          .request({
            method: "wallet_requestPermissions",
            params: [
              {
                eth_accounts: {},
              },
            ],
          })
          .then(() =>
            (window as any).ethereum.request({
              method: "eth_requestAccounts",
            })
          );
        // const accounts = await (window as any).ethereum.request({
        //   method: "eth_requestAccounts",
        // });

        account.value = accounts[0];
      } else window.alert("Please install MetaMask to use this dApp!");
    } catch (error) {
      // console.log(error);
    }
  });
  const onPressLogout = $(async () => {
    account.value = "";
  });
  return (
    <div>
      <button onClick$={mode === "login" ? onPressConnect : onPressLogout}>
        {mode === "login" ? "Login Using MetaMask" : "Logout"}
      </button>
    </div>
  );
};
