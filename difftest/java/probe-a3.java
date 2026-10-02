import java.util.*;
public class Main {

 public static void main(String[] args) {
System.out.println("a" + 1.0); System.out.println("a" + 1.5f); System.out.println("x" + null); String n = null; System.out.println(n + "y"); System.out.println(n);
Object o = null; System.out.println("o=" + o);
System.out.println(1.0E10); System.out.println(1e-5); System.out.println(Double.NaN); System.out.println(-0.0); System.out.println(0.0 == -0.0);
System.out.println(1e6); System.out.println(1e7); System.out.println(1234567.0); System.out.println(12345678.9); System.out.println(0.001); System.out.println(0.0001);
System.out.println(1.0/3); System.out.println(2.0/3); System.out.println(100.0); System.out.println(1e21); System.out.println(1e-300*1e-300); System.out.println(Double.MAX_VALUE); System.out.println(Double.MIN_VALUE);
System.out.println(-1.0/0); System.out.println(0.0/0); System.out.println(Math.sqrt(-1));
System.out.println(Double.compare(0.0, -0.0)); System.out.println(Double.NaN == Double.NaN); System.out.println(Double.isNaN(0.0/0));
System.out.println(1.0E-4 * 10); System.out.println(123456789012.0); System.out.println(4.35 * 100); System.out.println(3 * 0.1);
System.out.println(Math.pow(2, 0.5)); System.out.println(Math.pow(10, 15)); System.out.println(Math.pow(10, -3));
System.out.println(Math.round(2.4) + " " + Math.round(-2.6) + " " + Math.round(2.5f) + " " + Math.floor(-2.5) + " " + Math.ceil(-2.5) + " " + Math.rint(2.5) + " " + Math.rint(3.5));
System.out.println(Math.max(1, 2L) + " " + Math.max(1, 2.0) + " " + Math.min(-0.0, 0.0) + " " + Math.abs(-5) + " " + Math.abs(-5.0));
System.out.println(Math.cbrt(27) + " " + Math.hypot(3, 4) + " " + Math.log(Math.E) + " " + Math.log10(1000) + " " + Math.exp(1));
System.out.println(Math.floorDiv(-7, 2) + " " + Math.floorMod(-7, 2) + " " + Math.signum(-3.0) + " " + Math.toDegrees(Math.PI));
System.out.println(Math.sin(Math.PI / 6)); System.out.println(Math.atan2(1, 1));
System.out.println((Object) Math.round(2.5) instanceof Long);
System.out.println(Integer.MAX_VALUE + " " + Integer.MIN_VALUE + " " + Long.MAX_VALUE + " " + Byte.MIN_VALUE + " " + Short.MAX_VALUE + " " + Character.MAX_VALUE + 0);
System.out.println(Integer.toBinaryString(10) + " " + Integer.toBinaryString(-1) + " " + Integer.toHexString(-1) + " " + Integer.toString(255, 16) + " " + Integer.parseInt("ff", 16) + " " + Integer.bitCount(255));
System.out.println(Integer.parseInt("-42") + " " + Integer.parseInt("+7") + " " + Integer.valueOf("12") + " " + Long.parseLong("9999999999") + " " + Double.parseDouble("1e3") + " " + Integer.compare(3, 5) + " " + Integer.sum(2, 3));
System.out.println(Double.toString(5) + " " + String.valueOf(3.0f) + " " + Integer.toString(-0) + " " + String.valueOf('c') + " " + String.valueOf(true));
System.out.println((float) 1.1 + " " + (double) (float) 1.1 + " " + 1.1f * 2);
 }
}
