import java.util.*;

class ByLen implements Comparator<String> {
    public int compare(String a, String b) { return a.length() - b.length(); }
}

class ByLast implements Comparator<String> {
    public int compare(String a, String b) { return a.charAt(a.length() - 1) - b.charAt(b.length() - 1); }
}

public class Main {
    public static void main(String[] args) {
        // a comparator decides the order and which keys are the same
        TreeSet<String> s = new TreeSet<>(new ByLen());
        System.out.println(s.add("ccc") + " " + s.add("a") + " " + s.add("bb") + " " + s.add("dd") + " " + s.add("e"));
        System.out.println(s + " " + s.size() + " " + s.first() + " " + s.last());
        System.out.println(s.contains("zz") + " " + s.contains("zzzz") + " " + s.remove("xx") + " " + s);
        System.out.println(s.ceiling("zz") + " " + s.floor("zz") + " " + s.higher("zz") + " " + s.lower("zz") + " " + s.higher("zzz") + " " + s.lower("z"));
        System.out.println(s.headSet("zz") + " " + s.tailSet("zz"));
        System.out.println(s.pollFirst() + " " + s.pollLast() + " " + s);

        TreeMap<String, Integer> m = new TreeMap<>(new ByLast());
        m.put("apple", 1); m.put("tree", 2); m.put("lime", 3); m.put("cake", 4); m.put("pie", 5); m.put("zzz", 6);
        System.out.println(m);
        System.out.println(m.firstKey() + " " + m.lastKey() + " " + m.get("xe") + " " + m.get("qq") + " " + m.containsKey("ee"));
        System.out.println(m.floorKey("xf") + " " + m.ceilingKey("xf") + " " + m.higherKey("xe") + " " + m.lowerKey("xe"));
        System.out.println(m.headMap("xf") + " " + m.tailMap("xf"));
        System.out.println(m.remove("xe") + " " + m.remove("qq") + " " + m);
        for (Map.Entry<String, Integer> e : m.entrySet()) System.out.print(e.getKey() + "=" + e.getValue() + ";");
        System.out.println();

        // reverse order, and a comparator on a map built from another
        TreeMap<Integer, String> r = new TreeMap<>(Collections.reverseOrder());
        r.put(3, "c"); r.put(10, "j"); r.put(7, "g");
        System.out.println(r + " " + r.firstKey() + " " + r.headMap(7) + " " + r.tailMap(7));
        TreeSet<Integer> rs = new TreeSet<>(Collections.reverseOrder());
        rs.addAll(Arrays.asList(5, 1, 9, 3));
        System.out.println(rs + " " + rs.first() + " " + rs.ceiling(4) + " " + rs.floor(4));

        // format: positions, repeats, and %<
        System.out.println(String.format("%2$s-%1$s-%2$s|%s|%s", "a", "b"));
        System.out.printf("%1$5d|%1$-5d|%1$05d|%2$.2f|%2$8.3f%n", 42, 3.14159);
        System.out.println(String.format("%s %<s %<S %s", "x", "y"));
        System.out.println(String.format("%3$s %1$s %2$s", "a", "b", "c"));
        try { System.out.println(String.format("%3$s", "a", "b")); } catch (MissingFormatArgumentException e) { System.out.println("missing: " + e.getMessage()); }
        try { System.out.println(String.format("%<s", "a")); } catch (MissingFormatArgumentException e) { System.out.println("missing: " + e.getMessage()); }
    }
}
