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
      return (
        only_one_bit_set(state ^ _newState) // can't play more than one move per turn
        && (opponentState & _newState) > 0 // can't play on the same space as opponent
      );
    }

    function victory(uint16 state) private returns(bool) {
      return (
        (state & 448) == 448    //= 2**8 + 2**7 + 2**6 = 111 000 000
        || (state & 56) == 56   //= 2**5 + 2**4 + 2**3 = 000 111 000
        || (state & 7) == 7     //= 2**2 + 2**1 + 2**0 = 000 000 111
        || (state & 292) == 292 //= 2**8 + 2**5 + 2**2 = 100 100 100
        || (state & 146) == 146 //= 2**7 + 2**4 + 2**1 = 010 010 010
        || (state & 73) == 73   //= 2**6 + 2**3 + 2**0 = 001 001 001
        || (state & 273) == 273 //= 2**8 + 2**4 + 2**0 = 100 010 001
        || (state & 84) == 84   //= 2**6 + 2**4 + 2**2 = 001 010 100
      );
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
