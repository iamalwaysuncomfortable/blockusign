require('dotenv').config();
console.log(process.env.ROPSTEN_ID);
const Web3 = require('web3');
const solCompiler = require('./compile');
let HDWalletProvider = require("truffle-hdwallet-provider");
let fs = require('fs');
let redis = require('redis');
let client = redis.createClient({port:parseInt(process.env.REDIS_PORT,10), host:process.env.REDIS_HOST});
let projectContractDirectory;
let result;

const __select_network__ = (networkName) =>{
    let envar_list = {"ropsten":process.env.ROPSTEN_ID, 'rinkeby':process.env.RINKEBY_ID
        ,'mainnet':process.env.MAINNET_ID,'kovan':process.env.KOVAN_ID};
    if (networkName in envar_list) {
        return envar_list[networkName];
    } else {
        throw "specified network name doesn't exist in the ethereum network";
    }
};

const __outputBuildArtifacts__ = (buildResult, contractName, networkName, outputSocket) => {
    //Outputs build artifacts necessary to interacting with the deployed the contract
    let buildNames = {};
    if (typeof(outputSocket) === 'undefined'){
        console.log("No action specified for build artifacts, artifacts will be discarded")
    } else {
        let unixEpoch = Math.round((new Date()).getTime() / 1000);
        let buildArtifact = {};
        buildArtifact.abi = buildResult.options.jsonInterface;
        buildArtifact.address = buildResult.options.address;
        buildArtifact.events = buildResult.events;
        if ('localbin' in outputSocket) {
            if ('binDirectory' in outputSocket.localbin) {

                const binDir = outputSocket.localbin.binDirectory;
                let buildArtifactJSON = JSON.stringify(buildArtifact);
                let filename = contractName + "_" + networkName + "_deploy_" + unixEpoch.toString() + ".json";

                filename = (binDir.substr(-1) !== '/') ? binDir + '/' + filename : binDir + filename;
                fs.writeFile(filename, buildArtifactJSON, 'utf8', function (err) {
                    if (err)
                        return console.log(err);
                    console.log('Contract build written to disk at ' + filename);
                });
                buildNames.localbin = filename;
            }
        }
        if ('redis' in outputSocket){
            let buildArtifactJSON = JSON.stringify(buildArtifact);
            let buildName = contractName + "_" + networkName + "_deploy_" + unixEpoch.toString();
            client.set(buildName, buildArtifactJSON);
            console.log("Contract build written as JSON string to redis at key " + buildName);
            buildNames.redis = buildName;
        }
    }
    return buildNames;
};

const __deployContract__ = async (provider, contractName, args, gas, contractDirectory) => {
    //Set contractDirectory and ensure gas arg is string type
    if (typeof(contractDirectory) === "undefined") { contractDirectory = projectContractDirectory }
    if (typeof(gas) === 'number') gas = gas.toString();

    //Set web3 provider and compile contract
    let web3 = new Web3(provider);
    let {interface, bytecode} = solCompiler.compileContract(contractName, contractDirectory);
    console.log(process.env.ROPSTEN_ID);

    //Output balance remaining
    let accounts = await web3.eth.getAccounts();
    let balance = await web3.eth.getBalance(accounts[0]);
    console.log("balance of " + balance.toString() + " wei remaining on account: " + accounts[0].toString());

    //Deploy
    if (typeof args === 'object'){
        result = await new web3.eth.Contract(JSON.parse(interface)).deploy({data: '0x' + bytecode, arguments:args})
            .send({from: accounts[0], gas: gas}).catch(error => console.log(error));
        console.log(result);
        return result;
    } else {
        result = await new web3.eth.Contract(JSON.parse(interface)).deploy({data: '0x' + bytecode})
            .send({from: accounts[0], gas: gas}).catch(error => console.log(error));
        return result;
    }
};

//Deploy with pre-set environment variables
async function truffleDeployWithEnvars(contractName, networkName, args, gas='1000000', contractDirectory, buildOutputSocket) {
    //Deploy contract with preset envars
    let provider = new HDWalletProvider(process.env.MNEMONIC, __select_network__(networkName));
    result = await __deployContract__(provider, contractName, args, gas, contractDirectory).catch(error => console.log(error));
    let buildLocations = __outputBuildArtifacts__(result, contractName, networkName, buildOutputSocket);
    result.buildLocations = buildLocations;
    return result;
    }

//Deploy with specified mnemonic and provider_id
async function truffleDeployWithCustomConfig(contractName, mnemonic, provider_id, args, gas='1000000', contractDirectory, buildOutputSocket) {
    //Deploy contract with custom envars
    let provider = new HDWalletProvider(mnemonic, provider_id);
    result = await __deployContract__(provider, contractName, args, gas, contractDirectory).catch(error => console.log(error));
    let buildLocations = __outputBuildArtifacts__(result, contractName, networkName, buildOutputSocket);
    result.buildLocations = buildLocations;
    return result
}

function setContractDirectory(directory){
    projectContractDirectory = directory;
}

module.exports.truffleDeployWithEnvars = truffleDeployWithEnvars;
module.exports.truffleDeployWithCustomConfig = truffleDeployWithCustomConfig;
module.exports.setContractDirectory = setContractDirectory;
module.exports.contractDirectory = projectContractDirectory;