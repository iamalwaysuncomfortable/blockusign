require('dotenv').config();
const Web3 = require('web3');
const solCompiler = require('./compile');
let result;

__deployContract__ = (web3, contractName) => {
    let {interface, bytecode} = solCompiler.compileContract(contractName);
    accounts = await web3.eth.getAccounts();
    web3.eth.getBalance(accounts[0]).then(console.log);
    console.log(accounts[0]);
    result = await new web3.eth.Contract(JSON.parse(interface)).deploy({data:bytecode})
        .send({from:accounts[0], gas:'1000000'});
    return result
}

truffleDeployWithEnvars = async (contractName) => {
    let HDWalletProvider = require("truffle-hdwallet-provider");
    let provider = new HDWalletProvider(process.env.MNEMONIC, process.env.PROVIDER_ID);
    let web3 = new Web3(provider);
    return __deployContract__(web3, contractName)
    };

truffleDeployWithCustomConfig = async (contractName, mnemonic, provider_id) => {
    let HDWalletProvider = require("truffle-hdwallet-provider");
    let provider = new HDWalletProvider(mnemonic, provider_id);
    let web3 = new Web3(provider);
    return __deployContract__(web3, contractName)
};

module.exports.truffleDeployWithEnvars = truffleDeployWithEnvars;
module.exports.truffleDeployWithCustomConfig = truffleDeployWithCustomConfig;