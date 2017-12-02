"use strict";

const TicTacToe = artifacts.require('./TicTacToe.sol');


/**
 *
 * @param deployer object : The thing that can deploy contracts
 * @param network  string : Network name, e.g. "live" or "development"
 * @param accounts  array : Array with accounts addresses
 *
 * async/await don't work here as for truffle@3.4.11 т-т
 */
module.exports = (deployer, network, accounts)=> {
    deployer.deploy(TicTacToe);
};
