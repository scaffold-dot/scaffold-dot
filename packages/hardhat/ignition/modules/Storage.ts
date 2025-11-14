import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const StorageModule = buildModule("StorageModule", (m) => {


  const storage = m.contract("Storage", []);

  return { storage };
});

export default StorageModule;