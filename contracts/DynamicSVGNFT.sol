// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNFT is ERC721 {
	// Variables
	uint256 private s_tokenCounter;
	string private i_frownImageURI;
	string private i_happyImageURI;
	string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
	AggregatorV3Interface internal immutable i_priceFeed;
	mapping (uint256 => int256) public s_tokenIdToHighValue;

	// Events 
	event NewNFTMinted(
		uint256 indexed tokenId,
		int256 indexed highValue
	);


	constructor(
		address priceFeedAddress,
		string memory frownSVG,
		string memory happySVG
	) ERC721("Dynamic SVG NFT", "DSN") {
		s_tokenCounter = 0;
		i_happyImageURI=SVGToImageURI(happySVG);
		i_frownImageURI=SVGToImageURI(frownSVG);
		i_priceFeed=AggregatorV3Interface(priceFeedAddress);
	}

	function SVGToImageURI(string memory SVG) public pure returns (string memory) {
		string memory SVGBase64Encoded = Base64.encode(bytes(string(abi.encodePacked(SVG))));
		return string(abi.encodePacked(base64EncodedSvgPrefix, SVGBase64Encoded));
	}

	// High value will be the value at which the NFT will be a happy face. 
	function mintNFT(int256 highValue) public {
		s_tokenIdToHighValue[s_tokenCounter]=highValue;
		// Here token counter works as token ID of each NFT.
		s_tokenCounter += 1;
		_safeMint(msg.sender, s_tokenCounter);
		emit NewNFTMinted(s_tokenCounter,highValue);
	}

	function _baseURI() internal pure override returns (string memory) {
		return "data:application/json;base64,";
	}

	function tokenURI(uint256 tokenId) public view override returns (string memory) {
		require(_exists(tokenId), "URI Query for non existant token");

		(,int256 price, , , )=i_priceFeed.latestRoundData();
		string memory imageURI=i_frownImageURI;
		if(price >= s_tokenIdToHighValue[s_tokenCounter]){
			imageURI=i_happyImageURI;
		}

		return (
			string(
				abi.encodePacked(
					_baseURI(),
					Base64.encode(
						bytes(
							abi.encodePacked(
								'{"name":"',
								name(),
								'","description":"An NFT that changes based on the Chainlink Feed,',
								'"attributes":[{"trait_type":"coolness","value":100}],"image":','"',
								imageURI,
								'"}'
							)
						)
					)
				)
			)
		);
	}


	// Getter functions 
    function getFrownSVGURI() public view returns(string memory){
		return i_frownImageURI;
	}

	function getHappySVGURI() public view returns(string memory){
		return i_happyImageURI;
	}

	function getTokenCounter() public view returns(uint256){
		return s_tokenCounter;
	}
}
