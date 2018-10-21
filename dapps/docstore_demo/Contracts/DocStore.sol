pragma solidity ^0.4.25;

contract DocStore {
    bytes32 public docHash;
    address public docOwner;
    string public docOwnerName;

    constructor(bytes32 docHashInput, string name) public {
        docOwner = msg.sender;
        docHash = docHashInput;
        docOwnerName = name;
    }

    function verifyDocHash(bytes32 testHash) public view returns(bool isDoc){
        if (testHash == docHash)
            return true;
        else
            return false;
    }


}