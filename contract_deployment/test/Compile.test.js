const assert = require('assert');
const assert_ext = require('chai');
const solCompiler = require('../lib/compile')
const compileData = solCompiler.compileContractFromLocalRepo('Lottery');
const contractInterface = compileData['interface'];
const contractBytecode = compileData['bytecode'];
const path = require('path');

describe('Test Compilation Script', () => {
    it('compiles a contract with bytecode and abi', () => {
        assert_ext.assert.containsAllKeys(compileData, ["bytecode", "interface"]);
    });

    it('dbytecode and contract interface is of the correct format', () => {
       assert.ok(typeof(contractBytecode) === 'string');
       assert.ok(typeof(contractInterface) === 'string');
    });
    it('will compile with an arbitrary directory specified', () => {
        let contractDirectory = path.resolve(__dirname + '/../../dapps/docstore_demo', 'Contracts');
        let {interface, bytecode} = solCompiler.compileContractFromLocalRepo('DocStore',contractDirectory);
        assert_ext.assert.containsAllKeys(compileData, ["bytecode", "interface"]);
        assert.ok(typeof(bytecode) === 'string');
        assert.ok(typeof(contractInterface) === 'string');
    });

});

