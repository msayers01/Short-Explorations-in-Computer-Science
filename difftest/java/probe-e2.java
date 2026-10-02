import java.util.*;
public class Main {

 public static void main(String[] args) {
Integer boxed = 5; Object ob = boxed; System.out.println(ob.equals(5) + " " + ob.hashCode() + " " + Double.valueOf(1.5).hashCode() + " " + Character.valueOf('a').hashCode() + " " + Long.valueOf(1L << 40).hashCode());
// dropped
System.out.println('A' + " " + "\t|" + " " + "\\" + " " + '\'' + " " + "\"q\"" + " " + (int) '\n' + " " + "abc");
char c = '\101'; System.out.println(c);
System.out.println(Double.MIN_VALUE + " " + Float.MAX_VALUE + " " + Long.MIN_VALUE + " " + Byte.MAX_VALUE);
System.out.println(1.0e-3 + " " + 0.001f + " " + 1234567.0f + " " + 1.0e7f + " " + 3.4028235e38f + " " + (float) 1e-5);
System.out.println((0.1 + 0.7) * 10 + " " + (int) ((0.1 + 0.7) * 10) + " " + 1.1 * 1.1 + " " + 2.675 * 100 + " " + 1 / 3.0f);
double avg = (double) 7 / 2; double bad = 7 / 2; System.out.println(avg + " " + bad + " " + (double) (7 / 2) + " " + 7 / 2 * 2.0);
int sumI = 0; double total = 0; for (int i = 1; i <= 10; i++) total += 0.1; System.out.println(total + " " + (total == 1.0));
System.out.println(Math.round(0.49999999999999994) + " " + Math.round(-0.5) + " " + Math.round(1e20) + " " + Math.round(Double.NaN) + " " + Math.round(2.5f) + " " + (int) Math.round(3.7));
System.out.println(Math.pow(2, 31) + " " + (int) Math.pow(2, 31) + " " + (long) Math.pow(2, 62) + " " + (int) Math.pow(3, 2) + " " + Math.sqrt(16) + " " + (int) Math.sqrt(17));
System.out.println(Math.random() < 1.0);
System.out.println(Math.ceil(7 / 2) + " " + Math.ceil(7 / 2.0) + " " + Math.floor(-0.5) + " " + Math.abs(-0.0) + " " + Math.max(Integer.MIN_VALUE, -5) + " " + Math.min(1.5f, 2));
System.out.println(Integer.MAX_VALUE + 1L + " " + (Integer.MAX_VALUE + 1) * 2L + " " + (byte) (127 + 1) + " " + (short) -32769 + " " + (char) -1 + 0 + " " + (int) (char) -1);
System.out.println(Long.MAX_VALUE + 1 == Long.MIN_VALUE); System.out.println((long) Integer.MIN_VALUE * -1); System.out.println(Long.MAX_VALUE / 2 * 3);
long ll = 123456789L * 1000; System.out.println(ll + " " + ll % 1000 + " " + -ll / 7 + " " + (-ll) % 7 + " " + (ll >> 3) + " " + (-ll >>> 60) + " " + (int) ll + " " + (double) ll + " " + (float) ll);
// dropped
System.out.println(1e15 + " " + 1e16 + " " + 123456789.123 + " " + 9.999999999999999e22 + " " + 1.0E-7 + " " + 0.00012345 + " " + 100.5f + " " + 1.0f / 0);
System.out.println(0.1 + 0.2 == 0.3); System.out.println(Math.abs(0.1 + 0.2 - 0.3) < 1e-9); System.out.println(3.0 * 1.1); System.out.println(1.1 + 2.2);
System.out.println((float) 0.1 + (float) 0.2); System.out.println(0.1f + 0.2); System.out.println(16777216f + 1); System.out.println(16777217); System.out.println((float) 16777217);
 }
}
