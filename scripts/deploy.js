async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const verifySignature = await ethers.deployContract("VerifySignature", [deployer.address]);
  await verifySignature.waitForDeployment();

  console.log("VerifySignature deployed to:", await verifySignature.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 