class FirstException extends Exception { }
class SecondException extends FirstException { }
public class Main {
    static void a() throws FirstException { throw new SecondException(); }
    public static void main(String[] args) {
        try {
            a();
        } catch (SecondException e) {
            System.out.println("second");
        }
    }
}
