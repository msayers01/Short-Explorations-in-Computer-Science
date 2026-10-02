// Random Java programs for the differential tests (test_diff.js): each is type-correct, compiles with javac, and prints a value per
// statement, so the site's interpreter (src/java.js) can be compared line by line with the real JVM.
// Every statement is wrapped in try/catch and prints the exception, so one exception does not hide the rest and the messages are
// compared too. The same seed always gives the same programs.
'use strict';

function rng(seed) {   // mulberry32
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function makeGen(seed) {
  const R = rng(seed);
  const int = (n) => Math.floor(R() * n);
  const pick = (xs) => xs[int(xs.length)];
  const chance = (p) => R() < p;

  // ---------- expressions, by type
  const INT_LIT = ['0', '1', '-1', '2', '3', '7', '-7', '10', '13', '100', '-100', '255', '1000', '65536', '46341', '2147483647', '-2147483648', 'Integer.MAX_VALUE', 'Integer.MIN_VALUE'];
  const LONG_LIT = ['0L', '1L', '-1L', '3L', '10000000000L', '-9000000000L', 'Long.MAX_VALUE', 'Long.MIN_VALUE', '4294967296L', '123456789012L'];
  const DBL_LIT = ['0.0', '-0.0', '0.1', '0.2', '0.5', '1.5', '2.5', '-2.5', '2.675', '1.005', '3.14159', '1e10', '1.0E7', '1e-5', '0.001', '123456.789', '1e21', '1e-7', '100.0', '9999999.0', '0.3', '1.0 / 3', 'Double.MAX_VALUE', 'Double.MIN_VALUE', 'Math.PI', 'Math.E'];
  const STR_LIT = ['""', '"a"', '"Hello"', '"hello world"', '"  padded  "', '"Java"', '"a,b,,c,"', '"1,2,3"', '"x-y-z"', '"banana"', '"Mississippi"', '"ABC"', '"42"', '"-17"', '"3.5"', '"tab\\there"', '"x"'];
  const CHAR_LIT = ["'a'", "'z'", "'A'", "'0'", "'9'", "' '", "'!'", "'m'"];
  const V = { int: ['i', 'j', 'k'], long: ['L'], double: ['d', 'e'], String: ['s', 't'], char: ['c'], boolean: ['flag'] };

  const P = (x) => '(' + x + ')';
  function gen(type, depth) {
    const leaf = depth <= 0 || chance(0.3);
    switch (type) {
      case 'int': {
        if (leaf) return chance(0.5) ? pick(V.int) : pick(INT_LIT);
        return pick([
          () => P(gen('int', depth - 1) + ' ' + pick(['+', '-', '*', '/', '%', '&', '|', '^', '<<', '>>', '>>>']) + ' ' + gen('int', depth - 1)),
          () => P('- ' + gen('int', depth - 1)), () => P('~' + gen('int', depth - 1)),
          () => '(int) ' + P(gen(pick(['double', 'long', 'char']), depth - 1)),
          () => chance(0.2) ? 'Math.abs(' + gen('int', depth - 1) + ')' : 'Math.' + pick(['max', 'min', 'floorDiv', 'floorMod']) + '(' + gen('int', depth - 1) + ', ' + gen('int', depth - 1) + ')',
          () => gen('String', depth - 1) + '.' + pick(['length()', 'indexOf("a")', 'lastIndexOf("s")', 'indexOf(\'l\', 2)', 'compareTo(' + gen('String', 0) + ')', 'hashCode()']),
          () => P(gen('char', depth - 1) + ' - \'a\''),
          () => 'Integer.' + pick(['parseInt(' + gen('String', depth - 1) + ')', 'compare(' + gen('int', 0) + ', ' + gen('int', 0) + ')', 'signum(' + gen('int', 0) + ')', 'bitCount(' + gen('int', 0) + ')', 'parseInt("' + pick(['ff', '-101', '7f', 'z']) + '", ' + pick(['16', '2', '36']) + ')']),
          () => '(int) Math.round(' + gen('double', depth - 1) + ')',
          () => P(gen('boolean', depth - 1) + ' ? ' + gen('int', depth - 1) + ' : ' + gen('int', depth - 1)),
        ])();
      }
      case 'long': {
        if (leaf) return chance(0.4) ? 'L' : pick(LONG_LIT);
        return pick([
          () => P(gen('long', depth - 1) + ' ' + pick(['+', '-', '*', '/', '%', '>>', '>>>', '<<']) + ' ' + gen(pick(['long', 'int']), depth - 1)),
          () => '(long) ' + P(gen('double', depth - 1)), () => P(gen('int', depth - 1) + ' * ' + pick(['1L', '1000000007L', 'L'])),
          () => 'Math.round(' + gen('double', depth - 1) + ')', () => 'Long.parseLong(' + pick(['"9223372036854775807"', '"-12"', '"12x"', '""']) + ')',
          () => 'Math.abs(' + gen('long', depth - 1) + ')',
        ])();
      }
      case 'double': {
        if (leaf) return chance(0.4) ? pick(V.double) : pick(DBL_LIT);
        return pick([
          () => P(gen('double', depth - 1) + ' ' + pick(['+', '-', '*', '/', '%']) + ' ' + gen(pick(['double', 'int', 'long']), depth - 1)),
          // only functions whose result is exactly defined (correctly rounded) in both: the transcendental ones are in transcendental()
          () => 'Math.' + pick(['sqrt', 'floor', 'ceil', 'rint', 'abs']) + '(' + gen('double', depth - 1) + ')',
          () => 'Math.pow(' + gen('double', depth - 1) + ', ' + pick(['2', '0', '1']) + ')',
          () => '(double) ' + gen('int', depth - 1) + ' / ' + pick(['3', '7', '-4', '0']),
          () => 'Double.parseDouble(' + pick(['"3.25"', '"1e3"', '"-0"', '"abc"', '" 7 "', '"NaN"', '"Infinity"']) + ')',
          () => P(gen('int', depth - 1) + ' / 2.0'), () => '(float) ' + gen('double', depth - 1),
          () => 'Math.' + pick(['max', 'min']) + '(' + gen('double', depth - 1) + ', ' + gen('double', depth - 1) + ')',
        ])();
      }
      case 'char': {
        if (leaf) return chance(0.4) ? 'c' : pick(CHAR_LIT);
        return pick([
          () => '(char) ' + P(gen('char', depth - 1) + ' + ' + pick(['1', '2', '-1', '25', '32'])),
          () => gen('String', depth - 1) + '.charAt(' + gen('int', 0) + ')',
          () => 'Character.' + pick(['toUpperCase', 'toLowerCase']) + '(' + gen('char', depth - 1) + ')',
          () => '(char) ' + pick(['65', '97', '48', '0x41', '122']),
        ])();
      }
      case 'boolean': {
        if (leaf) return pick(['flag', 'true', 'false']);
        return pick([
          () => P(gen('int', depth - 1) + ' ' + pick(['<', '<=', '==', '!=', '>', '>=']) + ' ' + gen('int', depth - 1)),
          () => P(gen('double', depth - 1) + ' ' + pick(['<', '==', '>']) + ' ' + gen('double', depth - 1)),
          () => P(gen('boolean', depth - 1) + ' ' + pick(['&&', '||', '^', '&', '|']) + ' ' + gen('boolean', depth - 1)),
          () => '!' + gen('boolean', depth - 1),
          () => gen('String', depth - 1) + '.' + pick(['isEmpty()', 'equals(' + gen('String', 0) + ')', 'equalsIgnoreCase("hello")', 'contains("a")', 'startsWith("H")', 'endsWith("a")', 'isBlank()', 'matches("[a-z]+")']),
          () => 'Character.' + pick(['isDigit', 'isLetter', 'isUpperCase', 'isWhitespace', 'isLetterOrDigit']) + '(' + gen('char', depth - 1) + ')',
          () => 'Double.isNaN(' + gen('double', depth - 1) + ')',
        ])();
      }
      case 'String': {
        if (leaf) return chance(0.4) ? pick(V.String) : pick(STR_LIT);
        return pick([
          () => P(gen('String', depth - 1) + ' + ' + gen(pick(['int', 'double', 'char', 'boolean', 'long', 'String']), depth - 1)),
          () => P(pick(V.String) + ' + ' + gen('int', 0) + ' + ' + gen('int', 0)),        // left to right: "s" + 1 + 2 is "s12"
          () => P(gen('int', 0) + ' + ' + gen('int', 0) + ' + ' + pick(V.String)),        // 1 + 2 + "s" is "3s"
          () => P(gen('char', 0) + ' + ' + gen('char', 0) + ' + ""'),                       // char + char is an int
          () => gen('String', depth - 1) + '.' + pick(['toUpperCase()', 'toLowerCase()', 'trim()', 'strip()', 'substring(' + int(4) + ')', 'substring(' + int(3) + ', ' + int(6) + ')', 'replace("a", "o")', 'replace(\'s\', \'z\')', 'replaceAll("[aeiou]", "*")', 'repeat(' + int(3) + ')', 'concat("!")', 'intern()']),
          () => 'String.valueOf(' + gen(pick(['int', 'double', 'char', 'boolean', 'long']), depth - 1) + ')',
          () => 'Integer.' + pick(['toBinaryString', 'toHexString', 'toOctalString', 'toString']) + '(' + gen('int', depth - 1) + ')',
          () => 'Integer.toString(' + gen('int', depth - 1) + ', ' + pick(['2', '16', '36', '7']) + ')',
          () => 'Double.toString(' + gen('double', depth - 1) + ')',
          () => 'Arrays.toString(' + gen('String', depth - 1) + '.split(' + pick(['","', '"-"', '""', '"s"', '"\\\\s+"', '"(i)"', '"[,-]"']) + (chance(0.3) ? ', ' + pick(['-1', '2', '0']) : '') + '))',
          () => 'String.join("|", ' + gen('String', 0) + '.split(","))',
          () => 'new StringBuilder(' + gen('String', depth - 1) + ').' + pick(['reverse()', 'append(' + gen('int', 0) + ')', 'insert(0, ' + gen('char', 0) + ')', 'deleteCharAt(0)', 'replace(0, 2, "XY")', 'delete(1, 3)']) + '.toString()',
          () => 'String.format(' + fmt(depth) + ')',
          () => 'Character.toString(' + gen('char', depth - 1) + ')',
          () => P(gen('boolean', depth - 1) + ' ? ' + gen('String', depth - 1) + ' : ' + gen('String', depth - 1)),
        ])();
      }
    }
    throw new Error('type ' + type);
  }
  // a valid format string and matching arguments
  function fmt(depth) {
    const specs = [], args = [];
    const n = 1 + int(3);
    for (let q = 0; q < n; q++) {
      const conv = pick(['d', 'd', 'f', 'f', 'e', 'g', 's', 'c', 'x', 'b', '%', 'n', 'S', 'o', 'X', 'E']);
      if (conv === '%' || conv === 'n') { specs.push(pick(['lit ', '', ' : ']) + '%' + conv); continue; }
      const width = chance(0.5) ? String(1 + int(12)) : '';
      let flags = '';
      if (width && chance(0.3)) flags += '-';
      if (['d', 'f', 'e', 'g'].includes(conv)) {
        if (chance(0.25)) flags += '+';
        else if (chance(0.15)) flags += ' ';
        if ((conv === 'd' || conv === 'f' || conv === 'g') && chance(0.3)) flags += ',';
        if (width && !flags.includes('-') && chance(0.3)) flags += '0';
        if (chance(0.1) && !flags.includes('+') && !flags.includes(' ')) flags += '(';
      }
      if ((conv === 'x' || conv === 'o' || conv === 'X') && chance(0.2)) flags += '#';
      if ((conv === 'x' || conv === 'X') && width && !flags.includes('-') && chance(0.3)) flags += '0';
      const prec = ['f', 'e', 'g', 'E'].includes(conv) && chance(0.7) ? '.' + int(7) : (conv === 's' && chance(0.2) ? '.' + int(4) : '');
      specs.push(pick(['', '', 'v=', '[', ' ']) + '%' + flags + width + prec + conv + pick(['', '', ']', ' ']));
      if (conv === 'd' || conv === 'x' || conv === 'o' || conv === 'X') args.push(gen(chance(0.8) ? 'int' : 'long', depth - 1));
      else if (['f', 'e', 'g', 'E'].includes(conv)) args.push(gen('double', depth - 1));
      else if (conv === 'c') args.push(gen('char', depth - 1));
      else if (conv === 'b') args.push(gen('boolean', depth - 1));
      else args.push(gen(pick(['String', 'int', 'double', 'boolean']), depth - 1));
    }
    return JSON.stringify(specs.join('')) + (args.length ? ', ' + args.join(', ') : '');
  }

  // sin, log, pow, hypot...: JavaScript's math library and the JVM's may differ in the last binary digit, so these are compared
  // to 12 significant digits (see ARCHITECTURE §9e)
  const transcendental = (depth) => 'String.format("%.12g", ' + pick([
    () => 'Math.' + pick(['cbrt', 'log10', 'exp', 'sin', 'cos', 'tan', 'log', 'atan', 'asin', 'acos', 'sinh', 'tanh', 'log1p', 'expm1']) + '(' + gen('double', depth) + ')',
    () => 'Math.pow(' + gen('double', depth) + ', ' + pick(['0.5', '-1', '3', '10', '1.5', '-2.5', gen('double', 0)]) + ')',
    () => 'Math.' + pick(['hypot', 'atan2']) + '(' + gen('double', depth) + ', ' + gen('double', depth) + ')',
  ])() + ')';
  const wrap = (stmt) => '        try { ' + stmt + ' } catch (Exception ex) { System.out.println(ex); }';
  const header = () => [
    '        int i = ' + pick(INT_LIT) + ', j = ' + pick(['3', '-4', '0', '17', '1000000']) + ', k = ' + pick(['5', '-1', '2147483647']) + ';',
    '        long L = ' + pick(LONG_LIT) + ';',
    '        double d = ' + pick(DBL_LIT) + ', e = ' + pick(DBL_LIT) + ';',
    '        String s = ' + pick(STR_LIT) + ', t = ' + pick(STR_LIT) + ';',
    '        char c = ' + pick(CHAR_LIT) + ';',
    '        boolean flag = ' + pick(['true', 'false']) + ';',
  ];
  // expressions of every type, each printed with println (and some with print/printf), plus compound assignments that narrow
  function exprProgram(lines) {
    const body = header();
    for (let n = 0; n < lines; n++) {
      const type = pick(['int', 'int', 'long', 'double', 'double', 'String', 'String', 'String', 'char', 'boolean']);
      const x = gen(type, 1 + int(3));
      if (chance(0.08)) body.push(wrap('System.out.printf(' + fmt(2) + '); System.out.println();'));
      else if (chance(0.1)) { const op = pick(['+=', '-=', '*=', '/=', '%=', '<<=', '>>=', '^=']); body.push(wrap(pick(['i', 'j', 'k']) + ' ' + op + ' ' + gen(pick(/[<>^]/.test(op) ? ['int', 'long', 'char'] : ['int', 'double', 'long', 'char']), 1) + '; System.out.println(i + " " + j + " " + k);')); }
      else if (chance(0.08)) body.push(wrap('System.out.println(' + transcendental(1 + int(2)) + ');'));
      else if (chance(0.05)) body.push(wrap('byte b = (byte) ' + gen('int', 1) + '; b += ' + gen('int', 0) + '; short sh = (short) ' + gen('int', 1) + '; sh *= 3; char cc = c; cc += ' + gen('int', 0) + '; System.out.println(b + " " + sh + " " + (int) cc);'));
      else body.push(wrap('System.out.println(' + x + ');'));
    }
    return body;
  }
  // collections: a random series of operations on each, printed as it goes
  function collectionsProgram(lines) {
    const ints = () => String(int(20) - 5), keys = () => pick(['"apple"', '"banana"', '"cherry"', '"date"', '"elder"', '"fig"', '"grape"', '"Alice"', '"Bob"', '"Charlie"', '"Diana"', '"Eve"', '"x"', '"key10"', '"key2"']);
    const body = [...header(),
      '        ArrayList<Integer> list = new ArrayList<>();', '        LinkedList<String> linked = new LinkedList<>();',
      '        HashMap<String, Integer> map = new HashMap<>();', '        TreeMap<String, Integer> tree = new TreeMap<>();',
      '        HashMap<Integer, String> imap = new HashMap<>();', '        HashSet<String> set = new HashSet<>();', '        HashSet<Integer> iset = new HashSet<>();',
      '        TreeSet<Integer> tset = new TreeSet<>();', '        ArrayDeque<Integer> dq = new ArrayDeque<>();', '        StringBuilder sb = new StringBuilder("start");',
      '        Random rnd = new Random(' + int(1000) + ');', '        int[] arr = {' + Array.from({ length: 1 + int(8) }, ints).join(', ') + '};',
    ];
    const ops = [
      () => 'list.add(' + ints() + ');', () => 'list.add(' + int(4) + ', ' + ints() + ');', () => 'list.remove(' + int(4) + ');', () => 'list.remove(Integer.valueOf(' + ints() + '));',
      () => 'list.set(' + int(4) + ', ' + ints() + ');', () => 'System.out.println(list.get(' + int(5) + '));', () => 'System.out.println(list.indexOf(' + ints() + ') + " " + list.contains(' + ints() + '));',
      () => 'Collections.sort(list);', () => 'Collections.reverse(list);', () => 'System.out.println(Collections.max(list) + " " + Collections.min(list));', () => 'System.out.println(list.subList(0, ' + int(4) + '));',
      () => 'linked.addFirst(' + keys() + ');', () => 'linked.addLast(' + keys() + ');', () => 'System.out.println(linked.removeFirst());', () => 'System.out.println(linked.peekLast() + " " + linked.get(' + int(3) + '));',
      () => 'map.put(' + keys() + ', ' + ints() + ');', () => 'map.put(' + keys() + ', map.getOrDefault(' + keys() + ', 0) + 1);', () => 'System.out.println(map.get(' + keys() + '));', () => 'map.remove(' + keys() + ');',
      () => 'System.out.println(map.containsKey(' + keys() + ') + " " + map.size());', () => 'System.out.println(map.keySet());', () => 'System.out.println(map.values());', () => 'System.out.println(map.entrySet());',
      () => 'for (Map.Entry<String, Integer> en : map.entrySet()) System.out.print(en.getKey() + "=" + en.getValue() + ";"); System.out.println();', () => 'map.putIfAbsent(' + keys() + ', ' + ints() + ');',
      () => 'tree.put(' + keys() + ', ' + ints() + ');', () => 'System.out.println(tree + " " + tree.firstKey() + " " + tree.lastKey());', () => 'System.out.println(tree.floorKey(' + keys() + ') + " " + tree.ceilingKey(' + keys() + '));', () => 'System.out.println(tree.headMap(' + keys() + '));',
      () => 'imap.put(' + pick(['17', '33', '1', '-5', '100', '64', '16', '0', '1000']) + ', ' + keys() + ');', () => 'System.out.println(imap);',
      () => 'set.add(' + keys() + ');', () => 'set.remove(' + keys() + ');', () => 'System.out.println(set + " " + set.contains(' + keys() + '));',
      () => 'iset.add(' + pick(['17', '33', '1', '-5', '100', '64', '16', '0', '1000', '-100', '48']) + ');', () => 'System.out.println(iset);',
      () => 'tset.add(' + ints() + ');', () => 'System.out.println(tset + " " + tset.first() + " " + tset.headSet(' + ints() + ') + " " + tset.higher(' + ints() + '));',
      () => 'dq.push(' + ints() + ');', () => 'dq.offerLast(' + ints() + ');', () => 'System.out.println(dq.pop());', () => 'System.out.println(dq.poll() + " " + dq.peekLast());', () => 'System.out.println(dq + " " + dq.size());', () => 'dq.addFirst(' + ints() + ');',
      () => 'sb.append(' + gen(pick(['int', 'String', 'char', 'double']), 1) + ');', () => 'sb.append(' + transcendental(1) + ');', () => 'sb.insert(' + int(6) + ', ' + keys() + ');', () => 'sb.reverse();', () => 'sb.setCharAt(' + int(6) + ', \'#\');', () => 'sb.deleteCharAt(' + int(6) + ');', () => 'System.out.println(sb + " " + sb.length() + " " + sb.indexOf("a"));',
      () => 'System.out.println(rnd.nextInt(' + (1 + int(100)) + ') + " " + rnd.nextInt() + " " + rnd.nextBoolean());', () => 'System.out.println(rnd.nextDouble());', () => 'System.out.println(rnd.nextLong());',
      () => 'Arrays.sort(arr); System.out.println(Arrays.toString(arr));', () => 'System.out.println(Arrays.binarySearch(arr, ' + ints() + '));', () => 'System.out.println(arr[' + int(10) + ']);',
      () => 'System.out.println(Arrays.toString(Arrays.copyOfRange(arr, ' + int(3) + ', ' + int(9) + ')));', () => 'Arrays.fill(arr, ' + ints() + '); System.out.println(Arrays.toString(arr));',
      () => 'List<Integer> fixed = List.of(' + ints() + ', ' + ints() + '); System.out.println(fixed); fixed.add(1);', () => 'System.out.println(String.join(",", new ArrayList<>(tree.keySet())));',
      () => 'Iterator<Integer> it = list.iterator(); while (it.hasNext()) if (it.next() % 2 == 0) it.remove(); System.out.println(list);',
    ];
    for (let n = 0; n < lines; n++) body.push(wrap(pick(ops)()));
    body.push(wrap('System.out.println(list + " " + linked + " " + map + " " + tree + " " + set + " " + iset + " " + tset + " " + dq + " " + sb);'));
    return body;
  }
  return { exprProgram, collectionsProgram };
}

const program = (body) => 'import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n' + body.join('\n') + '\n    }\n}\n';

/** count programs of each kind from one seed: [{ id, code }] */
function generate(seed, count) {
  const out = [];
  for (let n = 0; n < count; n++) {
    const g = makeGen(seed * 1000 + n);
    out.push({ id: 'gen/expr/' + seed + '-' + n, code: program(g.exprProgram(40)) });
    out.push({ id: 'gen/collections/' + seed + '-' + n, code: program(g.collectionsProgram(40)) });
  }
  return out;
}

module.exports = { generate, makeGen, program };
