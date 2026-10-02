import java.util.*;
class Node { int val; Node next; Node(int v) { val = v; } }
class LinkedStack { private Node head; private int size; void push(int v) { Node n = new Node(v); n.next = head; head = n; size++; } int pop() { if (head == null) throw new RuntimeException("empty"); int v = head.val; head = head.next; size--; return v; } boolean isEmpty() { return head == null; } int size() { return size; } }
class Counter { static int total; int mine; Counter() { total++; mine = total; } static int getTotal() { return total; } }
class Shape { String name() { return "shape"; } static String kind() { return "static shape"; } public String toString() { return name(); } }
class Circle extends Shape { String name() { return "circle"; } static String kind() { return "static circle"; } }
class P { int x = 10; P() { init(); } void init() { System.out.println("P.init x=" + x); } }
class C extends P { int y = 5; C() { super(); System.out.println("C ctor y=" + y); } void init() { System.out.println("C.init y=" + y); } }
class Pair implements Comparable<Pair> { int a, b; Pair(int a, int b) { this.a = a; this.b = b; } public int compareTo(Pair o) { return a != o.a ? Integer.compare(a, o.a) : Integer.compare(b, o.b); } public String toString() { return "(" + a + "," + b + ")"; } }
public class Main {
    static int calls = 0;
    static int fib(int n) { calls++; return n < 2 ? n : fib(n - 1) + fib(n - 2); }
    static void swap(int[] a, int i, int j) { int t = a[i]; a[i] = a[j]; a[j] = t; }
    static void f(long x) { System.out.println("long"); } static void f(double x) { System.out.println("double"); } static void f(Integer x) { System.out.println("Integer"); }
    static void g(Object o) { System.out.println("Object"); } static void g(String s) { System.out.println("String"); }
    static void h(int... xs) { System.out.println("varargs " + xs.length); } static void h(int a, int b) { System.out.println("two"); }
    public static void main(String[] args) {
        LinkedStack s = new LinkedStack(); for (int i = 0; i < 5; i++) s.push(i * i); while (!s.isEmpty()) System.out.print(s.pop() + " "); System.out.println(s.size());
        new Counter(); new Counter(); Counter c3 = new Counter(); System.out.println(Counter.total + " " + c3.mine + " " + Counter.getTotal());
        Shape sh = new Circle(); System.out.println(sh + " " + sh.kind() + " " + Shape.kind());
        new C();
        System.out.println(fib(15) + " " + calls);
        int[] arr = {1, 2, 3}; swap(arr, 0, 2); System.out.println(Arrays.toString(arr));
        f(5); f(5.0f); f('c'); g(null); g("s"); g(1); h(1, 2); h(1); h(); h(1, 2, 3);
        List<Pair> ps = new ArrayList<>(); ps.add(new Pair(2, 1)); ps.add(new Pair(1, 5)); ps.add(new Pair(1, 2)); Collections.sort(ps); System.out.println(ps);
        Object o = new Object(); System.out.println(o.equals(o) + " " + new Node(1).equals(new Node(1)));
        String t = "a"; for (int i = 0; i < 3; i++) t += i; System.out.println(t);
        StringBuilder sb = new StringBuilder(); for (int i = 0; i < 5; i++) { if (sb.length() > 0) sb.append(", "); sb.append(i); } System.out.println("[" + sb + "]");
        final int N = 5; int[][] pas = new int[N][]; for (int i = 0; i < N; i++) { pas[i] = new int[i + 1]; pas[i][0] = pas[i][i] = 1; for (int j = 1; j < i; j++) pas[i][j] = pas[i - 1][j - 1] + pas[i - 1][j]; } System.out.println(Arrays.deepToString(pas));
        int[][] m = {{1, 2}, {3, 4}}; int[][] tr = new int[2][2]; for (int i = 0; i < 2; i++) for (int j = 0; j < 2; j++) tr[j][i] = m[i][j]; System.out.println(Arrays.deepToString(tr) + " " + Arrays.toString(m[0]) + " " + m[1][1]);
        int[] a2 = arr; a2[0] = 99; System.out.println(arr[0] + " " + arr.equals(a2) + " " + Arrays.equals(arr, new int[]{99, 2, 1}));
        long sum = 0; for (int i = 0; i < 100000; i++) sum += i * i; System.out.println(sum);
        int isum = 0; for (int i = 0; i < 100000; i++) isum += i * i; System.out.println(isum);
        System.out.println(Integer.MAX_VALUE + Integer.MAX_VALUE); int mid = (2000000000 + 2000000000) / 2; System.out.println(mid + " " + (2000000000 + (2000000000 - 2000000000) / 2) + " " + ((2000000000 + 2000000000) >>> 1));
        char grade = 'B'; switch (grade) { case 'A': System.out.println("great"); break; case 'B': case 'C': System.out.println("ok"); break; default: System.out.println("?"); }
        var list = new ArrayList<String>(); list.add("v"); var n = 5L; System.out.println(list + " " + (n + 1));
        Object[] things = {1, "two", 3.0, 'c', true, null, 4L}; for (Object th : things) System.out.print(th + " "); System.out.println();
        System.out.println(things[0] instanceof Integer); System.out.println(things[3].getClass().getName());
// dropped
    }
}
