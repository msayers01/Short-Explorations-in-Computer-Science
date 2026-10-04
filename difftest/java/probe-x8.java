class FirstException extends Exception { }
class SecondException extends FirstException { }
public class Main {
    static int f(int x) throws FirstException {
        try {
            if (x == 1) throw new SecondException();
            if (x == 2) throw new FirstException();
            return x;
        } catch (SecondException e) {
            return -1;
        } finally {
            System.out.println("done " + x);
        }
    }
    public static void main(String[] args) {
        for (int i = 0; i < 3; i++) {
            try { System.out.println(f(i)); }
            catch (SecondException e) { System.out.println("S"); }
            catch (FirstException e) { System.out.println("F"); }
            catch (Exception e) { System.out.println("E"); }
        }
        try { int[] a = new int[1]; a[2] = 0; } catch (Exception e) { System.out.println("any"); }
        try { throw new Exception("plain"); } catch (Throwable t) { System.out.println(t.getMessage()); }
    }
}
