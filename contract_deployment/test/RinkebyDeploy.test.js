const { expect, should } = require('chai');
const assert = require('assert');
const redis = require('redis');
const rclient = redis.createClient({port:parseInt(process.env.REDIS_PORT,10), host:process.env.REDIS_HOST});
const deployTools = require('../lib/deployTools');
const deployData = ['0x2D3BF0A2D69BDC81D29D128A48198176B198050FD1E43437EC563714B8F916FD', 'Tester'];
const path = require('path');
const buildDir = path.resolve(__dirname + "/../../dapps/docstore_demo/bin/ContractBuilds");
let buildSocket = {"localbin": {"binDirectory":buildDir},"redis":true};
let fs = require('fs');

var mochaAsync = (fn) => {
    return done => {
        fn.call().then(done, err => {
            done(err);
        });
    };
};

describe('Test Deployment on Rinkeby Test Network', () => {
    it('deploys a the build artifacts in the correct locations with the correct data', mochaAsync(async () => {
        //Deploy Contract
        let docstore = await deployTools.truffleDeployWithEnvars('DocStore', 'rinkeby', deployData, '5000000',undefined,buildSocket);

        let redisBuild;
        let localBuild;

        //Collect redis build
        rclient.get(docstore.buildLocations.redis, function (err, result){ redisBuild = JSON.parse(result); });

        //Collect local build
        fs.readFile(docstore.buildLocations.localbin, function (err, result) { localBuild = JSON.parse(result); });

        expect(docstore.options.address).to.be.ok;
        expect(localBuild).to.have.keys(['abi','address']);
        expect(redisBuild).to.have.keys(['abi','address'])

    })).timeout(120000);
});