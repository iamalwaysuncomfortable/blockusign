const deployTools = require('./deployTools');
let result;

(async () => {
    try {
        result = await deployTools.truffleDeployWithEnvars('DocStore', 'rinkeby',['0x2D3BF0A2D69BDC81D29D128A48198176B198050FD1E43437EC563714B8F916FD','Tester'],'5000000');
    } catch (e) {
        console.log(e)
    }
})();