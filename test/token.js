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

		token.connect(deployer)

	})

	describe('deployment', () =>{

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

	describe('sending Tokens', () => {
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



})
