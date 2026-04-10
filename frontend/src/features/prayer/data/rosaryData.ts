export type MysterySetKey = 'joyful' | 'sorrowful' | 'glorious' | 'luminous';

export interface RosaryMystery {
  title: string;
  scripture: string;
  meditation: string;
}

export interface RosaryMysterySet {
  key: MysterySetKey;
  labelKey: string;
  daysKey: string;
  defaultDays: number[]; // 0=Sun, 1=Mon, ... 6=Sat
  mysteries: RosaryMystery[];
}

export const ROSARY_MYSTERY_SETS: RosaryMysterySet[] = [
  {
    key: 'joyful',
    labelKey: 'prayer.joyful',
    daysKey: 'prayer.joyfulDays',
    defaultDays: [1, 6], // Monday, Saturday
    mysteries: [
      { title: 'The Annunciation',       scripture: 'Luke 1:26-38',    meditation: 'Mary receives the angel\'s message with faith and humility.' },
      { title: 'The Visitation',         scripture: 'Luke 1:39-56',    meditation: 'Mary carries Jesus to Elizabeth; John leaps in the womb.' },
      { title: 'The Nativity',           scripture: 'Luke 2:1-20',     meditation: 'The Word becomes flesh and dwells among us.' },
      { title: 'The Presentation',       scripture: 'Luke 2:22-38',    meditation: 'Simeon holds the Light of the world and blesses God.' },
      { title: 'Finding in the Temple',  scripture: 'Luke 2:41-52',    meditation: 'Jesus, lost and found, is about His Father\'s business.' },
    ],
  },
  {
    key: 'sorrowful',
    labelKey: 'prayer.sorrowful',
    daysKey: 'prayer.sorrowfulDays',
    defaultDays: [2, 5], // Tuesday, Friday
    mysteries: [
      { title: 'Agony in the Garden',    scripture: 'Luke 22:39-46',   meditation: 'Not my will, but Yours be done.' },
      { title: 'Scourging at the Pillar', scripture: 'John 19:1',      meditation: 'By His wounds we are healed.' },
      { title: 'Crowning with Thorns',   scripture: 'Matthew 27:28-30', meditation: 'He bore the crown of our pride and shame.' },
      { title: 'Carrying the Cross',     scripture: 'Luke 23:26-32',   meditation: 'Take up your cross and follow Him.' },
      { title: 'The Crucifixion',        scripture: 'John 19:17-37',   meditation: 'It is finished. Love poured out completely.' },
    ],
  },
  {
    key: 'glorious',
    labelKey: 'prayer.glorious',
    daysKey: 'prayer.gloriousDays',
    defaultDays: [3, 0], // Wednesday, Sunday
    mysteries: [
      { title: 'The Resurrection',       scripture: 'John 20:1-18',    meditation: 'Death is swallowed up in victory.' },
      { title: 'The Ascension',          scripture: 'Acts 1:6-11',     meditation: 'He is seated at the right hand of the Father.' },
      { title: 'The Descent of the Spirit', scripture: 'Acts 2:1-13', meditation: 'The Spirit fills the room and transforms the disciples.' },
      { title: 'The Assumption',         scripture: 'Revelation 12:1', meditation: 'Mary is taken to heaven, body and soul.' },
      { title: 'The Coronation of Mary', scripture: 'Revelation 12:1', meditation: 'The Mother of God crowned as Queen of Heaven and Earth.' },
    ],
  },
  {
    key: 'luminous',
    labelKey: 'prayer.luminous',
    daysKey: 'prayer.luminousDays',
    defaultDays: [4], // Thursday
    mysteries: [
      { title: 'The Baptism of Jesus',   scripture: 'Matthew 3:13-17', meditation: 'This is My beloved Son, in whom I am well pleased.' },
      { title: 'The Wedding at Cana',    scripture: 'John 2:1-12',     meditation: 'Do whatever He tells you.' },
      { title: 'Proclamation of the Kingdom', scripture: 'Mark 1:14-15', meditation: 'Repent, and believe in the gospel.' },
      { title: 'The Transfiguration',    scripture: 'Luke 9:28-36',    meditation: 'His face shone like the sun, His clothes became white as light.' },
      { title: 'Institution of the Eucharist', scripture: 'Luke 22:14-20', meditation: 'This is My body, given for you.' },
    ],
  },
];

export const ROSARY_PRAYERS: Record<string, string> = {
  apostlesCreed: `I believe in God, the Father Almighty, Creator of Heaven and earth; and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died, and was buried. He descended into Hell; the third day He rose again from the dead; He ascended into Heaven, and sitteth at the right hand of God, the Father Almighty; from thence He shall come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.`,

  ourFather: `Our Father, who art in Heaven, hallowed be Thy name; Thy Kingdom come; Thy will be done on earth as it is in Heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.`,

  hailMary: `Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.`,

  gloryBe: `Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.`,

  fatimaPrayer: `O my Jesus, forgive us our sins, save us from the fires of Hell. Lead all souls to Heaven, especially those in most need of Thy mercy. Amen.`,

  hailHolyQueen: `Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope! To thee do we cry, poor banished children of Eve; to thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us; and after this, our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary! Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.`,
};

// ── Rosary sequence builder ─────────────────────────────────────────────────

export type StepType =
  | 'apostles-creed'
  | 'our-father'
  | 'hail-mary'
  | 'glory-be'
  | 'fatima'
  | 'hail-holy-queen'
  | 'complete';

export interface RosaryStep {
  stepType: StepType;
  decadeIndex: number;  // 0–4, or -1 for non-decade steps
  beadIndex: number;    // position within stepType sequence
  totalInStep: number;  // total repetitions in this step (1 for single prayers)
}

/**
 * Returns the full ordered sequence of steps for one complete Rosary.
 * Total = 59 beads:
 *   1 Apostles' Creed + 1 Our Father + 3 Hail Marys + 1 Glory Be (intro)
 *   + 5 × (1 Our Father + 10 Hail Marys + 1 Glory Be + 1 Fatima)
 *   + 1 Hail Holy Queen
 */
export function buildRosarySequence(): RosaryStep[] {
  const steps: RosaryStep[] = [];

  // Introductory prayers
  steps.push({ stepType: 'apostles-creed', decadeIndex: -1, beadIndex: 0, totalInStep: 1 });
  steps.push({ stepType: 'our-father',     decadeIndex: -1, beadIndex: 0, totalInStep: 1 });
  for (let i = 0; i < 3; i++) {
    steps.push({ stepType: 'hail-mary', decadeIndex: -1, beadIndex: i, totalInStep: 3 });
  }
  steps.push({ stepType: 'glory-be', decadeIndex: -1, beadIndex: 0, totalInStep: 1 });

  // 5 decades
  for (let d = 0; d < 5; d++) {
    steps.push({ stepType: 'our-father', decadeIndex: d, beadIndex: 0, totalInStep: 1 });
    for (let i = 0; i < 10; i++) {
      steps.push({ stepType: 'hail-mary', decadeIndex: d, beadIndex: i, totalInStep: 10 });
    }
    steps.push({ stepType: 'glory-be', decadeIndex: d, beadIndex: 0, totalInStep: 1 });
    steps.push({ stepType: 'fatima',   decadeIndex: d, beadIndex: 0, totalInStep: 1 });
  }

  // Closing
  steps.push({ stepType: 'hail-holy-queen', decadeIndex: -1, beadIndex: 0, totalInStep: 1 });
  steps.push({ stepType: 'complete',        decadeIndex: -1, beadIndex: 0, totalInStep: 1 });

  return steps;
}

export const TOTAL_BEADS = 59;

/** Returns the mystery set key traditionally prayed on the given day of week (0=Sun). */
export function getTodaysMysterySet(dayOfWeek: number): MysterySetKey {
  const map: Record<number, MysterySetKey> = {
    0: 'glorious', // Sunday
    1: 'joyful',   // Monday
    2: 'sorrowful', // Tuesday
    3: 'luminous', // Wednesday
    4: 'luminous', // Thursday
    5: 'sorrowful', // Friday
    6: 'joyful',   // Saturday
  };
  return map[dayOfWeek] ?? 'joyful';
}
