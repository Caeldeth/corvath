import type { DeckMeanings } from './types'

/**
 * Argent Tarot — the Thoth structure, read in its own register.
 *
 * Thoth cards are titled as forces rather than figures (Adjustment, not Justice;
 * Lust, not Strength), and the minors carry Crowley's named decans — the Two of
 * Wands is Dominion whether or not the name is printed. The text leans on that:
 * each minor opens with its title, so the suit reads as a sequence rather than
 * fourteen unrelated cards.
 *
 * The deck does not support reversals, so there is deliberately no reversed
 * text here — see the coverage test.
 */
export const ARGENT_MEANINGS: DeckMeanings = {
  majors: {
    'The Fool': {
      keywords: ['origin', 'air', 'the green step'],
      meaning:
        'Nothing, before it becomes something. Not naivety — the condition of being unwritten, which is the only place a beginning can happen.'
    },
    'The Magus': {
      keywords: ['word', 'skill', 'transmission'],
      meaning:
        'Will made articulate. The Magus is the message and the messenger, and the card carries the trickster too: to name a thing is already to bend it.'
    },
    'The Priestess': {
      keywords: ['the veil', 'pure potential', 'moon'],
      meaning:
        'The unbroken surface before anything disturbs it. Knowledge that exists only while it stays unspoken; ask nothing and you will be told everything.'
    },
    'The Empress': {
      keywords: ['generation', 'love', 'venus'],
      meaning:
        'The door through which things become. Fertile, indulgent, indiscriminate — she makes without asking whether it should be made.'
    },
    'The Emperor': {
      keywords: ['definition', 'rule', 'aries'],
      meaning:
        'The line drawn that lets a thing have a shape. Sudden, absolute, and impatient — authority that would rather be wrong than undecided.'
    },
    'The Hierophant': {
      keywords: ['the teaching', 'the vessel', 'taurus'],
      meaning:
        'The form that carries meaning across time. Ritual and orthodoxy — necessary, slow, and always slightly behind the thing it transmits.'
    },
    'The Lovers': {
      keywords: ['the marriage', 'analysis', 'gemini'],
      meaning:
        'Two things brought together under a formula. The union is the point, and so is the cut it takes to make it — nothing joins without something being separated.'
    },
    'The Chariot': {
      keywords: ['the vehicle', 'the burden', 'cancer'],
      meaning:
        'Armour carrying something holy. Movement that is entirely will, and the stillness at the centre of it — the driver does not hold reins.'
    },
    Adjustment: {
      keywords: ['equilibrium', 'the exact', 'libra'],
      meaning:
        'Not justice — balance, without opinion. The card weighs what is actually there and returns it precisely, which mercy would only spoil.'
    },
    'The Hermit': {
      keywords: ['the lamp', 'the seed', 'virgo'],
      meaning:
        'Withdrawal that is fertile rather than barren. The light is carried down, not held up, and what it finds is not shown to anyone.'
    },
    Fortune: {
      keywords: ['the turn', 'change', 'jupiter'],
      meaning:
        'The wheel does not reward. It turns because turning is what it is; rise and fall are the same motion seen from different seats.'
    },
    Lust: {
      keywords: ['appetite', 'joy', 'leo'],
      meaning:
        'Strength that does not restrain itself. The beast is ridden, not tamed — courage as pleasure, and a delight that has stopped apologising.'
    },
    'The Hanged Man': {
      keywords: ['submersion', 'the price', 'water'],
      meaning:
        'Held under, deliberately. Redemption bought with a real loss — the card refuses the idea that surrender costs nothing.'
    },
    Death: {
      keywords: ['putrefaction', 'change of form', 'scorpio'],
      meaning:
        'Not an ending — a transformation that requires the previous shape to rot. The scythe is impersonal and the movement is a dance.'
    },
    Art: {
      keywords: ['the mixture', 'tempering', 'sagittarius'],
      meaning:
        'Opposites in the same vessel, under heat. Not compromise: a reaction, which makes a third thing and destroys the first two.'
    },
    'The Devil': {
      keywords: ['matter', 'laughter', 'capricorn'],
      meaning:
        'The material world, and the joke in it. Blind appetite, obstinate creation, and a card far more cheerful than it is given credit for.'
    },
    'The Tower': {
      keywords: ['demolition', 'the eye', 'mars'],
      meaning:
        'The structure destroyed by the thing it was built to keep out. Violent, liberating, and impossible to negotiate with.'
    },
    'The Star': {
      keywords: ['the pouring', 'clarity', 'aquarius'],
      meaning:
        'The water given without measure. Hope in the cosmic sense — not that it will be well, but that it continues, vast and indifferent and beautiful.'
    },
    'The Moon': {
      keywords: ['the threshold', 'deception', 'pisces'],
      meaning:
        'The darkest hour and the path between the towers. Everything here lies, including the fear; walk it anyway, because dawn is on the far side.'
    },
    'The Sun': {
      keywords: ['light', 'play', 'freedom'],
      meaning:
        'Consciousness without shadow. Dancing children and a lit world — the card of a thing being exactly, gladly, itself.'
    },
    'The Aeon': {
      keywords: ['reckoning', 'the new', 'fire'],
      meaning:
        'Judgement without a judge. The old measure is finished and a new one has begun; the card asks not what you deserve but what you now are.'
    },
    'The Universe': {
      keywords: ['completion', 'the dance', 'saturn'],
      meaning:
        'The work closed and still moving. Everything included, nothing outside it — the end that turns out to have been the pattern all along.'
    }
  },
  minors: {
    // Wands — fire, will. Titles are the Thoth decans.
    'wands-ace': {
      keywords: ['root of fire', 'force', 'origin'],
      meaning: 'The Root of the Powers of Fire. Pure force before it has been aimed at anything.'
    },
    'wands-two': {
      keywords: ['dominion', 'aim', 'mars in aries'],
      meaning: 'Dominion. Will that has chosen a direction and needs no permission for it.'
    },
    'wands-three': {
      keywords: ['virtue', 'integrity', 'sun in aries'],
      meaning: 'Virtue. Strength established and behaving well — force that has become reliable.'
    },
    'wands-four': {
      keywords: ['completion', 'settlement', 'venus in aries'],
      meaning:
        'Completion. The work rounded off; a good stopping place, and slightly less alive for it.'
    },
    'wands-five': {
      keywords: ['strife', 'friction', 'saturn in leo'],
      meaning: 'Strife. Fire against itself, and the heat of it — quarrelsome, and not without use.'
    },
    'wands-six': {
      keywords: ['victory', 'balance', 'jupiter in leo'],
      meaning:
        'Victory. Force resolved into success, held in the moment before it must be defended.'
    },
    'wands-seven': {
      keywords: ['valour', 'the odds', 'mars in leo'],
      meaning:
        'Valour. Outnumbered and fighting anyway; courage that owes nothing to the likelihood of winning.'
    },
    'wands-eight': {
      keywords: ['swiftness', 'the arrow', 'mercury in sagittarius'],
      meaning:
        'Swiftness. Energy discharged in a straight line — communication, and speed too fast to argue with.'
    },
    'wands-nine': {
      keywords: ['strength', 'endurance', 'moon in sagittarius'],
      meaning: 'Strength. Force that has been tested and holds — wary, scarred, and unbroken.'
    },
    'wands-ten': {
      keywords: ['oppression', 'excess', 'saturn in sagittarius'],
      meaning:
        'Oppression. Force with no outlet turns cruel; will applied past the point it serves anything.'
    },
    'wands-knight': {
      keywords: ['fire of fire', 'onslaught', 'the charge'],
      meaning:
        'The Knight of Wands. Fire in its fire: swift, violent, generous, and gone before you have answered.'
    },
    'wands-queen': {
      keywords: ['water of fire', 'steady flame', 'authority'],
      meaning:
        'The Queen of Wands. Fire made constant — calm, commanding, and utterly certain of herself.'
    },
    'wands-prince': {
      keywords: ['air of fire', 'the will', 'swiftness'],
      meaning:
        'The Prince of Wands. Fire made intentional: strong, sudden, and inclined to be cruel when bored.'
    },
    'wands-princess': {
      keywords: ['earth of fire', 'the flare', 'brilliance'],
      meaning:
        'The Princess of Wands. Fire made physical — brilliant, theatrical, and dangerous to be near.'
    },

    // Cups — water, feeling.
    'cups-ace': {
      keywords: ['root of water', 'the vessel', 'origin'],
      meaning: 'The Root of the Powers of Water. Feeling before it has attached itself to anything.'
    },
    'cups-two': {
      keywords: ['love', 'union', 'venus in cancer'],
      meaning: 'Love. Two waters that have become one water, and cannot now be told apart.'
    },
    'cups-three': {
      keywords: ['abundance', 'plenty', 'mercury in cancer'],
      meaning:
        'Abundance. Feeling that overflows because there is more of it than the vessel — gladness, shared.'
    },
    'cups-four': {
      keywords: ['luxury', 'satiety', 'moon in cancer'],
      meaning:
        'Luxury. Pleasure that has gone still; comfort at the exact point it begins to stagnate.'
    },
    'cups-five': {
      keywords: ['disappointment', 'loss', 'mars in scorpio'],
      meaning:
        'Disappointment. The expected feeling that did not arrive, and the hollow that has its shape.'
    },
    'cups-six': {
      keywords: ['pleasure', 'flow', 'sun in scorpio'],
      meaning: 'Pleasure. Feeling moving freely and well — happy, sensual, and slightly unserious.'
    },
    'cups-seven': {
      keywords: ['debauch', 'rot', 'venus in scorpio'],
      meaning:
        'Debauch. Pleasure pursued past its own life; the wine gone sour and drunk regardless.'
    },
    'cups-eight': {
      keywords: ['indolence', 'the leaving', 'saturn in pisces'],
      meaning:
        'Indolence. Feeling withdrawn from a thing that no longer feeds it — abandonment out of tiredness, not anger.'
    },
    'cups-nine': {
      keywords: ['happiness', 'fullness', 'jupiter in pisces'],
      meaning:
        'Happiness. Feeling complete and unforced — the suit at its best, wanting nothing else.'
    },
    'cups-ten': {
      keywords: ['satiety', 'the brim', 'mars in pisces'],
      meaning:
        'Satiety. Filled to the top, and therefore precarious; perfection is the last stable moment before spilling.'
    },
    'cups-knight': {
      keywords: ['fire of water', 'the rush', 'passion'],
      meaning:
        'The Knight of Cups. Water in its fire: passionate, romantic, and shallower than it appears.'
    },
    'cups-queen': {
      keywords: ['water of water', 'the mirror', 'depth'],
      meaning:
        'The Queen of Cups. Water in its water — reflective, tranquil, and impossible to hold.'
    },
    'cups-prince': {
      keywords: ['air of water', 'the current', 'intensity'],
      meaning:
        'The Prince of Cups. Feeling with an intent behind it: subtle, secret, and moving beneath the surface.'
    },
    'cups-princess': {
      keywords: ['earth of water', 'the pool', 'sweetness'],
      meaning:
        'The Princess of Cups. Feeling made tangible — gentle, dreamy, and quietly voluptuous.'
    },

    // Swords — air, mind.
    'swords-ace': {
      keywords: ['root of air', 'the idea', 'origin'],
      meaning:
        'The Root of the Powers of Air. Thought before it has been used for anything — the invoked, not yet the argued.'
    },
    'swords-two': {
      keywords: ['peace', 'truce', 'moon in libra'],
      meaning:
        'Peace. Two ideas held in balance; not resolution, but a quiet that holds while nothing moves.'
    },
    'swords-three': {
      keywords: ['sorrow', 'the cut', 'saturn in libra'],
      meaning:
        'Sorrow. The mind divided against itself; grief arrived at by thinking, which is the worst road to it.'
    },
    'swords-four': {
      keywords: ['truce', 'rest', 'jupiter in libra'],
      meaning:
        'Truce. The argument set down, not settled. Recovery is the whole content of the card.'
    },
    'swords-five': {
      keywords: ['defeat', 'the loss', 'venus in aquarius'],
      meaning:
        'Defeat. The mind beaten by its own cleverness; a loss that was arranged rather than suffered.'
    },
    'swords-six': {
      keywords: ['science', 'method', 'mercury in aquarius'],
      meaning:
        'Science. Thought working exactly as it should — balanced, precise, and finally getting somewhere.'
    },
    'swords-seven': {
      keywords: ['futility', 'half-measures', 'moon in aquarius'],
      meaning:
        'Futility. Cleverness applied where force was needed; a plan that partly works, which is worse than none.'
    },
    'swords-eight': {
      keywords: ['interference', 'the tangle', 'jupiter in gemini'],
      meaning:
        'Interference. Good intentions in each other’s way; the mind obstructed by its own competing arguments.'
    },
    'swords-nine': {
      keywords: ['cruelty', 'anguish', 'mars in gemini'],
      meaning:
        'Cruelty. Thought turned against its owner and enjoying it. The suffering here is manufactured with skill.'
    },
    'swords-ten': {
      keywords: ['ruin', 'the end', 'sun in gemini'],
      meaning:
        'Ruin. The mind pushed to its logical end and collapsing there — and the strange relief of the bottom.'
    },
    'swords-knight': {
      keywords: ['fire of air', 'the assault', 'speed'],
      meaning:
        'The Knight of Swords. Air in its fire: brilliant, incisive, and unable to hold a course longer than the attack.'
    },
    'swords-queen': {
      keywords: ['water of air', 'perception', 'the severed'],
      meaning:
        'The Queen of Swords. Air in its water — clear-sighted, graceful, and entirely without illusions.'
    },
    'swords-prince': {
      keywords: ['air of air', 'abstraction', 'design'],
      meaning:
        'The Prince of Swords. Thought about thought: full of ideas, magnificent, and prone to building nothing.'
    },
    'swords-princess': {
      keywords: ['earth of air', 'the practical', 'vengeance'],
      meaning:
        'The Princess of Swords. Thought brought to ground — shrewd, combative, and effective in a real argument.'
    },

    // Disks — earth, the material.
    'disks-ace': {
      keywords: ['root of earth', 'substance', 'origin'],
      meaning:
        'The Root of the Powers of Earth. Matter offered before anything has been made of it.'
    },
    'disks-two': {
      keywords: ['change', 'the turn', 'jupiter in capricorn'],
      meaning:
        'Change. The material world in constant flux; stability here is a rhythm, never a stillness.'
    },
    'disks-three': {
      keywords: ['work', 'the build', 'mars in capricorn'],
      meaning:
        'Work. The first solid thing — construction, and the plain determination that produces it.'
    },
    'disks-four': {
      keywords: ['power', 'the wall', 'sun in capricorn'],
      meaning:
        'Power. Holding a position and fortifying it. Secure, and one step from becoming a cage.'
    },
    'disks-five': {
      keywords: ['worry', 'strain', 'mercury in taurus'],
      meaning:
        'Worry. The material world grinding; anxiety about substance, which is rarely about the substance.'
    },
    'disks-six': {
      keywords: ['success', 'the balance', 'moon in taurus'],
      meaning:
        'Success. Effort returning what it should, in proportion. Nothing dramatic — simply working.'
    },
    'disks-seven': {
      keywords: ['failure', 'blight', 'saturn in taurus'],
      meaning:
        'Failure. Work that will not come to anything, and the sick patience of continuing it anyway.'
    },
    'disks-eight': {
      keywords: ['prudence', 'the practice', 'sun in virgo'],
      meaning:
        'Prudence. Careful, repeated attention. Unspectacular, slightly obsessive, and the way mastery is actually built.'
    },
    'disks-nine': {
      keywords: ['gain', 'increase', 'venus in virgo'],
      meaning:
        'Gain. Material good multiplying quietly — the accumulation of a thing tended for long enough.'
    },
    'disks-ten': {
      keywords: ['wealth', 'the inert', 'mercury in virgo'],
      meaning:
        'Wealth. Abundance so complete it has stopped moving. The suit’s end, and its warning.'
    },
    'disks-knight': {
      keywords: ['fire of earth', 'labour', 'the plod'],
      meaning:
        'The Knight of Disks. Earth in its fire: patient, unglamorous, and the one who actually finishes.'
    },
    'disks-queen': {
      keywords: ['water of earth', 'fruitfulness', 'the tender'],
      meaning:
        'The Queen of Disks. Earth in its water — nurturing, ambitious in a quiet way, and endlessly practical.'
    },
    'disks-prince': {
      keywords: ['air of earth', 'management', 'the steady'],
      meaning:
        'The Prince of Disks. Matter with a plan: competent, dependable, and slow to be moved by argument.'
    },
    'disks-princess': {
      keywords: ['earth of earth', 'the seed', 'generation'],
      meaning:
        'The Princess of Disks. Earth in its earth — pregnant with what comes next, strong and unhurried.'
    }
  }
}
