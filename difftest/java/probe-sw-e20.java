public class Main {
    public static void main(String[] args) {
        int x = 1;
        int r = switch (x) { case "a" -> 1; default -> 0; };
    }
}
