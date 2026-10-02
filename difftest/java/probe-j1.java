import java.util.*;
public class Main {
static int cnt = 0; static int next() { return cnt++; } static boolean t(String s) { System.out.print(s); return true; } static boolean f(String s) { System.out.print(s); return false; }
 public static void main(String[] args) {
int[] a = {1, 2, 3, 4}; int i = 0; a[i++] += 10; System.out.println(Arrays.toString(a) + " " + i);
a[next()] *= 5; a[next()]++; System.out.println(Arrays.toString(a) + " " + cnt);
int x = 5; x += x++; System.out.println(x); x = 5; x = x++ + x++; System.out.println(x); x = 5; x -= --x; System.out.println(x);
String s = "s"; s += 'a' + 1; System.out.println(s); s = "s"; s += (char) ('a' + 1); System.out.println(s); s += 1.0; s += 'c'; s += true; System.out.println(s);
int m = Integer.MAX_VALUE; m++; System.out.println(m); char c = 65535; c++; System.out.println((int) c); byte b = -128; b--; System.out.println(b);
System.out.println(f("a") && t("b")); System.out.println(t("a") || f("b")); System.out.println(f("a") & t("b")); System.out.println(t("a") | f("b"));
int y = 0; boolean r = (y != 0) && (10 / y > 1); System.out.println(r);
for (long k = Integer.MAX_VALUE - 1L; k <= Integer.MAX_VALUE + 1L; k++) System.out.print(k + " "); System.out.println();
System.out.println(-2147483648 + " " + (-2147483648 - 1) + " " + -9223372036854775808L);
System.out.println(Math.abs(-5L) + " " + Math.max(3L, 7L) + " " + Math.abs(-2.5f) + " " + Math.max(1, 'a') + " " + Math.min(-0.0f, 0.0f));
System.out.println((int) 'a' + "b" + 'c' + (char) 100 + 1 + 2);
// dropped
int z = 10; try { z /= 0; } catch (ArithmeticException e) { System.out.println("caught " + z); }
double dz = 10; dz /= 0; System.out.println(dz); dz %= 0; System.out.println(dz);
// dropped
int p = 7; p = -p; p = +p; System.out.println(p + " " + -(-p) + " " + (- -p) + " " + ~p + " " + !(p > 0));
int q = 3; q <<= 33; System.out.println(q); long lq = 3; lq <<= 65; System.out.println(lq); int nq = -17; nq >>= 2; System.out.println(nq); nq >>>= 28; System.out.println(nq);
char ch = 'a'; ch += 1.7; System.out.println(ch); ch = 'z'; int diff = ch - 'a' + 1; System.out.println(diff); System.out.println((char) ('a' + 25) + "" + (char) (ch - 32));
System.out.println(ch == 122); System.out.println('a' < 'b'); System.out.println((char) (ch + 1) == '{');
final char FC = 'x'; switch (ch) { case FC: System.out.println("x"); break; case 'z': System.out.println("zed"); break; }
System.out.println(1 / 2 + 1.0 / 2 + 1 / 2.0f + 1 % 2);
System.out.println(10 - 2 - 3 + " " + 2 * 3 % 4 + " " + 8 / 2 / 2 + " " + 1 + 2 * 3 + " " + (1 + 2) * 3 + " " + 7 / 2 * 2);
System.out.println(0.1f == 0.1); System.out.println(0.5f == 0.5); System.out.println((float) 0.1 == 0.1f); System.out.println(100L == 100.0); System.out.println('A' == 65.0);
 }
}
