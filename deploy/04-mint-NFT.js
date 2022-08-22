const { ethers, network } = require("hardhat");
const { developmentChains } = require("../helper-hardhat-config");


module.exports = async function({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts()
    
    // Basic NFT 
    console.log("--------------------------------------------------------");
    console.log("Trying to mint basic NFT...");
    const basicNFT = await ethers.getContract("BasicNFT", deployer)
    const basicMintTransection = await basicNFT.mintNFT()
    await basicMintTransection.wait(1)
    console.log(`Basic NFT index 1 has token URI: ${await basicNFT.tokenURI(1)}`);
    console.log("--------------------------------------------------------");

    // Random IPFS NFT  
    console.log("--------------------------------------------------------");
    console.log("Trying to mint random IPFS NFT...");
    const randomIpfsNFT = await ethers.getContract("RandomIpfsNFT", deployer)
    const mintFee = ethers.utils.parseEther("0.1")
    await new Promise(async (resolve, reject) => {
        setTimeout(reject, 300000) //300000 means 5 minutes
        randomIpfsNFT.once("NftMinted", async function () {
            resolve()
        })
        const randomIpfsNFTMintTransectionResponse = await randomIpfsNFT.requestNFT({ value: mintFee.toString() })
        const randomIpfsNFTMintTransectionRecipt = await randomIpfsNFTMintTransectionResponse.wait(1)
        if (developmentChains.includes(network.name)) {
            const requestId = randomIpfsNFTMintTransectionRecipt.events[1].args.requestId
            const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock", deployer)
            await vrfCoordinatorV2Mock.fulfillRandomWords(requestId,randomIpfsNFT.address)
        }
    })
    console.log(`Random IPFS NFT index 1 token URI: ${await randomIpfsNFT.getDogTokenURI(1)}`);
    console.log("--------------------------------------------------------");

    // Dynamic SVG NFT
    console.log("--------------------------------------------------------");
    console.log("Trying to mint Dynamic SVG NFT...");
    const highValue = ethers.utils.parseEther("8000")
    const dynamicSvgNFT = await ethers.getContract("DynamicSvgNFT", deployer)
    const dynamicSvgNFTMintTransectionResponse = await dynamicSvgNFT.mintNFT(highValue.toString())
    await dynamicSvgNFTMintTransectionResponse.wait(1)
    console.log(`Dynamic SVG NFT at index 1 has tokenURI: ${await dynamicSvgNFT.tokenURI(1)}`);
    console.log("--------------------------------------------------------");


}

module.exports.tags =["mint"]