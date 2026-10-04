// Lesson content, (c) 2026 Michael Sayers, licensed CC BY-SA 4.0 (see LICENSE-CONTENT.md).
// How Machines Learn: machine learning from the inside, at a size that fits in a browser. Students write every model themselves in
// Python (Skulpt), on datasets of a few dozen examples; the figures (widgets.js: knn) do what would be too slow to run by hand.
// The first course written to LESSON_STANDARD.md from its first lesson: standard: 1, named skills (course.skills, tagged on every quick
// check and exercise), units of three lessons ending in a checkpoint (checkpoint: true: no new material, mixed questions).
window.COURSES = window.COURSES || [];
window.COURSES.push({
  id: 'ml', code: 'SC 109', short: 'Machine learning', lang: 'python', status: 'developing', standard: 1,
  title: 'How Machines Learn',
  grades: 'Grades 9–12 · after Python up to dictionaries',
  audience: `<p><b>Grades 9–12</b>, after <em>Introduction to Python</em> (SC 101) up to lesson 11, Dictionaries: you should be able to write a function with a loop, use a list, and count things with a dictionary. No mathematics beyond Pythagoras' theorem is needed; where a lesson uses more, it says what and shows it.</p>`,
  tagline: 'Spam filters, nearest neighbours, honest tests, perceptrons, gradient descent and decision trees: build the models behind machine learning yourself, small enough to understand every line.',
  description: `<p>A program that learns is still a program. Somebody wrote it, it follows its instructions, and it can be read line by line. What is different is where its decisions come from: not from rules a programmer typed in, but from <em>examples</em>, counted, compared and measured.</p>
<p>In this course you write those programs yourself, in Python, on datasets small enough to print: a dozen messages, sixteen pieces of fruit. You build a spam filter that learns from labelled messages, a classifier that asks a new example's nearest neighbours, and, most important of all, the honest test that tells you whether a model is any good or has only memorised its examples.</p>
<p>Each lesson starts from a true story, from a 1951 Air Force report to the flu predictions that went wrong in 2013, and ends with two programs you write and the computer checks. Interactive figures let you drag a new example around and watch the model change its mind.</p>`,
  outcomes: [
    'Explain the difference between a program whose rules were written by hand and one whose rules were learned from examples',
    'Build a word-counting spam filter from labelled messages, and use it to label a message it has never seen',
    'Name a model\'s two kinds of mistake, false positives and false negatives, and say which matters more for a given job',
    'Measure the distance between two examples, and label a new example by its nearest neighbours',
    'Choose k for k nearest neighbours, and say what a k that is too small or too large does',
    'Split data into a training set and a test set, and say why a model must never be judged on the examples it learned from',
    'Compute accuracy and a confusion table, and say when accuracy hides a model that is useless',
    'Recognise overfitting: a model that is perfect on its training examples and worse on new ones',
    'Train a perceptron by hand and in code, and say why it can never learn exclusive or',
    'Fit a model by gradient descent, and choose a learning rate that neither crawls nor overshoots',
    'Build a decision tree by information gain, measuring uncertainty in bits, and read the tree it makes'
  ],
  howItWorks: `<h3>How to use these pages</h3><p>Every code box has a <b>Run</b> button. Some ask you to write down what you think the program will print before it runs: do it, because a wrong guess you then correct is remembered better than a right answer you were given. <b>Quick checks</b> ask how sure you are before they mark you; the questions come back on the Review page after a day, then after longer gaps. Each lesson ends with a puzzle or a trace and two programs to write, which the computer checks against its own tests. Lessons 4 and 8 are <b>checkpoints</b>: no new ideas, just mixed questions on the three lessons before them.</p>`,
  affirm: ['That passes every test.', 'Correct: the tests agree.', 'Right. On to the next one.', 'Every test passes.'],
  // The named skills of the course (LESSON_STANDARD.md §4). Each quick check and exercise names the skill it practises; the skills map on
  // the course page and on #/today shows each as not started, practising or secure.
  skills: [
    { id: 'rules', name: 'Write a classifier from hand-made rules' },
    { id: 'mistakes', name: 'Tell false positives from false negatives' },
    { id: 'counting', name: 'Learn word counts from labelled examples' },
    { id: 'scoring', name: 'Label a new example from learned counts' },
    { id: 'distance', name: 'Measure the distance between two examples' },
    { id: 'nearest', name: 'Label an example by its nearest neighbour' },
    { id: 'knn', name: 'Take a vote of the k nearest neighbours' },
    { id: 'choose-k', name: 'Choose k, and see what it changes' },
    { id: 'test-set', name: 'Judge a model on examples it never saw' },
    { id: 'accuracy', name: 'Compute accuracy' },
    { id: 'confusion', name: 'Count a confusion table' },
    { id: 'overfitting', name: 'Recognise overfitting' },
    { id: 'weighted-sum', name: 'Score an example with weights and a bias' },
    { id: 'perceptron-rule', name: 'Update a perceptron after a mistake' },
    { id: 'linear-limits', name: 'Say what one straight line cannot separate' },
    { id: 'loss', name: 'Measure error with the mean squared error' },
    { id: 'gradient', name: 'Take a step of gradient descent' },
    { id: 'learning-rate', name: 'Choose a learning rate' },
    { id: 'entropy', name: 'Measure how mixed a group is, in bits' },
    { id: 'info-gain', name: 'Choose the question with the most information gain' },
    { id: 'decision-tree', name: 'Follow and read a decision tree' }
  ],
  lessons: [
    /* ================================================================== */
    {
      standards: ['3A-DA-12', '3B-AP-08'],
      title: 'Rules or examples?', summary: 'Two ways to make a spam filter: write the rules yourself, or let the program count words in messages someone has already sorted. What a classifier is, its two kinds of mistake, and learning as counting.',
      blocks: [
        `<p>In August 2002 the programmer Paul Graham published an essay called <em>A Plan for Spam</em>. Like everyone else with an email address, he was drowning in junk mail, and like most programmers he had first tried to stop it with rules. He spent about six months writing software that looked for the features of spam: certain words, certain phrases, shouting capital letters. Some rules were good. Looking only for the word <em>click</em> caught 79.7% of the spam he had collected, but it also flagged 1.2% of his real mail, from people who had written "click" for an honest reason.</p>
<p>Then he tried something else. He took about 4,000 spam messages and 4,000 good ones, already sorted, and let a program count how often every word appeared in each pile. Words like <em>madam</em> and <em>promotion</em> turned out to belong almost only to spam; <em>continuation</em> and <em>describe</em> almost only to real mail. Nobody had told the program any of that. Filtering new mail with those counts, it missed fewer than 5 spams in every 1,000, and in his tests it did not flag a single good message.</p>
<p>So how can a program that nobody gave a single rule beat six months of rules written by an expert?</p>`,
        `<h2>A rule written by hand</h2>
<p>Every program in this course is a <b>classifier</b>: it takes an example and gives it a <b>label</b>. A spam filter takes a message and labels it spam or not spam. Before learning anything, here is the old way: a rule a person wrote.</p>
<div class="stmt"><p><span class="kind">Rule (classifier).</span> A classifier is a function from an example to a label. Here the example is a string and the label is <code>True</code> (spam) or <code>False</code> (not spam). How it decides is the whole question of this course.</p></div>`,
        { predict: true, play: `def is_spam(message):
    words = message.lower().split()
    return "click" in words or "free" in words

print(is_spam("Click here for a free prize"))
print(is_spam("Lunch at noon?"))
print(is_spam("Free tickets for the band, want one?"))`, caption: 'True, False, True. The first is spam and the rule catches it. The second is a friend, and the rule lets it through. The third is also a friend offering a spare ticket, but it contains "free", so the rule calls it spam. A rule cannot tell why a word is there. Try adding a rule for "prize", and find a friendly message it gets wrong too.' },
        `<p>The third message shows the trouble with rules. Any word that spammers use, honest people use as well. A person writing rules must think of every exception, and the spammers change their words every week. And a rule can be wrong in two different ways, which matter differently.</p>
<div class="stmt"><p><span class="kind">Rule (two kinds of mistake).</span> A <b>false positive</b> is a good message labelled spam: a friend's message lost in the junk folder. A <b>false negative</b> is a spam labelled good: junk in your inbox. "Positive" means the label the filter is looking for, here spam.</p></div>`,
        { check: 'A filter lets <em>"You have WON $1,000, claim it now"</em> into the inbox. What kind of mistake is that?', skill: 'mistakes', options: ['A false positive', 'A false negative', 'Not a mistake: it is not spam'], answer: 1, wrong: ['A false positive is the other mistake: a good message wrongly called spam. Here a spam was wrongly called good.', null, 'It is spam: unasked-for prize claims are the classic kind. The filter called it good, so the filter was wrong.'], why: 'The message is spam and the filter said it was good: it missed one it was looking for. That is a false negative. A false positive would be a friend\'s message sent to the junk folder.' },
        `<h2>Learning from examples</h2>
<p>Graham's idea was to stop guessing which words matter and <em>count</em> them. Somebody sorts some messages into two piles by hand, which people do anyway when they press "report spam". Those labelled messages are the <b>training data</b>. Then a program counts every word in each pile.</p>
<div class="stmt"><p><span class="kind">Rule (training).</span> <b>Training data</b> is a set of examples with the right labels already attached. A model <b>learns</b> by computing something from them; here, a dictionary of word counts for each label. Nothing about spam is written in the program: it is all in the data.</p></div>`,
        { predict: true, play: `spam = ["win a free prize now", "free money click now", "click to win cash"]
good = ["lunch at noon", "the band is free on friday", "notes from class now"]

def count_words(messages):
    counts = {}
    for m in messages:
        for w in m.split():
            counts[w] = counts.get(w, 0) + 1
    return counts

spam_counts = count_words(spam)
good_counts = count_words(good)
print(spam_counts["free"], good_counts["free"])
print(spam_counts["now"], good_counts["now"])
print(spam_counts.get("lunch", 0))`, caption: '2 1, then 2 1, then 0. "free" appears in two spams and one good message, "now" the same; "lunch" never appears in spam, so get returns the default, 0, instead of stopping with a KeyError. Six messages are far too few to trust, but the program is the same one that would count four thousand. Add a spam of your own and run it again.' },
        { check: 'In <code>counts[w] = counts.get(w, 0) + 1</code>, what happens the first time the word <code>w</code> is met?', skill: 'counting', options: ['A <code>KeyError</code>, because <code>w</code> is not in the dictionary yet', '<code>counts[w]</code> becomes 1', '<code>counts[w]</code> becomes 0'], answer: 1, wrong: ['That is what counts[w] + 1 would do. get(w, 0) never fails: for a missing key it returns the default you give it, here 0.', null, 'get returns 0 for the missing word, but then 1 is added before anything is stored: 0 + 1 is 1.'], why: 'counts.get(w, 0) is 0 for a word not seen before, and 0 + 1 = 1 is stored under w. The next time, get returns 1 and 2 is stored. This one line is the counting pattern from the Dictionaries lesson of SC 101.' },
        `<h2>Scoring a new message</h2>
<p>Counts are not a decision yet. To label a new message, look up each of its words: a word seen more often in spam is evidence for spam, a word seen more often in good mail is evidence against. Add the evidence up.</p>
<div class="stmt"><p><span class="kind">Rule (a score).</span> For each word of the new message, add its spam count and subtract its good count. A total above 0 means spam, below 0 means good. Words never seen add nothing. (Graham's filter turned counts into probabilities, which works better on real mail, but the idea is the same: every word votes, and the training data decides how.)</p></div>`,
        { predict: true, play: `spam_counts = {"win": 2, "a": 1, "free": 2, "prize": 1, "now": 2, "money": 1, "click": 2, "to": 1, "cash": 1}
good_counts = {"lunch": 1, "at": 1, "noon": 1, "the": 1, "band": 1, "is": 1, "free": 1, "on": 1, "friday": 1, "notes": 1, "from": 1, "class": 1, "now": 1}

def score(message):
    total = 0
    for w in message.lower().split():
        total = total + spam_counts.get(w, 0) - good_counts.get(w, 0)
    return total

print(score("click now to win"))
print(score("free lunch on friday"))
print(score("see you soon"))`, caption: '6, then −2, then 0. "click now to win" collects 2 + 1 + 1 + 2. "free lunch on friday" contains the spammy word "free", the one the hand-written rule fell for, but "lunch", "on" and "friday" each count against spam and outvote it. "see you soon" has no word the filter has met, so it has no evidence at all: 0.' },
        `<p>Here are both filters side by side, on four messages that neither has seen. The rule was written by a person; the counts came from the six training messages above. Before you run it, decide which messages you expect each filter to get right.</p>`,
        { play: `spam = ["win a free prize now", "free money click now", "click to win cash"]
good = ["lunch at noon", "the band is free on friday", "notes from class now"]
spam_counts, good_counts = {}, {}
for m in spam:
    for w in m.split():
        spam_counts[w] = spam_counts.get(w, 0) + 1
for m in good:
    for w in m.split():
        good_counts[w] = good_counts.get(w, 0) + 1

def rule(message):
    words = message.lower().split()
    return "click" in words or "free" in words

def learned(message):
    total = 0
    for w in message.lower().split():
        total = total + spam_counts.get(w, 0) - good_counts.get(w, 0)
    return total > 0

new = [["claim your free prize", True], ["free pizza at lunch on friday", False],
       ["click to win now", True], ["can you send the class notes", False]]
for message, is_spam in new:
    print("rule right:", rule(message) == is_spam, " learned right:", learned(message) == is_spam, " ", message)`, caption: 'The rule gets three of four: it calls the pizza invitation spam because of "free". The learned filter gets all four. Four messages prove nothing, and lesson 3 is about testing properly; but notice that nobody told the learned filter that "lunch" is a friendly word.' },
        { check: 'The learned filter says <em>"free pizza at lunch on friday"</em> is good. Where did it get the idea that "lunch" is a friendly word?', skill: ['scoring', 'rules'], options: ['A programmer added a rule about lunch', 'From the counts: "lunch" appeared in a good training message and in no spam', 'Python knows what the English word "lunch" means'], answer: 1, wrong: ['Nobody wrote anything about lunch: look at the program. That is the point of learning from examples.', null, 'Python knows nothing about English. To it "lunch" is five characters; the only meaning it has comes from which pile it was counted in.'], why: '"lunch" was counted once in the good pile and never in the spam pile, so it adds −1 to any message it is in. Everything the filter "knows" is in its training data, which is also why bad or too few training examples make a bad filter.' },
        `<p>Now put the counting program together yourself, then write one filter of each kind.</p>`,
        {
          ex: {
            id: 'ml-1-1', kind: 'parsons', skill: 'counting', title: 'Put it in order: counting long words',
            prompt: `<p>Build the function <code>count_long_words(messages)</code>. It takes a list of messages and returns a dictionary that counts every word longer than three letters: short words like "a", "the" and "now" tell a filter little. For <code>["free money now", "free cash"]</code> it returns <code>{"free": 2, "money": 1, "cash": 1}</code>. Put each line at the right depth: in Python the indentation is part of the program. Not every block belongs.</p>`,
            lines: ['def count_long_words(messages):', '    counts = {}', '    for m in messages:', '        for w in m.split():', '            if len(w) > 3:', '                counts[w] = counts.get(w, 0) + 1', '    return counts'],
            distractors: ['                counts[w] = counts[w] + 1', '                counts[w] = 1'],
            tests: [{ call: 'sorted(count_long_words(["free money now", "free cash"]).items())', expect: "[('cash', 1), ('free', 2), ('money', 1)]" }, { call: 'count_long_words(["a an the"])', expect: '{}' }, { call: 'count_long_words([])', expect: '{}' }, { call: 'count_long_words(["click click click"])["click"]', expect: '3' }, { call: 'count_long_words(["prize", "big prize"])["prize"]', expect: '2' }],
            hints: ['The dictionary is made once, before any loop. The if goes inside the loop over words, and the counting line inside the if.', 'counts[w] + 1 stops with a KeyError the first time a word is met, and counts[w] = 1 forgets every earlier time it was seen: get(w, 0) + 1 handles both.'],
            followup: 'Change the function so that it ignores capital letters: "Free" and "free" should be counted as the same word. Which one method call is enough?'
          }
        },
        {
          ex: {
            id: 'ml-1-2', skill: 'rules', title: 'A filter of rules',
            prompt: `<p>Write <code>hand_rule(message)</code>, a filter made of rules. It returns <code>True</code> (spam) when either:</p>
<ul><li>the message contains the word <code>winner</code> or the word <code>prize</code>, in any mix of capitals and small letters (whole words, as <code>split()</code> separates them), or</li>
<li>the message contains three or more exclamation marks anywhere.</li></ul>
<p>Otherwise it returns <code>False</code>. So <code>hand_rule("You are a WINNER")</code> is <code>True</code>, <code>hand_rule("Wow!!! Great!")</code> is <code>True</code> and <code>hand_rule("See you at 3!")</code> is <code>False</code>.</p>`,
            starter: `def hand_rule(message):\n    words = message.lower().split()\n    ...\n    return False`,
            solution: `def hand_rule(message):\n    words = message.lower().split()\n    if "winner" in words or "prize" in words:\n        return True\n    return message.count("!") >= 3`,
            hints: ['Lower-case the message before splitting, so that "WINNER" becomes "winner". Then "winner" in words is True or False.', 'message.count("!") counts the exclamation marks in the whole string. Return True if the word test passes, otherwise return whether that count is at least 3.'],
            tests: [{ call: 'hand_rule("You are a WINNER")', expect: 'True' }, { call: 'hand_rule("Claim your prize today")', expect: 'True' }, { call: 'hand_rule("Wow!!! Great!")', expect: 'True' }, { call: 'hand_rule("See you at 3!")', expect: 'False' }, { call: 'hand_rule("Prizes for all")', expect: 'False' }, { call: 'hand_rule("")', expect: 'False' }, { call: 'hand_rule("winner")', expect: 'True' }],
            failTip: 'If "You are a WINNER" fails, the capitals are the problem: lower-case before you split.',
            followup: 'The rule says "Prizes for all" is not spam, because "prizes" is not the word "prize". Add a rule that catches it, then think of an honest message your new rule gets wrong. This is the six months Graham spent.'
          }
        },
        {
          ex: {
            id: 'ml-1-3', skill: 'scoring', title: 'Three answers',
            prompt: `<p>Write <code>classify(message, spam_counts, good_counts)</code>. It scores the message as in the lesson (for each word, in small letters, add its spam count and subtract its good count; a word missing from a dictionary counts 0) and returns the string <code>"spam"</code> if the score is above 0, <code>"good"</code> if it is below 0, and <code>"unsure"</code> if it is exactly 0. A filter that can say "I don't know" is more honest than one that must guess.</p>
<p>With <code>spam_counts = {"free": 2, "win": 2, "now": 2, "click": 2}</code> and <code>good_counts = {"free": 1, "lunch": 1, "now": 1, "class": 1}</code>, <code>classify("Win free stuff", spam_counts, good_counts)</code> is <code>"spam"</code> and <code>classify("hello there", spam_counts, good_counts)</code> is <code>"unsure"</code>.</p>`,
            starter: `def classify(message, spam_counts, good_counts):\n    total = 0\n    for w in message.lower().split():\n        ...\n    return "unsure"`,
            solution: `def classify(message, spam_counts, good_counts):\n    total = 0\n    for w in message.lower().split():\n        total = total + spam_counts.get(w, 0) - good_counts.get(w, 0)\n    if total > 0:\n        return "spam"\n    if total < 0:\n        return "good"\n    return "unsure"`,
            hints: ['Inside the loop: total = total + spam_counts.get(w, 0) - good_counts.get(w, 0). get with a default of 0 handles words that are missing.', 'After the loop, three cases: if total > 0 return "spam"; if total < 0 return "good"; otherwise return "unsure".'],
            tests: [{ call: 'classify("Win free stuff", {"free": 2, "win": 2, "now": 2, "click": 2}, {"free": 1, "lunch": 1, "now": 1, "class": 1})', expect: "'spam'" }, { call: 'classify("lunch in class", {"free": 2, "win": 2, "now": 2, "click": 2}, {"free": 1, "lunch": 1, "now": 1, "class": 1})', expect: "'good'" }, { call: 'classify("hello there", {"free": 2, "win": 2, "now": 2, "click": 2}, {"free": 1, "lunch": 1, "now": 1, "class": 1})', expect: "'unsure'" }, { call: 'classify("free lunch", {"free": 2, "win": 2, "now": 2, "click": 2}, {"free": 1, "lunch": 1, "now": 1, "class": 1})', expect: "'unsure'" }, { call: 'classify("FREE free FREE lunch", {"free": 2, "win": 2, "now": 2, "click": 2}, {"free": 1, "lunch": 1, "now": 1, "class": 1})', expect: "'spam'" }, { call: 'classify("", {"free": 2}, {})', expect: "'unsure'" }],
            failTip: 'If "free lunch" gives "good" or "spam", check the arithmetic: free is 2 − 1 = 1 and lunch is 0 − 1 = −1, so the total is exactly 0.',
            followup: 'Every word counts the same here, however rare. Graham divided each count by the number of messages in its pile, so that a bigger spam pile does not make every word look spammy. Try it: what changes if the spam pile is ten times larger than the good one?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A <b>classifier</b> takes an example and returns a label. Its rules can be written by a person or <b>learned</b> from examples.</li>
<li>Hand-written rules miss exceptions: every word spammers use, honest people use too, and spammers change their words.</li>
<li>A classifier makes two kinds of mistake: a <b>false positive</b> (good mail called spam) and a <b>false negative</b> (spam let through).</li>
<li><b>Training data</b> is examples with labels attached. Learning here is counting: a dictionary of word counts for each label, built with <code>counts.get(w, 0) + 1</code>.</li>
<li>To label a new message, every word votes with its counts. Words never seen add nothing.</li>
<li>The answer to the opening question: Graham's filter had no rules about spam, but it had about 8,000 sorted messages. It found the words that mattered, including thousands no person would have thought of, and its knowledge was only as good as those examples.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3A-DA-12', '3B-AP-09', '3B-DA-05'],
      title: 'Your nearest neighbours', summary: 'Examples as points, the distance between them, and the simplest learning method there is: give a new example the label of the most similar ones you have seen. What k is, and what changing it does.',
      blocks: [
        `<p>In 1951 two statisticians at the University of California, Berkeley, Evelyn Fix and Joseph Hodges, wrote a report for the US Air Force School of Aviation Medicine at Randolph Field, Texas. Its title was not inviting: <em>Discriminatory Analysis. Nonparametric Discrimination: Consistency Properties.</em> Its question was simple. You have measured many cases that belong to two groups, and now a new case arrives. Which group does it belong to, if you know nothing about the shape of the groups, no formula, only the measurements?</p>
<p>Their answer: look at the labelled cases nearest to the new one, and give it the label most of them have. They proved that with enough data this rule gets close to the best any method could do. The report was never published in a journal; it was finally printed in 1989, by which time the "nearest neighbour rule" was in every textbook of machine learning. It is still in use today, for example behind recommendations of the form "people like you also liked".</p>
<p>How can something as simple as "look at your neighbours" count as learning?</p>`,
        `<h2>How far apart?</h2>
<p>To find a neighbour, examples must be things that can be near or far. So describe each one by numbers, called <b>features</b>. This lesson sorts fruit, and each fruit is two features: its width and its height in centimetres. Most oranges are round, so about as wide as they are tall; most lemons are taller than they are wide. A fruit is then a point on a graph, and two similar fruits are two points close together.</p>
<div class="stmt"><p><span class="kind">Rule (distance).</span> The distance between points <code>a</code> and <code>b</code> is Pythagoras' theorem: the square root of (difference in the first feature)² + (difference in the second)². With more features, add one squared difference for each. Distance is never negative, is 0 only for identical points, and is the same from <code>a</code> to <code>b</code> as from <code>b</code> to <code>a</code>.</p></div>`,
        { predict: true, play: `import math

def distance(a, b):
    dx = a[0] - b[0]
    dy = a[1] - b[1]
    return math.sqrt(dx * dx + dy * dy)

print(distance([0, 0], [3, 4]))
print(distance([3, 4], [0, 0]))
print(round(distance([7.4, 7.2], [6.0, 8.0]), 2))`, caption: '5.0, 5.0, then 1.61. The first is the 3-4-5 triangle; swapping the points changes the signs of dx and dy but not their squares. The last is the distance between an orange 7.4 cm wide and 7.2 cm tall and a lemon 6.0 cm wide and 8.0 cm tall. Try two identical fruits: the distance is 0.0.' },
        { check: 'What is the distance between <code>[1, 1]</code> and <code>[4, 5]</code>?', skill: 'distance', options: ['7', '5.0', '25'], answer: 1, wrong: ['That adds the differences, 3 + 4. The distance across is shorter than going along and then up: square, add, then take the square root.', null, 'That is 3² + 4² before the square root. The square root of 25 is the distance, 5.0.'], why: 'The differences are 3 and 4. 3² + 4² = 25, and the square root of 25 is 5.0: the same 3-4-5 triangle as in the example.' },
        `<h2>The nearest neighbour</h2>
<p>Now the method. Keep every labelled fruit. When a new fruit arrives, measure its distance to each one, find the closest, and copy its label. That is all: the "learning" is remembering the examples, and the cleverness is in choosing what "near" means.</p>
<div class="stmt"><p><span class="kind">Rule (nearest neighbour).</span> To label a new example: compute its distance to every training example, find the smallest, and return that example's label. Finding the smallest is the loop you know from SC 101: keep the position of the best so far, and replace it when you find a better one.</p></div>`,
        { predict: true, play: `import math

fruit = [[7.4, 7.2], [7.8, 7.6], [6.0, 8.0], [6.2, 8.4]]
names = ["orange", "orange", "lemon", "lemon"]

def distance(a, b):
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)

def nearest(new):
    best = 0
    for i in range(1, len(fruit)):
        if distance(fruit[i], new) < distance(fruit[best], new):
            best = i
    return names[best]

print(nearest([7.5, 7.3]))
print(nearest([6.1, 8.1]))
print(nearest([6.6, 7.6]))`, caption: 'orange, lemon, lemon. The first two sit almost on top of a training fruit. The third is in between: 6.6 cm wide and 7.6 cm tall is 0.72 from the nearest lemon and 0.89 from the nearest orange, so it is called a lemon. Move it to [6.9, 7.4] and run again.' },
        { check: 'Every lemon in the training data is taller than it is wide. A new fruit is 7.0 cm wide and 7.1 cm tall, and its nearest training fruit is an orange. What does the nearest-neighbour rule say it is?', skill: 'nearest', options: ['A lemon, because it is taller than it is wide', 'An orange', 'It cannot say without a rule about shape'], answer: 1, wrong: ['The method has no rule about shape: nobody wrote one. It only copies the label of the closest example.', null, 'It needs no rule at all. That is the point of the method: the closest labelled example decides.'], why: 'The nearest-neighbour rule only copies the label of the closest training example, and that is an orange. Any "rule about shape" is only in our heads; the method sees distances.' },
        `<h2>Asking k neighbours</h2>
<p>One neighbour can be misleading. Real data has odd examples: a lemon that grew round, a label typed wrong. A new fruit that happens to land next to the odd one copies its label. The fix is to ask more than one neighbour and take a vote. The number asked is called <b>k</b>, and the method is <b>k nearest neighbours</b>, or <b>k-NN</b>.</p>
<div class="stmt"><p><span class="kind">Rule (k-NN).</span> Find the <code>k</code> training examples nearest to the new one, and return the label most of them have. With two labels, an odd <code>k</code> means the vote can never be a tie. <code>k = 1</code> trusts a single example, however odd; a <code>k</code> as large as the training set ignores where the new example is and always gives the majority label.</p></div>`,
        { fig: 'knn', k: 1, caption: 'Sixteen fruits: circles are oranges, triangles are lemons. The round lemon near the oranges is real enough: lemons vary. Drag the <b>?</b> just next to it with k = 1 and see the label. Then switch to k = 3. The shading shows the label a new fruit at each spot would get: with k = 1 the lemon region bulges out towards the oranges to take in the odd lemon, and at k = 3 the bulge is gone.' },
        { predict: true, play: `import math

fruit = [[7.4, 7.2], [7.8, 7.6], [7.0, 7.1], [6.0, 8.0], [6.2, 8.4], [6.9, 7.4]]
names = ["orange", "orange", "orange", "lemon", "lemon", "lemon"]

def distance(a, b):
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)

def knn(new, k):
    pairs = []
    for i in range(len(fruit)):
        pairs.append([distance(fruit[i], new), names[i]])
    pairs.sort()
    oranges = 0
    for pair in pairs[:k]:
        if pair[1] == "orange":
            oranges = oranges + 1
    print(k, "nearest:", oranges, "orange,", k - oranges, "lemon")
    if oranges > k / 2:
        return "orange"
    return "lemon"

print(knn([7.0, 7.3], 1))
print(knn([7.0, 7.3], 3))`, caption: 'With k = 1 the answer is lemon: the nearest fruit is the round lemon at [6.9, 7.4]. With k = 3 the two oranges next in line outvote it, 2 to 1: orange. Sorting the [distance, label] pairs puts the nearest first, because lists are compared by their first item. Try k = 5.' },
        { check: 'With two labels, why choose an odd <code>k</code> such as 3 or 5?', skill: ['choose-k', 'knn'], options: ['Odd numbers make the distances smaller', 'So the vote can never be tied', 'Because k must be a prime number'], answer: 1, wrong: ['k does not change any distance: it only decides how many of the nearest examples are asked.', null, 'Nothing needs to be prime: k = 9 is fine. What matters is that an odd number of votes between two labels cannot split evenly.'], why: 'With two labels and an even k, the vote can split 2–2 or 3–3, and the method has to break the tie somehow. With an odd k one label always has more votes.' },
        `<p>First trace the search for the nearest example by hand, then write the two functions every k-NN program needs.</p>`,
        {
          ex: {
            id: 'ml-2-1', kind: 'trace', skill: 'nearest', title: 'Trace the search for the nearest',
            prompt: `<p>This program finds the position of the smallest distance, as <code>nearest</code> does. Fill in the table: each row is a moment when line 3 starts a pass of the loop (and the last row, after line 6), with the values of <code>i</code> and <code>best</code> then. The first row is done for you.</p>`,
            code: `dists = [2.5, 1.2, 3.0, 0.8, 1.2]\nbest = 0\nfor i in range(1, len(dists)):\n    if dists[i] < dists[best]:\n        best = i\nprint(best)`,
            vars: ['i', 'best'],
            steps: [
              { line: 3, values: { i: '1', best: '0' }, show: true },
              { line: 3, values: { i: '2', best: '1' }, why: { best: { '0': 'In the pass for i = 1, 1.2 was smaller than dists[0], 2.5, so best became 1.' } } },
              { line: 3, values: { i: '3', best: '1' }, why: { best: { '2': '3.0 is not smaller than dists[1], 1.2, so best did not change.' } } },
              { line: 3, values: { i: '4', best: '3' } },
              { line: 6, values: { i: '4', best: '3' }, why: { best: { '4': 'dists[4] is 1.2, which is not smaller than dists[3], 0.8. A tie or a larger value never replaces the best.' } } }
            ],
            hints: ['best is a position, not a distance. It changes only when dists[i] is strictly smaller than dists[best].', 'best goes 0, then 1 (1.2 < 2.5), stays 1 for 3.0, becomes 3 (0.8 < 1.2), and stays 3 for the last 1.2.'],
            solution: '<p>i: 1, 2, 3, 4, 4. best: 0, 1, 1, 3, 3. The program prints <code>3</code>: the smallest distance, 0.8, is at position 3.</p>',
            followup: 'Change < to <= and trace it again. Which position does it print now, and why? When two training examples are the same distance away, which one should win?'
          }
        },
        {
          ex: {
            id: 'ml-2-2', skill: 'distance', title: 'Distance in any number of features',
            prompt: `<p>Real examples have more than two features: a fruit might have width, height, weight and colour. Write <code>distance(a, b)</code> for two lists of the same length, any length: the square root of the sum of the squared differences. For example <code>distance([0, 0], [3, 4])</code> is <code>5.0</code> and <code>distance([0, 0, 0], [1, 2, 2])</code> is <code>3.0</code>.</p>`,
            starter: `import math\n\ndef distance(a, b):\n    total = 0\n    ...\n    return math.sqrt(total)`,
            solution: `import math\n\ndef distance(a, b):\n    total = 0\n    for i in range(len(a)):\n        total = total + (a[i] - b[i]) ** 2\n    return math.sqrt(total)`,
            hints: ['Loop over the positions: for i in range(len(a)).', 'In the loop, add the square of the difference: total = total + (a[i] - b[i]) ** 2. The square root is taken once, after the loop.'],
            tests: [{ call: 'distance([0, 0], [3, 4])', expect: '5.0' }, { call: 'distance([1, 2, 3], [1, 2, 3])', expect: '0.0' }, { call: 'distance([0, 0, 0], [1, 2, 2])', expect: '3.0' }, { call: 'distance([5], [2])', expect: '3.0' }, { call: 'distance([1, 1, 1, 1], [2, 2, 2, 2])', expect: '2.0' }],
            failTip: 'If [5] and [2] gives 9.0, the square root is missing; if [0, 0, 0] and [1, 2, 2] gives something other than 3.0, check that each difference is squared before adding.',
            followup: 'Add a third feature to a fruit: weight in grams, around 150. Why would weight now decide almost every distance on its own, and what could you do about it? (Look up "feature scaling".)'
          }
        },
        {
          ex: {
            id: 'ml-2-3', skill: 'knn', title: 'k nearest neighbours',
            prompt: `<p>Write <code>knn(points, labels, new, k)</code>: <code>points</code> is a list of training examples (each a list of numbers), <code>labels[i]</code> is the label of <code>points[i]</code>, and the function returns the label most common among the <code>k</code> points nearest to <code>new</code>. The tests use two labels and an odd <code>k</code>, so there are no ties. <code>distance</code> is written for you.</p>
<p>With <code>points = [[1, 1], [1, 2], [5, 5], [6, 5], [5, 6]]</code> and <code>labels = ["cat", "cat", "dog", "dog", "dog"]</code>, <code>knn(points, labels, [1.5, 1.5], 3)</code> is <code>"cat"</code> and with <code>k = 5</code> it is <code>"dog"</code>.</p>`,
            starter: `import math\n\ndef distance(a, b):\n    total = 0\n    for i in range(len(a)):\n        total = total + (a[i] - b[i]) ** 2\n    return math.sqrt(total)\n\ndef knn(points, labels, new, k):\n    pairs = []\n    ...\n    return labels[0]`,
            solution: `import math\n\ndef distance(a, b):\n    total = 0\n    for i in range(len(a)):\n        total = total + (a[i] - b[i]) ** 2\n    return math.sqrt(total)\n\ndef knn(points, labels, new, k):\n    pairs = []\n    for i in range(len(points)):\n        pairs.append([distance(points[i], new), labels[i]])\n    pairs.sort()\n    votes = {}\n    for pair in pairs[:k]:\n        votes[pair[1]] = votes.get(pair[1], 0) + 1\n    best = None\n    for label in votes:\n        if best is None or votes[label] > votes[best]:\n            best = label\n    return best`,
            hints: ['Make a list of [distance, label] pairs, one for each training point, and sort it: the nearest come first. pairs[:k] is then the k nearest.', 'Count the labels of those k pairs in a dictionary with votes.get(label, 0) + 1, then find the label with the most votes, keeping the best so far as in nearest.'],
            tests: [{ call: 'knn([[1, 1], [1, 2], [5, 5], [6, 5], [5, 6]], ["cat", "cat", "dog", "dog", "dog"], [1.5, 1.5], 1)', expect: "'cat'" }, { call: 'knn([[1, 1], [1, 2], [5, 5], [6, 5], [5, 6]], ["cat", "cat", "dog", "dog", "dog"], [1.5, 1.5], 3)', expect: "'cat'" }, { call: 'knn([[1, 1], [1, 2], [5, 5], [6, 5], [5, 6]], ["cat", "cat", "dog", "dog", "dog"], [1.5, 1.5], 5)', expect: "'dog'" }, { call: 'knn([[1, 1], [1, 2], [5, 5], [6, 5], [5, 6]], ["cat", "cat", "dog", "dog", "dog"], [4, 4], 1)', expect: "'dog'" }, { call: 'knn([[1, 1], [1, 2], [5, 5], [6, 5], [5, 6]], ["cat", "cat", "dog", "dog", "dog"], [2, 3], 3)', expect: "'cat'" }, { call: 'knn([[7.4, 7.2], [6.0, 8.0], [6.9, 7.4]], ["orange", "lemon", "lemon"], [7.0, 7.3], 1)', expect: "'lemon'" }],
            failTip: 'If k = 5 gives "cat", the vote is not counted over all k: check the slice pairs[:k] and that every one of them adds a vote.',
            followup: 'Make knn break a tie by asking the single nearest neighbour, so that it also works with an even k. Then try it with three labels.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Describe each example by numbers, its <b>features</b>, and it becomes a point. Similar examples are close points.</li>
<li><b>Distance</b> is Pythagoras: the square root of the sum of the squared differences, one for each feature.</li>
<li>The <b>nearest-neighbour rule</b> (Fix and Hodges, 1951): give a new example the label of the closest training example.</li>
<li><b>k-NN</b> asks the <code>k</code> nearest and takes a vote. <code>k = 1</code> trusts one example, however odd; an odd <code>k</code> avoids ties between two labels; a very large <code>k</code> just gives the majority label everywhere.</li>
<li>The answer to the opening question: nearest neighbours learns by keeping its examples and deciding by similarity. It has no rule about shape or colour, and it still finds the boundary, wherever the examples put it.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-11', '3B-DA-07', '9.1.1.15'],
      title: 'Is it any good?', summary: 'How to tell whether a model works: a test set it never saw, accuracy, the confusion table and what accuracy hides, and overfitting, the model that is perfect on its examples and wrong on everything else.',
      blocks: [
        `<p>In 2008 Google launched <em>Google Flu Trends</em>. The idea was clever: people who are ill search for their symptoms, so the number of searches for flu-like things should rise and fall with the number of people who have flu. The team tested 50 million search terms against five years of official flu figures from the US Centers for Disease Control and Prevention (CDC) and kept the 45 that matched best. The model they built from those searches followed the past flu seasons closely, and it could estimate this week's flu a week or two before the CDC's reports came out.</p>
<p>Then it went wrong. In February 2013, the journal <em>Nature</em> reported that Flu Trends was estimating more than twice the proportion of doctor visits for flu-like illness that the CDC was measuring. Researchers who looked into it later pointed out that, with 50 million terms to choose from, some were bound to match five years of flu by chance. The team had already had to throw out search terms that went up and down with the winter but had nothing to do with flu, like high school basketball. A model could fit the seasons it was built from closely and still be partly a winter detector.</p>
<p>So how can a model that matched the past so well be so wrong about the future?</p>`,
        `<h2>Train and test</h2>
<p>The trap has a name. A model is always good on the examples it learned from: it was built to fit them. The question that matters is how it does on examples it has <em>not</em> seen, because those are the only ones it will ever be used on.</p>
<div class="stmt"><p><span class="kind">Rule (the test set).</span> Before training, put some of the labelled examples aside: the <b>test set</b>. Train only on the rest, the <b>training set</b>. Judge the model only on the test set. A score on the training set says how well the model remembers, not how well it will work.</p></div>`,
        { predict: true, play: `import math

train = [[7.4, 7.2], [7.8, 7.6], [7.0, 7.1], [7.6, 7.3], [6.0, 8.0], [6.2, 8.4], [5.8, 7.6], [6.9, 7.4]]
train_names = ["orange", "orange", "orange", "orange", "lemon", "lemon", "lemon", "lemon"]
test = [[7.2, 7.0], [8.0, 7.8], [6.5, 8.6], [7.0, 7.5]]
test_names = ["orange", "orange", "lemon", "orange"]
def distance(a, b):
    return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)

def nearest(new):
    best = 0
    for i in range(1, len(train)):
        if distance(train[i], new) < distance(train[best], new):
            best = i
    return train_names[best]

def accuracy(points, names):
    right = 0
    for i in range(len(points)):
        if nearest(points[i]) == names[i]:
            right = right + 1
    return right / len(points)

print("training set:", accuracy(train, train_names))
print("test set:", accuracy(test, test_names))`, caption: 'training set: 1.0, test set: 0.75. On the training set the nearest neighbour of every fruit is that fruit itself, at distance 0, so the score is perfect whatever the data. On fruit it never saw, one in four is wrong: the orange at [7.0, 7.5] sits next to the round lemon. Only the second number tells you anything.' },
        { check: 'A classmate trains a model on 200 labelled photos and reports "99% accuracy" on those same 200 photos. What can you conclude?', skill: 'test-set', options: ['The model is excellent', 'Very little: it was judged on the examples it learned from', 'The model is broken, because 99% is impossible'], answer: 1, wrong: ['That is exactly what Flu Trends seemed to be on the seasons it was built from. A model can score almost perfectly on its own examples and fail on new ones.', null, '99% is quite possible, and on the training examples it is easy: a nearest-neighbour model scores 100% there. The problem is not the number but where it was measured.'], why: 'The training examples are the ones the model was fitted to, so a high score there is expected and says little. Ask for its accuracy on photos it never saw.' },
        `<h2>Counting mistakes</h2>
<p><b>Accuracy</b> is the fraction of test examples labelled right. It is the first number anyone asks for, and it can hide a useless model. Remember the two kinds of mistake from lesson 1. A table that counts each kind separately says far more.</p>
<div class="stmt"><p><span class="kind">Rule (the confusion table).</span> For a filter looking for spam, count four things on the test set: spam caught (true positives), good mail flagged (false positives), spam missed (false negatives) and good mail let through (true negatives). Accuracy is (caught + let through) ÷ all. If 95 of 100 messages are good, a "filter" that lets everything through scores 95% accuracy and catches no spam at all.</p></div>`,
        { predict: true, play: `predicted = ["spam", "spam", "good", "good", "good", "spam"]
actual    = ["spam", "good", "good", "spam", "good", "spam"]

tp = fp = fn = tn = 0
for i in range(len(actual)):
    if predicted[i] == "spam" and actual[i] == "spam":
        tp = tp + 1
    elif predicted[i] == "spam":
        fp = fp + 1
    elif actual[i] == "spam":
        fn = fn + 1
    else:
        tn = tn + 1
print("caught:", tp, " false alarms:", fp)
print("missed:", fn, " rightly let in:", tn)
print("accuracy:", round((tp + tn) / len(actual), 2))`, caption: 'caught: 2, false alarms: 1, missed: 1, rightly let in: 2, accuracy 0.67. Message 2 is a false alarm (a good message flagged), message 4 a miss. The same 0.67 could come from many different tables; the table tells you which mistakes the filter makes, and for a spam filter a false alarm, a lost message from a friend, is usually the worse one.' },
        { check: 'A test set has 95 good messages and 5 spams. A filter labels every message "good". What is its accuracy?', skill: 'accuracy', options: ['0%, because it never catches spam', '95%', '5%'], answer: 1, wrong: ['Accuracy counts every right answer, and the 95 good messages are labelled right. That is the trouble: it looks excellent and is useless.', null, '5 is the number of spams, all of them missed. The right answers are the 95 good messages.'], why: '95 of the 100 labels are right, so accuracy is 95%, yet it catches no spam at all: 5 false negatives, 0 true positives. When one label is rare, look at the confusion table, not accuracy alone.' },
        `<h2>Too good to be true</h2>
<p>The most extreme model of all simply memorises. It keeps every training message with its label and looks the new message up. On the training set it is perfect. On anything else it has nothing to say, so it falls back on a guess.</p>
<div class="stmt"><p><span class="kind">Rule (overfitting).</span> A model <b>overfits</b> when it fits the details of its training examples, including their accidents, so closely that it does worse on new examples. The sign is a gap: much better on the training set than on the test set. A nearest-neighbour model with <code>k = 1</code> overfits easily, because one odd example decides everything near it.</p></div>`,
        { predict: true, play: `seen = {"win a free prize": "spam", "lunch at noon": "good",
        "click to win cash": "spam", "notes from class": "good"}

def memoriser(message):
    if message in seen:
        return seen[message]
    return "good"

for message in ["win a free prize", "lunch at noon", "win free cash now", "free prize inside"]:
    print(memoriser(message), "-", message)`, caption: 'spam, good, good, good. The two messages it has seen come back right, so its training accuracy is 100%. The two new ones are obvious spam, and it lets both through, because a memory is not a pattern. Every model sits somewhere between memorising and understanding nothing; the test set shows where.' },
        { fig: 'knn', k: 1, test: true, caption: 'The same sixteen fruits, now with six test fruits (hollow) that the model never saw. With k = 1 every training fruit is right, 16 of 16, but only 5 of the 6 test fruits are: the hollow orange near the round lemon is called a lemon. Switch to k = 3: one training fruit is now wrong, the round lemon itself, outvoted by its neighbours, and all six test fruits are right. A slightly worse fit to the training data gave a better model.' },
        { check: 'Look back at the story. Which of these is most like what went wrong with Google Flu Trends?', skill: 'overfitting', options: ['The model was tested on too many flu seasons', 'Out of 50 million search terms, some matched the past by chance, so the model fitted the past better than the future', 'Search engines cannot count searches accurately'], answer: 1, wrong: ['More honest testing would have helped, not hurt. The trouble was choosing terms because they fitted the past.', null, 'The search counts were right. What failed was the step from "these searches matched past flu" to "these searches predict flu".'], why: 'Choosing 45 terms out of 50 million because they fitted five years of data is a recipe for overfitting: some fit the past by accident, like terms that track winter instead of flu. The model looked excellent on the seasons it was chosen on and drifted badly on new ones.' },
        `<p>Put the accuracy function in order, then write the two tools every honest test needs.</p>`,
        {
          ex: {
            id: 'ml-3-1', kind: 'parsons', skill: 'accuracy', title: 'Put it in order: accuracy',
            prompt: `<p>Build <code>accuracy(predicted, actual)</code>: the fraction of positions where the predicted label equals the actual one, as a number from 0 to 1. For <code>["spam", "good", "good", "spam"]</code> against <code>["spam", "good", "spam", "spam"]</code> it is <code>0.75</code>. Put each line at the right depth. Not every block belongs.</p>`,
            lines: ['def accuracy(predicted, actual):', '    right = 0', '    for i in range(len(actual)):', '        if predicted[i] == actual[i]:', '            right = right + 1', '    return right / len(actual)'],
            distractors: ['    for i in range(1, len(actual)):', '    return right'],
            tests: [{ call: 'accuracy(["spam", "good", "good", "spam"], ["spam", "good", "spam", "spam"])', expect: '0.75' }, { call: 'accuracy(["x"], ["x"])', expect: '1.0' }, { call: 'accuracy(["a", "b"], ["b", "a"])', expect: '0.0' }, { call: 'accuracy(["a", "a", "a", "a", "a"], ["a", "b", "a", "b", "a"])', expect: '0.6' }],
            hints: ['Positions start at 0: range(1, ...) would skip the first prediction.', 'Accuracy is a fraction, not a count: divide the number right by the number of examples.'],
            followup: 'What should accuracy([], []) return? Run it and see what Python does, then decide what the function should do instead and make it do that.'
          }
        },
        {
          ex: {
            id: 'ml-3-2', skill: 'confusion', title: 'The confusion table',
            prompt: `<p>Write <code>confusion(predicted, actual)</code> for a spam filter. Both are lists of <code>"spam"</code> and <code>"good"</code> of the same length. Return a list of four counts, in this order: <code>[caught, false_alarms, missed, let_in]</code>, that is true positives, false positives, false negatives, true negatives, with spam as the positive label.</p>
<p><code>confusion(["spam", "good", "spam", "good"], ["spam", "spam", "good", "good"])</code> is <code>[1, 1, 1, 1]</code>.</p>`,
            starter: `def confusion(predicted, actual):\n    tp = fp = fn = tn = 0\n    for i in range(len(actual)):\n        ...\n    return [tp, fp, fn, tn]`,
            solution: `def confusion(predicted, actual):\n    tp = fp = fn = tn = 0\n    for i in range(len(actual)):\n        if predicted[i] == "spam" and actual[i] == "spam":\n            tp = tp + 1\n        elif predicted[i] == "spam":\n            fp = fp + 1\n        elif actual[i] == "spam":\n            fn = fn + 1\n        else:\n            tn = tn + 1\n    return [tp, fp, fn, tn]`,
            hints: ['Each position adds 1 to exactly one of the four counts, so one if with three elifs or an else does it.', 'Predicted spam and actually spam: tp. Predicted spam, actually good: fp. Predicted good, actually spam: fn. Both good: tn.'],
            tests: [{ call: 'confusion(["spam", "good", "spam", "good"], ["spam", "spam", "good", "good"])', expect: '[1, 1, 1, 1]' }, { call: 'confusion(["good", "good", "good"], ["spam", "good", "good"])', expect: '[0, 0, 1, 2]' }, { call: 'confusion([], [])', expect: '[0, 0, 0, 0]' }, { call: 'confusion(["spam", "spam"], ["spam", "spam"])', expect: '[2, 0, 0, 0]' }, { call: 'confusion(["spam", "good", "spam"], ["good", "good", "good"])', expect: '[0, 2, 0, 1]' }],
            failTip: 'If [1, 1, 1, 1] comes out as [1, 1, 1, 1] but the second test fails, check which list is which: a false negative is predicted good, actually spam.',
            followup: 'Write precision(table), the fraction of messages flagged as spam that really were spam, tp / (tp + fp), and recall, the fraction of spams that were caught, tp / (tp + fn). Which of the two would you want to be high for a spam filter, and which for a test for a serious illness?'
          }
        },
        {
          ex: {
            id: 'ml-3-3', skill: 'test-set', title: 'Setting a test set aside',
            prompt: `<p>Write <code>split_every(items, n)</code>. It puts every <code>n</code>th item (the <code>n</code>th, the <code>2n</code>th, and so on, counting from 1) into a test set and the rest into a training set, keeping their order, and returns <code>[train, test]</code>.</p>
<p><code>split_every([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)</code> is <code>[[1, 2, 3, 4, 6, 7, 8, 9], [5, 10]]</code>.</p>`,
            starter: `def split_every(items, n):\n    train = []\n    test = []\n    ...\n    return [train, test]`,
            solution: `def split_every(items, n):\n    train = []\n    test = []\n    for i in range(len(items)):\n        if i % n == n - 1:\n            test.append(items[i])\n        else:\n            train.append(items[i])\n    return [train, test]`,
            hints: ['Loop over the positions with range(len(items)). Positions count from 0, so the 5th item is at position 4, the 10th at position 9.', 'Position i is an nth item when i % n == n - 1. Append it to test; append everything else to train.'],
            tests: [{ call: 'split_every([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5)', expect: '[[1, 2, 3, 4, 6, 7, 8, 9], [5, 10]]' }, { call: 'split_every(["a", "b", "c"], 3)', expect: "[['a', 'b'], ['c']]" }, { call: 'split_every([1, 2], 5)', expect: '[[1, 2], []]' }, { call: 'split_every([], 2)', expect: '[[], []]' }, { call: 'split_every([1, 2, 3, 4], 2)', expect: '[[1, 3], [2, 4]]' }],
            failTip: 'If the first test gives [[2, 3, 4, 5, 7, 8, 9, 10], [1, 6]], you are testing i % n == 0, which picks positions 0 and 5: the 1st and the 6th items.',
            followup: 'If the items were sorted, say all the oranges first and then all the lemons, what could go wrong with this split? Real code shuffles the examples first, with random.shuffle and a fixed seed so the split can be repeated.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>Never judge a model on the examples it learned from. Put a <b>test set</b> aside before training, and report the score on it.</li>
<li><b>Accuracy</b> is the fraction labelled right. When one label is rare, a useless model can score high: 95% by never finding spam.</li>
<li>The <b>confusion table</b> counts true positives, false positives, false negatives and true negatives, and shows which mistakes a model makes.</li>
<li>A model <b>overfits</b> when it fits its training examples, accidents included, better than it fits new ones. The sign is a gap between training and test scores. Memorising is the extreme case; <code>k = 1</code> is close to it.</li>
<li>The answer to the opening question: Flu Trends was chosen for how well it matched the past. Out of millions of candidates, some match the past by chance, so a close fit to the past is not evidence about the future. Only examples kept apart from the fitting are.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-08', '3B-DA-07'],
      title: 'Checkpoint one', checkpoint: true, summary: 'No new ideas: mixed questions on rules and examples, nearest neighbours and honest testing, then two programs that use all three. Which model fits? Which number would you trust?',
      blocks: [
        `<p>This lesson teaches nothing new. It mixes questions on the last three lessons, because telling apart ideas that look alike, such as a training score and a test score, or a false positive and a false negative, is a skill of its own, and it only grows when the questions are mixed. Answer each one before looking back. If one surprises you, the lesson it came from is linked on the Review page, and the question will come back there in a day.</p>
<p>Ready? Here is the first: if a model is perfect on its own examples, is it a good model?</p>
<h2>Mixed questions</h2>`,
        { check: 'A model scores 100% on its training set and 60% on its test set. What is the best description?', skill: 'overfitting', options: ['It is overfitting', 'It is a good model, since 100% is perfect', 'The test set must be wrong'], answer: 0, wrong: [null, 'The 100% was measured on examples it had already seen. On new ones it gets 4 in 10 wrong.', 'A test set that disagrees with the training score is doing its job: it is the only honest number here.'], why: 'A large gap between training and test scores is the sign of overfitting: the model has fitted its examples, accidents and all, instead of the pattern.' },
        { check: 'A spam filter sends a message from your teacher to the junk folder. Which mistake is that?', skill: 'mistakes', options: ['A false negative', 'A false positive', 'A true positive'], answer: 1, wrong: ['A false negative is spam let into the inbox. Here a good message was wrongly flagged.', null, 'A true positive is spam correctly caught. The teacher\'s message is not spam.'], why: 'The filter is looking for spam, so "positive" means "flagged as spam". It flagged a good message: a false positive.' },
        { check: 'You want to sort animals into "cat" and "dog" from their weight and ear length, and you have 500 labelled animals. Which approach is a learned model?', skill: 'nearest', options: ['Write: if weight > 10, then dog', 'Label a new animal by the most common label among its 5 nearest labelled animals', 'Toss a coin for each animal'], answer: 1, wrong: ['That is a hand-written rule: you chose 10, not the data. Some cats weigh more than some dogs.', null, 'A coin uses no data at all: it is right about half the time whatever the animals look like.'], why: 'k-NN with k = 5 takes its decisions from the 500 labelled examples. The rule with 10 kg is a person\'s guess, like the "click" rule in lesson 1.' },
        { check: 'Your nearest-neighbour model keeps labelling fruit near one odd training example wrongly. What is the simplest change to try?', skill: 'choose-k', options: ['Use k = 1', 'Use a larger odd k, such as 5', 'Delete the test set'], answer: 1, wrong: ['k = 1 is what lets one odd example decide everything near it.', null, 'Then you could not see whether anything helped.'], why: 'With more neighbours voting, one odd example is outvoted, as the round lemon was at k = 3. Check the result on the test set.' },
        { check: 'Which counts does a word-counting spam filter learn from its training data?', skill: 'counting', options: ['How often each word appears in spam, and how often in good mail', 'A list of the words a programmer thinks are spammy', 'How long each message is'], answer: 0, wrong: [null, 'Then a person would be choosing the words: that is the hand-written rule, the thing the counting filter replaces.', 'Length can be a feature too, but the filter in lesson 1 counted words, one dictionary for each label.'], why: 'It builds one dictionary of word counts for spam and one for good mail, from labelled examples. Every word then votes when a new message is scored.' },
        { check: 'What is the distance between <code>[2, 3]</code> and <code>[2, 7]</code>?', skill: 'distance', options: ['4.0', '16', '5.0'], answer: 0, wrong: [null, 'That is the squared difference, before the square root.', 'Only one feature differs, by 4: there is no 3-4-5 triangle here.'], why: 'The first features are equal, the second differ by 4. The square root of 0² + 4² = 16 is 4.0.' },
        { check: 'Of 1,000 bank payments, 2 are fraud. Which number would you trust to judge a fraud detector?', skill: 'confusion', options: ['Its accuracy', 'How many of the 2 frauds it caught, and how many honest payments it flagged', 'Its accuracy on the training set'], answer: 1, wrong: ['A detector that never says "fraud" is 99.8% accurate here and catches nothing. Rare labels make accuracy misleading.', null, 'The training set tells you what it remembers. And with fraud this rare, even accuracy on a test set would hide the misses.'], why: 'When one label is rare, the confusion table matters: the true positives and false negatives (frauds caught and missed), and the false positives (honest customers bothered).' },
        { check: 'A spam filter scores <em>"meeting moved to 3"</em> as exactly 0. Why might that happen?', skill: 'scoring', options: ['None of its words appeared in the training data, so nothing voted', 'The message must be spam', 'Scores can never be exactly 0'], answer: 0, wrong: [null, 'A score of 0 says nothing either way: no evidence for spam and none against.', 'Any message whose words were never seen, or whose votes cancel out, scores 0.'], why: 'A word missing from both dictionaries adds 0. A filter that has seen only a few examples meets many such messages: that is the "unsure" answer of exercise ml-1-3.' },
        `<p>Two programs to finish the unit. The first needs no code: choose the fair test. The second puts the three lessons together.</p>`,
        {
          ex: {
            id: 'ml-4-1', kind: 'choice', skill: 'test-set', title: 'The fair test',
            prompt: `<p>A team builds a model that labels photos of plants as healthy or diseased. They have 1,000 labelled photos, taken at 10 farms. Which plan gives the most honest estimate of how well the model will work at a new farm?</p>`,
            options: [
              { text: 'Train on all 1,000 photos, then measure accuracy on the same 1,000.', why: 'That measures memory, not how well it works on new plants: lesson 3.' },
              { text: 'Train on 900 photos picked at random, test on the other 100.', why: 'Better, but the test photos come from the same 10 farms as the training photos, with the same light, cameras and soil. The model may have learned the farms.' },
              { text: 'Train on the photos from 8 farms, and test on the photos from the other 2.', ok: true },
              { text: 'Train on 900, test on 100, and if the score is low, change the model and test on the same 100 until it is high.', why: 'Changing the model until the test score is high turns the test set into training data: you have fitted the model to it.' }
            ],
            hints: ['The question is about a new farm. Which test set looks most like a new farm?', 'A test set must be kept apart from everything used to choose the model: not only the training photos, but anything that makes them alike.'],
            solution: '<p>Train on 8 farms and test on the other 2. The test photos then differ from the training ones in the way a new farm will: different light, cameras, soil. Testing on the training photos measures memory; a random split lets the model learn each farm; and tuning against the test set until it looks good uses it up.</p>',
            followup: 'Flu Trends chose 45 search terms out of 50 million by how well they fitted five years of data. Which of these four plans is most like that?'
          }
        },
        {
          ex: {
            id: 'ml-4-2', skill: 'knn', title: 'Test a model',
            prompt: `<p>Write <code>test_accuracy(train_points, train_labels, test_points, test_labels, k)</code>. It labels every test point with k-NN, using only the training points, and returns the fraction of test points labelled right. <code>distance</code> and <code>knn</code> are written for you, as you wrote them in lesson 2.</p>
<p>With the training fruit <code>[[7.4, 7.2], [7.8, 7.6], [6.0, 8.0], [6.2, 8.4], [6.9, 7.4]]</code> labelled <code>["orange", "orange", "lemon", "lemon", "lemon"]</code> and the test fruit <code>[[7.0, 7.3], [6.1, 8.1]]</code> labelled <code>["orange", "lemon"]</code>, <code>k = 1</code> gives <code>0.5</code> and <code>k = 3</code> gives <code>1.0</code>.</p>`,
            starter: `import math\n\ndef distance(a, b):\n    total = 0\n    for i in range(len(a)):\n        total = total + (a[i] - b[i]) ** 2\n    return math.sqrt(total)\n\ndef knn(points, labels, new, k):\n    pairs = []\n    for i in range(len(points)):\n        pairs.append([distance(points[i], new), labels[i]])\n    pairs.sort()\n    votes = {}\n    for pair in pairs[:k]:\n        votes[pair[1]] = votes.get(pair[1], 0) + 1\n    best = None\n    for label in votes:\n        if best is None or votes[label] > votes[best]:\n            best = label\n    return best\n\ndef test_accuracy(train_points, train_labels, test_points, test_labels, k):\n    right = 0\n    ...\n    return 0.0`,
            solution: `import math\n\ndef distance(a, b):\n    total = 0\n    for i in range(len(a)):\n        total = total + (a[i] - b[i]) ** 2\n    return math.sqrt(total)\n\ndef knn(points, labels, new, k):\n    pairs = []\n    for i in range(len(points)):\n        pairs.append([distance(points[i], new), labels[i]])\n    pairs.sort()\n    votes = {}\n    for pair in pairs[:k]:\n        votes[pair[1]] = votes.get(pair[1], 0) + 1\n    best = None\n    for label in votes:\n        if best is None or votes[label] > votes[best]:\n            best = label\n    return best\n\ndef test_accuracy(train_points, train_labels, test_points, test_labels, k):\n    right = 0\n    for i in range(len(test_points)):\n        if knn(train_points, train_labels, test_points[i], k) == test_labels[i]:\n            right = right + 1\n    return right / len(test_points)`,
            hints: ['Loop over the test points by position. For each, ask knn(train_points, train_labels, test_points[i], k) for a label.', 'Count the ones that equal test_labels[i], and return the count divided by len(test_points). The test points are never passed to knn as training data.'],
            tests: [{ call: 'test_accuracy([[7.4, 7.2], [7.8, 7.6], [6.0, 8.0], [6.2, 8.4], [6.9, 7.4]], ["orange", "orange", "lemon", "lemon", "lemon"], [[7.0, 7.3], [6.1, 8.1]], ["orange", "lemon"], 1)', expect: '0.5' }, { call: 'test_accuracy([[7.4, 7.2], [7.8, 7.6], [6.0, 8.0], [6.2, 8.4], [6.9, 7.4]], ["orange", "orange", "lemon", "lemon", "lemon"], [[7.0, 7.3], [6.1, 8.1]], ["orange", "lemon"], 3)', expect: '1.0' }, { call: 'test_accuracy([[0, 0], [10, 10]], ["a", "b"], [[1, 1], [9, 9], [6, 6], [4, 4]], ["a", "b", "a", "b"], 1)', expect: '0.5' }, { call: 'test_accuracy([[0, 0], [10, 10]], ["a", "b"], [[1, 1]], ["a"], 1)', expect: '1.0' }],
            failTip: 'If k = 3 gives 0.5 as well, check that k is passed on to knn instead of a fixed 1.',
            followup: 'Use your function on the sixteen fruits of the figure in lesson 3 (read their measurements off the graph), for every odd k from 1 to 15. Which k gives the best test accuracy? Is that also the k with the best training accuracy?'
          }
        },
        `<div class="recap"><h3>Unit one in a few lines</h3><ul>
<li>A classifier's rules can be written by hand or learned from labelled examples; learned rules are only as good as the examples.</li>
<li>A model makes false positives and false negatives, and the confusion table counts both.</li>
<li>k-NN labels a new example by a vote of its <code>k</code> nearest training examples; distance is Pythagoras.</li>
<li>Judge a model on a test set kept apart from everything used to build it. A big gap between training and test scores means overfitting.</li>
<li>Next: models that are not a memory of examples but a formula that learns its own numbers, starting with a line that moves every time it makes a mistake.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-08', '3B-AP-09'],
      title: 'A line that learns', summary: 'The perceptron: a weighted vote of the features, a rule that moves the weights after every mistake, and the one kind of problem a single line can never learn.',
      blocks: [
        `<p>In July 1958 the US Office of Naval Research called a press conference in Washington. On show was an IBM 704, a computer that filled a room, running a program written by Frank Rosenblatt, a psychologist at the Cornell Aeronautical Laboratory in Buffalo. The computer was fed punched cards, each marked with a square on the left or on the right. Nobody had told it which side was which. After 50 tries it had taught itself to tell them apart.</p>
<p>The <em>New York Times</em> headline was "New Navy Device Learns By Doing", and the article went much further: the Navy expected it to be "the embryo of an electronic computer" that would one day "walk, talk, see, write, reproduce itself and be conscious of its existence." Rosenblatt went on to build the program as a machine, the Mark I Perceptron. It saw through 400 light sensors in a 20 by 20 grid, and the numbers it learned were dials, turned by small electric motors whenever it made a mistake. It is now in the Smithsonian.</p>
<p>So what was the machine actually doing when it "learned", and could it learn anything at all?</p>`,
        `<h2>A weighted vote</h2>
<p>A perceptron is a classifier with two labels, written 1 and −1. Like nearest neighbours, it sees each example as numbers, its features. But it keeps no examples. It keeps one <b>weight</b> for each feature, and one more number called the <b>bias</b>, and decides by a vote: each feature times its weight, all added up.</p>
<div class="stmt"><p><span class="kind">Rule (the perceptron's decision).</span> The <b>score</b> of an example <code>x</code> is <code>b + w[0]·x[0] + w[1]·x[1] + …</code>. If the score is above 0 the label is 1, otherwise −1. A big positive weight means "this feature is evidence for 1", a negative one "evidence for −1". The examples with score exactly 0 form a straight line, and the perceptron calls everything on one side 1 and everything on the other −1.</p></div>
<p>The examples in this lesson are rectangles, described by width and height. Tall rectangles are labelled 1 and wide ones −1.</p>`,
        { predict: true, play: `def predict(w, b, x):
    total = b
    for i in range(len(x)):
        total = total + w[i] * x[i]
    if total > 0:
        return 1
    return -1

w = [-1, 1]
b = 0
print(predict(w, b, [2, 5]))
print(predict(w, b, [6, 3]))
print(predict(w, b, [4, 4]))`, caption: '1, −1, −1. With weights −1 for width and 1 for height, the score is height minus width: 3 for the tall rectangle, −3 for the wide one. The square scores exactly 0, which is not above 0, so it gets −1. The dividing line is height = width. Try w = [-1, 2]: now a rectangle counts as tall once its height is more than half its width.' },
        { check: 'With <code>w = [2, -1]</code> and <code>b = 1</code>, what does the perceptron say about <code>x = [1, 4]</code>?', skill: 'weighted-sum', options: ['The score is 7, so 1', 'The score is −1, so −1', 'The score is 3, so 1'], answer: 1, wrong: ['That adds 4 instead of subtracting it. The weight on the height is −1, so the height counts against label 1: 2 − 4 + 1.', null, 'That leaves out the height. Every feature votes: 2 × 1 + (−1) × 4 + 1.'], why: '1 + 2 × 1 + (−1) × 4 = −1. The score is not above 0, so the label is −1.' },
        `<h2>Learning from mistakes</h2>
<p>Where do the weights come from? Rosenblatt's answer is a rule so simple it fits in a sentence. Show the perceptron the training examples one at a time. When it is right, do nothing. When it is wrong, nudge the weights towards the right answer.</p>
<div class="stmt"><p><span class="kind">Rule (the perceptron rule).</span> Start with every weight and the bias at 0. For each training example <code>x</code> with label <code>y</code> (1 or −1): if the prediction is wrong, add <code>y·x[i]</code> to each weight <code>w[i]</code> and <code>y</code> to the bias. One look at every example is a <b>pass</b> (or <b>epoch</b>). Repeat passes until one has no mistakes.</p>
<p>Adding <code>y·x</code> moves the score of that example towards its label: for a tall rectangle called wide, its height and width are added, so its score goes up. It was proved in the early 1960s that if some straight line separates the two labels, this rule finds one after a limited number of mistakes.</p></div>`,
        { predict: true, play: `def predict(w, b, x):
    total = b + w[0] * x[0] + w[1] * x[1]
    if total > 0:
        return 1
    return -1

shapes = [[6, 4], [1, 3], [7, 1], [4, 2], [4, 7], [4, 6]]
labels = [-1, 1, -1, -1, 1, 1]
w = [0, 0]
b = 0
for epoch in range(1, 5):
    mistakes = 0
    for i in range(len(shapes)):
        x = shapes[i]
        if predict(w, b, x) != labels[i]:
            w[0] = w[0] + labels[i] * x[0]
            w[1] = w[1] + labels[i] * x[1]
            b = b + labels[i]
            mistakes = mistakes + 1
    print("pass", epoch, "mistakes", mistakes, "w", w, "b", b)`, caption: 'The mistakes go 3, 2, 1, 0, ending with w = [-10, 7] and b = 0: tall when 7 × height is more than 10 × width. That line separates all six training shapes, but it is not the rule "height more than width": it would call a 5 by 6 rectangle wide. The perceptron finds <em>a</em> line that fits its examples, not the one in your head. Add [5, 6] with label 1 and run again.' },
        { fig: 'perceptron', caption: 'The same rule on the sixteen fruit from lesson 2, lemons 1 and oranges −1, with every change made 0.1 times as big. Press <b>Next mistake</b>: the ringed fruit was on the wrong side, and the line swings towards it. Fruit drawn with a red edge are on the wrong side of the line at that moment. Watch how a fix for one fruit can break another, and how the mistakes still die out.' },
        { check: 'Weights <code>[0, -1]</code>, bias 0. The perceptron calls the tall rectangle <code>[1, 3]</code> (label 1) wide. What are the weights and bias after the update?', skill: 'perceptron-rule', options: ['<code>[1, 2]</code>, bias 1', '<code>[-1, -4]</code>, bias −1', '<code>[0, -1]</code>, bias 0'], answer: 0, wrong: [null, 'That subtracts the example, as if the label were −1. The update uses the right label, y = 1, so the example is added.', 'Updates happen exactly when the prediction is wrong, and this one is wrong.'], why: 'The label is 1, so add 1 × [1, 3] to the weights and 1 to the bias: [0 + 1, −1 + 3] = [1, 2], bias 1. The new score of [1, 3] is 1 + 1 + 6 = 8: now tall.' },
        `<h2>What one line cannot do</h2>
<p>In 1969 Marvin Minsky and Seymour Papert of MIT published a book called <em>Perceptrons</em>. Among much else, it showed how simple some of the things are that a single perceptron can never learn. The best-known is <b>exclusive or</b>: two switches, and the answer is 1 when exactly one of them is on.</p>
<div class="stmt"><p><span class="kind">Rule (what a line can separate).</span> A perceptron can only learn labels that some straight line separates: the labels must be <b>linearly separable</b>. Put the four cases of exclusive or on a square: the two 1s are on one diagonal and the two −1s on the other. No straight line has both 1s on one side and both −1s on the other, so the mistakes never stop.</p></div>`,
        { predict: true, play: `def predict(w, b, x):
    total = b + w[0] * x[0] + w[1] * x[1]
    if total > 0:
        return 1
    return -1

points = [[0, 0], [0, 1], [1, 0], [1, 1]]
labels = [-1, 1, 1, -1]
w = [0, 0]
b = 0
for epoch in range(1, 9):
    mistakes = 0
    for i in range(len(points)):
        x = points[i]
        if predict(w, b, x) != labels[i]:
            w[0] = w[0] + labels[i] * x[0]
            w[1] = w[1] + labels[i] * x[1]
            b = b + labels[i]
            mistakes = mistakes + 1
    print("pass", epoch, "mistakes", mistakes)`, caption: 'The mistakes never reach 0: 2, 3, then 4 in every pass, for ever. Every fix for one corner of the square breaks another. Change the labels to [-1, 1, 1, 1] (1 when either switch is on, "or" instead of "exclusive or") and the perceptron learns it in a few passes, because a line does separate that.' },
        { check: 'Which of these can a single perceptron learn from two features?', skill: 'linear-limits', options: ['Label 1 when exactly one of two switches is on', 'Label 1 when a rectangle is taller than it is wide', 'Label 1 when a point is inside a circle, −1 outside'], answer: 1, wrong: ['That is exclusive or: the 1s sit on one diagonal of the square and no line separates them.', null, 'A circle\'s inside is not one side of a straight line: any line cuts across it. One perceptron cannot learn it.'], why: '"Taller than wide" is the line height = width: everything on one side is tall. Exclusive or and the inside of a circle need more than one straight line, which is why later networks stack perceptrons in layers.' },
        `<p>The fix was found later: many perceptrons in <b>layers</b>, each layer feeding the next, can draw boundaries of any shape. Training them needed a new method, published in 1986 by David Rumelhart, Geoffrey Hinton and Ronald Williams, and today's neural networks are layers of these units, millions of them. Each one is still this lesson's weighted vote. First trace the rule by hand, then write it.</p>`,
        {
          ex: {
            id: 'ml-5-1', kind: 'trace', skill: 'perceptron-rule', title: 'Trace the perceptron',
            prompt: `<p>This is the perceptron rule without a bias, on three rectangles. <code>total * labels[i] &lt;= 0</code> is a short way of saying "the prediction is wrong": the score has the wrong sign, or is 0. Fill in the table: each row is a moment just after line 6 has run, with the values then. The first row is done for you.</p>`,
            code: `shapes = [[2, 1], [1, 3], [3, 2]]\nlabels = [-1, 1, -1]\nw0 = 0\nw1 = 0\nfor i in range(3):\n    total = w0 * shapes[i][0] + w1 * shapes[i][1]\n    if total * labels[i] <= 0:\n        w0 = w0 + labels[i] * shapes[i][0]\n        w1 = w1 + labels[i] * shapes[i][1]\nprint(w0, w1)`,
            vars: ['i', 'total', 'w0', 'w1'],
            steps: [
              { line: 6, values: { i: '0', total: '0', w0: '0', w1: '0' }, show: true },
              { line: 6, values: { i: '1', total: '-5', w0: '-2', w1: '-1' }, why: { w0: { '0': 'The first total was 0, which counts as a mistake, so the first shape, [2, 1] with label −1, was added times −1: w0 = −2.' }, total: { '5': 'w0 is −2 and w1 is −1 by now: (−2) × 1 + (−1) × 3 = −5.' } } },
              { line: 6, values: { i: '2', total: '1', w0: '-1', w1: '2' }, why: { w0: { '-2': 'The total −5 has the wrong sign for label 1, so [1, 3] was added: w0 = −2 + 1 = −1, w1 = −1 + 3 = 2.' } } }
            ],
            hints: ['A row shows the values after total is computed but before the if decides. Any change from the if shows up in the next row.', 'Shape 0: total 0, a mistake, add −1 × [2, 1]: w = [−2, −1]. Shape 1: total −2 − 3 = −5, wrong for label 1, add [1, 3]: w = [−1, 2]. Shape 2: total −3 + 4 = 1.'],
            solution: '<p>i: 0, 1, 2. total: 0, −5, 1. w0: 0, −2, −1. w1: 0, −1, 2. The last total, 1, is wrong for label −1, so one more update makes the weights −4 and 0, and the program prints <code>-4 0</code>.</p>',
            followup: 'Run the loop a second time over the same three shapes (a second pass), by hand first. Does it still make mistakes?'
          }
        },
        {
          ex: {
            id: 'ml-5-2', skill: 'weighted-sum', title: 'The weighted vote',
            prompt: `<p>Write <code>predict(w, b, x)</code> for any number of features: <code>w</code> and <code>x</code> are lists of the same length, <code>b</code> is a number. Return <code>1</code> if <code>b + w[0]*x[0] + w[1]*x[1] + …</code> is above 0, and <code>-1</code> otherwise. So <code>predict([-1, 1], 0, [2, 5])</code> is <code>1</code> and <code>predict([-1, 1], 0, [4, 4])</code> is <code>-1</code>.</p>`,
            starter: `def predict(w, b, x):\n    total = b\n    ...\n    return 1`,
            solution: `def predict(w, b, x):\n    total = b\n    for i in range(len(x)):\n        total = total + w[i] * x[i]\n    if total > 0:\n        return 1\n    return -1`,
            hints: ['Start the total at the bias, then loop over the positions and add w[i] * x[i] for each.', 'After the loop: return 1 if total > 0, otherwise -1. A score of exactly 0 gives -1.'],
            tests: [{ call: 'predict([-1, 1], 0, [2, 5])', expect: '1' }, { call: 'predict([-1, 1], 0, [4, 4])', expect: '-1' }, { call: 'predict([0.5, 0.5, 0.5], -1, [1, 1, 1])', expect: '1' }, { call: 'predict([2], -3, [1])', expect: '-1' }, { call: 'predict([1, -2], 0.5, [0, 0])', expect: '1' }, { call: 'predict([1, 1], -10, [3, 4])', expect: '-1' }],
            failTip: 'If predict([1, -2], 0.5, [0, 0]) gives -1, the bias is missing: start the total at b, not at 0.',
            followup: 'Write score(w, b, x) that returns the total itself. How far the score is from 0 says how sure the perceptron is: what is the score of [4, 4] with w = [-10, 7] and b = 0?'
          }
        },
        {
          ex: {
            id: 'ml-5-3', skill: 'perceptron-rule', title: 'Train a perceptron',
            prompt: `<p>Write <code>train(shapes, labels, epochs)</code>: the perceptron rule on examples with two features, starting from weights <code>[0, 0]</code> and bias <code>0</code>, making <code>epochs</code> passes over the examples in order. Return <code>[w, b]</code>. <code>predict</code> is written for you.</p>
<p>With the six shapes of the lesson, <code>train(shapes, labels, 1)</code> is <code>[[-2, 9], 1]</code> and <code>train(shapes, labels, 3)</code> is <code>[[-10, 7], 0]</code>.</p>`,
            starter: `def predict(w, b, x):\n    total = b + w[0] * x[0] + w[1] * x[1]\n    if total > 0:\n        return 1\n    return -1\n\ndef train(shapes, labels, epochs):\n    w = [0, 0]\n    b = 0\n    ...\n    return [w, b]`,
            solution: `def predict(w, b, x):\n    total = b + w[0] * x[0] + w[1] * x[1]\n    if total > 0:\n        return 1\n    return -1\n\ndef train(shapes, labels, epochs):\n    w = [0, 0]\n    b = 0\n    for e in range(epochs):\n        for i in range(len(shapes)):\n            x = shapes[i]\n            if predict(w, b, x) != labels[i]:\n                w[0] = w[0] + labels[i] * x[0]\n                w[1] = w[1] + labels[i] * x[1]\n                b = b + labels[i]\n    return [w, b]`,
            hints: ['Two loops: an outer one for the passes, for e in range(epochs), and an inner one over the positions of the examples.', 'Inside: if predict(w, b, shapes[i]) != labels[i], add labels[i] * shapes[i][0] to w[0], labels[i] * shapes[i][1] to w[1], and labels[i] to b.'],
            tests: [{ call: 'train([[6, 4], [1, 3], [7, 1], [4, 2], [4, 7], [4, 6]], [-1, 1, -1, -1, 1, 1], 1)', expect: '[[-2, 9], 1]' }, { call: 'train([[6, 4], [1, 3], [7, 1], [4, 2], [4, 7], [4, 6]], [-1, 1, -1, -1, 1, 1], 3)', expect: '[[-10, 7], 0]' }, { call: 'train([[6, 4], [1, 3], [7, 1], [4, 2], [4, 7], [4, 6]], [-1, 1, -1, -1, 1, 1], 10)', expect: '[[-10, 7], 0]' }, { call: 'train([[1, 1], [3, 3]], [-1, 1], 5)', expect: '[[2, 2], -2]' }, { call: 'train([[0, 0], [0, 1], [1, 0], [1, 1]], [-1, 1, 1, -1], 3)', expect: '[[-1, 0], 1]' }],
            failTip: 'If one pass gives the wrong weights, check that an update happens only when the prediction is wrong, and that the bias changes by the label too.',
            followup: 'Make train stop early, as soon as a whole pass has no mistakes, and return the number of passes it needed as well. How many does the lesson\'s data need?'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A <b>perceptron</b> scores an example by a weighted vote, <code>b + w[0]·x[0] + w[1]·x[1] + …</code>, and labels it 1 if the score is above 0, else −1. The boundary is a straight line.</li>
<li>The <b>perceptron rule</b>: when an example is wrong, add <code>label × x</code> to the weights and the label to the bias. Repeat passes until a pass has no mistakes.</li>
<li>If a straight line separates the labels, the rule finds one, though not necessarily the one you had in mind. If none does, as for <b>exclusive or</b>, the mistakes never stop.</li>
<li>Layers of perceptrons can draw any boundary; today's neural networks are built that way.</li>
<li>The answer to the opening question: the 1958 machine was turning dials, a little after each mistake, until its weighted vote put every example on the right side of a line. It could learn anything a line can separate, and nothing else.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['2-DA-09', '3A-DA-12', '3B-AP-09', '8.1.1.4', '9.1.1.11'],
      title: 'Walking downhill', summary: 'Gradient descent, the method that trains almost every model today: measure the error, find which way is downhill, take a step, and choose the size of the step.',
      blocks: [
        `<p>In 1847 the French mathematician Augustin-Louis Cauchy sent a three-page note to the Academy of Sciences in Paris. Astronomers wanted to work out the orbit of a planet or a comet from their observations. An orbit is described by six numbers, and the equations linking them to the observations were far too hard to solve directly. Cauchy proposed something that sounds almost too simple. Start from a guess. Measure how wrong it is. Then change all six numbers a little, in the direction that makes the error shrink fastest, and do it again.</p>
<p>That idea, now called <b>gradient descent</b>, is how almost every machine-learning model is trained today, including the ones with billions of numbers instead of six. Nobody can try every possible value of a billion numbers, and nobody can see the whole picture of how the error depends on them.</p>
<p>So how can a program find the best numbers when it cannot try them all, or even see where the best ones are?</p>`,
        `<h2>Measuring the error</h2>
<p>To go downhill you first need a hill: one number that says how wrong the model is. Take the simplest model there is, a line through 0, <code>y = w · x</code>, with one weight to learn. The data are three points that lie exactly on the line <code>y = 2x</code>: (1, 2), (2, 4) and (3, 6). For a given <code>w</code>, each point is missed by <code>w · x − y</code>.</p>
<div class="stmt"><p><span class="kind">Rule (mean squared error).</span> The <b>error</b> of a model on some examples is the average of the squared misses: square each miss, add them up, divide by how many. Squaring makes every miss count as positive, so misses in opposite directions cannot cancel, and it makes a big miss count much more than a small one. The best <code>w</code> is the one with the smallest error.</p></div>`,
        { predict: true, play: `xs = [1, 2, 3]
ys = [2, 4, 6]

def error(w):
    total = 0
    for i in range(len(xs)):
        miss = w * xs[i] - ys[i]
        total = total + miss * miss
    return total / len(xs)

print(round(error(1), 2))
print(round(error(2), 2))
print(round(error(3), 2))`, caption: '4.67, 0.0, 4.67. With w = 2 the line goes through every point and the error is 0. With w = 1 the misses are −1, −2 and −3; with w = 3 they are 1, 2 and 3. Squared, both give 1 + 4 + 9 = 14, and 14 ÷ 3 is 4.67. Plot error(w) for w from 0 to 4 and you get a valley with its bottom at 2.' },
        { check: 'Why does the error square each miss instead of just adding the misses up?', skill: 'loss', options: ['So that misses above and below the line cannot cancel out', 'Because squaring makes the numbers smaller', 'Because Python cannot add negative numbers'], answer: 0, wrong: [null, 'Squaring makes every miss above 1 bigger, not smaller: a miss of 3 counts 9. That is on purpose: big misses should count most.', 'Python adds negative numbers without complaint. The trouble is that −3 and +3 would add to 0 and look like no error at all.'], why: 'A miss of +3 and a miss of −3 would add up to 0, an error of nothing, for a terrible line. Squares are never negative, so every miss adds to the error, and big misses add most.' },
        `<h2>Which way is downhill?</h2>
<p>Imagine standing on that valley side in thick fog. You cannot see the bottom, but you can feel the slope under your feet, and that is enough: step the way the ground goes down. For a program, "feeling the slope" means asking how the error changes when <code>w</code> changes a tiny bit.</p>
<div class="stmt"><p><span class="kind">Rule (gradient descent).</span> The <b>slope</b> at <code>w</code> is how much the error rises for each unit <code>w</code> goes up. A program can estimate it by trying two nearby values: <code>(error(w + 0.01) − error(w − 0.01)) / 0.02</code>. Then take a step against the slope: <code>w = w − rate × slope</code>. A positive slope means downhill is to the left, so <code>w</code> goes down; a negative slope means <code>w</code> goes up. Repeat. With many weights the slope is worked out for each one, and the list of slopes is called the <b>gradient</b>.</p></div>`,
        { predict: true, play: `xs = [1, 2, 3]
ys = [2, 4, 6]

def error(w):
    total = 0
    for i in range(len(xs)):
        miss = w * xs[i] - ys[i]
        total = total + miss * miss
    return total / len(xs)

def slope(w):
    return (error(w + 0.01) - error(w - 0.01)) / 0.02

w = 0
for step in range(5):
    w = w - 0.1 * slope(w)
    print(step + 1, round(w, 2), round(error(w), 3))`, caption: 'w goes 1.87, 1.99, 2.0, 2.0, 2.0 and the error falls to 0. At w = 0 the slope is about −18.7, steep and downhill to the right, so the first step is big. Near the bottom the slope is almost flat, so the steps shrink by themselves. Nothing in the program knows the answer is 2: it only ever feels the slope where it stands.' },
        { fig: 'descent', rate: 0.05, caption: 'The error of the line y = w·x on the three points, as a valley, and the steps of gradient descent from w = 0. Press <b>Step</b> to take one step at a time. Then try the other learning rates: which ones reach the bottom, which ones step over it, and which one never comes back?' },
        { check: 'At the current <code>w</code> the slope of the error is <code>+5</code>. Which way does gradient descent move <code>w</code>?', skill: 'gradient', options: ['Up, because the slope is positive', 'Down: a positive slope means the error rises as w goes up', 'It stops, because the slope is not 0'], answer: 1, wrong: ['Following the slope uphill makes the error bigger. The step is minus rate times slope.', null, 'It stops only where the slope is 0, at the bottom. A slope of 5 means there is still a long way down.'], why: 'w = w − rate × 5 makes w smaller. A positive slope says the error grows to the right, so downhill is to the left.' },
        `<h2>How big a step?</h2>
<p>The number that multiplies the slope is the <b>learning rate</b>. It is not learned: the person training the model chooses it, and it matters more than almost anything else.</p>
<div class="stmt"><p><span class="kind">Rule (the learning rate).</span> Too small a learning rate and the steps crawl: after many steps the model is still far from the bottom. Too big and each step jumps over the bottom to the other side of the valley, landing higher than it started, and the error grows without end. In between, the steps reach the bottom quickly. There is no single right value: people try a few and watch the error.</p></div>`,
        { predict: true, play: `xs = [1, 2, 3]
ys = [2, 4, 6]

def slope(w):
    total = 0
    for i in range(len(xs)):
        total = total + 2 * (w * xs[i] - ys[i]) * xs[i]
    return total / len(xs)

for rate in [0.01, 0.1, 0.25]:
    w = 0
    for step in range(10):
        w = w - rate * slope(w)
    print("rate", rate, "after 10 steps: w =", round(w, 2))`, caption: 'rate 0.01: w = 1.25, still crawling. rate 0.1: w = 2.0, at the bottom. rate 0.25: w = −33.52, thrown out of the valley. This slope function uses the exact formula for the slope of this error, 2 × (w·x − y) × x averaged over the points, instead of trying two nearby values; the answers are the same. Try a rate of 0.2.' },
        { check: 'You train a model and the error goes 10, 25, 70, 200 after the first steps. What is the most likely cause?', skill: 'learning-rate', options: ['The learning rate is too small', 'The learning rate is too big', 'The model has found the bottom'], answer: 1, wrong: ['A small rate makes the error fall slowly. It never makes it rise.', null, 'At the bottom the error stops changing. Here it is growing fast.'], why: 'An error that grows step after step is the sign of steps so big that each one lands higher up the other side of the valley. Make the learning rate smaller.' },
        `<p>Trace a few steps of descent by hand, then write the error and the descent yourself.</p>`,
        {
          ex: {
            id: 'ml-6-1', kind: 'trace', skill: 'gradient', title: 'Trace the descent',
            prompt: `<p>Here the error is <code>(w − 3)²</code>, a valley with its bottom at 3, and its slope is <code>2 × (w − 3)</code>. Fill in the table: each row is a moment just after line 5 has run. The first row is done for you.</p>`,
            code: `w = 0\nrate = 0.25\nfor step in range(4):\n    slope = 2 * (w - 3)\n    w = w - rate * slope\nprint(w)`,
            vars: ['step', 'slope', 'w'],
            steps: [
              { line: 5, values: { step: '0', slope: '-6', w: '1.5' }, show: true },
              { line: 5, values: { step: '1', slope: '-3.0', w: '2.25' }, why: { w: { '-1.5': 'The slope is negative, so subtracting rate × slope makes w bigger: 1.5 − 0.25 × (−3) = 2.25.' } } },
              { line: 5, values: { step: '2', slope: '-1.5', w: '2.625' } },
              { line: 5, values: { step: '3', slope: '-0.75', w: '2.8125' }, why: { w: { '3': 'w gets closer to 3 at every step but never quite reaches it: each step covers half the distance that is left.' } } }
            ],
            hints: ['Each pass: slope = 2 × (w − 3) with the current w, then w = w − 0.25 × slope.', 'From w = 1.5: slope 2 × (−1.5) = −3, so w = 1.5 + 0.75 = 2.25. Each step halves the distance to 3.'],
            solution: '<p>step: 0, 1, 2, 3. slope: −6, −3, −1.5, −0.75. w: 1.5, 2.25, 2.625, 2.8125. Each step covers half of the distance left to 3, so the program prints <code>2.8125</code>.</p>',
            followup: 'Trace it again with rate = 0.5. How many steps does it take to reach the bottom now? And with rate = 1?'
          }
        },
        {
          ex: {
            id: 'ml-6-2', skill: 'loss', title: 'Mean squared error',
            prompt: `<p>Write <code>error(w, xs, ys)</code>: the mean squared error of the line <code>y = w · x</code> on the points <code>(xs[i], ys[i])</code>. For each point the miss is <code>w * xs[i] - ys[i]</code>; return the average of the squared misses. <code>error(2, [1, 2, 3], [2, 4, 6])</code> is <code>0.0</code> and <code>error(1, [2, 4], [1, 5])</code> is <code>1.0</code>.</p>`,
            starter: `def error(w, xs, ys):\n    total = 0\n    ...\n    return total`,
            solution: `def error(w, xs, ys):\n    total = 0\n    for i in range(len(xs)):\n        miss = w * xs[i] - ys[i]\n        total = total + miss * miss\n    return total / len(xs)`,
            hints: ['Loop over the positions. For each, compute the miss and add its square to the total.', 'Return the total divided by the number of points, len(xs), so the answer is an average.'],
            tests: [{ call: 'error(2, [1, 2, 3], [2, 4, 6])', expect: '0.0' }, { call: 'round(error(1, [1, 2, 3], [2, 4, 6]), 3)', expect: '4.667' }, { call: 'error(0, [1], [3])', expect: '9.0' }, { call: 'error(1, [2, 4], [1, 5])', expect: '1.0' }, { call: 'error(3, [1, 2], [2, 4])', expect: '2.5' }],
            failTip: 'If error(1, [2, 4], [1, 5]) gives 0.0, the misses are being added before squaring: +1 and −1 cancel. Square each one first.',
            followup: 'Write error2(w, b, xs, ys) for the line y = w·x + b, which need not go through 0. Which w and b give error 0 for the points (0, 1), (1, 3), (2, 5)?'
          }
        },
        {
          ex: {
            id: 'ml-6-3', skill: 'gradient', title: 'Gradient descent',
            prompt: `<p>Write <code>descend(xs, ys, rate, steps)</code>. Start with <code>w = 0</code> and take <code>steps</code> steps of gradient descent for the line <code>y = w · x</code>, using the exact slope of the mean squared error: the average over the points of <code>2 * (w * xs[i] - ys[i]) * xs[i]</code>. Each step sets <code>w = w - rate * slope</code>. Return the final <code>w</code>.</p>
<p><code>round(descend([1, 2, 3], [2, 4, 6], 0.1, 10), 3)</code> is <code>2.0</code>. The points (1, 3), (2, 5), (3, 7) do not lie on any line through 0, and descent finds the best one: <code>round(descend([1, 2, 3], [3, 5, 7], 0.05, 50), 3)</code> is <code>2.429</code>.</p>`,
            starter: `def descend(xs, ys, rate, steps):\n    w = 0\n    ...\n    return w`,
            solution: `def descend(xs, ys, rate, steps):\n    w = 0\n    for s in range(steps):\n        slope = 0\n        for i in range(len(xs)):\n            slope = slope + 2 * (w * xs[i] - ys[i]) * xs[i]\n        slope = slope / len(xs)\n        w = w - rate * slope\n    return w`,
            hints: ['An outer loop for the steps. Inside it, work out the slope at the current w with an inner loop over the points, then divide by len(xs).', 'The slope must start again from 0 at every step: set slope = 0 inside the outer loop, before the inner one. Then w = w - rate * slope.'],
            tests: [{ call: 'round(descend([1, 2, 3], [2, 4, 6], 0.1, 10), 3)', expect: '2.0' }, { call: 'round(descend([1, 2, 3], [3, 5, 7], 0.05, 50), 3)', expect: '2.429' }, { call: 'round(descend([1, 2, 3], [2, 4, 6], 0.01, 1), 3)', expect: '0.187' }, { call: 'round(descend([2], [5], 0.1, 30), 3)', expect: '2.5' }, { call: 'round(descend([1, 2, 3], [2, 4, 6], 0.25, 3), 3)', expect: '6.741' }],
            failTip: 'If one step from 0 with rate 0.01 gives something other than 0.187, check that the slope is divided by the number of points and starts again from 0 at every step.',
            followup: 'Make descend stop early when the slope is tiny, say smaller than 0.0001 either way, and return how many steps it took too. Compare rates 0.01, 0.05 and 0.1 on the points (1, 3), (2, 5), (3, 7).'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A model's <b>error</b> is one number: here the <b>mean squared error</b>, the average of the squared misses. Training means making it small.</li>
<li>The <b>slope</b> says how the error changes when a weight changes a little. <b>Gradient descent</b> steps against it: <code>w = w − rate × slope</code>, again and again. With many weights, the slopes together are the <b>gradient</b>.</li>
<li>The <b>learning rate</b> sets the step size. Too small crawls, too big overshoots, and much too big makes the error grow without end.</li>
<li>The answer to the opening question: gradient descent never needs to see the whole landscape or try every value. It needs only the slope where it stands, which is why Cauchy's idea for six orbit numbers works for a billion weights.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-09', '3B-AP-12', '3B-DA-05'],
      title: 'Twenty questions', summary: 'Decision trees: a model you can read, built by asking the most useful question first. Entropy, the measure of how mixed a group is, and information gain, how much a question helps.',
      blocks: [
        `<p>In the late 1970s the British computer scientist Donald Michie set a puzzle. Take a chess endgame, a king and rook against a king and knight. From features of the position alone, without searching through the moves, decide whether the knight's side is lost within a certain number of moves. The Australian J. Ross Quinlan answered with a program called ID3, which learned a <b>decision tree</b>: a flowchart of questions about the position, each answer leading to the next question, ending in a verdict.</p>
<p>In a 1986 paper Quinlan reported one of its tests. 1.4 million chess positions, described by 49 yes-or-no features, came down to 715 different cases. Trees learned from a random fifth of them labelled more than 84% of the unseen cases right: a test set, as in lesson 3. To explain how ID3 works, the same paper uses a much smaller table: fourteen Saturday mornings, described by the weather, each marked P if it suited "some unspecified activity" and N if not.</p>
<p>A flowchart could ask its questions in any order. So how does a program decide which question to ask first?</p>`,
        `<h2>Asking questions</h2>
<p>In the game twenty questions, one player thinks of something and the other may ask twenty yes-or-no questions. "Is it alive?" is a good first question; "Is it a giraffe?" is a poor one. A decision tree plays the same game with the features of an example. Here are Quinlan's fourteen mornings.</p>
<div class="tbl-wrap"><table class="small">
<tr><th>No.</th><th>outlook</th><th>temperature</th><th>humidity</th><th>windy</th><th>class</th></tr>
<tr><td>1</td><td>sunny</td><td>hot</td><td>high</td><td>false</td><td>N</td></tr>
<tr><td>2</td><td>sunny</td><td>hot</td><td>high</td><td>true</td><td>N</td></tr>
<tr><td>3</td><td>overcast</td><td>hot</td><td>high</td><td>false</td><td>P</td></tr>
<tr><td>4</td><td>rain</td><td>mild</td><td>high</td><td>false</td><td>P</td></tr>
<tr><td>5</td><td>rain</td><td>cool</td><td>normal</td><td>false</td><td>P</td></tr>
<tr><td>6</td><td>rain</td><td>cool</td><td>normal</td><td>true</td><td>N</td></tr>
<tr><td>7</td><td>overcast</td><td>cool</td><td>normal</td><td>true</td><td>P</td></tr>
<tr><td>8</td><td>sunny</td><td>mild</td><td>high</td><td>false</td><td>N</td></tr>
<tr><td>9</td><td>sunny</td><td>cool</td><td>normal</td><td>false</td><td>P</td></tr>
<tr><td>10</td><td>rain</td><td>mild</td><td>normal</td><td>false</td><td>P</td></tr>
<tr><td>11</td><td>sunny</td><td>mild</td><td>normal</td><td>true</td><td>P</td></tr>
<tr><td>12</td><td>overcast</td><td>mild</td><td>high</td><td>true</td><td>P</td></tr>
<tr><td>13</td><td>overcast</td><td>hot</td><td>normal</td><td>false</td><td>P</td></tr>
<tr><td>14</td><td>rain</td><td>mild</td><td>high</td><td>true</td><td>N</td></tr>
</table></div>
<div class="stmt"><p><span class="kind">Rule (decision tree).</span> A <b>decision tree</b> asks about one feature at each step and follows the branch for the answer, until it reaches a <b>leaf</b>, which gives the label. As a program it is a set of nested <code>if</code>s. Unlike the weights of a perceptron, a tree can be read by a person, who can check every decision it makes.</p></div>`,
        { predict: true, play: `def saturday(outlook, humidity, windy):
    if outlook == "overcast":
        return "P"
    if outlook == "sunny":
        if humidity == "high":
            return "N"
        return "P"
    if windy:
        return "N"
    return "P"

print(saturday("sunny", "high", False))
print(saturday("rain", "high", False))
print(saturday("overcast", "high", True))`, caption: 'N, P, P. This is the tree ID3 builds from the table: first the outlook; if sunny, the humidity; if rain, the wind. Check it against the table: it gets all fourteen mornings right, and it never asks about the temperature at all. Look up the first morning, 1, in the table and follow the tree for it.' },
        { check: 'Using the tree above, what does it say for a morning that is <em>rain</em>, <em>hot</em>, humidity <em>normal</em> and <em>windy</em>?', skill: 'decision-tree', options: ['P, because the humidity is normal', 'N', 'It cannot answer, because no morning in the table is rain and hot'], answer: 1, wrong: ['The humidity is asked only on the sunny branch. On a rainy morning the tree asks about the wind.', null, 'A tree answers for any morning: it follows the branches for the answers it asks about. The temperature is never asked.'], why: 'Outlook is rain, so the tree skips the overcast and sunny branches and asks about the wind: windy, so N. A tree gives an answer for combinations it never saw, which is the point of learning one.' },
        `<h2>Measuring how mixed: entropy</h2>
<p>A good question splits the examples into groups that are each as pure as possible: all P or all N. To choose, ID3 needs a number for how mixed a group is. It took one from Claude Shannon's 1948 theory of information, where it measures surprise in <b>bits</b>: one bit is the answer to one fair yes-or-no question.</p>
<div class="stmt"><p><span class="kind">Rule (entropy).</span> If a fraction <code>p</code> of a group has each label, the <b>entropy</b> of the group is the sum, over the labels, of <code>−p × log₂(p)</code>. A pure group has entropy 0: there is nothing left to ask. Half P and half N has entropy 1 bit, the most two labels can have. <code>log₂(p)</code> is the power of 2 that gives <code>p</code>: <code>log₂(1/2) = −1</code>, <code>log₂(1/4) = −2</code>. In Python it is <code>math.log2(p)</code>.</p></div>`,
        { predict: true, play: `import math

def entropy(labels):
    total = 0
    for label in ["P", "N"]:
        p = labels.count(label) / len(labels)
        if p > 0:
            total = total - p * math.log2(p)
    return total

print(round(entropy(["P", "N"]), 4))
print(round(entropy(["P", "P", "P", "P"]), 4))
print(round(entropy(["P"] * 9 + ["N"] * 5), 4))`, caption: '1.0, 0.0, 0.9403. An even split is one full bit of uncertainty; a pure group is none. The fourteen mornings, 9 P and 5 N, have 0.94 bits: mixed, but leaning P. The if p > 0 is there because log₂(0) does not exist; a label that never occurs adds nothing.' },
        { check: 'Which group has the highest entropy?', skill: 'entropy', options: ['8 P and 0 N', '7 P and 1 N', '4 P and 4 N'], answer: 2, wrong: ['A pure group has entropy 0: you know the label without asking.', 'Mostly P, so a guess of P is usually right: a little uncertainty, about 0.54 bits.', null], why: 'An even split leaves you least sure of the label, 1 bit. The purer the group, the lower its entropy, down to 0 for a group with one label.' },
        `<h2>The best question</h2>
<p>Now the rule for choosing. Ask each possible question, see how mixed the groups it makes are, and keep the question that leaves the least uncertainty behind.</p>
<div class="stmt"><p><span class="kind">Rule (information gain).</span> Splitting a group by a feature makes one smaller group for each value. The entropy <em>after</em> the split is the average of the groups' entropies, each weighted by its share of the examples. The <b>information gain</b> of the question is the entropy before minus the entropy after. ID3 asks the question with the largest gain, then does the same inside each group that is still mixed, and stops at pure groups.</p></div>`,
        { fig: 'dtree', caption: 'Quinlan\'s fourteen mornings. Each button shows the information gain of that question, in bits. Build the tree ID3 builds by always choosing the largest gain, then try a worse first question, such as temperature, and count how many questions the tree needs then.' },
        { predict: true, play: `import math

outlook = ["sunny", "sunny", "overcast", "rain", "rain", "rain", "overcast",
           "sunny", "sunny", "rain", "sunny", "overcast", "overcast", "rain"]
windy = [False, True, False, False, False, True, True, False, False, False, True, True, False, True]
labels = ["N", "N", "P", "P", "P", "N", "P", "N", "P", "P", "P", "P", "P", "N"]

def entropy(group):
    total = 0
    for label in ["P", "N"]:
        p = group.count(label) / len(group)
        if p > 0:
            total = total - p * math.log2(p)
    return total

def gain(column):
    after = 0
    for value in set(column):
        group = []
        for i in range(len(labels)):
            if column[i] == value:
                group.append(labels[i])
        after = after + len(group) / len(labels) * entropy(group)
    return entropy(labels) - after

print("outlook:", round(gain(outlook), 3))
print("windy:", round(gain(windy), 3))`, long: true, caption: 'outlook: 0.247, windy: 0.048. Splitting by outlook leaves much less uncertainty: overcast mornings are all P, a pure group. Quinlan\'s paper prints 0.246 for the outlook, because it rounded the entropies to three places before subtracting; the exact value is 0.2467. Add the humidity column and work out its gain.' },
        { check: 'Splitting a group by "windy" leaves its entropy at 0.892 bits, down from 0.940. What is the information gain?', skill: 'info-gain', options: ['0.048 bits', '0.892 bits', '1.832 bits'], answer: 0, wrong: [null, 'That is what is left after the question, not what the question removed. Gain is before minus after.', 'Gains are subtracted, not added: a question cannot leave more uncertainty than there was.'], why: 'Gain = entropy before − entropy after = 0.940 − 0.892 = 0.048 bits. Windy helps a little; outlook, with a gain of 0.247, helps five times as much, so it is asked first.' },
        `<p>Three functions make up ID3's choice: group the labels by a feature, measure each group, and compare. Put the first together, then write the other two.</p>`,
        {
          ex: {
            id: 'ml-7-1', kind: 'parsons', skill: 'info-gain', title: 'Put it in order: grouping by a feature',
            prompt: `<p>Build <code>groups(column, labels)</code>. It returns a dictionary from each value in <code>column</code> to the list of the labels of the examples with that value, in order. For <code>groups(["a", "b", "a"], ["P", "N", "N"])</code> it returns <code>{"a": ["P", "N"], "b": ["N"]}</code>. Put each line at the right depth. Not every block belongs.</p>`,
            lines: ['def groups(column, labels):', '    result = {}', '    for i in range(len(column)):', '        value = column[i]', '        if value not in result:', '            result[value] = []', '        result[value].append(labels[i])', '    return result'],
            distractors: ['        result[value] = [labels[i]]', '    for i in range(1, len(column)):'],
            tests: [{ call: 'groups(["a", "b", "a"], ["P", "N", "N"])["a"]', expect: "['P', 'N']" }, { call: 'groups(["a", "b", "a"], ["P", "N", "N"])["b"]', expect: "['N']" }, { call: 'sorted(groups(["x", "y", "x", "x"], [1, 2, 3, 4]).items())', expect: "[('x', [1, 3, 4]), ('y', [2])]" }, { call: 'groups([], [])', expect: '{}' }, { call: 'len(groups(["sunny", "rain", "overcast", "rain"], ["N", "P", "P", "N"]))', expect: '3' }],
            hints: ['A value seen for the first time needs an empty list before anything can be appended to it.', 'result[value] = [labels[i]] would replace the list every time the value comes back, losing the earlier labels. Make the list once, then append.'],
            followup: 'Use groups and entropy to find the entropy of each outlook group of the fourteen mornings. Which group is pure?'
          }
        },
        {
          ex: {
            id: 'ml-7-2', skill: 'entropy', title: 'Entropy of any labels',
            prompt: `<p>Write <code>entropy(labels)</code> for a list with any labels, not only P and N: count each label (a dictionary does it), and add up <code>−p × log₂(p)</code> over the labels that occur, where <code>p</code> is the label's count divided by the length of the list. <code>round(entropy(["P", "N"]), 3)</code> is <code>1.0</code> and <code>round(entropy(["a", "b", "c", "d"]), 3)</code> is <code>2.0</code>: four equally likely labels take two yes-or-no questions.</p>`,
            starter: `import math\n\ndef entropy(labels):\n    counts = {}\n    ...\n    return 0`,
            solution: `import math\n\ndef entropy(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    total = 0\n    for label in counts:\n        p = counts[label] / len(labels)\n        total = total - p * math.log2(p)\n    return total`,
            hints: ['First count: for label in labels: counts[label] = counts.get(label, 0) + 1. Only labels that occur are in the dictionary, so p is never 0.', 'Then for each label in counts: p = counts[label] / len(labels), and total = total - p * math.log2(p).'],
            tests: [{ call: 'round(entropy(["P", "N"]), 3)', expect: '1.0' }, { call: 'round(entropy(["P", "P", "P", "P"]), 3)', expect: '0.0' }, { call: 'round(entropy(["P"] * 9 + ["N"] * 5), 4)', expect: '0.9403' }, { call: 'round(entropy(["a", "b", "c", "d"]), 3)', expect: '2.0' }, { call: 'round(entropy(["x", "x", "y"]), 3)', expect: '0.918' }],
            failTip: 'If ["P", "N"] gives -1.0, the sign is the wrong way round: each term is minus p times log₂(p), and log₂(p) is negative.',
            followup: 'What is the entropy of 8 different labels, one example each? Of 1,024? Write the pattern as a rule, and say what it has to do with twenty questions.'
          }
        },
        {
          ex: {
            id: 'ml-7-3', skill: 'info-gain', title: 'Information gain',
            prompt: `<p>Write <code>gain(column, labels)</code>: the entropy of all the labels, minus the weighted average entropy of the groups that <code>column</code> splits them into. Each group's entropy counts in proportion to its size, <code>len(group) / len(labels)</code>. <code>entropy</code> is written for you.</p>
<p>On Quinlan's table, <code>round(gain(outlook, labels), 3)</code> is <code>0.247</code> and <code>round(gain(windy, labels), 3)</code> is <code>0.048</code>.</p>`,
            starter: `import math\n\ndef entropy(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    total = 0\n    for label in counts:\n        p = counts[label] / len(labels)\n        total = total - p * math.log2(p)\n    return total\n\ndef gain(column, labels):\n    groups = {}\n    ...\n    return 0`,
            solution: `import math\n\ndef entropy(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    total = 0\n    for label in counts:\n        p = counts[label] / len(labels)\n        total = total - p * math.log2(p)\n    return total\n\ndef gain(column, labels):\n    groups = {}\n    for i in range(len(column)):\n        if column[i] not in groups:\n            groups[column[i]] = []\n        groups[column[i]].append(labels[i])\n    after = 0\n    for value in groups:\n        after = after + len(groups[value]) / len(labels) * entropy(groups[value])\n    return entropy(labels) - after`,
            hints: ['First group the labels by the value in column, as in the Parsons problem: a dictionary from each value to a list of labels.', 'Then after = the sum over the groups of len(group) / len(labels) * entropy(group), and return entropy(labels) - after.'],
            tests: [{ call: 'round(gain(["sunny", "sunny", "overcast", "rain", "rain", "rain", "overcast", "sunny", "sunny", "rain", "sunny", "overcast", "overcast", "rain"], ["N", "N", "P", "P", "P", "N", "P", "N", "P", "P", "P", "P", "P", "N"]), 3)', expect: '0.247' }, { call: 'round(gain(["false", "true", "false", "false", "false", "true", "true", "false", "false", "false", "true", "true", "false", "true"], ["N", "N", "P", "P", "P", "N", "P", "N", "P", "P", "P", "P", "P", "N"]), 3)', expect: '0.048' }, { call: 'round(gain(["high", "high", "high", "high", "normal", "normal", "normal", "high", "normal", "normal", "normal", "high", "normal", "high"], ["N", "N", "P", "P", "P", "N", "P", "N", "P", "P", "P", "P", "P", "N"]), 3)', expect: '0.152' }, { call: 'round(gain(["a", "a", "b", "b"], ["P", "P", "N", "N"]), 3)', expect: '1.0' }, { call: 'round(gain(["a", "b", "a", "b"], ["P", "P", "N", "N"]), 3)', expect: '0.0' }],
            failTip: 'If a pure split gives 0.0 instead of 1.0, the subtraction is the wrong way round: gain is the entropy before minus the entropy after.',
            followup: 'Among the five sunny mornings only, which feature has the largest gain? Among the five rainy ones? Check your answers against the tree in the lesson.'
          }
        },
        `<div class="recap"><h3>In this lesson</h3><ul>
<li>A <b>decision tree</b> asks one question about a feature at each step and ends at a leaf that gives the label. It is nested <code>if</code>s that a person can read and check.</li>
<li><b>Entropy</b> measures how mixed a group is, in bits: 0 for a pure group, 1 for an even split of two labels. It is the sum of <code>−p × log₂(p)</code> over the labels.</li>
<li><b>Information gain</b> is the entropy before a question minus the weighted entropy of the groups after it.</li>
<li><b>ID3</b> asks the question with the largest gain, then repeats inside every group that is still mixed.</li>
<li>The answer to the opening question: ask first whatever removes the most uncertainty, measured in bits, as a good player of twenty questions does. On Quinlan's mornings that is the outlook, worth 0.247 bits against 0.048 for the wind.</li>
</ul></div>`
      ]
    },
    /* ================================================================== */
    {
      standards: ['3B-AP-08', '3B-AP-09'],
      title: 'Checkpoint two', checkpoint: true, summary: 'No new ideas: mixed questions on perceptrons, gradient descent and decision trees, then a choice of model and a program that picks the best question.',
      blocks: [
        `<p>Three lessons, three kinds of model: a weighted vote that draws a line, a descent that finds the best numbers by feeling the slope, and a tree of questions chosen by information gain. The questions below mix them on purpose, along with the ideas that are easy to confuse: the learning rate and the slope, the entropy of a group and the gain of a question.</p>
<p>Before you start: which of the three models could you explain, decision by decision, to someone who had never heard of it?</p>
<h2>Mixed questions</h2>`,
        { check: 'Weights <code>[1, 1]</code>, bias <code>-5</code>. What does a perceptron say about <code>[2, 2]</code>?', skill: 'weighted-sum', options: ['1', '−1'], answer: 1, wrong: ['The bias counts too: 2 + 2 − 5 = −1, which is not above 0.', null], why: 'The score is −5 + 1 × 2 + 1 × 2 = −1. Not above 0, so −1. The bias moves the line away from the corner (0, 0).' },
        { check: 'A perceptron gets every training example right on its first pass. What does the perceptron rule change during that pass?', skill: 'perceptron-rule', options: ['Every weight a little, towards the right answers', 'Nothing', 'The bias only'], answer: 1, wrong: ['The perceptron rule only changes the weights after a mistake. With no mistakes there is nothing to correct.', null, 'The bias changes with the weights, and only after a mistake.'], why: 'The rule updates only when a prediction is wrong. A pass with no mistakes changes nothing, which is why training stops there.' },
        { check: 'Sixty points are labelled 1 inside a ring and −1 outside it. Which model can learn them?', skill: 'linear-limits', options: ['A single perceptron', 'A decision tree, or k nearest neighbours', 'Neither kind of model'], answer: 1, wrong: ['A ring is not one side of a straight line, and a perceptron can only draw one line.', null, 'Nearest neighbours copies its neighbours\' labels whatever the shape of the region, and a tree can carve a ring into boxes with enough questions.'], why: 'A perceptron draws one straight line, so it cannot learn a ring, just as it cannot learn exclusive or. k-NN and decision trees can draw boundaries of any shape.' },
        { check: 'Two lines have misses <code>[3, −3]</code> and <code>[1, 1]</code>. Which has the smaller mean squared error?', skill: 'loss', options: ['The first: its misses add up to 0', 'The second'], answer: 1, wrong: ['Its misses cancel when added, which is exactly why they are squared first: 9 + 9 over 2 is an error of 9.', null], why: 'Squared, the first line\'s misses are 9 and 9, an average of 9. The second\'s are 1 and 1, an average of 1. Squaring stops misses in opposite directions from cancelling.' },
        { check: 'The slope of the error at <code>w = 4</code> is <code>−2</code>, and the learning rate is 0.5. Where does the next step of gradient descent go?', skill: 'gradient', options: ['w = 3', 'w = 5', 'w = 2'], answer: 1, wrong: ['That follows the slope uphill. The step is w − rate × slope = 4 − 0.5 × (−2).', null, 'That moves by the whole slope in the wrong direction. The step is minus rate times slope.'], why: 'w − rate × slope = 4 − 0.5 × (−2) = 4 + 1 = 5. A negative slope means the error falls as w goes up, so w goes up.' },
        { check: 'After 1,000 steps of gradient descent the error is still falling slowly and steadily. What would most likely help?', skill: 'learning-rate', options: ['A smaller learning rate', 'A larger learning rate', 'Starting again from a different w'], answer: 1, wrong: ['Smaller steps would make the slow walk slower still.', null, 'The descent is going the right way, just slowly; a new start would walk the same way at the same pace.'], why: 'An error that falls steadily but slowly is the sign of steps that are too small: crawling. A larger learning rate takes bigger steps, as long as it is not so large that they overshoot.' },
        { check: 'A group of 10 examples has 5 of one label and 5 of another. What is its entropy?', skill: 'entropy', options: ['0 bits', '1 bit', '5 bits'], answer: 1, wrong: ['0 bits is a pure group, where the label is certain. Here it is a coin toss.', null, 'Entropy does not count examples: it measures how mixed they are. Two labels can be at most 1 bit apart from certain.'], why: 'An even split of two labels is the most uncertain two labels can be: −½ log₂ ½ − ½ log₂ ½ = 1 bit, the answer to one fair yes-or-no question.' },
        { check: 'Question A has information gain 0.30 bits and question B has 0.05 bits on the same examples. Which does ID3 ask first?', skill: 'info-gain', options: ['A', 'B, because it leaves more to learn later'], answer: 0, wrong: [null, 'ID3 is greedy: at every step it asks the question that removes the most uncertainty now.'], why: 'ID3 picks the largest gain, A. It removes 0.30 bits of uncertainty; B removes only 0.05.' },
        { check: 'Which of the three models from this unit can a person read, decision by decision, and check?', skill: 'decision-tree', options: ['A perceptron with 400 weights', 'A decision tree with a handful of questions', 'A line fitted by gradient descent to a million points'], answer: 1, wrong: ['Each weight is a number; why 400 of them add up to a decision is very hard to say.', null, 'A fitted line has few numbers, but they say nothing about why a particular point gets its value.'], why: 'A small tree is a list of questions in plain words: "Is the outlook sunny? Then is the humidity high?" Anyone can follow it and see why it decided. That is one reason trees are used where decisions must be explained.' },
        `<p>Two exercises to finish the unit: choose a model, then write the step at the heart of ID3.</p>`,
        {
          ex: {
            id: 'ml-8-1', kind: 'choice', skill: 'linear-limits', title: 'Which model fits?',
            prompt: `<p>A school wants to predict whether a student will need extra help in mathematics, from two numbers: their score on last year's test and the hours of homework they do a week. Teachers want to be able to see <em>why</em> the model flags each student, so that they can check it is fair. Which model fits best?</p>`,
            options: [
              { text: 'A single perceptron, because it is the simplest', why: 'It is simple, but its reasons are two weights and a bias, and it can only draw one straight line between the groups.' },
              { text: 'A decision tree with a few questions, such as "Was the score below 50?"', ok: true },
              { text: 'k nearest neighbours with k = 1', why: 'Its only reason is "this student is close to that one", and with k = 1 a single unusual student decides for everyone near them.' },
              { text: 'Memorising last year\'s students', why: 'That gives no answer at all for a student it has not seen, as lesson 3 showed.' }
            ],
            hints: ['The teachers\' demand is that every decision can be explained.', 'Which model\'s decisions are a short list of questions in plain words?'],
            solution: '<p>A small decision tree. Every prediction comes with its reasons, "score below 50, fewer than 2 hours of homework", which teachers can read, question and check for fairness. The other models may be as accurate, but they cannot say why.</p>',
            followup: 'A tree can still be unfair if the examples it learned from were unfair. Think of one way the training data of last year\'s students could build an unfair tree.'
          }
        },
        {
          ex: {
            id: 'ml-8-2', skill: 'info-gain', title: 'The best question',
            prompt: `<p>Write <code>best_question(table, labels)</code>. <code>table</code> is a dictionary from a feature's name to its column of values; return the name of the feature with the largest information gain. <code>entropy</code> and <code>gain</code> are written for you. No two features in the tests have the same gain.</p>
<p>For Quinlan's fourteen mornings it returns <code>"outlook"</code>. For only the five sunny mornings it returns <code>"humidity"</code>, and for only the five rainy ones <code>"windy"</code>: the tree of lesson 7.</p>`,
            starter: `import math\n\ndef entropy(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    total = 0\n    for label in counts:\n        p = counts[label] / len(labels)\n        total = total - p * math.log2(p)\n    return total\n\ndef gain(column, labels):\n    groups = {}\n    for i in range(len(column)):\n        if column[i] not in groups:\n            groups[column[i]] = []\n        groups[column[i]].append(labels[i])\n    after = 0\n    for value in groups:\n        after = after + len(groups[value]) / len(labels) * entropy(groups[value])\n    return entropy(labels) - after\n\ndef best_question(table, labels):\n    best = None\n    ...\n    return best`,
            solution: `import math\n\ndef entropy(labels):\n    counts = {}\n    for label in labels:\n        counts[label] = counts.get(label, 0) + 1\n    total = 0\n    for label in counts:\n        p = counts[label] / len(labels)\n        total = total - p * math.log2(p)\n    return total\n\ndef gain(column, labels):\n    groups = {}\n    for i in range(len(column)):\n        if column[i] not in groups:\n            groups[column[i]] = []\n        groups[column[i]].append(labels[i])\n    after = 0\n    for value in groups:\n        after = after + len(groups[value]) / len(labels) * entropy(groups[value])\n    return entropy(labels) - after\n\ndef best_question(table, labels):\n    best = None\n    for name in table:\n        if best is None or gain(table[name], labels) > gain(table[best], labels):\n            best = name\n    return best`,
            hints: ['Loop over the names in the dictionary: for name in table. table[name] is that feature\'s column.', 'Keep the best name so far, as in nearest: replace it when gain(table[name], labels) is larger than gain(table[best], labels), or when there is no best yet.'],
            tests: [{ call: 'best_question({"outlook": ["sunny", "sunny", "overcast", "rain", "rain", "rain", "overcast", "sunny", "sunny", "rain", "sunny", "overcast", "overcast", "rain"], "temperature": ["hot", "hot", "hot", "mild", "cool", "cool", "cool", "mild", "cool", "mild", "mild", "mild", "hot", "mild"], "humidity": ["high", "high", "high", "high", "normal", "normal", "normal", "high", "normal", "normal", "normal", "high", "normal", "high"], "windy": ["false", "true", "false", "false", "false", "true", "true", "false", "false", "false", "true", "true", "false", "true"]}, ["N", "N", "P", "P", "P", "N", "P", "N", "P", "P", "P", "P", "P", "N"])', expect: "'outlook'" }, { call: 'best_question({"temperature": ["hot", "hot", "mild", "cool", "mild"], "humidity": ["high", "high", "high", "normal", "normal"], "windy": ["false", "true", "false", "false", "true"]}, ["N", "N", "N", "P", "P"])', expect: "'humidity'" }, { call: 'best_question({"temperature": ["mild", "cool", "cool", "mild", "mild"], "humidity": ["high", "normal", "normal", "normal", "high"], "windy": ["false", "false", "true", "false", "true"]}, ["P", "P", "N", "P", "N"])', expect: "'windy'" }, { call: 'best_question({"a": [1, 2, 1, 2], "b": [1, 1, 2, 2]}, ["x", "x", "y", "y"])', expect: "'b'" }],
            failTip: 'If the answer is always the first feature, the comparison never replaces it: compare gain(table[name], labels) with gain(table[best], labels), not with a fixed number.',
            followup: 'Write id3(table, labels) that prints the whole tree: ask the best question, then call itself on each group that is still mixed, leaving out the feature just used. (Recursion, a function calling itself, is lesson 11 of SC 101.)'
          }
        },
        `<div class="recap"><h3>Unit two in a few lines</h3><ul>
<li>A <b>perceptron</b> labels by the sign of a weighted sum and learns by moving its weights after each mistake. It can only learn what one straight line separates.</li>
<li><b>Gradient descent</b> makes the error small by stepping against its slope; the <b>learning rate</b> sets the step, and both too small and too large go wrong.</li>
<li>A <b>decision tree</b> asks the question with the largest <b>information gain</b> first; <b>entropy</b> measures how mixed a group is, in bits.</li>
<li>Next: words. Computers only handle numbers, so the next unit turns text into numbers, then builds a model that writes, one word at a time.</li>
</ul></div>`
      ]
    }
  ]
});
