// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EggoQuest is Ownable {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;
    event Withdraw(address to, uint256 amount);
    event SetToken(address tokenAddress);

    IERC20 private _token;
    mapping(address => uint256) private _nonces;

    constructor(
        address initialOwner,
        address tokenAddress
    ) Ownable(initialOwner) {
        _token = IERC20(tokenAddress);
    }

    function token() public view returns (IERC20) {
        return _token;
    }

    function nonces(address to) public view returns (uint256) {
        return _nonces[to];
    }

    function setToken(address tokenAddress) public onlyOwner {
        _token = IERC20(tokenAddress);
        emit SetToken(tokenAddress);
    }

    function withdrawByOwner(
        address to,
        uint256 amount,
        uint256 nonce,
        bytes memory signature,
        bytes32 messageHash
    ) public onlyOwner {
        require(to != address(0), "Invalid address");
        require(nonce == _nonces[to], "Invalid nonce");
        require(amount != 0, "Invalid amount");
        require(verify(messageHash, signature, to), "Invalid signature");

        _nonces[to]++;
        _token.transferFrom(msg.sender, to, amount);
        emit Withdraw(to, amount);
    }

    function verify(
        bytes32 messageHash,
        bytes memory signature,
        address expectedSigner
    ) internal pure returns (bool) {
        address recoveredAddress = messageHash.recover(signature);
        return (recoveredAddress == expectedSigner);
    }
}
