// Node tests for the practice git (src/shellgit.js) in the practice shell: a beginner's whole workflow, each command's normal and error
// cases, merges with and without conflicts, the file system's caps, and hostile .git data. The expected texts were printed by real git 2.43
// (with the same name, email and time, so the commit ids agree too).
//   node test_git.js          the tests
//   node test_git.js --real   also run the scenarios below through the real git in a temporary directory and compare, command by command
process.env.TZ = 'UTC';
const SHELL = require('./src/shell.js');
const GIT = require('./src/shellgit.js');
let bad = 0, count = 0;
const check = (name, got, want) => { count++; const ok = want instanceof RegExp ? want.test(got) : got === want; if (!ok) { bad++; console.log('BAD  ' + name + '\n  got:  ' + JSON.stringify(got) + '\n  want: ' + (want instanceof RegExp ? want : JSON.stringify(want))); } };
const T0 = Date.UTC(2026, 9, 1, 14, 0, 0);
function fresh() {
  const fs = SHELL.makeFS(null, { now: () => T0 });
  const sh = SHELL.makeShell({ fs, now: () => T0 });
  const run = async (line, tty) => { let out = ''; const exit = await sh.exec(line, { out: (s) => { out += s; }, err: (s) => { out += s; }, tty: !!tty }); return { out, exit }; };
  return { fs, sh, run };
}
const eq = (name, r, out, exit) => { check(name + ' output', r.out, out); if (exit !== undefined) check(name + ' exit', r.exit, exit); };
const H = '/home/student';

(async () => {
  // ---- SHA-1 and object ids, against known values
  check('sha1 empty', GIT.sha1(new Uint8Array(0)), 'da39a3ee5e6b4b0d3255bfef95601890afd80709');
  check('sha1 abc', GIT.sha1(new TextEncoder().encode('abc')), 'a9993e364706816aba3e25717850c26c9cd0d89d');
  check('sha1 two blocks', GIT.sha1(new TextEncoder().encode('abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq')), '84983e441c3bd26ebaae4aa1f95129e5e54670f1');
  check('blob id as git hash-object', GIT.blobId('hi\n'), '45b983be36b73c0788dc9cbcb76cbb80fc7bb057');
  check('empty blob id', GIT.blobId(''), 'e69de29bb2d1d6434b8b29ae775ad8c2e48c5391');

  // ---- a beginner's first session (texts and ids as real git prints them)
  {
    const { run, fs } = fresh();
    await run('mkdir r; cd r');
    eq('status outside a repository', await run('git status'), 'fatal: not a git repository (or any of the parent directories): .git\n', 128);
    eq('init', await run('git init'), 'Initialized empty Git repository in /home/student/r/.git/\n', 0);
    eq('init again', await run('git init'), 'Reinitialized existing Git repository in /home/student/r/.git/\n', 0);
    check('.git is hidden from ls', (await run('ls')).out, '');
    check('.git shows with ls -a', (await run('ls -a')).out, '.\n..\n.git\n');
    check('HEAD names main', fs.read(H + '/r/.git/HEAD'), 'ref: refs/heads/main\n');
    eq('status, nothing yet', await run('git status'), 'On branch main\n\nNo commits yet\n\nnothing to commit (create/copy files and use "git add" to track)\n', 0);
    await run('echo hi > a.txt');
    eq('status, untracked', await run('git status'), 'On branch main\n\nNo commits yet\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\ta.txt\n\nnothing added to commit but untracked files present (use "git add" to track)\n', 0);
    eq('status -s untracked', await run('git status -s'), '?? a.txt\n');
    eq('add', await run('git add a.txt'), '', 0);
    eq('status, staged first file', await run('git status'), 'On branch main\n\nNo commits yet\n\nChanges to be committed:\n  (use "git rm --cached <file>..." to unstage)\n\tnew file:   a.txt\n\n');
    eq('status -s staged', await run('git status -s'), 'A  a.txt\n');
    eq('first commit', await run('git commit -m "first"'), '[main (root-commit) ebc4454] first\n 1 file changed, 1 insertion(+)\n create mode 100644 a.txt\n', 0);
    eq('clean', await run('git status'), 'On branch main\nnothing to commit, working tree clean\n');
    eq('log', await run('git log'), 'commit ebc4454d043255bf5d0772f419dd390672df77d5\nAuthor: Student <student@lab>\nDate:   Thu Oct 1 14:00:00 2026 +0000\n\n    first\n', 0);
    eq('log --oneline', await run('git log --oneline'), 'ebc4454 first\n');
    eq('log decorates at a terminal', await run('git log --oneline', true), 'ebc4454 (HEAD -> main) first\n');
    await run('echo more >> a.txt');
    eq('status, modified', await run('git status'), 'On branch main\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tmodified:   a.txt\n\nno changes added to commit (use "git add" and/or "git commit -a")\n');
    eq('diff', await run('git diff'), 'diff --git a/a.txt b/a.txt\nindex 45b983b..65ef226 100644\n--- a/a.txt\n+++ b/a.txt\n@@ -1 +1,2 @@\n hi\n+more\n', 0);
    eq('commit with nothing staged', await run('git commit -m x'), 'On branch main\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tmodified:   a.txt\n\nno changes added to commit (use "git add" and/or "git commit -a")\n', 1);
    eq('commit -am', await run('git commit -am "second"'), '[main 25ad725] second\n 1 file changed, 1 insertion(+)\n', 0);
    eq('nothing to commit', await run('git commit -m none'), 'On branch main\nnothing to commit, working tree clean\n', 1);
    eq('log -n 1', await run('git log --oneline -n 1'), '25ad725 second\n');
    eq('log -1', await run('git log --oneline -1'), '25ad725 second\n');
    eq('show', await run('git show'), 'commit 25ad725969ca3accdbe6fb18507abee631bef2ed\nAuthor: Student <student@lab>\nDate:   Thu Oct 1 14:00:00 2026 +0000\n\n    second\n\ndiff --git a/a.txt b/a.txt\nindex 45b983b..65ef226 100644\n--- a/a.txt\n+++ b/a.txt\n@@ -1 +1,2 @@\n hi\n+more\n');
    eq('cat-file -p HEAD', await run('git cat-file -p HEAD'), 'tree c53b99dfe10371d6c0f4b6889da5d24fb3aa9c29\nparent ebc4454d043255bf5d0772f419dd390672df77d5\nauthor Student <student@lab> 1790863200 +0000\ncommitter Student <student@lab> 1790863200 +0000\n\nsecond\n');
    eq('show HEAD~1:a.txt', await run('git show HEAD~1:a.txt'), 'hi\n');
    eq('add a missing file', await run('git add nope'), "fatal: pathspec 'nope' did not match any files\n", 128);
    eq('restore a missing file', await run('git restore nope'), "error: pathspec 'nope' did not match any file(s) known to git\n", 1);
    eq('add nothing', await run('git add'), "Nothing specified, nothing added.\nhint: Maybe you wanted to say 'git add .'?\nhint: Turn this message off by running\nhint: \"git config advice.addEmptyPathspec false\"\n", 0);
    eq('commit without -m', await run('echo x >> a.txt; git commit -a'), /^error: there is no text editor.*\n    git commit -m "Say what you changed"\nAborting commit due to empty commit message.\n$/s, 1);
    eq('commit -m needs a value', await run('git commit -m'), "error: switch `m' requires a value\n", 129);
    eq('restore', await run('git restore a.txt; git status -s'), '', 0);
    check('objects.json is readable JSON', JSON.parse(fs.read(H + '/r/.git/objects.json')).objects['45b983be36b73c0788dc9cbcb76cbb80fc7bb057'][1], 'hi\n');
    check('index is readable JSON', JSON.parse(fs.read(H + '/r/.git/index')).entries[0][0], 'a.txt');
    eq('reflog', await run('git reflog'), '25ad725 HEAD@{0}: commit: second\nebc4454 HEAD@{1}: commit (initial): first\n');
    eq('man git', await run('man git | head -3'), /^GIT\(1\) +User Commands\n\nNAME\n$/);
    eq('help git', await run('help git | grep -c "git init"'), /^[1-9]\n$/);
    eq('git help commit', await run('git help commit | head -4'), 'GIT-COMMIT(1)\n\nNAME\n    git-commit - Record changes to the repository\n');
    eq('git alone', await run('git'), /^usage: git /, 1);
    eq('git --version', await run('git --version'), 'git version 2.43.0\n', 0);
    eq('unknown command', await run('git frob'), "git: 'frob' is not a git command. See 'git --help'.\n", 1);
    eq('a typo', await run('git comit'), "git: 'comit' is not a git command. See 'git --help'.\n\nThe most similar command is\n\tcommit\n", 1);
    eq('clone', await run('git clone https://example.com/x.git'), /^fatal: git clone needs another computer, and there is no network/, 128);
    eq('push', await run('git push'), /no network in this practice terminal/, 128);
    eq('pull', await run('git pull'), /no network/, 128);
    eq('fetch', await run('git fetch'), /no network/, 128);
    eq('remote lists nothing', await run('git remote'), '', 0);
    eq('stash is not here', await run('git stash'), "git: 'stash' is not available in this practice git. See 'git help' for the commands that are.\n", 1);
    eq('which git', await run('which git'), '/bin/git\n', 0);
  }

  // ---- staging: status in all its forms, add, rm, mv, restore, renames, .gitignore, subdirectories
  {
    const { run } = fresh();
    await run('mkdir r; cd r; git init -q; printf "one\\ntwo\\n" > f.txt; mkdir d; echo c > d/c.txt; git add -A');
    eq('diff --staged of new files', await run('git diff --staged'), 'diff --git a/d/c.txt b/d/c.txt\nnew file mode 100644\nindex 0000000..f2ad6c7\n--- /dev/null\n+++ b/d/c.txt\n@@ -0,0 +1 @@\n+c\ndiff --git a/f.txt b/f.txt\nnew file mode 100644\nindex 0000000..814f4a4\n--- /dev/null\n+++ b/f.txt\n@@ -0,0 +1,2 @@\n+one\n+two\n');
    await run('git commit -q -m start');
    eq('show --stat', await run('git show --stat'), 'commit f16678074a1882e201237784529bdebd1a101b0e\nAuthor: Student <student@lab>\nDate:   Thu Oct 1 14:00:00 2026 +0000\n\n    start\n\n d/c.txt | 1 +\n f.txt   | 2 ++\n 2 files changed, 3 insertions(+)\n');
    await run('echo three >> f.txt; echo new > g.txt; git add g.txt; rm d/c.txt; echo u > u.txt');
    eq('status, every section', await run('git status'), 'On branch main\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\tnew file:   g.txt\n\nChanges not staged for commit:\n  (use "git add/rm <file>..." to update what will be committed)\n  (use "git restore <file>..." to discard changes in working directory)\n\tdeleted:    d/c.txt\n\tmodified:   f.txt\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\tu.txt\n\n');
    eq('status -s, every kind', await run('git status -s'), ' D d/c.txt\n M f.txt\nA  g.txt\n?? u.txt\n');
    eq('diff of a deleted file', await run('git diff d/c.txt'), 'diff --git a/d/c.txt b/d/c.txt\ndeleted file mode 100644\nindex f2ad6c7..0000000\n--- a/d/c.txt\n+++ /dev/null\n@@ -1 +0,0 @@\n-c\n');
    eq('diff --cached', await run('git diff --cached'), 'diff --git a/g.txt b/g.txt\nnew file mode 100644\nindex 0000000..3e75765\n--- /dev/null\n+++ b/g.txt\n@@ -0,0 +1 @@\n+new\n');
    eq('restore --staged', await run('git restore --staged g.txt; git status -s'), ' D d/c.txt\n M f.txt\n?? g.txt\n?? u.txt\n');
    eq('restore two files', await run('git restore f.txt d/c.txt; git status -s'), '?? g.txt\n?? u.txt\n');
    eq('restore an untracked file', await run('git restore g.txt'), "error: pathspec 'g.txt' did not match any file(s) known to git\n", 1);
    eq('rm', await run('git rm f.txt; git status -s'), "rm 'f.txt'\nD  f.txt\n?? g.txt\n?? u.txt\n");
    eq('rm a missing path', await run('git rm nope'), "fatal: pathspec 'nope' did not match any files\n", 128);
    eq('rm --cached', await run('git rm --cached d/c.txt; git status -s'), "rm 'd/c.txt'\nD  d/c.txt\nD  f.txt\n?? d/\n?? g.txt\n?? u.txt\n");
    eq('reset --hard', await run('git reset --hard; git status -s'), 'HEAD is now at f166780 start\n?? g.txt\n?? u.txt\n');
    eq('mv', await run('git mv f.txt h.txt; git status -s'), 'R  f.txt -> h.txt\n?? g.txt\n?? u.txt\n');
    eq('status shows the rename', await run('git status'), 'On branch main\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n\trenamed:    f.txt -> h.txt\n\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\tg.txt\n\tu.txt\n\n');
    eq('mv a missing file', await run('git mv nope z'), 'fatal: bad source, source=nope, destination=z\n', 128);
    eq('mv an untracked file', await run('git mv u.txt z'), 'fatal: not under version control, source=u.txt, destination=z\n', 128);
    eq('mv onto a file', await run('git mv h.txt g.txt'), 'fatal: destination exists, source=h.txt, destination=g.txt\n', 128);
    eq('rename summary', await run('git mv h.txt d; git commit -m moved'), '[main 1d4bb6c] moved\n 1 file changed, 0 insertions(+), 0 deletions(-)\n rename f.txt => d/h.txt (100%)\n', 0);
    eq('rm a directory without -r', await run('git rm d'), "fatal: not removing 'd' recursively without -r\n", 128);
    eq('rm -r', await run('git rm -r d'), "rm 'd/c.txt'\nrm 'd/h.txt'\n", 0);
    check('rm -r removes the emptied directory', (await run('ls')).out, 'g.txt\nu.txt\n');
    await run('git reset -q --hard; echo zz >> d/c.txt');
    eq('rm a modified file', await run('git rm d/c.txt'), 'error: the following file has local modifications:\n    d/c.txt\n(use --cached to keep the file, or -f to force removal)\n', 1);
    eq('rm a staged file', await run('git add d/c.txt; git rm d/c.txt'), 'error: the following file has changes staged in the index:\n    d/c.txt\n(use --cached to keep the file, or -f to force removal)\n', 1);
    eq('rm -f', await run('git rm -q -f d/c.txt; git status -s'), 'D  d/c.txt\n?? g.txt\n?? u.txt\n');
    await run('git reset -q --hard; rm g.txt u.txt');
    // paths are shown from where you are
    await run('mkdir sub; echo s > sub/s.txt; cd sub');
    eq('untracked directory seen from inside', await run('git status'), 'On branch main\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n\t./\n\nnothing added to commit but untracked files present (use "git add" to track)\n');
    eq('add from a subdirectory', await run('git add s.txt; git status -s'), 'A  s.txt\n');
    eq('paths above', await run('echo x >> ../d/c.txt; git status -s'), ' M ../d/c.txt\nA  s.txt\n');
    eq('a path outside the repository', await run('git add /tmp'), "fatal: /tmp: '/tmp' is outside repository at '/home/student/r'\n", 128);
    await run('cd ..; git reset -q --hard; rm -r sub');
    // .gitignore
    await run('mkdir build; echo o > build/x.o; echo s > s.log; echo k > keep.log; printf "build/\\n*.log\\n!keep.log\\n" > .gitignore');
    eq('ignored files are not listed', await run('git status -s'), '?? .gitignore\n?? keep.log\n');
    eq('adding an ignored file', await run('git add s.log'), 'The following paths are ignored by one of your .gitignore files:\ns.log\nhint: Use -f if you really want to add them.\nhint: Turn this message off by running\nhint: "git config advice.addIgnoredFile false"\n', 1);
    eq('add . skips ignored files', await run('git add .; git status -s'), 'A  .gitignore\nA  keep.log\n');
    eq('add -f', await run('git add -f s.log; git status -s'), 'A  .gitignore\nA  keep.log\nA  s.log\n');
    // quoting
    await run("git reset -q --hard; echo q > 'a b.txt'; echo e > é.txt");
    eq('short status quotes spaces and non-ASCII', await run('git status -s'), '?? "a b.txt"\n?? build/\n?? "\\303\\251.txt"\n');
  }

  // ---- diffs: context, function names, missing final newline, mode changes, empty files, between commits
  {
    const { run } = fresh();
    await run('mkdir r; cd r; git init -q; printf "def f():\\n  a\\n  b\\n  c\\n  d\\n  e\\n  f\\n  g\\n" > p.py; printf "x\\ny" > nonl.txt; git add .; git commit -q -m one');
    await run('printf "def f():\\n  a\\n  b\\n  c\\n  d\\n  e\\n  F\\n  g\\n" > p.py; printf "x\\nz" > nonl.txt');
    eq('diff with a function name and no final newline', await run('git diff'), 'diff --git a/nonl.txt b/nonl.txt\nindex 1b32298..6e94b48 100644\n--- a/nonl.txt\n+++ b/nonl.txt\n@@ -1,2 +1,2 @@\n x\n-y\n\\ No newline at end of file\n+z\n\\ No newline at end of file\ndiff --git a/p.py b/p.py\nindex 11f195d..5ba203d 100644\n--- a/p.py\n+++ b/p.py\n@@ -4,5 +4,5 @@ def f():\n   c\n   d\n   e\n-  f\n+  F\n   g\n');
    eq('diff --stat', await run('git diff --stat'), ' nonl.txt | 2 +-\n p.py     | 2 +-\n 2 files changed, 2 insertions(+), 2 deletions(-)\n');
    eq('diff --name-only', await run('git diff --name-only'), 'nonl.txt\np.py\n');
    await run('git commit -q -am two; touch empty.txt; chmod +x p.py');
    eq('mode change', await run('git diff'), 'diff --git a/p.py b/p.py\nold mode 100644\nnew mode 100755\n');
    eq('commit an empty file and a mode change', await run('git add -A; git commit -m "mode and empty"'), /^\[main [0-9a-f]{7}\] mode and empty\n 2 files changed, 0 insertions\(\+\), 0 deletions\(-\)\n create mode 100644 empty.txt\n mode change 100644 => 100755 p.py\n$/);
    eq('diff between commits', await run('git diff HEAD~2 HEAD~1 -- p.py'), 'diff --git a/p.py b/p.py\nindex 11f195d..5ba203d 100644\n--- a/p.py\n+++ b/p.py\n@@ -4,5 +4,5 @@ def f():\n   c\n   d\n   e\n-  f\n+  F\n   g\n');
    eq('a bad revision', await run('git diff HEAD~9'), "fatal: ambiguous argument 'HEAD~9': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'\n", 128);
    // a longer file: two hunks, then one when the changes are close
    await run('seq 1 30 > n.txt; git add n.txt; git commit -q -m n; sed -i "s/^3$/three/" n.txt; sed -i "s/^25$/twenty-five/" n.txt');
    eq('two hunks', await run('git diff n.txt | grep "^@@"'), '@@ -1,6 +1,6 @@\n@@ -22,7 +22,7 @@\n');
    await run('git checkout -q n.txt; sed -i "s/^3$/three/" n.txt; sed -i "s/^9$/nine/" n.txt');
    eq('one hunk when six lines apart', await run('git diff n.txt | grep "^@@"'), '@@ -1,12 +1,12 @@\n');
    check('hunks api', GIT.hunks('a\nb\n', 'a\nc\n').map((h) => h.head).join(), '@@ -1,2 +1,2 @@');
  }

  // ---- log and show
  {
    const { run } = fresh();
    await run('mkdir r; cd r; git init -q; echo 1 > f; git add f; git commit -q -m one; echo 2 >> f; git commit -q -am two; echo 3 >> f; git commit -q -am "three\n\nwith a body"');
    eq('log --format', await run('git log --format="%h %s|%an <%ae>"'), /^[0-9a-f]{7} three\|Student <student@lab>\n[0-9a-f]{7} two\|Student <student@lab>\n[0-9a-f]{7} one\|Student <student@lab>\n$/);
    eq('log --reverse --oneline', await run('git log --reverse --format=%s'), 'one\ntwo\nthree\n');
    eq('log of a branch with no commits', await run('cd ..; mkdir e; cd e; git init -q; git log'),"fatal: your current branch 'main' does not have any commits yet\n", 128);
    eq('show with no commits', await run('git show'), "fatal: your current branch 'main' does not have any commits yet\n", 128);
    eq('branch with no commits', await run('git branch x'), "fatal: not a valid object name: 'main'\n", 128);
    eq('tag with no commits', await run('git tag v1'), "fatal: Failed to resolve 'HEAD' as a valid ref.\n", 128);
    await run('cd ../r');
    eq('log -p -1', await run('git log -p -1 --format=%s'), /^three\n\ndiff --git a\/f b\/f\n/);
    eq('log with a path', await run('echo x > g; git add g; git commit -q -m g; git log --format=%s -- g'), 'g\n');
    eq('message body indented', await run('git log -n 1 HEAD~1'), /\n    three\n    \n    with a body\n$/);
    eq('rev-parse', await run('git rev-parse --short HEAD~3; git rev-parse --abbrev-ref HEAD'), /^[0-9a-f]{7}\nmain\n$/);
    eq('ls-files', await run('git ls-files'), 'f\ng\n');
  }

  // ---- branches, switch, checkout, tags, config
  {
    const { run } = fresh();
    await run('mkdir r; cd r; git init -q; printf "one\\ntwo\\nthree\\n" > f.txt; echo b > b.txt; git add .; git commit -q -m start');
    eq('branch lists', await run('git branch'), '* main\n');
    eq('branch creates', await run('git branch feature; git branch'), '  feature\n* main\n');
    eq('switch', await run('git switch feature'), "Switched to branch 'feature'\n", 0);
    eq('already on', await run('git switch feature'), "Already on 'feature'\n", 0);
    eq('checkout a branch', await run('git checkout main'), "Switched to branch 'main'\n", 0);
    eq('checkout -b', await run('git checkout -b topic; git branch'), "Switched to a new branch 'topic'\n  feature\n  main\n* topic\n");
    eq('switch to nothing', await run('git switch nope'), 'fatal: invalid reference: nope\n', 128);
    eq('checkout nothing', await run('git checkout nope'), "error: pathspec 'nope' did not match any file(s) known to git\n", 1);
    eq('branch exists', await run('git branch feature'), "fatal: a branch named 'feature' already exists\n", 128);
    eq('switch -c exists', await run('git switch -c feature'), "fatal: a branch named 'feature' already exists\n", 128);
    eq('bad branch names', await run("git branch 'bad..name'; git branch -- -x; git branch 'a b'"), "fatal: 'bad..name' is not a valid branch name\nfatal: '-x' is not a valid branch name\nfatal: 'a b' is not a valid branch name\n");
    eq('switch -', await run('git switch -; git switch -'), "Switched to branch 'main'\nSwitched to branch 'topic'\n");
    eq('switch to a commit', await run('git switch HEAD~0'), "fatal: a branch is expected, got commit 'HEAD~0'\nhint: If you want to detach HEAD at the commit, try again with the --detach option.\n", 128);
    eq('switch --detach', await run('git switch --detach HEAD'), /^HEAD is now at [0-9a-f]{7} start\n$/, 0);
    eq('status when detached', await run('git status'), /^HEAD detached at [0-9a-f]{7}\nnothing to commit, working tree clean\n$/);
    eq('branch when detached', await run('git branch'), /^\* \(HEAD detached at [0-9a-f]{7}\)\n  feature\n  main\n  topic\n$/);
    await run('git commit -q --allow-empty -m lost');
    eq('detached from', await run('git status'), /^HEAD detached from [0-9a-f]{7}\n/);
    eq('leaving a commit behind', await run('git switch main'), /^Warning: you are leaving 1 commit behind, not connected to\nany of your branches:\n\n  [0-9a-f]{7} lost\n\nIf you want to keep it by creating a new branch, this may be a good time\nto do so with:\n\n git branch <new-branch-name> [0-9a-f]{7}\n\nSwitched to branch 'main'\n$/);
    eq('checkout of a commit gives the advice', await run('git checkout HEAD~0'), /^Note: switching to 'HEAD~0'.\n\nYou are in 'detached HEAD' state\..*\nHEAD is now at [0-9a-f]{7} start\n$/s);
    await run('git switch -q main; git switch -q feature; echo F > f.txt; git commit -q -am feat; git switch -q main; echo local > f.txt');
    eq('switch with local changes in the way', await run('git switch feature'), 'error: Your local changes to the following files would be overwritten by checkout:\n\tf.txt\nPlease commit your changes or stash them before you switch branches.\nAborting\n', 1);
    await run('git restore f.txt; echo mine > b.txt');
    eq('local changes come along', await run('git switch feature'), "M\tb.txt\nSwitched to branch 'feature'\n");
    await run('git switch -q main; git restore b.txt; git switch -q feature; echo n > n.txt; git add n.txt; git commit -q -m n; git switch -q main; echo untracked > n.txt');
    eq('untracked file in the way', await run('git switch feature'), 'error: The following untracked working tree files would be overwritten by checkout:\n\tn.txt\nPlease move or remove them before you switch branches.\nAborting\n', 1);
    await run('rm n.txt');
    eq('branch -v', await run('git branch -v'), /^  feature [0-9a-f]{7} n\n\* main    [0-9a-f]{7} start\n  topic   [0-9a-f]{7} start\n$/);
    eq('branch -d unmerged', await run('git branch -d feature'), "error: the branch 'feature' is not fully merged.\nIf you are sure you want to delete it, run 'git branch -D feature'\n", 1);
    eq('branch -d current', await run('git branch -d main'), "error: cannot delete branch 'main' used by worktree at '/home/student/r'\n", 1);
    eq('branch -d missing', await run('git branch -d nope'), "error: branch 'nope' not found\n", 1);
    eq('branch -d', await run('git branch -d topic'), /^Deleted branch topic \(was [0-9a-f]{7}\)\.\n$/, 0);
    eq('branch -D', await run('git branch -D feature'), /^Deleted branch feature \(was [0-9a-f]{7}\)\.\n$/, 0);
    eq('branch -m', await run('git branch -m main trunk; git branch; git branch -m trunk main; git branch --show-current'), '* trunk\nmain\n');
    eq('branch names with a slash', await run('git branch feature/x; git branch; ls .git/refs/heads'), '  feature/x\n* main\nfeature\nmain\n');
    eq('a branch inside a branch name', await run('git branch feature'), "fatal: cannot lock ref 'refs/heads/feature': there is a non-empty directory '.git/refs/heads/feature' blocking reference 'refs/heads/feature'\n", 128);
    eq('deleting it cleans up', await run('git branch -d feature/x; ls .git/refs/heads'), /^Deleted branch feature\/x \(was [0-9a-f]{7}\)\.\nmain\n$/);
    eq('tag', await run('git tag v1; git tag'), 'v1\n');
    eq('tag exists', await run('git tag v1'), "fatal: tag 'v1' already exists\n", 128);
    eq('annotated tag', await run('git tag -a v2 -m "version 2"; git cat-file -t v2; git cat-file -p v2 | head -3'), /^tag\nobject [0-9a-f]{40}\ntype commit\ntag v2\n$/);
    eq('show an annotated tag', await run('git show v2 --stat'), /^tag v2\nTagger: Student <student@lab>\nDate:   Thu Oct 1 14:00:00 2026 \+0000\n\nversion 2\n\ncommit /);
    eq('decorations', await run('git log --oneline --decorate'), /^[0-9a-f]{7} \(HEAD -> main, tag: v2, tag: v1\) start\n$/);
    eq('tag -d', await run('git tag -d v1'), /^Deleted tag 'v1' \(was [0-9a-f]{7}\)\n$/, 0);
    eq('tag -d missing', await run('git tag -d v1'), "error: tag 'v1' not found.\n", 1);
    eq('tag -a without -m', await run('git tag -a v3'), /^fatal: there is no text editor/, 128);
    eq('config', await run('git config user.name "Ada L"; git config user.name; git config --get user.email; echo $?'), 'Ada L\n1\n');
    eq('config file', await run('cat .git/config'), '[core]\n\trepositoryformatversion = 0\n\tfilemode = true\n\tbare = false\n\tlogallrefupdates = true\n[user]\n\tname = Ada L\n');
    eq('config --global', await run('git config --global user.email ada@example.com; cat ~/.gitconfig; git config --list'), '[user]\n\temail = ada@example.com\nuser.email=ada@example.com\ncore.repositoryformatversion=0\ncore.filemode=true\ncore.bare=false\ncore.logallrefupdates=true\nuser.name=Ada L\n');
    eq('config without a section', await run('git config nosection'), 'error: key does not contain a section: nosection\n', 1);
    eq('the author comes from config', await run('git commit -q --allow-empty -m who; git log -1 --format="%an <%ae>"'), 'Ada L <ada@example.com>\n');
    eq('config outside a repository', await run('cd /tmp; git config user.name x'), 'fatal: not in a git directory\n', 128);
    eq('global config outside a repository', await run('git config --global user.email'), 'ada@example.com\n', 0);
    eq('init -b', await run('mkdir /tmp/q; git init -q -b trunk /tmp/q; cat /tmp/q/.git/HEAD'), 'ref: refs/heads/trunk\n');
  }

  // ---- merges: fast-forward, three-way, conflicts of each kind, resolving, aborting
  {
    const { run, fs } = fresh();
    await run('mkdir r; cd r; git init -q; printf "one\\ntwo\\nthree\\n" > f.txt; echo b > b.txt; git add .; git commit -q -m start; git switch -q -c topic; printf "one\\nTWO\\nthree\\n" > f.txt; git commit -q -am "change two"; git switch -q main');
    eq('fast-forward', await run('git merge topic'), 'Updating 96b7eac..1710077\nFast-forward\n f.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n', 0);
    eq('already up to date', await run('git merge topic'), 'Already up to date.\n', 0);
    eq('merge what is not there', await run('git merge nope'), 'merge: nope - not something we can merge\n', 1);
    eq('merge with no argument', await run('git merge'), 'fatal: No remote for the current branch.\n', 128);
    eq('merge --abort with no merge', await run('git merge --abort'), 'fatal: There is no merge to abort (MERGE_HEAD missing).\n', 128);
    await run('git switch -q -c feature HEAD~1; printf "one\\ntwo\\nthree\\nfour\\n" > f.txt; git commit -q -am "add four"; git switch -q main');
    eq('three-way merge', await run('git merge feature -m "Merge branch \'feature\'"'), "Auto-merging f.txt\nMerge made by the 'ort' strategy.\n f.txt | 1 +\n 1 file changed, 1 insertion(+)\n", 0);
    check('the merged file', fs.read(H + '/r/f.txt'), 'one\nTWO\nthree\nfour\n');
    eq('log of a merge', await run('git log --oneline'), '9977953 Merge branch \'feature\'\n1710077 change two\n5301085 add four\n96b7eac start\n');
    eq('a merge commit in log', await run('git log -n 1'), "commit 99779536443f5f071bce87bc048464c18d99a6cf\nMerge: 1710077 5301085\nAuthor: Student <student@lab>\nDate:   Thu Oct 1 14:00:00 2026 +0000\n\n    Merge branch 'feature'\n");
    // a content conflict
    await run('git switch -q -c side; printf "one\\nSIDE\\nthree\\nfour\\n" > f.txt; git commit -q -am side; git switch -q main; printf "one\\nMAIN\\nthree\\nfour\\n" > f.txt; git commit -q -am mainchange');
    eq('conflict', await run('git merge side'), 'Auto-merging f.txt\nCONFLICT (content): Merge conflict in f.txt\nAutomatic merge failed; fix conflicts and then commit the result.\n', 1);
    check('conflict markers in the file', fs.read(H + '/r/f.txt'), 'one\n<<<<<<< HEAD\nMAIN\n=======\nSIDE\n>>>>>>> side\nthree\nfour\n');
    eq('status in a conflict', await run('git status'), 'On branch main\nYou have unmerged paths.\n  (fix conflicts and run "git commit")\n  (use "git merge --abort" to abort the merge)\n\nUnmerged paths:\n  (use "git add <file>..." to mark resolution)\n\tboth modified:   f.txt\n\nno changes added to commit (use "git add" and/or "git commit -a")\n');
    eq('status -s in a conflict', await run('git status -s'), 'UU f.txt\n');
    eq('commit in a conflict', await run('git commit -m x'), "error: Committing is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.\nU\tf.txt\n", 128);
    eq('combined diff', await run('git diff'), 'diff --cc f.txt\nindex 22783f6,43cfdec..0000000\n--- a/f.txt\n+++ b/f.txt\n@@@ -1,4 -1,4 +1,8 @@@\n  one\n++<<<<<<< HEAD\n +MAIN\n++=======\n+ SIDE\n++>>>>>>> side\n  three\n  four\n');
    eq('merge again in a conflict', await run('git merge side'), "error: Merging is not possible because you have unmerged files.\nhint: Fix them up in the work tree, and then use 'git add/rm <file>'\nhint: as appropriate to mark resolution and make a commit.\nfatal: Exiting because of an unresolved conflict.\n", 128);
    eq('switch in a conflict', await run('git switch feature'), 'error: you need to resolve your current index first\nf.txt: needs merge\n', 1);
    eq('ls-files -s in a conflict', await run('git ls-files -s'), /^100644 61780798[0-9a-f]{32} 0\tb.txt\n100644 [0-9a-f]{40} 1\tf.txt\n100644 22783f6[0-9a-f]{33} 2\tf.txt\n100644 43cfdec[0-9a-f]{33} 3\tf.txt\n$/);
    eq('checkout --theirs', await run('git checkout --theirs f.txt; cat f.txt'), 'Updated 1 path from the index\none\nSIDE\nthree\nfour\n');
    eq('checkout -m', await run('git checkout -m f.txt; head -2 f.txt'), 'Recreated 1 merge conflict\none\n<<<<<<< ours\n');
    await run('echo resolved > f.txt');
    eq('resolved', await run('git add f.txt; git status'), 'On branch main\nAll conflicts fixed but you are still merging.\n  (use "git commit" to conclude merge)\n\nChanges to be committed:\n\tmodified:   f.txt\n\n');
    eq('conclude', await run('git commit --no-edit'), "[main b28df6f] Merge branch 'side'\n", 0);
    check('MERGE_HEAD gone', fs.exists(H + '/r/.git/MERGE_HEAD'), false);
    // add/add, modify/delete, a clean change beside a conflict, an untracked file in the way, abort
    await run('git switch -q -c s2; printf "1\\nS\\n3\\n4\\n5\\n6\\n7\\n8\\nS9\\n" > n.txt; echo sideadd > add.txt; echo o > o.txt; git add .; git commit -q -m s2; git switch -q main; printf "1\\n2\\n3\\n4\\n5\\n6\\n7\\n8\\n9\\n" > n.txt; git add n.txt; git commit -q -m base-n');
    await run('git switch -q s2; git rm -q b.txt; git commit -q -m rmb; git switch -q main; echo mb > b.txt; printf "1\\nM\\n3\\n4\\n5\\n6\\n7\\n8\\n9\\n" > n.txt; echo mainadd > add.txt; git add .; git commit -q -m m2; echo junk > o.txt');
    eq('untracked file in the way of a merge', await run('git merge s2'), 'error: The following untracked working tree files would be overwritten by merge:\n\to.txt\nPlease move or remove them before you merge.\nAborting\nMerge with strategy ort failed.\n', 2);
    await run('rm o.txt');
    eq('three kinds of conflict', await run('git merge s2'), 'Auto-merging add.txt\nCONFLICT (add/add): Merge conflict in add.txt\nCONFLICT (modify/delete): b.txt deleted in s2 and modified in HEAD.  Version HEAD of b.txt left in tree.\nAuto-merging n.txt\nCONFLICT (add/add): Merge conflict in n.txt\nAutomatic merge failed; fix conflicts and then commit the result.\n', 1);
    eq('status -s of three conflicts', await run('git status -s'), 'AA add.txt\nUD b.txt\nAA n.txt\nA  o.txt\n');
    eq('merge --abort', await run('git merge --abort; git status -s; cat b.txt'), 'mb\n', 0);
    // a content conflict next to a clean change from the other side
    await run('git switch -q -c s3 HEAD~1; printf "1\\nS\\n3\\n4\\n5\\n6\\n7\\n8\\nS9\\n" > n.txt; git commit -q -am s3; git switch -q main');
    eq('zealous merge', await run('git merge s3 >/dev/null; cat n.txt'), '1\n<<<<<<< HEAD\nM\n=======\nS\n>>>>>>> s3\n3\n4\n5\n6\n7\n8\nS9\n');
    eq('dense combined diff hides the clean part', await run('git diff | tail -1'), '  5\n');
    eq('resolve by checkout --ours and merge --continue', await run('git checkout --ours n.txt; git add n.txt; git merge --continue'), /^Updated 1 path from the index\n\[main [0-9a-f]{7}\] Merge branch 's3'\n$/);
    eq('local changes in the way of a merge', await run('git switch -q -c s4; echo s4 > b.txt; git commit -q -am s4; git switch -q main; echo local > b.txt; git merge s4'), /^Updating [0-9a-f]{7}\.\.[0-9a-f]{7}\nerror: Your local changes to the following files would be overwritten by merge:\n\tb.txt\n/);
    eq('merge into a feature branch says so', await run('git restore b.txt; git switch -q -c s5 HEAD~1; git merge -q --no-ff main 2>&1; git log -1 --format=%s'), "Merge branch 'main' into s5\n");
    check('merge3 api', GIT.merge3('a\nb\nc\n', 'A\nb\nc\n', 'a\nb\nC\n', 'HEAD', 'x').text, 'A\nb\nC\n');
  }

  // ---- reset
  {
    const { run } = fresh();
    await run('mkdir r; cd r; git init -q; echo 1 > f; git add f; git commit -q -m one; echo 2 > f; git commit -q -am two; echo 3 > f; git commit -q -am three');
    eq('reset --hard HEAD~1', await run('git reset --hard HEAD~1; cat f'), /^HEAD is now at [0-9a-f]{7} two\n2\n$/);
    eq('reflog keeps the way back', await run('git reflog | head -2'), /^[0-9a-f]{7} HEAD@\{0\}: reset: moving to HEAD~1\n[0-9a-f]{7} HEAD@\{1\}: commit: three\n$/);
    eq('reset --hard to a reflog entry', await run('git reset -q --hard ORIG_HEAD; git log --format=%s -1'), 'three\n');
    eq('reset too far', await run('git reset --hard HEAD~5'), "fatal: ambiguous argument 'HEAD~5': unknown revision or path not in the working tree.\nUse '--' to separate paths from revisions, like this:\n'git <command> [<revision>...] -- [<file>...]'\n", 128);
    eq('reset --soft', await run('git reset --soft HEAD~1; git status -s'), 'M  f\n');
    eq('reset (mixed)', await run('git reset'), 'Unstaged changes after reset:\nM\tf\n', 0);
    eq('reset a path', await run('echo n > n; git add n f; git reset n; git status -s'), 'M  f\n?? n\n');
    eq('reset HEAD path', await run('git reset HEAD f'), 'Unstaged changes after reset:\nM\tf\n');
    eq('reset --hard removes tracked files that are not in the commit', await run('git add n; git commit -q -m n; git reset -q --hard HEAD~1; ls'), 'f\n');
    eq('amend', await run('echo 4 > f; git commit -q -am four; git commit --amend -m "four, amended"'), /^\[main [0-9a-f]{7}\] four, amended\n Date: Thu Oct 1 14:00:00 2026 \+0000\n 1 file changed, 1 insertion\(\+\), 1 deletion\(-\)\n$/);
    eq('amend keeps one commit', await run('git log --format=%s'), 'four, amended\ntwo\none\n');
    eq('empty message', await run('echo 5 > f; git commit -am ""'), 'Aborting commit due to empty commit message.\n', 1);
    eq('gc', await run('git gc; git log --format=%s | head -1'), 'four, amended\n', 0);
    eq('cat-file -p a tree', await run('git cat-file -p HEAD:'), /^100644 blob [0-9a-f]{40}\tf\n$/);
  }

  // ---- the caps: a repository that grows too big says so and changes nothing
  {
    const { run, fs } = fresh();
    await run('mkdir r; cd r; git init -q');
    const big = (c) => (c + 'x'.repeat(99) + '\n').repeat(1500);   // 150 KB
    fs.write(H + '/r/big.txt', big('a'));
    eq('a big file commits', await run('git add big.txt; git commit -q -m big; git log --oneline | wc -l'), /^\s*1\n$/);
    fs.write(H + '/r/big.txt', big('b'));
    const before = fs.read(H + '/r/.git/objects.json');
    eq('the next version is too big', await run('git add big.txt'), /^fatal: the repository is too big for this practice terminal: \.git\/objects\.json would be \d+ KB, and a file here can hold at most 256 KB\.\nhint: /, 128);
    check('objects.json unchanged', fs.read(H + '/r/.git/objects.json'), before);
    eq('the repository still works', await run('git status -s; git log --oneline | wc -l'), /^ M big\.txt\n\s*1\n$/);
    eq('after a reset to nothing, gc makes room', await run('git rm -q --cached big.txt; rm big.txt; git commit -q -m gone; git add -A; git status -s'), '');
    // the 2 MB limit for all files
    const { run: run2, fs: fs2 } = fresh();
    await run2('mkdir r; cd r; git init -q');
    for (let i = 0; i < 9; i++) fs2.write(H + '/r/f' + i, String(i).repeat(200000));
    eq('the disk fills up', await run2('git add .'), /^fatal: (this practice terminal is out of space|the repository is too big)/, 128);
    check('the file system is intact', fs2.usage().bytes <= SHELL.LIMITS.bytes, true);
    eq('and git still answers', await run2('git status -s | head -1'), '?? f0\n');
  }

  // ---- hostile .git data: every damaged or planted file gives a fatal message, never an exception or a polluted prototype
  {
    const hostile = async (name, file, content, want) => {
      const { run, fs } = fresh();
      await run('mkdir r; cd r; git init -q; echo a > a.txt; git add a.txt; git commit -q -m one');
      fs.write(H + '/r/.git/' + file, typeof content === 'function' ? content(fs.read(H + '/r/.git/' + file)) : content);
      const r = await run('git status; git log --oneline; git diff; git branch; git add .');
      check('hostile ' + name, r.out, want);
      check('hostile ' + name + ': no internal error', /internal error/.test(r.out), false);
      check('hostile ' + name + ': prototype clean', ({}).polluted === undefined && Object.prototype.toString.call({}) === '[object Object]', true);
    };
    const fatal5 = (re) => new RegExp('^(?:' + re.source + '[^\\n]*\\n(?:hint: [^\\n]*\\n)?){5}$');
    await hostile('objects not JSON', 'objects.json', '{nope', fatal5(/fatal: \.git\/objects\.json is damaged: it is not valid JSON/));
    await hostile('objects without a table', 'objects.json', '[]', fatal5(/fatal: \.git\/objects\.json is damaged: it has no "objects" table/));
    await hostile('__proto__ as an id', 'objects.json', '{"v":1,"objects":{"__proto__":["blob","x"]},"polluted":1}', fatal5(/fatal: \.git\/objects\.json is damaged: the id "__proto__" is not 40 hexadecimal digits/));
    await hostile('an edited blob', 'objects.json', (t) => t.replace('["blob","a\\n"]', '["blob","evil\\n"]'), fatal5(/fatal: \.git\/objects\.json is damaged: object 7898192 does not match its id/));
    await hostile('a wrong shape', 'objects.json', '{"v":1,"objects":{"' + 'a'.repeat(40) + '":["blob",42]}}', fatal5(/fatal: \.git\/objects\.json is damaged: object aaaaaaa does not have the shape/));
    // a tree that would plant .git or climb out with ..: its id is right, but the name is refused
    const evilTree = (name) => { const blob = GIT.blobId('x\n'), tree = GIT.idOf({ type: 'tree', entries: [{ mode: '100644', name, id: blob }] }); return '{"v":1,"objects":{"' + blob + '":["blob","x\\n"],"' + tree + '":["tree",[["100644",' + JSON.stringify(name) + ',"' + blob + '"]]]}}'; };
    await hostile('a tree entry named .git', 'objects.json', evilTree('.git'), fatal5(/fatal: \.git\/objects\.json is damaged: object [0-9a-f]{7} does not have the shape/));
    await hostile('a tree entry named ..', 'objects.json', evilTree('..'), fatal5(/fatal: \.git\/objects\.json is damaged: object [0-9a-f]{7} does not have the shape/));
    await hostile('a tree entry with a slash', 'objects.json', evilTree('../../etc/passwd'), fatal5(/fatal: \.git\/objects\.json is damaged: object [0-9a-f]{7} does not have the shape/));
    await hostile('a commit whose tree is missing', 'objects.json', (t) => { const j = JSON.parse(t); for (const id in j.objects) if (j.objects[id][0] === 'tree') delete j.objects[id]; return JSON.stringify(j); }, fatal5(/fatal: \.git\/objects\.json is damaged: commit [0-9a-f]{7} points to a tree that is not there/));
    await hostile('HEAD garbage', 'HEAD', 'ref: refs/heads/../../x\n', fatal5(/fatal: \.git\/HEAD is damaged/));
    await hostile('HEAD at a missing commit', 'HEAD', 'b'.repeat(40) + '\n', fatal5(/fatal: \.git\/HEAD is damaged/));
    await hostile('index not JSON', 'index', 'DIRC', fatal5(/fatal: \.git\/index is damaged: it is not valid JSON/));
    await hostile('index path climbing out', 'index', (t) => t.replace('"a.txt"', '"../../../etc/passwd"'), fatal5(/fatal: \.git\/index is damaged: the path "\.\.\/\.\.\/\.\.\/etc\/passwd" is not allowed/));
    await hostile('index path into .git', 'index', (t) => t.replace('"a.txt"', '".git/HEAD"'), fatal5(/fatal: \.git\/index is damaged: the path "\.git\/HEAD" is not allowed/));
    await hostile('index blob missing', 'index', '{"v":1,"entries":[["a.txt","100644","' + 'c'.repeat(40) + '"]]}', fatal5(/fatal: \.git\/index is damaged: an entry is not \[path, mode, blob id\]/));
    await hostile('index file and directory', 'index', (t) => { const j = JSON.parse(t), e = j.entries[0]; j.entries.push(['a.txt/b', e[1], e[2]]); return JSON.stringify(j); }, fatal5(/fatal: \.git\/index is damaged: "a\.txt" is both a file and a directory/));
    await hostile('a broken branch', 'refs/heads/main', 'not a commit\n', /^(?:fatal: your current branch appears to be broken\n){2}$/);
    await hostile('bad config', 'config', '[core]\nthis is = = not\n[', /^fatal: bad config line 2 in file \.git\/config\n/);
    {
      // __proto__ is an ordinary file name, in the index and in trees
      const { run, fs } = fresh();
      await run('mkdir r; cd r; git init -q; echo p > __proto__; echo c > constructor; git add .; git commit -q -m proto');
      eq('__proto__ is a file like any other', await run('git ls-files; git show --stat --format= HEAD'), '__proto__\nconstructor\n __proto__   | 1 +\n constructor | 1 +\n 2 files changed, 2 insertions(+)\n');
      check('no pollution', ({}).p === undefined && Object.getPrototypeOf({}) === Object.prototype, true);
      check('index dictionary has no prototype', fs.read(H + '/r/.git/index').includes('"__proto__"'), true);
    }
    {
      // a tree that names itself many times over (each level twice): 2^25 paths if it were followed
      const { run, fs } = fresh();
      await run('mkdir r; cd r; git init -q');
      const objs = {}; const blob = GIT.blobId('x'); objs[blob] = ['blob', 'x'];
      let t = GIT.idOf({ type: 'tree', entries: [{ mode: '100644', name: 'f', id: blob }] }); objs[t] = ['tree', [['100644', 'f', blob]]];
      for (let k = 0; k < 25; k++) { const e = [{ mode: '40000', name: 'a', id: t }, { mode: '40000', name: 'b', id: t }]; const id = GIT.idOf({ type: 'tree', entries: e }); objs[id] = ['tree', e.map((x) => [x.mode, x.name, x.id])]; t = id; }
      const raw = 'tree ' + t + '\nauthor A <a@b> 1 +0000\ncommitter A <a@b> 1 +0000\n\nboom\n', c = GIT.idOf({ type: 'commit', raw }); objs[c] = ['commit', raw];
      fs.write(H + '/r/.git/objects.json', JSON.stringify({ v: 1, objects: objs })); fs.write(H + '/r/.git/refs/heads/main', c + '\n');
      const t0 = Date.now();
      eq('a tree that explodes', await run('git status'), 'fatal: a commit in this repository holds more files than this practice terminal can\n', 128);
      eq('log still works', await run('git log --oneline'), /^[0-9a-f]{7} boom\n$/, 0);
      check('it gives up quickly', Date.now() - t0 < 3000, true);
    }
    {
      // a saved copy of the whole file system, through makeFS's own checks, then git's
      const { run, fs } = fresh();
      await run('mkdir r; cd r; git init -q; echo a > a.txt; git add a.txt; git commit -q -m one');
      const saved = JSON.parse(JSON.stringify(fs.toJSON()));
      const fs2 = SHELL.makeFS(saved, { now: () => T0 }), sh2 = SHELL.makeShell({ fs: fs2, now: () => T0 });
      let out = ''; await sh2.exec('cd ~/r; git log --oneline; git status -s', { out: (s) => { out += s; }, err: (s) => { out += s; } });
      check('a repository survives saving and loading', out, /^[0-9a-f]{7} \(HEAD -> main\) one\n$/);
    }
  }

  // ---- random damage to every .git file, then commands: never an internal error (an exception the shell had to catch)
  {
    let seed = 7; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; }, pick = (a) => a[Math.floor(rnd() * a.length)];
    const CMDS = ['git status', 'git log --oneline --all', 'git diff', 'git add -A', 'git commit -qam x', 'git branch', 'git switch -q b', 'git merge b', 'git reset --hard HEAD~1', 'git show', 'git reflog', 'git ls-files -s', 'git gc', 'git checkout HEAD~1', 'git restore .', 'git merge --abort'];
    const FILES = ['objects.json', 'index', 'HEAD', 'refs/heads/main', 'refs/heads/b', 'config', 'logs/HEAD', 'MERGE_HEAD', 'ORIG_HEAD'];
    let internal = 0;
    for (let round = 0; round < 60; round++) {
      const { run, fs } = fresh();
      await run('mkdir r; cd r; git init -q; echo a > a.txt; echo b > b.txt; git add .; git commit -qm one; git branch b; echo c >> a.txt; git commit -qam two; git switch -q b; echo d >> a.txt; git commit -qam three; git switch -q main; git merge b >/dev/null');
      for (let k = 0; k < 2; k++) {
        const f = H + '/r/.git/' + pick(FILES); let t = fs.isFile(f) ? fs.read(f) : ''; const i = Math.floor(rnd() * t.length), m = Math.floor(rnd() * 4);
        t = m === 0 ? t.slice(0, i) + t.slice(i + 3) : m === 1 ? t.slice(0, i) + pick(['"', '}', ']', '__proto__', '..', '/', '0', 'null', '[]', '\n']) + t.slice(i) : m === 2 ? t.replace(/[0-9a-f]{40}/, (h) => h.slice(0, 39) + (h[39] === '0' ? '1' : '0')) : t.replace(/"[^"]*"/, pick(['"__proto__"', '"../x"', '".git"', '"a.txt/x"']));
        fs.write(f, t);
      }
      for (let k = 0; k < 5; k++) if (/internal error/.test((await run(pick(CMDS))).out)) internal++;
    }
    check('damaged .git never gives an internal error', internal, 0);
    check('and never pollutes a prototype', Object.keys(Object.prototype).length, 0);
  }

  // ---- optional: the same scenarios through the real git
  if (process.argv.includes('--real')) await realGit();

  console.log(bad ? bad + ' of ' + count + ' git checks FAILED' : 'git: all ' + count + ' checks passed');
  process.exit(bad ? 1 : 0);
})();

// Each scenario is a list of command lines, run one by one in a fresh directory by bash with the real git and by the practice shell; the
// output (stdout and stderr together) and exit status of every line must agree. Lines that make files are the same in both shells.
const SCENARIOS = [
  ['git init -q', 'echo hi > a.txt', 'git status', 'git add a.txt', 'git commit -m first', 'echo more >> a.txt', 'git diff', 'git commit -am second', 'git log', 'git show HEAD~1', 'git status -s'],
  ['git init -q', 'printf "1\\n2\\n3\\n4\\n5\\n6\\n7\\n8\\n9\\n" > n.txt', 'echo d > del.txt', 'git add .', 'git commit -q -m base', 'git switch -q -c side', 'printf "1\\nS\\n3\\n4\\n5\\n6\\n7\\n8\\nS9\\n" > n.txt', 'git rm -q del.txt', 'git commit -q -am side',
    'git switch -q main', 'printf "1\\nM\\n3\\n4\\n5\\n6\\n7\\n8\\n9\\n" > n.txt', 'echo e > del.txt', 'git commit -q -am main', 'git merge side', 'git status', 'git diff', 'git diff --stat', 'git ls-files -s', 'git add n.txt del.txt', 'git commit --no-edit', 'git log --oneline'],
  ['git init -q', 'mkdir -p src/lib build', 'echo "print(1)" > src/main.py', 'echo x > src/lib/u.py', 'printf "build/\\n*.log\\n" > .gitignore', 'echo l > a.log', 'git status -sb', 'git add .', 'git commit -q -m init', 'git mv src/lib/u.py src/u.py', 'git commit -m up',
    'git branch -v', 'git tag -a v1 -m one', 'git log --oneline --decorate', 'git reset --hard HEAD~1', 'git reflog'],
];
async function realGit() {
  const cp = require('child_process'), os = require('os'), nodefs = require('fs'), path = require('path');
  if (cp.spawnSync('git', ['--version']).status !== 0) { console.log('real git: skipped (no git on the PATH)'); return; }
  console.log('real git: ' + cp.spawnSync('git', ['--version'], { encoding: 'utf8' }).stdout.trim());
  for (const [k, lines] of SCENARIOS.entries()) {
    const dir = nodefs.mkdtempSync(path.join(os.tmpdir(), 'pgit-')), home = path.join(dir, 'home'), repo = path.join(dir, 'r');
    nodefs.mkdirSync(home); nodefs.mkdirSync(repo);
    const env = { PATH: process.env.PATH, HOME: home, TZ: 'UTC', LC_ALL: 'C', GIT_CONFIG_NOSYSTEM: '1', GIT_AUTHOR_DATE: '2026-10-01T14:00:00+0000', GIT_COMMITTER_DATE: '2026-10-01T14:00:00+0000' };
    cp.spawnSync('bash', ['-c', 'git config --global init.defaultBranch main; git config --global user.name Student; git config --global user.email student@lab'], { env });
    const script = lines.map((l, i) => 'echo "@@@' + i + '"; ' + l + ' 2>&1; echo "@@@exit $?"').join('\n');
    const realOut = cp.spawnSync('bash', ['-c', script], { cwd: repo, env, encoding: 'utf8' }).stdout.split(repo).join('/home/student/r');
    const real = realOut.split(/@@@\d+\n/).slice(1);
    const { run } = fresh(); await run('git config --global user.name Student; git config --global user.email student@lab; mkdir r; cd r');
    for (let i = 0; i < lines.length; i++) {
      const r = await run(lines[i]), ours = r.out + '@@@exit ' + r.exit + '\n';
      check('real git, scenario ' + (k + 1) + ', ' + lines[i], ours, real[i]);
    }
    nodefs.rmSync(dir, { recursive: true, force: true });
  }
}
