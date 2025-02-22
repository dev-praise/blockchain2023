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
		token2 = await Token.deploy('Mock Dai', 'mDai', '1000000')

		user1 = accounts[2]

		transaction = await token1.connect(deployer).transfer(user1.address, tokenWei(100))
		await transaction.wait()

		user2 = accounts[3]
			

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

	describe('Making Orders', () =>{

		let transactions, result
		let amount = tokenWei(1)
		

		describe('Success', async () =>{
			
			beforeEach(async () =>{

			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = transaction.wait()

			transaction = await exchange.connect(user1).depositTokens(token1.address, amount)
			result = await transaction.wait()

			transaction = await exchange.connect(user1).makeOrder(token2.address,amount, token1.address, amount)
			result = await transaction.wait()

			})

			it('tracks the newly created order', async() =>{
				expect(await exchange.orderCount()).to.equal(1)
			})

			it('emits an Order event', async () =>{
				const event = result.events[0]
				expect(event.event).to.equal('Order')

				const args = event.args
				expect(args.id).to.equal(1)				
				expect(args.user).to.equal(user1.address)
				expect(args.tokenGet).to.equal(token2.address)
				expect(args.amountGet).to.equal(amount)
				expect(args.tokenGive).to.equal(token1.address)
				expect(args.amountGive).to.equal(amount)
				expect(args.timestamp).to.at.least(1)
			})
		})

		describe('Failure', async() =>{
			it('rejects with no balance', async () =>{
				expect(exchange.connect(user1).makeOrder(token2.address, amount, token1.address, amount)).to.be.reverted
			})
		})
	})

	describe('Order actions', async () => {
		let transaction, result
		let amount = tokenWei(1)

		beforeEach(async () =>{

			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = transaction.wait()

			transaction = await exchange.connect(user1).depositTokens(token1.address, amount)
			result = await transaction.wait()

			transaction = await token2.connect(deployer).transfer(user2.address, tokenWei(100))
			result = await transaction.wait()

			transaction = await token2.connect(user2).approve(exchange.address, tokenWei(2))
			result = await transaction.wait()

			transaction = await exchange.connect(user2).depositTokens(token2.address, tokenWei(2))
			result = await transaction.wait()

			transaction = await exchange.connect(user1).makeOrder(token2.address,amount, token1.address, amount)
			result = await transaction.wait()

		})

		describe('Cancelling orders', async () =>{
			describe('Success', async () =>{
				beforeEach(async () => {
					transaction = await exchange.connect(user1).cancelOrder(1)
					result = await transaction.wait()
				})

				it('updates cancelled orders', async() =>{
					expect(await exchange.orderCancelled(1)).to.equal(true)
				})

				it('emits an Order event', async () =>{
					const event = result.events[0]
					expect(event.event).to.equal('Cancel')

					const args = event.args
					expect(args.id).to.equal(1)				
					expect(args.user).to.equal(user1.address)
					expect(args.tokenGet).to.equal(token2.address)
					expect(args.amountGet).to.equal(amount)
					expect(args.tokenGive).to.equal(token1.address)
					expect(args.amountGive).to.equal(amount)
					expect(args.timestamp).to.at.least(1)
				})
			})

			describe('Failure', async () =>{
				beforeEach(async () =>{

					transaction = await token1.connect(user1).approve(exchange.address, amount)
					result = transaction.wait()

					transaction = await exchange.connect(user1).depositTokens(token1.address, amount)
					result = await transaction.wait()

					transaction = await exchange.connect(user1).makeOrder(token2.address,amount, token1.address, amount)
					result = await transaction.wait()
				})

				it ('rejects invalid order ids', async () =>{
					const invalidOrderId = 99999
					await expect(exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted
				})

				it('rejects unauthorized cancelations', async () =>{
					await expect(exchange.connect(user2).cancelOrder(1)).to.be.reverted
				})
			})
		})

		describe('Filling orders', async () =>{
			describe('Success', () =>{
				

				beforeEach(async () =>{

					transaction = await exchange.connect(user2).fillOrder('1') 
					result = await transaction.wait()
				})

				it('executes the trade and charge fees', async () => {

					expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(tokenWei(0))
					expect(await exchange.balanceOf(token1.address, user2.address)).to.equal(tokenWei(1))
					expect(await exchange.balanceOf(token1.address, feeAccount.address)).to.equal(tokenWei(0))
					expect(await exchange.balanceOf(token2.address, user1.address)).to.equal(tokenWei(1))			
					expect(await exchange.balanceOf(token2.address, user2.address)).to.equal(tokenWei(0.9))								
					expect(await exchange.balanceOf(token2.address, feeAccount.address)).to.equal(tokenWei(0.1))	
				})

				it('updates filled orders', async () =>{
					expect(await exchange.orderFilled(1)).to.equal(true)
				})

				it('emits a Trade event', async () =>{
					const event = result.events[0]
					expect(event.event).to.equal('Trade')

					const args = event.args
					expect(args.id).to.equal(1)
					expect(args.user).to.equal(user2.address)
					expect(args.tokenGet).to.equal(token2.address)
					expect(args.amountGet).to.equal(tokenWei(1))	
					expect(args.tokenGive).to.equal(token1.address)
					expect(args.amountGive).to.equal(tokenWei(1))
					expect(args.creator).to.equal(user1.address)
					expect(args.timestamp).to.at.least(1)
				})
			})

			describe('Failure', () =>{

				it('rejects invalid order ids', async () =>{
					const invalidOrderId = 99999
					await expect(exchange.connect(user2).fillOrder(invalidOrderId)).to.be.reverted
				})

				it('rejects already filled orders', async () =>{
					transaction = await exchange.connect(user2).fillOrder(1)
					result = await transaction.wait()

					await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
				})

				it('rejects cancelled orders', async () =>{
					transaction = await exchange.connect(user1).cancelOrder(1)
					await transaction.wait()
				
					await expect(exchange.connect(user2).fillOrder(1)).to.be.reverted
				})

			})
		})
	})
})
