const Web3 = require('web3');
const {interface, bytecode} = require('./compile');
const HDWalletProvider = require("truffle-hdwallet-provider");
const provider = new HDWalletProvider(require('../set_envars')['mnemonic'], require('../set_envars')['providers'][0]);
const web3 = new Web3(provider);
const initialMessage = "Deployed"
let result;

deploy = async () => {
    accounts = await web3.eth.getAccounts();
    web3.eth.getBalance(accounts[0]).then(console.log);
    console.log(accounts[0]);
    result = await new web3.eth.Contract(JSON.parse(interface)).deploy({data:bytecode})
        .send({from:accounts[0], gas:'1000000'});

    console.log(result.options.address);
    };

deploy();
module.exports = result;