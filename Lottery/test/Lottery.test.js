const assert = require('assert');
const assert_ext = require('chai');
const ganache = require('ganache-cli');
const Web3 = require('Web3');
const web3 = new Web3(ganache.provider());
const {interface, bytecode} = require('../compile');

let accounts;
let lottery;

beforeEach(async () => {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from: accounts[0], gas:'1000000'})
});

async function qqq(){
accounts = await web3.eth.getAccounts();

lottery = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({from: accounts[0], gas:'1000000'})
}

async function setDeets() {
    accounts = await web3.eth.getAccounts();

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({data: bytecode})
        .send({from: accounts[0], gas:'1000000'})
}

describe('Inbox', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
    });
    it('has a a manager', async () => {
        const managerAccount = await lottery.methods.manager().call();
        assert.equal(accounts[0], managerAccount);
    });
    it('creates new players with appropriate balance', async () => {
        await lottery.methods.enter().send({from:accounts[1], value:web3.utils.toWei('1', 'ether')});
        await lottery.methods.enter().send({from:accounts[2], value:web3.utils.toWei('2', 'ether')});
        let players = await lottery.methods.getPlayers().call();
        assert.equal(web3.utils.fromWei(await web3.eth.getBalance(lottery.options.address)), '3');
        assert.equal(players[0], accounts[1]);
        assert.equal(players[1], accounts[2]);
    });
    it('does not allow anyone other than contract creator to pick a winner', async () => {
        try {
            await lottery.methods.pickWinner.send({from: accounts[1]});
            assert(false);
        } catch (err) {
            assert(err)
        }
    });
    it('allows only the contract creator to pick a winner, awards balance to winner, clears contract balance & entrants', async () => {
        player1InitialBalance = web3.utils.fromWei(await web3.eth.getBalance(accounts[1]));
        player2InitialBalance = web3.utils.fromWei(await web3.eth.getBalance(accounts[2]));

        await lottery.methods.enter().send({from:accounts[1], value:web3.utils.toWei('2', 'ether')});
        await lottery.methods.enter().send({from:accounts[2], value:web3.utils.toWei('2', 'ether')});
        await lottery.methods.pickWinner().send({from:accounts[0]});

        playerList = await lottery.methods.getPlayers().call();
        assert.equal(await web3.eth.getBalance(lottery.options.address), '0');
        assert(Array.isArray(playerList));
        assert.equal(playerList.length, 0);

        player1Finalbalance = web3.utils.fromWei(await web3.eth.getBalance(accounts[1]));
        player2Finalbalance = web3.utils.fromWei(await web3.eth.getBalance(accounts[2]))
        assert((player1Finalbalance - player1InitialBalance) > 1.9 || (player2Finalbalance - player2InitialBalance) > 1.9);
    });
});