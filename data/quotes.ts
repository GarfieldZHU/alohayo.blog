export interface Quote {
  text: string
  author: string
  explanation: string
}

export const quotes: Quote[] = [
  {
    text: 'Simplicity is prerequisite for reliability.',
    author: 'Edsger W. Dijkstra',
    explanation:
      'Complex systems break in complex ways. The fewer moving parts, the fewer things can go wrong.',
  },
  {
    text: 'Programs must be written for people to read, and only incidentally for machines to execute.',
    author: 'Harold Abelson',
    explanation:
      'Code is communication. If your teammates cannot understand it, its cleverness is worthless.',
  },
  {
    text: 'There are only two hard things in Computer Science: cache invalidation and naming things.',
    author: 'Phil Karlton',
    explanation:
      'Naming reveals understanding. If you struggle to name something, you probably do not fully understand what it does.',
  },
  {
    text: 'Make it work, make it right, make it fast.',
    author: 'Kent Beck',
    explanation:
      'Premature optimization is the root of all evil. Get correctness first, then measure before optimizing.',
  },
  {
    text: 'The best code is no code at all.',
    author: 'Jeff Atwood',
    explanation:
      'Every line of code is a liability. Delete code fearlessly — the version control remembers.',
  },
  {
    text: 'Talk is cheap. Show me the code.',
    author: 'Linus Torvalds',
    explanation: 'Architecture astronauts talk in abstractions. Ship something and iterate.',
  },
  {
    text: 'First, solve the problem. Then, write the code.',
    author: 'John Johnson',
    explanation:
      'Jumping to implementation without understanding the problem guarantees you will solve the wrong thing.',
  },
  {
    text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.',
    author: 'Martin Fowler',
    explanation:
      'Readability is not a luxury — it is the single biggest factor in long-term maintainability.',
  },
  {
    text: 'The most dangerous phrase in the language is "We have always done it this way."',
    author: 'Grace Hopper',
    explanation:
      'Legacy practices survive on inertia, not merit. Question everything — especially traditions.',
  },
  {
    text: 'Debugging is twice as hard as writing the code in the first place.',
    author: 'Brian Kernighan',
    explanation:
      'If you write code as cleverly as possible, you are by definition not smart enough to debug it.',
  },
  {
    text: 'Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.',
    author: 'Antoine de Saint-Exupéry',
    explanation:
      'Elegant systems are minimal. Every feature you resist adding is a bug you will never have to fix.',
  },
  {
    text: 'It works on my machine.',
    author: 'Every Developer Ever',
    explanation:
      'Environment assumptions are the silent killer. If it is not reproducible, it is not shipped.',
  },
  {
    text: 'Measuring programming progress by lines of code is like measuring aircraft building progress by weight.',
    author: 'Bill Gates',
    explanation: 'More code is not more progress. The best diff is often negative lines.',
  },
  {
    text: 'The function of good software is to make the complex appear to be simple.',
    author: 'Grady Booch',
    explanation:
      'Complexity is inevitable in the problem domain. Your job is to hide it behind clean abstractions.',
  },
  {
    text: 'Walking on water and developing software from a specification are easy if both are frozen.',
    author: 'Edward V. Berard',
    explanation:
      'Requirements change. Embrace it with iterative delivery instead of fighting it with upfront planning.',
  },
  {
    text: 'The only way to go fast, is to go well.',
    author: 'Robert C. Martin',
    explanation:
      'Cutting corners creates tech debt that compounds with interest. Quality is speed in the long run.',
  },
  {
    text: 'A language that does not affect the way you think about programming is not worth knowing.',
    author: 'Alan Perlis',
    explanation:
      'Learning a new language should reshape how you model problems, not just give you new syntax for the same patterns.',
  },
  {
    text: 'Software is like entropy: it is difficult to grasp, weighs nothing, and obeys the Second Law of Thermodynamics — it always increases.',
    author: 'Norman Augustine',
    explanation:
      'Left unattended, codebases decay toward chaos. Active maintenance is not optional.',
  },
  {
    text: 'Before software can be reusable it first has to be usable.',
    author: 'Ralph Johnson',
    explanation:
      'Do not abstract prematurely. Make it work for one case well before generalizing for many.',
  },
  {
    text: 'The computer was born to solve problems that did not exist before.',
    author: 'Bill Gates',
    explanation:
      'Technology creates its own problem space. Stay grounded in what actually helps users.',
  },
  {
    text: 'In theory, there is no difference between theory and practice. In practice, there is.',
    author: 'Yogi Berra',
    explanation:
      'Beautiful architecture on a whiteboard means nothing until it survives real traffic, real users, and real deadlines.',
  },
  {
    text: 'Deleted code is debugged code.',
    author: 'Jeff Sickel',
    explanation:
      'Code that does not exist has zero bugs, zero maintenance cost, and zero cognitive load.',
  },
  {
    text: 'If you think good architecture is expensive, try bad architecture.',
    author: 'Brian Foote',
    explanation: 'The cost of poor design is paid daily in confusion, rework, and fear of change.',
  },
  {
    text: 'One of my most productive days was throwing away 1000 lines of code.',
    author: 'Ken Thompson',
    explanation:
      'Subtraction is a creative act. Recognizing what to remove requires deeper understanding than what to add.',
  },
]
