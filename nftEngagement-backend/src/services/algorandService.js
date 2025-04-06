const algosdk = require('algosdk');
const algodClient = new algosdk.Algodv2('', 'https://testnet-algorand.api.purestake.io/ps2', '');

// async function verifyNFTOwner(nftId, ownerAddress) {
//   // Fetch NFT ownership from Algorand (simplified)
//   const accountInfo = await algodClient.accountInformation(ownerAddress).do();
//   console.log("Account Info:", accountInfo);
//   // Logic to check if `nftId` is in `accountInfo.assets`
//   return true; // Placeholder
// }

async function getNFTOwner(assetId, ownerAddress) {
  try {
    const accountInfo = await algodClient.accountInformation(ownerAddress).do();
    const assets = accountInfo['assets'] || [];
    const asset = assets.find(a => a['asset-id'] === assetId);
    return asset && asset.amount > 0; // True if the address owns the NFT
  } catch (error) {
    console.error('Error fetching ownership:', error);
    return false;
  }
}