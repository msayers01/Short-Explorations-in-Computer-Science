// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// The Command Line: a course on the Unix shell, taught in the practice terminal (src/shell.js, src/terminal.js). Every example is a
// live terminal over the files named by its setup (course.setups below; src/shellgrade.js builds them), and exercises of kind 'shell'
// are graded on what the files look like afterwards and on what was typed, not on the exact commands.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'shell', code: 'SC 108', short: 'Command line', lang: 'shell', standard: 1,
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
  howItWorks: `<h3>How to use these pages</h3><p>Each lesson has terminals in it. Press <b>Run</b> on an example and watch the commands go in one at a time; then click in the terminal and type your own. The up arrow brings back a command you typed; <b>Tab</b> finishes a name for you; <b>Reset</b> puts the files back the way the example began. Nothing you type here can touch your real computer.</p><p>Exercises are checked by looking at the files afterwards: what exists, what is where, what is inside. How you got there is up to you. When one passes, a stretch challenge follows. Lessons 5 and 9 are <b>checkpoints</b>: no new commands, just mixed questions on the lessons before them. The questions come back on the Review page after a day, then after longer gaps. Lesson 10 is a project: a script that tidies a messy folder.</p>`,
  // The named skills of the course (LESSON_STANDARD.md §4). Each quick check and exercise names the skill it practises.
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
    { id: 'pipes', name: 'Join commands with pipes' },
    { id: 'run-programs', name: 'Run a program and give it arguments' },
    { id: 'compile', name: 'Compile with javac or g++, then run' },
    { id: 'program-io', name: 'Point a program\'s input and output at files and pipes' },
    { id: 'exit-status', name: 'Act on an exit status with &&, || and $?' },
    { id: 'windows-cmd', name: 'Do the same jobs in the Windows Command Prompt' },
    { id: 'powershell', name: 'Use PowerShell cmdlets and pipes of objects' },
    { id: 'scripts', name: 'Write a script and make it run with #! and chmod +x' },
    { id: 'variables', name: 'Use variables, $(…) and a script\'s arguments' },
    { id: 'loops', name: 'Repeat for each file with a for loop' },
    { id: 'decisions', name: 'Decide with if, [ ] and exit statuses' },
    { id: 'case', name: 'Choose by pattern with case' },
    { id: 'dry-run', name: 'Try a script safely: a dry run, then a copy' }
  ],
  setups: {
    checkpoint1: {
      'inbox/a.txt': 'apple\n',
      'inbox/b.txt': 'banana\n',
      'inbox/c.log': 'ERROR one\nINFO two\nERROR three\nINFO four\n',
      'inbox/old.tmp': 'junk\n',
      'archive/': null
    },
    checkpoint2: {
      'grades.py': 'count = int(input())\nmarks = []\nfor i in range(count):\n    marks.append(int(input()))\nprint("marks:", count)\nprint("highest:", max(marks))\nprint("lowest:", min(marks))\nprint("total:", sum(marks))\n',
      'classes/9a.txt': '3\n70\n85\n92\n',
      'classes/9b.txt': '4\n55\n61\n78\n80\n',
      'classes/9c.txt': '2\n99\n88\n'
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
    },
    lesson6: {
      'hello.py': 'print("hello, world")\n',
      'greet.py': 'import sys\nprint("Hello, " + sys.argv[1] + "!")\n',
      'args.py': 'import sys\nprint(sys.argv)\n',
      'Hello.java': 'public class Hello {\n    public static void main(String[] args) {\n        System.out.println("hello, world");\n    }\n}\n',
      'hello.cpp': '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "hello, world" << endl;\n    return 0;\n}\n',
      'add.py': 'a = int(input("first number: "))\nb = int(input("second number: "))\nprint(a + b)\n',
      'numbers.txt': '40\n2\n',
      'squares.py': 'for n in range(1, 11):\n    print(n * n)\n',
      'shout.py': 'line = input()\nprint(line.upper())\n',
      'valid.py': 'import sys\ncount = int(input())\nfor i in range(count):\n    mark = int(input())\n    if mark < 0 or mark > 100:\n        print("bad mark:", mark)\n        sys.exit(1)\nprint("all", count, "marks are fine")\n',
      'good.txt': '3\n88\n92\n75\n',
      'bad.txt': '3\n88\n920\n75\n',
      'grades.py': 'count = int(input())\nmarks = []\nfor i in range(count):\n    marks.append(int(input()))\nprint("marks:", count)\nprint("highest:", max(marks))\nprint("lowest:", min(marks))\nprint("total:", sum(marks))\n',
      'marks.txt': '5\n72\n88\n95\n61\n84\n',
      'Shout.java': 'import java.util.Scanner;\n\npublic class Shout {\n    public static void main(String[] args) {\n        Scanner in = new Scanner(System.in);\n        while (in.hasNextLine()) {\n            System.out.println(in.nextLine().toUpperCase());\n        }\n    }\n}\n',
      'words.txt': 'the shell runs programs\nprograms read and write text\n'
    }
,
    project: {
      'plan.sh!': '#!/bin/bash\n# plan.sh FOLDER: say where each file of FOLDER would go. It moves nothing.\ncd "$1" || exit 1\nfor f in *\ndo\n    if [ -f "$f" ]\n    then\n        case "$f" in\n            *.jpg|*.png|*.gif) dest=images ;;\n            *.pdf|*.docx|*.txt) dest=documents ;;\n            *.mp3|*.wav) dest=music ;;\n            *) dest=other ;;\n        esac\n        echo "would move $f to $dest/"\n    fi\ndone\n',
      'downloads/beach.png': '(beach.png)\n',
      'downloads/cat.jpg': '(cat.jpg)\n',
      'downloads/diagram.gif': '(diagram.gif)\n',
      'downloads/essay.docx': '(essay.docx)\n',
      'downloads/game.py': '(game.py)\n',
      'downloads/holiday photo.jpg': '(holiday photo.jpg)\n',
      'downloads/notes.txt': '(notes.txt)\n',
      'downloads/podcast.mp3': '(podcast.mp3)\n',
      'downloads/reading list.txt': '(reading list.txt)\n',
      'downloads/report.pdf': '(report.pdf)\n',
      'downloads/ringtone.wav': '(ringtone.wav)\n',
      'downloads/setup.zip': '(setup.zip)\n',
      'downloads/song.mp3': '(song.mp3)\n',
      'downloads/timetable.pdf': '(timetable.pdf)\n',
      'downloads/old projects/': null
    },
    project2: {
      'plan.sh!': '#!/bin/bash\n# plan.sh FOLDER: say where each file of FOLDER would go. It moves nothing.\ncd "$1" || exit 1\nfor f in *\ndo\n    if [ -f "$f" ]\n    then\n        case "$f" in\n            *.jpg|*.png|*.gif) dest=images ;;\n            *.pdf|*.docx|*.txt) dest=documents ;;\n            *.mp3|*.wav) dest=music ;;\n            *) dest=other ;;\n        esac\n        echo "would move $f to $dest/"\n    fi\ndone\n',
      'tidy.sh!': '#!/bin/bash\n# tidy.sh FOLDER: sort the files of FOLDER into folders by kind\ncd "$1" || exit 1\nfor f in *\ndo\n    if [ -f "$f" ]\n    then\n        case "$f" in\n            *.jpg|*.png|*.gif) dest=images ;;\n            *.pdf|*.docx|*.txt) dest=documents ;;\n            *.mp3|*.wav) dest=music ;;\n            *) dest=other ;;\n        esac\n        mkdir -p "$dest"\n        mv "$f" "$dest/"\n        echo "$f -> $dest"\n    fi\ndone\n',
      'downloads/images/cat.jpg': '(an older cat.jpg)\n',
      'downloads/beach.png': '(beach.png)\n',
      'downloads/cat.jpg': '(cat.jpg)\n',
      'downloads/diagram.gif': '(diagram.gif)\n',
      'downloads/essay.docx': '(essay.docx)\n',
      'downloads/game.py': '(game.py)\n',
      'downloads/holiday photo.jpg': '(holiday photo.jpg)\n',
      'downloads/notes.txt': '(notes.txt)\n',
      'downloads/podcast.mp3': '(podcast.mp3)\n',
      'downloads/reading list.txt': '(reading list.txt)\n',
      'downloads/report.pdf': '(report.pdf)\n',
      'downloads/ringtone.wav': '(ringtone.wav)\n',
      'downloads/setup.zip': '(setup.zip)\n',
      'downloads/song.mp3': '(song.mp3)\n',
      'downloads/timetable.pdf': '(timetable.pdf)\n',
      'downloads/old projects/': null
    },
    lesson7: {
      'notes.txt': 'buy seeds\nfix the gate\n',
      'todo.txt': 'water the tulips\n',
      'hello.py': 'print("hello from Python")\n',
      'garden/flowers.txt': 'roses\ntulips\ndaisies\n',
      'garden/shed/key.txt': 'The key opens the gate.\nThe password is: tulip\n',
      'garden/shed/tools.txt': 'rake\nspade\nhose\nwatering can\nshears\n',
      'garden/pond/fish.txt': 'three goldfish\n',
      'garden/pond/frogs.txt': 'one frog, maybe two\nit sings at night\nnobody has seen it\n'
    },
    lesson8: {
      'hello.sh': '#!/bin/bash\necho "Hello from a script"\necho "You are in $(pwd)"\n',
      'greet.sh': '#!/bin/bash\nname="$1"\necho "Hello, $name!"\necho "You gave me $# words."\n',
      'count.sh': '#!/bin/bash\nfor f in *.txt\ndo\n    echo "$f has $(wc -l < "$f") lines"\ndone\n',
      'check.sh': '#!/bin/bash\nif [ -f "$1" ]\nthen\n    echo "$1 is here"\nelse\n    echo "no file called $1"\n    exit 1\nfi\n',
      'notes.txt': 'call Sam\nwater the tulips\nfinish the essay\n',
      'todo.txt': 'learn the shell\nwrite a script\n',
      'shopping.txt': 'milk\neggs\nflour\nbutter\n',
      'server.log': '09:00:01 INFO  server started\n09:02:30 ERROR disk full on /data\n09:02:33 ERROR disk full on /data\n09:07:45 WARN  slow query (3.4 s)\n09:12:02 ERROR connection lost to db1\n',
      'quiet.log': '10:00:00 INFO  server started\n10:30:00 INFO  backup finished\n'
    }
  },
  lessons: [
    /* ================================================================== */
    {
      standard: 1, standards: ['3A-CS-02', '3B-CS-01'],
      title: 'Where am I?', summary: 'What a shell is, how to read the prompt, the tree of directories, absolute and relative paths, and moving around with cd.',
      blocks: [
        `<p>In the summer of 1969, Ken Thompson's wife took their baby son to California for a month to visit family. Thompson, a programmer at Bell Labs in New Jersey, stayed behind with a small computer nobody was using, a PDP-7, and a plan. He gave himself about one week for each of the four pieces of an operating system: the part that manages the machine, an editor, an assembler, and a program whose only job was to read what a person typed and run it. That last program is the <em>shell</em>. The system it belonged to became Unix.</p>`,
        { photo: 'pdp-7', caption: 'A PDP-7, the model of computer Thompson used for the first Unix, at the Living Computer Museum in 2018. On the right is a keyboard terminal that typed its output onto a roll of paper.' },
        `<p>More than fifty years later, the shell is still there. Every Linux computer, every Mac, every Raspberry Pi and every web server has one. The one this course teaches, <code>bash</code>, was first released in 1989 by Brian Fox for the GNU project; Macs now start a close cousin, <code>zsh</code>, which reads the same commands. The ideas have barely changed since Thompson's summer: you type a command, the shell runs it, the result appears, and you type the next one.</p>
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
        `<p>Look at the root. <code>bin</code> holds the commands themselves (<code>ls</code> is a program that lives at <code>/bin/ls</code>), <code>etc</code> holds settings, <code>home</code> holds the users' home directories, <code>tmp</code> is for temporary files. On a real machine there are more of them, and you do not need them yet.</p>
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
wc -w library/*.txt`, setup: 'lesson3', caption: 'Lines, words and characters of the poem (the blank line counts as a line); just the line count of the log; the word counts of the texts directly inside <code>library</code> (the star does not reach into <code>old</code>), with a total.' },
        { check: 'A log file has 500 lines. Which command shows the newest 20 entries?', skill: 'read-files', options: ['<code>head -n 20 app.log</code>', '<code>tail -n 20 app.log</code>', '<code>cat -n 20 app.log</code>', '<code>wc -l app.log</code>'], answer: 1, why: 'New lines are added at the end of a log, so the newest entries are the last ones, and <code>tail</code> prints the end. <code>head</code> would show how the day started.', wrong: ['<code>head</code> shows the first lines: the oldest entries.', null, '<code>cat -n</code> numbers the lines; the 20 would be taken as a file name.', '<code>wc -l</code> only counts the lines.'] },
        `<h2>Searching inside files</h2>
<p><code>grep</code> prints every line of a file that contains a pattern. Put the pattern in quotes, especially when it has a space in it. Three options do most of the work: <code>-i</code> ignores capitals, <code>-n</code> shows the line numbers, <code>-c</code> only counts the matching lines. <code>-v</code> turns it around: the lines that do <em>not</em> match.</p>`,
        { play: `grep ERROR server.log
grep -c ERROR server.log
grep -n "disk full" server.log
grep -i ada server.log
grep -v INFO server.log`, setup: 'lesson3', caption: 'Every error; how many errors; where "disk full" happened, with line numbers; everything about ada, capitals or not; everything that is not routine. The pattern is a plain word here. It can also be a <em>regular expression</em>, a small language for patterns; <code>^</code> means "at the start of the line" and <code>$</code> "at the end"; lesson 8 of <em>The Mathematics of Computing</em> (SC 104) is about that little language.' },
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
<li>Next: running your own programs from the shell, the Windows Command Prompt and PowerShell, and your first script.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['3A-CS-02', '3A-AP-18', '3B-AP-20'],
      title: 'Running your programs', summary: 'Running Python, Java and C++ programs from the shell: arguments, compiling, why ./ is needed, a program\'s input and output joined to files and pipes, and the exit status that says whether it worked.',
      blocks: [
        `<p>In 1978 Brian Kernighan and Dennis Ritchie, two of the Bell Labs programmers behind Unix, published <em>The C Programming Language</em>, the book that taught C to the world. Its first chapter begins: "The only way to learn a new programming language is by writing programs in it. The first program to write is the same for all languages: Print the words <code>hello, world</code>." Kernighan had used those words before, in a tutorial he wrote at Bell Labs in 1972.</p>
<p>The book then told the reader exactly what to type. Put the program in a file called <code>hello.c</code>, then type <code>cc hello.c</code>. If you have not botched anything, the compiler works silently and leaves a new program called <code>a.out</code>. Type <code>a.out</code>, and it prints <code>hello, world</code>. Generations of programmers ran their first program that way: at a shell prompt.</p>
<p>Every command in this course so far has been somebody else's program. <code>ls</code>, <code>grep</code> and <code>sort</code> are programs too, kept in <code>/bin</code>. This lesson runs yours. What does the shell do with a program you wrote yourself, and where do its input and output go?</p>
<h2>Running a program</h2>
<p>A Python program is run by another program, <code>python</code>, which reads your file and carries it out. So the command is <code>python</code>, and the name of your file is the first word after it. The lesson's home has a few small programs in it.</p>`,
        { play: `cat hello.py
python hello.py
python greet.py Ada
python args.py one two "three four"`, setup: 'lesson6', caption: '<code>cat</code> shows the program; <code>python hello.py</code> runs it. <code>greet.py</code> greets whoever is named after it, and <code>args.py</code> prints the list <code>sys.argv</code>: everything the program was given. Try <code>python greet.py</code> with no name, and read the error.' },
        `<details class="reveal"><summary>Guess first: what will <code>python args.py one two "three four"</code> print?</summary><p><code>['args.py', 'one', 'two', 'three four']</code>. The shell split the line into words, kept the quoted words together as one, and handed them all to the program. The program's own name comes first, so the first word typed after it is <code>sys.argv[1]</code>: that is how <code>greet.py</code> found <code>Ada</code>.</p></details>`,
        `<div class="stmt"><p><span class="kind">A command is a program.</span> The first word of a line names a program; the shell looks for it in the directories listed in the variable <code>PATH</code> (<code>echo $PATH</code> shows them), starts it, and hands it every other word of the line. <code>which python</code> says where it found one.</p>
<p><span class="kind">Arguments.</span> The words after the program's name are its <em>arguments</em>. A Python program finds them in the list <code>sys.argv</code> (after <code>import sys</code>): <code>sys.argv[0]</code> is the program's own name, <code>sys.argv[1]</code> the first word after it. In Java they are <code>main</code>'s <code>String[] args</code>, and <code>args[0]</code> is the first word.</p></div>
<p>Arguments are why <code>ls -l letters</code> works: <code>ls</code> is a program that looks at its arguments, sees <code>-l</code> and a name, and acts on them. Your programs can do the same.</p>`,
        { check: '<code>greet.py</code> prints <code>"Hello, " + sys.argv[1] + "!"</code>. What does <code>python greet.py Ada Lovelace</code> print?', skill: 'run-programs', options: ['<code>Hello, Ada Lovelace!</code>', '<code>Hello, Ada!</code>', '<code>Hello, greet.py!</code>', 'An error: there is one word too many'], answer: 1, why: 'The shell splits the line at spaces, so the program gets two arguments, <code>Ada</code> and <code>Lovelace</code>, as <code>sys.argv[1]</code> and <code>sys.argv[2]</code>. The program only uses the first. To pass the full name as one word, quote it: <code>python greet.py "Ada Lovelace"</code>.', wrong: ['The shell splits at the space before the program sees anything, so <code>Ada</code> and <code>Lovelace</code> arrive as two separate words.', null, 'The program\'s own name is <code>sys.argv[0]</code>; the first word after it is <code>sys.argv[1]</code>.', 'Extra arguments are not an error. A program receives them all and uses the ones it wants.'] },
        `<h2>Compiled programs</h2>
<p>Java and C++ take one more step. A <em>compiler</em> reads your source file, checks it, and writes a new file that can be run. <code>javac Hello.java</code> writes <code>Hello.class</code>, and <code>java Hello</code> runs it (the class name, without <code>.class</code>). <code>g++ hello.cpp</code> writes a program called <code>a.out</code>, exactly as Kernighan's <code>cc</code> did; <code>-o hello</code> gives it a better name.</p>`,
        { play: `javac Hello.java
ls
java Hello
g++ hello.cpp -o hello
./hello
hello`, setup: 'lesson6', expectError: true, caption: '<code>javac</code> and <code>g++</code> print nothing when all is well: silence means success, as it did in 1978. The new files appear in <code>ls</code>. <code>./hello</code> runs the program, but plain <code>hello</code> is "command not found", even though the file is right there.' },
        `<details class="reveal"><summary>Guess first: why does <code>./hello</code> work and <code>hello</code> fail?</summary><p>A bare name is looked up only in the directories of <code>PATH</code>, like <code>ls</code> and <code>python</code> are, and the working directory is not one of them. <code>./hello</code> is a path ("the file <code>hello</code> here"), so the shell runs that file directly. Kernighan's readers could type <code>a.out</code> because the shells of 1978 also looked in the working directory. Modern shells stopped doing that on purpose: otherwise anyone could leave a program called <code>ls</code> in a shared directory and wait for someone to run it there.</p></details>`,
        `<div class="stmt"><p><span class="kind">Compile, then run.</span> <code>javac Name.java</code> then <code>java Name</code>; <code>g++ file.cpp -o name</code> then <code>./name</code>. If the compiler prints an error, it has written nothing new: fix the line it names and compile again. Join the two with <code>&amp;&amp;</code> (below) and the program runs only when the compile worked: <code>g++ hello.cpp -o hello &amp;&amp; ./hello</code>.</p></div>`,
        { check: 'You compiled <code>game.cpp</code> with <code>g++ game.cpp -o game</code>. Typing <code>game</code> says "command not found". Why?', skill: 'compile', options: ['The compile failed, so there is no file called <code>game</code>', 'The shell looks for commands only in the directories of <code>PATH</code>, and the working directory is not one of them: type <code>./game</code>', 'A compiled program must be run with <code>g++ game</code>', 'Programs you write can only be run from the Code Lab'], answer: 1, why: '<code>./game</code> is a path to the file, so the shell runs that file. A bare word is looked up in <code>PATH</code> only, which is a safety rule: a stranger\'s program in a shared directory can never take the place of <code>ls</code>.', wrong: ['<code>ls</code> would show the file; it is there. The compiler said nothing, which means it worked.', null, '<code>g++</code> compiles; it does not run anything. The program it made is run by naming its file.', 'The shell runs them as it runs any program, given a path such as <code>./game</code>.'] },
        `<h2>Input and output</h2>
<p>Here is the idea that makes this lesson worth having. When a Python program calls <code>print</code>, the text goes to the program's <em>standard output</em>; when it calls <code>input()</code>, it reads a line from its <em>standard input</em>. Those are exactly the two streams that lesson 4 pointed at files and pipes. So <code>&lt;</code>, <code>&gt;</code> and <code>|</code> work on your programs just as they work on <code>sort</code>. <code>add.py</code> asks for two numbers with <code>input</code>; <code>numbers.txt</code> holds two lines, 40 and 2.</p>`,
        { play: `cat add.py
python add.py < numbers.txt`, setup: 'lesson6', caption: 'The program asks for two numbers with <code>input</code>, and <code>&lt;</code> gives it the file instead of the keyboard. Type <code>python add.py</code> on its own afterwards: then it waits for you to type the numbers.' },
        `<details class="reveal"><summary>Guess first: what exactly will <code>python add.py &lt; numbers.txt</code> print? Think about the prompts.</summary><p><code>first number: second number: 42</code>, on one line. The program read 40 and 2 from the file and never knew the difference. It still printed both prompts, because <code>input("first number: ")</code> always prints its prompt; nobody pressed Enter after them, so they run together.</p></details>`,
        `<p>Output works the same way. <code>&gt;</code> catches everything the program prints, and <code>|</code> hands it to the next command, so your program can be one stage of a pipeline, at either end.</p>`,
        { play: `python squares.py | tail -n 3
python squares.py > squares.txt
wc -l squares.txt
echo "hello there" | python shout.py
sort -n numbers.txt | python add.py`, setup: 'lesson6', caption: 'The last three squares; all ten into a file, then counted; a line piped in as <code>shout.py</code>\'s input; and <code>sort</code>\'s output read by <code>add.py</code> (2 and then 40, so the sum is still 42). In each line the program is just one more tool.' },
        `<details class="reveal"><summary>Guess first: how many lines will <code>wc -l squares.txt</code> count, and what will <code>shout.py</code> print?</summary><p>10 lines, one for each square from 1 to 100. <code>shout.py</code> reads one line with <code>input()</code> and prints it in capitals: <code>HELLO THERE</code>.</p></details>`,
        `<h2>The exit status</h2>
<div class="stmt"><p><span class="kind">Every program ends with a number.</span> 0 means "it worked"; any other number means something went wrong. <code>$?</code> holds the number of the last command. A Python program sets it with <code>sys.exit(1)</code> (no <code>sys.exit</code>, or <code>sys.exit(0)</code>, means 0); a C++ program with the value <code>main</code> returns; Java with <code>System.exit(1)</code>.</p>
<p><span class="kind">&amp;&amp; and ||.</span> <code>a &amp;&amp; b</code> runs <code>b</code> only if <code>a</code> ended with 0. <code>a || b</code> runs <code>b</code> only if <code>a</code> failed. So the status lets the shell make decisions about your program.</p></div>
<p><code>valid.py</code> checks a file of marks: it reads how many there are, then each mark, and ends with status 1 at the first mark that is not between 0 and 100. <code>good.txt</code> is fine; <code>bad.txt</code> has a mark of 920.</p>`,
        { play: `python valid.py < good.txt && echo "ready to grade"
python valid.py < bad.txt && echo "ready to grade"
echo $?
python valid.py < bad.txt || echo "fix the file first"`, setup: 'lesson6', expectError: true, caption: 'With the good file the check passes and <code>&amp;&amp;</code> runs the <code>echo</code>. With the bad one the program prints <code>bad mark: 920</code> and ends with status 1, so the <code>echo</code> after <code>&amp;&amp;</code> never runs; <code>$?</code> shows the 1, and <code>||</code> runs its command because the program failed.' },
        `<details class="reveal"><summary>Guess first: after <code>python valid.py &lt; bad.txt &amp;&amp; echo "ready to grade"</code>, which lines appear?</summary><p>Only <code>bad mark: 920</code>. The program stopped with <code>sys.exit(1)</code>, a failure, so <code>&amp;&amp;</code> skipped the <code>echo</code>. This is how build tools and graders work: <code>javac Main.java &amp;&amp; java Main</code> runs the program only when the compile succeeded.</p></details>`,
        { check: 'A program ends with <code>sys.exit(2)</code>. What happens with <code>python prog.py &amp;&amp; echo yes || echo no</code>?', skill: 'exit-status', options: ['It prints <code>yes</code>: the program ran to the end', 'It prints <code>no</code>: status 2 is a failure, so <code>&amp;&amp;</code> skips <code>echo yes</code> and <code>||</code> runs <code>echo no</code>', 'It prints both <code>yes</code> and <code>no</code>', 'It prints nothing: the shell stops at the first failure'], answer: 1, why: 'Only 0 counts as success. With status 2, <code>&amp;&amp;</code> does not run its right side, and the <code>||</code> after it sees a failure, so it runs <code>echo no</code>.', wrong: ['Reaching <code>sys.exit</code> is not success; the number it gives is what counts, and only 0 means success.', null, 'Only one side runs: <code>&amp;&amp;</code> skips <code>yes</code> because of the failure, and then <code>||</code> runs <code>no</code>.', 'The shell carries on to the next part of the line; <code>||</code> exists exactly for the case of a failure.'] },
        { ex: { id: 'sh-6-1', kind: 'shell', skill: ['run-programs', 'program-io'], title: 'Run it on the data', setup: 'lesson6',
          prompt: '<p><code>grades.py</code> reads a count and then that many marks, one per line, and prints four lines about them. <code>marks.txt</code> holds the class\'s marks in that shape. Run <code>grades.py</code> with <code>marks.txt</code> as its input, and save what it prints in a file called <code>report.txt</code>. The check reads <code>report.txt</code>; it should hold:</p><pre class="code"><code>marks: 5\nhighest: 95\nlowest: 61\ntotal: 400</code></pre>',
          tests: [{ content: 'report.txt', expect: 'marks: 5\nhighest: 95\nlowest: 61\ntotal: 400' }, { ran: /\bpython3?\s+grades\.py\b[^|]*</, name: 'the marks came from the file with <' }],
          hints: ['Look first: <code>cat grades.py</code> and <code>cat marks.txt</code>. Then run it with the file as input: <code>python grades.py &lt; marks.txt</code>.', 'When the four lines look right on the screen, run it again with <code>&gt; report.txt</code> at the end, and check with <code>cat report.txt</code>.'],
          failTip: 'The marks must come in through <code>&lt; marks.txt</code>, not be typed by hand, and the output must go into <code>report.txt</code> with <code>&gt;</code>. Without <code>&lt;</code>, the program waits for you to type the marks; <code>python grades.py marks.txt</code> gives the file name as an argument, which this program ignores.',
          solution: 'python grades.py < marks.txt\npython grades.py < marks.txt > report.txt\ncat report.txt',
          followup: 'Print only the highest mark, with one line: run the program and pipe its output through grep. Then add a sixth mark to marks.txt (remember to change the count on the first line) and run the report again.' } },
        { ex: { id: 'sh-6-2', kind: 'shell', skill: ['compile', 'program-io'], title: 'Compile and shout', setup: 'lesson6',
          prompt: '<p><code>Shout.java</code> reads every line of its input and prints it in capitals. Compile it, then run it with <code>words.txt</code> as its input and its output going into a new file, <code>loud.txt</code>. The check looks for <code>Shout.class</code> and reads <code>loud.txt</code>, which should hold:</p><pre class="code"><code>THE SHELL RUNS PROGRAMS\nPROGRAMS READ AND WRITE TEXT</code></pre>',
          tests: [{ file: 'Shout.class', name: 'Shout.java was compiled' }, { content: 'loud.txt', expect: 'THE SHELL RUNS PROGRAMS\nPROGRAMS READ AND WRITE TEXT' }],
          hints: ['Compile first with <code>javac Shout.java</code>: no message means it worked, and <code>ls</code> shows <code>Shout.class</code>.', 'Run it with the class name, the input file and the output file: <code>java Shout &lt; words.txt &gt; loud.txt</code>. Or do both in one line, joined with <code>&amp;&amp;</code>.'],
          failTip: '<code>java</code> takes the class name, <code>Shout</code>, not <code>Shout.java</code> or <code>Shout.class</code>, and capitals count. The input comes from <code>&lt; words.txt</code> and the output goes to <code>&gt; loud.txt</code>; check the file with <code>cat loud.txt</code>.',
          solution: 'javac Shout.java && java Shout < words.txt > loud.txt\ncat loud.txt',
          followup: 'Pipe the same output through sort instead of into a file, and count the words of loud.txt with wc -w. Then break Shout.java on purpose (nano Shout.java, delete a semicolon) and see that javac Shout.java && java Shout never runs the program.' } },
        `<div class="recap"><h3>In this lesson</h3>
<p><b>What does the shell do with a program you wrote yourself?</b> Exactly what it does with <code>ls</code>: it finds the program, starts it with the words of the line as its arguments, and connects its input and output. So <code>&lt;</code>, <code>&gt;</code>, <code>|</code> and <code>&amp;&amp;</code> work on your programs too.</p><ul>
<li><b>Run:</b> <code>python file.py</code>; <code>javac Name.java</code> then <code>java Name</code>; <code>g++ file.cpp -o name</code> then <code>./name</code>. A compiler says nothing when it works.</li>
<li><b>Arguments</b> are the words after the program's name: <code>sys.argv[1]</code> in Python, <code>args[0]</code> in Java. Quotes keep spaces inside one argument.</li>
<li>A bare name is looked up in <code>PATH</code> only, never in the working directory: your own program needs a path, <code>./name</code>.</li>
<li><code>print</code> writes to standard output and <code>input()</code> reads standard input, so <code>prog &lt; in.txt &gt; out.txt</code> and <code>prog | sort</code> work.</li>
<li>Every program ends with an <b>exit status</b>: 0 is success. <code>sys.exit(1)</code> reports a failure; <code>&amp;&amp;</code> runs the next command only after a success, <code>||</code> only after a failure.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['3A-CS-02', '3B-CS-01', '3A-AP-18'],
      title: 'Windows: cmd and PowerShell', summary: 'The same ideas in the two shells of Windows: the Command Prompt\'s dir, cd, type, copy and del, with backslashes and drive letters; PowerShell\'s Verb-Noun commands, its aliases, and pipes that carry objects instead of text.',
      blocks: [
        `<p>In August 2002 Jeffrey Snover, an engineer at Microsoft, wrote a paper he called the <em>Monad Manifesto</em>. Windows had a command line, the Command Prompt, descended from the MS-DOS of 1981, but nobody ran a large system with it: Windows was built to be driven with a mouse. Snover admired the Unix shell, and he also saw its weak point. Unix commands pass <em>text</em> to each other, so every stage of a pipeline has to cut the text up again to find what it needs: the fifth column, the third field. On Windows, he wrote, the commands should pass <em>objects</em>: a file that knows its own name, size and date, handed down the pipe whole. Four years later, in November 2006, his project was released as Windows PowerShell. Since 2016 it has been open source and runs on Linux and the Mac too.</p>
<p>So Windows has two shells, and they look nothing like <code>bash</code>. But everything this course has taught is about ideas, not spellings: a working directory, paths, making and moving, reading and searching, pipes and redirection. If the ideas are the same everywhere, what actually changes when you sit down at a Windows computer?</p>
<h2>The Command Prompt</h2>
<p>Type <code>cmd</code> in the practice terminal and it becomes the Windows Command Prompt, over the same files; <code>exit</code> comes back to <code>bash</code>. (On a real Windows computer, open it from the Start menu by typing <code>cmd</code>.) Your home directory is now called <code>C:\\Users\\student</code>.</p>`,
        { play: `cmd
cd
dir
cd garden
dir /b
type shed\\key.txt
cd ..
exit
pwd`, setup: 'lesson7', caption: 'The Command Prompt\'s versions of <code>pwd</code>, <code>ls</code>, <code>cd</code> and <code>cat</code>. <code>dir</code> lists with dates and sizes; <code>dir /b</code> gives only the names. After <code>exit</code>, <code>bash</code>\'s <code>pwd</code> shows the same place under its Unix name.' },
        `<details class="reveal"><summary>Guess first: what does <code>cd</code> with nothing after it do in the Command Prompt, and where are you after <code>exit</code>?</summary><p>In <code>bash</code>, a bare <code>cd</code> goes home. In the Command Prompt it only prints where you are, <code>C:\\Users\\student</code>, like <code>pwd</code>. And after <code>exit</code> you are back in <code>bash</code>, in <code>/home/student</code>: the same directory, by its other name. The files never moved; only the language for them changed.</p></details>`,
        `<div class="stmt"><p><span class="kind">Paths, the Windows way.</span> A path starts with a <em>drive letter</em>, <code>C:</code>, and the separator is a backslash: <code>C:\\Users\\student\\garden</code>. <code>..</code> and <code>.</code> mean what they mean in Unix. Capitals do not matter: <code>GARDEN</code> and <code>garden</code> are the same folder. Options start with a slash instead of a dash: <code>dir /b</code>.</p>
<p><span class="kind">The same jobs, other words.</span></p>
<table class="small"><thead><tr><th>bash</th><th>Command Prompt</th><th>what it does</th></tr></thead><tbody>
<tr><td><code>pwd</code></td><td><code>cd</code></td><td>where am I?</td></tr>
<tr><td><code>ls</code></td><td><code>dir</code>, <code>dir /b</code></td><td>list a directory</td></tr>
<tr><td><code>cat</code></td><td><code>type</code></td><td>print a file</td></tr>
<tr><td><code>cp</code>, <code>mv</code></td><td><code>copy</code>, <code>move</code>, <code>ren</code></td><td>copy, move, rename</td></tr>
<tr><td><code>rm</code>, <code>rm -r</code></td><td><code>del</code>, <code>rmdir /s</code></td><td>remove (no recycle bin here either)</td></tr>
<tr><td><code>grep</code></td><td><code>findstr</code>, <code>find</code></td><td>search inside files</td></tr>
<tr><td><code>clear</code></td><td><code>cls</code></td><td>clear the screen</td></tr>
</tbody></table>
<p><code>mkdir</code>, <code>cd</code>, <code>&gt;</code>, <code>&gt;&gt;</code>, <code>&lt;</code>, <code>|</code>, <code>&amp;&amp;</code> and wildcards like <code>*.txt</code> are the same in both.</p></div>`,
        { play: `cmd
mkdir projects\\game
echo my game> projects\\game\\readme.txt
move projects\\game\\readme.txt projects
ren projects\\readme.txt about.txt
dir /b projects
rmdir projects
rmdir /s /q projects
find "tulip" garden\\flowers.txt todo.txt
ls`, setup: 'lesson7', expectError: true, caption: 'Lesson 2\'s jobs in Windows words: make, write, move, rename, and remove a folder (<code>rmdir</code> refuses one that is not empty, as in Unix; <code>/s /q</code> removes it all, quietly). Then a search with <code>find</code>, and a Unix command that the Command Prompt does not know.' },
        `<details class="reveal"><summary>Guess first: what does the Command Prompt say to <code>ls</code>?</summary><p><code>'ls' is not recognized as an internal or external command, operable program or batch file.</code> That is cmd's "command not found". Notice also how <code>find</code> prints a header, the file's name in capitals, before each file's matching lines.</p></details>`,
        { check: 'In the Command Prompt, which command prints the text of <code>notes.txt</code>, as <code>cat notes.txt</code> does in bash?', skill: 'windows-cmd', options: ['<code>dir notes.txt</code>', '<code>type notes.txt</code>', '<code>cat notes.txt</code>', '<code>print notes.txt</code>'], answer: 1, why: '<code>type</code> is the Command Prompt\'s <code>cat</code>. <code>dir</code> would show the file\'s date and size, but not what is inside it.', wrong: ['<code>dir</code> lists: it shows the file\'s name, date and size, not its text.', null, 'The Command Prompt has no <code>cat</code>: "\'cat\' is not recognized as an internal or external command".', '<code>print</code> sends a file to a printer on Windows; it is not how you read one.'] },
        `<h2>PowerShell</h2>
<p>PowerShell is the newer shell, and the one Microsoft recommends. Its commands, called <em>cmdlets</em>, are named <em>Verb-Noun</em>: <code>Get-Location</code>, <code>Get-ChildItem</code>, <code>Set-Location</code>, <code>Get-Content</code>, <code>Copy-Item</code>, <code>Remove-Item</code>. The names are long, but you can always guess them, and Tab completes them. Type <code>powershell</code> (or <code>pwsh</code>) to start it.</p>`,
        { play: `powershell
Get-Location
Get-ChildItem
Set-Location garden
Get-Content shed\\key.txt
cd ..
ls
Get-Alias ls, cd, cat, pwd
exit`, setup: 'lesson7', caption: 'Where am I, what is here, move, read. Then <code>cd</code> and <code>ls</code>, which work too: PowerShell keeps short <em>aliases</em> for its cmdlets, and <code>Get-Alias</code> says what each one stands for.' },
        `<details class="reveal"><summary>Guess first: what does <code>ls</code> print in PowerShell, the short list of <code>bash</code> or something else?</summary><p>The same table as <code>Get-ChildItem</code>, with <code>Mode</code>, <code>LastWriteTime</code>, <code>Length</code> and <code>Name</code> columns, because <code>ls</code> is only another name for <code>Get-ChildItem</code>. The familiar words work, but they run PowerShell's commands, with PowerShell's options: <code>ls -l</code> is an error here.</p></details>`,
        { check: 'Which PowerShell cmdlet does the job of <code>cd</code>?', skill: 'powershell', options: ['<code>Get-Location</code>', '<code>Set-Location</code>', '<code>Move-Item</code>', '<code>Change-Directory</code>'], answer: 1, why: 'Moving to another directory <em>sets</em> your location; finding out where you are <em>gets</em> it. <code>cd</code> is an alias of <code>Set-Location</code>, and <code>pwd</code> of <code>Get-Location</code>.', wrong: ['<code>Get-Location</code> only reports where you are, like <code>pwd</code>.', null, '<code>Move-Item</code> moves a file or a folder, like <code>mv</code>; you stay where you are.', 'There is no such cmdlet. PowerShell\'s verbs come from a short approved list: Get, Set, New, Remove, Copy, Move…'] },
        `<h2>Pipes that carry objects</h2>
<p>Here is Snover's idea at work. In <code>bash</code>, sorting files by size means asking <code>ls -l</code> for text and cutting the size out of the fifth column. In PowerShell, <code>Get-ChildItem</code> sends <em>file objects</em> down the pipe, and each object knows its <code>Name</code>, its <code>Length</code> (the size in bytes) and its <code>LastWriteTime</code>. The next cmdlet just names the property it wants.</p>
<div class="stmt"><p><span class="kind">Objects in the pipe.</span> <code>Sort-Object Length</code> sorts by a property (<code>-Descending</code> for biggest first). <code>Select-Object Name, Length</code> keeps some properties; <code>-First 3</code> keeps the first three objects; <code>-ExpandProperty Name</code> passes on the bare names. <code>Measure-Object</code> counts, and <code>Select-String</code> is PowerShell's <code>grep</code>. Only at the end of the pipeline are the objects turned into text, for you to read.</p></div>`,
        { play: `powershell
Get-ChildItem garden -Recurse -File | Sort-Object Length -Descending | Select-Object Name, Length
Get-ChildItem garden -Recurse -File | Sort-Object Length -Descending | Select-Object -First 3 -ExpandProperty Name
Get-Content garden\\flowers.txt | Measure-Object -Line -Word -Character
Select-String -Pattern "gate" -Path *.txt
"one" > list.txt
"two" >> list.txt
Get-Content list.txt`, setup: 'lesson7', caption: 'Every file under <code>garden</code>, biggest first; only the names of the three biggest; lines, words and characters (PowerShell\'s <code>wc</code>); a search; and redirection, which works as in <code>bash</code>.' },
        `<details class="reveal"><summary>Guess first: which file under <code>garden</code> is the biggest, and how did <code>Sort-Object</code> know the sizes without any <code>cut</code>?</summary><p><code>frogs.txt</code>, at 57 bytes, then <code>key.txt</code> (47) and <code>tools.txt</code> (36). <code>Sort-Object</code> never saw any text: each file arrived as an object, and <code>Length</code> is one of its properties. No column to count, no spaces to split on: the reason PowerShell was built.</p></details>`,
        { check: 'Why can <code>Get-ChildItem | Sort-Object Length</code> sort files by size without cutting a column out of text?', skill: 'powershell', options: ['<code>Sort-Object</code> reads the file sizes from the disk itself', 'The pipe carries file objects, and <code>Length</code> is a property of each one', '<code>Length</code> is the fifth column of the text, and PowerShell counts columns for you', 'It sorts the names by how long they are'], answer: 1, why: 'In PowerShell the pipe carries objects, not lines of text. Each file object brings its properties with it, so the next cmdlet names the one it wants. Only the last stage turns objects into text for the screen.', wrong: ['<code>Sort-Object</code> knows nothing about disks; it sorts whatever objects arrive, by the property you name.', null, 'There are no columns until the very end, when the objects are printed. Before that, <code>Length</code> is a named property.', '<code>Length</code> here is the file\'s size in bytes, not the length of its name.'] },
        { ex: { id: 'sh-7-1', kind: 'shell', skill: 'windows-cmd', title: 'Back up in the Command Prompt', setup: 'lesson7',
          prompt: '<p>Start the Command Prompt with <code>cmd</code>. In it, make a folder called <code>backup</code> in your home directory, copy every <code>.txt</code> file of your home directory into it with <code>copy</code>, and save the bare list of what <code>backup</code> holds in a file <code>list.txt</code> in your home directory. The check reads <code>list.txt</code>, which should hold:</p><pre class="code"><code>notes.txt\ntodo.txt</code></pre>',
          tests: [{ ran: /^\s*cmd(\.exe)?\s*$/i, name: 'the Command Prompt was started with cmd' }, { ran: /^\s*copy\b/i, name: 'the files were copied with copy' }, { exists: 'backup/notes.txt' }, { exists: 'backup/todo.txt' }, { content: 'list.txt', expect: 'notes.txt\ntodo.txt' }],
          hints: ['After <code>cmd</code>: <code>mkdir backup</code>, then <code>copy *.txt backup</code>. The wildcard works as in bash.', '<code>dir /b backup</code> prints the bare names; add <code>&gt; list.txt</code> to put them in a file, and check with <code>type list.txt</code>.'],
          failTip: 'Make the list of <code>backup</code>, not of your home directory: <code>dir /b backup &gt; list.txt</code>. A plain <code>dir</code> adds dates, sizes and totals; <code>/b</code> gives only the names. And make the list after copying, or it is empty.',
          solution: 'cmd\nmkdir backup\ncopy *.txt backup\ndir /b backup > list.txt\ntype list.txt\nexit',
          followup: 'Still in the Command Prompt, use find to show which of the backed-up files mention "tulip", and then remove the backup folder and everything in it with one command.' } },
        { ex: { id: 'sh-7-2', kind: 'shell', skill: 'powershell', title: 'The three biggest, in PowerShell', setup: 'lesson7',
          prompt: '<p>In PowerShell, write the names of the three biggest files anywhere under <code>garden</code>, biggest first, into a file <code>big.txt</code> in your home directory, one name per line. Use a pipeline of cmdlets, not by-hand typing. The check reads <code>big.txt</code>:</p><pre class="code"><code>frogs.txt\nkey.txt\ntools.txt</code></pre>',
          tests: [{ ran: /^\s*(powershell|pwsh)(\.exe)?\s*$/i, name: 'PowerShell was started' }, { ran: /\bSort-Object\b|\|\s*sort\b/i, name: 'the files were sorted with Sort-Object' }, { content: 'big.txt', expect: 'frogs.txt\nkey.txt\ntools.txt' }],
          hints: ['Start from the example: <code>Get-ChildItem garden -Recurse -File | Sort-Object Length -Descending</code>.', 'Add <code>| Select-Object -First 3 -ExpandProperty Name</code> to keep three bare names, and <code>&gt; big.txt</code> at the end. Check with <code>Get-Content big.txt</code>.'],
          failTip: 'If <code>big.txt</code> holds a table with <code>Name</code> and <code>Length</code> headings, you used <code>Select-Object Name</code>, which keeps objects with a Name property; <code>-ExpandProperty Name</code> passes on the names themselves. If the wrong files appear, check <code>-Recurse</code> (the biggest are inside <code>shed</code> and <code>pond</code>) and <code>-Descending</code>.',
          solution: 'powershell\nGet-ChildItem garden -Recurse -File | Sort-Object Length -Descending | Select-Object -First 3 -ExpandProperty Name > big.txt\nGet-Content big.txt\nexit',
          followup: 'Count the files under garden with Measure-Object, then find every line under garden that mentions "the" with Get-ChildItem -Recurse and Select-String. Then do the same two jobs in bash, and compare the lengths of the commands.' } },
        `<div class="recap"><h3>In this lesson</h3>
<p><b>What changes on Windows?</b> The spelling, not the ideas. There is still a working directory, paths absolute and relative, making, copying and removing, reading and searching, <code>&gt;</code> and <code>|</code>. The Command Prompt uses other words for them, and PowerShell passes objects, not text, down its pipes.</p><ul>
<li><b>Paths</b> start with a drive, <code>C:\\</code>, use backslashes, and ignore capitals. Your home is <code>C:\\Users\\</code><em>name</em>.</li>
<li><b>Command Prompt:</b> <code>cd</code> (alone: where am I), <code>dir</code> and <code>dir /b</code>, <code>type</code>, <code>copy</code>, <code>move</code>, <code>ren</code>, <code>del</code>, <code>rmdir /s</code>, <code>find</code> and <code>findstr</code>, <code>cls</code>. Options start with <code>/</code>.</li>
<li><b>PowerShell:</b> Verb-Noun cmdlets (<code>Get-Location</code>, <code>Get-ChildItem</code>, <code>Set-Location</code>, <code>Get-Content</code>, <code>Copy-Item</code>, <code>Remove-Item</code>) with aliases such as <code>ls</code>, <code>cd</code>, <code>cat</code>; <code>Get-Alias</code> tells you which is which.</li>
<li><b>Objects in the pipe:</b> <code>Sort-Object Length</code>, <code>Select-Object -First 3</code>, <code>Measure-Object</code> and <code>Select-String</code> work on properties, so nothing has to be cut out of text.</li>
<li>On a Mac or Linux, and in WSL on Windows, it is <code>bash</code> (or <code>zsh</code>) again: everything from lessons 1 to 6.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['2-AP-12', '3A-AP-13', '3B-CS-01'],
      title: 'A first script', summary: 'A file of commands that runs as one: #! and chmod +x, variables and arguments, a for loop over files, and if with test, so that a chore you do by hand is done by one command.',
      blocks: [
        `<p>The first Unix shell, Ken Thompson's, ran commands and not much else. In 1979 Bell Labs sent out Version 7 of Unix to universities with a new shell written by Stephen Bourne, and the Bourne shell was a programming language: it had variables, loops that repeat, and <code>if</code> to choose. Bourne had come from Cambridge, where he had worked on a compiler for the language ALGOL 68, and he borrowed its habit of closing a block with its opening word backwards: <code>if</code> ends with <code>fi</code>, and <code>case</code> with <code>esac</code>. ALGOL 68 ended a loop's <code>do</code> with <code>od</code>, but Unix already had a command called <code>od</code> (it prints a file as octal numbers), so Bourne's loops end with <code>done</code>. <code>bash</code>, "the Bourne-again shell", still reads them the same way.</p>`,
        { photo: 'v7-etc-rc', caption: 'Version 7 Unix of 1979, running today in a simulator of the PDP-11 it was written for. <code>cat /etc/rc</code> prints the script the computer ran every time it started: plain commands, one per line, run by Bourne\'s shell. Among them, <code>rm -f /tmp/*</code> clears out the temporary files: a chore done the same way at every start, by a script.' },
        `<p>Everything you type at a prompt can be saved in a file and run again later, by you or by someone else, at any hour. That file is a <em>script</em>. How does a list of commands become a program that makes decisions and repeats itself?</p>
<h2>A file of commands</h2>
<p>A script is a text file with one command on each line. <code>bash hello.sh</code> reads the file and runs its lines one after another, as if you had typed them. The lesson's home has a few scripts ready.</p>`,
        { play: `cat hello.sh
bash hello.sh
./hello.sh
chmod +x hello.sh
ls -l hello.sh
./hello.sh`, setup: 'lesson8', expectError: true, caption: '<code>bash hello.sh</code> runs the script. <code>./hello.sh</code> asks the shell to run the file as a program of its own, which it refuses at first. After <code>chmod +x</code>, look at the start of the <code>ls -l</code> line, and run it again.' },
        `<details class="reveal"><summary>Guess first: why is the first <code>./hello.sh</code> refused, and what changes in <code>ls -l</code> after <code>chmod +x</code>?</summary><p>"Permission denied": a file may be run as a program only when it has the <em>x</em> (execute) permission, and a new file does not. <code>chmod +x</code> gives it, and <code>ls -l</code> shows <code>-rwxr-xr-x</code> instead of <code>-rw-r--r--</code>: the three <code>x</code>s are new. Then <code>./hello.sh</code> works.</p></details>`,
        `<div class="stmt"><p><span class="kind">The #! line.</span> A script's first line, <code>#!/bin/bash</code> (say "shebang"), tells the system which program reads the rest of the file. With it, and with <code>chmod +x</code>, <code>./hello.sh</code> runs like any other program. Every other line that starts with <code>#</code> is a comment, for people.</p>
<p><span class="kind">Writing one.</span> <code>nano name.sh</code> opens an editor in the terminal: type the lines, save with Ctrl+S and leave with Ctrl+X. Then <code>chmod +x name.sh</code> once, and <code>./name.sh</code> as often as you like.</p></div>`,
        { check: 'You wrote <code>tidy.sh</code> with <code>#!/bin/bash</code> on its first line, and <code>./tidy.sh</code> says "Permission denied". What fixes it?', skill: 'scripts', options: ['<code>chmod +x tidy.sh</code>, so the file may run as a program', 'Delete the <code>#!/bin/bash</code> line', '<code>sudo ./tidy.sh</code>, to run it as the administrator', 'Rename it to <code>tidy</code>: scripts cannot end in <code>.sh</code>'], answer: 0, why: 'A file runs as a program only when it has the execute permission. <code>chmod +x</code> gives it once and for all. (<code>bash tidy.sh</code> also works without it, because then <code>bash</code> is the program and the script is only a file it reads.)', wrong: [null, 'The <code>#!</code> line is what tells the system to use <code>bash</code>; without it things get worse, not better.', 'The problem is not who you are but what the file is allowed to be. Running things as the administrator to get past an error is a habit that ends badly.', 'The name does not matter to the shell; <code>.sh</code> is only a reminder for people.'] },
        `<h2>Variables and arguments</h2>
<p>A script needs to remember things: a name, a count, a file to work on. The shell keeps them in <em>variables</em>.</p>
<div class="stmt"><p><span class="kind">Setting and using.</span> <code>name="Ada"</code> sets a variable, with <b>no spaces</b> around the <code>=</code>. <code>$name</code> uses it: the shell replaces it with the value before the command runs. Put it in double quotes, <code>"$name"</code>, so that a value with spaces stays one word.</p>
<p><span class="kind">A command's output as a value.</span> <code>$(command)</code> runs the command and puts its output in its place: <code>count=$(ls | wc -l)</code>.</p>
<p><span class="kind">Arguments.</span> Inside a script, <code>$1</code> is the first word after the script's name, <code>$2</code> the second, and <code>$#</code> how many there are, just like <code>sys.argv</code> in lesson 6.</p></div>`,
        { play: `name="Ada"
echo "Hello, $name"
name = "Grace"
lines=$(cat notes.txt | wc -l)
echo "notes.txt has $lines lines"
cat greet.sh
bash greet.sh Grace Hopper`, setup: 'lesson8', expectError: true, caption: 'A variable set and used; the same line with spaces, which fails; a variable holding a command\'s output; and a script that uses its arguments.' },
        `<details class="reveal"><summary>Guess first: what does <code>name = "Grace"</code> do, and what does <code>bash greet.sh Grace Hopper</code> print?</summary><p>With spaces, the shell reads <code>name</code> as a command with two arguments, <code>=</code> and <code>Grace</code>, and says <code>name: command not found</code>; the variable keeps <code>Ada</code>. The script prints <code>Hello, Grace!</code> (only <code>$1</code> is used) and <code>You gave me 2 words.</code> (<code>$#</code> counts both).</p></details>`,
        { check: 'Which line stores the number of <code>.txt</code> files in the variable <code>n</code>?', skill: 'variables', options: ['<code>n = $(ls *.txt | wc -l)</code>', '<code>n=$(ls *.txt | wc -l)</code>', '<code>n=ls *.txt | wc -l</code>', '<code>$n=$(ls *.txt | wc -l)</code>'], answer: 1, why: 'No spaces around <code>=</code>, and <code>$( )</code> around the command whose output becomes the value. Then <code>echo "$n files"</code> uses it.', wrong: ['The spaces make the shell look for a command called <code>n</code>: "n: command not found".', null, 'Without <code>$( )</code> no output is captured: the shell treats <code>n=ls</code> as a setting for one command, tries to run the first <code>.txt</code> file\'s name as that command, and fails.', 'The <code>$</code> is for using a variable, not for setting it. The shell would replace <code>$n</code> with its old value first.'] },
        `<h2>Repeating with for</h2>
<p>A loop does the same thing for each item of a list. In a script the list is very often a wildcard, so the loop runs once for each file that matches.</p>
<div class="stmt"><p><span class="kind">for … in … do … done.</span> <code>for f in *.txt; do echo "$f"; done</code> sets <code>f</code> to each name in turn and runs the commands between <code>do</code> and <code>done</code>. In a file, each part usually gets a line of its own, and the body is indented.</p></div>`,
        { play: `for n in 1 2 3; do echo "round $n"; done
cat count.sh
bash count.sh`, setup: 'lesson8', caption: 'A loop typed on one line, then a script that loops over every text file and counts its lines. <code>wc -l &lt; "$f"</code> gives the bare number, as in lesson 4.' },
        `<details class="reveal"><summary>Guess first: how many lines will <code>bash count.sh</code> print, and in what order?</summary><p>Three, one for each <code>.txt</code> file, in the order the wildcard gives them, alphabetical: <code>notes.txt has 3 lines</code>, <code>shopping.txt has 4 lines</code>, <code>todo.txt has 2 lines</code>. Add a fourth text file and the script handles it with no change at all: that is the point of a loop.</p></details>`,
        `<h2>Deciding with if</h2>
<p>The <code>if</code> of the shell runs a command and looks at its exit status (lesson 6): 0 means yes. Often the command is <code>[</code>, also called <code>test</code>, whose only job is to check something and answer with a status.</p>
<div class="stmt"><p><span class="kind">if … then … else … fi.</span> <code>if [ -f "$1" ]; then echo found; else echo missing; fi</code>. Spaces inside the brackets are required: <code>[</code> is a command, and its last argument must be <code>]</code>.</p>
<p><span class="kind">What [ can check.</span> <code>-f file</code> (a file exists), <code>-d dir</code> (a directory), <code>-e name</code> (anything); <code>"$a" = "$b"</code> and <code>!=</code> for text; <code>-eq -ne -lt -le -gt -ge</code> for numbers. Any command works in an <code>if</code>: <code>if grep -q ERROR server.log</code> asks grep quietly (<code>-q</code>) and uses its status.</p>
<p><span class="kind">exit.</span> <code>exit 1</code> ends a script with status 1, so whoever ran it knows it failed.</p></div>`,
        { play: `cat check.sh
bash check.sh notes.txt
bash check.sh nope.txt
echo $?
if grep -q ERROR server.log; then echo "look at the log"; fi`, setup: 'lesson8', expectError: true, caption: 'A script that checks for the file named by its argument, and an <code>if</code> typed at the prompt around a quiet <code>grep</code>.' },
        `<details class="reveal"><summary>Guess first: what does <code>bash check.sh nope.txt</code> print, and what is <code>$?</code> after it?</summary><p><code>no file called nope.txt</code>, and then <code>1</code>: the test failed, so the <code>else</code> part ran, and it ended with <code>exit 1</code>. With <code>notes.txt</code> the script printed <code>notes.txt is here</code> and ended with 0.</p></details>`,
        { check: 'What is wrong with <code>if [$count -gt 10]; then echo many; fi</code>?', skill: 'decisions', options: ['Nothing', '<code>[</code> is a command: it needs spaces around it and before <code>]</code>, as in <code>[ $count -gt 10 ]</code>', '<code>-gt</code> should be <code>&gt;</code>', 'An <code>if</code> must end with <code>end</code>'], answer: 1, why: 'Without the spaces the shell sees one word, <code>[5</code> (if count is 5), and looks for a command of that name: "[5: command not found". Inside <code>[ ]</code>, <code>&gt;</code> would be a redirection into a file called <code>10</code>, so numbers use <code>-gt</code>.', wrong: ['Try it: the shell answers <code>[5: command not found</code>, because without spaces <code>[</code> is glued to the number.', null, 'Inside <code>[ ]</code>, <code>&gt;</code> would redirect the output into a file named <code>10</code>. <code>-gt</code> is the number comparison.', 'Bourne\'s rule: <code>if</code> ends with <code>fi</code>.'] },
        { ex: { id: 'sh-8-1', kind: 'shell', skill: ['scripts', 'loops'], title: 'A backup script', setup: 'lesson8',
          prompt: '<p>Write a script <code>backup.sh</code> in your home directory that makes a directory called <code>backup</code> (if it is not there yet), then goes through every <code>.txt</code> file with a <code>for</code> loop, copies it into <code>backup</code> and prints <code>saved</code> and its name. Start it with <code>#!/bin/bash</code>, make it executable, and run it with <code>./backup.sh</code>. The check runs your script itself, from an empty start, and then lists <code>backup</code>:</p><pre class="code"><code>saved notes.txt\nsaved shopping.txt\nsaved todo.txt\nnotes.txt\nshopping.txt\ntodo.txt</code></pre>',
          tests: [{ contains: 'backup.sh', text: '#!/bin/bash', name: 'backup.sh starts with #!/bin/bash' }, { exec: 'backup.sh' }, { cmd: 'rm -rf backup; ./backup.sh; ls backup', expect: 'saved notes.txt\nsaved shopping.txt\nsaved todo.txt\nnotes.txt\nshopping.txt\ntodo.txt', name: 'running ./backup.sh saves each text file and says so' }, { cmd: './backup.sh > /dev/null && echo "a second run works too"', expect: 'a second run works too', name: 'running it a second time works too' }],
          hints: ['<code>nano backup.sh</code>. The lines: <code>#!/bin/bash</code>, <code>mkdir -p backup</code>, then a loop like <code>count.sh</code>\'s: <code>for f in *.txt</code>, <code>do</code>, two commands, <code>done</code>. Save with Ctrl+S, leave with Ctrl+X.', 'Inside the loop: <code>cp "$f" backup/</code> and <code>echo "saved $f"</code>. <code>mkdir -p</code> does not complain when the directory is already there, so the script can run twice. Then <code>chmod +x backup.sh</code> and <code>./backup.sh</code>.'],
          failTip: 'The check deletes <code>backup</code> and runs <code>./backup.sh</code> itself, so it is your script that must make the directory, not a command you typed. Use <code>mkdir -p</code>: a plain <code>mkdir backup</code> fails on the second run. Each <code>saved</code> line must be printed inside the loop, one per file. And without <code>chmod +x</code>, <code>./backup.sh</code> is "Permission denied".',
          solution: "echo '#!/bin/bash' > backup.sh\necho 'mkdir -p backup' >> backup.sh\necho 'for f in *.txt' >> backup.sh\necho 'do' >> backup.sh\necho '    cp \"$f\" backup/' >> backup.sh\necho '    echo \"saved $f\"' >> backup.sh\necho 'done' >> backup.sh\nchmod +x backup.sh\n./backup.sh\nls backup",
          followup: 'Make the script end by printing how many files backup holds, using $(ls backup | wc -l). Then let it take the directory to save into as its argument, $1, with backup as what it uses when no argument is given.' } },
        { ex: { id: 'sh-8-2', kind: 'shell', skill: ['decisions', 'variables'], title: 'How many errors?', setup: 'lesson8',
          prompt: '<p>Write <code>errors.sh</code>, a script that takes the name of a log file as its argument. If the file exists, it prints the name, a colon, and how many lines of it contain <code>ERROR</code>. If it does not exist, it prints <code>no such log:</code> and the name, and ends with status 1. Make it executable. The check runs:</p><pre class="code"><code>$ ./errors.sh server.log\nserver.log: 3 errors\n$ ./errors.sh quiet.log\nquiet.log: 0 errors\n$ ./errors.sh nope.log\nno such log: nope.log</code></pre><p>and then looks at the status of the last one.</p>',
          tests: [{ exec: 'errors.sh' }, { cmd: './errors.sh server.log', expect: 'server.log: 3 errors' }, { cmd: './errors.sh quiet.log', expect: 'quiet.log: 0 errors' }, { cmd: './errors.sh nope.log; echo "status $?"', expect: 'no such log: nope.log\nstatus 1' }],
          hints: ['Start from <code>check.sh</code>: <code>cp check.sh errors.sh</code>, then <code>nano errors.sh</code>. The <code>if [ -f "$1" ]</code> line is already right.', 'In the <code>then</code> part: <code>echo "$1: $(grep -c ERROR "$1") errors"</code>. In the <code>else</code> part: <code>echo "no such log: $1"</code> and <code>exit 1</code>. Finish with <code>fi</code>, then <code>chmod +x errors.sh</code>.'],
          failTip: 'Compare your output with the expected lines letter by letter: a colon right after the name, then a space, the number, and the word <code>errors</code>. <code>grep -c</code> gives a bare number; <code>wc -l</code> counts every line, not only the ERROR ones. The missing-file case needs <code>exit 1</code>, or its status is 0.',
          solution: "echo '#!/bin/bash' > errors.sh\necho 'if [ -f \"$1\" ]' >> errors.sh\necho 'then' >> errors.sh\necho '    echo \"$1: $(grep -c ERROR \"$1\") errors\"' >> errors.sh\necho 'else' >> errors.sh\necho '    echo \"no such log: $1\"' >> errors.sh\necho '    exit 1' >> errors.sh\necho 'fi' >> errors.sh\nchmod +x errors.sh\n./errors.sh server.log",
          followup: 'Let errors.sh take any number of logs: loop over "$@" (all the arguments) and print one line for each. Then make it print "1 error" instead of "1 errors" when there is exactly one.' } },
        `<div class="recap"><h3>In this lesson</h3>
<p><b>How does a list of commands become a program?</b> Save it in a file with <code>#!/bin/bash</code> on top and make it executable. Variables let it remember, <code>for</code> lets it repeat, and <code>if</code>, reading exit statuses, lets it decide: the three things Bourne's shell added in 1979.</p><ul>
<li>A <b>script</b> is a file of commands. <code>bash file.sh</code> runs it; with <code>#!/bin/bash</code> first and <code>chmod +x</code>, so does <code>./file.sh</code>.</li>
<li><b>Variables:</b> <code>name="Ada"</code> with no spaces, used as <code>"$name"</code>. <code>$(command)</code> is a command's output; <code>$1</code>, <code>$2</code>, <code>$#</code> are a script's arguments.</li>
<li><b>Loops:</b> <code>for f in *.txt; do …; done</code> runs the body once for each name.</li>
<li><b>Decisions:</b> <code>if [ -f "$1" ]; then …; else …; fi</code>, with spaces inside the brackets; <code>-f -d -e</code>, <code>= !=</code>, <code>-eq -lt -gt</code>; any command's status works, like <code>grep -q</code>. <code>exit 1</code> reports a failure.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, checkpoint: true, standards: ['3A-AP-13', '3A-CS-02', '3B-CS-01'],
      title: 'Checkpoint two', summary: 'No new commands: mixed questions on running programs, the Windows shells and scripts, then a choice of command line and a script that runs a program over a whole folder. Which one fits?',
      blocks: [
        `<p>This lesson teaches nothing new. The last three lessons are full of pairs that look alike and do different things: <code>&lt;</code> and an argument, <code>&amp;&amp;</code> and <code>;</code>, <code>bash s.sh</code> and <code>./s.sh</code>, <code>[ -f ]</code> and <code>[ -d ]</code>, <code>dir</code> and <code>Get-ChildItem</code>. Telling them apart only becomes a skill when the questions are mixed. Answer each before you look back; if you are not sure, try it in a terminal from an earlier lesson. Every question comes back on the Review page after a day.</p>
<p>Ready? Here is the first: when a program reads with <code>input()</code>, does a file name typed after it reach that <code>input()</code>?</p>
<h2>Mixed questions</h2>`,
        { check: '<code>stats.py</code> reads numbers with <code>input()</code>. Which line makes <code>report.txt</code> hold what it prints when it reads <code>marks.txt</code>?', skill: 'program-io', options: ['<code>python stats.py marks.txt &gt; report.txt</code>', '<code>python stats.py &lt; marks.txt &gt; report.txt</code>', '<code>python stats.py &gt; marks.txt &lt; report.txt</code>', '<code>python stats.py | report.txt</code>'], answer: 1, wrong: ['That gives the file\'s <em>name</em> as an argument, in <code>sys.argv[1]</code>. <code>input()</code> still reads the keyboard, so the program waits for you.', null, 'The arrows are the wrong way round: <code>&gt; marks.txt</code> empties the marks before the program starts, and <code>report.txt</code> is read as the input.', 'A pipe joins a program to another <em>program</em>. The shell would look for a command called <code>report.txt</code>.'], why: '<code>&lt;</code> makes a file the program\'s standard input, which is what <code>input()</code> reads; <code>&gt;</code> sends its standard output, what <code>print</code> writes, into a file.' },
        { check: '<code>greet.py</code> prints <code>"Hello, " + sys.argv[1] + "!"</code>. What does <code>python greet.py "Grace Hopper"</code> print?', skill: 'run-programs', options: ['<code>Hello, Grace!</code>', '<code>Hello, Grace Hopper!</code>', '<code>Hello, "Grace Hopper"!</code>', 'An error: there is no <code>sys.argv[2]</code>'], answer: 1, wrong: ['Without the quotes it would be: the shell would split the name into two arguments. The quotes keep it as one word.', null, 'The shell removes the quotes after using them to group the words; the program never sees them.', 'The program only asks for <code>sys.argv[1]</code>, which is the whole quoted name.'], why: 'Quotes make one argument out of words with spaces between them, and the shell takes the quotes away before the program starts.' },
        { check: 'You have just written <code>Hello.java</code>. Which two commands run it?', skill: 'compile', options: ['<code>javac Hello</code>, then <code>java Hello</code>', '<code>javac Hello.java</code>, then <code>java Hello</code>', '<code>javac Hello.java</code>, then <code>./Hello.class</code>', '<code>java Hello.class</code>'], answer: 1, wrong: ['<code>javac</code> wants the source file, with <code>.java</code>; given a bare class name it refuses.', null, 'A <code>.class</code> file is not a program the shell can start; <code>java</code> runs it, given the class name.', '<code>java</code> takes the class name, without <code>.class</code>, and the file has not been compiled yet anyway.'], why: '<code>javac</code> compiles the file (<code>Hello.java</code>) and writes <code>Hello.class</code>; <code>java</code> runs a class, by its name (<code>Hello</code>).' },
        { check: '<code>g++ game.cpp -o game &amp;&amp; ./game</code>, and the compiler finds an error. What happens?', skill: 'exit-status', options: ['The error is shown and <code>./game</code> does not run', 'The error is shown and then the last working <code>game</code> runs', '<code>./game</code> runs and shows the error itself', 'Nothing at all is shown'], answer: 0, wrong: [null, 'That is what <code>;</code> would do. <code>&amp;&amp;</code> runs the right side only after a status of 0, and a failed compile is not 0.', 'The compiler reports the error and stops; nothing of yours runs.', 'The compiler always says what went wrong, with a line number.'], why: 'A failed compile ends with a status that is not 0, so <code>&amp;&amp;</code> skips <code>./game</code>. That is why build lines are joined with <code>&amp;&amp;</code>: you never run an old program by mistake.' },
        { check: 'In the Command Prompt you type <code>cd</code> with nothing after it, hoping to go home. What happens?', skill: 'windows-cmd', options: ['You go to <code>C:\\Users\\student</code>, as in bash', 'It prints the directory you are in, and you stay there', 'An error: <code>cd</code> needs a folder', 'You go to <code>C:\\</code>, the top of the drive'], answer: 1, wrong: ['That is what a bare <code>cd</code> does in bash. In the Command Prompt it is a question, not a move.', null, 'It is allowed: alone, it answers "where am I?", like <code>pwd</code>.', '<code>cd \\</code> goes to the top of the drive; a bare <code>cd</code> moves nowhere.'], why: 'In the Command Prompt a bare <code>cd</code> prints the current directory, the job of <code>pwd</code> in bash. To go home there you name it: <code>cd C:\\Users\\student</code>, or <code>cd %USERPROFILE%</code>.' },
        { check: 'In PowerShell, what does <code>Get-ChildItem | Sort-Object Length -Descending | Select-Object -First 1</code> show?', skill: 'powershell', options: ['The biggest file in the directory', 'The file whose name is longest', 'The first line of every file', 'An error: <code>Length</code> is not a column of the listing'], answer: 0, wrong: [null, '<code>Length</code> is a file object\'s size in bytes, not the length of its name.', '<code>Get-ChildItem</code> sends file objects, not the lines inside the files; <code>Get-Content</code> reads lines.', 'The pipe carries objects, and <code>Length</code> is one of their properties. There are no columns until the end, when the result is printed.'], why: 'The file objects are sorted by their <code>Length</code> property, biggest first, and <code>-First 1</code> keeps one object: the biggest file, printed as a one-row table.' },
        { check: 'You wrote <code>tidy.sh</code> but have not used <code>chmod</code>. Which command runs it anyway?', skill: 'scripts', options: ['<code>./tidy.sh</code>', '<code>bash tidy.sh</code>', '<code>tidy.sh</code>', '<code>cat tidy.sh</code>'], answer: 1, wrong: ['Running the file as a program needs the execute permission: "Permission denied".', null, 'A bare name is looked up in <code>PATH</code>, not here: "command not found".', '<code>cat</code> prints the script\'s text; it runs nothing.'], why: '<code>bash tidy.sh</code> runs <code>bash</code>, which only needs to <em>read</em> the file. <code>./tidy.sh</code> asks to run the file itself, which needs <code>chmod +x</code> first.' },
        { check: 'A script contains <code>cd /tmp</code>. You are in your home directory and run it with <code>./go.sh</code>. Where are you afterwards?', skill: 'scripts', options: ['In <code>/tmp</code>', 'Still in your home directory', 'In the directory where <code>go.sh</code> lives', 'Nowhere: the shell closes'], answer: 1, wrong: ['The script\'s <code>cd</code> happened in the script\'s own shell, which ended with it.', null, 'The script started in your directory and then moved itself to <code>/tmp</code>; neither move reaches you.', 'Only the script\'s own shell ends; yours carries on.'], why: 'A script runs in a new shell of its own: its <code>cd</code> and its variables end with it. (<code>source go.sh</code> runs it in your shell instead, and then the <code>cd</code> would stay.)' },
        { check: 'Inside a script started as <code>./greet.sh Ada Grace</code>, what are <code>$#</code> and <code>$2</code>?', skill: 'variables', options: ['1 and <code>Ada</code>', '2 and <code>Grace</code>', '3 and <code>Grace</code>', '2 and <code>Ada</code>'], answer: 1, wrong: ['<code>$#</code> counts every argument after the script\'s name: there are two.', null, 'The script\'s own name is <code>$0</code>, and it is not counted.', '<code>$1</code> is <code>Ada</code>; <code>$2</code> is the second word.'], why: '<code>$1</code>, <code>$2</code>… are the words after the script\'s name and <code>$#</code> is how many there are, like <code>sys.argv[1:]</code> in Python.' },
        { check: 'A folder holds <code>a.txt</code>, <code>b.txt</code> and <code>c.py</code>. How many times does the body of <code>for f in *.txt; do echo "$f"; done</code> run?', skill: 'loops', options: ['Once, with <code>f</code> set to <code>a.txt b.txt</code>', 'Twice', 'Three times', 'Never: <code>*.txt</code> is not a list'], answer: 1, wrong: ['The shell expands the pattern into separate words, and the loop takes them one at a time.', null, '<code>c.py</code> does not match <code>*.txt</code>.', 'The wildcard <em>becomes</em> a list, <code>a.txt b.txt</code>, before the loop starts.'], why: 'The shell expands <code>*.txt</code> to <code>a.txt b.txt</code>, and <code>for</code> runs its body once for each word: <code>f</code> is <code>a.txt</code>, then <code>b.txt</code>.' },
        { check: 'Which test is true only when <code>notes.txt</code> exists and is a file?', skill: 'decisions', options: ['<code>[ -f notes.txt ]</code>', '<code>[-f notes.txt]</code>', '<code>[ -d notes.txt ]</code>', '<code>[ notes.txt ]</code>'], answer: 0, wrong: [null, 'Without the spaces, <code>[-f</code> is one word, and there is no command of that name.', '<code>-d</code> asks about a directory.', 'With only a word inside, <code>[</code> asks whether that text is empty. <code>notes.txt</code> is not empty, so it is true even if no such file exists.'], why: '<code>-f</code> asks "is there a file with this name?", <code>-d</code> asks about a directory and <code>-e</code> about anything. <code>[</code> is a command, so spaces separate it from what follows.' },
        `<p>Two jobs to finish the unit. The first is a choice of command line; the second is a script that puts the three lessons together, on files of its own.</p>`,
        { ex: { id: 'sh-11-1', kind: 'choice', skill: 'exit-status', title: 'Which line fits?',
          prompt: '<p>You changed <code>Main.java</code>. In one line, you want to compile it and, <em>only if that worked</em>, run it with <code>input.txt</code> as its input and its output saved in <code>out.txt</code>. Which line does exactly that?</p>',
          options: [
            { text: '<code>javac Main.java; java Main &lt; input.txt &gt; out.txt</code>', why: '<code>;</code> runs the second command whatever happened to the first, so after a failed compile the old <code>Main.class</code> runs.' },
            { text: '<code>javac Main.java &amp;&amp; java Main &lt; input.txt &gt; out.txt</code>', ok: true },
            { text: '<code>javac Main.java || java Main &lt; input.txt &gt; out.txt</code>', why: '<code>||</code> runs the program only when the compile <em>failed</em>: the opposite.' },
            { text: '<code>javac Main.java &amp;&amp; java Main &gt; input.txt &lt; out.txt</code>', why: 'The arrows are reversed: <code>&gt; input.txt</code> empties the input file, and the program reads <code>out.txt</code>.' }
          ],
          hints: ['Two questions: which joiner runs the second command only after a success, and which arrow points a file <em>into</em> a program?', '<code>&amp;&amp;</code> waits for a status of 0. <code>&lt;</code> feeds a file in; <code>&gt;</code> catches what comes out.'],
          solution: '<p><code>javac Main.java &amp;&amp; java Main &lt; input.txt &gt; out.txt</code>. <code>&amp;&amp;</code> runs <code>java</code> only when <code>javac</code> ended with 0, <code>&lt; input.txt</code> becomes what <code>Scanner</code> reads, and <code>&gt; out.txt</code> catches what it prints.</p>',
          failTip: 'Read each joiner as a word: <code>;</code> is "then", <code>&amp;&amp;</code> is "and if that worked", <code>||</code> is "or if that failed".',
          followup: 'Write the same line for a C++ program, main.cpp, with g++ and -o, and then a line that prints "build failed" when the compile does not work.' } },
        { ex: { id: 'sh-11-2', kind: 'shell', skill: ['loops', 'program-io', 'scripts'], title: 'Reports for every class', setup: 'checkpoint2',
          prompt: '<p>The <code>classes</code> directory holds one file of marks for each class (<code>9a.txt</code>, <code>9b.txt</code>, <code>9c.txt</code>), in the shape <code>grades.py</code> reads: a count, then the marks. Write a script <code>all.sh</code> that makes a directory <code>reports</code> in your home directory and, for each file in <code>classes</code>, runs <code>grades.py</code> with that file as its input and saves what it prints in <code>reports</code> under the same name. Make it executable and run it. <code>cat reports/9b.txt</code> should then show:</p><pre class="code"><code>marks: 4\nhighest: 80\nlowest: 55\ntotal: 274</code></pre>',
          tests: [{ exec: 'all.sh' }, { content: 'reports/9a.txt', expect: 'marks: 3\nhighest: 92\nlowest: 70\ntotal: 247' }, { content: 'reports/9b.txt', expect: 'marks: 4\nhighest: 80\nlowest: 55\ntotal: 274' }, { content: 'reports/9c.txt', expect: 'marks: 2\nhighest: 99\nlowest: 88\ntotal: 187' },
            { cmd: 'rm -rf reports; printf "1\\n50\\n" > classes/9d.txt; ./all.sh; ls reports; cat reports/9d.txt; rm classes/9d.txt', expect: '9a.txt\n9b.txt\n9c.txt\n9d.txt\nmarks: 1\nhighest: 50\nlowest: 50\ntotal: 50', name: './all.sh also handles a class it has never seen' }],
          hints: ['Three parts: <code>mkdir -p reports</code>; a <code>for</code> loop over the class files; inside it, one <code>python</code> line with <code>&lt;</code> and <code>&gt;</code>. Try the <code>python</code> line by hand for one class first.', 'Moving into <code>classes</code> keeps the names short: <code>cd classes || exit 1</code>, then <code>for f in *.txt</code>, and in the loop <code>python ../grades.py &lt; "$f" &gt; "../reports/$f"</code>. Then <code>chmod +x all.sh</code> and <code>./all.sh</code>.'],
          failTip: 'The check deletes <code>reports</code>, adds a fourth class and runs <code>./all.sh</code> itself, so the script must make <code>reports</code> and must loop over whatever files are there, not name the three. If the reports are empty or missing, try the <code>python</code> line by hand and check each path: after a <code>cd classes</code>, the program is <code>../grades.py</code> and the reports go to <code>../reports</code>.',
          solution: "echo '#!/bin/bash' > all.sh\necho 'mkdir -p reports' >> all.sh\necho 'cd classes || exit 1' >> all.sh\necho 'for f in *.txt' >> all.sh\necho 'do' >> all.sh\necho '    python ../grades.py < \"$f\" > \"../reports/$f\"' >> all.sh\necho 'done' >> all.sh\nchmod +x all.sh\n./all.sh\ncat reports/9b.txt",
          followup: 'Make all.sh print one summary line per class as well, such as "9a: highest 92", by piping grades.py\'s output through grep and cut. Then make it skip a class file that is empty, with an if and [ -s "$f" ] (true when the file is not empty).' } },
        `<div class="recap"><h3>Unit two in a few lines</h3>
<p><b>Which one fits?</b> Ask what goes where: a word for the program (an argument) or a file for it to read (<code>&lt;</code>); the next command always (<code>;</code>) or only after a success (<code>&amp;&amp;</code>); a script that may change your shell (<code>source</code>) or one in a shell of its own (<code>./</code>).</p><ul>
<li>Programs: <code>python f.py</code>; <code>javac Name.java</code> then <code>java Name</code>; <code>g++ f.cpp -o f</code> then <code>./f</code>. Arguments are <code>sys.argv[1]</code> and on; quotes keep spaces in one.</li>
<li><code>&lt;</code>, <code>&gt;</code> and <code>|</code> connect your programs as they do any command. The exit status (0 for success) drives <code>&amp;&amp;</code>, <code>||</code> and <code>if</code>.</li>
<li>Windows: the Command Prompt (<code>dir</code>, <code>type</code>, <code>copy</code>, <code>del</code>, backslashes, <code>/</code> options; a bare <code>cd</code> asks where you are) and PowerShell (Verb-Noun cmdlets, aliases, pipes of objects).</li>
<li>Scripts: <code>#!/bin/bash</code> and <code>chmod +x</code>; <code>name="value"</code> with no spaces; <code>$1</code> and <code>$#</code>; <code>for f in *.txt; do …; done</code>; <code>if [ -f "$f" ]; then …; fi</code>. A script runs in a shell of its own.</li>
<li>Next: a project, tidying a messy folder with a script that looks before it moves.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standard: 1, standards: ['3A-AP-13', '3A-AP-17', '3B-AP-21'],
      title: 'Project: tidy a messy folder', summary: 'A script that sorts a folder of downloads into images, documents, music and the rest: case to choose by pattern, a dry run that moves nothing, a test on a copy, and a rule that never replaces a file.',
      blocks: [
        `<p>In 1998, partway through the making of <em>Toy Story 2</em>, someone at Pixar ran a command on the computer that held the film's files. It was a remove command like the ones in lesson 2: <code>/bin/rm -r -f *</code>. Oren Jacob, one of the film's technical directors, was looking at a directory of character files when they began to vanish from his screen. By the time the machine was stopped, most of the film was gone, and the backups, it turned out, had not been working. The film was saved by luck. Galyn Susman, its supervising technical director, had been working from home after the birth of her baby, and she had a copy of the whole film on a computer there. They wrapped that computer in blankets and drove it to the studio.</p>
<p>Pixar's lesson was about backups. This project's lesson is about the moment before you press Enter. A script that moves files does in a second what would take you an hour by hand, and if it is wrong, it is wrong a hundred times before you can blink. You will write a script that tidies a folder of downloads. So how do you make sure a script does exactly what you meant before it touches anything?</p>
<h2>The mess</h2>
<p>The project's home has a <code>downloads</code> directory of the kind everybody has: pictures, documents, music and installers in one heap, with spaces in some of the names. Look before you plan.</p>`,
        { play: `ls downloads
ls downloads | wc -l
ls -l "downloads/holiday photo.jpg"
ls -l downloads/holiday photo.jpg`, setup: 'project', expectError: true, caption: 'The heap; how many things are in it; and one file whose name has a space, named with quotes and then without them.' },
        `<details class="reveal"><summary>Guess first: why are some names shown in quotes, and why does the last line fail?</summary><p>At a terminal, <code>ls</code> puts quotes around a name that the shell would not read as one word, such as <code>'holiday photo.jpg'</code>, so that you can copy it straight into a command. Without quotes, the shell splits <code>downloads/holiday photo.jpg</code> at the space into two names, and neither exists: <code>ls</code> says "No such file or directory" twice. This is why a script writes <code>"$f"</code>, in double quotes, every time it uses a file's name. (The 15 things are 14 files and one directory, <code>old projects</code>.)</p></details>`,
        `<h2>Part 1: one name, one decision</h2>
<p>For each file the script must decide where it goes, and that depends on how its name ends. A chain of <code>if</code>s would work, but the shell has a statement made for choosing by pattern.</p>
<div class="stmt"><p><span class="kind">case … in … esac.</span> <code>case "$f" in *.jpg|*.png) dest=images ;; *.mp3) dest=music ;; *) dest=other ;; esac</code> compares the name with each pattern in turn, the same patterns as wildcards, with <code>|</code> meaning "or". The first that matches runs its commands, up to <code>;;</code>, and the rest are skipped. <code>*)</code> matches anything, so it goes last, as "everything else". The statement ends with <code>case</code> backwards, as Bourne liked.</p></div>`,
        { play: `f="holiday photo.jpg"
case "$f" in *.jpg|*.png) echo images ;; *.mp3) echo music ;; *) echo other ;; esac
f=song.mp3
case "$f" in *.jpg|*.png) echo images ;; *.mp3) echo music ;; *) echo other ;; esac
f=photo.JPG
case "$f" in *.jpg|*.png) echo images ;; *.mp3) echo music ;; *) echo other ;; esac`, setup: 'project', caption: 'The same <code>case</code> three times, for three names. Change <code>f</code> and press the up arrow twice to run the <code>case</code> line again.' },
        `<details class="reveal"><summary>Guess first: what will the three <code>case</code> lines print?</summary><p><code>images</code>, <code>music</code> and then <code>other</code>. Patterns care about capitals, as file names do: <code>photo.JPG</code> does not end in <code>.jpg</code>, so it falls through to <code>*)</code>. A careful script would add <code>*.JPG</code> to the pattern.</p></details>`,
        { check: 'Which <code>case</code> sends <code>notes.txt</code> to <code>documents</code> and everything else to <code>other</code>?', skill: 'case', options: ['<code>case "$f" in *) dest=other ;; *.txt) dest=documents ;; esac</code>', '<code>case "$f" in *.txt) dest=documents ;; *) dest=other ;; esac</code>', '<code>case "$f" in .txt) dest=documents ;; *) dest=other ;; esac</code>', '<code>case "$f" in *.txt) dest=documents; *) dest=other; esac</code>'], answer: 1, why: 'The first pattern that matches wins, so the catch-all <code>*)</code> must come last. <code>*.txt</code> is a wildcard pattern: anything, then <code>.txt</code>. Each choice ends with <code>;;</code>.', wrong: ['<code>*)</code> matches every name, and the first match wins, so every file, <code>notes.txt</code> included, goes to <code>other</code>.', null, 'Without the star the pattern matches only a name that is exactly <code>.txt</code>.', 'A single <code>;</code> separates commands inside one choice. The choice itself must end with <code>;;</code>, or the shell reports a syntax error.'] },
        `<h2>Part 2: a dry run</h2>
<p>Now the loop. But before writing the version that moves things, write the version that only <em>says</em> what it would move. Programmers call that a <em>dry run</em>, after fire brigades that practise without water. <code>plan.sh</code> is one: it loops over the folder named by its argument, makes the decision for each file, and prints it.</p>
<div class="stmt"><p><span class="kind">Look before you move.</span> First a dry run: the same script with <code>echo</code> where the real one acts. Then the real script on a copy: <code>cp -r downloads /tmp/test</code> and <code>./tidy.sh /tmp/test</code>. Only when both look right, the real folder. And a script that works on whatever folder it is given, <code>"$1"</code>, can be tested on a copy without changing a line.</p>
<p><span class="kind">Only files.</span> <code>for f in *</code> lists directories too. <code>if [ -f "$f" ]</code> lets only files through, so <code>old projects</code> is left where it is.</p></div>`,
        { play: `cat plan.sh
./plan.sh downloads
./plan.sh nowhere`, setup: 'project', expectError: true, caption: 'The whole dry-run script, its plan for the downloads, and what happens when the folder does not exist. Nothing is moved: run <code>ls downloads</code> afterwards to make sure.' },
        `<details class="reveal"><summary>Guess first: how many "would move" lines will the plan print, and what does <code>./plan.sh nowhere</code> do?</summary><p>14, one for each file, and none for the directory <code>old projects</code>, which <code>[ -f "$f" ]</code> skips. <code>cd "$1" || exit 1</code> protects the second run: the <code>cd</code> fails ("nowhere: No such file or directory"), so the script stops with status 1 instead of tidying whatever directory it happens to be in. That one line is the difference between a script that fails safely and one that moves your home directory around.</p></details>`,
        { check: 'Your <code>tidy.sh</code> is written and the dry run looked right. What is the safest next step?', skill: 'dry-run', options: ['Run <code>./tidy.sh downloads</code>: the dry run already checked it', '<code>cp -r downloads /tmp/test</code>, then <code>./tidy.sh /tmp/test</code> and look at the result', 'Run it with <code>rm -rf</code> in front, to clear space first', 'Delete <code>plan.sh</code>, so the two cannot be confused'], answer: 1, why: 'The dry run checked the decisions, not the moving: a typo in the <code>mv</code> line or a missing <code>mkdir</code> only shows up when it really runs. A copy lets it really run with nothing at stake, and <code>tree /tmp/test</code> shows exactly what it did.', wrong: ['The dry run printed the plan; it never ran the lines that move. Those can still be wrong.', null, '<code>rm -rf</code> removes, with no undo, exactly what this project is trying to protect.', 'The dry run is worth keeping: it is the quickest way to see what the script would do to a new folder.'] },
        { ex: { id: 'sh-10-1', kind: 'shell', skill: ['dry-run', 'loops'], title: 'Tidy for real', setup: 'project',
          prompt: '<p>Make <code>tidy.sh</code> from <code>plan.sh</code>: the same loop and the same decisions, but instead of printing "would move", it makes the directory if needed, moves the file into it, and prints one line such as <code>cat.jpg -&gt; images</code>. Make it executable, test it on a copy in <code>/tmp</code>, then run <code>./tidy.sh downloads</code>. The check looks at your downloads, and also runs your script on a little folder of its own.</p>',
          tests: [{ exec: 'tidy.sh' }, { exists: 'downloads/images/cat.jpg' }, { exists: 'downloads/images/holiday photo.jpg' }, { exists: 'downloads/documents/reading list.txt' }, { exists: 'downloads/music/song.mp3' }, { exists: 'downloads/other/setup.zip' }, { missing: 'downloads/cat.jpg' }, { dir: 'downloads/old projects', name: 'the directory old projects was left alone' },
            { cmd: 'rm -rf /tmp/t; mkdir -p /tmp/t/keep; touch /tmp/t/a.png "/tmp/t/b c.pdf" /tmp/t/d.wav /tmp/t/e.zip; ./tidy.sh /tmp/t > /dev/null; find /tmp/t | sort', expect: '/tmp/t\n/tmp/t/documents\n/tmp/t/documents/b c.pdf\n/tmp/t/images\n/tmp/t/images/a.png\n/tmp/t/keep\n/tmp/t/music\n/tmp/t/music/d.wav\n/tmp/t/other\n/tmp/t/other/e.zip', name: './tidy.sh tidies a folder it has never seen' }],
          hints: ['<code>cp plan.sh tidy.sh</code>, then <code>nano tidy.sh</code>. Only the <code>echo "would move …"</code> line changes: it becomes three lines.', 'The three lines: <code>mkdir -p "$dest"</code>, <code>mv "$f" "$dest/"</code> and <code>echo "$f -&gt; $dest"</code>. Keep the quotes: <code>holiday photo.jpg</code> needs them. Then <code>chmod +x tidy.sh</code>, <code>cp -r downloads /tmp/test</code>, <code>./tidy.sh /tmp/test</code>, <code>tree /tmp/test</code>.'],
          failTip: 'If <code>holiday photo.jpg</code> or <code>reading list.txt</code> stayed behind, a <code>$f</code> or <code>$dest</code> is missing its double quotes, so the shell split the name at the space. If the check\'s own folder fails, make sure the script works on <code>"$1"</code> (the <code>cd "$1" || exit 1</code> line from <code>plan.sh</code>) rather than on <code>downloads</code> by name.',
          solution: "cp plan.sh tidy.sh\nsed -i 's|echo \"would move $f to $dest/\"|mkdir -p \"$dest\"; mv \"$f\" \"$dest/\"; echo \"$f -> $dest\"|' tidy.sh\nchmod +x tidy.sh\ncp -r downloads /tmp/test\n./tidy.sh /tmp/test\n./tidy.sh downloads\ntree downloads",
          followup: 'Add a fifth kind, code, for .py, .java and .cpp files, and run the dry run again to check it before anything moves. Then make the patterns ignore capitals by adding *.JPG and *.PNG.' } },
        `<h2>Part 3: never replace a file</h2>
<p>There is one more way for a tidy script to destroy something, and it is quieter than <code>rm</code>. Lesson 2 said it: <code>mv</code> replaces a file that is already there, without asking.</p>`,
        { play: `mkdir -p box/images
echo "the old picture" > box/images/cat.jpg
echo "the new picture" > box/cat.jpg
mv box/cat.jpg box/images/
cat box/images/cat.jpg`, setup: 'project', caption: 'Two different files with the same name, and a <code>mv</code> that puts one where the other is.' },
        `<details class="reveal"><summary>Guess first: what does the last <code>cat</code> print?</summary><p><code>the new picture</code>. The old one was replaced, with no message and no undo. Run a tidy script on a folder that was tidied before, with a new <code>cat.jpg</code> in it, and that is exactly what happens.</p></details>`,
        `<div class="stmt"><p><span class="kind">Look first, in the script.</span> <code>if [ -e "$dest/$f" ]</code> asks whether something with that name is already in the destination. If so, the script leaves the file where it is and says so; otherwise it moves it.</p>
<p><span class="kind">Counting.</span> <code>moved=0</code> before the loop, and <code>moved=$((moved + 1))</code> inside it: <code>$(( ))</code> does arithmetic. After the loop, <code>echo "moved $moved, skipped $skipped"</code> reports the totals.</p></div>`,
        { check: '<code>images/cat.jpg</code> already exists. What does <code>if [ -e "images/cat.jpg" ]; then echo "skipped"; else mv cat.jpg images/; fi</code> do?', skill: 'decisions', options: ['Moves <code>cat.jpg</code> into <code>images</code>, replacing the old one', 'Prints <code>skipped</code> and moves nothing', 'Prints an error: <code>-e</code> is only for directories', 'Moves the old <code>images/cat.jpg</code> back out'], answer: 1, why: '<code>-e</code> is true when anything exists at that path, so the <code>then</code> part runs and the <code>else</code> part, the <code>mv</code>, does not. Both pictures survive, and you can rename one by hand.', wrong: ['That is what a bare <code>mv</code> would do. The test is there to stop it: it is true, so the <code>mv</code> in <code>else</code> never runs.', null, '<code>-e</code> works for any kind of thing; <code>-d</code> is the one for directories and <code>-f</code> for files.', 'Nothing moves at all: the <code>then</code> part only prints.'] },
        { ex: { id: 'sh-10-2', kind: 'shell', skill: ['decisions', 'variables'], title: 'Safe and counted', setup: 'project2',
          prompt: '<p>This home has a working <code>tidy.sh</code>, and a <code>downloads</code> folder that was partly tidied before: <code>downloads/images</code> already holds an older <code>cat.jpg</code>. Change <code>tidy.sh</code> so that it never replaces a file: when the destination already has that name, it leaves the file where it is and prints <code>skipped cat.jpg: images/cat.jpg is already there</code>. At the end it prints how many files it moved and skipped. Then run it on <code>downloads</code>. On a folder holding <code>a.jpg</code>, <code>b.pdf</code> and <code>c.mp3</code>, with an <code>a.jpg</code> already in its <code>images</code>, it must print exactly:</p><pre class="code"><code>skipped a.jpg: images/a.jpg is already there\nb.pdf -&gt; documents\nc.mp3 -&gt; music\nmoved 2, skipped 1</code></pre>',
          tests: [{ content: 'downloads/images/cat.jpg', expect: '(an older cat.jpg)', name: 'the older cat.jpg was not replaced' }, { exists: 'downloads/cat.jpg', name: 'the new cat.jpg was left in downloads' }, { exists: 'downloads/images/beach.png' }, { exists: 'downloads/music/song.mp3' },
            { cmd: 'rm -rf /tmp/t; mkdir -p /tmp/t/images; echo old > /tmp/t/images/a.jpg; echo new > /tmp/t/a.jpg; touch /tmp/t/b.pdf /tmp/t/c.mp3; ./tidy.sh /tmp/t; cat /tmp/t/images/a.jpg', expect: 'skipped a.jpg: images/a.jpg is already there\nb.pdf -> documents\nc.mp3 -> music\nmoved 2, skipped 1\nold', name: './tidy.sh on a folder with a clash' }],
          hints: ['Wrap the three moving lines in an <code>if [ -e "$dest/$f" ]</code>: the <code>then</code> part prints the "skipped" line, the <code>else</code> part keeps the three lines you have.', 'Put <code>moved=0</code> and <code>skipped=0</code> before the loop; <code>moved=$((moved + 1))</code> after a move, <code>skipped=$((skipped + 1))</code> after a skip; and after <code>done</code>, <code>echo "moved $moved, skipped $skipped"</code>.'],
          failTip: 'Compare your output with the four expected lines character by character: the "skipped" line names the file, then a colon, then the destination path, <code>images/a.jpg</code>, as seen from inside the folder. If the old file\'s text changed to <code>new</code>, the <code>mv</code> is not inside the <code>else</code>. If the totals are missing, the <code>echo</code> must come after <code>done</code>, not inside the loop.',
          solution: "echo '#!/bin/bash' > tidy.sh\necho 'cd \"$1\" || exit 1' >> tidy.sh\necho 'moved=0' >> tidy.sh\necho 'skipped=0' >> tidy.sh\necho 'for f in *' >> tidy.sh\necho 'do' >> tidy.sh\necho '    if [ -f \"$f\" ]' >> tidy.sh\necho '    then' >> tidy.sh\necho '        case \"$f\" in' >> tidy.sh\necho '            *.jpg|*.png|*.gif) dest=images ;;' >> tidy.sh\necho '            *.pdf|*.docx|*.txt) dest=documents ;;' >> tidy.sh\necho '            *.mp3|*.wav) dest=music ;;' >> tidy.sh\necho '            *) dest=other ;;' >> tidy.sh\necho '        esac' >> tidy.sh\necho '        if [ -e \"$dest/$f\" ]' >> tidy.sh\necho '        then' >> tidy.sh\necho '            echo \"skipped $f: $dest/$f is already there\"' >> tidy.sh\necho '            skipped=$((skipped + 1))' >> tidy.sh\necho '        else' >> tidy.sh\necho '            mkdir -p \"$dest\"' >> tidy.sh\necho '            mv \"$f\" \"$dest/\"' >> tidy.sh\necho '            echo \"$f -> $dest\"' >> tidy.sh\necho '            moved=$((moved + 1))' >> tidy.sh\necho '        fi' >> tidy.sh\necho '    fi' >> tidy.sh\necho 'done' >> tidy.sh\necho 'echo \"moved $moved, skipped $skipped\"' >> tidy.sh\n./tidy.sh downloads",
          followup: 'Instead of skipping, give the newcomer a free name: cat.jpg becomes cat-2.jpg (or cat-3.jpg if that is taken too). ${f%.*} is the name without its extension and ${f##*.} is the extension.' } },
        `<h2>Stretch goals</h2>
<p>So how do you make sure a script does exactly what you meant before it touches anything? You make it show its plan first, a dry run that moves nothing; you run the real thing on a copy, where a mistake costs nothing; you make it stop when something is wrong (<code>cd "$1" || exit 1</code>); and you make it refuse to destroy anything it cannot put back (<code>[ -e ]</code> before <code>mv</code>). Pixar's backups failed silently. A careful script fails loudly, and early.</p>
<p>Now make it yours. Choose your own rules: sort photos into a folder per month, music by artist (the part of a name before " - "), or old files into an <code>archive</code> folder. Add a <code>-n</code> option, so that <code>./tidy.sh -n downloads</code> does a dry run with the same script (look at <code>$1</code>, then use <code>shift</code>). Write each move into a log file, <code>tidy.log</code>, with the time from <code>date</code>, and write <code>untidy.sh</code>, which reads the log and puts everything back. The last one is the hardest and the most useful: a script whose every action can be undone.</p>
<h2>Where to go from here</h2>
<p>You can now find your way around any Unix computer, make and move things, search inside files, join commands into pipelines, run your own programs, read the same ideas in Windows, and write a script that does a chore for you. The terminal in the <a href="#/lab">Code Lab</a> has all of it, with your own programs in its <code>lab</code> folder and a practice <code>git</code> for keeping versions of your work. Next to explore: <code>man bash</code> on a real computer, <code>awk</code> (<code>man awk</code> here) for tables of text, and <code>git</code> for history. And when a command is about to remove or replace things, look first.</p>`
      ]
    }
  ]
});
