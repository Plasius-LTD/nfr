import vm from "node:vm";

if (!vm.constants || !vm.constants.DONT_CONTEXTIFY) {
  vm.constants = { ...(vm.constants || {}), DONT_CONTEXTIFY: Symbol.for("dont-contextify") };
}
