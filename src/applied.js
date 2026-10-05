/* Where it is used: the #/real-world page, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
   For each main idea the courses teach, where it matters in practice: examples tagged by field, jobs that use it daily, the lessons
   that teach it, and an optional note for teachers. Readers: students (grades 8-12) and staff who may never have programmed.
   - TOPICS: [{ id, title, idea, uses: [{ f, t }], jobs: [...], learn: ['<courseId>/<lesson>'], teach? }]
     f is a key of FIELDS; learn entries become links '#/<courseId>/<lesson>' labelled from window.COURSES at page time (a link to a
     course or lesson that is not loaded is left out). test: every learn entry must name a real lesson that teaches the idea.
   - ids are also element ids (app.js scrolls to '#/real-world/<id>'), so they must not clash with other ids on the page.
   - every string here is our own constant text and is inserted as text (no html), so a search term can never become markup.
   Check every fact before adding one; leave out anything uncertain. No invented statistics. */
(function () {
  const FIELDS = [
    { key: 'swe', label: 'Software engineering' },
    { key: 'sec', label: 'Cybersecurity' },
    { key: 'eng', label: 'Engineering & science' },
    { key: 'data', label: 'Data & AI' },
    { key: 'games', label: 'Games & graphics' },
    { key: 'web', label: 'Web & mobile' }
  ];

  const TOPICS = [
    {
      id: 'values-and-types', title: 'Values, types and variables',
      idea: 'Every value has a type (a whole number, a decimal, text, true or false) and takes a fixed amount of memory; a variable is a name for a value.',
      uses: [
        { f: 'eng', t: 'In 1996 the first Ariane 5 rocket was destroyed shortly after launch because its guidance software converted a 64-bit floating-point number into a 16-bit whole number that was too small to hold it.' },
        { f: 'swe', t: 'Many systems store the time as a count of seconds since 1 January 1970. A signed 32-bit counter runs out on 19 January 2038 (the "Year 2038 problem"), so software and devices are moving to 64-bit counters.' },
        { f: 'web', t: 'Shops and banks store money as a whole number of cents, or in a special decimal type, because binary floating point cannot hold 0.1 exactly: 0.1 + 0.2 prints 0.30000000000000004 in Python and JavaScript.' },
        { f: 'sec', t: 'Integer overflow is a known cause of security holes: a size calculation wraps around to a small number, the program reserves too little memory, and later writes run past the end of it.' },
        { f: 'data', t: 'Data engineers choose column types on purpose: 32-bit numbers take half the memory of 64-bit ones, which matters when a table has hundreds of millions of rows.' }
      ],
      jobs: ['Software developer', 'Embedded engineer', 'Data engineer', 'Flight software engineer'],
      learn: ['python/1', 'scratch/2', 'cpp/1', 'java/1', 'java/3', 'cpp/9'],
      teach: 'Hook: show 0.1 + 0.2 in the Python Code Lab. Ask: why would a bank not store your balance like that? What should a program do when a count goes past the biggest number its type can hold?'
    },
    {
      id: 'conditions-and-logic', title: 'Conditions and Boolean logic',
      idea: 'Questions with a true-or-false answer, combined with and, or and not, decide what a program does next.',
      uses: [
        { f: 'eng', t: 'Every processor is built from logic gates, tiny circuits that compute AND, OR and NOT on electrical signals. A modern chip has billions of them.' },
        { f: 'sec', t: 'Firewall rules are conditions checked in order: in many firewalls (Linux iptables, for example) the first rule that matches a packet decides whether it is let through or dropped, so the order of the rules matters.' },
        { f: 'sec', t: 'Many access-control bugs are logic bugs: an or where an and was meant, or a missing not, lets the wrong person in. "Broken access control" is first on the OWASP Top 10 list of web application risks, in 2021 and again in 2025.' },
        { f: 'data', t: 'Database queries pick rows with Boolean conditions, such as WHERE age >= 13 AND country = \'CA\'.' },
        { f: 'web', t: 'Search boxes in libraries and many websites let you combine words with AND, OR and NOT.' }
      ],
      jobs: ['Chip designer', 'Security engineer', 'Database developer', 'Software tester'],
      learn: ['scratch/4', 'python/3', 'computer/7', 'cpp/2', 'java/2', 'lisp/3', 'math/1'],
      teach: 'Discussion: write the rule "you may enter if you have a ticket, or you are staff and it is not Sunday" as a condition. Where would brackets change the meaning? Who gets in by mistake if you get it wrong?'
    },
    {
      id: 'loops', title: 'Loops and repetition',
      idea: 'A loop does the same steps again and again; the accumulator pattern turns many values into one answer.',
      uses: [
        { f: 'games', t: 'Every video game runs a game loop: read the controls, update the world, draw a frame, many times a second.' },
        { f: 'eng', t: 'The small computers inside thermostats, washing machines and cars run a loop that never ends: read the sensors, decide, set the outputs, repeat.' },
        { f: 'sec', t: 'Password-guessing attacks are loops over lists of likely passwords. Defences slow each guess down (password hashing such as bcrypt) or limit how many tries are allowed.' },
        { f: 'swe', t: 'A server is a loop at heart: wait for a request, answer it, wait for the next one.' },
        { f: 'data', t: 'Totals, averages and counts in a report are the accumulator pattern run over rows of data.' }
      ],
      jobs: ['Game developer', 'Embedded engineer', 'Backend developer', 'Data analyst'],
      learn: ['scratch/3', 'python/4', 'cpp/3', 'java/3'],
      teach: 'Hook: a game drawing 60 frames a second runs its loop 216,000 times in an hour. What has to happen inside one turn of that loop?'
    },
    {
      id: 'functions', title: 'Functions and breaking a problem down',
      idea: 'A function is a named piece of a program with inputs and an output; large programs are built from many small ones.',
      uses: [
        { f: 'swe', t: 'Programs are built on libraries, collections of functions written and tested once and used by many programs. Calling math.sqrt in Python is using a function someone else wrote.' },
        { f: 'web', t: 'Web services offer functions over the network, called an API: a weather app sends a city to a server and gets a forecast back.' },
        { f: 'sec', t: 'Shared functions spread problems as well as work: in December 2021 the Log4Shell flaw in Log4j, a widely used Java logging library, put a very large number of programs at risk at once.' },
        { f: 'eng', t: 'Engineers test each function on its own (a unit test) before joining them, the way a car\'s parts are tested before it is assembled.' },
        { f: 'data', t: 'Spreadsheet formulas such as SUM and AVERAGE are functions, and a data pipeline is a chain of functions, each taking a table and returning a new one.' }
      ],
      jobs: ['Software developer', 'API developer', 'Library maintainer', 'Test engineer'],
      learn: ['scratch/7', 'python/8', 'cpp/4', 'java/4', 'lisp/2'],
      teach: 'Activity: have students list the "functions" in a recipe or a morning routine, with their inputs and outputs. Which ones are used more than once?'
    },
    {
      id: 'lists-and-arrays', title: 'Lists and arrays',
      idea: 'Many values in a row under one name, each reached by its position (its index), counting from 0.',
      uses: [
        { f: 'games', t: 'An image is an array of pixels: a 1920 × 1080 screen has 2,073,600 of them, each stored as numbers for red, green and blue.' },
        { f: 'data', t: 'Machine learning works on large arrays of numbers (often called tensors). Libraries such as NumPy and PyTorch are built around fast operations on whole arrays.' },
        { f: 'eng', t: 'Measurements are stored as arrays: CD audio is 44,100 samples a second for each ear, and a sensor log is one reading after another.' },
        { f: 'sec', t: 'Reading or writing past the end of an array is a classic C and C++ security hole: the 1988 Morris worm spread partly by overflowing an array in a network service, and the 2014 Heartbleed bug read past the end of one.' }
      ],
      jobs: ['Graphics programmer', 'Machine-learning engineer', 'Signal-processing engineer', 'C/C++ developer'],
      learn: ['scratch/6', 'python/6', 'cpp/7', 'modern/2', 'dsa/1'],
      teach: 'Hook: open any photo and zoom in until you see squares. Each square is one item of an array. How many numbers does one photo hold?'
    },
    {
      id: 'strings-and-text', title: 'Strings and text',
      idea: 'Text is a sequence of characters, each stored as a number; programs search it, slice it, split it and build it.',
      uses: [
        { f: 'sec', t: 'Injection attacks (SQL injection, cross-site scripting) happen when text typed by a user is pasted into a command or a page and treated as code. The fix is to keep data and code apart, for example with parameterized database queries.' },
        { f: 'web', t: 'Every web page arrives as text (HTML), and every form you submit is text that the server must check before it trusts it.' },
        { f: 'eng', t: 'DNA is stored and searched as long strings of the letters A, C, G and T; much of bioinformatics is string searching and comparison.' },
        { f: 'swe', t: 'Unicode gives a number to every character in the world\'s writing systems, and UTF-8, the encoding used by most web pages, stores those numbers as bytes.' },
        { f: 'data', t: 'Log files, a server\'s diary of what it did, are lines of text that engineers split and search to find out what went wrong.' }
      ],
      jobs: ['Web developer', 'Security analyst', 'Bioinformatician', 'Localization engineer'],
      learn: ['scratch/11', 'python/7', 'computer/6', 'cpp/8', 'modern/1', 'java/2', 'java/7'],
      teach: 'Discussion: a form asks for your name. What should a program do if someone types a name with an apostrophe (O\'Brien), an accent (José), or a piece of code?'
    },
    {
      id: 'hashing', title: 'Dictionaries, maps and hashing',
      idea: 'Store pairs (key and value) and find a key in about one step, by computing a number from it, called a hash.',
      uses: [
        { f: 'swe', t: 'Python\'s dict, Java\'s HashMap, C++\'s unordered_map and JavaScript\'s Map are all hash tables, and most programs use one somewhere.' },
        { f: 'swe', t: 'Git names every saved version of every file by a hash of its contents (SHA-1, with SHA-256 as a newer option), so identical files are stored once and any change is noticed.' },
        { f: 'sec', t: 'A website should never store your password, only a slow, salted hash of it (bcrypt, scrypt or Argon2). When you log in, it hashes what you typed and compares the two.' },
        { f: 'sec', t: 'Software downloads are often published with a SHA-256 hash, so you can check that the file you received is the file that was published.' },
        { f: 'sec', t: 'In 2011 researchers showed that the hash tables in many web languages could be slowed to a crawl by sending keys chosen to collide. Python and other languages now mix a random value into their string hashes.' },
        { f: 'web', t: 'Caches keep recent answers so a site does not have to work them out again; they are hash tables keyed by the question. Memcached and Redis are well-known examples.' }
      ],
      jobs: ['Backend developer', 'Security engineer', 'DevOps engineer', 'Database engineer'],
      learn: ['python/11', 'java/13', 'modern/8', 'math/13'],
      teach: 'Hook: explain why "Forgot your password?" sends a reset link instead of your old password. (The site does not know it: it only kept a hash.)'
    },
    {
      id: 'big-o', title: 'Counting the cost: Big-O',
      idea: 'Describe how the work grows as the input grows: constant, logarithmic, linear, n log n, quadratic, exponential.',
      uses: [
        { f: 'swe', t: 'Code that is fast on 100 test records can be unusable on real data: a quadratic algorithm does 10,000 times more work when its input grows 100 times.' },
        { f: 'sec', t: 'On 2 July 2019 one regular expression that backtracked badly used up the processors on Cloudflare\'s servers around the world and took many websites offline for about half an hour.' },
        { f: 'sec', t: 'Algorithmic-complexity attacks send input chosen to trigger a program\'s worst case (keys that collide in a hash table, deeply nested data, slow patterns) to knock a server over with little effort.' },
        { f: 'data', t: 'A database index turns a full scan of a table (linear) into a lookup that grows like log n, which is why data engineers add indexes to the columns people search by.' },
        { f: 'eng', t: 'The Fast Fourier Transform (1965) does in about n log n steps what took n² before; it is used in audio, radio, medical imaging and more.' }
      ],
      jobs: ['Backend developer', 'Performance engineer', 'Site reliability engineer', 'Data engineer'],
      learn: ['dsa/1', 'math/13', 'lisp/6', 'python/14'],
      teach: 'Activity: time a program on n and on 2n items (the doubling experiment). Ask students to predict the second time before running it.'
    },
    {
      id: 'searching-and-sorting', title: 'Searching and sorting',
      idea: 'Linear search looks at everything; binary search halves a sorted list at each step; sorting puts things in order, slowly (n²) or fast (n log n).',
      uses: [
        { f: 'swe', t: 'git bisect finds the change that introduced a bug by binary search through a project\'s history: about 10 tests are enough for 1,000 changes.' },
        { f: 'swe', t: 'Library sorts are hybrids of the ones in the courses: Python, and Java for objects, use Timsort (merge sort with insertion sort on short runs); C++ libraries usually use introsort, a quicksort that falls back to heapsort when it goes badly.' },
        { f: 'swe', t: 'Java\'s own binary search computed the middle as (low + high) / 2, which overflows on very large arrays. The bug went unnoticed for about nine years, until 2006.' },
        { f: 'data', t: 'Databases keep their indexes sorted, so finding one row among millions takes a handful of steps.' },
        { f: 'web', t: 'Feeds, leaderboards and search results are sorted lists, often by more than one key (score first, then time).' }
      ],
      jobs: ['Backend developer', 'Database engineer', 'Search engineer'],
      learn: ['python/14', 'cpp/12', 'dsa/2', 'dsa/3', 'dsa/4'],
      teach: 'Hook: play "guess my number between 1 and 1,000" with yes/no "higher or lower" answers. The best strategy never needs more than 10 guesses. Why 10?'
    },
    {
      id: 'stacks-and-queues', title: 'Stacks and queues',
      idea: 'A stack takes from the top (last in, first out); a queue takes from the front (first in, first out).',
      uses: [
        { f: 'swe', t: 'Every running program has a call stack that remembers which function called which. A "stack overflow" is what happens when it runs out of room, often from recursion that never stops.' },
        { f: 'web', t: 'A browser\'s Back button and an editor\'s Undo are stacks: the last thing you did is the first thing taken back.' },
        { f: 'swe', t: 'Compilers and calculators read expressions such as 3 + 4 * 2 with a stack (Dijkstra\'s shunting-yard algorithm).' },
        { f: 'sec', t: 'A stack buffer overflow can overwrite the return address saved on the call stack and send the program somewhere the attacker chose. Stack canaries and non-executable stacks are defences against exactly this.' },
        { f: 'web', t: 'Queues let busy systems take work in order: print queues, message brokers between services (RabbitMQ, for example), and the buffers inside network routers.' },
        { f: 'games', t: 'Games collect events (key presses, network messages) in a queue and handle them in order each frame.' }
      ],
      jobs: ['Systems programmer', 'Backend developer', 'Exploit developer', 'Game developer'],
      learn: ['dsa/7', 'dsa/8', 'python/13', 'math/9'],
      teach: 'Discussion: which is fairer for a school cafeteria, a stack or a queue? Then: why does Undo use the other one?'
    },
    {
      id: 'linked-structures', title: 'Linked lists and references',
      idea: 'Items that each point to the next one: you can add or remove anywhere by changing a link, but you cannot jump straight to item number k.',
      uses: [
        { f: 'swe', t: 'The Linux kernel keeps many of its lists, such as the list of running processes, as linked lists.' },
        { f: 'web', t: 'A "least recently used" cache, which throws out whatever has not been asked for in the longest time, is usually a hash table joined to a doubly linked list.' },
        { f: 'sec', t: 'Git\'s history and blockchains are chains in which each commit or block records the hash of the one before it, so changing an old link breaks every link after it.' },
        { f: 'swe', t: 'Garbage collectors in Java and JavaScript follow references from object to object to find which memory is still in use and free the rest.' }
      ],
      jobs: ['Systems programmer', 'Kernel developer', 'Backend developer'],
      learn: ['dsa/6', 'lisp/7', 'lisp/8'],
      teach: 'Activity: a human linked list. Each student holds a card with the name of the next student. Insert someone in the middle; then try to find the 7th person without walking the chain.'
    },
    {
      id: 'recursion', title: 'Recursion',
      idea: 'A function that solves a problem by calling itself on a smaller version of it, with a base case that stops.',
      uses: [
        { f: 'swe', t: 'Folders contain folders, so tools such as find, du and rm -r walk the file system recursively.' },
        { f: 'web', t: 'Web pages (HTML), JSON and XML are nested inside themselves, so the programs that read them are usually recursive.' },
        { f: 'sec', t: 'The "billion laughs" attack is a tiny XML file whose definitions refer to each other ten levels deep, ten times each; expanding it makes about a billion copies of one word and uses up the reader\'s memory.' },
        { f: 'games', t: 'Branching trees, ferns and coastlines in graphics are often drawn by recursion, and game-playing programs look ahead move by move with recursive search (minimax).' },
        { f: 'swe', t: 'Divide-and-conquer algorithms such as merge sort, quicksort and the Fast Fourier Transform are recursive.' }
      ],
      jobs: ['Compiler engineer', 'Game AI programmer', 'Backend developer'],
      learn: ['python/13', 'lisp/4', 'lisp/8', 'dsa/8', 'cpp/4', 'java/4'],
      teach: 'Hook: two mirrors facing each other, or a set of nesting dolls. Where is the base case? What would happen without one?'
    },
    {
      id: 'graphs', title: 'Graphs and shortest paths',
      idea: 'Points joined by lines (places and roads, people and friendships, computers and cables); breadth-first search finds the fewest steps from one point to another.',
      uses: [
        { f: 'web', t: 'Routers inside large networks use link-state routing (OSPF and IS-IS): each router builds a map of the network as a graph and runs Dijkstra\'s shortest-path algorithm on it.' },
        { f: 'swe', t: 'Map apps find routes on a graph of roads, with refinements of Dijkstra\'s algorithm and A* search.' },
        { f: 'sec', t: 'Attackers and defenders draw an organisation\'s accounts, computers and permissions as a graph and look for paths to an administrator account; the tool BloodHound does this for Microsoft Active Directory.' },
        { f: 'swe', t: 'Package managers and build tools treat dependencies as a graph and install or build each part after the parts it needs (a topological sort).' },
        { f: 'data', t: 'Google\'s original PageRank treated the web as a graph of pages and links, and ranked pages by the links pointing to them.' },
        { f: 'games', t: 'Characters in games find their way around a level with A* search on a grid or a "navigation mesh".' }
      ],
      jobs: ['Network engineer', 'Penetration tester', 'Backend developer', 'Game AI programmer'],
      learn: ['math/6', 'dsa/13'],
      teach: 'Activity: draw the classroom friendships (or the school\'s hallways) as a graph. Find the shortest path between two points by breadth-first search, one ring at a time.'
    },
    {
      id: 'trees', title: 'Trees',
      idea: 'A hierarchy with one root, in which every item except the root has exactly one parent: folders, family trees, the parts of an expression.',
      uses: [
        { f: 'swe', t: 'A file system is a tree of folders.' },
        { f: 'web', t: 'A web page is a tree of elements (the DOM). JavaScript walks this tree and changes it to update what you see.' },
        { f: 'data', t: 'Databases such as PostgreSQL and SQLite store indexes as B-trees, wide, shallow trees that keep any key a few steps from the root.' },
        { f: 'swe', t: 'Compilers turn source code into a syntax tree before checking it and translating it.' },
        { f: 'sec', t: 'Merkle trees, in which each node holds a hash of its children, let Git, Bitcoin and Certificate Transparency logs detect a change anywhere in a large collection by checking one hash at the top.' },
        { f: 'data', t: 'Decision trees, and "forests" of many of them, are among the most widely used machine-learning models for tables of data.' }
      ],
      jobs: ['Database engineer', 'Compiler engineer', 'Web developer', 'Machine-learning engineer'],
      learn: ['shell/1', 'math/6', 'dsa/11', 'lisp/8', 'lisp/13'],
      teach: 'Hook: open a computer\'s file browser and follow a path such as /home/student/projects down from the root. Every folder has exactly one parent. Why can a folder not be inside itself?'
    },
    {
      id: 'binary-and-bits', title: 'Binary, bits and bytes',
      idea: 'Everything in a computer is stored as patterns of 0s and 1s; eight bits make a byte, and a pattern can mean a number, a letter, a colour or an instruction.',
      uses: [
        { f: 'web', t: 'Colours on the web are three bytes written in hexadecimal: #FF8800 means red 255, green 136, blue 0.' },
        { f: 'sec', t: 'An IPv4 address is 32 bits, which allows about 4.3 billion addresses. A network mask such as 255.255.255.0 is a bit pattern combined with an address (a bitwise AND) to find which network it is on.' },
        { f: 'sec', t: 'Linux file permissions are bits: chmod 755 lets the owner read, write and run a file, and everyone else only read and run it.' },
        { f: 'eng', t: 'Microcontrollers are programmed by setting single bits in hardware registers, which switch pins on and off.' },
        { f: 'swe', t: 'Drives are sold in powers of 1,000 but often reported in powers of 1,024, which is why a 500 GB drive shows as about 465 GB.' }
      ],
      jobs: ['Network engineer', 'Embedded engineer', 'Security analyst', 'Digital forensics analyst'],
      learn: ['computer/2', 'computer/3', 'computer/6', 'cpp/2', 'cpp/8'],
      teach: 'Hook: count to 31 on one hand in binary (each finger is a bit). Then: how many different addresses does a 32-bit number allow, and why did the internet need IPv6?'
    },
    {
      id: 'cpu-and-memory', title: 'The processor, memory and the operating system',
      idea: 'The processor fetches, decodes and runs instructions billions of times a second; memory is numbered boxes; the operating system shares the machine among programs.',
      uses: [
        { f: 'eng', t: 'Embedded engineers choose processors and memory for devices with tight budgets: a small microcontroller may have only a few kilobytes of memory.' },
        { f: 'sec', t: 'Spectre and Meltdown (2018) showed that the tricks processors use to run faster, guessing ahead and caching memory, could leak secrets from one program to another.' },
        { f: 'sec', t: 'Malware analysts read programs as machine instructions (disassembly) when there is no source code to read.' },
        { f: 'swe', t: 'The operating system gives each program its own memory space, so one program that crashes cannot overwrite another.' },
        { f: 'swe', t: 'Performance engineers arrange data so the processor\'s cache can use it: reading memory in order is much faster than jumping around in it.' },
        { f: 'games', t: 'Graphics cards (GPUs) are processors with thousands of small cores that run the same step on many pixels at once; the same chips are now used to train AI models.' }
      ],
      jobs: ['Embedded engineer', 'Malware analyst', 'Operating-system developer', 'Hardware engineer'],
      learn: ['computer/1', 'computer/2', 'computer/4', 'cpp/7'],
      teach: 'Activity: act out fetch, decode, execute with students as the processor, the memory boxes and the program counter. Then compare the pace: a 3 GHz processor has 3 billion clock ticks a second.'
    },
    {
      id: 'pointers-and-memory-safety', title: 'Pointers, references and memory safety',
      idea: 'A pointer holds the address of a value in memory; it gives C and C++ their speed, and their most dangerous bugs.',
      uses: [
        { f: 'sec', t: 'Microsoft (in 2019) and Google\'s Chromium project (in 2020) each reported that around 70% of the serious security bugs they fixed were memory-safety bugs: reading or writing past an array, or using memory that had already been freed.' },
        { f: 'sec', t: 'A pointer to something that has gone (a "dangling pointer", or "use after free") is a common way attackers break into browsers and operating systems.' },
        { f: 'swe', t: 'This is why new systems code is more and more often written in memory-safe languages such as Rust, and why US government agencies, the NSA among them, have urged the change.' },
        { f: 'eng', t: 'Device drivers and firmware control hardware through pointers to fixed addresses, where the hardware\'s registers appear as memory.' },
        { f: 'games', t: 'Game engines such as Unreal Engine are written in C++ and use pointers and careful memory layout to update a whole world in a frame of about 16 milliseconds (60 frames a second).' }
      ],
      jobs: ['Systems programmer', 'Vulnerability researcher', 'Firmware engineer', 'Game engine programmer'],
      learn: ['cpp/6', 'cpp/7', 'cpp/8', 'modern/2', 'modern/3'],
      teach: 'Discussion: a pointer is a house address written on paper. What goes wrong if the house is knocked down and someone still uses the address? (That is "use after free".)'
    },
    {
      id: 'classes-and-objects', title: 'Your own types: structs, classes and objects',
      idea: 'Group related values into one type, and let the type guard its own rules (an invariant) so the rest of the program cannot break them.',
      uses: [
        { f: 'games', t: 'A game world is made of objects: each player, enemy and bullet has a position, health and behaviour.' },
        { f: 'web', t: 'Android and iOS apps are built from classes supplied by the platform (screens, buttons, lists), and a screen is a tree of objects.' },
        { f: 'sec', t: 'A class that checks every change to its data (a bank account that refuses a negative balance) closes off whole kinds of bug; secure code applies the same idea to permissions and input.' },
        { f: 'swe', t: 'Large programs are divided into types with clear rules, so many people can work on them at once without breaking each other\'s assumptions.' },
        { f: 'eng', t: 'Engineering simulations model physical parts (a beam, a pump, a circuit element) as objects with properties and rules.' }
      ],
      jobs: ['App developer', 'Game developer', 'Software architect'],
      learn: ['modern/4', 'modern/6', 'java/9', 'java/11', 'modern/10', 'dsa/6'],
      teach: 'Activity: design a Student or a Book type on the board. What data does it hold? Which rules should it refuse to break, whatever the rest of the program does?'
    },
    {
      id: 'errors-and-exceptions', title: 'Errors and exceptions',
      idea: 'Things go wrong (bad input, a missing file, a lost connection), and a good program expects it and responds sensibly instead of crashing.',
      uses: [
        { f: 'web', t: 'A mobile app must cope with a lost connection or a server that does not answer: show a useful message, keep the user\'s work, and try again later.' },
        { f: 'sec', t: 'Error messages can leak secrets: a full error report shown to a visitor tells an attacker how the system is built. Real sites record the details privately and show the visitor a plain message.' },
        { f: 'eng', t: 'Safety-critical systems are designed to fail safe: when a check fails, the train stops or the machine shuts down rather than carrying on.' },
        { f: 'swe', t: 'Checking input where it enters a program (is it really a number? is it in range?) is the first defence against bugs and attacks alike.' }
      ],
      jobs: ['Backend developer', 'Site reliability engineer', 'Safety engineer'],
      learn: ['python/2', 'python/9', 'java/12', 'lisp/1'],
      teach: 'Discussion: what should a cash machine do if the network drops halfway through a withdrawal? List the possible states and what is safe in each.'
    },
    {
      id: 'testing-and-debugging', title: 'Testing and debugging',
      idea: 'Check code against cases whose answers you know, and hunt bugs by experiment: guess, test, narrow down.',
      uses: [
        { f: 'swe', t: 'Professional projects run automated tests on every change before it is accepted (continuous integration). This site\'s own code is checked that way.' },
        { f: 'sec', t: 'Fuzzing feeds a program huge numbers of random or mutated inputs to find crashes. Google\'s OSS-Fuzz service has found thousands of bugs in open-source software this way.' },
        { f: 'eng', t: 'Software for aircraft is developed under strict standards (DO-178C) that demand evidence that the tests exercise the code thoroughly, most strictly where a failure could be catastrophic.' },
        { f: 'swe', t: 'Debugging by halving (git bisect, or switching off half of the code) is binary search applied to bugs.' },
        { f: 'data', t: 'Data pipelines are tested too: checks that a column has no missing values, or that totals add up, catch bad data before it reaches a report.' }
      ],
      jobs: ['Quality assurance engineer', 'Software developer in test', 'Security researcher', 'Every developer'],
      learn: ['python/8', 'python/9', 'cpp/9', 'cpp/12', 'dsa/2'],
      teach: 'Activity: give pairs a function with one hidden bug (the courses\' debugging lessons have some). One student writes tests, the other predicts which test will catch it.'
    },
    {
      id: 'randomness', title: 'Randomness and simulation',
      idea: 'Computers make numbers that only look random, from a starting seed; many random trials can answer "how likely is it?" questions.',
      uses: [
        { f: 'eng', t: 'Monte Carlo simulation, named in the 1940s by scientists at Los Alamos, is still used for weather and climate forecasts, finance and engineering reliability.' },
        { f: 'games', t: 'Minecraft builds a whole world from one seed number, so the same seed always gives the same world.' },
        { f: 'sec', t: 'Ordinary random generators are predictable once you know the seed; anything secret needs a secure generator (Python\'s secrets module, not random). In 2008 a mistaken change in Debian left its OpenSSL able to make only about 32,768 different keys of each kind and size.' },
        { f: 'data', t: 'A/B tests on websites send visitors at random to one of two versions, so the difference between them can be trusted.' },
        { f: 'data', t: 'Machine learning shuffles its data and starts from random weights; fixing the seed makes an experiment repeatable.' }
      ],
      jobs: ['Data scientist', 'Quantitative analyst', 'Game designer', 'Cryptographer'],
      learn: ['python/12', 'cpp/11'],
      teach: 'Hook: ask the class to write down a "random" list of 20 coin flips, then flip a real coin 20 times. Which list has the longer runs? People are bad random generators, and so are simple formulas.'
    },
    {
      id: 'functions-as-values', title: 'Functions as values: map, filter, reduce and lambdas',
      idea: 'Hand a function to another function; map, filter and accumulate process a whole list without writing the loop yourself.',
      uses: [
        { f: 'data', t: 'Google\'s MapReduce (2004), which processed huge datasets across thousands of machines, took its name from the map and reduce of Lisp; Hadoop and Apache Spark carry the idea on.' },
        { f: 'web', t: 'JavaScript is full of functions passed as values: event handlers ("run this when the button is clicked"), callbacks, and the array methods map, filter and reduce.' },
        { f: 'swe', t: 'A lambda given to C++\'s std::sort, or a key function given to Python\'s sorted, sorts by anything you like without writing a new sort.' },
        { f: 'data', t: 'Spreadsheet and database work is mostly maps (compute a new column), filters (keep some rows) and reductions (SUM, COUNT).' }
      ],
      jobs: ['Data engineer', 'Front-end developer', 'Backend developer'],
      learn: ['lisp/9', 'lisp/11', 'modern/7'],
      teach: 'Activity: give a spreadsheet of made-up scores. Which operations are a map, which a filter, which a reduce?'
    },
    {
      id: 'code-as-data', title: 'Code as data: interpreters and compilers',
      idea: 'A program can be a value that another program reads, builds or runs; that is what interpreters and compilers do.',
      uses: [
        { f: 'swe', t: 'Every language is run by another program: CPython is a C program that runs Python, and the Java virtual machine runs Java. On this site, your Python, Java, Lisp and teaching-C++ programs are run by programs written in JavaScript.' },
        { f: 'sec', t: 'Injection attacks are code-as-data gone wrong: text from outside becomes part of a command and runs. A browser\'s Content Security Policy, which this site uses, refuses to run any script the site did not approve in advance.' },
        { f: 'swe', t: 'Linters, code formatters and the refactoring tools in editors all start by reading code as data: they parse it into a tree.' },
        { f: 'data', t: 'Machine-learning libraries work out derivatives automatically to train neural networks (automatic differentiation, a cousin of the symbolic differentiation in the Lisp course\'s project).' }
      ],
      jobs: ['Compiler engineer', 'Developer-tools engineer', 'Application security engineer'],
      learn: ['lisp/1', 'lisp/12', 'lisp/13', 'math/11'],
      teach: 'Discussion: a calculator app that runs whatever the user types as code works perfectly in a demo. Why is it dangerous on a website?'
    },
    {
      id: 'sets-and-counting', title: 'Sets, counting and the pigeonhole principle',
      idea: 'Collections with no order and no repeats, and rules for counting how many ways something can happen.',
      uses: [
        { f: 'sec', t: 'Password strength is counting: 8 lowercase letters allow 26⁸, about 209 billion, passwords; 16 allow about 4.4 × 10²². Each extra letter multiplies the count by 26, which is why length matters so much.' },
        { f: 'sec', t: 'By the pigeonhole principle, a hash with fewer possible outputs than inputs must have collisions; a secure hash is one where nobody can find them in practice.' },
        { f: 'data', t: 'SQL, the language of databases, is built on set operations: UNION, INTERSECT, EXCEPT and joins.' },
        { f: 'swe', t: 'Testing every combination of settings explodes by the product rule: 10 on/off options make 2¹⁰ = 1,024 combinations, so testers choose a smaller set that still covers every pair of options (pairwise testing).' }
      ],
      jobs: ['Security analyst', 'Database developer', 'Data analyst', 'Test engineer'],
      learn: ['math/2', 'math/13', 'modern/8'],
      teach: 'Hook: how many 4-digit phone PINs are there? How long would it take to try them all at one a second? What does a lockout after 10 tries change?'
    },
    {
      id: 'proof', title: 'Proof, induction and invariants',
      idea: 'Show that a program or a claim is right for every input, not only for the ones you happened to test.',
      uses: [
        { f: 'sec', t: 'The seL4 operating-system kernel was mathematically proved (2009) to do exactly what its specification says, a rare guarantee for the code that keeps programs apart.' },
        { f: 'eng', t: 'Engineers at Amazon Web Services have written about using TLA+, a language for describing and checking designs, to find subtle bugs in systems such as S3 and DynamoDB before building them.' },
        { f: 'eng', t: 'After the 1994 Pentium division bug, which cost Intel about $475 million, formal verification of processor designs became much more common in the chip industry.' },
        { f: 'swe', t: 'Programmers reason with loop invariants and assertions, the everyday form of proof, and some tools check them automatically.' }
      ],
      jobs: ['Verification engineer', 'Hardware engineer', 'Security researcher'],
      learn: ['math/3', 'lisp/4', 'lisp/6'],
      teach: 'Discussion: a program passed 1,000 tests. Is it correct? Use the courses\' example of a claim that holds for every number anyone has tried and still fails.'
    },
    {
      id: 'number-theory-and-crypto', title: 'Remainders, primes and cryptography',
      idea: 'Arithmetic with remainders (mod), Euclid\'s algorithm and prime numbers are the mathematics behind ciphers and check digits.',
      uses: [
        { f: 'sec', t: 'RSA and Diffie–Hellman, which help set up the secure connection behind the padlock in a browser, compute huge powers modulo a large number.' },
        { f: 'sec', t: 'The private key in RSA is found with the extended form of Euclid\'s algorithm.' },
        { f: 'sec', t: 'RSA is trusted because nobody knows a fast way to factor the product of two very large primes. A large enough quantum computer could do it, which is why new "post-quantum" standards were published in 2024.' },
        { f: 'swe', t: 'Check digits catch typing mistakes with remainders: ISBN-10 numbers use mod 11, and credit-card numbers use the Luhn check (mod 10).' },
        { f: 'sec', t: 'Simple substitution ciphers like Caesar\'s fall to letter counting (frequency analysis), a method described by the scholar al-Kindi in the 9th century.' }
      ],
      jobs: ['Cryptographer', 'Security engineer', 'Payments developer'],
      learn: ['math/4', 'math/16', 'python/16', 'computer/10', 'cpp/13'],
      teach: 'Hook: check the last digit of an ISBN-10 from a book in the room (the instructions are short), or a test card number with the Luhn check. What kinds of typing mistake does it catch?'
    },
    {
      id: 'state-machines-and-regex', title: 'State machines and regular expressions',
      idea: 'A machine with a fixed set of states that moves from one to another on each input symbol; regular expressions describe the same patterns in text.',
      uses: [
        { f: 'web', t: 'Network protocols are state machines: a TCP connection moves through states such as LISTEN, SYN-SENT and ESTABLISHED.' },
        { f: 'eng', t: 'Traffic lights, lifts, vending machines and many embedded controllers are designed as state machines.' },
        { f: 'games', t: 'Game characters often run a state machine: patrol, chase, attack, flee.' },
        { f: 'sec', t: 'Intrusion-detection systems such as Snort and Suricata compare network traffic with signatures, many of them written as regular expressions.' },
        { f: 'swe', t: 'A compiler starts with a lexer, a finite automaton that splits source code into words (tokens); grep turns a regular expression into an automaton too.' },
        { f: 'web', t: 'Forms check what you type (a postal code, an email address) with regular expressions.' }
      ],
      jobs: ['Detection engineer', 'Protocol engineer', 'Compiler engineer', 'Embedded engineer'],
      learn: ['math/7', 'math/8', 'math/9', 'shell/3'],
      teach: 'Activity: draw the states of a traffic light, or a turnstile (locked, unlocked; coin, push). What does each input do in each state?'
    },
    {
      id: 'computability', title: 'What no program can do',
      idea: 'Some questions about programs, such as "will this program ever stop?", cannot be answered by any program at all.',
      uses: [
        { f: 'sec', t: 'Fred Cohen showed in the 1980s that no program can detect every possible virus without mistakes, so antivirus software relies on rules of thumb and accepts some misses and false alarms.' },
        { f: 'swe', t: 'Tools that look for bugs without running the code (static analysers) can never be both complete and exact (Rice\'s theorem), so they warn about some code that is fine or miss some bugs.' },
        { f: 'swe', t: 'The universal machine is why one computer can run any program: interpreters, emulators and virtual machines are universal machines in practice.' },
        { f: 'eng', t: 'Some safety-critical code follows rules such as "every loop has a fixed upper bound" and "no recursion" (NASA JPL\'s "Power of Ten"), in part so tools can check that it always finishes.' }
      ],
      jobs: ['Security researcher', 'Static-analysis developer', 'Programming-language designer'],
      learn: ['math/11', 'math/12'],
      teach: 'Discussion: a company sells "a program that finds every bug in your code". What should you ask them?'
    },
    {
      id: 'p-vs-np', title: 'Easy to check, hard to find: P and NP',
      idea: 'For many problems a proposed answer is quick to check, but nobody knows a fast way to find one; whether that gap is real is the P versus NP question.',
      uses: [
        { f: 'sec', t: 'Cryptography rests on problems that are easy one way and believed hard the other, such as multiplying primes and factoring. Factoring is not known to be NP-complete, so proving P ≠ NP would not by itself prove RSA safe.' },
        { f: 'swe', t: 'SAT solvers, programs for the first problem proved NP-complete, handle many large real cases well; they are used to check chip designs and to work out which software packages can be installed together (libsolv, used by Fedora\'s DNF and openSUSE).' },
        { f: 'eng', t: 'Delivery routes, timetables and chip layouts are NP-hard, so engineers settle for answers that are good rather than provably best (heuristics and approximation).' },
        { f: 'data', t: 'Planning and scheduling problems in AI are often NP-hard, which is why they are solved by search with clever pruning.' }
      ],
      jobs: ['Operations-research analyst', 'Logistics software engineer', 'Cryptographer', 'Verification engineer'],
      learn: ['math/14', 'math/13'],
      teach: 'Hook: a Sudoku is quick to check and slow to solve. P versus NP is one of the Clay Mathematics Institute\'s seven Millennium Prize Problems, each with a one-million-dollar prize, and it is still open.'
    },
    {
      id: 'command-line', title: 'The command line, pipes and automation',
      idea: 'Type commands to work with files and programs, and join small tools with pipes to do big jobs.',
      uses: [
        { f: 'swe', t: 'Web servers and cloud machines very often run Linux with no screen at all; engineers manage them by typing commands over SSH.' },
        { f: 'swe', t: 'Automated builds and tests are lists of shell commands: this site\'s own checks run npm ci, npm test and npm run build on every change.' },
        { f: 'sec', t: 'Incident responders search logs with grep, sort and uniq -c, for example to find which addresses failed to log in most often; many security tools, such as the network scanner nmap, are command-line programs.' },
        { f: 'data', t: 'Data engineers look at and clean files with pipelines of head, cut, sort and uniq before loading them anywhere else.' },
        { f: 'eng', t: 'Scientists run long simulations on shared supercomputers by submitting shell scripts to a job queue.' }
      ],
      jobs: ['DevOps engineer', 'System administrator', 'Security operations analyst', 'Research software engineer'],
      learn: ['shell/1', 'shell/2', 'shell/3', 'shell/4', 'computer/4'],
      teach: 'Hook: rename 300 photos by hand, or with one line in the terminal? Time the first ten by hand, then show the command.'
    }
  ];

  // ---------- the page (DOM only from here; nothing runs at load time)
  const el = (...a) => window.__app.internal.el(...a);
  const fieldLabel = (k) => { const f = FIELDS.find((x) => x.key === k); return f ? f.label : k; };
  function courseLink(ref) {
    const m = /^([a-z]+)\/(\d+)$/.exec(ref); if (!m) return null;
    const c = (window.COURSES || []).find((x) => x.id === m[1]); const n = +m[2];
    if (!c || !c.lessons || !c.lessons[n - 1]) return null;
    return { href: '#/' + c.id + '/' + n, code: c.code, short: c.short || c.title, lesson: n, title: c.lessons[n - 1].title, course: c };
  }
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  const CSS = `
.aw [hidden] { display: none !important; }
.aw { max-width: 60rem; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
.aw h1 { font-size: 2.4rem; font-weight: 400; }
.aw-intro { margin-top: 1rem; }
.aw-intro p { margin: 0 0 0.8rem; }
.aw-tools { margin: 1.8rem 0 0.5rem; padding: 1rem 0; border-top: 1px solid var(--rule); border-bottom: 1px solid var(--rule); font-family: var(--sans); }
.aw-search { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.8rem; margin-bottom: 0.8rem; }
.aw-search label { font-weight: 600; font-size: 0.95rem; }
.aw-search input { flex: 1 1 14rem; min-width: 0; font: inherit; font-size: 1rem; padding: 0.4rem 0.6rem; border: 1px solid var(--rule); border-radius: 3px; background: var(--paper); color: var(--ink); }
.aw-chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin: 0; padding: 0; border: 0; }
.aw-chips legend { font-weight: 600; font-size: 0.95rem; margin-bottom: 0.4rem; padding: 0; }
.aw-chip { font-family: var(--sans); font-size: 0.88rem; padding: 0.3rem 0.75rem; border: 1px solid var(--rule); border-radius: 999px; background: var(--paper); color: var(--ink-2); cursor: pointer; line-height: 1.2; }
.aw-chip:hover { color: var(--ink); border-color: var(--ink-2); }
.aw-chip[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); }
.aw-status { margin: 0.7rem 0 0; font-size: 0.9rem; color: var(--ink-3); }
.aw-toc { margin: 1.5rem 0 0; font-family: var(--sans); font-size: 0.95rem; }
.aw-toc h2 { font-family: var(--sans); font-size: 0.95rem; font-weight: 600; margin: 0 0 0.5rem; }
.aw-toc ol { columns: 2 16rem; column-gap: 2rem; margin: 0; padding-left: 1.4rem; }
.aw-toc li { margin-bottom: 0.25rem; break-inside: avoid; }
.aw-topic { margin-top: 2.5rem; border-top: 1px solid var(--rule); padding-top: 1.4rem; scroll-margin-top: 1rem; }
.aw-topic h2 { font-size: 1.6rem; margin-bottom: 0.4rem; }
.aw-topic h2:focus { outline: none; }
.aw-idea { color: var(--ink-2); font-size: 1.08rem; margin: 0 0 1rem; }
.aw-topic h3 { font-family: var(--sans); font-size: 0.85rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-3); margin: 1.1rem 0 0.5rem; }
.aw-uses { list-style: none; margin: 0; padding: 0; }
.aw-uses li { display: grid; grid-template-columns: 11rem 1fr; gap: 1rem; padding: 0.45rem 0; border-top: 1px solid var(--rule-2); }
.aw-uses li:first-child { border-top: 0; }
.aw-tag { font-family: var(--sans); font-size: 0.82rem; font-weight: 600; color: var(--accent); padding-top: 0.2rem; }
.aw-jobs { font-family: var(--sans); font-size: 0.95rem; margin: 0; color: var(--ink-2); }
.aw-learn { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.4rem 0.6rem; font-family: var(--sans); font-size: 0.93rem; }
.aw-learn a { display: inline-block; padding: 0.2rem 0.55rem; border: 1px solid var(--rule); border-radius: 3px; text-decoration: none; color: var(--link); background: var(--paper-2); }
.aw-learn a:hover { border-color: var(--link); }
.aw-learn b { font-weight: 600; color: var(--ink-2); }
.aw-teach { margin-top: 1rem; font-family: var(--sans); font-size: 0.95rem; }
.aw-teach summary { cursor: pointer; font-weight: 600; color: var(--ink-2); }
.aw-teach p { margin: 0.5rem 0 0; padding: 0.6rem 0.8rem; border-left: 3px solid var(--rule); background: var(--paper-2); color: var(--ink-2); }
.aw-empty { font-family: var(--sans); color: var(--ink-2); margin-top: 2rem; }
.aw-bycourse { margin-top: 3.5rem; border-top: 1px solid var(--rule); padding-top: 1.4rem; }
.aw-bycourse h2 { font-size: 1.5rem; margin-bottom: 0.5rem; }
.aw-bycourse details { border-top: 1px solid var(--rule-2); padding: 0.5rem 0; font-family: var(--sans); font-size: 0.95rem; }
.aw-bycourse summary { cursor: pointer; font-weight: 600; }
.aw-bycourse ul { margin: 0.5rem 0 0.3rem; padding-left: 1.3rem; }
.aw-bycourse li { margin-bottom: 0.2rem; color: var(--ink-2); }
@media (max-width: 40rem) {
  .aw { padding: 1.5rem 1rem 3rem; }
  .aw h1 { font-size: 1.9rem; }
  .aw-uses li { grid-template-columns: 1fr; gap: 0.1rem; }
}`;
  function injectCSS() {
    if (document.getElementById('applied-css')) return;
    const s = document.createElement('style'); s.id = 'applied-css'; s.textContent = CSS; document.head.appendChild(s);
  }

  function topicSection(tp) {
    const usesList = el('ul', { class: 'aw-uses' });
    const rows = tp.uses.map((u) => {
      const li = el('li', {}, el('span', { class: 'aw-tag' }, fieldLabel(u.f)), el('span', {}, u.t));
      li.dataset.field = u.f; li.dataset.text = norm(fieldLabel(u.f) + ' ' + u.t); usesList.append(li); return li;
    });
    const links = tp.learn.map(courseLink).filter(Boolean);
    const sec = el('section', { class: 'aw-topic', id: tp.id, 'aria-labelledby': tp.id + '-h' },
      el('h2', { id: tp.id + '-h', tabindex: '-1' }, tp.title),
      el('p', { class: 'aw-idea' }, tp.idea),
      el('h3', {}, 'Where it is used'), usesList,
      el('h3', {}, 'Jobs that use it every day'), el('p', { class: 'aw-jobs' }, tp.jobs.join(' · ')),
      links.length ? [el('h3', {}, 'Learn it in'),
        el('ul', { class: 'aw-learn' }, links.map((l) => el('li', {}, el('a', { href: l.href }, el('b', {}, l.code), ' ' + l.short + ', lesson ' + l.lesson + ': ' + l.title))))] : null,
      tp.teach ? el('details', { class: 'aw-teach' }, el('summary', {}, 'For teachers'), el('p', {}, tp.teach)) : null);
    const base = norm([tp.title, tp.idea, tp.jobs.join(' '), tp.teach || '', links.map((l) => l.code + ' ' + l.short + ' ' + l.title).join(' ')].join(' '));
    return { tp, sec, rows, base };
  }

  function byCourse() {
    const map = new Map();
    for (const tp of TOPICS) for (const ref of tp.learn) {
      const l = courseLink(ref); if (!l) continue;
      if (!map.has(l.course)) map.set(l.course, new Map());
      const m = map.get(l.course); if (!m.has(l.lesson)) m.set(l.lesson, { l, topics: [] });
      m.get(l.lesson).topics.push(tp);
    }
    const order = (window.COURSES || []).filter((c) => map.has(c));
    if (!order.length) return null;
    return el('section', { class: 'aw-bycourse', id: 'real-world-by-course' },
      el('h2', {}, 'By course'),
      el('p', { class: 'aw-idea' }, 'Teaching a particular lesson? Find the topics on this page that it leads to.'),
      order.map((c) => {
        const lessons = [...map.get(c).values()].sort((a, b) => a.l.lesson - b.l.lesson);
        return el('details', {}, el('summary', {}, c.code + ' ' + c.title),
          el('ul', {}, lessons.map((x) => el('li', {}, el('a', { href: x.l.href }, 'Lesson ' + x.l.lesson + ': ' + x.l.title), ' → ',
            x.topics.map((tp, k) => [k ? ', ' : null, el('a', { href: '#/real-world/' + tp.id, onclick: (e) => jump(e, tp.id) }, tp.title)])))));
      }));
  }

  // Move to a topic without rebuilding the page (so the filters stay as they are), and keep the address shareable.
  function jump(e, id) {
    if (e.button || e.ctrlKey || e.metaKey || e.shiftKey) return;   // let the browser open a new tab
    const t = document.getElementById(id); if (!t) return;
    e.preventDefault();
    if (t.hidden) return;
    try { history.replaceState(null, '', '#/real-world/' + id); } catch (err) { /* a file:// copy may refuse; the scroll still works */ }
    t.scrollIntoView();
    const h = document.getElementById(id + '-h'); if (h && h.focus) h.focus({ preventScroll: true });
  }

  function page(sub) {
    injectCSS();
    const main = el('main', { class: 'aw' });
    const state = { field: '', q: '' };
    const items = TOPICS.map(topicSection);

    const input = el('input', { type: 'search', id: 'aw-q', autocomplete: 'off', spellcheck: 'false', placeholder: 'e.g. passwords, games, sorting' });
    const status = el('p', { class: 'aw-status', role: 'status', 'aria-live': 'polite' });
    const chips = [{ key: '', label: 'All fields' }].concat(FIELDS).map((f) => {
      const b = el('button', { type: 'button', class: 'aw-chip', 'aria-pressed': f.key === state.field ? 'true' : 'false', onclick: () => { state.field = f.key; apply(); } }, f.label);
      b.dataset.key = f.key; return b;
    });
    const tocItems = items.map((it) => el('li', {}, el('a', { href: '#/real-world/' + it.tp.id, onclick: (e) => jump(e, it.tp.id) }, it.tp.title)));
    const empty = el('p', { class: 'aw-empty', hidden: 'hidden' }, 'Nothing matches. Try a shorter word, or choose All fields.');

    function apply() {
      const words = norm(state.q).split(/\s+/).filter(Boolean);
      let shown = 0, shownUses = 0;
      for (const b of chips) b.setAttribute('aria-pressed', b.dataset.key === state.field ? 'true' : 'false');
      items.forEach((it, i) => {
        // a word matches if it is in the topic's own text or in one of its examples; the field filter hides the other examples
        let visibleUses = 0;
        const topicHit = (w) => it.base.includes(w);
        for (const li of it.rows) {
          const ok = (!state.field || li.dataset.field === state.field) && words.every((w) => topicHit(w) || li.dataset.text.includes(w));
          li.hidden = !ok; if (ok) visibleUses++;
        }
        // if every word is in the topic's own text, keep all of its examples (in the chosen field)
        if (words.length && words.every(topicHit)) {
          visibleUses = 0;
          for (const li of it.rows) { const ok = !state.field || li.dataset.field === state.field; li.hidden = !ok; if (ok) visibleUses++; }
        }
        const show = visibleUses > 0;
        it.sec.hidden = !show; tocItems[i].hidden = !show;
        if (show) { shown++; shownUses += visibleUses; }
      });
      empty.hidden = shown > 0;
      const what = state.field ? ' in ' + fieldLabel(state.field) : '';
      status.textContent = shown === items.length && !state.field && !words.length
        ? items.length + ' topics.'
        : 'Showing ' + shown + ' of ' + items.length + ' topics' + what + ' (' + shownUses + ' example' + (shownUses === 1 ? '' : 's') + ').';
    }
    input.addEventListener('input', () => { state.q = input.value; apply(); });

    main.append(
      el('header', {},
        el('h1', {}, 'Where it is used'),
        el('p', { class: 'tagline' }, 'What the ideas in these courses are for: in software, security, engineering, data, games and the web.'),
        el('div', { class: 'prose aw-intro' },
          el('p', {}, 'Each topic below is one idea the courses teach. Under it are real places where that idea does real work, the jobs that use it every day, and links to the lessons where you can learn it.'),
          el('p', {}, 'For students: this is the answer to "when will I ever use this?" Pick a field you care about and see which lessons lead there. For staff: every example is a real system or event you can look up, and each topic has a short note with a hook or a discussion question for class.'))),
      el('div', { class: 'aw-tools' },
        el('div', { class: 'aw-search' }, el('label', { for: 'aw-q' }, 'Search'), input),
        el('fieldset', { class: 'aw-chips' }, el('legend', {}, 'Show examples from'), chips),
        status),
      el('nav', { class: 'aw-toc', 'aria-label': 'Topics' }, el('h2', {}, 'Topics'), el('ol', {}, tocItems)),
      empty,
      ...items.map((it) => it.sec),   // the DOM's append does not flatten an array (el() does)
      byCourse());
    apply();
    return main;
  }

  const APPLIED = { page, TOPICS, FIELDS };
  if (typeof window !== 'undefined') window.APPLIED = APPLIED;
  if (typeof module !== 'undefined') module.exports = { TOPICS, FIELDS };
})();
