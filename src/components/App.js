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

import Navbar from './Navbar'


function App() {
  const dispatch = useDispatch()
  
  const loadBlockChainData = async () => {

    //connects ethers to the blockchain
    const provider = loadProvider(dispatch)

    //gets the netword chain id
    const chainId = await loadNetwork(provider, dispatch)

    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })
    
    //gets current account and balance from metamask when reloaded with a diff accnt
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })

    
    //loads token smart contracts
    
    const DApp = config[chainId].DApp 
    const mETH = config[chainId].mETH
    // console.log(DApp.address)
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

      <Navbar />

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
