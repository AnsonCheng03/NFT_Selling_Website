import { component$ } from "@builder.io/qwik";
import Web3 from "web3";

export const View = component$(({ account }: any) => {
  // const configuration;
  const networkID = Object.keys(configuration?.networks)[0];
  const contractAddress = (configuration as any)?.networks[networkID]?.address;
  const contractABI = configuration?.abi;
  const web3 = new Web3("http://127.0.0.1:8545");
  const contract = new web3.eth.Contract(contractABI, contractAddress);

  const RunMethod = async () => {
    console.log(await (contract.methods as any).name().call());
    console.log(
      await (contract.methods as any).mint("123").send({ from: account })
    );
  };

  RunMethod();

  return (
    <div class="view">
      <h1>View NFTs</h1>
    </div>
  );
});
