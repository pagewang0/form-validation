(function (root, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
  (root.Validator = factory());
}(this, function () {
  return Validator
}))