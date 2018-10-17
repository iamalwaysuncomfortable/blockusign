const assert = require('assert');
const assert_ext = require('chai');
const solCompiler = require('../compile')
const compileData = solCompiler.compileContract('Lottery');
const contractInterface = compileData['interface'];
const bytecode = compileData['bytecode'];

describe('compilation script', () => {
    it('compiles a contract with bytecode and abi', () => {
        assert_ext.assert.containsAllKeys(compileData, ["bytecode", "interface"]);
    });

    it('bytecode and contract interface is of the correct format', () => {
       assert.ok(typeof(bytecode) === 'string');
       assert.ok(typeof(contractInterface) === 'string');
    });

});

