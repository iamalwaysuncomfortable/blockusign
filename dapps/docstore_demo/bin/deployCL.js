const argv = require('yargs').option('args',{ string : true}).argv;
const contractDirectory = path.resolve(__dirname, 'Contracts', contractFileName);
let result;
let args = ("args" in argv) ? argv.args : undefined;


if ("contract" in argv && "network" in argv) {

    (async () => {
        try {
            if ("gas" in argv){
                result = await deployTools.truffleDeployWithEnvars(argv.contract, argv.network, args,argv.gas, );
            } else {
                result = await deployTools.truffleDeployWithEnvars(argv.contract, argv.network, args);
            }
        } catch (e) {
            console.log(e)
        }
    })();
}