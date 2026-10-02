import java.util.*;
public class Main {

 public static void main(String[] args) {
System.out.println(Arrays.toString("a1b2c".split("(\\d)")));
System.out.println(Arrays.toString("a1b2c".split("(?<=\\d)")));
System.out.println(Arrays.toString("hello world  foo".split(" +")));
System.out.println(Arrays.toString("  leading".split("\\s+")));
System.out.println(Arrays.toString("a,b;c d".split("[,; ]")));
System.out.println(Arrays.toString("x--y--".split("--")));
System.out.println(Arrays.toString("abc".split("b", 5)));
System.out.println(Arrays.toString("a,b,c,d".split(",", 2)) + Arrays.toString("a,,b,,".split(",", 3)) + Arrays.toString(",,".split(",")) + ",,".split(",").length);
System.out.println(Arrays.toString("2023-01-15".split("-")) + Arrays.toString("Hello".split("")) + Arrays.toString("a\tb\nc".split("\\s")));
System.out.println("one1two22three".replaceAll("\\d+", " ") + "|" + "aaa".replaceFirst("a", "b") + "|" + "Hello World".replaceAll("(\\w+) (\\w+)", "$2 $1") + "|" + "a.b.c".replaceAll(".", "x") + "|" + "x$y".replace("$", "\\$"));
System.out.println("racecar".matches("r.*r") + " " + "abc".matches("ab") + " " + "12345".matches("\\d+") + " " + "A1".matches("[A-Z]\\d"));
// dropped
// dropped
 }
}
