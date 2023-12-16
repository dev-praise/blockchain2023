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

	})

	describe('Deployment', () =>{


		it('it tracks the feeAccount', async ()=>{
			expect(await exchange.feeAccount()).to.equal(feeAccount.address)

		})

		it('it tracks the feePercent', async ()=>{
			expect(await exchange.feePercent()).to.equal(feePercent)

		})

	})


})
