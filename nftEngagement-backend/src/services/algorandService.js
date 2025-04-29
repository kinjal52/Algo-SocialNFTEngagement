const algosdk = require("algosdk");

const algodClient = new algosdk.Algodv2(
  { "X-API-Key": process.env.PURESTAKE_API_KEY },
  "https://testnet-algorand.api.purestake.io/ps2",
  ""
);

// Validate Algorand address
function validateAddress(address) {
  if (!address || !algosdk.isValidAddress(address)) {
    throw new Error("Invalid or missing Algorand address");
  }
}

// Check NFT ownership
async function getNFTOwner(assetId, ownerAddress) {
  try {
    validateAddress(ownerAddress);
    const accountInfo = await algodClient.accountInformation(ownerAddress).do();
    const assets = accountInfo["assets"] || [];
    const asset = assets.find((a) => a["asset-id"] === parseInt(assetId));
    return asset && asset.amount > 0;
  } catch (error) {
    console.error("Error checking ownership:", error.message);
    throw new Error("Failed to verify NFT ownership");
  }
}

module.exports = { getNFTOwner, validateAddress };