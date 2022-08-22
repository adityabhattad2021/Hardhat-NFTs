const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
	developmentChains,
	networkConfig,
	DECIMALS,
	INITIAL_PRICE,
} = require("../../helper-hardhat-config");
const fs = require("fs");
const path = require("path");

!developmentChains.includes(network.name)
	? describe.skip
	: describe("Dynamic SVG NFT Unit tests", () => {
			let dynamicSvgNFT, deployer;
			const chainId = network.config.chainId;

			beforeEach(async () => {
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(["all"]);
				dynamicSvgNFT = await ethers.getContract("DynamicSvgNFT");
				priceAggregatorV3MOck = await ethers.getContract("MockV3Aggregator");
			});

			describe("Constructor", () => {
				it("Initialiazes the NFT Correctly", async () => {
					const name = await dynamicSvgNFT.name();
					const symbol = await dynamicSvgNFT.symbol();
					assert.equal("Dynamic SVG NFT", name);
					assert.equal("DSN", symbol);
				});

				it("Has URI for Correct SVGs", async () => {
					const frownFaceFromContract = await dynamicSvgNFT.getFrownSVGURI();
					const happyFaceFromContract = await dynamicSvgNFT.getHappySVGURI();

					const frownSVG = fs.readFileSync(
						path.resolve(
							__dirname,
							"../../images/dynamicNFTs/frownFace.svg"
						),
						{ encoding: "utf-8" }
					);
					const happySVG = fs.readFileSync(
						path.resolve(
							__dirname,
							"../../images/dynamicNFTs/happyFace.svg"
						),
						{ encoding: "utf-8" }
					);

					const frownURI = await dynamicSvgNFT.SVGToImageURI(frownSVG);
					const happURI = await dynamicSvgNFT.SVGToImageURI(happySVG);
					assert.equal(frownFaceFromContract, frownURI);
					assert.equal(happyFaceFromContract, happURI);
				});
			});

			describe("Mint NFT", () => {
				it("Mints the NFT emits an event and assign the ownership of the NFT to whosever called the mint function.", async () => {
					await new Promise(async (resolve, reject) => {
						dynamicSvgNFT.once("NewNFTMinted", async () => {
							console.log("Event Detected...");
							try {
								const tokenCounter =
									await dynamicSvgNFT.getTokenCounter();
								const ownerOfNFT = await dynamicSvgNFT.ownerOf(
									tokenCounter.toString()
								);
								assert.equal(ownerOfNFT, deployer);
							} catch (error) {
								console.log(error);
								reject(error);
							}
							resolve();
						});
						console.log("Setting up for the test...");
						try {
							const highValue=await ethers.utils.parseEther("5000")
							const transectionResponse = await dynamicSvgNFT.mintNFT(highValue)
							await transectionResponse.wait(1)

						} catch (error) {
							console.log(error);
						}
					});
				});
			});
	  });
