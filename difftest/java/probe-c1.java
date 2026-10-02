import java.util.*;
public class Main {

 public static void main(String[] args) {
ArrayList<Integer> xs = new ArrayList<>(List.of(10, 20, 30, 1, 2)); xs.remove(1); System.out.println(xs); xs.remove(Integer.valueOf(1)); System.out.println(xs); System.out.println(xs.remove((Integer) 99)); int idx = 0; System.out.println(xs.remove(idx));
List<String> ss = new ArrayList<>(); ss.add("a"); ss.add("b"); System.out.println(ss.remove("a") + " " + ss + " " + ss.set(0, "z") + " " + ss);
try { xs.get(5); } catch (Exception e) { System.out.println(e); }
try { xs.remove(7); } catch (Exception e) { System.out.println(e); }
try { new ArrayList<Integer>().add(2, 5); } catch (Exception e) { System.out.println(e); }
try { List.of(1).add(2); } catch (Exception e) { System.out.println(e); }
ArrayList<Integer> ys = new ArrayList<>(); ys.add(3); ys.add(1); ys.add(2); ys.sort(null); System.out.println(ys + " " + ys.isEmpty() + " " + ys.lastIndexOf(2) + " " + ys.subList(1, 3)); ys.clear(); System.out.println(ys.size());
ys.addAll(List.of(5, 4, 6)); Collections.reverse(ys); System.out.println(ys); Collections.swap(ys, 0, 2); System.out.println(ys + " " + Collections.frequency(ys, 4));
Integer a = 127, b = 127, c = 128, d = 128; System.out.println((a == b) + " " + (c == d) + " " + c.equals(d) + " " + (c == 128) + " " + Integer.valueOf(128).equals(128) + " " + new ArrayList<>(List.of(1000)).get(0).equals(1000));
Long L = 5L; System.out.println(L.equals(5) + " " + L.equals(5L));
List<Integer> big = new ArrayList<>(); big.add(1000); big.add(1000); System.out.println(big.get(0) == big.get(1)); System.out.println(big.get(0).intValue() == big.get(1));
int[] arr = {5, 3, 9, 1}; Arrays.sort(arr); System.out.println(Arrays.toString(arr) + " " + Arrays.binarySearch(arr, 9) + " " + Arrays.binarySearch(arr, 4));
int[] fl = new int[4]; Arrays.fill(fl, 7); System.out.println(Arrays.toString(fl));
String[] strs = {"pear", "Apple", "fig"}; Arrays.sort(strs); System.out.println(Arrays.toString(strs)); Arrays.sort(arr, 0, 2);
double[] ds = {3.5, -1.0, 2}; Arrays.sort(ds); System.out.println(Arrays.toString(ds) + " " + Arrays.toString(new boolean[2]) + " " + Arrays.toString(new char[]{'a','b'}) + " " + Arrays.toString((int[]) null));
int[] cp = Arrays.copyOf(arr, 6); System.out.println(Arrays.toString(cp) + " " + Arrays.toString(Arrays.copyOfRange(arr, 1, 3)) + " " + Arrays.asList(1, 2, 3));

int[][] grid = new int[2][3]; grid[1][2] = 5; System.out.println(Arrays.deepToString(grid) + " " + grid[1].length); int[][] tri = new int[3][]; tri[0] = new int[1]; System.out.println(tri[1] + " " + tri[0].length);
for (int[] row : grid) { for (int v : row) System.out.print(v + " "); System.out.println(); }
char[][] board = new char[2][2]; System.out.println((int) board[0][0]); String[][] names = new String[1][2]; System.out.println(names[0][1]);
 }
}
