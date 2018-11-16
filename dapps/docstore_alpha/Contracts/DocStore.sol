pragma solidity ^0.4.25;

contract DocStore {

    mapping (bytes32 => bytes32) private documents;
    address public docStoreOwner;

    //Only the owner can store new documents
    modifier onlyOwner {
        require(
            msg.sender == docStoreOwner,
            "Only this contract's owner can call this function."
        );
        _;
    }

    //Ensure no collisions in document hash maps
    modifier noCollisions(bytes32 docHash) {
        require(
            documents[docHash] != docHash,
            "Document already stored!"
        );
        _;
    }

    //Outside caller specifies document owner
    constructor(address owner) public {
        docStoreOwner = owner;
    }

    //Add the hash of a new document
    function addNewDoc(bytes32 docHash) public onlyOwner noCollisions(docHash) {
        documents[docHash] = docHash;
    }

    //Verify existing hashes work
    function verifyDocHash(bytes32 testHash) public view returns(bool isDoc){
        if (documents[testHash] == testHash)
            return true;
        else
            return false;
    }
}