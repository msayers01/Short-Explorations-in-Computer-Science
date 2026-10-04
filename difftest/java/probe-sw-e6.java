public class Main {
    public static void main(String[] args) {
        int x = 1;
        for (int i = 0; i < 2; i++) { int r = switch (x) { default -> { break; } }; }
    }
}
