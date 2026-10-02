import java.util.*;
public class Main {

 public static void main(String[] args) {
int[] a = new int[3];
try { a[5] = 1; } catch (ArrayIndexOutOfBoundsException e) { System.out.println(e.getMessage()); System.out.println(e); }
try { a[-1] = 1; } catch (Exception e) { System.out.println(e); }
try { int z = 0; System.out.println(5 / z); } catch (ArithmeticException e) { System.out.println(e); }
try { int z = 0; System.out.println(5 % z); } catch (ArithmeticException e) { System.out.println(e); }
try { long z = 0; System.out.println(5L / z); } catch (ArithmeticException e) { System.out.println(e); }
System.out.println(5.0 / 0); System.out.println(5 % 0.0);
try { Integer.parseInt("abc"); } catch (NumberFormatException e) { System.out.println(e); }
try { Integer.parseInt(""); } catch (NumberFormatException e) { System.out.println(e); }
try { Integer.parseInt(" 42"); } catch (NumberFormatException e) { System.out.println(e); }
try { Integer.parseInt("3.5"); } catch (NumberFormatException e) { System.out.println(e); }
try { Integer.parseInt("99999999999"); } catch (NumberFormatException e) { System.out.println(e); }
try { Integer.parseInt(null); } catch (NumberFormatException e) { System.out.println(e); }
try { Double.parseDouble("x1"); } catch (NumberFormatException e) { System.out.println(e); }
try { Long.parseLong("12a"); } catch (NumberFormatException e) { System.out.println(e); }
System.out.println(Double.parseDouble(" 2.5 ") + " " + Integer.parseInt("-0") + " " + Integer.parseInt("2147483647") + " " + Double.parseDouble("1e400"));
try { int[] n = new int[-1]; } catch (Exception e) { System.out.println(e); }
try { String s = null; s.length(); } catch (NullPointerException e) { System.out.println(e.getMessage() != null); }
try { Object o = "x"; Integer i = (Integer) o; } catch (ClassCastException e) { System.out.println(e.getMessage()); }
try { throw new IllegalArgumentException("bad arg"); } catch (RuntimeException e) { System.out.println(e + " | " + e.getMessage()); }
try { throw new RuntimeException(); } catch (RuntimeException e) { System.out.println(e + " | " + e.getMessage()); }
try { throw new IllegalStateException("s", new RuntimeException("cause")); } catch (Exception e) { System.out.println(e.getCause()); }
try { try { throw new RuntimeException("inner"); } finally { System.out.println("fin"); } } catch (Exception e) { System.out.println("outer " + e.getMessage()); }
// dropped
try { new Scanner("").nextInt(); } catch (Exception e) { System.out.println(e); }
try { Object[] objs = new String[1]; objs[0] = 1; } catch (Exception e) { System.out.println(e); }
int[][] g = new int[2][2]; try { g[2][0] = 1; } catch (Exception e) { System.out.println(e); }
try { "abc".charAt(-1); } catch (Exception e) { System.out.println(e); }
try { new ArrayList<Integer>().get(0); } catch (Exception e) { System.out.println(e); }
try { new ArrayList<Integer>(List.of(1)).set(3, 1); } catch (Exception e) { System.out.println(e); }
try { new LinkedList<Integer>().get(0); } catch (Exception e) { System.out.println(e); }
try { new LinkedList<Integer>().removeFirst(); } catch (Exception e) { System.out.println(e); }
try { Integer n = null; int v = n; } catch (Exception e) { System.out.println(e.getClass().getName()); }
 }
}
