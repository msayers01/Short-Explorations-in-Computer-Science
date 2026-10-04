import java.util.*;

class Shape {
    static final int SIDES = switch ("tri") { case "tri" -> 3; case "sq" -> 4; default -> 0; };
    final String size;
    Shape(int n) {
        size = switch (n) { case 1, 2, 3 -> "small"; case 4, 5 -> "medium"; default -> "large"; };
    }
    String shout() {
        return switch (size) { case "small" -> "s!"; case "medium" -> "m!"; default -> "L!"; };
    }
}

public class Main {
    static int depth = 0;

    static int collatz(int n) {
        int steps = 0;
        while (n != 1) {
            n = switch (n % 2) { case 0 -> n / 2; default -> 3 * n + 1; };
            steps++;
        }
        return steps;
    }

    static String roman(int n) {
        StringBuilder sb = new StringBuilder();
        int[] vals = {10, 9, 5, 4, 1};
        String[] syms = {"X", "IX", "V", "IV", "I"};
        for (int i = 0; i < vals.length; i++) {
            while (n >= vals[i]) {
                sb.append(switch (i) { case 0 -> "X"; case 1 -> "IX"; case 2 -> "V"; case 3 -> "IV"; default -> "I"; });
                n -= vals[i];
            }
        }
        return sb.toString();
    }

    static int count(int a) {
        depth++;
        return switch (a) { case 0 -> 0; default -> { int r = 1 + count(a - 1); yield r; } };
    }

    public static void main(String[] args) {
        System.out.println(Shape.SIDES + " " + new Shape(2).size + " " + new Shape(5).shout() + " " + new Shape(9).shout());
        System.out.println(collatz(6) + " " + collatz(27));
        System.out.println(roman(14) + " " + roman(19) + " " + roman(8));
        System.out.println(count(6) + " " + depth);
        Scanner in = new Scanner(System.in);
        int n = in.nextInt();
        String word = in.next();
        System.out.println(switch (n) { case 1 -> "uno"; case 2 -> "dos"; default -> "mucho"; } + " " + switch (word) { case "hola" -> "hi"; default -> word; });
        int[] data = {3, 1, 2};
        int acc = 0;
        for (int x : data) acc += switch (x) { case 1 -> 10; case 2 -> 20; default -> 30; };
        System.out.println(acc);
        System.out.println((switch (data.length) { case 3 -> { String s = "three"; yield s.toUpperCase(); } default -> "?"; }).length());
    }
}
