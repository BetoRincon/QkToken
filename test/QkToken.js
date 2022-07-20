var QkToken = artifacts.require("QkToken")

contract('QkToken', accounts => {
    let tokenInstance;
    it('initializes the contract with the correct values', async () => {
        tokenInstance = await QkToken.deployed();
        const name = await tokenInstance.name();
        const symbol = await tokenInstance.symbol();
        const standard = await tokenInstance.standard();
        assert.equal(name,'QK Token', 'Has the correct name');
        assert.equal(symbol,'QK', 'Has the correct symbol');
        assert.equal(standard,'QK Token v1.0', 'Has the correct standard');
    })
    it('allocates the initial supply upon development', async () => {
        tokenInstance = await QkToken.deployed();
        const totalSupply = await tokenInstance.totalSupply();
        const adminBalance = await tokenInstance.balanceOf(accounts[0]);
        assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,000')
        assert.equal(adminBalance.toNumber(), 1000000, 'it allocates the initial supply to the admin account')
    })

    it('transfer token ownership', async () => {
        tokenInstance = await QkToken.deployed();
        try {
            //the call actually doesn't perform the transfer. It seems it is used for testing purposes
            const transfer = await tokenInstance.transfer.call(accounts[1], 99999999);
        }catch (err) {
            console.log('transfer => ', err.message);
            console.log(err.message.indexOf('revert'))
            assert(err.message.indexOf('revert') >= 0, 'error message must contain revert')
        }finally {
            const receipt = await tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]})
            const success = await tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
            assert.equal(success, true,'it returns true')
            // console.log('receipt => ', receipt);
            assert.equal(receipt.logs.length, 1, 'Triggers one event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be a Transfer event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account the tokens are transferred from');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account the tokens are transferred to');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
            const balanceReceivingAccount = await tokenInstance.balanceOf(accounts[1])
            const balanceSendingAccount = await tokenInstance.balanceOf(accounts[0])
            console.log('balanceReceivingAccount => ', balanceReceivingAccount.toNumber())
            console.log('balanceSendingAccount => ', balanceSendingAccount.toNumber())
            assert.equal(balanceReceivingAccount.toNumber(), 250000, 'adds the amount to the receiving account');
            assert.equal(balanceSendingAccount.toNumber(), 750000, 'deducts the amount to the sending account');
        }
    })

    it('approve tokens for delegate transfer', async () => {
        tokenInstance = await QkToken.deployed();
        const isApproved = await tokenInstance.approve.call(accounts[1], 100);
        assert.equal(isApproved, true, 'it returns true');
        const receipt = await tokenInstance.approve(accounts[1], 100, {from: accounts[0]});

        // console.log('receipt => ', receipt);
        assert.equal(receipt.logs.length, 1, 'Triggers one event');
        assert.equal(receipt.logs[0].event, 'Approval', 'should be a Approval event');
        assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are transferred from');
        console.log(`accounts => ${accounts}`);
        assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are transferred to');
        assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
        const allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
        assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegate transfer');
    });

    it('handles delegate token transfer', async () => {
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spendingAccount = accounts[4];
        tokenInstance = await QkToken.deployed();
        //Transfer some tokens from account to account
        const receipt = await tokenInstance.transfer(fromAccount, 100, {from: accounts[0]})
        const balanceOfFromAccount =  await tokenInstance.balanceOf(accounts[2]);
        console.log('balance of fromAccount: ', balanceOfFromAccount.toNumber());
        //approve spending account to spend 10 tokens from fromAccount
        const approvedReceipt = await tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
        try {
            const balanceOftoAccount =  await tokenInstance.balanceOf(toAccount);
            console.log('balance of toAccount: ', balanceOftoAccount.toNumber());
            const balanceOfSpendingAccount =  await tokenInstance.balanceOf(spendingAccount);
            console.log('balance of spendingAccount: ', balanceOfSpendingAccount.toNumber());
            const error = await tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spendingAccount});
        } catch (error) {
            // console.log('error => ', error);
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than balance')
        }
        try {
            const transferLarger = await tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount})
        } catch (error) {
            // console.log('error2 => ', error);
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer value larger than approved amount')
        }

        const success = await tokenInstance.transferFrom.call(fromAccount, toAccount,10, {from: spendingAccount});
        assert.equal(success, true)
        const receipt2 = await tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount})
        assert.equal(receipt2.logs.length, 1, 'Triggers one event');
        assert.equal(receipt2.logs[0].event, 'Transfer', 'should be a Approval event');
        assert.equal(receipt2.logs[0].args._from, fromAccount, 'logs the account the tokens are transferred from');
        assert.equal(receipt2.logs[0].args._to, toAccount, 'logs the account the tokens are transferred to');
        assert.equal(receipt2.logs[0].args._value.toNumber(), 10, 'logs the transfer amount');
        const balanceFrom = await tokenInstance.balanceOf(fromAccount);
        const balanceToAccount = await tokenInstance.balanceOf(toAccount);
        const allowance2 = await tokenInstance.allowance(fromAccount, spendingAccount);
        assert.equal(balanceFrom.toNumber(), 90, 'deducts amount from the sending account');
        assert.equal(balanceToAccount.toNumber(), 10, 'adds amount from the receiving account');
        assert.equal(allowance2.toNumber(), 0, 'deducts amount from the allowance')

    })
});