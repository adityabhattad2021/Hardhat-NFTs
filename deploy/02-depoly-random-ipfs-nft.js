const { network, ethers } = require("hardhat")
const { developmentChains, networkConfig, DECIMALS, INITIAL_PRICE } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")
const { storeImages, storeTokenUriMetadata } = require("../utils/uploadToPinata")
require("dotenv").config()

const imagesLocation = "./images/randomIpfsImages";

const metadataTemplate = {
    name: "",
    description: "",
    image: "",
    attributes: [
        {
            trait_type: "Cuteness",
            value:100,
        },
    ],
}

let tokenURIs = [
    'ipfs://QmaVkBn2tKmjbhphU7eyztbvSQU5EXDdqRyXZtRhSGgJGo',
    'ipfs://QmYQC5aGZu2PTH8XzbJrbDnvhj3gVs7ya33H9mqUNvST3d',
    'ipfs://QmZYmH5iDbD6v3U2ixoVAjioSzvWJszDzYdbeCLquGSpVm',
]

let VRF_FUND_AMOUNT=ethers.utils.parseEther("0.50") 

module.exports = async function ({getNamedAccounts,deployments}) {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId  = network.config.chainId

 
    if (process.env.UPLOAD_TO_PINATA == "true") {
        tokenURIs =await handleTokenURIs()        
    }

    let vrfCoordinatorV2Address,subscriptionId

    if (developmentChains.includes(network.name)) {
        const vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock")
        vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address
        const transectionResponse =await  vrfCoordinatorV2Mock.createSubscription()
        const transectionRecipt =await  transectionResponse.wait(1)
        subscriptionId = transectionRecipt.events[0].args.subId
        await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, VRF_FUND_AMOUNT);
    } else {
        vrfCoordinatorV2Address = networkConfig[chainId]["vrfCoordinatorV2"]
        subscriptionId = networkConfig[chainId]["subscriptionId"]
    }


    const gasLane = networkConfig[chainId]["gasLane"]
    const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"]
    const mintFee=networkConfig[chainId]["mintFee"]

    const args = [
        vrfCoordinatorV2Address,
        subscriptionId,
        gasLane,
        callbackGasLimit,
        tokenURIs,
        mintFee
    ]

    
    console.log("------------------------Trying to Deploy-------------------------");

    const randomIpfsNFT = await deploy("RandomIpfsNFT", {
        from: deployer,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
        log:true
    })
    console.log("----------------------Deployed Successfully----------------------");


    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("----------------------Trying to Verify the contract----------------------");
        await verify(randomIpfsNFT.address, args)
        console.log("----------------------Verified the Contract Successfully----------------------");
    }
}

async function handleTokenURIs() {
    console.log("Handling token URIs...");
    tokenURIs = []
    // This function will:
    // Store the Images in IPFS
    // Store Metadata in IPFS
    const { responses: imageUploadResponses, files } = await storeImages(imagesLocation)
    for (imageUploadResponseIndex in imageUploadResponses) {
        let tokenUriMetadata = { ...metadataTemplate }
        tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "")
        tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`
        tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`
        console.log(`Uploading ${tokenUriMetadata.name}...`);
        const metadataUploadResponse = await storeTokenUriMetadata(tokenUriMetadata)
        tokenURIs.push(`ipfs://${metadataUploadResponse.IpfsHash}`)
        console.log(`Token URI for ${tokenUriMetadata.name} is ${tokenURIs[imageUploadResponseIndex]} .`);
    }
    return tokenURIs
}


module.exports.tags = ["all", "randomipfs", "main"];