public class Main {
    public static void main(String[] args) {
        int x = 1;
        int y = 5; int r = switch (x) { case 1 -> { int y = 2; yield y; } default -> 0; };
    }
}
