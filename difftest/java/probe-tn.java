import java.util.*;
class A { public String toString() { return "A"; } } class B extends A { public String toString() { return "B"; } } class C extends A { }
public class Main { public static void main(String[] args) { boolean f = args.length == 0;
Object o = f ? 1 : "s"; System.out.println(o + " " + o.getClass().getSimpleName());
Object o2 = !f ? 1 : "s"; System.out.println(o2);
A a = f ? new B() : new C(); System.out.println(a);
Number n = f ? Integer.valueOf(3) : Double.valueOf(2.5); System.out.println(n);
Object o3 = f ? 'c' : "x"; System.out.println(o3 + " " + (f ? 1.5 : "z") + " " + (f ? true : 0));
System.out.println(f ? null : 5);
System.out.println(f ? 'a' : 0); System.out.println(f ? 'a' : 70000); System.out.println(f ? (Integer) 5 : (Double) 2.0);
System.out.println(f ? (Object) 1 : 2);
} }
