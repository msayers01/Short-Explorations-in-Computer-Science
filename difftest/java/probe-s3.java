import java.util.*;
public class Main {

 public static void main(String[] args) {
Scanner sc = new Scanner(System.in);
int n = sc.nextInt(); int[] a = new int[n]; for (int i = 0; i < n; i++) a[i] = sc.nextInt(); System.out.println(Arrays.toString(a));
String name = sc.next(); double x = sc.nextDouble(); System.out.printf("%s %.1f%n", name, x);
try { sc.nextInt(); } catch (InputMismatchException e) { System.out.println("IME " + e.getMessage()); sc.next(); }
System.out.println(sc.nextInt());
try { sc.nextInt(); } catch (NoSuchElementException e) { System.out.println(e); }
 }
}
