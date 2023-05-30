const {ethers} = require('hardhat');
const {expect} = require('chai');

const weitoken = (n) => {return ethers.utils.parseUnits(n.toString(),'ether')}


describe("Token", () => {

	let token,accounts

	beforeEach( async () => {
		const Token = await ethers.getContractFactory('Token');
		token = await Token.deploy('Dapp University', 'DAPP', 1000000)
	
		accounts = await ethers.getSigners()
		deployer = accounts[0]
	})

	describe('Deployment', () => {

		const name = 'Dapp University'
		const symbol = 'DAPP'
		const decimal = '18'
		const totalSupply = weitoken(1000000)

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
	
})
