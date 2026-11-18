import { randomInt, randomUUID } from 'node:crypto';

const languages = {
  fr: { label: 'français naturel', instruction: 'en français naturel' },
  en: { label: 'natural English', instruction: 'in natural English' },
  it: { label: 'italiano naturale', instruction: 'in natural Italian' },
  'pt-BR': { label: 'português brasileiro natural', instruction: 'in natural Brazilian Portuguese' },
  'ar-TN': { label: 'derja tunisienne naturelle, en alphabet latin', instruction: 'in natural Tunisian Derja, written in Latin transliteration' },
  'ar-DZ': { label: 'darija algérienne naturelle, en alphabet latin', instruction: 'in natural Algerian Darija, written in Latin transliteration' },
  'ar-MA': { label: 'darija marocaine naturelle, en alphabet latin', instruction: 'in natural Moroccan Darija, written in Latin transliteration' },
  'ar-EG': { label: 'arabe égyptien parlé', instruction: 'in natural colloquial Egyptian Arabic, written in Arabic script' },
};

const categoryOutcomes = {
  fr: {
    amour: { resolution: 'se dire toute la vérité avant de choisir', stakes: 'leur relation risque de se terminer sur un malentendu' },
    amitie: { resolution: 'réparer la promesse ensemble', stakes: 'leur groupe d’amis risque de se séparer' },
    famille: { resolution: 'réunir la famille pour partager la vérité', stakes: 'un proche risque d’être exclu de la famille' },
    fratrie: { resolution: 'affronter le problème ensemble', stakes: 'un frère ou une sœur risque d’assumer seul la faute' },
    suspense: { resolution: 'vérifier les preuves avant de répondre', stakes: 'les preuves risquent de disparaître avant minuit' },
    horreur: { resolution: 'quitter les lieux et attendre d’être en sécurité', stakes: 'quelqu’un risque de répondre depuis l’autre côté' },
  },
  en: {
    amour: { resolution: 'tell each other the whole truth before choosing', stakes: 'their relationship may end over a misunderstanding' },
    amitie: { resolution: 'repair the promise together', stakes: 'their group of friends may split apart' },
    famille: { resolution: 'bring the family together and share the truth', stakes: 'a relative may be pushed out of the family' },
    fratrie: { resolution: 'face the problem together', stakes: 'one sibling may take the blame alone' },
    suspense: { resolution: 'verify the evidence before replying', stakes: 'the evidence may disappear before midnight' },
    horreur: { resolution: 'leave the place and wait until they are safe', stakes: 'someone may answer from the other side' },
  },
  it: {
    amour: { resolution: 'dirci tutta la verità prima di scegliere', stakes: 'la loro relazione potrebbe finire per un malinteso' },
    amitie: { resolution: 'mantenere la promessa insieme', stakes: 'il loro gruppo di amici potrebbe dividersi' },
    famille: { resolution: 'riunire la famiglia e raccontare la verità', stakes: 'un parente potrebbe essere escluso dalla famiglia' },
    fratrie: { resolution: 'affrontare il problema insieme', stakes: 'un fratello o una sorella potrebbe prendersi tutta la colpa' },
    suspense: { resolution: 'verificare le prove prima di rispondere', stakes: 'le prove potrebbero sparire prima di mezzanotte' },
    horreur: { resolution: 'uscire da lì e aspettare di essere al sicuro', stakes: 'qualcuno potrebbe rispondere dall’altra parte' },
  },
  'pt-BR': {
    amour: { resolution: 'contar toda a verdade um para o outro antes de escolher', stakes: 'o relacionamento pode acabar por causa de um mal-entendido' },
    amitie: { resolution: 'consertar a promessa juntos', stakes: 'o grupo de amigos pode se separar' },
    famille: { resolution: 'reunir a família para contar a verdade', stakes: 'alguém pode ser excluído da família' },
    fratrie: { resolution: 'enfrentar o problema juntos', stakes: 'um dos irmãos pode levar a culpa sozinho' },
    suspense: { resolution: 'conferir as provas antes de responder', stakes: 'as provas podem desaparecer antes da meia-noite' },
    horreur: { resolution: 'sair dali e esperar até estarem em segurança', stakes: 'alguém pode responder do outro lado' },
  },
  'ar-TN': {
    amour: { resolution: 'y9oulou l ba3dhhom kol chay 9bal ma ye5tarou', stakes: 'el 3ala9a mte3hom tnajem toufa b sabab sou2 tafahom' },
    amitie: { resolution: 'ysal7ou el wa3d m3a ba3dhhom', stakes: 'groupe s7abhom ynajem yetfar9' },
    famille: { resolution: 'yjamm3ou el famille w y9oulou el 7a9i9a', stakes: 'wa7ed men la famille ynajem yetna7a mel famille' },
    fratrie: { resolution: 'ywajhou el mochkla m3a ba3dhhom', stakes: 'khou wala okht tnajem techil el ghalta wa7adha' },
    suspense: { resolution: 'ythabtou fel preuves 9bal ma yjawbou', stakes: 'el preuves tnajem tdhaya3 9bal nos el lil' },
    horreur: { resolution: 'yo5rjou men ghadi w yestannaw 7atta ywalliw fi amen', stakes: 'chkoun ynajem yjawb men jiha lo5ra' },
  },
  'ar-DZ': {
    amour: { resolution: 'y9oulou l ba3dahom ga3 l7a9 9bel ma ykhtaro', stakes: 'l3ala9a ta3hom t9der tkhlas b sabab sou2 tafahom' },
    amitie: { resolution: 'ysel7ou l wa3d m3a ba3dahom', stakes: 'groupe ta3 s7abhom y9der yetfere9' },
    famille: { resolution: 'yjem3ou la famille w y9oulou l7a9i9a', stakes: 'wahed men la famille y9der yetna7a menha' },
    fratrie: { resolution: 'ywa9fou l mochkla m3a ba3dahom', stakes: 'khou wela khto y9der ycheel l ghalta wa7dou' },
    suspense: { resolution: 'yet2ekdou men les preuves 9bel ma yjawbou', stakes: 'les preuves y9edrou ydi3ou 9bel nos lil' },
    horreur: { resolution: 'yakhroujou men tema w yestennaw 7atta ywelliw f l aman', stakes: 'wahed y9der yjawb men jiha lokhra' },
  },
  'ar-MA': {
    amour: { resolution: 'y9olo l b3dyathom kolchi 9bel ma ykhtaro', stakes: 'l3ala9a dyalhom t9der tsali b sabab sou2 tafahom' },
    amitie: { resolution: 'ysawbo l wa3d m3a b3dyathom', stakes: 'groupe dyal s7abhom y9der ytfreq' },
    famille: { resolution: 'yjme3o la famille w y9olo l7e9i9a', stakes: 'chi wa7ed y9der yt7yed men la famille' },
    fratrie: { resolution: 'ywajho lmochkil m3a b3dyathom', stakes: 'khou wela khto y9der ycheel lghalta bo7do' },
    suspense: { resolution: 'yt2ekdo men les preuves 9bel ma yjawbo', stakes: 'les preuves y9dro ydi3o 9bel nos lil' },
    horreur: { resolution: 'ykhrjo men tema w ytsennaw 7ta ywliw f l aman', stakes: 'chi wa7ed y9der yjawb men jiha lokhra' },
  },
  'ar-EG': {
    amour: { resolution: 'يقولوا لبعض الحقيقة كلها قبل ما يختاروا', stakes: 'علاقتهم ممكن تنتهي بسبب سوء تفاهم' },
    amitie: { resolution: 'يصلحوا الوعد مع بعض', stakes: 'شلة أصحابهم ممكن تتفرق' },
    famille: { resolution: 'يلمّوا العيلة ويحكوا الحقيقة', stakes: 'حد من العيلة ممكن يتطرد منها' },
    fratrie: { resolution: 'يواجهوا المشكلة سوا', stakes: 'أخ أو أخت ممكن يشيل اللوم لوحده' },
    suspense: { resolution: 'يتأكدوا من الدليل قبل ما يردوا', stakes: 'الدليل ممكن يختفي قبل نص الليل' },
    horreur: { resolution: 'يخرجوا من المكان ويستنوا لحد ما يبقوا في أمان', stakes: 'حد ممكن يرد من الناحية التانية' },
  },
};

const profiles = {
  amour: {
    label: 'Amour',
    relationship: 'couple',
    event: ['ex_returns', 'secret_relationship', 'jealousy', 'hidden_message', 'betrayal', 'proposal', 'breakup', 'wrong_recipient', 'old_letter', 'shared_reservation'],
    conflict: ['trust', 'jealousy', 'distance', 'secret', 'timing', 'misunderstanding'],
    twist: ['the apparent betrayal was a surprise', 'the ex came back to return evidence, not rekindle the relationship', 'both partners were hiding the same truth', 'the proposal was meant for somebody else', 'an old message was sent automatically years later', 'the jealous friend staged the misunderstanding'],
    resolution: ['tell each other the whole truth', 'meet face to face before deciding', 'return what belongs to the ex', 'postpone the decision until morning', 'start again with one honest promise', 'walk away without exposing the secret'],
    stakes: ['someone they love will leave', 'a private truth will become public', 'they will make a life-changing choice for the wrong reason', 'an innocent person will be blamed'],
  },
  amitie: {
    label: 'Amitié',
    relationship: 'friends',
    event: ['broken_promise', 'trip_plan', 'secret_leak', 'old_friend_returns', 'missing_item', 'anonymous_warning', 'wrong_recipient', 'shared_photo', 'unexpected_invitation', 'borrowed_money'],
    conflict: ['trust', 'broken_promise', 'jealousy', 'misunderstanding', 'distance', 'secret'],
    twist: ['the friend who seemed to betray them was protecting someone', 'both friends received different versions of the same story', 'the old photo proves they remember the promise differently', 'the warning came from the friend they had stopped trusting', 'the trip was planned as an apology, not an escape', 'the missing item was returned with a message from years ago'],
    resolution: ['keep the promise together', 'admit what each of them hid', 'cancel the trip and help the person who needs them', 'give the friendship one honest conversation', 'return the borrowed money and start over', 'meet the friend who sent the warning'],
    stakes: ['their group will split apart', 'a friend will take the blame', 'the trip will leave without the person who needs it most', 'a private confession will cost them their oldest friendship'],
  },
  famille: {
    label: 'Famille',
    relationship: 'family',
    event: ['inheritance', 'missing_parent', 'old_letter', 'family_meeting', 'lost_sibling', 'hidden_record', 'unexpected_guest', 'old_key', 'family_photo', 'house_sale'],
    conflict: ['inheritance', 'secret', 'loyalty', 'old_grudge', 'misunderstanding', 'distance'],
    twist: ['the inheritance belongs to the person nobody invited', 'the missing parent left a reply addressed to today', 'the family story was changed to protect a sibling', 'the old letter was written by someone everyone thought could not read', 'the person asking to sell the house is trying to save it', 'two relatives have been keeping the same secret from each other'],
    resolution: ['read the letter together', 'share the inheritance according to the truth', 'invite the absent relative before the meeting ends', 'keep the house open until everyone has spoken', 'tell the youngest member what really happened', 'make one decision as a family'],
    stakes: ['the family will lose the last place they share', 'an absent relative will be written out of the family', 'the wrong person will inherit the blame', 'a reunion will become the last chance to speak'],
  },
  fratrie: {
    label: 'Frère et sœur',
    relationship: 'siblings',
    event: ['childhood_memory', 'protective_lie', 'shared_secret', 'family_problem', 'old_trophy', 'missing_key', 'unexpected_guest', 'old_recording', 'jealousy', 'parent_message'],
    conflict: ['jealousy', 'loyalty', 'secret', 'old_grudge', 'misunderstanding', 'protection'],
    twist: ['the sibling who seemed favored had been covering for the other', 'their childhood memory belongs to a day neither can explain', 'the protective lie was told to keep the younger sibling safe', 'the parent asked both of them to protect the same person', 'the old recording contains both of their voices', 'the apparent rivalry was arranged by someone else'],
    resolution: ['stop keeping score and face the problem together', 'tell their parent what they both remember', 'return the hidden object to its owner', 'protect the sibling by telling the truth', 'revisit the place from their childhood', 'make a new promise without conditions'],
    stakes: ['one sibling will take the blame alone', 'their family will repeat the same old argument', 'a parent will make a decision based on a lie', 'the person they are protecting will leave'],
  },
  suspense: {
    label: 'Suspense',
    relationship: 'acquaintances',
    event: ['unknown_number', 'surveillance_photo', 'strange_message', 'disappearance', 'wrong_recipient', 'mystery_parcel', 'missed_call', 'door_camera', 'duplicate_key', 'live_location'],
    conflict: ['identity', 'deadline', 'trust', 'misunderstanding', 'missing_evidence', 'wrong_recipient'],
    twist: ['the sender is using a phone that was reported lost tomorrow', 'the camera shows the recipient sending the warning before it arrived', 'the missing person scheduled the messages to arrive in the wrong order', 'the parcel was sent by the person currently asking where it is', 'the unknown number belongs to someone already in the chat', 'the supposed witness is watching the same feed from another address'],
    resolution: ['compare the original timestamps', 'call the one person the sender told them to avoid', 'leave the evidence where a third person can verify it', 'go to the location together and stay on the line', 'answer the next call without revealing their names', 'send one question only the real person could answer'],
    stakes: ['the evidence will disappear when the camera resets', 'someone will arrive at the wrong address', 'the wrong person will be accused before midnight', 'the next message will reveal their location'],
  },
  horreur: {
    label: 'Horreur',
    relationship: 'friends',
    event: ['impossible_photo', 'message_from_past', 'empty_house', 'blocked_number', 'window_figure', 'recorded_voice', 'camera_shadow', 'locked_room', 'old_birthday', 'silent_alarm'],
    conflict: ['identity', 'fear', 'missing_evidence', 'secret', 'deadline', 'trust'],
    twist: ['the voice note contains a reply recorded after the phone was switched off', 'the empty room appears occupied only in the reflection', 'the blocked number is saved under the recipient’s own name', 'the figure outside is visible in the photo but not through the window', 'the old message describes what they are typing right now', 'the camera shows one more person than the room contains'],
    resolution: ['leave the building without looking back', 'keep the lights on and call someone outside', 'delete nothing until another person sees it', 'open the door only after the voice answers a new question', 'meet in a public place and compare phones', 'stop replying and wait for daylight'],
    stakes: ['the person in the recording will know they listened', 'the empty house will no longer be empty', 'the next photograph will include the person holding the phone', 'the message will arrive again at the same time tomorrow'],
  },
  humour: {
    label: 'Humour',
    relationship: 'friends',
    event: ['wrong_recipient', 'unexpected_guest', 'shared_photo', 'mystery_parcel', 'trip_plan', 'old_recording'],
    conflict: ['misunderstanding', 'jealousy', 'deadline', 'secret'],
    twist: ['the embarrassing message was sent to the entire group', 'the apparent disaster was a very elaborate surprise', 'the person blamed for the mess was trying to clean it up', 'the mystery parcel contains the thing they just ordered for somebody else'],
    resolution: ['admit the mistake before anyone else notices', 'turn the mix-up into a shared joke', 'deliver the surprise together', 'let the group vote on what happens next'],
    stakes: ['the whole group chat will see the evidence', 'their plan will become a running joke', 'someone will arrive wearing the wrong outfit'],
  },
  drame: {
    label: 'Drame',
    relationship: 'family',
    event: ['old_letter', 'missing_parent', 'shared_photo', 'house_sale', 'family_meeting', 'unexpected_invitation'],
    conflict: ['distance', 'old_grudge', 'secret', 'loyalty'],
    twist: ['the apology was written but never sent', 'the person they blamed had been waiting for them to ask', 'both sides have been protecting the same memory', 'the final message came from someone who thought they were forgotten'],
    resolution: ['say what they could not say before', 'meet without asking for an apology first', 'keep the promise they made as children', 'return the letter with a new answer'],
    stakes: ['this may be their last chance to meet', 'someone will leave without hearing the truth', 'the family will remember only one version of the story'],
  },
  trahison: {
    label: 'Trahison',
    relationship: 'friends',
    event: ['secret_leak', 'borrowed_money', 'wrong_recipient', 'shared_photo', 'anonymous_warning', 'unexpected_invitation'],
    conflict: ['trust', 'betrayal', 'jealousy', 'secret'],
    twist: ['the evidence was edited by the person who first shared it', 'the apparent traitor was covering for the person accusing them', 'the secret was revealed to protect somebody else', 'the warning came from the person they had all agreed to exclude'],
    resolution: ['show the original evidence to everyone involved', 'ask the accused person before choosing sides', 'tell the truth even if the group breaks apart', 'give the person who warned them a chance to explain'],
    stakes: ['an innocent person will lose their closest friends', 'the group will choose sides before hearing the truth', 'the real betrayal will remain hidden'],
  },
  secret_famille: {
    label: 'Secret de famille',
    relationship: 'family',
    event: ['hidden_record', 'old_letter', 'lost_sibling', 'inheritance', 'family_photo', 'old_key'],
    conflict: ['secret', 'identity', 'loyalty', 'inheritance'],
    twist: ['the name on the record belongs to someone still in the family', 'the letter was meant for the person who found it, not its named recipient', 'the family has been protecting the wrong version of the story', 'the hidden relative has been part of every reunion'],
    resolution: ['invite the person named in the record', 'read the rest of the letter together', 'ask the oldest relative one direct question', 'share the truth before the family meeting ends'],
    stakes: ['someone will lose their place in the family', 'an inheritance will be decided using a false name', 'the person they are searching for may already know'],
  },
};

const aliases = new Map([
  ['amour', 'amour'], ['couple', 'amour'], ['love', 'amour'], ['romance', 'amour'],
  ['amitie', 'amitie'], ['friendship', 'amitie'],
  ['famille', 'famille'], ['family', 'famille'],
  ['frere et soeur', 'fratrie'], ['fratrie', 'fratrie'], ['siblings', 'fratrie'],
  ['suspense', 'suspense'], ['thriller', 'suspense'],
  ['horreur', 'horreur'], ['horror', 'horreur'],
  ['humour', 'humour'], ['comedy', 'humour'],
  ['drame', 'drame'], ['drama', 'drame'],
  ['trahison', 'trahison'], ['betrayal', 'trahison'],
  ['secret de famille', 'secret_famille'], ['family secret', 'secret_famille'],
]);

const translations = {
  fr: {
    relations: { couple: 'entre vous deux', friends: 'entre deux amis proches', family: 'dans la famille', siblings: 'entre frère et sœur', acquaintances: 'entre deux personnes qui se connaissent à peine' },
    events: { ex_returns: 'le retour inattendu d’un ex', secret_relationship: 'une relation tenue secrète', jealousy: 'un accès de jalousie', hidden_message: 'un message caché', betrayal: 'une possible tromperie', proposal: 'une demande inattendue', breakup: 'une rupture annoncée par message', wrong_recipient: 'un message envoyé au mauvais destinataire', old_letter: 'une lettre retrouvée', shared_reservation: 'une réservation faite à deux', broken_promise: 'une promesse oubliée', trip_plan: 'un voyage organisé en secret', secret_leak: 'un secret qui a circulé', old_friend_returns: 'le retour d’un vieil ami', missing_item: 'un objet qui a disparu', anonymous_warning: 'un avertissement anonyme', shared_photo: 'une photo envoyée au mauvais groupe', unexpected_invitation: 'une invitation inattendue', borrowed_money: 'de l’argent prêté sans explication', inheritance: 'un héritage inattendu', missing_parent: 'la disparition d’un parent', family_meeting: 'une réunion familiale tendue', lost_sibling: 'la trace d’un frère ou d’une sœur perdu de vue', hidden_record: 'un document caché', unexpected_guest: 'un invité qui n’était pas attendu', old_key: 'une vieille clé', family_photo: 'une photo de famille troublante', house_sale: 'la vente de la maison familiale', childhood_memory: 'un souvenir d’enfance qui ne concorde pas', protective_lie: 'un mensonge destiné à protéger quelqu’un', old_trophy: 'un trophée d’enfance', missing_key: 'une clé qui manque', old_recording: 'un ancien enregistrement', parent_message: 'un message laissé par un parent', unknown_number: 'un appel d’un numéro inconnu', surveillance_photo: 'une photo prise par une caméra de surveillance', strange_message: 'un message étrange', disappearance: 'une disparition inexpliquée', mystery_parcel: 'un colis sans expéditeur', missed_call: 'un appel manqué répété', door_camera: 'une caméra de porte qui s’active seule', duplicate_key: 'une clé copiée sans autorisation', live_location: 'une position partagée depuis un téléphone éteint', impossible_photo: 'une photo impossible', message_from_past: 'un message envoyé depuis le passé', empty_house: 'une maison vide où quelqu’un semble vivre', blocked_number: 'un numéro bloqué qui rappelle', window_figure: 'une silhouette derrière la fenêtre', recorded_voice: 'une voix dans un vocal', camera_shadow: 'une ombre sur une caméra', locked_room: 'une pièce fermée de l’intérieur', old_birthday: 'un message d’anniversaire envoyé après la mort de son auteur', silent_alarm: 'une alarme silencieuse qui se déclenche', old_birthday: 'un anniversaire impossible' },
    conflicts: { trust: 'ils ne savent plus à qui faire confiance', jealousy: 'la jalousie a remplacé les explications', distance: 'la distance a transformé un silence en rejet', secret: 'un secret empêche chacun de tout dire', timing: 'ils n’ont plus le temps de réfléchir', misunderstanding: 'ils ont compris le même message de deux façons', broken_promise: 'une promesse importante a été rompue', inheritance: 'l’héritage oppose ceux qui devraient s’entraider', loyalty: 'la loyauté exige de choisir un camp', old_grudge: 'une vieille rancune ressurgit', protection: 'protéger quelqu’un pourrait faire accuser l’autre', identity: 'personne ne sait qui a vraiment envoyé le message', deadline: 'ils n’ont que quelques minutes pour agir', missing_evidence: 'la preuve principale a disparu', fear: 'la peur les empêche de vérifier ce qu’ils voient', betrayal: 'la confiance a été trahie' },
    twists: { 'the apparent betrayal was a surprise': 'la trahison apparente était une surprise', 'the ex came back to return evidence, not rekindle the relationship': 'l’ex est revenu pour rendre une preuve, pas pour reprendre la relation', 'both partners were hiding the same truth': 'les deux partenaires cachaient la même vérité', 'the proposal was meant for somebody else': 'la demande était destinée à quelqu’un d’autre', 'an old message was sent automatically years later': 'un ancien message vient d’être envoyé automatiquement', 'the jealous friend staged the misunderstanding': 'l’ami jaloux a provoqué le malentendu', 'the friend who seemed to betray them was protecting someone': 'l’ami qui semblait trahir protégeait quelqu’un', 'both friends received different versions of the same story': 'les deux amis avaient reçu des versions différentes de la même histoire', 'the old photo proves they remember the promise differently': 'la vieille photo montre qu’ils ne se souviennent pas de la promesse de la même façon', 'the warning came from the friend they had stopped trusting': 'l’avertissement venait de l’ami auquel ils ne faisaient plus confiance', 'the trip was planned as an apology, not an escape': 'le voyage était une demande de pardon, pas une fuite', 'the missing item was returned with a message from years ago': 'l’objet disparu est revenu avec un message ancien', 'the inheritance belongs to the person nobody invited': 'l’héritage revient à la personne que personne n’a invitée', 'the missing parent left a reply addressed to today': 'le parent disparu a laissé une réponse datée d’aujourd’hui', 'the family story was changed to protect a sibling': 'l’histoire familiale a été modifiée pour protéger un enfant', 'the old letter was written by someone everyone thought could not read': 'la lettre a été écrite par quelqu’un que tous croyaient incapable de lire', 'the person asking to sell the house is trying to save it': 'la personne qui veut vendre la maison essaie en réalité de la sauver', 'two relatives have been keeping the same secret from each other': 'deux membres de la famille se cachaient la même vérité', 'the sibling who seemed favored had been covering for the other': 'l’enfant qui semblait favorisé protégeait l’autre', 'their childhood memory belongs to a day neither can explain': 'leur souvenir d’enfance date d’un jour qu’aucun ne peut expliquer', 'the protective lie was told to keep the younger sibling safe': 'le mensonge devait protéger le plus jeune', 'the parent asked both of them to protect the same person': 'leur parent avait demandé aux deux de protéger la même personne', 'the old recording contains both of their voices': 'l’ancien enregistrement contient leurs deux voix', 'the apparent rivalry was arranged by someone else': 'leur rivalité avait été provoquée par quelqu’un d’autre', 'the sender is using a phone that was reported lost tomorrow': 'l’expéditeur utilise un téléphone qui sera déclaré perdu demain', 'the camera shows the recipient sending the warning before it arrived': 'la caméra montre le destinataire envoyer l’avertissement avant de le recevoir', 'the missing person scheduled the messages to arrive in the wrong order': 'la personne disparue avait programmé les messages dans le mauvais ordre', 'the parcel was sent by the person currently asking where it is': 'le colis a été envoyé par la personne qui demande où il se trouve', 'the unknown number belongs to someone already in the chat': 'le numéro inconnu appartient à quelqu’un déjà dans la conversation', 'the supposed witness is watching the same feed from another address': 'le témoin regarde la même caméra depuis une autre adresse', 'the voice note contains a reply recorded after the phone was switched off': 'le vocal contient une réponse enregistrée après l’extinction du téléphone', 'the empty room appears occupied only in the reflection': 'la pièce vide semble occupée uniquement dans le reflet', 'the blocked number is saved under the recipient’s own name': 'le numéro bloqué est enregistré sous le nom du destinataire', 'the figure outside is visible in the photo but not through the window': 'la silhouette apparaît sur la photo, mais pas à la fenêtre', 'the old message describes what they are typing right now': 'l’ancien message décrit exactement ce qu’ils écrivent', 'the camera shows one more person than the room contains': 'la caméra montre une personne de plus que la pièce', 'the embarrassing message was sent to the entire group': 'le message gênant a été envoyé à tout le groupe', 'the apparent disaster was a very elaborate surprise': 'le désastre apparent était une surprise très élaborée', 'the person blamed for the mess was trying to clean it up': 'la personne accusée essayait de réparer les dégâts', 'the mystery parcel contains the thing they just ordered for somebody else': 'le colis contient précisément ce qu’ils venaient de commander pour quelqu’un d’autre', 'the apology was written but never sent': 'les excuses avaient été écrites, mais jamais envoyées', 'the person they blamed had been waiting for them to ask': 'la personne accusée attendait qu’on lui pose la question', 'both sides have been protecting the same memory': 'les deux camps protégeaient le même souvenir', 'the final message came from someone who thought they were forgotten': 'le dernier message venait d’une personne qui se croyait oubliée', 'the evidence was edited by the person who first shared it': 'la preuve avait été modifiée par celui qui l’avait partagée', 'the apparent traitor was covering for the person accusing them': 'le traître apparent protégeait la personne qui l’accusait', 'the secret was revealed to protect somebody else': 'le secret a été révélé pour protéger quelqu’un', 'the warning came from the person they had all agreed to exclude': 'l’avertissement venait de la personne que tous avaient exclue', 'the name on the record belongs to someone still in the family': 'le nom sur le document appartient à quelqu’un qui fait encore partie de la famille', 'the letter was meant for the person who found it, not its named recipient': 'la lettre était destinée à la personne qui l’a trouvée, pas à son destinataire officiel', 'the family has been protecting the wrong version of the story': 'la famille protégeait la mauvaise version de l’histoire', 'the hidden relative has been part of every reunion': 'le parent caché était présent à chaque réunion' },
    resolutions: ['tout mettre à plat avant de décider', 'vérifier les preuves ensemble', 'se retrouver en personne et parler sans détour', 'demander une explication à la bonne personne', 'attendre d’avoir toute la vérité', 'garder la preuve et demander de l’aide', 'dire la vérité avant qu’il ne soit trop tard', 'se donner une dernière chance de s’expliquer'],
    stakes: ['ils risquent de perdre quelqu’un d’important', 'une preuve peut disparaître', 'la mauvaise personne sera accusée', 'un secret va éclater au grand jour', 'une décision irréversible approche', 'il ne reste presque plus de temps'],
    forms: {
      opening: ['Tu es là, {name} ? Il faut que je te parle.', 'J’hésitais à t’écrire, mais {name}, écoute-moi.', '{name}, tu peux garder ça entre nous deux ?'],
      event: ['Je viens de recevoir {event}.', 'Il y a quelque chose qui vient de se passer : {event}.', 'Regarde ce que je viens de trouver : {event}.'],
      question: ['Attends, comment {event} peut arriver maintenant ?', 'Tu es sûr de ce que tu as vu ?', 'Qu’est-ce que tu ne m’as pas encore dit ?'],
      conflict: ['Le vrai problème, c’est que {conflict}.', 'J’aurais dû t’en parler, mais {conflict}.', 'Tout le monde pense que {conflict}.'],
      pressure: ['Si on ne fait rien, {stakes}.', 'On n’a plus beaucoup de temps : {stakes}.', 'Tu comprends ce que ça veut dire ? {stakes}.'],
      twist: ['Sauf qu’on vient de découvrir autre chose : {twist}.', 'Attends… et si {twist} ?', 'Le détail que personne n’avait remarqué : {twist}.'],
      resolution: ['Alors il faut {resolution}.', 'D’accord. Cette fois, on va {resolution}.', 'Je ne sais pas comment ça finira, mais on peut {resolution}.'],
      echo: ['Et si on se trompait depuis le début ?', 'Je viens de voir un détail qui change tout.', 'Ne réponds pas encore. Lis bien la suite.', 'Je savais qu’il manquait une pièce.', 'Promets-moi de ne rien décider tout de suite.'],
    },
    names: ['Camille', 'Inès', 'Lina', 'Nora', 'Maya', 'Adam', 'Noah', 'Yanis', 'Sami', 'Jules'],
    title: ['Le détail oublié', 'Avant ta réponse', 'Ce qu’on ne s’est pas dit', 'La dernière notification', 'Une version de trop', 'Tout était dans le message'],
  },
  en: {
    relations: { couple: 'between two partners', friends: 'between two close friends', family: 'within a family', siblings: 'between siblings', acquaintances: 'between two near-strangers' },
    events: { ex_returns: 'an ex getting back in touch', secret_relationship: 'a relationship kept secret', jealousy: 'a sudden jealous accusation', hidden_message: 'a hidden message', betrayal: 'a suspected betrayal', proposal: 'an unexpected proposal', breakup: 'a breakup sent by text', wrong_recipient: 'a message sent to the wrong person', old_letter: 'a letter found years later', shared_reservation: 'a reservation made for two', broken_promise: 'a promise someone forgot', trip_plan: 'a trip planned in secret', secret_leak: 'a private secret spreading', old_friend_returns: 'an old friend returning', missing_item: 'something that has gone missing', anonymous_warning: 'an anonymous warning', shared_photo: 'a photo sent to the wrong group', unexpected_invitation: 'an unexpected invitation', borrowed_money: 'money borrowed without explanation', inheritance: 'an unexpected inheritance', missing_parent: 'a parent who disappeared', family_meeting: 'a tense family meeting', lost_sibling: 'a sibling lost out of touch', hidden_record: 'a hidden record', unexpected_guest: 'an unexpected guest', old_key: 'an old key', family_photo: 'a troubling family photo', house_sale: 'the family home being sold', childhood_memory: 'a childhood memory that does not match', protective_lie: 'a lie told to protect someone', old_trophy: 'an old childhood trophy', missing_key: 'a missing key', old_recording: 'an old recording', parent_message: 'a message left by a parent', unknown_number: 'a call from an unknown number', surveillance_photo: 'a photo from a security camera', strange_message: 'a strange message', disappearance: 'an unexplained disappearance', mystery_parcel: 'a parcel with no return address', missed_call: 'the same missed call repeating', door_camera: 'a door camera activating by itself', duplicate_key: 'a key copied without permission', live_location: 'a live location from a phone that is switched off', impossible_photo: 'an impossible photo', message_from_past: 'a message sent from the past', empty_house: 'an empty house that seems occupied', blocked_number: 'a blocked number calling again', window_figure: 'a figure behind the window', recorded_voice: 'a voice in a recording', camera_shadow: 'a shadow on a camera feed', locked_room: 'a room locked from the inside', old_birthday: 'a birthday message from someone who is gone', silent_alarm: 'a silent alarm going off' },
    conflicts: { trust: 'they no longer know whom to trust', jealousy: 'jealousy has replaced an honest explanation', distance: 'distance turned silence into rejection', secret: 'a secret keeps everyone from telling the whole truth', timing: 'they are running out of time to decide', misunderstanding: 'they read the same message in two different ways', broken_promise: 'an important promise was broken', inheritance: 'an inheritance is turning relatives against each other', loyalty: 'loyalty means choosing a side', old_grudge: 'an old grudge has come back', protection: 'protecting someone could make the other look guilty', identity: 'nobody knows who really sent the message', deadline: 'they have only minutes to act', missing_evidence: 'the most important evidence is gone', fear: 'fear is keeping them from checking what they saw', betrayal: 'someone has broken their trust' },
    twists: { 'the apparent betrayal was a surprise': 'the apparent betrayal was actually a surprise', 'the ex came back to return evidence, not rekindle the relationship': 'the ex came back to return evidence, not restart the relationship', 'both partners were hiding the same truth': 'both partners were hiding the same truth', 'the proposal was meant for somebody else': 'the proposal was meant for someone else', 'an old message was sent automatically years later': 'an old message was delivered automatically years later', 'the jealous friend staged the misunderstanding': 'the jealous friend staged the misunderstanding', 'the friend who seemed to betray them was protecting someone': 'the friend who seemed to betray them was protecting someone', 'both friends received different versions of the same story': 'both friends were sent different versions of the same story', 'the old photo proves they remember the promise differently': 'the old photo proves they remember the promise differently', 'the warning came from the friend they had stopped trusting': 'the warning came from the friend they had stopped trusting', 'the trip was planned as an apology, not an escape': 'the trip was planned as an apology, not an escape', 'the missing item was returned with a message from years ago': 'the missing item came back with a message from years ago', 'the inheritance belongs to the person nobody invited': 'the inheritance belongs to the person nobody invited', 'the missing parent left a reply addressed to today': 'the missing parent left a reply dated today', 'the family story was changed to protect a sibling': 'the family story was changed to protect a sibling', 'the old letter was written by someone everyone thought could not read': 'the old letter was written by someone everyone thought could not read', 'the person asking to sell the house is trying to save it': 'the person trying to sell the house is actually trying to save it', 'two relatives have been keeping the same secret from each other': 'two relatives have been keeping the same secret from each other', 'the sibling who seemed favored had been covering for the other': 'the sibling who seemed favored had been covering for the other', 'their childhood memory belongs to a day neither can explain': 'their childhood memory belongs to a day neither can explain', 'the protective lie was told to keep the younger sibling safe': 'the lie was told to keep the younger sibling safe', 'the parent asked both of them to protect the same person': 'their parent asked them both to protect the same person', 'the old recording contains both of their voices': 'the old recording contains both of their voices', 'the apparent rivalry was arranged by someone else': 'someone else set up their rivalry', 'the sender is using a phone that was reported lost tomorrow': 'the sender is using a phone that will be reported lost tomorrow', 'the camera shows the recipient sending the warning before it arrived': 'the camera shows the recipient sending the warning before it arrived', 'the missing person scheduled the messages to arrive in the wrong order': 'the missing person scheduled the messages in the wrong order', 'the parcel was sent by the person currently asking where it is': 'the parcel was sent by the very person asking where it is', 'the unknown number belongs to someone already in the chat': 'the unknown number belongs to someone already in the chat', 'the supposed witness is watching the same feed from another address': 'the supposed witness is watching the same feed from another address', 'the voice note contains a reply recorded after the phone was switched off': 'the voice note contains a reply recorded after the phone was switched off', 'the empty room appears occupied only in the reflection': 'the empty room looks occupied only in the reflection', 'the blocked number is saved under the recipient’s own name': 'the blocked number is saved under the recipient’s own name', 'the figure outside is visible in the photo but not through the window': 'the figure appears in the photo but not outside the window', 'the old message describes what they are typing right now': 'the old message describes exactly what they are typing', 'the camera shows one more person than the room contains': 'the camera shows one more person than the room contains', 'the embarrassing message was sent to the entire group': 'the embarrassing message went to the whole group', 'the apparent disaster was a very elaborate surprise': 'the apparent disaster was an elaborate surprise', 'the person blamed for the mess was trying to clean it up': 'the person blamed for the mess was trying to clean it up', 'the mystery parcel contains the thing they just ordered for somebody else': 'the parcel contains exactly what they just ordered for someone else', 'the apology was written but never sent': 'the apology was written but never sent', 'the person they blamed had been waiting for them to ask': 'the person they blamed was waiting for them to ask', 'both sides have been protecting the same memory': 'both sides were protecting the same memory', 'the final message came from someone who thought they were forgotten': 'the final message came from someone who thought they were forgotten', 'the evidence was edited by the person who first shared it': 'the evidence was edited by the person who first shared it', 'the apparent traitor was covering for the person accusing them': 'the apparent traitor was protecting the person accusing them', 'the secret was revealed to protect somebody else': 'the secret was revealed to protect someone else', 'the warning came from the person they had all agreed to exclude': 'the warning came from the person everyone had agreed to exclude', 'the name on the record belongs to someone still in the family': 'the name on the record belongs to someone still in the family', 'the letter was meant for the person who found it, not its named recipient': 'the letter was meant for the person who found it, not the named recipient', 'the family has been protecting the wrong version of the story': 'the family has been protecting the wrong version of the story', 'the hidden relative has been part of every reunion': 'the hidden relative has been at every reunion' },
    resolutions: ['tell each other everything before deciding', 'check the evidence together', 'meet in person and speak honestly', 'ask the right person for an explanation', 'wait until they know the whole truth', 'keep the evidence and get help', 'tell the truth before it is too late', 'give each other one last chance to explain'],
    stakes: ['they could lose someone important', 'the evidence could disappear', 'the wrong person will be blamed', 'a secret will become public', 'an irreversible decision is close', 'they are almost out of time'],
    forms: {
      opening: ['Are you there, {name}? I need to tell you something.', 'I almost didn’t text you, {name}, but listen.', '{name}, can you keep this between us?'],
      event: ['I just got {event}.', 'Something just happened: {event}.', 'Look what I just found: {event}.'],
      question: ['Wait, how could {event} happen now?', 'Are you sure you saw that?', 'What haven’t you told me yet?'],
      conflict: ['The real problem is that {conflict}.', 'I should have told you, but {conflict}.', 'Everyone thinks that {conflict}.'],
      pressure: ['If we do nothing, {stakes}.', 'We are running out of time: {stakes}.', 'Do you understand what that means? {stakes}.'],
      twist: ['But we just found out something else: {twist}.', 'Wait… what if {twist}?', 'The detail nobody noticed is that {twist}.'],
      resolution: ['Then we need to {resolution}.', 'Okay. This time, let’s {resolution}.', 'I don’t know how this ends, but we can {resolution}.'],
      echo: ['What if we have been wrong from the start?', 'I just noticed something that changes everything.', 'Don’t answer yet. Read the next part.', 'I knew one piece was missing.', 'Promise me you won’t decide yet.'],
    },
    names: ['Maya', 'Nora', 'Lena', 'Sofia', 'Alex', 'Noah', 'Sam', 'Jordan', 'Riley', 'Eli'],
    title: ['The Missing Detail', 'Before You Reply', 'What We Never Said', 'One Last Notification', 'The Other Version', 'It Was in the Message'],
  },
};

const phraseOverrides = {
  it: {
    relations: { couple: 'tra due partner', friends: 'tra due amici stretti', family: 'in famiglia', siblings: 'tra fratelli', acquaintances: 'tra due persone quasi sconosciute' },
    genericEvent: 'un evento imprevisto',
    genericConflict: 'la fiducia è stata messa alla prova',
    twistForms: ['{event} è legato a {conflict}', 'la sorpresa è che {event} ha a che fare con {conflict}'],
    events: { unknown_number: 'una chiamata da un numero sconosciuto', strange_message: 'un messaggio strano', wrong_recipient: 'un messaggio inviato alla persona sbagliata', old_letter: 'una lettera ritrovata', hidden_message: 'un messaggio nascosto', proposal: 'una proposta inaspettata', ex_returns: 'il ritorno improvviso di un ex', inheritance: 'un’eredità inaspettata', family_photo: 'una foto di famiglia inquietante', impossible_photo: 'una foto impossibile', message_from_past: 'un messaggio arrivato dal passato', empty_house: 'una casa vuota che sembra abitata', recorded_voice: 'una voce in un messaggio vocale', trip_plan: 'un viaggio organizzato di nascosto', broken_promise: 'una promessa dimenticata', shared_secret: 'un segreto condiviso', old_recording: 'una vecchia registrazione' },
    conflicts: { trust: 'non sanno più di chi fidarsi', jealousy: 'la gelosia ha preso il posto delle spiegazioni', secret: 'un segreto impedisce a tutti di dire la verità', distance: 'la distanza ha trasformato il silenzio in un rifiuto', deadline: 'hanno pochissimo tempo per decidere', misunderstanding: 'hanno interpretato lo stesso messaggio in due modi diversi', loyalty: 'la lealtà li costringe a scegliere da che parte stare', fear: 'la paura impedisce loro di verificare quello che hanno visto' },
  },
  'pt-BR': {
    relations: { couple: 'entre duas pessoas apaixonadas', friends: 'entre dois amigos próximos', family: 'dentro da família', siblings: 'entre irmãos', acquaintances: 'entre duas pessoas que mal se conhecem' },
    genericEvent: 'uma coisa inesperada',
    genericConflict: 'a confiança entre eles foi abalada',
    twistForms: ['{event} tem ligação com {conflict}', 'o surpreendente é que {event} está ligado a {conflict}'],
    events: { unknown_number: 'uma ligação de um número desconhecido', strange_message: 'uma mensagem estranha', wrong_recipient: 'uma mensagem enviada para a pessoa errada', old_letter: 'uma carta encontrada anos depois', hidden_message: 'uma mensagem escondida', proposal: 'um pedido inesperado', ex_returns: 'a volta inesperada de um ex', inheritance: 'uma herança inesperada', family_photo: 'uma foto de família preocupante', impossible_photo: 'uma foto impossível', message_from_past: 'uma mensagem enviada do passado', empty_house: 'uma casa vazia que parece ocupada', recorded_voice: 'uma voz numa mensagem de áudio', trip_plan: 'uma viagem planejada em segredo', broken_promise: 'uma promessa esquecida', shared_secret: 'um segredo compartilhado', old_recording: 'uma gravação antiga' },
    conflicts: { trust: 'ninguém sabe mais em quem confiar', jealousy: 'o ciúme tomou o lugar de uma conversa sincera', secret: 'um segredo impede todos de contar a verdade', distance: 'a distância transformou o silêncio em rejeição', deadline: 'eles têm pouco tempo para decidir', misunderstanding: 'cada um entendeu a mesma mensagem de um jeito', loyalty: 'a lealdade obriga alguém a escolher um lado', fear: 'o medo impede que confiram o que viram' },
  },
  'ar-TN': {
    relations: { couple: 'bin zouz y7ebbou fi ba3dhhom', friends: 'bin zouz s7ab 9rab', family: 'fi la famille', siblings: 'bin khou w okhtou', acquaintances: 'bin zouz ma ya3rfouch ba3dhhom barcha' },
    genericEvent: 'haja ma ken 7ad yestanna fiha',
    genericConflict: 'el thi9a binethom tkhalltet',
    twistForms: ['{event} 3andou 3ale9a b {conflict}', '{event} merbout b {conflict}'],
    events: { unknown_number: 'appel men numro ma ya3rfouhouch', strange_message: 'message ghrib', wrong_recipient: 'message temchi l ghalet', old_letter: 'maktoob l9awh ba3d snin', hidden_message: 'message mkhabbi', proposal: 'taleb ma kenouch yestannaw fih', ex_returns: 'ex yraja3 yeb3ath', inheritance: 'mirath ma kenouch yestannaw fih', family_photo: 'taswira 3aylia tkhawwef', impossible_photo: 'taswira mosta7ila', message_from_past: 'message jay men el mechi', empty_house: 'dar fergha ama fama chkoun fiha', recorded_voice: 'sout fi vocal', trip_plan: 'voyage mratbinou fel secret', broken_promise: 'wa3d ma t3addach bih', shared_secret: 'ser y9assmouh zouz', old_recording: 'vocal 9dim' },
    conflicts: { trust: 'ma3adech ya3rfou chkoun yeth9ou fih', jealousy: 'el ghira blaset el 7keya sra7a', secret: 'ser man3homch y9oulou el 7a9', distance: 'el b3id khalla esskot yban refus', deadline: 'ma b9alhomch barcha wa9t', misunderstanding: 'kol we7ed fhema el message b tari9a', loyalty: 'el wafa y5ayyerhom m3a chkoun', fear: 'el khouf man3homch yet2akdou chnowa choufou' },
  },
  'ar-DZ': {
    relations: { couple: 'bin zouj y7ebbou ba3dhahom', friends: 'bin zouj s7ab 9rab', family: 'f la famille', siblings: 'bin khou w khto', acquaintances: 'bin zouj ma y3erfouch ba3dahom mlih' },
    genericEvent: 'haja ma kan 7ed yestennaha',
    genericConflict: 'thi9a binathom ma b9atch kif bekri',
    twistForms: ['{event} 3andha 3ala9a b {conflict}', '{event} merbouta b {conflict}'],
    events: { unknown_number: 'appel men numero ma y3erfouhch', strange_message: 'message gharib', wrong_recipient: 'message rah l ghalet', old_letter: 'maktoub l9awh ba3d snin', hidden_message: 'message mkhabi', proposal: 'talab ma kanouch yestennaw fih', ex_returns: 'ex rja3 yeb3at', inheritance: 'mirath ma kanouch yestennaw fih', family_photo: 'tswira ta3 la famille tkhawwef', impossible_photo: 'tswira ma tetsed9ch', message_from_past: 'message jay men zman', empty_house: 'dar khawya bsah kayen wahed fiha', recorded_voice: 'sout f vocal', trip_plan: 'voyage dayerineh f secret', broken_promise: 'wa3d ma wfach bih', shared_secret: 'ser y9asmo fih zouj', old_recording: 'enregistrement 9dim' },
    conflicts: { trust: 'ma b9awch y3erfou chkon yeth9ou fih', jealousy: 'lghira bdat tghatti 3la lhedra sra7a', secret: 'ser man3homch y9oulou l7a9', distance: 'lbo3d khalla skout yban refus', deadline: 'ma b9alhomch wa9t', misunderstanding: 'kol wahed fhema nafs message b tari9a', loyalty: 'l wafa ykhayyerhom m3a chkon', fear: 'lkhouf man3homch yet2ekdou wach chafou' },
  },
  'ar-MA': {
    relations: { couple: 'bin jouj kaybghiw b3dyathom', friends: 'bin jouj s7ab 9rab', family: 'f la famille', siblings: 'bin khou w khto', acquaintances: 'bin jouj ma kay3rfouch b3dyathom mzyan' },
    genericEvent: 'chi haja ma kantch f l7esban',
    genericConflict: 'ti9a mab9atch binathom kif lwel',
    twistForms: ['{event} 3ando 3ala9a b {conflict}', '{event} merbout b {conflict}'],
    events: { unknown_number: 'appel mn numéro ma kay3rfouhch', strange_message: 'message gharib', wrong_recipient: 'message mcha l ghalet', old_letter: 'mektoub l9awh mn ba3d snin', hidden_message: 'message mkhbi', proposal: 'talab ma kanouch kaytsennaw fih', ex_returns: 'ex rje3 kayb3at', inheritance: 'mirat ma kanouch kaytsennaw fih', family_photo: 'tswira dyal la famille katkhwef', impossible_photo: 'tswira mosta7ila', message_from_past: 'message jay mn zman', empty_house: 'dar khawya walakin kayban fiha chi wa7ed', recorded_voice: 'sout f vocal', trip_plan: 'voyage mratab f secret', broken_promise: 'wa3d ma t7fedch', shared_secret: 'ser m9ssoum binathom', old_recording: 'enregistrement 9dim' },
    conflicts: { trust: 'ma b9awch 3arfin fmen yti9o', jealousy: 'lghira blassat lhedra b sra7a', secret: 'ser man3homch y9olo l7a9 kamel', distance: 'lbo3d khla skout yban b7al refus', deadline: 'ma b9a lihomch lwa9t', misunderstanding: 'kol wa7ed fhema nafs message b tari9a', loyalty: 'l wafa khas ykhtar m3a men', fear: 'lkhouf man3homch yt2ekdo mn dakchi li chafou' },
  },
  'ar-EG': {
    relations: { couple: 'بين اتنين بيحبوا بعض', friends: 'بين صاحبين قريبين', family: 'جوه العيلة', siblings: 'بين أخ وأخته', acquaintances: 'بين اتنين ما يعرفوش بعض كويس' },
    genericEvent: 'حاجة محدش كان متوقعها',
    genericConflict: 'الثقة بينهم اتأثرت',
    twistForms: ['{event} طلع له علاقة بـ {conflict}', '{event} مرتبط بـ {conflict}'],
    events: { unknown_number: 'مكالمة من رقم غريب', strange_message: 'رسالة غريبة', wrong_recipient: 'رسالة اتبعتت للشخص الغلط', old_letter: 'جواب اتلاقى بعد سنين', hidden_message: 'رسالة مستخبية', proposal: 'طلب مفاجئ', ex_returns: 'رجوع حبيب قديم', inheritance: 'ميراث محدش كان متوقعه', family_photo: 'صورة عائلية مقلقة', impossible_photo: 'صورة مستحيل تكون حقيقية', message_from_past: 'رسالة جاية من الماضي', empty_house: 'بيت فاضي بس باين إن حد عايش فيه', recorded_voice: 'صوت في رسالة صوتية', trip_plan: 'رحلة مترتبة في السر', broken_promise: 'وعد اتنسي', shared_secret: 'سر مشترك بينهم', old_recording: 'تسجيل قديم' },
    conflicts: { trust: 'مبقوش عارفين يثقوا في مين', jealousy: 'الغيرة خلتهم يبطلوا يتكلموا بصراحة', secret: 'سر مانعهم يقولوا الحقيقة كلها', distance: 'البُعد خلّى السكوت يبان كأنه رفض', deadline: 'معاهم وقت قليل يقرروا', misunderstanding: 'كل واحد فهم نفس الرسالة بطريقة مختلفة', loyalty: 'الوفاء مخليهم يختاروا صف مين', fear: 'الخوف مانعهم يتأكدوا من اللي شافوه' },
  },
};

const clearFrenchArcs = {
  amour: {
    ex_returns: { hook: 'Ton ex vient de m’écrire : il veut te revoir ce soir.', reply: 'Pourquoi mon ex t’écrit à toi ?', context: 'Il dit qu’il a retrouvé ton bracelet chez lui et qu’il veut te le rendre.', evidence: 'Sur la photo, on voit bien ton bracelet dans sa boîte aux lettres.', twist: 'Il a aussi écrit qu’il ne veut pas reprendre votre relation : il voulait seulement rendre le bracelet.' },
    secret_relationship: { hook: 'Ma sœur vient de découvrir que nous sommes en couple.', reply: 'Comment a-t-elle trouvé nos messages ?', context: 'Elle a publié une photo de nous deux sur son compte public hier.', evidence: 'La photo est encore visible sur le compte public de ma sœur.', twist: 'Elle ne veut pas nous séparer : elle a publié la photo pour nous aider à l’annoncer à nos parents.' },
    jealousy: { hook: 'Tu m’as envoyé une photo de moi avec mon ex et tu crois que je te trompe.', reply: 'La photo date d’hier soir. Pourquoi tu étais avec lui ?', context: 'Je l’ai croisé au café et il m’a rendu le livre que je lui avais prêté.', evidence: 'L’heure sur le reçu du café correspond à la photo.', twist: 'Mon ex t’a envoyé la photo lui-même pour te faire croire à une tromperie.' },
    hidden_message: { hook: 'J’ai reçu un ancien message de toi qui dit que tu voulais me demander pardon.', reply: 'Je ne t’ai jamais envoyé ce message. Tu peux me le montrer ?', context: 'Il est daté du soir où nous nous sommes disputés, mais je ne l’avais jamais reçu.', evidence: 'Le journal du téléphone montre que le message était resté en brouillon.', twist: 'Ton téléphone a envoyé le vieux brouillon aujourd’hui en restaurant la sauvegarde.' },
    betrayal: { hook: 'J’ai vu un message qui laisse croire que tu me trompes.', reply: 'Quel message ? Montre-le-moi, s’il te plaît.', context: 'Il vient d’un numéro qui utilise mon nom et ma photo.', evidence: 'Le numéro n’est pas le mien et la photo vient de mon profil public.', twist: 'C’est mon ami qui a créé ce faux compte pour nous faire rompre.' },
    proposal: { hook: 'J’ai trouvé une bague dans la poche de ta veste.', reply: 'Tu l’as trouvée ? Je voulais te demander en mariage ce soir.', context: 'Mais la boîte est vide et la bague n’est plus là.', evidence: 'Le ticket montre que la bague a été déposée chez le bijoutier pour être ajustée.', twist: 'La bague n’a pas disparu : le bijoutier l’a gardée pour la graver avec ton prénom.' },
    breakup: { hook: 'Tu viens de m’envoyer un message pour mettre fin à notre relation.', reply: 'Je n’ai rien envoyé. Tu peux me montrer le message ?', context: 'Il est parti de mon compte pendant que mon téléphone était chez le réparateur.', evidence: 'Le réparateur confirme qu’il a réinitialisé mon téléphone ce matin.', twist: 'Le message de rupture était un vieux brouillon qui s’est envoyé pendant la restauration.' },
    wrong_recipient: { hook: 'Tu m’as envoyé par erreur un message destiné à ton ex.', reply: 'Je ne voulais pas lui écrire. Qu’est-ce que tu as reçu ?', context: 'Le message dit : “Tu me manques, retrouve-moi à 20 h”.', evidence: 'La capture montre que le message est parti dans notre conversation, pas dans la sienne.', twist: 'Le message était pour moi : j’avais enregistré mon numéro sous le mauvais nom.' },
    old_letter: { hook: 'J’ai retrouvé la lettre d’amour que tu m’avais écrite avant notre première rencontre.', reply: 'Je croyais l’avoir perdue. Où l’as-tu trouvée ?', context: 'Elle était dans le livre que tu m’avais offert hier.', evidence: 'La lettre porte la date du jour où nous nous sommes rencontrés.', twist: 'Tu l’avais cachée dans ce livre pour me la faire retrouver le jour de notre anniversaire.' },
    shared_reservation: { hook: 'J’ai reçu une réservation pour deux à notre nom, mais je ne l’ai pas faite.', reply: 'La réservation est pour quel endroit ?', context: 'C’est le restaurant où nous avons eu notre premier rendez-vous, ce soir à 20 h.', evidence: 'Le restaurant confirme qu’elle a été réservée depuis ton adresse e-mail.', twist: 'Tu l’avais réservée il y a un mois pour me faire une surprise, puis tu l’avais oubliée.' },
  },
  suspense: {
    unknown_number: { hook: 'Un numéro inconnu vient de m’envoyer une photo de ta porte prise il y a une minute.', reply: 'Je suis chez moi et je n’ai personne devant la porte.', context: 'La photo montre une enveloppe posée sur ton paillasson.', evidence: 'La caméra de l’entrée confirme que personne n’a sonné.', twist: 'L’expéditeur est le livreur : il a envoyé la photo au mauvais numéro.' },
    surveillance_photo: { hook: 'La caméra du parking montre ta voiture ici à minuit, alors que tu étais avec moi.', reply: 'C’est impossible, j’avais mes clés dans ma poche.', context: 'Sur la photo, quelqu’un conduit une voiture de la même couleur.', evidence: 'Le numéro de plaque sur l’image n’est pas le tien.', twist: 'La caméra a confondu ta voiture avec celle de ton voisin, qui a la même couleur.' },
    strange_message: { hook: 'Le gardien vient de m’écrire : “N’ouvre pas la porte à 21 h”.', reply: 'Pourquoi le gardien me demande de ne pas ouvrir ?', context: 'Il est 20 h 58 et je n’attends personne ce soir.', evidence: 'Le gardien confirme qu’il a envoyé ce message à notre appartement.', twist: 'Il voulait prévenir le voisin d’une livraison tardive et a envoyé son avertissement au mauvais appartement.' },
    disappearance: { hook: 'Lina n’est pas rentrée et son téléphone est éteint depuis deux heures.', reply: 'Elle devait me rejoindre au café à 18 h, mais elle n’est jamais arrivée.', context: 'Son dernier message disait qu’elle avait raté le bus.', evidence: 'Le chauffeur confirme qu’elle est descendue à l’arrêt près de chez elle.', twist: 'Lina est chez sa sœur : son téléphone est tombé en panne et elle n’a pas pu prévenir.' },
    wrong_recipient: { hook: 'Un inconnu vient de m’écrire : “Le sac est sous le banc, prends-le avant 20 h”.', reply: 'Tu connais cette personne ? Le message parle de quel sac ?', context: 'Il vient d’arriver dans notre conversation par erreur.', evidence: 'L’expéditeur vient de répondre qu’il attend son frère au parc.', twist: 'Le sac contient seulement son ordinateur oublié; il s’est trompé de conversation.' },
    mystery_parcel: { hook: 'Un colis sans expéditeur vient d’arriver à ton nom.', reply: 'Je n’ai rien commandé. Tu peux lire l’étiquette ?', context: 'L’étiquette indique qu’il a été envoyé depuis notre ancienne adresse.', evidence: 'Le suivi montre qu’il est resté dans un dépôt pendant trois ans.', twist: 'C’est le colis que tu avais envoyé à ta sœur et qui vient d’être retourné.' },
    missed_call: { hook: 'J’ai reçu trois appels manqués du même numéro en dix minutes.', reply: 'Rappelle-le. C’est peut-être urgent.', context: 'Le numéro est celui du cabinet médical où notre père avait rendez-vous.', evidence: 'Le message vocal demande seulement de confirmer son prochain rendez-vous.', twist: 'Notre père va bien : le cabinet appelait pour déplacer l’heure du rendez-vous.' },
    door_camera: { hook: 'La caméra de ta porte montre quelqu’un qui a laissé une clé devant chez toi.', reply: 'Je n’attends personne et je n’ai perdu aucune clé.', context: 'La personne est repartie sans frapper ni regarder la caméra.', evidence: 'La clé ouvre la boîte aux lettres, pas la porte de l’appartement.', twist: 'C’est le facteur : il a laissé la clé du voisin dans la mauvaise entrée.' },
    duplicate_key: { hook: 'J’ai trouvé une copie de ta clé sous le paillasson.', reply: 'J’ai perdu ma clé hier, mais je n’en ai fait aucune copie.', context: 'Une personne pourrait être entrée pendant notre absence.', evidence: 'Le serrurier confirme que la copie est ancienne et ne correspond pas à ta serrure actuelle.', twist: 'La clé appartenait à l’ancien locataire et n’ouvre plus la porte.' },
    live_location: { hook: 'Ta position en direct bouge alors que ton téléphone est éteint.', reply: 'Je suis avec toi. Mon téléphone est bien éteint.', context: 'La carte montre un trajet autour de la gare, commencé il y a dix minutes.', evidence: 'La position partagée est celle de ma tablette, restée dans le train.', twist: 'La localisation n’était pas celle de ton téléphone : l’application suivait encore la tablette.' },
  },
  famille: {
    inheritance: { hook: 'Le notaire vient d’annoncer que la maison de mamie revient à notre cousin Hugo.', reply: 'Pourquoi Hugo hériterait-il de la maison ?', context: 'Le testament a été signé la semaine dernière, mais mamie ne nous en a jamais parlé.', evidence: 'Le notaire a une lettre de mamie qui explique sa décision.', twist: 'Mamie a choisi Hugo parce qu’il s’occupe de la maison depuis des années, pas parce qu’elle voulait nous écarter.' },
    missing_parent: { hook: 'Papa n’est pas rentré et il a laissé son téléphone à la maison.', reply: 'Il devait aller à la pharmacie, je l’appelle depuis une heure.', context: 'Sur la table, il a laissé un reçu avec l’adresse d’un café.', evidence: 'Le serveur confirme qu’il est parti il y a vingt minutes pour rentrer à pied.', twist: 'Papa est chez notre tante : son téléphone est resté à charger et il a oublié de nous prévenir.' },
    old_letter: { hook: 'J’ai trouvé une lettre de maman cachée dans le tiroir de la cuisine.', reply: 'Pourquoi maman aurait caché une lettre à la famille ?', context: 'Elle est datée du jour où nous avons quitté notre ancienne maison.', evidence: 'La lettre explique qu’elle avait gardé la clé de cette maison pour nous.', twist: 'Maman voulait nous faire retrouver la maison pour notre réunion de famille.' },
    family_meeting: { hook: 'La réunion de dimanche est annulée : oncle Karim dit que personne ne veut venir.', reply: 'Je n’ai jamais dit ça. Qui lui a raconté cette histoire ?', context: 'Il a reçu un message disant que nous ne voulions plus le voir.', evidence: 'Le message a été envoyé depuis le vieux téléphone de grand-père.', twist: 'Grand-père avait programmé ce message avant de perdre son téléphone; personne ne voulait annuler la réunion.' },
    lost_sibling: { hook: 'Une femme vient de m’écrire qu’elle pense être notre sœur.', reply: 'Nos parents ne nous ont jamais parlé d’une autre sœur.', context: 'Elle dit avoir trouvé le nom de notre mère sur son acte de naissance.', evidence: 'La date et la ville correspondent à l’année où maman vivait seule.', twist: 'Maman l’a fait adopter jeune et attendait le bon moment pour nous en parler.' },
    hidden_record: { hook: 'J’ai trouvé un acte de naissance avec le nom de notre famille dans le grenier.', reply: 'Il y a un autre enfant dans la famille ?', context: 'Le document est caché dans la boîte de photos de grand-père.', evidence: 'La date correspond à l’année où notre tante a vécu chez lui.', twist: 'C’est l’acte de naissance de notre cousine; grand-père gardait ses papiers pour l’aider.' },
    unexpected_guest: { hook: 'Un homme que personne ne connaît vient de sonner chez mamie et dit être son fils.', reply: 'Mamie n’a jamais parlé d’un autre fils. Elle est au courant ?', context: 'Il dit qu’il n’est pas venu pour l’argent, seulement pour la voir.', evidence: 'Il a la même photo d’enfance que celle que mamie garde dans son salon.', twist: 'C’est le fils d’une amie de mamie; elle l’a élevé comme un neveu pendant des années.' },
    old_key: { hook: 'J’ai trouvé une vieille clé scotchée derrière le portrait de grand-père.', reply: 'Tu sais quelle porte elle ouvre ?', context: 'Au dos, grand-père a écrit l’adresse de notre ancienne maison.', evidence: 'La clé ouvre le petit coffre qui était resté dans la cave.', twist: 'Dans le coffre, il avait laissé des photos de famille et une lettre pour nous.' },
    family_photo: { hook: 'La vieille photo de famille montre une petite fille que personne ne reconnaît.', reply: 'Elle est juste à côté de maman. Tu as agrandi la photo ?', context: 'Au dos, quelqu’un a écrit le prénom “Nadia” et la date de 1998.', evidence: 'Tante Nadia confirme qu’elle gardait notre cousine ce jour-là.', twist: 'La petite fille est notre cousine; elle venait souvent chez nous quand elle était bébé.' },
    house_sale: { hook: 'Maman a mis la maison de famille en vente sans nous prévenir.', reply: 'Pourquoi vendrait-elle la maison de grand-père ?', context: 'Un acheteur vient la visiter demain matin.', evidence: 'Les factures montrent que maman paie seule les réparations depuis des années.', twist: 'Maman voulait vendre pour payer les soins de grand-père, pas pour effacer nos souvenirs.' },
  },
};

const localForms = {
  it: {
    forms: {
      opening: ['Ci sei, {name}? Devo dirti una cosa.', 'Stavo per non scriverti, {name}, ma ascolta.', '{name}, puoi tenere questa cosa tra noi?'],
      event: ['Guarda cosa ho appena trovato: {event}.', 'È successo qualcosa: {event}.', 'Guarda un po’: {event}.'],
      question: ['Aspetta, com’è possibile che {event} succeda proprio adesso?', 'Sei sicuro di quello che hai visto?', 'Che cosa non mi hai ancora detto?'],
      conflict: ['Il vero problema è che {conflict}.', 'Avrei dovuto parlartene, ma {conflict}.', 'Tutti pensano che {conflict}.'],
      pressure: ['Se non facciamo niente, {stakes}.', 'Il tempo sta per scadere: {stakes}.', 'Capisci cosa vuol dire? {stakes}.'],
      twist: ['Ma abbiamo appena scoperto un’altra cosa: {twist}.', 'Aspetta… e se {twist}?', 'Il dettaglio che non tornava è questo: {twist}.'],
      resolution: ['Allora dobbiamo {resolution}.', 'Va bene. Stavolta dobbiamo {resolution}.', 'Non so come finirà, ma possiamo {resolution}.'],
      echo: ['E se ci fossimo sbagliati fin dall’inizio?', 'Ho appena notato un dettaglio che cambia tutto.', 'Non rispondere ancora. Leggi bene il seguito.', 'Sapevo che mancava un pezzo.', 'Promettimi che non deciderai adesso.'],
    },
    resolutions: ['dirci tutta la verità prima di decidere', 'controllare le prove insieme', 'incontrarci e parlare senza nascondere niente', 'chiedere spiegazioni alla persona giusta', 'aspettare di conoscere tutta la verità', 'conservare le prove e chiedere aiuto', 'dire la verità prima che sia troppo tardi', 'darci un’ultima possibilità di spiegare'],
    stakes: ['potrebbero perdere una persona importante', 'le prove potrebbero sparire', 'verrà accusata la persona sbagliata', 'un segreto diventerà pubblico', 'una decisione irreversibile è vicina', 'è rimasto pochissimo tempo'],
    names: ['Giulia', 'Sofia', 'Marta', 'Nora', 'Luca', 'Noah', 'Marco', 'Andrea', 'Elia', 'Sam'],
    title: ['Il dettaglio mancante', 'Prima della risposta', 'Quello che non abbiamo detto', 'L’ultima notifica', 'L’altra versione', 'Era tutto nel messaggio'],
  },
  'pt-BR': {
    forms: {
      opening: ['Tá aí, {name}? Preciso te contar uma coisa.', 'Quase não te mandei mensagem, {name}, mas escuta.', '{name}, promete que isso fica entre a gente?'],
      event: ['Acabei de receber {event}.', 'Aconteceu uma coisa agora: {event}.', 'Olha o que eu acabei de encontrar: {event}.'],
      question: ['Peraí, como {event} aconteceu justo agora?', 'Você tem certeza do que viu?', 'O que você ainda não me contou?'],
      conflict: ['O problema é que {conflict}.', 'Eu devia ter te contado, mas {conflict}.', 'Todo mundo acha que {conflict}.'],
      pressure: ['Se a gente não fizer nada, {stakes}.', 'O tempo tá acabando: {stakes}.', 'Você entende o que isso quer dizer? {stakes}.'],
      twist: ['Só que a gente acabou de descobrir outra coisa: {twist}.', 'Peraí… e se {twist}?', 'A coisa que não encaixa é esta: {twist}.'],
      resolution: ['Então a gente precisa {resolution}.', 'Tá bom. Dessa vez, vamos {resolution}.', 'Não sei como isso termina, mas dá pra {resolution}.'],
      echo: ['E se a gente estiver errado desde o começo?', 'Acabei de notar um detalhe que muda tudo.', 'Não responde ainda. Lê o resto com atenção.', 'Eu sabia que faltava uma parte.', 'Promete que você não vai decidir agora.'],
    },
    resolutions: ['contar tudo antes de tomar uma decisão', 'conferir as provas juntos', 'se encontrar e conversar sem esconder nada', 'pedir uma explicação pra pessoa certa', 'esperar até saber a verdade inteira', 'guardar as provas e pedir ajuda', 'contar a verdade antes que seja tarde', 'dar mais uma chance pra cada um se explicar'],
    stakes: ['eles podem perder alguém importante', 'as provas podem desaparecer', 'a pessoa errada vai levar a culpa', 'um segredo vai se tornar público', 'uma decisão sem volta está chegando', 'quase não resta tempo'],
    names: ['Bia', 'Sofia', 'Luna', 'Nina', 'Rafa', 'Caio', 'Noah', 'Duda', 'Léo', 'Sam'],
    title: ['O Detalhe Esquecido', 'Antes da Resposta', 'O Que a Gente Não Disse', 'A Última Notificação', 'A Outra Versão', 'Estava na Mensagem'],
  },
};

const dialectForms = {
  'ar-TN': {
    forms: {
      opening: ['Fama, {name}? Lezem n9ollek haja.', 'Ma 7abitech neb3athlek, ama esma3.', '{name}, tnajem tkhalli hedha binetna?'],
      event: ['Taw jeni {event}.', 'Saret haja taw: {event}.', 'Chouf chnowa l9it: {event}.'],
      question: ['Stanna, kifech {event} saret taw?', 'Met2aked chnowa chouft?', 'Chnowa mazelt ma 9oltlich?'],
      conflict: ['El mochkel el s7i7 howa elli {conflict}.', 'Lazemni 9othelk, ama {conflict}.', 'Kol wahed y9oul elli {conflict}.'],
      pressure: ['Ken ma na3mlou chay, {stakes}.', 'Ma b9alnach barcha wa9t: {stakes}.', 'Fhemt chnowa ya3ni hedha? {stakes}.'],
      twist: ['Ama taw fhemna haja okhra: {twist}.', 'Stanna… w ken {twist}?', 'El detail elli ma raddouch belhom, howa elli {twist}.'],
      resolution: ['Donc lezem {resolution}.', 'Mela, taw {resolution}.', 'Ma na3refch kifech toufa, ama najmou {resolution}.'],
      echo: ['W ken ghalet men lowel?', 'Taw chadit detail tbadel kol chay.', 'Ma tjewbech taw. E9ra el ba9i.', 'Kont 3aref elli fama haja ne9sa.', 'O3edni ma ta3mel 7atta 9arar taw.'],
    },
    resolutions: ['na7kiw kol chay 9bal ma n9arrrou', 'net2akdou mel dalil m3a ba3dhna', 'net9ablou w na7kiw b sra7a', 'nes2lou el ensen es7i7', 'nestannaw 7atta na3rfou el 7a9i9a kemla', 'na7fdhou el dalil w netlobou mosa3da', 'n9oulou el 7a9 9bal ma yfout el wa9t', 'na3tiw ba3dhna forsa bech nfahmou'],
    stakes: ['najmou nkhasrou ensen 3ziz', 'el dalil ynajem yodhhor', 'ensén ma3andou hata dhanb bech yetchakka fih', 'ser bech ywalli ma3rouf', 'fama 9arar s3ib 9rib', 'ma b9a ken chwaya wa9t'],
    names: ['Meriem', 'Ines', 'Sarra', 'Yasmine', 'Nour', 'Yassine', 'Sami', 'Amine', 'Rania', 'Lina'],
    title: ['El detail el mef9oud', '9bal ma tjewb', 'Elli ma 9olnehech', 'Akher notification', 'El version lokhra', 'Kol chay fel message'],
  },
  'ar-DZ': {
    forms: {
      opening: ['Rak hna, {name}? Lazem ngolek haja.', 'Ma kontch hab neb3atlek, bsah sma3.', '{name}, t9der tkhali hadchi binatna?'],
      event: ['Taw jani {event}.', 'Srat haja daba: {event}.', 'Chouf wach l9it: {event}.'],
      question: ['Stenna, kifach {event} srat daba?', 'Rak met2aked wach chft?', 'Wach mazal ma 9oltlich?'],
      conflict: ['El mochkel es7i7 howa beli {conflict}.', 'Kan lazm ngolek, bsah {conflict}.', 'Nass kamel y9olo belli {conflict}.'],
      pressure: ['Ila ma derna walou, {stakes}.', 'Ma b9alch lwa9t: {stakes}.', 'Fhemt wach ya3ni hadchi? {stakes}.'],
      twist: ['Bsah taw 3refna haja okhra: {twist}.', 'Stenna… w ila {twist}?', 'El detail li ma chafouhch howa belli {twist}.'],
      resolution: ['Donc lazm {resolution}.', 'Mlih. Had lmera {resolution}.', 'Ma na3refch kifah tkhlas, bsah n9edro {resolution}.'],
      echo: ['Wach ila kouna ghaltin mn lowel?', 'Chft detail ybadel kolchi.', 'Ma tjawbch mazal. Qra li ba3d.', 'Kont 3aref belli kayen haja na9sa.', 'Wa3edni ma t9arrer walou daba.'],
    },
    resolutions: ['ngolo kolchi 9bel ma n9erro', 'net2ekdo men dalil m3a ba3dana', 'netla9aw w nahdro b sra7a', 'nes9siw l insan es7i7', 'nestennaw 7ta na3erfo l7a9 kamel', 'n7afdo 3la dalil w netlobo mosa3da', 'ngolo l7a9 9bel ma yefout lwa9t', 'n3tiw ba3dana forsa okhra bach nefahmo'],
    stakes: ['n9edro nkhasro wa7ed 3ziz', 'dalil y9der yrou7', 'wa7ed ma dar walou ywelli howa lmethem', 'ser ywalli ma3rouf', 'kayen 9erar s3ib 9rib', 'ma b9a ghir chwiya wa9t'],
    names: ['Meriem', 'Ines', 'Yasmine', 'Nour', 'Lina', 'Yacine', 'Sami', 'Amine', 'Rania', 'Mehdi'],
    title: ['El detail li ra7', '9bel ma tjawb', 'Wach ma 9olnach', 'Akher notification', 'El version lokhra', 'Kolchi f message'],
  },
  'ar-MA': {
    forms: {
      opening: ['Wach nta hna, {name}? Khasni ngolik chi haja.', 'Ma kentch ghadi nsift lik, walakin sme3.', '{name}, t9der tkhlli hadchi binatna?'],
      event: ['Daba wselni {event}.', 'W9e3 chi haja daba: {event}.', 'Chouf ach l9it: {event}.'],
      question: ['Tsenn, kifach {event} w9e3 daba?', 'Mte2eked ach chefti?', 'Ach mazal ma gltich liya?'],
      conflict: ['Lmochkil bssa7 howa belli {conflict}.', 'Khasni ngolha lik, walakin {conflict}.', 'Kolchi kaygoul belli {conflict}.'],
      pressure: ['Ila ma derna walo, {stakes}.', 'Lwa9t kaykml: {stakes}.', 'Fhemt ach kay3ni hadchi? {stakes}.'],
      twist: ['Walakin daba 3refna haja khra: {twist}.', 'Tsenn… ila kan {twist}?', 'Detail li ma chaf 7ed howa belli {twist}.'],
      resolution: ['Donc khasna {resolution}.', 'Mzyan. Had lmra {resolution}.', 'Ma 3reftch kifach ghatsali, walakin n9dro {resolution}.'],
      echo: ['W ila kouna ghaltin mn lwel?', 'L9it detail ghaybdel kolchi.', 'Matjawbch daba. Qra lba9i mzyan.', 'Kont 3aref belli kayn chi haja na9sa.', 'Wa3edni matakhod 7ta 9rar daba.'],
    },
    resolutions: ['ngolo kolchi 9bel ma nakhdo qarar', 'nt2ekdo mn dalil m3a b3dyatna', 'ntla9aw w nhdro b sra7a', 'nswlo l insan li khas', 'ntsennaw 7ta n3erfo l7a9 kamel', 'n7afdo 3la dalil w ntlbo lmo3awana', 'ngolo l7a9 9bel ma yfout lwa9t', 'n3tiw b3dyatna forsa bach nfahmo'],
    stakes: ['n9dro nkhsro chi wa7ed 3ziz', 'dalil y9der ykhtafi', 'chi wa7ed bari2 ghaytlam', 'ser ghaywli 3la kolchi', 'qarar ma fihch rjou3 qrib', 'ma b9a ghir chwia dyal lwa9t'],
    names: ['Meryem', 'Salma', 'Nour', 'Aya', 'Lina', 'Yassine', 'Amine', 'Adam', 'Mehdi', 'Sami'],
    title: ['Detail li tnsа', '9bel ma tjawb', 'Ach ma glnach', 'Akher notification', 'Version khra', 'Kolchi f message'],
  },
  'ar-EG': {
    forms: {
      opening: ['إنت موجود يا {name}؟ لازم أقولك حاجة.', 'كنت هتردد أبعتلك، بس اسمعني.', 'يا {name}، خليك فاكر إن الكلام ده بينا.'],
      event: ['لسه واصل لي {event}.', 'حصلت حاجة دلوقتي: {event}.', 'بص لقيت إيه: {event}.'],
      question: ['استنى، إزاي {event} حصل دلوقتي؟', 'إنت متأكد من اللي شوفته؟', 'إيه اللي لسه مخبيهوش عني؟'],
      conflict: ['المشكلة بجد إن {conflict}.', 'كان لازم أقولك، بس {conflict}.', 'كل الناس فاكرة إن {conflict}.'],
      pressure: ['لو ما عملناش حاجة، {stakes}.', 'الوقت بيخلص: {stakes}.', 'إنت فاهم ده معناه إيه؟ {stakes}.'],
      twist: ['بس لسه عارفين حاجة تانية: {twist}.', 'استنى… طب لو {twist}؟', 'التفصيلة اللي محدش خد باله منها إن {twist}.'],
      resolution: ['يبقى لازم {resolution}.', 'ماشي. المرة دي {resolution}.', 'مش عارفين النهاية إيه، بس ممكن {resolution}.'],
      echo: ['طب لو كنا فاهمين كل حاجة غلط من الأول؟', 'خدت بالي من تفصيلة هتغير كل حاجة.', 'ما تردش دلوقتي. اقرا الباقي كويس.', 'كنت حاسس إن في حاجة ناقصة.', 'وعدني ما تاخدش قرار دلوقتي.'],
    },
    resolutions: ['نقول كل حاجة قبل ما نقرر', 'نتأكد من الدليل مع بعض', 'نتقابل ونتكلم بصراحة', 'نسأل الشخص الصح', 'نستنى لحد ما نعرف الحقيقة كلها', 'نحتفظ بالدليل ونطلب مساعدة', 'نقول الحقيقة قبل فوات الأوان', 'ندي لبعض فرصة أخيرة نشرح'],
    stakes: ['ممكن نخسر حد مهم', 'الدليل ممكن يختفي', 'الشخص الغلط هيتلام', 'سر هيبقى معروف للكل', 'قرار ملوش رجعة قرب', 'ما بقاش في وقت تقريباً'],
    names: ['مريم', 'نور', 'سارة', 'ليلى', 'آية', 'آدم', 'يوسف', 'عمر', 'سامي', 'ياسين'],
    title: ['التفصيلة الناقصة', 'قبل ما ترد', 'اللي ما قولناهوش', 'آخر إشعار', 'النسخة التانية', 'كل حاجة كانت في الرسالة'],
  },
};

const supplementalEvents = {
  it: {
    surveillance_photo: 'una foto da una telecamera di sorveglianza', disappearance: 'una scomparsa inspiegabile', mystery_parcel: 'un pacco senza mittente', missed_call: 'la stessa chiamata persa che si ripete', door_camera: 'una videocamera alla porta che si attiva da sola', duplicate_key: 'una copia della chiave fatta senza permesso', live_location: 'una posizione in tempo reale da un telefono spento', blocked_number: 'un numero bloccato che richiama', window_figure: 'una figura dietro la finestra', camera_shadow: 'un’ombra ripresa da una telecamera', locked_room: 'una stanza chiusa dall’interno', old_birthday: 'un messaggio di compleanno da una persona morta', silent_alarm: 'un allarme silenzioso che scatta',
  },
  'pt-BR': {
    surveillance_photo: 'uma foto de uma câmera de segurança', disappearance: 'um desaparecimento sem explicação', mystery_parcel: 'um pacote sem remetente', missed_call: 'a mesma ligação perdida se repetindo', door_camera: 'uma câmera na porta que liga sozinha', duplicate_key: 'uma cópia da chave feita sem autorização', live_location: 'uma localização em tempo real de um celular desligado', blocked_number: 'um número bloqueado ligando de novo', window_figure: 'uma figura atrás da janela', camera_shadow: 'uma sombra na imagem da câmera', locked_room: 'um quarto trancado por dentro', old_birthday: 'uma mensagem de aniversário de alguém que já morreu', silent_alarm: 'um alarme silencioso disparando',
  },
  'ar-TN': {
    surveillance_photo: 'taswira men camera surveillance', disappearance: 'ghayba ma3andhech tafsir', mystery_parcel: 'colis bla esm elli b3athou', missed_call: 'appel perdu yet3awed', door_camera: 'camera 3al beb t5dem wa7adha', duplicate_key: 'mifte7 copié bla idhn', live_location: 'position live men telephone msakker', blocked_number: 'numro bloqué 3awed 3ayet', window_figure: 'chkoun wa9ef wara el chobbek', camera_shadow: 'dhil fel camera', locked_room: 'bit msakker men de5el', old_birthday: 'message 3id milad men ensen met', silent_alarm: 'alarme sakta d5alet fi service',
  },
  'ar-DZ': {
    surveillance_photo: 'tswira men camera ta3 surveillance', disappearance: 'ghyab ma 3andouch tafsir', mystery_parcel: 'colis bla smit li b3athou', missed_call: 'appel perdu y3awed', door_camera: 'camera ta3 bab tekhdem wa7adha', duplicate_key: 'copie ta3 lmeftah bla idn', live_location: 'position live men telephone msakker', blocked_number: 'numero bloqué 3awed 3ayet', window_figure: 'wahed wa9ef mor chbbaq', camera_shadow: 'dhel f camera', locked_room: 'bit msedoud men dakhel', old_birthday: 'message ta3 3id milad men wahed mat', silent_alarm: 'alarme sakta tchedet',
  },
  'ar-MA': {
    surveillance_photo: 'tswira mn camera dyal surveillance', disappearance: 'ghyab bla tafsir', mystery_parcel: 'colis bla smit li sifto', missed_call: 'appel manqué kay3awed', door_camera: 'camera f lbab katkhddem bo7dha', duplicate_key: 'copie dyal lmiftah bla idn', live_location: 'position live mn telephone msdoud', blocked_number: 'numero bloqué 3awed 3ayet', window_figure: 'chi wa7ed wara chbbaq', camera_shadow: 'dell f camera', locked_room: 'bit msdoud mn dakhel', old_birthday: 'message dyal 3id milad mn chi wa7ed mat', silent_alarm: 'alarme sakta khdmat',
  },
  'ar-EG': {
    surveillance_photo: 'صورة من كاميرا مراقبة', disappearance: 'اختفاء من غير تفسير', mystery_parcel: 'طرد من غير اسم المرسل', missed_call: 'مكالمة فائتة بتتكرر', door_camera: 'كاميرا الباب اشتغلت لوحدها', duplicate_key: 'نسخة مفتاح اتعملت من غير إذن', live_location: 'موقع مباشر من موبايل مقفول', blocked_number: 'رقم معمول له حظر بيتصل تاني', window_figure: 'شخص واقف ورا الشباك', camera_shadow: 'ظل ظاهر في الكاميرا', locked_room: 'أوضة مقفولة من جوه', old_birthday: 'رسالة عيد ميلاد من شخص مات', silent_alarm: 'إنذار صامت اشتغل',
  },
};

const phrases = { fr: translations.fr, en: translations.en };
for (const language of Object.keys(languages)) {
  if (language === 'fr' || language === 'en') continue;
  const overrides = phraseOverrides[language] || {};
  const localizedForms = localForms[language] || {};
  const dialect = dialectForms[language] || {};
  phrases[language] = {
    ...translations.en,
    ...overrides,
    ...localizedForms,
    ...dialect,
    events: { ...(overrides.events || {}), ...(supplementalEvents[language] || {}) },
    conflicts: { ...(overrides.conflicts || {}) },
    forms: dialect.forms || localizedForms.forms || translations.en.forms,
    twistForms: dialect.twistForms || overrides.twistForms || localizedForms.twistForms || [
      `The surprising part is how {event} connects to {conflict}.`,
      `It turns out {event} is connected to {conflict}.`,
    ],
  };
}

const pick = values => values[randomInt(values.length)];
const normalizeCategory = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
const interpolate = (text, values) => text.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
const rememberArc = (key, signature) => {
  const recent = recentArcs.get(key) || new Set();
  if (recent.has(signature)) return false;
  recent.add(signature);
  if (recent.size > 2000) recent.delete(recent.values().next().value);
  recentArcs.set(key, recent);
  return true;
};
const recentArcs = new Map();

function chooseArc(options) {
  const categoryKey = aliases.get(normalizeCategory(options.genre)) || 'suspense';
  const profile = profiles[categoryKey];
  const language = options.language || 'fr';
  const terms = phrases[language] || phrases.fr;
  const outcome = categoryOutcomes[language]?.[categoryKey];
  const namePool = terms.names || phrases.en.names;
  for (let attempt = 0; attempt < 12; attempt++) {
    const eventId = pick(profile.event);
    const conflictId = pick(profile.conflict);
    const twistText = pick(profile.twist);
    const resolutionText = pick(profile.resolution);
    const stakesText = pick(profile.stakes);
    const names = [pick(namePool), pick(namePool)];
    if (names[0] === names[1]) names[1] = pick(namePool.filter(name => name !== names[0]));
    const signature = [eventId, conflictId, twistText, resolutionText, ...names].join('|');
    if (!rememberArc(categoryKey, signature)) continue;
    return {
      categoryKey,
      category: profile.label,
      relationship: terms.relations[profile.relationship] || phrases.fr.relations[profile.relationship],
      clearStory: language === 'fr' ? clearFrenchArcs[categoryKey]?.[eventId] || null : null,
      event: terms.events[eventId] || `${terms.genericEvent || 'an unexpected event'}`,
      conflict: terms.conflicts[conflictId] || terms.genericConflict || 'trust has been shaken',
      twist: language === 'fr' || language === 'en'
        ? (terms.twists || {})[twistText] || twistText
        : interpolate(pick(terms.twistForms), { event: terms.events[eventId] || terms.genericEvent || 'an unexpected event', conflict: terms.conflicts[conflictId] || terms.genericConflict || 'trust has been shaken' }),
      resolution: outcome?.resolution || pick(terms.resolutions || phrases.fr.resolutions),
      stakes: outcome?.stakes || pick(terms.stakes || phrases.fr.stakes),
      names,
      title: pick(terms.title || phrases.fr.title),
      nonce: randomUUID(),
      raw: { eventId, conflictId, twistText, resolutionText, stakesText },
    };
  }
  throw new Error('Impossible de construire une nouvelle intrigue. Réessayez.');
}

const searchStoryDemo = {
  fr: [
    { query: 'Pourquoi quelqu’un me suit tous les soirs ?', results: [
      ['Service-Public.fr', 'https://www.service-public.fr/particuliers/vosdroits/N31138', 'Que faire en cas de harcèlement ?', 'Notez les faits, les dates et les lieux. En cas de danger immédiat, appelez les services d’urgence.'],
      ['Police nationale', 'https://www.police-nationale.interieur.gouv.fr', 'Signaler des faits inquiétants', 'Les faits répétés et précis aident les services compétents à évaluer la situation.'],
      ['France Victimes', 'https://www.france-victimes.fr', 'Être accompagné après des faits de harcèlement', 'Des professionnels peuvent vous écouter et vous orienter gratuitement.'],
    ] },
    { query: 'Comment détecter un traceur GPS sur une voiture ?', results: [
      ['CNIL', 'https://www.cnil.fr/fr/geolocalisation', 'Géolocalisation : comprendre et protéger ses données', 'La localisation d’une personne est une donnée personnelle qui doit être utilisée dans un cadre légal.'],
      ['Apple Assistance', 'https://support.apple.com/fr-fr/HT212227', 'Que faire si une alerte de suivi indésirable apparaît ?', 'Une alerte peut aider à repérer un accessoire de suivi inconnu associé à vos déplacements.'],
      ['Google Assistance', 'https://support.google.com/android/answer/13658562?hl=fr', 'Détecter les traceurs inconnus avec Android', 'Android peut vous avertir lorsqu’un traceur Bluetooth inconnu semble se déplacer avec vous.'],
    ] },
    { query: 'Comment vérifier un véhicule sans prendre de risque ?', results: [
      ['Sécurité routière', 'https://www.securite-routiere.gouv.fr', 'Adopter les bons réflexes en cas de doute', 'Faites-vous accompagner et évitez toute confrontation avec une personne qui vous inquiète.'],
      ['Service-Public.fr', 'https://www.service-public.fr/particuliers/vosdroits/F1435', 'Contacter les forces de l’ordre', 'Vous pouvez demander conseil aux services de police ou de gendarmerie.'],
      ['France Victimes', 'https://www.france-victimes.fr', 'Trouver un point d’accueil près de chez vous', 'Un accompagnement est disponible pour préparer les démarches et préserver votre sécurité.'],
    ] },
    { query: 'Comment conserver les preuves d’une surveillance ?', results: [
      ['Service-Public.fr', 'https://www.service-public.fr/particuliers/vosdroits/F1435', 'Conserver les éléments utiles à un signalement', 'Gardez les messages, captures et notes datées sans modifier les fichiers originaux.'],
      ['Cybermalveillance.gouv.fr', 'https://www.cybermalveillance.gouv.fr', 'Sécuriser ses comptes et ses appareils', 'Changez vos mots de passe depuis un appareil sûr et activez la double authentification.'],
      ['CNIL', 'https://www.cnil.fr/fr/maitriser-mes-donnees', 'Mieux protéger ses données personnelles', 'Vérifiez les accès aux comptes, le partage de position et les appareils connectés.'],
    ] },
    { query: 'Comment signaler un harcèlement à la police ?', results: [
      ['Service-Public.fr', 'https://www.service-public.fr/particuliers/vosdroits/F1435', 'Porter plainte ou effectuer un signalement', 'Les démarches dépendent des faits. Les services de police et de gendarmerie peuvent vous renseigner.'],
      ['Police nationale', 'https://www.police-nationale.interieur.gouv.fr', 'Contacter un service de police', 'En cas d’urgence, contactez immédiatement les services d’urgence.'],
      ['France Victimes', 'https://www.france-victimes.fr', 'Aide aux victimes : écoute et orientation', 'Le 116 006 est le numéro national d’aide aux victimes, gratuit.'],
    ] },
    { query: 'Que faire si je me sens en danger immédiatement ?', results: [
      ['Service-Public.fr', 'https://www.service-public.fr/particuliers/vosdroits/F33954', 'Numéros d’urgence : police, pompiers, SAMU', 'En France, appelez le 17 ou le 112 en cas d’urgence nécessitant une intervention.'],
      ['Ministère de l’Intérieur', 'https://www.interieur.gouv.fr', 'Urgence : contacter les secours', 'Rejoignez un lieu sûr et sollicitez une personne de confiance.'],
      ['France Victimes', 'https://www.france-victimes.fr', 'Être accompagné en tant que victime', 'Le 116 006 permet d’obtenir écoute et orientation, tous les jours.'],
    ] },
    { query: 'Comment bloquer le partage de ma position ?', results: [
      ['Google Assistance', 'https://support.google.com/maps/answer/15437054?hl=fr', 'Gérer le partage de position Google Maps', 'Consultez les personnes autorisées à voir votre position et arrêtez les partages inutiles.'],
      ['Apple Assistance', 'https://support.apple.com/fr-fr/HT210514', 'Gérer le partage de position sur iPhone', 'Vérifiez les personnes et applications qui ont accès à votre position.'],
      ['CNIL', 'https://www.cnil.fr/fr/maitriser-mes-donnees', 'Contrôler les données partagées depuis son téléphone', 'Examinez les autorisations de localisation des applications installées.'],
    ] },
    { query: 'Comment sécuriser mon téléphone après un suivi suspect ?', results: [
      ['Cybermalveillance.gouv.fr', 'https://www.cybermalveillance.gouv.fr', 'Sécuriser ses comptes en ligne', 'Depuis un appareil de confiance, modifiez les mots de passe et vérifiez les connexions récentes.'],
      ['Google Assistance', 'https://support.google.com/accounts/answer/3067630?hl=fr', 'Sécuriser un compte Google', 'Vérifiez les appareils connectés et les événements de sécurité récents.'],
      ['Apple Assistance', 'https://support.apple.com/fr-fr/HT201355', 'Sécuriser votre identifiant Apple', 'Vérifiez les appareils associés et mettez à jour les informations de sécurité.'],
    ] },
    { query: 'Qui peut m’aider à préparer un dépôt de plainte ?', results: [
      ['France Victimes', 'https://www.france-victimes.fr', 'Préparer ses démarches avec une association d’aide', 'Le 116 006 oriente les victimes vers un service d’aide proche de chez elles.'],
      ['Service-Public.fr', 'https://www.service-public.fr/particuliers/vosdroits/F1435', 'Démarches après des faits de harcèlement', 'Vous pouvez vous faire accompagner et apporter les éléments conservés.'],
      ['Gendarmerie nationale', 'https://www.gendarmerie.interieur.gouv.fr', 'Trouver une brigade et demander conseil', 'Les brigades peuvent vous informer sur les démarches à suivre.'],
    ] },
    { query: 'Comment établir un plan de sécurité avec un proche ?', results: [
      ['France Victimes', 'https://www.france-victimes.fr', 'Être accompagné pour retrouver un cadre sûr', 'Un intervenant peut vous aider à identifier les démarches adaptées à votre situation.'],
      ['Service-Public.fr', 'https://www.service-public.fr/particuliers/vosdroits/F1435', 'Protéger ses droits et demander de l’aide', 'Parlez de la situation à une personne de confiance et sollicitez les services compétents.'],
      ['Ministère de l’Intérieur', 'https://www.interieur.gouv.fr', 'Appeler les secours en cas de danger', 'En cas de menace immédiate, éloignez-vous du danger et appelez le 17 ou le 112.'],
    ] },
  ],
  en: [
    { query: 'Why does someone follow me every night?', results: [
      ['National Stalking Helpline', 'https://www.suzylamplugh.org/pages/category/national-stalking-helpline', 'Get support if you are being stalked', 'A specialist service can help you record incidents and plan practical next steps.'],
      ['Police.uk', 'https://www.police.uk', 'Report stalking or harassment', 'Keep a dated record of incidents and contact police if you feel unsafe.'],
      ['Victim Support', 'https://www.victimsupport.org.uk', 'Support for people affected by stalking', 'Confidential support is available to help you understand your options.'],
    ] },
    { query: 'How can I check for an unknown GPS tracker?', results: [
      ['Apple Support', 'https://support.apple.com/en-us/HT212227', 'What to do when you get an unwanted tracking alert', 'Your phone can help identify an unknown tracking accessory moving with you.'],
      ['Google Help', 'https://support.google.com/android/answer/13658562', 'Find unknown trackers with Android', 'Android can notify you when an unfamiliar Bluetooth tracker appears to travel with you.'],
      ['National Stalking Helpline', 'https://www.suzylamplugh.org/pages/category/national-stalking-helpline', 'Make a safety plan before taking action', 'Avoid confronting anyone you suspect and seek advice from a support service.'],
    ] },
    { query: 'How do I check my car safely?', results: [
      ['Police.uk', 'https://www.police.uk', 'Get advice from your local police force', 'Ask for help if repeated incidents make you feel unsafe; do not investigate alone.'],
      ['Victim Support', 'https://www.victimsupport.org.uk', 'Create a personal safety plan', 'A support worker can help you consider safe, practical options.'],
      ['Suzy Lamplugh Trust', 'https://www.suzylamplugh.org', 'Personal safety advice and resources', 'Tell someone you trust and arrange support before changing your routine.'],
    ] },
    { query: 'How should I keep evidence of suspected tracking?', results: [
      ['National Stalking Helpline', 'https://www.suzylamplugh.org/pages/category/national-stalking-helpline', 'Keep a record of stalking incidents', 'Save messages and make a dated log; keep original files unchanged where possible.'],
      ['Police.uk', 'https://www.police.uk', 'Report repeated unwanted behaviour', 'A clear timeline can help explain what happened when you speak with police.'],
      ['Google Safety Center', 'https://safety.google', 'Protect your online accounts', 'Review location sharing, account access and devices using a trusted device.'],
    ] },
    { query: 'How can I report stalking to the police?', results: [
      ['Police.uk', 'https://www.police.uk', 'Contact your local police', 'Report incidents to your local force; call emergency services if there is immediate danger.'],
      ['National Stalking Helpline', 'https://www.suzylamplugh.org/pages/category/national-stalking-helpline', 'Get help deciding what to do next', 'Specialist advisers can explain reporting and support options.'],
      ['Victim Support', 'https://www.victimsupport.org.uk', 'Help after crime or harassment', 'Free, confidential support can help you access local services.'],
    ] },
    { query: 'What should I do if I am in immediate danger?', results: [
      ['GOV.UK', 'https://www.gov.uk/guidance/stop-stalking-or-harassment', 'Get help with stalking or harassment', 'Call 999 in an emergency in the UK and move to a place where you can get help.'],
      ['Police.uk', 'https://www.police.uk', 'Emergency and non-emergency police help', 'Call 999 if a crime is happening now or someone is in immediate danger.'],
      ['Victim Support', 'https://www.victimsupport.org.uk', 'Find support near you', 'A support service can help you plan safer next steps.'],
    ] },
    { query: 'How do I stop sharing my location?', results: [
      ['Google Maps Help', 'https://support.google.com/maps/answer/15437054', 'Manage Google Maps location sharing', 'Review who can see your location and stop sharing with anyone you do not recognise.'],
      ['Apple Support', 'https://support.apple.com/en-us/HT210514', 'Manage location sharing on iPhone', 'Review people and apps that can access your location.'],
      ['Google Safety Center', 'https://safety.google', 'Review your privacy and security settings', 'Check location permissions and account access from a device you trust.'],
    ] },
    { query: 'How can I secure my phone after a tracking concern?', results: [
      ['Google Account Help', 'https://support.google.com/accounts/answer/3067630', 'Secure a Google Account', 'Review signed-in devices and recent security activity.'],
      ['Apple Support', 'https://support.apple.com/en-us/HT201355', 'Keep your Apple Account secure', 'Check trusted devices and update your account security details.'],
      ['National Cyber Security Centre', 'https://www.ncsc.gov.uk/section/information-for/individuals-families', 'Protect your personal accounts', 'Use unique passwords and turn on two-step verification where available.'],
    ] },
    { query: 'Who can help me prepare a police report?', results: [
      ['Victim Support', 'https://www.victimsupport.org.uk', 'Get confidential support after crime', 'A support worker can help you understand the process and find local assistance.'],
      ['National Stalking Helpline', 'https://www.suzylamplugh.org/pages/category/national-stalking-helpline', 'Speak to a specialist stalking adviser', 'Advisers can help you organise a record of incidents and consider reporting.'],
      ['GOV.UK', 'https://www.gov.uk/guidance/stop-stalking-or-harassment', 'Report stalking and get support', 'Find official guidance on reporting and specialist services.'],
    ] },
    { query: 'How can I make a safety plan with someone I trust?', results: [
      ['Suzy Lamplugh Trust', 'https://www.suzylamplugh.org', 'Personal safety advice and support', 'Agree on a check-in plan and ask a trusted person to support your next steps.'],
      ['Victim Support', 'https://www.victimsupport.org.uk', 'Find support to plan what happens next', 'Confidential support can help you make a plan that fits your situation.'],
      ['GOV.UK', 'https://www.gov.uk/guidance/stop-stalking-or-harassment', 'Official guidance on stalking and harassment', 'If you are in immediate danger, call 999.'],
    ] },
  ],
};

function demoSearchStory(options) {
  const language = options.language === 'fr' ? 'fr' : 'en';
  const stages = searchStoryDemo[language];
  const count = Math.max(10, Math.min(30, Number(options.messageCount) || 20));
  const resultsPerQuery = count / stages.length;
  const messages = stages.flatMap(stage => stage.results.slice(0, resultsPerQuery).map(([siteName, url, title, snippet]) => ({
    sender: 'a',
    content: title,
    message_type: 'message',
    delivery_status: 'seen',
    appearance_ms: Number(options.appearanceMs) || 1800,
    duration_ms: 1000,
    metadata: { googleResult: { query: stage.query, siteName, url, snippet } },
  })));
  return {
    title: stages[0].query,
    description: 'Une suite de recherches qui avance étape par étape.',
    characters: {},
    messages,
  };
}

function buildPrompt(options, arc) {
  if (options.theme === 'google-search') {
    const locale = languages[options.language] || languages.fr;
    const count = Math.max(10, Math.min(100, Number(options.messageCount) || 20));
    return [
      `Create a coherent sequence of exactly ${count} Google mobile search results in ${locale.instruction}.`,
      `Narrative angle: ${options.genre || 'suspense'}. Each result must belong to a real search query; queries must evolve logically and tell one clear story from question to practical resolution.`,
      'Return only valid JSON with title (the first query), description, and messages. Every message must contain sender:"a", content (a natural search-result title), message_type:"message", and metadata.googleResult with query, siteName, url, and snippet.',
      'Use several distinct, credible real websites and valid-looking HTTPS URLs that match their site names. Keep the snippet specific, factual in tone, readable, and relevant to that result. Do not invent personal names, use placeholder text, repeat the same query for every result, or include filler.',
      `Use exactly ${count} results. Group consecutive results under the same query, then advance to the next query in a meaningful sequence. The first query should express the central question and the last query should lead to a safe, practical next step.`,
    ].join('\n');
  }
  const locale = languages[options.language] || languages.fr;
  const count = Math.max(10, Math.min(100, Number(options.messageCount) || 20));
  const style = String(options.style || 'Réaliste');
  const duration = String(options.duration || 'moyenne');
  return [
    `Create an original fictional chat story in ${locale.instruction}.`,
    `Genre: ${arc.category}. Narrative style: ${style}. Desired pace: ${duration}.`,
    `Length: exactly ${count} short chat messages, alternating naturally between the two characters.`,
    `The selected language changes only vocabulary, idioms, and conversational voice. Keep the same genre, relationships, and plot logic regardless of language.`,
    `Characters: ${arc.names[0]} and ${arc.names[1]}, ${arc.relationship}. Give each a distinct voice and a believable motive.`,
    `Use this story material as inspiration, not as a script: inciting event: ${arc.event}; central conflict: ${arc.conflict}; stakes: ${arc.raw.stakesText}; possible reversal: ${arc.raw.twistText}; possible resolution: ${arc.raw.resolutionText}.`,
    'Keep the plot simple: one main problem, one clear piece of evidence, one understandable twist, and one practical resolution. Avoid unrelated subplots and complicated coincidences.',
    'Make the first three messages immediately clear: message 1 names the concrete problem, message 2 directly reacts to or answers it, and message 3 explains why it matters or why the chat continues.',
    'Every reply must respond to the previous message or ask a specific follow-up. Name the person, object, place, or event instead of using vague phrases such as “you know”, “the problem”, “that thing”, or “what happened” without context.',
    'Use short, natural chat messages. Explain the evidence before the twist, make the twist easy to understand, and make the ending follow directly from the revealed facts.',
    'Invent specific details and character reactions. Do not repeat the same plot beats verbatim or turn the story material into a checklist. Make this telling distinct from a generic or previously generated story.',
    'Write the title, description, character names, character descriptions, and message content in the selected language. Avoid explanations outside the story.',
    'Return only valid JSON with title, description, characters:{a:{name,description,color,fictional_age},b:{...}}, messages:[{sender:"a"|"b",content,message_type:"message",delivery_status:"seen"|"delivered"|"sent",reaction?:"❤️"}].',
    `Variation reference: ${arc.nonce}.`,
  ].join('\n');
}

function demoStory(options, arc) {
  const language = options.language || 'fr';
  const terms = phrases[language] || phrases.fr;
  const forms = terms.forms || phrases.fr.forms;
  const localized = {
    event: arc.event,
    conflict: arc.conflict,
    twist: arc.twist,
    resolution: arc.resolution,
    stakes: arc.stakes,
    name: arc.names[1],
    detail: arc.event,
  };
  const count = Math.max(10, Math.min(100, Number(options.messageCount) || 20));
  const style = String(options.style || 'Réaliste');
  if (language === 'fr' && arc.clearStory) {
    const story = arc.clearStory;
    const stages = [
      [
        `Tu as le message original sous les yeux ?`,
        `Tu peux vérifier l’heure et le nom de l’expéditeur ?`,
        `Tu peux me montrer la preuve exacte ?`,
      ],
      [
        `Oui. La preuve, c’est que ${story.evidence}`,
        `Je viens de vérifier : ${story.evidence}`,
        `Regarde la capture : ${story.evidence}`,
      ],
      [
        `D’accord, je comprends pourquoi tu m’as écrit.`,
        `Tu as bien fait de me prévenir avant de répondre.`,
        `Merci de m’avoir montré le détail au lieu de tirer une conclusion.`,
      ],
      [
        `Mais j’ai trouvé l’explication : ${story.twist}`,
        `Attends, la vraie explication est simple : ${story.twist}`,
        `J’ai vérifié un dernier détail : ${story.twist}`,
      ],
      [
        `Ah, maintenant je comprends ce qui s’est passé.`,
        `Ça explique le message et la preuve qu’on vient de vérifier.`,
        `D’accord, on sait maintenant qui a fait quoi.`,
      ],
      [
        `Alors, on va ${arc.resolution}.`,
        `La prochaine étape, c’est de ${arc.resolution}.`,
        `On peut régler ça simplement : ${arc.resolution}.`,
      ],
    ];
    const finalLines = {
      amour: ['D’accord. On va s’expliquer tous les deux et décider ensemble.', 'Merci de m’avoir dit la vérité. On en parle tous les deux ce soir.', 'On ne va pas tirer de conclusion sans se parler franchement.'],
      suspense: ['D’accord. On vérifie les faits avant de répondre.', 'On appelle la personne concernée et on confirme l’information.', 'On a compris le message. On va vérifier avant d’agir.'],
      famille: ['D’accord. On va se réunir et demander la vérité à la famille.', 'On en parle tous ensemble avant de prendre une décision.', 'Maintenant qu’on connaît les faits, on peut en parler avec la famille.'],
    }[arc.categoryKey] || ['D’accord. On s’en occupe ensemble maintenant.'];
    const usedContent = new Set([story.hook, story.reply, story.context]);
    const messages = Array.from({ length: count }, (_, index) => {
      let content;
      if (index === 0) content = `${arc.names[1]}, écoute : ${story.hook}`;
      else if (index === 1) content = story.reply;
      else if (index === 2) content = story.context;
      else if (index === count - 1) {
        const available = finalLines.filter(line => !usedContent.has(line));
        content = pick(available.length ? available : finalLines);
      } else {
        const progress = (index - 3) / Math.max(1, count - 4);
        const stage = Math.min(stages.length - 1, Math.floor(progress * stages.length));
        const candidates = stages[stage].filter(line => !usedContent.has(line));
        content = pick(candidates.length ? candidates : stages[stage]);
      }
      usedContent.add(content);
      return {
        sender: index % 2 === 0 ? 'a' : 'b',
        content,
        message_type: 'message',
        delivery_status: 'seen',
        position: index,
        appearance_ms: Number(options.appearanceMs) || 1400,
        duration_ms: 1000,
        metadata: { date_label: index < count / 2 ? 'today' : 'tomorrow' },
      };
    });
    const ages = [randomInt(18, 41), randomInt(18, 41)];
    if (ages[0] === ages[1]) ages[1] = ages[1] === 40 ? ages[1] - 1 : ages[1] + 1;
    return {
      title: `${pick(terms.title || phrases.fr.title)} · ${arc.names[0]}`,
      description: `Une histoire ${arc.category.toLowerCase()} simple et claire en ${count} messages.`,
      characters: {
        a: { name: arc.names[0], description: arc.relationship, color: '#a67cff', fictional_age: ages[0] },
        b: { name: arc.names[1], description: arc.relationship, color: '#48b5a3', fictional_age: ages[1] },
      },
      messages,
    };
  }
  const defaultPhaseActs = [
    ['opening', 'opening', 'echo'],
    ['event', 'question', 'event'],
    ['conflict', 'question', 'echo'],
    ['pressure', 'conflict', 'echo'],
    ['twist', 'question', 'twist'],
    ['resolution', 'echo', 'resolution'],
  ];
  const stylePhaseActs = {
    emotionnel: [
      ['opening', 'opening', 'echo'],
      ['event', 'echo', 'event'],
      ['conflict', 'question', 'echo'],
      ['pressure', 'echo', 'conflict'],
      ['twist', 'echo', 'twist'],
      ['resolution', 'echo', 'resolution'],
    ],
    dramatique: [
      ['opening', 'opening', 'echo'],
      ['event', 'question', 'event'],
      ['conflict', 'conflict', 'question'],
      ['pressure', 'conflict', 'pressure'],
      ['twist', 'question', 'twist'],
      ['resolution', 'echo', 'resolution'],
    ],
    suspense: [
      ['opening', 'opening', 'echo'],
      ['event', 'question', 'event'],
      ['conflict', 'question', 'echo'],
      ['pressure', 'question', 'pressure'],
      ['twist', 'question', 'twist'],
      ['resolution', 'echo', 'twist'],
    ],
    viraltiktok: [
      ['opening', 'echo', 'opening'],
      ['event', 'question', 'event'],
      ['conflict', 'echo', 'question'],
      ['pressure', 'echo', 'pressure'],
      ['twist', 'question', 'twist'],
      ['resolution', 'twist', 'echo'],
    ],
  };
  const styleKey = normalizeCategory(style);
  const phaseActs = stylePhaseActs[styleKey] || defaultPhaseActs;
  const usedContent = new Set();
  const messages = Array.from({ length: count }, (_, index) => {
    const progress = index / Math.max(1, count - 1);
    const phaseIndex = Math.min(5, Math.floor(progress * 6));
    const previousPhaseIndex = index === 0
      ? -1
      : Math.min(5, Math.floor(((index - 1) / Math.max(1, count - 1)) * 6));
    const phaseStarts = ['opening', 'event', 'conflict', 'pressure', 'twist', 'resolution'];
    const act = index === count - 1
      ? 'resolution'
      : phaseIndex !== previousPhaseIndex
        ? phaseStarts[phaseIndex]
        : pick(phaseActs[phaseIndex]);
    const speaker = index % 2 === 0 ? 0 : 1;
    const variants = forms[act] || phrases.fr.forms[act];
    const messageValues = { ...localized, name: arc.names[speaker === 0 ? 1 : 0] };
    let templates = variants;
    if (act === 'echo') {
      templates = [...variants, ...variants.map(line => `${line} ${arc.names[speaker]}.`)];
    }
    const candidates = templates.map(template => interpolate(template, messageValues));
    const freshCandidates = candidates.filter(candidate => !usedContent.has(candidate));
    const content = pick(freshCandidates.length ? freshCandidates : candidates);
    usedContent.add(content);
    return {
      sender: speaker === 0 ? 'a' : 'b',
      content,
      message_type: 'message',
      delivery_status: 'seen',
      position: index,
      appearance_ms: Number(options.appearanceMs) || 1400,
      duration_ms: 1000,
      metadata: { date_label: index < count / 2 ? 'today' : 'tomorrow' },
    };
  });
  const localeTitle = terms.title || phrases.fr.title;
  const descriptions = {
  fr: `Une conversation fictive en ${count} messages.`,
  en: `A fictional chat story in ${count} messages.`,
  it: `Una storia in chat di ${count} messaggi.`,
  'pt-BR': `Uma história em conversa com ${count} mensagens.`,
  'ar-TN': `7keya fictive fi ${count} messages.`,
  'ar-DZ': `7kaya fictive fi ${count} messages.`,
  'ar-MA': `7kaya khayaliya f ${count} message.`,
  'ar-EG': `حكاية محادثة خيالية من ${count} رسالة.`,
  };
  const description = descriptions[language] || descriptions.fr;
  const ages = [randomInt(18, 41), randomInt(18, 41)];
  if (ages[0] === ages[1]) ages[1] = ages[1] === 40 ? ages[1] - 1 : ages[1] + 1;
  return {
    title: `${pick(localeTitle)} · ${arc.names[0]}`,
    description,
    characters: {
      a: { name: arc.names[0], description: arc.relationship, color: '#a67cff', fictional_age: ages[0] },
      b: { name: arc.names[1], description: arc.relationship, color: '#48b5a3', fictional_age: ages[1] },
    },
    messages,
  };
}

const parseJson = text => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('Le provider IA n’a pas renvoyé de JSON valide.');
  return JSON.parse(text.slice(start, end + 1));
};

async function requestProvider(provider, options, prompt) {
  if (provider === 'openai') {
    if (!process.env.OPENAI_API_KEY) throw new Error('Ajoutez OPENAI_API_KEY dans backend/.env pour utiliser OpenAI.');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You are an original short-form chat-fiction writer. Return strict JSON only.' }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });
    if (!response.ok) throw new Error(`OpenAI a répondu ${response.status}.`);
    return parseJson((await response.json()).choices[0].message.content);
  }
  if (provider === 'ollama') {
    const response = await fetch(`${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: process.env.OLLAMA_MODEL || 'llama3.1', prompt, stream: false, format: 'json' }),
    });
    if (!response.ok) throw new Error('Ollama est indisponible.');
    return parseJson((await response.json()).response);
  }
  const endpoint = process.env.LOCAL_AI_URL || 'http://localhost:8000/generate';
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(process.env.LOCAL_AI_TOKEN ? { Authorization: `Bearer ${process.env.LOCAL_AI_TOKEN}` } : {}) },
    body: JSON.stringify({ prompt, options: { ...options, narrative: { category: options.genre, style: options.style, language: options.language } } }),
  });
  if (!response.ok) throw new Error(`L’API locale a répondu ${response.status}.`);
  const result = await response.json();
  return result.story || result;
}

export async function generateStory(options = {}) {
  const providerName = options.provider || 'demo';
  if (!['demo', 'openai', 'ollama', 'local'].includes(providerName)) throw new Error('Provider IA inconnu.');
  const language = options.language || 'fr';
  if (!Object.hasOwn(languages, language)) throw Object.assign(new Error('Langue de conversation non prise en charge.'), { statusCode: 400 });
  const generationOptions = { ...options, language };
  if (generationOptions.theme === 'google-search' && providerName === 'demo') {
    if (!['fr', 'en'].includes(language)) {
      throw Object.assign(new Error('La démo Google Search est disponible en français et en anglais.'), { statusCode: 400 });
    }
    const result = demoSearchStory(generationOptions);
    return { ...result, provider: providerName, language };
  }
  const arc = chooseArc(generationOptions);
  const result = providerName === 'demo'
    ? demoStory(generationOptions, arc)
    : await requestProvider(providerName, generationOptions, buildPrompt(generationOptions, arc));
  if (!Array.isArray(result.messages) || result.messages.length === 0) throw new Error('Le provider n’a renvoyé aucun message.');
  const count = Math.max(10, Math.min(100, Number(generationOptions.messageCount) || 20));
  if (result.messages.length < count) {
    throw new Error(`Le provider a renvoyé ${result.messages.length} messages au lieu des ${count} demandés.`);
  }
  const messages = result.messages.slice(0, count).map((message, index) => ({
    ...message,
    sender: message.sender === 'b' ? 'b' : 'a',
    content: String(message.content || ''),
    message_type: message.message_type || 'message',
    delivery_status: message.delivery_status || 'seen',
    position: index,
    appearance_ms: Number(generationOptions.appearanceMs) || 1400,
    duration_ms: Number(message.duration_ms) || 1000,
  }));
  return {
    title: result.title || `${pick((phrases[language] || phrases.fr).title)} · ${arc.names[0]}`,
    description: result.description || '',
    characters: result.characters || demoStory(generationOptions, arc).characters,
    messages,
    provider: providerName,
    language,
  };
}
