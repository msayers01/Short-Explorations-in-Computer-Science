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
  audience: `<p><b>Grades 9–12</b>, after <em>Introduction to Python</em> (SC 101) up to lesson 9, Dictionaries: you should be able to write a function with a loop, use a list, and count things with a dictionary. No mathematics beyond Pythagoras' theorem is needed; where a lesson uses more, it says what and shows it.</p>`,
  tagline: 'Spam filters, nearest neighbours and honest tests: build the models behind machine learning yourself, small enough to understand every line.',
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
    'Recognise overfitting: a model that is perfect on its training examples and worse on new ones'
  ],
  howItWorks: `<h3>How to use these pages</h3><p>Every code box has a <b>Run</b> button. Some ask you to write down what you think the program will print before it runs: do it, because a wrong guess you then correct is remembered better than a right answer you were given. <b>Quick checks</b> ask how sure you are before they mark you; the questions come back on the Review page after a day, then after longer gaps. Each lesson ends with a puzzle or a trace and two programs to write, which the computer checks against its own tests. Lesson 4 is a <b>checkpoint</b>: no new ideas, just mixed questions on the first three lessons.</p>`,
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
    { id: 'overfitting', name: 'Recognise overfitting' }
  ],
  lessons: [
    /* ================================================================== */
    {
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
    }
  ]
});
