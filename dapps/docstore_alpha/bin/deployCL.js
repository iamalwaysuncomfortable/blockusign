const solDeployer = require('../../../contract_deployment/lib/deployTools');
const argv = require('yargs').option('args',{ string : true}).argv;
const path = require('path');
const contractDirectory = path.resolve(__dirname + /../, 'Contracts');
const gas = ('gas' in argv) ? argv.gas.toString() : '100000';
const args = ("args" in argv) ? argv.args : undefined;
let result;

if ("contract" in argv && "network" in argv) {
    console.log("\nAttempting deployment of " + argv.contract + ".sol to " + argv.network + " network with gas value of "
        + gas + " with args of [" + argv.args + "]\n");
    (async () => {
        try {
            result = await solDeployer.truffleDeployWithEnvars(argv.contract, argv.network, args, gas, contractDirectory);
        } catch (e) {
            console.log(e);
        }
    })();
} else {
    console.log("\nERROR: Cannot attempt contract deployment without contract name and network specified" +
        "\nUSAGE: node deployCL.js --options \n" +
        " \n" +
        "OPTIONS: \n" +
        " --contract: name of .sol file to compile and deploy, case sensitive \n" +
        " --network: name of valid ethereum network, lowercase \n"+
        " --gas: amount of gas to send \n" +
        " --args: contract arguments, specified in order ex: '--args: 'documentName' --args: '5' --args:'0x3523'" +
        " \n");
    console.log("args specified were:", argv, '\n');
}