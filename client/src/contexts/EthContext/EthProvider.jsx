import React, { useReducer, useCallback } from "react";
import { useState } from "react";
import Web3 from "web3";
import EthContext from "./EthContext";
import { reducer, actions, initialState } from "./state";

function EthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  // const [] = useState();
  const init = useCallback(
    async artifact => {
      if (artifact) {
        const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
        const accounts = await web3.eth.requestAccounts();
        const networkID = await web3.eth.net.getId();
        const { abi } = artifact;
        let address, contract, isOwner, isMintOn, mintPrice;
        try {
          address = artifact.networks[networkID].address;
          contract = new web3.eth.Contract(abi, address);
          const owner = await contract.methods.owner().call();
          if (accounts[0] === owner) {
            isOwner = true;
          } else {
            isOwner= false;
          }
          const mintState = await contract.methods.isMintOn().call();
          if (mintState === true) {
            isMintOn = true;
          } else {
            isMintOn = false
          }
          const mintPriceData = await contract.methods.checkPrice().call();
          mintPrice = mintPriceData;
        } catch (err) {
          console.error(err);
          console.log("rrrr");
        }
        dispatch({
          type: actions.init,
          data: { artifact, web3, accounts, networkID, contract, isOwner, isMintOn, mintPrice }
        });
      }
    }, []);

  const [isConnect, setConnected] = useState(false);
  const handleConnectWallet =  async () => {
      const artifact = require("../../contracts/Nft.json");
      await init(artifact);
      setConnected(true);
}
  // useEffect(() => {
  //   const tryInit = async () => {
  //     try {
  //       const artifact = require("../../contracts/Nft.json");
  //       init(artifact);
  //     } catch (err) {
  //       console.error(err);
  //       console.log("C'est kk");
  //     }
  //   };

  //   tryInit();
  // }, [init]);

  // useEffect(() => {
  //   const events = ["chainChanged", "accountsChanged"];
  //   const handleChange = () => {
  //     init(state.artifact);
  //   };

  //   events.forEach(e => window.ethereum.on(e, handleChange));
  //   return () => {
  //     events.forEach(e => window.ethereum.removeListener(e, handleChange));
  //   };
  // }, [init, state.artifact]);

  return (
    <EthContext.Provider value={{
      state,
      dispatch,
      handleConnectWallet,
      isConnect
    }}
    >
      {children}
    </EthContext.Provider>
  );
}

export default EthProvider;
