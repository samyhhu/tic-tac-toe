pragma solidity 0.4.18;

contract TicTacToe {
    // NOTE: All of the content here is just to provide some test examples
    address owner;

    // Storage variable must be public if we want automatically have a getter for it
    uint16 public ownerState;
    uint16 public otherState;

    event StateChanged(uint16 ownerState, uint16 otherState);
    event Error(string msg);

    function TicTacToe() public {
        owner = msg.sender;
    }

    function only_one_bit_set(uint16 state) private returns(bool) {
        return (state > 0 && ~(state & (state-1)) > 0);
    }

    function valid(uint16 state, uint16 opponentState, uint16 _newState) private returns(bool) {
      if (!only_one_bit_set(state ^ _newState)) {
        // can't play more than one move per turn
        return false;
      }
      if ((opponentState & _newState) > 0) {
        // can't play on the same space as opponent
        return false;
      }
      return true;
    }

    function victory(uint16 state) private returns(bool) {
      return false;
    }

    // Function to test return value, state changes and event emission
    function main(uint16 _newState) public returns(bool) {
        if (msg.sender != owner) {
          Error("You are not the owner");
          return false;
        }
        if (!valid(ownerState, otherState, _newState)) {
          Error("Invalid move");
          return false;
        }
        ownerState = _newState;
        if (victory(ownerState)) {
          // Victory
        }
        StateChanged(ownerState, otherState);
        return true;
    }

    // Function to test VM exception
    function other(uint16 _newState) public returns(bool) {
      if (!valid(otherState, ownerState, _newState)) {
        Error("Invalid move");
        return false;
      }
      otherState = _newState;
      if (victory(ownerState)) {
        // Victory
      }
      StateChanged(ownerState, otherState);
      // Require goes after state changes in order to demonstrate changes reversion
      require(msg.sender != owner);
      return true;
    }

}
