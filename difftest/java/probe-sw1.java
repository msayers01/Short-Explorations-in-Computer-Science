import java.util.*;
public class Main {
  static String name(int d) {
    return switch (d) {
      case 1, 7 -> "weekend";
      case 2, 3, 4, 5, 6 -> {
        String s = "week";
        yield s + "day";
      }
      default -> "unknown";
    };
  }
  static int old(String s) {
    int r = switch (s) {
      case "a":
      case "b":
        yield 1;
      case "c":
        yield 2;
      default:
        yield -1;
    };
    return r;
  }
  public static void main(String[] args) {
    for (int i = 0; i <= 7; i++) System.out.print(name(i) + " ");
    System.out.println();
    System.out.println(old("a") + " " + old("b") + " " + old("c") + " " + old("zz"));
    int x = 3;
    switch (x) {
      case 1 -> System.out.println("one");
      case 3 -> { System.out.println("three"); System.out.println("!"); }
      default -> System.out.println("other");
    }
    String t = "hi";
    int len = switch (t) { case "hi" -> 2; case "hello" -> 5; default -> t.length(); };
    System.out.println(len);
    char c = 'b';
    String k = switch (c) { case 'a' -> "A"; case 'b' -> "B"; default -> "?"; };
    System.out.println(k);
    // old style statement still works, with fallthrough
    switch (x) { case 3: System.out.print("3 "); case 4: System.out.print("4 "); break; case 5: System.out.print("5 "); }
    System.out.println();
    // nested, in an expression
    System.out.println("v=" + switch (x) { case 3 -> switch (len) { case 2 -> "two"; default -> "n"; }; default -> "z"; });
  }
}
