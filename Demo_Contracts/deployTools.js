/**File deploys directly to any selected ethereum blockchain except for in memory blockchains.
 * currently the methods rely on the truffle framework
 */
require('dotenv').config();
const Web3 = require('web3');
const solCompiler = require('./compile');
let HDWalletProvider = require("truffle-hdwallet-provider");
let result;

__select_network__ = (networkName) =>{
    let envar_list = {"ropsten":process.env.ROPSTEN_ID, 'rinkeby':process.env.RINKEBY_ID
        ,'mainnet':process.env.MAINNET_ID,'kovan':process.env.KOVAN_ID};
    if (networkName in envar_list) {
        return envar_list[networkName];
    } else {
        throw "specified network name doesn't exist in the ethereum network";
    }
};

__deployContract__ = async (provider, contractName, args, gas) => {
    let web3 = new Web3(provider);
    let {interface, bytecode} = solCompiler.compileContract(contractName);
    if (typeof(gas) === 'number') gas = gas.toString();
    accounts = await web3.eth.getAccounts();
    web3.eth.getBalance(accounts[0]).then(console.log);
    console.log("wei remaining on account: " + accounts[0].toString());
    if (typeof args === 'object'){
        result = await new web3.eth.Contract(JSON.parse(interface)).deploy({data: '0x' + bytecode, arguments:args})
            .send({from: accounts[0], gas: gas}).catch(error => console.log(error));
    } else {
        result = await new web3.eth.Contract(JSON.parse(interface)).deploy({data: '0x' + bytecode})
            .send({from: accounts[0], gas: gas}).catch(error => console.log(error));
    }
    return result
};

async function truffleDeployWithEnvars(contractName, networkName, args, gas='1000000') {
    let provider = new HDWalletProvider(process.env.MNEMONIC, __select_network__(networkName));
    return await __deployContract__(provider, contractName, args, gas)
    }

async function truffleDeployWithCustomConfig(contractName, mnemonic, provider_id, args, gas='1000000') {
    let provider = new HDWalletProvider(mnemonic, provider_id);
    return await __deployContract__(provider, contractName, args, gas)
}

module.exports.truffleDeployWithEnvars = truffleDeployWithEnvars;
module.exports.truffleDeployWithCustomConfig = truffleDeployWithCustomConfig;