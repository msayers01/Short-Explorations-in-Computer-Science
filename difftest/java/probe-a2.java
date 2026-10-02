import java.util.*;
public class Main {

 public static void main(String[] args) {
char c = 'a'; System.out.println(c + 1); System.out.println((char)(c + 1)); c += 1; System.out.println(c); c++; System.out.println(c);
System.out.println('a' + 'b' + "c"); System.out.println("c" + 'a' + 'b'); System.out.println('a' + 1 + "x");
char d = 'z'; d -= 25; System.out.println(d);
System.out.println(c - 'a'); System.out.println((int) 'A'); System.out.println(Character.getNumericValue('7')); System.out.println('7' - '0');
System.out.println(Character.isDigit('5') + " " + Character.isLetter('x') + " " + Character.isUpperCase('a') + " " + Character.toUpperCase('q') + " " + Character.isWhitespace(' ') + " " + Character.isLetterOrDigit('_'));
System.out.println(Character.toUpperCase('a') + 1);
char e = 65; System.out.println(e);
final int K = 66; char f = K; System.out.println(f);
byte b = 10; b += 300; System.out.println(b); b++; System.out.println(b);
byte bb = 127; bb++; System.out.println(bb);
short s = 32767; s += 1; System.out.println(s);
int x = 10; x += 1.5; System.out.println(x); x *= 2.5; System.out.println(x); x /= 0.3; System.out.println(x);
int y = 7; y -= 0.9; System.out.println(y);
int z = 5; z += 'a'; System.out.println(z);
char g = 'A'; g *= 2; System.out.println((int) g);
long lg = 5; lg += 2.7; System.out.println(lg);
int q = Integer.MAX_VALUE; q += 1L; System.out.println(q);
double dd = 10; dd /= 4; System.out.println(dd);
int h = 17; h %= 5; System.out.println(h); h <<= 30; System.out.println(h);
int r = 10; r /= 3; System.out.println(r);
String str = "x"; str += 1 + 2; System.out.println(str); str += 'c'; System.out.println(str); str += null; System.out.println(str);
char[] cs = {'h','i'}; System.out.println(cs); System.out.println("" + cs.length);
 }
}
