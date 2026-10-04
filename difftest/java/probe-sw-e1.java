public class Main {
    public static void main(String[] args) {
        int x = 1;
        int r = switch (x) { case 1 -> 1; case 2 -> 2; };
    }
}
