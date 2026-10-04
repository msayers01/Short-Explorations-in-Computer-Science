import java.util.*;

public class Main {
    static int grade(int score) {
        return switch (score / 10) {
            case 10, 9 -> 4;
            case 8 -> 3;
            case 7 -> 2;
            case 6 -> 1;
            default -> 0;
        };
    }

    static String describe(Object o) {
        return o == null ? "null" : o.toString();
    }

    static int daysIn(String month, boolean leap) {
        return switch (month) {
            case "feb" -> {
                if (leap) yield 29;
                yield 28;
            }
            case "apr", "jun", "sep", "nov" -> 30;
            default -> 31;
        };
    }

    static String kind(char c) {
        return switch (c) {
            case 'a', 'e', 'i', 'o', 'u' -> "vowel";
            case ' ' -> "space";
            default -> {
                if (c >= '0' && c <= '9') yield "digit";
                yield "other";
            }
        };
    }

    public static void main(String[] args) {
        for (int s : new int[]{100, 95, 85, 72, 65, 10}) System.out.print(grade(s) + " ");
        System.out.println();
        System.out.println(daysIn("feb", true) + " " + daysIn("feb", false) + " " + daysIn("jun", false) + " " + daysIn("jan", false));
        for (char c : "a1 z".toCharArray()) System.out.print(kind(c) + ",");
        System.out.println();

        // types: the results come together as for ?:
        int k = 2;
        double d = switch (k) { case 1 -> 1; case 2 -> 2.5; default -> 0; };
        System.out.println(d);
        var v = switch (k) { case 1 -> 1; default -> 2L; };
        System.out.println(v);
        System.out.println(switch (k) { case 1 -> 'x'; default -> 'y'; });
        System.out.println(switch (k) { case 1 -> 1; default -> 2.0; });
        long big = switch (k) { case 2 -> Integer.MAX_VALUE; default -> 0; };
        System.out.println(big + 1);
        byte b = switch (k) { case 1 -> 10; default -> 20; };
        System.out.println(b);
        Object o = switch (k) { case 1 -> "one"; default -> 2; };
        System.out.println(o + " " + (o instanceof Integer));
        String text = "n=" + switch (k) { case 2 -> "two"; default -> "?"; } + "!";
        System.out.println(text);
        int sum = 10 + switch (k) { case 2 -> 5; default -> 0; } * 2;
        System.out.println(sum);

        // yield in loops, in nested switches, with fallthrough in the old style
        int total = switch (k) {
            case 2 -> {
                int t = 0;
                for (int i = 1; i <= 5; i++) {
                    if (i == 4) continue;
                    t += i;
                }
                yield t;
            }
            default -> -1;
        };
        System.out.println(total);
        int nested = switch (k) {
            case 2 -> {
                switch (total) {
                    case 11: yield 111;
                    default: break;
                }
                yield 222;
            }
            default -> 0;
        };
        System.out.println(nested);
        int fall = switch (k) {
            case 1:
            case 2:
                int w = k * 10;
                yield w + 1;
            case 3:
                yield 3;
            default:
                yield 0;
        };
        System.out.println(fall);

        // the same name in different arms, a variable assigned in the arms and used after
        String label;
        int code = switch (k) {
            case 1 -> { int x = 1; label = "a"; yield x; }
            case 2 -> { int x = 2; label = "b"; yield x; }
            default -> { label = "c"; yield 0; }
        };
        System.out.println(label + code);

        // arms that throw
        try {
            int bad = switch (k) { case 2 -> throw new IllegalStateException("two"); default -> 1; };
            System.out.println(bad);
        } catch (IllegalStateException e) {
            System.out.println("caught " + e.getMessage());
        }
        Integer boxed = 3;
        System.out.println(switch (boxed) { case 3 -> "three"; default -> "?"; });
        String nul = null;
        try {
            System.out.println(switch (nul) { case "a" -> 1; default -> 2; });
        } catch (NullPointerException e) {
            System.out.println("npe");
        }
        // statement switches with arrows keep working beside it
        switch (k) {
            case 1, 2 -> System.out.println("small");
            default -> System.out.println("big");
        }
        List<String> names = new ArrayList<>();
        for (int i = 0; i < 4; i++) names.add(switch (i % 3) { case 0 -> "zero"; case 1 -> "one"; default -> "two"; });
        System.out.println(names);
    }
}
