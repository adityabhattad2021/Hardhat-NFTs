// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
// import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

error RandomIpfsNFT__RangeOutOfBounds();
error RandomIpfsNFT__NeedMoreETHSent();
error RandomIpfsNFT__TransferFailure();

// IPFS=Interplanetary File System
contract RandomIpfsNFT is VRFConsumerBaseV2, ERC721URIStorage, Ownable {
	// In this contract when we mint an NFT, we will trigger a chainlink VRF call to get us a random number, using that random number we will get an random NFT.

	// Functions will be for
	// Users to pay to mint the NFT.
	// The owner of the contract can withdraw ETH paid by the users.

	// Variables for chainlink VRF.
	VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
	uint64 private immutable i_subscriptionId;
	bytes32 private immutable i_gasLane;
	uint32 private immutable i_callbackGasLimit;
	uint16 private constant REQUEST_CONFIRMATIONS = 3;
	uint32 private constant NUMBER_OF_WORDS = 1;

	// VRF helpers.
	mapping(uint256 => address) public s_requestIdToSender;

	// NFT Variables
	uint256 public s_tokenCounter;
	uint256 internal constant MAX_CHANCE_VALUE = 100;
	string[] internal s_dogTokenURIs;
	uint256 internal immutable i_mintFee;

	// NFT type decleration
	enum Breed {
		PUG,
		SHIBA_INU,
		ST_BERNARD
	}

    // Events
    event NftRequested(uint256 indexed requestId,address indexed requester);
    event NftMinted(Breed indexed dogNftBreed,address indexed minter);

	constructor(
		address vrfCoordinatorV2,
		uint64 subcriptionId,
		bytes32 gasLane,
		uint32 callbackGasLimit,
		string[3] memory dogTokenURIs,
		uint256 mintFee
	) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random Ipfs NFT", "RIN") {
		i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
		i_subscriptionId = subcriptionId;
		i_gasLane = gasLane;
		i_callbackGasLimit = callbackGasLimit;
		s_tokenCounter = 0;
		s_dogTokenURIs = dogTokenURIs;
		i_mintFee = mintFee;
	}

	function requestNFT() public payable returns (uint256 requestId) {
		console.log("Amt sent is %s , Amt required is %s",msg.value,i_mintFee);
		if (msg.value < i_mintFee) {
			console.log("Request Reverted");
			revert RandomIpfsNFT__NeedMoreETHSent();
		}
		console.log("NFT Owner should be : %s",msg.sender);

		requestId = i_vrfCoordinator.requestRandomWords(
			i_gasLane,
			i_subscriptionId,
			REQUEST_CONFIRMATIONS,
			i_callbackGasLimit,
			NUMBER_OF_WORDS
		);

		s_requestIdToSender[requestId] = msg.sender;
        emit NftRequested(requestId,msg.sender);
	}

	function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
		internal
		override
	{
		address NFTowner = s_requestIdToSender[requestId];
		uint256 newTokenId = s_tokenCounter;

		uint256 moddedRange = randomWords[0] % MAX_CHANCE_VALUE;

		Breed dogNFTBreed = getBreedFromModdedRange(moddedRange);
        s_tokenCounter+=1;
		_safeMint(NFTowner, newTokenId);
		_setTokenURI(newTokenId, s_dogTokenURIs[uint256(dogNFTBreed)]);
        emit NftMinted(dogNFTBreed,NFTowner);
	}

	function getChanceArray() public pure returns (uint256[3] memory) {
		return [10, 30, MAX_CHANCE_VALUE];
	}

	function getBreedFromModdedRange(uint256 moddedRange) public pure returns (Breed) {
		uint256 cumelativeSum = 0;
		uint256[3] memory chanceArray = getChanceArray();

		for (uint256 i = 0; i < chanceArray.length; i++) {
			if (
				moddedRange >= cumelativeSum && moddedRange < cumelativeSum + chanceArray[i]
			) {
				return Breed(i);
			}
			cumelativeSum += chanceArray[i];
		}
	}

	function withdraw() public onlyOwner {
		uint256 amount = address(this).balance;
		(bool success, ) = payable(msg.sender).call{value: amount}("");
		if (!success) {
			revert RandomIpfsNFT__TransferFailure();
		}
	}


    // Getter Functions
    function getMintFee() public view returns(uint256){
        return i_mintFee;
    }

    function getDogTokenURI(uint256 index)public view returns(string memory){
        return s_dogTokenURIs[index];
    }

    function getTokenCounter()public view returns(uint256){
        return s_tokenCounter;
    }
}
