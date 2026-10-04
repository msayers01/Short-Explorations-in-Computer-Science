import java.util.*;
class NoRoomException extends Exception {
    private final int missing;
    NoRoomException(String message, int missing) { super(message); this.missing = missing; }
    int getMissing() { return missing; }
}
class BadItemException extends RuntimeException {
    BadItemException(String message) { super(message); }
}
class Chest {
    private final int size;
    private final List<String> items = new ArrayList<>();
    Chest(int size) { this.size = size; }
    void put(String item) throws NoRoomException {
        if (item == null || item.isEmpty()) throw new BadItemException("no item given");
        if (items.size() >= size) throw new NoRoomException("chest is full", items.size() + 1 - size);
        items.add(item);
    }
    int count() { return items.size(); }
}
public class Main {
    static void fill(Chest c, String... things) throws NoRoomException {
        for (String t : things) c.put(t);
    }
    static String attempt(Chest c, String item) {
        try {
            c.put(item);
            return "stored " + item;
        } catch (NoRoomException e) {
            return e.getMessage() + " (" + e.getMissing() + " too many)";
        } catch (BadItemException e) {
            return "bad: " + e.getMessage();
        } finally {
            System.out.println("tried " + item);
        }
    }
    public static void main(String[] args) throws Exception {
        Chest c = new Chest(2);
        System.out.println(attempt(c, "dirt"));
        System.out.println(attempt(c, ""));
        System.out.println(attempt(c, "sand"));
        System.out.println(attempt(c, "glass"));
        try {
            fill(c, "a");
        } catch (Exception e) {
            System.out.println("caught " + e);
            try {
                throw new IllegalStateException("wrapped", e);
            } catch (IllegalStateException w) {
                System.out.println(w.getMessage() + " / " + w.getCause().getMessage());
            }
        }
        try {
            fill(c, "b");
        } catch (NoRoomException | BadItemException e) {
            System.out.println("multi " + e.getMessage());
        }
        Object o = c;
        try { Integer n = (Integer) o; } catch (RuntimeException e) { System.out.println("runtime"); }
        fill(c, "last");
    }
}
