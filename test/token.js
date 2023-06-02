const {ethers} = require('hardhat');
const {expect} = require('chai');

const weitoken = (n) => {return ethers.utils.parseUnits(n.toString(),'ether')}
const totalSupply = weitoken(1000000)


describe("Token", () => {

	let token,accounts

	beforeEach( async () => {
		const Token = await ethers.getContractFactory('Token');
		token = await Token.deploy('Dapp University', 'DAPP', 1000000)
	
		accounts = await ethers.getSigners()
		deployer = accounts[0]
		receiver = accounts[1]
	})

	describe('Deployment', () => {

		const name = 'Dapp University'
		const symbol = 'DAPP'
		const decimal = '18'
	  //const totalSupply = weitoken(1000000)

		it('has correct name', async () => {
			expect(await token.name()).to.equal(name);
		})

		it('has correct symbol', async () => {
			expect(await token.symbol()).to.equal(symbol);
		})

		it('has correct decimal', async () =>{
			expect(await token.decimal()).to.equal(decimal);
		})

		it ('has correct totalSupply', async () =>{
			expect(await token.totalSupply()).to.equal(totalSupply);			
		})


		it ('it assigns totalSupply to deployer', async () =>{
			expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);			
		})
	})

	describe('Sending tokens', () => {
		let amount, transaction, results

		describe ('success', () => {

			beforeEach( async() => {
				amount = weitoken(100)
				transaction = await token.connect(deployer).transfer(receiver.address, amount)
				results = await transaction.wait()
			})

			it ('transfers token',  async () => {

				expect(await token.balanceOf(deployer.address)).to.equal(weitoken(999900))
				expect(await token.balanceOf(receiver.address)).to.equal(amount)
			})

			it('emits transfer event', async() =>{

				const event = results.events[0]
				expect(event.event).to.be.equal('Transfer')

				const args = event.args
				expect(args.from).to.equal(deployer.address)
				expect(args.to).to.equal(receiver.address)
				expect(args.value).to.equal(amount)


			})

		})

		describe ('failure', () => {

			it ('rejects invalid amount', async () =>{

				const invalidAmount = weitoken(1000000000)
				await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
			})

			it ('rejects wrong address', async () => {

				const amount = weitoken(100)
				await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted


			})

		})


	})
	
})
