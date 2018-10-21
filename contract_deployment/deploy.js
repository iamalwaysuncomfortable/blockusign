const deployTools = require('./lib/deployTools');
const contractDirectory = require('./dirname');
const deployData = ['0x2D3BF0A2D69BDC81D29D128A48198176B198050FD1E43437EC563714B8F916FD', 'Tester'];
let result;

(async () => {
    try {
        result = await deployTools.truffleDeployWithEnvars('DocStore', 'rinkeby', deployData, '5000000',contractDirectory);
        console.log(docstore.options.address);
    } catch (e) {
        console.log(e);
    }
})();