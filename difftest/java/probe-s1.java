import java.util.*;
public class Main {

 public static void main(String[] args) {
Scanner sc = new Scanner(System.in);
int n = sc.nextInt(); System.out.println("n=" + n);
double d = sc.nextDouble(); System.out.println("d=" + d);
String w = sc.next(); System.out.println("w=" + w);
String rest = sc.nextLine(); System.out.println("rest=[" + rest + "]");
String line = sc.nextLine(); System.out.println("line=[" + line + "]");
long L = sc.nextLong(); System.out.println(L);
boolean b = sc.nextBoolean(); System.out.println(b);
System.out.println(sc.hasNextInt() + " " + sc.hasNextDouble() + " " + sc.hasNext());
String t = sc.next(); System.out.println(t);
System.out.println(sc.hasNextInt());
int sum = 0; while (sc.hasNextInt()) sum += sc.nextInt(); System.out.println(sum);
System.out.println(sc.hasNextLine()); System.out.println("[" + sc.nextLine() + "]"); System.out.println(sc.hasNextLine());
System.out.println("[" + sc.nextLine() + "]");
System.out.println(sc.hasNext() + " " + sc.hasNextLine());
 }
}
