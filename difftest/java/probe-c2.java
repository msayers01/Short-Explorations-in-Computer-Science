import java.util.*;
public class Main {

 public static void main(String[] args) {
ArrayDeque<Integer> st = new ArrayDeque<>(); st.push(1); st.push(2); st.push(3); System.out.println(st + " " + st.peek() + " " + st.pop() + " " + st);
ArrayDeque<String> q = new ArrayDeque<>(); q.offer("a"); q.offer("b"); q.addFirst("z"); q.addLast("y"); System.out.println(q + " " + q.poll() + " " + q.pollLast() + " " + q.peekFirst() + " " + q.peekLast() + " " + q.size());
ArrayDeque<Integer> e = new ArrayDeque<>(); System.out.println(e.poll() + " " + e.peek() + " " + e.pollFirst());
try { e.pop(); } catch (Exception ex) { System.out.println(ex); }
// dropped
try { e.getFirst(); } catch (Exception ex) { System.out.println(ex); }
try { e.add(null); } catch (Exception ex) { System.out.println(ex); }
// dropped
HashMap<String, Integer> m = new HashMap<>(); m.put("one", 1); m.put("two", 2); m.put("three", 3); m.put("four", 4); m.put("five", 5);
System.out.println(m + " " + m.getOrDefault("six", 6) + " " + m);
for (String k : m.keySet()) System.out.print(k + " "); System.out.println(); for (int v : m.values()) System.out.print(v + " "); System.out.println();
System.out.println(m.put("one", 100) + " " + m.remove("two") + " " + m.remove("zz") + " " + m.containsKey("three") + " " + m.containsValue(4) + " " + m.size() + " " + m.putIfAbsent("one", 7) + " " + m.putIfAbsent("new", 7));
HashMap<Character, Integer> freq = new HashMap<>(); for (char ch : "mississippi".toCharArray()) freq.put(ch, freq.getOrDefault(ch, 0) + 1); System.out.println(freq);
HashMap<Integer, Integer> im = new HashMap<>(); for (int i = 20; i >= 0; i -= 3) im.put(i * 7, i); System.out.println(im);
HashSet<String> hs = new HashSet<>(List.of("zebra", "apple", "mango", "kiwi", "banana", "cherry")); System.out.println(hs);
// dropped
HashMap<String,Integer> big = new HashMap<>(); for (int i = 0; i < 20; i++) big.put("k" + i, i); System.out.println(big);
HashSet<Integer> hi = new HashSet<>(); for (int i = 0; i < 15; i++) hi.add(i * 13); System.out.println(hi);
for (Map.Entry<String,Integer> en : m.entrySet()) { en.setValue(en.getValue() * 2); } System.out.println(m);
// dropped
 }
}
