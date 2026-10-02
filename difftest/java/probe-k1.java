import java.util.*;
class InsufficientFundsException extends Exception { private double amt; public InsufficientFundsException(String m, double amt) { super(m); this.amt = amt; } public double getAmt() { return amt; } }
class MyRt extends RuntimeException { MyRt() { super(); } MyRt(String m) { super(m); } }
class Account { private double bal; void withdraw(double x) throws InsufficientFundsException { if (x > bal) throw new InsufficientFundsException("Need " + (x - bal) + " more", x - bal); bal -= x; } }
// dropped
class NoEq { int v; NoEq(int v) { this.v = v; } }
abstract class Animal implements Comparable<Animal> { protected String name; Animal(String n) { name = n; } abstract String speak(); public int compareTo(Animal o) { return name.compareTo(o.name); } public String toString() { return getClass().getSimpleName() + "(" + name + ")"; } }
class Dog extends Animal { Dog(String n) { super(n); } String speak() { return "Woof"; } }
class Cat extends Animal { Cat(String n) { super(n); } String speak() { return "Meow"; } public String toString() { return "Cat:" + super.toString(); } }
interface Greeter { String greet(String n); }
class Polite implements Greeter { public String greet(String n) { return "Hello, " + n; } }
public class Main {
    public static void main(String[] args) {
        Account a = new Account();
        try { a.withdraw(50); } catch (InsufficientFundsException e) { System.out.println(e.getMessage() + " " + e.getAmt() + " " + e); }
        try { throw new MyRt("boom"); } catch (MyRt e) { System.out.println(e + " | " + e.getMessage() + " | " + e.getClass().getName()); }
        try { throw new MyRt(); } catch (RuntimeException e) { System.out.println(e + " | " + e.getMessage()); }
// dropped
// dropped
// dropped
        Set<NoEq> ns = new HashSet<>(); ns.add(new NoEq(1)); ns.add(new NoEq(1)); System.out.println(ns.size());
// dropped
        Greeter g = new Polite(); System.out.println(g.greet("Ann") + " " + (g instanceof Greeter) + " " + (g instanceof Polite));
// dropped
// dropped
// dropped
// dropped
        try { throw new Error("err"); } catch (Throwable t) { System.out.println(t); }
        try { int[] arr = new int[2]; arr[2] = 0; } catch (RuntimeException e) { System.out.println(e.getClass().getSimpleName() + ": " + e.getMessage()); } finally { System.out.println("done"); }
        System.out.println(tryIt());
        throw new MyRt("uncaught here");
    }
    static int tryIt() { int x = 1; try { return x; } finally { x = 2; System.out.println("finally x=" + x); } }
}
