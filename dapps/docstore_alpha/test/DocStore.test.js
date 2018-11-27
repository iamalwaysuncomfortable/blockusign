//Require Statements
const assert = require('assert');
const assert_ext = require('chai');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const web3 = new Web3(ganache.provider());
const solCompiler = require('../../../contract_deployment/lib/compile');
const path = require('path');
const contractDir = path.resolve(__dirname + /../, 'Contracts');

//Contract Artifacts
const compileDataDSAdmin = solCompiler.compileContractFromLocalRepo('DocStoreAdmin', contractDir);
const compileDataDStore = solCompiler.compileContractFromLocalRepo('DocStore', contractDir);
const contractInterfaceDSA = compileDataDSAdmin.contracts['DocStoreAdmin:DocStoreAdmin']['interface'];
const bytecodeDSA = compileDataDSAdmin.contracts['DocStoreAdmin:DocStoreAdmin']['bytecode'];
const contractInterfaceDStore = compileDataDStore.contracts['DocStore:DocStore']['interface'];

//Test Data
const testHash = '0x7514a2664dab82189b89d8250da9d0e1e6c95d3efaca6ffc25e5db42d7a7d053';
const testHash2 = '0x7514a2664dab82189b89d8250da9d0e1e6c95d3efaca6ffc25e5db42d7a7d153';
const testTitle2 = 'A Brown Christmas';
const testAuthor = 'TheGiantAnus';
const testTitle = 'Toilet Dreams';
const wrongHash = '0x7514a2664dab82189b89d8250da9d0e1e6c95d3efaca6ffc25e5db42d7a7d052';
const nullAddress = "0x0000000000000000000000000000000000000000";

let accounts;
let docStoreAdmin;
let docStore;
let userCreatedContractAddress;
let errorResult;

before("compile contract", async () => {
    accounts = await web3.eth.getAccounts();
    docStoreAdmin = await new web3.eth.Contract(JSON.parse(contractInterfaceDSA))
        .deploy({data: bytecodeDSA})
        .send({from: accounts[0], gas:'1000000'})

});

describe('Test that DocStore Administration contract functions correctly', () => {
    it('Deploys document administration contract correctly', () => {
        assert.ok(docStoreAdmin.options.address);
    });

    it('Admin contract returns an empty account if requesting account does not have a contract', async () => {
        let result = await docStoreAdmin.methods.checkIfUserHasStorageContract().call();
        assert.equal(result, nullAddress);
    });

    it('Admin contract create new contract function returns contract address', async () => {
        let contractAddress = await docStoreAdmin.methods.storeNewUserContractAddress().call();
        assert.equal(contractAddress.length, 42);
        assert.notEqual(contractAddress, nullAddress);
    });

    it('Admin contract create new contract function returns contract address and stores it in internal mapping', async () => {
        await docStoreAdmin.methods.storeNewUserContractAddress().send({from: accounts[0], gas:1000000});
        userCreatedContractAddress = await docStoreAdmin.methods.checkIfUserHasStorageContract().call();
        assert.equal(userCreatedContractAddress.length, 42);
        assert.notEqual(userCreatedContractAddress, nullAddress);
    });

    it('Admin contract does not allow more than one contract to be created per account', async () => {
        await docStoreAdmin.methods.storeNewUserContractAddress().call().catch((error) => {errorResult = error});
        assert.equal(errorResult.results[Object.keys(errorResult.results)[0]].error, 'revert');
    });

});

describe('Test that Document Storage Functions Correctly', () => {
    it('Loads the docstore contract created by the contract factory', async () => {
        docStore = await new web3.eth.Contract(JSON.parse(contractInterfaceDStore), userCreatedContractAddress);
        assert.ok(docStore.options.address);
    });

    it('Store new documents successfully', async () => {
        await docStore.methods.addNewDoc(testHash, testTitle, testAuthor).send({from: accounts[0]});
        await docStore.methods.addNewDoc(testHash2, testTitle2, testAuthor).send({from: accounts[0]});
        let testHashInDoc = await docStore.methods.verifyDocHash(testHash).call();
        let testHash2InDoc = await docStore.methods.verifyDocHash(testHash2).call();
        assert.equal(testHashInDoc, true);
        assert.equal(testHash2InDoc, true);
    });

    it('Verifies a stored document correctly and asserts a hash not previously stored is not stored', async () => {
        let testHashInDoc = await docStore.methods.verifyDocHash(testHash).call();
        let wrongHashInDoc = await docStore.methods.verifyDocHash(wrongHash).call();
        assert.equal(testHashInDoc, true);
        assert.equal(wrongHashInDoc, false);
    });

    it('Prevents storing the same document twice', async () => {
        let docStoreErrorResult;
        await docStore.methods.addNewDoc(testHash, testTitle, testAuthor).call().catch((error) => {docStoreErrorResult = error});
        assert.equal(docStoreErrorResult.results[Object.keys(docStoreErrorResult.results)[0]].error, 'revert');
    });

    it('Does not let anyone but the contract owner store document hashes in the contract', async () => {
        let docStoreErrorResult;
        await docStore.methods.addNewDoc(testHash, testTitle, testAuthor).send({from: accounts[1]}).catch((error) => {docStoreErrorResult = error});
        assert.equal(docStoreErrorResult.results[Object.keys(docStoreErrorResult.results)[0]].error, 'revert');
    });

    it('Properly emitted events with proper data onto the blockchain', async () => {
        let events = [];
        let eventFilters = { fromBlock: 0, address:docStore.options.address};
        docStore.events.StoreDoc({}, eventFilters, async function (error, eventResult) {
            if (error)
                console.log('Error in myEvent event handler: ' + error);
            else {
                let docEvents = eventResult.returnValues;
                events.push(docEvents);
            }
        });

        if (events.length == 2){
            assert.equal(docEvents[0]._author, testAuthor);
            assert.equal(docEvents[0]._docName, testTitle);
            assert.equal(docEvents[0]._docHash, testHash);
            assert.equal(docEvents[1]._author, testAuthor);
            assert.equal(docEvents[1]._docName, testTitle2);
            assert.equal(docEvents[1]._docHash, testHash2);
            done();
        }
    })
});
