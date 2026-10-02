// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// What Is a Computer?: the first course, before any programming. No code runs here: the exercises are answer, choice and table kinds
// (src/mathgrade.js), and the figures (widgets.js: parts, cpu, bits, pipeline) carry the ideas.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'computer', code: 'SC 099', short: 'Computers', lang: 'none', status: 'developing',
  title: 'What Is a Computer?',
  grades: 'Grades 6–12 · start here',
  audience: `<p><b>Anyone about to learn programming</b>, at any age. Four short lessons on the machine itself: what is inside the case, what each part does, how a program gets from your keyboard to the chip, and what the words mean that every other course takes for granted: processor, memory, storage, file, operating system, bit, byte.</p><p>No experience is needed and no code is written. Each lesson takes about half an hour.</p>`,
  tagline: 'Before any code: what a computer is made of, what each part does, how it stores and runs a program, and what the words mean.',
  description: `<p>Every programming course starts with a program and a computer that runs it, and takes the computer for granted. This course does not. In four short lessons it opens the case: input, processing, memory, storage and output; what a CPU actually does, billions of times a second; why memory and storage are two different things; how everything, from a photo to a program, is stored as bits; and what the operating system and a programming language each do when you press Run.</p>
<p>Nothing here is a program. The exercises ask you to name parts, read sizes, convert a few binary numbers and sort out which part does which job. The figures let you click the parts of a computer, step a tiny processor through a program one phase at a time, and flip the eight switches of a byte.</p>
<p>When you are done, the first lesson of any other course will make sense from its first line. <em>From Scratch to Python</em> (SC 100) and <em>Introduction to Python</em> (SC 101) are the usual next steps; <em>The Command Line</em> (SC 108) fits beside any of them.</p>`,
  outcomes: [
    'Name the parts of a computer (input, CPU, memory, storage, output, network) and say what each does',
    'Tell hardware from software, and an application from the operating system',
    'Explain what a CPU does in the fetch, decode and execute cycle, and what clock speed and cores mean',
    'Explain the difference between memory (RAM) and storage, and why one forgets when the power goes',
    'Read and write small binary numbers, and use bit, byte, kilobyte, megabyte and gigabyte correctly',
    'Describe what happens between writing a program and the computer running it'
  ],
  affirm: ['Right.', 'Correct. That is how it works.', 'Yes. You know your way around the machine now.', 'Exactly right.', 'Correct, and worth remembering.'],
  howItWorks: `<h3>How to use these pages</h3><p>Read each lesson in order; they are short. The figures are interactive: click the parts, step the processor, flip the bits. Each lesson has quick checks to confirm an idea before moving on, and two graded exercises at the end. <b>Check answer</b> grades them on the spot; <b>Hint</b> helps, and <b>Solution</b> explains. Progress is saved on this device.</p>`,
  lessons: [
    /* ================================================================== */
    {
      title: 'The parts of a computer', summary: 'Input, processing, memory, storage and output; what is in the case; hardware and software.',
      blocks: [
        `<p>In February 1946 the United States Army showed reporters a machine that filled a room at the University of Pennsylvania: ENIAC, the first general-purpose electronic computer. It weighed thirty tons, held about eighteen thousand vacuum tubes, and could add five thousand numbers in a second, which was faster than anything before it by a thousand times. It had no keyboard and no screen. It was programmed by six women, Kay McNulty, Betty Jennings, Betty Snyder, Marlyn Wescoff, Fran Bilas and Ruth Lichterman, who set thousands of switches and plugged cables into panels by hand, working from the wiring diagrams because there was no manual.</p>
<p>The phone in your pocket is millions of times faster, and it is made of the same parts doing the same jobs. Learn the parts once and every computer, from ENIAC to a laptop to the chip in a washing machine, looks the same.</p>`,
        { photo: 'eniac', caption: 'ENIAC at the Army\'s Ballistic Research Laboratory. Betty Snyder, one of the six programmers, stands in front; Glen Beck works at the panels behind. A program was the pattern of these cables and switches.' },
        `<h2>Four jobs</h2>
<p>Whatever a computer is doing, it is doing four things. It takes something <em>in</em>. It <em>processes</em> it: calculates, compares, decides. It <em>stores</em> things, for a moment or for years. And it puts something <em>out</em>. Type a word, and the keyboard is input, the processor works out which letters you meant, memory holds the document, the screen shows the letters: output.</p>
<div class="stmt"><p><span class="kind">Input</span> is anything that goes into the computer: keyboard, mouse, touchscreen, microphone, camera, a file arriving over the network.</p>
<p><span class="kind">Processing</span> is the work: arithmetic, comparing, moving data about. The CPU does it.</p>
<p><span class="kind">Storage</span> keeps things. Memory (RAM) keeps what is being worked on right now; the drive (SSD or hard disk) keeps files for years.</p>
<p><span class="kind">Output</span> is anything that comes out: the screen, speakers, a printer, a file sent over the network.</p></div>
<p>Here are the parts, drawn as they connect. Click each one.</p>`,
        { fig: 'parts', caption: 'The parts of a computer and how data moves between them. Everything inside the case goes through the CPU; input comes in from the left, output goes out to the right, and the network is both.' },
        { check: 'A student speaks into a laptop\'s microphone and the laptop shows the words on the screen. Which parts were input and output?', options: ['Microphone: output; screen: input', 'Microphone: input; screen: output', 'Both are input; the CPU is the output', 'Both are output'], answer: 1, why: 'Sound went <em>in</em> through the microphone; the words came <em>out</em> on the screen. In between, the CPU processed the sound into text and memory held it.', wrong: ['It is the other way round: the microphone brings sound in.', '', 'The CPU processes; it never shows anything by itself.', 'The microphone takes sound in, which makes it input.'] },
        `<h2>Inside the case</h2>
<p>Open a desktop computer, or look at a picture of a laptop's insides, and you find a large flat board, the <em>motherboard</em>, with everything plugged into it. Three parts matter most.</p>
<p>The <em>CPU</em>, the central processing unit, is a chip about the size of a postage stamp under a metal lid, often with a fan on top because it gets hot. It carries out the instructions of every program. The next lesson is about it.</p>
<p>The <em>memory</em>, called RAM, is one or more thin sticks of chips next to the CPU. It holds the programs that are running and the data they are using, and it is fast: the CPU can reach anything in it in under a ten-millionth of a second. But it is <em>volatile</em>: when the power goes off, it is blank.</p>
<p>The <em>storage</em> is an SSD (a card of memory chips that remember without power) or a hard disk (a stack of spinning magnetic plates). It holds the operating system, the programs and your files, for years, with the power off. It is bigger than RAM, hundreds of times bigger, and slower.</p>
<div class="stmt"><p><span class="kind">Memory is not storage.</span> People say "memory" for both, and that causes most of the confusion in this subject. RAM is the desk you work at: fast, small, cleared every night. Storage is the filing cabinet: slow, big, permanent. Opening a file copies it from the cabinet to the desk; saving copies it back.</p></div>
<p>Around these sit the power supply, the graphics chip that draws the screen, the network chip, and the <em>ports</em>: USB, HDMI, headphone, the holes where the outside world plugs in.</p>`,
        { photo: ['pc-inside', 'raspberry-pi-4'], caption: 'Left: a home-built desktop computer seen through its side window. The CPU is under the round fan glowing green; the sticks of RAM stand just to its right; the long card across the middle is the graphics card; drives sit at the bottom. Right: a Raspberry Pi 4, a whole computer on one board the size of a bank card. The CPU is under the shiny metal square, the RAM is the black chip beside it, and the ports line the edges: USB and network on the right, power, two HDMI and headphones along the bottom.' },
        { check: 'You have been typing an essay for an hour and the power goes out before you saved. Where was the essay, and what happened to it?', options: ['In storage; it is safe', 'In RAM; it is gone', 'In the CPU; it is gone', 'On the screen; it is gone'], answer: 1, why: 'A document you are editing lives in RAM, which forgets when the power stops. Saving copies it to storage, which does not. (Many programs now save for you every few seconds, which is why this hurts less than it used to.)', wrong: ['It had not been saved, so it never reached storage.', '', 'The CPU works on a few numbers at a time; it does not hold a document.', 'The screen shows the document; it does not keep it.'] },
        `<h2>Hardware and software</h2>
<p>Everything you can touch is <em>hardware</em>: the chips, the drive, the screen, the cables. Everything the hardware does is told to it by <em>software</em>: programs, which are lists of instructions stored as data. Software has no weight and no shape; it is a pattern of bits in storage and memory, and the same hardware behaves as a calculator, a game or a word processor depending on which pattern it is running.</p>
<div class="stmt"><p><span class="kind">The operating system</span> (Windows, macOS, Linux, Android, iOS) is the software that runs first and runs always. It manages the hardware, keeps the files, and starts and stops the other programs.</p>
<p><span class="kind">Applications</span> are the programs you choose to run: a browser, a game, an editor. They ask the operating system for what they need (a window, a file, the network) rather than touching the hardware themselves.</p></div>
<p>Lesson 4 comes back to software and to how a program is made. First, the two parts that do the most work.</p>`,
        { check: 'Which of these is software?', options: ['A USB stick', 'The Chrome browser', 'A touchscreen', 'A graphics card'], answer: 1, why: 'A browser is a program: instructions stored as data. The other three are things you can hold. (The USB stick is hardware; the files on it are software or data.)', wrong: ['You can hold it: hardware. What is stored on it is another matter.', '', 'The screen is hardware. The program that reads your taps is software.', 'A card with chips on it is hardware.'] },
        { ex: { id: 'cs-1-1', kind: 'table', title: 'Which part does which job?', 
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
        { ex: { id: 'cs-1-2', kind: 'choice', title: 'Hardware or software', multi: true,
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
      title: 'The processor and memory', summary: 'What a CPU does: fetch, decode, execute; clock speed and cores; memory as numbered boxes; bits, bytes and binary.',
      blocks: [
        `<p>In 1971 a company called Intel, three years old, shipped a chip the size of a fingernail for a Japanese calculator. The 4004 held 2,300 transistors, the tiny switches a chip is made of, and ticked 740,000 times a second. It was the first complete processor on one chip. The processor in a new phone holds tens of billions of transistors and ticks several billion times a second, and it still does what the 4004 did: fetch an instruction from memory, work out what it means, carry it out, and go on to the next.</p>`,
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
        { check: 'In the fetch-decode-execute cycle, what does the program counter hold?', options: ['How many programs are running', 'The result of the last addition', 'The address of the next instruction to fetch', 'The clock speed'], answer: 2, why: 'The program counter is the CPU\'s bookmark: the memory address of the next instruction. Fetching reads that instruction and moves the counter on; a jump instruction changes the counter to somewhere else.', wrong: ['That is the operating system\'s business, not a register.', 'That is the accumulator (ACC) in the figure.', '', 'Clock speed is a property of the chip, not something stored in a register.'] },
        `<h2>Memory is numbered boxes</h2>
<p>Memory (RAM) is a very long row of boxes, each holding one <em>byte</em>, each with an <em>address</em>: box 0, box 1, box 2, and so on up to billions. The CPU says "give me the byte at address 4,000,123" and gets it back in under a ten-millionth of a second. Everything in memory, instructions and data alike, is just bytes in boxes; what makes a byte an instruction is only that the program counter happens to point at it.</p>
<div class="stmt"><p><span class="kind">Memory is volatile.</span> RAM holds its bytes only while powered. That is why a computer "boots" when switched on: the operating system has to be copied from storage into memory before anything can run, and why unsaved work is lost in a power cut.</p>
<p><span class="kind">Sizes.</span> A laptop today has 8 to 32 gigabytes of RAM: eight to thirty-two billion boxes. Its storage is usually 256 gigabytes to 2 terabytes.</p></div>
<h2>Bits and bytes</h2>
<p>What is in a box? Eight switches, each either off or on, 0 or 1. One switch is a <em>bit</em>. Eight bits are a <em>byte</em>. With eight switches you can make 256 different patterns, and a pattern can stand for a number from 0 to 255, or a letter (the pattern 01000001 is "A" in the ASCII code), or part of a colour, or part of an instruction. The computer does not know which; the program does. A switch can be anything with two states: in the memory of the 1950s and 1960s each bit was a tiny magnetic ring, magnetised one way for 0 and the other way for 1.</p>`,
        { photo: 'core-memory', caption: 'Magnetic-core memory, close up. Every one of these rings, threaded on a grid of fine wires, held one bit.' },
        `<p>A pattern of bits is read as a number in <em>binary</em>: each switch is worth twice the one to its right, 1, 2, 4, 8, 16, 32, 64, 128, and the number is the sum of the switches that are on. Flip these.</p>`,
        { fig: 'bits', value: 65, caption: 'One byte. Start: 01000001, which is 64 + 1 = 65, the code for the letter A. Try making 10, then 255, then 128.' },
        `<div class="stmt"><p><span class="kind">The sizes you will hear.</span> 1 kilobyte (KB) is about a thousand bytes: a short email. 1 megabyte (MB) is about a million: a minute of music, a photo. 1 gigabyte (GB) is about a billion: an hour of video. 1 terabyte (TB) is about a trillion: a large drive. (Strictly, computers count in 1024s rather than 1000s, which is why a "500 GB" drive shows as 465 GB; the lesson on storage comes back to it.)</p></div>`,
        { check: 'What number is the binary pattern 00001010?', options: ['2', '10', '12', '1010'], answer: 1, why: 'The switches that are on are worth 8 and 2 (counting from the right: 1, 2, 4, 8). 8 + 2 = 10. The pattern happens to look like "1010", but that is not its value.', wrong: ['Two switches are on, but their values are 8 and 2, and the number is the sum.', '', '12 would be 8 + 4: pattern 00001100.', 'That is the pattern read as decimal digits, not as binary.'] },
        { check: 'How many different values can one byte hold?', options: ['8', '100', '255', '256'], answer: 3, why: 'Eight switches, each with two settings: 2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 256 patterns, numbered 0 to 255. (255 is the largest value, not the number of values.)', wrong: ['Eight is the number of bits, not of patterns.', '', '255 is the largest value; counting 0 as well there are 256.', ''] },
        { ex: { id: 'cs-2-1', kind: 'answer', title: 'Binary and sizes',
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
        { ex: { id: 'cs-2-2', kind: 'choice', title: 'The cycle',
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
      title: 'Storage, input and output', summary: 'Hard disks and SSDs; files and folders; file sizes; the devices that bring data in and send it out; the network.',
      blocks: [
        `<p>In 1956 IBM delivered the first computer hard disk, the 350, to a customer: fifty metal plates two feet across, spinning in a cabinet the size of two refrigerators, with a reading arm that moved between them. It stored about five million characters, roughly the text of a long novel, and it was leased for thousands of dollars a month. A microSD card today, the size of a fingernail, holds a hundred thousand times as much and costs about as much as a sandwich. The job has not changed: keep the bits when the power is off.</p>`,
        { photo: ['ibm-350-disk', 'hard-disk-open'], caption: 'Left: the disk unit of an IBM 350, the first hard disk, now in the Computer History Museum, with its tall stack of plates. Right: a 500 GB laptop hard disk, opened: one plate and one reading arm, the same idea holding a hundred thousand times as much.' },
        `<h2>Storage</h2>
<p>A <em>hard disk drive</em> (HDD) still works the way the 350 did: magnetic plates spin at thousands of turns a minute and a head floats over them reading and writing the bits. It is cheap for its size and slow, and it dislikes being dropped. A <em>solid-state drive</em> (SSD) has no moving parts: memory chips that keep their bits without power. It is faster, quieter and tougher, and almost every laptop and phone uses one. Both do the same job: hold the operating system, the programs and your files, for years. Disks still carry the biggest loads: in 2017 the eight telescopes that made the first picture of a black hole each recorded about 350 terabytes a day onto hard disks, and the disks were flown to the supercomputers that combined them.</p>`,
        { photo: 'black-hole-m87', caption: 'The result: the first picture of a black hole, in the galaxy Messier 87, released in 2019. The dark centre is the shadow of the black hole.' },
        `<div class="stmt"><p><span class="kind">A file</span> is a named sequence of bytes on storage. A photo, a song, an essay and a program are all files; what differs is what the bytes mean and which program knows how to read them. The <em>extension</em> after the dot, <code>.jpg</code>, <code>.mp3</code>, <code>.txt</code>, <code>.py</code>, is a hint about that.</p>
<p><span class="kind">A folder</span> (directory) is a named list of files and other folders. Folders inside folders make the tree that every file lives in; <em>The Command Line</em> course is largely about moving through it.</p></div>
<p>File sizes are measured in bytes. A text file is small: this lesson is about 15 KB. A photo from a phone is 2 to 5 MB. An hour of video is a few GB. A game can be 100 GB. Storage is sold by the same units: a 512 GB SSD holds over a hundred thousand photos, or five such games.</p>`,
        { check: 'Which statement about SSDs and hard disks is true?', options: ['A hard disk keeps data without power; an SSD does not', 'Both keep data without power; the SSD has no moving parts and is faster', 'An SSD is the same thing as RAM', 'A hard disk is faster because it spins'], answer: 1, why: 'Both are storage: permanent. The difference is in how: the hard disk reads spinning magnetic plates, the SSD reads chips, which is faster and quieter.', wrong: ['Both keep data without power; that is what storage means.', '', 'RAM is memory and forgets without power. An SSD is made of a different kind of chip that remembers.', 'The spinning is what makes it slow: the head has to wait for the right spot to come round.'] },
        `<h2>Input and output devices</h2>
<p>Every way into a computer is an input device, and every way out is an output device. Some are obvious: keyboard, mouse, touchpad, microphone, camera, scanner in; screen, speakers, printer, the vibration motor in a phone out. A touchscreen is both: it shows (output) and it feels (input). Each device has a chip of its own that turns the physical thing, a key going down, light on a sensor, into bytes the CPU can read, or bytes into light and sound.</p>
<div class="stmt"><p><span class="kind">Everything is bytes on the way in and bytes on the way out.</span> A pressed key becomes a number (the code for "A" is 65); a photo becomes millions of numbers, three per dot for red, green and blue; a sound becomes tens of thousands of numbers a second. On the way out, numbers become light and sound again. In between, the CPU only ever sees numbers.</p></div>
<p>The <em>network</em> is the input and output device that reaches other computers: Wi-Fi, a cable, mobile data. A web page is a file sent from a computer somewhere else into your memory, byte by byte; sending a message is the reverse. To the computer the internet is not a place; it is a very long cable with other computers at the far end.</p>`,
        { photo: 'data-centre-cern', caption: 'Some of the computers at the far end: a server room at CERN, the physics laboratory in Switzerland where the World Wide Web was invented. Each cabinet is full of computers with no screen or keyboard, answering requests that arrive over the network.' },
        { check: 'A touchscreen is', options: ['An input device only', 'An output device only', 'Both an input and an output device', 'Storage'], answer: 2, why: 'It shows the picture (output) and senses your finger (input). Two devices in one sheet of glass.', wrong: ['It also shows the picture.', 'It also feels your finger.', '', 'It keeps nothing when the power is off.'] },
        `<h2>Why 500 GB is 465 GB</h2>
<p>Drive makers count in thousands: a kilobyte is 1,000 bytes, a gigabyte 1,000,000,000. Computers, which count in binary, find 1,024 (that is 2 to the power 10) more natural, and operating systems often report sizes in units of 1,024. A drive sold as 500,000,000,000 bytes is 500 GB by the first count and 465.7 by the second. Nothing is missing; the two sides are using the same word for slightly different units. Some systems write the binary units as KiB, MiB, GiB to be clear.</p>`,
        { check: 'A phone photo is about 4 MB. About how many fit on a 64 GB card with nothing else on it?', options: ['160', '1,600', '16,000', '160,000'], answer: 2, why: '64 GB is 64,000 MB, and 64,000 ÷ 4 = 16,000 photos. (Counting in 1,024s changes the answer by a few per cent, not by a factor of ten.)', wrong: ['That would be a 640 MB card.', 'That would be a 6.4 GB card.', '', 'That would need 640 GB.'] },
        { ex: { id: 'cs-3-1', kind: 'answer', title: 'Sizes and devices',
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
        { ex: { id: 'cs-3-2', kind: 'choice', title: 'In or out', multi: true,
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
      title: 'Software: from your program to the chip', summary: 'What the operating system does; what a program is; how a programming language becomes instructions the CPU can run; and what to expect when you start coding.',
      blocks: [
        `<p>In 1952 Grace Hopper, a mathematician and Navy officer working on one of the first commercial computers, the UNIVAC, wrote a program whose job was to write programs. Until then, every instruction a computer ran had to be written by hand as numbers. Hopper's program, which she called a <em>compiler</em>, took short words and turned them into those numbers. Her colleagues told her a computer could not possibly understand words. By the end of the decade her ideas had become COBOL, a language in which banks and governments wrote programs for the next sixty years. The programs you are about to write will go through a descendant of her idea every time you press Run.</p>`,
        `<h2>The operating system</h2>
<p>When a computer starts, the first software to run is the <em>operating system</em>: Windows, macOS or Linux on a computer, Android or iOS on a phone. It stays running until the power goes off, and it does three jobs that every other program depends on.</p>
<div class="stmt"><p><span class="kind">It runs the programs.</span> It loads a program from storage into memory, gives it a share of the CPU's time, and takes the memory back when the program ends. Dozens of programs run "at once" because the operating system switches the CPU between them thousands of times a second.</p>
<p><span class="kind">It keeps the files.</span> Programs ask it for "the file called essay.txt"; it knows where on the drive the bytes are.</p>
<p><span class="kind">It owns the hardware.</span> A program that wants to draw on the screen, read the keyboard or send a message over the network asks the operating system, which does it on the program's behalf. That is why one badly written program does not take the whole machine down with it.</p></div>`,
        { check: 'Why can a computer run a browser, a music player and a download at the same time on one CPU core?', options: ['The CPU runs three instructions at once', 'The operating system switches the CPU between the programs thousands of times a second', 'Each program has its own CPU', 'The browser runs the other two'], answer: 1, why: 'One core runs one instruction stream at a time. The operating system gives each program a slice of a few milliseconds and switches, so quickly that all three seem to run together. More cores let it really run several at once.', wrong: ['A core does one instruction stream at a time; the trick is in the switching.', '', 'Programs share the cores; they do not own them.', 'Programs do not run each other; the operating system runs them all.'] },
        `<h2>What a program is</h2>
<p>A program is a list of instructions for the CPU, stored as bytes in a file. When you double-click it, the operating system copies the bytes into memory, points the program counter at the first instruction, and the cycle from lesson 2 begins.</p>
<p>But nobody writes those bytes by hand any more. You write <em>source code</em>: text, in a programming language such as Python, Java or C++, that people can read. Source code can be enormous: printed out, the code that Margaret Hamilton and her team at MIT wrote for the Apollo spacecraft that took astronauts to the Moon made a stack as tall as she was. Something has to turn that text into the numbers the CPU runs. There are two ways.</p>`,
        `<div class="stmt"><p><span class="kind">A compiler</span> reads your whole program, checks it, and translates it once into a file of CPU instructions. You then run that file; the compiler is no longer needed. C++ and Java work this way (Java's compiler produces instructions for a "virtual machine", a program that then runs them).</p>
<p><span class="kind">An interpreter</span> reads your program one statement at a time and carries each one out as it goes, every time you run it. Python works this way. It starts faster and shows errors where they happen, and the program runs more slowly.</p></div>`,
        { fig: 'pipeline', caption: 'From source code to a running program, the compiled way: the text you write, a compiler that checks and translates it, a file of machine instructions, and the CPU that runs them. With an interpreter the middle two steps happen while the program runs.' },
        `<p>Either way, the computer does exactly what the program says, which is not always what the programmer meant. A mistake in a program is a <em>bug</em>, and finding and fixing bugs is a large part of programming at every level. The compiler or interpreter catches some: a misspelled word, a missing bracket. The others show up only when the program runs and does the wrong thing, and those are the ones every programmer learns to hunt.</p>`,
        { photo: 'first-computer-bug', caption: 'The log book of the Harvard Mark II, 9 September 1947. The team found a moth stuck in relay 70 and taped it in: &quot;First actual case of bug being found.&quot; Engineers already called faults bugs; the joke was that this one was real.' },
        { check: 'What does a compiler do?', options: ['Runs your program one line at a time', 'Translates your whole program into CPU instructions before it runs', 'Fixes the bugs in your program', 'Copies the program from storage into memory'], answer: 1, why: 'A compiler translates once, ahead of time, and checks the program as it goes. Running one line at a time is an interpreter; copying into memory is the operating system\'s job; fixing bugs is yours.', wrong: ['That is an interpreter.', '', 'It reports some mistakes; it fixes none.', 'That is the operating system, when you start a program.'] },
        `<h2>What to expect when you start</h2>
<p>Everything in this course was about the machine. Programming is about telling it what to do, and the courses that follow are built on three facts you now know.</p>
<p>First, the computer does only what it is told, in order, one small step at a time: the fetch-decode-execute cycle has no imagination. A program is a precise list of steps, and writing one is mostly thinking about the steps.</p>
<p>Second, everything is bytes. Text, numbers, pictures, the program itself: all patterns in memory, and the program decides what they mean. A programming language gives you names for them, <em>variables</em>, so you never have to think about addresses.</p>
<p>Third, the computer tells you when you are wrong, in its own words. "Syntax error", "name is not defined", "no such file or directory": each message is precise, and reading it carefully is the skill that separates people who get stuck from people who get on.</p>
<div class="stmt"><p><span class="kind">Where next.</span> <em>From Scratch to Python</em> (SC 100) if you have used Scratch; <em>Introduction to Python</em> (SC 101) otherwise. <em>The Command Line</em> (SC 108) alongside either. Every one of them runs your programs here in the browser: the interpreter or compiler, the memory and the CPU of these lessons, all inside a web page.</p></div>`,
        { check: 'You press Run on a Python program with a misspelled command on line 3. What happens?', options: ['The CPU skips line 3 and goes on', 'The interpreter stops at line 3 and prints an error naming it', 'The operating system fixes the spelling', 'The program runs, but slowly'], answer: 1, why: 'The interpreter carries out statements one at a time; when it reaches one it cannot understand it stops and tells you where. Reading that message is the first thing to learn.', wrong: ['Nothing is skipped: the computer does what it is told, and here it was told something it cannot do.', '', 'The operating system runs programs; it does not read them.', 'A program that cannot be understood does not run at all.'] },
        { ex: { id: 'cs-4-1', kind: 'table', title: 'Who does the job?',
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
        { ex: { id: 'cs-4-2', kind: 'choice', title: 'The whole journey',
          prompt: '<p>You write a Python program in an editor, save it, and run it. Which list puts the steps in the right order?</p>',
          options: [
            { text: 'The CPU runs the text you typed directly; the interpreter saves the file; the operating system shows the output.', why: 'The CPU cannot run text. Something must translate or interpret it first.' },
            { text: 'The editor saves the text to storage as a file; the operating system loads the interpreter into memory; the interpreter reads your file and carries out each statement, asking the operating system to print the output.', ok: true },
            { text: 'The compiler saves the file; the CPU reads it from storage one letter at a time; the screen shows the result.', why: 'Python uses an interpreter, and the CPU never reads a file by itself: the operating system loads things into memory.' },
            { text: 'The operating system translates the program into binary and stores it in RAM for ever.', why: 'The operating system runs programs; it does not translate them, and RAM keeps nothing for ever.' }
          ],
          hints: ['Storage keeps the file; memory holds what runs; the interpreter runs the program; the operating system starts programs and owns the screen.', 'Follow the bytes: file on the drive, program in memory, statements carried out, output drawn.'],
          solution: '<p>Saving writes your text to storage as a file. Running asks the operating system to start the interpreter, which it loads into memory. The interpreter reads the file and carries out each statement in turn, and when a statement prints something it asks the operating system to draw it on the screen.</p>',
          followup: 'Now open SC 100 or SC 101 and press Run on the first program. Every step of this journey happens inside the page.' } },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>The <b>operating system</b> runs programs (switching the CPU between them), keeps the files, and owns the hardware on the programs' behalf.</li>
<li>A <b>program</b> is CPU instructions in a file. You write <b>source code</b>; a <b>compiler</b> translates it once ahead of time (C++, Java), an <b>interpreter</b> carries it out statement by statement (Python).</li>
<li>A <b>bug</b> is a mistake in a program. Some are caught before it runs; the rest show up as wrong behaviour. Error messages are precise: read them.</li>
<li>Three facts to carry into programming: the computer does exactly what it is told, in order; everything is bytes and the program gives them meaning; the messages tell you where you went wrong.</li>
</ul></div>`
      ]
    }
  ]
});
