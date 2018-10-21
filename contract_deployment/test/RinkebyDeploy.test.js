const { expect, should } = require('chai');
const assert = require('assert');
const deployTools = require('../lib/deployTools');
const deployData = ['0x2D3BF0A2D69BDC81D29D128A48198176B198050FD1E43437EC563714B8F916FD', 'Tester'];

var mochaAsync = (fn) => {
    return done => {
        fn.call().then(done, err => {
            done(err);
        });
    };
};

describe('Test Deployment on Rinkeby Test Network', () => {
    it('deploys a contract on rinkeby network using environment config files', mochaAsync(async () => {
        let docstore = await deployTools.truffleDeployWithEnvars('DocStore', 'rinkeby', deployData, '5000000');
        console.log(docstore.options.address);
        expect(docstore.options.address).to.be.ok;
    })).timeout(180000);
});