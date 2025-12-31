const vm = require("node:vm");

vm.constants = vm.constants || {};
if (!vm.constants.DONT_CONTEXTIFY) {
  vm.constants.DONT_CONTEXTIFY = {};
}
