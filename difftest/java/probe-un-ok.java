public class Main {
    static int a(int n) {
        if (n > 0) return 1;
        n++;
        return n;
    }

    static int b(int n) {
        while (true) {
            if (n > 5) break;
            n++;
        }
        n *= 2;
        return n;
    }

    static int c(int n) {
        for (int i = 0; i < 10; i++) {
            if (i == 3) continue;
            if (i == 7) break;
            n += i;
        }
        outer:
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                if (j == 1) continue outer;
                if (i == 2) break outer;
                n += 100;
            }
        }
        return n;
    }

    static int d(int k) {
        switch (k) {
            case 1:
                return 10;
            case 2:
                k++;
                break;
            default:
                k--;
        }
        k += 5;
        return k;
    }

    static int e(int k) {
        try {
            if (k > 0) return 1;
            throw new IllegalStateException("x");
        } catch (IllegalStateException ex) {
            k = 99;
        } finally {
            k++;
        }
        return k;
    }

    static int f(int k) {
        do {
            k++;
            if (k > 3) break;
        } while (true);
        k += 1;
        return k;
    }

    static String g(int k) {
        String s = switch (k) { case 1 -> "one"; default -> { if (k > 5) yield "big"; yield "other"; } };
        return s;
    }

    public static void main(String[] args) {
        System.out.println(a(1) + " " + a(0) + " " + b(0) + " " + c(0) + " " + d(1) + " " + d(2) + " " + d(5) + " " + e(1) + " " + e(0) + " " + f(0) + " " + g(1) + g(9) + g(2));
        int x = 3;
        if (x > 2) { return; }
        System.out.println("never");
    }
}
