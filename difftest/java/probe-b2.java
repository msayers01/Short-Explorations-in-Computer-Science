import java.util.*;
public class Main {

 public static void main(String[] args) {
StringBuilder sb = new StringBuilder("hello");
sb.insert(0, "X"); System.out.println(sb); sb.insert(3, 42); System.out.println(sb); sb.insert(sb.length(), 'c'); System.out.println(sb);
sb.reverse(); System.out.println(sb); sb.deleteCharAt(0); System.out.println(sb); sb.setCharAt(0, 'Z'); System.out.println(sb);
sb.delete(1, 3); System.out.println(sb + " " + sb.length() + " " + sb.indexOf("l") + " " + sb.charAt(2));
sb.replace(0, 2, "AB"); System.out.println(sb); sb.setLength(2); System.out.println(sb + "|"); sb.append(1.5f).append((Object) null).append(new char[]{'q','r'}).append(2L); System.out.println(sb);
StringBuilder s2 = new StringBuilder(); s2.append('a' + 'b'); s2.append((char) ('a' + 1)); System.out.println(s2.toString());
System.out.println(new StringBuilder("abc").compareTo(new StringBuilder("abd")));
System.out.println(new StringBuilder("racecar").reverse().toString().equals("racecar"));
StringBuilder s3 = new StringBuilder("abc"); System.out.println(s3.equals(new StringBuilder("abc")));
try { new StringBuilder("ab").deleteCharAt(5); } catch (Exception e) { System.out.println(e); }
try { new StringBuilder("ab").charAt(5); } catch (Exception e) { System.out.println(e); }
try { new StringBuilder("ab").insert(5, "x"); } catch (Exception e) { System.out.println(e); }
StringBuilder s4 = new StringBuilder("aXbXc"); System.out.println(s4.lastIndexOf("X") + " " + s4.substring(1) + " " + s4.substring(1, 3) + " " + s4.isEmpty());
 }
}
