import java.util.*;
public class Main {
    public static void main(String[] args) {
        ArrayDeque<Integer> d = new ArrayDeque<>(); d.add(5); d.add(7); d.add(0);
        System.out.println(d.remove(0) + " " + d);
        Queue<Integer> q = new LinkedList<>(); q.add(4); q.add(8); q.add(0); System.out.println(q.remove(0) + " " + q + " " + q.remove() + " " + q.element() + " " + q);
        Deque<Integer> e = new ArrayDeque<>(List.of(3, 9, 1)); System.out.println(e.remove(1) + " " + e + " " + e.offerFirst(7) + " " + e.offerLast(8) + " " + e);
        Iterator<Integer> it = e.descendingIterator(); while (it.hasNext()) System.out.print(it.next() + " "); System.out.println();
        try { d.add(null); } catch (NullPointerException ex) { System.out.println("NPE add"); }
        try { d.push(null); } catch (NullPointerException ex) { System.out.println("NPE push"); }
        try { new ArrayDeque<Integer>().remove(); } catch (NoSuchElementException ex) { System.out.println(ex); }
        try { new ArrayDeque<Integer>().element(); } catch (NoSuchElementException ex) { System.out.println(ex); }
        LinkedList<Integer> ll = new LinkedList<>(); ll.add(null); ll.add(2); System.out.println(ll + " " + ll.remove() + " " + ll.get(0) + " " + ll.remove(0) + " " + ll);
        try { ll.get(0); } catch (IndexOutOfBoundsException ex) { System.out.println(ex); }
        Queue<int[]> bfs = new ArrayDeque<>(); bfs.offer(new int[]{0, 0}); int n = 0; while (!bfs.isEmpty()) { int[] c = bfs.remove(); n++; if (c[0] < 3) { bfs.add(new int[]{c[0] + 1, 0}); } } System.out.println(n);
        List<Integer> xs = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6)); Iterator<Integer> it2 = xs.iterator(); while (it2.hasNext()) if (it2.next() % 2 == 0) it2.remove(); System.out.println(xs);
        Set<String> ss = new TreeSet<>(List.of("a", "bb", "c")); for (Iterator<String> i3 = ss.iterator(); i3.hasNext();) if (i3.next().length() > 1) i3.remove(); System.out.println(ss);
        try { xs.iterator().remove(); } catch (IllegalStateException ex) { System.out.println(ex); }
        ArrayDeque<Integer> st = new ArrayDeque<>(); st.push(1); st.push(2); st.push(3); System.out.println(st + " " + st.peek() + " " + st.pop() + " " + st.pollLast() + " " + st);
        System.out.println(new ArrayDeque<>(List.of(1, 2)).size() + " " + d.getClass().getSimpleName() + " " + ll.getClass().getName());
    }
}
