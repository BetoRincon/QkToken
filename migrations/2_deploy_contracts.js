const QkToken = artifacts.require("QkToken");

module.exports = function(deployer) {
  deployer.deploy(QkToken, 1000000);
};
