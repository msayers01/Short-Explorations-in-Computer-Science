import java.util.*;
public class Main {

 public static void main(String[] args) {
System.out.println("apple".compareTo("banana") + " " + "apple".compareTo("app") + " " + "A".compareTo("a") + " " + "abc".compareToIgnoreCase("ABD") + " " + "".compareTo("abc"));
String s = "banana"; System.out.println(s.indexOf('a', 2) + " " + s.indexOf("an", 3) + " " + s.lastIndexOf('a') + " 1" + " " + s.indexOf("") + " " + s.indexOf('a', 99) + " " + s.indexOf("a", -5));
System.out.println(Arrays.toString("a,b,,c,,".split(",")) + " " + Arrays.toString("a,b,,c,,".split(",", -1)) + " " + Arrays.toString("a1b22c333".split("\\d+")) + " " + Arrays.toString(" a b ".split(" ")) + " " + Arrays.toString("".split(",")) + " " + "".split(",").length);
System.out.println(Arrays.toString("a.b.c".split("\\.")) + Arrays.toString("a|b".split("\\|")) + Arrays.toString("abc".split("")) + Arrays.toString("a, b ,c".split("\\s*,\\s*")) + Arrays.toString("a:b:c".split(":", 2)));
System.out.println(Arrays.toString("1 2  3".split(" ")) + Arrays.toString(",a".split(",")));
System.out.println(String.format("[%5.2f] [%-5s] [%05d] [%,d] [%5s] [%-8.3f] [%+d] [%x] [%X] [%o] [%e] [%10.4e] [%s] [%S]", 3.14159, "ab", 42, 1234567, "abcdefg", 2.5, 5, 255, 255, 8, 0.000123, 12345.6789, null, "hi"));
System.out.println(String.format("%,d %,d %d %08.3f %.3s %c %b %%", -1234567, 999, -5, -3.14159, "abcdef", 'x', null));
System.out.println(String.format("%5d|%-5d|%05d|%,.3f|%.0f|%.0f|%.0f|%10s|", -42, -42, -42, 9876543.21, 0.5, 1.5, -2.5, true));
System.out.println(String.format("%d %s", 10000000000L, 1.0f) + "b a");
System.out.println(String.format("%.2f", 0.125) + " " + String.format("%.2f", 0.135) + " " + String.format("%.1f", 0.25) + " " + String.format("%.2f", 1e10) + " " + String.format("%.3f", Double.NaN) + " " + String.format("%5.1f", -0.04));
System.out.println("Hello".charAt(0) + "Hello".substring(1, 3) + " " + "hello".toUpperCase() + " " + "a-b-c".replace('-', '+') + " " + "a.b".replace(".", "!") + " " + "  x ".strip() + "|" + " ".isBlank() + "".isEmpty());
System.out.println("abc".contains("") + " " + "abc".startsWith("ab") + " " + "abc".endsWith("") + " " + "aaa".replaceAll("a*", "X") + " " + "a1b2".replaceAll("[0-9]", "#") + " " + "x".matches("[a-z]") + " " + 3);
System.out.println("ab".equals(null) + " " + "abc".indexOf('c') + " " + String.valueOf(new char[]{'o','k'}) + " " + new String(new char[]{'h','i'}) + " " + "hello".toCharArray().length + " " + "a,b".concat(",c") + " " + "Tab".charAt(1));
String a = "hi", b = "hi", c = new String("hi"); System.out.println((a == b) + " " + a.equals(c) + " " + "hello".hashCode() + " " + "".hashCode() + " " + "Aa".hashCode() + " " + "BB".hashCode());
try { "abc".substring(2, 1); } catch (Exception e) { System.out.println(e); }
try { "abc".charAt(3); } catch (Exception e) { System.out.println(e); }
try { "abc".substring(5); } catch (Exception e) { System.out.println(e); }
System.out.println(String.join(",", List.of("a", "b")) + " " + "x".repeat(0) + "|" + "abc".indexOf("bc", 1) + " " + "Hello World".split(" ")[1].length());
 }
}
