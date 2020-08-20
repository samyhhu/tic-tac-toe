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

  describe('Basic Moves', () => {
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

   describe('Game Flows', () => {
     it('should reject invalid uint16 representations of board positions by owner', async () => {})
     it('should reject invalid uint16 representations of board positions by other', async () => {})
     it('should reject two sequential moves by owner', async () => {})
     it('should reject two sequential moves by other', async () => {})
     it('should reject multiple simultaneous moves by owner', async () => {})
     it('should reject multiple simultaneous moves by other', async () => {})
     it('should allow & log other victory', async () => {
       let gameState
       let currentOwnerState
       let currentOtherState

       await ticTacToe.main(1, {from: OWNER})
       currentOwnerState = await ticTacToe.ownerState()
       asserts.equal(currentOwnerState, 1)

       await ticTacToe.other(2, {from: NON_OWNER})
       currentOtherState = await ticTacToe.otherState()
       asserts.equal(currentOtherState, 2)

       await ticTacToe.main(17, {from: OWNER})
       currentOwnerState = await ticTacToe.ownerState()
       asserts.equal(currentOwnerState, 17)

       await ticTacToe.other(6, {from: NON_OWNER})
       currentOtherState = await ticTacToe.otherState()
       asserts.equal(currentOtherState, 6)

       await ticTacToe.main(273, {from: OWNER})

       gameState = await ticTacToe.gameState()
       assert.equal(gameState, 1) // owner wins!
     })
     it('should allow & log other victory', async () => {})
     it('should allow & log draw', async () => {})

     it("Victory event should trigger ", async () => {
         await ticTacToe.main(1, {from: OWNER});                   // 000 000 001

         await ticTacToe.other(8, {from: NON_OWNER});              // 000 001 000
         await ticTacToe.main(3, {from: OWNER});                   // 000 000 011 
         await ticTacToe.other(24, {from: NON_OWNER});             // 000 011 000 
         const tx = await ticTacToe.main(7, {from: OWNER});        // 000 000 111 

         asserts.equal(tx.logs[0].event, "Victory");
         });

    it("Draw event should trigger", async () => {
         await ticTacToe.main(256, {from: OWNER});                   // 100 000 000 X
         await ticTacToe.other(128, {from: NON_OWNER});              // 010 000 000 O
         await ticTacToe.main(272, {from: OWNER});                   // 100 010 000 X 
         await ticTacToe.other(192, {from: NON_OWNER});              // 011 000 000 O
         await ticTacToe.main(274, {from: OWNER});                   // 100 010 010 X
         await ticTacToe.other(224, {from: NON_OWNER});              // 011 100 000 O
         await ticTacToe.main(282, {from: OWNER});                   // 100 011 010 X
         await ticTacToe.other(225, {from: NON_OWNER});              // 011 100 001 O
         const tx = await ticTacToe.main(286, {from: OWNER});        // 100 011 110 X

         asserts.equal(tx.logs[0].event, "Draw");
         });
   })
})
