const deployTools = require('../deployTools');
const deployData = ['0x2D3BF0A2D69BDC81D29D128A48198176B198050FD1E43437EC563714B8F916FD', 'Tester']

describe('Deploys Correctly to Rinkeby using Deployment Tools', () => {
    it('deploys a contract on rinkeby network using environment config files', () => {
        let docstore = deployTools.truffleDeployWithEnvars('DocStore','rinkeby',deployData);
        assert.ok(lottery.options.address);
    });

    it('deploys a contract on rinkeby network using environment config files', () => {
        require('dotenv').config();
        let docstore = deployTools.truffleDeployWithCustomConfig('DocStore', process.env.MNEMONIC, process.env.RINKEBY_ID,deployData);
        assert.ok(lottery.options.address);
    });
});