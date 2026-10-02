import java.util.*;
public class Main {
    public static void main(String[] args) {
        ArrayDeque<Integer> d = new ArrayDeque<>(); d.add(5); d.add(1); d.add(7);
        System.out.println(d.remove(1) + " " + d);
// dropped
        Queue<Integer> q = new LinkedList<>(List.of(4, 1, 8)); System.out.println(q.remove(1) + " " + q);
        Collection<Integer> col = new ArrayList<>(List.of(4, 1, 8)); System.out.println(col.remove(1) + " " + col);
        Set<Integer> st = new HashSet<>(List.of(4, 1, 8)); System.out.println(st.remove(1) + " " + st);
        LinkedList<Integer> ll = new LinkedList<>(List.of(4, 1, 8)); System.out.println(ll.remove(1) + " " + ll);
// dropped
        Deque<Character> cs = new ArrayDeque<>(); for (char c : "({[".toCharArray()) cs.push(c); System.out.println(cs + " " + cs.pop() + " " + (cs.peek() == '{'));
    }
}
