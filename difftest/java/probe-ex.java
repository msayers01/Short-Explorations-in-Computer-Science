import java.util.*;
public class Main {

 public static void main(String[] args) {
String s = "abc"; StringBuilder sb = new StringBuilder("ab");
try { s.substring(5); } catch (Exception e) { System.out.println(e); }
try { s.substring(-1); } catch (Exception e) { System.out.println(e); }
try { s.substring(2, 1); } catch (Exception e) { System.out.println(e); }
try { s.substring(-1, 2); } catch (Exception e) { System.out.println(e); }
try { s.substring(1, 9); } catch (Exception e) { System.out.println(e); }
try { s.charAt(-1); } catch (Exception e) { System.out.println(e); }
try { s.charAt(3); } catch (Exception e) { System.out.println(e); }
try { sb.charAt(5); } catch (Exception e) { System.out.println(e); }
try { sb.charAt(-1); } catch (Exception e) { System.out.println(e); }
try { sb.deleteCharAt(5); } catch (Exception e) { System.out.println(e); }
try { sb.deleteCharAt(2); } catch (Exception e) { System.out.println(e); }
try { sb.setCharAt(2, 'x'); } catch (Exception e) { System.out.println(e); }
try { sb.insert(5, "x"); } catch (Exception e) { System.out.println(e); }
try { sb.insert(-1, 'x'); } catch (Exception e) { System.out.println(e); }
try { sb.delete(2, 1); } catch (Exception e) { System.out.println(e); }
try { sb.delete(-1, 1); } catch (Exception e) { System.out.println(e); }
try { sb.delete(3, 4); } catch (Exception e) { System.out.println(e); }
try { sb.replace(3, 4, "x"); } catch (Exception e) { System.out.println(e); }
try { sb.replace(1, 0, "x"); } catch (Exception e) { System.out.println(e); }
try { sb.substring(3); } catch (Exception e) { System.out.println(e); }
try { sb.substring(1, 5); } catch (Exception e) { System.out.println(e); }
try { Integer.parseInt(null); } catch (Exception e) { System.out.println(e); }
try { Long.parseLong(null); } catch (Exception e) { System.out.println(e); }
try { Integer.valueOf((String) null); } catch (Exception e) { System.out.println(e); }
try { Integer.parseInt("1", 99); } catch (Exception e) { System.out.println(e); }
try { Integer.parseInt("1", 1); } catch (Exception e) { System.out.println(e); }
try { new ArrayList<Integer>().subList(0, 2); } catch (Exception e) { System.out.println(e); }
try { new ArrayList<Integer>().add(3, 1); } catch (Exception e) { System.out.println(e); }
try { new ArrayList<Integer>().set(0, 1); } catch (Exception e) { System.out.println(e); }
try { new ArrayList<Integer>().remove(-1); } catch (Exception e) { System.out.println(e); }
try { new LinkedList<Integer>().set(0, 1); } catch (Exception e) { System.out.println(e); }
try { new LinkedList<Integer>().remove(0); } catch (Exception e) { System.out.println(e); }
try { new LinkedList<Integer>().add(2, 1); } catch (Exception e) { System.out.println(e); }
try { Arrays.copyOfRange(new int[2], 3, 4); } catch (Exception e) { System.out.println(e); }
try { Arrays.sort(new int[2], 1, 5); } catch (Exception e) { System.out.println(e); }
try { Arrays.sort(new int[2], 2, 1); } catch (Exception e) { System.out.println(e); }
try { "abc".repeat(-1); } catch (Exception e) { System.out.println(e); }
try { System.out.println(Math.round(0.49999999999999994) + " " + Math.round(-0.49999999999999994) + " " + Math.round(4503599627370497.0) + " " + Math.round(0.5) + " " + Math.round(-0.5) + " " + Math.round(-1.5) + " " + Math.round(1e19) + " " + Math.round(-1e19) + " " + Math.round(0.49999997f) + " " + Math.round(8388609.0f) + " " + Math.round(-2.5f)); } catch (Exception e) {}
try { System.out.println(Math.round(0.49999999999999994) + " " + Math.round(-0.49999999999999994) + " " + Math.round(4503599627370497.0) + " " + Math.round(0.5) + " " + Math.round(-0.5) + " " + Math.round(-1.5) + " " + Math.round(1e19) + " " + Math.round(-1e19) + " " + Math.round(0.49999997f) + " " + Math.round(8388609.0f) + " " + Math.round(-2.5f)); } catch (Exception e) {}
System.out.println(Double.MIN_VALUE + " " + -Double.MIN_VALUE + " " + Double.MIN_VALUE * 3 + " " + Float.MIN_VALUE);
try { Arrays.copyOfRange(new int[2], -1, 1); } catch (Exception e) { System.out.println(e); } try { Arrays.copyOfRange(new String[2], -1, 1); } catch (Exception e) { System.out.println(e); } int[] f = new int[5]; Arrays.fill(f, 1, 3, 9); System.out.println(Arrays.toString(f)); try { Arrays.fill(f, 3, 1, 0); } catch (Exception e) { System.out.println(e); } try { Arrays.fill(f, 0, 9, 0); } catch (Exception e) { System.out.println(e); }
 }
}
