import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const YourContractModule = buildModule("YourContractModule", (m) => {
  const defaultOwner = m.getAccount(0);
  const owner = m.getParameter("owner", defaultOwner);
  const yourContract = m.contract("YourContract", [owner]);
  
  return { yourContract };
});

export default YourContractModule;
