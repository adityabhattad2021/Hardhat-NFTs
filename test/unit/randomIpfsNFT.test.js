const { assert, expect } = require("chai");
const { getNamedAccounts, depoyments, ethers, network } = require("hardhat");
const {
	developmentChains,
	networkConfig,
	DECIMALS,
	INITIAL_PRICE,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
	? describe.skip
	: describe("Random IPFS NFT unit tests", () => {
			let randomIpfsNFT, deployer;
			const chainId = network.config.chainId;

			beforeEach(async () => {
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(["all"]);
				randomIpfsNFT = await ethers.getContract("RandomIpfsNFT");
				vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
			});

			describe("Constructor", () => {
				it("Initiliazes the NFT correctly", async () => {
					const name = await randomIpfsNFT.name();
					const symbol = await randomIpfsNFT.symbol();
					const tokenCounter = await randomIpfsNFT.getTokenCounter();

					let tokenURIs = [
						"ipfs://QmewvZWRWh4JqjmVXe9RfbntfAg7w2BZpXeEUZY2eeCXoG",
						"ipfs://QmUsaqXDHDCqg2vbPK6hkSBfyP9ZJG279dKagu46oh1EvE",
						"ipfs://QmTZxdnnS3s24KKXwpZGSiTD8hZ9czrW5GXAgbrmCb68bN",
					];

					for (let x = 0; x < 3; x++) {
						let newTokenURI = await randomIpfsNFT.getDogTokenURI(
							x.toString()
						);
						assert.equal(newTokenURI, tokenURIs[x]);
					}

					// console.log(tokenURIs);
					assert.equal(name, "Random Ipfs NFT");
					assert.equal(symbol, "RIN");
					assert.equal(tokenCounter.toString(), "0");
				});
			});

			describe("Request NFT", () => {
				it("Mints the NFT and assign its ownership to whosever calls the request NFT function", async () => {
					await new Promise(async (resolve, reject) => {
						randomIpfsNFT.once("NftMinted", async () => {
							console.log("NftMinted event found!");
							try {
								const ownerOfMintedNFT =
									await randomIpfsNFT.ownerOf("0");
								assert.equal(ownerOfMintedNFT, deployer);
							} catch (error) {
								console.log(error);
								reject(error);
							}
							resolve();
						});
						console.log("Setting Variables...");
						try {
							const transectionResponse =
								await randomIpfsNFT.requestNFT({
									value: ethers.utils.parseEther("0.1"),
								});
							const transectionRecipt = await transectionResponse.wait(
								1
							);
							console.log(
								`----------------------------------------------`
							);
							console.log("Theses are the following events emitted.");
							console.log(transectionRecipt.events);
							console.log(
								`----------------------------------------------`
							);
							await vrfCoordinatorV2Mock.fulfillRandomWords(
								transectionRecipt.events[1].args.requestId,
								randomIpfsNFT.address
							);
						} catch (error) {
							console.log(error);
						}
					});
				});
			});

			describe("Withdraw", () => {
				it("Gets reverted if the caller is not the owner", async () => {
					const newAccount = (await ethers.getSigners())[5];
					const accountConnectedToContract = await randomIpfsNFT.connect(
						newAccount
					);
					await expect(accountConnectedToContract.withdraw()).to.be.reverted;
				});
			});
	  });
