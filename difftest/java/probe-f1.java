import java.util.*;
public class Main {

 public static void main(String[] args) {
int[] a = {1}; String s = "" + a; System.out.println(s.startsWith("[I@")); System.out.println(new Object().toString().startsWith("java.lang.Object@")); System.out.println(new String[0].toString().startsWith("[Ljava.lang.String;@"));
List<Integer> li = new ArrayList<>(); li.add(100); li.add(100); li.add(200); li.add(200); System.out.println((li.get(0) == li.get(1)) + " " + (li.get(2) == li.get(3)) + " " + (li.get(2) > li.get(0)) + " " + (li.get(2) == 200));
Integer x = 200; int y = 200; System.out.println(x == y); Integer z = Integer.valueOf(200); System.out.println(x == z); System.out.println(x.equals(z)); Integer w = -128, v = -128; System.out.println(w == v); Integer u = -129, t = -129; System.out.println(u == t);
Character c1 = 'a', c2 = 'a'; System.out.println(c1 == c2); Character c3 = 'Ā', c4 = 'Ā'; System.out.println(c3 == c4);
Long l1 = 127L, l2 = 127L, l3 = 128L, l4 = 128L; System.out.println((l1 == l2) + " " + (l3 == l4));
Boolean b1 = true, b2 = true; System.out.println(b1 == b2);
Double d1 = 1.0, d2 = 1.0; System.out.println(d1 == d2); System.out.println(d1.equals(d2));
String s1 = "hel" + "lo", s2 = "hello"; String part = "hel"; String s3 = part + "lo"; System.out.println((s1 == s2) + " " + (s3 == s2) + " " + s3.equals(s2) + " " + (s3.intern() == s2));
HashMap<Integer, Integer> hm = new HashMap<>(); hm.put(1000, 1); hm.put(1000, 2); System.out.println(hm.size() + " " + hm.get(1000));
HashSet<String> words = new HashSet<>(); for (String wd : "to be or not to be that is the question".split(" ")) words.add(wd); System.out.println(words + " " + words.size() + " " + words.contains("be"));
HashMap<String, Integer> ages = new HashMap<>(); ages.put("Alice", 30); ages.put("Bob", 25); ages.put("Charlie", 35); ages.put("Diana", 28); ages.put("Eve", 22); System.out.println(ages); System.out.println(ages.keySet() + " " + ages.values() + " " + ages.entrySet());
HashMap<Double, String> dm = new HashMap<>(); dm.put(1.5, "a"); dm.put(-2.0, "b"); dm.put(0.1, "c"); System.out.println(dm);
HashMap<Boolean, String> bm = new HashMap<>(); bm.put(true, "t"); bm.put(false, "f"); System.out.println(bm);
HashMap<Long, String> lm = new HashMap<>(); lm.put(5000000000L, "x"); lm.put(-1L, "y"); lm.put(3L, "z"); System.out.println(lm);
HashSet<Character> chs = new HashSet<>(); for (char ch : "hello world".toCharArray()) chs.add(ch); System.out.println(chs);
HashMap<String, Integer> many = new HashMap<>(); String[] fruits = {"apple","banana","cherry","date","elderberry","fig","grape","honeydew","kiwi","lemon","mango","nectarine","orange","papaya","quince"}; for (int i = 0; i < fruits.length; i++) many.put(fruits[i], i); System.out.println(many);
many.remove("apple"); many.remove("kiwi"); many.put("zzz", 0); System.out.println(many.keySet());
HashSet<Integer> neg = new HashSet<>(List.of(-1, -100, 65536, 16, 1 << 20, 33)); System.out.println(neg);
 }
}
