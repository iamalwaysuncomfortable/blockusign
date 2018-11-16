const usage = "\nERROR: Cannot attempt contract compilation without contract names specified" +
"\nUSAGE: node compileABIs.js --options \n" +
" \n" +
"OPTIONS: \n" +
    " --allimports [contractName]: will output the abis of all contracts imported via import statements by contract specified  \n" +
    " --contracts [name1] [name2] .. [nameN]: list of contracts to compile  \n"+
    " -bytecode: when this flag is included, bytecode will be integrated into the compilation result \n" +
    " \n";

const argv = require('yargs').option('contracts', {
    type: 'array',
    desc: 'The contracts to compile'
}).usage(usage)
    .argv;

const fs = require('fs');
const solCompiler = require('../../../contract_deployment/lib/compile');
const path = require('path');
const contractDirectory = path.resolve(__dirname + /../, 'Contracts');
const outputDir = path.resolve(__dirname + /../, 'abis');

//Compile & export ABI of master contract and all contracts specified in import statements
if ("allimports" in argv && typeof argv.contracts === "undefined" && !(argv.allimports === "undefined")) {
    let compileOutput = solCompiler.compileContractFromLocalRepo(contractDirectory + "/" + argv.allimports);
    let contractList = Object.keys(compileOutput.contracts);
    for (let i = 0; i < contractList.length; i++) {
        let contractName = contractList[i].substr(contractList[i].indexOf(":")+1);
        let abi = compileOutput.contracts[contractList[i]]['interface'];
        if ("bytecode" in argv){
            let bytecode = compileOutput.contracts[contractList[i]]['bytecode'];
            let output = {contractName:contractName, abi:abi, bytecode:bytecode};
            writeOutput(outputDir, output);
        } else {
            let output = {contractName:contractName, abi:abi};
            writeOutput(outputDir, output);
        }
    }
//Compile & export ABI of only specified contracts
} else if( !("allimports" in argv) && !(argv.contracts === "undefined")) {
    for (let i = 0; i < argv.contracts.length; i++) {
        let compileOutput = solCompiler.compileContractFromLocalRepo(contractDirectory + "/" + argv.contracts[i]);
        let contractName = argv.contracts[i].slice(-4) === '.sol' ? argv.contracts[i].substr(0,contractName.length-4) : argv.contracts[i];
        let contractList = Object.keys(compileOutput.contracts);
        let targetContract;
        for (let i = 0; i < contractList.length; i++) {
            if (contractList[i].slice(-contractName.length) === contractName) {
                targetContract = contractList[i];
                break
            }
        }
        let abi = compileOutput.contracts[targetContract]['interface'];
        if ("bytecode" in argv){
            let bytecode = compileOutput.contracts[targetContract]['bytecode'];
            let output = {contractName:contractName, abi:abi, bytecode:bytecode};
            writeOutput(outputDir, output);
        } else {
            let output = {contractName:contractName, abi:abi};
            writeOutput(outputDir, output);
        }
    }
} else {
    console.log(usage);
}

//Write output in json format
function writeOutput(dir, output){
    let buildArtifactJSON = JSON.stringify(output);
    let filename = output['contractName'] + ".json";

    filename = (dir.substr(-1) !== '/') ? dir + '/' + filename : dir + filename;
    fs.writeFile(filename, buildArtifactJSON, 'utf8', function (err) {
        if (err)
            return console.log(err);
        console.log('Contract build written to disk at ' + filename);
    });
}