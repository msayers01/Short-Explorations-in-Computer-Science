import java.util.*;
class ByLength implements Comparator<String> {
    public int compare(String a, String b) { return a.length() - b.length(); }
}
class Job implements Comparable<Job> {
    String name; int pri;
    Job(String name, int pri) { this.name = name; this.pri = pri; }
    public int compareTo(Job o) { return Integer.compare(pri, o.pri); }
    public String toString() { return name + pri; }
}
public class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        int[] xs = {5, 3, 8, 1, 9, 2, 7, 4, 6, 0};
        for (int x : xs) { pq.add(x); System.out.println(pq); }
        System.out.println(pq.peek() + " " + pq.size() + " " + pq.contains(7) + " " + pq.isEmpty());
        pq.remove(8); System.out.println(pq);
        pq.remove((Integer) 5); System.out.println(pq + " " + pq.remove((Integer) 55));
        StringBuilder sb = new StringBuilder();
        while (!pq.isEmpty()) { sb.append(pq.poll()).append(' '); System.out.println(pq); }
        System.out.println(sb + "" + pq.poll() + " " + pq.peek());
        PriorityQueue<Integer> maxq = new PriorityQueue<>(Collections.reverseOrder());
        maxq.addAll(List.of(4, 9, 2, 7, 7, 1));
        System.out.println(maxq + " " + maxq.poll() + " " + maxq);
        PriorityQueue<String> byLen = new PriorityQueue<>(new ByLength());
        for (String s : "pear fig banana kiwi apple plum".split(" ")) byLen.offer(s);
        System.out.println(byLen);
        for (String s : byLen) System.out.print(s + ",");
        System.out.println();
        while (byLen.size() > 0) System.out.print(byLen.remove() + " ");
        System.out.println();
        PriorityQueue<Integer> fromList = new PriorityQueue<>(List.of(9, 8, 7, 6, 5, 4, 3, 2, 1));
        System.out.println(fromList);
        PriorityQueue<Integer> copy = new PriorityQueue<>(fromList);
        copy.add(0); System.out.println(copy + " " + fromList);
        PriorityQueue<Job> jobs = new PriorityQueue<>();
        jobs.add(new Job("b", 2)); jobs.add(new Job("a", 1)); jobs.add(new Job("c", 2)); jobs.add(new Job("d", 0));
        System.out.println(jobs + " " + jobs.poll() + " " + jobs.poll() + " " + jobs.poll() + " " + jobs.poll() + " " + jobs.poll());
        try { new PriorityQueue<Integer>().remove(); } catch (NoSuchElementException e) { System.out.println("NSE " + e.getMessage()); }
        try { new PriorityQueue<Integer>().element(); } catch (NoSuchElementException e) { System.out.println("NSE2"); }
        try { PriorityQueue<Object> o = new PriorityQueue<>(); o.add(new Object()); } catch (ClassCastException e) { System.out.println("CCE"); }
        try { new PriorityQueue<Integer>().add(null); } catch (NullPointerException e) { System.out.println("NPE"); }
    }
}
