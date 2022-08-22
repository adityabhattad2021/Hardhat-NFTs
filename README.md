# This project has three types of NFT contracts:

1. Basic NFT: the contract only has a TokenURI access which is already pinned image on Ipfs Manually.


2. Random IPFS NFT: Pinned on IPFS by Pinata.

        Pros: Cheap
        Cons: Someone still needs to pin our data


3. Dynamic SVG NFT Hosted Completely on Blockchain.

        Pros: The data will be on chain
        Cons: Much more expensive


## To interact with the project:

1. Setup
```
git clone https://github.com/adityabhattad2021/Hardhat-NFTs.git
cd Hardhat-NFTs
yarn
```

2. Usage

 i. Deploy:
```
yarn hardhat deploy
```
 ii. Mint
```
yarn hardhat deploy --tags main,mint
```


# Thankyou for visiting the project!
