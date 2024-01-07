
const config = require('../src/config.json')

const tokenWei = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

const wait = (seconds) => {

	const milliseconds = (seconds * 1000)
	return new Promise(resolve => setTimeout(resolve, milliseconds))
}


async function main(){
	const accounts = await ethers.getSigners()

	const { chainId } = await ethers.provider.getNetwork()	
	console.log("Using chainID:", chainId)

	const DApp = await ethers.getContractAt('Token', config[chainId].DApp.address)

	console.log(`DApp Token fetched: ${DApp.address}`)


	const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
	console.log(`mETH Token fetched: ${mETH.address}`)

	const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
	console.log(`mDAI Token fetched: ${mDAI.address}`)

	const exchange = await ethers.getContractAt('Exchange', config[chainId].exchange.address)
	console.log(`Exchange fetched: ${exchange.address}`)

	const sender = accounts[0]
	const receiver = accounts[1]

	let amount = tokenWei(10000)

	let transaction, result
	transaction = await mETH.connect(sender).transfer(receiver.address, amount)
	console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)


	const user1 = accounts[0]
	const user2 = accounts[1]
	amount = tokenWei(10000)

	transaction = await DApp.connect(user1).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approve ${amount} tokens from ${user1.address}`)

	transaction = await exchange.connect(user1).depositTokens(DApp.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} Ether from ${user1.address}`)

	transaction = await mETH.connect(user2).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approved ${amount} tokens from ${user2.address}`)

	transaction = await exchange.connect(user2).depositTokens(mETH.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} tokens from ${user2.address}\n`)

 //////////////////////////////////////////////////////////////
	// SEED A CANCELLED ORDER 
	//

	let orderId
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokenWei(100), DApp.address, tokenWei(5))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user1).cancelOrder(orderId)
	result = await transaction.wait()
	console.log(`Cancelled order from ${user1.address}\n`)

	await wait(1)


 ///////////////////////////////////////////////////////////////////////////
	// SEED FILED ORDERS
	//


	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokenWei(100), DApp.address, tokenWei(10))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)


	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	await wait(1)

	transaction = await exchange.makeOrder(mETH.address, tokenWei(50), DApp.address, tokenWei(15))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	await wait(1)

	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokenWei(200), DApp.address, tokenWei(20))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	await wait(1)


 //////////////////////////////////////////////////////////////////////////////
  	// SEED OPEN ORDERS

  	for(let i = 1; i <= 10; i++) {

  		transaction = await exchange.connect(user1).makeOrder(mETH.address, tokenWei(10 * i), DApp.address, tokenWei(10))
  		result = await transaction.wait()
  		
  		console.log(`Made order from ${user1.address}`)
  		
  		await wait(1)
  	}	

  	for(let i = 1; i <= 10; i++) {

  		transaction = await exchange.connect(user2).makeOrder(DApp.address, tokenWei(10), mETH.address, tokenWei(10 * i))
  		result = await transaction.wait()

  		console.log(`Made order from ${user2.address}`)
  		
  		await wait(1)
  	}	

}

main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error);
		process.exit(1);
	});