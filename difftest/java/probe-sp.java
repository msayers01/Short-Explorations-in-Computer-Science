import java.util.*;
public class Main { public static void main(String[] args) {
String[] in = {"a1b2c", ",,", "a,b,,", "", " ", "a", "1 2  3", ",a,", "x--y--", "a(b)c", "aXbXc", "2023-01-15"};
String[] res = {"(\\d)", ",", "(,)", "\\s+", "([-])", "\\(|\\)", "[(]", "(?:X)", "(X)|(-)", "b|", " ", "", "x*", "|", ".", "\\."};
for (String s : in) for (String r : res) System.out.println(s + " / " + r + " -> " + Arrays.toString(s.split(r)) + " " + s.split(r).length + " " + Arrays.toString(s.split(r, -1)) + Arrays.toString(s.split(r, 2)));
}}
