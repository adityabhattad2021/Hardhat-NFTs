const { developmentChains,DECIMALS,INITIAL_PRICE } = require("../helper-hardhat-config")


module.exports = async function ({ getNamedAccounts, network, ethers,deployments }) {
    const BASE_FEE = ethers.utils.parseEther("0.25") // 0.25 is the premium it costs 0.25 LINK per request.
    const GAS_PRICE = 1e9

    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const argsForVRFCoordinatorV2Mock = [BASE_FEE, GAS_PRICE]
    const argsForMockV3Aggregator=[DECIMALS,INITIAL_PRICE]
    
    if (developmentChains.includes(network.name)) {
        console.log("------------------------------------------------------");
        console.log("Local Network Detected");
        console.log("Trying to deploy mocks");

        await deploy("VRFCoordinatorV2Mock",{
            from: deployer,
            args: argsForVRFCoordinatorV2Mock,
            log: true,
            waitConfirmations: network.config.blockConfirmations || 1,
        })

        await deploy("MockV3Aggregator", {
            from: deployer,
            args: argsForMockV3Aggregator,
            log: true,
            waitConfirmations:network.config.blockConfirmations || 1,
        })

        console.log("Successfully  deployed the mocks");
        console.log("------------------------------------------------------");
    }
}

module.exports.tags = ["all","mocks"]