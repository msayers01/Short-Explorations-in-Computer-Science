import java.util.*;
public class Main {

 public static void main(String[] args) {
System.out.printf("%s %s %s %s%n", 1.0, 1e10, 0.1f, List.of(1, 2));
System.out.printf("%.2f %.2f %d %c %b %b%n", 1.5f, 2.345, 5L, 65, "x", null);
System.out.printf("[%10.3e] [%-10d] [%-6b] [%6c] [%.1f] [%.1f] [%.1f] [%.1f]%n", 1234.5, 42, true, 'z', 0.05, 0.15, 0.25, 0.35);
System.out.printf("%.2f %.2f %.2f %.2f %.2f%n", 2.675, 1.005, 0.125, 0.375, 10.555);
System.out.printf("%.3f %.0f %.0f %.0f %.0f%n", 1.0005, 0.5, 1.5, 2.5, 3.5);
System.out.printf("%,.2f %,d %,d %(d %+.1f % d%n", -1234.5, 0, 100, -5, 3.0, 42);
System.out.printf("%08.2f|%-8.2f|%8s|%-8s|%.3s|%n", -3.5, 3.5, "abc", "abc", "abcdef");
System.out.printf("%5.1f%%%n", 12.345);
System.out.printf("%x %X %o %h%n", -1, 255L, -8, "hi");
System.out.printf("%e %.0e %g%n", 0.0, 12345.0, 0.0001234);
System.out.printf("Name: %-10s Age: %3d%n", "Bob", 7);
System.out.printf("%10.4f|%n", Math.PI);
System.out.printf("%s%n", (Object) null);
System.out.printf("%d%%%n", 50);
System.out.printf("%.2f%n", 1e-10);
System.out.printf("%.2f %s%n", Double.POSITIVE_INFINITY, Double.NaN);
System.out.printf("%5s|%-5s|%5d|%n", null, true, -1);
System.out.printf("%s %S %s%n", 'c', "mixed Case", new int[0].length);
System.out.println(String.format("%03d:%02d", 7, 5) + " " + String.format("%.1f", 99.95) + " " + String.format("%.1f", 99.94) + " " + String.format("%6.2f", 3.14159));
System.out.println(String.format("%.2f", 0.005) + " " + String.format("%.2f", 0.015) + " " + String.format("%.2f", 0.025) + " " + String.format("%.2f", 1.115) + " " + String.format("%.4f", 1.00005));
System.out.println(String.format("%.15f", 0.1) + " " + String.format("%.20f", 0.1) + " " + String.format("%.3f", 123456789.98765));
System.out.println(String.format("%,d", Long.MIN_VALUE) + " " + String.format("%d", Integer.MIN_VALUE) + " " + String.format("%x", Long.MIN_VALUE) + " " + String.format("%,.0f", 1e15));
System.out.println(String.format("%10.2e", 123.456) + "|" + String.format("%.3e", 9.9995) + "|" + String.format("%e", 1e-310));
 }
}
