require('../env')

const {
  BRIDGE_MODES,
  HOME_ERC_TO_NATIVE_ABI,
  FOREIGN_ERC_TO_NATIVE_ABI,
  HOME_AMB_ABI,
  FOREIGN_AMB_ABI,
  MULTISIGN_ABI
} = require('../../commons')
const { web3Home, web3Foreign } = require('../src/services/web3')
const { add0xPrefix, privateKeyToAddress } = require('../src/utils/utils')
const { EXIT_CODES } = require('../src/utils/constants')

const {
  ORACLE_BRIDGE_MODE,
  ORACLE_VALIDATOR_ADDRESS,
  ORACLE_VALIDATOR_ADDRESS_PRIVATE_KEY,
  ORACLE_MAX_PROCESSING_TIME,
  COMMON_HOME_BRIDGE_ADDRESS,
  COMMON_FOREIGN_BRIDGE_ADDRESS,
  ORACLE_HOME_RPC_POLLING_INTERVAL,
  ORACLE_FOREIGN_RPC_POLLING_INTERVAL,
  ORACLE_HOME_START_BLOCK,
  ORACLE_FOREIGN_START_BLOCK,
  ORACLE_HOME_RPC_BLOCK_POLLING_LIMIT,
  ORACLE_FOREIGN_RPC_BLOCK_POLLING_LIMIT,
  ORACLE_HOME_EVENTS_REPROCESSING,
  ORACLE_HOME_EVENTS_REPROCESSING_BATCH_SIZE,
  ORACLE_HOME_EVENTS_REPROCESSING_BLOCK_DELAY,
  ORACLE_FOREIGN_EVENTS_REPROCESSING,
  ORACLE_FOREIGN_EVENTS_REPROCESSING_BATCH_SIZE,
  ORACLE_FOREIGN_EVENTS_REPROCESSING_BLOCK_DELAY
} = process.env

const MULTISIGN_HOME_BRIDGE_ADDRESS = "0x90Af7FF89196539e999B286488e980d9E789953A"

let homeAbi
let foreignAbi
let id

switch (ORACLE_BRIDGE_MODE) {
  case BRIDGE_MODES.ERC_TO_NATIVE:
    homeAbi = HOME_ERC_TO_NATIVE_ABI
    foreignAbi = FOREIGN_ERC_TO_NATIVE_ABI
    id = 'erc-native'
    break
  case BRIDGE_MODES.ARBITRARY_MESSAGE:
    homeAbi = HOME_AMB_ABI
    foreignAbi = FOREIGN_AMB_ABI
    id = 'amb'
    break
  default:
    if (process.env.NODE_ENV !== 'test') {
      throw new Error(`Bridge Mode: ${ORACLE_BRIDGE_MODE} not supported.`)
    } else {
      homeAbi = HOME_ERC_TO_NATIVE_ABI
      foreignAbi = FOREIGN_ERC_TO_NATIVE_ABI
      id = 'erc-native'
    }
}

const homeContract = new web3Home.eth.Contract(homeAbi, COMMON_HOME_BRIDGE_ADDRESS)
const homeMultiSign = new web3Home.eth.Contract(MULTISIGN_ABI, MULTISIGN_HOME_BRIDGE_ADDRESS)
const homeConfig = {
  chain: 'home',
  bridgeAddress: COMMON_HOME_BRIDGE_ADDRESS,
  bridgeABI: homeAbi,
  pollingInterval: parseInt(ORACLE_HOME_RPC_POLLING_INTERVAL, 10),
  startBlock: parseInt(ORACLE_HOME_START_BLOCK, 10) || 0,
  blockPollingLimit: parseInt(ORACLE_HOME_RPC_BLOCK_POLLING_LIMIT, 10),
  web3: web3Home,
  bridgeContract: homeContract,
  eventContract: homeContract,
  multisignContract: homeMultiSign,
  reprocessingOptions: {
    enabled: ORACLE_HOME_EVENTS_REPROCESSING === 'true',
    batchSize: parseInt(ORACLE_HOME_EVENTS_REPROCESSING_BATCH_SIZE, 10) || 1000,
    blockDelay: parseInt(ORACLE_HOME_EVENTS_REPROCESSING_BLOCK_DELAY, 10) || 500
  }
}

const foreignContract = new web3Foreign.eth.Contract(foreignAbi, COMMON_FOREIGN_BRIDGE_ADDRESS)
const foreignConfig = {
  chain: 'foreign',
  bridgeAddress: COMMON_FOREIGN_BRIDGE_ADDRESS,
  bridgeABI: foreignAbi,
  pollingInterval: parseInt(ORACLE_FOREIGN_RPC_POLLING_INTERVAL, 10),
  startBlock: parseInt(ORACLE_FOREIGN_START_BLOCK, 10) || 0,
  blockPollingLimit: parseInt(ORACLE_FOREIGN_RPC_BLOCK_POLLING_LIMIT, 10),
  web3: web3Foreign,
  bridgeContract: foreignContract,
  eventContract: foreignContract,
  reprocessingOptions: {
    enabled: ORACLE_FOREIGN_EVENTS_REPROCESSING === 'true',
    batchSize: parseInt(ORACLE_FOREIGN_EVENTS_REPROCESSING_BATCH_SIZE, 10) || 500,
    blockDelay: parseInt(ORACLE_FOREIGN_EVENTS_REPROCESSING_BLOCK_DELAY, 10) || 250
  }
}

const maxProcessingTime =
  parseInt(ORACLE_MAX_PROCESSING_TIME, 10) || 4 * Math.max(homeConfig.pollingInterval, foreignConfig.pollingInterval)

let validatorPrivateKey
if (ORACLE_VALIDATOR_ADDRESS_PRIVATE_KEY) {
  validatorPrivateKey = add0xPrefix(ORACLE_VALIDATOR_ADDRESS_PRIVATE_KEY)
  const derived = privateKeyToAddress(validatorPrivateKey)
  if (ORACLE_VALIDATOR_ADDRESS && derived.toLowerCase() !== ORACLE_VALIDATOR_ADDRESS.toLowerCase()) {
    console.error(
      `Derived address from private key - ${derived} is different from ORACLE_VALIDATOR_ADDRESS=${ORACLE_VALIDATOR_ADDRESS}`
    )
    process.exit(EXIT_CODES.INCOMPATIBILITY)
  }
}

module.exports = {
  eventFilter: {},
  validatorPrivateKey,
  validatorAddress: ORACLE_VALIDATOR_ADDRESS || privateKeyToAddress(validatorPrivateKey),
  maxProcessingTime,
  shutdownKey: 'oracle-shutdown',
  home: homeConfig,
  foreign: foreignConfig,
  id
}
