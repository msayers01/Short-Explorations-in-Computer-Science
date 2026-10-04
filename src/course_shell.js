// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// The Command Line: a course on the Unix shell, taught in the practice terminal (src/shell.js, src/terminal.js). Every example is a
// live terminal over the files named by its setup (course.setups below; src/shellgrade.js builds them), and exercises of kind 'shell'
// are graded on what the files look like afterwards and on what was typed, not on the exact commands.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'shell', code: 'SC 108', short: 'Command line', lang: 'shell', status: 'developing', standard: 1,
  title: 'The Command Line',
  grades: 'Grades 7–12 · no experience needed',
  audience: `<p><b>Grades 7–12</b>, and anyone who has only ever used a computer through windows and a mouse. Nothing to install and nothing to break: the terminal on these pages is a practice one, with its own files, inside your browser.</p><p>Programmers, scientists, system administrators and anyone who runs a server spend much of their day typing commands. It looks like a wall of text at first. It is actually a small language with about twenty words, and after two lessons you will be reading it.</p>`,
  tagline: 'Folders, files, paths, pipes and scripts: the keyboard way of running a computer, practised in a terminal in your browser.',
  description: `<p>Under every window there is a command line: a place where you type a short instruction and the computer carries it out. It is older than the mouse and still everywhere. Programmers run their programs from it, scientists run their experiments from it, and the computers that serve web pages have nothing else.</p>
<p>This course teaches the Unix command line, which is what Linux, macOS, the Raspberry Pi, every web server and (through WSL) Windows all speak. You will learn where you are and how to move, how to make, copy, move and remove files, how to look inside them, how to join small commands into big ones with pipes, how to run your own programs, and how to write a script that does a chore for you. One lesson shows the same ideas in the Windows Command Prompt and PowerShell.</p>
<p>Everything happens in a practice terminal on the page. It has its own files, saved in your browser, and the commands behave the way the real ones do, with the same messages when something goes wrong. The <b>Code Lab</b> has the same terminal with your own programs in it.</p>`,
  outcomes: [
    'Read a prompt, find out where you are, and move around a directory tree with absolute and relative paths',
    'Make, copy, move, rename and remove files and directories, and use wildcards to name many at once',
    'Look inside files with cat, head, tail, wc and grep, and search a whole tree with find',
    'Join commands with pipes and send their output to files',
    'Run your own Python, Java and C++ programs from the command line, with input from a file',
    'Read the same ideas in the Windows Command Prompt and PowerShell',
    'Write a shell script with variables, a loop and an if, and make it run with one command'
  ],
  affirm: ['That is exactly how it is done.', 'Correct. The files say so.', 'Yes. You are speaking shell.', 'Right. On to the next one.', 'That works, and it would work on a real computer too.'],
  howItWorks: `<h3>How to use these pages</h3><p>Each lesson has terminals in it. Press <b>Run</b> on an example and watch the commands go in one at a time; then click in the terminal and type your own. The up arrow brings back a command you typed; <b>Tab</b> finishes a name for you; <b>Reset</b> puts the files back the way the example began. Nothing you type here can touch your real computer.</p><p>Exercises are checked by looking at the files afterwards: what exists, what is where, what is inside. How you got there is up to you. When one passes, a stretch challenge follows. Lesson 5 is a <b>checkpoint</b>: no new commands, just mixed questions on the four lessons before it. The questions come back on the Review page after a day, then after longer gaps.</p>`,
  // The named skills of the course (LESSON_STANDARD.md §4). Each quick check and exercise names the skill it practises. Lessons 6 to 9 (planned)
  // will add skills for running programs, the Windows shells, scripts and the tidy-up project.
  skills: [
    { id: 'look-around', name: 'Read the prompt and look around with pwd and ls' },
    { id: 'paths', name: 'Write absolute and relative paths' },
    { id: 'cd', name: 'Move with cd: .., home and back' },
    { id: 'make', name: 'Make files and directories' },
    { id: 'copy-move', name: 'Copy, move and rename with cp and mv' },
    { id: 'remove', name: 'Remove things, knowing there is no undo' },
    { id: 'wildcards', name: 'Name many files at once with wildcards' },
    { id: 'read-files', name: 'Read and count with cat, head, tail and wc' },
    { id: 'grep', name: 'Search inside files with grep' },
    { id: 'find', name: 'Search for files with find' },
    { id: 'redirect', name: 'Redirect output, errors and the exit status' },
    { id: 'pipes', name: 'Join commands with pipes' }
  ],
  setups: {
    checkpoint1: {
      'inbox/a.txt': 'apple\n',
      'inbox/b.txt': 'banana\n',
      'inbox/c.log': 'ERROR one\nINFO two\nERROR three\nINFO four\n',
      'inbox/old.tmp': 'junk\n',
      'archive/': null
    },
    lesson1: {
      'README.txt': 'Welcome! This is your home directory.\nType ls to see what is here.\n',
      'garden/': null,
      'garden/.wishes': 'I wish for more tulips.\n',
      'garden/pond/fish.txt': 'three goldfish\n',
      'garden/shed/key.txt': 'The key opens the gate.\nThe password is: tulip\n',
      'letters/to-grandma.txt': 'Dear Grandma,\nThe garden is doing well.\n',
      'letters/to-sam.txt': 'Sam,\nBring the ladder on Saturday.\n'
    },
    lesson2: {
      'desk/cat.jpg': '(a picture of a cat)\n',
      'desk/dog.jpg': '(a picture of a dog)\n',
      'desk/essay.txt': 'My summer\nIt rained.\n',
      'desk/notes.txt': 'buy milk\nfix bike\n',
      'desk/game.py': 'print("play!")\n',
      'desk/old.tmp': 'junk\n',
      'desk/junk.tmp': 'more junk\n',
      'recipe.txt': 'pancakes: flour, eggs, milk\n'
    },
    lesson3: {
      'poem.txt': 'The fog comes\non little cat feet.\n\nIt sits looking\nover harbor and city\non silent haunches\nand then moves on.\n',
      'server.log': '09:00:01 INFO  server started\n09:00:05 INFO  user ada logged in\n09:01:12 WARN  slow query (2.1 s)\n09:02:30 ERROR disk full on /data\n09:02:31 INFO  retrying write\n09:02:33 ERROR disk full on /data\n09:05:00 INFO  user grace logged in\n09:07:45 WARN  slow query (3.4 s)\n09:09:10 INFO  backup finished\n09:12:02 ERROR connection lost to db1\n09:12:03 INFO  reconnected to db1\n09:15:00 INFO  user ada logged out\n',
      'scores.csv': 'name,quiz,test\nada,9,88\nbob,7,74\ncy,10,95\ndee,8,81\n',
      'library/': null,
      'library/moby.txt': 'Call me Ishmael. Some years ago, never mind how long precisely,\nhaving little or no money in my purse, I thought I would sail about\na little and see the watery part of the world.\n',
      'library/hobbit.txt': 'In a hole in the ground there lived a hobbit. Not a nasty, dirty,\nwet hole, nor yet a dry, bare, sandy hole: it was a hobbit-hole,\nand that means comfort. The dragon came much later.\n',
      'library/old/alice.txt': 'Alice was beginning to get very tired of sitting by her sister on\nthe bank, and of having nothing to do.\n',
      'projects/game/main.py': 'print("game")\n',
      'projects/game/levels.py': 'levels = [1, 2, 3]\n',
      'projects/game/notes.txt': 'ideas for level 4\n',
      'projects/calc/calc.py': 'print(2 + 2)\n',
      'projects/README.md': '# My projects\n'
    },
    lesson4: {
      'speech.txt': 'the quick brown fox jumps over the lazy dog the dog sleeps\nthe fox runs and the fox jumps again\nthe end\n',
      'server.log': '09:00:01 INFO  server started\n09:00:05 INFO  user ada logged in\n09:01:12 WARN  slow query (2.1 s)\n09:02:30 ERROR disk full on /data\n09:02:31 INFO  retrying write\n09:02:33 ERROR disk full on /data\n09:05:00 INFO  user grace logged in\n09:07:45 WARN  slow query (3.4 s)\n09:09:10 INFO  backup finished\n09:12:02 ERROR connection lost to db1\n09:12:03 INFO  reconnected to db1\n09:15:00 INFO  user ada logged out\n',
      'scores.csv': 'name,quiz,test\nada,9,88\nbob,7,74\ncy,10,95\ndee,8,81\n',
      'names.txt': 'bob\nada\ncy\nada\ndee\nbob\nada\n',
      'notes/': null
    }
  },
  lessons: [
    /* ================================================================== */
    {
      standard: 1, standards: ['3A-CS-02', '3B-CS-01'],
      title: 'Where am I?', summary: 'What a shell is, how to read the prompt, the tree of directories, absolute and relative paths, and moving around with cd.',
      blocks: [
        `<p>In the summer of 1969, Ken Thompson's wife took their baby son to California for a few weeks to visit family. Thompson, a programmer at Bell Labs in New Jersey, stayed behind with a small computer nobody was using, a PDP-7, and a plan. He gave himself about one week for each of the four pieces of an operating system: the part that manages the machine, an editor, an assembler, and a program whose only job was to read what a person typed and run it. That last program is the <em>shell</em>. The system it belonged to became Unix.</p>`,
        { photo: 'pdp-7', caption: 'A PDP-7, the model of computer Thompson used for the first Unix, at the Living Computer Museum in 2018. On the right is a keyboard terminal that typed its output onto a roll of paper.' },
        `<p>More than fifty years later, the shell is still there. Every Linux computer, every Mac, every Raspberry Pi and every web server has one, and the one most of them use, <code>bash</code>, was first released in 1989 by Brian Fox for the GNU project. The ideas have barely changed since Thompson's summer: you type a command, the shell runs it, the result appears, and you type the next one.</p>
<p>But a shell has no windows and no icons. So how does it know <em>where</em> you are among thousands of files, and how do you tell it where to go?</p>
<h2>The prompt</h2>
<p>A terminal shows a <em>prompt</em>: the shell's way of saying "your turn". The practice terminal's prompt looks like this:</p>
<pre class="code"><code>student@lab:~$</code></pre>
<p>Read it in three pieces. <code>student</code> is your user name. <code>lab</code> is the name of the computer. <code>~</code> is where you are: the squiggle, called a <em>tilde</em>, stands for your <em>home directory</em>, the folder that belongs to you. The <code>$</code> at the end just means "type here". (A directory is what a window-and-mouse computer calls a folder. The two words mean the same thing; the shell says directory.)</p>
<p>Type a command after the prompt and press Enter. The first command to learn asks the shell where you are.</p>`,
        { play: `pwd
ls`, setup: 'lesson1', caption: '<code>pwd</code> is "print working directory": the directory you are in, spelled out in full. <code>ls</code> lists what is in it. Press Run, then click in the terminal and type them yourself.' },
        `<details class="reveal"><summary>Guess first: before you press Run, what will <code>pwd</code> print?</summary><p>It prints <code>/home/student</code>: the full address of your home directory. Then <code>ls</code> shows three names: <code>garden</code>, <code>letters</code> and <code>README.txt</code>.</p></details>`,
        `<div class="stmt"><p><span class="kind">The working directory.</span> At every moment the shell is <em>in</em> one directory, called the working directory. Commands that name a file without saying where it is look in the working directory. <code>pwd</code> prints it; the prompt shows it after the colon, with <code>~</code> standing for your home.</p></div>
<p>The listing you got was short: a file called <code>README.txt</code> and two directories, <code>garden</code> and <code>letters</code>. The terminal colours directories blue so you can tell them from files. If you want the shell to spell it out, <code>ls -F</code> puts a <code>/</code> after every directory.</p>`,
        { check: 'The prompt says <code>student@lab:~$</code>. Where are you?', skill: 'look-around', options: ['In a directory called <code>student</code>', 'In your home directory', 'On a computer called <code>student</code>', 'Nowhere yet: you have to type <code>cd</code> first'], answer: 1, why: 'The part after the colon is where you are, and <code>~</code> is the shell\'s short name for your home directory. <code>student</code> is your user name and <code>lab</code> is the computer\'s.', wrong: ['<code>student</code> is the part before the <code>@</code>: that is who you are, not where you are.', null, 'The computer\'s name comes after the <code>@</code>.', 'The shell always starts somewhere. It starts in your home.'] },
        `<h2>Directories are a tree</h2>
<p>Every file on a Unix computer lives somewhere in one big tree. The tree has one root, written <code>/</code>, and everything else hangs below it. Your home directory is a branch of that tree, usually at <code>/home/</code><em>yourname</em>; here it is <code>/home/student</code>, which is why <code>pwd</code> printed that. Inside it are your own branches.</p>
<p>Here is the tree this lesson's terminal starts with. Click on anything to see how it is named.</p>`,
        { fig: 'fstree', tree: { 'README.txt': '', 'garden/': null, 'garden/.wishes': '', 'garden/pond/fish.txt': '', 'garden/shed/key.txt': '', 'letters/to-grandma.txt': '', 'letters/to-sam.txt': '' }, cwd: '~', caption: 'The directory tree of this lesson. Click a name to see its absolute path, its path from home and its path from where you are; "go here" moves you, the way <code>cd</code> would.' },
        `<p>A <em>path</em> is a name for a place in the tree. There are two ways to write one.</p>
<div class="stmt"><p><span class="kind">Absolute paths</span> start at the root with <code>/</code> and name every step down: <code>/home/student/garden/shed/key.txt</code>. They mean the same thing no matter where you are.</p>
<p><span class="kind">Relative paths</span> start from the working directory and do not begin with <code>/</code>: from home, <code>garden/shed/key.txt</code> is the same file. From inside <code>garden</code>, it is <code>shed/key.txt</code>.</p>
<p><span class="kind">Three short names.</span> <code>~</code> is your home, so <code>~/garden</code> works from anywhere. <code>.</code> (one dot) is the directory you are in. <code>..</code> (two dots) is the directory above it, so <code>../letters</code> from inside <code>garden</code> means "up one, then into letters".</p></div>
<p>The slash is the separator between steps: <code>garden/shed</code> means "shed, inside garden". A path can be given to almost any command. <code>ls</code> with a path lists that directory instead of the one you are in.</p>`,
        { play: `ls garden
ls garden/shed
ls /
ls -l letters`, setup: 'lesson1', caption: '<code>ls</code> of a relative path, of a deeper one, of the root of the whole tree, and a long listing (<code>-l</code>) of <code>letters</code>, which shows each file\'s size in bytes and when it changed.' },
        `<details class="reveal"><summary>Guess first: what will <code>ls garden/shed</code> show, and what is at the very top of the tree (<code>ls /</code>)?</summary><p><code>garden/shed</code> holds one file, <code>key.txt</code>. The root holds six directories: <code>bin</code>, <code>dev</code>, <code>etc</code>, <code>home</code>, <code>tmp</code> and <code>usr</code>. Your own files are somewhere inside <code>home</code>.</p></details>`,
        `<p>Look at the root. <code>bin</code> holds the commands themselves (<code>ls</code> is a program that lives at <code>/bin/ls</code>), <code>etc</code> holds settings, <code>home</code> holds the users' home directories, <code>tmp</code> is for temporary files. On a real machine there are a few more, and you do not need them.</p>
<p>Words after a command that start with a dash, like <code>-l</code>, are <em>options</em>: switches that change what the command does. <code>ls -a</code> shows <em>all</em> files, including hidden ones, whose names start with a dot. Options can be combined: <code>ls -la</code> or <code>ls -l -a</code>.</p>`,
        { play: `ls garden
ls -a garden`, setup: 'lesson1', caption: 'A dot at the start of a name hides a file from a plain <code>ls</code>. Real home directories are full of them: settings files that programs keep out of the way.' },
        { check: 'You are in <code>~/garden</code>. Which of these names <code>key.txt</code>, which is inside <code>shed</code>?', skill: 'paths', options: ['<code>key.txt</code>', '<code>shed/key.txt</code>', '<code>garden/shed/key.txt</code>', '<code>/shed/key.txt</code>'], answer: 1, why: 'A relative path starts from where you are. From inside <code>garden</code>, the next step down is <code>shed</code>, then the file. <code>garden/shed/key.txt</code> would be right from home; <code>/shed/key.txt</code> is absolute and starts at the root, where there is no <code>shed</code>.', wrong: ['<code>key.txt</code> alone means a file in the directory you are in, and you are in <code>garden</code>, not in <code>shed</code>.', null, 'That path is right from your home directory, but you are one step further down already.', 'A path starting with <code>/</code> starts at the root of the whole tree. There is no <code>shed</code> there.'] },
        `<h2>Moving around</h2>
<p><code>cd</code>, "change directory", moves you. Give it a path, relative or absolute. <code>cd ..</code> goes up one level. <code>cd</code> on its own takes you home from anywhere, and <code>cd -</code> goes back to where you were last.</p>`,
        { play: `cd garden
pwd
cd shed
pwd
cat key.txt
cd ..
pwd
cd
pwd`, setup: 'lesson1', caption: 'Watch the prompt change as you move: it always shows the working directory. <code>cat</code> prints a file. (Lesson 3 is all about looking inside files.)' },
        `<details class="reveal"><summary>Guess first: after <code>cd garden</code>, <code>cd shed</code> and <code>cd ..</code>, which directory are you in?</summary><p>In <code>garden</code>: <code>cd shed</code> went down one level and <code>cd ..</code> came back up one. The third <code>pwd</code> prints <code>/home/student/garden</code>, and a bare <code>cd</code> then takes you all the way home.</p></details>`,
        `<div class="stmt"><p><span class="kind">Tab finishes names for you.</span> Type <code>cd ga</code> and press Tab: the shell completes it to <code>cd garden/</code>. If several names could fit, press Tab twice to see them. Using Tab is not laziness; it is how people avoid typing mistakes in long names. Try it in the terminal above.</p>
<p><span class="kind">The up arrow brings back the last command.</span> Press it again for the one before. Edit and press Enter.</p></div>
<p>Two mistakes you will make, and what the shell says:</p>`,
        { play: `cd gardn
cd README.txt
cd garden/shed
cd pond`, setup: 'lesson1', expectError: true, caption: 'A misspelled name is "No such file or directory". A file is "Not a directory": you can only be inside directories. And the last line fails because <code>pond</code> is not inside <code>shed</code>; it is beside it. From <code>shed</code> you would write <code>cd ../pond</code>.' },
        `<p>Those messages are not insults. They are precise: the shell tried, and says exactly what it could not find. Read them, fix the path, and try again. Every programmer does this all day.</p>
<p>When you are lost, three commands bring you back: <code>pwd</code> to see where you are, <code>ls</code> to see what is around you, <code>cd</code> to go home. When you have forgotten a command, <code>help</code> lists them all, and <code>man ls</code> (the manual) tells you about one. <code>clear</code> wipes the screen.</p>`,
        { check: 'You are in <code>~/garden/shed</code> and type <code>cd ..</code> and then <code>cd ..</code> again. What does the prompt show?', skill: 'cd', options: ['<code>~/garden</code>', '<code>~</code>', '<code>/</code>', 'An error: you cannot go up twice'], answer: 1, why: 'Each <code>..</code> goes up one level: <code>shed</code> → <code>garden</code> → home. Once more would take you to <code>/home</code>, and once more to <code>/</code>, the root, where going up does nothing.', wrong: ['That is after the first <code>cd ..</code>. The second goes up again.', null, 'The root is two more steps up: <code>/home</code>, then <code>/</code>.', 'You can go up as many times as there are levels. At the root, <code>cd ..</code> just stays there.'] },
        { ex: { id: 'sh-1-1', kind: 'shell', skill: 'cd', title: 'Into the shed', setup: 'lesson1',
          prompt: '<p>Somewhere in the garden is a shed, and in the shed is a file called <code>key.txt</code>. Go into the shed directory and print the file with <code>cat</code>. Stay in the shed: the check looks at where you ended up and at whether the file was read.</p>',
          tests: [{ cwd: '~/garden/shed' }, { ran: /\bcat\b.*\bkey\.txt\b/, name: 'key.txt was printed with cat' }],
          hints: ['Start with <code>ls</code> to see what is in your home, then <code>cd garden</code> and <code>ls</code> again.', 'From inside <code>garden</code>, <code>cd shed</code>, then <code>cat key.txt</code>. Or do the moving in one step: <code>cd garden/shed</code>.'],
          failTip: 'The check wants two things: your prompt must end in <code>~/garden/shed</code> (if you wandered off, <code>cd ~/garden/shed</code> takes you back), and <code>cat key.txt</code> must have been typed there. Running <code>cat</code> from home, with a long path, leaves you in the wrong place.',
          solution: 'cd garden/shed\ncat key.txt',
          followup: 'Now get home with one command, and then print the same file from there with one command, using a path that starts at home.' } },
        { ex: { id: 'sh-1-2', kind: 'answer', skill: 'look-around', title: 'Hidden things', setup: 'lesson1',
          prompt: '<p>Use the terminal from any example above (press Reset first if you have moved things). Explore the garden with <code>ls</code>, <code>ls -a</code>, <code>cd</code> and <code>cat</code>, then answer.</p>',
          parts: [
            { label: 'The name of the hidden file inside <code>garden</code>', answer: ['.wishes', 'garden/.wishes', '~/garden/.wishes'], placeholder: 'starts with a dot' },
            { label: 'The password written in the shed\'s <code>key.txt</code>', answer: 'tulip' },
            { label: 'How many goldfish live in the pond (write the number)', answer: ['3', 'three'] }
          ],
          hints: ['Hidden files only show up with <code>ls -a</code>. Try <code>ls -a garden</code>.', 'The pond is a directory inside garden with a file in it: <code>cat garden/pond/fish.txt</code>.'],
          failTip: 'The hidden file\'s name begins with a dot, and a plain <code>ls</code> does not show it: use <code>ls -a garden</code>. The password is the word after "The password is:", and the number of goldfish is in <code>garden/pond/fish.txt</code>.',
          solution: '<p><code>ls -a garden</code> shows <code>.wishes</code>, which a plain <code>ls</code> hides. <code>cat garden/shed/key.txt</code> ends with "The password is: tulip". <code>cat garden/pond/fish.txt</code> says "three goldfish".</p>',
          followup: 'Print the hidden file. Then, from inside <code>letters</code>, print <code>fish.txt</code> with a path that uses <code>..</code>.' } },
        `<div class="recap"><h3>In this lesson</h3>
<p><b>How does a shell know where you are?</b> It is always <em>in</em> one directory, the working directory. The prompt and <code>pwd</code> show it, <code>cd</code> moves it, and a path, absolute or relative, names any place in the tree.</p><ul>
<li>The <b>shell</b> reads a command, runs it and shows the result. The <b>prompt</b> says who you are, which computer, and where you are; <code>~</code> is your home directory.</li>
<li>Files live in a <b>tree</b> with its root at <code>/</code>. <code>pwd</code> prints the working directory; <code>ls</code> lists one; <code>ls -l</code> gives details and <code>ls -a</code> shows hidden (dot) files.</li>
<li>An <b>absolute path</b> starts at <code>/</code>; a <b>relative path</b> starts where you are. <code>.</code> is here, <code>..</code> is up one, <code>~</code> is home.</li>
<li><code>cd</code> moves you: <code>cd garden/shed</code>, <code>cd ..</code>, <code>cd</code> (home), <code>cd -</code> (back). Tab completes names; the up arrow recalls commands.</li>
<li>"No such file or directory" means the path is wrong; "Not a directory" means you named a file. <code>help</code> and <code>man</code> are there when you forget.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['3A-DA-10', '3B-CS-01'],
      title: 'Making and moving things', summary: 'mkdir, touch and echo to make things; cp and mv to copy, move and rename; rm to remove, and why it needs care; wildcards that name many files at once.',
      blocks: [
        `<p>Late on the evening of 31 January 2017, an engineer at GitLab, a company whose servers hold the source code of thousands of projects, was trying to repair a database server that had fallen behind. There were two database servers, a main one and a spare. Late in his day, and meaning to clear out the spare, he typed a remove command on the main one. He realised within seconds and stopped it, but by then almost all of the data was gone. Then the company found that its regular backups had not been working either. About six hours of other people's work was lost for good. GitLab wrote the whole story up and published it, so that nobody else would have to learn it the same way.</p>`,
        { photo: 'tape-library-robot', caption: 'A robot arm inside the tape library of NERSC, a US supercomputer centre, with shelves of tape cartridges behind it. Copies of data kept somewhere else, and tested from time to time, are what turn a mistaken <code>rm</code> into a bad afternoon instead of lost work.' },
        `<p>The lesson they drew is the one this lesson ends with: on the command line, <em>remove means remove</em>. There is no recycle bin, and the shell does not ask whether you are sure. Everything else here, making, copying and moving, is forgiving. Learn those first, and treat the last section with respect. So what should you always do before you press Enter on a command that cannot be undone?</p>
<h2>Making things</h2>
<p>Three commands make things. <code>mkdir</code> makes a directory. <code>touch</code> makes an empty file (or, if the file exists, just updates its date). And <code>echo</code>, which prints its words, can be pointed at a file with <code>&gt;</code> to make a file with something in it. The <code>tree</code> command draws what you have made.</p>`,
        { play: `mkdir notes
touch notes/ideas.txt
echo "Learn the shell" > notes/todo.txt
tree`, setup: 'lesson2', caption: 'A directory, an empty file in it, a file with one line in it, and the picture. <code>&gt;</code> means "put the output into this file instead of on the screen"; lesson 4 says much more about it.' },
        `<details class="reveal"><summary>Guess first: which files will be inside <code>notes</code>, and which of them has something in it?</summary><p>Two: <code>ideas.txt</code>, which is empty because <code>touch</code> only makes it, and <code>todo.txt</code>, which holds the line <code>Learn the shell</code>. <code>tree</code> draws your whole home, so look for the <code>notes</code> branch.</p></details>`,
        `<div class="stmt"><p><span class="kind">Names.</span> A name can have letters, digits, dots, dashes and underscores. Spaces are allowed but a nuisance, because the shell uses spaces to separate words: <code>touch my notes.txt</code> makes two files, <code>my</code> and <code>notes.txt</code>. Use <code>my-notes.txt</code> or <code>my_notes.txt</code>, or put the name in quotes. Capitals count: <code>Notes</code> and <code>notes</code> are different.</p>
<p><span class="kind">Several at once.</span> <code>mkdir a b c</code> makes three directories. <code>mkdir -p projects/game/levels</code> makes the whole chain, parents first. <code>touch day1.txt day2.txt</code> makes two files.</p></div>
<p>What happens when a thing is already there, or its parent is not?</p>`,
        { play: `mkdir notes
mkdir notes
mkdir projects/game
mkdir -p projects/game
tree projects`, setup: 'lesson2', expectError: true, caption: '<code>mkdir</code> refuses to make a directory that exists, and refuses to make <code>game</code> when <code>projects</code> is not there yet. <code>-p</code> ("parents") makes the missing parents, and does not complain about ones that exist.' },
        { check: 'What does <code>touch report.txt</code> do when there is no file called <code>report.txt</code>?', skill: 'make', options: ['Prints an error: No such file', 'Makes an empty file with that name', 'Opens the file for editing', 'Makes a directory called <code>report.txt</code>'], answer: 1, why: '<code>touch</code> was made to update a file\'s date, and making the file when it is missing is the side effect everyone uses it for. The file is empty; <code>echo text &gt; report.txt</code> or <code>nano report.txt</code> puts something in it.', wrong: ['That message comes when the <em>directory</em> part of a path is missing, like <code>touch nowhere/report.txt</code>.', null, 'Editing is <code>nano</code>\'s job. <code>touch</code> does not open anything.', 'Directories are <code>mkdir</code>\'s job.'] },
        `<h2>Copying and moving</h2>
<p><code>cp</code> copies: <code>cp</code> <em>from</em> <em>to</em>. <code>mv</code> moves: same shape. In both, if <em>to</em> is a directory that exists, the file goes <em>into</em> it with its own name; otherwise <em>to</em> is the new name. That one rule gives <code>mv</code> two jobs: moving a file somewhere else, and renaming it where it is.</p>`,
        { play: `cp recipe.txt pancakes.txt
ls
mv pancakes.txt breakfast.txt
ls
mkdir kitchen
mv breakfast.txt kitchen
ls
ls kitchen`, setup: 'lesson2', caption: 'Copy, then rename (<code>mv</code> to a name that is not a directory), then move into a directory (<code>mv</code> to a directory that exists). After the last <code>mv</code> the file is gone from here and is inside <code>kitchen</code>.' },
        `<details class="reveal"><summary>Guess first: after the last <code>mv</code>, what do <code>ls</code> and <code>ls kitchen</code> show?</summary><p><code>ls</code> shows <code>desk</code>, <code>kitchen</code> and <code>recipe.txt</code>. The copy <code>pancakes.txt</code> was renamed and then moved, so it is no longer here, and <code>ls kitchen</code> shows <code>breakfast.txt</code>. <code>recipe.txt</code> never changed: <code>cp</code> leaves the original alone.</p></details>`,
        `<div class="stmt"><p><span class="kind">A slash makes the meaning plain.</span> <code>mv breakfast.txt kitchen/</code> says "into the directory kitchen", and fails loudly if there is no such directory, instead of quietly renaming the file to <code>kitchen</code>. Many people always write the slash when they mean a directory.</p>
<p><span class="kind">Directories need <code>-r</code>.</span> <code>cp</code> refuses to copy a directory unless you say <code>cp -r</code> ("recursive": the directory and everything inside). <code>mv</code> moves a directory as it is.</p>
<p><span class="kind">Copying over.</span> <code>cp a.txt b.txt</code> when <code>b.txt</code> exists replaces it without asking. So does <code>mv</code>.</p></div>`,
        { play: `mkdir kitchen
cp desk kitchen
cp -r desk kitchen
tree kitchen
mv kitchen/desk kitchen/old-desk
ls kitchen`, setup: 'lesson2', expectError: true, caption: 'The first <code>cp</code> is refused: "omitting directory". With <code>-r</code> the whole desk is copied into the kitchen, and <code>mv</code> renames the copy.' },
        { check: '<code>notes</code> is a directory and <code>plan.txt</code> is a file next to it. What does <code>mv plan.txt notes</code> do?', skill: 'copy-move', options: ['Renames <code>plan.txt</code> to <code>notes</code>, replacing the directory', 'Moves <code>plan.txt</code> into the <code>notes</code> directory', 'Copies <code>plan.txt</code> into <code>notes</code>', 'Fails: a file cannot be moved onto a directory'], answer: 1, why: 'When the destination is a directory that exists, <code>mv</code> (and <code>cp</code>) put the file inside it, keeping its name. The file is now <code>notes/plan.txt</code> and is no longer where it was.', wrong: ['A directory is never silently replaced by a file. Because <code>notes</code> exists and is a directory, the file goes inside it.', null, '<code>mv</code> leaves no copy behind; <code>cp</code> is the one that copies.', 'It does not fail; it is the normal way to move a file into a directory.'] },
        `<h2>Removing things, with care</h2>
<p><code>rm</code> removes files. <code>rmdir</code> removes a directory, but only an empty one. <code>rm -r</code> removes a directory and everything in it. None of them ask. None of them can be undone.</p>`,
        { play: `rm desk/junk.tmp
ls desk
mkdir -p boxes/empty
touch boxes/thing.txt
rm boxes
rmdir boxes/empty
rmdir boxes
rm -r boxes
ls`, setup: 'lesson2', expectError: true, caption: 'One file gone. Then: <code>rm</code> will not remove a directory ("Is a directory"); <code>rmdir</code> removes the empty one but not <code>boxes</code>, which still has a file in it ("Directory not empty"); <code>rm -r</code> removes it all, and does not look back.' },
        `<details class="reveal"><summary>Guess first: of <code>rm boxes</code>, <code>rmdir boxes/empty</code>, <code>rmdir boxes</code> and <code>rm -r boxes</code>, which two fail?</summary><p><code>rm boxes</code> fails because <code>boxes</code> is a directory, and <code>rmdir boxes</code> fails because it still holds <code>thing.txt</code>. The empty directory goes with <code>rmdir</code>, and <code>rm -r</code> removes the rest. Nothing was asked and nothing can be brought back.</p></details>`,
        `<div class="stmt"><p><span class="kind">Before you remove, look.</span> Run <code>ls</code> with the same name you are about to give <code>rm</code>. If <code>ls</code> shows what you expect, <code>rm</code> will remove exactly that. This habit costs two seconds and has saved more work than any backup.</p>
<p><span class="kind"><code>-f</code> means force.</span> <code>rm -f</code> stays quiet about files that are not there. <code>rm -rf</code> removes a whole tree without a word. You will see it in tutorials; type it only when you have looked first.</p></div>
<h2>Many files at once: wildcards</h2>
<p>A <code>*</code> in a name stands for "anything". Before a command runs, the shell replaces <code>*.txt</code> with every name in the directory that ends in <code>.txt</code>, so the command sees a list of real names. <code>?</code> stands for any single character. The curly braces <code>{a,b,c}</code> make several names from one pattern, and <code>{1..5}</code> counts.</p>`,
        { play: `cd desk
ls *.jpg
ls *.t*
echo *.tmp
mkdir photos notes code
mv *.jpg photos/
ls photos
touch day{1..3}.txt
ls`, setup: 'lesson2', caption: '<code>echo *.tmp</code> is the way to see what a wildcard will turn into before you give it to <code>rm</code>. <code>mv *.jpg photos/</code> moves every picture in one command. <code>day{1..3}.txt</code> becomes three names.' },
        `<details class="reveal"><summary>Guess first: what will <code>echo *.tmp</code> print?</summary><p><code>junk.tmp old.tmp</code>: the two names the shell found, in alphabetical order. <code>echo</code> never saw the star. That is why it is a safe way to preview a pattern before <code>rm</code> uses it.</p></details>`,
        { check: 'A directory holds <code>a.txt</code>, <code>b.txt</code> and <code>c.py</code>. What does <code>rm *.txt</code> remove?', skill: 'wildcards', options: ['Only <code>a.txt</code>', '<code>a.txt</code> and <code>b.txt</code>', 'All three files', 'Nothing: <code>rm</code> does not understand <code>*</code>'], answer: 1, why: 'The shell expands <code>*.txt</code> to <code>a.txt b.txt</code> before <code>rm</code> runs, so <code>rm</code> sees those two names. <code>c.py</code> does not end in <code>.txt</code>. To see what a pattern will match, <code>echo *.txt</code> first.', wrong: ['<code>*</code> matches every name that fits, not just the first.', null, '<code>c.py</code> does not end in <code>.txt</code>, so the pattern leaves it alone.', '<code>rm</code> never sees the <code>*</code>: the shell has already turned it into the list of names.'] },
        { ex: { id: 'sh-2-1', kind: 'shell', skill: 'make', title: 'Build a project', setup: 'lesson2',
          prompt: '<p>Make a directory called <code>project</code> in your home directory. Inside it make two directories, <code>src</code> and <code>docs</code>, and a file <code>README.md</code> containing exactly the line <code>My first project</code>. Inside <code>src</code>, make an empty file called <code>main.py</code>. <code>tree project</code> should then show two directories and two files.</p>',
          tests: [{ dir: 'project' }, { dir: 'project/src' }, { dir: 'project/docs' }, { content: 'project/README.md', expect: 'My first project' }, { file: 'project/src/main.py' }],
          hints: ['<code>mkdir project</code> first; then the two inside it can be made in one go: <code>mkdir project/src project/docs</code>.', '<code>echo "My first project" &gt; project/README.md</code> writes the line into the file. <code>touch project/src/main.py</code> makes the empty one.'],
          failTip: 'Check the shape with <code>tree project</code>: <code>src</code> and <code>docs</code> must be inside <code>project</code>, not beside it, and <code>README.md</code> must hold exactly <code>My first project</code> with nothing else in it. <code>echo ... &gt; file</code> replaces a file, so retyping it is safe.',
          solution: 'mkdir project\nmkdir project/src project/docs\necho "My first project" > project/README.md\ntouch project/src/main.py\ntree project',
          followup: 'Copy the whole project to <code>project-backup</code> with one command, and check with <code>tree</code> that everything came along.' } },
        { ex: { id: 'sh-2-2', kind: 'shell', skill: ['wildcards', 'remove'], title: 'Tidy the desk', setup: 'lesson2',
          prompt: '<p>The <code>desk</code> directory is a mess: pictures, text files, a program and some <code>.tmp</code> junk, all in a heap. Inside <code>desk</code>, make three directories, <code>photos</code>, <code>notes</code> and <code>code</code>. Move every <code>.jpg</code> into <code>photos</code>, every <code>.txt</code> into <code>notes</code> and <code>game.py</code> into <code>code</code>. Remove the <code>.tmp</code> files. When you are done, <code>ls desk</code> should show only the three directories.</p>',
          tests: [{ exists: 'desk/photos/cat.jpg' }, { exists: 'desk/photos/dog.jpg' }, { exists: 'desk/notes/essay.txt' }, { exists: 'desk/notes/notes.txt' }, { exists: 'desk/code/game.py' }, { missing: 'desk/old.tmp' }, { missing: 'desk/junk.tmp' }, { cmd: 'ls desk', expect: 'code\nnotes\nphotos' }],
          hints: ['<code>cd desk</code> first, so the names are short. <code>mkdir photos notes code</code> makes all three.', 'Wildcards do the moving: <code>mv *.jpg photos/</code>, <code>mv *.txt notes/</code>, <code>mv game.py code/</code>. Then <code>rm *.tmp</code>: check with <code>echo *.tmp</code> first.'],
          failTip: 'Run <code>ls desk</code>: it must show only <code>code</code>, <code>notes</code> and <code>photos</code>. Anything else is a file that no pattern caught (<code>essay.txt</code> and <code>notes.txt</code> are both <code>.txt</code> files, and <code>game.py</code> needs its own <code>mv</code>) or a <code>.tmp</code> file you have not removed. If you did not <code>cd desk</code>, every name needs <code>desk/</code> in front.',
          solution: 'cd desk\nmkdir photos notes code\nmv *.jpg photos/\nmv *.txt notes/\nmv game.py code/\necho *.tmp\nrm *.tmp\nls',
          followup: 'Rename <code>photos</code> to <code>pictures</code> with one <code>mv</code>, then draw the whole desk with <code>tree</code>.' } },
        `<div class="recap"><h3>In this lesson</h3>
<p><b>What should you do before a command that cannot be undone?</b> Look. <code>ls</code> the name you are about to give <code>rm</code>, or <code>echo</code> the pattern, so you see exactly what it will touch. Only then press Enter.</p><ul>
<li><b>Make:</b> <code>mkdir</code> (with <code>-p</code> for a chain of parents), <code>touch</code> for an empty file, <code>echo text &gt; file</code> for a file with a line in it. <code>tree</code> draws the result.</li>
<li><b>Copy and move:</b> <code>cp from to</code> and <code>mv from to</code>. A destination that is a directory means "into it"; any other name means "with this name", so <code>mv</code> also renames. Write the trailing slash when you mean a directory. Directories copy with <code>cp -r</code>.</li>
<li><b>Remove:</b> <code>rm file</code>, <code>rmdir emptydir</code>, <code>rm -r dir</code>. Nothing asks, nothing comes back. <code>ls</code> the name first.</li>
<li><b>Wildcards:</b> <code>*</code> is anything, <code>?</code> is one character, <code>{a,b}</code> and <code>{1..5}</code> make several names. The shell expands them before the command runs; <code>echo</code> the pattern to see what it will become.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['2-DA-08', '3B-DA-05'],
      title: 'Looking inside files', summary: 'cat, head and tail to read; wc to count; grep to search inside files; find to search for files; diff to compare two.',
      blocks: [
        `<p>In the early 1970s Lee McMahon, a researcher at Bell Labs, was trying to work out who had written each of the <em>Federalist Papers</em>, the essays published under a pen name in 1787 and 1788 that argued for the American constitution. He wanted to search the text of the essays for certain words, and the editor he was using could not cope with so much text. He mentioned it to Ken Thompson, who took the pattern-searching part of that editor and turned it into a small program of its own: one that read a file and printed every line matching a pattern. In the editor <code>ed</code>, the command for that was <code>g/re/p</code>: <em>globally</em> find the <em>regular expression</em> and <em>print</em>. So the program was called <code>grep</code>, and half a century later it is still one of the commands programmers type most.</p>`,
        { photo: 'federalist-1788', caption: 'The first volume of <em>The Federalist</em>, printed in New York in 1788: the essays McMahon was counting words in. This copy is in the Library of Congress.' },
        `<p>This lesson is about reading files without opening an editor: showing them, counting them, searching inside them, and searching for them. So how would you find one word in a log of a thousand lines, or one file in a tree of a thousand?</p>
<h2>Reading a file</h2>
<p><code>cat</code> prints a whole file. For a long one you want a piece: <code>head</code> prints the first ten lines, <code>tail</code> the last ten, and <code>-n</code> changes how many. The lesson's home has a short poem and a server's log in it.</p>`,
        { play: `cat poem.txt
head -n 3 server.log
tail -n 2 server.log
cat -n poem.txt`, setup: 'lesson3', caption: 'The whole poem; the first three and the last two lines of the log; the poem with line numbers (<code>-n</code>). <code>head -3</code> works too.' },
        `<details class="reveal"><summary>Guess first: which lines will <code>head -n 3</code> and <code>tail -n 2</code> print from the log, and will <code>cat -n</code> number the poem's blank line?</summary><p><code>head -n 3</code> prints the first three lines (the server starting, ada logging in, the first WARN) and <code>tail -n 2</code> the last two (the reconnect and ada logging out). <code>cat -n</code> numbers every line, the blank one too: the poem has 7 lines, and line 3 is empty.</p></details>`,
        `<div class="stmt"><p><span class="kind">Logs grow at the end.</span> A program that runs all day writes a line to its log for everything that happens, so the newest news is at the bottom: <code>tail server.log</code> is how you look at what just happened.</p>
<p><span class="kind">Several files.</span> <code>cat a.txt b.txt</code> prints both, one after the other (that is what the name means: con-cat-enate). <code>head</code> and <code>tail</code> put a header before each file when given several.</p></div>
<p><code>wc</code>, "word count", counts lines, words and characters. Three numbers, in that order, and then the name. <code>-l</code> asks for lines only, which is the one you want most of the time: how many entries are in this log, how many names in this list.</p>`,
        { play: `wc poem.txt
wc -l server.log
wc -w library/*.txt`, setup: 'lesson3', caption: 'Lines, words and characters of the poem (the blank line counts as a line); just the line count of the log; the word counts of every text in the library, with a total.' },
        { check: 'A log file has 500 lines. Which command shows the newest 20 entries?', skill: 'read-files', options: ['<code>head -n 20 app.log</code>', '<code>tail -n 20 app.log</code>', '<code>cat -n 20 app.log</code>', '<code>wc -l app.log</code>'], answer: 1, why: 'New lines are added at the end of a log, so the newest entries are the last ones, and <code>tail</code> prints the end. <code>head</code> would show how the day started.', wrong: ['<code>head</code> shows the first lines: the oldest entries.', null, '<code>cat -n</code> numbers the lines; the 20 would be taken as a file name.', '<code>wc -l</code> only counts the lines.'] },
        `<h2>Searching inside files</h2>
<p><code>grep</code> prints every line of a file that contains a pattern. Put the pattern in quotes, especially when it has a space in it. Three options do most of the work: <code>-i</code> ignores capitals, <code>-n</code> shows the line numbers, <code>-c</code> only counts the matching lines. <code>-v</code> turns it around: the lines that do <em>not</em> match.</p>`,
        { play: `grep ERROR server.log
grep -c ERROR server.log
grep -n "disk full" server.log
grep -i ada server.log
grep -v INFO server.log`, setup: 'lesson3', caption: 'Every error; how many errors; where "disk full" happened, with line numbers; everything about ada, capitals or not; everything that is not routine. The pattern is a plain word here. It can also be a <em>regular expression</em>, a small language for patterns; <code>^</code> means "at the start of the line" and <code>$</code> "at the end", and lesson 8 says more.' },
        `<details class="reveal"><summary>Guess first: how many lines will <code>grep -c ERROR server.log</code> print, and how many will <code>grep -v INFO server.log</code> print?</summary><p><code>-c</code> prints one number, 3. <code>-v INFO</code> prints every line without INFO in it: the 3 ERROR lines and the 2 WARN lines, so 5 lines.</p></details>`,
        `<div class="stmt"><p><span class="kind">grep and several files.</span> <code>grep dragon library/*.txt</code> searches every text in the library and puts the file name in front of each match. <code>grep -r dragon library</code> ("recursive") searches the whole directory, including directories inside it. <code>-l</code> lists only the names of the files that match.</p></div>`,
        { play: `grep -n hole library/*.txt
grep -r dragon library
grep -rl Alice library
grep -ri "ALICE" library`, setup: 'lesson3', caption: 'A word in several files, with names and line numbers; a search through the whole library, which finds a file in a directory inside it; only the names; and a search that ignores capitals. The last line finds the same file as the one before it: without <code>-i</code>, <code>ALICE</code> would match nothing.' },
        { check: 'What does <code>grep -c error app.log</code> print?', skill: 'grep', options: ['Every line containing <code>error</code>', 'The number of lines containing <code>error</code>', 'Every line that does not contain <code>error</code>', 'The number of times the word appears, even twice on one line'], answer: 1, why: '<code>-c</code> counts matching <em>lines</em>. A line with the word twice counts once. For the lines themselves, leave <code>-c</code> off; for the lines without it, <code>-v</code>.', wrong: ['That is <code>grep</code> without <code>-c</code>.', null, 'That is <code>-v</code>.', 'A line counts once however many times the word is on it.'] },
        `<h2>Searching for files</h2>
<p><code>grep</code> looks inside files. <code>find</code> looks for files, by name or by kind, in a directory and everything under it. Give it where to start, then what to look for: <code>-name</code> with a pattern in quotes (so the shell does not expand the <code>*</code> itself), <code>-type f</code> for files only or <code>-type d</code> for directories only. With no tests it simply lists everything under the start.</p>`,
        { play: `find projects
find projects -name "*.py"
find . -type d
find . -name "*.txt" -type f | wc -l`, setup: 'lesson3', caption: 'Everything under <code>projects</code>; only the Python files; only the directories, starting from here (<code>.</code>); and a count of every text file, which hands <code>find</code>\'s list to <code>wc</code> through a pipe. The next lesson is about that vertical bar.' },
        `<details class="reveal"><summary>Guess first: which files will <code>find projects -name "*.py"</code> list?</summary><p>Three: <code>projects/calc/calc.py</code>, <code>projects/game/levels.py</code> and <code>projects/game/main.py</code>. <code>README.md</code> and <code>notes.txt</code> do not end in <code>.py</code>. The last command counts 5 text files in the whole tree.</p></details>`,
        `<div class="stmt"><p><span class="kind">Two more that are worth knowing.</span> <code>diff a.txt b.txt</code> prints the lines where two files differ, and nothing when they are the same: the way to check that a copy is really a copy. <code>file name</code> says what kind of thing a file is, for a file whose name does not tell you.</p></div>`,
        { play: `cp poem.txt poem2.txt
diff poem.txt poem2.txt
echo "and then moves on." >> poem2.txt
diff poem.txt poem2.txt
file poem.txt projects scores.csv`, setup: 'lesson3', expectError: true, caption: 'No difference after the copy; one added line after the <code>&gt;&gt;</code> (<code>7a8</code> means "after line 7 of the first file, line 8 of the second was added"). <code>diff</code> answers with status 1 when the files differ, which is why the terminal says <em>exit 1</em>; that is not an error.' },
        { check: 'You want every Python file anywhere under <code>projects</code>. Which command?', skill: 'find', options: ['<code>grep .py projects</code>', '<code>ls projects/*.py</code>', '<code>find projects -name "*.py"</code>', '<code>cat projects/*/*.py</code>'], answer: 2, why: '<code>find</code> walks the whole tree under its start, however deep. <code>ls projects/*.py</code> looks only directly inside <code>projects</code>, and <code>grep</code> searches the text inside files, not their names.', wrong: ['<code>grep</code> searches inside files for text. It would complain that <code>projects</code> is a directory.', 'That lists only Python files directly inside <code>projects</code>, not in <code>projects/game</code>.', null, 'That prints what is inside the files one level down, not their names, and it would miss any deeper.'] },
        { ex: { id: 'sh-3-1', kind: 'shell', skill: 'grep', title: 'Find the dragon', setup: 'lesson3',
          prompt: '<p>One of the books in <code>library</code> (look in its directories too) mentions a dragon. Find out which file it is with <code>grep</code>, then copy that file to your home directory under the name <code>found.txt</code>. The check looks at <code>found.txt</code> and at whether <code>grep</code> was used.</p>',
          tests: [{ ran: /\bgrep\b/, name: 'grep was used to search' }, { content: 'found.txt', expect: 'In a hole in the ground there lived a hobbit. Not a nasty, dirty,\nwet hole, nor yet a dry, bare, sandy hole: it was a hobbit-hole,\nand that means comfort. The dragon came much later.' }],
          hints: ['<code>grep -r dragon library</code> searches the whole library, and prints the file name in front of the match.', 'Then <code>cp library/hobbit.txt found.txt</code>.'],
          failTip: 'Two things are checked: <code>grep</code> must be in what you typed, and <code>found.txt</code> in your home directory must be an exact copy of the book. Use <code>cp</code>, not <code>mv</code>, and copy from the path <code>grep</code> printed (it starts with <code>library/</code>).',
          solution: 'grep -rl dragon library\ncp library/hobbit.txt found.txt',
          followup: 'Count the lines of every book in the library with one command, including the one in <code>old</code>.' } },
        { ex: { id: 'sh-3-2', kind: 'answer', skill: ['grep', 'find'], title: 'Reading the log', setup: 'lesson3',
          prompt: '<p>Use the terminal from any example above (Reset it first if you changed things). Answer these about <code>server.log</code> and <code>projects</code> with <code>grep</code>, <code>wc</code> and <code>find</code>.</p>',
          parts: [
            { label: 'How many lines of <code>server.log</code> contain <code>ERROR</code>?', answer: '3' },
            { label: 'On which line number does the connection to <code>db1</code> get lost?', answer: '10' },
            { label: 'How many Python files are there under <code>projects</code>?', answer: ['3', 'three'] },
            { label: 'How many words are in <code>poem.txt</code>?', answer: '21' }
          ],
          hints: ['<code>grep -c ERROR server.log</code> counts; <code>grep -n "connection lost" server.log</code> shows the line number.', '<code>find projects -name "*.py"</code> lists the Python files; <code>wc -w poem.txt</code> counts words.'],
          failTip: 'Each answer is a plain number. Do not count by eye: <code>grep -n</code> prints the line number for you, <code>find ... | wc -l</code> counts files, and <code>wc -w</code> counts words (not lines, which is the first number <code>wc</code> prints).',
          solution: '<p><code>grep -c ERROR server.log</code> prints 3. <code>grep -n lost server.log</code> shows line 10. <code>find projects -name "*.py"</code> lists three files. <code>wc -w poem.txt</code> prints 21.</p>',
          followup: 'Print only the WARN lines of the log. Then print only the lines that are neither INFO nor WARN, using <code>grep -v</code> twice joined by a pipe (lesson 4 explains the pipe).' } },
        `<div class="recap"><h3>In this lesson</h3>
<p><b>How do you find one word in a big file, or one file in a big tree?</b> Search inside with <code>grep</code>; search for names with <code>find</code>. Neither needs you to open anything.</p><ul>
<li><b>Reading:</b> <code>cat</code> prints a file (<code>-n</code> numbers the lines); <code>head -n 5</code> and <code>tail -n 5</code> print the first or last lines. Logs grow at the end, so <code>tail</code> shows what just happened.</li>
<li><b>Counting:</b> <code>wc</code> gives lines, words and characters; <code>wc -l</code> just the lines; several files get a total.</li>
<li><b>Searching inside:</b> <code>grep pattern file</code>, with <code>-i</code> (ignore capitals), <code>-n</code> (line numbers), <code>-c</code> (count), <code>-v</code> (the other lines), <code>-r</code> (a whole directory), <code>-l</code> (names only). Quote the pattern.</li>
<li><b>Searching for files:</b> <code>find start -name "*.py"</code>, <code>-type f</code> or <code>-type d</code>; it walks the whole tree.</li>
<li><code>diff a b</code> shows where two files differ, and <code>file x</code> says what a file is.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['3A-AP-18', '3A-CS-02', '3B-DA-05'],
      title: 'Pipes and redirection', summary: 'Sending output to a file with > and >>, reading input from a file with <, and joining commands with | so that small tools do big jobs.',
      blocks: [
        `<p>In 1986 the programmer Jon Bentley asked Donald Knuth, the author of <em>The Art of Computer Programming</em>, to write a program for his column in a computing magazine: read a text and print the most common words with their counts. Knuth, who had a few years earlier invented a way of writing programs as readable essays, produced a long, beautifully explained program. Bentley then asked Doug McIlroy, the Bell Labs researcher who had first proposed the idea of pipes in 1964, to review it. McIlroy admired the program, and then did the same job in six commands joined by five vertical bars: split the text into words, make them lowercase, sort them, count the repeats, sort by count, show the top. Typed out, it fits on one line.</p>`,
        { photo: 'hose-connectors', caption: 'Garden hose parts that click together: a spray gun on the end of a hose, a Y-piece that splits one stream in two, and two connectors. In 1964 McIlroy wrote that programs should be coupled "like garden hose", screwing in another segment whenever the data needs to be handled another way. The <code>|</code> of this lesson is that coupling.' },
        `<p>That line is the idea of this lesson. Unix commands are small tools that each do one job; the shell lets you plug the output of one into the input of the next. By the end you will have typed a version of McIlroy's program yourself. How can a handful of tiny commands do what took pages of code?</p>
<h2>Output into a file</h2>
<p>Every command writes its output to the screen. <code>&gt;</code> sends it into a file instead, replacing whatever the file held. <code>&gt;&gt;</code> adds to the end of the file instead of replacing it. Lesson 2 used this with <code>echo</code>; it works with any command.</p>`,
        { play: `grep ERROR server.log > errors.txt
cat errors.txt
wc -l server.log >> errors.txt
cat errors.txt
echo "nothing happened" > errors.txt
cat errors.txt`, setup: 'lesson4', caption: 'The errors go into a file; a count is added to its end; then one <code>&gt;</code> replaces the whole file with one line. Nothing appears on the screen while the output is going into a file.' },
        `<details class="reveal"><summary>Guess first: after the last <code>echo</code>, what does <code>errors.txt</code> hold?</summary><p>Only <code>nothing happened</code>. The single <code>&gt;</code> emptied the file, with its three error lines and the count, before writing the new line. Had it been <code>&gt;&gt;</code>, the new line would sit after the old ones.</p></details>`,
        `<div class="stmt"><p><span class="kind">The file is emptied first.</span> <code>&gt;</code> empties the file before the command runs, so <code>sort names.txt &gt; names.txt</code> leaves you with an empty file: the input was wiped before <code>sort</code> read it. Write to a new name, then <code>mv</code> it over the old one.</p>
<p><span class="kind">Input from a file.</span> <code>&lt;</code> is the other direction: the command reads the file as if you were typing it. <code>wc -l &lt; server.log</code> prints just the number, with no file name after it, because <code>wc</code> was never told a name.</p></div>`,
        { check: 'What is in <code>list.txt</code> after <code>echo one &gt; list.txt</code>, <code>echo two &gt;&gt; list.txt</code>, <code>echo three &gt; list.txt</code>?', skill: 'redirect', options: ['<code>one two three</code>, one per line', '<code>three</code> only', '<code>two</code> and <code>three</code>', 'Nothing: the file was emptied'], answer: 1, why: 'The second command appended, so the file held <code>one</code> and <code>two</code>. The third used a single <code>&gt;</code>, which empties the file first, so only <code>three</code> remains.', wrong: ['That would be the result if every line used <code>&gt;&gt;</code>.', null, 'The last <code>&gt;</code> wiped <code>two</code> along with <code>one</code>.', 'It was emptied and then <code>three</code> was written into it.'] },
        `<h2>The pipe</h2>
<p>The vertical bar <code>|</code>, the <em>pipe</em>, sends the output of the command on its left into the input of the command on its right. No file in between: the text flows straight through. Any command that can read a file can read a pipe instead.</p>`,
        { play: `cat server.log | grep ERROR
grep ERROR server.log | wc -l
ls | wc -l
history | tail -n 3`, setup: 'lesson4', caption: 'The errors, through a pipe; the number of them; how many things are in this directory; the last three commands typed. Each command on the right never knows it was reading from another program rather than a file.' },
        `<p>Four small tools turn pipes into a toolkit. <code>sort</code> puts lines in order (<code>-n</code> for numbers, <code>-r</code> for reverse). <code>uniq</code> removes repeated lines when they are next to each other, so it comes after <code>sort</code>; <code>uniq -c</code> counts how many times each line appeared. <code>cut</code> keeps one column of each line: <code>-d ,</code> says the columns are separated by commas, <code>-f 2</code> keeps the second. <code>tr</code> translates characters: <code>tr a-z A-Z</code> makes capitals.</p>`,
        { play: `sort names.txt
sort names.txt | uniq
sort names.txt | uniq -c
sort names.txt | uniq -c | sort -rn
cut -d , -f 1 scores.csv
cut -d , -f 3 scores.csv | sort -n | tail -n 1`, setup: 'lesson4', caption: 'The names in order; each name once; each name with its count; the counts from most to fewest; the first column of the spreadsheet; and the highest test score, found by keeping the third column, sorting as numbers and taking the last line.' },
        `<details class="reveal"><summary>Guess first: what will <code>sort names.txt | uniq -c | sort -rn</code> print on its first two lines?</summary><p><code>3 ada</code> and then <code>2 bob</code>. <code>sort</code> puts the names in order, <code>uniq -c</code> counts each run of equal names, and <code>sort -rn</code> sorts those counts as numbers, biggest first. The last two lines are the names that appear once.</p></details>`,
        { check: 'Why does <code>uniq</code> usually come after <code>sort</code> in a pipeline?', skill: 'pipes', options: ['<code>uniq</code> only works on sorted input; it refuses anything else', '<code>uniq</code> removes repeats only when they are next to each other, and sorting puts equal lines together', '<code>sort</code> is faster when <code>uniq</code> is after it', 'It does not matter; <code>uniq | sort</code> gives the same result'], answer: 1, why: '<code>uniq</code> compares each line with the one just before it. In <code>bob, ada, bob</code> nothing is removed; sorted to <code>ada, bob, bob</code>, the second <code>bob</code> goes.', wrong: ['It accepts any input; it just misses repeats that are not adjacent.', null, 'Speed has nothing to do with it.', 'Try it on <code>names.txt</code>: the counts come out wrong without sorting first.'] },
        `<h2>McIlroy's program</h2>
<p>Here is the one-liner, one stage at a time. Each line adds a stage to the pipeline; run them in order and watch the text change shape.</p>`,
        { play: `cat speech.txt
tr -s " " "\\n" < speech.txt
tr -s " " "\\n" < speech.txt | sort
tr -s " " "\\n" < speech.txt | sort | uniq -c
tr -s " " "\\n" < speech.txt | sort | uniq -c | sort -rn
tr -s " " "\\n" < speech.txt | sort | uniq -c | sort -rn | head -n 3`, setup: 'lesson4', caption: 'The text; every word on its own line (each run of spaces becomes a newline); sorted; counted; counted and sorted by count; the top three. McIlroy\'s own version also turned capitals into small letters (<code>tr A-Z a-z</code>) and split the text at anything that is not a letter, so that "The" and "the." counted as the same word.' },
        `<details class="reveal"><summary>Guess first: which three words will the last command show, and how often does each appear?</summary><p><code>6 the</code>, <code>3 fox</code> and <code>2 jumps</code>. The words <code>dog</code> and <code>jumps</code> both appear twice; <code>sort -rn</code> breaks the tie by putting <code>jumps</code> first, and <code>head</code> then cuts the list off at three lines.</p></details>`,
        `<div class="stmt"><p><span class="kind">Build a pipeline one stage at a time.</span> Run the first command alone and look. Add <code>| next</code> and look again. When the output is right, add the next stage. Nobody types a six-stage pipeline in one go and gets it right.</p>
<p><span class="kind">Errors do not go down the pipe.</span> A command's error messages are a separate stream, called <em>standard error</em>, and <code>|</code> and <code>&gt;</code> only take the normal output. That is why <code>ls nothere | wc -l</code> still shows the error on the screen and prints 0. To put errors in a file too: <code>2&gt; errors.txt</code>, and <code>2&gt;/dev/null</code> throws them away.</p></div>`,
        { play: `ls nothere | wc -l
ls nothere 2> oops.txt
cat oops.txt
ls nothere 2>/dev/null
echo "status: $?"`, setup: 'lesson4', expectError: true, caption: 'The error message skips the pipe and goes to the screen; <code>2&gt;</code> catches it in a file; <code>/dev/null</code> is a place where output disappears. <code>$?</code> is the status of the last command: 0 means it worked, anything else means it did not, and here it is 2 because <code>ls</code> failed.' },
        `<details class="reveal"><summary>Guess first: what number will <code>ls nothere | wc -l</code> print, and will the error message still show on the screen?</summary><p>It prints <code>0</code>, because nothing went down the pipe, and the error message does still appear on the screen: it travels on a different stream that the pipe does not carry.</p></details>`,
        { check: 'What does <code>sort scores.csv &gt; scores.csv</code> leave in <code>scores.csv</code>?', skill: 'redirect', options: ['The file, sorted', 'The file, unchanged', 'An empty file', 'An error: a file cannot be its own output'], answer: 2, why: 'The shell empties the output file before it starts <code>sort</code>, so <code>sort</code> finds nothing to read and writes nothing. Sort into a new file, then <code>mv</code> it.', wrong: ['It would be, if the file still had anything in it when <code>sort</code> ran. But the shell opens the output file first, and that empties it.', 'That would need the shell to read the file before touching it. It does the opposite: the file is emptied the moment the line starts.', null, 'The shell allows it; it just does the steps in an order that loses the data.'] },
        { ex: { id: 'sh-4-1', kind: 'shell', skill: 'pipes', title: 'The word counts', setup: 'lesson4',
          prompt: '<p>Make a file called <code>top.txt</code> in your home directory holding the three most common words of <code>speech.txt</code>, with their counts, most common first: the output of McIlroy\'s pipeline from the example above, sent into a file. The check reads the file.</p>',
          tests: [{ content: 'top.txt', expect: '      6 the\n      3 fox\n      2 jumps' }, { ran: /\|/, name: 'a pipe was used' }],
          hints: ['Take the last line of the McIlroy example and add <code>&gt; top.txt</code> at the end.', 'Check it with <code>cat top.txt</code>. The numbers are right-aligned: that is how <code>uniq -c</code> prints them.'],
          failTip: 'The file must hold exactly three lines, <code>6 the</code>, <code>3 fox</code> and <code>2 jumps</code>, each with its count in front. If the order is wrong, the second <code>sort</code> needs <code>-rn</code> (numbers, biggest first). Put <code>&gt; top.txt</code> after the last stage, or the file stays empty and the words print on the screen.',
          solution: 'tr -s " " "\\n" < speech.txt | sort | uniq -c | sort -rn | head -n 3 > top.txt\ncat top.txt',
          followup: 'Add the stage McIlroy had and this lesson left out, so that capitals do not matter, and keep only the words that appear more than once.' } },
        { ex: { id: 'sh-4-2', kind: 'shell', skill: 'redirect', title: 'A report from the log', setup: 'lesson4',
          prompt: '<p>Inside the <code>notes</code> directory, make two files from <code>server.log</code>: <code>errors.txt</code> holding every ERROR line, and <code>count.txt</code> holding just the number of ERROR lines (a bare number, no file name). Then make <code>people.txt</code> holding the names of the users who logged in, one per line, each once, in alphabetical order.</p>',
          tests: [{ content: 'notes/errors.txt', expect: '09:02:30 ERROR disk full on /data\n09:02:33 ERROR disk full on /data\n09:12:02 ERROR connection lost to db1' }, { content: 'notes/count.txt', expect: '3' }, { content: 'notes/people.txt', expect: 'ada\ngrace' }],
          hints: ['<code>grep ERROR server.log &gt; notes/errors.txt</code>; for the bare number, <code>grep -c</code>, or <code>grep ERROR server.log | wc -l</code>.', 'The "logged in" lines have the name in the fifth field, not the fourth, because the double space after INFO makes an empty field between the two spaces: <code>grep "logged in" server.log | cut -d " " -f 5</code>. Then <code>sort | uniq</code>.'],
          failTip: 'Three files are checked, all inside <code>notes</code>. <code>count.txt</code> must be a bare <code>3</code>: <code>grep -c</code> gives that, but <code>wc -l server.log</code> adds a file name. <code>people.txt</code> must be exactly <code>ada</code> and <code>grace</code>; if you get other words, the <code>cut</code> field is wrong, so look at one "logged in" line and count the fields.',
          solution: 'grep ERROR server.log > notes/errors.txt\ngrep -c ERROR server.log > notes/count.txt\ngrep "logged in" server.log | cut -d " " -f 5 | sort | uniq > notes/people.txt\ncat notes/people.txt',
          followup: 'Make <code>notes/warnings.txt</code> with the WARN lines, but only the time and the message, without the word WARN.' } },
        `<div class="recap"><h3>In this lesson</h3>
<p><b>How can a handful of tiny commands do what took pages of code?</b> Each does one small job, and <code>|</code> hands the output of one to the next, so six stages can count the words of a speech. Build the line one stage at a time.</p><ul>
<li><code>cmd &gt; file</code> sends output into a file, replacing it (the file is emptied first, so never read and write the same file); <code>&gt;&gt;</code> appends; <code>cmd &lt; file</code> reads a file as input.</li>
<li><code>a | b</code> sends a\'s output into b. Build a pipeline one stage at a time and look after each.</li>
<li>The tools: <code>sort</code> (<code>-n</code>, <code>-r</code>), <code>uniq</code> and <code>uniq -c</code> after a sort, <code>cut -d , -f 2</code> for a column, <code>tr</code> to swap characters, <code>head</code> and <code>tail</code> to trim, <code>wc -l</code> to count.</li>
<li>Error messages are a separate stream: they skip <code>|</code> and <code>&gt;</code>; <code>2&gt; file</code> catches them; <code>2&gt;/dev/null</code> discards them. <code>$?</code> is the last command\'s status, 0 for success.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, checkpoint: true, standards: ['3A-CS-02', '3B-DA-05'],
      title: 'Checkpoint one', summary: 'No new commands: mixed questions on paths, moving, copying, removing, searching and pipes, then two jobs that use them together. Which command fits?',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions from the four lessons before it, because the commands of a shell are full of look-alikes, <code>cp</code> and <code>mv</code>, <code>&gt;</code> and <code>&gt;&gt;</code>, <code>grep</code> and <code>find</code>, and telling them apart is a skill of its own. It only grows when the questions are mixed. Answer each one before you look back, and if you are not sure, try it in a terminal from an earlier lesson: nothing there can break. If one surprises you, its lesson is linked on the Review page, and the question will come back there in a day.</p>
<p>Ready? Here is the first: from where does a relative path start?</p>
<h2>Mixed questions</h2>`,
        { check: 'You are in <code>~/garden</code>. Which command lists the files in <code>~/letters</code>?', skill: 'paths', options: ['<code>ls letters</code>', '<code>ls ../letters</code>', '<code>ls /letters</code>', '<code>ls garden/letters</code>'], answer: 1, wrong: ['A relative path starts where you are, so this looks for <code>letters</code> inside <code>garden</code>, and there is none.', null, 'A path that starts with <code>/</code> starts at the root of the whole tree, where there is no <code>letters</code>. The shell says: No such file or directory.', 'This looks for <code>garden</code> inside <code>garden</code>. That path would be right from your home directory, not from here.'], why: '<code>..</code> goes up one level, to home, and then <code>letters</code> goes down again. <code>ls ~/letters</code> and <code>ls /home/student/letters</code> would work from anywhere.' },
        { check: 'You are in <code>~/garden/shed</code>, and you type <code>cd ~/letters</code>. Which single command takes you straight back to <code>~/garden/shed</code>?', skill: 'cd', options: ['<code>cd ..</code>', '<code>cd -</code>', '<code>cd</code>', '<code>cd garden/shed</code>'], answer: 1, wrong: ['<code>cd ..</code> goes up one level from where you are now: to home, which is not where you came from.', null, '<code>cd</code> on its own goes home, from anywhere.', 'That path is relative, so it starts in <code>letters</code>, where there is no <code>garden</code>: No such file or directory.'], why: '<code>cd -</code> goes back to the directory you were in before, and prints its name. <code>cd ..</code> goes to the directory above, which is a different idea.' },
        { check: 'The prompt says <code>student@lab:~/garden$</code>, and a plain <code>ls</code> shows nothing of a file called <code>.wishes</code> that you know is there. What now?', skill: 'look-around', options: ['The file is gone', 'Type <code>ls -a</code>: names that start with a dot are hidden from a plain <code>ls</code>', 'Type <code>cat ls</code>', 'Type <code>cd ..</code> and look again'], answer: 1, wrong: ['Hidden is not gone. A plain <code>ls</code> skips every name that starts with a dot.', null, '<code>cat</code> prints a file; there is no file called <code>ls</code>.', 'Going up would show the directory above, and the file is in this one.'], why: '<code>ls -a</code> ("all") includes the hidden names. Real home directories are full of them: settings that programs keep out of the way.' },
        { check: '<code>b.txt</code> already holds your notes. You type <code>cp a.txt b.txt</code>. What happens?', skill: 'copy-move', options: ['The shell asks whether to replace it', 'The command fails: the name is taken', 'The text of <code>a.txt</code> is added to the end of <code>b.txt</code>', '<code>b.txt</code> is replaced by a copy of <code>a.txt</code>, without a word'], answer: 3, wrong: ['It does not ask. Nothing in these lessons asks before it overwrites.', 'It does not fail. A copy onto an existing name is allowed, which is the danger.', 'Adding to the end is what <code>&gt;&gt;</code> does. <code>cp</code> replaces.', null], why: '<code>cp</code> and <code>mv</code> both replace a file that is already there, with no question and no undo. The same goes for <code>&gt;</code>. Run <code>ls</code> first when the name might already exist.' },
        { check: 'You type <code>rm report.txt</code> and then realise it was the wrong file. What can you do?', skill: 'remove', options: ['Type <code>undo</code>', 'Open the recycle bin', 'Nothing in the shell: it is gone, so restore it from a copy if you made one', 'Type <code>rm -r report.txt</code>, which reverses it'], answer: 2, wrong: ['There is no <code>undo</code> command.', 'The shell has no recycle bin: <code>rm</code> removes the file for good.', null, '<code>-r</code> means "recursive" and removes directories. It reverses nothing.'], why: 'This is why lesson 2 says to look first: <code>ls report.txt</code> before <code>rm report.txt</code>, or <code>echo *.tmp</code> before <code>rm *.tmp</code>. Copies you keep elsewhere are the only way back.' },
        { check: 'A directory has <code>a.tmp</code>, <code>b.tmp</code> and <code>notes.txt</code>. You are about to type <code>rm *.tmp</code>. What is the safest thing to do first?', skill: 'wildcards', options: ['Type <code>echo *.tmp</code>, to see which names the star will turn into', 'Type <code>rm notes.txt</code>, to get it out of the way', 'Nothing: <code>rm</code> asks before it removes', 'Type <code>cd ..</code>, so that the files are out of reach'], answer: 0, wrong: [null, 'That removes the file you wanted to keep.', 'It never asks.', 'Then <code>rm *.tmp</code> would find no <code>.tmp</code> files here at all, and tell you so.'], why: 'The shell turns <code>*.tmp</code> into a list of names before <code>rm</code> runs, and <code>echo</code> prints that same list without removing anything. Here it would print <code>a.tmp b.tmp</code>.' },
        { check: 'Which command prints only the number <code>12</code> for a log of 12 lines, with no file name after it?', skill: 'read-files', options: ['<code>wc -l server.log</code>', '<code>wc -l &lt; server.log</code>', '<code>wc server.log</code>', '<code>ls server.log</code>'], answer: 1, wrong: ['That prints <code>12 server.log</code>, the number and the name.', null, 'That prints three numbers (lines, words and characters) and then the name.', 'That prints the name of the file, and not what is inside it: <code>ls</code> lists things, <code>cat</code> shows what is in them.'], why: 'With <code>&lt;</code> the shell feeds the file in as input, so <code>wc</code> never learns its name and cannot print it. <code>grep -c</code> also gives a bare count.' },
        { check: 'Which command prints the lines of <code>server.log</code> that do <em>not</em> contain INFO?', skill: 'grep', options: ['<code>grep INFO server.log</code>', '<code>grep -c INFO server.log</code>', '<code>grep -v INFO server.log</code>', '<code>find . -name INFO</code>'], answer: 2, wrong: ['That prints the lines that do contain it: the opposite.', 'That prints a number, 7: how many lines contain INFO.', null, '<code>find</code> looks for files whose <em>names</em> match, not for text inside a file.'], why: '<code>-v</code> turns <code>grep</code> around. In the practice log it prints the three ERROR lines and the two WARN lines: 5 lines.' },
        { check: 'You want to know where the file <code>server.log</code> is, somewhere under your home directory. Which command?', skill: 'find', options: ['<code>grep server.log ~</code>', '<code>find ~ -name server.log</code>', '<code>cat server.log</code>', '<code>head server.log</code>'], answer: 1, wrong: ['<code>grep</code> searches for text <em>inside</em> files, and it would say that <code>~</code> is a directory.', null, '<code>cat</code> prints a file in the working directory. It does not search, and fails if the file is somewhere else.', '<code>head</code> shows the first lines of a file you can already name; it does not look for it.'], why: '<code>find</code> walks a whole tree looking at names. When the pattern has a star in it, put it in quotes (<code>-name "*.py"</code>) so that the shell does not expand it before <code>find</code> sees it.' },
        { check: '<code>log.txt</code> has three lines in it. You type <code>echo done &gt; log.txt</code>. What is in the file now?', skill: 'redirect', options: ['Four lines: the old three and <code>done</code>', 'Only <code>done</code>', 'Nothing: <code>&gt;</code> only works on new files', 'The three old lines: <code>echo</code> printed <code>done</code> on the screen'], answer: 1, wrong: ['That would be <code>&gt;&gt;</code>, which adds to the end.', null, '<code>&gt;</code> works on any file, and it empties an old one before writing.', 'Nothing appears on the screen: the output went into the file, and the file was emptied first.'], why: 'One <code>&gt;</code> replaces, <code>&gt;&gt;</code> appends. Keep that in mind before you point <code>&gt;</code> at a file that matters.' },
        { check: 'What is the difference between <code>ls | wc -l</code> and <code>ls &gt; wc</code>?', skill: 'pipes', options: ['None: both count the files', 'The first hands the listing to the <code>wc</code> command, which counts its lines; the second puts the listing into a new file named <code>wc</code>', 'The first makes a file and the second prints a number', 'The second is an error: <code>wc</code> is a command, not a file'], answer: 1, wrong: ['Only the pipe counts anything. The second line does not run <code>wc</code> at all.', null, 'It is the other way round: the pipe prints a number, and <code>&gt;</code> makes a file.', 'It is allowed. <code>&gt;</code> takes a file name, and <code>wc</code> is a fine one.'], why: '<code>|</code> connects a command to another <em>command</em>; <code>&gt;</code> connects a command to a <em>file</em>. Mixing them up leaves you with a file you did not want, and nothing printed.' },
        { check: 'You copy a file successfully with <code>cp poem.txt poem2.txt</code>. Then you type <code>echo $?</code>. What does it print?', skill: 'redirect', options: ['<code>0</code>: success is zero', '<code>1</code>: one command worked', '<code>poem2.txt</code>', 'Nothing: <code>$?</code> only works after an error'], answer: 0, wrong: [null, 'One is a failure code. A failed <code>cp</code> leaves 1 there, and a failed <code>ls</code> leaves 2.', '<code>$?</code> is the status of the last command, a number, not a name.', 'It always holds a status. After a success that status is 0.'], why: 'Zero means success and any other number means something went wrong, which is how a script can tell whether a step worked.' },
        `<p>Two jobs to finish the unit. The first needs a choice of command; the second puts the four lessons together, on files of its own.</p>`,
        { ex: { id: 'sh-9-1', kind: 'choice', skill: 'copy-move', title: 'Which command fits?',
          prompt: '<p>A folder holds 50 pictures ending in <code>.jpg</code>, and an empty directory <code>photos</code> beside them. You want every picture <em>inside</em> <code>photos</code> and none left where it was. Which command does exactly that?</p>',
          options: [
            { text: '<code>cp *.jpg photos/</code>', why: '<code>cp</code> copies. The pictures would be in <code>photos</code> and still in the old place.' },
            { text: '<code>mv *.jpg photos/</code>', ok: true },
            { text: '<code>mv photos/ *.jpg</code>', why: 'The destination comes last. Here the shell would try to move <code>photos</code> onto the pictures, and the last name would be taken for a directory.' },
            { text: '<code>rm *.jpg &gt; photos/</code>', why: 'The shell cannot send output into a directory, so it stops with "photos/: Is a directory" before <code>rm</code> even starts. And <code>rm</code> could only have deleted the pictures, never moved them.' }
          ],
          hints: ['Two of the commands leave the pictures where they were, or remove them. Which verb moves a thing without keeping a copy behind?', 'In <code>cp from to</code> and <code>mv from to</code> the destination is the last word, and the shell expands <code>*.jpg</code> into the list of <code>from</code> names.'],
          solution: '<p><code>mv *.jpg photos/</code>. The shell expands <code>*.jpg</code> into the 50 names, and <code>mv</code> moves each one into the directory <code>photos</code>, leaving none behind. <code>cp</code> would leave the originals, <code>rm</code> would lose the pictures, and with the arguments the wrong way round the destination would be a picture.</p>',
          failTip: 'You want the pictures to <em>move</em>, not to be copied, so the verb is <code>mv</code>; and the directory they go into is written last.',
          followup: 'Write the command that would copy the pictures into <code>photos</code> and keep the originals, and the command that moves only <code>cat.jpg</code> and <code>dog.jpg</code> there, naming both.' } },
        { ex: { id: 'sh-9-2', kind: 'shell', skill: ['wildcards', 'grep', 'redirect'], title: 'Sort the inbox', setup: 'checkpoint1',
          prompt: '<p>The <code>inbox</code> directory has some text files, a log and a junk file; <code>archive</code> is empty. Do three jobs. Move every <code>.txt</code> file from <code>inbox</code> into <code>archive</code>. Remove the <code>.tmp</code> file. And make a file <code>report.txt</code> in your home directory holding just the number of lines of <code>inbox/c.log</code> that contain ERROR (a bare number). The log must stay where it is.</p>',
          tests: [{ exists: 'archive/a.txt' }, { exists: 'archive/b.txt' }, { missing: 'inbox/a.txt' }, { missing: 'inbox/b.txt' }, { missing: 'inbox/old.tmp' }, { exists: 'inbox/c.log' }, { content: 'report.txt', expect: '2' }, { ran: /\bgrep\b/, name: 'grep was used to count' }],
          hints: ['<code>ls inbox</code> first, and use <code>echo inbox/*.txt</code> to see what the star will match. Then <code>mv inbox/*.txt archive/</code> moves all the text files in one command.', 'For the count, <code>grep -c ERROR inbox/c.log</code> prints a bare number, and <code>&gt; report.txt</code> at the end of the line puts it in the file. <code>rm inbox/old.tmp</code> does the last job: look first, because there is no undo.'],
          failTip: 'Three things are checked. Both text files must be inside <code>archive</code> and gone from <code>inbox</code>; <code>old.tmp</code> must be gone, but <code>c.log</code> must still be in <code>inbox</code> (<code>mv *</code> or <code>rm *</code> would take it too); and <code>report.txt</code> must hold exactly <code>2</code>. <code>wc -l</code> counts every line, 4, not only the ERROR ones, and it prints a file name as well.',
          solution: 'mv inbox/*.txt archive/\nrm inbox/old.tmp\ngrep -c ERROR inbox/c.log > report.txt\ncat report.txt\ntree',
          followup: 'Join the two archived files into one, <code>all.txt</code> in your home directory, with a single <code>cat</code> and a <code>&gt;</code>. Then use <code>find</code> to list every file under your home directory that ends in <code>.txt</code>.' } },
        `<div class="recap"><h3>Unit one in a few lines</h3>
<p><b>How do you know where a <code>cd</code> will take you?</b> By how the path starts: with <code>/</code> or <code>~</code> it is fixed; otherwise it begins where you are.</p><ul>
<li>A path is <b>absolute</b> (from <code>/</code> or <code>~</code>) or <b>relative</b> (from where you are); <code>cd ..</code> goes up and <code>cd -</code> goes back to where you were; <code>ls -a</code> shows hidden names.</li>
<li><code>cp</code> copies, <code>mv</code> moves or renames; both replace an existing file without asking. <code>rm</code> has no undo: <code>ls</code> the name, or <code>echo</code> the pattern, first.</li>
<li><code>cat</code>, <code>head</code> and <code>tail</code> read what is inside a file, <code>wc -l</code> counts lines, <code>grep</code> searches inside files and <code>find</code> searches for files by name.</li>
<li><code>&gt;</code> replaces a file and <code>&gt;&gt;</code> adds to it; <code>|</code> joins a command to a command. <code>$?</code> is 0 when the last command worked.</li>
<li>Next (planned): running your own programs from the shell, the Windows command prompt, and your first script.</li>
</ul></div>`
      ]
    }
  ]
});
