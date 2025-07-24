// SPDX-License-Identifier: MIT
// ignition/modules/combined.js

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

// Default parameters (used for the Lock contract deployment)
const JAN_1ST_2030 = 1893456000;
const ONE_GWEI = 1_000_000_000n;

module.exports = buildModule("CombinedDeploymentModule", (m) => {
  // You can override these parameters when running Hardhat Ignition if needed.
  const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);
  const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);

  // Deploy the Lock contract.
  // Its constructor takes unlockTime, and we pass lockedAmount as the transaction value.
  const lock = m.contract("Lock", [unlockTime], {
    value: lockedAmount,
  });

  // Deploy the MembershipNFT contract.
  // This contract does not require constructor parameters.
  const membershipNFT = m.contract("MembershipNFT");

  // Return both deployed contracts.
  return { lock, membershipNFT };
});
