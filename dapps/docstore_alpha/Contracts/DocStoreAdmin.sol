pragma solidity ^0.4.24;


import {DocStore} from "/home/salty/Development/SmartContracts/dapps/docstore_alpha/Contracts/DocStore.sol";

//Contract to be communicated with to determine whether user has account
contract DocStoreAdmin {

    address private docStoreFactoryAdmin;
    mapping (address => address) private storageContractOwnerList;

    modifier noExistingAccount {
        require(
            storageContractOwnerList[msg.sender] == 0x0000000000000000000000000000000000000000,
            "User can only call this if they don't already have an account"
        );
        _;
    }

    constructor() public {
        docStoreFactoryAdmin = msg.sender;
    }

    function checkIfUserHasStorageContract() public view returns(address){
        return storageContractOwnerList[msg.sender];
    }

    function storeNewUserContractAddress() public noExistingAccount returns(address) {
        address newContract = new DocStore(msg.sender);
        storageContractOwnerList[msg.sender] = newContract;
        return newContract;
    }
}
