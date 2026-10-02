import java.util.*;
class MyRt extends RuntimeException { MyRt(String m) { super(m); } }
class MyEx extends Exception { MyEx(String m) { super(m); } }
class Pt { int x; Pt(int x) { this.x = x; } public boolean equals(Object o) { return o != null && getClass() == o.getClass() && ((Pt) o).x == x; } public int hashCode() { return x; } }
class Animal { } class Dog extends Animal { } class Cat extends Animal { }
public class Main {
    public static void main(String[] args) {
        System.out.println(new MyRt("boom"));
        try { throw new MyRt("boom"); } catch (MyRt e) { System.out.println(e); }
        try { throw new MyRt("boom"); } catch (RuntimeException e) { System.out.println(e); }
        try { throw new MyEx("boom"); } catch (Exception e) { System.out.println(e + "|" + e.toString()); }
        System.out.println(new Pt(1).equals(new Pt(1)));
// dropped
// dropped
        Animal an = new Dog(); if (an instanceof Dog d) System.out.println("pattern");
// dropped
    }
}
