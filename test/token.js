const {ethers} = require ('hardhat');
const {expect} = require('chai');

const tokenWei = (n) => {
	return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('token', ()=>{

	let token,accounts,deployer,receiver 

	beforeEach(async () =>{
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('Dapp University', 'DAPP', 1000000)
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		receiver = accounts[1]
		exchange = accounts[2]

		token.connect(deployer)

	})

	describe('Deployment', () =>{

		const name = 'Dapp University'
		const symbol = 'DAPP'
		const decimal = 18
		const totalSupply = tokenWei(1000000)

		it('has the correct name', async ()=>{
			expect(await token.name()).to.equal(name)

		})

		it('has the correct symbol', async ()=>{
			expect(await token.symbol()).to.equal(symbol)

		})

		it('has the correct decimal', async ()=>{
			expect(await token.decimal()).to.equal(decimal)

		})

		it('has the correct totalSupply', async ()=>{
			expect(await token.totalSupply()).to.equal(totalSupply)

		})

		it('it assigns total supply to deployer', async ()=>{
			expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)

		})

	})

	describe('Sending Tokens', () => {
		let amount,transaction,result

		describe('Success', () =>{

			beforeEach(async () =>{
				amount = tokenWei(100)
				transaction = await token.connect(deployer).transfer(receiver.address, amount)
				result = await transaction.wait()
			})

			it('transfers token balances', async () =>{
				expect(await token.balanceOf(deployer.address)).to.equal(tokenWei(999900))
				expect(await token.balanceOf(receiver.address)).to.equal(amount)
			})

			it('emits a transfer event', async () =>{
				const event = result.events[0]
				expect (event.event).to.equal('Transfer')

				const args=event.args
				expect(args.from).to.equal(deployer.address)
				expect(args.to).to.equal(receiver.address)
				expect(args.value).to.equal(amount)

			}) 
		})

		describe('failure', () =>{

			it('rejects insufficient balance', async () =>{

				const invalidAmount = tokenWei(9999999999)
				await expect (token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
			})

			it('rejects invalid recipent', async () =>{

				const amount = tokenWei(999)
				await expect (token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
			})

		})

	})

	describe('Approving Tokens', () =>{
		let amount, transaction, result

		beforeEach( async () =>{
			amount = tokenWei(100)
			transaction = await token.connect(deployer).approve(exchange.address,amount)
			result = await transaction.wait()
		})

		describe('Success', () =>{
			it('allocates an allowance for delegated token spending',async () =>{
				expect(await token.allowance(deployer.address, exchange.address)).to.equal(amount)
			})

			it ('emits approval event', async() =>{
				const event = result.events[0]
				expect (event.event).to.equal('Approval')

				const args=event.args
				expect(args.owner).to.equal(deployer.address)
				expect(args.spender).to.equal(exchange.address)
				expect(args.value).to.equal(amount)

			})
		})

		describe('Failure', async () =>{
			it('rejects invalid spender', async () =>{
				await expect( token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
			})

		})

	})

	describe('Delegated Token transfers', () => {

		beforeEach(async () =>{
			amount = tokenWei(100)
			transaction = await token.connect(deployer).approve(exchange.address, amount)
			result = await transaction.wait()
		})

		describe('Success', () =>{
			beforeEach(async () =>{
				transaction = await token.connect(exchange).transferFrom(deployer.address, receiver.address, amount)
				result = await transaction.wait()
			})

			it('transfers token balances', async () =>{
				expect(await token.balanceOf(deployer.address)).to.be.equal(tokenWei(999900))
				expect(await token.balanceOf(receiver.address)).to.be.equal(amount)

			})

			it('resets the allowance', async() =>{
				expect(await token.allowance(deployer.address, exchange.address)).to.equal(0)
			})


			it ('emits transfer event', async() =>{
				const event = result.events[0]
				expect (event.event).to.equal('Transfer')

				const args=event.args
				expect(args.from).to.equal(deployer.address)
				expect(args.to).to.equal(receiver.address)
				expect(args.value).to.equal(amount)

			})


		})

		describe('Failure', () =>{
			it('rejects invalid amount', async() =>{
				invalidAmount = tokenWei('999999999999')
				await expect(token.connect(exchange).transferFrom(deployer.address, receiver.address, invalidAmount)).to.be.reverted
			})
		})

	})


})
