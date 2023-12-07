export const migrateCode = (
  DateInSec: number = Date.now() / 1000
) => `const ERC721Token${DateInSec} = artifacts.require("ERC721Token${DateInSec}");

module.exports = function (deployer) {
  deployer.deploy(ERC721Token${DateInSec});
};
`;
