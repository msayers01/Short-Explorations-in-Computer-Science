class BrokenToolException extends Exception {
    BrokenToolException(String message) { super(message); }
}
public class Main {
    public static void main(String[] args) {
        try {
            System.out.println("mining");
        } catch (BrokenToolException e) {
            System.out.println("broke");
        }
    }
}
