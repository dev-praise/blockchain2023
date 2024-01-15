import {useEffect} from 'react';
import { useDispatch } from 'react-redux';
import config from '../config.json';

import { 
  loadProvider,
  loadNetwork,
  loadAccount,
  loadTokens,
  loadExchange
}  from '../store/interactions.js';


function App() {
  const dispatch = useDispatch()
  
  const loadBlockChainData = async () => {

    //connects ethers to the blockchain
    const provider = loadProvider(dispatch)

    //gets the netword chain id
    const chainId = await loadNetwork(provider, dispatch)
    
    //gets current account and balance from metamask
    await loadAccount(provider, dispatch)

    //loads token smart contracts
    const DApp = config[chainId].DApp 
    const mETH = config[chainId].mETH
    await loadTokens(provider, [DApp.address, mETH.address], dispatch)

    //loads exchange smart contract
    const exchangeConfig = config[chainId].exchange
    await loadExchange(provider, exchangeConfig.address, dispatch)
  } 


  useEffect(() =>{
    loadBlockChainData()
  })



 return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
