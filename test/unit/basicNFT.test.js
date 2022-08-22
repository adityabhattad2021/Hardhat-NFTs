const { assert, expect } = require("chai");
const { getNamedAccounts, deployments, ethers, network } = require("hardhat");
const {
	developmentChains,
	networkConfig,
	DECIMALS,
	INITIAL_PRICE,
} = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
	? describe.skip
	: describe("Basic NFT unit tests", () => {
			let basicNFT, deployer;
        const chainId = network.config.chainId;

        beforeEach(async () => {
            deployer = (await getNamedAccounts()).deployer;
            await deployments.fixture(["all"]);
            basicNFT = await ethers.getContract("BasicNFT", deployer)
        })

        describe("Construtor", () => {
            it("Initilizes the NFT Correctly.", async () => {
                const name = await basicNFT.name()
                const symbol = await basicNFT.symbol()
                const tokenCounter=await basicNFT.getTokenCounter()
                assert.equal(name, "CUTEDOG")
                assert.equal(symbol, "CDOG")
                assert.equal(tokenCounter.toString(),"0")
            })
        })

        describe("Mint NFT", () => {
            it("Sets the owner of the NFT correctly", async () => {
                const transectionResponse = await basicNFT.mintNFT()
                const transectionRecipt = await transectionResponse.wait(1)
                // console.log(transectionRecipt.events[0]);
                // console.log(transectionResponse);
                const owner = await basicNFT.ownerOf([1])
                assert.equal(owner,deployer)
            })  
            it("Increases the token counter", async () => {
                const transectionResponse = await basicNFT.mintNFT()
                const transectionRecipt = await transectionResponse.wait(1)
                const tokenCounter = await basicNFT.getTokenCounter()
                assert.equal(tokenCounter.toString(),"1")
            })
        })


        
	  });
