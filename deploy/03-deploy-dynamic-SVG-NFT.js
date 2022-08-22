const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const fs=require("fs")


module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    
    const chainId = network.config.chainId
    
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const frownSVG =  fs.readFileSync("./images/dynamicNFTs/frownFace.svg", { encoding: "utf-8" })
    const happySVG = fs.readFileSync("./images/dynamicNFTs/happyFace.svg", { encoding: "utf-8" })

    args = [
        ethUsdPriceFeedAddress,
        frownSVG,
        happySVG
    ]

    console.log("------------------------Trying to Deploy-------------------------");

    const dynamicSVGNFT = await deploy("DynamicSvgNFT", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations:network.config.blockConfirmations || 1
    })

    console.log("----------------------Deployed Successfully----------------------");


    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("----------------------Trying to Verify the contract----------------------");
        await verify(dynamicSVGNFT.address,args)
        console.log("----------------------Verified the Contract Successfully----------------------");    
    }
    
}


module.exports.tags = ["all", "dynamicSVG", "main"];