import java.util.*;
public class Main {
    public static void main(String[] args) {
        ArrayDeque<Integer> d = new ArrayDeque<>(); d.add(5); d.add(7); d.add(0);
        System.out.println(d.remove(0) + " " + d);
        Queue<Integer> q = new LinkedList<>(); q.add(4); q.add(8); q.add(0); System.out.println(q.remove(0) + " " + q);
        Deque<Integer> e = new ArrayDeque<>(); e.push(3); e.push(9); e.push(1); System.out.println(e.remove(1) + " " + e);
        Collection<Integer> col = new ArrayList<>(); col.add(4); col.add(8); col.add(0); System.out.println(col.remove(0) + " " + col);
    }
}
