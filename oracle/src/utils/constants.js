module.exports = {
  EXTRA_GAS_PERCENTAGE: 4,
  EXTRA_GAS_ABSOLUTE: 250000,
  AMB_AFFIRMATION_REQUEST_EXTRA_GAS_ESTIMATOR: len => Math.floor(0.0035 * len ** 2 + 40 * len),
  MIN_AMB_HEADER_LENGTH: 32 + 20 + 20 + 4 + 2 + 1 + 2,
  MAX_GAS_LIMIT: 10000000,
  MAX_CONCURRENT_EVENTS: 50,
  MAX_HISTORY_BLOCK_TO_REPROCESS: 10000,
  RETRY_CONFIG: {
    retries: 20,
    factor: 1.4,
    maxTimeout: 360000,
    randomize: true
  },
  DEFAULT_UPDATE_INTERVAL: 600000,
  DEFAULT_GAS_PRICE_FACTOR: 1,
  EXIT_CODES: {
    GENERAL_ERROR: 1,
    WATCHER_NOT_REQUIRED: 0,
    INCOMPATIBILITY: 10,
    MAX_TIME_REACHED: 11
  },
  GAS_PRICE_BOUNDARIES: {
    MIN: 1,
    MAX: 1000
  },
  DEFAULT_TRANSACTION_RESEND_INTERVAL: 20 * 60 * 1000,
  FALLBACK_RPC_URL_SWITCH_TIMEOUT: 60 * 60 * 1000,
  BLOCK_NUMBER_PROGRESS_ITERATIONS_LIMIT: 10,
  SENDER_QUEUE_MAX_PRIORITY: 10,
  SENDER_QUEUE_SEND_PRIORITY: 5,
  SENDER_QUEUE_CHECK_STATUS_PRIORITY: 1,
  ASYNC_CALL_ERRORS: {
    // requested transaction/block/receipt does not exist
    NOT_FOUND: '0x0000000000000000000000000000000000000000000000000000000000000000',
    // requested custom block does not exist yet or its timestamp is greater than the home block timestamp
    BLOCK_IS_IN_THE_FUTURE: '0x0000000000000000000000000000000000000000000000000000000000000001',
    // eth_call has reverted or finished with OOG error
    REVERT: '0x0000000000000000000000000000000000000000000000000000000000000002',
    // evaluated output length exceeds allowed length of 64 KB
    RESULT_IS_TOO_LONG: '0x0000000000000000000000000000000000000000000000000000000000000003'
  },
  MAX_ASYNC_CALL_RESULT_LENGTH: 64 * 1024,
  ASYNC_ETH_CALL_MAX_GAS_LIMIT: 100000000
}
