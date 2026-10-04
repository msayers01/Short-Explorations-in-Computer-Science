class Vault {
    Vault(int code) throws Exception {
        if (code != 42) throw new Exception("wrong code");
    }
}
public class Main {
    public static void main(String[] args) {
        Vault v = new Vault(42);
        System.out.println("open");
    }
}
