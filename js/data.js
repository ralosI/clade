// ===== Game data. Edit this file to add content. =====
const DRILLS = [
  { id: 'med',  n: 'Meditation',      base: 15,   cps: 1 },
  { id: 'bag',  n: 'Sandbag Strikes', base: 120,  cps: 6 },
  { id: 'spar', n: 'Sparring Partner',base: 900,  cps: 35 },
  { id: 'dom',  n: 'Domain Study',    base: 7500, cps: 220 }
];

const SKILLS = [
  { id: 'bf',   n: 'Black Flash',             d: '+10% crit chance per level (crits deal x2.5).' },
  { id: 'rct',  n: 'Reverse Cursed Technique',d: 'Heal 3% max HP each turn, per level.' },
  { id: 'flow', n: 'Cursed Flow',             d: '+15% passive CE per level.' },
  { id: 'dom',  n: 'Domain Expansion',        d: 'Every 5th turn, a huge hit: x(2 + 0.5 per level).' }
];

const STATS = [
  { id: 'pow', n: 'Power',   d: '+2 attack, +1 CE per click' },
  { id: 'vit', n: 'Vitality',d: '+10 max HP' },
  { id: 'ctl', n: 'Control', d: '+10% passive CE, +0.5 CE per click' },
  { id: 'spd', n: 'Speed',   d: '+2% dodge, +1% crit' }
];

const ITEMS = [
  { id: 'blade', n: 'Cursed Tool',         d: '+4 attack (permanent)', base: 50 },
  { id: 'charm', n: 'Protective Charm',    d: '+15 max HP (permanent)', base: 40 },
  { id: 'tonic', n: 'Cursed Energy Tonic', d: 'Instantly gain 60s of CE income (min 100).', base: 30, tonic: true }
];

// Stage i scales automatically. Every 5th stage is a boss.
const STAGE_NAMES = ['Wandering Curse','Grade 4 Curse','Cursed Spirit Swarm','Grade 3 Curse','Finger-Bearer Curse',
  'Grade 2 Curse','Disease Curse','Grade 1 Curse','Cursed Womb Spawn','Special Grade Curse'];

// p = success chance, y/c = yen/CE reward, l = CE lost on failure (all scaled by progress)
const AREAS = [
  { n: 'Jujutsu High Grounds', need: 0, t: 'A faint curse lingers near the training hall.', ch: [
    { b: 'Fight it head on',  p: .7, y: 15, c: 60, l: 30, s: 'You exorcise it.',              f: 'It slips away and drains you.' },
    { b: 'Sneak past',        p: .9, y: 6,  c: 25, l: 10, s: 'You find a few loose charms.',  f: 'You trip a ward.' },
    { b: 'Ask a senior',      p: .5, y: 35, c: 20, l: 40, s: 'They pay you for the help.',    f: 'They make you run laps.' } ] },
  { n: 'Shinjuku Backstreets', need: 2, t: 'Rumors of a curse feeding on commuters.', ch: [
    { b: 'Investigate alone', p: .6, y: 40, c: 120, l: 60, s: 'You find and destroy the nest.', f: 'It was a trap.' },
    { b: 'Set a bait trap',   p: .8, y: 25, c: 70,  l: 30, s: 'The curse takes the bait.',      f: 'It ignores the bait.' } ] },
  { n: 'Shibuya Station', need: 5, t: 'A veil drops. The station is full of curses.', ch: [
    { b: 'Push through',      p: .5, y: 120, c: 350, l: 150, s: 'You clear a path.',            f: 'You are driven back.' },
    { b: 'Use side tunnels',  p: .7, y: 70,  c: 200, l: 80,  s: 'You surprise a pack.',         f: 'Dead end.' },
    { b: 'Rescue civilians',  p: .6, y: 90,  c: 250, l: 100, s: 'Grateful survivors help you.', f: 'You arrive too late.' } ] },
  { n: 'Cursed Womb Site', need: 8, t: 'Dark energy pulses beneath the ruins.', ch: [
    { b: 'Descend',           p: .45, y: 300, c: 900, l: 400, s: 'You return with spoils.',     f: 'The darkness overwhelms you.' },
    { b: 'Seal the entrance', p: .75, y: 150, c: 400, l: 150, s: 'The seal holds.',             f: 'The seal cracks.' } ] }
];

// Short summaries in our own words. Chapters unlock as you clear combat stages.
const STORY = [
  { need: 1, t: 'Chapter 1: The Vessel', x: 'A high schooler with extraordinary strength swallows a cursed finger to save his friends from a curse. Instead of dying, he becomes the host of the King of Curses. The powerful sorcerer Satoru Gojo steps in: the jujutsu world wants the boy executed, but Gojo persuades them to wait until he has consumed every finger. He enrolls at Tokyo Jujutsu High to learn how to fight.' },
  { need: 5, t: 'Chapter 2: The Exchange Event', x: 'Tokyo and Kyoto schools hold a friendly tournament, interrupted when curse users attack with cursed spirits. The students fight together, and a Kyoto rival pushes the hero to understand his own strength. In the heat of battle he lands his first Black Flash, a rare strike that bends cursed energy at the instant of impact.' },
  { need: 8, t: 'Chapter 3: The Shibuya Incident', x: 'On Halloween night, a veil traps thousands of civilians in Shibuya Station. The villains\' plan is to seal Gojo away, and it works. Cut off from his strongest ally, the hero is pushed to the edge, and the King of Curses takes control of his body. What follows is a brutal turning point for everyone involved.' }
];
