# Standards alignment

Which lessons address which standards. **Generated** by `node scripts/standards-map.js`; do not edit this page. The tags live on the lessons (`standards: [...]` in `src/course_*.js`) and the standards in `src/standards.js`. The same data is shown on the site at `#/standards` and under each lesson's summary.

## Read this first

- **Method.** Each lesson was mapped from its title, its summary and the skills it teaches, not by re-reading every paragraph. A lesson is listed under a standard when it *teaches or practises* it, not when it merely mentions it. Treat the map as a first draft for a teacher to confirm.
- **CSTA wording.** The standard names are short paraphrases written from memory of the 2017 CSTA K-12 CS Standards, so check the codes against the official list at <https://csteachers.org/k12standards/> before quoting the table to anyone (a district, a grant). Codes whose numbering I could not vouch for (3B-AP-19 and the four 3B-IC standards) are left out.
- **Grade bands.** CSTA level 2 is grades 6-8, 3A is 9-10, 3B is 11-12. A lesson is listed against the standards its content reaches, whatever its course's stated grades: an 8th grader in SC 101 meets 3A standards.
- **Minnesota.** Only the 2022 Mathematics CS-integrated benchmarks are mapped (the document I was given). Other subjects' benchmarks are not.
- **The teacher standards.** The 2020 *CSTA Standards for CS Teachers* describe what teachers know and do, not what students learn, so they cannot be mapped to lessons. The last section says where a teacher can build the content knowledge they name.

## By course

### SC 099 What Is a Computer?

| Lesson | Standards |
|---|---|
| 1. The parts of a computer | 2-CS-02, 3A-CS-01 |
| 2. The processor and memory | 3B-CS-02, 2-DA-07, 3A-DA-09 |
| 3. Storage, input and output | 2-CS-02, 3A-DA-10, 3B-CS-01 |
| 4. Software: from your program to the chip | 3A-CS-01, 3A-CS-02, 3B-CS-01 |
| 5. Checkpoint one | 2-CS-02, 3A-CS-01, 3A-CS-02, 3B-CS-01, 3A-DA-10 |
| 6. Everything is numbers | 2-DA-07, 3A-DA-09 |
| 7. Switches that think | 3B-CS-02, 2-AP-12 |
| 8. Computers talking | 2-NI-04, 3A-NI-04, 3B-NI-03, 2-CS-02 |
| 9. Checkpoint two | 3A-DA-09, 2-NI-04, 2-AP-10 |
| 10. Staying safe | 2-NI-05, 2-NI-06, 3A-NI-05, 2-IC-23, 3A-IC-29 |
| 11. Giving instructions | 2-AP-10, 2-AP-12 |

### SC 100 From Scratch to Python

| Lesson | Standards |
|---|---|
| 1. Say it in Python | 2-AP-10, 2-AP-11 |
| 2. Keeping score: variables | 2-AP-11 |
| 3. Repeat and forever | 2-AP-12 |
| 4. If, then, else | 2-AP-12 |
| 5. Checkpoint one | 2-AP-11, 2-AP-12 |
| 6. Lists | 2-AP-11, 3A-AP-14 |
| 7. My blocks: functions | 2-AP-14, 2-AP-19 |
| 8. Project: your own adventure game | 2-AP-12, 2-AP-13, 2-AP-15, 2-AP-17 |
| 9. Project: turtle art | 2-AP-12, 2-AP-14, 2-AP-16 |
| 10. Checkpoint two | 2-AP-12, 2-AP-13 |
| 11. Words and letters | 2-AP-11 |

### SC 101 Introduction to Python

| Lesson | Standards |
|---|---|
| 1. Hello, Python | 2-AP-11, 7.3.6.3 |
| 2. How Python reads your program | 2-AP-12, 2-AP-17 |
| 3. Making decisions | 2-AP-12, 3A-AP-15 |
| 4. Repetition | 2-AP-12, 3A-AP-15 |
| 5. Checkpoint: the first four lessons | 2-AP-11, 2-AP-12, 3A-AP-15 |
| 6. Lists | 3A-AP-14, 3A-DA-10, 3B-AP-12 |
| 7. Strings | 2-AP-11, 3A-AP-14 |
| 8. Functions | 2-AP-13, 2-AP-14, 2-AP-19, 3A-AP-17, 3A-AP-18, 3B-AP-14 |
| 9. Finding and fixing bugs | 2-AP-17, 3A-CS-03 |
| 10. Checkpoint: lists, strings, functions and bugs | 3A-AP-14, 2-AP-13, 2-AP-17, 3A-AP-17 |
| 11. Dictionaries | 3A-AP-14, 3A-DA-10, 3B-AP-12 |
| 12. Randomness and simulation | 2-AP-16, 2-DA-09, 3A-DA-12, 3B-DA-07, 6.1.2.3, 7.1.2.2, 7.1.2.5, 7.1.2.6 |
| 13. Recursion | 3B-AP-10, 3B-AP-13, 9.3.7.4 |
| 14. Searching and sorting | 3B-AP-10, 3B-AP-11 |
| 15. Checkpoint: dictionaries to searching | 3A-AP-14, 3B-AP-10, 3B-AP-11, 3A-DA-12 |
| 16. Project: the Caesar cipher | 2-NI-06, 3A-AP-13, 3A-DA-09, 3B-DA-05 |

### SC 102 Introduction to Lisp

| Lesson | Standards |
|---|---|
| 1. Expressions and the interpreter | 3A-CS-02 |
| 2. Procedures and the substitution model | 3A-CS-01, 3A-AP-17, 3A-AP-18 |
| 3. Making decisions | 3A-AP-15 |
| 4. Recursion | 3B-AP-13 |
| 5. Checkpoint: the first four lessons | 3A-CS-02, 3A-AP-17, 3A-AP-15, 3B-AP-13 |
| 6. The shape of a process | 3B-AP-11, 3B-AP-13 |
| 7. Pairs and lists | 3B-AP-12 |
| 8. Recursion on lists | 3B-AP-12, 3B-AP-13 |
| 9. Procedures as data | 3A-AP-17, 3B-AP-14 |
| 10. Checkpoint: processes, lists and procedures | 3B-AP-11, 3B-AP-12, 3B-AP-13, 3B-AP-14 |
| 11. map, filter and accumulate | 3B-AP-10, 3B-AP-14 |
| 12. Symbols, quotation, and code as data | 3B-AP-12 |
| 13. Project: symbolic differentiation | 3B-AP-14, 3B-AP-15 |

### SC 103 Introduction to C++

| Lesson | Standards |
|---|---|
| 1. Hello, C++ | 2-AP-11, 3A-CS-02 |
| 2. Making decisions | 2-AP-12, 3A-AP-15 |
| 3. Loops | 2-AP-12, 3A-AP-15 |
| 4. Functions | 2-AP-14, 3A-AP-17, 3A-AP-18 |
| 5. Checkpoint: the first four lessons | 2-AP-11, 2-AP-12, 2-AP-14, 3A-AP-15 |
| 6. Pointers | 3A-CS-02, 3B-AP-12 |
| 7. Arrays | 3A-AP-14, 3B-AP-12, 3B-AP-18 |
| 8. Characters and strings | 3A-DA-09, 3B-AP-12 |
| 9. Finding and fixing bugs | 2-AP-17, 3A-CS-03, 3B-AP-18 |
| 10. Checkpoint: pointers, arrays, strings and bugs | 3A-CS-03, 3B-AP-12, 3B-AP-18 |
| 11. Randomness and simulation | 2-DA-09, 3A-DA-12, 3B-DA-07, 6.1.2.3, 7.1.2.2, 7.1.2.5 |
| 12. Searching and sorting | 3B-AP-10, 3B-AP-11 |
| 13. Project: Sieve of Eratosthenes | 3B-AP-10, 3B-AP-11 |

### SC 104 Introduction to the Mathematics of Computing

| Lesson | Standards |
|---|---|
| 1. Propositions and truth | 2-AP-12, 3B-CS-02, 9.2.4.5, 9.2.4.6 |
| 2. Sets and counting | 3B-AP-12, 7.1.2.4, 9.1.2.2, 9.2.4.7 |
| 3. Checking is not proving | 3B-AP-11, 3B-AP-13, 9.2.4.6, 9.2.4.7 |
| 4. Numbers, remainders and Euclid | 3B-AP-10, 3B-AP-11, 9.2.4.7 |
| 5. Checkpoint one | 2-AP-12, 3B-CS-02, 3B-AP-10, 3B-AP-11, 3B-AP-12, 3B-AP-13 |
| 6. Graphs and paths | 3A-DA-12, 3B-AP-12 |
| 7. Machines with a finite memory | 3A-DA-12, 3B-CS-02 |
| 8. Patterns, and the double vowel system | 3A-IC-24, 3B-DA-05 |
| 9. The limits of finite memory | (enrichment, no standard) |
| 10. Checkpoint two | 3A-DA-12, 3B-AP-12, 3B-CS-02, 3A-IC-24, 3B-DA-05 |
| 11. The universal machine | (enrichment, no standard) |
| 12. What no program can do | (enrichment, no standard) |
| 13. Counting steps | 3B-AP-11 |
| 14. Easy to check, hard to find | 3B-AP-11 |
| 15. Checkpoint three | 3B-AP-11 |
| 16. Project: a lock made of arithmetic | 2-NI-06, 3A-NI-06, 3B-AP-10, 3B-NI-04 |

### SC 105 Modern C++

| Lesson | Standards |
|---|---|
| 1. Text that looks after itself | 3B-AP-12, 3B-AP-16 |
| 2. Lists that grow | 3A-AP-14, 3B-AP-12, 3B-AP-16 |
| 3. Another name for a variable | 3A-AP-17, 3A-CS-01 |
| 4. Your own types | 3A-AP-17, 3A-AP-18, 3B-AP-14 |
| 5. Checkpoint one | 3A-AP-14, 3A-AP-17, 3B-AP-12, 3B-AP-16 |
| 6. Types with rules | 3A-AP-17, 3B-AP-14, 3A-CS-01 |
| 7. Algorithms without the loops | 3B-AP-10, 3B-AP-16 |
| 8. Looking things up | 3A-DA-10, 3B-AP-12 |
| 9. Checkpoint two | 3A-AP-17, 3B-AP-10, 3B-AP-14, 3A-DA-10 |
| 10. Project: a gradebook report | 3A-AP-13, 3B-AP-14 |

### SC 106 Introduction to Java

| Lesson | Standards |
|---|---|
| 1. Hello, Java | 2-AP-11, 3A-CS-02 |
| 2. Making decisions | 2-AP-12, 3A-AP-15 |
| 3. Repetition | 2-AP-12, 3A-AP-15 |
| 4. Methods | 2-AP-14, 3A-AP-17, 3A-AP-18 |
| 5. Checkpoint: the first four lessons | 2-AP-11, 2-AP-12, 2-AP-14 |
| 6. Arrays | 3A-AP-14, 3B-AP-12 |
| 7. Strings | 2-AP-11, 3B-AP-16 |
| 8. ArrayList | 3A-AP-14, 3B-AP-12, 3B-AP-16 |
| 9. Classes and objects | 3A-CS-01, 3A-AP-17, 3B-AP-14 |
| 10. Checkpoint: arrays to classes | 3A-AP-14, 3B-AP-12, 3B-AP-16, 3A-CS-01 |
| 11. Inheritance and interfaces | 3A-AP-17, 3B-AP-14, 3A-CS-01 |
| 12. Exceptions | 3A-CS-03, 2-AP-17 |
| 13. HashMap and HashSet | 3A-DA-10, 3B-AP-12, 3B-AP-16 |
| 14. Checkpoint: classes, exceptions, maps | 3A-AP-17, 3A-CS-03, 3A-DA-10 |
| 15. Project: a crafting table | 3B-AP-17, 3A-AP-13, 3B-AP-14 |

### SC 107 Data Structures and Algorithms

| Lesson | Standards |
|---|---|
| 1. Counting the cost | 3A-DA-10, 3B-AP-11, 3B-AP-12 |
| 2. Searching | 3B-AP-10, 3B-AP-11 |
| 3. Sorting, the slow way first | 3B-AP-10, 3B-AP-11 |
| 4. Divide and conquer: merge sort and quicksort | 3B-AP-10, 3B-AP-11, 3B-AP-13, 3B-AP-15 |
| 5. Checkpoint: counting, searching, sorting | 3A-DA-10, 3B-AP-10, 3B-AP-11, 3B-AP-12, 3B-AP-13, 3B-AP-15 |
| 6. Linked lists | 3A-DA-10, 3B-AP-12 |
| 7. Stacks and queues | 3B-AP-12 |
| 8. Recursion | 3B-AP-13 |
| 9. Hash tables | 3A-DA-10, 3B-AP-12, 3B-AP-11 |
| 10. Checkpoint: lists, stacks, recursion, hashing | 3A-DA-10, 3B-AP-11, 3B-AP-12, 3B-AP-13 |
| 11. Binary search trees | 3B-AP-12, 3B-AP-11, 3B-AP-13 |
| 12. Heaps and priority queues | 3B-AP-12, 3B-AP-11, 3B-AP-10 |
| 13. Graphs | 3B-AP-12, 3B-AP-10, 3B-AP-11 |
| 14. Checkpoint: trees, heaps, graphs | 3B-AP-10, 3B-AP-11, 3B-AP-12, 3B-AP-13 |
| 15. Project: the busiest words | 3B-AP-12, 3B-AP-11, 3A-DA-10 |

### SC 108 The Command Line

| Lesson | Standards |
|---|---|
| 1. Where am I? | 3A-CS-02, 3B-CS-01 |
| 2. Making and moving things | 3A-DA-10, 3B-CS-01 |
| 3. Looking inside files | 2-DA-08, 3B-DA-05 |
| 4. Pipes and redirection | 3A-AP-18, 3A-CS-02, 3B-DA-05 |
| 5. Checkpoint one | 3A-CS-02, 3B-DA-05 |

### SC 109 How Machines Learn

| Lesson | Standards |
|---|---|
| 1. Rules or examples? | 3A-DA-12, 3B-AP-08 |
| 2. Your nearest neighbours | 3A-DA-12, 3B-AP-09, 3B-DA-05 |
| 3. Is it any good? | 3B-AP-11, 3B-DA-07, 9.1.1.15 |
| 4. Checkpoint one | 3B-AP-08, 3B-DA-07 |
| 5. A line that learns | 3B-AP-08, 3B-AP-09 |
| 6. Walking downhill | 2-DA-09, 3A-DA-12, 3B-AP-09, 8.1.1.4, 9.1.1.11 |
| 7. Twenty questions | 3B-AP-09, 3B-AP-12, 3B-DA-05 |
| 8. Checkpoint two | 3B-AP-08, 3B-AP-09 |

## By CSTA standard

"Also on" means the standard is practised on that page but no lesson teaches it.

| Standard | Lessons | Also on |
|---|---|---|
| **2-CS-02** Design projects combining hardware and software to collect and exchange data | SC 099 L1, SC 099 L3, SC 099 L5, SC 099 L8 |  |
| **2-NI-04** Model the role of protocols in sending data across networks | SC 099 L8, SC 099 L9 |  |
| **2-NI-05** Explain how physical and digital security protect information | SC 099 L10 |  |
| **2-NI-06** Apply several methods of information protection and model how well each works | SC 099 L10, SC 101 L16, SC 104 L16 |  |
| **2-DA-07** Represent data using multiple encoding schemes | SC 099 L2, SC 099 L6 |  |
| **2-DA-08** Collect data with computational tools and transform it | SC 108 L3 |  |
| **2-DA-09** Refine computational models based on the data they generate | SC 101 L12, SC 103 L11, SC 109 L6 |  |
| **2-AP-10** Use flowcharts or pseudocode to express algorithms | SC 099 L9, SC 099 L11, SC 100 L1 |  |
| **2-AP-11** Create clearly named variables of different data types and operate on them | SC 100 L1, SC 100 L2, SC 100 L5, SC 100 L6, SC 100 L11, SC 101 L1, SC 101 L5, SC 101 L7, SC 103 L1, SC 103 L5, SC 106 L1, SC 106 L5, SC 106 L7 |  |
| **2-AP-12** Design programs combining control structures (nested loops, compound conditionals) | SC 099 L7, SC 099 L11, SC 100 L3, SC 100 L4, SC 100 L5, SC 100 L8, SC 100 L9, SC 100 L10, SC 101 L2, SC 101 L3, SC 101 L4, SC 101 L5, SC 103 L2, SC 103 L3, SC 103 L5, SC 104 L1, SC 104 L5, SC 106 L2, SC 106 L3, SC 106 L5 |  |
| **2-AP-13** Decompose problems into parts | SC 100 L8, SC 100 L10, SC 101 L8, SC 101 L10 |  |
| **2-AP-14** Create procedures with parameters to organize and reuse code | SC 100 L7, SC 100 L9, SC 101 L8, SC 103 L4, SC 103 L5, SC 106 L4, SC 106 L5 |  |
| **2-AP-15** Seek and use feedback from teammates and users | SC 100 L8 |  |
| **2-AP-16** Incorporate existing code, media and libraries, with attribution | SC 100 L9, SC 101 L12 |  |
| **2-AP-17** Systematically test and refine programs with a range of test cases | SC 100 L8, SC 101 L2, SC 101 L9, SC 101 L10, SC 103 L9, SC 106 L12 | Code Lab |
| **2-AP-19** Document programs so they are easier to follow, test and debug | SC 100 L7, SC 101 L8 |  |
| **2-IC-23** Describe tradeoffs between public and private/secure information | SC 099 L10 |  |
| **3A-CS-01** Explain how abstractions hide implementation details of computing systems | SC 099 L1, SC 099 L4, SC 099 L5, SC 102 L2, SC 105 L3, SC 105 L6, SC 106 L9, SC 106 L10, SC 106 L11 |  |
| **3A-CS-02** Compare levels of abstraction: application software, system software, hardware | SC 099 L4, SC 099 L5, SC 102 L1, SC 102 L5, SC 103 L1, SC 103 L6, SC 106 L1, SC 108 L1, SC 108 L4, SC 108 L5 |  |
| **3A-CS-03** Develop guidelines for systematic troubleshooting | SC 101 L9, SC 103 L9, SC 103 L10, SC 106 L12, SC 106 L14 |  |
| **3A-NI-04** Evaluate scalability and reliability of networks (routers, switches, servers, topology, addressing) | SC 099 L8 |  |
| **3A-NI-05** Give examples of how malware and attacks affect sensitive data | SC 099 L10 |  |
| **3A-NI-06** Recommend security measures for scenarios (efficiency, feasibility, ethics) | SC 104 L16 |  |
| **3A-DA-09** Translate between bit representations of characters, numbers, images | SC 099 L2, SC 099 L6, SC 099 L9, SC 101 L16, SC 103 L8 |  |
| **3A-DA-10** Evaluate tradeoffs in how data is organized and where it is stored | SC 099 L3, SC 099 L5, SC 101 L6, SC 101 L11, SC 105 L8, SC 105 L9, SC 106 L13, SC 106 L14, SC 107 L1, SC 107 L5, SC 107 L6, SC 107 L9, SC 107 L10, SC 107 L15, SC 108 L2 |  |
| **3A-DA-12** Create computational models of relationships among data elements | SC 101 L12, SC 101 L15, SC 103 L11, SC 104 L6, SC 104 L7, SC 104 L10, SC 109 L1, SC 109 L2, SC 109 L6 |  |
| **3A-AP-13** Create prototypes that use algorithms to solve problems | SC 101 L16, SC 105 L10, SC 106 L15 | Bot Arena |
| **3A-AP-14** Use lists to simplify solutions instead of many simple variables | SC 100 L6, SC 101 L6, SC 101 L7, SC 101 L10, SC 101 L11, SC 101 L15, SC 103 L7, SC 105 L2, SC 105 L5, SC 106 L6, SC 106 L8, SC 106 L10 |  |
| **3A-AP-15** Justify the choice of control structures and discuss tradeoffs | SC 101 L3, SC 101 L4, SC 101 L5, SC 102 L3, SC 102 L5, SC 103 L2, SC 103 L3, SC 103 L5, SC 106 L2, SC 106 L3 |  |
| **3A-AP-17** Decompose problems using procedures, modules and/or objects | SC 101 L8, SC 101 L10, SC 102 L2, SC 102 L5, SC 102 L9, SC 103 L4, SC 105 L3, SC 105 L4, SC 105 L5, SC 105 L6, SC 105 L9, SC 106 L4, SC 106 L9, SC 106 L11, SC 106 L14 |  |
| **3A-AP-18** Build artifacts from procedures, data+procedures, or interrelated programs | SC 101 L8, SC 102 L2, SC 103 L4, SC 105 L4, SC 106 L4, SC 108 L4 |  |
| **3A-AP-21** Evaluate and refine artifacts to make them more usable and accessible |  | Code Lab |
| **3A-IC-24** Evaluate how computing affects personal, ethical, social, economic, cultural practices | SC 104 L8, SC 104 L10 | Where it is used |
| **3A-IC-26** Show how an algorithm applies to problems across disciplines |  | Algorithms in motion; Where it is used |
| **3A-IC-29** Explain privacy concerns of automated data collection | SC 099 L10 |  |
| **3B-CS-01** Categorize the roles of operating system software | SC 099 L3, SC 099 L4, SC 099 L5, SC 108 L1, SC 108 L2 |  |
| **3B-CS-02** Illustrate how hardware implements logic, input and output | SC 099 L2, SC 099 L7, SC 104 L1, SC 104 L5, SC 104 L7, SC 104 L10 |  |
| **3B-NI-03** Describe issues that affect network functionality | SC 099 L8 |  |
| **3B-NI-04** Compare ways developers protect devices and information from unauthorized access | SC 104 L16 |  |
| **3B-DA-05** Use data analysis tools to find patterns in data from complex systems | SC 101 L16, SC 104 L8, SC 104 L10, SC 108 L3, SC 108 L4, SC 108 L5, SC 109 L2, SC 109 L7 |  |
| **3B-DA-07** Evaluate how well models and simulations test and refine hypotheses | SC 101 L12, SC 103 L11, SC 109 L3, SC 109 L4 |  |
| **3B-AP-08** Describe how artificial intelligence drives software and physical systems | SC 109 L1, SC 109 L4, SC 109 L5, SC 109 L8 |  |
| **3B-AP-09** Implement an AI algorithm to play a game or solve a problem | SC 109 L2, SC 109 L5, SC 109 L6, SC 109 L7, SC 109 L8 | Bot Arena |
| **3B-AP-10** Use and adapt classic algorithms | SC 101 L13, SC 101 L14, SC 101 L15, SC 102 L11, SC 103 L12, SC 103 L13, SC 104 L4, SC 104 L5, SC 104 L16, SC 105 L7, SC 105 L9, SC 107 L2, SC 107 L3, SC 107 L4, SC 107 L5, SC 107 L12, SC 107 L13, SC 107 L14 | Algorithms in motion |
| **3B-AP-11** Evaluate algorithms for efficiency, correctness and clarity | SC 101 L14, SC 101 L15, SC 102 L6, SC 102 L10, SC 103 L12, SC 103 L13, SC 104 L3, SC 104 L4, SC 104 L5, SC 104 L13, SC 104 L14, SC 104 L15, SC 107 L1, SC 107 L2, SC 107 L3, SC 107 L4, SC 107 L5, SC 107 L9, SC 107 L10, SC 107 L11, SC 107 L12, SC 107 L13, SC 107 L14, SC 107 L15, SC 109 L3 | Algorithms in motion |
| **3B-AP-12** Compare and contrast fundamental data structures and their uses | SC 101 L6, SC 101 L11, SC 102 L7, SC 102 L8, SC 102 L10, SC 102 L12, SC 103 L6, SC 103 L7, SC 103 L8, SC 103 L10, SC 104 L2, SC 104 L5, SC 104 L6, SC 104 L10, SC 105 L1, SC 105 L2, SC 105 L5, SC 105 L8, SC 106 L6, SC 106 L8, SC 106 L10, SC 106 L13, SC 107 L1, SC 107 L5, SC 107 L6, SC 107 L7, SC 107 L9, SC 107 L10, SC 107 L11, SC 107 L12, SC 107 L13, SC 107 L14, SC 107 L15, SC 109 L7 |  |
| **3B-AP-13** Illustrate the flow of execution of a recursive algorithm | SC 101 L13, SC 102 L4, SC 102 L5, SC 102 L6, SC 102 L8, SC 102 L10, SC 104 L3, SC 104 L5, SC 107 L4, SC 107 L5, SC 107 L8, SC 107 L10, SC 107 L11, SC 107 L14 |  |
| **3B-AP-14** Construct solutions from student-created procedures, modules, objects | SC 101 L8, SC 102 L9, SC 102 L10, SC 102 L11, SC 102 L13, SC 105 L4, SC 105 L6, SC 105 L9, SC 105 L10, SC 106 L9, SC 106 L11, SC 106 L15 |  |
| **3B-AP-15** Analyze a large problem and find generalizable patterns | SC 102 L13, SC 107 L4, SC 107 L5 |  |
| **3B-AP-16** Demonstrate code reuse with libraries and APIs | SC 105 L1, SC 105 L2, SC 105 L5, SC 105 L7, SC 106 L7, SC 106 L8, SC 106 L10, SC 106 L13 |  |
| **3B-AP-17** Plan and develop programs for broad audiences with a software development process | SC 106 L15 |  |
| **3B-AP-18** Explain security issues that can compromise programs | SC 103 L7, SC 103 L9, SC 103 L10 |  |

## Other parts of the site

- Algorithms in motion (17 demos: sorting race, searching, paths, games, puzzles): 3B-AP-10, 3B-AP-11, 3A-IC-26
- Bot Arena (Tron bots in Python, Java, C++ and Scheme): 3B-AP-09, 3A-AP-13
- Where it is used (30 topics, 147 examples by field): 3A-IC-24, 3A-IC-26
- Code Lab (write, run and test code in four languages): 2-AP-17, 3A-AP-21

## CSTA standards with no lesson

**Computing systems**

- 2-CS-01 (Grades 6–8): Recommend improvements to device design from how users interact
- 2-CS-03 (Grades 6–8): Systematically identify and fix problems with computing devices

**Networks and the Internet**

- 3A-NI-07 (Grades 9–10): Compare security measures and the usability/security tradeoff
- 3A-NI-08 (Grades 9–10): Explain tradeoffs in selecting cybersecurity recommendations

**Data and analysis**

- 3A-DA-11 (Grades 9–10): Create interactive data visualizations
- 3B-DA-06 (Grades 11–12): Select data collection tools to build data sets that support a claim

**Algorithms and programming**

- 2-AP-18 (Grades 6–8): Distribute tasks and keep a timeline when collaborating
- 3A-AP-16 (Grades 9–10): Develop artifacts that use events to start instructions
- 3A-AP-19 (Grades 9–10): Design and develop programs for broad audiences using user feedback
- 3A-AP-20 (Grades 9–10): Evaluate licenses that limit use of computational artifacts
- 3A-AP-22 (Grades 9–10): Work in team roles using collaborative tools
- 3A-AP-23 (Grades 9–10): Document design decisions in text, graphics, presentations or demonstrations
- 3B-AP-20 (Grades 11–12): Use version control, IDEs and collaborative tools in a group project
- 3B-AP-21 (Grades 11–12): Develop test cases to verify a program meets its specification
- 3B-AP-22 (Grades 11–12): Modify an existing program to add functionality and discuss implications
- 3B-AP-23 (Grades 11–12): Evaluate key qualities of a program through code review

**Impacts of computing**

- 2-IC-20 (Grades 6–8): Compare tradeoffs of computing technologies in everyday life and careers
- 2-IC-21 (Grades 6–8): Discuss bias and accessibility in the design of technologies
- 2-IC-22 (Grades 6–8): Collaborate with many contributors on a computational artifact
- 3A-IC-25 (Grades 9–10): Test and refine artifacts to reduce bias and equity deficits
- 3A-IC-27 (Grades 9–10): Use collaboration tools to connect people across cultures and fields
- 3A-IC-28 (Grades 9–10): Explain effects of intellectual property laws on innovation

Standards met by exactly one lesson (thin coverage): 2-NI-05, 2-DA-08, 2-AP-15, 2-IC-23, 3A-NI-04, 3A-NI-05, 3A-NI-06, 3A-IC-29, 3B-NI-03, 3B-NI-04, 3B-AP-17.

## Minnesota (2022 Mathematics standards, CS-integrated benchmarks)

Source: *2022 Minnesota Academic Standards in Mathematics, Computer Science Learning Progressions* (Minnesota Department of Education). Minnesota has no stand-alone CS standards; this document lists the mathematics benchmarks the standards committee marked as CS-integrated, in the CSTA concepts Data and Analysis and Algorithms and Programming. It is the only Minnesota source mapped here.

Benchmark codes read grade.strand.standard.benchmark (9 = high school). "Taught" means a lesson teaches or practises the benchmark's content; "in part" means it touches part of it (the note says what is missing). Checked against the lesson text by searching it for the key terms, not by reading every lesson. Kindergarten to grade 5 benchmarks in the document are below the site's youngest course and are not mapped.

| Benchmark | Lessons | Fit |
|---|---|---|
| **6.1.2.3** Experimental probability from experiments where the theoretical probability is known; make predictions | SC 101 L12, SC 103 L11 | Taught. Simulations compared with the exact probability (dice, the birthday problem). |
| **7.1.2.2** Approximate a probability from long-run frequency | SC 101 L12, SC 103 L11 | Taught. The lessons try it thousands of times and watch the share settle. |
| **7.1.2.4** Sample spaces for compound events by decomposing them | SC 104 L2 | In part. Counting rules are taught; sample spaces are not named as such. |
| **7.1.2.5** Design and use a simulation for compound events | SC 101 L12, SC 103 L11 | In part. Simulations of single dice and the birthday problem; no two-dice or other compound-event simulation. |
| **7.1.2.6** Probabilities of compound events by lists, tables, trees or simulation | SC 101 L12 | In part. Simulation yes; no tree diagrams or organized-list method. |
| **7.3.6.3** Evaluate algebraic expressions applying the order of operations | SC 101 L1 | In part. Arithmetic expressions and precedence; not algebraic expressions with exponents and absolute value as such. |
| **8.1.1.4** Use the equation of a linear model; interpret the slope and intercepts | SC 109 L6 | In part. Fits y = w x by minimizing squared error and reads the slope; no intercept, no bivariate data in context. |
| **9.1.1.11** Statistical models with linear and exponential functions, including regression; judge fit | SC 109 L6 | In part. Fitting a line and measuring its error; no residuals or correlation coefficient. |
| **9.1.1.15** Identify and explain misleading uses of data | SC 109 L3 | In part. Accuracy misleads when labels are rare; not about distorted displays. |
| **9.1.2.2** Events as subsets; Venn diagrams; unions, intersections and complements | SC 104 L2 | In part. Sets, Venn diagrams, union and complement are taught, but not framed as events. |
| **9.2.4.5** if-then statements: inverse, converse and contrapositive | SC 104 L1 | Taught. Taught as implication, converse and contrapositive, with the theorem that an implication equals its contrapositive. |
| **9.2.4.6** Validity of a logical argument; counterexamples | SC 104 L1, SC 104 L3 | Taught. Counterexamples, and why checking cases is not proving. |
| **9.2.4.7** Construct logical arguments from definitions and theorems | SC 104 L2, SC 104 L3, SC 104 L4 | Taught. Proofs, including induction and a proof that Euclid’s algorithm is right. |
| **9.3.7.4** Sequences expressed recursively and by an explicit formula | SC 101 L13 | In part. Recursive definitions (Fibonacci, factorial); no arithmetic or geometric sequences with explicit formulas. |

**Benchmarks with no lesson:**

- 6.1.1.2 Design and conduct investigations to gather data
- 6.1.1.4 Create a visualization of a data set to answer a question
- 6.2.3.1 Surface area of prisms, with justification by decomposition
- 6.2.3.2 Volume of prisms, with justification by decomposition
- 6.2.4.2 Decompose polygons into triangles to find the sum of interior angles
- 7.1.1.5 Create a visualization of a data set that tells a story
- 8.1.1.5 Create data visualizations (tables, scatter plots) that support a claim
- 8.1.1.6 Compare competing explanations for data trends; correlation versus causation
- 8.3.6.9 Systems of linear equations in two variables
- 8.3.7.2 Linear and non-linear visual patterns; the nth term
- 8.3.7.5 How changing m or b changes the graph of f(x) = mx + b
- 9.1.1.8 Inferences about a population from random samples, with simulated samples
- 9.1.2.3 Conditional probability and independence
- 9.2.3.4 Decomposition to find surface area and volume of solids
- 9.2.4.14 Sequences of transformations of geometric figures
- 9.3.5.4 Matrices to represent and manipulate data
- 9.3.7.1 Systems of equations and inequalities, exponential and quadratic functions
- 9.3.7.8 Compound interest as a recursive formula

Most Minnesota matches are in the probability and logic strands; the site's lessons are programming lessons, so a math teacher should expect to use them as applications of these benchmarks, not as the teaching of them.

## The 2020 CSTA teacher standards (1a-1f, knowledge and skills)

A teacher can use the site to build, or refresh, the content knowledge named in Standard 1:

| Teacher standard | Where on this site |
|---|---|
| 1a Apply CS practices | Every course; the project lessons (SC 100 L7-8, SC 101 L13, SC 102 L11, SC 103 L11, SC 104 L13, SC 105 L8, SC 109 L8) |
| 1b Apply knowledge of computing systems | SC 099, SC 108 |
| 1c Model networks and the Internet | Little: SC 099 L3 touches networks; there is no networks lesson (see the gaps) |
| 1d Use and analyze data | SC 109, SC 101 L9-10, SC 108 L3-4 |
| 1e Develop programs and interpret algorithms | SC 100-103, 105-107; Algorithms page |
| 1f Analyze impacts of computing | Real world page; SC 109 L1 and L3 stories; little else (see the gaps) |

Standards 2-5 (equity, professional growth, instructional design, classroom practice) are about teaching, not content. Standard 4 is where `LESSON_STANDARD.md` applies: it is the written design standard for the lessons.
