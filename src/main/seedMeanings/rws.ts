import type { DeckMeanings } from './types'

/**
 * Rider-Waite-Smith — the traditional readings, stated plainly.
 *
 * The voice is deliberately flat and second-person: this text sits beside your
 * own notes in a reading, and it should read as a reference you argue with, not
 * a verdict. Reversals are treated as the upright energy turned inward, blocked,
 * or overdone — not as a simple opposite.
 */
export const RWS_MEANINGS: DeckMeanings = {
  majors: {
    'The Fool': {
      keywords: ['beginnings', 'innocence', 'the leap'],
      meaning:
        'A step taken before the ground is proven. You know less than you need to and go anyway, which is the only way anything starts.',
      meaningReversed:
        'The leap made carelessly, or refused out of fear. Recklessness and paralysis are the same card facing away from you.'
    },
    'The Magician': {
      keywords: ['will', 'craft', 'focus'],
      meaning:
        'Everything needed is already on the table. The card is about the act of directing it — intention becoming a thing that exists.',
      meaningReversed:
        'Power turned to manipulation, or talent left idle. The tools are still there; the aim has gone.'
    },
    'The High Priestess': {
      keywords: ['intuition', 'the unspoken', 'threshold'],
      meaning:
        'What you know without being able to say how. She sits at a door you are not yet meant to open, and counsels patience over explanation.',
      meaningReversed:
        'The inner voice ignored or drowned out — or secrets kept past the point they protect anyone.'
    },
    'The Empress': {
      keywords: ['abundance', 'creation', 'nurture'],
      meaning:
        'Things growing because conditions allow it. Fertility in the widest sense: work, love, and ideas that are being fed rather than forced.',
      meaningReversed:
        'Care that smothers, or creation stalled. Giving so much that nothing is left to give from.'
    },
    'The Emperor': {
      keywords: ['structure', 'authority', 'order'],
      meaning:
        'The boundary that makes a thing possible. Discipline, rules, and the steadiness of someone who has decided what they are for.',
      meaningReversed:
        'Rigidity, or control that has forgotten its purpose. Structure that serves itself, or its absence entirely.'
    },
    'The Hierophant': {
      keywords: ['tradition', 'teaching', 'belonging'],
      meaning:
        'The inherited way of doing things, and the value in it. Instruction, orthodoxy, and the comfort of a shared frame.',
      meaningReversed:
        'Convention followed past conviction, or rejected for the sake of rejecting. Dogma either way.'
    },
    'The Lovers': {
      keywords: ['union', 'choice', 'alignment'],
      meaning:
        'Not romance so much as a choice that decides who you are. Two things meet and you cannot keep both unexamined.',
      meaningReversed:
        'Values at odds with each other, or a choice avoided until it makes itself. Union without honesty.'
    },
    'The Chariot': {
      keywords: ['drive', 'control', 'momentum'],
      meaning:
        'Opposing forces held in harness and pointed one way. Victory through will rather than ease.',
      meaningReversed:
        'Direction lost, or force applied where steering was needed. The horses pulling apart.'
    },
    Strength: {
      keywords: ['courage', 'patience', 'gentleness'],
      meaning:
        'The lion is not beaten, it is soothed. Power that does not need to prove itself, applied slowly.',
      meaningReversed:
        'Self-doubt, or force mistaken for strength. The thing inside you handled with cruelty instead of patience.'
    },
    'The Hermit': {
      keywords: ['solitude', 'search', 'inner light'],
      meaning:
        'Withdrawal on purpose. The lamp is small and lights only the next step, which is all it was ever meant to do.',
      meaningReversed:
        'Isolation that has stopped being useful, or a refusal to go in and look at all.'
    },
    'Wheel of Fortune': {
      keywords: ['turning', 'fate', 'cycles'],
      meaning:
        'The moment turns whether or not you are ready. What rises will fall and what fell will rise; your part is how you meet it.',
      meaningReversed:
        'A turn against you, or the same cycle gripped tight and repeated. Resisting a change already underway.'
    },
    Justice: {
      keywords: ['consequence', 'truth', 'balance'],
      meaning:
        'Cause meeting effect, without sentiment. The card asks what is actually true and what actually follows from it.',
      meaningReversed:
        'Consequence dodged or wrongly assigned. Judgment made from a story rather than the facts.'
    },
    'The Hanged Man': {
      keywords: ['suspension', 'reversal', 'surrender'],
      meaning:
        'Stillness chosen rather than suffered. Hanging there is the point — the view only changes if you stop struggling.',
      meaningReversed:
        'Waiting used as an excuse, or sacrifice made for nothing. Stalling dressed as patience.'
    },
    Death: {
      keywords: ['ending', 'transition', 'clearing'],
      meaning:
        'Something is over. Not tragedy — completion, and the ground it frees. Almost never a literal death.',
      meaningReversed:
        'Clinging to what has already ended. The thing decays in place because you will not put it down.'
    },
    Temperance: {
      keywords: ['blending', 'moderation', 'patience'],
      meaning:
        'Two things combined into something neither could be alone. Slow, deliberate, and unglamorous work.',
      meaningReversed:
        'Excess in one direction, or an impatience that spoils the mixture. Forcing what needed time.'
    },
    'The Devil': {
      keywords: ['bondage', 'appetite', 'the chosen chain'],
      meaning:
        'The chains are loose and you know it. Attachment, compulsion, and the comfort of the thing that is eating you.',
      meaningReversed:
        'The chain examined and loosened — or a denial that keeps it. Beginning to see the deal you made.'
    },
    'The Tower': {
      keywords: ['collapse', 'revelation', 'the sudden'],
      meaning:
        'What was built on a lie comes down at once. It is violent and it is honest; only the false part falls.',
      meaningReversed:
        'A collapse postponed, or survived and not yet learned from. The crack is there and you are decorating around it.'
    },
    'The Star': {
      keywords: ['hope', 'renewal', 'guidance'],
      meaning:
        'Quiet after the Tower. Not rescue — the return of the sense that there is a direction worth walking in.',
      meaningReversed:
        'Faith gone thin, or hope held so tightly it stops being honest. Losing sight of the light without losing the night.'
    },
    'The Moon': {
      keywords: ['illusion', 'dream', 'the half-seen'],
      meaning:
        'The path is real but the light is wrong. Fear, intuition, and imagination are indistinguishable here; go slowly.',
      meaningReversed:
        'The fog beginning to lift, or a self-deception you have decided to keep. Confusion clarifying — or hardening.'
    },
    'The Sun': {
      keywords: ['clarity', 'joy', 'plain sight'],
      meaning:
        'Everything visible and nothing to hide. Success, warmth, and the simplicity of a thing that is finally just good.',
      meaningReversed:
        'Joy dimmed or postponed, or a brightness insisted upon over something unresolved. The sun is still there.'
    },
    Judgement: {
      keywords: ['reckoning', 'calling', 'awakening'],
      meaning:
        'The past assembled and looked at whole. A summons you answer by deciding what it all meant.',
      meaningReversed:
        'The call unanswered, or a self-judgment so harsh it prevents the change it demands.'
    },
    'The World': {
      keywords: ['completion', 'wholeness', 'return'],
      meaning:
        'The circle closed. Not the end of everything — the end of this, entire, and the standing still that lets you feel it.',
      meaningReversed:
        'A finish withheld. The last step unfinished, or an ending refused because of what comes after.'
    }
  },
  minors: {
    // Wands — fire: will, drive, making things happen.
    'wands-ace': {
      keywords: ['spark', 'impulse', 'potential'],
      meaning: 'The first flare of wanting to do something. Raw and undirected and alive.',
      meaningReversed:
        'The spark smothered, or lit with nowhere to go. Enthusiasm without an object.'
    },
    'wands-two': {
      keywords: ['planning', 'horizon', 'decision'],
      meaning:
        'The world in hand and a choice about where to take it. Success already held, ambition looking past it.',
      meaningReversed: 'Fear of leaving the known, or planning that never becomes going.'
    },
    'wands-three': {
      keywords: ['expansion', 'foresight', 'waiting'],
      meaning:
        'The ships are out. The work is done and now it is a matter of watching it come back.',
      meaningReversed: 'Delays, or a reach that exceeded the plan behind it.'
    },
    'wands-four': {
      keywords: ['celebration', 'homecoming', 'threshold'],
      meaning:
        'A milestone worth stopping for. Stability, welcome, and the pleasure of a thing that held together.',
      meaningReversed: 'The celebration hollow or deferred; a home that no longer feels like one.'
    },
    'wands-five': {
      keywords: ['friction', 'competition', 'noise'],
      meaning:
        'Everyone talking at once. Conflict without malice — the productive kind, if it is kept honest.',
      meaningReversed:
        'Squabbling that has stopped being productive, or conflict avoided into resentment.'
    },
    'wands-six': {
      keywords: ['recognition', 'victory', 'pride'],
      meaning: 'Won, and seen to have won. The public part of success, which is its own thing.',
      meaningReversed:
        'Recognition withheld, or needed too much. Victory that curdles on inspection.'
    },
    'wands-seven': {
      keywords: ['defence', 'conviction', 'the high ground'],
      meaning: 'Holding a position because you believe in it. Outnumbered and not wrong.',
      meaningReversed:
        'Defending out of habit, or giving ground that mattered. Exhaustion at the wall.'
    },
    'wands-eight': {
      keywords: ['speed', 'movement', 'arrival'],
      meaning: 'Everything at once, and fast. News, motion, a thing loosed and already in the air.',
      meaningReversed: 'Momentum stalled, or haste that outruns its aim.'
    },
    'wands-nine': {
      keywords: ['resilience', 'wariness', 'the last stand'],
      meaning:
        'Wounded and still standing. Strength that has cost something and is being spent carefully.',
      meaningReversed:
        'Defensiveness past the point of threat. Guarding a wall no one is attacking.'
    },
    'wands-ten': {
      keywords: ['burden', 'obligation', 'the last mile'],
      meaning:
        'Carrying more than you should because you said you would. The load is real and nearly delivered.',
      meaningReversed:
        'The load put down, or refused — rightly or otherwise. Collapse under what was never yours.'
    },
    'wands-page': {
      keywords: ['curiosity', 'eagerness', 'the first try'],
      meaning:
        'News, or an appetite for something new. Untrained enthusiasm, which is not nothing.',
      meaningReversed: 'Enthusiasm without follow-through, or bad news about a beginning.'
    },
    'wands-knight': {
      keywords: ['action', 'daring', 'haste'],
      meaning:
        'Charging at it. Passion, adventure, and a confidence that does not check behind itself.',
      meaningReversed:
        'Recklessness, or a charge that never leaves the gate. Heat with no direction.'
    },
    'wands-queen': {
      keywords: ['warmth', 'confidence', 'presence'],
      meaning:
        'Someone whose certainty warms a room rather than dominating it. Magnetic and self-possessed.',
      meaningReversed:
        'Confidence gone brittle, or warmth withdrawn. Demanding the room instead of holding it.'
    },
    'wands-king': {
      keywords: ['vision', 'leadership', 'command'],
      meaning:
        'The one who sees where it goes and makes others want to go there. Bold and answerable.',
      meaningReversed:
        'Vision without patience — tyranny, or grand plans that never touch the ground.'
    },

    // Cups — water: feeling, relationship, what moves under the surface.
    'cups-ace': {
      keywords: ['opening', 'feeling', 'offering'],
      meaning:
        'The heart offered, full and undefended. A beginning that is felt before it is understood.',
      meaningReversed: 'Feeling blocked or spilled. The cup withheld, from others or from yourself.'
    },
    'cups-two': {
      keywords: ['mutuality', 'attraction', 'the pledge'],
      meaning: 'Two people meeting as equals. Recognition — the moment something becomes mutual.',
      meaningReversed:
        'Imbalance, or a bond breaking. Two people wanting different things from the same thing.'
    },
    'cups-three': {
      keywords: ['friendship', 'joy', 'company'],
      meaning: 'Gladness shared, and better for being shared. Community, reunion, the toast.',
      meaningReversed:
        'Company that costs more than it gives; celebration hiding something, or gossip.'
    },
    'cups-four': {
      keywords: ['discontent', 'apathy', 'the unnoticed'],
      meaning:
        'A gift held out while you look elsewhere. Not sadness — the dullness of having stopped noticing.',
      meaningReversed:
        'The head lifting. Boredom breaking, or a withdrawal that has gone on too long.'
    },
    'cups-five': {
      keywords: ['grief', 'loss', 'what remains'],
      meaning:
        'Three cups spilled and two still standing behind you. The grief is real; so are the two.',
      meaningReversed: 'Turning around. Acceptance beginning — or mourning made into an identity.'
    },
    'cups-six': {
      keywords: ['memory', 'innocence', 'the past'],
      meaning:
        'Sweetness remembered, offered plainly. Nostalgia, kindness, and the pull of what was.',
      meaningReversed: 'Living in the past, or a memory that will not stay in it.'
    },
    'cups-seven': {
      keywords: ['options', 'fantasy', 'the fog'],
      meaning:
        'Too many possibilities and no ground under any of them. Imagination that must eventually choose.',
      meaningReversed: 'The fog clearing and one cup chosen — or all of them abandoned as unreal.'
    },
    'cups-eight': {
      keywords: ['departure', 'searching', 'enough'],
      meaning:
        'Walking away from something good enough because it is not the thing. Quiet, deliberate leaving.',
      meaningReversed:
        'Staying past knowing, or leaving without having looked at what you are leaving.'
    },
    'cups-nine': {
      keywords: ['satisfaction', 'contentment', 'the wish'],
      meaning: 'Having what you wanted, and knowing it. Pleasure that is allowed to be simple.',
      meaningReversed: 'The wish granted and hollow, or satisfaction that turns to smugness.'
    },
    'cups-ten': {
      keywords: ['harmony', 'belonging', 'fullness'],
      meaning: 'The whole thing, together and well. Emotional completion, unspectacular and rare.',
      meaningReversed: 'The picture and the feeling out of step. Harmony performed rather than had.'
    },
    'cups-page': {
      keywords: ['tenderness', 'wonder', 'the message'],
      meaning: 'A feeling that surprises you. Sensitivity, an offer, news that lands in the chest.',
      meaningReversed: 'Feeling that curdles into mood, or an offer made immaturely.'
    },
    'cups-knight': {
      keywords: ['romance', 'idealism', 'the offer'],
      meaning: 'Arriving with the cup held out. Following a feeling wherever it leads.',
      meaningReversed:
        'Idealism untethered — the offer glamorous and empty, or moodiness in the saddle.'
    },
    'cups-queen': {
      keywords: ['empathy', 'depth', 'holding'],
      meaning:
        'Someone who feels everything and is not drowned by it. Intuitive, contained, genuinely kind.',
      meaningReversed:
        'Empathy without a floor — absorbing everything, or closing entirely to avoid it.'
    },
    'cups-king': {
      keywords: ['equanimity', 'care', 'mastery of feeling'],
      meaning:
        'Deep water held calm on the surface. Emotional command that does not deny what it commands.',
      meaningReversed:
        'Calm as suppression, or feeling used as leverage. The surface no longer honest.'
    },

    // Swords — air: thought, truth, the cost of clarity.
    'swords-ace': {
      keywords: ['clarity', 'truth', 'the cut'],
      meaning: 'A clean cut. The idea that separates true from false and cannot be unseen after.',
      meaningReversed:
        'Clarity misused, or confusion mistaken for it. The blade turned the wrong way.'
    },
    'swords-two': {
      keywords: ['stalemate', 'avoidance', 'the blindfold'],
      meaning:
        'A decision refused by refusing to look. The balance holds only as long as your eyes are shut.',
      meaningReversed: 'The blindfold off. Information arriving, or a stalemate breaking badly.'
    },
    'swords-three': {
      keywords: ['heartbreak', 'grief', 'the plain fact'],
      meaning: 'The truth that hurts, stated. Pain that comes from clarity rather than confusion.',
      meaningReversed: 'Grief held past its work, or pain not yet allowed to be felt.'
    },
    'swords-four': {
      keywords: ['rest', 'recovery', 'the pause'],
      meaning: 'Not defeat — repair. Laying the sword down long enough to be able to lift it.',
      meaningReversed: 'Rest refused, or rest that has become hiding. Exhaustion pushed through.'
    },
    'swords-five': {
      keywords: ['hollow victory', 'conflict', 'the cost'],
      meaning:
        'Won, and the winning cost more than it gained. Being right at the expense of everything.',
      meaningReversed: 'The cost counted. Reconciliation, or a defeat that will not be let go.'
    },
    'swords-six': {
      keywords: ['passage', 'leaving', 'toward calmer water'],
      meaning: 'Moving away from difficulty, carrying it with you. Sad, necessary, and forward.',
      meaningReversed:
        'The crossing stalled, or a departure that changes nothing you brought aboard.'
    },
    'swords-seven': {
      keywords: ['cunning', 'evasion', 'the private plan'],
      meaning:
        'Getting away with it. Strategy that avoids confrontation — clever, and not quite honest.',
      meaningReversed: 'The plan exposed, or a conscience arriving. Coming clean, willingly or not.'
    },
    'swords-eight': {
      keywords: ['restriction', 'self-binding', 'the loose rope'],
      meaning:
        'Bound and blindfolded, with the swords not quite closed around you. The trap is mostly belief.',
      meaningReversed: 'The rope loosening. Seeing the way out — or tightening it yourself.'
    },
    'swords-nine': {
      keywords: ['anguish', 'sleeplessness', 'the 3am mind'],
      meaning:
        'Suffering manufactured in the dark. The dread is enormous and largely made of thinking.',
      meaningReversed: 'The night ending, or fear finally spoken aloud and shrinking on contact.'
    },
    'swords-ten': {
      keywords: ['ending', 'bottom', 'the last blade'],
      meaning:
        'Over, and theatrically so. Ten swords is more than needed — the worst has happened and is finished.',
      meaningReversed:
        'The slow recovery, or a wound rehearsed rather than healed. Dawn on the horizon.'
    },
    'swords-page': {
      keywords: ['vigilance', 'questions', 'the new idea'],
      meaning: 'Alert and curious, testing the edge. Appetite for truth, without much tact yet.',
      meaningReversed: 'Cleverness turned to spite, or vigilance become suspicion.'
    },
    'swords-knight': {
      keywords: ['urgency', 'argument', 'the charge'],
      meaning: 'Straight at it, at speed, with an argument. Direct, brilliant, and not stopping.',
      meaningReversed:
        'Aggression without aim. Rushing into a fight, or a mind that will not slow to listen.'
    },
    'swords-queen': {
      keywords: ['perception', 'honesty', 'the clear eye'],
      meaning:
        'Someone who sees exactly what is there and says it. Wit sharpened by experience, kind underneath.',
      meaningReversed:
        'Perception turned cold — honesty as a weapon, or a guard mistaken for wisdom.'
    },
    'swords-king': {
      keywords: ['judgment', 'principle', 'the ruling'],
      meaning:
        'Truth applied. Intellect, authority, and the discipline to decide without flinching.',
      meaningReversed:
        'Principle without mercy. Cleverness serving itself, or judgment made from the head alone.'
    },

    // Pentacles — earth: body, work, money, the slow real.
    'pentacles-ace': {
      keywords: ['opportunity', 'ground', 'the seed'],
      meaning:
        'Something solid offered — work, money, a body of ground to stand on. Prosaic and genuinely valuable.',
      meaningReversed: 'The opportunity missed, or held so tightly it cannot grow.'
    },
    'pentacles-two': {
      keywords: ['juggling', 'balance', 'flow'],
      meaning:
        'Keeping several things up at once, and enjoying it. Adaptability under mild strain.',
      meaningReversed:
        'One ball too many. Overcommitment, or balance kept by dropping the wrong thing.'
    },
    'pentacles-three': {
      keywords: ['craft', 'collaboration', 'the build'],
      meaning:
        'Skill recognised and put to use with others. The unglamorous stage where the thing gets made.',
      meaningReversed:
        'Work unrecognised, or a collaboration where no one is quite building the same thing.'
    },
    'pentacles-four': {
      keywords: ['holding', 'security', 'the grip'],
      meaning:
        'Keeping what you have, tightly. Stability bought with a certain closing of the hands.',
      meaningReversed:
        'The grip loosening — generosity returning, or loss. Scarcity as a way of life.'
    },
    'pentacles-five': {
      keywords: ['hardship', 'exclusion', 'the lit window'],
      meaning:
        'Cold outside, and help closer than it looks. Material trouble, and the pride that walks past the door.',
      meaningReversed: 'Recovery beginning, or help finally asked for. The long walk ending.'
    },
    'pentacles-six': {
      keywords: ['giving', 'receiving', 'the scales'],
      meaning:
        'Generosity with a power in it. Who holds the scales matters as much as what is given.',
      meaningReversed: 'Strings attached. Charity that buys something, or debt that never balances.'
    },
    'pentacles-seven': {
      keywords: ['patience', 'assessment', 'the long game'],
      meaning:
        'Leaning on the hoe, looking at what has grown. The pause where you decide if it is worth it.',
      meaningReversed: 'Impatience, or effort poured into ground that will not return it.'
    },
    'pentacles-eight': {
      keywords: ['diligence', 'practice', 'the repetition'],
      meaning: 'Doing it again, better. Mastery as an accumulation of unremarkable days.',
      meaningReversed:
        'Repetition without care — going through motions, or perfectionism that never ships.'
    },
    'pentacles-nine': {
      keywords: ['self-sufficiency', 'refinement', 'earned ease'],
      meaning:
        'A garden made by your own hand, enjoyed alone and by choice. Independence that tastes good.',
      meaningReversed: 'Comfort that isolates, or an ease resting on someone else’s work.'
    },
    'pentacles-ten': {
      keywords: ['legacy', 'family', 'the long structure'],
      meaning:
        'Wealth that outlasts you. Continuity, inheritance, the thing built to be handed on.',
      meaningReversed: 'The structure failing, or a legacy that binds more than it gives.'
    },
    'pentacles-page': {
      keywords: ['study', 'apprenticeship', 'the first coin'],
      meaning:
        'A beginner holding something real. Studiousness, and an offer worth taking seriously.',
      meaningReversed: 'Study without application, or an opportunity fumbled through inattention.'
    },
    'pentacles-knight': {
      keywords: ['method', 'reliability', 'the plod'],
      meaning:
        'The slowest knight and the one that arrives. Unexciting, thorough, and completely trustworthy.',
      meaningReversed: 'Thoroughness gone inert. Stubbornness, or work continued past its point.'
    },
    'pentacles-queen': {
      keywords: ['practicality', 'nurture', 'the well-kept'],
      meaning:
        'Someone who makes the material world hospitable. Grounded, generous, quietly competent.',
      meaningReversed:
        'Care collapsed into worry about the money, or self-neglect while tending everyone else.'
    },
    'pentacles-king': {
      keywords: ['prosperity', 'stewardship', 'the estate'],
      meaning: 'Abundance managed well. Success made solid, and a hand steady enough to keep it.',
      meaningReversed:
        'Wealth mistaken for worth. Stewardship turned to hoarding, or a foundation quietly rotting.'
    }
  }
}
