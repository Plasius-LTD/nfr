import vm from "node:vm";

if (!vm.constants) {
  vm.constants = { DONT_CONTEXTIFY: {} };
} else if (!vm.constants.DONT_CONTEXTIFY) {
  vm.constants.DONT_CONTEXTIFY = {};
}
