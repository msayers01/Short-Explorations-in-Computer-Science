# Student Showcase

Each folder here is one student project, shown at `#/showcase/<folder-name>` and on the gallery `#/showcase`. The top bar always has a
"Showcase" link; with no project the page says "Nothing here yet." Folders whose name starts with `_` or `.` are ignored (use `_drafts/`).

## Adding a project

1. Copy the student's project folder to `showcase/<slug>/`. The slug is lower-case letters, digits and hyphens (`guess-the-number`); it becomes the web address.
2. Add `project.json` beside the code:

```json
{
  "title": "Guess the Number",
  "name": "Sam",
  "grade": "8",
  "note": "My first game: the computer picks a number and you guess it.",
  "date": "2026-10",
  "consent": true,
  "consentNote": "Sam and a parent agreed, email of 2026-10-05",
  "main": "main.py",
  "stdin": "50\n25\n"
}
```

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | up to 60 characters |
| `name` | yes | **a first name or a nickname**, up to 30 characters; never a surname or a school |
| `consent` | yes | must be `true`; the build fails without it |
| `consentNote` | no | for your records only; the build does not put it in the page |
| `grade` | no | `"7"` or `"9-10"` |
| `note` | no | up to 600 characters, plain text |
| `date` | no | `YYYY-MM` or `YYYY-MM-DD`; newest first in the gallery |
| `lang` | no | `python`, `java`, `cpp`, `c` or `scheme`; otherwise taken from the first source file |
| `main` | no | the file that runs and that "Open a copy in the Code Lab" copies; otherwise `main.*`, `app.*`, `game.*` or the first file |
| `stdin` | no | text typed to the program when it runs |
| `nameOk` | no | `true` to keep a two-word name such as "Mia R." |

3. `npm run build`, check the page, commit `showcase/` together with the rebuilt `dist/`.

## What is kept

Source files (`.py .java .cpp .cc .h .hpp .c .scm .ss .lisp`) and notes (`.txt .md`, shown but never run), up to 20 files, 60 KB each and
200 KB per project, in sub-folders too. Everything else (images, compiled files, `.git`, binaries) is left out, and the build prints what it left out.
Run works for Python, Java, C++ and Scheme; a C project is shown with "Open a copy in the Code Lab", where C runs. Java projects of several
files are joined as the Code Lab does, the main file first. Check that the program runs on the site before publishing it: the interpreters here
do not cover all of each language (see ARCHITECTURE.md §9e for Java).
