import java.util.*;
class Pt { final int x, y; Pt(int x, int y) { this.x = x; this.y = y; } @Override public boolean equals(Object o) { if (this == o) return true; if (o == null || getClass() != o.getClass()) return false; Pt p = (Pt) o; return x == p.x && y == p.y; } @Override public int hashCode() { return Objects.hash(x, y); } public String toString() { return "Pt[" + x + "," + y + "]"; } }
public class Main { public static void main(String[] args) {
Set<Pt> ps = new HashSet<>(); ps.add(new Pt(1, 2)); ps.add(new Pt(1, 2)); ps.add(new Pt(2, 1)); ps.add(new Pt(-3, 70)); System.out.println(ps.size() + " " + ps.contains(new Pt(2, 1)) + " " + new Pt(1, 2).hashCode() + " " + Objects.hash(1, 2, 3) + " " + Objects.hash("a", null, 2.5) + " " + Objects.equals(null, null) + " " + Objects.equals("a", "a"));
System.out.println(ps);
Map<Pt, String> pm = new HashMap<>(); pm.put(new Pt(0, 0), "origin"); System.out.println(pm.get(new Pt(0, 0)));
System.out.println(Objects.toString(null) + " " + Objects.toString(null, "dflt") + " " + Objects.requireNonNullElse(null, "d") + " " + Objects.isNull(null) + " " + Objects.hashCode(null) + " " + Objects.hashCode("hi"));
try { Objects.requireNonNull(null, "must not be null"); } catch (NullPointerException e) { System.out.println(e); }
try { Objects.requireNonNull(null); } catch (NullPointerException e) { System.out.println(e); }
System.out.println(Character.toString(65) + Character.toString('b') + Character.toString(128512).length());
String s = "banana"; System.out.println(s.lastIndexOf("an", 2) + " " + s.lastIndexOf('a', 4) + " " + s.lastIndexOf("a", -1) + " " + s.lastIndexOf("na", 99) + " " + new StringBuilder(s).indexOf("an", 2) + " " + new StringBuilder(s).lastIndexOf("an", 2));
TreeSet<Integer> ts = new TreeSet<>(List.of(5, 1, 9, 3)); System.out.println(ts.higher(5) + " " + ts.lower(1) + " " + ts.floor(4) + " " + ts.ceiling(4) + " " + ts.ceiling(10) + " " + ts.first() + " " + ts.last() + " " + ts.headSet(5) + " " + ts.tailSet(5) + " " + ts.pollFirst() + " " + ts.pollLast() + " " + ts);
TreeMap<String, Integer> tm = new TreeMap<>(); tm.put("b", 2); tm.put("a", 1); tm.put("d", 4); System.out.println(tm.firstEntry() + " " + tm.lastEntry() + " " + tm.firstKey() + " " + tm.lastKey() + " " + tm.headMap("c") + " " + tm.tailMap("b") + " " + tm.higherKey("b") + " " + tm.lowerKey("a") + " " + tm.floorKey("c") + " " + tm.ceilingKey("c") + " " + tm.pollFirstEntry() + " " + tm);
System.out.println(new TreeMap<String,Integer>().firstEntry() + " " + new TreeSet<Integer>().pollFirst());
} }
