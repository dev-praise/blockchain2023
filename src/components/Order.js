import { useState, useRef } from 'react';

import { useDispatch, useSelector } from 'react-redux'

import { makeBuyOrder } from '../store/interactions'

const Order = () => {

  const [isBuy, setIsBuy] = useState(true)

  const [amount, setAmount] = useState(0)
  
  const [price, setPrice] = useState(0)

  const provider = useSelector(state => state.provider.connection)

  const tokens = useSelector(state => state.tokens.contracts)
  const exchange = useSelector(state => state.exchange.contract)

  const dispatch = useDispatch()

  const buyRef = useRef(null)
  const sellRef = useRef(null)

  const tabHandler = (e) => {

      if(e.target.className !== buyRef.current.className) {
        e.target.className = 'tab tab--active'
        buyRef.current.className = 'tab'
        setIsBuy(false)
      }
      else {
        e.target.className = 'tab tab--active'
        sellRef.current.className = 'tab'
        setIsBuy(true)
      }    

  }



  const buyHandler = (e) => {

    e.preventDefault()
    makeBuyOrder(provider, exchange, tokens, { amount, price }, dispatch)
        //from gpt to make the new_order_success from subscribeToevent dispatch
      .then(() =>{
        dispatch({type: 'NEW_ORDER_SUCCESS'})
        setAmount(0)
        setPrice(0)
      })
      .catch(error => {
        console.error('Error making buy order', error);
      })
    console.log('buyHandler')

  }

  const sellHandler = (e) => {

    e.preventDefault()
    setAmount(0)
    setPrice(0)
    console.log('sellHandler')


  }



  return (
    <div className="component exchange__orders">
      <div className='component__header flex-between'>
        <h2>New Order</h2>
        <div className='tabs'>
          <button onClick={tabHandler} ref={buyRef} className='tab tab--active'>Buy</button>
          <button onClick={tabHandler} ref={sellRef} className='tab'>Sell</button>
        </div>
      </div>

      <form onSubmit={isBuy ? buyHandler : sellHandler}>
        {isBuy ? 
          (<label htmlFor="amount">Buy Amount</label>)
          :
          (<label htmlFor="amount">Sell Amount</label>)
        }


        <input
           type="text"
           id='amount'
           value={amount === 0 ? '' : amount}         
           placeholder='0.0000'
           onChange={(e) => setAmount(e.target.value)}
        />

        {isBuy ? 
          (<label htmlFor="Price">Buy Price</label>)
          :
          (<label htmlFor="Price">Sell Price</label>)
        }


        <input
           type="text"
           id='price'
           value={price === 0 ? '' : price}
           placeholder='0.0000'
           onChange={(e) => setPrice(e.target.value)}
        />

        <button className='button button--filled' type='submit'>

            {isBuy ? 
              (<span>Buy Order</span>)
              :
              (<span>Sell Order</span>)
            }


        </button>
      </form>
    </div>
  );
}

export default Order;
