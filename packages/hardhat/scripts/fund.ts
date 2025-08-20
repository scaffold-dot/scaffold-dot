import { sr25519CreateDerive } from "@polkadot-labs/hdkd"
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers"
import { getPolkadotSigner } from "polkadot-api/signer"
import { createClient } from "polkadot-api"
import { getWsProvider } from "polkadot-api/ws-provider/node"
import { MultiAddress, dot } from "@polkadot-api/descriptors"
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { start } from "polkadot-api/smoldot"
 
// let's create Alice signer
const miniSecret = entropyToMiniSecret(mnemonicToEntropy(DEV_PHRASE))
const derive = sr25519CreateDerive(miniSecret)
const aliceKeyPair = derive("//Alice")
const alice = getPolkadotSigner(
  aliceKeyPair.publicKey,
  "Sr25519",
  aliceKeyPair.sign,
)
 
// Connect to the local polkadot relay chain.
const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("ws://127.0.0.1:9944") // or any other port
  )
);
 
// get the safely typed API
const api = client.getTypedApi(dot)

// Map Alice account to send transfer to H160 account
const mapAccount = api.tx.Revive.mapAccount()

// sign and submit the extrinsic
mapAccount.signSubmitAndWatch(alice).subscribe({
  next: (event) => {
    console.logt("Mapping Alice account for H160 transfers", event.type)
    if (event.type === "txBestBlocksState") {
      console.log("The tx is now in a best block")
    }
  }
})

// Send DOT to hardhat account 0 of type Address20. account 0 is the named account 'deployer'
const DEPLOYER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const call = api.tx.Revive.call({
  dest: MultiAddress.Address20(DEPLOYER),
  value: 100n ** 10n,
  gasLimit: {
    refTime: 0,
    proofSize: 0,
  },
  storageDepositLimit: 0,
  data: "0x"
})
 
// sign and submit the transaction while looking at the
// different events that will be emitted
transfer.signSubmitAndWatch(alice).subscribe({
  next: (event) => {
    console.log("Tx event: ", event.type)
    if (event.type === "txBestBlocksState") {
      console.log("The tx is now in a best block, check it out:")
    }
  },
  error: console.error,
  complete() {
    client.destroy()
  },
})
// Send DOT to hardhat account 0 of type Address20. account 0 is the named account 'deployer'
// create the transaction sending Bob some assets
const DEPLOYER = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const transfer = api.tx.Balances.transfer_allow_death({
  dest: MultiAddress.Address20(DEPLOYER),
  value: 100n ** 10n,
})
 
// sign and submit the transaction while looking at the
// different events that will be emitted
transfer.signSubmitAndWatch(alice).subscribe({
  next: (event) => {
    console.log("Tx event: ", event.type)
    if (event.type === "txBestBlocksState") {
      console.log("The tx is now in a best block, check it out:")
    }
  },
  error: console.error,
  complete() {
    client.destroy()
  },
})
