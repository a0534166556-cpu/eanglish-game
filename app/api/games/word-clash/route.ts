import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '../../../../lib/rateLimiter';
import { prisma } from '@/lib/prisma';

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

// Word challenges for Word Clash game
const WORD_CHALLENGES = {
  easy: [
    {
      word: 'APPLE',
      definitions: [
        'A red or green fruit that grows on trees',
        'A type of computer made by Apple Inc.',
        'A round object used in sports',
        'A color between red and yellow'
      ],
      correctDefinitionIndex: 0,
      sentences: [
        'I eat an apple every day for breakfast.',
        'The apple is a popular fruit worldwide.',
        'She bought a red apple from the store.',
        'An apple a day keeps the doctor away.'
      ],
      correctSentenceIndex: 0
    },
    {
      word: 'CAT',
      definitions: [
        'A small furry animal that meows',
        'A type of vehicle',
        'A tool for cutting',
        'A musical instrument'
      ],
      correctDefinitionIndex: 0,
      sentences: [
        'My cat likes to sleep on the sofa.',
        'The cat is playing with a ball.',
        'She has a black and white cat.',
        'The cat caught a mouse.'
      ],
      correctSentenceIndex: 0
    },
    {
      word: 'DOG',
      definitions: [
        'A loyal animal that barks',
        'A type of food',
        'A weather condition',
        'A piece of furniture'
      ],
      correctDefinitionIndex: 0,
      sentences: [
        'The dog is playing in the park.',
        'My dog loves to go for walks.',
        'She has a friendly dog.',
        'The dog is very happy.'
      ],
      correctSentenceIndex: 0
    },
    {
      word: 'HOUSE',
      definitions: [
        'A building where people live',
        'A type of music',
        'A game',
        'A color'
      ],
      correctDefinitionIndex: 0,
      sentences: [
        'I live in a big house.',
        'The house has three bedrooms.',
        'She bought a new house.',
        'Our house is near the school.'
      ],
      correctSentenceIndex: 0
    },
    {
      word: 'BOOK',
      definitions: [
        'Pages bound together for reading',
        'A type of food',
        'A vehicle',
        'A musical instrument'
      ],
      correctDefinitionIndex: 0,
      sentences: [
        'I read a book every night.',
        'The book is very interesting.',
        'She wrote a new book.',
        'This book has 300 pages.'
      ],
      correctSentenceIndex: 0
    }
  ],
  medium: [
    {
      word: 'ELEPHANT',
      definitions: [
        'A large gray animal with a trunk',
        'A type of building',
        'A musical instrument',
        'A color'
      ],
      correctDefinitionIndex: 0,
      sentences: [
        'The elephant is the largest land animal.',
        'An elephant has a long trunk.',
        'She saw an elephant at the zoo.',
        'The elephant is very intelligent.'
      ],
      correctSentenceIndex: 0
    },
    {
      word: 'COMPUTER',
      definitions: [
        'An electronic device for processing data',
        'A type of food',
        'A vehicle',
        'A game'
      ],
      correctDefinitionIndex: 0,
      sentences: [
        'I use my computer every day.',
        'The computer is very fast.',
        'She bought a new computer.',
        'This computer has 16GB of RAM.'
      ],
      correctSentenceIndex: 0
    }
  ],
  hard: [
    {
      word: 'PHILOSOPHY',
      definitions: [
        'The study of fundamental questions about existence',
        'A type of food',
        'A vehicle',
        'A game'
      ],
      correctDefinitionIndex: 0,
      sentences: [
        'She studies philosophy at university.',
        'Philosophy asks deep questions about life.',
        'Ancient Greek philosophy is still studied today.',
        'The philosophy of science is fascinating.'
      ],
      correctSentenceIndex: 0
    }
  ]
};

// Sentences for recording and dictation
const SENTENCES_FOR_PRACTICE = {
  easy: [
    'I love cats.',
    'The cat is big.',
    'I drink tea.',
    'We go to the park.',
    'He reads a book.',
    'I like blue.',
    'The sun is hot.',
    'Close the door.',
    'They eat lunch.',
    'Can you help me?'
  ],
  medium: [
    'I like to play football.',
    'The cat is sleeping on the sofa.',
    'She drinks a cup of tea.',
    'We are going to the park.',
    'He reads a book every night.',
    'My favorite color is blue.',
    'The sun is shining today.',
    'Please close the window.',
    'They are eating lunch together.',
    'Can you help me with homework?'
  ],
  hard: [
    'The students are studying for their exam.',
    'We should protect the environment.',
    'I enjoy listening to classical music.',
    'The teacher explains the lesson clearly.',
    'They are planning a summer vacation.',
    'She works at a large company.',
    'We need to finish this project today.',
    'The museum has many interesting exhibits.',
    'He practices piano every afternoon.',
    'The restaurant serves delicious food.'
  ]
};

// Helper function to create different question types
function createQuestionByType(type: string, difficulty: string, roundNumber: number, previousQuestions: any[] = []): any {
  const baseChallenge = WORD_CHALLENGES[difficulty as keyof typeof WORD_CHALLENGES] || WORD_CHALLENGES.easy;
  const randomIndex = Math.floor(Math.random() * baseChallenge.length);
  const base = baseChallenge[randomIndex];
  
  const sentences = SENTENCES_FOR_PRACTICE[difficulty as keyof typeof SENTENCES_FOR_PRACTICE] || SENTENCES_FOR_PRACTICE.easy;
  const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
  
  // Check if this sentence was recorded earlier in the game
  const wasRecorded = previousQuestions.some(q => 
    q.questionType === 'recording' && q.sentenceToRecord === randomSentence
  );
  
  switch (type) {
    case 'multiple-choice':
      console.log('📝 Creating multiple-choice question:', {
        word: base.word,
        definitions: base.definitions,
        correctDefinitionIndex: base.correctDefinitionIndex,
        correctDefinition: base.definitions[base.correctDefinitionIndex]
      });
      return {
        word: base.word,
        questionType: 'multiple-choice',
        definitions: base.definitions,
        correctDefinitionIndex: base.correctDefinitionIndex
      };
    
    case 'sentence-choice':
      console.log('📝 Creating sentence-choice question:', {
        word: base.word,
        sentences: base.sentences,
        correctSentenceIndex: base.correctSentenceIndex,
        correctSentence: base.sentences[base.correctSentenceIndex]
      });
      return {
        word: base.word,
        questionType: 'sentence-choice',
        sentences: base.sentences,
        correctSentenceIndex: base.correctSentenceIndex
      };
    
    case 'recording':
      return {
        word: base.word,
        questionType: 'recording',
        sentenceToRecord: randomSentence,
        wasRecorded: false
      };
    
    case 'sentence-scramble':
      const words = randomSentence.replace(/[.,!?]/g, '').split(' ');
      const scrambled = [...words].sort(() => Math.random() - 0.5);
      return {
        word: base.word,
        questionType: 'sentence-scramble',
        scrambledWords: scrambled,
        correctSentence: randomSentence
      };
    
    case 'dictation':
      return {
        word: base.word,
        questionType: 'dictation',
        sentenceToRecord: randomSentence,
        wasRecorded: wasRecorded
      };
    
    default:
      return {
        word: base.word,
        questionType: 'multiple-choice',
        definitions: base.definitions,
        correctDefinitionIndex: base.correctDefinitionIndex
      };
  }
}

// Helper function to get random word challenge by difficulty with question type rotation
function getRandomWordChallenge(difficulty: string, roundNumber: number = 0, previousQuestions: any[] = []) {
  // Rotate question types: multiple-choice, sentence-choice, recording, sentence-scramble, dictation
  const questionTypes: string[] = ['multiple-choice', 'sentence-choice', 'recording', 'sentence-scramble', 'dictation'];
  const questionType = questionTypes[roundNumber % questionTypes.length];
  
  return createQuestionByType(questionType, difficulty, roundNumber, previousQuestions);
}

// Helper function to get random question by difficulty (kept for backward compatibility)
function getRandomQuestion(difficulty: string) {
  const questions = WORD_CLASH_QUESTIONS[difficulty as keyof typeof WORD_CLASH_QUESTIONS] || WORD_CLASH_QUESTIONS.easy;
  const randomIndex = Math.floor(Math.random() * questions.length);
  return questions[randomIndex];
}

// Helper functions for persistent storage
async function loadGames() {
  try {
    const games = await prisma.wordClashGame.findMany();
    const gamesMap: Record<string, any> = {};
    
    for (const game of games) {
      try {
        const currentWordData = JSON.parse(game.currentWord);
        gamesMap[game.gameId] = {
          gameId: game.gameId,
          status: game.status,
          currentRound: game.currentRound,
          maxRounds: game.maxRounds,
          difficulty: currentWordData.difficulty || 'easy',
          currentWord: currentWordData,
          players: JSON.parse(game.players),
          playerStates: JSON.parse(game.playerStates),
          lastMove: game.lastMove ? JSON.parse(game.lastMove) : null,
          winner: game.winner,
          createdAt: game.createdAt.getTime(),
          updatedAt: game.updatedAt.getTime(),
          chatMessages: game.chatMessages ? JSON.parse(game.chatMessages) : [],
          revealedLetters: game.revealedLetters ? JSON.parse(game.revealedLetters) : {},
          // Additional fields that might be in the game object
          previousQuestions: currentWordData.previousQuestions || [],
          questionResults: currentWordData.questionResults || {},
          timerStartTime: currentWordData.timerStartTime,
          timeLeft: currentWordData.timeLeft,
        };
      } catch (parseError) {
        console.error('Error parsing game data:', game.gameId, parseError);
      }
    }
    
    return gamesMap;
  } catch (error) {
    console.error('Error loading games from database:', error);
    return {};
  }
}

async function saveGames(games: Record<string, any>) {
  try {
    for (const [gameId, gameData] of Object.entries(games)) {
      const gameToSave = {
        gameId: gameId,
        status: gameData.status || 'waiting',
        currentRound: gameData.currentRound || 0,
        maxRounds: gameData.maxRounds || 5,
        currentWord: JSON.stringify({
          ...gameData.currentWord,
          difficulty: gameData.difficulty || 'easy',
          previousQuestions: gameData.previousQuestions || [],
          questionResults: gameData.questionResults || {},
          timerStartTime: gameData.timerStartTime,
          timeLeft: gameData.timeLeft,
        }),
        players: JSON.stringify(gameData.players || {}),
        playerStates: JSON.stringify(gameData.playerStates || {}),
        lastMove: gameData.lastMove ? JSON.stringify(gameData.lastMove) : null,
        winner: gameData.winner || null,
        chatMessages: gameData.chatMessages ? JSON.stringify(gameData.chatMessages) : null,
        revealedLetters: gameData.revealedLetters ? JSON.stringify(gameData.revealedLetters) : null,
      };

      await prisma.wordClashGame.upsert({
        where: { gameId: gameId },
        update: gameToSave,
        create: gameToSave,
      });
    }
  } catch (error) {
    console.error('Error saving games to database:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!rateLimit(clientIP, 10, 60000)) { // 10 requests per minute
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
    }
    
    // Parse request body once - can only be read once
    const body = await req.json();
    const { action, gameId, playerId, playerName, difficulty = 'easy', answer, selectedIndex, answerValue } = body;
    
    // Input validation - 'start' and 'get' actions don't require playerId/playerName
    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }
    
    // Sanitize playerId and playerName if provided
    const sanitizedPlayerId = playerId ? playerId.toString().replace(/[<>\"'&]/g, '') : '';
    const sanitizedPlayerName = playerName ? playerName.toString().replace(/[<>\"'&]/g, '') : '';
    
    // For actions that require playerId and playerName
    if (action !== 'start' && action !== 'get') {
      if (!playerId || !playerName) {
        return NextResponse.json({ error: 'Missing required fields: playerId and playerName' }, { status: 400 });
      }
      
      // Length validation
      if (sanitizedPlayerId.length > 50 || sanitizedPlayerName.length > 50) {
        return NextResponse.json({ error: 'Input too long' }, { status: 400 });
      }
      
      if (sanitizedPlayerId.length === 0 || sanitizedPlayerName.length === 0) {
        return NextResponse.json({ error: 'Input cannot be empty' }, { status: 400 });
      }
    }

    switch (action) {
      case 'create':
        const newGameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Get random word challenge based on difficulty with question type rotation
        const randomWordChallenge = getRandomWordChallenge(difficulty, 0, []);
        
        const newGame = {
          gameId: newGameId,
          status: 'waiting',
          currentRound: 0,
          maxRounds: 5,
          difficulty: difficulty,
          currentWord: randomWordChallenge,
          previousQuestions: [], // Track previous questions for dictation logic
          questionResults: {},
          timerStartTime: undefined,
          timeLeft: 20,
          players: {
            player1: sanitizedPlayerId,
            player2: null,
            player3: null
          },
          playerStates: {
            player1: {
              score: 0,
              isReady: false, // יוצר המשחק לא מוכן אוטומטית
              lastAnswerTime: undefined,
              powerUps: {
                revealLetter: 3,
                skipWord: 2,
                freezeOpponent: 1
              }
            },
            player2: {
              score: 0,
              isReady: false,
              lastAnswerTime: undefined,
              powerUps: {
                revealLetter: 3,
                skipWord: 2,
                freezeOpponent: 1
              }
            },
            player3: {
              score: 0,
              isReady: false,
              lastAnswerTime: undefined,
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
            player2: [],
            player3: []
          }
        };
        
        // Load existing games
        const createGames = await loadGames();
        
        // Save new game
        createGames[newGameId] = newGame;
        await saveGames(createGames);
        
        console.log('Created game:', newGameId, 'for player:', sanitizedPlayerId);
        console.log('Games saved to database');
        console.log('Game data:', JSON.stringify(newGame, null, 2));
        
        return NextResponse.json({ gameId: newGameId, game: newGame });

      case 'join':
        // Load existing games
        const joinGames = await loadGames();
        
        if (!gameId || !joinGames[gameId]) {
          console.log('Game not found:', gameId);
          console.log('Available games:', Object.keys(joinGames));
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const existingGame = joinGames[gameId];
        
        // בדיקה אם המשתמש כבר במשחק
        if (existingGame.players.player1 === sanitizedPlayerId) {
          console.log('User is already player1 in this game');
          return NextResponse.json({ game: existingGame });
        }
        
        if (existingGame.players.player2 === sanitizedPlayerId) {
          console.log('User is already player2 in this game');
          return NextResponse.json({ game: existingGame });
        }
        
        if (existingGame.players.player3 === sanitizedPlayerId) {
          console.log('User is already player3 in this game');
          return NextResponse.json({ game: existingGame });
        }
        
        // בדיקה אם המשחק מלא (3 שחקנים)
        if (existingGame.players.player1 && existingGame.players.player2 && existingGame.players.player3) {
          console.log('Game is full:', gameId);
          return NextResponse.json({ error: 'המשחק מלא (3 שחקנים)' }, { status: 400 });
        }

        // הוספת שחקן למקום הפנוי הראשון
        if (!existingGame.players.player2) {
          existingGame.players.player2 = sanitizedPlayerId;
          existingGame.playerStates.player2.isReady = false;
        } else if (!existingGame.players.player3) {
          existingGame.players.player3 = sanitizedPlayerId;
          existingGame.playerStates.player3.isReady = false;
        }
        
        // המשחק נשאר ב-'waiting' עד שיוחלט להתחיל אותו
        existingGame.status = 'waiting';
        
        existingGame.updatedAt = Date.now();
        
        // Save updated game
        joinGames[gameId] = existingGame;
        await saveGames(joinGames);
        
        console.log('Player joined game:', gameId, 'player:', sanitizedPlayerId);
        console.log('Game status:', existingGame.status);
        console.log('Players:', existingGame.players);
        
        return NextResponse.json({ game: existingGame });

      case 'get':
        // Load existing games
        const getGames = await loadGames();
        
        if (!gameId || !getGames[gameId]) {
          console.log('Game not found for get:', gameId);
          console.log('Available games:', Object.keys(getGames));
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const gameData = getGames[gameId];
        console.log('Getting game:', gameId, 'status:', gameData.status);
        console.log('Game data:', JSON.stringify(gameData, null, 2));
        return NextResponse.json({ game: gameData });

      case 'start':
        // Start the game - requires at least 2 players
        const startGames = await loadGames();
        
        if (!gameId) {
          return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
        }
        
        if (!startGames[gameId]) {
          console.log('Game not found for start:', gameId);
          console.log('Available games:', Object.keys(startGames));
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }
        
        const gameToStart = startGames[gameId];
        
        // Count how many players are in the game
        const playerCount = [
          gameToStart.players.player1,
          gameToStart.players.player2,
          gameToStart.players.player3
        ].filter(p => p !== null).length;
        
        if (playerCount < 2) {
          return NextResponse.json({ error: 'נדרשים לפחות 2 שחקנים כדי להתחיל את המשחק' }, { status: 400 });
        }
        
        // Mark all players as ready
        if (gameToStart.players.player1) {
          gameToStart.playerStates.player1.isReady = true;
        }
        if (gameToStart.players.player2) {
          gameToStart.playerStates.player2.isReady = true;
        }
        if (gameToStart.players.player3) {
          gameToStart.playerStates.player3.isReady = true;
        }
        
        // Start the game
        gameToStart.status = 'active';
        if (!gameToStart.previousQuestions) {
          gameToStart.previousQuestions = [];
        }
        gameToStart.currentWord = getRandomWordChallenge(gameToStart.difficulty || 'easy', 0, gameToStart.previousQuestions);
        // Initialize timer
        gameToStart.timerStartTime = Date.now();
        gameToStart.timeLeft = 20; // Default time
        if (gameToStart.currentWord.questionType === 'dictation' && gameToStart.currentWord.wasRecorded) {
          gameToStart.timeLeft = 40; // Double time for dictation
        }
        gameToStart.questionResults = {}; // Reset question results
        gameToStart.updatedAt = Date.now();
        
        startGames[gameId] = gameToStart;
        await saveGames(startGames);
        
        console.log('Game started:', gameId, 'with', playerCount, 'players');
        return NextResponse.json({ game: gameToStart });

      case 'move':
        // Load existing games
        const moveGames = await loadGames();
        
        if (!gameId || !moveGames[gameId]) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        const currentGame = moveGames[gameId];
        
        console.log('Move action received:', { gameId, playerId: sanitizedPlayerId, answer, selectedIndex, answerValue });
        
        // Check if answer is correct based on question type
        let isCorrect = false;
        const currentWord = currentGame.currentWord;
        
        if (!currentWord) {
          console.error('No current word in game');
          return NextResponse.json({ error: 'No current question' }, { status: 400 });
        }
        
        if (answer === 'definition' && currentWord.questionType === 'multiple-choice') {
          // Ensure both are numbers for proper comparison
          const selectedIdx = typeof selectedIndex === 'string' ? parseInt(selectedIndex, 10) : (selectedIndex ?? -1);
          const correctIdx = typeof currentWord.correctDefinitionIndex === 'string' ? parseInt(currentWord.correctDefinitionIndex, 10) : (currentWord.correctDefinitionIndex ?? -1);
          
          // Handle NaN cases
          const selectedIdxValid = !isNaN(selectedIdx) && selectedIdx >= 0;
          const correctIdxValid = !isNaN(correctIdx) && correctIdx >= 0;
          
          isCorrect = selectedIdxValid && correctIdxValid && selectedIdx === correctIdx;
          
          console.log('🔍 Multiple choice answer check:', { 
            selectedIndex, 
            selectedIdx, 
            selectedIdxValid,
            correctIndex: currentWord.correctDefinitionIndex, 
            correctIdx,
            correctIdxValid,
            isCorrect,
            typeSelected: typeof selectedIndex,
            typeCorrect: typeof currentWord.correctDefinitionIndex,
            definitions: currentWord.definitions?.length,
            selectedDefinition: currentWord.definitions?.[selectedIdx],
            correctDefinition: currentWord.definitions?.[correctIdx]
          });
        } else if (answer === 'sentence' && currentWord.questionType === 'sentence-choice') {
          // Ensure both are numbers for proper comparison
          const selectedIdx = typeof selectedIndex === 'string' ? parseInt(selectedIndex, 10) : (selectedIndex ?? -1);
          const correctIdx = typeof currentWord.correctSentenceIndex === 'string' ? parseInt(currentWord.correctSentenceIndex, 10) : (currentWord.correctSentenceIndex ?? -1);
          
          // Handle NaN cases
          const selectedIdxValid = !isNaN(selectedIdx) && selectedIdx >= 0;
          const correctIdxValid = !isNaN(correctIdx) && correctIdx >= 0;
          
          isCorrect = selectedIdxValid && correctIdxValid && selectedIdx === correctIdx;
          
          console.log('🔍 Sentence choice answer check:', { 
            selectedIndex, 
            selectedIdx,
            selectedIdxValid,
            correctIndex: currentWord.correctSentenceIndex, 
            correctIdx,
            correctIdxValid,
            isCorrect,
            typeSelected: typeof selectedIndex,
            typeCorrect: typeof currentWord.correctSentenceIndex,
            sentences: currentWord.sentences?.length,
            selectedSentence: currentWord.sentences?.[selectedIdx],
            correctSentence: currentWord.sentences?.[correctIdx]
          });
        } else if (answer === 'recording' && currentWord.questionType === 'recording') {
          // For recording, answerValue should be 'correct' or 'incorrect'
          isCorrect = answerValue === 'correct';
          // Track that this sentence was recorded
          if (!currentGame.previousQuestions) {
            currentGame.previousQuestions = [];
          }
          currentGame.previousQuestions.push({
            questionType: 'recording',
            sentenceToRecord: currentWord.sentenceToRecord
          });
        } else if (answer === 'sentence-scramble' && currentWord.questionType === 'sentence-scramble') {
          // For sentence scramble, answerValue should be 'correct' or 'incorrect'
          isCorrect = answerValue === 'correct';
          console.log('🔍 Sentence scramble answer check:', {
            answerValue,
            isCorrect,
            correctSentence: currentWord.correctSentence,
            questionType: currentWord.questionType
          });
        } else if (answer === 'dictation' && currentWord.questionType === 'dictation') {
          // For dictation, answerValue should be 'correct' or 'incorrect'
          isCorrect = answerValue === 'correct';
          console.log('🔍 Dictation answer check:', {
            answerValue,
            isCorrect,
            sentenceToRecord: currentWord.sentenceToRecord,
            questionType: currentWord.questionType
          });
        } else {
          console.warn('⚠️ Unknown answer type or question type mismatch:', {
            answer,
            questionType: currentWord.questionType,
            selectedIndex,
            answerValue
          });
        }

        // Update game state - use sanitizedPlayerId
        let playerSymbol: 'player1' | 'player2' | 'player3' = 'player1';
        if (currentGame.players.player1 === sanitizedPlayerId) {
          playerSymbol = 'player1';
        } else if (currentGame.players.player2 === sanitizedPlayerId) {
          playerSymbol = 'player2';
        } else if (currentGame.players.player3 === sanitizedPlayerId) {
          playerSymbol = 'player3';
        } else {
          console.error('Player not found in game:', { 
            sanitizedPlayerId, 
            players: currentGame.players 
          });
          return NextResponse.json({ error: 'Player not found in game' }, { status: 400 });
        }
        
        console.log('Player symbol determined:', playerSymbol);
        
        currentGame.lastMove = {
          player: playerSymbol,
          answer: answer,
          isCorrect: isCorrect,
          time: Date.now(),
          selectedIndex: selectedIndex || 0
        };
        
        // Calculate answer time relative to timer start
        const answerTime = currentGame.timerStartTime ? Date.now() - currentGame.timerStartTime : 0;
        
        // Mark this player as answered
        currentGame.playerStates[playerSymbol].lastAnswerTime = Date.now();
        
        // Save result for this question
        if (!currentGame.questionResults) {
          currentGame.questionResults = {};
        }
        currentGame.questionResults[playerSymbol] = {
          isCorrect: isCorrect,
          answerTime: answerTime,
          selectedIndex: selectedIndex
        };
        
        // Update score
        if (isCorrect) {
          currentGame.playerStates[playerSymbol].score += 3;
        } else {
          currentGame.playerStates[playerSymbol].score = Math.max(0, currentGame.playerStates[playerSymbol].score - 2);
        }
        
        // Count how many players are in the game and how many answered
        const activePlayers = [
          currentGame.players.player1,
          currentGame.players.player2,
          currentGame.players.player3
        ].filter(p => p !== null);
        
        const answeredPlayers = activePlayers.filter((_, index) => {
          const playerKey = `player${index + 1}` as 'player1' | 'player2' | 'player3';
          return currentGame.questionResults?.[playerKey] !== undefined;
        });
        
        // Check if all players answered - add speed bonus
        const allAnswered = answeredPlayers.length === activePlayers.length;
        
        // Calculate speed bonus for this player based on answer time (in seconds)
        const answerTimeSeconds = answerTime / 1000;
        let speedBonus = 0;
        let speedBonusText = '';
        
        if (isCorrect) {
          if (answerTimeSeconds <= 5) {
            speedBonus = 3;
            speedBonusText = '0-5 שניות';
          } else if (answerTimeSeconds <= 10) {
            speedBonus = 2;
            speedBonusText = '5-10 שניות';
          } else if (answerTimeSeconds <= 16) {
            speedBonus = 1;
            speedBonusText = '10-16 שניות';
          } else {
            speedBonus = 0;
            speedBonusText = '16-20 שניות';
          }
          
          // Add speed bonus to score
          if (speedBonus > 0) {
            currentGame.playerStates[playerSymbol].score += speedBonus;
          }
        }
        
        // Store speed bonus info in questionResults for UI display
        if (currentGame.questionResults[playerSymbol]) {
          currentGame.questionResults[playerSymbol].speedBonus = speedBonus;
          currentGame.questionResults[playerSymbol].speedBonusText = speedBonusText;
          currentGame.questionResults[playerSymbol].answerTimeSeconds = answerTimeSeconds;
        }
        
        // Don't move to next round automatically - wait for nextRound action
        // This allows showing results first
        
      case 'nextRound':
        // Move to next round after showing results
        const nextGames = await loadGames();
        
        if (!gameId || !nextGames[gameId]) {
          return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }
        
        const nextGame = nextGames[gameId];
        
        // Before moving to next round, check if timer expired and submit timeout answers for players who haven't answered
        if (nextGame.status === 'active' && nextGame.currentWord && nextGame.timerStartTime && nextGame.timeLeft !== undefined) {
          const elapsed = (Date.now() - nextGame.timerStartTime) / 1000;
          const calculatedTimeLeft = Math.max(0, Math.floor(nextGame.timeLeft - elapsed));
          
          if (calculatedTimeLeft <= 0) {
            // Timer expired - submit timeout answers for all players who haven't answered
            const activePlayers = [
              { id: nextGame.players.player1, symbol: 'player1' as const },
              { id: nextGame.players.player2, symbol: 'player2' as const },
              { id: nextGame.players.player3, symbol: 'player3' as const }
            ].filter(p => p.id !== null);
            
            if (!nextGame.questionResults) {
              nextGame.questionResults = {};
            }
            
            activePlayers.forEach(({ symbol }) => {
              if (!nextGame.questionResults[symbol]) {
                // Player hasn't answered - submit timeout answer (incorrect, -2 points)
                console.log(`⏰ Submitting timeout answer for ${symbol}`);
                nextGame.questionResults[symbol] = {
                  isCorrect: false,
                  answerTime: nextGame.timeLeft * 1000, // Full time as answer time
                  selectedIndex: undefined,
                  speedBonus: 0,
                  speedBonusText: '',
                  answerTimeSeconds: nextGame.timeLeft
                };
                
                // Update score (-2 points for timeout)
                nextGame.playerStates[symbol].score = Math.max(0, nextGame.playerStates[symbol].score - 2);
              }
            });
            
            // Save updated game with timeout answers
            nextGames[gameId] = nextGame;
            await saveGames(nextGames);
          }
        }
        
        if (nextGame.currentRound < nextGame.maxRounds - 1) {
          // Move to next round
          nextGame.currentRound += 1;
          // Generate new question for next round
          nextGame.currentWord = getRandomWordChallenge(
            nextGame.difficulty || 'easy', 
            nextGame.currentRound, 
            nextGame.previousQuestions || []
          );
          nextGame.lastMove = null;
          nextGame.questionResults = {}; // Reset question results
          // Reset player answer times
          if (nextGame.players.player1) {
            nextGame.playerStates.player1.lastAnswerTime = undefined;
          }
          if (nextGame.players.player2) {
            nextGame.playerStates.player2.lastAnswerTime = undefined;
          }
          if (nextGame.players.player3) {
            nextGame.playerStates.player3.lastAnswerTime = undefined;
          }
          // Initialize timer for new question
          nextGame.timerStartTime = Date.now();
          nextGame.timeLeft = 20;
          if (nextGame.currentWord.questionType === 'dictation' && nextGame.currentWord.wasRecorded) {
            nextGame.timeLeft = 40;
          }
          nextGame.updatedAt = Date.now();
          
          nextGames[gameId] = nextGame;
          await saveGames(nextGames);
          
          return NextResponse.json({ game: nextGame });
        } else {
          return NextResponse.json({ error: 'Game finished' }, { status: 400 });
        }
        
        if (allAnswered && currentGame.currentRound >= currentGame.maxRounds - 1) {
          // Game finished - keep results for final display
        } else if (currentGame.currentRound >= currentGame.maxRounds - 1 && allAnswered) {
          // Game finished
          currentGame.status = 'finished';
          const scores = {
            player1: currentGame.playerStates.player1.score,
            player2: currentGame.playerStates.player2.score,
            player3: currentGame.playerStates.player3.score
          };
          
          // Find winner
          const maxScore = Math.max(scores.player1, scores.player2, scores.player3);
          const winners = [];
          if (scores.player1 === maxScore && currentGame.players.player1) winners.push('player1');
          if (scores.player2 === maxScore && currentGame.players.player2) winners.push('player2');
          if (scores.player3 === maxScore && currentGame.players.player3) winners.push('player3');
          
          if (winners.length === 1) {
            currentGame.winner = winners[0] as 'player1' | 'player2' | 'player3';
          } else {
            currentGame.winner = 'draw';
          }
        }
        
        // Score already updated above in the questionResults section
        // Just update the lastMove and save
        currentGame.updatedAt = Date.now();
        
        console.log('Game updated:', { 
          playerSymbol, 
          isCorrect, 
          score: currentGame.playerStates[playerSymbol].score,
          questionResults: currentGame.questionResults
        });
        
        // Save updated game
        moveGames[gameId] = currentGame;
        await saveGames(moveGames);
        
        return NextResponse.json({ game: currentGame });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Game API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gameId = searchParams.get('gameId');
  
  if (!gameId) {
    return NextResponse.json({ error: 'Game ID is required' }, { status: 400 });
  }

  // Load existing games
  const games = await loadGames();
  
  if (!games[gameId]) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }
  
  return NextResponse.json({ game: games[gameId] });
}
