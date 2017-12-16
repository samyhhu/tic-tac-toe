'use strict'

const Asserts = require('./helpers/asserts')
const Reverter = require('./helpers/reverter')

const TicTacToe = artifacts.require('./TicTacToe.sol')

contract('TicTacToe', async function(accounts) {
  // This helper provides convenient `equal` assertion, along with VM exception handler.
  // Also, notice difference between `assert` and `asserts`, we use both.
  const asserts = Asserts(assert)

  // And this thing is used to make snapshots of test network state
  // and return to the latest `snapshot` with `revert` method, to keep
  // things clear afterEach test.
  // It's not related to the Solidity revert!
  const reverter = new Reverter(web3)

  const OWNER = accounts[0]
  const NON_OWNER = accounts[1]

  let ticTacToe

  afterEach('revert', reverter.revert) // Reset test network state to the latest `snapshot`

  before('setup', async () => {
    ticTacToe = await TicTacToe.deployed()
    await reverter.snapshot() // Create first `snapshot` before all tests
  })

  beforeEach('reset ownerState, otherState, and gameState to 0', async () => {
    await ticTacToe.setGameState(0)
    await ticTacToe.setOwnerState(0)
    await ticTacToe.setOtherState(0)

    const gameState = await ticTacToe.gameState()
    const ownerState = await ticTacToe.ownerState()
    const otherState = await ticTacToe.otherState()
    assert.equal(gameState, 0)
    assert.equal(ownerState, 0)
    assert.equal(otherState, 0)
  })

  describe('Negative', () => {
    it('should NOT allow to call main function by non-owner', async () => {
      const result = await ticTacToe.main.call(1, {from: NON_OWNER})
      assert.isFalse(result)
    })

    it('should NOT change state when calling main function by non-owner', async () => {
      const initialState = await ticTacToe.ownerState()

      asserts.equal(initialState, 0)

      await ticTacToe.main(2, {from: NON_OWNER})
      const currentState = await ticTacToe.ownerState()
      asserts.equal(currentState, 0)
    })

    it('should NOT emit event about state changes when calling main function by non-owner, should emit error event instead', async () => {
      const tx = await ticTacToe.main(3, {from: NON_OWNER})
      asserts.equal(tx.logs.length, 1)
      asserts.equal(tx.logs[0].address, ticTacToe.address)
      asserts.equal(tx.logs[0].event, 'Error')
      asserts.equal(tx.logs[0].args.msg, 'You are not the owner')
    })

    it('should revert transaction when calling other function by contract owner', async () => {
      const initialState = await ticTacToe.ownerState()
      asserts.equal(initialState, 0)

      asserts.throws(ticTacToe.other(5, {from: OWNER}))
      const currentState = await ticTacToe.ownerState()
      asserts.equal(currentState, 0)
    })
  })

  describe('Positive', () => {
    it('should initialize with gameState 0 (playable)', async () => {
      const gameState = await ticTacToe.gameState()
      assert.equal(gameState, 0)
    })

    it('should allow contract owner to call main function', async () => {
      const result = await ticTacToe.main.call(1, {from: OWNER})
      assert.isTrue(result)
    })

    it('should change state when calling main function by contract owner', async () => {
      await ticTacToe.main(2, {from: OWNER})

      const currentOwnerState = await ticTacToe.ownerState()
      const currentOtherState = await ticTacToe.otherState()

      asserts.equal(currentOwnerState, 2)
      asserts.equal(currentOtherState, 0)
    })

    it('should emit event about state changes when calling main function by contract owner', async () => {
      const tx = await ticTacToe.main(1, {from: OWNER})
      asserts.equal(tx.logs.length, 1)
      asserts.equal(tx.logs[0].address, ticTacToe.address)
      asserts.equal(tx.logs[0].event, 'StateChanged')
      asserts.equal(tx.logs[0].args.ownerState, 1)
      asserts.equal(tx.logs[0].args.otherState, 0)
    })

    it('should change state when calling other function by non-owner', async () => {
      await ticTacToe.other(2, {from: NON_OWNER})

      const currentOwnerState = await ticTacToe.ownerState()
      const currentOtherState = await ticTacToe.otherState()

      asserts.equal(currentOwnerState, 0)
      asserts.equal(currentOtherState, 2)
    })

    it('should emit event about state changes when calling other function by non-owner', async () => {
      const tx = await ticTacToe.other(2, {from: NON_OWNER})
      asserts.equal(tx.logs.length, 1)
      asserts.equal(tx.logs[0].address, ticTacToe.address)
      asserts.equal(tx.logs[0].event, 'StateChanged')
      asserts.equal(tx.logs[0].args.ownerState, 0)
      asserts.equal(tx.logs[0].args.otherState, 2)
    })
  })
})
