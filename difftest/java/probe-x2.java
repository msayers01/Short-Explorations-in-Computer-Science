class BrokenToolException extends Exception {
    BrokenToolException(String message) { super(message); }
}
public class Main {
    static void mine(int durability) throws BrokenToolException {
        if (durability <= 0) {
            throw new BrokenToolException("the pickaxe broke");
        }
        System.out.println("mined");
    }
    public static void main(String[] args) {
        mine(3);
    }
}
