public class Main {
    public static void main(String[] args) {
        int x = 1;
        int r = switch (x) { case 1 -> { yield 1; System.out.println(); } default -> 0; };
    }
}
