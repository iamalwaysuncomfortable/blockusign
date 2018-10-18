const assert = require('assert');
const assert_ext = require('chai');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const solCompiler = require('../compile');
const compileData = solCompiler.compileContract('DocStore');
const contractInterface = compileData['interface'];
const bytecode = compileData['bytecode'];
const testHash = '0x7514a2664dab82189b89d8250da9d0e1e6c95d3efaca6ffc25e5db42d7a7d053';
const wrongHash = '0x7514a2664dab82189b89d8250da9d0e1e6c95d3efaca6ffc25e5db42d7a7d052';
const ownerName = 'acmeCorp';

let accounts;
let docStore;


beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    docStore = await new web3.eth.Contract(JSON.parse(contractInterface))
        .deploy({data: bytecode, arguments: [testHash, ownerName]})
        .send({from: accounts[0], gas:'1000000'})
});


describe('docStore', () => {
    it('deploys a contract', () => {
        assert.ok(docStore.options.address);
    });

    it('doc has an owner', async () => {
        const ownerAccount = await docStore.methods.docOwner().call();
        assert.equal(accounts[0], ownerAccount);
    });

    it('doc owner name is present', async () => {
        const ownerVariable = await docStore.methods.docOwnerName().call();
        assert.equal(ownerName, ownerVariable);
    });

    it('can verify a correct doc hash input', async () => {
        const equalsDocHash = await docStore.methods.verifyDocHash(testHash).call();
        assert.equal(equalsDocHash, true);
    });

    it('can verify an incorrect doc hash input', async () => {
        const equalsDocHash = await docStore.methods.verifyDocHash(wrongHash).call();
        assert.equal(equalsDocHash, false);
    });

});
