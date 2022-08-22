const { network } = require("hardhat")
const { developmentChains, networkConfig, DECIMALS, INITIAL_PRICE } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
require("dotenv").config()


module.exports = async function ({getNamedAccounts,deployments}) {
    const { deploy, logs } = deployments
    const { deployer } = await getNamedAccounts()
    
    console.log("------------------------Trying to Deploy-------------------------");
    args=[]
    const basicNFT = await deploy("BasicNFT", {
        from: deployer,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
        log:true,
    })
    console.log("----------------------Deployed Successfully----------------------");

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("----------------------Trying to Verify the contract----------------------");
        await verify(basicNFT.address, args)
        console.log("----------------------Verified the Contract Successfully----------------------");
    }
}

module.exports.tags = ["all", "basicMFT","main"];
