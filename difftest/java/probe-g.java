import java.util.*;
public class Main { public static void main(String[] args) {
System.out.println(new Object().toString());
HashMap<String, Integer> ages = new HashMap<>(); ages.put("Alice", 30); ages.put("Bob", 25); ages.put("Charlie", 35); ages.put("Diana", 28); ages.put("Eve", 22);
System.out.println(ages.entrySet());
for (Map.Entry<String,Integer> e : ages.entrySet()) System.out.print(e + " ");
System.out.println();
Set<Map.Entry<String,Integer>> es = ages.entrySet(); System.out.println(es.size());
Character a = 'a', b = 'a'; System.out.println(a == b); Character c = Character.valueOf('a'); System.out.println(a == c);
}}
