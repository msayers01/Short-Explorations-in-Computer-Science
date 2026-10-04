import java.util.*;
public class Main {
    public static void main(String[] args) {
        Map<String, Integer> m = new LinkedHashMap<>();
        m.put("zebra", 1); m.put("apple", 2); m.put("mango", 3); m.put("apple", 9); m.remove("zebra"); m.put("zebra", 4);
        System.out.println(m + " " + m.keySet() + " " + m.values() + " " + m.size());
        Set<String> s = new LinkedHashSet<>(List.of("c", "a", "b", "a"));
        s.add("z"); s.add("a"); s.remove("c"); s.add("c");
        System.out.println(s + " " + s.contains("b"));
        Map<String, Integer> copy = new LinkedHashMap<>(m);
        copy.put("new", 0);
        for (Map.Entry<String, Integer> e : copy.entrySet()) System.out.print(e.getKey() + e.getValue() + " ");
        System.out.println();
        Object o = m; System.out.println(o instanceof Map);
    }
}
