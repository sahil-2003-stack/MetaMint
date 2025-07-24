import { ethers } from "ethers"

export const MEMBERSHIP_NFT_ADDRESS = "0x3C9252d9488F463490217d68c9E4aF0C5617AC99";

export const MEMBERSHIP_NFT_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "tier", "type": "string" }
    ],
    "name": "mintMembership",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "tokenTier",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenCounter",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mintingActive",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMintStatus",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // ...other ERC721/AccessControl functions...
];

export const getContractInstance = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
        throw new Error("MetaMask not found");
    }
    try {
        // Note: ethers v6 uses BrowserProvider
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        // Use the correct address and ABI
        const contractWithSigner = new ethers.Contract(MEMBERSHIP_NFT_ADDRESS, MEMBERSHIP_NFT_ABI, signer);
        const contractReadOnly = new ethers.Contract(MEMBERSHIP_NFT_ADDRESS, MEMBERSHIP_NFT_ABI, provider);

        return { contract: contractWithSigner, contractReadOnly };
    } catch (err) {
        console.error("Error in getContractInstance:", err);
        throw err;
    }
};
