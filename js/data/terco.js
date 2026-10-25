// Orações e mistérios do Santo Terço, em português e em latim.

export const ORACOES = {
  sinal: {
    pt: { t: 'Sinal da cruz', x: 'Em nome do Pai, do Filho e do Espírito Santo. Amém.' },
    la: { t: 'Signum Crucis', x: 'In nomine Patris, et Filii, et Spiritus Sancti. Amen.' },
  },
  credo: {
    pt: { t: 'Creio', x: 'Creio em Deus Pai todo-poderoso, criador do céu e da terra. E em Jesus Cristo, seu único Filho, nosso Senhor, que foi concebido pelo poder do Espírito Santo; nasceu da Virgem Maria; padeceu sob Pôncio Pilatos, foi crucificado, morto e sepultado; desceu à mansão dos mortos; ressuscitou ao terceiro dia; subiu aos céus; está sentado à direita de Deus Pai todo-poderoso, donde há de vir a julgar os vivos e os mortos. Creio no Espírito Santo, na santa Igreja católica, na comunhão dos santos, na remissão dos pecados, na ressurreição da carne, na vida eterna. Amém.' },
    la: { t: 'Credo', x: 'Credo in Deum Patrem omnipotentem, Creatorem caeli et terrae. Et in Iesum Christum, Filium eius unicum, Dominum nostrum, qui conceptus est de Spiritu Sancto, natus ex Maria Virgine, passus sub Pontio Pilato, crucifixus, mortuus, et sepultus, descendit ad inferos, tertia die resurrexit a mortuis, ascendit ad caelos, sedet ad dexteram Dei Patris omnipotentis, inde venturus est iudicare vivos et mortuos. Credo in Spiritum Sanctum, sanctam Ecclesiam catholicam, sanctorum communionem, remissionem peccatorum, carnis resurrectionem, vitam aeternam. Amen.' },
  },
  pai: {
    pt: { t: 'Pai-nosso', x: 'Pai nosso, que estais nos céus, santificado seja o vosso nome; venha a nós o vosso reino; seja feita a vossa vontade, assim na terra como no céu. O pão nosso de cada dia nos dai hoje; perdoai-nos as nossas ofensas, assim como nós perdoamos a quem nos tem ofendido; e não nos deixeis cair em tentação, mas livrai-nos do mal. Amém.' },
    la: { t: 'Pater noster', x: 'Pater noster, qui es in caelis, sanctificetur nomen tuum. Adveniat regnum tuum. Fiat voluntas tua, sicut in caelo et in terra. Panem nostrum quotidianum da nobis hodie, et dimitte nobis debita nostra, sicut et nos dimittimus debitoribus nostris. Et ne nos inducas in tentationem, sed libera nos a malo. Amen.' },
  },
  ave: {
    pt: { t: 'Ave-Maria', x: 'Ave, Maria, cheia de graça, o Senhor é convosco; bendita sois vós entre as mulheres, e bendito é o fruto do vosso ventre, Jesus. Santa Maria, Mãe de Deus, rogai por nós, pecadores, agora e na hora de nossa morte. Amém.' },
    la: { t: 'Ave Maria', x: 'Ave Maria, gratia plena, Dominus tecum. Benedicta tu in mulieribus, et benedictus fructus ventris tui, Iesus. Sancta Maria, Mater Dei, ora pro nobis peccatoribus, nunc et in hora mortis nostrae. Amen.' },
  },
  gloria: {
    pt: { t: 'Glória', x: 'Glória ao Pai, ao Filho e ao Espírito Santo. Como era no princípio, agora e sempre. Amém.' },
    la: { t: 'Gloria Patri', x: 'Gloria Patri, et Filio, et Spiritui Sancto. Sicut erat in principio, et nunc, et semper, et in saecula saeculorum. Amen.' },
  },
  fatima: {
    pt: { t: 'Ó meu Jesus', x: 'Ó meu Jesus, perdoai-nos, livrai-nos do fogo do inferno; levai as almas todas para o céu e socorrei principalmente as que mais precisarem.' },
    la: { t: 'O mi Iesu', x: 'O mi Iesu, dimitte nobis debita nostra, libera nos ab igne inferni, conduc in caelum omnes animas, praesertim illas quae maxime indigent misericordia tua.' },
  },
  salve: {
    pt: { t: 'Salve-Rainha', x: 'Salve, Rainha, Mãe de misericórdia, vida, doçura e esperança nossa, salve! A vós bradamos, os degredados filhos de Eva. A vós suspiramos, gemendo e chorando neste vale de lágrimas. Eia, pois, advogada nossa, esses vossos olhos misericordiosos a nós volvei. E depois deste desterro, mostrai-nos Jesus, bendito fruto do vosso ventre. Ó clemente, ó piedosa, ó doce sempre Virgem Maria.', r: ['Rogai por nós, santa Mãe de Deus.', 'Para que sejamos dignos das promessas de Cristo.'] },
    la: { t: 'Salve Regina', x: 'Salve, Regina, Mater misericordiae, vita, dulcedo, et spes nostra, salve. Ad te clamamus, exsules filii Hevae. Ad te suspiramus, gementes et flentes in hac lacrimarum valle. Eia, ergo, advocata nostra, illos tuos misericordes oculos ad nos converte. Et Iesum, benedictum fructum ventris tui, nobis post hoc exsilium ostende. O clemens, O pia, O dulcis Virgo Maria.', r: ['Ora pro nobis, sancta Dei Genetrix.', 'Ut digni efficiamur promissionibus Christi.'] },
  },
};

// Dia da semana (0 = domingo) -> conjunto de mistérios
export const POR_DIA = ['gloriosos', 'gozosos', 'dolorosos', 'gloriosos', 'luminosos', 'dolorosos', 'gozosos'];

export const MISTERIOS = {
  gozosos: {
    pt: 'Mistérios Gozosos', la: 'Mysteria Gaudiosa', dias: 'Segunda e sábado',
    itens: [
      { pt: 'A Anunciação do Anjo a Nossa Senhora', la: 'Annuntiatio', ref: 'Lc 1,26-38' },
      { pt: 'A Visitação de Nossa Senhora a Santa Isabel', la: 'Visitatio', ref: 'Lc 1,39-56' },
      { pt: 'O Nascimento de Jesus em Belém', la: 'Nativitas', ref: 'Lc 2,1-20' },
      { pt: 'A Apresentação de Jesus no Templo', la: 'Praesentatio in Templo', ref: 'Lc 2,22-38' },
      { pt: 'O Encontro de Jesus no Templo', la: 'Inventio in Templo', ref: 'Lc 2,41-52' },
    ],
  },
  luminosos: {
    pt: 'Mistérios Luminosos', la: 'Mysteria Luminosa', dias: 'Quinta-feira',
    itens: [
      { pt: 'O Batismo de Jesus no Jordão', la: 'Baptisma in Iordane', ref: 'Mt 3,13-17' },
      { pt: 'A autorrevelação de Jesus nas Bodas de Caná', la: 'Nuptiae Canae', ref: 'Jo 2,1-12' },
      { pt: 'O anúncio do Reino de Deus e o convite à conversão', la: 'Annuntiatio Regni', ref: 'Mc 1,14-15' },
      { pt: 'A Transfiguração do Senhor', la: 'Transfiguratio', ref: 'Lc 9,28-36' },
      { pt: 'A instituição da Eucaristia', la: 'Institutio Eucharistiae', ref: 'Lc 22,14-20' },
    ],
  },
  dolorosos: {
    pt: 'Mistérios Dolorosos', la: 'Mysteria Dolorosa', dias: 'Terça e sexta',
    itens: [
      { pt: 'A agonia de Jesus no Horto', la: 'Agonia in Horto', ref: 'Lc 22,39-46' },
      { pt: 'A flagelação de Jesus', la: 'Flagellatio', ref: 'Jo 19,1' },
      { pt: 'A coroação de espinhos', la: 'Coronatio spinis', ref: 'Mt 27,27-31' },
      { pt: 'Jesus carrega a cruz até o Calvário', la: 'Baiulatio Crucis', ref: 'Jo 19,16-17' },
      { pt: 'A crucifixão e morte de Jesus', la: 'Crucifixio et Mors', ref: 'Lc 23,33-46' },
    ],
  },
  gloriosos: {
    pt: 'Mistérios Gloriosos', la: 'Mysteria Gloriosa', dias: 'Quarta e domingo',
    itens: [
      { pt: 'A Ressurreição de Jesus', la: 'Resurrectio', ref: 'Mc 16,1-7' },
      { pt: 'A Ascensão de Jesus ao céu', la: 'Ascensio', ref: 'At 1,6-11' },
      { pt: 'A vinda do Espírito Santo', la: 'Descensus Spiritus Sancti', ref: 'At 2,1-4' },
      { pt: 'A Assunção de Nossa Senhora', la: 'Assumptio', ref: 'Ap 12,1' },
      { pt: 'A coroação de Nossa Senhora como Rainha do céu e da terra', la: 'Coronatio in Caelo', ref: 'Ap 12,1' },
    ],
  },
};

export const ORDINAIS = {
  pt: ['Primeiro', 'Segundo', 'Terceiro', 'Quarto', 'Quinto'],
  la: ['Primum', 'Secundum', 'Tertium', 'Quartum', 'Quintum'],
};

export const INTENCOES_INICIAIS = {
  pt: ['pelo aumento da fé', 'pelo aumento da esperança', 'pelo aumento da caridade'],
  la: ['pro augmento fidei', 'pro augmento spei', 'pro augmento caritatis'],
};

// Línguas da oração. A pessoa escolhe uma principal e uma secundária em Ajustes.
export const LINGUAS = {
  pt: { nome: 'Português', curto: 'PT' },
  la: { nome: 'Latim', curto: 'LATIM' },
  en: { nome: 'Inglês', curto: 'INGLÊS' },
  it: { nome: 'Italiano', curto: 'ITALIANO' },
};

// Inglês e italiano: as fórmulas tradicionais de cada oração.
const EN = {
  sinal: { t: 'Sign of the Cross', x: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.' },
  credo: { t: 'Apostles’ Creed', x: 'I believe in God, the Father almighty, Creator of heaven and earth; and in Jesus Christ, his only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried. He descended into hell; on the third day he rose again from the dead; he ascended into heaven, and is seated at the right hand of God the Father almighty; from thence he shall come to judge the living and the dead. I believe in the Holy Spirit, the holy Catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.' },
  pai: { t: 'Our Father', x: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come, thy will be done on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.' },
  ave: { t: 'Hail Mary', x: 'Hail Mary, full of grace, the Lord is with thee. Blessed art thou amongst women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.' },
  gloria: { t: 'Glory Be', x: 'Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen.' },
  fatima: { t: 'O my Jesus', x: 'O my Jesus, forgive us our sins, save us from the fires of hell; lead all souls to heaven, especially those in most need of thy mercy.' },
  salve: { t: 'Hail, Holy Queen', x: 'Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.', r: ['Pray for us, O holy Mother of God.', 'That we may be made worthy of the promises of Christ.'] },
};

const IT = {
  sinal: { t: 'Segno della croce', x: 'Nel nome del Padre e del Figlio e dello Spirito Santo. Amen.' },
  credo: { t: 'Credo', x: 'Io credo in Dio, Padre onnipotente, creatore del cielo e della terra; e in Gesù Cristo, suo unico Figlio, nostro Signore, il quale fu concepito di Spirito Santo, nacque da Maria Vergine, patì sotto Ponzio Pilato, fu crocifisso, morì e fu sepolto; discese agli inferi; il terzo giorno risuscitò da morte; salì al cielo, siede alla destra di Dio Padre onnipotente; di là verrà a giudicare i vivi e i morti. Credo nello Spirito Santo, la santa Chiesa cattolica, la comunione dei santi, la remissione dei peccati, la risurrezione della carne, la vita eterna. Amen.' },
  pai: { t: 'Padre nostro', x: 'Padre nostro, che sei nei cieli, sia santificato il tuo nome, venga il tuo regno, sia fatta la tua volontà, come in cielo così in terra. Dacci oggi il nostro pane quotidiano, e rimetti a noi i nostri debiti come anche noi li rimettiamo ai nostri debitori, e non abbandonarci alla tentazione, ma liberaci dal male. Amen.' },
  ave: { t: 'Ave Maria', x: 'Ave, o Maria, piena di grazia, il Signore è con te. Tu sei benedetta fra le donne e benedetto è il frutto del tuo seno, Gesù. Santa Maria, Madre di Dio, prega per noi peccatori, adesso e nell’ora della nostra morte. Amen.' },
  gloria: { t: 'Gloria al Padre', x: 'Gloria al Padre e al Figlio e allo Spirito Santo. Come era nel principio, e ora e sempre, nei secoli dei secoli. Amen.' },
  fatima: { t: 'O Gesù mio', x: 'O Gesù mio, perdona le nostre colpe, preservaci dal fuoco dell’inferno, porta in cielo tutte le anime, specialmente le più bisognose della tua misericordia.' },
  salve: { t: 'Salve Regina', x: 'Salve, Regina, madre di misericordia, vita, dolcezza e speranza nostra, salve. A te ricorriamo, esuli figli di Eva; a te sospiriamo, gementi e piangenti in questa valle di lacrime. Orsù dunque, avvocata nostra, rivolgi a noi gli occhi tuoi misericordiosi. E mostraci, dopo questo esilio, Gesù, il frutto benedetto del tuo seno. O clemente, o pia, o dolce Vergine Maria.', r: ['Prega per noi, santa Madre di Dio.', 'E saremo degni delle promesse di Cristo.'] },
};
Object.keys(ORACOES).forEach((k) => { ORACOES[k].en = EN[k]; ORACOES[k].it = IT[k]; });

const MIST_EN_IT = {
  gozosos: ['Joyful Mysteries', 'Misteri gaudiosi', [
    ['The Annunciation', 'L’annunciazione dell’angelo a Maria'],
    ['The Visitation', 'La visita di Maria a santa Elisabetta'],
    ['The Nativity of Jesus', 'La nascita di Gesù a Betlemme'],
    ['The Presentation in the Temple', 'La presentazione di Gesù al Tempio'],
    ['The Finding in the Temple', 'Il ritrovamento di Gesù nel Tempio'],
  ]],
  luminosos: ['Luminous Mysteries', 'Misteri luminosi', [
    ['The Baptism in the Jordan', 'Il battesimo di Gesù al Giordano'],
    ['The Wedding at Cana', 'Le nozze di Cana'],
    ['The Proclamation of the Kingdom', 'L’annuncio del Regno di Dio'],
    ['The Transfiguration', 'La trasfigurazione'],
    ['The Institution of the Eucharist', 'L’istituzione dell’Eucaristia'],
  ]],
  dolorosos: ['Sorrowful Mysteries', 'Misteri dolorosi', [
    ['The Agony in the Garden', 'L’agonia di Gesù nell’orto'],
    ['The Scourging at the Pillar', 'La flagellazione di Gesù'],
    ['The Crowning with Thorns', 'L’incoronazione di spine'],
    ['The Carrying of the Cross', 'Gesù porta la croce al Calvario'],
    ['The Crucifixion and Death of Jesus', 'La crocifissione e morte di Gesù'],
  ]],
  gloriosos: ['Glorious Mysteries', 'Misteri gloriosi', [
    ['The Resurrection', 'La risurrezione di Gesù'],
    ['The Ascension', 'L’ascensione di Gesù al cielo'],
    ['The Descent of the Holy Spirit', 'La discesa dello Spirito Santo'],
    ['The Assumption of Mary', 'L’assunzione di Maria al cielo'],
    ['The Coronation of Mary', 'L’incoronazione di Maria Regina del cielo e della terra'],
  ]],
};
Object.entries(MIST_EN_IT).forEach(([c, [en, it, itens]]) => {
  MISTERIOS[c].en = en;
  MISTERIOS[c].it = it;
  itens.forEach(([e, i], k) => { MISTERIOS[c].itens[k].en = e; MISTERIOS[c].itens[k].it = i; });
});

ORDINAIS.en = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];
ORDINAIS.it = ['Primo', 'Secondo', 'Terzo', 'Quarto', 'Quinto'];
INTENCOES_INICIAIS.en = ['for an increase of faith', 'for an increase of hope', 'for an increase of charity'];
INTENCOES_INICIAIS.it = ['per l’aumento della fede', 'per l’aumento della speranza', 'per l’aumento della carità'];

// Nomes das partes do terço em cada língua
export const PARTES = {
  inicio: { pt: 'Início', la: 'Initium', en: 'Opening', it: 'Inizio' },
  fim: { pt: 'Conclusão', la: 'Finis', en: 'Closing', it: 'Conclusione' },
  rosario: { pt: 'Rosário completo', la: 'Rosarium integrum', en: 'Complete Rosary', it: 'Rosario completo' },
  misterio: {
    pt: (k) => `${['1º', '2º', '3º', '4º', '5º'][k]} mistério`,
    la: (k) => `Mysterium ${ORDINAIS.la[k]}`,
    en: (k) => `${ORDINAIS.en[k]} Mystery`,
    it: (k) => `${ORDINAIS.it[k]} mistero`,
  },
};
