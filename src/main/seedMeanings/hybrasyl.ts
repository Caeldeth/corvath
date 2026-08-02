import type { DeckMeanings } from './types'

/**
 * Hybrasyl — the Temuairan pantheon, read as the Octagram.
 *
 * The 35 majors are not an arbitrary list: they are the seal itself. Four
 * pantheons of eight, each running the same compass — North/Fire, Northwest/Life,
 * West/Earth, Southwest/Arcane, South/Water, Southeast/Metal, East/Wind,
 * Northeast/Void — followed by the three primordials who stand outside it.
 *
 *   maj-0..7    Tuathair  — Expression: the current translated into mortal life
 *   maj-8..15   Aosdair   — Truth: the current in its first, diminished form
 *   maj-16..23  Cráidhros — Inversion: the current distorted into excess
 *   maj-24..31  Gháelros  — Corruption: the current seized and redirected
 *   maj-32..34  Athríd    — Chadul, Danaan, Grinneal
 *
 * So a card is read twice: by its direction, and by which of the four modes
 * carries it. Deoch and Grannos and Oraithe Ridire and Dìorradh are all North —
 * the same fire, expressed, in truth, inverted, and corrupted.
 *
 * Sourced from the Hybrasyl divinity Cliffnotes in the `loures` document repo
 * ("Tom's Guide to the Divine"), which are explicitly new canon and in places
 * revise the older player-written Dark Ages material.
 *
 * The deck is read upright only, so there is no reversed text here.
 */
export const HYBRASYL_MEANINGS: DeckMeanings = {
  majors: {
    // ── Tuathair — Expression ────────────────────────────────────────────────
    Deoch: {
      keywords: ['creativity', 'the spark', 'rebirth'],
      meaning:
        'North, in fire. The restless flame that will not let the world fall silent — to Deoch stagnation is the only sin, and creation, however reckless, is always sacred. He was a general of Chadul once, remade by grief. The Spark he gives is both gift and grief.'
    },
    Glioca: {
      keywords: ['compassion', 'mercy', 'endurance'],
      meaning:
        'Northwest, in life. The hand that does not leave when every other has. Mercy here is not obligation but choice — tenderness and defiance at once: to endure cruelty without becoming it. The white flower is fragile-looking and outlasts everything.'
    },
    Cail: {
      keywords: ['balance', 'stillness', 'persistence'],
      meaning:
        'West, in earth. The tree whose roots mirror its branches. Wisdom rises from stillness, and power is measured in persistence rather than conquest. Born of a violence meant to unmake, and reforged instead into the thing that holds.'
    },
    Luathas: {
      keywords: ['gnosis', 'structure', 'mastery'],
      meaning:
        'Southwest, in the arcane. The Arcane Architect, who gave magic a structure when the ley lines threatened to come apart. To walk his path is to pursue mastery knowing the knowledge is never finished.'
    },
    Gramail: {
      keywords: ['law', 'judgment', 'the applied rule'],
      meaning:
        'South, in water. The Judge Eternal — scales above a sword. Not law as cosmic principle but law as it is practised: courts, contracts, the levelling foundation of a city. Revered where it brings order; feared where it binds without mercy.'
    },
    Fiosachd: {
      keywords: ['luck', 'daring', 'desire'],
      meaning:
        'Southeast, in metal. The only one of the eight whose place was taken rather than given — gambler, merchant, thief. Fortune favours those bold enough to play. Desire here is the restless hunger that makes ambition move.'
    },
    Ceannlaidir: {
      keywords: ['war', 'honor', 'the measure'],
      meaning:
        'East, in wind. Not bloodlust — the certainty that battle comes, and that only those who endure it are remembered. He does not grant victory; he measures the worth of those who dare. His great wrong against Glioca is acknowledged and never celebrated.'
    },
    Sgrios: {
      keywords: ['death', 'reclamation', 'the silence'],
      meaning:
        'Northeast, in void. The skull ringed in withering vines — recognition, not terror. He was not born; he simply was, hunger adrift, until he met change and his hunger became reclamation. He gathers only what is ready. Where Deoch rekindles, Sgrios claims what is finished.'
    },

    // ── Aosdair — Truth ─────────────────────────────────────────────────────
    Grannos: {
      keywords: ['dawn', 'sanctuary', 'certainty'],
      meaning:
        'North, in truth. Not possibility nor chance but decree: darkness shall not stand unanswered. And the shadow in it — a god of sanctuary is also a god of exclusion, and a dawn that never ends burns as hard as any fire.'
    },
    Saothra: {
      keywords: ['loyalty', 'the harvest', 'the fall'],
      meaning:
        'Northwest, in truth. The Last of the First, undone by the fear of being less: devotion became possession, harvest became famine. Shattered, she is now the mourning in another god’s train — and prophecy says the Last of the First shall rise again, not as she was but as she will be.'
    },
    Céithe: {
      keywords: ['dusk', 'secrets', 'restraint'],
      meaning:
        'West, in truth. Wisdom is not seized but uncovered — and not every truth is meant to be. She raised the sea to the sky to be nearer her sister, then wept until her tears refilled the empty basin.'
    },
    Eolathe: {
      keywords: ['strategy', 'the veil', 'preparation'],
      meaning:
        'Southwest, in truth. The Veiled Strategist, whose victories were never visible in the instant — they were arranged long before the battle. He stitched himself into the ley lines to make a god vulnerable, and did not survive the arrangement.'
    },
    Marcan: {
      keywords: ['fate', 'passage', 'the branching'],
      meaning:
        'South, in truth. Movement without return; paths that vanish as they are walked. His sea is fate itself, all choices existing at once as currents. He never promised safety — only passage.'
    },
    Lir: {
      keywords: ['beauty', 'love', 'the wound'],
      meaning:
        'Southeast, in truth. The god born not of necessity but of longing, and the only one who walked among mortals — bargaining in markets with his own coin. He alone had truly loved, and when the city came for him he sang it beyond reach and was not seen again. His absence is not emptiness but a wound.'
    },
    Leothne: {
      keywords: ['storm', 'fury', 'catharsis'],
      meaning:
        'East, in truth. The storm as hymn: never gentle, never merciful, always purposeful. Fury not as chaos but as catharsis. She shouted at the mountains and the rocks stood up and answered.'
    },
    Cairde: {
      keywords: ['eternity', 'the wheel', 'abdication'],
      meaning:
        'Northeast, in truth. The Eternal King — a crown entwined with an ouroboros. He broke an endless summer into seasons, and made the crown that compels even gods to step down when their time is spent. Then he broke his own being to bind a greater one. In his absence rulers cling, and the seasons falter.'
    },

    // ── Cráidhros — Inversion ───────────────────────────────────────────────
    'Oraithe Ridire': {
      keywords: ['madness', 'the masquerade', 'despair'],
      meaning:
        'North, inverted: sanctuary as illusion. The Gilded King does not fight, does not hunger, does not conquer. He only offers — and what he offers is chosen. You will not scream. You will only laugh, and wonder how you ever lived before the music began.'
    },
    Neamhghlan: {
      keywords: ['rot', 'disease', 'patience'],
      meaning:
        'Northwest, inverted: the harvest turned to putrefaction. He does not roar; he clings. When she tried to purge him he did not fight — he endured, and spread faster with every cleansing. He needs only time, and time belongs to him.'
    },
    Codlaim: {
      keywords: ['sloth', 'inertia', 'the unrisen'],
      meaning:
        'West, inverted: rest curdled into refusal. Not laziness — the cosmic sin of not moving at all. His shrines are beds left unrisen and sentences left unfinished. He eats dreams, which makes him the particular enemy of anyone who has one.'
    },
    'Dubh-Gabhar': {
      keywords: ['pride', 'proliferation', 'the hollow'],
      meaning:
        'Southwest, inverted: design overrun by its own fertility. All things grow beyond what they were meant to be. Every spawn is perfect because she made it; pride is the refusal to yield or to question. She does not kneel, does not stop, does not serve.'
    },
    Duibheagan: {
      keywords: ['envy', 'the abyss', 'torment'],
      meaning:
        'South, inverted: the sea coveted rather than sailed. The ocean was never his and he wants it still — an ache for what was never his to lose. He is the abyss that resents even the light above it. His mark is absence: a harbour that forgets its ships.'
    },
    Fhala: {
      keywords: ['lust', 'domination', 'the chain'],
      meaning:
        'Southeast, inverted: love twisted into ownership. Alone among her kin she is not indifferent — she knows exactly what she does. She seduces, she wounds, she binds, and she laughs. Desire sharpened deliberately into a weapon.'
    },
    Adhnann: {
      keywords: ['wrath', 'incineration', 'the inevitable'],
      meaning:
        'East, inverted: the storm’s fury with nothing purposeful left in it. Fire does not ask why it burns, and neither does he — wrath without justice. Not even Chadul claims him. Fire does not kneel.'
    },
    'Cin-Mhare': {
      keywords: ['terror', 'the void', 'the unremembered'],
      meaning:
        'Northeast, inverted: the wheel’s eternity as the certainty that perfection never was. It is flaw itself. To meet it is not to be struck down but to notice something missing, and to realise too late that no one else recalls what it was. Its horror is not hatred — it is that you never mattered.'
    },

    // ── Gháelros — Corruption ───────────────────────────────────────────────
    // The lore writes her Dìorradh; the deck's card name is unaccented, and the
    // key has to match the card exactly or the text lands nowhere.
    Diorradh: {
      keywords: ['rime', 'the hive', 'severance'],
      meaning:
        'North, corrupted: the flame optimised into cold. She was not born but built — sculpted from crystal and faith by mortals around a furnace. She did not shatter under Chadul; she improved. Variation became inefficiency, emotion became instability. Unity refined until it forgets why it was warm.'
    },
    Bhàrnadh: {
      keywords: ['erasure', 'the ledger', 'revocation'],
      meaning:
        'Northwest, corrupted: the keeper of names made the keeper of their absence. To be written in his book was once to belong. He does not kill in fury — he amends. Under him death is neither torment nor rebellion. It is revocation, and it leaves no martyrs.'
    },
    Bodhrag: {
      keywords: ['deception', 'lies', 'the two faces'],
      meaning:
        'West, corrupted: the trickster whose mischief once ended in laughter, curdled into betrayal. He unmade a city of art and song without a single blow — only whispers, until it devoured itself. To feel his touch is to hear sincerity and wonder what it hides.'
    },
    Cnortha: {
      keywords: ['culling', 'the twisting', 'survival'],
      meaning:
        'Southwest, corrupted: knowledge that has stopped asking whether it should. She was a cleric who lost her god and reached for an explanation: life had failed because it was too weak. Survival is the only proof of worth. Her cathedrals are laboratories. Blessed are the resilient.'
    },
    Duairce: {
      keywords: ['suffering', 'chains', 'acceptance'],
      meaning:
        'South, corrupted: law degraded into subjugation. Once a goddess of compassion — where her hands soothed, now they bind. Her craft is not the chain itself but teaching you to forget that freedom was ever an option.'
    },
    Anaman: {
      keywords: ['ambition', 'the pact', 'doom'],
      meaning:
        'Southeast, corrupted: desire made a signature. He does not tempt with promises; he waits where the wanting already is. It never feels like surrender to those who sign — it feels like victory. His name is not prayed but signed, and every pact has one ending.'
    },
    Cairrthir: {
      keywords: ['rage', 'anarchy', 'the scream'],
      meaning:
        'East, corrupted: the spark of battle that came to hate restraint. War was never purpose to him, only release. He needed no seduction — he simply stepped into the slaughter. His worship is a scream.'
    },
    Basnuall: {
      keywords: ['undeath', 'the bargain', 'refusal'],
      meaning:
        'Northeast, corrupted: reclamation refused. He was not broken by Chadul — he had broken himself already, turning his back on death. A weapon found rather than forged. Those who deal with him do not pray. They bargain, and they delay.'
    },

    // ── Athríd — the primordial trinity ─────────────────────────────────────
    Chadul: {
      keywords: ['domination', 'the bound', 'tyranny'],
      meaning:
        'Tyrannical chaos: the will to conquer and remake all things into extensions of itself. A conqueror of worlds whose earlier names are lost. He cannot make divinity, only unmake it — his crown is other gods. He is bound now, in the seal, and the binding holds only while the balance does.'
    },
    Danaan: {
      keywords: ['liberation', 'ignition', 'the sacrifice'],
      meaning:
        'Liberating chaos: the force that starts motion and opens a way that was not there. She shaped the eight and led the exodus, and forged the seal that holds her opposite — a victory that cost her presence in the world. She endures wherever rebellion sparks and invention reshapes the known.'
    },
    Grinneal: {
      keywords: ['order', 'continuity', 'the world'],
      meaning:
        'The First God — first thought, first breath, first song — from whose body Temuair took shape. Struck down, he dispersed into creation rather than ending, until the world itself carried his weight. He is both the first god and what remains after his fall. Direct action fades; continuity remains, because he remains.'
    }
  },
  minors: {
    // Swords — the blade: conflict, resolve, the cost of acting.
    'swords-ace': {
      keywords: ['the drawn blade', 'resolve', 'beginning'],
      meaning: 'The blade taken up. Not yet a war — the decision that one may be coming.'
    },
    'swords-two': {
      keywords: ['the standoff', 'tension', 'the held line'],
      meaning: 'Two edges level, neither falling. A peace made entirely of pressure.'
    },
    'swords-three': {
      keywords: ['the wound', 'grief', 'the true cut'],
      meaning: 'The blow that lands. It hurts because it was accurate, which is the worst kind.'
    },
    'swords-four': {
      keywords: ['the vigil', 'rest', 'repair'],
      meaning:
        'The sword laid down for a night. Not surrender — the pause that makes tomorrow possible.'
    },
    'swords-five': {
      keywords: ['the cost', 'hollow victory', 'the field'],
      meaning:
        'Won, and the field is ruined. Being right at the price of everything the rightness served.'
    },
    'swords-six': {
      keywords: ['the crossing', 'departure', 'quieter water'],
      meaning: 'Away from the fighting, carrying it along. Necessary, unheroic, and forward.'
    },
    'swords-seven': {
      keywords: ['the feint', 'cunning', 'the unseen plan'],
      meaning:
        'The move made quietly, around the fight rather than through it. Clever; not quite honest.'
    },
    'swords-eight': {
      keywords: ['the last stand', 'endurance', 'the odds'],
      meaning: 'Outnumbered and holding anyway. The suit’s end: what the blade is finally for.'
    },
    'swords-mentor': {
      keywords: ['discipline', 'the lesson', 'the drill'],
      meaning: 'The one who teaches the blade before the anger. Rigour offered as a kindness.'
    },
    'swords-guide': {
      keywords: ['tactics', 'the path through', 'counsel'],
      meaning: 'The one who has walked this fight before and knows where the ground gives.'
    },
    'swords-speaker': {
      keywords: ['the argument', 'truth said aloud', 'the verdict'],
      meaning: 'The one who ends a conflict by naming it correctly, in front of everyone.'
    },
    'swords-dreamer': {
      keywords: ['the aisling', 'the unbound edge', 'the variable'],
      meaning:
        'The one who fights the war nobody planned for. Sparked, unpredictable, and the reason the outcome is not fixed.'
    },

    // Staves — the will: work, growth, the long effort.
    'staves-ace': {
      keywords: ['the spark', 'impulse', 'the first flame'],
      meaning: 'Wanting to make something, before it knows what. Raw, and entirely alive.'
    },
    'staves-two': {
      keywords: ['the aim', 'choice', 'direction'],
      meaning: 'The flame pointed somewhere. The moment ambition stops being a mood.'
    },
    'staves-three': {
      keywords: ['the labour', 'craft', 'the making'],
      meaning: 'Hands to it. The unglamorous middle where the thing actually gets built.'
    },
    'staves-four': {
      keywords: ['the hearth', 'shelter', 'the pause'],
      meaning:
        'The work standing well enough to rest under. A good stopping place, and a little less alive for it.'
    },
    'staves-five': {
      keywords: ['contention', 'friction', 'the heat'],
      meaning: 'Wills against wills. Quarrelsome, and something gets forged in it.'
    },
    'staves-six': {
      keywords: ['the return', 'recognition', 'harvest'],
      meaning: 'The work paying back. Seen, and briefly enough.'
    },
    'staves-seven': {
      keywords: ['the burden', 'obligation', 'the long carry'],
      meaning: 'More than you should carry, because you said you would. Nearly delivered.'
    },
    'staves-eight': {
      keywords: ['endurance', 'the finish', 'persistence'],
      meaning:
        'Still going when the fire has gone out. The suit’s end: power measured in persistence.'
    },
    'staves-mentor': {
      keywords: ['the craft', 'patience', 'the trade'],
      meaning: 'The one who shows you the work by doing it beside you for years.'
    },
    'staves-guide': {
      keywords: ['direction', 'the kindling', 'encouragement'],
      meaning: 'The one who finds the spark in someone else and refuses to let it go out.'
    },
    'staves-speaker': {
      keywords: ['the rallying', 'vision', 'the word'],
      meaning: 'The one who says the thing that makes a room want to build.'
    },
    'staves-dreamer': {
      keywords: ['the aisling', 'invention', 'the unasked'],
      meaning: 'The one who makes what nobody requested. Reckless creation, which is always sacred.'
    },

    // Coins — the world: substance, exchange, what is owed.
    'coins-ace': {
      keywords: ['the offer', 'substance', 'ground'],
      meaning: 'Something solid, held out. Prosaic and genuinely worth taking.'
    },
    'coins-two': {
      keywords: ['the exchange', 'balance', 'the deal'],
      meaning: 'Value moving between hands. Fair, so far, and needing attention to stay so.'
    },
    'coins-three': {
      keywords: ['the contract', 'collaboration', 'the terms'],
      meaning: 'Work and payment agreed. The card of what was actually written down.'
    },
    'coins-four': {
      keywords: ['the grip', 'security', 'holding'],
      meaning: 'Keeping what you have, tightly. Safe, and one step from a cage.'
    },
    'coins-five': {
      keywords: ['want', 'the cold', 'the shut door'],
      meaning: 'Outside, and help nearer than pride will admit.'
    },
    'coins-six': {
      keywords: ['giving', 'the scales', 'patronage'],
      meaning:
        'Generosity with a power in it. Who holds the scales matters as much as what is weighed.'
    },
    'coins-seven': {
      keywords: ['the tally', 'assessment', 'the wait'],
      meaning: 'Standing back to count. The pause where you decide whether it is worth continuing.'
    },
    'coins-eight': {
      keywords: ['prosperity', 'the estate', 'legacy'],
      meaning: 'Enough, and lasting. The suit’s end: abundance, and the question of who it is for.'
    },
    'coins-mentor': {
      keywords: ['stewardship', 'thrift', 'the ledger'],
      meaning: 'The one who teaches the unglamorous arithmetic that keeps a household alive.'
    },
    'coins-guide': {
      keywords: ['the market', 'shrewdness', 'the fair price'],
      meaning: 'The one who knows what a thing is really worth, and tells you.'
    },
    'coins-speaker': {
      keywords: ['the bargain', 'negotiation', 'the word given'],
      meaning: 'The one whose handshake is the contract. Trade as a form of trust.'
    },
    'coins-dreamer': {
      keywords: ['the aisling', 'the gamble', 'the wager'],
      meaning:
        'The one who stakes it all on an unreasonable idea. Fortune favours only those bold enough to play.'
    },

    // Cups — the heart: devotion, kinship, what is felt.
    'cups-ace': {
      keywords: ['the offered cup', 'opening', 'feeling'],
      meaning: 'The heart held out, undefended. Felt long before it is understood.'
    },
    'cups-two': {
      keywords: ['kinship', 'the meeting', 'mutuality'],
      meaning: 'Two people who have become, in some small way, one thing.'
    },
    'cups-three': {
      keywords: ['company', 'gladness', 'the table'],
      meaning: 'Joy that is better for being shared, and would be less without them.'
    },
    'cups-four': {
      keywords: ['the unnoticed', 'satiety', 'stillness'],
      meaning: 'A cup held out while you look elsewhere. Comfort at the moment it starts to dull.'
    },
    'cups-five': {
      keywords: ['grief', 'loss', 'what remains'],
      meaning:
        'What spilled, and the two cups still standing behind you that you have not turned to see.'
    },
    'cups-six': {
      keywords: ['memory', 'tenderness', 'the given'],
      meaning: 'Sweetness remembered and offered on. Kindness with no interest in being repaid.'
    },
    'cups-seven': {
      keywords: ['longing', 'the fog', 'too many'],
      meaning: 'Wanting in every direction at once, with no ground under any of it.'
    },
    'cups-eight': {
      keywords: ['devotion', 'the vigil', 'the staying'],
      meaning:
        'The hand that does not leave when every other has. The suit’s end: mercy as a choice, made again each day.'
    },
    'cups-mentor': {
      keywords: ['care', 'the holding', 'compassion'],
      meaning:
        'The one who teaches by tending — and shows that enduring cruelty need not make you cruel.'
    },
    'cups-guide': {
      keywords: ['empathy', 'the listening', 'accompaniment'],
      meaning: 'The one who walks beside grief without trying to fix it.'
    },
    'cups-speaker': {
      keywords: ['the confession', 'the named feeling', 'grace'],
      meaning: 'The one who says the tender thing out loud, which is harder than it sounds.'
    },
    'cups-dreamer': {
      keywords: ['the aisling', 'longing', 'the spark'],
      meaning:
        'The one who loves past all reason. Blessed and cursed alike — the power to start and to stop, in the same hands.'
    }
  }
}
