var QkToken = artifacts.require("QkToken")

contract('QkToken', accounts => {
    it('sets the total supply upon development', async () => {
        const tokenInstance = await QkToken.deployed();
        const totalSupply = await tokenInstance.totalSupply();
        assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000')
    })
});