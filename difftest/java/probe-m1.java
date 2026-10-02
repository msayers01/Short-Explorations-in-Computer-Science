import java.util.*;
public class Main {
    static int sx = init("sx"); static { System.out.println("static block"); } int ix = init("ix"); { System.out.println("instance block"); }
    Main() { System.out.println("ctor"); }
    static int init(String s) { System.out.println("init " + s); return 1; }
    static void p(char c) { System.out.println("char " + c); } static void p(int i) { System.out.println("int " + i); } static void p(String s) { System.out.println("String " + s); } static void p(Object o) { System.out.println("Object " + o); }
    static void q(long l) { System.out.println("long"); } static void q(Integer i) { System.out.println("Integer"); }
    static void r(double d) { System.out.println("double " + d); }
    public static void main(String[] args) {
        new Main();
        char c = 'a'; p(c); p(c + 1); p((char) (c + 1)); p("" + c); p(c++); p(++c); p('a' + 'b'); p(1.5); p(null == null ? "x" : "y");
        q(5); r(5); r('a'); r(5L);
        Integer n = null; try { int v = true ? n : 0; } catch (NullPointerException e) { System.out.println("NPE ternary"); }
// dropped
        Object o2 = false ? 1 : 2.5; System.out.println(o2 + " " + o2.getClass().getSimpleName());
// dropped
        String s = "Hello"; String rev = ""; for (int i = s.length() - 1; i >= 0; i--) rev += s.charAt(i); System.out.println(rev);
        int count = 0; for (char ch : s.toLowerCase().toCharArray()) if ("aeiou".indexOf(ch) >= 0) count++; System.out.println(count);
        int[] freq = new int[26]; for (char ch : "banana".toCharArray()) freq[ch - 'a']++; for (int i = 0; i < 26; i++) if (freq[i] > 0) System.out.print((char) ('a' + i) + "" + freq[i] + " "); System.out.println();
        char[] arr = "dcba".toCharArray(); Arrays.sort(arr); System.out.println(new String(arr) + " " + String.valueOf(arr) + " " + Arrays.toString(arr) + " " + arr.length);
// dropped
    }
}
