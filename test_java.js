// Tests of the Java interpreter (src/java.js): Java's arithmetic and printing, strings, classes, collections (including HashMap's
// iteration order and java.util.Random's sequence), exceptions and stack traces, printf, and the compiler's error messages.
// Expected outputs are what the real javac + java print.                                                  node test_java.js
const J = require('./src/java.js');
const U = require('./src/javautil.js');
let bad = 0;
function t(name, code, expectOut, expectErr, stdin, opts) {
  const r = J.run(code, stdin || '', Object.assign({ maxMs: 5000 }, opts || {}));
  const okOut = expectOut === undefined || r.out === expectOut;
  const okErr = expectErr === undefined ? !r.err : (expectErr instanceof RegExp ? expectErr.test(r.err || '') : r.err === expectErr);
  if (!okOut || !okErr) { bad++; console.log('BAD  ' + name + '\n  out: ' + JSON.stringify(r.out) + '\n  err: ' + JSON.stringify(r.err) + (okOut ? '' : '\n  expected out: ' + JSON.stringify(expectOut))); }
  else console.log('ok   ' + name);
}
const M = (body) => 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n' + body + '\n    }\n}\n';
const ce = (name, code, re) => t(name, code, '', re);

// ---- numbers and printing
t('int, double, char arithmetic', M('System.out.println(7 / 2); System.out.println(7 / 2.0); System.out.println(7 % -3); System.out.println(1e7); System.out.println(0.0001); System.out.println(100.0 / 3); System.out.println((float) 0.1); System.out.println((int) -3.99); System.out.println((char) 66); System.out.println((byte) 200); System.out.println(Integer.MAX_VALUE + 1); System.out.println(Long.MAX_VALUE + 1); System.out.println(0.1 + 0.2); System.out.println(1.0 / 0); System.out.println(\'a\' + \'b\'); System.out.println("" + \'a\' + \'b\'); char c = \'A\'; c++; System.out.println(c); System.out.println(c + 1); System.out.println("x" + 1 + 2); System.out.println(1 + 2 + "x"); System.out.println(1000000 * 1000000); System.out.println((long) 1000000 * 1000000);'),
  '3\n3.5\n1\n1.0E7\n1.0E-4\n33.333333333333336\n0.1\n-3\nB\n-56\n-2147483648\n-9223372036854775808\n0.30000000000000004\nInfinity\n195\nab\nB\n67\nx12\n3x\n-727379968\n1000000000000\n');
t('strings', M('String s = "Hello, World"; System.out.println(s.length() + " " + s.charAt(4) + " " + s.substring(7) + " " + s.indexOf("World") + " " + s.indexOf(\'z\') + " " + s.contains("lo, ")); System.out.println("abc".compareTo("abd") + " " + "Zebra".compareTo("apple") + " " + "x".compareTo("xy")); System.out.println("hello".hashCode()); System.out.println("a,b,,c,,".split(",").length + " " + "one two  three".split("\\\\s+").length); System.out.println("  trim me ".trim() + "|" + "ab".repeat(3) + "|" + String.join("-", "x", "y")); System.out.println("Mississippi".replaceAll("ss", "S") + " " + "ABC".equalsIgnoreCase("abc") + " " + "abc".equals("abc")); System.out.println(Integer.parseInt("42") + 1); System.out.println(Double.parseDouble("2.5") * 2); StringBuilder sb = new StringBuilder(); sb.append(1).append(\'x\').append(2.5).append(true); System.out.println(sb.reverse());'),
  '12 o World 7 -1 true\n-1 -7 -1\n99162322\n4 3\ntrim me|ababab|x-y\nMiSiSippi true true\n43\n5.0\neurt5.2x1\n');
t('printf', M('System.out.printf("%d items at $%.2f = $%8.2f%n", 3, 1.5, 4.5); System.out.printf("%-10s|%5d|%05d|%x%n", "name", 42, 42, 255); System.out.println(String.format("%,d %,.2f", 1234567, 1234567.891)); System.out.printf("%s %s %s %c%c %b %e%n", 1, 2.5, \'c\', \'o\', 107, true, 12345.678); System.out.printf("%.0f %.1f %.2f %6.1f%%%n", 2.5, 0.05, 1.005, 99.5);'),
  '3 items at $1.50 = $    4.50\nname      |   42|00042|ff\n1,234,567 1,234,567.89\n1 2.5 c ok true 1.234568e+04\n3 0.1 1.01   99.5%\n');   // Java rounds the shortest decimal 1.005 half-up
t('printf type error', M('System.out.printf("%d%n", 2.5);'), '', /IllegalFormatConversionException: d != java\.lang\.Double/);
// ---- control flow
t('loops, switch, labels', M('int sum = 0; for (int i = 1; i <= 10; i++) { if (i % 2 == 0) continue; sum += i; } System.out.print(sum + " "); int k = 10; do { k -= 3; } while (k > 0); System.out.print(k + " "); outer: for (int i = 0; i < 3; i++) for (int j = 0; j < 3; j++) { if (j == 2) continue outer; if (i == 2) break outer; System.out.print(i + "" + j + " "); } System.out.println(); String day = "TUE"; switch (day) { case "MON": System.out.println("Monday"); break; case "TUE": case "WED": System.out.println("Midweek"); default: System.out.println("fell through"); } int x = 3; switch (x) { case 1 -> System.out.println("one"); case 2, 3 -> System.out.println("two or three"); default -> System.out.println("other"); } System.out.println(x > 2 ? "big" : "small");'),
  '25 -2 00 01 10 11 \nMidweek\nfell through\ntwo or three\nbig\n');
t('arrays', M('int[] a = new int[5]; a[4] = 7; int[][] g = new int[3][4]; g[1][2] = 9; int[][] jag = {{1}, {2, 3}, {4, 5, 6}}; int total = 0; for (int[] row : jag) for (int v : row) total += v; System.out.println(a.length + " " + a[4] + " " + a[2] + " " + g.length + " " + g[0].length + " " + g[1][2] + " " + total); System.out.println(Arrays.toString(a) + " " + Arrays.toString(new double[2]) + " " + (new String[2])[0] + " " + Arrays.deepToString(jag)); Arrays.sort(a); int[] b = a.clone(); b[0] = 1; System.out.println(Arrays.toString(a) + " " + Arrays.equals(a, b) + " " + (a == b) + " " + (a instanceof int[]));'),
  '5 7 0 3 4 9 21\n[0, 0, 0, 0, 7] [0.0, 0.0] null [[1], [2, 3], [4, 5, 6]]\n[0, 0, 0, 0, 7] false false true\n');
// ---- methods and classes
t('methods and overloading', `public class Main {
    static int fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
    static long factL(int n) { return n <= 1 ? 1 : n * factL(n - 1); }
    static int sum(int... xs) { int s = 0; for (int x : xs) s += x; return s; }
    static String d(double x) { return "double"; } static String d(int x) { return "int"; } static String d(Object x) { return "object"; }
    static void change(int[] a, int v) { a[0] = v; v = 99; }
    public static void main(String[] args) { System.out.println(fact(13) + " " + factL(20) + " " + sum() + " " + sum(1, 2, 3)); System.out.println(d(1) + " " + d(1.5) + " " + d("s") + " " + d('c') + " " + d(2L)); int[] a = {1}; int v = 5; change(a, v); System.out.println(a[0] + " " + v); System.out.println(Math.round(2.5) + " " + Math.round(-2.5) + " " + Math.abs(Integer.MIN_VALUE) + " " + Math.floorMod(-7, 3) + " " + Math.pow(2, 10) + " " + Math.sqrt(2)); }
}`, '1932053504 2432902008176640000 0 6\nint double object int double\n5 5\n3 -2 -2147483648 2 1024.0 1.4142135623730951\n');
t('classes, inheritance, interfaces', `class Animal { protected String name; private int legs; static int count = 0; Animal(String name, int legs) { this.name = name; this.legs = legs; count++; } public String sound() { return "..."; } public int getLegs() { return legs; } public String toString() { return name + " (" + legs + " legs) says " + sound(); } }
class Dog extends Animal { Dog(String name) { super(name, 4); } @Override public String sound() { return "Woof"; } }
class Bird extends Animal { boolean canFly = true; Bird(String name) { super(name, 2); } public String sound() { return "Tweet"; } public String toString() { return super.toString() + (canFly ? " and flies" : ""); } }
interface Shape { double area(); default String kind() { return "shape"; } }
abstract class Base implements Shape { public String kind() { return "base"; } public abstract String name(); }
class Circle extends Base { double r; Circle(double r) { this.r = r; } public double area() { return Math.PI * r * r; } public String name() { return "circle"; } }
class Sq implements Shape { double s; Sq(double s) { this.s = s; } public double area() { return s * s; } }
class Point { int x, y; Point(int x, int y) { this.x = x; this.y = y; } Point() { this(0, 0); } public boolean equals(Object o) { if (!(o instanceof Point)) return false; Point p = (Point) o; return x == p.x && y == p.y; } public int hashCode() { return 31 * x + y; } public String toString() { return "(" + x + ", " + y + ")"; } }
class A { int v = 1; void show() { System.out.print("A" + v + " "); } } class B extends A { int v = 2; void show() { super.show(); System.out.print("B" + v + super.v + " "); } }
public class Main { public static void main(String[] args) {
    Animal a = new Dog("Rex"); Animal b = new Bird("Tweety"); System.out.println(a); System.out.println(b); System.out.println(Animal.count + " " + (a.getLegs() + b.getLegs()) + " " + (a instanceof Dog) + " " + (a instanceof Bird) + " " + a.name);
    Shape[] shapes = { new Circle(1), new Sq(2) }; double total = 0; for (Shape s : shapes) total += s.area(); System.out.printf("%.3f %s %s%n", total, ((Circle) shapes[0]).name(), shapes[0].kind());
    Point p = new Point(1, 2), q = new Point(1, 2), z = new Point(); System.out.println((p == q) + " " + p.equals(q) + " " + p + " " + z + " " + p.hashCode() + " " + ((Object) p).toString() + " " + p.getClass().getSimpleName());
    A x = new B(); x.show(); System.out.println(x.v);
    try { Bird bb = (Bird) a; } catch (ClassCastException e) { System.out.println(e.getMessage()); }
} }`, 'Rex (4 legs) says Woof\nTweety (2 legs) says Tweet and flies\n2 6 true false Rex\n7.142 circle base\nfalse true (1, 2) (0, 0) 33 (1, 2) Point\nA1 B21 1\nclass Dog cannot be cast to class Bird (Dog and Bird are in unnamed module of loader \'app\')\n');
// ---- collections: the orders are those of the real HashMap and HashSet
t('collections', M('ArrayList<Integer> xs = new ArrayList<>(); xs.add(5); xs.add(3); xs.add(9); xs.add(1, 7); System.out.println(xs + " " + xs.size() + " " + xs.get(1) + " " + xs.contains(9) + " " + xs.indexOf(9)); xs.remove(0); xs.remove(Integer.valueOf(9)); Collections.sort(xs); System.out.println(xs + " " + Collections.max(xs)); HashMap<String, Integer> counts = new HashMap<>(); for (String w : "the cat and the hat and the bat".split(" ")) counts.put(w, counts.getOrDefault(w, 0) + 1); System.out.println(counts + " " + counts.get("the") + " " + counts.get("dog")); Map<String, Integer> fruit = new HashMap<>(); fruit.put("apple", 1); fruit.put("banana", 2); fruit.put("cherry", 3); System.out.println(fruit + " " + new TreeMap<>(fruit)); HashSet<Integer> set = new HashSet<>(); set.add(3); set.add(1); set.add(3); set.add(20); set.add(17); System.out.println(set + " " + set.size()); Map<Integer, String> byId = new HashMap<>(); byId.put(100, "x"); byId.put(3, "y"); byId.put(17, "z"); System.out.println(byId); List<Double> ds = new ArrayList<>(); ds.add(1.5); ds.add(2.0); double s = 0; for (double d : ds) s += d; System.out.println(ds + " " + s); List<Character> cs = new ArrayList<>(); for (char c : "hey".toCharArray()) cs.add(c); System.out.println(cs + " " + (cs.get(0) + 1)); for (Map.Entry<String, Integer> e : new TreeMap<>(counts).entrySet()) System.out.print(e.getKey() + "=" + e.getValue() + ";"); System.out.println(); Integer i1 = 127, i2 = 127, i3 = 1000, i4 = 1000; System.out.println((i1 == i2) + " " + (i3 == i4) + " " + i3.equals(i4)); xs.add(8); xs.add(9); try { for (Integer x : xs) if (x == 3) xs.remove(x); } catch (ConcurrentModificationException e) { System.out.println("CME"); } Random r = new Random(42); System.out.println(r.nextInt() + " " + r.nextInt() + " " + new Random(42).nextInt(100));'),
  '[5, 7, 3, 9] 4 7 true 3\n[3, 7] 7\n{the=3, bat=1, and=2, cat=1, hat=1} 3 null\n{banana=2, apple=1, cherry=3} {apple=1, banana=2, cherry=3}\n[1, 17, 3, 20] 4\n{17=z, 3=y, 100=x}\n[1.5, 2.0] 3.5\n[h, e, y] 105\nand=2;bat=1;cat=1;hat=1;the=3;\ntrue false true\nCME\n-1170105035 234785527 30\n');
t('comparable and sorting', `import java.util.*;
class Student implements Comparable<Student> { String name; int grade; Student(String n, int g) { name = n; grade = g; } public int compareTo(Student o) { return grade - o.grade; } public String toString() { return name + ":" + grade; } }
public class Main { public static void main(String[] args) { List<Student> xs = new ArrayList<>(); xs.add(new Student("a", 90)); xs.add(new Student("b", 70)); xs.add(new Student("c", 80)); Collections.sort(xs); System.out.println(xs + " " + Collections.min(xs)); } }`, '[b:70, c:80, a:90] b:70\n');
// ---- input
t('scanner', M('Scanner in = new Scanner(System.in); int n = in.nextInt(); String rest = in.nextLine(); String line = in.nextLine(); double d = in.nextDouble(); String w = in.next(); System.out.println(n + "|" + rest + "|" + line + "|" + d + "|" + w); while (in.hasNextInt()) System.out.print(in.nextInt() * 2 + " "); System.out.println(in.hasNext() + " " + in.next() + " " + in.hasNextLine());'),
  '42||Ada Lovelace|3.5|word\n2 4 6 true end false\n', undefined, '42\nAda Lovelace\n3.5 word 1 2 3 end');
t('scanner mismatch', M('Scanner sc = new Scanner(System.in); int n = sc.nextInt();'), '', /^Exception in thread "main" java\.util\.InputMismatchException\n/, 'abc\n');   // no message, as in Java
t('scanner no input', M('Scanner sc = new Scanner(System.in); String s = sc.nextLine();'), '', /NoSuchElementException: No line found/, '');
// ---- exceptions
t('exceptions', `public class Main {
    static int divide(int a, int b) { return a / b; }
    static void recurse(int n) { recurse(n + 1); }
    static int tryReturn() { try { return 1; } finally { System.out.println("in finally"); } }
    public static void main(String[] args) {
        try { System.out.println(divide(10, 0)); } catch (ArithmeticException e) { System.out.println("caught: " + e.getMessage()); } finally { System.out.println("finally"); }
        try { int[] a = new int[3]; a[3] = 1; } catch (ArrayIndexOutOfBoundsException e) { System.out.println(e.getMessage()); }
        try { String s = null; s.length(); } catch (NullPointerException e) { System.out.println("NPE"); }
        try { Integer.parseInt("abc"); } catch (NumberFormatException e) { System.out.println(e); }
        try { Object o = "s"; Integer i = (Integer) o; } catch (Exception e) { System.out.println(e.getClass().getSimpleName()); }
        try { throw new MyException("custom"); } catch (MyException e) { System.out.println(e.getMessage() + " " + (e instanceof Exception)); }
        try { new java.util.ArrayList<Integer>().get(0); } catch (IndexOutOfBoundsException e) { System.out.println(e.getMessage()); }
        try { recurse(1); } catch (StackOverflowError e) { System.out.println("SOE"); }
        System.out.println(tryReturn());
        System.out.println(divide(1, 0));
        System.out.println("not reached");
    }
}
class MyException extends Exception { MyException(String m) { super(m); } }`,
  'caught: / by zero\nfinally\nIndex 3 out of bounds for length 3\nNPE\njava.lang.NumberFormatException: For input string: "abc"\nClassCastException\ncustom true\nIndex 0 out of bounds for length 0\nSOE\nin finally\n1\n',
  'Exception in thread "main" java.lang.ArithmeticException: / by zero\n\tat Main.divide(Main.java:2)\n\tat Main.main(Main.java:15)');
t('helpful NPE', 'public class Main { public static void main(String[] args) { String name = null; System.out.println(name.length()); } }', '', /NullPointerException: Cannot invoke "String.length\(\)" because "name" is null/);
t('time limit', M('while (true) { }'), '', /Time limit exceeded/, '', { maxMs: 300 });
t('output cap', M('while (true) System.out.println("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");'), undefined, /printed more than/, '', { maxOut: 100000 });
t('definite assignment ok', M('int x; if (args.length > 5) { x = 1; } else { x = 2; } int y; while (true) { y = 3; break; } System.out.println(x + y);'), '5\n');
// ---- the compiler's errors, in javac's words
ce("';' expected", M('int x = 5\nSystem.out.println(x);'), /Main\.java:4: error: ';' expected/);
ce('lossy conversion', M('int x = 3.5;'), /possible lossy conversion from double to int/);
ce('String to int', M('int x = "5";'), /incompatible types: String cannot be converted to int/);
ce('undefined variable', M('System.out.println(y);'), /cannot find symbol\n  symbol:   variable y\n  location: class Main/);
ce('undefined method', M('foo(1);'), /cannot find symbol\n  symbol:   method foo\(int\)/);
ce('wrong arguments', 'public class Main { static int sq(int x) { return x*x; } public static void main(String[] args) { sq(1, 2); } }', /method sq in class Main cannot be applied to given types;\n  required: int\n  found:    int,int/);
ce('int as condition', M('int x = 1; if (x = 2) {}'), /incompatible types: int cannot be converted to boolean/);
ce('missing return', 'public class Main { static int f(int x) { if (x > 0) return 1; } public static void main(String[] args) { } }', /missing return statement/);
ce('already defined', M('int x = 1; int x = 2;'), /variable x is already defined in method main\(String\[\]\)/);
ce('static context', 'public class Main { int count; public static void main(String[] args) { count++; } }', /non-static variable count cannot be referenced from a static context/);
ce('private access', 'class P { private int x; } public class Main { public static void main(String[] args) { P p = new P(); p.x = 1; } }', /x has private access in P/);
ce('bad operands', M('boolean b = true + 1;'), /bad operand types for binary operator '\+'/);
ce('dereference int', M('int x = 1; x.length();'), /int cannot be dereferenced/);
ce('no main', 'public class Main { void f() {} }', /can't find main\(String\[\]\) method in class: Main/);
ce('final', M('final int x = 1; x = 2;'), /cannot assign a value to final variable x/);
ce('not initialized', M('int total; total += 1;'), /variable total might not have been initialized/);
ce('abstract method missing', 'interface S { double area(); } class Sq implements S { } public class Main { public static void main(String[] a) {} }', /Sq is not abstract and does not override abstract method area\(\) in S/);
ce('end of file', 'public class Main { public static void main(String[] args) { ', /reached end of file while parsing/);
ce('outside a class', 'int x = 5;', /class, interface, enum, or record expected/);
ce('list indexed like an array', M('ArrayList<Integer> xs = new ArrayList<>(); xs[0] = 1;'), /array required, but ArrayList<Integer> found/);
ce('duplicate case', M('int x = 1; switch (x) { case 1: break; case 1: break; }'), /duplicate case label/);
// ---- checked exceptions (javac's "unreported exception" and "never thrown" errors) and LinkedHashMap / LinkedHashSet (outputs and first errors are what JDK 21 gives)
const probe = (f) => require('fs').readFileSync(require('path').join(__dirname, 'difftest/java', f), 'utf8');
ce('checked: throw new X in a method without throws', probe('probe-x1.java'), /^Main\.java:7: error: unreported exception BrokenToolException; must be caught or declared to be thrown$/);
ce('checked: calling a method that declares throws', probe('probe-x2.java'), /^Main\.java:12: error: unreported exception BrokenToolException; must be caught or declared to be thrown$/);
ce('checked: catching an exception that cannot be thrown', probe('probe-x3.java'), /^Main\.java:8: error: exception BrokenToolException is never thrown in body of corresponding try statement$/);
ce('checked: a constructor that throws', probe('probe-x4.java'), /^Main\.java:8: error: unreported exception Exception; must be caught or declared to be thrown$/);
ce('checked: a catch of the subclass does not handle the superclass', probe('probe-x6.java'), /^Main\.java:7: error: unreported exception FirstException; must be caught or declared to be thrown$/);
ce('checked: a throw inside a catch block is not handled by that try', probe('probe-x7.java'), /^Main\.java:8: error: unreported exception SecondException; must be caught or declared to be thrown$/);
t('checked exceptions that are declared or caught run normally', probe('probe-x5.java'),
  'tried dirt\nstored dirt\ntried \nbad: no item given\ntried sand\nstored sand\ntried glass\nchest is full (1 too many)\ncaught NoRoomException: chest is full\nwrapped / chest is full\nmulti chest is full\nruntime\n',
  /^Exception in thread "main" NoRoomException: chest is full\n\tat Chest\.put\(Main\.java:16\)\n\tat Main\.fill\(Main\.java:23\)\n\tat Main\.main\(Main\.java:60\)$/);
t('LinkedHashMap and LinkedHashSet keep the order of first insertion', probe('probe-lh.java'),
  '{apple=9, mango=3, zebra=4} [apple, mango, zebra] [9, 3, 4] 3\n[a, b, z, c] true\napple9 mango3 zebra4 new0 \ntrue\n');

t('PriorityQueue is the same binary heap as the JDK\'s: printing shows the array order, ties and removals included', probe('probe-pq.java'),
  "[5]\n[3, 5]\n[3, 5, 8]\n[1, 3, 8, 5]\n[1, 3, 8, 5, 9]\n[1, 3, 2, 5, 9, 8]\n[1, 3, 2, 5, 9, 8, 7]\n[1, 3, 2, 4, 9, 8, 7, 5]\n[1, 3, 2, 4, 9, 8, 7, 5, 6]\n[0, 1, 2, 4, 3, 8, 7, 5, 6, 9]\n0 10 true false\n[0, 1, 2, 4, 3, 9, 7, 5, 6]\n[0, 1, 2, 4, 3, 9, 7, 6] false\n[1, 3, 2, 4, 6, 9, 7]\n[2, 3, 7, 4, 6, 9]\n[3, 4, 7, 9, 6]\n[4, 6, 7, 9]\n[6, 9, 7]\n[7, 9]\n[9]\n[]\n0 1 2 3 4 6 7 9 null null\n[9, 7, 2, 4, 7, 1] 9 [7, 7, 2, 4, 1]\n[fig, pear, plum, kiwi, apple, banana]\nfig,pear,plum,kiwi,apple,banana,\nfig pear kiwi plum apple banana \n[1, 2, 3, 6, 5, 4, 7, 8, 9]\n[0, 1, 3, 6, 2, 4, 7, 8, 9, 5] [1, 2, 3, 6, 5, 4, 7, 8, 9]\n[d0, a1, c2, b2] d0 a1 c2 b2 null\nNSE null\nNSE2\nCCE\nNPE\n");

// ---- regressions found by comparing with the real JDK 21 (expected outputs are what javac + java print)
t("printf rounds the shortest decimal half-up", M("System.out.println(String.format(\"%.2f %.2f %.1f %.1f %.2f %.2f %.0f %.0f\", 2.675, 1.005, 0.15, 0.35, 0.015, 1.115, 0.5, 2.5)); System.out.println(String.format(\"%.20f|%.3e|%.2e|%e|%.3g|%.1g|%g\", 0.1, 9.9995, 1234.5, 0.0, 9.995, 0.0000972, 0.0001234)); System.out.printf(\"%.2f %.3f %,.2f %10.3f|%n\", 1.005f, 0.2285f, 1234567.125, -2.0005); System.out.println(Double.MIN_VALUE + \" \" + Float.MIN_VALUE + \" \" + String.format(\"%e\", Double.MIN_VALUE));"),
  "2.68 1.01 0.2 0.4 0.02 1.12 1 3\n0.10000000000000000000|1.000e+01|1.23e+03|0.000000e+00|10.0|0.0001|0.000123400\n1.00 0.228 1,234,567.13     -2.001|\n4.9E-324 1.4E-45 4.900000e-324\n");
t("queues and deques: remove(x) removes the value", M("ArrayDeque<Integer> d = new ArrayDeque<>(); d.add(5); d.add(7); d.add(0); System.out.println(d.remove(0) + \" \" + d); Queue<Integer> q = new LinkedList<>(); q.add(4); q.add(8); q.add(0); System.out.println(q.remove(0) + \" \" + q + \" \" + q.remove() + \" \" + q.element() + \" \" + q); Deque<Integer> e = new ArrayDeque<>(List.of(3, 9, 1)); System.out.println(e.remove(1) + \" \" + e + \" \" + e.offerFirst(7) + \" \" + e.offerLast(8) + \" \" + e + \" \" + e.peekLast() + \" \" + e.removeLast()); Iterator<Integer> it = e.descendingIterator(); while (it.hasNext()) System.out.print(it.next() + \" \"); System.out.println(); try { d.add(null); } catch (NullPointerException ex) { System.out.println(\"NPE\"); } try { new ArrayDeque<Integer>().remove(); } catch (NoSuchElementException ex) { System.out.println(ex); } try { new ArrayDeque<String>().element(); } catch (NoSuchElementException ex) { System.out.println(ex); } LinkedList<Integer> ll = new LinkedList<>(); ll.add(null); ll.add(2); System.out.println(ll + \" \" + ll.remove() + \" \" + ll.get(0) + \" \" + ll); try { new LinkedList<Integer>().get(0); } catch (IndexOutOfBoundsException ex) { System.out.println(ex); } Queue<int[]> bfs = new ArrayDeque<>(); bfs.offer(new int[]{0}); int n = 0; while (!bfs.isEmpty()) { int[] c = bfs.remove(); n++; if (c[0] < 4) bfs.add(new int[]{c[0] + 1}); } System.out.println(n + \" \" + d.getClass().getSimpleName());"),
  "true [5, 7]\ntrue [4, 8] 4 8 [8]\ntrue [3, 9] true true [7, 3, 9, 8] 8 8\n9 3 7 \nNPE\njava.util.NoSuchElementException\njava.util.NoSuchElementException\n[null, 2] null 2 [2]\njava.lang.IndexOutOfBoundsException: Index: 0, Size: 0\n5 ArrayDeque\n");
t("iterators", M("List<Integer> xs = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6)); Iterator<Integer> it = xs.iterator(); while (it.hasNext()) if (it.next() % 2 == 0) it.remove(); System.out.println(xs); Set<String> ss = new TreeSet<>(List.of(\"a\", \"bb\", \"c\", \"dd\")); for (Iterator<String> i = ss.iterator(); i.hasNext();) if (i.next().length() > 1) i.remove(); System.out.println(ss); try { xs.iterator().remove(); } catch (IllegalStateException e) { System.out.println(e); } try { new ArrayList<Integer>().iterator().next(); } catch (NoSuchElementException e) { System.out.println(e); }"),
  "[1, 3, 5]\n[a, c]\njava.lang.IllegalStateException\njava.util.NoSuchElementException\n");
t("user exceptions print their message", `class MyRt extends RuntimeException { MyRt(String m) { super(m); } MyRt() { } }
class MyEx extends Exception { MyEx(String m) { super(m); } }
class Sub extends MyEx { Sub() { super("sub"); } }
public class Main {
    public static void main(String[] args) {
        System.out.println(new MyRt("boom"));
        try { throw new MyEx("bad"); } catch (Exception e) { System.out.println(e + " | " + e.toString() + " | " + e.getMessage()); }
        try { throw new MyRt(); } catch (RuntimeException e) { System.out.println(e + " | " + e.getMessage()); }
        try { throw new Sub(); } catch (MyEx e) { System.out.println("caught " + e); }
    }
}
`,
  "MyRt: boom\nMyEx: bad | MyEx: bad | bad\nMyRt | null\ncaught Sub: sub\n");
t("getClass() == o.getClass(), Objects.hash and boxed Character identity", `import java.util.*;
class Pt { final int x, y; Pt(int x, int y) { this.x = x; this.y = y; }
    @Override public boolean equals(Object o) { if (this == o) return true; if (o == null || getClass() != o.getClass()) return false; Pt p = (Pt) o; return x == p.x && y == p.y; }
    @Override public int hashCode() { return Objects.hash(x, y); } public String toString() { return "(" + x + "," + y + ")"; } }
class Pt3 extends Pt { Pt3(int x, int y) { super(x, y); } }
public class Main {
    public static void main(String[] args) {
        Set<Pt> ps = new HashSet<>(); ps.add(new Pt(1, 2)); ps.add(new Pt(1, 2)); ps.add(new Pt(-3, 70)); System.out.println(ps + " " + ps.contains(new Pt(-3, 70)) + " " + new Pt(1, 2).equals(new Pt3(1, 2)));
        System.out.println(Objects.hash(1, 2, 3) + " " + Objects.hash("a", null, 2.5) + " " + Objects.equals(null, null) + " " + Objects.equals("a", "b") + " " + Objects.toString(null, "none") + " " + Objects.hashCode(null) + " " + Objects.isNull(null));
        try { Objects.requireNonNull(null, "name must not be null"); } catch (NullPointerException e) { System.out.println(e); }
        Character a = 'a', b = 'a', c = '\\u0100', d = '\\u0100'; System.out.println((a == b) + " " + (c == d) + " " + c.equals(d) + " " + ("x".getClass() == "y".getClass()));
        System.out.println(new Object().toString().startsWith("java.lang.Object@"));
    }
}
`,
  "[(1,2), (-3,70)] true false\n30817 1074126976 true false none 0 true\njava.lang.NullPointerException: name must not be null\ntrue false true true\ntrue\n");
t("entrySet order, split", M("HashMap<String, Integer> ages = new HashMap<>(); ages.put(\"Alice\", 30); ages.put(\"Bob\", 25); ages.put(\"Charlie\", 35); ages.put(\"Diana\", 28); ages.put(\"Eve\", 22); System.out.println(ages.entrySet()); List<Map.Entry<String, Integer>> es = new ArrayList<>(ages.entrySet()); System.out.println(es.get(0)); System.out.println(Arrays.toString(\"a1b2c\".split(\"(\\\\d)\")) + \" \" + \",,\".split(\",\").length + \" \" + Arrays.toString(\"a,b,,\".split(\",\")) + \" \" + Arrays.toString(\"a,b,,\".split(\",\", -1)) + \" \" + Arrays.toString(\"abc\".split(\"\")) + \" \" + Arrays.toString(\"abc\".split(\"\", 2)) + \" \" + Arrays.toString(\"x1y22z\".split(\"(\\\\d)+\", 2)) + \" \" + Arrays.toString(\" a b\".split(\" \")) + \" \" + \"\".split(\",\").length);"),
  "[Diana=28, Bob=25, Eve=22, Alice=30, Charlie=35]\nDiana=28\n[a, b, c] 0 [a, b] [a, b, , ] [a, b, c] [a, bc] [x, y22z] [, a, b] 1\n");
t("octal and other literals", M("System.out.println(010 + \" \" + 0777 + \" \" + 017L + \" \" + 0 + \" \" + 00 + \" \" + 037777777777 + \" \" + 09.5 + \" \" + 1.e1 + \" \" + 1.f + \" \" + 0x1F + \" \" + 0b101);"),
  "8 511 15 0 0 -1 9.5 10.0 1.0 31 5\n");
t("scanner mismatch has no message", M("Scanner sc = new Scanner(System.in); try { sc.nextInt(); } catch (InputMismatchException e) { System.out.println(e + \" \" + e.getMessage()); sc.next(); } try { sc.nextInt(); } catch (InputMismatchException e) { System.out.println(e); }"),
  "java.util.InputMismatchException null\njava.util.InputMismatchException: For input string: \"99999999999\"\n", undefined, "abc 99999999999\n");
t("exception messages (JDK 21 wording)", M("String s = \"abc\"; StringBuilder sb = new StringBuilder(\"ab\"); try { s.substring(2, 1); } catch (Exception e) { System.out.println(e); } try { s.substring(5); } catch (Exception e) { System.out.println(e); } try { s.charAt(-1); } catch (Exception e) { System.out.println(e); } try { sb.charAt(5); } catch (Exception e) { System.out.println(e); } try { sb.deleteCharAt(2); } catch (Exception e) { System.out.println(e); } try { sb.setCharAt(-1, 'x'); } catch (Exception e) { System.out.println(e); } try { sb.insert(5, \"x\"); } catch (Exception e) { System.out.println(e); } try { sb.delete(3, 4); } catch (Exception e) { System.out.println(e); } try { sb.replace(1, 0, \"x\"); } catch (Exception e) { System.out.println(e); } try { sb.substring(3); } catch (Exception e) { System.out.println(e); } try { Integer.parseInt(null); } catch (Exception e) { System.out.println(e); } try { Integer.parseInt(\"1\", 1); } catch (Exception e) { System.out.println(e); } try { new ArrayList<Integer>().subList(0, 2); } catch (Exception e) { System.out.println(e); } try { Arrays.sort(new int[2], 2, 1); } catch (Exception e) { System.out.println(e); } try { Arrays.copyOfRange(new int[2], 3, 4); } catch (Exception e) { System.out.println(e); } System.out.println(sb.delete(1, 9) + \" \" + new StringBuilder(\"hello\").replace(1, 99, \"ey\"));"),
  "java.lang.StringIndexOutOfBoundsException: Range [2, 1) out of bounds for length 3\njava.lang.StringIndexOutOfBoundsException: Range [5, 3) out of bounds for length 3\njava.lang.StringIndexOutOfBoundsException: Index -1 out of bounds for length 3\njava.lang.StringIndexOutOfBoundsException: Index 5 out of bounds for length 2\njava.lang.StringIndexOutOfBoundsException: Index 2 out of bounds for length 2\njava.lang.StringIndexOutOfBoundsException: Index -1 out of bounds for length 2\njava.lang.StringIndexOutOfBoundsException: Range [5, 2) out of bounds for length 2\njava.lang.StringIndexOutOfBoundsException: Range [3, 2) out of bounds for length 2\njava.lang.StringIndexOutOfBoundsException: Range [1, 0) out of bounds for length 2\njava.lang.StringIndexOutOfBoundsException: Range [3, 2) out of bounds for length 2\njava.lang.NumberFormatException: Cannot parse null string\njava.lang.NumberFormatException: radix 1 less than Character.MIN_RADIX\njava.lang.IndexOutOfBoundsException: toIndex = 2\njava.lang.IllegalArgumentException: fromIndex(2) > toIndex(1)\njava.lang.ArrayIndexOutOfBoundsException: arraycopy: length -1 is negative\na hey\n");
t("Math.round on the exact value", M("System.out.println(Math.round(0.49999999999999994) + \" \" + Math.round(4503599627370497.0) + \" \" + Math.round(-2.5) + \" \" + Math.round(-0.5) + \" \" + Math.round(2.5) + \" \" + Math.round(1e19) + \" \" + Math.round(0.49999997f) + \" \" + Math.round(-2.5f) + \" \" + Math.round(8388609.0f));"),
  "0 4503599627370497 -2 0 3 9223372036854775807 0 -2 8388609\n");
t("type inference and the conditional operator", `import java.util.*;
class Animal { public String toString() { return getClass().getSimpleName(); } } class Dog extends Animal { } class Cat extends Animal { }
public class Main {
    public static void main(String[] args) {
        List<Animal> zoo = new ArrayList<>(List.of(new Dog(), new Cat())); zoo.addAll(Arrays.asList(new Cat(), new Dog())); System.out.println(zoo);
        List<Dog> dogs = new ArrayList<>(); dogs.add(new Dog()); List<Animal> copy = new ArrayList<>(dogs); Set<Animal> set = new HashSet<>(dogs); System.out.println(copy + " " + set.size());
        List<Number> ns = List.of(1, 2.5, 3L); System.out.println(ns); List<Object> os = List.of(1, "a", 'c'); System.out.println(os);
        boolean f = args.length == 0; Object o = f ? 1 : "s"; Animal a = f ? new Dog() : new Cat(); Number n = f ? Integer.valueOf(3) : Double.valueOf(2.5);
        System.out.println(o + " " + o.getClass().getSimpleName() + " " + a + " " + n + " " + (f ? 'c' : "x") + " " + (f ? null : 5));
    }
}
`,
  "[Dog, Cat, Cat, Dog]\n[Dog] 1\n[1, 2.5, 3]\n[1, a, c]\n1 Integer Dog 3.0 c null\n");
t("String and StringBuilder lastIndexOf with a start, Character.toString(int)", M("String s = \"banana\"; System.out.println(s.lastIndexOf(\"an\", 2) + \" \" + s.lastIndexOf('a', 4) + \" \" + s.lastIndexOf(\"a\", -1) + \" \" + s.lastIndexOf(\"na\", 99) + \" \" + new StringBuilder(s).indexOf(\"an\", 2) + \" \" + new StringBuilder(s).lastIndexOf(\"an\", 2) + \" \" + Character.toString(65) + Character.toString('b'));"),
  "1 3 -1 4 3 1 Ab\n");
t("Arrays.fill and sort with a range", M("int[] f = new int[5]; Arrays.fill(f, 1, 3, 9); System.out.println(Arrays.toString(f)); String[] w = {\"d\", \"c\", \"b\", \"a\"}; Arrays.fill(w, 3, 4, \"z\"); Arrays.sort(w, 0, 3); System.out.println(Arrays.toString(w)); try { Arrays.fill(f, 3, 1, 0); } catch (IllegalArgumentException e) { System.out.println(e); } try { Arrays.fill(f, 0, 9, 0); } catch (ArrayIndexOutOfBoundsException e) { System.out.println(e); }"),
  "[0, 9, 9, 0, 0]\n[b, c, d, z]\njava.lang.IllegalArgumentException: fromIndex(3) > toIndex(1)\njava.lang.ArrayIndexOutOfBoundsException: Array index out of range: 9\n");
t("TreeSet and TreeMap navigation", M("TreeSet<Integer> ts = new TreeSet<>(List.of(5, 1, 9, 3)); System.out.println(ts.higher(5) + \" \" + ts.lower(1) + \" \" + ts.floor(4) + \" \" + ts.ceiling(4) + \" \" + ts.ceiling(10) + \" \" + ts.headSet(5) + \" \" + ts.tailSet(5) + \" \" + ts.pollFirst() + \" \" + ts.pollLast() + \" \" + ts); TreeMap<String, Integer> tm = new TreeMap<>(); tm.put(\"b\", 2); tm.put(\"a\", 1); tm.put(\"d\", 4); System.out.println(tm.firstEntry() + \" \" + tm.lastEntry() + \" \" + tm.headMap(\"c\") + \" \" + tm.tailMap(\"b\") + \" \" + tm.higherKey(\"b\") + \" \" + tm.lowerKey(\"a\") + \" \" + tm.pollFirstEntry() + \" \" + tm + \" \" + new TreeMap<String, Integer>().firstEntry());"),
  "9 null 3 5 null [1, 3] [5, 9] 1 9 [3, 5]\na=1 d=4 {a=1, b=2} {b=2, d=4} d null a=1 {b=2, d=4} null\n");
t("comparators", `import java.util.*;
class Student { String name; int grade; Student(String n, int g) { name = n; grade = g; } public String toString() { return name + ":" + grade; } }
class ByGrade implements Comparator<Student> { public int compare(Student a, Student b) { return Integer.compare(a.grade, b.grade); } }
class ByName implements Comparator<Student> { @Override public int compare(Student a, Student b) { return a.name.compareTo(b.name); } }
public class Main {
    public static void main(String[] args) {
        List<Student> xs = new ArrayList<>(); xs.add(new Student("cy", 80)); xs.add(new Student("al", 90)); xs.add(new Student("bo", 80));
        Collections.sort(xs, new ByGrade()); System.out.println(xs); xs.sort(new ByName()); System.out.println(xs); xs.sort(new ByGrade().reversed()); System.out.println(xs);
        System.out.println(Collections.max(xs, new ByGrade()) + " " + Collections.min(xs, new ByName()) + " " + new ByGrade().compare(xs.get(0), xs.get(1)));
        List<Integer> ns = new ArrayList<>(List.of(3, 1, 2)); ns.sort(Collections.reverseOrder()); System.out.println(ns); ns.sort(null); System.out.println(ns);
        Integer[] arr = {5, 2, 8}; Arrays.sort(arr, Collections.reverseOrder()); System.out.println(Arrays.toString(arr));
        Student[] st = xs.toArray(new Student[0]); Arrays.sort(st, new ByName()); System.out.println(Arrays.toString(st));
    }
}
`,
  "[cy:80, bo:80, al:90]\n[al:90, bo:80, cy:80]\n[al:90, bo:80, cy:80]\nal:90 al:90 1\n[3, 2, 1]\n[1, 2, 3]\n[8, 5, 2]\n[al:90, bo:80, cy:80]\n");
ce('a queue has no index methods', M('Queue<Integer> q = new ArrayDeque<>(); q.add(1); System.out.println(q.get(0));'), /cannot find symbol\n  symbol:   method get\(int\)/);
ce('Collection constructor checks the element type', 'import java.util.*;\nclass A { } class D extends A { }\npublic class Main { public static void main(String[] args) { List<D> ds = new ArrayList<>(); List<String> bad = new ArrayList<>(ds); } }', /no suitable constructor found for ArrayList\(List<D>\)/);
// ---- the exercise harness
const h1 = U.harness({}, 'public static int square(int x) {\n    return x * x;\n}', { call: 'square(7)' });
t('harness: method exercise', h1.src, '49\n');
const h2 = U.harness({ prelude: 'import java.util.*;' }, 'public static int square(int x) {\n    return x * y;\n}', { call: 'square(7)' });
const r2 = J.run(h2.src, '');
if (!/^Main\.java:2: error: cannot find symbol/.test(U.shiftLines(r2.err, h2.shift))) { bad++; console.log('BAD  harness: error lines are moved back to the student\'s lines', r2.err); } else console.log('ok   harness: error lines are moved back to the student\'s lines');
const h3 = U.harness({ classes: true }, 'class Dog {\n    String name;\n    Dog(String n) { name = n; }\n    String speak() { return name + " says Woof"; }\n}', { main: '        System.out.println(new Dog("Rex").speak());' });
t('harness: class exercise', h3.src, 'Rex says Woof\n');
if (!U.harness({}, 'public static void main(String[] args) {}', { call: 'x' }).error) { bad++; console.log('BAD  harness: a main in a method exercise is refused'); } else console.log('ok   harness: a main in a method exercise is refused');
t('getClass() prints like Java', 'class Foo {}\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println(new Foo().getClass());\n        System.out.println("s".getClass().getSimpleName());\n    }\n}\n', 'class Foo\nString\n');
const hc = U.harness({}, '// the first class of the day, with a main(String[] a) in mind\nstatic int f(int x) { String s = "class Foo"; return x; }', { call: 'f(1)' });
if (hc.error) { bad++; console.log('BAD  harness: a comment or a text is not a class', hc.error); } else console.log('ok   harness: a comment or a text is not a class');
console.log(bad ? bad + ' problems' : 'all ok');
