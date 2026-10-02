import java.util.*;
class P { int v; P(int v) { this.v = v; } public boolean equals(Object o) { return o instanceof P && ((P) o).v == v; } public String toString() { return "P" + v; } }
public class Main {
    public static void main(String[] args) {
        List<P> ps = new ArrayList<>(); ps.add(new P(1)); ps.add(new P(2)); System.out.println(ps.contains(new P(2)) + " " + ps.indexOf(new P(2)) + " " + ps.remove(new P(1)) + " " + ps);
// dropped
        List<Integer> ys = new ArrayList<>(List.of(1, 2, 2, 3)); for (int i = 0; i < ys.size(); i++) if (ys.get(i) == 2) ys.remove(i); System.out.println(ys);
        try { for (Integer y : ys) if (y == 1) ys.remove(y); } catch (ConcurrentModificationException e) { System.out.println("CME " + e.getMessage()); }
        List<Integer> zs = new ArrayList<>(List.of(1, 2, 3)); for (Integer z : zs) { if (z == 2) zs.remove(z); } System.out.println(zs);
        List<List<Integer>> nested = new ArrayList<>(); for (int i = 0; i < 3; i++) { nested.add(new ArrayList<>()); for (int j = 0; j <= i; j++) nested.get(i).add(j); } System.out.println(nested);
        List<int[]> arrs = new ArrayList<>(); arrs.add(new int[]{1, 2}); System.out.println(arrs.get(0)[1] + " " + arrs.size());
// dropped
        LinkedList<Integer> ll = new LinkedList<>(); ll.add(1); ll.addFirst(0); ll.addLast(2); ll.add(1, 9); System.out.println(ll + " " + ll.getFirst() + " " + ll.getLast() + " " + ll.removeFirst() + " " + ll.removeLast() + " " + ll + " " + ll.peek() + " " + ll.indexOf(1));
        ArrayList<String> names = new ArrayList<>(Arrays.asList("bob", "Al", "carl", "al")); Collections.sort(names); System.out.println(names + " " + Collections.max(names) + " " + Collections.min(names));
        names.add(0, "first"); names.set(names.size() - 1, "last"); System.out.println(names + " " + names.contains("Al") + " " + String.join("|", names));
// dropped
    }
}
