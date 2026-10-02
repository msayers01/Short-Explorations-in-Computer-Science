import java.util.*;
public class Main {

 public static void main(String[] args) {
System.out.println(Double.parseDouble("1f") + " " + Double.parseDouble(".5") + " " + Double.parseDouble("1.") + " " + Double.valueOf("NaN") + " " + Double.parseDouble("-Infinity") + " " + Double.parseDouble("1e-2d"));
try { Integer.parseInt("2147483648"); } catch (Exception e) { System.out.println(e); }
System.out.println(Integer.parseInt("-2147483648"));
try { Long.parseLong("9223372036854775808"); } catch (Exception e) { System.out.println(e); }
try { Double.parseDouble(""); } catch (Exception e) { System.out.println(e); }
try { Double.parseDouble(null); } catch (Exception e) { System.out.println(e); }
try { Integer.valueOf("1_000"); } catch (Exception e) { System.out.println(e); }
try { Integer.parseInt("12", 1); } catch (Exception e) { System.out.println(e); }
System.out.println(Boolean.parseBoolean("TRUE") + " " + Boolean.parseBoolean("yes") + " " + Integer.parseInt("0012") + " " + Integer.parseInt("+0"));
Object a = new Object(); Object b = a; System.out.println(a.getClass() == b.getClass()); String s = "x"; System.out.println(s.getClass() == "y".getClass()); System.out.println(s.getClass().getName() + " " + new int[0].getClass().getSimpleName() + " " + Integer.valueOf(1).getClass().getName());
 }
}
