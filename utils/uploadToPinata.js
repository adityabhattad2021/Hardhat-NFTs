const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// It is recommended to pin this images to our own node as well.

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataSecretKey = process.env.PINATA_API_SECRET;
const pinata = pinataSDK(
    pinataApiKey,
    pinataSecretKey
);

async function storeImages(imageFilePath) {
	console.log("Pinata testing...");
	// console.log(pinataApiKey);
	// console.log(pinataSecretKey);
	const fullImagePath = path.resolve(imageFilePath);
	console.log(`The full image path is ${fullImagePath}`);
	const files = fs.readdirSync(fullImagePath);
	console.log(`The file array:\n${files}`);
	let responses = [];
	console.log("-----------------------------------------------------------");
	console.log("Uploading to Pinata...");
	for (fileIndex in files) {
		console.log(`Working on file index ${fileIndex}...`);
		const readableStreamForFile = fs.createReadStream(
			`${fullImagePath}/${files[fileIndex]}`
		);
		try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile)
			responses.push(response);
		} catch (error) {
			console.log(error);
		}
	}
	console.log(`Uploaded Successfully here is the responses array:\n${responses}`);
	console.log("-----------------------------------------------------------");

	return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
	try {
		const response = await pinata.pinJSONToIPFS(metadata);
		return response;
	} catch (error) {
		console.log(error);
	}
	return null;
}

module.exports = { storeImages, storeTokenUriMetadata };





