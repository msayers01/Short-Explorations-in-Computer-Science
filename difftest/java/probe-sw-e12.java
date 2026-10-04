public class Main {
    public static void main(String[] args) {
        int x = 1;
        int r; int q = switch (x) { case 1 -> 1; default -> 2; }; System.out.println(r);
    }
}
