import java.util.*;
class Student { String name; int grade; Student(String n, int g) { name = n; grade = g; } public String toString() { return name + ":" + grade; } }
class ByGrade implements Comparator<Student> { public int compare(Student a, Student b) { return Integer.compare(a.grade, b.grade); } }
class ByName implements Comparator<Student> { @Override public int compare(Student a, Student b) { return a.name.compareTo(b.name); } }
public class Main { public static void main(String[] args) {
List<Student> xs = new ArrayList<>(); xs.add(new Student("cy", 80)); xs.add(new Student("al", 90)); xs.add(new Student("bo", 80));
Collections.sort(xs, new ByGrade()); System.out.println(xs); xs.sort(new ByName()); System.out.println(xs); xs.sort(new ByGrade().reversed()); System.out.println(xs);
Collections.sort(xs, Collections.reverseOrder(new ByName())); System.out.println(xs + " " + Collections.max(xs, new ByGrade()) + " " + Collections.min(xs, new ByName()));
List<Integer> ns = new ArrayList<>(List.of(3, 1, 2)); ns.sort(Collections.reverseOrder()); System.out.println(ns); ns.sort(null); System.out.println(ns); Collections.sort(ns, Comparator.reverseOrder()); System.out.println(ns);
Integer[] arr = {5, 2, 8}; Arrays.sort(arr, Collections.reverseOrder()); System.out.println(Arrays.toString(arr));
String[] ws = {"pear", "Fig", "apple"}; Arrays.sort(ws, Comparator.naturalOrder()); System.out.println(Arrays.toString(ws));
Student[] st = xs.toArray(new Student[0]); Arrays.sort(st, new ByName()); System.out.println(Arrays.toString(st));
Comparator<Student> c = new ByGrade(); System.out.println(c.compare(xs.get(0), xs.get(1)));
} }
