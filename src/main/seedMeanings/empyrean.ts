import type { DeckMeanings } from './types'

/**
 * The Empyrean — read in the register its art was drawn in.
 *
 * Voice follows the deck's art direction: a sacred illuminated manuscript found
 * in a celestial cathedral. Gothic, angelic, reverent, sensual without being
 * provocative; beauty treated as a spiritual force, and desire as a form of
 * devotion. The recurring subjects are longing, revelation, transformation, and
 * self-knowledge — so the cards are read as states of the soul rather than as
 * events in a week.
 *
 * Thoth-adjacent structure with its own courts: Guardian, Muse, Seeker, Beloved.
 * The deck does not support reversals, so there is no reversed text here.
 */
export const EMPYREAN_MEANINGS: DeckMeanings = {
  majors: {
    'The Fool': {
      keywords: ['descent', 'innocence', 'the first breath'],
      meaning:
        'The soul before it has learned to be afraid. It steps off the edge of heaven for no reason but wanting to see, and the wanting is the whole of its holiness.'
    },
    'The Magician': {
      keywords: ['utterance', 'craft', 'the named thing'],
      meaning:
        'The moment a thing is spoken and therefore is. Devotion with its sleeves rolled up: the hands know what the heart has already decided.'
    },
    'The Seer': {
      keywords: ['the veil', 'silence', 'inner sight'],
      meaning:
        'What is known behind the eyes and cannot survive being said. She does not withhold out of cruelty; the knowledge simply dies in open air.'
    },
    'The Diva': {
      keywords: ['beauty', 'creation', 'the offered self'],
      meaning:
        'Beauty as a force rather than an ornament. To be looked at and to make something of the looking — creation that begins in delight and does not apologise for it.'
    },
    'The Sovereign': {
      keywords: ['dominion', 'form', 'the throne'],
      meaning:
        'The self that has taken its own shape and holds it. Authority that comes from having decided, not from having been given permission.'
    },
    'The Druid': {
      keywords: ['transmission', 'the rite', 'lineage'],
      meaning:
        'The keeper of the words that were given. What is passed down survives the one who carries it — and outlives, sometimes, the meaning it was meant to hold.'
    },
    'The Lovers': {
      keywords: ['union', 'longing', 'the choice'],
      meaning:
        'Two who become a third thing. The card is desire, and it is also the knife in desire: to choose one is to have chosen against everything else.'
    },
    'The Chariot': {
      keywords: ['ascent', 'will', 'the borne'],
      meaning:
        'Something sacred carried at speed. The will is the vehicle and the passenger both; there are no reins, only the certainty of the direction.'
    },
    'The Covenant': {
      keywords: ['the promise', 'balance', 'the exact weight'],
      meaning:
        'The vow that binds by consent. What was sworn is measured out precisely — this is a card of consequence, and of the dignity in accepting it.'
    },
    'The Exile': {
      keywords: ['solitude', 'the lamp', 'the long dark'],
      meaning:
        'Cast out, or gone willingly. The light carried is small and lights only the next step — the search matters more than any arrival it promises.'
    },
    'The Wheel': {
      keywords: ['turning', 'the cycle', 'fate'],
      meaning:
        'The great turn that owes you nothing. It lifts and drops with the same motion, and the only question is what you are while it moves.'
    },
    Lust: {
      keywords: ['appetite', 'joy', 'the ridden beast'],
      meaning:
        'Desire without shame, which is a kind of courage. The beast is not conquered; it is loved, and it carries her because it wants to.'
    },
    'The Martyr': {
      keywords: ['surrender', 'the price', 'inversion'],
      meaning:
        'Given up on purpose. The world turns over and is seen truly — but only because something real was paid, and it is not returned.'
    },
    Death: {
      keywords: ['transformation', 'the shed', 'passage'],
      meaning:
        'The form dissolving so the thing inside can go on. Not cruelty — the tenderness of an ending that arrives exactly when it is due.'
    },
    'The Alchemist': {
      keywords: ['the vessel', 'tempering', 'the third thing'],
      meaning:
        'Two natures held in the fire until they consent to become one. The work is slow, exacting, and destroys both of its ingredients.'
    },
    'The Jailer': {
      keywords: ['appetite', 'the chain', 'the willing'],
      meaning:
        'The chains are loose, and beautiful, and chosen. What binds you here is not a captor but a hunger you have agreed to keep feeding.'
    },
    'The Tower': {
      keywords: ['revelation', 'collapse', 'the lightning'],
      meaning:
        'The cathedral struck by the thing it was built to praise. What falls was false; the violence is the mercy, though not while it happens.'
    },
    'The Star': {
      keywords: ['hope', 'the pouring', 'grace'],
      meaning:
        'The quiet after ruin, and the water given freely to ground that did nothing to earn it. Not rescue — the return of a direction worth wanting.'
    },
    'The Moon': {
      keywords: ['the threshold', 'dream', 'the false light'],
      meaning:
        'The hour when longing and terror are the same feeling. The path is real; the light is a liar. Go slowly, and go.'
    },
    'The Sun': {
      keywords: ['revelation', 'joy', 'the unhidden'],
      meaning:
        'Beheld entirely and not consumed. The card of being seen — wholly, in daylight — and finding that it is joy rather than judgement.'
    },
    'The Cosmos': {
      keywords: ['vastness', 'belonging', 'the pattern'],
      meaning:
        'The self set against everything and not annihilated. You are very small here, and it turns out that is not a wound.'
    },
    Acceptance: {
      keywords: ['completion', 'the return', 'peace'],
      meaning:
        'The circle closed and consented to. Not resignation — the last transformation, in which what you are is finally enough.'
    }
  },
  minors: {
    // Wands — fire: will, devotion in its ardent form.
    'wands-ace': {
      keywords: ['the spark', 'ardour', 'origin'],
      meaning:
        'The first flame, before it knows what it is for. Wanting, in its purest and least useful state.'
    },
    'wands-two': {
      keywords: ['dominion', 'the aim', 'resolve'],
      meaning:
        'The flame given a direction. Desire that has chosen, and stopped asking whether it may.'
    },
    'wands-three': {
      keywords: ['virtue', 'establishment', 'trust'],
      meaning: 'Ardour that has proved itself. Strength no longer performing — simply reliable.'
    },
    'wands-four': {
      keywords: ['completion', 'the feast', 'rest'],
      meaning:
        'The work rounded and celebrated. A holy pause, and a little less alive for being a pause.'
    },
    'wands-five': {
      keywords: ['strife', 'contention', 'heat'],
      meaning: 'Fire quarrelling with fire. Conflict without malice, and something is forged in it.'
    },
    'wands-six': {
      keywords: ['victory', 'acclaim', 'the crown'],
      meaning: 'Won, and seen. The moment before triumph turns into a thing that must be defended.'
    },
    'wands-seven': {
      keywords: ['valour', 'the stand', 'the odds'],
      meaning: 'Outnumbered and holding. Courage that does not consult the likelihood of winning.'
    },
    'wands-eight': {
      keywords: ['swiftness', 'the arrow', 'message'],
      meaning: 'Loosed and already in the air. Everything at once, too fast to be argued with.'
    },
    'wands-nine': {
      keywords: ['endurance', 'the scar', 'vigil'],
      meaning:
        'Wounded and unbroken. Strength that has cost something and is being spent with care.'
    },
    'wands-ten': {
      keywords: ['oppression', 'excess', 'the load'],
      meaning:
        'Ardour with nowhere to go turns cruel. Devotion carried past the point it blesses anyone.'
    },
    'wands-guardian': {
      keywords: ['the charge', 'onslaught', 'fire of fire'],
      meaning:
        'The Guardian of Wands. Fire defending fire — swift, generous, gone before you have answered.'
    },
    'wands-muse': {
      keywords: ['the steady flame', 'presence', 'command'],
      meaning:
        'The Muse of Wands. Ardour made constant: a certainty that warms the room rather than taking it.'
    },
    'wands-seeker': {
      keywords: ['the pursuit', 'will', 'restlessness'],
      meaning:
        'The Seeker of Wands. Desire with a destination — brilliant, impatient, unkind when bored.'
    },
    'wands-beloved': {
      keywords: ['the flare', 'brilliance', 'the beheld'],
      meaning:
        'The Beloved of Wands. Fire made flesh: theatrical, luminous, and dangerous to stand near.'
    },

    // Cups — water: longing, devotion, the heart's weather.
    'cups-ace': {
      keywords: ['the offered cup', 'opening', 'grace'],
      meaning: 'The heart held out, undefended. A beginning felt long before it is understood.'
    },
    'cups-two': {
      keywords: ['love', 'the meeting', 'mutuality'],
      meaning: 'Two waters that have become one water and cannot now be told apart.'
    },
    'cups-three': {
      keywords: ['abundance', 'communion', 'gladness'],
      meaning:
        'Joy that overflows because there is more of it than the vessel. Better for being shared.'
    },
    'cups-four': {
      keywords: ['satiety', 'stillness', 'the unnoticed'],
      meaning:
        'A gift held out while you look elsewhere. Comfort at the moment it begins to stagnate.'
    },
    'cups-five': {
      keywords: ['disappointment', 'grief', 'what remains'],
      meaning: 'The feeling that did not arrive, and the hollow shaped exactly like it.'
    },
    'cups-six': {
      keywords: ['pleasure', 'memory', 'flow'],
      meaning: 'Feeling moving freely and well. Sensual, unhurried, and entirely unserious.'
    },
    'cups-seven': {
      keywords: ['illusion', 'excess', 'the fog'],
      meaning: 'Longing pursued past its own life — the wine gone sour and drunk regardless.'
    },
    'cups-eight': {
      keywords: ['departure', 'the leaving', 'enough'],
      meaning: 'Walking away from what is good because it is not the thing. Quiet, deliberate, sad.'
    },
    'cups-nine': {
      keywords: ['happiness', 'the wish', 'fullness'],
      meaning:
        'Wanting satisfied and known to be satisfied. The suit at its best, needing nothing else.'
    },
    'cups-ten': {
      keywords: ['the brim', 'harmony', 'completion'],
      meaning: 'Filled to the top, and therefore precarious. The last still moment before spilling.'
    },
    'cups-guardian': {
      keywords: ['the vow', 'ardour', 'fire of water'],
      meaning:
        'The Guardian of Cups. Feeling that arrives with the cup already held out — romantic, and shallower than it looks.'
    },
    'cups-muse': {
      keywords: ['depth', 'the mirror', 'holding'],
      meaning: 'The Muse of Cups. Water in water: feels everything, is not drowned, cannot be held.'
    },
    'cups-seeker': {
      keywords: ['the current', 'intensity', 'the undertow'],
      meaning:
        'The Seeker of Cups. Longing with an intent beneath it — subtle, secret, moving under the surface.'
    },
    'cups-beloved': {
      keywords: ['tenderness', 'the pool', 'sweetness'],
      meaning: 'The Beloved of Cups. Feeling made tangible: gentle, dreaming, quietly voluptuous.'
    },

    // Swords — air: thought, and the cost of seeing clearly.
    'swords-ace': {
      keywords: ['clarity', 'the cut', 'truth'],
      meaning: 'The blade that parts true from false. Once it has fallen, nothing can be unseen.'
    },
    'swords-two': {
      keywords: ['peace', 'the truce', 'suspension'],
      meaning:
        'Two thoughts held level. Not resolution — a quiet that lasts exactly as long as nothing moves.'
    },
    'swords-three': {
      keywords: ['sorrow', 'the plain fact', 'division'],
      meaning:
        'The mind divided against itself. Grief arrived at by thinking, which is the cruellest road to it.'
    },
    'swords-four': {
      keywords: ['rest', 'the vigil', 'repair'],
      meaning: 'The blade set down, not surrendered. Recovery is the entire content of the card.'
    },
    'swords-five': {
      keywords: ['defeat', 'the hollow win', 'cost'],
      meaning: 'Being right at the expense of everything the rightness was for.'
    },
    'swords-six': {
      keywords: ['passage', 'method', 'calmer water'],
      meaning: 'Moving away from difficulty and carrying it along. Sad, necessary, and forward.'
    },
    'swords-seven': {
      keywords: ['futility', 'cunning', 'half-measures'],
      meaning:
        'Cleverness where force was needed. A plan that partly works, which is worse than none.'
    },
    'swords-eight': {
      keywords: ['interference', 'the tangle', 'binding'],
      meaning: 'Bound loosely, and blindfolded. The trap is very nearly all belief.'
    },
    'swords-nine': {
      keywords: ['cruelty', 'anguish', 'the small hours'],
      meaning:
        'Thought turned against its owner with real skill. The dread is enormous and largely manufactured.'
    },
    'swords-ten': {
      keywords: ['ruin', 'the end', 'the bottom'],
      meaning:
        'The mind pushed to its logical end and collapsing there — and the strange relief of the floor.'
    },
    'swords-guardian': {
      keywords: ['the assault', 'urgency', 'fire of air'],
      meaning: 'The Guardian of Swords. Straight at it, at speed, with an argument — and no brakes.'
    },
    'swords-muse': {
      keywords: ['perception', 'honesty', 'the clear eye'],
      meaning:
        'The Muse of Swords. Sees exactly what is there and says it. Kind underneath, and never fooled.'
    },
    'swords-seeker': {
      keywords: ['abstraction', 'design', 'the idea'],
      meaning:
        'The Seeker of Swords. Thought about thought — magnificent, inexhaustible, and inclined to build nothing.'
    },
    'swords-beloved': {
      keywords: ['vigilance', 'the practical', 'the edge'],
      meaning:
        'The Beloved of Swords. Thought brought to ground: shrewd, combative, effective in a real argument.'
    },

    // Disks — earth: the body, the made world, the slow real.
    'disks-ace': {
      keywords: ['substance', 'the seed', 'ground'],
      meaning: 'Matter offered, before anything has been made of it. Prosaic, and holy for that.'
    },
    'disks-two': {
      keywords: ['change', 'the turn', 'flux'],
      meaning: 'The material world in motion. Stability here is a rhythm, never a stillness.'
    },
    'disks-three': {
      keywords: ['work', 'craft', 'the build'],
      meaning:
        'The first solid thing. Skill, collaboration, and the plain determination that makes it.'
    },
    'disks-four': {
      keywords: ['power', 'the grip', 'the wall'],
      meaning: 'Holding what you have, tightly. Secure, and one step from being a cage.'
    },
    'disks-five': {
      keywords: ['worry', 'strain', 'the cold'],
      meaning: 'The world grinding. Anxiety about substance, which is rarely truly about substance.'
    },
    'disks-six': {
      keywords: ['success', 'proportion', 'the scales'],
      meaning: 'Effort returning what it should, in measure. Nothing dramatic — simply working.'
    },
    'disks-seven': {
      keywords: ['failure', 'blight', 'the long wait'],
      meaning: 'Work that will not come to anything, and the sick patience of continuing anyway.'
    },
    'disks-eight': {
      keywords: ['prudence', 'practice', 'the repetition'],
      meaning: 'Doing it again, better. Devotion as an accumulation of unremarkable days.'
    },
    'disks-nine': {
      keywords: ['gain', 'the garden', 'earned ease'],
      meaning: 'Good multiplying quietly. Independence, tended long enough to taste of something.'
    },
    'disks-ten': {
      keywords: ['wealth', 'legacy', 'the inert'],
      meaning: 'Abundance so complete it has stopped moving. The suit’s end, and its warning.'
    },
    'disks-guardian': {
      keywords: ['labour', 'the plod', 'fire of earth'],
      meaning: 'The Guardian of Disks. Patient, unglamorous, and the one who actually arrives.'
    },
    'disks-muse': {
      keywords: ['fruitfulness', 'nurture', 'the tended'],
      meaning:
        'The Muse of Disks. Makes the material world hospitable — generous, grounded, quietly ambitious.'
    },
    'disks-seeker': {
      keywords: ['method', 'stewardship', 'the steady'],
      meaning:
        'The Seeker of Disks. Matter with a plan: competent, dependable, slow to be moved by argument.'
    },
    'disks-beloved': {
      keywords: ['the seed', 'generation', 'earth of earth'],
      meaning:
        'The Beloved of Disks. Earth in its earth — heavy with what comes next, strong and unhurried.'
    }
  }
}
