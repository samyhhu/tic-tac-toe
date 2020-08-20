# Tic-Tac-Toe Game project template for ether-hack

---
### Environment setup

**NodeJS 8.x+ must be installed along with build-essential as a prerequisite.**
```
$ npm install
```

### Running test blockchain (other terminal)
```
$ npm run ganache-cli
```
Note: must use node v8,10, or 12. v14 doesn't work

### Running tests

```
$ npm run compile
$ npm run test
```

---
### Network
In this example Truffle uses "development" network, your local ganache-cli instance.
Usually it is used for testing purposes. Except for testing you also can use other
networks to deploy your contracts elsewhere, e.g. kovan, rinkeby, ropsten and main networks.
More on Truffle networks:
http://truffleframework.com/docs/advanced/networks

---
### Migrations
Your contracts are being deployed to the network using files in `migrations` folder.
More on Truffle migrations:
http://truffleframework.com/docs/getting_started/migrations

---
### Tests
You can find tests in `tests` folder.
More on Truffle testing:
http://truffleframework.com/docs/getting_started/testing
