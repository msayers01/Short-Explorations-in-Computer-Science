class FirstException extends Exception { }
class SecondException extends Exception { }
public class Main {
    public static void main(String[] args) {
        try {
            throw new FirstException();
        } catch (FirstException e) {
            throw new SecondException();
        }
    }
}
