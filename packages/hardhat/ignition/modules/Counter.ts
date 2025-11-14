import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";


const CounterModule = buildModule("CounterModule", (m) => {

  const defaultInitialCount = 0;

  const initialCount = m.getParameter("initialCount", defaultInitialCount);

  const counter = m.contract("Counter", [initialCount]);

  return { counter };
});

export default CounterModule;

