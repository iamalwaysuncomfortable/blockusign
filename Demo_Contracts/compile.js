const path = require('path');
const fs = require('fs');
const solc = require('solc');


function compileContract(contractName){
    let contractFileName;

    if (typeof(contractName) !== "string"){
        throw "contract name must be a string";
    }

    if (contractName.slice(-4) === '.sol'){
        contractFileName = contractName;
        contractName = contractName.slice(0, -4);

    } else {
        contractFileName = contractName + '.sol';
    }

    const deployPath = path.resolve(__dirname, 'Contracts', contractFileName);
    const source = fs.readFileSync(deployPath, 'utf8');
    return solc.compile(source, 1).contracts[':' + contractName];
}



module.exports.compileContract = compileContract;