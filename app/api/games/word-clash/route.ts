import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { createRequire } from 'module';
import { rateLimit } from '../../../../lib/rateLimiter';
import { prisma } from '@/lib/prisma';

const requireFromRoot = createRequire(path.join(process.cwd(), 'package.json'));
const wordClashEngine = requireFromRoot('./lib/wordClashEngine.js');

// Word Clash questions organized by difficulty
const WORD_CLASH_QUESTIONS = {
  easy: [
    { text: "Which is bigger: Cat or Ant?", answer: "Cat", explanation: "חתול גדול יותר מנמלה" },
    { text: "Which is faster: Car or Bus?", answer: "Car", explanation: "מכונית מהירה יותר מאוטובוס" },
    { text: "Which is taller: Tree or Bush?", answer: "Tree", explanation: "עץ גבוה יותר משיח" },
    { text: "Which is heavier: Dog or Cat?", answer: "Dog", explanation: "כלב כבד יותר מחתול" },
    { text: "Which is smaller: Ant or Bee?", answer: "Ant", explanation: "נמלה קטנה יותר מדבורה" },
    { text: "Which is longer: River or Pond?", answer: "River", explanation: "נהר ארוך יותר מבריכה" },
    { text: "Which is hotter: Sun or Fire?", answer: "Sun", explanation: "שמש חמה יותר מאש" },
    { text: "Which is colder: Ice or Snow?", answer: "Ice", explanation: "קרח קר יותר משלג" },
    { text: "Which is louder: Bell or Clock?", answer: "Bell", explanation: "פעמון חזק יותר משעון" },
    { text: "Which is sweeter: Candy or Cake?", answer: "Candy", explanation: "סוכריה מתוקה יותר מעוגה" },
    { text: "Which is brighter: Sun or Moon?", answer: "Sun", explanation: "שמש בהירה יותר מירח" },
    { text: "Which is deeper: Pool or Lake?", answer: "Lake", explanation: "אגם עמוק יותר מבריכה" },
    { text: "Which is stronger: Lion or Tiger?", answer: "Tiger", explanation: "טיגריס חזק יותר מאריה" },
    { text: "Which is slower: Turtle or Snail?", answer: "Snail", explanation: "חילזון איטי יותר מצב" },
    { text: "Which is higher: Hill or Valley?", answer: "Hill", explanation: "גבעה גבוהה יותר מעמק" },
    { text: "Which is wider: Road or Path?", answer: "Road", explanation: "כביש רחב יותר משביל" },
    { text: "Which is sharper: Sword or Knife?", answer: "Sword", explanation: "חרב חדה יותר מסכין" },
    { text: "Which is softer: Pillow or Blanket?", answer: "Pillow", explanation: "כרית רכה יותר משמיכה" },
    { text: "Which is harder: Rock or Stone?", answer: "Rock", explanation: "סלע קשה יותר מאבן" },
    { text: "Which is lighter: Feather or Paper?", answer: "Feather", explanation: "נוצה קלה יותר מנייר" },
    { text: "Which is warmer: Blanket or Towel?", answer: "Blanket", explanation: "שמיכה חמה יותר ממגבת" },
    { text: "Which is colder: Ice cream or Soup?", answer: "Ice cream", explanation: "גלידה קרה יותר ממרק" },
    { text: "Which is sweeter: Sugar or Salt?", answer: "Sugar", explanation: "סוכר מתוק יותר ממלח" },
    { text: "Which is bigger: House or Car?", answer: "House", explanation: "בית גדול יותר ממכונית" },
    { text: "Which is smaller: Button or Coin?", answer: "Button", explanation: "כפתור קטן יותר ממטבע" },
    { text: "Which is faster: Train or Bicycle?", answer: "Train", explanation: "רכבת מהירה יותר מאופניים" },
    { text: "Which is slower: Snail or Turtle?", answer: "Snail", explanation: "חילזון איטי יותר מצב" },
    { text: "Which is taller: Lamp or Table?", answer: "Lamp", explanation: "מנורה גבוהה יותר משולחן" },
    { text: "Which is shorter: Pencil or Ruler?", answer: "Pencil", explanation: "עיפרון קצר יותר מסרגל" },
    { text: "Which is bigger: Apple or Cherry?", answer: "Apple", explanation: "תפוח גדול יותר מדובדבן" },
    { text: "Which is smaller: Pea or Bean?", answer: "Pea", explanation: "אפונה קטנה יותר מפול" },
    { text: "Which is faster: Horse or Donkey?", answer: "Horse", explanation: "סוס מהיר יותר מחמור" },
    { text: "Which is slower: Ant or Worm?", answer: "Worm", explanation: "תולעת איטית יותר מנמלה" },
    { text: "Which is taller: Grass or Flower?", answer: "Flower", explanation: "פרח גבוה יותר מעשב" },
    { text: "Which is shorter: Finger or Toe?", answer: "Toe", explanation: "אצבע רגל קצרה יותר מאצבע יד" },
    { text: "Which is wider: Door or Window?", answer: "Door", explanation: "דלת רחבה יותר מחלון" },
    { text: "Which is narrower: String or Rope?", answer: "String", explanation: "חוט צר יותר מחבל" },
    { text: "Which is sharper: Tooth or Nail?", answer: "Tooth", explanation: "שן חדה יותר מציפורן" },
    { text: "Which is bigger: Boat or Ship?", answer: "Ship", explanation: "אונייה גדולה יותר מסירה" },
    { text: "Which is smaller: Fly or Mosquito?", answer: "Mosquito", explanation: "יתוש קטן יותר מזבוב" },
    { text: "Which is faster: Rabbit or Mouse?", answer: "Rabbit", explanation: "ארנב מהיר יותר מעכבר" },
    { text: "Which is slower: Cow or Pig?", answer: "Pig", explanation: "חזיר איטי יותר מפרה" },
    { text: "Which is taller: Giraffe or Horse?", answer: "Giraffe", explanation: "ג'ירפה גבוהה יותר מסוס" },
    { text: "Which is shorter: Dog or Cat?", answer: "Cat", explanation: "חתול קצר יותר מכלב" },
    { text: "Which is wider: Ocean or Sea?", answer: "Ocean", explanation: "אוקיינוס רחב יותר מים" },
    { text: "Which is narrower: Creek or River?", answer: "Creek", explanation: "נחל צר יותר מנהר" },
    { text: "Which is sharper: Thorn or Spike?", answer: "Thorn", explanation: "קוץ חד יותר מדוקרן" },
    { text: "Which is duller: Stick or Branch?", answer: "Stick", explanation: "מקל קהה יותר מענף" },
    { text: "Which is bigger: Melon or Orange?", answer: "Melon", explanation: "מלון גדול יותר מתפוז" },
    { text: "Which is smaller: Grape or Raisin?", answer: "Raisin", explanation: "צימוק קטן יותר מענב" },
    { text: "Which is faster: Deer or Goat?", answer: "Deer", explanation: "צבי מהיר יותר מעז" },
    { text: "Which is slower: Sheep or Cow?", answer: "Sheep", explanation: "כבשה איטית יותר מפרה" },
    { text: "Which is taller: Palm or Pine?", answer: "Pine", explanation: "אורן גבוה יותר מדקל" },
    { text: "Which is shorter: Rose or Tulip?", answer: "Tulip", explanation: "צבעוני קצר יותר מוורד" },
    { text: "Which is wider: Field or Garden?", answer: "Field", explanation: "שדה רחב יותר מגינה" },
    { text: "Which is narrower: Lane or Avenue?", answer: "Lane", explanation: "נתיב צר יותר משדרה" },
    { text: "Which is sharper: Claw or Fang?", answer: "Fang", explanation: "ניב חד יותר מציפורן" },
    { text: "Which is duller: Pebble or Rock?", answer: "Pebble", explanation: "חלוק קהה יותר מסלע" }
  ],
  medium: [
    { text: "Which is bigger: Elephant or Giraffe?", answer: "Elephant", explanation: "פיל גדול יותר מג'ירפה" },
    { text: "Which is faster: Bicycle or Motorcycle?", answer: "Motorcycle", explanation: "אופנוע מהיר יותר מאופניים" },
    { text: "Which is taller: Building or Tower?", answer: "Tower", explanation: "מגדל גבוה יותר מבניין" },
    { text: "Which is heavier: Elephant or Hippopotamus?", answer: "Hippopotamus", explanation: "היפופוטם כבד יותר מפיל" },
    { text: "Which is smaller: Mouse or Hamster?", answer: "Mouse", explanation: "עכבר קטן יותר מאוגר" },
    { text: "Which is longer: Highway or Street?", answer: "Highway", explanation: "כביש מהיר ארוך יותר מרחוב" },
    { text: "Which is hotter: Volcano or Desert?", answer: "Volcano", explanation: "הר געש חם יותר ממדבר" },
    { text: "Which is colder: Antarctica or Arctic?", answer: "Antarctica", explanation: "אנטארקטיקה קרה יותר מהארקטי" },
    { text: "Which is louder: Thunder or Explosion?", answer: "Explosion", explanation: "פיצוץ חזק יותר מרעם" },
    { text: "Which is sweeter: Chocolate or Vanilla?", answer: "Chocolate", explanation: "שוקולד מתוק יותר מווניל" },
    { text: "Which is brighter: Lightning or Firework?", answer: "Lightning", explanation: "ברק בהיר יותר מזיקוק" },
    { text: "Which is deeper: Ocean or Trench?", answer: "Trench", explanation: "תעלה עמוקה יותר מאוקיינוס" },
    { text: "Which is stronger: Gorilla or Bear?", answer: "Gorilla", explanation: "גורילה חזקה יותר מדוב" },
    { text: "Which is slower: Sloth or Tortoise?", answer: "Sloth", explanation: "עצלן איטי יותר מצב" },
    { text: "Which is higher: Mountain or Plateau?", answer: "Mountain", explanation: "הר גבוה יותר מרמה" },
    { text: "Which is wider: Canyon or Valley?", answer: "Canyon", explanation: "קניון רחב יותר מעמק" },
    { text: "Which is sharper: Razor or Scissors?", answer: "Razor", explanation: "תער חדה יותר ממספריים" },
    { text: "Which is softer: Silk or Cotton?", answer: "Silk", explanation: "משי רך יותר מכותנה" },
    { text: "Which is harder: Steel or Iron?", answer: "Steel", explanation: "פלדה קשה יותר מברזל" },
    { text: "Which is lighter: Balloon or Bubble?", answer: "Bubble", explanation: "בועה קלה יותר מבלון" },
    { text: "Which is heavier: Piano or Guitar?", answer: "Piano", explanation: "פסנתר כבד יותר מגיטרה" },
    { text: "Which is faster: Helicopter or Airplane?", answer: "Airplane", explanation: "מטוס מהיר יותר ממסוק" },
    { text: "Which is slower: Bicycle or Walking?", answer: "Walking", explanation: "הליכה איטית יותר מאופניים" },
    { text: "Which is taller: Lighthouse or Church?", answer: "Lighthouse", explanation: "מגדלור גבוה יותר מכנסייה" },
    { text: "Which is shorter: Bridge or Tunnel?", answer: "Tunnel", explanation: "מנהרה קצרה יותר מגשר" },
    { text: "Which is wider: Stadium or Theater?", answer: "Stadium", explanation: "אצטדיון רחב יותר מתיאטרון" },
    { text: "Which is narrower: Alley or Street?", answer: "Alley", explanation: "סמטה צרה יותר מרחוב" },
    { text: "Which is sharper: Needle or Pin?", answer: "Needle", explanation: "מחט חדה יותר מסיכה" },
    { text: "Which is duller: Spoon or Fork?", answer: "Spoon", explanation: "כפית קהה יותר ממזלג" },
    { text: "Which is bigger: Whale or Shark?", answer: "Whale", explanation: "לווייתן גדול יותר מכריש" },
    { text: "Which is smaller: Robin or Eagle?", answer: "Robin", explanation: "אדום חזה קטן יותר מנשר" },
    { text: "Which is faster: Motorcycle or Car?", answer: "Motorcycle", explanation: "אופנוע מהיר יותר ממכונית" },
    { text: "Which is slower: Bicycle or Walking?", answer: "Walking", explanation: "הליכה איטית יותר מאופניים" },
    { text: "Which is taller: Tree or Building?", answer: "Building", explanation: "בניין גבוה יותר מעץ" },
    { text: "Which is shorter: Bus or Truck?", answer: "Bus", explanation: "אוטובוס קצר יותר ממשאית" },
    { text: "Which is wider: River or Lake?", answer: "Lake", explanation: "אגם רחב יותר מנהר" },
    { text: "Which is narrower: Path or Road?", answer: "Path", explanation: "שביל צר יותר מכביש" },
    { text: "Which is sharper: Blade or Edge?", answer: "Blade", explanation: "להב חדה יותר מקצה" },
    { text: "Which is bigger: Crocodile or Alligator?", answer: "Crocodile", explanation: "תנין גדול יותר מתנין אמריקאי" },
    { text: "Which is smaller: Butterfly or Moth?", answer: "Moth", explanation: "עש קטן יותר מפרפר" },
    { text: "Which is faster: Jaguar or Panther?", answer: "Jaguar", explanation: "יגואר מהיר יותר מפנתר" },
    { text: "Which is slower: Elephant or Rhino?", answer: "Elephant", explanation: "פיל איטי יותר מקרנף" },
    { text: "Which is taller: Statue or Monument?", answer: "Monument", explanation: "אנדרטה גבוהה יותר מפסל" },
    { text: "Which is shorter: Bench or Chair?", answer: "Chair", explanation: "כיסא קצר יותר מספסל" },
    { text: "Which is wider: Boulevard or Avenue?", answer: "Boulevard", explanation: "שדרה רחבה רחבה יותר משדרה" },
    { text: "Which is narrower: Footpath or Sidewalk?", answer: "Footpath", explanation: "שביל רגלי צר יותר ממדרכה" },
    { text: "Which is sharper: Dagger or Sword?", answer: "Dagger", explanation: "פגיון חד יותר מחרב" },
    { text: "Which is duller: Hammer or Chisel?", answer: "Hammer", explanation: "פטיש קהה יותר מאזמל" },
    { text: "Which is bigger: Watermelon or Pumpkin?", answer: "Pumpkin", explanation: "דלעת גדולה יותר מאבטיח" },
    { text: "Which is smaller: Blueberry or Strawberry?", answer: "Blueberry", explanation: "אוכמנית קטנה יותר מתות" },
    { text: "Which is faster: Gazelle or Antelope?", answer: "Gazelle", explanation: "צבי מהיר יותר מאנטילופה" },
    { text: "Which is slower: Buffalo or Bison?", answer: "Buffalo", explanation: "באפלו איטי יותר מביזון" },
    { text: "Which is taller: Cypress or Cedar?", answer: "Cedar", explanation: "ארז גבוה יותר מברוש" },
    { text: "Which is shorter: Daisy or Lily?", answer: "Daisy", explanation: "חיננית קצרה יותר משושן" },
    { text: "Which is wider: Forest or Woods?", answer: "Forest", explanation: "יער רחב יותר מחורשה" },
    { text: "Which is narrower: Corridor or Hallway?", answer: "Corridor", explanation: "מסדרון צר יותר ממסדרון רחב" },
    { text: "Which is sharper: Arrow or Spear?", answer: "Arrow", explanation: "חץ חד יותר מחנית" },
    { text: "Which is duller: Axe or Hatchet?", answer: "Hatchet", explanation: "גרזן קטן קהה יותר מגרזן" }
  ],
  hard: [
    { text: "Which is bigger: Rhinoceros or Hippopotamus?", answer: "Hippopotamus", explanation: "היפופוטם גדול יותר מקרנף" },
    { text: "Which is faster: Cheetah or Leopard?", answer: "Cheetah", explanation: "ברדלס מהיר יותר מנמר" },
    { text: "Which is taller: Skyscraper or Cathedral?", answer: "Skyscraper", explanation: "גורד שחקים גבוה יותר מקתדרלה" },
    { text: "Which is heavier: Rhinoceros or Hippopotamus?", answer: "Hippopotamus", explanation: "היפופוטם כבד יותר מקרנף" },
    { text: "Which is smaller: Chihuahua or Pomeranian?", answer: "Chihuahua", explanation: "צ'יוואווה קטן יותר מפומרניאן" },
    { text: "Which is longer: Mississippi or Amazon?", answer: "Amazon", explanation: "אמזונס ארוך יותר ממיסיסיפי" },
    { text: "Which is hotter: Mercury or Venus?", answer: "Venus", explanation: "נוגה חמה יותר מחמה" },
    { text: "Which is colder: Neptune or Uranus?", answer: "Neptune", explanation: "נפטון קר יותר מאורנוס" },
    { text: "Which is louder: Jet Engine or Thunder?", answer: "Jet Engine", explanation: "מנוע סילון חזק יותר מרעם" },
    { text: "Which is sweeter: Honey or Molasses?", answer: "Honey", explanation: "דבש מתוק יותר ממולסה" },
    { text: "Which is brighter: Supernova or Galaxy?", answer: "Supernova", explanation: "סופרנובה בהירה יותר מגלקסיה" },
    { text: "Which is deeper: Mariana Trench or Grand Canyon?", answer: "Mariana Trench", explanation: "תעלת מריאנה עמוקה יותר מהגרנד קניון" },
    { text: "Which is stronger: Silverback or Grizzly?", answer: "Silverback", explanation: "סילברבק חזק יותר מגריזלי" },
    { text: "Which is slower: Sloth or Snail?", answer: "Snail", explanation: "חילזון איטי יותר מעצלן" },
    { text: "Which is higher: Everest or K2?", answer: "Everest", explanation: "אוורסט גבוה יותר מ-K2" },
    { text: "Which is wider: Sahara or Gobi?", answer: "Sahara", explanation: "סהרה רחבה יותר מגובי" },
    { text: "Which is sharper: Scalpel or Lancet?", answer: "Scalpel", explanation: "סכין מנתחים חדה יותר מלנצט" },
    { text: "Which is softer: Velvet or Satin?", answer: "Velvet", explanation: "קטיפה רכה יותר מסאטן" },
    { text: "Which is harder: Diamond or Tungsten?", answer: "Tungsten", explanation: "טונגסטן קשה יותר מיהלום" },
    { text: "Which is lighter: Helium or Hydrogen?", answer: "Hydrogen", explanation: "מימן קל יותר מהליום" },
    { text: "Which is heavier: Lead or Gold?", answer: "Lead", explanation: "עופרת כבדה יותר מזהב" },
    { text: "Which is faster: Sound or Light?", answer: "Light", explanation: "אור מהיר יותר מקול" },
    { text: "Which is slower: Walking or Running?", answer: "Walking", explanation: "הליכה איטית יותר מריצה" },
    { text: "Which is taller: Eiffel Tower or Empire State Building?", answer: "Empire State Building", explanation: "אמפייר סטייט בילדינג גבוה יותר ממגדל אייפל" },
    { text: "Which is shorter: Microscope or Telescope?", answer: "Microscope", explanation: "מיקרוסקופ קצר יותר מטלסקופ" },
    { text: "Which is wider: Pacific Ocean or Atlantic Ocean?", answer: "Pacific Ocean", explanation: "האוקיינוס השקט רחב יותר מהאוקיינוס האטלנטי" },
    { text: "Which is narrower: River or Stream?", answer: "Stream", explanation: "נחל צר יותר מנהר" },
    { text: "Which is sharper: Diamond or Glass?", answer: "Diamond", explanation: "יהלום חדה יותר מזכוכית" },
    { text: "Which is duller: Wood or Metal?", answer: "Wood", explanation: "עץ קהה יותר ממתכת" },
    { text: "Which is bigger: Giraffe or Elephant?", answer: "Elephant", explanation: "פיל גדול יותר מג'ירפה" },
    { text: "Which is smaller: Hummingbird or Sparrow?", answer: "Hummingbird", explanation: "קוליברי קטן יותר מדרור" },
    { text: "Which is faster: Falcon or Eagle?", answer: "Falcon", explanation: "בז מהיר יותר מנשר" },
    { text: "Which is slower: Sloth or Koala?", answer: "Sloth", explanation: "עצלן איטי יותר מקואלה" },
    { text: "Which is taller: Redwood or Sequoia?", answer: "Redwood", explanation: "סקויה אדומה גבוהה יותר מסקויה ענקית" },
    { text: "Which is shorter: Giraffe or Ostrich?", answer: "Ostrich", explanation: "יען קצר יותר מג'ירפה" },
    { text: "Which is wider: Amazon or Nile?", answer: "Amazon", explanation: "אמזונס רחב יותר מנילוס" },
    { text: "Which is narrower: Strait or Channel?", answer: "Strait", explanation: "מצר צר יותר מתעלה" },
    { text: "Which is sharper: Obsidian or Flint?", answer: "Obsidian", explanation: "אובסידיאן חדה יותר מצור" },
    { text: "Which is bigger: Orca or Dolphin?", answer: "Orca", explanation: "אורקה גדולה יותר מדולפין" },
    { text: "Which is smaller: Ladybug or Firefly?", answer: "Ladybug", explanation: "חיפושית משה רבנו קטנה יותר מגחלילית" },
    { text: "Which is faster: Sailfish or Marlin?", answer: "Sailfish", explanation: "דג מפרש מהיר יותר ממרלין" },
    { text: "Which is slower: Manatee or Dugong?", answer: "Manatee", explanation: "למנטין איטי יותר מדוגונג" },
    { text: "Which is taller: Washington Monument or Statue of Liberty?", answer: "Washington Monument", explanation: "אנדרטת וושינגטון גבוהה יותר מפסל החירות" },
    { text: "Which is shorter: Colosseum or Parthenon?", answer: "Parthenon", explanation: "הפרתנון קצר יותר מהקולוסיאום" },
    { text: "Which is wider: Mediterranean Sea or Caribbean Sea?", answer: "Mediterranean Sea", explanation: "הים התיכון רחב יותר מהים הקריבי" },
    { text: "Which is narrower: English Channel or Strait of Gibraltar?", answer: "Strait of Gibraltar", explanation: "מצר גיברלטר צר יותר מתעלת למנש" },
    { text: "Which is sharper: Katana or Rapier?", answer: "Katana", explanation: "קטנה חדה יותר מרפייר" },
    { text: "Which is duller: Mace or Club?", answer: "Club", explanation: "אלה קהה יותר ממקבת" },
    { text: "Which is bigger: Sequoia or Baobab?", answer: "Sequoia", explanation: "סקויה גדולה יותר מבאובב" },
    { text: "Which is smaller: Bonsai or Cactus?", answer: "Bonsai", explanation: "בונסאי קטן יותר מקקטוס" },
    { text: "Which is faster: Greyhound or Whippet?", answer: "Greyhound", explanation: "גרייהאונד מהיר יותר מוויפט" },
    { text: "Which is slower: Panda or Koala?", answer: "Koala", explanation: "קואלה איטי יותר מפנדה" },
    { text: "Which is taller: Petronas Towers or Willis Tower?", answer: "Petronas Towers", explanation: "מגדלי פטרונס גבוהים יותר ממגדל וויליס" },
    { text: "Which is shorter: Leaning Tower of Pisa or Big Ben?", answer: "Big Ben", explanation: "ביג בן קצר יותר ממגדל פיזה" },
    { text: "Which is wider: Great Barrier Reef or Belize Barrier Reef?", answer: "Great Barrier Reef", explanation: "שונית המחסום הגדולה רחבה יותר משונית בליז" },
    { text: "Which is narrower: Bosphorus or Dardanelles?", answer: "Bosphorus", explanation: "הבוספורוס צר יותר מהדרדנלים" },
    { text: "Which is sharper: Stiletto or Dirk?", answer: "Stiletto", explanation: "סטילטו חד יותר מדירק" },
    { text: "Which is duller: Cudgel or Baton?", answer: "Cudgel", explanation: "אלה קהה יותר מאלה" }
  ],
  extreme: [
    { text: "Which is bigger: Megalodon or Blue Whale?", answer: "Blue Whale", explanation: "לווייתן כחול גדול יותר ממגלודון" },
    { text: "Which is faster: Peregrine Falcon or Cheetah?", answer: "Peregrine Falcon", explanation: "בז נודד מהיר יותר מברדלס" },
    { text: "Which is taller: Burj Khalifa or Shanghai Tower?", answer: "Burj Khalifa", explanation: "בורג' חליפה גבוה יותר ממגדל שנגחאי" },
    { text: "Which is heavier: African Elephant or Asian Elephant?", answer: "African Elephant", explanation: "פיל אפריקני כבד יותר מפיל אסייתי" },
    { text: "Which is smaller: Pygmy Marmoset or Capuchin?", answer: "Pygmy Marmoset", explanation: "מרמוסט ננסי קטן יותר מקפוצ'ין" },
    { text: "Which is longer: Nile River or Amazon River?", answer: "Nile River", explanation: "נהר הנילוס ארוך יותר מנהר האמזונס" },
    { text: "Which is hotter: Sun's Core or Lightning?", answer: "Sun's Core", explanation: "ליבת השמש חמה יותר מברק" },
    { text: "Which is colder: Absolute Zero or Liquid Nitrogen?", answer: "Absolute Zero", explanation: "אפס מוחלט קר יותר מחנקן נוזלי" },
    { text: "Which is louder: Krakatoa Eruption or Tsar Bomba?", answer: "Tsar Bomba", explanation: "פצצת הצאר חזקה יותר מהתפרצות קרקטואה" },
    { text: "Which is sweeter: Stevia or Aspartame?", answer: "Stevia", explanation: "סטיביה מתוקה יותר מאספרטם" },
    { text: "Which is brighter: Quasar or Pulsar?", answer: "Quasar", explanation: "קוואזר בהיר יותר מפולסר" },
    { text: "Which is deeper: Challenger Deep or Horizon Deep?", answer: "Challenger Deep", explanation: "צ'לנג'ר דיפ עמוק יותר מהורייזון דיפ" },
    { text: "Which is stronger: Hercules Beetle or Rhinoceros Beetle?", answer: "Hercules Beetle", explanation: "חיפושית הרקולס חזקה יותר מחיפושית הקרנף" },
    { text: "Which is slower: Three-toed Sloth or Garden Snail?", answer: "Garden Snail", explanation: "חילזון גינה איטי יותר מעצלן תלת-אצבע" },
    { text: "Which is higher: Mount Everest or Mauna Kea?", answer: "Mauna Kea", explanation: "מאונה קיאה גבוה יותר מהר אוורסט" },
    { text: "Which is wider: Pacific Ocean or Atlantic Ocean?", answer: "Pacific Ocean", explanation: "האוקיינוס השקט רחב יותר מהאוקיינוס האטלנטי" },
    { text: "Which is sharper: Obsidian Blade or Diamond Edge?", answer: "Obsidian Blade", explanation: "להב אובסידיאן חדה יותר מקצה יהלום" },
    { text: "Which is softer: Angora Wool or Cashmere?", answer: "Angora Wool", explanation: "צמר אנגורה רך יותר מקשמיר" },
    { text: "Which is harder: Wurtzite Boron Nitride or Diamond?", answer: "Wurtzite Boron Nitride", explanation: "ניטריד בורון וורטזיט קשה יותר מיהלום" },
    { text: "Which is lighter: Aerogel or Styrofoam?", answer: "Aerogel", explanation: "אירוג'ל קל יותר מסטיירופום" },
    { text: "Which is heavier: Neutron Star or White Dwarf?", answer: "Neutron Star", explanation: "כוכב נייטרונים כבד יותר מננס לבן" },
    { text: "Which is faster: Quantum Tunneling or Light Speed?", answer: "Light Speed", explanation: "מהירות האור מהירה יותר ממינהור קוונטי" },
    { text: "Which is slower: Continental Drift or Plate Tectonics?", answer: "Continental Drift", explanation: "נדידת יבשות איטית יותר מטקטוניקת לוחות" },
    { text: "Which is taller: Mount Everest or Mauna Kea?", answer: "Mauna Kea", explanation: "מאונה קיאה גבוה יותר מהר אוורסט" },
    { text: "Which is shorter: Wavelength of Gamma Rays or X-rays?", answer: "Gamma Rays", explanation: "אורך הגל של קרני גמא קצר יותר מקרני X" },
    { text: "Which is wider: Observable Universe or Milky Way Galaxy?", answer: "Observable Universe", explanation: "היקום הנצפה רחב יותר מגלקסיית שביל החלב" },
    { text: "Which is narrower: DNA Helix or Protein Strand?", answer: "DNA Helix", explanation: "סליל ה-DNA צר יותר מגדיל חלבון" },
    { text: "Which is sharper: Atomic Force Microscope or Scanning Tunneling Microscope?", answer: "Atomic Force Microscope", explanation: "מיקרוסקופ כוח אטומי חדה יותר ממיקרוסקופ מינהור סורק" },
    { text: "Which is duller: Graphite or Diamond?", answer: "Graphite", explanation: "גרפיט קהה יותר מיהלום" },
    { text: "Which is bigger: Titanosaur or Argentinosaurus?", answer: "Argentinosaurus", explanation: "ארגנטינוזאורוס גדול יותר מטיטנוזאור" },
    { text: "Which is smaller: Quark or Neutrino?", answer: "Quark", explanation: "קווארק קטן יותר מניוטרינו" },
    { text: "Which is faster: Tachyon or Photon?", answer: "Tachyon", explanation: "טכיון מהיר יותר מפוטון" },
    { text: "Which is slower: Continental Drift or Plate Tectonics?", answer: "Continental Drift", explanation: "נדידת יבשות איטית יותר מטקטוניקת לוחות" },
    { text: "Which is taller: Olympus Mons or Mount Everest?", answer: "Olympus Mons", explanation: "אולימפוס מונס גבוה יותר מהר אוורסט" },
    { text: "Which is shorter: Planck Length or Electron Radius?", answer: "Planck Length", explanation: "אורך פלאנק קצר יותר מרדיוס אלקטרון" },
    { text: "Which is wider: Observable Universe or Multiverse?", answer: "Multiverse", explanation: "רב-יקום רחב יותר מהיקום הנצפה" },
    { text: "Which is narrower: Quantum Tunnel or Wormhole?", answer: "Quantum Tunnel", explanation: "מינהור קוונטי צר יותר מחור תולעת" },
    { text: "Which is sharper: Laser Beam or X-ray?", answer: "Laser Beam", explanation: "קרן לייזר חדה יותר מקרני X" },
    { text: "Which is heavier: Neutron Star or Black Hole?", answer: "Black Hole", explanation: "חור שחור כבד יותר מכוכב נייטרונים" },
    { text: "Which is lighter: Dark Matter or Dark Energy?", answer: "Dark Energy", explanation: "אנרגיה אפלה קלה יותר מחומר אפל" },
    { text: "Which is hotter: Quasar or Supernova?", answer: "Quasar", explanation: "קוואזר חם יותר מסופרנובה" },
    { text: "Which is colder: Absolute Zero or Cosmic Background?", answer: "Absolute Zero", explanation: "אפס מוחלט קר יותר מקרינת הרקע הקוסמית" },
    { text: "Which is bigger: Andromeda Galaxy or Milky Way?", answer: "Andromeda Galaxy", explanation: "גלקסיית אנדרומדה גדולה יותר משביל החלב" },
    { text: "Which is smaller: Prion or Virus?", answer: "Prion", explanation: "פריון קטן יותר מנגיף" },
    { text: "Which is faster: Neutrino or Graviton?", answer: "Graviton", explanation: "גרוויטון מהיר יותר מניוטרינו" },
    { text: "Which is slower: Glacier Movement or Tectonic Shift?", answer: "Glacier Movement", explanation: "תנועת קרחון איטית יותר מהזזת טקטונית" },
    { text: "Which is taller: Hyperion Tree or General Sherman?", answer: "Hyperion Tree", explanation: "עץ היפריון גבוה יותר מגנרל שרמן" },
    { text: "Which is shorter: Femtosecond or Picosecond?", answer: "Femtosecond", explanation: "פמטושנייה קצרה יותר מפיקושנייה" },
    { text: "Which is wider: Supergiant Star or Red Dwarf?", answer: "Supergiant Star", explanation: "כוכב על-ענק רחב יותר מגמד אדום" },
    { text: "Which is narrower: Singularity or Event Horizon?", answer: "Singularity", explanation: "סינגולריות צרה יותר מאופק אירועים" },
    { text: "Which is sharper: Molecular Blade or Atomic Edge?", answer: "Atomic Edge", explanation: "קצה אטומי חד יותר מלהב מולקולרי" },
    { text: "Which is duller: Aerogel or Styrofoam?", answer: "Styrofoam", explanation: "קלקר קהה יותר מאירוג'ל" },
    { text: "Which is heavier: Osmium or Iridium?", answer: "Osmium", explanation: "אוסמיום כבד יותר מאירידיום" },
    { text: "Which is lighter: Aerographite or Graphene?", answer: "Aerographite", explanation: "אירוגרפיט קל יותר מגרפן" },
    { text: "Which is hotter: White Dwarf or Neutron Star?", answer: "Neutron Star", explanation: "כוכב נייטרונים חם יותר מגמד לבן" },
    { text: "Which is colder: Bose-Einstein Condensate or Liquid Helium?", answer: "Bose-Einstein Condensate", explanation: "קונדנסט בוז-איינשטיין קר יותר מהליום נוזלי" },
    { text: "Which is bigger: Supermassive Black Hole or Stellar Black Hole?", answer: "Supermassive Black Hole", explanation: "חור שחור על-מסיבי גדול יותר מחור שחור כוכבי" },
    { text: "Which is smaller: Higgs Boson or Top Quark?", answer: "Top Quark", explanation: "קווארק עליון קטן יותר מבוזון היגס" },
    { text: "Which is faster: Quantum Entanglement or Speed of Light?", answer: "Quantum Entanglement", explanation: "שזירה קוונטית מהירה יותר ממהירות האור" },
    { text: "Which is slower: Radioactive Decay or Chemical Reaction?", answer: "Radioactive Decay", explanation: "דעיכה רדיואקטיבית איטית יותר מתגובה כימית" },
    { text: "Which is taller: Valles Marineris or Grand Canyon?", answer: "Valles Marineris", explanation: "ואלס מרינריס גבוה יותר מהגרנד קניון" },
    { text: "Which is brighter: Magnetar or Pulsar?", answer: "Magnetar", explanation: "מגנטר בהיר יותר מפולסר" }
  ]
};

// Word Clash word challenges with definitions and sentences
const WORD_CLASH_CHALLENGES = {
  easy: [
    {
      word: "APPLE",
      definitions: [
        "A red or green fruit that grows on trees",
        "A technology company founded by Steve Jobs",
        "A type of computer operating system",
        "A round object used in sports"
      ],
      correctDefinitionIndex: 0,
      sentences: [
        "I eat an apple every day for breakfast",
        "Apple Inc. makes iPhones and MacBooks",
        "The new Apple operating system is very fast",
        "He threw the apple across the field"
      ],
      correctSentenceIndex: 0
    },
    {
      word: "BANK",
      definitions: [
        "A place where people keep their money",
        "The side of a river or stream",
        "A row of keys on a piano",
        "A place to store information"
      ],
      correctDefinitionIndex: 0,
      sentences: [
        "I went to the bank to deposit money",
        "We sat on the bank of the river",
        "She played all the keys on the bank",
        "The computer has a memory bank"
      ],
      correctSentenceIndex: 0
    },
    {
      word: "BAT",
      definitions: [
        "A flying mammal that comes out at night",
        "A wooden stick used in baseball",
        "To hit something",
        "A small animal that lives in caves"
      ],
      correctDefinitionIndex: 0,
      sentences: [
        "The bat flew out of the cave at sunset",
        "He swung the bat and hit the ball",
        "She will bat the ball with her hand",
        "A bat is a nocturnal animal"
      ],
      correctSentenceIndex: 0
    },
    {
      word: "BOW",
      definitions: [
        "To bend forward as a sign of respect",
        "A weapon that shoots arrows",
        "A ribbon tied in a loop",
        "The front of a ship"
      ],
      correctDefinitionIndex: 0,
      sentences: [
        "The actor will bow to the audience",
        "The archer pulled back the bow",
        "She tied a bow in her hair",
        "The ship's bow cut through the waves"
      ],
      correctSentenceIndex: 0
    },
    {
      word: "FAIR",
      definitions: [
        "Just and equal treatment",
        "A place with rides and games",
        "Light in color or complexion",
        "Good weather conditions"
      ],
      correctDefinitionIndex: 0,
      sentences: [
        "The judge made a fair decision",
        "We went to the county fair",
        "She has fair skin and blonde hair",
        "The weather is fair today"
      ],
      correctSentenceIndex: 0
    }
  ]
};

function shuffleWithCorrectIndex(items: string[], correctIndex: number) {
  const paired = items.map((item, index) => ({ item, isCorrect: index === correctIndex }));
  for (let i = paired.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [paired[i], paired[j]] = [paired[j], paired[i]];
  }
  return {
    items: paired.map((p) => p.item),
    correctIndex: paired.findIndex((p) => p.isCorrect),
  };
}

// Helper function to get random word challenge by difficulty
function getRandomWordChallenge(difficulty: string, round: number = 0) {
  const challenges = WORD_CLASH_CHALLENGES[difficulty as keyof typeof WORD_CLASH_CHALLENGES] || WORD_CLASH_CHALLENGES.easy;
  if (!challenges || challenges.length === 0) {
    console.error(`[getRandomWordChallenge] No challenges available for difficulty: ${difficulty}`);
    return null;
  }
  const randomIndex = Math.floor(Math.random() * challenges.length);
  const base = challenges[randomIndex];
  const defs = shuffleWithCorrectIndex(base.definitions, base.correctDefinitionIndex);
  const sents = shuffleWithCorrectIndex(base.sentences, base.correctSentenceIndex);
  return {
    word: base.word,
    definitions: defs.items,
    correctDefinitionIndex: defs.correctIndex,
    sentences: sents.items,
    correctSentenceIndex: sents.correctIndex,
    // Alternate: definition rounds and sentence rounds so UI is clear
    questionType: (round % 2 === 0 ? 'definition' : 'sentence') as 'definition' | 'sentence',
    // Shared countdown for both players — client must sync from this
    startedAt: Date.now(),
  };
}

// Helper function to get random question by difficulty (legacy support)
function getRandomQuestion(difficulty: string) {
  const questions = WORD_CLASH_QUESTIONS[difficulty as keyof typeof WORD_CLASH_QUESTIONS] || WORD_CLASH_QUESTIONS.easy;
  if (!questions || questions.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

// Helper functions for persistent storage using Prisma
async function loadGames() {
  try {
    const games = await prisma.wordClashGame.findMany();
    console.log(`[loadGames] Found ${games.length} games in database`);
    const gamesMap: { [key: string]: any } = {};
    for (const game of games) {
      try {
        // Try to parse currentWord as JSON (if it's a full question object or WordChallenge), otherwise use as text
        let currentQuestion;
        let currentWord;
        try {
          // Only try to parse if currentWord exists and is not empty
          if (game.currentWord && game.currentWord.trim()) {
            try {
              const parsed = JSON.parse(game.currentWord);
              // Check if it's a WordChallenge (has word, definitions, sentences)
              if (parsed.word && parsed.definitions && parsed.sentences) {
                currentWord = parsed;
                currentQuestion = null; // Use currentWord instead
              } else if (parsed.text || parsed.answer) {
                // It's a simple question object
                currentQuestion = parsed;
                currentWord = null;
              } else {
                // Invalid format, use defaults
                currentQuestion = null;
                currentWord = null;
              }
            } catch {
              // If parsing fails, it's just text, create a simple question object
              currentQuestion = { text: game.currentWord, answer: '', explanation: '' };
              currentWord = null;
            }
          } else {
            // Empty or null currentWord
            currentQuestion = null;
            currentWord = null;
          }
        } catch {
          // If parsing fails completely, use defaults
          currentQuestion = null;
          currentWord = null;
        }
        
        // Parse JSON fields with error handling
        let players = {};
        let playerStates = {};
        let lastMove = null;
        let chatMessages: any[] = [];
        let revealedLetters = { player1: [] as string[], player2: [] as string[] };
        
        try {
          if (game.players && game.players.trim()) {
            players = JSON.parse(game.players);
          }
        } catch (e) {
          console.error(`[loadGames] Error parsing players for game ${game.gameId}:`, e);
          players = {}; // Use default empty object
        }
        
        try {
          if (game.playerStates && game.playerStates.trim()) {
            playerStates = JSON.parse(game.playerStates);
          }
        } catch (e) {
          console.error(`[loadGames] Error parsing playerStates for game ${game.gameId}:`, e);
          playerStates = {}; // Use default empty object
        }
        
        if (game.lastMove && game.lastMove.trim()) {
          try {
            lastMove = JSON.parse(game.lastMove);
          } catch (e) {
            console.error(`[loadGames] Error parsing lastMove for game ${game.gameId}:`, e);
            lastMove = null;
          }
        }
        
        if (game.chatMessages && game.chatMessages.trim()) {
          try {
            chatMessages = JSON.parse(game.chatMessages);
            // Ensure it's an array
            if (!Array.isArray(chatMessages)) {
              chatMessages = [];
            }
          } catch (e) {
            console.error(`[loadGames] Error parsing chatMessages for game ${game.gameId}:`, e);
            chatMessages = [];
          }
        }
        
        if (game.revealedLetters && game.revealedLetters.trim()) {
          try {
            revealedLetters = JSON.parse(game.revealedLetters);
            // Ensure it has the correct structure
            if (!revealedLetters.player1 || !Array.isArray(revealedLetters.player1)) {
              revealedLetters.player1 = [];
            }
            if (!revealedLetters.player2 || !Array.isArray(revealedLetters.player2)) {
              revealedLetters.player2 = [];
            }
          } catch (e) {
            console.error(`[loadGames] Error parsing revealedLetters for game ${game.gameId}:`, e);
            revealedLetters = { player1: [] as string[], player2: [] as string[] };
          }
        } else {
          // Ensure revealedLetters is properly initialized even if game.revealedLetters is null/undefined
          revealedLetters = { player1: [] as string[], player2: [] as string[] };
        }
        
        gamesMap[game.gameId] = {
          id: game.gameId,
          status: game.status,
          currentRound: game.currentRound,
          maxRounds: game.maxRounds,
          difficulty: 'easy', // Default, can be extended
          currentQuestion: currentQuestion,
          currentWord: currentWord, // Add currentWord if it exists
          players: players,
          playerStates: playerStates,
          lastMove: lastMove,
          winner: game.winner,
          createdAt: game.createdAt.getTime(),
          updatedAt: game.updatedAt.getTime(),
          chatMessages: chatMessages,
          revealedLetters: revealedLetters
        };
      } catch (error) {
        console.error(`[loadGames] Error processing game ${game.gameId}:`, error);
        // Continue with other games even if one fails
      }
    }
    console.log(`[loadGames] Loaded ${Object.keys(gamesMap).length} games successfully`);
    return gamesMap;
  } catch (error) {
    console.error('[loadGames] Error loading games from database:', error);
    return {};
  }
}

function mapDbRowToGame(game: any) {
  let currentQuestion = null;
  let currentWord = null;
  if (game.currentWord && game.currentWord.trim()) {
    try {
      const parsed = JSON.parse(game.currentWord);
      if (parsed.word && parsed.definitions && parsed.sentences) {
        currentWord = parsed;
      } else if (parsed.text || parsed.answer) {
        currentQuestion = parsed;
      }
    } catch {
      currentQuestion = { text: game.currentWord, answer: '', explanation: '' };
    }
  }

  const safeParse = (raw: string | null | undefined, fallback: any) => {
    if (!raw || !String(raw).trim()) return fallback;
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const players = safeParse(game.players, {});
  const playerStates = safeParse(game.playerStates, {});
  const lastMove = safeParse(game.lastMove, null);
  let chatMessages = safeParse(game.chatMessages, []);
  if (!Array.isArray(chatMessages)) chatMessages = [];
  // Normalize legacy `time` field → timestamp
  chatMessages = chatMessages.map((m: any) => ({
    sender: m?.sender || '',
    text: m?.text || '',
    timestamp: m?.timestamp || m?.time || 0,
    type: m?.type === 'emoji' ? 'emoji' : 'text',
  }));
  let revealedLetters = safeParse(game.revealedLetters, { player1: [], player2: [] });
  if (!Array.isArray(revealedLetters.player1)) revealedLetters.player1 = [];
  if (!Array.isArray(revealedLetters.player2)) revealedLetters.player2 = [];
  const lastEmoji = revealedLetters.lastEmoji && revealedLetters.lastEmoji.emoji
    ? revealedLetters.lastEmoji
    : null;

  return {
    id: game.gameId,
    status: game.status,
    currentRound: game.currentRound,
    maxRounds: game.maxRounds,
    difficulty: 'easy',
    currentQuestion,
    currentWord,
    players,
    playerStates,
    lastMove,
    winner: game.winner,
    createdAt: game.createdAt.getTime(),
    updatedAt: game.updatedAt.getTime(),
    chatMessages,
    lastEmoji,
    revealedLetters: {
      player1: revealedLetters.player1,
      player2: revealedLetters.player2,
    },
  };
}

const ALLOWED_EMOJIS = ['😊', '😢', '😠', '😍', '🤔', '😴', '🎉', '😱', '🤯', '😎', '👍', '👎', '❤️', '🔥', '😂'];

function advanceRoundIfReady(currentGame: any): boolean {
  return wordClashEngine.advanceRoundIfReady(currentGame, {
    getNextWord: (difficulty: string, round: number) => getRandomWordChallenge(difficulty, round),
  });
}

function applyQuestionDeadline(currentGame: any): boolean {
  return wordClashEngine.applyQuestionDeadline(currentGame, {
    getNextWord: (difficulty: string, round: number) => getRandomWordChallenge(difficulty, round),
  });
}

async function syncGameClock(gameId: string, game: any) {
  if (!game) return game;
  // Serialize clock resolution so two polling clients can't double-advance
  return prisma.$transaction(async (tx) => {
    const row = await tx.wordClashGame.findUnique({ where: { gameId } });
    if (!row) return game;
    const fresh = mapDbRowToGame(row);
    const changed = applyQuestionDeadline(fresh);
    if (!changed) return fresh;

    fresh.updatedAt = Date.now();
    let currentQuestionStr = '';
    if (fresh.currentWord) currentQuestionStr = JSON.stringify(fresh.currentWord);
    else if (fresh.currentQuestion) currentQuestionStr = JSON.stringify(fresh.currentQuestion);

    await tx.wordClashGame.update({
      where: { gameId },
      data: {
        status: fresh.status || 'waiting',
        currentRound: fresh.currentRound || 0,
        maxRounds: fresh.maxRounds || 5,
        currentWord: currentQuestionStr,
        players: JSON.stringify(fresh.players || {}),
        playerStates: JSON.stringify(fresh.playerStates || {}),
        lastMove: fresh.lastMove ? JSON.stringify(fresh.lastMove) : null,
        winner: fresh.winner || null,
        chatMessages: fresh.chatMessages ? JSON.stringify(fresh.chatMessages) : null,
        revealedLetters: JSON.stringify({
          player1: fresh.revealedLetters?.player1 || [],
          player2: fresh.revealedLetters?.player2 || [],
          ...(fresh.lastEmoji ? { lastEmoji: fresh.lastEmoji } : {}),
        }),
      },
    });
    return fresh;
  });
}

async function loadGameById(gameId: string) {
  const game = await prisma.wordClashGame.findUnique({ where: { gameId } });
  if (!game) return null;
  return mapDbRowToGame(game);
}

async function saveGame(gameId: string, gameData: any) {
  try {
    const existingGame = await prisma.wordClashGame.findUnique({
      where: { gameId }
    });

    // Save currentQuestion or currentWord as JSON string in currentWord field
    let currentQuestionStr = '';
    try {
      if (gameData.currentWord) {
        currentQuestionStr = JSON.stringify(gameData.currentWord);
      } else if (gameData.currentQuestion) {
        currentQuestionStr = JSON.stringify(gameData.currentQuestion);
      }
    } catch (error) {
      console.error(`[saveGame] Error stringifying currentWord/currentQuestion:`, error);
      currentQuestionStr = '';
    }
    
    // Keep lastEmoji inside revealedLetters JSON (shared column, no migration)
    const revealedPayload = {
      player1: gameData.revealedLetters?.player1 || [],
      player2: gameData.revealedLetters?.player2 || [],
      ...(gameData.lastEmoji ? { lastEmoji: gameData.lastEmoji } : (gameData.revealedLetters?.lastEmoji ? { lastEmoji: gameData.revealedLetters.lastEmoji } : {})),
    };

    const gameRecord = {
      gameId: gameData.id || gameId,
      status: gameData.status || 'waiting',
      currentRound: gameData.currentRound || 0,
      maxRounds: gameData.maxRounds || 5,
      currentWord: currentQuestionStr,
      players: JSON.stringify(gameData.players || {}),
      playerStates: JSON.stringify(gameData.playerStates || {}),
      lastMove: gameData.lastMove ? JSON.stringify(gameData.lastMove) : null,
      winner: gameData.winner || null,
      chatMessages: gameData.chatMessages ? JSON.stringify(gameData.chatMessages) : null,
      revealedLetters: JSON.stringify(revealedPayload),
    };

    if (existingGame) {
      console.log(`[saveGame] Updating existing game: ${gameId}`);
      await prisma.wordClashGame.update({
        where: { gameId },
        data: gameRecord
      });
      console.log(`[saveGame] Game ${gameId} updated successfully`);
    } else {
      console.log(`[saveGame] Creating new game: ${gameId}`);
      await prisma.wordClashGame.create({
        data: gameRecord
      });
      console.log(`[saveGame] Game ${gameId} created successfully`);
    }
  } catch (error) {
    console.error(`[saveGame] Error saving game ${gameId}:`, error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, gameId, playerId, playerName, difficulty = 'easy' } = body;
    console.log(`[POST] Action: ${action}, gameId: ${gameId}, playerId: ${playerId}`);
    
    // Input validation - action is always required
    if (!action) {
      return NextResponse.json({ error: 'Missing action field' }, { status: 400 });
    }

    // Rate limiting — allow more room for active play (moves/chat)
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const limit = (action === 'move' || action === 'chat' || action === 'emoji') ? 120 : 30;
    if (!rateLimit(`${clientIP}:${action}`, limit, 60000)) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    // Sanitize inputs (only if playerId and playerName are provided)
    let sanitizedPlayerId = '';
    let sanitizedPlayerName = '';
    
    // playerId and playerName are required for create and join actions
    if (action === 'create' || action === 'join') {
      if (!playerId || !playerName) {
        return NextResponse.json({ error: 'Missing required fields: playerId and playerName are required for create/join actions' }, { status: 400 });
      }
      
      sanitizedPlayerId = playerId.toString().replace(/[<>\"'&]/g, '');
      sanitizedPlayerName = playerName.toString().replace(/[<>\"'&]/g, '');
      
      // Length validation
      if (sanitizedPlayerId.length > 128 || sanitizedPlayerName.length > 80) {
        return NextResponse.json({ error: 'Input too long' }, { status: 400 });
      }
      
      if (sanitizedPlayerId.length === 0 || sanitizedPlayerName.length === 0) {
        return NextResponse.json({ error: 'Input cannot be empty' }, { status: 400 });
      }
    } else if (action === 'move') {
      // For move action, playerId should come from body (already parsed)
      if (!playerId) {
        return NextResponse.json({ error: 'Missing required field: playerId is required for move action' }, { status: 400 });
      }
      sanitizedPlayerId = playerId.toString().replace(/[<>\"'&]/g, '');
    } else if (action === 'chat' || action === 'emoji') {
      if (!playerId) {
        return NextResponse.json({ error: 'Missing required field: playerId is required for chat/emoji actions' }, { status: 400 });
      }
      sanitizedPlayerId = playerId.toString().replace(/[<>\"'&]/g, '');
    }

    switch (action) {
      case 'create':
        const newGameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Get random word challenge based on difficulty
        const randomWordChallenge = getRandomWordChallenge(difficulty, 0);
        
        // Validate that we got a valid challenge
        if (!randomWordChallenge) {
          return NextResponse.json({ 
            error: 'Failed to generate word challenge. Please try again.',
            details: 'No challenges available for the selected difficulty'
          }, { status: 500 });
        }
        
        const newGame = {
          id: newGameId,
          status: 'waiting',
          currentRound: 0,
          maxRounds: 5,
          difficulty: difficulty,
          currentWord: randomWordChallenge,
          currentQuestion: null, // Use currentWord instead
          players: {
            player1: sanitizedPlayerId,
            player2: null
          },
          playerStates: {
            player1: {
              score: 0,
              isReady: true,
              hasAnswered: false,
              powerUps: {
                revealLetter: 3,
                skipWord: 2,
                freezeOpponent: 1
              }
            },
            player2: {
              score: 0,
              isReady: false,
              hasAnswered: false,
              powerUps: {
                revealLetter: 3,
                skipWord: 2,
                freezeOpponent: 1
              }
            }
          },
          lastMove: null,
          winner: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          chatMessages: [],
          revealedLetters: {
            player1: [],
            player2: []
          }
        };
        
        // Save new game to database
        try {
          await saveGame(newGameId, newGame);
          console.log('[POST create] Game saved successfully:', newGameId);
        } catch (saveError: any) {
          console.error('[POST create] Error saving game:', saveError);
          
          // Check if it's a Prisma P2000 error (column too long)
          if (saveError?.code === 'P2000' && saveError?.meta?.column_name) {
            const columnName = saveError.meta.column_name;
            console.error(`[POST create] Database column ${columnName} is too small. Run: npx prisma db push`);
            return NextResponse.json({ 
              error: `Database schema needs update. Please run: npx prisma db push`,
              details: `Column ${columnName} is too small for the data`
            }, { status: 500 });
          }
          
          return NextResponse.json({ 
            error: 'Failed to save game to database',
            details: saveError?.message || 'Unknown error'
          }, { status: 500 });
        }
        
        console.log('[POST create] Created game:', newGameId, 'for player:', sanitizedPlayerId);
        return NextResponse.json({ gameId: newGameId, game: newGame });

      case 'join': {
        console.log(`[POST join] Attempting to join game: ${gameId}`);
        if (!gameId) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const joinResult = await prisma.$transaction(async (tx) => {
          const row = await tx.wordClashGame.findUnique({ where: { gameId } });
          if (!row) return { error: 'not_found' as const };
          const existingGame = mapDbRowToGame(row);

          if (existingGame.status === 'finished') return { error: 'finished' as const };
          if (!existingGame.players) return { error: 'invalid' as const };

          if (
            existingGame.players.player1 === sanitizedPlayerId ||
            existingGame.players.player2 === sanitizedPlayerId
          ) {
            return { game: existingGame };
          }

          if (existingGame.players.player2) return { error: 'full' as const };

          if (!existingGame.playerStates) {
            existingGame.playerStates = {
              player1: { score: 0, isReady: true, hasAnswered: false, powerUps: { revealLetter: 3, skipWord: 2, freezeOpponent: 1 } },
              player2: { score: 0, isReady: true, hasAnswered: false, powerUps: { revealLetter: 3, skipWord: 2, freezeOpponent: 1 } },
            };
          }

          existingGame.players.player2 = sanitizedPlayerId;
          existingGame.status = 'active';
          existingGame.updatedAt = Date.now();
          existingGame.playerStates.player2 = {
            score: existingGame.playerStates.player2?.score || 0,
            isReady: true,
            hasAnswered: false,
            powerUps: existingGame.playerStates.player2?.powerUps || { revealLetter: 3, skipWord: 2, freezeOpponent: 1 },
          };
          if (existingGame.playerStates.player1) {
            existingGame.playerStates.player1.hasAnswered = false;
          }
          // Start the shared 20s clock when the match actually begins
          if (existingGame.currentWord) {
            existingGame.currentWord.startedAt = Date.now();
          } else {
            existingGame.currentWord = getRandomWordChallenge(existingGame.difficulty || 'easy', existingGame.currentRound || 0);
          }

          let currentQuestionStr = '';
          if (existingGame.currentWord) currentQuestionStr = JSON.stringify(existingGame.currentWord);
          else if (existingGame.currentQuestion) currentQuestionStr = JSON.stringify(existingGame.currentQuestion);

          await tx.wordClashGame.update({
            where: { gameId },
            data: {
              status: existingGame.status,
              currentRound: existingGame.currentRound || 0,
              maxRounds: existingGame.maxRounds || 5,
              currentWord: currentQuestionStr,
              players: JSON.stringify(existingGame.players || {}),
              playerStates: JSON.stringify(existingGame.playerStates || {}),
              lastMove: existingGame.lastMove ? JSON.stringify(existingGame.lastMove) : null,
              winner: existingGame.winner || null,
              chatMessages: existingGame.chatMessages ? JSON.stringify(existingGame.chatMessages) : null,
              revealedLetters: JSON.stringify({
                player1: existingGame.revealedLetters?.player1 || [],
                player2: existingGame.revealedLetters?.player2 || [],
                ...(existingGame.lastEmoji ? { lastEmoji: existingGame.lastEmoji } : {}),
              }),
            },
          });

          return { game: existingGame };
        });

        if ('error' in joinResult && joinResult.error) {
          if (joinResult.error === 'not_found') return NextResponse.json({ error: 'Game not found' }, { status: 404 });
          if (joinResult.error === 'finished') return NextResponse.json({ error: 'Game is finished' }, { status: 400 });
          if (joinResult.error === 'full') return NextResponse.json({ error: 'Game is full' }, { status: 400 });
          return NextResponse.json({ error: 'Game has invalid structure' }, { status: 500 });
        }

        console.log(`[POST join] Player joined game: ${gameId}, player: ${sanitizedPlayerId}`);
        return NextResponse.json({ game: joinResult.game });
      }

      case 'get': {
        console.log(`[GET] Fetching game: ${gameId}`);
        if (!gameId) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }
        const gameData = await loadGameById(gameId);
        if (!gameData) {
          console.log(`[GET] Game not found: ${gameId}`);
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }
        console.log(`[GET] Found game ${gameId}, status: ${gameData.status}`);
        return NextResponse.json({ game: gameData });
      }

      case 'move': {
        if (!gameId) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const { answer, selectedIndex, playerId: movePlayerId } = body;
        const movePlayerIdSanitized = movePlayerId ? movePlayerId.toString().replace(/[<>\"'&]/g, '') : sanitizedPlayerId;

        if (!answer || (answer !== 'definition' && answer !== 'sentence' && answer !== 'timeout')) {
          return NextResponse.json({ error: 'Invalid answer type' }, { status: 400 });
        }

        if (answer !== 'timeout' && (typeof selectedIndex !== 'number' || selectedIndex < 0)) {
          return NextResponse.json({ error: 'Invalid selected index' }, { status: 400 });
        }

        // Serialize concurrent answers so both players' moves are applied
        const moveResult = await prisma.$transaction(async (tx) => {
          const row = await tx.wordClashGame.findUnique({ where: { gameId } });
          if (!row) return { error: 'not_found' as const };
          const currentGame = mapDbRowToGame(row);

          if (currentGame.status !== 'active') {
            return { error: 'not_active' as const, game: currentGame };
          }
          if (!currentGame.players || !currentGame.players.player1) {
            return { error: 'invalid' as const };
          }

          // Expire shared clock first (may advance the round)
          applyQuestionDeadline(currentGame);

          let playerSymbol: 'player1' | 'player2' | null = null;
          if (currentGame.players.player1 === movePlayerIdSanitized) playerSymbol = 'player1';
          else if (currentGame.players.player2 === movePlayerIdSanitized) playerSymbol = 'player2';
          if (!playerSymbol) return { error: 'not_in_game' as const };

          if (!currentGame.playerStates) {
            currentGame.playerStates = {
              player1: { score: 0, isReady: true, powerUps: { revealLetter: 3, skipWord: 2, freezeOpponent: 1 }, hasAnswered: false },
              player2: { score: 0, isReady: true, powerUps: { revealLetter: 3, skipWord: 2, freezeOpponent: 1 }, hasAnswered: false },
            };
          }
          if (!currentGame.playerStates[playerSymbol]) {
            currentGame.playerStates[playerSymbol] = {
              score: 0, isReady: true, powerUps: { revealLetter: 3, skipWord: 2, freezeOpponent: 1 }, hasAnswered: false,
            };
          }

          // Ignore stale answers from a previous question (main cause of skipping rounds)
          const clientRound = typeof body.round === 'number' ? body.round : null;
          if (clientRound !== null && clientRound !== currentGame.currentRound) {
            return { game: currentGame };
          }
          if (currentGame.status !== 'active') {
            return { game: currentGame };
          }

          if (currentGame.playerStates[playerSymbol].hasAnswered === true) {
            return { game: currentGame };
          }

          const expectedType =
            currentGame.currentWord?.questionType ||
            ((currentGame.currentRound || 0) % 2 === 0 ? 'definition' : 'sentence');

          if (answer !== 'timeout' && answer !== expectedType) {
            return { error: 'wrong_type' as const };
          }

          if (answer !== 'timeout' && currentGame.currentWord) {
            if (answer === 'definition') {
              if (!currentGame.currentWord.definitions || selectedIndex >= currentGame.currentWord.definitions.length) {
                return { error: 'bounds' as const };
              }
            } else if (answer === 'sentence') {
              if (!currentGame.currentWord.sentences || selectedIndex >= currentGame.currentWord.sentences.length) {
                return { error: 'bounds' as const };
              }
            }
          }

          let isCorrect = false;
          if (answer === 'timeout') {
            isCorrect = false;
          } else if (currentGame.currentWord) {
            if (answer === 'definition') {
              isCorrect = currentGame.currentWord.correctDefinitionIndex === selectedIndex;
            } else if (answer === 'sentence') {
              isCorrect = currentGame.currentWord.correctSentenceIndex === selectedIndex;
            }
          }

          currentGame.playerStates[playerSymbol].hasAnswered = true;
          currentGame.playerStates[playerSymbol].lastAnswerTime = Date.now();
          currentGame.lastMove = {
            player: playerSymbol,
            answer,
            isCorrect,
            time: Date.now(),
            selectedIndex: typeof selectedIndex === 'number' ? selectedIndex : -1,
          };
          if (isCorrect) {
            currentGame.playerStates[playerSymbol].score += 10;
          }

          // Keep lastMove so both clients can show feedback for the round that just ended
          advanceRoundIfReady(currentGame);

          currentGame.updatedAt = Date.now();

          let currentQuestionStr = '';
          if (currentGame.currentWord) currentQuestionStr = JSON.stringify(currentGame.currentWord);
          else if (currentGame.currentQuestion) currentQuestionStr = JSON.stringify(currentGame.currentQuestion);

          await tx.wordClashGame.update({
            where: { gameId },
            data: {
              status: currentGame.status || 'waiting',
              currentRound: currentGame.currentRound || 0,
              maxRounds: currentGame.maxRounds || 5,
              currentWord: currentQuestionStr,
              players: JSON.stringify(currentGame.players || {}),
              playerStates: JSON.stringify(currentGame.playerStates || {}),
              lastMove: currentGame.lastMove ? JSON.stringify(currentGame.lastMove) : null,
              winner: currentGame.winner || null,
              chatMessages: currentGame.chatMessages ? JSON.stringify(currentGame.chatMessages) : null,
              revealedLetters: JSON.stringify({
                player1: currentGame.revealedLetters?.player1 || [],
                player2: currentGame.revealedLetters?.player2 || [],
                ...(currentGame.lastEmoji ? { lastEmoji: currentGame.lastEmoji } : {}),
              }),
            },
          });

          return { game: currentGame };
        });

        if ('error' in moveResult && moveResult.error) {
          if (moveResult.error === 'not_found') return NextResponse.json({ error: 'Game not found' }, { status: 404 });
          if (moveResult.error === 'not_active') return NextResponse.json({ error: 'Game is not active', game: moveResult.game }, { status: 400 });
          if (moveResult.error === 'not_in_game') return NextResponse.json({ error: 'Player not in game' }, { status: 400 });
          if (moveResult.error === 'wrong_type') return NextResponse.json({ error: 'Wrong question type for this round' }, { status: 400 });
          if (moveResult.error === 'bounds') return NextResponse.json({ error: 'Selected index out of bounds' }, { status: 400 });
          return NextResponse.json({ error: 'Game has invalid structure' }, { status: 500 });
        }

        return NextResponse.json({ game: moveResult.game });
      }

      case 'chat': {
        if (!gameId) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const chatGame = await loadGameById(gameId);
        if (!chatGame) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        if (
          chatGame.players?.player1 !== sanitizedPlayerId &&
          chatGame.players?.player2 !== sanitizedPlayerId
        ) {
          return NextResponse.json({ error: 'Player not in game' }, { status: 400 });
        }

        const { message } = body;

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
          return NextResponse.json({ error: 'Invalid message' }, { status: 400 });
        }

        const sanitizedMessage = message.toString().replace(/[<>\"'&]/g, '').trim();
        if (sanitizedMessage.length === 0) {
          return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
        }

        if (sanitizedMessage.length > 500) {
          return NextResponse.json({ error: 'Message too long (max 500 characters)' }, { status: 400 });
        }

        if (!chatGame.chatMessages) chatGame.chatMessages = [];

        chatGame.chatMessages.push({
          sender: sanitizedPlayerId,
          text: sanitizedMessage,
          timestamp: Date.now(),
          type: 'text',
        });

        if (chatGame.chatMessages.length > 100) {
          chatGame.chatMessages = chatGame.chatMessages.slice(-100);
        }

        chatGame.updatedAt = Date.now();
        await saveGame(gameId, chatGame);
        return NextResponse.json({ game: chatGame });
      }

      case 'emoji': {
        if (!gameId) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const emojiGame = await loadGameById(gameId);
        if (!emojiGame) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        if (
          emojiGame.players?.player1 !== sanitizedPlayerId &&
          emojiGame.players?.player2 !== sanitizedPlayerId
        ) {
          return NextResponse.json({ error: 'Player not in game' }, { status: 400 });
        }

        const rawEmoji = typeof body.emoji === 'string' ? body.emoji.trim() : '';
        const normalized = rawEmoji.replace(/\uFE0F/g, '');
        const matched = ALLOWED_EMOJIS.find((e) => e.replace(/\uFE0F/g, '') === normalized);
        if (!matched) {
          return NextResponse.json({ error: 'Emoji not allowed' }, { status: 400 });
        }

        const now = Date.now();
        if (!emojiGame.chatMessages) emojiGame.chatMessages = [];
        emojiGame.chatMessages.push({
          sender: sanitizedPlayerId,
          text: matched,
          timestamp: now,
          type: 'emoji',
        });
        if (emojiGame.chatMessages.length > 100) {
          emojiGame.chatMessages = emojiGame.chatMessages.slice(-100);
        }

        emojiGame.lastEmoji = {
          sender: sanitizedPlayerId,
          emoji: matched,
          time: now,
        };
        // Persist lastEmoji inside revealedLetters JSON (no schema migration)
        emojiGame.revealedLetters = {
          player1: emojiGame.revealedLetters?.player1 || [],
          player2: emojiGame.revealedLetters?.player2 || [],
          lastEmoji: emojiGame.lastEmoji,
        };

        emojiGame.updatedAt = now;
        await saveGame(gameId, emojiGame);
        return NextResponse.json({ game: emojiGame });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('[POST] Game API error:', error);
    console.error('[POST] Error stack:', error?.stack);
    console.error('[POST] Error message:', error?.message);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error?.message : undefined
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get('gameId');
    
    console.log(`[GET endpoint] Requested gameId: ${gameId}`);
    
    if (!gameId) {
      return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
    }

    const game = await loadGameById(gameId);
    if (!game) {
      console.log(`[GET endpoint] Game ${gameId} not found`);
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }
    
    const synced = await syncGameClock(gameId, game);
    console.log(`[GET endpoint] Returning game ${gameId}`);
    return NextResponse.json({ game: synced });
  } catch (error) {
    console.error('[GET endpoint] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
