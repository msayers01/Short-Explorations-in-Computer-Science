// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// The Command Line: a course on the Unix shell, taught in the practice terminal (src/shell.js, src/terminal.js). Every example is a
// live terminal over the files named by its setup (course.setups below; src/shellgrade.js builds them), and exercises of kind 'shell'
// are graded on what the files look like afterwards and on what was typed, not on the exact commands.
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'shell', code: 'SC 108', short: 'Command line', lang: 'shell', status: 'developing',
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
  howItWorks: `<h3>How to use these pages</h3><p>Each lesson has terminals in it. Press <b>Run</b> on an example and watch the commands go in one at a time; then click in the terminal and type your own. The up arrow brings back a command you typed; <b>Tab</b> finishes a name for you; <b>Reset</b> puts the files back the way the example began. Nothing you type here can touch your real computer.</p><p>Exercises are checked by looking at the files afterwards: what exists, what is where, what is inside. How you got there is up to you. When one passes, a stretch challenge follows.</p>`,
  setups: {
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
    }
  },
  lessons: [
    /* ================================================================== */
    {
      title: 'Where am I?', summary: 'What a shell is, how to read the prompt, the tree of directories, absolute and relative paths, and moving around with cd.',
      blocks: [
        `<p>In the summer of 1969, Ken Thompson's wife took their baby son to California for three weeks to visit family. Thompson, a programmer at Bell Labs in New Jersey, stayed behind with a small computer nobody else wanted, a PDP-7, and a plan. He gave himself one week each for the four pieces of an operating system: the part that manages the machine, an editor, an assembler, and a program whose only job was to read what a person typed and run it. He called that last program the <em>shell</em>. The system it belonged to became Unix.</p>
<p>Fifty years later, the shell is still there. Every Linux computer, every Mac, every Raspberry Pi and every web server has one, and the one most of them use, <code>bash</code>, was written in 1989 by Brian Fox for the GNU project. The ideas have barely changed since Thompson's three weeks: you type a command, the shell runs it, the result appears, and you type the next one.</p>
<h2>The prompt</h2>
<p>A terminal shows a <em>prompt</em>: the shell's way of saying "your turn". The practice terminal's prompt looks like this:</p>
<pre class="code"><code>student@lab:~$</code></pre>
<p>Read it in three pieces. <code>student</code> is your user name. <code>lab</code> is the name of the computer. <code>~</code> is where you are: the squiggle, called a <em>tilde</em>, stands for your <em>home directory</em>, the folder that belongs to you. The <code>$</code> at the end just means "type here". (A directory is what a window-and-mouse computer calls a folder. The two words mean the same thing; the shell says directory.)</p>
<p>Type a command after the prompt and press Enter. The first command to learn asks the shell where you are.</p>`,
        { play: `pwd
ls`, setup: 'lesson1', caption: '<code>pwd</code> is "print working directory": the directory you are in, spelled out in full. <code>ls</code> lists what is in it. Press Run, then click in the terminal and type them yourself.' },
        `<div class="stmt"><p><span class="kind">The working directory.</span> At every moment the shell is <em>in</em> one directory, called the working directory. Commands that name a file without saying where it is look in the working directory. <code>pwd</code> prints it; the prompt shows it after the colon, with <code>~</code> standing for your home.</p></div>
<p>The listing you got was short: a file called <code>README.txt</code> and two directories, <code>garden</code> and <code>letters</code>. The terminal colours directories blue so you can tell them from files. If you want the shell to spell it out, <code>ls -F</code> puts a <code>/</code> after every directory.</p>`,
        { check: 'The prompt says <code>student@lab:~$</code>. Where are you?', options: ['In a directory called <code>student</code>', 'In your home directory', 'On a computer called <code>student</code>', 'Nowhere yet: you have to type <code>cd</code> first'], answer: 1, why: 'The part after the colon is where you are, and <code>~</code> is the shell\'s short name for your home directory. <code>student</code> is your user name and <code>lab</code> is the computer\'s.', wrong: ['<code>student</code> is the part before the <code>@</code>: that is who you are, not where you are.', '', 'The computer\'s name comes after the <code>@</code>.', 'The shell always starts somewhere. It starts in your home.'] },
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
        `<p>Look at the root. <code>bin</code> holds the commands themselves (<code>ls</code> is a program that lives at <code>/bin/ls</code>), <code>etc</code> holds settings, <code>home</code> holds the users' home directories, <code>tmp</code> is for temporary files. On a real machine there are a few more, and you do not need them.</p>
<p>Words after a command that start with a dash, like <code>-l</code>, are <em>options</em>: switches that change what the command does. <code>ls -a</code> shows <em>all</em> files, including hidden ones, whose names start with a dot. Options can be combined: <code>ls -la</code> or <code>ls -l -a</code>.</p>`,
        { play: `ls garden
ls -a garden`, setup: 'lesson1', caption: 'A dot at the start of a name hides a file from a plain <code>ls</code>. Real home directories are full of them: settings files that programs keep out of the way.' },
        { check: 'You are in <code>~/garden</code>. Which of these names <code>key.txt</code>, which is inside <code>shed</code>?', options: ['<code>key.txt</code>', '<code>shed/key.txt</code>', '<code>garden/shed/key.txt</code>', '<code>/shed/key.txt</code>'], answer: 1, why: 'A relative path starts from where you are. From inside <code>garden</code>, the next step down is <code>shed</code>, then the file. <code>garden/shed/key.txt</code> would be right from home; <code>/shed/key.txt</code> is absolute and starts at the root, where there is no <code>shed</code>.', wrong: ['<code>key.txt</code> alone means a file in the directory you are in, and you are in <code>garden</code>, not in <code>shed</code>.', '', 'That path is right from your home directory, but you are one step further down already.', 'A path starting with <code>/</code> starts at the root of the whole tree. There is no <code>shed</code> there.'] },
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
        `<div class="stmt"><p><span class="kind">Tab finishes names for you.</span> Type <code>cd ga</code> and press Tab: the shell completes it to <code>cd garden/</code>. If several names could fit, press Tab twice to see them. Using Tab is not laziness; it is how people avoid typing mistakes in long names. Try it in the terminal above.</p>
<p><span class="kind">The up arrow brings back the last command.</span> Press it again for the one before. Edit and press Enter.</p></div>
<p>Two mistakes you will make, and what the shell says:</p>`,
        { play: `cd gardn
cd README.txt
cd garden/shed
cd pond`, setup: 'lesson1', expectError: true, caption: 'A misspelled name is "No such file or directory". A file is "Not a directory": you can only be inside directories. And the last line fails because <code>pond</code> is not inside <code>shed</code>; it is beside it. From <code>shed</code> you would write <code>cd ../pond</code>.' },
        `<p>Those messages are not insults. They are precise: the shell tried, and says exactly what it could not find. Read them, fix the path, and try again. Every programmer does this all day.</p>
<p>When you are lost, three commands bring you back: <code>pwd</code> to see where you are, <code>ls</code> to see what is around you, <code>cd</code> to go home. When you have forgotten a command, <code>help</code> lists them all, and <code>man ls</code> (the manual) tells you about one. <code>clear</code> wipes the screen.</p>`,
        { check: 'You are in <code>~/garden/shed</code> and type <code>cd ..</code> and then <code>cd ..</code> again. What does the prompt show?', options: ['<code>~/garden</code>', '<code>~</code>', '<code>/</code>', 'An error: you cannot go up twice'], answer: 1, why: 'Each <code>..</code> goes up one level: <code>shed</code> → <code>garden</code> → home. Once more would take you to <code>/home</code>, and once more to <code>/</code>, the root, where going up does nothing.', wrong: ['That is after the first <code>cd ..</code>. The second goes up again.', '', 'The root is two more steps up: <code>/home</code>, then <code>/</code>.', 'You can go up as many times as there are levels. At the root, <code>cd ..</code> just stays there.'] },
        { ex: { id: 'sh-1-1', kind: 'shell', title: 'Into the shed', setup: 'lesson1',
          prompt: '<p>Somewhere in the garden is a shed, and in the shed is a file called <code>key.txt</code>. Go into the shed directory and print the file with <code>cat</code>. Stay in the shed: the check looks at where you ended up and at whether the file was read.</p>',
          tests: [{ cwd: '~/garden/shed' }, { ran: /\bcat\b.*\bkey\.txt\b/, name: 'key.txt was printed with cat' }],
          hints: ['Start with <code>ls</code> to see what is in your home, then <code>cd garden</code> and <code>ls</code> again.', 'From inside <code>garden</code>, <code>cd shed</code>, then <code>cat key.txt</code>. Or do the moving in one step: <code>cd garden/shed</code>.'],
          solution: 'cd garden/shed\ncat key.txt',
          followup: 'Now get home with one command, and then print the same file from there with one command, using a path that starts at home.' } },
        { ex: { id: 'sh-1-2', kind: 'answer', title: 'Hidden things', setup: 'lesson1',
          prompt: '<p>Use the terminal from any example above (press Reset first if you have moved things). Explore the garden with <code>ls</code>, <code>ls -a</code>, <code>cd</code> and <code>cat</code>, then answer.</p>',
          parts: [
            { label: 'The name of the hidden file inside <code>garden</code>', answer: ['.wishes', 'garden/.wishes', '~/garden/.wishes'], placeholder: 'starts with a dot' },
            { label: 'The password written in the shed\'s <code>key.txt</code>', answer: 'tulip' },
            { label: 'How many goldfish live in the pond (write the number)', answer: ['3', 'three'] }
          ],
          hints: ['Hidden files only show up with <code>ls -a</code>. Try <code>ls -a garden</code>.', 'The pond is a directory inside garden with a file in it: <code>cat garden/pond/fish.txt</code>.'],
          solution: '<p><code>ls -a garden</code> shows <code>.wishes</code>, which a plain <code>ls</code> hides. <code>cat garden/shed/key.txt</code> ends with "The password is: tulip". <code>cat garden/pond/fish.txt</code> says "three goldfish".</p>',
          followup: 'Print the hidden file. Then, from inside <code>letters</code>, print <code>fish.txt</code> with a path that uses <code>..</code>.' } },
        `<div class="recap"><h3>In this lesson</h3><ul>
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
      title: 'Making and moving things', summary: 'mkdir, touch and echo to make things; cp and mv to copy, move and rename; rm to remove, and why it needs care; wildcards that name many files at once.',
      blocks: [
        `<p>Late on the evening of 31 January 2017, an engineer at GitLab, a company whose servers hold the source code of thousands of projects, was trying to fix a slow database. There were two database servers, a main one and a spare. Tired, and meaning to clear out the spare, he typed a remove command on the main one. He realised within seconds and stopped it, but by then most of the directory was gone. Then the company found that its backups had quietly been failing for weeks. About six hours of other people's work was lost for good. GitLab wrote the whole story up and published it, so that nobody else would have to learn it the same way.</p>
<p>The lesson they drew is the one this lesson ends with: on the command line, <em>remove means remove</em>. There is no recycle bin, and the shell does not ask whether you are sure. Everything else here, making, copying and moving, is forgiving. Learn those first, and treat the last section with respect.</p>
<h2>Making things</h2>
<p>Three commands make things. <code>mkdir</code> makes a directory. <code>touch</code> makes an empty file (or, if the file exists, just updates its date). And <code>echo</code>, which prints its words, can be pointed at a file with <code>&gt;</code> to make a file with something in it. The <code>tree</code> command draws what you have made.</p>`,
        { play: `mkdir notes
touch notes/ideas.txt
echo "Learn the shell" > notes/todo.txt
tree`, setup: 'lesson2', caption: 'A directory, an empty file in it, a file with one line in it, and the picture. <code>&gt;</code> means "put the output into this file instead of on the screen"; lesson 4 says much more about it.' },
        `<div class="stmt"><p><span class="kind">Names.</span> A name can have letters, digits, dots, dashes and underscores. Spaces are allowed but a nuisance, because the shell uses spaces to separate words: <code>touch my notes.txt</code> makes two files, <code>my</code> and <code>notes.txt</code>. Use <code>my-notes.txt</code> or <code>my_notes.txt</code>, or put the name in quotes. Capitals count: <code>Notes</code> and <code>notes</code> are different.</p>
<p><span class="kind">Several at once.</span> <code>mkdir a b c</code> makes three directories. <code>mkdir -p projects/game/levels</code> makes the whole chain, parents first. <code>touch day1.txt day2.txt</code> makes two files.</p></div>
<p>What happens when a thing is already there, or its parent is not?</p>`,
        { play: `mkdir notes
mkdir notes
mkdir projects/game
mkdir -p projects/game
tree projects`, setup: 'lesson2', expectError: true, caption: '<code>mkdir</code> refuses to make a directory that exists, and refuses to make <code>game</code> when <code>projects</code> is not there yet. <code>-p</code> ("parents") makes the missing parents, and does not complain about ones that exist.' },
        { check: 'What does <code>touch report.txt</code> do when there is no file called <code>report.txt</code>?', options: ['Prints an error: No such file', 'Makes an empty file with that name', 'Opens the file for editing', 'Makes a directory called <code>report.txt</code>'], answer: 1, why: '<code>touch</code> was made to update a file\'s date, and making the file when it is missing is the side effect everyone uses it for. The file is empty; <code>echo text &gt; report.txt</code> or <code>nano report.txt</code> puts something in it.', wrong: ['That message comes when the <em>directory</em> part of a path is missing, like <code>touch nowhere/report.txt</code>.', '', 'Editing is <code>nano</code>\'s job. <code>touch</code> does not open anything.', 'Directories are <code>mkdir</code>\'s job.'] },
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
        `<div class="stmt"><p><span class="kind">A slash makes the meaning plain.</span> <code>mv breakfast.txt kitchen/</code> says "into the directory kitchen", and fails loudly if there is no such directory, instead of quietly renaming the file to <code>kitchen</code>. Many people always write the slash when they mean a directory.</p>
<p><span class="kind">Directories need <code>-r</code>.</span> <code>cp</code> refuses to copy a directory unless you say <code>cp -r</code> ("recursive": the directory and everything inside). <code>mv</code> moves a directory as it is.</p>
<p><span class="kind">Copying over.</span> <code>cp a.txt b.txt</code> when <code>b.txt</code> exists replaces it without asking. So does <code>mv</code>.</p></div>`,
        { play: `mkdir kitchen
cp desk kitchen
cp -r desk kitchen
tree kitchen
mv kitchen/desk kitchen/old-desk
ls kitchen`, setup: 'lesson2', expectError: true, caption: 'The first <code>cp</code> is refused: "omitting directory". With <code>-r</code> the whole desk is copied into the kitchen, and <code>mv</code> renames the copy.' },
        { check: '<code>notes</code> is a directory and <code>plan.txt</code> is a file next to it. What does <code>mv plan.txt notes</code> do?', options: ['Renames <code>plan.txt</code> to <code>notes</code>, replacing the directory', 'Moves <code>plan.txt</code> into the <code>notes</code> directory', 'Copies <code>plan.txt</code> into <code>notes</code>', 'Fails: a file cannot be moved onto a directory'], answer: 1, why: 'When the destination is a directory that exists, <code>mv</code> (and <code>cp</code>) put the file inside it, keeping its name. The file is now <code>notes/plan.txt</code> and is no longer where it was.', wrong: ['A directory is never silently replaced by a file. Because <code>notes</code> exists and is a directory, the file goes inside it.', '', '<code>mv</code> leaves no copy behind; <code>cp</code> is the one that copies.', 'It does not fail; it is the normal way to move a file into a directory.'] },
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
        { check: 'A directory holds <code>a.txt</code>, <code>b.txt</code> and <code>c.py</code>. What does <code>rm *.txt</code> remove?', options: ['Only <code>a.txt</code>', '<code>a.txt</code> and <code>b.txt</code>', 'All three files', 'Nothing: <code>rm</code> does not understand <code>*</code>'], answer: 1, why: 'The shell expands <code>*.txt</code> to <code>a.txt b.txt</code> before <code>rm</code> runs, so <code>rm</code> sees those two names. <code>c.py</code> does not end in <code>.txt</code>. To see what a pattern will match, <code>echo *.txt</code> first.', wrong: ['<code>*</code> matches every name that fits, not just the first.', '', '<code>c.py</code> does not end in <code>.txt</code>, so the pattern leaves it alone.', '<code>rm</code> never sees the <code>*</code>: the shell has already turned it into the list of names.'] },
        { ex: { id: 'sh-2-1', kind: 'shell', title: 'Build a project', setup: 'lesson2',
          prompt: '<p>Make a directory called <code>project</code> in your home directory. Inside it make two directories, <code>src</code> and <code>docs</code>, and a file <code>README.md</code> containing exactly the line <code>My first project</code>. Inside <code>src</code>, make an empty file called <code>main.py</code>. <code>tree project</code> should then show two directories and two files.</p>',
          tests: [{ dir: 'project' }, { dir: 'project/src' }, { dir: 'project/docs' }, { content: 'project/README.md', expect: 'My first project' }, { file: 'project/src/main.py' }],
          hints: ['<code>mkdir project</code> first; then the two inside it can be made in one go: <code>mkdir project/src project/docs</code>.', '<code>echo "My first project" &gt; project/README.md</code> writes the line into the file. <code>touch project/src/main.py</code> makes the empty one.'],
          solution: 'mkdir project\nmkdir project/src project/docs\necho "My first project" > project/README.md\ntouch project/src/main.py\ntree project',
          followup: 'Copy the whole project to <code>project-backup</code> with one command, and check with <code>tree</code> that everything came along.' } },
        { ex: { id: 'sh-2-2', kind: 'shell', title: 'Tidy the desk', setup: 'lesson2',
          prompt: '<p>The <code>desk</code> directory is a mess: pictures, text files, a program and some <code>.tmp</code> junk, all in a heap. Inside <code>desk</code>, make three directories, <code>photos</code>, <code>notes</code> and <code>code</code>. Move every <code>.jpg</code> into <code>photos</code>, every <code>.txt</code> into <code>notes</code> and <code>game.py</code> into <code>code</code>. Remove the <code>.tmp</code> files. When you are done, <code>ls desk</code> should show only the three directories.</p>',
          tests: [{ exists: 'desk/photos/cat.jpg' }, { exists: 'desk/photos/dog.jpg' }, { exists: 'desk/notes/essay.txt' }, { exists: 'desk/notes/notes.txt' }, { exists: 'desk/code/game.py' }, { missing: 'desk/old.tmp' }, { missing: 'desk/junk.tmp' }, { cmd: 'ls desk', expect: 'code\nnotes\nphotos' }],
          hints: ['<code>cd desk</code> first, so the names are short. <code>mkdir photos notes code</code> makes all three.', 'Wildcards do the moving: <code>mv *.jpg photos/</code>, <code>mv *.txt notes/</code>, <code>mv game.py code/</code>. Then <code>rm *.tmp</code>: check with <code>echo *.tmp</code> first.'],
          solution: 'cd desk\nmkdir photos notes code\nmv *.jpg photos/\nmv *.txt notes/\nmv game.py code/\necho *.tmp\nrm *.tmp\nls',
          followup: 'Rename <code>photos</code> to <code>pictures</code> with one <code>mv</code>, then draw the whole desk with <code>tree</code>.' } },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li><b>Make:</b> <code>mkdir</code> (with <code>-p</code> for a chain of parents), <code>touch</code> for an empty file, <code>echo text &gt; file</code> for a file with a line in it. <code>tree</code> draws the result.</li>
<li><b>Copy and move:</b> <code>cp from to</code> and <code>mv from to</code>. A destination that is a directory means "into it"; any other name means "with this name", so <code>mv</code> also renames. Write the trailing slash when you mean a directory. Directories copy with <code>cp -r</code>.</li>
<li><b>Remove:</b> <code>rm file</code>, <code>rmdir emptydir</code>, <code>rm -r dir</code>. Nothing asks, nothing comes back. <code>ls</code> the name first.</li>
<li><b>Wildcards:</b> <code>*</code> is anything, <code>?</code> is one character, <code>{a,b}</code> and <code>{1..5}</code> make several names. The shell expands them before the command runs; <code>echo</code> the pattern to see what it will become.</li>
</ul></div>`
      ]
    }
  ]
});
