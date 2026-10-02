public class Main {
    static int depth(int[] a, int i) { return a[i] + depth(a, i + 1); }
    public static void main(String[] args) {
        int[] a = {1, 2, 3};
        System.out.println("before");
        depth(a, 0);
    }
}
