const path = require('path');
const fs = require('fs');
const solc = require('solc');

function compileFromLocalContractRepo(contractName, contractDir) {

    let contractFileName;
    let contractInput = {sources:{}};

    //Resolve imports
    function findImports (path) {
        let contractPath = path.slice(-4) === '.sol' ? path : path + '.sol';
        return {contents:fs.readFileSync(contractPath, 'utf8')};
    }

    if (contractName.slice(-4) === '.sol'){
        contractFileName = contractName;
        contractName = contractName.slice(0, -4);
    } else {
        contractFileName = contractName + '.sol';
    }

    let deployPath  = (typeof contractDir === "string") ? contractDir + "/" + contractFileName :
        path.resolve(__dirname + '/../', 'Contracts', contractFileName);

    const source = fs.readFileSync(deployPath, 'utf8');

    contractInput['sources'][contractName] = source;
    console.log("Compilation of " + contractName + " completed");
    return solc.compile(contractInput, 1, findImports);

}

module.exports.compileContractFromLocalRepo = compileFromLocalContractRepo;