// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// What Is a Computer?: the first course, before any programming. No code runs here: the exercises are answer, choice and table kinds
// (src/mathgrade.js), and the figures (widgets.js: parts, cpu, bits, pipeline, codes, pixels, colour, sampling, gates, adder, packets, passwords,
// robot) carry the ideas. The last lesson shows a few lines of Python to read, never to run. Written to LESSON_STANDARD.md: units of three or
// four lessons ending in a checkpoint (5 and 9), named skills on every quick check and exercise.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'computer', code: 'SC 099', short: 'Computers', lang: 'none', standard: 1,
  title: 'What Is a Computer?',
  grades: 'Grades 6–12 · start here',
  audience: `<p><b>Anyone about to learn programming</b>, at any age. Eleven short lessons on the machine itself: what is inside the case, what each part does, how a program gets from your keyboard to the chip, how text, pictures and sound become numbers, how switches can add, how computers talk to each other, how to stay safe, and what an algorithm is. Every word that the other courses take for granted is explained here: processor, memory, storage, file, operating system, bit, byte, packet, algorithm.</p><p>No experience is needed and almost no code is written: the last lesson shows a few lines of Python to read. Each lesson takes 30 to 45 minutes.</p>`,
  tagline: 'Before any code: what a computer is made of, how it runs a program, how it keeps text, pictures and sound as numbers, how switches add, how computers talk and stay safe, and what an algorithm is.',
  description: `<p>Every programming course starts with a program and a computer that runs it, and takes the computer for granted. This course does not. In eleven short lessons, in three units, it opens the case and follows the idea all the way down and all the way out.</p>
<p><b>Unit one, the machine:</b> input, processing, memory, storage and output; what a CPU does billions of times a second; why memory and storage are different; and what the operating system and a programming language each do when you press Run. <b>Unit two, inside the bytes:</b> how text, pictures and sound are all numbers; how a pile of switches, the logic gates, can add; and how a message crosses the Internet in packets. <b>Unit three:</b> how to stay safe, with passwords, phishing and encryption; and what an algorithm is, ending with a few lines of real code to read.</p>
<p>The exercises ask you to name parts, read sizes, convert binary numbers, fill in truth tables, put a web trip in order and spot a scam message. The figures let you click the parts of a computer, step a tiny processor through a program, flip the bits of a byte, draw a picture in pixels, mix colours, try the logic gates and an adder, send packets across a network, count password guesses, and steer a robot.</p>
<p>When you are done, the first lesson of any other course will make sense from its first line. <em>From Scratch to Python</em> (SC 100) and <em>Introduction to Python</em> (SC 101) are the usual next steps; <em>The Command Line</em> (SC 108) fits beside any of them.</p>`,
  outcomes: [
    'Name the parts of a computer (input, CPU, memory, storage, output, network) and say what each does',
    'Tell hardware from software, and an application from the operating system',
    'Explain what a CPU does in the fetch, decode and execute cycle, and what clock speed and cores mean',
    'Explain the difference between memory (RAM) and storage, and why one forgets when the power goes',
    'Read and write small binary numbers, and use bit, byte, kilobyte, megabyte and gigabyte correctly',
    'Describe what happens between writing a program and the computer running it',
    'Explain how text, pictures and sound are stored as numbers, and work out about how big a file will be',
    'Say what a logic gate is, and how a few gates add two binary numbers',
    'Describe how a message crosses the Internet: addresses, DNS, packets, routers, clients and servers',
    'Choose a strong password, recognise a phishing message, and say what updates and encryption do',
    'Say what an algorithm is, follow a list of exact steps, and read a few lines of Python'
  ],
  skills: [
    { id: 'four-jobs', name: 'Name the four jobs of a computer and the part that does each' },
    { id: 'ram-vs-storage', name: 'Tell memory (RAM) from storage' },
    { id: 'hw-sw', name: 'Tell hardware from software' },
    { id: 'cycle', name: 'Describe fetch, decode, execute; cores; clock speed' },
    { id: 'binary', name: 'Read and write small binary numbers' },
    { id: 'sizes', name: 'Use bytes, KB, MB and GB, and work out sizes' },
    { id: 'storage-types', name: 'Compare SSDs and hard disks' },
    { id: 'io', name: 'Sort devices into input and output' },
    { id: 'os', name: 'Say what the operating system does' },
    { id: 'compile-interpret', name: 'Tell a compiler from an interpreter; read an error' },
    { id: 'text-codes', name: 'Explain how text is stored as numbers' },
    { id: 'image-size', name: 'Work out the size of a picture from its pixels' },
    { id: 'sound', name: 'Explain how sound is measured and stored' },
    { id: 'switches', name: 'Say what a transistor is' },
    { id: 'gates', name: 'Work out the output of NOT, AND, OR and XOR gates' },
    { id: 'adding', name: 'Explain how gates add binary numbers' },
    { id: 'internet-web', name: 'Tell a network, the Internet and the web apart' },
    { id: 'addresses', name: 'Explain IP addresses and DNS' },
    { id: 'packets', name: 'Explain how packets and routers carry a message' },
    { id: 'web-request', name: 'Put the steps of a trip to a web page in order' },
    { id: 'passwords', name: 'Judge how strong a password is by counting guesses' },
    { id: 'threats', name: 'Recognise phishing and malware, and the habits that help' },
    { id: 'encryption', name: 'Say what encryption and the https padlock do and do not do' },
    { id: 'algorithm', name: 'Say what an algorithm is and follow exact steps' },
    { id: 'repeat', name: 'Use repeat to shorten a list of steps' },
    { id: 'read-code', name: 'Read a few lines of Python and say what they print' }
  ],
  affirm: ['Right.', 'Correct. That is how it works.', 'Yes. You know your way around the machine now.', 'Exactly right.', 'Correct, and worth remembering.'],
  howItWorks: `<h3>How to use these pages</h3><p>Read each lesson in order. The figures are interactive: click the parts, step the processor, flip the bits, send packets, steer a robot. Each lesson has quick checks to confirm an idea before moving on, and two graded exercises at the end. Two checkpoint lessons mix the questions of the unit before them. <b>Check answer</b> grades them on the spot; <b>Hint</b> helps, and <b>Solution</b> explains. Progress is saved on this device.</p>`,
  lessons: [
    /* ================================================================== */
    {
      standards: ['2-CS-02', '3A-CS-01'],
      title: 'The parts of a computer', summary: 'Input, processing, memory, storage and output; what is in the case; hardware and software.',
      blocks: [
        `<p>In February 1946 the United States Army showed reporters a machine that filled a room at the University of Pennsylvania: ENIAC, the first general-purpose electronic computer. It weighed thirty tons, held about eighteen thousand vacuum tubes, and could add five thousand numbers in a second, which was faster than anything before it by a thousand times. It had no keyboard and no screen. It was programmed by six women, Kay McNulty, Betty Jennings, Betty Snyder, Marlyn Wescoff, Fran Bilas and Ruth Lichterman, who set thousands of switches and plugged cables into panels by hand, working from the wiring diagrams because there was no manual.</p>
<p>The phone in your pocket is millions of times faster, and it is made of the same parts doing the same jobs. Learn the parts once and every computer, from ENIAC to a laptop to the chip in a washing machine, looks the same. So what are those parts, and what job does each one do?</p>`,
        { photo: 'eniac', caption: 'ENIAC at the Army\'s Ballistic Research Laboratory. Betty Snyder, one of the six programmers, stands in front; Glen Beck works at the panels behind. A program was the pattern of these cables and switches.' },
        `<h2>Four jobs</h2>
<p>Whatever a computer is doing, it is doing four things. It takes something <em>in</em>. It <em>processes</em> it: calculates, compares, decides. It <em>stores</em> things, for a moment or for years. And it puts something <em>out</em>. Type a word, and the keyboard is input, the processor works out which letters you meant, memory holds the document, the screen shows the letters: output.</p>
<div class="stmt"><p><span class="kind">Input</span> is anything that goes into the computer: keyboard, mouse, touchscreen, microphone, camera, a file arriving over the network.</p>
<p><span class="kind">Processing</span> is the work: arithmetic, comparing, moving data about. The CPU does it.</p>
<p><span class="kind">Storage</span> keeps things. Memory (RAM) keeps what is being worked on right now; the drive (SSD or hard disk) keeps files for years.</p>
<p><span class="kind">Output</span> is anything that comes out: the screen, speakers, a printer, a file sent over the network.</p></div>
<p>Here are the parts, drawn as they connect. Click each one.</p>`,
        { fig: 'parts', caption: 'The parts of a computer and how data moves between them. Everything inside the case goes through the CPU; input comes in from the left, output goes out to the right, and the network is both.' },
        { check: 'A student speaks into a laptop\'s microphone and the laptop shows the words on the screen. Which parts were input and output?', skill: 'four-jobs', options: ['Microphone: output; screen: input', 'Microphone: input; screen: output', 'Both are input; the CPU is the output', 'Both are output'], answer: 1, why: 'Sound went <em>in</em> through the microphone; the words came <em>out</em> on the screen. In between, the CPU processed the sound into text and memory held it.', wrong: ['It is the other way round: the microphone brings sound in.', '', 'The CPU processes; it never shows anything by itself.', 'The microphone takes sound in, which makes it input.'] },
        `<h2>Inside the case</h2>
<p>Open a desktop computer, or look at a picture of a laptop's insides, and you find a large flat board, the <em>motherboard</em>, with everything plugged into it. Three parts matter most.</p>
<p>The <em>CPU</em>, the central processing unit, is a chip about the size of a postage stamp under a metal lid, often with a fan on top because it gets hot. It carries out the instructions of every program. The next lesson is about it.</p>
<p>The <em>memory</em>, called RAM, is one or more thin sticks of chips next to the CPU. It holds the programs that are running and the data they are using, and it is fast: the CPU can reach anything in it in under a ten-millionth of a second. But it is <em>volatile</em>: when the power goes off, it is blank.</p>
<p>The <em>storage</em> is an SSD (a card of memory chips that remember without power) or a hard disk (a stack of spinning magnetic plates). It holds the operating system, the programs and your files, for years, with the power off. It is bigger than RAM, often dozens of times bigger, and slower.</p>
<div class="stmt"><p><span class="kind">Memory is not storage.</span> People say "memory" for both, and that causes most of the confusion in this subject. RAM is the desk you work at: fast, small, cleared every night. Storage is the filing cabinet: slow, big, permanent. Opening a file copies it from the cabinet to the desk; saving copies it back.</p></div>
<p>Around these sit the power supply, the graphics chip that draws the screen, the network chip, and the <em>ports</em>: USB, HDMI, headphone, the holes where the outside world plugs in.</p>`,
        { photo: ['pc-inside', 'raspberry-pi-4'], caption: 'Left: a home-built desktop computer seen through its side window. The CPU is under the round fan glowing green; the sticks of RAM stand just to its right; the long card across the middle is the graphics card; drives sit at the bottom. Right: a Raspberry Pi 4, a whole computer on one board the size of a bank card. The CPU is under the shiny metal square, the RAM is the black chip beside it, and the ports line the edges: USB and network on the right, power, two HDMI and headphones along the bottom.' },
        { check: 'You have been typing an essay for an hour and the power goes out before you saved. Where was the essay, and what happened to it?', skill: 'ram-vs-storage', options: ['In storage; it is safe', 'In RAM; it is gone', 'In the CPU; it is gone', 'On the screen; it is gone'], answer: 1, why: 'A document you are editing lives in RAM, which forgets when the power stops. Saving copies it to storage, which does not. (Many programs now save for you every few seconds, which is why this hurts less than it used to.)', wrong: ['It had not been saved, so it never reached storage.', '', 'The CPU works on a few numbers at a time; it does not hold a document.', 'The screen shows the document; it does not keep it.'] },
        `<h2>Hardware and software</h2>
<p>Everything you can touch is <em>hardware</em>: the chips, the drive, the screen, the cables. Everything the hardware does is told to it by <em>software</em>: programs, which are lists of instructions stored as data. Software has no weight and no shape; it is a pattern of bits in storage and memory, and the same hardware behaves as a calculator, a game or a word processor depending on which pattern it is running.</p>
<div class="stmt"><p><span class="kind">The operating system</span> (Windows, macOS, Linux, Android, iOS) is the software that runs first and runs always. It manages the hardware, keeps the files, and starts and stops the other programs.</p>
<p><span class="kind">Applications</span> are the programs you choose to run: a browser, a game, an editor. They ask the operating system for what they need (a window, a file, the network) rather than touching the hardware themselves.</p></div>
<p>Lesson 4 comes back to software and to how a program is made. First, the two parts that do the most work.</p>`,
        { check: 'Which of these is software?', skill: 'hw-sw', options: ['A USB stick', 'The Chrome browser', 'A touchscreen', 'A graphics card'], answer: 1, why: 'A browser is a program: instructions stored as data. The other three are things you can hold. (The USB stick is hardware; the files on it are software or data.)', wrong: ['You can hold it: hardware. What is stored on it is another matter.', '', 'The screen is hardware. The program that reads your taps is software.', 'A card with chips on it is hardware.'] },
        { ex: { id: 'cs-1-1', skill: 'four-jobs', kind: 'table', title: 'Which part does which job?', 
          prompt: '<p>For each device or part, write which of the four jobs it does: <b>input</b>, <b>processing</b>, <b>storage</b> or <b>output</b>. Use one word per blank.</p>',
          head: ['Part', 'Job'],
          rows: [
            ['a mouse', { a: 'input', name: 'mouse' }],
            ['the CPU', { a: 'processing', name: 'CPU' }],
            ['an SSD', { a: 'storage', name: 'SSD' }],
            ['a printer', { a: 'output', name: 'printer' }],
            ['RAM', { a: 'storage', name: 'RAM', why: { processing: 'RAM holds data; the CPU does the work on it.' } }],
            ['a webcam', { a: 'input', name: 'webcam' }],
            ['speakers', { a: 'output', name: 'speakers' }]
          ],
          hints: ['Input brings something in from a person or the world; output sends something out to a person; storage keeps; processing calculates.', 'RAM is storage too, the short-term kind: it keeps what is being worked on. The webcam brings pictures in.'],
          solution: '<p>Mouse: input. CPU: processing. SSD: storage. Printer: output. RAM: storage (short-term). Webcam: input. Speakers: output.</p>',
          followup: 'A network connection is the odd one out: it is input when a page arrives and output when you send a message. Which others in the list can go both ways? (A touchscreen is one.)' } },
        { ex: { id: 'cs-1-2', skill: 'hw-sw', kind: 'choice', title: 'Hardware or software', multi: true,
          prompt: '<p>Tick everything that is <b>software</b>.</p>',
          options: [
            { text: 'The operating system', ok: true },
            { text: 'A hard disk', why: 'Spinning plates in a metal box: hardware. The files on it are data and software.' },
            { text: 'A game', ok: true },
            { text: 'The motherboard', why: 'The board everything plugs into: hardware.' },
            { text: 'The Python program you will write in the next course', ok: true },
            { text: 'A keyboard', why: 'Keys and a circuit: hardware. The program that reads them is software.' }
          ],
          hints: ['Software is instructions stored as data; it has no weight.', 'The operating system and a game are both programs. So is anything you write in a programming language.'],
          solution: '<p>The operating system, a game and a program you write are software: instructions. A hard disk, a motherboard and a keyboard are hardware.</p>',
          followup: 'Name one piece of software that is running on the device you are reading this on right now that you did not start yourself.' } },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A computer takes <b>input</b>, <b>processes</b> it, <b>stores</b> things and produces <b>output</b>. Every device does those four jobs.</li>
<li>Inside the case: the <b>CPU</b> does the work, <b>RAM</b> holds what is being worked on (fast, small, forgets without power), <b>storage</b> keeps files and programs (big, slower, permanent). Memory is not storage.</li>
<li><b>Hardware</b> is what you can touch; <b>software</b> is the instructions it follows. The <b>operating system</b> runs first and manages everything; <b>applications</b> are the programs you choose.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-CS-02', '2-DA-07', '3A-DA-09'],
      title: 'The processor and memory', summary: 'What a CPU does: fetch, decode, execute; clock speed and cores; memory as numbered boxes; bits, bytes and binary.',
      blocks: [
        `<p>In 1971 a company called Intel, three years old, shipped a chip the size of a fingernail for a Japanese calculator. The 4004 held 2,300 transistors, the tiny switches a chip is made of, and ticked 740,000 times a second. It was the first complete processor on one chip. The processor in a new phone holds billions of transistors and ticks several billion times a second, and it still does what the 4004 did: fetch an instruction from memory, work out what it means, carry it out, and go on to the next. So what exactly does a processor do, and where does it find its instructions?</p>`,
        { photo: ['intel-4004', 'wafer-486'], caption: 'Left: an Intel 4004, the 1971 processor of the story. The chip itself is under the gold lid; the sixteen legs carry its signals to the rest of the calculator. Right: how chips are made, a silicon wafer six inches across, partway through becoming a couple of hundred Intel 486 processors. Each small rectangle is one processor; they are cut apart and each sealed in its own case.' },
        `<h2>What the CPU does</h2>
<p>A program is a list of instructions in memory. The CPU has a few small storage places of its own, called <em>registers</em>. One of them, the <em>program counter</em>, holds the address of the next instruction. The CPU repeats three steps, for as long as the power is on:</p>
<div class="stmt"><p><span class="kind">Fetch.</span> Read the instruction at the address in the program counter, and move the counter on by one.</p>
<p><span class="kind">Decode.</span> Work out what the instruction asks for: add, compare, copy, jump somewhere else.</p>
<p><span class="kind">Execute.</span> Do it.</p></div>
<p>That is all a CPU is: a machine that does this cycle, billions of times a second, never understanding any of it. Step the one below through a four-instruction program that adds two numbers. The instructions are at addresses 0 to 3; the numbers are at 5 and 6.</p>`,
        { fig: 'cpu', caption: 'A tiny CPU. PC is the program counter, IR holds the instruction being worked on, ACC (the accumulator) holds the number being worked with. LOAD copies a memory cell into ACC, ADD adds one to it, STORE copies ACC into a cell, HALT stops. Press Step and watch the three phases.' },
        { photo: 'ibm-7094-console', caption: 'The registers of a real CPU, in lights: the operator\'s console of an IBM 7094, a large computer of the early 1960s. Look for the rows labelled INSTRUCTION COUNTER (its program counter) and ACCUMULATOR: each little lamp showed one bit, lit for 1. The row of switches along the front could set one 36-bit word by hand.' },
        `<p>Every instruction a real CPU runs is as small as these: add, subtract, compare two numbers, copy a value from memory to a register or back, jump to another instruction if a comparison came out a certain way. A program that shows a photo on a screen is millions of such steps; the CPU does not know it is a photo.</p>
<p><em>Clock speed</em> says how many cycles the CPU's clock ticks in a second: 3 GHz is three billion ticks, and a simple instruction takes about one. A <em>core</em> is a complete CPU; a chip with eight cores can run eight instruction streams at once, which is why your computer can play music, download a file and let you type without taking turns.</p>`,
        { check: 'In the fetch-decode-execute cycle, what does the program counter hold?', skill: 'cycle', options: ['How many programs are running', 'The result of the last addition', 'The address of the next instruction to fetch', 'The clock speed'], answer: 2, why: 'The program counter is the CPU\'s bookmark: the memory address of the next instruction. Fetching reads that instruction and moves the counter on; a jump instruction changes the counter to somewhere else.', wrong: ['That is the operating system\'s business, not a register.', 'That is the accumulator (ACC) in the figure.', '', 'Clock speed is a property of the chip, not something stored in a register.'] },
        `<h2>Memory is numbered boxes</h2>
<p>Memory (RAM) is a very long row of boxes, each holding one <em>byte</em>, each with an <em>address</em>: box 0, box 1, box 2, and so on up to billions. The CPU says "give me the byte at address 4,000,123" and gets it back in under a ten-millionth of a second. Everything in memory, instructions and data alike, is just bytes in boxes; what makes a byte an instruction is only that the program counter happens to point at it.</p>
<div class="stmt"><p><span class="kind">Memory is volatile.</span> RAM holds its bytes only while powered. That is why a computer "boots" when switched on: the operating system has to be copied from storage into memory before anything can run, and why unsaved work is lost in a power cut.</p>
<p><span class="kind">Sizes.</span> A laptop today has 8 to 32 gigabytes of RAM: eight to thirty-two billion boxes. Its storage is usually 256 gigabytes to 2 terabytes.</p></div>
<h2>Bits and bytes</h2>
<p>What is in a box? Eight switches, each either off or on, 0 or 1. One switch is a <em>bit</em>. Eight bits are a <em>byte</em>. With eight switches you can make 256 different patterns, and a pattern can stand for a number from 0 to 255, or a letter (the pattern 01000001 is "A" in the ASCII code), or part of a colour, or part of an instruction. The computer does not know which; the program does. A switch can be anything with two states: in the memory of the 1950s and 1960s each bit was a tiny magnetic ring, magnetised one way for 0 and the other way for 1.</p>`,
        { photo: 'core-memory', caption: 'Magnetic-core memory, close up. Every one of these rings, threaded on a grid of fine wires, held one bit.' },
        `<p>A pattern of bits is read as a number in <em>binary</em>: each switch is worth twice the one to its right, 1, 2, 4, 8, 16, 32, 64, 128, and the number is the sum of the switches that are on. Flip these.</p>`,
        { fig: 'bits', value: 65, caption: 'One byte. Start: 01000001, which is 64 + 1 = 65, the code for the letter A. Try making 10, then 255, then 128.' },
        `<div class="stmt"><p><span class="kind">The sizes you will hear.</span> 1 kilobyte (KB) is about a thousand bytes: a short email. 1 megabyte (MB) is about a million: a minute of music, or a small photo. 1 gigabyte (GB) is about a billion: an hour of video. 1 terabyte (TB) is about a trillion: a large drive. (Computers often count in 1,024s rather than 1,000s, which is why a "500 GB" drive shows as 465 GB; the lesson on storage comes back to it.)</p></div>`,
        { check: 'What number is the binary pattern 00001010?', skill: 'binary', options: ['2', '10', '12', '1010'], answer: 1, why: 'The switches that are on are worth 8 and 2 (counting from the right: 1, 2, 4, 8). 8 + 2 = 10. The pattern happens to look like "1010", but that is not its value.', wrong: ['Two switches are on, but their values are 8 and 2, and the number is the sum.', '', '12 would be 8 + 4: pattern 00001100.', 'That is the pattern read as decimal digits, not as binary.'] },
        { check: 'How many different values can one byte hold?', skill: 'binary', options: ['8', '100', '255', '256'], answer: 3, why: 'Eight switches, each with two settings: 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 256 patterns, numbered 0 to 255. (255 is the largest value, not the number of values.)', wrong: ['Eight is the number of bits, not of patterns.', 'A hundred is a round number, but eight switches make 256 patterns.', '255 is the largest value; counting 0 as well there are 256.', ''] },
        { ex: { id: 'cs-2-1', skill: 'binary', kind: 'answer', title: 'Binary and sizes',
          prompt: '<p>Write a number in each box.</p>',
          parts: [
            { label: '(a) The value of the byte 00000111', answer: '7', width: '6rem', wrong: [{ match: '111', msg: 'That is the pattern read as decimal digits. In binary the three switches are worth 4, 2 and 1.' }] },
            { label: '(b) The value of the byte 10000001', answer: '129', width: '6rem', wrong: [{ match: '81', msg: 'The leftmost switch is worth 128, not 80.' }, { match: '10000001', msg: 'Read it as binary: which switches are on, and what are they worth?' }] },
            { label: '(c) The byte for the number 5, as eight digits', answer: ['00000101', '101'], width: '8rem', wrong: [{ match: '00000011', msg: 'That is 2 + 1 = 3. Five is 4 + 1.' }] },
            { label: '(d) How many bits are in 4 bytes?', answer: '32', width: '6rem', wrong: [{ match: '4', msg: 'Each byte is 8 bits.' }] },
            { label: '(e) A 3 GHz CPU ticks about how many times in one second? (a whole number)', answer: ['3000000000', '3,000,000,000', '3e9'], width: '10rem', wrong: [{ match: ['3000000', '3,000,000'], msg: 'Giga is a billion, not a million.' }, { match: '3', msg: 'The unit is hertz, ticks per second; giga means a billion of them.' }] }
          ],
          hints: ['From the right, the switches are worth 1, 2, 4, 8, 16, 32, 64, 128. Add up the ones that are on.', 'To write a number in binary, find the largest power of two that fits, switch it on, and do the same with what is left.'],
          solution: '<p>(a) 4 + 2 + 1 = 7. (b) 128 + 1 = 129. (c) 5 = 4 + 1, so 00000101. (d) 4 × 8 = 32. (e) Three billion: 3,000,000,000.</p>',
          followup: 'What is the largest number a byte can hold, and what pattern is it? What is the largest number two bytes together can hold?' } },
        { ex: { id: 'cs-2-2', skill: 'cycle', kind: 'choice', title: 'The cycle',
          prompt: '<p>The tiny CPU in the figure is about to run <code>ADD 6</code>, with 3 in ACC and 4 in memory cell 6. Which statement is correct about what happens?</p>',
          options: [
            { text: 'During fetch, the CPU adds 3 and 4.', why: 'Fetch only reads the instruction from memory into IR. The adding is the execute step.' },
            { text: 'After decode, the CPU knows it must add the contents of cell 6 to ACC; after execute, ACC holds 7.', ok: true },
            { text: 'After execute, memory cell 6 holds 7.', why: 'ADD changes ACC, not memory. STORE is the instruction that writes to memory.' },
            { text: 'The program counter now points back at address 0.', why: 'Fetch moved the counter on by one. Only a jump instruction sends it somewhere else.' }
          ],
          hints: ['Step the figure to the ADD instruction and watch the three phases.', 'Fetch reads, decode understands, execute acts. ADD acts on ACC.'],
          solution: '<p>Fetch copies <code>ADD 6</code> into IR and moves PC on. Decode works out that the instruction means "add memory[6] to ACC". Execute does it: ACC becomes 3 + 4 = 7. Memory cell 6 still holds 4; only STORE writes to memory.</p>',
          followup: 'Write, in the same four-instruction style, a program that adds three numbers stored at 5, 6 and 7 and puts the sum in cell 8.' } },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A CPU repeats <b>fetch, decode, execute</b> billions of times a second. The <b>program counter</b> holds the address of the next instruction; <b>registers</b> hold the few values being worked on.</li>
<li><b>Clock speed</b> (GHz, billions of ticks a second) is how fast the cycle runs; a <b>core</b> is a whole CPU, and a chip has several.</li>
<li><b>Memory</b> is numbered boxes of one byte each. It is <b>volatile</b>: emptied without power, which is why computers boot and unsaved work is lost.</li>
<li>A <b>bit</b> is a switch, 0 or 1; a <b>byte</b> is eight, with 256 patterns. Read as <b>binary</b>, each switch is worth twice the one to its right. KB, MB, GB, TB are about a thousand, a million, a billion and a trillion bytes.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-CS-02', '3A-DA-10', '3B-CS-01'],
      title: 'Storage, input and output', summary: 'Hard disks and SSDs; files and folders; file sizes; the devices that bring data in and send it out; the network.',
      blocks: [
        `<p>In 1956 IBM delivered the first computer hard disk, the 350, to a customer: fifty metal plates two feet across, spinning in a cabinet the size of two refrigerators, with a reading arm that moved between them. It stored about five million characters, roughly the text of a long novel, and it was leased for thousands of dollars a month. A microSD card today, the size of a fingernail, holds a hundred thousand times as much and costs about as much as a meal out. The job has not changed: keep the bits when the power is off. So where do all those bits live, and how do they get in and out?</p>`,
        { photo: ['ibm-350-disk', 'hard-disk-open'], caption: 'Left: the disk unit of an IBM 350, the first hard disk, now in the Computer History Museum, with its tall stack of plates. Right: a 500 GB laptop hard disk, opened: one plate and one reading arm, the same idea holding a hundred thousand times as much.' },
        `<h2>Storage</h2>
<p>A <em>hard disk drive</em> (HDD) still works the way the 350 did: magnetic plates spin at thousands of turns a minute and a head floats over them reading and writing the bits. It is cheap for its size and slow, and it dislikes being dropped. A <em>solid-state drive</em> (SSD) has no moving parts: memory chips that keep their bits without power. It is faster, quieter and tougher, and almost every laptop and phone uses one. Both do the same job: hold the operating system, the programs and your files, for years. Disks still carry the biggest loads: in 2017 the eight telescopes that made the first picture of a black hole each recorded about 350 terabytes a day onto hard disks, and the disks were flown to the supercomputers that combined them.</p>`,
        { photo: 'black-hole-m87', caption: 'The result: the first picture of a black hole, in the galaxy Messier 87, released in 2019. The dark centre is the shadow of the black hole.' },
        `<div class="stmt"><p><span class="kind">A file</span> is a named sequence of bytes on storage. A photo, a song, an essay and a program are all files; what differs is what the bytes mean and which program knows how to read them. The <em>extension</em> after the dot, <code>.jpg</code>, <code>.mp3</code>, <code>.txt</code>, <code>.py</code>, is a hint about that.</p>
<p><span class="kind">A folder</span> (directory) is a named list of files and other folders. Folders inside folders make the tree that every file lives in; <em>The Command Line</em> course is largely about moving through it.</p></div>
<p>File sizes are measured in bytes. A text file is small: this lesson is about 10 KB. A photo from a phone is 2 to 5 MB. An hour of video is a few GB. A game can be 100 GB. Storage is sold by the same units: a 512 GB SSD holds over a hundred thousand photos, or five such games.</p>`,
        { check: 'Which statement about SSDs and hard disks is true?', skill: 'storage-types', options: ['A hard disk keeps data without power; an SSD does not', 'Both keep data without power; the SSD has no moving parts and is faster', 'An SSD is the same thing as RAM', 'A hard disk is faster because it spins'], answer: 1, why: 'Both are storage: permanent. The difference is in how: the hard disk reads spinning magnetic plates, the SSD reads chips, which is faster and quieter.', wrong: ['Both keep data without power; that is what storage means.', '', 'RAM is memory and forgets without power. An SSD is made of a different kind of chip that remembers.', 'The spinning is what makes it slow: the head has to wait for the right spot to come round.'] },
        `<h2>Input and output devices</h2>
<p>Every way into a computer is an input device, and every way out is an output device. Some are obvious: keyboard, mouse, touchpad, microphone, camera, scanner in; screen, speakers, printer, the vibration motor in a phone out. A touchscreen is both: it shows (output) and it feels (input). Each device has a chip of its own that turns the physical thing, a key going down, light on a sensor, into bytes the CPU can read, or bytes into light and sound.</p>
<div class="stmt"><p><span class="kind">Everything is bytes on the way in and bytes on the way out.</span> A pressed key becomes a number (the code for "A" is 65); a photo becomes millions of numbers, three per dot for red, green and blue; a sound becomes tens of thousands of numbers a second. On the way out, numbers become light and sound again. In between, the CPU only ever sees numbers.</p></div>
<p>The <em>network</em> is the input and output device that reaches other computers: Wi-Fi, a cable, mobile data. A web page is a file sent from a computer somewhere else into your memory, byte by byte; sending a message is the reverse. To the computer the internet is not a place; it is a very long cable with other computers at the far end.</p>`,
        { photo: 'data-centre-cern', caption: 'Some of the computers at the far end: a server room at CERN, the physics laboratory in Switzerland where the World Wide Web was invented. Each cabinet is full of computers with no screen or keyboard, answering requests that arrive over the network.' },
        { check: 'A touchscreen is', skill: 'io', options: ['An input device only', 'An output device only', 'Both an input and an output device', 'Storage'], answer: 2, why: 'It shows the picture (output) and senses your finger (input). Two devices in one sheet of glass.', wrong: ['It also shows the picture.', 'It also feels your finger.', '', 'It keeps nothing when the power is off.'] },
        `<h2>Why 500 GB is 465 GB</h2>
<p>Drive makers count in thousands: a kilobyte is 1,000 bytes, a gigabyte 1,000,000,000. Computers, which count in binary, find 1,024 (that is 2 to the power 10) more natural, and operating systems often report sizes in units of 1,024. A drive sold as 500,000,000,000 bytes is 500 GB by the first count and 465.7 by the second. Nothing is missing; the two sides are using the same word for slightly different units. Some systems write the binary units as KiB, MiB, GiB to be clear.</p>`,
        { check: 'A phone photo is about 4 MB. About how many fit on a 64 GB card with nothing else on it?', skill: 'sizes', options: ['160', '1,600', '16,000', '160,000'], answer: 2, why: '64 GB is 64,000 MB, and 64,000 ÷ 4 = 16,000 photos. (Counting in 1,024s changes the answer by a few per cent, not by a factor of ten.)', wrong: ['That would be a 640 MB card.', 'That would be a 6.4 GB card.', '', 'That would need 640 GB.'] },
        { ex: { id: 'cs-3-1', skill: 'sizes', kind: 'answer', title: 'Sizes and devices',
          prompt: '<p>Answer each with a number or a word. Use 1,000 for the kilo, mega and giga steps.</p>',
          parts: [
            { label: '(a) How many megabytes are in 2 gigabytes?', answer: ['2000', '2,000'], width: '6rem', wrong: [{ match: ['2048'], msg: 'Right in binary units; this question asked for thousands. 2 × 1,000.' }, { match: '200', msg: 'A gigabyte is a thousand megabytes.' }] },
            { label: '(b) A song is 5 MB. How many songs fit in 1 GB?', answer: '200', width: '6rem', wrong: [{ match: '20', msg: '1 GB is 1,000 MB. 1,000 ÷ 5.' }] },
            { label: '(c) An essay of 3,000 characters, one byte each, is about how many kilobytes?', answer: '3', width: '6rem', wrong: [{ match: '3000', msg: 'That is bytes. A kilobyte is a thousand of them.' }] },
            { label: '(d) Which kind of drive has spinning plates: HDD or SSD?', answer: ['HDD', 'hard disk', 'hard disk drive', 'hard drive'], width: '8rem' },
            { label: '(e) Which part forgets everything when the power goes: RAM or storage?', answer: ['RAM', 'memory'], width: '8rem' }
          ],
          hints: ['Kilo, mega, giga: each is a thousand of the one before. Divide the big size by the small size to see how many fit.', 'HDD is hard disk drive: the one with plates. RAM is the memory that is wiped without power.'],
          solution: '<p>(a) 2,000. (b) 1,000 ÷ 5 = 200. (c) 3,000 bytes is 3 KB. (d) HDD. (e) RAM.</p>',
          followup: 'Find out how much RAM and how much storage the device you are using has (its settings say), and work out the ratio between them.' } },
        { ex: { id: 'cs-3-2', skill: 'io', kind: 'choice', title: 'In or out', multi: true,
          prompt: '<p>Tick every device that is an <b>input</b> device (bringing data into the computer). Some devices are both; tick those too.</p>',
          options: [
            { text: 'Keyboard', ok: true },
            { text: 'Printer', why: 'A printer only puts things out, onto paper.' },
            { text: 'Microphone', ok: true },
            { text: 'Speakers', why: 'Sound goes out through them, never in.' },
            { text: 'Touchscreen', ok: true },
            { text: 'Camera', ok: true },
            { text: 'A network connection', ok: true }
          ],
          hints: ['Ask: does data go from the world into the computer through it?', 'A touchscreen and a network connection go both ways, so they count.'],
          solution: '<p>Keyboard, microphone, touchscreen, camera and the network bring data in. The printer and the speakers only send it out. The touchscreen and the network are both input and output.</p>',
          followup: 'Which devices on a phone are output devices that are not a screen or a speaker? (There are at least two.)' } },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><b>Storage</b> keeps bytes without power: hard disks (spinning plates, cheap, slow) and SSDs (chips, fast, tough). A <b>file</b> is a named sequence of bytes; a <b>folder</b> holds files and folders.</li>
<li>Sizes: KB, MB, GB, TB, each about a thousand times the last; computers often count in 1,024s, which is why a 500 GB drive reports 465.</li>
<li><b>Input devices</b> turn the world into bytes, <b>output devices</b> turn bytes back into light and sound; a touchscreen and the <b>network</b> are both.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-CS-01', '3A-CS-02', '3B-CS-01'],
      title: 'Software: from your program to the chip', summary: 'What the operating system does; what a program is; how a programming language becomes instructions the CPU can run; and the three facts to carry on.',
      blocks: [
        `<p>In 1952 Grace Hopper, a mathematician and Navy officer working on one of the first commercial computers, the UNIVAC, wrote a program whose job was to write programs. Until then, most programs were written by hand as numbers. Hopper's program, which she called a <em>compiler</em>, took short codes and turned them into those numbers. At first nobody would use it: computers, she was told, could only do arithmetic. Later her team built a language of English words, and by the end of the decade her ideas had become COBOL, a language in which banks and governments wrote programs for the next sixty years. The programs you are about to write will go through a descendant of her idea every time you press Run. So what happens between pressing Run and the chip doing the work?</p>`,
        `<h2>The operating system</h2>
<p>When a computer starts, the first software to run is the <em>operating system</em>: Windows, macOS or Linux on a computer, Android or iOS on a phone. It stays running until the power goes off, and it does three jobs that every other program depends on.</p>
<div class="stmt"><p><span class="kind">It runs the programs.</span> It loads a program from storage into memory, gives it a share of the CPU's time, and takes the memory back when the program ends. Dozens of programs run "at once" because the operating system switches the CPU between them thousands of times a second.</p>
<p><span class="kind">It keeps the files.</span> Programs ask it for "the file called essay.txt"; it knows where on the drive the bytes are.</p>
<p><span class="kind">It owns the hardware.</span> A program that wants to draw on the screen, read the keyboard or send a message over the network asks the operating system, which does it on the program's behalf. That is why one badly written program does not take the whole machine down with it.</p></div>`,
        { check: 'Why can a computer run a browser, a music player and a download at the same time on one CPU core?', skill: 'os', options: ['The CPU runs three instructions at once', 'The operating system switches the CPU between the programs thousands of times a second', 'Each program has its own CPU', 'The browser runs the other two'], answer: 1, why: 'One core runs one instruction stream at a time. The operating system gives each program a slice of a few milliseconds and switches, so quickly that all three seem to run together. More cores let it really run several at once.', wrong: ['A core does one instruction stream at a time; the trick is in the switching.', '', 'Programs share the cores; they do not own them.', 'Programs do not run each other; the operating system runs them all.'] },
        `<h2>What a program is</h2>
<p>A program is a list of instructions for the CPU, stored as bytes in a file. When you double-click it, the operating system copies the bytes into memory, points the program counter at the first instruction, and the cycle from lesson 2 begins.</p>
<p>But nobody writes those bytes by hand any more. You write <em>source code</em>: text, in a programming language such as Python, Java or C++, that people can read. Source code can be enormous: printed out, the code that Margaret Hamilton and her team at MIT wrote for the Apollo spacecraft that took astronauts to the Moon made a stack as tall as she was. Something has to turn that text into the numbers the CPU runs. There are two ways.</p>`,
        `<div class="stmt"><p><span class="kind">A compiler</span> reads your whole program, checks it, and translates it once into a file of CPU instructions. You then run that file; the compiler is no longer needed. C++ and Java work this way (Java's compiler produces instructions for a "virtual machine", a program that then runs them).</p>
<p><span class="kind">An interpreter</span> reads your program one statement at a time and carries each one out as it goes, every time you run it. Python works this way. It starts faster and shows errors where they happen, and the program runs more slowly.</p></div>`,
        { fig: 'pipeline', caption: 'From source code to a running program, the compiled way: the text you write, a compiler that checks and translates it, a file of machine instructions, and the CPU that runs them. With an interpreter the middle two steps happen while the program runs.' },
        `<p>Either way, the computer does exactly what the program says, which is not always what the programmer meant. A mistake in a program is a <em>bug</em>, and finding and fixing bugs is a large part of programming at every level. The compiler or interpreter catches some: a misspelled word, a missing bracket. The others show up only when the program runs and does the wrong thing, and those are the ones every programmer learns to hunt.</p>`,
        { photo: 'first-computer-bug', caption: 'The log book of the Harvard Mark II, 9 September 1947. The team found a moth stuck in relay 70 and taped it in: &quot;First actual case of bug being found.&quot; Engineers already called faults bugs; the joke was that this one was real.' },
        { check: 'What does a compiler do?', skill: 'compile-interpret', options: ['Runs your program one line at a time', 'Translates your whole program into CPU instructions before it runs', 'Fixes the bugs in your program', 'Copies the program from storage into memory'], answer: 1, why: 'A compiler translates once, ahead of time, and checks the program as it goes. Running one line at a time is an interpreter; copying into memory is the operating system\'s job; fixing bugs is yours.', wrong: ['That is an interpreter.', '', 'It reports some mistakes; it fixes none.', 'That is the operating system, when you start a program.'] },
        `<h2>Three facts to carry on</h2>
<p>So far this course has been about the machine and the software that runs on it. Programming is about telling it what to do, and everything after this is built on three facts you now know.</p>
<p>First, the computer does only what it is told, in order, one small step at a time: the fetch-decode-execute cycle has no imagination. A program is a precise list of steps, and writing one is mostly thinking about the steps.</p>
<p>Second, everything is bytes. Text, numbers, pictures, the program itself: all patterns in memory, and the program decides what they mean. A programming language gives you names for them, <em>variables</em>, so you never have to think about addresses.</p>
<p>Third, the computer tells you when you are wrong, in its own words. "Syntax error", "name is not defined", "no such file or directory": each message is precise, and reading it carefully is the skill that separates people who get stuck from people who get on.</p>`,
        { check: 'You press Run on a Python program with a misspelled command on line 3. What happens?', skill: 'compile-interpret', options: ['The CPU skips line 3 and goes on', 'The interpreter stops at line 3 and prints an error naming it', 'The operating system fixes the spelling', 'The program runs, but slowly'], answer: 1, why: 'The interpreter carries out statements one at a time; when it reaches one it cannot understand it stops and tells you where. Reading that message is the first thing to learn.', wrong: ['Nothing is skipped: the computer does what it is told, and here it was told something it cannot do.', '', 'The operating system runs programs; it does not read them.', 'It does not slow down. It stops at the line it cannot understand.'] },
        { ex: { id: 'cs-4-1', skill: 'os', kind: 'table', title: 'Who does the job?',
          prompt: '<p>For each task, write which does it: the <b>hardware</b>, the <b>operating system</b>, an <b>application</b>, or the <b>compiler</b>. One word per blank (write <code>OS</code> or <code>operating system</code> for the operating system).</p>',
          head: ['Task', 'Who'],
          rows: [
            ['adds two numbers in a register', { a: ['hardware', 'CPU'], name: 'adding in a register' }],
            ['finds where on the drive essay.txt is stored', { a: ['OS', 'operating system'], name: 'finding a file' }],
            ['lets you edit a photo', { a: ['application', 'app', 'program'], name: 'editing a photo' }],
            ['translates source code into CPU instructions', { a: 'compiler', name: 'translating source code' }],
            ['switches the CPU between the programs that are running', { a: ['OS', 'operating system'], name: 'switching between programs' }],
            ['shows the browser on the screen when you click its icon', { a: ['OS', 'operating system'], name: 'starting a program', why: { application: 'The browser is the application; the thing that starts it when you click is the operating system.' } }]
          ],
          hints: ['The hardware does arithmetic and nothing else. The operating system runs programs, keeps files and owns the hardware. Applications are the programs you choose. The compiler translates.', 'Starting a program, finding a file and switching between programs are the three jobs of the operating system.'],
          solution: '<p>Adding: hardware (the CPU). Finding the file: operating system. Editing a photo: an application. Translating: the compiler. Switching: operating system. Starting the browser: operating system.</p>',
          followup: 'When you press Run in one of these lessons, which of the four does each of these: checks your program, runs it, draws the output on the screen?' } },
        { ex: { id: 'cs-4-2', skill: 'compile-interpret', kind: 'choice', title: 'The whole journey',
          prompt: '<p>You write a Python program in an editor, save it, and run it. Which list puts the steps in the right order?</p>',
          options: [
            { text: 'The CPU runs the text you typed directly; the interpreter saves the file; the operating system shows the output.', why: 'The CPU cannot run text. Something must translate or interpret it first.' },
            { text: 'The editor saves the text to storage as a file; the operating system loads the interpreter into memory; the interpreter reads your file and carries out each statement, asking the operating system to print the output.', ok: true },
            { text: 'The compiler saves the file; the CPU reads it from storage one letter at a time; the screen shows the result.', why: 'Python uses an interpreter, and the CPU never reads a file by itself: the operating system loads things into memory.' },
            { text: 'The operating system translates the program into binary and stores it in RAM for ever.', why: 'The operating system runs programs; it does not translate them, and RAM keeps nothing for ever.' }
          ],
          hints: ['Storage keeps the file; memory holds what runs; the interpreter runs the program; the operating system starts programs and owns the screen.', 'Follow the bytes: file on the drive, program in memory, statements carried out, output drawn.'],
          solution: '<p>Saving writes your text to storage as a file. Running asks the operating system to start the interpreter, which it loads into memory. The interpreter reads the file and carries out each statement in turn, and when a statement prints something it asks the operating system to draw it on the screen.</p>',
          followup: 'Which of the steps in this journey happen in storage, which in memory, and which on the CPU?' } },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>The <b>operating system</b> runs programs (switching the CPU between them), keeps the files, and owns the hardware on the programs' behalf.</li>
<li>A <b>program</b> is CPU instructions in a file. You write <b>source code</b>; a <b>compiler</b> translates it once ahead of time (C++, Java), an <b>interpreter</b> carries it out statement by statement (Python).</li>
<li>A <b>bug</b> is a mistake in a program. Some are caught before it runs; the rest show up as wrong behaviour. Error messages are precise: read them.</li>
<li>Three facts to carry into programming: the computer does exactly what it is told, in order; everything is bytes and the program gives them meaning; the messages tell you where you went wrong.</li>
</ul><p>So what happens between pressing Run and the chip doing the work? The operating system loads the program into memory, an interpreter or a compiled file turns it into steps, and the CPU runs them. A checkpoint on these four lessons comes next.</p></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['2-CS-02', '3A-CS-01', '3A-CS-02', '3B-CS-01', '3A-DA-10'],
      title: 'Checkpoint one', checkpoint: true, summary: 'No new ideas: mixed questions on the parts of a computer, the processor and memory, storage, and software. Which part does the job? What is lost in a power cut?',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions from the first four lessons, because telling apart ideas that sound alike, such as memory and storage, or a compiler and an interpreter, is a skill of its own, and it only grows when the questions are mixed. Answer each one before looking back. Every question you answer here comes back on the Review page after a day, then a few days, then weeks, which is how it stays learned.</p>
<p>Ready? The first question is about a watch.</p>
<h2>Mixed questions</h2>`,
        { check: `A fitness watch counts your steps and shows the number on its screen. Which part is the output?`, skill: 'four-jobs', options: [`The motion sensor`, `The number on the screen`, `The counting`, `The battery`], answer: 1, wrong: [`The sensor takes the movement in. That is input.`, null, `Counting is the processing, done by the chip.`, `The battery supplies power. It is not one of the four jobs.`], why: `Input is what comes in (movement), processing is the work (counting), and output is what goes out (the number on the screen).` },
        { check: `A laptop has 16 GB of RAM and a 1 TB SSD. You install a 50 GB game. Where does the game live while you are not playing it, and what happens when you play?`, skill: 'ram-vs-storage', options: [`It lives in storage; the parts being used are copied into RAM`, `It lives in RAM; it is copied to storage when you play`, `It lives in the CPU; it is copied into RAM`, `It lives in storage and runs straight from there, without RAM`], answer: 0, wrong: [null, `RAM is emptied when the power goes off, and 50 GB would not even fit in 16 GB. The game would be gone every night.`, `The CPU holds only a few values at a time, in registers. It has no room for a game.`, `The CPU can only work on what is in memory. Everything that runs is first copied into RAM, the desk, from storage, the filing cabinet.`], why: `Storage is the filing cabinet: big and permanent, so the game lives there. RAM is the desk: fast and small, so the parts you are using are copied onto it.` },
        { check: `A processor is described as "3 GHz, 4 cores". What does "4 cores" mean?`, skill: 'cycle', options: [`Four complete CPUs on one chip, each able to follow its own program`, `One CPU that ticks four times faster`, `Four gigabytes of memory`, `It can run four programs at most`], answer: 0, wrong: [null, `Speed is the 3 GHz. Cores are about how many CPUs there are, not how fast each one ticks.`, `Memory is a separate part, measured in gigabytes of RAM.`, `The operating system switches between programs, so far more than four can be open at once. Four is how many can truly run at the same instant.`], why: `A core is a whole CPU. Four cores can run four instruction streams at the same moment, each doing fetch, decode and execute.` },
        { check: `What number is the binary pattern 00010100?`, skill: 'binary', options: [`20`, `24`, `10100`, `36`], answer: 0, wrong: [null, `24 is 16 + 8, the pattern 00011000. Here the switches worth 16 and 4 are on.`, `That is the pattern read as an ordinary decimal number. In binary each switch is worth twice the one to its right.`, `36 is 32 + 4, the pattern 00100100. Check which two switches are on.`], why: `The switches worth 16 and 4 are on: 16 + 4 = 20.` },
        { check: `A song file is about 4 MB. About how many such songs fit in 1 GB?`, skill: 'sizes', options: [`4`, `25`, `250`, `4,000`], answer: 2, wrong: [`That would be 4 GB, not 1 GB. A gigabyte is a thousand megabytes.`, `25 songs would be 40 MB each. Divide 1,000 MB by 4 MB.`, null, `4,000 songs of 4 MB would fill 16 GB, sixteen times too much.`], why: `1 GB is about 1,000 MB, and 1,000 divided by 4 is 250.` },
        { check: `Which of these is an output device and not an input device?`, skill: 'io', options: [`A webcam`, `A speaker`, `A touchscreen`, `A scanner`], answer: 1, wrong: [`A webcam takes pictures in. That is input.`, null, `A touchscreen is both: it shows pictures and feels touches.`, `A scanner reads paper in. That is input.`], why: `A speaker turns numbers into sound. Nothing comes back into the computer through it.` },
        { check: `Which job is NOT done by the operating system?`, skill: 'os', options: [`Switching the CPU between programs`, `Keeping track of where files are on the drive`, `Writing the essay you are typing`, `Letting programs use the screen`], answer: 2, wrong: [`This is one of its three main jobs: running the programs.`, `This is one of its three main jobs: keeping the files.`, null, `Programs ask the operating system to draw on the screen for them. That is its job of owning the hardware.`], why: `The essay is written by you, in an application. The operating system runs the application, keeps the file, and draws on the screen for it.` },
        { check: `A Python program prints two lines and then stops with an error on line 3. Why did the first two lines print?`, skill: 'compile-interpret', options: [`The interpreter carries out one statement at a time, so it ran lines 1 and 2 before it met line 3`, `The compiler checked only lines 1 and 2`, `The CPU runs a program backwards`, `RAM filled up at line 3`], answer: 0, wrong: [null, `A compiler checks the whole program before it runs anything. Python uses an interpreter.`, `A program runs in order, from the first instruction to the last.`, `A program with an error in the text does not run out of memory. The interpreter simply cannot understand line 3.`], why: `An interpreter works through the program statement by statement. It did lines 1 and 2, then reached a statement it could not carry out and told you where.` },
        `<p>Two more to finish the unit. The first follows one key press through the whole machine. The second sorts descriptions into memory and storage.</p>`,
        {
          ex: {
            id: 'cs-5-1', kind: 'choice', skill: 'four-jobs', title: 'Follow a key press',
            prompt: `<p>You press the letter <b>A</b> in a text editor, and an A appears on the screen. Which account is right?</p>`,
            options: [
              { text: `The keyboard sends a code for A to the computer. A program in RAM, run by the CPU, adds the letter to the document and asks the operating system to draw it. The screen shows it.`, ok: true },
              { text: `The keyboard draws the A on the screen directly.`, why: `An input device only sends a code in. Deciding what to do with it, and drawing it, is the work of a program.` },
              { text: `The SSD sends the A to the screen, because everything the computer shows comes from storage.`, why: `The letter you just typed has not been saved, so it is not on the SSD. It is in RAM.` },
              { text: `The CPU saves the A to storage first, and then the screen reads it from there.`, why: `Saving is a separate step you or the program choose. The screen is drawn from what is in memory.` }
            ],
            hints: [`Follow the four jobs in order: something comes in, something processes it, something holds it, something goes out.`, `A new letter has not been saved yet. Where do unsaved things live?`],
            solution: `<p>The keyboard is input: it sends a code. The CPU runs the editor, which is in RAM, and the editor stores the letter in the document, also in RAM. It asks the operating system to draw the letter; the screen is output. Nothing reaches storage until you save.</p>`,
            followup: `Now press Save. Which two parts talk to each other, and in which direction do the bytes go?`
          }
        },
        {
          ex: {
            id: 'cs-5-2', kind: 'table', skill: 'ram-vs-storage', title: 'Memory or storage?',
            prompt: `<p>For each description, write <b>RAM</b> if it describes memory, or <b>storage</b> if it describes the drive.</p>`,
            head: ['Description', 'RAM or storage?'],
            rows: [
              [`forgets everything when the power goes off`, { a: ['RAM', 'memory'], name: 'forgets everything' }],
              [`holds a 1 TB collection of films`, { a: ['storage', 'drive', 'SSD'], name: 'holds 1 TB' }],
              [`the CPU can reach it in billionths of a second`, { a: ['RAM', 'memory'], name: 'billionths of a second' }],
              [`where the operating system waits while the computer is switched off`, { a: ['storage', 'drive', 'SSD'], name: 'while switched off' }],
              [`holds the essay you are typing and have not saved`, { a: ['RAM', 'memory'], name: 'unsaved essay' }],
              [`a solid-state drive is one`, { a: ['storage', 'drive', 'SSD'], name: 'solid-state drive' }]
            ],
            hints: [`RAM is the desk: fast, small, emptied when the power goes. Storage is the filing cabinet: big, slower, permanent.`, `Ask of each description: does it survive a power cut? If yes, it is storage.`],
            solution: `<p>RAM: forgets when the power goes, reachable in billionths of a second, holds the unsaved essay. Storage: the 1 TB of films, the operating system while the computer is off, and the solid-state drive.</p>`,
            followup: `A phone says it has "8 GB memory and 256 GB storage". Which number is the RAM?`
          }
        },
        `<div class="recap"><h3>In this checkpoint</h3><ul>
<li>Every device does four jobs: input, processing, storage, output. Name the part before you answer.</li>
<li>RAM is the desk: fast, small, forgets. Storage is the cabinet: big, slower, keeps. Things run from RAM.</li>
<li>A core is a whole CPU; GHz is how fast it ticks; the fetch-decode-execute cycle never changes.</li>
<li>Binary: each switch is worth twice the one to its right. KB, MB, GB are about a thousand times each other.</li>
<li>The operating system runs programs, keeps files and owns the hardware. A compiler translates ahead of time; an interpreter works statement by statement.</li>
</ul><p>Next unit: what is really inside the bytes, how switches can think, and how computers talk to each other.</p></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['2-DA-07', '3A-DA-09'],
      title: 'Everything is numbers', summary: 'How a computer keeps text, pictures and sound as numbers: character codes, pixels and colours, and measurements of a sound wave. And how big the result gets.',
      blocks: [
        `<p>In 1957, at the National Bureau of Standards in Washington, a computer scientist named Russell Kirsch and his team built a machine that did something nobody had asked a computer to do: look at a photograph. It was a drum with a light sensor that scanned a picture dot by dot, and turned each dot into a number the computer could hold. Their first scan was a photograph of Kirsch's baby son. It was 176 dots across and 176 down, 30,976 dots in all, and each dot was either black or white. It is often called the first digital photograph. A computer can only keep numbers, so the picture had to become numbers.</p>
<p>Words, photos and music are not numbers. So how can a machine that only has switches keep any of them?</p>`,
        `<h2>Text is numbers</h2>
<div class="stmt"><p><span class="kind">Rule (a code).</span> A computer keeps a letter as a number. Everyone agrees in advance which number means which letter: that agreement is a <b>code</b>. In <b>ASCII</b> (1963), A is 65, B is 66, a is 97, a space is 32 and the digit 0 is 48. One character takes one byte.</p></div>
<p>ASCII has only 128 characters, enough for English but not for Greek, Arabic, Chinese, or even a French é. <b>Unicode</b> gives every character in every writing system its own number, more than 150,000 so far, including emoji. The usual way to store them, <b>UTF-8</b>, keeps the first 128 as one byte each, exactly as in ASCII, and spends two, three or four bytes on the rest. Type something below, including a letter with an accent or an emoji, and see the numbers.</p>`,
        { fig: 'codes', text: 'Hi!', caption: `Type up to 12 characters. Each one has a number, and the number is kept as one or more bytes. Try <code>cat</code>, then <code>café</code>, then an emoji, and watch the byte count change.` },
        { check: `The byte <code>01000001</code> arrives in a program. What is it?`, skill: 'text-codes', options: [`The letter A, always`, `The number 65, always`, `The letter A, the number 65, or part of a colour: it depends on what the program does with it`, `An instruction, always`], answer: 2, wrong: [`It is the letter A only if the program treats it as a character. Another program could treat the same byte as a number.`, `It is 65 only if the program treats it as a number. The same pattern is also the code for A.`, null, `It is an instruction only if the CPU's program counter points at it. In data it is just a pattern.`], why: `A byte has no meaning of its own. The pattern 01000001 is 65 as a number and A as a character: the program decides which.` },
        `<h2>Pictures are grids</h2>
<p>A picture on a screen is a grid of tiny dots called <b>pixels</b>, short for "picture elements". Each pixel needs a number. For a black-and-white picture one bit is enough: 1 for black, 0 for white. Kirsch's 1957 scan worked that way. An 8 by 8 picture needs 64 bits, which is 8 bytes: one byte for each row.</p>`,
        { fig: 'pixels', caption: `Click squares to flip them. Each row is one byte (8 squares, 8 bits) and its number is shown beside it. The whole picture is the 8 numbers.` },
        `<div class="stmt"><p><span class="kind">Rule (colour).</span> A colour pixel is three numbers: how much <b>red</b>, <b>green</b> and <b>blue</b> light, each from 0 to 255 (one byte each). So a pixel takes <b>3 bytes</b>, and three bytes can make 256 × 256 × 256 = 16,777,216 different colours.</p></div>
<p>A screen makes a colour by lighting three tiny lights at different brightness. Look at one from very close.</p>`,
        { photo: 'screen-pixels', caption: `A phone screen magnified about 200 times. Each colour of light comes from its own tiny spot (green, red and blue). Your eyes mix them from a distance.` },
        { fig: 'colour', start: { r: 255, g: 140, b: 0 }, caption: `Move the sliders. Each is one byte. Try red 255 and green 255 with blue 0: yellow.` },
        { check: `A photo is 1,000 pixels wide and 1,000 tall, with 3 bytes per pixel. About how many bytes is it, before any squeezing?`, skill: 'image-size', options: [`3 KB`, `300 KB`, `3 MB`, `3 GB`], answer: 2, wrong: [`That would be 3,000 bytes. There are a million pixels, and each needs 3 bytes.`, `That would be 300,000 bytes: a tenth of the real size.`, null, `A gigabyte is a thousand times more.`], why: `1,000 × 1,000 = 1,000,000 pixels, and 3 bytes each is 3,000,000 bytes: about 3 MB.` },
        `<h2>Sound is measurements</h2>
<p>A microphone turns sound into a wobbling electrical signal. A computer cannot keep a wobble, so it <b>measures</b> the signal many times a second and keeps each measurement as a number. Play the numbers back through a speaker in the same order and the speaker moves in the same way, and you hear the sound again. Each measurement is called a <b>sample</b>. A CD takes 44,100 of them every second, two bytes each, for each of the two speakers: 176,400 bytes a second, about 10.6 MB a minute.</p>`,
        { fig: 'sampling', caption: `The thin line is a sound wave. The dots are the measurements and the thick steps are what the computer keeps. Choose more measurements per second and the steps follow the wave more closely.` },
        { check: `Which gives a closer copy of a sound: 8 measurements a second, or 32?`, skill: 'sound', options: [`8, because fewer numbers are more accurate`, `32, and it needs more bytes`, `32, and it needs the same number of bytes`, `They are the same`], answer: 1, wrong: [`With fewer measurements the steps miss the wiggles, as the figure showed.`, null, `Each extra measurement is another number to keep, so the file is bigger.`, `The figure showed the difference: the steps follow the wave much better at 32.`], why: `More measurements capture more of the wave, and every measurement costs bytes. That trade, quality against size, is behind every sound and picture file.` },
        `<p>Sizes grow fast, so computers squeeze files. <b>Lossless</b> compression (ZIP, PNG) makes a file smaller and gives back exactly the same bytes. <b>Lossy</b> compression (JPEG for pictures, MP3 for sound) throws away detail that people hardly notice, and gets much smaller. A 3 MB photo often becomes a few hundred KB as a JPEG.</p>`,
        { ex: { id: 'cs-6-1', kind: 'answer', skill: 'text-codes', title: 'Codes and sizes',
          prompt: `<p>Write a number in each box. In ASCII, A is 65 and the letters follow in order.</p>`,
          parts: [
            { label: `(a) The ASCII code of the letter D`, answer: `68`, width: `6rem`, wrong: [{ match: `65`, msg: `65 is A. D is three letters later.` }, { match: `67`, msg: `67 is C. D comes after C.` }] },
            { label: `(b) How many bytes does the word Hello take in ASCII?`, answer: `5`, width: `6rem`, wrong: [{ match: `40`, msg: `That is the number of bits. The question asks for bytes: one per character.` }] },
            { label: `(c) How many bytes hold an 8 by 8 black-and-white picture, one bit per pixel?`, answer: `8`, width: `6rem`, wrong: [{ match: `64`, msg: `64 is the number of bits. Eight bits make a byte.` }] },
            { label: `(d) How many bytes hold a colour picture 10 pixels wide and 10 tall, 3 bytes per pixel?`, answer: [`300`], width: `6rem`, wrong: [{ match: `100`, msg: `That is the number of pixels. Each pixel takes three bytes.` }, { match: `30`, msg: `Count the pixels first: 10 × 10.` }] },
            { label: `(e) A sound is measured 10 times a second for 3 seconds, one byte per measurement. How many bytes?`, answer: `30`, width: `6rem`, wrong: [{ match: `10`, msg: `That is one second's worth. Multiply by the seconds.` }] }
          ],
          hints: [`For each part find how many things there are, then how many bytes each one takes.`, `A byte is eight bits. A black-and-white pixel is one bit; a colour pixel is three bytes.`],
          solution: `<p>(a) A is 65, so D is 68. (b) H, e, l, l, o: 5 bytes. (c) 64 pixels are 64 bits, which is 8 bytes. (d) 10 × 10 = 100 pixels, times 3 bytes is 300. (e) 10 × 3 = 30 measurements, one byte each: 30 bytes.</p>`,
          followup: `A CD takes 176,400 bytes a second. About how many minutes of music fit in 700 MB?` } },
        { ex: { id: 'cs-6-2', kind: 'choice', skill: 'image-size', title: 'Why is the file so small?',
          prompt: `<p>A camera makes a photo of 3,000 by 2,000 pixels. Stored as raw pixels it would take 18 MB, but the file on the phone is 2 MB. What is the best explanation?</p>`,
          options: [
            { text: `The phone has fewer pixels than the camera says.`, why: `The pixels are all there. The same number of pixels is stored in fewer bytes.` },
            { text: `The file is compressed: the phone found a shorter way to write the same picture, and a JPEG also drops detail that eyes hardly notice.`, ok: true },
            { text: `A phone stores a photo as 1 bit per pixel, which is smaller.`, why: `One bit per pixel would make a black-and-white picture. Photos are colour, and compression is what shrinks them.` },
            { text: `The operating system deletes part of the picture to save space.`, why: `The operating system does not edit your pictures. The program that saved the file chose to compress it.` }
          ],
          hints: [`18 MB is 6,000,000 pixels times 3 bytes. Where could 16 MB go?`, `There are two kinds of squeezing: one gives back exactly the same bytes, one throws detail away.`],
          solution: `<p>3,000 × 2,000 = 6 million pixels, and 3 bytes each is 18 MB. The 2 MB file is that picture compressed. JPEG is lossy: it keeps what people notice and drops what they hardly do, which is why it is so much smaller.</p>`,
          followup: `Why can you compress a photo with JPEG over and over until it looks bad, but never get a ZIPped spreadsheet wrong?` } },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A computer keeps everything as numbers, in bytes. A <b>code</b> says which number means what: ASCII and Unicode (stored as UTF-8) for text.</li>
<li>A picture is a grid of <b>pixels</b>. Black and white takes 1 bit a pixel; colour takes 3 bytes: red, green and blue, 0 to 255 each.</li>
<li>Sound is measured many times a second; each <b>sample</b> is a number. More samples copy the wave better and take more bytes.</li>
<li>The same bytes can mean different things. The program decides. <b>Compression</b> makes files smaller: lossless gives back the same bytes, lossy drops detail.</li>
</ul><p>So how can switches keep a picture, a song or a message? They keep numbers, and numbers can stand for anything we agree they stand for.</p></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['3B-CS-02', '2-AP-12'],
      title: 'Switches that think', summary: 'How a chip is built from switches: transistors, the logic gates NOT, AND, OR and XOR, and how a few gates add two numbers. The CPU of lesson 2 is made of these.',
      blocks: [
        `<p>In 1937 a 21-year-old graduate student at the Massachusetts Institute of Technology, Claude Shannon, handed in a master's thesis that has been called possibly the most important of the century. He had noticed something about the relay switches that controlled a huge calculating machine at the university: a switch is either open or closed, and the algebra of true and false that George Boole had invented in 1854 describes exactly how switches behave when they are wired together. Which meant that a circuit could be designed, and checked, on paper, with logic.</p>
<p>Every computer you have used is made that way. But a switch only lets electricity through or stops it. How can a pile of switches add two numbers?</p>`,
        `<h2>The transistor</h2>
<div class="stmt"><p><span class="kind">Rule (the transistor).</span> A <b>transistor</b> is a switch with no moving parts. A small electrical signal on one wire decides whether current can flow through the other two. One signal can switch another, and that is what lets switches be wired to work together.</p></div>
<p>The 4004 of lesson 2 had 2,300 transistors. Today a large processor holds tens of billions of them, each far too small to see, and each switching on and off billions of times a second.</p>`,
        { photo: 'transistor-die', caption: `One transistor from the 1960s, a germanium device made by General Electric, magnified. The rough block in the middle is the working part, germanium with metal alloyed onto it; the thin bent wire joins it to one of the transistor's three legs. The transistors in a modern chip are far smaller, and billions share one chip.` },
        { check: `What is a transistor?`, skill: 'switches', options: [`A switch with no moving parts, controlled by an electrical signal`, `A chip that stores a file`, `A tiny complete CPU`, `A wire that carries data`], answer: 0, wrong: [null, `A transistor stores nothing by itself. Billions of them, wired together, make a memory chip.`, `A CPU is made of millions or billions of transistors, wired into gates and larger circuits.`, `A wire only carries a signal. A transistor can switch one signal using another.`], why: `A transistor lets a signal control a flow of current, like a light switch worked by electricity instead of a finger.` },
        `<h2>Gates</h2>
<p>A few transistors wired together answer a yes-or-no question about their inputs. That circuit is a <b>logic gate</b>, and the answers are always <b>1</b> (on, true) or <b>0</b> (off, false). There are only a few kinds.</p>
<div class="stmt"><p><span class="kind">NOT</span> turns 1 into 0 and 0 into 1. <span class="kind">AND</span> gives 1 only when both inputs are 1. <span class="kind">OR</span> gives 1 when at least one input is 1. <span class="kind">XOR</span> ("exclusive or") gives 1 when the two inputs are different.</p></div>`,
        { fig: 'gates', caption: `Click the input boxes to flip them and watch the output. The table lists every possible input; the row you have set is highlighted. Try each gate.` },
        { check: `A burglar alarm should sound only when the door is open AND it is night. Which gate does it need?`, skill: 'gates', options: [`OR`, `AND`, `NOT`, `XOR`], answer: 1, wrong: [`OR would sound the alarm whenever the door is open, even by day, or whenever it is night, even with the door shut.`, null, `NOT has one input and just flips it.`, `XOR sounds when exactly one is true, so it would also sound when the door is shut at night and not when both are true.`], why: `Both conditions must hold, and only AND gives 1 when both inputs are 1. These are the same <em>and</em>, <em>or</em> and <em>not</em> you will write in programs.` },
        `<h2>Adding with gates</h2>
<p>Adding two bits gives one of four results: 0 + 0 = 0, 0 + 1 = 1, 1 + 0 = 1, and 1 + 1 = 10, which is two in binary. Look at the answer as two bits: a <b>sum</b> bit and a <b>carry</b> bit.</p>
<div class="stmt"><p><span class="kind">Rule (an adder).</span> The sum bit of two input bits is their <b>XOR</b>: 1 when they differ. The carry bit is their <b>AND</b>: 1 only when both are 1. A column that also takes the carry from its neighbour on the right, and passes a carry on to its neighbour on the left, is a <b>full adder</b>. Put four in a row and you can add two 4-bit numbers.</p></div>`,
        { fig: 'adder', start: [5, 3], caption: `Two 4-bit numbers, A and B, below the carry row. Flip bits and watch the carries ripple from right to left, just as you carry tens in column addition. Try 0111 + 0001, then 1111 + 0001.` },
        { check: `1 + 1 in binary is 10: a sum bit of 0 and a carry bit of 1. Which gate produces the carry?`, skill: 'adding', options: [`XOR`, `OR`, `AND`, `NOT`], answer: 2, wrong: [`XOR gives the sum bit: it is 0 when both bits are 1.`, `OR would also carry when only one bit is 1, which is wrong: 0 + 1 has no carry.`, null, `NOT has one input. Adding needs two.`], why: `A carry happens only when both bits are 1, which is exactly when AND gives 1.` },
        `<p>That is the whole secret of the processor's arithmetic. The part of the CPU that adds is a row of full adders. The part that decodes an instruction is gates. A register's bits can be made from gates that feed back on themselves and so hold their value. The tiny CPU of lesson 2 could be built entirely from the four gates on this page.</p>`,
        { ex: { id: 'cs-7-1', kind: 'table', skill: 'gates', title: 'Truth tables',
          prompt: `<p>Fill in the output of each gate for the inputs on each row. Write 0 or 1.</p>`,
          head: ['A', 'B', 'AND', 'OR', 'XOR'],
          rows: [
            ['0', '1', { a: '0', name: 'AND 0,1' }, { a: '1', name: 'OR 0,1' }, { a: '1', name: 'XOR 0,1' }],
            ['1', '1', { a: '1', name: 'AND 1,1' }, { a: '1', name: 'OR 1,1' }, { a: '0', name: 'XOR 1,1', why: { 1: `XOR is 1 only when the inputs differ. These are the same.` } }],
            ['1', '0', { a: '0', name: 'AND 1,0' }, { a: '1', name: 'OR 1,0' }, { a: '1', name: 'XOR 1,0' }],
            ['0', '0', { a: '0', name: 'AND 0,0' }, { a: '0', name: 'OR 0,0' }, { a: '0', name: 'XOR 0,0' }]
          ],
          hints: [`AND needs both inputs on. OR needs at least one. XOR needs exactly one.`, `Use the gates figure above to check any row you are unsure of.`],
          solution: `<p>AND: 0, 1, 0, 0. OR: 1, 1, 1, 0. XOR: 1, 0, 1, 0.</p>`,
          followup: `NAND is AND followed by NOT. Write its output for the four rows. (NAND alone is enough to build every other gate.)` } },
        { ex: { id: 'cs-7-2', kind: 'answer', skill: 'adding', title: 'Add in binary',
          prompt: `<p>Write each answer as binary digits unless the question asks for a word or a number. Use the adder figure if you like.</p>`,
          parts: [
            { label: `(a) 0101 + 0011`, answer: [`1000`], width: `7rem`, wrong: [{ match: `0110`, msg: `That adds the columns without carrying. 1 + 1 gives 0 and a carry of 1.` }] },
            { label: `(b) 0111 + 0001`, answer: [`1000`], width: `7rem`, wrong: [{ match: `0112`, msg: `A column can only hold 0 or 1. When a column adds to 2 you write 0 and carry 1.` }] },
            { label: `(c) The four-bit adder is given 1111 + 0001. Which four bits does it show as the sum?`, answer: [`0000`], width: `7rem`, wrong: [{ match: `10000`, msg: `That needs five bits, and the adder has four. The fifth bit is carried out and lost: this is overflow.` }] },
            { label: `(d) How many full-adder columns does it take to add two 8-bit numbers?`, answer: `8`, width: `6rem` },
            { label: `(e) Which gate gives the sum bit when two single bits are added? (one word)`, answer: [`XOR`, `exclusive or`], width: `7rem`, wrong: [{ match: `and`, msg: `AND gives the carry. The sum is 1 when the bits differ.` }] }
          ],
          hints: [`Add the right-hand column first. If it makes 2, write 0 and carry 1 into the next column.`, `Part (c): the carry out of the last column has nowhere to go.`],
          solution: `<p>(a) 5 + 3 = 8: 1000. (b) 7 + 1 = 8: 1000. (c) 15 + 1 = 16 needs five bits; with four the adder shows 0000 and a carry out. (d) 8, one per bit. (e) XOR.</p>`,
          followup: `What is the largest number two 4-bit numbers can add to without overflow? What about two 8-bit numbers?` } },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A <b>transistor</b> is a switch worked by an electrical signal. A chip holds billions.</li>
<li>A few transistors make a <b>logic gate</b>. <b>NOT</b> flips a bit, <b>AND</b> needs both inputs on, <b>OR</b> needs one, <b>XOR</b> needs exactly one.</li>
<li>An adder is gates: the <b>sum</b> bit is XOR, the <b>carry</b> is AND, and carries pass from column to column. Too many bits for the columns is <b>overflow</b>.</li>
<li>The CPU's arithmetic, its instruction decoder and its registers are all built from gates.</li>
</ul><p>So how can switches add? Each column of an adder is a handful of gates, and the carry runs along the row, exactly as you carry when you add on paper.</p></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['2-NI-04', '3A-NI-04', '3B-NI-03', '2-CS-02'],
      title: 'Computers talking', summary: 'How a message crosses the world: networks and the Internet, addresses and names, packets and routers, and what happens between typing a web address and seeing the page.',
      blocks: [
        `<p>On 29 October 1969, a student at the University of California, Los Angeles, Charley Kline, sat at a computer and tried to send the first message over the ARPANET, a new network that would soon join four American research centres. The word was meant to be LOGIN. He typed an L, and a colleague at the Stanford Research Institute, 560 kilometres away, confirmed by telephone that it had arrived. He typed an O, and that arrived too. When he typed the G, the computer at the far end crashed. About an hour later they fixed it and sent the whole word.</p>
<p>That network had four computers. The Internet today connects billions. So how does a message find its way to one computer among billions?</p>`,
        { photo: 'ethernet-switch', caption: `The front of a network switch, a box that connects the computers on a network to each other. Every cable here leads to another computer.` },
        `<h2>Networks, the Internet and the web</h2>
<div class="stmt"><p><span class="kind">Three words people mix up.</span> A <b>network</b> is any group of computers joined so they can send each other data: a home, a school, a company. The <b>Internet</b> is the huge network of networks that all agree on the same rules for sending data; those rules are called <b>protocols</b>. The <b>web</b> is one thing that runs on the Internet: pages and links. Email, video calls and games run on the Internet too, and none of them is the web.</p></div>`,
        { check: `Which statement is right?`, skill: 'internet-web', options: [`The web and the Internet are the same thing`, `The web is one of the things that runs on the Internet`, `The Internet is a very large web page`, `The Internet is owned by one company`], answer: 1, wrong: [`The Internet carries email, calls and games as well. The web is just one use of it.`, null, `A web page is a file. The Internet is the network that carries the file.`, `The Internet is thousands of separate networks, run by many companies, schools and governments, joined by shared rules.`], why: `The Internet is the road system. The web is one kind of traffic on it.` },
        `<h2>Addresses and names</h2>
<p>Every computer on the Internet has an <b>IP address</b>, a number that works like a postal address. A common kind is four numbers from 0 to 255 with dots between them, such as <code>192.0.2.17</code> (a range set aside for examples). Each of the four numbers is one byte, so an address is 4 bytes long.</p>
<p>People do not remember numbers well, so sites also have names, like <code>example.com</code>. A worldwide system called the <b>Domain Name System</b>, <b>DNS</b>, is the phone book: you give it the name, it gives back the number. Your computer asks it before it sends anything.</p>`,
        { check: `Why does the Internet need DNS?`, skill: 'addresses', options: [`Because computers cannot send data without a name`, `Because people use names, but data is sent to numbers, and DNS turns one into the other`, `Because DNS makes the connection faster`, `Because DNS stores copies of every web page`], answer: 1, wrong: [`Computers send data to numbers. Names are for people.`, null, `DNS only looks up a number. It does not speed up the connection.`, `DNS stores the numbers that go with names. The pages stay on the sites' own computers.`], why: `You type a name; DNS answers with the number; your computer sends the data to that number.` },
        `<h2>Packets and routers</h2>
<p>Nothing travels the Internet as one big piece. A message is cut into small pieces called <b>packets</b>, usually no more than about 1,500 bytes each. Each packet carries the address it is going to and its own number in the message.</p>
<div class="stmt"><p><span class="kind">Rule (routing).</span> A <b>router</b> is a computer whose job is to pass packets on. It reads a packet's address, picks the best next road, and sends it. Packets of one message may take different roads and arrive in a different order. The receiving computer uses their numbers to put them back in order, and asks again for any that never arrived.</p></div>
<p>Cutting a message up lets many conversations share the same wires, and lets packets go around a broken router instead of stopping. Step through this one.</p>`,
        { fig: 'packets', caption: `A message cut into four numbered packets. They leave together, take different roads, and the longest road is the one packet 1 took, so it arrives last. The server puts them in order by their numbers.` },
        { check: `Packets 2, 3 and 4 of a message arrive before packet 1. What lets the receiving computer rebuild the message?`, skill: 'packets', options: [`Nothing: the message is lost`, `The number on each packet, which gives its place in the message`, `The router, which holds the packets until the first one is ready`, `The length of each packet`], answer: 1, wrong: [`Nothing is lost. Order is not needed to arrive, only to rebuild.`, null, `Routers pass packets on as fast as they can. They do not hold them for each other.`, `Packets can be the same length. The number is what shows the order.`], why: `Each packet says "I am piece number n", so the receiver can sort them, however they arrived.` },
        `<h2>A trip to a web page</h2>
<p>Put the pieces together. You type <code>example.com</code>. Your computer, the <b>client</b>, asks DNS for the number. It sends a request, in packets, to that number. The packets cross several routers. The computer at the other end, a <b>server</b>, which is simply a computer that waits for requests and answers them, sends the page back in packets. Your browser puts them in order and draws the page. All of that takes a fraction of a second.</p>
<p>The roads are real. In your home or school the last metres are a cable or Wi-Fi radio. Between cities the packets travel as flashes of light in glass fibres. Most data between continents does not go by satellite at all: it runs through cables laid on the sea floor.</p>`,
        { ex: { id: 'cs-8-1', kind: 'table', skill: 'web-request', title: 'A trip to a web page',
          prompt: `<p>These five steps are in the wrong order. Write 1 to 5 beside each to put them in the order they happen.</p>`,
          head: ['What happens', 'Order (1 to 5)'],
          rows: [
            [`The server sends the page back, in packets.`, { a: '4', name: 'server replies' }],
            [`You type a web address and press Enter.`, { a: '1', name: 'type address' }],
            [`Your browser puts the packets in order and draws the page.`, { a: '5', name: 'browser draws' }],
            [`Your computer sends a request, in packets, to that number.`, { a: '3', name: 'request sent' }],
            [`DNS turns the name into a number.`, { a: '2', name: 'DNS lookup' }]
          ],
          hints: [`Your computer cannot send anything until it knows where to send it.`, `The page comes back only after the request has arrived.`],
          solution: `<p>Type the address (1). DNS finds the number (2). The request is sent (3). The server replies (4). The browser rebuilds and draws the page (5).</p>`,
          followup: `At which steps could a packet take a different road from the packet before it?` } },
        { ex: { id: 'cs-8-2', kind: 'answer', skill: 'packets', title: 'Packets and addresses',
          prompt: `<p>Write an answer in each box. Treat every packet as holding 1,500 bytes of the message.</p>`,
          parts: [
            { label: `(a) How many packets does a 4,500-byte message need?`, answer: `3`, width: `6rem`, wrong: [{ match: `4`, msg: `4,500 ÷ 1,500 is exactly 3.` }] },
            { label: `(b) How many packets does a 4,600-byte message need?`, answer: `4`, width: `6rem`, wrong: [{ match: `3`, msg: `Three packets hold only 4,500 bytes. The extra 100 bytes need a fourth.` }] },
            { label: `(c) How many bytes is an IP address of four numbers, each from 0 to 255?`, answer: `4`, width: `6rem` },
            { label: `(d) Packets arrive in the order 2, 4, 1, 3. Which packet number must arrive before the receiver can show the start of the message?`, answer: `1`, width: `6rem` },
            { label: `(e) One router on the route breaks. Can the other packets still get through by another road? (yes or no)`, answer: [`yes`], width: `6rem`, wrong: [{ match: `no`, msg: `Routers pick another road. That is one of the reasons for cutting messages into packets.` }] }
          ],
          hints: [`For (a) and (b) divide the message size by 1,500 and round up: a part-full packet still counts.`, `The first packet carries the start of the message.`],
          solution: `<p>(a) 3. (b) 4,600 ÷ 1,500 is a little over 3, so 4. (c) Four bytes. (d) Packet 1. (e) Yes: routers can send packets another way.</p>`,
          followup: `A web page is 120,000 bytes. About how many packets is that?` } },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A <b>network</b> joins computers; the <b>Internet</b> joins networks that follow the same rules (<b>protocols</b>); the <b>web</b> is one use of it.</li>
<li>Every computer has an <b>IP address</b> (for example four bytes). <b>DNS</b> is the phone book that turns names into numbers.</li>
<li>Messages are cut into numbered <b>packets</b>. <b>Routers</b> pass them on by whatever road is best; the receiver puts them back in order.</li>
<li>A <b>client</b> asks, a <b>server</b> answers. A web page is a trip: name, number, request, reply, page.</li>
</ul><p>So how does a message find one computer among billions? Every packet carries the address, and every router on the way knows which road leads closer.</p></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['3A-DA-09', '2-NI-04', '2-AP-10'],
      title: 'Checkpoint two', checkpoint: true, summary: 'No new ideas: mixed questions on numbers and codes, logic gates and adding, and the way computers talk. How big? Which gate? Where did the packet go?',
      blocks: [
        `<p>Another mixed set, on lessons 6, 7 and 8: bytes and what they mean, gates and adders, and networks. Answer before you look back. Wrong answers here are useful: each tells you which lesson to read again, and the Review page will bring the question back.</p>
<p>First: here are two bytes. Do they mean anything on their own?</p>
<h2>Mixed questions</h2>`,
        { check: `A program holds the numbers 72 and 105. What must it know before it can show them as the word "Hi"?`, skill: 'text-codes', options: [`That they are character codes, such as ASCII`, `That they are measurements of a sound`, `The address of the bytes in memory`, `Nothing: numbers are always letters`], answer: 0, wrong: [null, `Sound samples are numbers too, which is the point: the program has to say how to read them.`, `The address says where the bytes are, not what they mean.`, `The same numbers could be colours, sound samples or sizes. The program decides.`], why: `72 is H and 105 is i in ASCII. Without knowing that, they are just two numbers.` },
        { check: `A colour picture is 2 pixels wide and 2 pixels tall, with 3 bytes per pixel. How many bytes is it?`, skill: 'image-size', options: [`4`, `6`, `12`, `24`], answer: 2, wrong: [`That is the number of pixels. Each pixel takes 3 bytes.`, `That is one row's worth of bytes: 2 pixels × 3 bytes. There are two rows.`, null, `That is 12 × 2. There is no extra factor.`], why: `4 pixels × 3 bytes = 12 bytes.` },
        { check: `A sound is stored with twice as many measurements per second as before. The file is about`, skill: 'sound', options: [`half the size`, `the same size`, `twice the size`, `ten times the size`], answer: 2, wrong: [`More measurements mean more numbers to keep.`, `Every measurement is stored, so doubling them doubles the bytes.`, null, `Twice as many numbers need twice as many bytes, no more.`], why: `Each measurement takes the same number of bytes, so twice as many measurements take twice the space.` },
        { check: `An AND gate is given 1 and 1. Its output feeds a NOT gate. What comes out of the NOT gate?`, skill: 'gates', options: [`0`, `1`, `10`, `It depends on the clock`], answer: 0, wrong: [null, `AND gives 1 for those inputs, and NOT flips it to 0.`, `A gate gives one bit, 0 or 1.`, `Gates answer straight away from their inputs. The clock times the CPU's cycle, not a gate's logic.`], why: `AND(1, 1) is 1, and NOT turns 1 into 0. (That pair is a NAND gate.)` },
        { check: `In the adder, 0011 + 0001 gives`, skill: 'adding', options: [`0012`, `0100`, `0010`, `1000`], answer: 1, wrong: [`A column can only hold 0 or 1. 1 + 1 makes 0 and carries 1.`, null, `That ignores the carry out of the first column.`, `That is 3 + 1 = 4 read wrong: 1000 is eight.`], why: `3 + 1 = 4, which is 0100: the right column carries into the next, and that carries into the next.` },
        { check: `Why is a large file cut into packets for the Internet?`, skill: 'packets', options: [`So many conversations can share the wires, and packets can go round a broken router`, `Because computers can only store 1,500 bytes at once`, `Because packets are encrypted`, `So the file arrives faster in one piece`], answer: 0, wrong: [null, `Computers store far more than that. The size is a limit on one packet on the wire.`, `Packets are cut for sharing the road. Encryption is a separate matter.`, `Cutting into packets lets the file take several roads. Sending it whole would block the wire for others.`], why: `Small packets share the roads fairly and can reroute around trouble; the receiver puts them back by number.` },
        { check: `What does DNS do?`, skill: 'addresses', options: [`Turns a name such as example.com into the number the computers use`, `Stores the web pages`, `Encrypts the packets`, `Connects your computer to Wi-Fi`], answer: 0, wrong: [null, `Pages are stored on servers. DNS only answers where to find them.`, `That is a different job; DNS does not hide anything.`, `Wi-Fi is the radio link in your home or school. DNS comes later, on the way to a site.`], why: `DNS is the phone book of the Internet: names in, numbers out.` },
        { check: `Which computer in a web trip waits for requests and answers them?`, skill: 'web-request', options: [`The client`, `The router`, `The server`, `The switch in your house`], answer: 2, wrong: [`The client is your computer, which asks.`, `Routers pass packets on; they do not answer requests.`, null, `A switch connects computers on one network. It does not serve pages.`], why: `A server is the computer that waits for requests and sends back what was asked for.` },
        `<p>Two to finish: one on the journey of a photo, one on sizes.</p>`,
        {
          ex: {
            id: 'cs-9-1', kind: 'choice', skill: 'packets', title: 'Sending a photo',
            prompt: `<p>You send a 3 MB photo to a friend over the Internet. Which account is right?</p>`,
            options: [
              { text: `The photo is cut into packets, each with the friend's address and its place in the photo. Routers pass them on, perhaps by different roads, and the friend's computer puts them in order.`, ok: true },
              { text: `The photo travels as one piece along one fixed wire between you and your friend.`, why: `There is no fixed wire. The photo shares the roads with everyone's traffic, in packets.` },
              { text: `The photo is turned into letters first, and the friend's computer turns them back into a picture.`, why: `It is already numbers. A photo is bytes, and bytes are what packets carry.` },
              { text: `Your computer asks DNS for the photo, and DNS sends it.`, why: `DNS only turns names into numbers. It never carries your data.` }
            ],
            hints: [`Think about what a packet carries, and what a router does with it.`, `A photo is a file, and a file is bytes.`],
            solution: `<p>The photo is bytes. The bytes are cut into packets, each addressed and numbered. Routers pass them along, possibly by different roads, and your friend's computer puts them in order and saves the file.</p>`,
            followup: `Roughly how many packets is a 3 MB photo, if each holds 1,500 bytes?`
          }
        },
        {
          ex: {
            id: 'cs-9-2', kind: 'answer', skill: 'image-size', title: 'How many bytes?',
            prompt: `<p>Write a number of bytes in each box.</p>`,
            parts: [
              { label: `(a) The text <code>Cat!</code> in ASCII`, answer: `4`, width: `6rem`, wrong: [{ match: `3`, msg: `The exclamation mark is a character too.` }] },
              { label: `(b) A colour picture 4 pixels wide and 4 tall, 3 bytes per pixel`, answer: `48`, width: `6rem`, wrong: [{ match: `16`, msg: `That is the number of pixels. Each takes 3 bytes.` }] },
              { label: `(c) One IP address of four numbers, each from 0 to 255`, answer: `4`, width: `6rem` },
              { label: `(d) One second of sound: 10 measurements, 2 bytes each`, answer: `20`, width: `6rem`, wrong: [{ match: `10`, msg: `Each measurement takes two bytes.` }] }
            ],
            hints: [`For each, count the things, then multiply by the bytes each one takes.`, `A character is 1 byte. A colour pixel is 3 bytes.`],
            solution: `<p>(a) 4 characters, 4 bytes. (b) 16 pixels × 3 = 48. (c) 4 bytes. (d) 10 × 2 = 20.</p>`,
            followup: `Which of the four would grow the most if you doubled everything about it: the text, the picture's width and height, the address, or the sound's length?`
          }
        },
        `<div class="recap"><h3>In this checkpoint</h3><ul>
<li>Bytes mean nothing alone: a code or a program gives them meaning. Text, pictures and sound are all numbers.</li>
<li>Size = how many things × bytes each. Pictures: pixels × 3. Sound: measurements × bytes each.</li>
<li>Gates: NOT flips; AND needs both; OR needs one; XOR needs exactly one. Adders use XOR for the sum and AND for the carry.</li>
<li>Messages travel as numbered packets that routers pass on; DNS turns names into numbers; a client asks and a server answers.</li>
</ul><p>Last unit: staying safe on a network, and giving a machine instructions.</p></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['2-NI-05', '2-NI-06', '3A-NI-05', '2-IC-23', '3A-IC-29'],
      title: 'Staying safe', summary: 'Passwords and how fast they fall, phishing and malware, why updates matter, what the padlock in the browser means, and what happens to the data you give away.',
      blocks: [
        `<p>On 2 November 1988 a program began to copy itself from computer to computer across the young Internet. It had been released by Robert Tappan Morris, a graduate student at Cornell University, and it spread through several holes in the software of the day. One was the simplest of all: it tried to log in to computers by guessing passwords, from a short list of the commonest ones and from words in each user's own account name. A mistake in the program made it copy itself far more often than he had meant. Thousands of computers slowed to a crawl, and some had to be disconnected while engineers cleaned them up.</p>
<p>It was the first famous worm. A guessing program is only a loop, so what makes a password hard to guess?</p>`,
        `<h2>Passwords</h2>
<p>A computer that guesses can try millions of passwords a second, so the question is how many there are to try. Every extra character multiplies the number of possible passwords by the number of characters you could have chosen. That is why <b>length</b> matters more than clever tricks.</p>`,
        { fig: 'passwords', caption: `Choose a length and the kinds of character. The figure counts the possible passwords and the time to try all of them at 10 billion guesses a second. Slide the length up by one and watch the time.` },
        `<div class="stmt"><p><span class="kind">What works.</span> A long password made of several unrelated random words is strong and easy to remember. Use a different password for each important account, so one leak opens one door. A <b>password manager</b> remembers them for you. Turn on <b>two-step sign-in</b> where you can: a stolen password then is not enough, because the site also asks for something you have, such as a code sent to your phone.</p></div>`,
        { check: `Which password is the hardest for a program to guess?`, skill: 'passwords', options: [`Your first name and your birth year`, `P@ssw0rd!`, `Four unrelated random words, such as plum-ladder-orbit-tent`, `One good password reused on every site`], answer: 2, wrong: [`Names and dates are the first things a guessing program tries.`, `Swapping letters for symbols, like @ for a, is such a well-known trick that guessing programs try it early. It is also short.`, null, `Even a strong password is risky if it is the same everywhere: when one site leaks it, every account is open.`], why: `Four random words are long and unpredictable, which is what makes the number of possibilities enormous.` },
        `<h2>Tricks and malware</h2>
<p>Often the weak point is not the computer but the person. <b>Phishing</b> is a message that pretends to be someone you trust, a bank, a school, a friend, to get you to give away a password or click a link. <b>Malware</b> is software made to do harm: a <b>virus</b> or <b>worm</b> that copies itself, <b>spyware</b> that watches, <b>ransomware</b> that scrambles your files and demands money to unscramble them.</p>
<div class="stmt"><p><span class="kind">What helps.</span> Install <b>updates</b>, which fix the holes that malware uses. Do not run programs or open attachments from people you do not know. If a message makes you hurry or frightens you, stop: that is how phishing works. Type the site's address yourself instead of clicking. Keep a <b>backup</b> of what matters on another drive, so ransomware, a spill or a dead disk cannot take it.</p></div>`,
        { check: `An email says your account will be shut unless you click a link and enter your password now. What should you do?`, skill: 'threats', options: [`Click the link quickly, before the account is shut`, `Reply and ask whether it is real`, `Not click it. Go to the site by typing its address, or ask someone you trust`, `Forward it to your friends as a warning`], answer: 2, wrong: [`The hurry is the trick. The link may lead to a copy of the site made to steal your password.`, `Replying tells a scammer your address is read. Use a way you already trust.`, null, `Forwarding spreads the link, and someone may click it.`], why: `Real sites rarely demand a password through a link under pressure. Going to the site yourself shows whether anything is really wrong.` },
        `<h2>Scrambled messages</h2>
<p>Everything you send crosses many computers you do not control, so a message could be read on the way. <b>Encryption</b> scrambles the bytes with a secret number, a <b>key</b>, so that only a computer with the right key can unscramble them. When a web address starts with <code>https</code> and the browser shows a padlock, the page and anything you type travel encrypted, and someone on the same Wi-Fi sees only noise. SC 104 shows how to build a lock whose key can be published for anyone to use.</p>
<p>The padlock says the line is private. It does not say the site is honest: a scam site can have one too.</p>`,
        { check: `What does the padlock and <code>https</code> protect?`, skill: 'encryption', options: [`The messages between your browser and the site from being read on the way`, `You from any site that lies to you`, `Your computer from every virus`, `Your passwords from ever being stolen`], answer: 0, wrong: [null, `A scam site can have a padlock. It proves the line is private, not that the site is trustworthy.`, `Encryption is about messages in transit. It does not stop a virus you run yourself.`, `A password you type into a scam site is handed over, padlock or not.`], why: `Encryption scrambles the traffic. It keeps strangers on the road from reading it, and nothing more.` },
        `<h2>Your data</h2>
<p>Many apps and sites collect data about you: where you are, what you click, who you message. It is stored on a server and may be shared or sold. Often that buys something useful, like a map that knows where you are. The choice is a trade between convenience and privacy, and it is yours to make, but only if you notice it. Ask of each app: does it need this to do its job? Check what you have allowed. Remember that anything put online can be copied.</p>`,
        { ex: { id: 'cs-10-1', kind: 'choice', skill: 'threats', title: 'Spot the phish',
          prompt: `<p>This message arrives in your inbox. Which feature is the strongest sign that it is a scam?</p><blockquote><p>From: <b>Support Team</b> &lt;help@acc0unt-secure-login.example&gt;<br>Subject: URGENT: your account will be deleted in 1 hour<br>Dear user, we noticed a problem. Click here now and type your password to keep your account.</p></blockquote>`,
          options: [
            { text: `It has the word "URGENT" in the subject.`, why: `That is a clue, but plenty of real messages use it. It is not the strongest sign.` },
            { text: `It asks for your password through a link, under a one-hour deadline, from an address that is not the real site's.`, ok: true },
            { text: `It says "Dear user" instead of your name.`, why: `Another clue, but not proof. The strongest sign is the combination of a password request, pressure and a strange address.` },
            { text: `It came in the middle of the day.`, why: `The time tells you nothing.` }
          ],
          hints: [`Real sites hardly ever ask for your password in a message.`, `Look at the sender's address, too: does it match the real site's name exactly?`],
          solution: `<p>The strongest sign is the whole pattern: it wants your password, through a link, in a hurry, from an address that is a near-copy of a real name (a zero for the o). Do not click; go to the site yourself if you are worried.</p>`,
          followup: `What would make you trust a message that asks you to reset your password?` } },
        { ex: { id: 'cs-10-2', kind: 'answer', skill: 'passwords', title: 'Counting guesses',
          prompt: `<p>Write a whole number in each box.</p>`,
          parts: [
            { label: `(a) How many different 4-digit PINs are there (0000 to 9999)?`, answer: [`10000`], width: `8rem`, wrong: [{ match: `9999`, msg: `0000 is a PIN too, so count from 0000 up to 9999 inclusive.` }, { match: `40`, msg: `Each digit has 10 choices, and the choices multiply: 10 × 10 × 10 × 10.` }] },
            { label: `(b) How many different 6-digit PINs are there?`, answer: [`1000000`], width: `8rem`, wrong: [{ match: `60`, msg: `Multiply: ten choices for each of six digits.` }] },
            { label: `(c) An attacker tries 1,000 guesses a second. How many seconds to try every 4-digit PIN?`, answer: `10`, width: `8rem` },
            { label: `(d) Each extra digit multiplies the number of PINs by`, answer: `10`, width: `8rem` },
            { label: `(e) How many two-letter passwords can be made from lowercase letters a to z?`, answer: `676`, width: `8rem`, wrong: [{ match: `52`, msg: `That adds the two letters' choices. They multiply: 26 × 26.` }] }
          ],
          hints: [`Multiply the number of choices for every place.`, `Divide the number of PINs by the guesses per second to get the seconds.`],
          solution: `<p>(a) 10 × 10 × 10 × 10 = 10,000. (b) 1,000,000. (c) 10,000 ÷ 1,000 = 10 seconds. (d) 10. (e) 26 × 26 = 676.</p>`,
          followup: `A site allows only 5 wrong PINs before it locks you out. Why does that protect a 4-digit PIN even though there are only 10,000?` } },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A guessing program tries passwords at great speed. Each extra character multiplies the work, so <b>length</b> wins. Use several unrelated words, a different password for each account, a password manager, and two-step sign-in.</li>
<li><b>Phishing</b> tricks a person; <b>malware</b> (viruses, worms, spyware, ransomware) is software meant to harm. Install updates, be careful with attachments and links, keep backups.</li>
<li><b>Encryption</b> scrambles data with a key. The <code>https</code> padlock means the line is private, not that the site is honest.</li>
<li>Apps collect data about you. Trading privacy for convenience is a choice: make it knowingly.</li>
</ul><p>So what makes a password hard to guess? Being long and unpredictable, because every extra character multiplies the guesses needed.</p></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['2-AP-10', '2-AP-12'],
      title: 'Giving instructions', summary: 'What an algorithm is, why a machine needs steps with no guesswork, a robot that does exactly what you write, and a first look at a few lines of real code. Then where to go next.',
      blocks: [
        `<p>Around the year 820, in Baghdad, a scholar named Muhammad ibn Musa al-Khwarizmi wrote a book that explained how to calculate with the ten digits we use today, 0 to 9, which were new to many of his readers. It did not just give answers. It gave steps: do this, then this, carry that, and anyone who followed them correctly got the right result without understanding why it worked. Centuries later the book was translated into Latin, where his name became <em>Algoritmi</em>. That is why we call such a list of steps an <b>algorithm</b>.</p>
<p>A computer follows an algorithm with no understanding at all. So how exact must the steps be?</p>`,
        `<h2>Exact steps</h2>
<div class="stmt"><p><span class="kind">Rule (an algorithm).</span> An <b>algorithm</b> is a list of steps that always ends with a result. Each step must be so exact that someone with no judgement at all could carry it out. A computer is that someone: it does exactly what the steps say, in order, not what you meant.</p></div>
<p>People fill gaps without noticing. "Make tea" has a dozen steps hidden in it. A famous classroom game asks pupils to write instructions for a peanut-butter sandwich. The teacher then follows them exactly. "Put the peanut butter on the bread" becomes a jar set on top of a closed loaf, because the instructions never said to open the jar or to use a knife.</p>`,
        { check: `Which of these is an exact step that a computer could follow?`, skill: 'algorithm', options: [`Make the list look nice`, `Add 5 to the total`, `Sort them sensibly`, `Do the usual thing`], answer: 1, wrong: [`"Nice" needs a person's taste. A step needs to say exactly what to do.`, null, `"Sensibly" leaves the choice of order to judgement.`, `The computer has no idea what "usual" means.`], why: `"Add 5 to the total" says what to do and to what. The others leave the work to someone's judgement.` },
        `<p>Try it. This robot knows three commands: <b>Forward</b>, <b>Turn left</b> and <b>Turn right</b>. Build a list of commands that gets it to the star, then press Run. It will do exactly what you wrote.</p>`,
        { fig: 'robot', level: 0, caption: `Add commands, then Run. If the robot bumps into a wall or the edge, it stays where it is and carries on with the next command. Try all three levels, then see if you can match the fewest commands.` },
        `<p>Level 3 needs Forward three times in a row, twice. Typing the same thing again and again is slow, and it is easy to type it once too often or too few. Programmers write <b>repeat</b> instead: "repeat 3 times: Forward". Every programming language has a way to repeat steps. It is one of the biggest ideas in computing, and the next courses begin with it.</p>`,
        { check: `A robot's list is: Forward, Forward, Forward, Turn right, Forward, Forward, Forward, Turn right. Which shorter list means the same?`, skill: 'repeat', options: [`Repeat 2 times: Forward three times, then Turn right`, `Repeat 3 times: Forward twice, then Turn right`, `Repeat 8 times: Forward`, `Repeat 2 times: Turn right`], answer: 0, wrong: [null, `That would make 6 Forwards and 3 turns. The list has 6 Forwards and 2 turns.`, `That has no turns at all.`, `That leaves out every Forward.`], why: `The pattern "Forward, Forward, Forward, Turn right" appears twice, so "repeat 2 times" with that pattern inside says the same thing.` },
        `<h2>A first look at code</h2>
<p>Real programs are lists of exact steps, written in a language the computer can translate. Here is a tiny one in Python. You do not need to write it yet; just read it. Each line is one exact step.</p>`,
        { code: `name = "Sam"\nprint("Hello,", name)`, lang: 'python', caption: `Line 1 keeps the text Sam under the name <code>name</code>. Line 2 prints a greeting that includes it. The screen shows: <code>Hello, Sam</code>.` },
        { code: `for step in range(3):\n    print("Forward")`, lang: 'python', caption: `This is "repeat 3 times". The word <code>for</code> starts the repeating; the indented line is what is repeated. It prints <code>Forward</code> three times.` },
        { code: `battery = 15\nif battery < 20:\n    print("Plug in the charger")\nelse:\n    print("All good")`, lang: 'python', caption: `A step that decides. If the battery is under 20, the first message prints; otherwise the second does.` },
        { check: `What does the battery program print?`, skill: 'read-code', options: [`All good`, `Plug in the charger`, `Both messages`, `Nothing`], answer: 1, wrong: [`That would be printed if the battery were 20 or more. It is 15.`, null, `The program takes only one road: the if-part or the else-part, never both.`, `One of the two lines always prints.`], why: `15 is less than 20, so the condition is true and the first message prints. The else part is skipped.` },
        { ex: { id: 'cs-11-1', kind: 'answer', skill: 'algorithm', title: 'Follow the robot',
          prompt: `<p>The robot starts in the bottom-left corner of the 5 by 5 grid, facing up. Columns are counted from 0 on the left, rows from 0 at the top, so it starts in column 0, row 4. Its commands are: <b>Forward, Turn right, Forward, Forward</b>. There are no walls. Work it out by hand, then check in the figure.</p>`,
          parts: [
            { label: `(a) Which column is it in at the end?`, answer: `2`, width: `6rem`, wrong: [{ match: `3`, msg: `It moves one square forward, then turns, then two squares to the right: column 0 + 2.` }] },
            { label: `(b) Which row is it in at the end?`, answer: `3`, width: `6rem`, wrong: [{ match: `4`, msg: `The first Forward moves it up from row 4.` }, { match: `2`, msg: `It moved up only once, before turning.` }] },
            { label: `(c) Which way does it face at the end? (up, right, down or left)`, answer: [`right`], width: `6rem` },
            { label: `(d) How many commands is the list?`, answer: `4`, width: `6rem` }
          ],
          hints: [`Take the commands one at a time. After each, write down where the robot is and which way it faces.`, `Turn right changes only the direction it faces, not where it is.`],
          solution: `<p>Start: column 0, row 4, facing up. Forward: row 3. Turn right: now facing right. Forward, Forward: column 2. So column 2, row 3, facing right, after 4 commands.</p>`,
          followup: `Write the list that takes the robot from the start to column 4, row 4. Can you do it with a repeat?` } },
        { ex: { id: 'cs-11-2', kind: 'choice', skill: 'read-code', title: 'What does it print?',
          prompt: `<p>Read this program carefully. It adds up three numbers, one at a time.</p><pre class="code"><code>total = 0\nfor n in [1, 2, 3]:\n    total = total + n\nprint(total)</code></pre><p>What does it print?</p>`,
          options: [
            { text: `3`, why: `3 is the last number in the list. The program adds every number as it goes.` },
            { text: `6`, ok: true },
            { text: `123`, why: `The program adds the numbers. It does not write them next to each other.` },
            { text: `1`, why: `1 is the first number. The loop goes on through all three.` }
          ],
          hints: [`Write down total after each time round the loop.`, `Start at 0. After n = 1, total is 1. What is it after n = 2?`],
          solution: `<p>total starts at 0. With n = 1 it becomes 1; with n = 2 it becomes 3; with n = 3 it becomes 6. The print comes after the loop, so it shows 6.</p>`,
          followup: `What would it print if the list were [4, 5]? And what if print(total) were indented under the loop?` } },
        `<h2>Where next</h2>
<div class="stmt"><p><span class="kind">The courses that follow.</span> <em>From Scratch to Python</em> (SC 100) is for anyone who has used Scratch. <em>Introduction to Python</em> (SC 101) is the usual start otherwise: it runs in the page, so you write the programs above and see them run. <em>The Command Line</em> (SC 108) fits beside either. You now know what is under every one of them: parts that take input, process, store and output; a CPU that fetches, decodes and executes; numbers that stand for anything; switches that add; and messages that cross a network in packets.</p></div>`,
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>An <b>algorithm</b> is a list of exact steps that ends with a result. A computer does what the steps say, not what you meant.</li>
<li>A robot follows every command, even a bad one. Careful lists, tested by running them, are how programs get right.</li>
<li><b>Repeat</b> lets a few words stand for many steps; <b>if / else</b> lets a program choose. Both are in every language.</li>
<li>Code is a list of exact steps in a language a computer can translate. You can read a few lines already.</li>
</ul><p>So how exact must the steps be? Exact enough that someone with no judgement at all, which is what the computer is, can follow them and get the right answer.</p></div>`
      ]
    }
  ]
});
