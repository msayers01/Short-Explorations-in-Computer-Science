import java.util.*;
public class Main {

 public static void main(String[] args) {
int a = 5; long b = 7; Object t = true ? a : b; System.out.println(t);
System.out.println(true ? 1 : 2.0); System.out.println(false ? 1 : 'x'); System.out.println(true ? 'x' : 0); int ii = 0; System.out.println(true ? 'x' : ii);
Integer nul = null; System.out.println(true ? "s" : nul);
System.out.println(true ? (Integer) 5 : (Double) 2.0);
char cc = true ? 66 : 'a'; System.out.println(cc);
int k = 2; switch (k) { case 1: System.out.println("1"); case 2: System.out.println("2"); case 3: System.out.println("3"); break; case 4: System.out.println("4"); }
switch (k) { default: System.out.println("def"); case 1: System.out.println("one"); }
char ch = 'b'; switch (ch) { case 'a': case 'b': System.out.println("ab"); break; default: System.out.println("other"); }
String r = "two"; System.out.println(r);
outer: for (int i = 0; i < 4; i++) { inner: for (int j = 0; j < 4; j++) { if (j > i) continue outer; if (i == 3) break outer; System.out.print(i * 10 + j + " "); } } System.out.println();
lbl: { System.out.println("in"); if (k == 2) break lbl; System.out.println("not"); } System.out.println("after");
int w = 0; loop: while (true) { w++; do { if (w > 3) break loop; } while (false); } System.out.println(w);
for (int i = 0, j = 10; i < j; i += 3, j -= 3) System.out.print(i + ":" + j + " "); System.out.println();
int cnt = 0; for (;;) { if (++cnt == 5) break; } System.out.println(cnt);
int x = 3; x = x++ * 2 + x; System.out.println(x);
int[] arr = {0, 0}; int idx = 0; arr[idx++] = idx; System.out.println(Arrays.toString(arr));
boolean f = false; if (f = true) System.out.println("assigned");
System.out.println(5 > 3 == true); System.out.println(1 + 2 + "3" + 4 + 5);
int sh = 1; sh = sh << 33; System.out.println(sh); System.out.println(1L << 65);
 }
}
