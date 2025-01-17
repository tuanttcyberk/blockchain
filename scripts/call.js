const { ethers } = require('ethers');
const dotenv = require('dotenv');


dotenv.config();

// You'll need the contract ABI - this is just an example
const abi = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_message",
                "type": "string"
            }
        ],
        "name": "setMessage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

async function setMessage(newMessage) {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
    const signer = new ethers.Wallet(process.env.PRIVATE_KEY_2, provider);
    const contractAddress = '0xc7F09AC305482260D78C44cC91D94Da2374bD6ca';
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    try {
        const tx = await contract.setMessage(newMessage);
        await tx.wait();
        console.log('Message set successfully!');
    } catch (error) {
        console.error('Error:', error);
    }
}

setMessage("New message")
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });