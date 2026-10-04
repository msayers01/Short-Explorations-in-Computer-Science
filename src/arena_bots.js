/* Bot Arena: the starter bot and a finished Flood Fill bot, in each language. Plain text, so the page and test_arena.js use the same files.
   All four share one structure and the same function names (readTurn, isOpen, legalMoves, then main), so a student who switches language
   recognises it. Each starter reads one turn and prints the first move that does not crash; each solution picks the move whose reachable
   region is biggest. A line that starts with "LOG " is shown in the bot's log tab and ignored by the referee (these runtimes have no separate stderr).
   Exposed as window.TRONBOTS (browser) or module.exports (node). */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.TRONBOTS = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const templates = {
    python: `# A Tron bot. The arena gives this program the board on standard input (input())
# and it prints ONE move per turn: UP, DOWN, LEFT or RIGHT. In restart mode the arena
# runs it afresh every turn; in persistent mode it stays running, so variables kept
# outside the loop remember things from turn to turn. Either way: loop until the input ends.
# print("LOG ...") writes to your log tab; the referee ignores those lines.

def readTurn():
    line = input()
    while line == "TRON 1" or line == "END":     # lines the arena adds when a bot stays running
        line = input()
    if line == "" or line == "GAMEOVER":
        return None                              # no more turns
    width, height = map(int, line.split())       # line 1: board size
    you, alive = map(int, input().split())       # line 2: your number, players left
    heads = {}
    for _ in range(alive):                       # one line per player: x y player
        x, y, player = map(int, input().split())
        heads[player] = (x, y)
    grid = [input() for _ in range(height)]      # '.' empty, '#' wall, digit = a head
    return width, height, you, heads, grid

def isOpen(grid, width, height, x, y):
    return 0 <= x < width and 0 <= y < height and grid[y][x] == "."

def legalMoves(grid, width, height, x, y):
    moves = []
    for name, dx, dy in [("UP", 0, -1), ("DOWN", 0, 1), ("LEFT", -1, 0), ("RIGHT", 1, 0)]:
        if isOpen(grid, width, height, x + dx, y + dy):
            moves.append(name)
    return moves

while True:
    turn = readTurn()
    if turn is None:
        break
    width, height, you, heads, grid = turn
    x, y = heads[you]
    moves = legalMoves(grid, width, height, x, y)
    print("LOG I am at", x, "and can go", moves)
    print(moves[0] if moves else "UP")           # first safe move; boxed in? any move will do
`,
    cpp: `// A Tron bot. The arena gives this program the board on cin and it prints ONE move per
// turn: UP, DOWN, LEFT or RIGHT. In restart mode the arena runs it afresh every turn; in
// persistent mode it stays running, so variables kept outside the loop remember things from
// turn to turn. Either way: loop until the input ends.
// cout << "LOG ..." writes to your log tab; the referee ignores those lines.
// (This C++ is the site's teaching interpreter: arrays and char strings, no vector.)
#include <iostream>
#include <cstring>
#include <cstdlib>
using namespace std;

int width, height, you, alive;
int headX[5], headY[5];
char grid[40][41];                           // grid[y][x]
int dx[4] = {0, 0, -1, 1};                   // direction 0 UP, 1 DOWN, 2 LEFT, 3 RIGHT
int dy[4] = {-1, 1, 0, 0};

bool readTurn() {                            // false when there are no more turns
    char word[20];
    while (cin >> word) {
        if (strcmp(word, "TRON") == 0) cin >> word;      // "TRON 1" and "END" are lines the
        else if (strcmp(word, "END") != 0) {             // arena adds when a bot stays running
            if (strcmp(word, "GAMEOVER") == 0) return false;
            width = atoi(word);                  // line 1: board size
            cin >> height;
            cin >> you >> alive;                 // line 2: your number, players left
            for (int i = 0; i < alive; i++) {    // one line per player: x y player
                int x, y, player;
                cin >> x >> y >> player;
                headX[player] = x;
                headY[player] = y;
            }
            for (int i = 0; i < height; i++) {   // '.' empty, '#' wall, digit = a head
                cin >> grid[i];
            }
            return true;
        }
    }
    return false;
}

bool isOpen(int x, int y) {
    return x >= 0 && x < width && y >= 0 && y < height && grid[y][x] == '.';
}

int legalMoves(int x, int y, int moves[]) {  // fills moves, returns how many
    int count = 0;
    for (int d = 0; d < 4; d++) {
        if (isOpen(x + dx[d], y + dy[d])) {
            moves[count] = d;
            count++;
        }
    }
    return count;
}

void printMove(int d) {
    if (d == 0) cout << "UP" << endl;
    else if (d == 1) cout << "DOWN" << endl;
    else if (d == 2) cout << "LEFT" << endl;
    else cout << "RIGHT" << endl;
}

int main() {
    while (readTurn()) {
        int moves[4];
        int count = legalMoves(headX[you], headY[you], moves);
        cout << "LOG I am at " << headX[you] << " " << headY[you] << endl;
        if (count > 0) printMove(moves[0]);  // first safe move
        else printMove(0);                   // boxed in: any move will do
    }
    return 0;
}
`,
    java: `// A Tron bot. The arena gives this program the board on System.in and it prints ONE move
// per turn: UP, DOWN, LEFT or RIGHT. In restart mode the arena runs it afresh every turn; in
// persistent mode it stays running, so variables kept outside the loop remember things from
// turn to turn. Either way: loop until the input ends.
// System.out.println("LOG ...") writes to your log tab; the referee ignores those lines.
import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    static int width, height, you, alive;
    static int[] headX = new int[5];
    static int[] headY = new int[5];
    static String[] grid;

    static boolean readTurn(Scanner in) {        // false when there are no more turns
        String word = "END";
        while (word.equals("END") || word.equals("TRON")) {   // "TRON 1" and "END" are lines the
            if (!in.hasNext()) return false;                  // arena adds when a bot stays running
            word = in.next();
            if (word.equals("TRON")) in.next();
        }
        if (word.equals("GAMEOVER")) return false;
        width = Integer.parseInt(word);          // line 1: board size
        height = in.nextInt();
        you = in.nextInt();                      // line 2: your number, players left
        alive = in.nextInt();
        for (int i = 0; i < alive; i++) {        // one line per player: x y player
            int x = in.nextInt();
            int y = in.nextInt();
            int player = in.nextInt();
            headX[player] = x;
            headY[player] = y;
        }
        grid = new String[height];
        for (int i = 0; i < height; i++) {       // '.' empty, '#' wall, digit = a head
            grid[i] = in.next();
        }
        return true;
    }

    static boolean isOpen(int x, int y) {
        return x >= 0 && x < width && y >= 0 && y < height && grid[y].charAt(x) == '.';
    }

    static ArrayList<String> legalMoves(int x, int y) {
        ArrayList<String> moves = new ArrayList<>();
        if (isOpen(x, y - 1)) moves.add("UP");
        if (isOpen(x, y + 1)) moves.add("DOWN");
        if (isOpen(x - 1, y)) moves.add("LEFT");
        if (isOpen(x + 1, y)) moves.add("RIGHT");
        return moves;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        while (readTurn(in)) {
            ArrayList<String> moves = legalMoves(headX[you], headY[you]);
            System.out.println("LOG I am at " + headX[you] + " " + headY[you]);
            System.out.println(moves.size() > 0 ? moves.get(0) : "UP");   // first safe move; boxed in: any move
        }
    }
}
`,
    scheme: `; A Tron bot. The arena gives this program the board on standard input ((read) and
; (read-line)) and it prints ONE move per turn: UP, DOWN, LEFT or RIGHT. In restart mode the
; arena runs it afresh every turn; in persistent mode it stays running, so variables kept
; outside the loop remember things from turn to turn. Either way: loop until the input ends.
; (display "LOG ...") on a line of its own writes to your log tab.

(define width 0) (define height 0) (define you 0) (define alive 0)
(define heads '())                           ; a list of (player x y)
(define grid '())                            ; a list of strings

(define (readHeads n)                        ; one line per player: x y player
  (if (= n 0)
      '()
      (let* ((x (read)) (y (read)) (p (read)))
        (cons (list p x y) (readHeads (- n 1))))))

(define (readRows n)                         ; '.' empty, '#' wall, digit = a head
  (if (= n 0)
      '()
      (let ((row (read-line)))
        (cons row (readRows (- n 1))))))

(define (readTurn)                           ; #f when there are no more turns
  (let ((w (read)))
    (cond ((eof-object? w) #f)
          ((eq? w 'GAMEOVER) #f)
          ((eq? w 'TRON) (read) (readTurn))  ; "TRON 1" and "END" are lines the arena
          ((eq? w 'END) (readTurn))          ; adds when a bot stays running
          (else
           (set! width w)                    ; line 1: board size
           (set! height (read))
           (set! you (read))                 ; line 2: your number, players left
           (set! alive (read))
           (set! heads (readHeads alive))
           (read-line)                       ; read leaves the end of its line: skip it
           (set! grid (readRows height))
           #t))))

(define (isOpen x y)
  (and (>= x 0) (< x width) (>= y 0) (< y height)
       (string=? (string-ref (list-ref grid y) x) ".")))

(define (legalMoves x y)
  (append (if (isOpen x (- y 1)) '("UP") '())
          (if (isOpen x (+ y 1)) '("DOWN") '())
          (if (isOpen (- x 1) y) '("LEFT") '())
          (if (isOpen (+ x 1) y) '("RIGHT") '())))

(define (play)
  (if (readTurn)
      (let* ((me (cdr (assv you heads)))     ; my head: (x y)
             (moves (legalMoves (car me) (cadr me))))
        (display (if (null? moves) "UP" (car moves)))   ; first safe move; boxed in: any move
        (newline)
        (play))))
(play)
`
  };

  const solutions = {
    python: `# Flood Fill: for each safe move, count the cells the head could still reach if
# it stepped there (a breadth-first flood), and take the move with the most room.

DIRS = [("UP", 0, -1), ("DOWN", 0, 1), ("LEFT", -1, 0), ("RIGHT", 1, 0)]

def readTurn():
    line = input()
    while line == "TRON 1" or line == "END":
        line = input()
    if line == "" or line == "GAMEOVER":
        return None
    width, height = map(int, line.split())
    you, alive = map(int, input().split())
    heads = {}
    for _ in range(alive):
        x, y, player = map(int, input().split())
        heads[player] = (x, y)
    grid = [input() for _ in range(height)]
    return width, height, you, heads, grid

def isOpen(grid, width, height, x, y):
    return 0 <= x < width and 0 <= y < height and grid[y][x] == "."

def legalMoves(grid, width, height, x, y):
    moves = []
    for name, dx, dy in DIRS:
        if isOpen(grid, width, height, x + dx, y + dy):
            moves.append((name, x + dx, y + dy))
    return moves

def regionSize(grid, width, height, x, y):
    seen = {(x, y)}
    queue = [(x, y)]
    i = 0
    while i < len(queue):                        # a list and a position: no need for a deque
        cx, cy = queue[i]
        i += 1
        for name, dx, dy in DIRS:
            nx, ny = cx + dx, cy + dy
            if (nx, ny) not in seen and isOpen(grid, width, height, nx, ny):
                seen.add((nx, ny))
                queue.append((nx, ny))
    return len(seen)

while True:
    turn = readTurn()
    if turn is None:
        break
    width, height, you, heads, grid = turn
    x, y = heads[you]
    best, bestSize = "UP", -1
    for name, nx, ny in legalMoves(grid, width, height, x, y):
        size = regionSize(grid, width, height, nx, ny)
        print("LOG", name, "leaves room for", size)
        if size > bestSize:
            best, bestSize = name, size
    print(best)
`,
    cpp: `// Flood Fill: for each safe move, count the cells the head could still reach if
// it stepped there (a breadth-first flood), and take the move with the most room.
#include <iostream>
#include <cstring>
#include <cstdlib>
using namespace std;

int width, height, you, alive;
int headX[5], headY[5];
char grid[40][41];
int dx[4] = {0, 0, -1, 1};
int dy[4] = {-1, 1, 0, 0};
int seen[1600];
int queue[1600];

bool readTurn() {
    char word[20];
    while (cin >> word) {
        if (strcmp(word, "TRON") == 0) cin >> word;
        else if (strcmp(word, "END") != 0) {
            if (strcmp(word, "GAMEOVER") == 0) return false;
            width = atoi(word);
            cin >> height;
            cin >> you >> alive;
            for (int i = 0; i < alive; i++) {
                int x, y, player;
                cin >> x >> y >> player;
                headX[player] = x;
                headY[player] = y;
            }
            for (int i = 0; i < height; i++) {
                cin >> grid[i];
            }
            return true;
        }
    }
    return false;
}

bool isOpen(int x, int y) {
    return x >= 0 && x < width && y >= 0 && y < height && grid[y][x] == '.';
}

int regionSize(int x, int y) {
    for (int i = 0; i < width * height; i++) seen[i] = 0;
    int head = 0;
    int tail = 0;
    queue[tail] = y * width + x;
    tail++;
    seen[y * width + x] = 1;
    while (head < tail) {                    // an array and two positions: no need for a queue class
        int cx = queue[head] % width;
        int cy = queue[head] / width;
        head++;
        for (int d = 0; d < 4; d++) {
            int nx = cx + dx[d];
            int ny = cy + dy[d];
            if (isOpen(nx, ny) && seen[ny * width + nx] == 0) {
                seen[ny * width + nx] = 1;
                queue[tail] = ny * width + nx;
                tail++;
            }
        }
    }
    return tail;
}

void printMove(int d) {
    if (d == 0) cout << "UP" << endl;
    else if (d == 1) cout << "DOWN" << endl;
    else if (d == 2) cout << "LEFT" << endl;
    else cout << "RIGHT" << endl;
}

int main() {
    while (readTurn()) {
        int x = headX[you];
        int y = headY[you];
        int best = 0;
        int bestSize = -1;
        for (int d = 0; d < 4; d++) {
            if (!isOpen(x + dx[d], y + dy[d])) continue;
            int size = regionSize(x + dx[d], y + dy[d]);
            cout << "LOG direction " << d << " leaves room for " << size << endl;
            if (size > bestSize) {
                best = d;
                bestSize = size;
            }
        }
        printMove(best);
    }
    return 0;
}
`,
    java: `// Flood Fill: for each safe move, count the cells the head could still reach if
// it stepped there (a breadth-first flood), and take the move with the most room.
import java.util.ArrayList;
import java.util.Scanner;

public class Main {
    static int width, height, you, alive;
    static int[] headX = new int[5];
    static int[] headY = new int[5];
    static String[] grid;
    static int[] dx = {0, 0, -1, 1};
    static int[] dy = {-1, 1, 0, 0};
    static String[] names = {"UP", "DOWN", "LEFT", "RIGHT"};

    static boolean readTurn(Scanner in) {
        String word = "END";
        while (word.equals("END") || word.equals("TRON")) {
            if (!in.hasNext()) return false;
            word = in.next();
            if (word.equals("TRON")) in.next();
        }
        if (word.equals("GAMEOVER")) return false;
        width = Integer.parseInt(word);
        height = in.nextInt();
        you = in.nextInt();
        alive = in.nextInt();
        for (int i = 0; i < alive; i++) {
            int x = in.nextInt();
            int y = in.nextInt();
            int player = in.nextInt();
            headX[player] = x;
            headY[player] = y;
        }
        grid = new String[height];
        for (int i = 0; i < height; i++) {
            grid[i] = in.next();
        }
        return true;
    }

    static boolean isOpen(int x, int y) {
        return x >= 0 && x < width && y >= 0 && y < height && grid[y].charAt(x) == '.';
    }

    static int regionSize(int x, int y) {
        boolean[] seen = new boolean[width * height];
        int[] queue = new int[width * height];
        int head = 0;
        int tail = 0;
        queue[tail++] = y * width + x;
        seen[y * width + x] = true;
        while (head < tail) {                    // an array and two positions: no need for a Queue
            int cx = queue[head] % width;
            int cy = queue[head] / width;
            head++;
            for (int d = 0; d < 4; d++) {
                int nx = cx + dx[d];
                int ny = cy + dy[d];
                if (isOpen(nx, ny) && !seen[ny * width + nx]) {
                    seen[ny * width + nx] = true;
                    queue[tail++] = ny * width + nx;
                }
            }
        }
        return tail;
    }

    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        while (readTurn(in)) {
            int x = headX[you];
            int y = headY[you];
            String best = "UP";
            int bestSize = -1;
            for (int d = 0; d < 4; d++) {
                if (!isOpen(x + dx[d], y + dy[d])) continue;
                int size = regionSize(x + dx[d], y + dy[d]);
                System.out.println("LOG " + names[d] + " leaves room for " + size);
                if (size > bestSize) {
                    best = names[d];
                    bestSize = size;
                }
            }
            System.out.println(best);
        }
    }
}
`,
    scheme: `; Flood Fill: for each safe move, count the cells the head could still reach if
; it stepped there (a breadth-first flood), and take the move with the most room.

(define width 0) (define height 0) (define you 0) (define alive 0)
(define heads '())
(define grid '())

(define (readHeads n)
  (if (= n 0) '()
      (let* ((x (read)) (y (read)) (p (read)))
        (cons (list p x y) (readHeads (- n 1))))))
(define (readRows n)
  (if (= n 0) '() (let ((row (read-line))) (cons row (readRows (- n 1))))))
(define (readTurn)
  (let ((w (read)))
    (cond ((eof-object? w) #f)
          ((eq? w 'GAMEOVER) #f)
          ((eq? w 'TRON) (read) (readTurn))
          ((eq? w 'END) (readTurn))
          (else
           (set! width w)
           (set! height (read))
           (set! you (read))
           (set! alive (read))
           (set! heads (readHeads alive))
           (read-line)
           (set! grid (readRows height))
           #t))))

(define (isOpen x y)
  (and (>= x 0) (< x width) (>= y 0) (< y height)
       (string=? (string-ref (list-ref grid y) x) ".")))

; seen is a list of rows of #t / #f that we change with set-car! as the flood spreads.
(define (makeSeen)
  (map (lambda (y) (map (lambda (x) #f) (iota width))) (iota height)))
(define (seen? seen x y) (list-ref (list-ref seen y) x))
(define (mark! seen x y) (set-car! (list-tail (list-ref seen y) x) #t))

(define (regionSize x y)
  (let ((seen (makeSeen)))
    (mark! seen x y)
    (let loop ((queue (list (cons x y))) (count 1))   ; queue: cells still to visit
      (if (null? queue)
          count
          (let* ((cell (car queue)) (cx (car cell)) (cy (cdr cell)) (rest (cdr queue)) (new '()))
            (for-each
              (lambda (d)
                (let ((nx (+ cx (car d))) (ny (+ cy (cdr d))))
                  (if (and (isOpen nx ny) (not (seen? seen nx ny)))
                      (begin (mark! seen nx ny)
                             (set! new (cons (cons nx ny) new))))))
              (list (cons 0 -1) (cons 0 1) (cons -1 0) (cons 1 0)))
            (loop (append rest new) (+ count (length new))))))))

(define (try name nx ny best)                  ; best is (size . name)
  (if (isOpen nx ny)
      (let ((size (regionSize nx ny)))
        (if (> size (car best)) (cons size name) best))
      best))

(define (play)
  (if (readTurn)
      (let* ((me (cdr (assv you heads))) (x (car me)) (y (cadr me))
             (best (try "RIGHT" (+ x 1) y
                     (try "LEFT" (- x 1) y
                       (try "DOWN" x (+ y 1)
                         (try "UP" x (- y 1) (cons -1 "UP")))))))
        (display (cdr best))
        (newline)
        (play))))
(play)
`
  };

  return { templates, solutions, langs: ['python', 'cpp', 'java', 'scheme'] };
});
