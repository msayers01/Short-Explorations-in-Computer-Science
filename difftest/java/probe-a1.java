import java.util.*;
public class Main {

 public static void main(String[] args) {
System.out.println(-7 / 2); System.out.println(-7 % 3); System.out.println(7 % -3); System.out.println(-7 % -3);
System.out.println(Integer.MAX_VALUE + 1); System.out.println(Integer.MIN_VALUE - 1); System.out.println(Integer.MIN_VALUE / -1); System.out.println(Integer.MIN_VALUE % -1);
System.out.println(-Integer.MIN_VALUE); System.out.println(Math.abs(Integer.MIN_VALUE));
int big = 46341; System.out.println(big * big);
System.out.println(123456789 * 987654321);
System.out.println(Long.MAX_VALUE); System.out.println(Long.MIN_VALUE); System.out.println(9000000000L * 3);
System.out.println(Long.MAX_VALUE * 2); System.out.println(3037000500L * 3037000500L);
long l = Integer.MAX_VALUE; l++; System.out.println(l);
System.out.println(1 << 31); System.out.println(1 << 32); System.out.println(1L << 63); System.out.println(-8 >> 1); System.out.println(-8 >>> 28); System.out.println(-8L >>> 60);
System.out.println(5 & 3); System.out.println(5 | 3); System.out.println(5 ^ 3); System.out.println(~5);
System.out.println(0x7fffffff); System.out.println(0b1010); System.out.println(1_000_000); System.out.println(010);
int i = 5; i = i++ + ++i; System.out.println(i);
System.out.println(-7.5 % 2); System.out.println(7.5 % -2);
System.out.println((int) 3.9e10); System.out.println((long) 1e19); System.out.println((int) Double.NaN); System.out.println((int) -0.5);
System.out.println((short) 70000); System.out.println((char) 65 + 1); System.out.println((char) (65 + 1)); System.out.println((byte) -129);
System.out.println(Long.MIN_VALUE / -1); System.out.println(Math.abs(Long.MIN_VALUE));
System.out.println(Integer.MAX_VALUE * 2L); System.out.println(Integer.MAX_VALUE * 2);
long m = 1000000 * 1000000; System.out.println(m);
System.out.println(0.1f + 0.2f); System.out.println(1.0f / 3); System.out.println(100.0f); System.out.println(1e10f); System.out.println((double) 0.1f);
 }
}
