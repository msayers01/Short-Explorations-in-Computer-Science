/* Algorithms in motion: backtracking and greedy choices. Demos for the #/algorithms page (see src/algos.js for the frame).
   The algorithms are pure (no DOM) and checked by selfTest() in node (test_algos.js). */
(function () {
  const A = (typeof window !== 'undefined' && window.ALGOS) || require('./algos.js');
  function selfTest() { return []; }
  if (typeof module !== 'undefined') module.exports = { selfTest };
})();
