public class Main {
    public static void main(String[] args) {
        int x = 1;
        String s = switch (x) { case 1 -> "a"; default -> "b"; }; int n = s;
    }
}
