const {ethers} = require ('hardhat');
const {expect} = require('chai');

const tokenWei = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Exchange', ()=>{

	let exchange,accounts,deployer,receiver 
	const feePercent = 10

	beforeEach(async () =>{
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		feeAccount = accounts[1]
		
		const Exchange = await ethers.getContractFactory('Exchange')
		exchange = await Exchange.deploy(feeAccount.address, feePercent)

		const Token = await ethers.getContractFactory('Token')
		token1 = await Token.deploy('Dapp Universityy','Dapp','1000000')

		user1 = accounts[2]

		transaction = await token1.connect(deployer).transfer(user1.address, tokenWei(100))
		await transaction.wait()
			

	})

	describe('Deployment', () =>{


		it('it tracks the feeAccount', async ()=>{
			expect(await exchange.feeAccount()).to.equal(feeAccount.address)

		})

		it('it tracks the feePercent', async ()=>{
			expect(await exchange.feePercent()).to.equal(feePercent)

		})
	})

	describe('Depositing Tokens', () =>{
		let transaction, result
		let amount = tokenWei(10)

		describe('Success', () => {
			
			beforeEach(async () => {
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = transaction.wait()

				transaction = await exchange.connect(user1).depositTokens(token1.address, amount)
				result = await transaction.wait()
			})

			it('tracks token deposit', async () =>{
				expect(await token1.balanceOf(exchange.address)).to.equal(amount)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
				//instead of calling the mapping function, the balanceOf function that wraps the mapping is called.
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
			})

			it('emits a Deposit event', async () =>{
				const event = result.events[1]
				expect (event.event).to.equal('Deposit')

				const args=event.args
				expect(args.token).to.equal(token1.address)
				expect(args.user).to.equal(user1.address)
				expect(args.amount).to.equal(amount)
				expect(args.balance).to.equal(amount)


			}) 

		})

		describe('Failure', () => {
			it('fails when no tokens are approved', async () =>{
				await expect(exchange.connect(user1).depositTokens(token1.address,amount)).to.be.reverted
			})
			
		})
	})

	describe('Withdrawing Tokens', () => {

		let transaction, result
		let amount = tokenWei(10)

		describe('Success', async () =>{

			beforeEach(async () =>{
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()

				transaction = await exchange.connect(user1).depositTokens(token1.address, amount)
				result = await transaction.wait()

				transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
				result = await transaction.wait()

			})

			it('withdraws token funds', async () =>{
				expect(await token1.balanceOf(exchange.address)).to.equal(0)
				expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
				expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
			})

			it('emits a Withdraw event', async () =>{
				const event = result.events[1]
				expect(event.event).to.equal('Withdraw')

				const args=event.args
				expect(args.token).to.equal(token1.address)
				expect(args.user).to.equal(user1.address)
				expect(args.amount).to.equal(amount)
				expect(args.balance).to.equal(0)
			})
			console.log(see)

		})

		describe('Failure',  () =>{
			it('fails for insufficient balances',async() =>{
				await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted
			})
		})
	})

	describe('Checking Balances', () =>{
		let transaction, result
		let amount = tokenWei(10)

		beforeEach(async () => {
			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = transaction.wait()

			transaction = await exchange.connect(user1).depositTokens(token1.address, amount)
			result = await transaction.wait()
		})

		it('returns user balance', async() =>{
			expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
		})

	})





})
