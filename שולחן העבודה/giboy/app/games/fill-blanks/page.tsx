'use client';

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';
import { getTranslationWithFallback } from '@/lib/translations';

interface Question {
  id: number;
  sentence: string;
  answer: string;
  options: string[];
  explanation?: string; // הסבר בעברית
}

interface QuestionBank {
  [key: string]: Question[];
}

// Expanded question bank with 200+ questions for better learning experience
const QUESTION_BANK: QuestionBank = {
  easy: [
    // Animals (בעלי חיים) - מילים קצרות ופשוטות בלבד!
    { id: 1, sentence: 'The ___ is big.', answer: 'dog', options: ['dog', 'cat', 'ant', 'bee'], explanation: 'הכלב גדול - Dog is big' },
    { id: 2, sentence: 'The ___ is small.', answer: 'cat', options: ['cat', 'dog', 'bird', 'fish'], explanation: 'החתול קטן - Cat is small' },
    { id: 3, sentence: 'The ___ can fly.', answer: 'bird', options: ['bird', 'cat', 'dog', 'fish'], explanation: 'הציפור יכולה לעוף - Bird can fly' },
    { id: 4, sentence: 'The ___ can swim.', answer: 'fish', options: ['fish', 'cat', 'dog', 'bird'], explanation: 'הדג יכול לשחות - Fish can swim' },
    { id: 5, sentence: 'The ___ can jump.', answer: 'frog', options: ['frog', 'cat', 'dog', 'fish'], explanation: 'הצפרדע יכולה לקפוץ - Frog can jump' },
    { id: 6, sentence: 'The ___ can run.', answer: 'dog', options: ['dog', 'cat', 'fish', 'bird'], explanation: 'הכלב יכול לרוץ - Dog can run' },
    { id: 7, sentence: 'The ___ is soft.', answer: 'cat', options: ['cat', 'rock', 'dog', 'tree'], explanation: 'החתול רך - Cat is soft' },
    { id: 8, sentence: 'The ___ can sing.', answer: 'bird', options: ['bird', 'cat', 'dog', 'fish'], explanation: 'הציפור יכולה לשיר - Bird can sing' },
    { id: 9, sentence: 'A ___ is cute.', answer: 'baby', options: ['baby', 'car', 'rock', 'pen'], explanation: 'תינוק חמוד - Baby is cute' },
    { id: 10, sentence: 'A ___ can play.', answer: 'child', options: ['child', 'car', 'tree', 'rock'], explanation: 'ילד יכול לשחק - Child can play' },
    
    // Food (אוכל) - מילים קצרות: 3-6 אותיות
    { id: 11, sentence: 'I eat a red ___.', answer: 'apple', options: ['apple', 'cake', 'egg', 'fish'], explanation: 'אני אוכל תפוח אדום - Red apple' },
    { id: 12, sentence: 'I drink ___ every day.', answer: 'water', options: ['water', 'milk', 'juice', 'tea'], explanation: 'אני שותה מים כל יום - Drink water every day' },
    { id: 13, sentence: 'The ___ is hot.', answer: 'soup', options: ['soup', 'ice', 'snow', 'milk'], explanation: 'המרק חם - Hot soup' },
    { id: 14, sentence: 'I eat ___ for breakfast.', answer: 'bread', options: ['bread', 'rice', 'pasta', 'soup'], explanation: 'אני אוכל לחם לארוחת בוקר - Eat bread for breakfast' },
    { id: 15, sentence: 'I drink white ___.', answer: 'milk', options: ['milk', 'water', 'juice', 'tea'], explanation: 'אני שותה חלב לבן - Drink white milk' },
    { id: 16, sentence: 'I eat a yellow ___.', answer: 'banana', options: ['banana', 'apple', 'orange', 'grape'], explanation: 'אני אוכל בננה צהובה - Eat a yellow banana' },
    { id: 17, sentence: 'The ___ is sweet.', answer: 'cake', options: ['cake', 'salt', 'rock', 'wood'], explanation: 'העוגה מתוקה - Sweet cake' },
    { id: 18, sentence: 'I drink hot ___.', answer: 'tea', options: ['tea', 'coffee', 'water', 'juice'], explanation: 'אני שותה תה חם - Drink hot tea' },
    { id: 19, sentence: 'The ___ is good.', answer: 'food', options: ['food', 'rock', 'sand', 'wood'], explanation: 'האוכל טוב - Good food' },
    { id: 20, sentence: 'I eat ___ with my meal.', answer: 'rice', options: ['rice', 'bread', 'pasta', 'soup'], explanation: 'אני אוכל אורז עם הארוחה - Eat rice with my meal' },
    
    // Nature (טבע) - מילים קצרות: 3-5 אותיות
    { id: 21, sentence: 'The ___ is hot.', answer: 'sun', options: ['sun', 'moon', 'snow', 'ice'], explanation: 'השמש חמה - Sun is hot' },
    { id: 22, sentence: 'The ___ is blue.', answer: 'sky', options: ['sky', 'tree', 'grass', 'fire'], explanation: 'השמיים כחולים - Sky is blue' },
    { id: 23, sentence: 'The ___ is big.', answer: 'tree', options: ['tree', 'ant', 'bee', 'fly'], explanation: 'העץ גדול - Tree is big' },
    { id: 24, sentence: 'I see a beautiful ___.', answer: 'flower', options: ['flower', 'rock', 'pen', 'car'], explanation: 'אני רואה פרח יפה - See a beautiful flower' },
    { id: 25, sentence: 'The ___ is green.', answer: 'grass', options: ['grass', 'sky', 'sun', 'snow'], explanation: 'הדשא ירוק - Grass is green' },
    { id: 26, sentence: 'The ___ is white.', answer: 'cloud', options: ['cloud', 'tree', 'grass', 'fire'], explanation: 'הענן לבן - Cloud is white' },
    { id: 27, sentence: 'The ___ is cold.', answer: 'snow', options: ['snow', 'fire', 'sun', 'soup'], explanation: 'השלג קר - Snow is cold' },
    { id: 28, sentence: 'The ___ falls.', answer: 'rain', options: ['rain', 'tree', 'rock', 'car'], explanation: 'הגשם יורד - Rain falls' },
    { id: 29, sentence: 'The ___ is big.', answer: 'sea', options: ['sea', 'ant', 'bee', 'fly'], explanation: 'הים גדול - Sea is big' },
    { id: 30, sentence: 'The ___ is tall.', answer: 'hill', options: ['hill', 'ant', 'bee', 'fly'], explanation: 'הגבעה גבוהה - Hill is tall' },
    
    // Objects (חפצים) - מילים קצרות: 3-4 אותיות
    { id: 31, sentence: 'I read a ___.', answer: 'book', options: ['book', 'pen', 'cup', 'hat'], explanation: 'אני קורא ספר - Read book' },
    { id: 32, sentence: 'I use a ___ to write.', answer: 'pen', options: ['pen', 'dog', 'cat', 'tree'], explanation: 'אני משתמש בעט לכתיבה - Use pen to write' },
    { id: 33, sentence: 'I have a ___.', answer: 'ball', options: ['ball', 'rock', 'sand', 'wood'], explanation: 'יש לי כדור - Have ball' },
    { id: 34, sentence: 'I use a ___ to drink.', answer: 'cup', options: ['cup', 'rock', 'sand', 'wood'], explanation: 'אני משתמש בכוס לשתייה - Use cup to drink' },
    { id: 35, sentence: 'I wear a ___.', answer: 'hat', options: ['hat', 'rock', 'tree', 'fish'], explanation: 'אני לובש כובע - Wear hat' },
    { id: 36, sentence: 'I wear ___.', answer: 'shoes', options: ['shoes', 'rocks', 'trees', 'fish'], explanation: 'אני נועל נעליים - Wear shoes' },
    { id: 37, sentence: 'I sit on a ___.', answer: 'chair', options: ['chair', 'tree', 'rock', 'fish'], explanation: 'אני יושב על כיסא - Sit on chair' },
    { id: 38, sentence: 'I sleep on a ___.', answer: 'bed', options: ['bed', 'tree', 'rock', 'fish'], explanation: 'אני ישן על מיטה - Sleep on bed' },
    { id: 39, sentence: 'I ride a ___ to the park.', answer: 'bike', options: ['bike', 'rock', 'tree', 'fish'], explanation: 'אני רוכב על אופניים לפארק - Ride bike to the park' },
    { id: 40, sentence: 'I play with a ___.', answer: 'ball', options: ['ball', 'rock', 'tree', 'fish'], explanation: 'אני משחק עם כדור - Play with a ball' },
    
    // Colors (צבעים) - מילים קצרות: 3-5 אותיות
    { id: 41, sentence: 'The ___ is red.', answer: 'rose', options: ['rose', 'sky', 'snow', 'grass'], explanation: 'הוורד אדום - Rose is red' },
    { id: 42, sentence: 'The ___ is blue.', answer: 'sky', options: ['sky', 'fire', 'grass', 'sun'], explanation: 'השמיים כחולים - Sky is blue' },
    { id: 43, sentence: 'The ___ is green.', answer: 'grass', options: ['grass', 'sky', 'fire', 'snow'], explanation: 'הדשא ירוק - Grass is green' },
    { id: 44, sentence: 'The ___ is hot.', answer: 'sun', options: ['sun', 'snow', 'ice', 'rain'], explanation: 'השמש חמה - Sun is hot' },
    { id: 45, sentence: 'The ___ is white.', answer: 'snow', options: ['snow', 'fire', 'grass', 'sky'], explanation: 'השלג לבן - Snow is white' },
    { id: 46, sentence: 'The ___ is dark.', answer: 'night', options: ['night', 'sun', 'snow', 'fire'], explanation: 'הלילה חשוך - Night is dark' },
    { id: 47, sentence: 'The ___ is big.', answer: 'bear', options: ['bear', 'ant', 'bee', 'fly'], explanation: 'הדוב גדול - Bear is big' },
    { id: 48, sentence: 'I eat a purple ___.', answer: 'grape', options: ['grape', 'apple', 'banana', 'orange'], explanation: 'אני אוכל ענב סגול - Eat a purple grape' },
    { id: 49, sentence: 'I see a red ___.', answer: 'rose', options: ['rose', 'tulip', 'daisy', 'lily'], explanation: 'אני רואה ורד אדום - See a red rose' },
    { id: 50, sentence: 'I eat an orange ___.', answer: 'carrot', options: ['carrot', 'apple', 'banana', 'grape'], explanation: 'אני אוכל גזר כתום - Eat an orange carrot' },
    
    // Family (משפחה) - מילים: 3-6 אותיות (mom/dad קצרים יותר)
    { id: 51, sentence: 'I love my ___.', answer: 'mom', options: ['mom', 'dad', 'cat', 'dog'], explanation: 'אני אוהב את אמא - Love mom' },
    { id: 52, sentence: 'I love my ___.', answer: 'dad', options: ['dad', 'mom', 'cat', 'dog'], explanation: 'אני אוהב את אבא - Love dad' },
    { id: 53, sentence: 'My ___ is nice.', answer: 'sister', options: ['sister', 'rock', 'tree', 'fish'], explanation: 'אחותי נחמדה - Sister is nice' },
    { id: 54, sentence: 'My ___ is fun.', answer: 'brother', options: ['brother', 'rock', 'tree', 'fish'], explanation: 'אחי כיפי - Brother is fun' },
    { id: 55, sentence: 'I love my ___.', answer: 'family', options: ['family', 'rock', 'tree', 'fish'], explanation: 'אני אוהב את המשפחה - Love family' },
    { id: 56, sentence: 'I have a ___.', answer: 'home', options: ['home', 'rock', 'sand', 'wood'], explanation: 'יש לי בית - Have home' },
    { id: 57, sentence: 'I go to ___ every morning.', answer: 'school', options: ['school', 'rock', 'sand', 'wood'], explanation: 'אני הולך לבית ספר כל בוקר - Go to school every morning' },
    { id: 58, sentence: 'I play with a ___.', answer: 'toy', options: ['toy', 'rock', 'sand', 'wood'], explanation: 'אני משחק עם צעצוע - Play with toy' },
    { id: 59, sentence: 'I like my ___.', answer: 'friend', options: ['friend', 'rock', 'sand', 'wood'], explanation: 'אני אוהב את החבר - Like friend' },
    { id: 60, sentence: 'I have a ___.', answer: 'pet', options: ['pet', 'rock', 'sand', 'wood'], explanation: 'יש לי חיית מחמד - Have pet' },
    
    // School (בית ספר)
    { id: 61, sentence: 'I go to ___ every day.', answer: 'school', options: ['school', 'car', 'dog', 'pen'], explanation: 'אני הולך לבית ספר כל יום - Go to school every day' },
    { id: 62, sentence: 'My ___ is very nice.', answer: 'teacher', options: ['teacher', 'car', 'dog', 'pen'], explanation: 'המורה שלי מאוד נחמד - My teacher is very nice' },
    { id: 63, sentence: 'I sit at my ___.', answer: 'desk', options: ['desk', 'car', 'dog', 'pen'], explanation: 'אני יושב בשולחן שלי - Sit at my desk' },
    { id: 64, sentence: 'I write in my ___.', answer: 'notebook', options: ['notebook', 'car', 'dog', 'pen'], explanation: 'אני כותב במחברת שלי - Write in my notebook' },
    { id: 65, sentence: 'I use a ___ to write.', answer: 'pencil', options: ['pencil', 'car', 'dog', 'pen'], explanation: 'אני משתמש בעיפרון לכתיבה - Use pencil to write' },
    { id: 66, sentence: 'I read my ___.', answer: 'textbook', options: ['textbook', 'car', 'dog', 'pen'], explanation: 'אני קורא את ספר הלימוד שלי - Read my textbook' },
    { id: 67, sentence: 'I carry my books in my ___.', answer: 'backpack', options: ['backpack', 'car', 'dog', 'pen'], explanation: 'אני נושא את הספרים בתיק שלי - Carry books in my backpack' },
    { id: 68, sentence: 'I eat lunch in the ___.', answer: 'cafeteria', options: ['cafeteria', 'car', 'dog', 'pen'], explanation: 'אני אוכל צהריים בקפיטריה - Eat lunch in the cafeteria' },
    { id: 69, sentence: 'I play in the ___.', answer: 'playground', options: ['playground', 'car', 'dog', 'pen'], explanation: 'אני משחק במגרש המשחקים - Play in the playground' },
    { id: 70, sentence: 'I study in the ___.', answer: 'library', options: ['library', 'car', 'dog', 'pen'], explanation: 'אני לומד בספרייה - Study in the library' },
    
    // Home (בית)
    { id: 71, sentence: 'I live in a ___.', answer: 'house', options: ['house', 'car', 'dog', 'pen'], explanation: 'אני גר בבית - Live in a house' },
    { id: 72, sentence: 'I sleep in my ___.', answer: 'bedroom', options: ['bedroom', 'car', 'dog', 'pen'], explanation: 'אני ישן בחדר השינה שלי - Sleep in my bedroom' },
    { id: 73, sentence: 'I cook in the ___.', answer: 'kitchen', options: ['kitchen', 'car', 'dog', 'pen'], explanation: 'אני מבשל במטבח - Cook in the kitchen' },
    { id: 74, sentence: 'I watch TV in the ___.', answer: 'living room', options: ['living room', 'car', 'dog', 'pen'], explanation: 'אני צופה בטלוויזיה בסלון - Watch TV in the living room' },
    { id: 75, sentence: 'I take a shower in the ___.', answer: 'bathroom', options: ['bathroom', 'car', 'dog', 'pen'], explanation: 'אני מתקלח בחדר האמבטיה - Take a shower in the bathroom' },
    { id: 76, sentence: 'I park my car in the ___.', answer: 'garage', options: ['garage', 'car', 'dog', 'pen'], explanation: 'אני חונה את המכונית במוסך - Park car in the garage' },
    { id: 77, sentence: 'I play in the ___.', answer: 'garden', options: ['garden', 'car', 'dog', 'pen'], explanation: 'אני משחק בגינה - Play in the garden' },
    { id: 78, sentence: 'I store things in the ___.', answer: 'basement', options: ['basement', 'car', 'dog', 'pen'], explanation: 'אני שומר דברים במרתף - Store things in the basement' },
    { id: 79, sentence: 'I go up the ___.', answer: 'stairs', options: ['stairs', 'car', 'dog', 'pen'], explanation: 'אני עולה במדרגות - Go up the stairs' },
    { id: 80, sentence: 'I open the ___.', answer: 'door', options: ['door', 'car', 'dog', 'pen'], explanation: 'אני פותח את הדלת - Open the door' },
    
    // Transportation (תחבורה)
    { id: 81, sentence: 'I drive my ___.', answer: 'car', options: ['car', 'dog', 'pen', 'book'], explanation: 'אני נוהג במכונית שלי - Drive my car' },
    { id: 82, sentence: 'I ride my ___.', answer: 'bike', options: ['bike', 'car', 'dog', 'pen'], explanation: 'אני רוכב על האופניים שלי - Ride my bike' },
    { id: 83, sentence: 'I take the ___ to school.', answer: 'bus', options: ['bus', 'car', 'dog', 'pen'], explanation: 'אני לוקח את האוטובוס לבית ספר - Take the bus to school' },
    { id: 84, sentence: 'I fly in an ___.', answer: 'airplane', options: ['airplane', 'car', 'dog', 'pen'], explanation: 'אני טס במטוס - Fly in an airplane' },
    { id: 85, sentence: 'I ride the ___ to work.', answer: 'train', options: ['train', 'car', 'dog', 'pen'], explanation: 'אני רוכב ברכבת לעבודה - Ride the train to work' },
    { id: 86, sentence: 'I sail on a ___.', answer: 'boat', options: ['boat', 'car', 'dog', 'pen'], explanation: 'אני מפליג על סירה - Sail on a boat' },
    { id: 87, sentence: 'I ride a ___ on the road.', answer: 'motorcycle', options: ['motorcycle', 'car', 'dog', 'pen'], explanation: 'אני רוכב על אופנוע בכביש - Ride a motorcycle on the road' },
    { id: 88, sentence: 'I take a ___ to the airport.', answer: 'taxi', options: ['taxi', 'car', 'dog', 'pen'], explanation: 'אני לוקח מונית לשדה התעופה - Take a taxi to the airport' },
    { id: 89, sentence: 'I walk on the ___.', answer: 'sidewalk', options: ['sidewalk', 'car', 'dog', 'pen'], explanation: 'אני הולך על המדרכה - Walk on the sidewalk' },
    { id: 90, sentence: 'I cross the ___.', answer: 'street', options: ['street', 'car', 'dog', 'pen'], explanation: 'אני חוצה את הרחוב - Cross the street' },
    
    // Weather (מזג אוויר)
    { id: 91, sentence: 'It is ___ today.', answer: 'sunny', options: ['sunny', 'car', 'dog', 'pen'], explanation: 'היום שמשי - It is sunny today' },
    { id: 92, sentence: 'It is ___ outside.', answer: 'rainy', options: ['rainy', 'car', 'dog', 'pen'], explanation: 'בחוץ גשום - It is rainy outside' },
    { id: 93, sentence: 'It is ___ and cold.', answer: 'snowy', options: ['snowy', 'car', 'dog', 'pen'], explanation: 'זה מושלג וקר - It is snowy and cold' },
    { id: 94, sentence: 'It is ___ and windy.', answer: 'cloudy', options: ['cloudy', 'car', 'dog', 'pen'], explanation: 'זה מעונן וסוער - It is cloudy and windy' },
    { id: 95, sentence: 'It is ___ and hot.', answer: 'sunny', options: ['sunny', 'car', 'dog', 'pen'], explanation: 'זה שמשי וחם - It is sunny and hot' },
    { id: 96, sentence: 'The ___ is strong.', answer: 'wind', options: ['wind', 'car', 'dog', 'pen'], explanation: 'הרוח חזקה - The wind is strong' },
    { id: 97, sentence: 'The ___ is falling.', answer: 'rain', options: ['rain', 'car', 'dog', 'pen'], explanation: 'הגשם יורד - The rain is falling' },
    { id: 98, sentence: 'The ___ is white.', answer: 'snow', options: ['snow', 'car', 'dog', 'pen'], explanation: 'השלג לבן - The snow is white' },
    { id: 99, sentence: 'The ___ is bright.', answer: 'sun', options: ['sun', 'car', 'dog', 'pen'], explanation: 'השמש בהירה - The sun is bright' },
    { id: 100, sentence: 'The ___ is dark.', answer: 'cloud', options: ['cloud', 'car', 'dog', 'pen'], explanation: 'הענן כהה - The cloud is dark' },
  ],
  medium: [
    // Advanced Animals (בעלי חיים מתקדמים)
    { id: 101, sentence: 'The ___ is hunting for food.', answer: 'lion', options: ['lion', 'cat', 'dog', 'bird'], explanation: 'האריה צד אוכל - The lion is hunting for food' },
    { id: 102, sentence: 'The ___ is swimming in the ocean.', answer: 'whale', options: ['whale', 'fish', 'shark', 'dolphin'], explanation: 'הלווייתן שוחה באוקיינוס - The whale is swimming in the ocean' },
    { id: 103, sentence: 'The ___ is climbing the tree.', answer: 'monkey', options: ['monkey', 'cat', 'dog', 'bird'], explanation: 'הקוף מטפס על העץ - The monkey is climbing the tree' },
    { id: 104, sentence: 'The ___ is running in the forest.', answer: 'deer', options: ['deer', 'car', 'dog', 'cat'], explanation: 'הצבי רץ ביער - The deer is running in the forest' },
    { id: 105, sentence: 'The ___ is flying at night.', answer: 'owl', options: ['owl', 'bird', 'bat', 'eagle'], explanation: 'הינשוף עף בלילה - The owl is flying at night' },
    { id: 106, sentence: 'The ___ is sleeping in the cave.', answer: 'bear', options: ['bear', 'cat', 'dog', 'lion'], explanation: 'הדוב ישן במערה - The bear is sleeping in the cave' },
    { id: 107, sentence: 'The ___ is jumping in the grass.', answer: 'rabbit', options: ['rabbit', 'cat', 'dog', 'mouse'], explanation: 'הארנב קופץ בדשא - The rabbit is jumping in the grass' },
    { id: 108, sentence: 'The ___ is swimming in the river.', answer: 'duck', options: ['duck', 'fish', 'swan', 'goose'], explanation: 'הברווז שוחה בנהר - The duck is swimming in the river' },
    { id: 109, sentence: 'The ___ is flying over the mountains.', answer: 'eagle', options: ['eagle', 'bird', 'owl', 'hawk'], explanation: 'הנשר עף מעל ההרים - The eagle is flying over the mountains' },
    { id: 110, sentence: 'The ___ is crawling on the ground.', answer: 'snake', options: ['snake', 'worm', 'lizard', 'frog'], explanation: 'הנחש זוחל על הקרקע - The snake is crawling on the ground' },
    
    // Advanced Food (אוכל מתקדם)
    { id: 111, sentence: 'I eat Italian ___ for dinner.', answer: 'pasta', options: ['pasta', 'rice', 'bread', 'soup'], explanation: 'אני אוכל פסטה איטלקית לארוחת ערב - Eat Italian pasta for dinner' },
    { id: 112, sentence: 'The ___ is spicy.', answer: 'curry', options: ['curry', 'soup', 'salad', 'pizza'], explanation: 'הקארי חריף - The curry is spicy' },
    { id: 113, sentence: 'I drink ___ with ice.', answer: 'lemonade', options: ['lemonade', 'water', 'juice', 'tea'], explanation: 'אני שותה לימונדה עם קרח - Drink lemonade with ice' },
    { id: 114, sentence: 'The ___ is sweet and sticky.', answer: 'honey', options: ['honey', 'sugar', 'jam', 'syrup'], explanation: 'הדבש מתוק ודביק - The honey is sweet and sticky' },
    { id: 115, sentence: 'I eat ___ with butter.', answer: 'toast', options: ['toast', 'bread', 'cracker', 'cookie'], explanation: 'אני אוכל טוסט עם חמאה - Eat toast with butter' },
    { id: 116, sentence: 'The ___ is cold and creamy.', answer: 'ice cream', options: ['ice cream', 'yogurt', 'milk', 'cheese'], explanation: 'הגלידה קרירה וקרמית - The ice cream is cold and creamy' },
    { id: 117, sentence: 'I eat ___ with chopsticks.', answer: 'sushi', options: ['sushi', 'rice', 'noodles', 'salad'], explanation: 'אני אוכל סושי עם מקלות - Eat sushi with chopsticks' },
    { id: 118, sentence: 'The ___ is hot and cheesy.', answer: 'pizza', options: ['pizza', 'sandwich', 'burger', 'pasta'], explanation: 'הפיצה חמה וגבינה - The pizza is hot and cheesy' },
    { id: 119, sentence: 'I drink ___ in the morning.', answer: 'orange juice', options: ['orange juice', 'apple juice', 'grape juice', 'water'], explanation: 'אני שותה מיץ תפוזים בבוקר - Drink orange juice in the morning' },
    { id: 120, sentence: 'The ___ is crunchy and salty.', answer: 'chips', options: ['chips', 'crackers', 'nuts', 'popcorn'], explanation: 'הצ\'יפס פריך ומלוח - The chips are crunchy and salty' },
    
    // Advanced Nature (טבע מתקדם)
    { id: 121, sentence: 'The ___ is very tall.', answer: 'mountain', options: ['mountain', 'hill', 'tree', 'building'], explanation: 'ההר מאוד גבוה - The mountain is very tall' },
    { id: 122, sentence: 'The ___ is deep and blue.', answer: 'ocean', options: ['ocean', 'lake', 'river', 'pond'], explanation: 'האוקיינוס עמוק וכחול - The ocean is deep and blue' },
    { id: 123, sentence: 'The ___ is falling from the sky.', answer: 'snow', options: ['snow', 'rain', 'hail', 'sleet'], explanation: 'השלג יורד מהשמיים - The snow is falling from the sky' },
    { id: 124, sentence: 'The ___ is very old.', answer: 'forest', options: ['forest', 'garden', 'park', 'field'], explanation: 'היער מאוד עתיק - The forest is very old' },
    { id: 125, sentence: 'The ___ is hot and bright.', answer: 'volcano', options: ['volcano', 'mountain', 'hill', 'rock'], explanation: 'הר הגעש חם ובהיר - The volcano is hot and bright' },
    { id: 126, sentence: 'The ___ is wide and long.', answer: 'river', options: ['river', 'stream', 'lake', 'ocean'], explanation: 'הנהר רחב וארוך - The river is wide and long' },
    { id: 127, sentence: 'The ___ is green and tall.', answer: 'bamboo', options: ['bamboo', 'tree', 'grass', 'plant'], explanation: 'הבמבוק ירוק וגבוה - The bamboo is green and tall' },
    { id: 128, sentence: 'The ___ is cold and white.', answer: 'glacier', options: ['glacier', 'ice', 'snow', 'mountain'], explanation: 'הקרחון קר ולבן - The glacier is cold and white' },
    { id: 129, sentence: 'The ___ is colorful and beautiful.', answer: 'rainbow', options: ['rainbow', 'sky', 'cloud', 'sun'], explanation: 'הקשת צבעונית ויפה - The rainbow is colorful and beautiful' },
    { id: 130, sentence: 'The ___ is dark and scary.', answer: 'cave', options: ['cave', 'hole', 'tunnel', 'basement'], explanation: 'המערה חשוכה ומפחידה - The cave is dark and scary' },
    
    // Advanced Objects (חפצים מתקדמים)
    { id: 131, sentence: 'I use a ___ to take pictures.', answer: 'camera', options: ['camera', 'phone', 'tablet', 'computer'], explanation: 'אני משתמש במצלמה לצילום תמונות - Use camera to take pictures' },
    { id: 132, sentence: 'I watch movies on my ___.', answer: 'television', options: ['television', 'computer', 'phone', 'tablet'], explanation: 'אני צופה בסרטים בטלוויזיה שלי - Watch movies on my television' },
    { id: 133, sentence: 'I listen to music with ___.', answer: 'headphones', options: ['headphones', 'speakers', 'radio', 'phone'], explanation: 'אני מאזין למוזיקה עם אוזניות - Listen to music with headphones' },
    { id: 134, sentence: 'I use a ___ to measure time.', answer: 'clock', options: ['clock', 'watch', 'timer', 'calendar'], explanation: 'אני משתמש בשעון למדידת זמן - Use clock to measure time' },
    { id: 135, sentence: 'I use a ___ to open doors.', answer: 'key', options: ['key', 'card', 'code', 'button'], explanation: 'אני משתמש במפתח לפתיחת דלתות - Use key to open doors' },
    { id: 136, sentence: 'I use a ___ to see far away.', answer: 'telescope', options: ['telescope', 'microscope', 'glasses', 'camera'], explanation: 'אני משתמש בטלסקופ לראייה למרחק - Use telescope to see far away' },
    { id: 137, sentence: 'I use a ___ to keep warm.', answer: 'blanket', options: ['blanket', 'towel', 'sheet', 'pillow'], explanation: 'אני משתמש בשמיכה לשמירה על חום - Use blanket to keep warm' },
    { id: 138, sentence: 'I use a ___ to clean my teeth.', answer: 'toothbrush', options: ['toothbrush', 'brush', 'comb', 'sponge'], explanation: 'אני משתמש במברשת שיניים לניקוי השיניים - Use toothbrush to clean teeth' },
    { id: 139, sentence: 'I use a ___ to dry my hair.', answer: 'hair dryer', options: ['hair dryer', 'fan', 'towel', 'brush'], explanation: 'אני משתמש במייבש שיער לייבוש השיער - Use hair dryer to dry hair' },
    { id: 140, sentence: 'I use a ___ to lock the door.', answer: 'lock', options: ['lock', 'key', 'chain', 'bolt'], explanation: 'אני משתמש במנעול לנעילת הדלת - Use lock to lock the door' },
    
    // Advanced Colors (צבעים מתקדמים)
    { id: 141, sentence: 'The ___ is silver.', answer: 'coin', options: ['coin', 'ring', 'watch', 'spoon'], explanation: 'המטבע כסוף - The coin is silver' },
    { id: 142, sentence: 'The ___ is gold.', answer: 'ring', options: ['ring', 'coin', 'watch', 'necklace'], explanation: 'הטבעת זהב - The ring is gold' },
    { id: 143, sentence: 'The ___ is turquoise.', answer: 'ocean', options: ['ocean', 'sky', 'lake', 'river'], explanation: 'האוקיינוס טורקיז - The ocean is turquoise' },
    { id: 144, sentence: 'The ___ is burgundy.', answer: 'wine', options: ['wine', 'juice', 'soda', 'water'], explanation: 'היין בורדו - The wine is burgundy' },
    { id: 145, sentence: 'The ___ is emerald.', answer: 'gem', options: ['gem', 'stone', 'crystal', 'diamond'], explanation: 'האבן היקרה אזמרגד - The gem is emerald' },
    { id: 146, sentence: 'The ___ is coral.', answer: 'reef', options: ['reef', 'ocean', 'beach', 'island'], explanation: 'שונית האלמוגים אלמוג - The reef is coral' },
    { id: 147, sentence: 'The ___ is lavender.', answer: 'flower', options: ['flower', 'plant', 'herb', 'tree'], explanation: 'הפרח לבנדר - The flower is lavender' },
    { id: 148, sentence: 'The ___ is crimson.', answer: 'rose', options: ['rose', 'flower', 'plant', 'tree'], explanation: 'הוורד ארגמן - The rose is crimson' },
    { id: 149, sentence: 'The ___ is indigo.', answer: 'sky', options: ['sky', 'ocean', 'lake', 'river'], explanation: 'השמיים אינדיגו - The sky is indigo' },
    { id: 150, sentence: 'The ___ is magenta.', answer: 'flower', options: ['flower', 'plant', 'herb', 'tree'], explanation: 'הפרח מגנטה - The flower is magenta' },
    
    // Advanced Family (משפחה מתקדמת)
    { id: 151, sentence: 'My ___ is getting married.', answer: 'sister', options: ['sister', 'brother', 'cousin', 'friend'], explanation: 'אחותי מתחתנת - My sister is getting married' },
    { id: 152, sentence: 'My ___ is having a baby.', answer: 'daughter', options: ['daughter', 'son', 'sister', 'brother'], explanation: 'בתי בהריון - My daughter is having a baby' },
    { id: 153, sentence: 'My ___ is retiring.', answer: 'father', options: ['father', 'mother', 'grandfather', 'grandmother'], explanation: 'אבא שלי פורש - My father is retiring' },
    { id: 154, sentence: 'My ___ is graduating.', answer: 'son', options: ['son', 'daughter', 'brother', 'sister'], explanation: 'הבן שלי מסיים לימודים - My son is graduating' },
    { id: 155, sentence: 'My ___ is moving away.', answer: 'brother', options: ['brother', 'sister', 'cousin', 'friend'], explanation: 'אחי עובר לגור במקום אחר - My brother is moving away' },
    { id: 156, sentence: 'My ___ is visiting us.', answer: 'grandmother', options: ['grandmother', 'grandfather', 'aunt', 'uncle'], explanation: 'סבתא שלי מבקרת אותנו - My grandmother is visiting us' },
    { id: 157, sentence: 'My ___ is getting a promotion.', answer: 'father', options: ['father', 'mother', 'brother', 'sister'], explanation: 'אבא שלי מקבל קידום - My father is getting a promotion' },
    { id: 158, sentence: 'My ___ is learning to drive.', answer: 'teenager', options: ['teenager', 'child', 'adult', 'baby'], explanation: 'הנער שלי לומד לנהוג - My teenager is learning to drive' },
    { id: 159, sentence: 'My ___ is celebrating a birthday.', answer: 'mother', options: ['mother', 'father', 'sister', 'brother'], explanation: 'אמא שלי חוגגת יום הולדת - My mother is celebrating a birthday' },
    { id: 160, sentence: 'My ___ is going to college.', answer: 'daughter', options: ['daughter', 'son', 'sister', 'brother'], explanation: 'בתי הולכת לקולג\' - My daughter is going to college' },
    
    // Advanced School (בית ספר מתקדם)
    { id: 161, sentence: 'I study ___ in college.', answer: 'mathematics', options: ['mathematics', 'science', 'history', 'art'], explanation: 'אני לומד מתמטיקה בקולג\' - Study mathematics in college' },
    { id: 162, sentence: 'My ___ is very strict.', answer: 'professor', options: ['professor', 'teacher', 'instructor', 'tutor'], explanation: 'הפרופסור שלי מאוד קפדן - My professor is very strict' },
    { id: 163, sentence: 'I take notes in my ___.', answer: 'notebook', options: ['notebook', 'textbook', 'workbook', 'journal'], explanation: 'אני כותב הערות במחברת שלי - Take notes in my notebook' },
    { id: 164, sentence: 'I use a ___ to calculate.', answer: 'calculator', options: ['calculator', 'computer', 'phone', 'tablet'], explanation: 'אני משתמש במחשבון לחישוב - Use calculator to calculate' },
    { id: 165, sentence: 'I study in the ___.', answer: 'library', options: ['library', 'classroom', 'laboratory', 'office'], explanation: 'אני לומד בספרייה - Study in the library' },
    { id: 166, sentence: 'I eat lunch in the ___.', answer: 'cafeteria', options: ['cafeteria', 'restaurant', 'kitchen', 'dining room'], explanation: 'אני אוכל צהריים בקפיטריה - Eat lunch in the cafeteria' },
    { id: 167, sentence: 'I play sports in the ___.', answer: 'gymnasium', options: ['gymnasium', 'stadium', 'field', 'court'], explanation: 'אני משחק ספורט באולם הספורט - Play sports in the gymnasium' },
    { id: 168, sentence: 'I conduct experiments in the ___.', answer: 'laboratory', options: ['laboratory', 'classroom', 'office', 'library'], explanation: 'אני מבצע ניסויים במעבדה - Conduct experiments in the laboratory' },
    { id: 169, sentence: 'I attend ___ every semester.', answer: 'lectures', options: ['lectures', 'classes', 'seminars', 'workshops'], explanation: 'אני משתתף בהרצאות כל סמסטר - Attend lectures every semester' },
    { id: 170, sentence: 'I take ___ at the end of the semester.', answer: 'exams', options: ['exams', 'tests', 'quizzes', 'assignments'], explanation: 'אני עושה בחינות בסוף הסמסטר - Take exams at the end of the semester' },
    
    // Advanced Home (בית מתקדם)
    { id: 171, sentence: 'I store my car in the ___.', answer: 'garage', options: ['garage', 'driveway', 'parking lot', 'street'], explanation: 'אני שומר את המכונית במוסך - Store my car in the garage' },
    { id: 172, sentence: 'I relax in the ___.', answer: 'living room', options: ['living room', 'bedroom', 'kitchen', 'bathroom'], explanation: 'אני נח בסלון - Relax in the living room' },
    { id: 173, sentence: 'I cook dinner in the ___.', answer: 'kitchen', options: ['kitchen', 'dining room', 'living room', 'basement'], explanation: 'אני מבשל ארוחת ערב במטבח - Cook dinner in the kitchen' },
    { id: 174, sentence: 'I sleep in my ___.', answer: 'bedroom', options: ['bedroom', 'living room', 'kitchen', 'bathroom'], explanation: 'אני ישן בחדר השינה שלי - Sleep in my bedroom' },
    { id: 175, sentence: 'I take a shower in the ___.', answer: 'bathroom', options: ['bathroom', 'kitchen', 'bedroom', 'living room'], explanation: 'אני מתקלח בחדר האמבטיה - Take a shower in the bathroom' },
    { id: 176, sentence: 'I store old things in the ___.', answer: 'basement', options: ['basement', 'attic', 'garage', 'closet'], explanation: 'אני שומר דברים ישנים במרתף - Store old things in the basement' },
    { id: 177, sentence: 'I store things in the ___.', answer: 'attic', options: ['attic', 'basement', 'garage', 'closet'], explanation: 'אני שומר דברים בעליית הגג - Store things in the attic' },
    { id: 178, sentence: 'I hang my clothes in the ___.', answer: 'closet', options: ['closet', 'wardrobe', 'dresser', 'cabinet'], explanation: 'אני תולה את הבגדים בארון - Hang my clothes in the closet' },
    { id: 179, sentence: 'I eat meals in the ___.', answer: 'dining room', options: ['dining room', 'kitchen', 'living room', 'bedroom'], explanation: 'אני אוכל ארוחות בחדר האוכל - Eat meals in the dining room' },
    { id: 180, sentence: 'I work in my ___.', answer: 'office', options: ['office', 'study', 'bedroom', 'living room'], explanation: 'אני עובד במשרד שלי - Work in my office' },
    
    // Advanced Transportation (תחבורה מתקדמת)
    { id: 181, sentence: 'I drive my ___ to work.', answer: 'car', options: ['car', 'truck', 'van', 'suv'], explanation: 'אני נוהג במכונית שלי לעבודה - Drive my car to work' },
    { id: 182, sentence: 'I ride my ___ for exercise.', answer: 'bicycle', options: ['bicycle', 'motorcycle', 'scooter', 'skateboard'], explanation: 'אני רוכב על האופניים שלי לספורט - Ride my bicycle for exercise' },
    { id: 183, sentence: 'I take the ___ to the city center.', answer: 'train', options: ['train', 'bus', 'subway', 'taxi'], explanation: 'אני לוקח את הרכבת למרכז העיר - Take the train to the city center' },
    { id: 184, sentence: 'I fly in an ___ to Europe.', answer: 'airplane', options: ['airplane', 'helicopter', 'jet', 'glider'], explanation: 'אני טס במטוס לאירופה - Fly in an airplane to Europe' },
    { id: 185, sentence: 'I sail on a ___ across the ocean.', answer: 'ship', options: ['ship', 'boat', 'yacht', 'cruise'], explanation: 'אני מפליג על אונייה מעבר לאוקיינוס - Sail on a ship across the ocean' },
    { id: 186, sentence: 'I ride a ___ on the highway.', answer: 'motorcycle', options: ['motorcycle', 'bicycle', 'scooter', 'skateboard'], explanation: 'אני רוכב על אופנוע בכביש המהיר - Ride a motorcycle on the highway' },
    { id: 187, sentence: 'I take a ___ to the airport.', answer: 'taxi', options: ['taxi', 'bus', 'train', 'car'], explanation: 'אני לוקח מונית לשדה התעופה - Take a taxi to the airport' },
    { id: 188, sentence: 'I ride the ___ underground.', answer: 'subway', options: ['subway', 'train', 'bus', 'tram'], explanation: 'אני רוכב ברכבת התחתית - Ride the subway underground' },
    { id: 189, sentence: 'I drive a ___ for work.', answer: 'truck', options: ['truck', 'van', 'car', 'suv'], explanation: 'אני נוהג במשאית לעבודה - Drive a truck for work' },
    { id: 190, sentence: 'I ride a ___ in the park.', answer: 'scooter', options: ['scooter', 'bicycle', 'skateboard', 'roller skates'], explanation: 'אני רוכב על קורקינט בפארק - Ride a scooter in the park' },
    
    // Advanced Weather (מזג אוויר מתקדם)
    { id: 191, sentence: 'It is ___ and humid.', answer: 'hot', options: ['hot', 'cold', 'warm', 'cool'], explanation: 'זה חם ולח - It is hot and humid' },
    { id: 192, sentence: 'It is ___ and foggy.', answer: 'cold', options: ['cold', 'hot', 'warm', 'cool'], explanation: 'זה קר וערפילי - It is cold and foggy' },
    { id: 193, sentence: 'It is ___ and breezy.', answer: 'pleasant', options: ['pleasant', 'hot', 'cold', 'stormy'], explanation: 'זה נעים וסוער - It is pleasant and breezy' },
    { id: 194, sentence: 'It is ___ and stormy.', answer: 'dark', options: ['dark', 'bright', 'cloudy', 'sunny'], explanation: 'זה חשוך וסוער - It is dark and stormy' },
    { id: 195, sentence: 'It is ___ and clear.', answer: 'sunny', options: ['sunny', 'cloudy', 'rainy', 'snowy'], explanation: 'זה שמשי ובהיר - It is sunny and clear' },
    { id: 196, sentence: 'The ___ is howling.', answer: 'wind', options: ['wind', 'storm', 'rain', 'snow'], explanation: 'הרוח מייללת - The wind is howling' },
    { id: 197, sentence: 'The ___ is pouring.', answer: 'rain', options: ['rain', 'snow', 'hail', 'sleet'], explanation: 'הגשם שוטף - The rain is pouring' },
    { id: 198, sentence: 'The ___ is falling gently.', answer: 'snow', options: ['snow', 'rain', 'hail', 'sleet'], explanation: 'השלג יורד בעדינות - The snow is falling gently' },
    { id: 199, sentence: 'The ___ is shining brightly.', answer: 'sun', options: ['sun', 'moon', 'star', 'light'], explanation: 'השמש זורחת בבהירות - The sun is shining brightly' },
    { id: 200, sentence: 'The ___ is covering the sky.', answer: 'clouds', options: ['clouds', 'fog', 'mist', 'smoke'], explanation: 'העננים מכסים את השמיים - The clouds are covering the sky' },
  ],
  hard: [
    // Professional Vocabulary (אוצר מילים מקצועי)
    { id: 201, sentence: 'The ___ is analyzing the data.', answer: 'scientist', options: ['scientist', 'teacher', 'doctor', 'lawyer'], explanation: 'המדען מנתח את הנתונים - The scientist is analyzing the data' },
    { id: 202, sentence: 'The ___ is performing surgery.', answer: 'surgeon', options: ['surgeon', 'nurse', 'doctor', 'dentist'], explanation: 'המנתח מבצע ניתוח - The surgeon is performing surgery' },
    { id: 203, sentence: 'The ___ is defending the client.', answer: 'lawyer', options: ['lawyer', 'judge', 'police', 'detective'], explanation: 'העורך דין מגן על הלקוח - The lawyer is defending the client' },
    { id: 204, sentence: 'The ___ is designing a building.', answer: 'architect', options: ['architect', 'engineer', 'builder', 'contractor'], explanation: 'האדריכל מתכנן בניין - The architect is designing a building' },
    { id: 205, sentence: 'The ___ is programming software.', answer: 'developer', options: ['developer', 'designer', 'analyst', 'manager'], explanation: 'המפתח כותב תוכנה - The developer is programming software' },
    { id: 206, sentence: 'The ___ is managing the project.', answer: 'manager', options: ['manager', 'director', 'supervisor', 'coordinator'], explanation: 'המנהל מנהל את הפרויקט - The manager is managing the project' },
    { id: 207, sentence: 'The ___ is teaching mathematics.', answer: 'professor', options: ['professor', 'teacher', 'instructor', 'tutor'], explanation: 'הפרופסור מלמד מתמטיקה - The professor is teaching mathematics' },
    { id: 208, sentence: 'The ___ is conducting research.', answer: 'researcher', options: ['researcher', 'scientist', 'analyst', 'investigator'], explanation: 'החוקר מבצע מחקר - The researcher is conducting research' },
    { id: 209, sentence: 'The ___ is creating artwork.', answer: 'artist', options: ['artist', 'designer', 'painter', 'sculptor'], explanation: 'האמן יוצר יצירת אמנות - The artist is creating artwork' },
    { id: 210, sentence: 'The ___ is writing a novel.', answer: 'author', options: ['author', 'writer', 'journalist', 'editor'], explanation: 'הסופר כותב רומן - The author is writing a novel' },
    
    // Advanced Technology (טכנולוגיה מתקדמת)
    { id: 211, sentence: 'I use a ___ to process data.', answer: 'computer', options: ['computer', 'calculator', 'phone', 'tablet'], explanation: 'אני משתמש במחשב לעיבוד נתונים - Use computer to process data' },
    { id: 212, sentence: 'The ___ is connecting to the internet.', answer: 'router', options: ['router', 'modem', 'server', 'network'], explanation: 'הנתב מתחבר לאינטרנט - The router is connecting to the internet' },
    { id: 213, sentence: 'I store files on the ___.', answer: 'hard drive', options: ['hard drive', 'memory', 'processor', 'motherboard'], explanation: 'אני שומר קבצים על הכונן הקשיח - Store files on the hard drive' },
    { id: 214, sentence: 'The ___ is displaying the image.', answer: 'monitor', options: ['monitor', 'screen', 'display', 'television'], explanation: 'המסך מציג את התמונה - The monitor is displaying the image' },
    { id: 215, sentence: 'I type on the ___.', answer: 'keyboard', options: ['keyboard', 'mouse', 'touchpad', 'stylus'], explanation: 'אני מקליד על המקלדת - Type on the keyboard' },
    { id: 216, sentence: 'The ___ is processing information.', answer: 'processor', options: ['processor', 'memory', 'storage', 'graphics'], explanation: 'המעבד מעבד מידע - The processor is processing information' },
    { id: 217, sentence: 'I connect devices with a ___.', answer: 'cable', options: ['cable', 'wire', 'cord', 'connection'], explanation: 'אני מחבר מכשירים עם כבל - Connect devices with a cable' },
    { id: 218, sentence: 'The ___ is providing wireless connection.', answer: 'wifi', options: ['wifi', 'bluetooth', 'ethernet', 'cellular'], explanation: 'ה-WiFi מספק חיבור אלחוטי - The wifi is providing wireless connection' },
    { id: 219, sentence: 'I use a ___ to scan documents.', answer: 'scanner', options: ['scanner', 'printer', 'copier', 'fax'], explanation: 'אני משתמש בסורק לסריקת מסמכים - Use scanner to scan documents' },
    { id: 220, sentence: 'The ___ is printing the document.', answer: 'printer', options: ['printer', 'scanner', 'copier', 'fax'], explanation: 'המדפסת מדפיסה את המסמך - The printer is printing the document' },
    
    // Advanced Science (מדע מתקדם)
    { id: 221, sentence: 'The ___ is studying the stars.', answer: 'astronomer', options: ['astronomer', 'scientist', 'physicist', 'researcher'], explanation: 'האסטרונום חוקר את הכוכבים - The astronomer is studying the stars' },
    { id: 222, sentence: 'The ___ is examining the specimen.', answer: 'microscope', options: ['microscope', 'telescope', 'magnifier', 'lens'], explanation: 'המיקרוסקופ בודק את הדגימה - The microscope is examining the specimen' },
    { id: 223, sentence: 'The ___ is measuring temperature.', answer: 'thermometer', options: ['thermometer', 'barometer', 'hygrometer', 'anemometer'], explanation: 'המדחום מודד טמפרטורה - The thermometer is measuring temperature' },
    { id: 224, sentence: 'The ___ is analyzing the chemical.', answer: 'laboratory', options: ['laboratory', 'workshop', 'studio', 'office'], explanation: 'המעבדה מנתחת את הכימיקל - The laboratory is analyzing the chemical' },
    { id: 225, sentence: 'The ___ is conducting experiments.', answer: 'scientist', options: ['scientist', 'researcher', 'analyst', 'technician'], explanation: 'המדען מבצע ניסויים - The scientist is conducting experiments' },
    { id: 226, sentence: 'The ___ is studying the weather.', answer: 'meteorologist', options: ['meteorologist', 'climatologist', 'geologist', 'biologist'], explanation: 'המטאורולוג חוקר את מזג האוויר - The meteorologist is studying the weather' },
    { id: 227, sentence: 'The ___ is researching the ocean.', answer: 'oceanographer', options: ['oceanographer', 'marine biologist', 'geologist', 'ecologist'], explanation: 'האוקיינוגרף חוקר את האוקיינוס - The oceanographer is researching the ocean' },
    { id: 228, sentence: 'The ___ is studying the earth.', answer: 'geologist', options: ['geologist', 'geographer', 'archaeologist', 'paleontologist'], explanation: 'הגיאולוג חוקר את כדור הארץ - The geologist is studying the earth' },
    { id: 229, sentence: 'The ___ is examining the patient.', answer: 'doctor', options: ['doctor', 'nurse', 'surgeon', 'specialist'], explanation: 'הרופא בודק את המטופל - The doctor is examining the patient' },
    { id: 230, sentence: 'The ___ is analyzing the blood.', answer: 'laboratory', options: ['laboratory', 'clinic', 'hospital', 'medical center'], explanation: 'המעבדה מנתחת את הדם - The laboratory is analyzing the blood' },
    
    // Advanced Business (עסקים מתקדמים)
    { id: 231, sentence: 'The ___ is managing the company.', answer: 'executive', options: ['executive', 'manager', 'director', 'supervisor'], explanation: 'המנהל מנהל את החברה - The executive is managing the company' },
    { id: 232, sentence: 'The ___ is analyzing the market.', answer: 'analyst', options: ['analyst', 'researcher', 'consultant', 'advisor'], explanation: 'האנליסט מנתח את השוק - The analyst is analyzing the market' },
    { id: 233, sentence: 'The ___ is handling the finances.', answer: 'accountant', options: ['accountant', 'bookkeeper', 'auditor', 'financial advisor'], explanation: 'הרואה חשבון מטפל בכספים - The accountant is handling the finances' },
    { id: 234, sentence: 'The ___ is selling the product.', answer: 'salesperson', options: ['salesperson', 'marketer', 'representative', 'agent'], explanation: 'איש המכירות מוכר את המוצר - The salesperson is selling the product' },
    { id: 235, sentence: 'The ___ is creating the advertisement.', answer: 'advertiser', options: ['advertiser', 'marketer', 'designer', 'copywriter'], explanation: 'המפרסם יוצר את הפרסומת - The advertiser is creating the advertisement' },
    { id: 236, sentence: 'The ___ is managing the inventory.', answer: 'warehouse', options: ['warehouse', 'storage', 'depot', 'facility'], explanation: 'המחסן מנהל את המלאי - The warehouse is managing the inventory' },
    { id: 237, sentence: 'The ___ is processing the order.', answer: 'fulfillment', options: ['fulfillment', 'shipping', 'delivery', 'logistics'], explanation: 'מחלקת המילוי מעבדת את ההזמנה - The fulfillment is processing the order' },
    { id: 238, sentence: 'The ___ is handling customer service.', answer: 'representative', options: ['representative', 'agent', 'specialist', 'coordinator'], explanation: 'הנציג מטפל בשירות לקוחות - The representative is handling customer service' },
    { id: 239, sentence: 'The ___ is developing the strategy.', answer: 'strategist', options: ['strategist', 'planner', 'consultant', 'advisor'], explanation: 'האסטרטג מפתח את האסטרטגיה - The strategist is developing the strategy' },
    { id: 240, sentence: 'The ___ is overseeing the operations.', answer: 'supervisor', options: ['supervisor', 'manager', 'director', 'coordinator'], explanation: 'המפקח מפקח על הפעולות - The supervisor is overseeing the operations' },
    
    // Advanced Medicine (רפואה מתקדמת)
    { id: 241, sentence: 'The ___ is examining the heart.', answer: 'cardiologist', options: ['cardiologist', 'neurologist', 'dermatologist', 'oncologist'], explanation: 'הקרדיולוג בודק את הלב - The cardiologist is examining the heart' },
    { id: 242, sentence: 'The ___ is studying the brain.', answer: 'neurologist', options: ['neurologist', 'psychiatrist', 'psychologist', 'therapist'], explanation: 'הנוירולוג חוקר את המוח - The neurologist is studying the brain' },
    { id: 243, sentence: 'The ___ is treating the skin.', answer: 'dermatologist', options: ['dermatologist', 'cosmetologist', 'aesthetician', 'beautician'], explanation: 'הדרמטולוג מטפל בעור - The dermatologist is treating the skin' },
    { id: 244, sentence: 'The ___ is caring for children.', answer: 'pediatrician', options: ['pediatrician', 'family doctor', 'general practitioner', 'internist'], explanation: 'הרופא ילדים מטפל בילדים - The pediatrician is caring for children' },
    { id: 245, sentence: 'The ___ is treating the eyes.', answer: 'ophthalmologist', options: ['ophthalmologist', 'optometrist', 'optician', 'eye doctor'], explanation: 'האופטלמולוג מטפל בעיניים - The ophthalmologist is treating the eyes' },
    { id: 246, sentence: 'The ___ is treating the teeth.', answer: 'dentist', options: ['dentist', 'orthodontist', 'oral surgeon', 'dental hygienist'], explanation: 'הרופא שיניים מטפל בשיניים - The dentist is treating the teeth' },
    { id: 247, sentence: 'The ___ is treating the bones.', answer: 'orthopedist', options: ['orthopedist', 'rheumatologist', 'chiropractor', 'physical therapist'], explanation: 'האורתופד מטפל בעצמות - The orthopedist is treating the bones' },
    { id: 248, sentence: 'The ___ is treating the mind.', answer: 'psychiatrist', options: ['psychiatrist', 'psychologist', 'therapist', 'counselor'], explanation: 'הפסיכיאטר מטפל בנפש - The psychiatrist is treating the mind' },
    { id: 249, sentence: 'The ___ is treating cancer.', answer: 'oncologist', options: ['oncologist', 'hematologist', 'radiologist', 'pathologist'], explanation: 'האונקולוג מטפל בסרטן - The oncologist is treating cancer' },
    { id: 250, sentence: 'The ___ is treating the elderly.', answer: 'geriatrician', options: ['geriatrician', 'internist', 'family doctor', 'specialist'], explanation: 'הגריאטר מטפל בקשישים - The geriatrician is treating the elderly' },
    
    // Advanced Arts (אמנות מתקדמת)
    { id: 251, sentence: 'The ___ is conducting the orchestra.', answer: 'conductor', options: ['conductor', 'director', 'composer', 'musician'], explanation: 'המנצח מנצח על התזמורת - The conductor is conducting the orchestra' },
    { id: 252, sentence: 'The ___ is playing the violin.', answer: 'violinist', options: ['violinist', 'pianist', 'guitarist', 'drummer'], explanation: 'הכנר מנגן בכינור - The violinist is playing the violin' },
    { id: 253, sentence: 'The ___ is singing the aria.', answer: 'soprano', options: ['soprano', 'tenor', 'baritone', 'bass'], explanation: 'הסופרן שרה את האריה - The soprano is singing the aria' },
    { id: 254, sentence: 'The ___ is painting the portrait.', answer: 'portraitist', options: ['portraitist', 'landscapist', 'still life painter', 'abstract artist'], explanation: 'צייר הדיוקנאות מצייר את הדיוקן - The portraitist is painting the portrait' },
    { id: 255, sentence: 'The ___ is sculpting the statue.', answer: 'sculptor', options: ['sculptor', 'carver', 'molder', 'artist'], explanation: 'הפסל מפסל את הפסל - The sculptor is sculpting the statue' },
    { id: 256, sentence: 'The ___ is directing the film.', answer: 'director', options: ['director', 'producer', 'cinematographer', 'editor'], explanation: 'הבמאי מביים את הסרט - The director is directing the film' },
    { id: 257, sentence: 'The ___ is acting in the play.', answer: 'actor', options: ['actor', 'actress', 'performer', 'entertainer'], explanation: 'השחקן משחק במחזה - The actor is acting in the play' },
    { id: 258, sentence: 'The ___ is choreographing the dance.', answer: 'choreographer', options: ['choreographer', 'dancer', 'instructor', 'performer'], explanation: 'הכוריאוגרף כוריאוגרף את הריקוד - The choreographer is choreographing the dance' },
    { id: 259, sentence: 'The ___ is writing the screenplay.', answer: 'screenwriter', options: ['screenwriter', 'playwright', 'novelist', 'poet'], explanation: 'תסריטאי כותב את התסריט - The screenwriter is writing the screenplay' },
    { id: 260, sentence: 'The ___ is designing the set.', answer: 'set designer', options: ['set designer', 'costume designer', 'lighting designer', 'art director'], explanation: 'מעצב התפאורה מעצב את התפאורה - The set designer is designing the set' },
    
    // Advanced Sports (ספורט מתקדם)
    { id: 261, sentence: 'The ___ is coaching the team.', answer: 'coach', options: ['coach', 'manager', 'trainer', 'instructor'], explanation: 'המאמן מאמן את הקבוצה - The coach is coaching the team' },
    { id: 262, sentence: 'The ___ is refereeing the game.', answer: 'referee', options: ['referee', 'umpire', 'judge', 'official'], explanation: 'השופט שופט את המשחק - The referee is refereeing the game' },
    { id: 263, sentence: 'The ___ is playing tennis.', answer: 'tennis player', options: ['tennis player', 'golfer', 'swimmer', 'runner'], explanation: 'שחקן הטניס משחק טניס - The tennis player is playing tennis' },
    { id: 264, sentence: 'The ___ is swimming in the pool.', answer: 'swimmer', options: ['swimmer', 'diver', 'water polo player', 'synchronized swimmer'], explanation: 'השחיין שוחה בבריכה - The swimmer is swimming in the pool' },
    { id: 265, sentence: 'The ___ is running the marathon.', answer: 'marathon runner', options: ['marathon runner', 'sprinter', 'jogger', 'athlete'], explanation: 'רץ המרתון רץ את המרתון - The marathon runner is running the marathon' },
    { id: 266, sentence: 'The ___ is playing basketball.', answer: 'basketball player', options: ['basketball player', 'volleyball player', 'handball player', 'athlete'], explanation: 'שחקן הכדורסל משחק כדורסל - The basketball player is playing basketball' },
    { id: 267, sentence: 'The ___ is playing soccer.', answer: 'soccer player', options: ['soccer player', 'football player', 'rugby player', 'athlete'], explanation: 'שחקן הכדורגל משחק כדורגל - The soccer player is playing soccer' },
    { id: 268, sentence: 'The ___ is playing baseball.', answer: 'baseball player', options: ['baseball player', 'softball player', 'cricket player', 'athlete'], explanation: 'שחקן הבייסבול משחק בייסבול - The baseball player is playing baseball' },
    { id: 269, sentence: 'The ___ is playing golf.', answer: 'golfer', options: ['golfer', 'tennis player', 'bowler', 'athlete'], explanation: 'הגולף משחק גולף - The golfer is playing golf' },
    { id: 270, sentence: 'The ___ is playing hockey.', answer: 'hockey player', options: ['hockey player', 'ice skater', 'figure skater', 'athlete'], explanation: 'שחקן ההוקי משחק הוקי - The hockey player is playing hockey' },
    
    // Advanced Environment (סביבה מתקדמת)
    { id: 271, sentence: 'The ___ is studying climate change.', answer: 'climatologist', options: ['climatologist', 'meteorologist', 'environmentalist', 'ecologist'], explanation: 'הקלימטולוג חוקר את שינוי האקלים - The climatologist is studying climate change' },
    { id: 272, sentence: 'The ___ is protecting wildlife.', answer: 'conservationist', options: ['conservationist', 'environmentalist', 'ecologist', 'biologist'], explanation: 'השימורן מגן על חיות הבר - The conservationist is protecting wildlife' },
    { id: 273, sentence: 'The ___ is studying ecosystems.', answer: 'ecologist', options: ['ecologist', 'biologist', 'environmentalist', 'conservationist'], explanation: 'האקולוג חוקר מערכות אקולוגיות - The ecologist is studying ecosystems' },
    { id: 274, sentence: 'The ___ is researching pollution.', answer: 'environmental scientist', options: ['environmental scientist', 'chemist', 'biologist', 'engineer'], explanation: 'מדען הסביבה חוקר זיהום - The environmental scientist is researching pollution' },
    { id: 275, sentence: 'The ___ is studying marine life.', answer: 'marine biologist', options: ['marine biologist', 'oceanographer', 'aquarist', 'fisheries biologist'], explanation: 'הביולוג הימי חוקר חיים ימיים - The marine biologist is studying marine life' },
    { id: 276, sentence: 'The ___ is analyzing water quality.', answer: 'hydrologist', options: ['hydrologist', 'oceanographer', 'environmental engineer', 'chemist'], explanation: 'ההידרולוג מנתח איכות מים - The hydrologist is analyzing water quality' },
    { id: 277, sentence: 'The ___ is studying soil composition.', answer: 'soil scientist', options: ['soil scientist', 'geologist', 'agricultural scientist', 'environmental scientist'], explanation: 'מדען הקרקע חוקר הרכב קרקע - The soil scientist is studying soil composition' },
    { id: 278, sentence: 'The ___ is researching renewable energy.', answer: 'energy researcher', options: ['energy researcher', 'engineer', 'scientist', 'technologist'], explanation: 'חוקר האנרגיה חוקר אנרגיה מתחדשת - The energy researcher is researching renewable energy' },
    { id: 279, sentence: 'The ___ is studying air quality.', answer: 'atmospheric scientist', options: ['atmospheric scientist', 'meteorologist', 'climatologist', 'environmental scientist'], explanation: 'מדען האטמוספרה חוקר איכות אוויר - The atmospheric scientist is studying air quality' },
    { id: 280, sentence: 'The ___ is protecting endangered species.', answer: 'wildlife biologist', options: ['wildlife biologist', 'conservationist', 'ecologist', 'zoologist'], explanation: 'הביולוג לחיות בר מגן על מינים בסכנת הכחדה - The wildlife biologist is protecting endangered species' },
    
    // Advanced Literature (ספרות מתקדמת)
    { id: 281, sentence: 'The ___ is writing poetry.', answer: 'poet', options: ['poet', 'novelist', 'playwright', 'essayist'], explanation: 'המשורר כותב שירה - The poet is writing poetry' },
    { id: 282, sentence: 'The ___ is writing a novel.', answer: 'novelist', options: ['novelist', 'poet', 'playwright', 'essayist'], explanation: 'הסופר כותב רומן - The novelist is writing a novel' },
    { id: 283, sentence: 'The ___ is writing a play.', answer: 'playwright', options: ['playwright', 'screenwriter', 'novelist', 'poet'], explanation: 'המחזאי כותב מחזה - The playwright is writing a play' },
    { id: 284, sentence: 'The ___ is writing an essay.', answer: 'essayist', options: ['essayist', 'journalist', 'critic', 'columnist'], explanation: 'כותב המסות כותב מסה - The essayist is writing an essay' },
    { id: 285, sentence: 'The ___ is writing a biography.', answer: 'biographer', options: ['biographer', 'historian', 'memoirist', 'autobiographer'], explanation: 'כותב הביוגרפיה כותב ביוגרפיה - The biographer is writing a biography' },
    { id: 286, sentence: 'The ___ is writing a memoir.', answer: 'memoirist', options: ['memoirist', 'biographer', 'autobiographer', 'historian'], explanation: 'כותב הזיכרונות כותב זיכרונות - The memoirist is writing a memoir' },
    { id: 287, sentence: 'The ___ is writing a critique.', answer: 'critic', options: ['critic', 'reviewer', 'analyst', 'commentator'], explanation: 'המבקר כותב ביקורת - The critic is writing a critique' },
    { id: 288, sentence: 'The ___ is writing a column.', answer: 'columnist', options: ['columnist', 'journalist', 'reporter', 'correspondent'], explanation: 'כותב הטור כותב טור - The columnist is writing a column' },
    { id: 289, sentence: 'The ___ is writing a report.', answer: 'reporter', options: ['reporter', 'journalist', 'correspondent', 'investigator'], explanation: 'הכתב כותב דוח - The reporter is writing a report' },
    { id: 290, sentence: 'The ___ is writing a review.', answer: 'reviewer', options: ['reviewer', 'critic', 'analyst', 'evaluator'], explanation: 'המבקר כותב ביקורת - The reviewer is writing a review' },
    
    // Advanced History (היסטוריה מתקדמת)
    { id: 291, sentence: 'The ___ is studying ancient civilizations.', answer: 'archaeologist', options: ['archaeologist', 'historian', 'anthropologist', 'paleontologist'], explanation: 'הארכיאולוג חוקר תרבויות עתיקות - The archaeologist is studying ancient civilizations' },
    { id: 292, sentence: 'The ___ is researching historical documents.', answer: 'historian', options: ['historian', 'archaeologist', 'researcher', 'scholar'], explanation: 'ההיסטוריון חוקר מסמכים היסטוריים - The historian is researching historical documents' },
    { id: 293, sentence: 'The ___ is studying human cultures.', answer: 'anthropologist', options: ['anthropologist', 'sociologist', 'ethnologist', 'cultural researcher'], explanation: 'האנתרופולוג חוקר תרבויות אנושיות - The anthropologist is studying human cultures' },
    { id: 294, sentence: 'The ___ is studying ancient fossils.', answer: 'paleontologist', options: ['paleontologist', 'archaeologist', 'geologist', 'biologist'], explanation: 'הפליאונטולוג חוקר מאובנים עתיקים - The paleontologist is studying ancient fossils' },
    { id: 295, sentence: 'The ___ is studying ancient artifacts.', answer: 'archaeologist', options: ['archaeologist', 'historian', 'anthropologist', 'curator'], explanation: 'הארכיאולוג חוקר חפצים עתיקים - The archaeologist is studying ancient artifacts' },
    { id: 296, sentence: 'The ___ is studying ancient texts.', answer: 'philologist', options: ['philologist', 'linguist', 'historian', 'scholar'], explanation: 'הפילולוג חוקר טקסטים עתיקים - The philologist is studying ancient texts' },
    { id: 297, sentence: 'The ___ is studying ancient languages.', answer: 'linguist', options: ['linguist', 'philologist', 'translator', 'interpreter'], explanation: 'הבלשן חוקר שפות עתיקות - The linguist is studying ancient languages' },
    { id: 298, sentence: 'The ___ is studying ancient art.', answer: 'art historian', options: ['art historian', 'curator', 'critic', 'scholar'], explanation: 'היסטוריון האמנות חוקר אמנות עתיקה - The art historian is studying ancient art' },
    { id: 299, sentence: 'The ___ is studying ancient music.', answer: 'musicologist', options: ['musicologist', 'composer', 'musician', 'scholar'], explanation: 'המוזיקולוג חוקר מוזיקה עתיקה - The musicologist is studying ancient music' },
    { id: 300, sentence: 'The ___ is studying ancient philosophy.', answer: 'philosopher', options: ['philosopher', 'theologian', 'scholar', 'thinker'], explanation: 'הפילוסוף חוקר פילוסופיה עתיקה - The philosopher is studying ancient philosophy' },
  ],
  
  // רמה 4: קיצוני - מילים מקצועיות ומדעיות מאוד
  extreme: [
    { id: 301, sentence: 'The ___ analyzes chemical compounds.', answer: 'spectrometer', options: ['spectrometer', 'microscope', 'telescope', 'thermometer'], explanation: 'ספקטרומטר מנתח תרכובות כימיות - Spectrometer analyzes chemical compounds' },
    { id: 302, sentence: 'The ___ measures electromagnetic radiation.', answer: 'radiometer', options: ['radiometer', 'thermometer', 'barometer', 'clock'], explanation: 'רדיומטר מודד קרינה אלקטרומגנטית - Radiometer measures electromagnetic radiation' },
    { id: 303, sentence: 'The ___ studies quantum mechanics.', answer: 'physicist', options: ['physicist', 'chemist', 'biologist', 'geologist'], explanation: 'פיזיקאי חוקר מכניקת קוונטים - Physicist studies quantum mechanics' },
    { id: 304, sentence: 'The ___ examines cellular structures.', answer: 'cytologist', options: ['cytologist', 'biologist', 'chemist', 'physicist'], explanation: 'ציטולוג בודק מבני תאים - Cytologist examines cellular structures' },
    { id: 305, sentence: 'The ___ investigates neurological disorders.', answer: 'neurologist', options: ['neurologist', 'psychologist', 'psychiatrist', 'therapist'], explanation: 'נוירולוג חוקר הפרעות נוירולוגיות - Neurologist investigates neurological disorders' },
    { id: 306, sentence: 'The ___ analyzes DNA sequences.', answer: 'geneticist', options: ['geneticist', 'biologist', 'chemist', 'physicist'], explanation: 'גנטיקאי מנתח רצפי DNA - Geneticist analyzes DNA sequences' },
    { id: 307, sentence: 'The ___ measures atmospheric pressure.', answer: 'barometer', options: ['barometer', 'thermometer', 'hygrometer', 'anemometer'], explanation: 'ברומטר מודד לחץ אטמוספרי - Barometer measures atmospheric pressure' },
    { id: 308, sentence: 'The ___ studies volcanic activity.', answer: 'volcanologist', options: ['volcanologist', 'geologist', 'seismologist', 'meteorologist'], explanation: 'וולקנולוג חוקר פעילות וולקנית - Volcanologist studies volcanic activity' },
    { id: 309, sentence: 'The ___ examines microscopic organisms.', answer: 'microbiologist', options: ['microbiologist', 'biologist', 'zoologist', 'botanist'], explanation: 'מיקרוביולוג בודק אורגניזמים מיקרוסקופיים - Microbiologist examines microscopic organisms' },
    { id: 310, sentence: 'The ___ analyzes astronomical data.', answer: 'astrophysicist', options: ['astrophysicist', 'astronomer', 'physicist', 'cosmologist'], explanation: 'אסטרופיזיקאי מנתח נתונים אסטרונומיים - Astrophysicist analyzes astronomical data' },
    { id: 311, sentence: 'The ___ measures electrical resistance.', answer: 'ohmmeter', options: ['ohmmeter', 'voltmeter', 'ammeter', 'multimeter'], explanation: 'אוהממטר מודד התנגדות חשמלית - Ohmmeter measures electrical resistance' },
    { id: 312, sentence: 'The ___ studies biochemical processes.', answer: 'biochemist', options: ['biochemist', 'chemist', 'biologist', 'physicist'], explanation: 'ביוכימאי חוקר תהליכים ביוכימיים - Biochemist studies biochemical processes' },
    { id: 313, sentence: 'The ___ examines geological formations.', answer: 'geomorphologist', options: ['geomorphologist', 'geologist', 'seismologist', 'volcanologist'], explanation: 'גיאומורפולוג בודק תצורות גיאולוגיות - Geomorphologist examines geological formations' },
    { id: 314, sentence: 'The ___ analyzes molecular structures.', answer: 'crystallographer', options: ['crystallographer', 'chemist', 'physicist', 'biologist'], explanation: 'קריסטלוגרף מנתח מבנים מולקולריים - Crystallographer analyzes molecular structures' },
    { id: 315, sentence: 'The ___ studies marine ecosystems.', answer: 'oceanographer', options: ['oceanographer', 'marine biologist', 'ecologist', 'biologist'], explanation: 'אוקיינוגרף חוקר מערכות אקולוגיות ימיות - Oceanographer studies marine ecosystems' },
    { id: 316, sentence: 'The ___ measures radioactive decay.', answer: 'scintillation counter', options: ['scintillation counter', 'geiger counter', 'dosimeter', 'spectrometer'], explanation: 'מונה נצנוץ מודד דעיכה רדיואקטיבית - Scintillation counter measures radioactive decay' },
    { id: 317, sentence: 'The ___ examines fossil records.', answer: 'paleontologist', options: ['paleontologist', 'archaeologist', 'geologist', 'anthropologist'], explanation: 'פליאונטולוג בודק תיעוד מאובנים - Paleontologist examines fossil records' },
    { id: 318, sentence: 'The ___ analyzes seismic waves.', answer: 'seismologist', options: ['seismologist', 'geologist', 'volcanologist', 'meteorologist'], explanation: 'סיסמולוג מנתח גלים סיסמיים - Seismologist analyzes seismic waves' },
    { id: 319, sentence: 'The ___ studies atmospheric phenomena.', answer: 'meteorologist', options: ['meteorologist', 'climatologist', 'geologist', 'physicist'], explanation: 'מטאורולוג חוקר תופעות אטמוספריות - Meteorologist studies atmospheric phenomena' },
    { id: 320, sentence: 'The ___ measures light wavelengths.', answer: 'spectrophotometer', options: ['spectrophotometer', 'photometer', 'spectrometer', 'radiometer'], explanation: 'ספקטרופוטומטר מודד אורכי גל של אור - Spectrophotometer measures light wavelengths' },
  ]
};

const DIFFICULTIES = [
  { key: 'easy', label: 'קל', count: 20 },
  { key: 'medium', label: 'בינוני', count: 20 },
  { key: 'hard', label: 'קשה', count: 20 },
  { key: 'extreme', label: 'אקסטרים', count: 20 },
];

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

// פונקציה לחילוץ כל המילים האנגליות ממשפט
function extractEnglishWords(text: string): string[] {
  if (!text) return [];
  // מחליף את ___ ברווח כדי לא לפספס מילים
  const cleanText = text.replace(/___/g, ' ');
  const englishWords = cleanText.match(/[A-Za-z]+/g) || [];
  // מסנן מילים קצרות מדי ומילות קישור נפוצות
  return englishWords
    .map(word => word.toLowerCase())
    .filter(word => 
      word.length > 2 && 
      !['the', 'and', 'is', 'are', 'was', 'were', 'has', 'have', 'had', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'from'].includes(word)
    );
}

const allWords = Array.from(new Set(Object.values(QUESTION_BANK).flat().map(q => q.answer)));

// יצירת מילון תרגומים מכל השאלות
function buildTranslationDictionary(): Map<string, string> {
  const dict = new Map<string, string>();
  
  // מילון בסיסי למילים נפוצות - כולל את כל המילים מהשאלות
  const basicTranslations: Record<string, string> = {
    // בעלי חיים
    'dog': 'כלב', 'cat': 'חתול', 'bird': 'ציפור', 'fish': 'דג', 'frog': 'צפרדע',
    'bear': 'דוב', 'lion': 'אריה', 'whale': 'לווייתן', 'monkey': 'קוף', 'deer': 'צבי',
    'owl': 'ינשוף', 'rabbit': 'ארנב', 'duck': 'ברווז', 'eagle': 'נשר', 'snake': 'נחש',
    // אוכל
    'apple': 'תפוח', 'banana': 'בננה', 'water': 'מים', 'milk': 'חלב', 'tea': 'תה',
    'bread': 'לחם', 'rice': 'אורז', 'cake': 'עוגה', 'soup': 'מרק', 'egg': 'ביצה',
    'pasta': 'פסטה', 'curry': 'קארי', 'lemonade': 'לימונדה', 'honey': 'דבש',
    'toast': 'טוסט', 'ice cream': 'גלידה', 'sushi': 'סושי', 'pizza': 'פיצה',
    'orange juice': 'מיץ תפוזים', 'chips': 'צ\'יפס',
    // טבע
    'sun': 'שמש', 'moon': 'ירח', 'sky': 'שמיים', 'tree': 'עץ', 'flower': 'פרח',
    'grass': 'דשא', 'cloud': 'ענן', 'snow': 'שלג', 'rain': 'גשם', 'sea': 'ים',
    'hill': 'גבעה', 'mountain': 'הר', 'ocean': 'אוקיינוס', 'forest': 'יער',
    'volcano': 'הר געש', 'river': 'נהר', 'bamboo': 'במבוק', 'glacier': 'קרחון',
    'rainbow': 'קשת', 'cave': 'מערה',
    // חפצים
    'book': 'ספר', 'pen': 'עט', 'cup': 'כוס', 'ball': 'כדור', 'hat': 'כובע',
    'shoes': 'נעליים', 'chair': 'כיסא', 'bed': 'מיטה', 'bike': 'אופניים',
    'camera': 'מצלמה', 'television': 'טלוויזיה', 'headphones': 'אוזניות',
    'clock': 'שעון', 'key': 'מפתח', 'telescope': 'טלסקופ', 'blanket': 'שמיכה',
    'toothbrush': 'מברשת שיניים', 'hair dryer': 'מייבש שיער', 'lock': 'מנעול',
    'can': 'פחית/יכול', 'bottle': 'בקבוק', 'box': 'קופסה', 'bag': 'תיק',
    // משפחה
    'mom': 'אמא', 'dad': 'אבא', 'sister': 'אחות', 'brother': 'אח', 'family': 'משפחה',
    'daughter': 'בת', 'son': 'בן', 'father': 'אבא', 'mother': 'אמא',
    'grandmother': 'סבתא', 'teenager': 'נער',
    // בית
    'home': 'בית', 'school': 'בית ספר', 'toy': 'צעצוע', 'friend': 'חבר', 'pet': 'חיית מחמד',
    'teacher': 'מורה', 'desk': 'שולחן', 'notebook': 'מחברת', 'pencil': 'עיפרון',
    'textbook': 'ספר לימוד', 'backpack': 'תיק', 'cafeteria': 'קפיטריה',
    'playground': 'מגרש משחקים', 'library': 'ספרייה', 'professor': 'פרופסור',
    'calculator': 'מחשבון', 'gymnasium': 'אולם ספורט', 'laboratory': 'מעבדה',
    'lectures': 'הרצאות', 'exams': 'בחינות',
    'house': 'בית', 'bedroom': 'חדר שינה', 'kitchen': 'מטבח', 'living room': 'סלון',
    'bathroom': 'חדר אמבטיה', 'garage': 'מוסך', 'garden': 'גינה', 'basement': 'מרתף',
    'stairs': 'מדרגות', 'door': 'דלת', 'attic': 'עליית גג', 'closet': 'ארון',
    'dining room': 'חדר אוכל', 'office': 'משרד',
    // תחבורה
    'car': 'מכונית', 'bus': 'אוטובוס', 'airplane': 'מטוס', 'train': 'רכבת',
    'boat': 'סירה', 'motorcycle': 'אופנוע', 'taxi': 'מונית', 'sidewalk': 'מדרכה',
    'street': 'רחוב', 'bicycle': 'אופניים', 'ship': 'אונייה', 'subway': 'רכבת תחתית',
    'truck': 'משאית', 'scooter': 'קורקינט',
    // מזג אוויר
    'sunny': 'שמשי', 'rainy': 'גשום', 'snowy': 'מושלג', 'cloudy': 'מעונן',
    'wind': 'רוח', 'night': 'לילה', 'pleasant': 'נעים', 'dark': 'חשוך',
    'clouds': 'עננים',
    // צבעים
    'rose': 'ורד', 'grape': 'ענב', 'carrot': 'גזר', 'coin': 'מטבע', 'ring': 'טבעת',
    'wine': 'יין', 'gem': 'אבן יקרה', 'reef': 'שונית',
    // אנשים מקצועיים
    'scientist': 'מדען', 'surgeon': 'מנתח', 'lawyer': 'עורך דין', 'architect': 'אדריכל',
    'developer': 'מפתח', 'manager': 'מנהל', 'researcher': 'חוקר', 'artist': 'אמן',
    'author': 'סופר',
    // טכנולוגיה
    'computer': 'מחשב', 'router': 'נתב', 'hard drive': 'כונן קשיח', 'monitor': 'מסך',
    'keyboard': 'מקלדת', 'processor': 'מעבד', 'cable': 'כבל', 'wifi': 'WiFi',
    'scanner': 'סורק', 'printer': 'מדפסת',
    // מדע
    'astronomer': 'אסטרונום', 'microscope': 'מיקרוסקופ', 'thermometer': 'מדחום',
    'meteorologist': 'מטאורולוג', 'oceanographer': 'אוקיינוגרף', 'geologist': 'גיאולוג',
    // עסקים
    'executive': 'מנהל', 'analyst': 'אנליסט', 'accountant': 'רואה חשבון',
    'salesperson': 'איש מכירות', 'advertiser': 'מפרסם', 'warehouse': 'מחסן',
    'fulfillment': 'מילוי', 'representative': 'נציג', 'strategist': 'אסטרטג',
    'supervisor': 'מפקח',
    // רפואה
    'cardiologist': 'קרדיולוג', 'neurologist': 'נוירולוג', 'dermatologist': 'דרמטולוג',
    'pediatrician': 'רופא ילדים', 'ophthalmologist': 'אופטלמולוג', 'dentist': 'רופא שיניים',
    'orthopedist': 'אורתופד', 'psychiatrist': 'פסיכיאטר', 'oncologist': 'אונקולוג',
    'geriatrician': 'גריאטר',
    // אמנות
    'conductor': 'מנצח', 'violinist': 'כנר', 'soprano': 'סופרן', 'portraitist': 'צייר דיוקנאות',
    'sculptor': 'פסל', 'director': 'במאי', 'actor': 'שחקן', 'choreographer': 'כוריאוגרף',
    'screenwriter': 'תסריטאי', 'set designer': 'מעצב תפאורה',
    // ספורט
    'coach': 'מאמן', 'referee': 'שופט', 'tennis player': 'שחקן טניס', 'swimmer': 'שחיין',
    'marathon runner': 'רץ מרתון', 'basketball player': 'שחקן כדורסל',
    'soccer player': 'שחקן כדורגל', 'baseball player': 'שחקן בייסבול',
    'golfer': 'גולף', 'hockey player': 'שחקן הוקי',
    // סביבה
    'climatologist': 'קלימטולוג', 'conservationist': 'שימורן', 'ecologist': 'אקולוג',
    'environmental scientist': 'מדען סביבה', 'marine biologist': 'ביולוג ימי',
    'hydrologist': 'הידרולוג', 'soil scientist': 'מדען קרקע',
    'energy researcher': 'חוקר אנרגיה', 'atmospheric scientist': 'מדען אטמוספרה',
    'wildlife biologist': 'ביולוג חיות בר',
    // ספרות
    'poet': 'משורר', 'novelist': 'סופר', 'playwright': 'מחזאי', 'essayist': 'כותב מסות',
    'biographer': 'כותב ביוגרפיה', 'memoirist': 'כותב זיכרונות', 'critic': 'מבקר',
    'columnist': 'כותב טור', 'reporter': 'תב', 'reviewer': 'מבקר',
    // היסטוריה
    'archaeologist': 'ארכיאולוג', 'historian': 'היסטוריון', 'anthropologist': 'אנתרופולוג',
    'paleontologist': 'פליאונטולוג', 'philologist': 'פילולוג', 'linguist': 'בלשן',
    'art historian': 'היסטוריון אמנות', 'musicologist': 'מוזיקולוג', 'philosopher': 'פילוסוף',
    // אקסטרים
    'spectrometer': 'ספקטרומטר', 'radiometer': 'רדיומטר', 'physicist': 'פיזיקאי',
    'cytologist': 'ציטולוג', 'geneticist': 'גנטיקאי', 'barometer': 'ברומטר',
    'volcanologist': 'וולקנולוג', 'microbiologist': 'מיקרוביולוג',
    'astrophysicist': 'אסטרופיזיקאי', 'ohmmeter': 'אוהממטר', 'biochemist': 'ביוכימאי',
    'geomorphologist': 'גיאומורפולוג', 'crystallographer': 'קריסטלוגרף',
    'scintillation counter': 'ונה נצנוץ', 'seismologist': 'סיסמולוג',
    'spectrophotometer': 'ספקטרופוטומטר',
    // מילים בסיסיות נוספות
    'baby': 'תינוק', 'child': 'ילד',
    // פעולות
    'buy': 'קונה', 'buys': 'קונה', 'need': 'צריך', 'needs': 'צריך',
    'want': 'רוצה', 'wants': 'רוצה',
    'will': 'יהיה/תהיה', 'should': 'צריך/צריכה',
    // מילות קישור ומילות שאלה
    'you': 'אתה/את/אתם/אתן', 'your': 'שלך/שלכם/שלכן', 'what': 'מה',
    'which': 'איזה/איזו', 'who': 'מי', 'where': 'איפה', 'when': 'מתי',
    'why': 'למה', 'how': 'איך',
    // חלקי גוף נוספים
    'head': 'ראש'
  };
  
  // הוסף את התרגומים הבסיסיים
  Object.entries(basicTranslations).forEach(([word, translation]) => {
    dict.set(word.toLowerCase(), translation);
  });
  
  // פונקציה לחילוץ המילה הראשונה מתרגום (אם זה משפט)
  const extractFirstWordFromTranslation = (text: string): string => {
    if (!text) return text;
    // הסר סימני פיסוק וקח רק את המילה הראשונה
    const firstWord = text.trim().split(/\s+/)[0];
    // הסר סימני פיסוק מהסוף
    return firstWord.replace(/[.,!?;:]+$/, '');
  };

  // פונקציה לחילוץ המילה הנכונה מתרגום
  // מחפשת את המילה האנגלית בתרגום העברי או לוקחת את המילה האחרונה (שבדרך כלל היא המילה המתורגמת)
  const extractCorrectWord = (englishWord: string, hebrewText: string): string => {
    if (!hebrewText) return hebrewText;
    
    // רשימת מילות קישור בעברית שלא רוצים לקחת
    const stopWords = ['יש', 'לי', 'אני', 'את', 'אתה', 'הוא', 'היא', 'אנחנו', 'אתם', 'הם', 'שלי', 'שלו', 'שלה', 'שלנו', 'שלכם', 'שלהם', 'שלהן', 'ה', 'ב', 'ל', 'מ', 'כ', 'ש'];
    
    // נסה למצוא את המילה הנכונה - בדרך כלל המילה האחרונה או המילה שלא במילות העצירה
    const words = hebrewText.trim().split(/\s+/);
    
    // קח את המילה האחרונה (שבדרך כלל היא המילה המתורגמת)
    let lastWord = words[words.length - 1];
    lastWord = lastWord.replace(/[.,!?;:]+$/, '');
    
    // אם המילה האחרונה לא במילות העצירה, קח אותה
    if (!stopWords.includes(lastWord)) {
      return lastWord;
    }
    
    // אחרת, חפש את המילה הראשונה שלא במילות העצירה
    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:]+$/, '');
      if (!stopWords.includes(cleanWord)) {
        return cleanWord;
      }
    }
    
    // אם לא מצאנו, קח את המילה האחרונה בכל מקרה
    return lastWord;
  };

  // הוסף תרגומים מהשאלות - רק אם המילה לא קיימת במילון הבסיסי
  Object.values(QUESTION_BANK).flat().forEach(question => {
    // הוסף את התשובה למילון - רק אם לא קיימת
    if (question.answer && question.explanation && !dict.has(question.answer.toLowerCase())) {
      const parts = question.explanation.split('-');
      if (parts.length > 0) {
        const fullTranslation = parts[0].trim();
        // קח את המילה הנכונה מהתרגום
        const translation = extractCorrectWord(question.answer, fullTranslation);
        dict.set(question.answer.toLowerCase(), translation);
      }
    }
    
    // הוסף את כל האופציות למילון - רק אם לא קיימות
    question.options.forEach(option => {
      if (!dict.has(option.toLowerCase())) {
        // נסה למצוא תרגום מהשאלות האחרות
        const matchingQuestion = Object.values(QUESTION_BANK).flat().find(q => 
          q.answer.toLowerCase() === option.toLowerCase()
        );
        if (matchingQuestion?.explanation) {
          const parts = matchingQuestion.explanation.split('-');
          if (parts.length > 0) {
            const fullTranslation = parts[0].trim();
            // קח את המילה הנכונה מהתרגום
            const translation = extractCorrectWord(option, fullTranslation);
            dict.set(option.toLowerCase(), translation);
          }
        }
      }
    });
  });
  
  return dict;
}

const TRANSLATION_DICT = buildTranslationDictionary();

function ensureEnoughOptions(questions: Question[], allWords: string[]): Question[] {
    return questions.map(q => {
      // יוצר אפשרויות חדשות בכל פעם
      const newOptions = [q.answer];
      
      // מוסיף 3 אפשרויות שגויות אקראיות
      const shuffledWords = shuffleArray([...allWords]);
      for (const word of shuffledWords) {
        if (word !== q.answer && !newOptions.includes(word) && newOptions.length < 4) {
          newOptions.push(word);
        }
      }
      
      // אם עדיין אין 4 אפשרויות, מוסיף מילים מהאפשרויות המקוריות
      if (newOptions.length < 4) {
        for (const option of q.options) {
          if (option !== q.answer && !newOptions.includes(option) && newOptions.length < 4) {
            newOptions.push(option);
          }
        }
      }
      
      return { ...q, options: shuffleArray(newOptions) };
    });
}

function getMistakeStats(): { [key: number]: number } {
  try {
      const stats = localStorage.getItem('fb-mistakes');
      return stats ? JSON.parse(stats) : {};
  } catch {
    return {};
  }
}

function addMistake(id: number): void {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('fb-mistakes', JSON.stringify(stats));
}

function pickQuestions(all: QuestionBank, difficulty: string, count: number): Question[] {
    const pool = all[difficulty] || [];
    const stats = getMistakeStats();
    
    // מערבב את כל השאלות כדי לקבל שאלות שונות בכל פעם
    const shuffledPool = shuffleArray([...pool]);
    
    // לוקח רק כמה שאלות עם שגיאות (אם יש)
    const mistakeQuestions = shuffledPool.filter(q => stats[q.id] > 0);
    const boostedCount = Math.min(3, mistakeQuestions.length); // רק 3 שאלות עם שגיאות
    const boosted = shuffleArray(mistakeQuestions).slice(0, boostedCount);

    // לוקח שאלות אקראיות מהשאר
    const remainingQuestions = shuffledPool.filter(q => !boosted.includes(q));
    const randomRest = shuffleArray(remainingQuestions).slice(0, count - boosted.length);
    
    // מערבב הכל יחד
    const finalQuestions = shuffleArray([...boosted, ...randomRest]);
    return ensureEnoughOptions(finalQuestions, allWords);
}

export default function FillBlanksWrapper() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">טוען...</div>}>
      <FillBlanks />
    </Suspense>
  );
}

function FillBlanks() {
  const searchParams = useSearchParams();
  const { user } = useAuthUser();

  const [difficulty, setDifficulty] = useState('easy');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [time, setTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean, answer: string } | null>(null);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState(false);
  const [learnedWordsList, setLearnedWordsList] = useState<Array<{word: string, translation: string}>>([]);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [useLearnedWords, setUseLearnedWords] = useState(false);
  const [learnedWordsData, setLearnedWordsData] = useState<Array<{word: string, translation: string}>>([]);
  const [loadingLearnedWords, setLoadingLearnedWords] = useState(false);
  const [selectedWordsCount, setSelectedWordsCount] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<Array<{word: string, translation: string}>>([]);
  const [showWordSelector, setShowWordSelector] = useState(false);
  const [newlyCompletedAchievements, setNewlyCompletedAchievements] = useState<Array<{id: string, name: string, icon: string, reward: number, xpReward: number}>>([]);
  const [showAchievementModal, setShowAchievementModal] = useState(false);
  
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);
  
  // פונקציה לחילוץ המילה הנכונה מתרגום (שימוש חוזר)
  const extractCorrectWordFromText = (englishWord: string, hebrewText: string): string => {
    if (!hebrewText) return hebrewText;
    
    // אם התרגום הוא מילה אחת בלבד, החזר אותו
    const trimmed = hebrewText.trim();
    const singleWord = trimmed.replace(/[.,!?;:]+$/, '');
    if (trimmed.split(/\s+/).length === 1) {
      return singleWord;
    }
    
    // רשימת מילות קישור בעברית שלא רוצים לקחת
    const stopWords = ['יש', 'לי', 'אני', 'את', 'אתה', 'הוא', 'היא', 'אנחנו', 'אתם', 'הם', 'שלי', 'שלו', 'שלה', 'שלנו', 'שלכם', 'שלהם', 'שלהן', 'ה', 'ב', 'ל', 'מ', 'כ', 'ש', 'פירושה', 'היא', 'הוא', 'המילה', 'באנגלית', 'פירוש', 'משמעות', 'תרגום', 'זה', 'זו', 'אלה', 'אלו', 'אותה', 'אותו'];
    
    // נסה למצוא את המילה הנכונה - בדרך כלל המילה האחרונה או המילה שלא במילות העצירה
    const words = trimmed.split(/\s+/);
    
    // קח את המילה האחרונה (שבדרך כלל היא המילה המתורגמת)
    let lastWord = words[words.length - 1];
    lastWord = lastWord.replace(/[.,!?;:]+$/, '');
    
    // אם המילה האחרונה לא במילות העצירה, קח אותה
    if (!stopWords.includes(lastWord) && lastWord.length > 1) {
      return lastWord;
    }
    
    // אחרת, חפש את המילה הראשונה שלא במילות העצירה
    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:]+$/, '');
      if (!stopWords.includes(cleanWord) && cleanWord.length > 1) {
        return cleanWord;
      }
    }
    
    // אם לא מצאנו, קח את המילה האחרונה בכל מקרה (אם היא לא במילות העצירה)
    if (lastWord && lastWord.length > 1) {
      return lastWord;
    }
    
    // אם כל המילים הן מילות עצירה, נסה למצוא את המילה הארוכה ביותר
    let longestWord = '';
    for (const word of words) {
      const cleanWord = word.replace(/[.,!?;:]+$/, '');
      if (cleanWord.length > longestWord.length && cleanWord.length > 1) {
        longestWord = cleanWord;
      }
    }
    
    return longestWord || trimmed;
  };

  // פונקציה לקבלת תרגום של מילה
  const getTranslation = (word: string): string => {
    const wordLower = word.toLowerCase();
    let translation = TRANSLATION_DICT.get(wordLower);
    
    // אם התרגום הוא משפט (יותר ממילה אחת), קח את המילה הנכונה
    if (translation && translation.split(/\s+/).length > 1) {
      translation = extractCorrectWordFromText(word, translation);
    }
    
    // אם אין תרגום או התרגום זהה למילה, נסה במילון המרכזי
    if (!translation || translation === word) {
      // המר את TRANSLATION_DICT ל-Record כדי להשתמש ב-getTranslationWithFallback
      const localDict: Record<string, string> = {};
      TRANSLATION_DICT.forEach((value, key) => {
        localDict[key] = value;
      });
      
      const centralTranslation = getTranslationWithFallback(wordLower, localDict, '');
      if (centralTranslation && centralTranslation !== wordLower) {
        translation = centralTranslation;
      }
    }
    
    // אם עדיין אין תרגום, נסה למצוא מהשאלות הנוכחיות
    if (!translation || translation === word) {
      // קודם כל, נסה למצוא מהשאלות הנוכחיות במשחק (כולל שאלות שנוצרו מהמילים שנלמדו)
      const currentQuestion = questions.find(q => 
        q.answer.toLowerCase() === wordLower || q.options.some(opt => opt.toLowerCase() === wordLower)
      );
      
      if (currentQuestion?.explanation) {
        // נסה לחלץ תרגום מההסבר
        // אם ההסבר מכיל "פירושה", קח את המילה שאחרי
        if (currentQuestion.explanation.includes('פירושה')) {
          const match = currentQuestion.explanation.match(/פירושה\s+"([^"]+)"/);
          if (match && match[1]) {
            translation = match[1];
          } else {
            // נסה לחלץ מהחלק הראשון של ההסבר
            const parts = currentQuestion.explanation.split('-');
            if (parts.length > 0) {
              const fullTranslation = parts[0].trim();
              const extracted = extractCorrectWordFromText(word, fullTranslation);
              if (extracted && extracted !== word && extracted.length > 1) {
                translation = extracted;
              }
            }
          }
        } else {
          // נסה לחלץ מהחלק הראשון של ההסבר
          const parts = currentQuestion.explanation.split('-');
          if (parts.length > 0) {
            const fullTranslation = parts[0].trim();
            const extracted = extractCorrectWordFromText(word, fullTranslation);
            if (extracted && extracted !== word && extracted.length > 1) {
              translation = extracted;
            }
          }
        }
      }
      
      // אם עדיין אין תרגום, נסה למצוא מהשאלות הקיימות
      if (!translation || translation === word) {
        const matchingQuestion = Object.values(QUESTION_BANK).flat().find(q => 
          q.answer.toLowerCase() === wordLower || q.options.some(opt => opt.toLowerCase() === wordLower)
        );
        if (matchingQuestion?.explanation) {
          const parts = matchingQuestion.explanation.split('-');
          if (parts.length > 0) {
            const fullTranslation = parts[0].trim();
            const extracted = extractCorrectWordFromText(word, fullTranslation);
            if (extracted && extracted !== word && extracted.length > 1) {
              translation = extracted;
            }
          }
        }
      }
      
      // אם עדיין אין תרגום והמשחק משתמש במילים שנלמדו, נסה למצוא מהמילים שנלמדו
      if ((!translation || translation === word) && useLearnedWords && learnedWordsData.length > 0) {
        const learnedWord = learnedWordsData.find(w => 
          w.word.toLowerCase() === wordLower
        );
        if (learnedWord && learnedWord.translation && learnedWord.translation !== word) {
          // נסה לחלץ את המילה הנכונה מהתרגום
          if (learnedWord.translation.split(/\s+/).length === 1) {
            // אם התרגום הוא מילה אחת, השתמש בו
            translation = learnedWord.translation;
          } else {
            const extracted = extractCorrectWordFromText(word, learnedWord.translation);
            if (extracted && extracted !== word && extracted.length > 1) {
              translation = extracted;
            }
          }
        }
      }
    }
    
    // אם עדיין אין תרגום טוב, החזר את המילה עצמה
    return (translation && translation !== word && translation.length > 1) ? translation : word;
  };

  useEffect(() => {
    const levelFromParams = searchParams?.get('level') || 'easy';
    // Map level names to difficulty keys
    const levelMap: Record<string, string> = {
      beginner: 'easy',
      intermediate: 'medium', 
      advanced: 'hard',
      extreme: 'extreme'
    };
    const mappedLevel = levelMap[levelFromParams] || 'easy';
    const validDifficulty = DIFFICULTIES.find(d => d.key === mappedLevel) ? mappedLevel : 'easy';
    setDifficulty(validDifficulty);
  }, [searchParams]);

  // טען מילים שנלמדו מה-API
  const loadLearnedWords = async () => {
    if (!user) {
      console.log('Cannot load learned words - no user logged in');
      return;
    }
    
    try {
      setLoadingLearnedWords(true);
      const response = await fetch(`/api/learned-words?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to load learned words');
      }
      
      const data = await response.json();
      const words = data.learnedWords || [];
      
      setLearnedWordsData(words);
      console.log('Loaded learned words:', words.length);
    } catch (error) {
      console.error('Error loading learned words:', error);
      setLearnedWordsData([]);
    } finally {
      setLoadingLearnedWords(false);
    }
  };

  // פונקציה לבדיקה אם מילה מתאימה למשחק (מילה בודדת, לא משפט)
  const isValidWord = (word: string): boolean => {
    if (!word || word.trim() === '') return false;
    
    // בדוק אם זה משפט (מכיל רווחים)
    if (word.trim().split(/\s+/).length > 1) return false;
    
    // בדוק אורך - מילה צריכה להיות בין 2 ל-20 אותיות
    const cleanWord = word.trim().replace(/[^a-zA-Z]/g, '');
    if (cleanWord.length < 2 || cleanWord.length > 20) return false;
    
    // בדוק אם המילה מכילה רק אותיות (או מספרים בסוף כמו "2" או "3D")
    const wordPattern = /^[a-zA-Z]+([0-9]|[a-zA-Z])*$/;
    if (!wordPattern.test(cleanWord)) return false;
    
    return true;
  };

  // פונקציה לקביעת סוג המילה (שם עצם, פועל, וכו')
  // משתמשת במילון המרכזי כדי לזהות את הקטגוריה לפי התרגום
  const getWordCategory = (word: string): string => {
    const wordLower = word.toLowerCase();
    
    // נסה לקבל תרגום מהמילון המרכזי
    const translation = getTranslationWithFallback(wordLower, undefined, '');
    
    // בעלי חיים - בדוק לפי תרגום או שם
    const animalTranslations = ['כלב', 'חתול', 'ציפור', 'דג', 'דוב', 'אריה', 'לווייתן', 'קוף', 'צבי', 'ינשוף', 'ארנב', 'ברווז', 'נשר', 'נחש', 'צפרדע', 'פיל', 'נמר', 'זברה', 'ג׳ירפה', 'פנדה', 'קואלה', 'פינגווין', 'דולפין', 'צב', 'שועל', 'זאב', 'גמל', 'קנגרו', 'תנין'];
    if (animalTranslations.some(t => translation.includes(t))) return 'animal';
    const animals = ['dog', 'cat', 'bird', 'fish', 'bear', 'lion', 'whale', 'monkey', 'deer', 'owl', 'rabbit', 'duck', 'eagle', 'snake', 'frog', 'elephant', 'tiger', 'zebra', 'giraffe', 'panda', 'koala', 'penguin', 'dolphin', 'turtle', 'fox', 'wolf', 'camel', 'kangaroo', 'crocodile'];
    if (animals.includes(wordLower)) return 'animal';
    
    // אוכל - בדוק לפי תרגום או שם
    const foodTranslations = ['תפוח', 'בננה', 'מים', 'חלב', 'תה', 'לחם', 'אורז', 'עוגה', 'מרק', 'ביצה', 'פסטה', 'פיצה', 'צ׳יפס', 'גלידה', 'שוקולד', 'עוגייה', 'ממתק', 'בננה', 'תות', 'ענבים'];
    if (foodTranslations.some(t => translation.includes(t))) return 'food';
    const food = ['apple', 'banana', 'water', 'milk', 'tea', 'bread', 'rice', 'cake', 'soup', 'egg', 'pasta', 'curry', 'lemonade', 'honey', 'toast', 'ice cream', 'sushi', 'pizza', 'orange juice', 'chips', 'chocolate', 'cookie', 'candy', 'strawberry', 'grapes'];
    if (food.includes(wordLower)) return 'food';
    
    // חפצים - בדוק לפי תרגום או שם
    const objectTranslations = ['ספר', 'עט', 'כוס', 'כדור', 'כובע', 'נעליים', 'כיסא', 'מיטה', 'אופניים', 'מצלמה', 'טלוויזיה', 'אוזניות', 'שעון', 'מפתח', 'טלסקופ', 'שמיכה', 'מברשת שיניים', 'מייבש שיער', 'מנעול', 'פחית', 'בקבוק', 'קופסה', 'תיק'];
    if (objectTranslations.some(t => translation.includes(t))) return 'object';
    const objects = ['book', 'pen', 'cup', 'ball', 'hat', 'shoes', 'chair', 'bed', 'bike', 'camera', 'television', 'headphones', 'clock', 'key', 'telescope', 'blanket', 'toothbrush', 'hair dryer', 'lock', 'can', 'bottle', 'box', 'bag', 'phone', 'computer', 'table', 'desk', 'lamp', 'window', 'door'];
    if (objects.includes(wordLower)) return 'object';
    
    // טבע - בדוק לפי תרגום או שם
    const natureTranslations = ['שמש', 'ירח', 'שמיים', 'עץ', 'פרח', 'דשא', 'ענן', 'שלג', 'גשם', 'ים', 'גבעה', 'הר', 'אוקיינוס', 'יער', 'הר געש', 'נהר', 'קשת', 'מערה'];
    if (natureTranslations.some(t => translation.includes(t))) return 'nature';
    const nature = ['sun', 'moon', 'sky', 'tree', 'flower', 'grass', 'cloud', 'snow', 'rain', 'sea', 'hill', 'mountain', 'ocean', 'forest', 'volcano', 'river', 'bamboo', 'glacier', 'rainbow', 'cave', 'star', 'wind', 'storm'];
    if (nature.includes(wordLower)) return 'nature';
    
    // אנשים - בדוק לפי תרגום או שם
    const peopleTranslations = ['אמא', 'אבא', 'אחות', 'אח', 'משפחה', 'בת', 'בן', 'אב', 'אם', 'סבתא', 'נער', 'חבר', 'מורה', 'פרופסור', 'תינוק', 'ילד'];
    if (peopleTranslations.some(t => translation.includes(t))) return 'person';
    const people = ['mom', 'dad', 'sister', 'brother', 'family', 'daughter', 'son', 'father', 'mother', 'grandmother', 'teenager', 'friend', 'teacher', 'professor', 'baby', 'child', 'grandma', 'grandpa', 'parents'];
    if (people.includes(wordLower)) return 'person';
    
    // מקומות - בדוק לפי תרגום או שם
    const placeTranslations = ['בית', 'בית ספר', 'בית', 'חדר שינה', 'מטבח', 'סלון', 'שירותים', 'מוסך', 'גן', 'מרתף', 'מדרגות', 'דלת', 'עליית גג', 'ארון', 'פינת אוכל', 'משרד', 'ספרייה', 'קפיטריה', 'מגרש משחקים', 'מכון כושר', 'מעבדה'];
    if (placeTranslations.some(t => translation.includes(t))) return 'place';
    const places = ['home', 'school', 'house', 'bedroom', 'kitchen', 'living room', 'bathroom', 'garage', 'garden', 'basement', 'stairs', 'door', 'attic', 'closet', 'dining room', 'office', 'library', 'cafeteria', 'playground', 'gymnasium', 'laboratory', 'park', 'store', 'shop', 'restaurant'];
    if (places.includes(wordLower)) return 'place';
    
    // תחבורה - בדוק לפי תרגום או שם
    const transportTranslations = ['מכונית', 'אוטובוס', 'מטוס', 'רכבת', 'סירה', 'אופנוע', 'מונית', 'מדרכה', 'רחוב', 'אופניים', 'ספינה', 'רכבת תחתית', 'משאית', 'קורקינט'];
    if (transportTranslations.some(t => translation.includes(t))) return 'transport';
    const transport = ['car', 'bus', 'airplane', 'train', 'boat', 'motorcycle', 'taxi', 'sidewalk', 'street', 'bicycle', 'ship', 'subway', 'truck', 'scooter', 'ambulance', 'rocket', 'submarine', 'tractor'];
    if (transport.includes(wordLower)) return 'transport';
    
    // בגדים
    const clothesTranslations = ['חולצה', 'מכנסיים', 'שמלה', 'נעליים', 'כובע', 'גרביים', 'כפפות', 'מעיל', 'ז׳קט', 'ג׳ינס', 'פיג׳מה', 'סנדלים', 'מכנסיים קצרים', 'חצאית', 'סוודר', 'בגד ים', 'מעיל גשם', 'עניבה', 'מדים'];
    if (clothesTranslations.some(t => translation.includes(t))) return 'clothes';
    const clothes = ['shirt', 'pants', 'dress', 'shoes', 'hat', 'socks', 'gloves', 'coat', 'jacket', 'jeans', 'pajamas', 'sandals', 'shorts', 'skirt', 'sweater', 'swimsuit', 'raincoat', 'tie', 'uniform'];
    if (clothes.includes(wordLower)) return 'clothes';
    
    // כלי נגינה
    const instrumentTranslations = ['פסנתר', 'גיטרה', 'תופים', 'כינור', 'חליל', 'חצוצרה', 'אקורדיון', 'בנג׳ו', 'צ׳לו', 'קלרינט', 'מפוחית', 'נבל', 'אורגן', 'תוף מרים', 'טרומבון', 'קסילופון'];
    if (instrumentTranslations.some(t => translation.includes(t))) return 'instrument';
    const instruments = ['piano', 'guitar', 'drums', 'violin', 'flute', 'trumpet', 'accordion', 'banjo', 'cello', 'clarinet', 'harmonica', 'harp', 'organ', 'tambourine', 'trombone', 'xylophone'];
    if (instruments.includes(wordLower)) return 'instrument';
    
    // רגשות ותחושות
    const emotionTranslations = ['שמח', 'עצוב', 'כועס', 'מפוחד', 'מופתע', 'ביישן', 'עייף', 'רעב', 'צמא', 'מבולבל', 'גאה', 'משעמם', 'רגוע'];
    if (emotionTranslations.some(t => translation.includes(t))) return 'emotion';
    const emotions = ['happy', 'sad', 'angry', 'scared', 'surprised', 'shy', 'sleepy', 'hungry', 'thirsty', 'confused', 'proud', 'bored', 'calm'];
    if (emotions.includes(wordLower)) return 'emotion';
    
    // צבעים - בדוק לפי תרגום או שם
    const colorTranslations = ['צהוב', 'אדום', 'כחול', 'ירוק', 'שחור', 'לבן', 'ורוד', 'סגול', 'כתום', 'חום', 'אפור', 'כסף', 'זהב', 'תכלת', 'ורוד', 'בורדו', 'טורקיז', 'זית', 'לבנדר', 'אינדיגו', 'מגנטה', 'סלמון', 'קורל', 'קרם', 'בייג'];
    if (colorTranslations.some(t => translation.includes(t))) return 'color';
    const colors = ['yellow', 'red', 'blue', 'green', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey', 'silver', 'gold', 'turquoise', 'olive', 'lavender', 'indigo', 'magenta', 'salmon', 'coral', 'cream', 'beige', 'maroon', 'navy', 'cyan', 'lime', 'teal', 'violet', 'amber', 'ivory', 'khaki'];
    if (colors.includes(wordLower)) return 'color';
    
    // תארים (adjectives) - בדוק לפי תרגום
    const adjectiveTranslations = ['גבוה', 'נמוך', 'גדול', 'קטן', 'מהיר', 'איטי', 'חם', 'קר', 'חכם', 'טוב', 'רע', 'יפה', 'מכוער', 'חדש', 'ישן', 'צעיר', 'זקן', 'חזק', 'חלש', 'קשה', 'רך', 'קל', 'כבד', 'רחב', 'צר', 'ארוך', 'קצר', 'עבה', 'דק', 'מעניין', 'משעמם', 'קל', 'קשה', 'נחמד', 'ידידותי', 'עצוב', 'שמח'];
    if (adjectiveTranslations.some(t => translation.includes(t))) return 'adjective';
    const adjectives = ['tall', 'short', 'big', 'small', 'fast', 'slow', 'hot', 'cold', 'smart', 'good', 'bad', 'beautiful', 'ugly', 'new', 'old', 'young', 'strong', 'weak', 'hard', 'soft', 'easy', 'heavy', 'wide', 'narrow', 'long', 'thick', 'thin', 'interesting', 'nice', 'friendly', 'sad', 'happy', 'large', 'tiny', 'huge', 'little'];
    if (adjectives.includes(wordLower)) return 'adjective';
    
    // פעלים (verbs) - בדוק לפי תרגום
    const verbTranslations = ['קורא', 'כותב', 'רואה', 'שומע', 'הולך', 'רץ', 'קופץ', 'שוחה', 'עף', 'אוכל', 'שותה', 'ישן', 'ער', 'לומד', 'מלמד', 'עוזר', 'עובד', 'משחק', 'שרה', 'רוקד', 'בונה', 'שובר', 'פותח', 'סוגר', 'קונה', 'מוכר', 'מכין', 'מבשל', 'רוחץ', 'מנקה', 'מתקשר', 'מדבר', 'מקשיב', 'מבין', 'יודע', 'רוצה', 'אוהב', 'שונא', 'מפחד', 'מתגעגע', 'מחכה', 'מחפש', 'מוצא', 'לוקח', 'נותן', 'מביא', 'הולך', 'בא', 'יוצא', 'נכנס', 'עולה', 'יורד', 'עומד', 'יושב', 'שוכב', 'קם', 'פותח', 'סוגר', 'מתחיל', 'מסיים', 'ממשיך', 'עוצר', 'מתחיל', 'מסיים'];
    if (verbTranslations.some(t => translation.includes(t))) return 'verb';
    const verbs = ['read', 'reads', 'write', 'writes', 'see', 'sees', 'hear', 'hears', 'go', 'goes', 'run', 'runs', 'jump', 'jumps', 'swim', 'swims', 'fly', 'flies', 'eat', 'eats', 'drink', 'drinks', 'sleep', 'sleeps', 'wake', 'wakes', 'learn', 'learns', 'teach', 'teaches', 'help', 'helps', 'work', 'works', 'play', 'plays', 'sing', 'sings', 'dance', 'dances', 'build', 'builds', 'break', 'breaks', 'open', 'opens', 'close', 'closes', 'buy', 'buys', 'sell', 'sells', 'make', 'makes', 'cook', 'cooks', 'wash', 'washes', 'clean', 'cleans', 'call', 'calls', 'speak', 'speaks', 'listen', 'listens', 'understand', 'understands', 'know', 'knows', 'want', 'wants', 'like', 'likes', 'love', 'loves', 'hate', 'hates', 'fear', 'fears', 'miss', 'misses', 'wait', 'waits', 'search', 'searches', 'find', 'finds', 'take', 'takes', 'give', 'gives', 'bring', 'brings', 'come', 'comes', 'leave', 'leaves', 'enter', 'enters', 'exit', 'exits', 'rise', 'rises', 'fall', 'falls', 'stand', 'stands', 'sit', 'sits', 'lie', 'lies', 'get', 'gets', 'start', 'starts', 'finish', 'finishes', 'continue', 'continues', 'stop', 'stops'];
    if (verbs.includes(wordLower)) return 'verb';
    
    // מילות כמות (quantifiers/determiners) - בדוק לפי תרגום
    const quantifierTranslations = ['כל', 'כל', 'חלק', 'רבים', 'מעטים', 'כל אחד', 'שניהם', 'כמה', 'מעט', 'הרבה', 'מעט מאוד', 'הרבה מאוד'];
    if (quantifierTranslations.some(t => translation.includes(t))) return 'quantifier';
    const quantifiers = ['every', 'all', 'some', 'many', 'few', 'each', 'both', 'several', 'most', 'any', 'much', 'little', 'more', 'less', 'enough', 'plenty', 'none', 'either', 'neither'];
    if (quantifiers.includes(wordLower)) return 'quantifier';
    
    return 'general';
  };

  // טמפלטים מותאמים לסוג המילה - משפטים מורכבים ואמיתיים יותר
  const getTemplatesForCategory = (category: string): Array<(w: string) => string> => {
    switch (category) {
      case 'animal':
        return [
          (w: string) => `Yesterday, I saw a beautiful ___ at the zoo that was sleeping.`,
          (w: string) => `The ___ is a wild animal that lives in the forest and eats leaves.`,
          (w: string) => `My friend has a pet ___ at home that loves to play with toys.`,
          (w: string) => `The ___ is known for its ability to run very fast when it needs to escape from danger.`,
          (w: string) => `I learned that the ___ is an endangered species that needs protection.`,
          (w: string) => `The ___ is a nocturnal animal that sleeps during the day and hunts at night.`,
          (w: string) => `Children love to watch the ___ at the zoo because it's very friendly.`,
          (w: string) => `The ___ is known for its beautiful colors and unique patterns on its body.`,
        ];
      case 'food':
        return [
          (w: string) => `I always eat ___ for breakfast because it's healthy.`,
          (w: string) => `When I'm thirsty, I drink a glass of cold ___.`,
          (w: string) => `The ___ that my mother cooked tastes amazing.`,
          (w: string) => `I like to eat fresh ___ in the morning.`,
          (w: string) => `The ___ is my favorite food because it's sweet.`,
          (w: string) => `I bought some fresh ___ from the market today.`,
          (w: string) => `The ___ is a healthy choice for lunch.`,
          (w: string) => `I prepare ___ every day for my family.`,
        ];
      case 'object':
        return [
          (w: string) => `I use my ___ every day to help me with my work.`,
          (w: string) => `There is a beautiful ___ on my desk at home.`,
          (w: string) => `The ___ that I bought yesterday is very useful.`,
          (w: string) => `I need to buy a new ___ because my old one broke.`,
          (w: string) => `The ___ helps me complete my tasks more efficiently.`,
          (w: string) => `I always carry my ___ in my backpack when I go to school.`,
          (w: string) => `The ___ is an important tool that everyone should have.`,
          (w: string) => `My teacher showed me how to use the ___ properly.`,
          (w: string) => `I opened a ___ of soda and drank it.`,
          (w: string) => `The ___ contains food that I can eat.`,
          (w: string) => `I recycle the empty ___ after I finish using it.`,
        ];
      case 'nature':
        return [
          (w: string) => `The ___ that I saw yesterday was very beautiful.`,
          (w: string) => `I can see the bright ___ in the clear blue sky.`,
          (w: string) => `The tall ___ in the park is over 100 years old.`,
          (w: string) => `I love to watch the ___ during sunset.`,
          (w: string) => `The ___ shines brightly in the morning sky.`,
          (w: string) => `The ___ grows beautifully in spring when the weather is warm.`,
          (w: string) => `The ___ flows peacefully from the mountain to the sea.`,
          (w: string) => `The ___ is covered with white snow in winter.`,
        ];
      case 'person':
        return [
          (w: string) => `My ___ is very kind and always helps me.`,
          (w: string) => `I see my ___ every day at school.`,
          (w: string) => `I love my ___ because they are always there for me.`,
          (w: string) => `The ___ is always happy and makes everyone smile.`,
          (w: string) => `The ___ helps me learn new things every day.`,
          (w: string) => `The ___ teaches English at my school.`,
          (w: string) => `The ___ plays with me in the playground after school.`,
        ];
      case 'place':
        return [
          (w: string) => `I go to the ___ every day to learn new things.`,
          (w: string) => `The ___ that I visited last week is very big.`,
          (w: string) => `I like to visit the ___ with my family on weekends.`,
          (w: string) => `The ___ is located near my house, so I can walk there.`,
          (w: string) => `I study at the ___ because it's quiet and peaceful.`,
          (w: string) => `The ___ has many interesting books that I love to read.`,
          (w: string) => `I play with my friends in the ___ after school.`,
        ];
      case 'transport':
        return [
          (w: string) => `I take the ___ every morning to go to school.`,
          (w: string) => `The ___ moves very fast on the highway.`,
          (w: string) => `I see a red ___ on the street every day.`,
          (w: string) => `The ___ can carry many passengers at the same time.`,
          (w: string) => `I use a ___ to travel to different cities.`,
          (w: string) => `The ___ is a modern vehicle that helps people move around.`,
          (w: string) => `The ___ helps me get to places quickly and safely.`,
        ];
      case 'clothes':
        return [
          (w: string) => `I wear a warm ___ in winter to stay comfortable.`,
          (w: string) => `The ___ that I bought is very warm and cozy.`,
          (w: string) => `I put on my favorite ___ every morning before school.`,
          (w: string) => `The ___ fits me perfectly and looks great.`,
          (w: string) => `I bought a new ___ at the store yesterday.`,
          (w: string) => `The ___ is made of soft cotton and feels comfortable.`,
        ];
      case 'instrument':
        return [
          (w: string) => `I play the ___ in a band with my friends.`,
          (w: string) => `The ___ sounds beautiful when played correctly.`,
          (w: string) => `I learn to play the ___ at music school.`,
          (w: string) => `The ___ has many strings that create beautiful music.`,
          (w: string) => `I practice the ___ every day to improve my skills.`,
        ];
      case 'emotion':
        return [
          (w: string) => `I feel very ___ today because the weather is nice.`,
          (w: string) => `The child looks ___ after playing in the park.`,
          (w: string) => `I am ___ after eating my favorite meal.`,
          (w: string) => `The student is ___ about the test because they studied hard.`,
          (w: string) => `I become ___ when I see my best friend at school.`,
        ];
      case 'color':
        return [
          (w: string) => `The car that I saw yesterday is ___.`,
          (w: string) => `I like the ___ color because it's bright and cheerful.`,
          (w: string) => `The beautiful flower in my garden is ___.`,
          (w: string) => `My favorite color is ___ because it reminds me of the sky.`,
          (w: string) => `The sky is ___ today, which means good weather.`,
          (w: string) => `I paint the wall ___ to make my room more colorful.`,
          (w: string) => `The dress that she wore is ___.`,
          (w: string) => `I wear a ___ shirt to school every Monday.`,
        ];
      case 'adjective':
        return [
          (w: string) => `The tree in my garden is very ___.`,
          (w: string) => `The car that my father drives is ___.`,
          (w: string) => `I am ___ today because I got good grades.`,
          (w: string) => `The book that I'm reading is very ___.`,
          (w: string) => `The house where I live is ___.`,
          (w: string) => `The dog that I saw at the park is ___.`,
          (w: string) => `The weather today is ___ and perfect for a walk.`,
          (w: string) => `The food that my mother cooked is ___.`,
        ];
      case 'verb':
        return [
          (w: string) => `I ___ a book every day before bed.`,
          (w: string) => `My teacher ___ English at school.`,
          (w: string) => `I ___ to music when I study.`,
          (w: string) => `The student ___ the question carefully.`,
          (w: string) => `I ___ my homework after school.`,
          (w: string) => `My friend ___ me with my studies.`,
          (w: string) => `I ___ a letter to my grandmother.`,
          (w: string) => `The child ___ a story before sleeping.`,
          (w: string) => `I ___ the newspaper every morning.`,
          (w: string) => `The teacher ___ the lesson to the class.`,
        ];
      case 'quantifier':
        return [
          (w: string) => `I go to school ___ day.`,
          (w: string) => `I see my friend ___ morning.`,
          (w: string) => `I eat breakfast ___ day.`,
          (w: string) => `I visit my grandmother ___ week.`,
          (w: string) => `I study English ___ evening.`,
          (w: string) => `I play soccer ___ weekend.`,
          (w: string) => `I read a book ___ night.`,
          (w: string) => `I drink water ___ hour.`,
          (w: string) => `I brush my teeth ___ morning.`,
          (w: string) => `I do my homework ___ afternoon.`,
        ];
      default:
        return [
          (w: string) => `I have a useful ___ at home that I use every day.`,
          (w: string) => `I like the ___ because it's interesting.`,
          (w: string) => `The ___ is important for my daily activities.`,
          (w: string) => `I use the ___ often because it helps me a lot.`,
          (w: string) => `There is a ___ on my desk.`,
        ];
    }
  };

  // פונקציה לבדיקה אם מילה הגיונית במשפט
  const isWordLogicalInSentence = (testWord: string, testSentence: string, originalWord: string): boolean => {
    // בדוק אם המילה הגיונית במשפט על ידי בדיקת אם היא מאותו תחום
    // אבל גם בדוק אם המשפט הגיוני עם המילה
    const testCategory = getWordCategory(testWord);
    const originalCategory = getWordCategory(originalWord);
    
    // אם המילה היא המילה המקורית, היא תמיד הגיונית
    if (testWord.toLowerCase() === originalWord.toLowerCase()) {
      return true;
    }
    
    // אם הן מאותו תחום, זה יכול להיות הגיוני - אבל צריך לבדוק את ההקשר הספציפי
    if (testCategory === originalCategory) {
      // בדוק אם המשפט ספציפי מספיק - אם המשפט כללי מדי, גם מילים אחרות מאותו תחום יכולות להיות הגיוניות
      const sentenceLower = testSentence.toLowerCase();
      
      // משפטים כללים כמו "The ___ can run" יכולים להיות נכונים עם כל בעל חיים
      // אבל משפטים ספציפיים יותר כמו "The ___ barks at night" מתאימים רק לכלב
      const genericPatterns = [
        /the\s+\w+\s+can\s+(run|jump|fly|swim|walk)/i,
        /the\s+\w+\s+is\s+(big|small|tall|short|good|bad|beautiful|nice|interesting)/i,
        /i\s+(have|see|like|love)\s+(a|an|the)\s+\w+/i,
        /i\s+see\s+(a|an|the)\s+\w+\s+\w+\s+in\s+(the|a|an)\s+\w+/i, // "I see a beautiful ___ in the room"
        /i\s+have\s+(a|an|the)\s+\w+\s+\w+\s+at\s+(home|school|work)/i, // "I have a useful ___ at home"
        /i\s+like\s+(the|a|an)\s+\w+\s+because/i, // "I like the ___ because"
        /the\s+\w+\s+is\s+important/i, // "The ___ is important"
        /i\s+use\s+(the|a|an)\s+\w+\s+(often|every|always)/i, // "I use the ___ often"
        /there\s+is\s+(a|an|the)\s+\w+\s+on/i, // "There is a ___ on"
      ];
      
      // אם המשפט כללי מדי, גם מילים אחרות מאותו תחום יכולות להיות הגיוניות
      const isGeneric = genericPatterns.some(pattern => pattern.test(sentenceLower));
      if (isGeneric) {
        // במשפטים כלליים, רק המילה המקורית הגיונית
        return false;
      }
      
      // במשפטים ספציפיים יותר, מילים מאותו תחום יכולות להיות הגיוניות
      return true;
    }
    
    // אם לא מאותו תחום, בדוק אם המשפט הגיוני בכלל
    // למשל, "I have a stone" יכול להיות הגיוני, אבל "I eat a stone" לא
    const sentenceLower = testSentence.toLowerCase();
    
    // בדיקות ספציפיות למשפטים
    if (sentenceLower.includes('i eat') || sentenceLower.includes('i drink')) {
      // רק אוכל הגיוני
      return testCategory === 'food';
    }
    
    if (sentenceLower.includes('i wear')) {
      // רק בגדים הגיוניים (או צבעים אם זה "I wear a ___ shirt")
      if (sentenceLower.includes('shirt') || sentenceLower.includes('dress') || sentenceLower.includes('color')) {
        return testCategory === 'color' || testCategory === 'clothes';
      }
      // רק בגדים הגיוניים - לא כל חפץ
      // בדוק אם המילה היא בגד ספציפי
      const clothesWords = ['shirt', 'pants', 'dress', 'shoes', 'hat', 'socks', 'gloves', 'coat', 'jacket', 'jeans', 'pajamas', 'sandals', 'shorts', 'skirt', 'sweater', 'swimsuit', 'raincoat', 'tie', 'uniform', 'boots', 'sneakers', 'scarf'];
      if (clothesWords.includes(testWord.toLowerCase())) {
        return true;
      }
      // אם זה לא בגד, זה לא הגיוני
      return false;
    }
    
    // בדיקות לפעלים - משפטים עם פעלים
    if (sentenceLower.match(/\bi\s+(read|reads|write|writes|see|sees|hear|hears|go|goes|run|runs|jump|jumps|swim|swims|fly|flies|eat|eats|drink|drinks|sleep|sleeps|wake|wakes|learn|learns|teach|teaches|help|helps|work|works|play|plays|sing|sings|dance|dances|build|builds|break|breaks|open|opens|close|closes|buy|buys|sell|sells|make|makes|cook|cooks|wash|washes|clean|cleans|call|calls|speak|speaks|listen|listens|understand|understands|know|knows|want|wants|like|likes|love|loves|hate|hates|fear|fears|miss|misses|wait|waits|search|searches|find|finds|take|takes|give|gives|bring|brings|come|comes|leave|leaves|enter|enters|exit|exits|rise|rises|fall|falls|stand|stands|sit|sits|lie|lies|get|gets|start|starts|finish|finishes|continue|continues|stop|stops)\s+/i)) {
      // משפטים עם פעלים - רק פעלים הגיוניים
      return testCategory === 'verb';
    }
    
    if (sentenceLower.match(/\b(my|the|a|an)\s+\w+\s+(read|reads|write|writes|see|sees|hear|hears|go|goes|run|runs|jump|jumps|swim|swims|fly|flies|eat|eats|drink|drinks|sleep|sleeps|wake|wakes|learn|learns|teach|teaches|help|helps|work|works|play|plays|sing|sings|dance|dances|build|builds|break|breaks|open|opens|close|closes|buy|buys|sell|sells|make|makes|cook|cooks|wash|washes|clean|cleans|call|calls|speak|speaks|listen|listens|understand|understands|know|knows|want|wants|like|likes|love|loves|hate|hates|fear|fears|miss|misses|wait|waits|search|searches|find|finds|take|takes|give|gives|bring|brings|come|comes|leave|leaves|enter|enters|exit|exits|rise|rises|fall|falls|stand|stands|sit|sits|lie|lies|get|gets|start|starts|finish|finishes|continue|continues|stop|stops)\s+/i)) {
      // משפטים עם פעלים - רק פעלים הגיוניים
      return testCategory === 'verb';
    }
    
    if (sentenceLower.includes('i read') && testCategory !== 'verb') {
      // רק ספרים הגיוניים (לא פעלים)
      return testWord === 'book' || testWord === 'magazine' || testWord === 'newspaper';
    }
    
    if (sentenceLower.includes('i play with')) {
      // רק חפצים/בעלי חיים הגיוניים
      return testCategory === 'object' || testCategory === 'animal';
    }
    
    if (sentenceLower.includes('opened') || sentenceLower.includes('contains') || sentenceLower.includes('recycle')) {
      // משפטים על פחיות/בקבוקים - רק "can", "bottle", "box" וכו'
      const containerWords = ['can', 'bottle', 'box', 'jar', 'container'];
      return containerWords.includes(testWord.toLowerCase());
    }
    
    // בדיקות לצבעים
    if (sentenceLower.includes('color') || sentenceLower.includes('colour') || sentenceLower.includes('paint') ||
        (sentenceLower.includes('is') && (sentenceLower.includes('car') || sentenceLower.includes('flower') || 
         sentenceLower.includes('dress') || sentenceLower.includes('shirt') || sentenceLower.includes('sky')))) {
      // רק צבעים הגיוניים
      return testCategory === 'color';
    }
    
    // בדיקות לתארים
    if (sentenceLower.includes('is') && (sentenceLower.includes('big') || sentenceLower.includes('small') || 
        sentenceLower.includes('tall') || sentenceLower.includes('short') || sentenceLower.includes('good') || 
        sentenceLower.includes('bad') || sentenceLower.includes('hot') || sentenceLower.includes('cold'))) {
      // רק תארים הגיוניים (אבל לא צבעים)
      return testCategory === 'adjective';
    }
    
    // למשפטים כלליים כמו "I have a", "I see a", "I like the"
    // כל שם עצם יכול להיות הגיוני, אבל לא צבעים או תארים (אלא אם המשפט מתאים)
    if (testCategory === 'color' || testCategory === 'adjective') {
      // צבעים ותארים לא הגיוניים במשפטים כלליים כמו "I have a yellow"
      return false;
    }
    
    return true; // נאפשר, אבל נעדיף מאותו תחום
  };

  // המר מילים שנלמדו לשאלות
  const createQuestionsFromLearnedWords = (words: Array<{word: string, translation: string}>, count: number): Question[] => {
    const questions: Question[] = [];
    const usedWords = new Set<string>();
    
    // סנן רק מילים תקפות (מילים בודדות, לא משפטים)
    const validWords = words.filter(w => isValidWord(w.word));
    
    if (validWords.length === 0) {
      console.log('No valid words found in learned words');
      return [];
    }
    
    // הגבל את מספר המילים שנבדקות כדי למנוע נתק
    const maxWordsToProcess = Math.min(validWords.length, count * 2); // לא יותר מפי 2 מהמספר הנדרש
    
    for (let index = 0; index < maxWordsToProcess && questions.length < count; index++) {
      const wordData = validWords[index];
      if (!wordData) continue;
      if (usedWords.has(wordData.word.toLowerCase())) continue;
      
      const word = wordData.word.trim();
      const translation = wordData.translation || word;
      
      // ודא שהמילה תקפה
      if (!isValidWord(word)) {
        console.log(`Skipping invalid word: "${word}"`);
        continue;
      }
      
      // נסה למצוא שאלה קיימת שהמילה היא התשובה הנכונה שלה
      const existingQuestion = Object.values(QUESTION_BANK).flat().find(q => 
        q.answer.toLowerCase() === word.toLowerCase()
      );
      
      if (existingQuestion) {
        // אם יש שאלה קיימת, השתמש בה - היא כבר טובה והגיונית
        questions.push(existingQuestion);
        usedWords.add(word.toLowerCase());
      } else {
        // לא נשתמש במשפטים קיימים - נצור משפט חדש מותאם למילה
        // צור שאלה חדשה מהמילה
        const category = getWordCategory(word);
        const templates = getTemplatesForCategory(category);
        
        // נסה למצוא טמפלט שהמילה הגיונית בו
        let sentence: string | null = null;
        let template: ((w: string) => string) | null = null;
        
        // מערבב את הטמפלטים כדי לנסות אותם בסדר אקראי
        const shuffledTemplates = [...templates].sort(() => Math.random() - 0.5);
        
        // נסה כל טמפלט עד שנמצא אחד שהמילה הגיונית בו
        for (const temp of shuffledTemplates) {
          const testSentence = temp(word);
          // בדוק אם המילה הגיונית במשפט הזה (תמיד true למילה המקורית, אבל בודק שהמשפט הגיוני)
          const sentenceWithWord = testSentence.replace('___', word);
          // בדוק שהמשפט הגיוני עם המילה
          if (isWordLogicalInSentence(word, sentenceWithWord, word)) {
            sentence = testSentence;
            template = temp;
            break;
          }
        }
        
        // אם לא מצאנו טמפלט הגיוני, נשתמש בטמפלט הראשון (המילה תמיד הגיונית במשפט שלה)
        if (!sentence || !template) {
          template = templates[0] || templates[Math.floor(Math.random() * templates.length)];
          sentence = template(word);
        }
        
        // מצא מילים מאותו תחום לאופציות
        const categoryWords: Record<string, string[]> = {
          'animal': ['dog', 'cat', 'bird', 'fish', 'bear', 'lion', 'whale', 'monkey', 'deer', 'owl', 'rabbit', 'duck', 'eagle', 'snake', 'frog'],
          'food': ['apple', 'banana', 'water', 'milk', 'tea', 'bread', 'rice', 'cake', 'soup', 'egg', 'pasta', 'curry', 'lemonade', 'honey', 'toast', 'pizza', 'chips'],
          'object': ['book', 'pen', 'cup', 'ball', 'hat', 'shoes', 'chair', 'bed', 'bike', 'camera', 'television', 'headphones', 'clock', 'key', 'telescope', 'blanket', 'can', 'bottle', 'box', 'bag'],
          'nature': ['sun', 'moon', 'sky', 'tree', 'flower', 'grass', 'cloud', 'snow', 'rain', 'sea', 'hill', 'mountain', 'ocean', 'forest', 'volcano', 'river', 'rainbow', 'cave'],
          'person': ['mom', 'dad', 'sister', 'brother', 'family', 'daughter', 'son', 'father', 'mother', 'friend', 'teacher', 'professor', 'baby', 'child'],
          'place': ['home', 'school', 'house', 'bedroom', 'kitchen', 'living room', 'bathroom', 'garage', 'garden', 'basement', 'library', 'cafeteria', 'playground', 'office'],
          'transport': ['car', 'bus', 'airplane', 'train', 'boat', 'motorcycle', 'taxi', 'bicycle', 'ship', 'subway', 'truck', 'scooter'],
          'color': ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'orange', 'brown', 'gray', 'grey', 'silver', 'gold', 'turquoise', 'olive', 'lavender', 'indigo', 'magenta', 'salmon', 'coral', 'cream', 'beige', 'maroon', 'navy', 'cyan', 'lime', 'teal', 'violet', 'amber', 'ivory', 'khaki'],
          'adjective': ['tall', 'short', 'big', 'small', 'fast', 'slow', 'hot', 'cold', 'smart', 'good', 'bad', 'beautiful', 'ugly', 'new', 'old', 'young', 'strong', 'weak', 'hard', 'soft', 'easy', 'heavy', 'wide', 'narrow', 'long', 'thick', 'thin', 'interesting', 'nice', 'friendly', 'sad', 'happy', 'large', 'tiny', 'huge', 'little'],
          'verb': ['read', 'reads', 'write', 'writes', 'see', 'sees', 'hear', 'hears', 'go', 'goes', 'run', 'runs', 'jump', 'jumps', 'swim', 'swims', 'fly', 'flies', 'eat', 'eats', 'drink', 'drinks', 'sleep', 'sleeps', 'wake', 'wakes', 'learn', 'learns', 'teach', 'teaches', 'help', 'helps', 'work', 'works', 'play', 'plays', 'sing', 'sings', 'dance', 'dances', 'build', 'builds', 'break', 'breaks', 'open', 'opens', 'close', 'closes', 'buy', 'buys', 'sell', 'sells', 'make', 'makes', 'cook', 'cooks', 'wash', 'washes', 'clean', 'cleans', 'call', 'calls', 'speak', 'speaks', 'listen', 'listens', 'understand', 'understands', 'know', 'knows', 'want', 'wants', 'like', 'likes', 'love', 'loves', 'hate', 'hates', 'fear', 'fears', 'miss', 'misses', 'wait', 'waits', 'search', 'searches', 'find', 'finds', 'take', 'takes', 'give', 'gives', 'bring', 'brings', 'come', 'comes', 'leave', 'leaves', 'enter', 'enters', 'exit', 'exits', 'rise', 'rises', 'fall', 'falls', 'stand', 'stands', 'sit', 'sits', 'lie', 'lies', 'get', 'gets', 'start', 'starts', 'finish', 'finishes', 'continue', 'continues', 'stop', 'stops'],
          'quantifier': ['every', 'all', 'some', 'many', 'few', 'each', 'both', 'several', 'most', 'any', 'much', 'little', 'more', 'less', 'enough', 'plenty', 'none', 'either', 'neither'],
        };
        
        // בחר מילים מאותו תחום לאופציות
        let similarWords: string[] = [];
        if (categoryWords[category]) {
          similarWords = categoryWords[category]
            .filter(w => w.toLowerCase() !== word.toLowerCase() && isValidWord(w))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        }
        
        // אם אין מספיק מילים מאותו תחום, הוסף מהשאלות הקיימות מאותו תחום
        if (similarWords.length < 3) {
          const categoryQuestions = Object.values(QUESTION_BANK)
            .flat()
            .filter(q => {
              const qCategory = getWordCategory(q.answer);
              return qCategory === category && 
                     q.answer.toLowerCase() !== word.toLowerCase() &&
                     isValidWord(q.answer);
            })
            .map(q => q.answer)
            .filter(opt => !similarWords.some(s => s.toLowerCase() === opt.toLowerCase()))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - similarWords.length);
          similarWords = [...similarWords, ...categoryQuestions];
        }
        
        // אם עדיין אין מספיק, הוסף מהמילים שנלמדו מאותו תחום
        if (similarWords.length < 3) {
          const additionalWords = validWords
            .filter(w => {
              const wLower = w.word.toLowerCase();
              const wCategory = getWordCategory(w.word);
              return wCategory === category &&
                     wLower !== word.toLowerCase() && 
                     !similarWords.some(s => s.toLowerCase() === wLower) &&
                     isValidWord(w.word);
            })
            .map(w => w.word)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - similarWords.length);
          similarWords = [...similarWords, ...additionalWords];
        }
        
        // אם עדיין אין מספיק, הוסף מילים בסיסיות מאותו תחום
        let attempts = 0;
        while (similarWords.length < 3 && attempts < 50) {
          attempts++;
          const fallbackWords = categoryWords[category] || ['dog', 'cat', 'book', 'pen'];
          const randomWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
          if (!similarWords.some(s => s.toLowerCase() === randomWord.toLowerCase()) && 
              randomWord.toLowerCase() !== word.toLowerCase()) {
            similarWords.push(randomWord);
          }
          if (similarWords.length >= 10) break; // הגנה מפני לולאה אינסופית
        }
        
        // אם עדיין אין מספיק, פשוט הוסף מילים אקראיות מאותו תחום
        while (similarWords.length < 3) {
          const fallbackWords = categoryWords[category] || ['dog', 'cat', 'book', 'pen'];
          const randomWord = fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
          if (!similarWords.some(s => s.toLowerCase() === randomWord.toLowerCase()) && 
              randomWord.toLowerCase() !== word.toLowerCase()) {
            similarWords.push(randomWord);
          }
          if (similarWords.length >= 10) break; // הגנה מפני לולאה אינסופית
        }
        
        // בחר אופציות שגויות שלא הגיוניות במשפט - רק המילה הנכונה צריכה להיות הגיונית
        let finalSimilarWords: string[] = [];
        
        // נסה למצוא מילים מאותו תחום שלא הגיוניות במשפט
        for (const similarWord of similarWords) {
          if (finalSimilarWords.length >= 3) break;
          const testSentence = sentence.replace('___', similarWord);
          // בדוק שהמילה לא הגיונית במשפט (רק המילה הנכונה צריכה להיות הגיונית)
          if (!isWordLogicalInSentence(similarWord, testSentence, word)) {
            finalSimilarWords.push(similarWord);
          }
        }
        
        // אם אין מספיק מילים מאותו תחום שלא הגיוניות, נסה מילים מתחומים אחרים
        if (finalSimilarWords.length < 3) {
          // נסה מילים מתחומים אחרים שלא הגיוניות במשפט
          const allOtherWords = Object.values(QUESTION_BANK)
            .flat()
            .map(q => q.answer)
            .filter(opt => {
              const optLower = opt.toLowerCase();
              return optLower !== word.toLowerCase() && 
                     !finalSimilarWords.some(f => f.toLowerCase() === optLower) &&
                     isValidWord(opt);
            })
            .sort(() => Math.random() - 0.5)
            .slice(0, 30); // קח 30 מילים לבדיקה
          
          for (const opt of allOtherWords) {
            if (finalSimilarWords.length >= 3) break;
            const testSentence = sentence.replace('___', opt);
            // בדוק שהמילה לא הגיונית במשפט
            if (!isWordLogicalInSentence(opt, testSentence, word)) {
              finalSimilarWords.push(opt);
            }
          }
        }
        
        // אם עדיין אין מספיק, הוסף מילים בסיסיות שלא הגיוניות במשפט
        if (finalSimilarWords.length < 3) {
          const fallbackWords = ['rock', 'sand', 'wood', 'stone', 'paper', 'water', 'air', 'fire', 'tree', 'car', 'book', 'pen', 'table', 'chair', 'door', 'window', 'wall', 'floor', 'ceiling', 'sky', 'ground', 'earth', 'mountain', 'river', 'ocean', 'lake', 'sea', 'cloud', 'wind', 'rain', 'snow', 'ice', 'sun', 'moon', 'star', 'planet', 'galaxy', 'universe'];
          for (const fallbackWord of fallbackWords) {
            if (finalSimilarWords.length >= 3) break;
            if (!finalSimilarWords.some(s => s.toLowerCase() === fallbackWord.toLowerCase()) && 
                fallbackWord.toLowerCase() !== word.toLowerCase()) {
              const testSentence = sentence.replace('___', fallbackWord);
              // בדוק שהמילה לא הגיונית במשפט
              if (!isWordLogicalInSentence(fallbackWord, testSentence, word)) {
                finalSimilarWords.push(fallbackWord);
              }
            }
          }
        }
        
        // אם עדיין אין מספיק, הוסף מילים אקראיות (אפילו אם הן הגיוניות - זה רק גיבוי)
        if (finalSimilarWords.length < 3) {
          const emergencyWords = ['rock', 'sand', 'wood', 'stone', 'paper', 'water', 'air', 'fire'];
          for (const emergencyWord of emergencyWords) {
            if (finalSimilarWords.length >= 3) break;
            if (!finalSimilarWords.some(s => s.toLowerCase() === emergencyWord.toLowerCase()) && 
                emergencyWord.toLowerCase() !== word.toLowerCase()) {
              finalSimilarWords.push(emergencyWord);
            }
          }
        }
        
        const options = [word, ...finalSimilarWords.slice(0, 3)].sort(() => Math.random() - 0.5);
        
        // נסה למצוא תרגום טוב יותר מהמילון
        // תמיד תעדיף את התרגום מהמילון הבסיסי על פני התרגום מהמילים שנלמדו
        let finalTranslation = '';
        
        // קודם כל, נסה למצוא תרגום מהמילון הבסיסי (הכי אמין)
        const dictTranslation = TRANSLATION_DICT.get(word.toLowerCase());
        if (dictTranslation && dictTranslation !== word && !dictTranslation.includes('המילה') && !dictTranslation.includes('באנגלית')) {
          finalTranslation = dictTranslation;
        } else {
          // אם אין במילון הבסיסי, נסה למצוא מהשאלות הקיימות
          const existingQuestion = Object.values(QUESTION_BANK).flat().find(q => 
            q.answer.toLowerCase() === word.toLowerCase()
          );
          if (existingQuestion?.explanation) {
            const parts = existingQuestion.explanation.split('-');
            if (parts.length > 0) {
              const fullTranslation = parts[0].trim();
              const extracted = extractCorrectWordFromText(word, fullTranslation);
              if (extracted && extracted !== word && extracted.length > 1) {
                finalTranslation = extracted;
              }
            }
          }
          
          // אם עדיין אין תרגום, נסה להשתמש בתרגום מהמילים שנלמדו (רק אם הוא נראה הגיוני)
          if ((!finalTranslation || finalTranslation === word || finalTranslation.trim() === '') && 
              translation && translation !== word && translation.trim() !== '') {
            // בדוק אם התרגום הוא מילה אחת (לא משפט)
            if (translation.split(/\s+/).length === 1) {
              finalTranslation = translation;
            } else {
              // אם זה משפט, נסה לחלץ את המילה הנכונה
              const extracted = extractCorrectWordFromText(word, translation);
              if (extracted && extracted !== word && extracted.length > 1) {
                finalTranslation = extracted;
              }
            }
          }
          
          // אם עדיין אין תרגום, צור הסבר יותר משמעותי
          if (!finalTranslation || finalTranslation === word || finalTranslation.trim() === '') {
            finalTranslation = `המילה "${word}" באנגלית`;
          }
        }
        
        // הוסף את התרגום למילון התרגומים (אם הוא טוב) - רק אם הוא לא קיים כבר
        // לא נשנה תרגומים קיימים במילון הבסיסי
        if (finalTranslation && finalTranslation !== word && 
            !finalTranslation.includes('המילה') && !finalTranslation.includes('באנגלית') &&
            !TRANSLATION_DICT.has(word.toLowerCase())) {
          // אם התרגום הוא מילה אחת, הוסף אותו ישירות
          if (finalTranslation.split(/\s+/).length === 1) {
            TRANSLATION_DICT.set(word.toLowerCase(), finalTranslation);
          } else {
            // אם זה משפט, חלץ את המילה הנכונה
            const extracted = extractCorrectWordFromText(word, finalTranslation);
            if (extracted && extracted !== word && extracted.length > 1) {
              TRANSLATION_DICT.set(word.toLowerCase(), extracted);
            }
          }
        }
        
        // צור הסבר משמעותי וטוב שמסביר למה המילה היא התשובה הנכונה
        let explanationText = '';
        const sentenceWithWord = sentence.replace('___', word);
        
        // נסה למצוא הסבר מהשאלות הקיימות (אם יש שאלה עם אותה מילה)
        const existingQuestionWithSameWord = Object.values(QUESTION_BANK).flat().find(q => 
          q.answer.toLowerCase() === word.toLowerCase()
        );
        
        // אם יש תרגום טוב מהמילון, השתמש בו
        const goodTranslation = TRANSLATION_DICT.get(word.toLowerCase());
        const translationToUse = (goodTranslation && goodTranslation !== word && !goodTranslation.includes('המילה') && !goodTranslation.includes('באנגלית')) 
          ? goodTranslation 
          : (finalTranslation && finalTranslation !== word && !finalTranslation.includes('המילה') && !finalTranslation.includes('באנגלית'))
          ? finalTranslation
          : null;
        
        if (existingQuestionWithSameWord?.explanation && 
            existingQuestionWithSameWord.sentence.toLowerCase() === sentence.toLowerCase()) {
          // אם יש שאלה קיימת זהה, השתמש בהסבר שלה
          explanationText = existingQuestionWithSameWord.explanation;
        } else if (translationToUse && translationToUse.split(/\s+/).length === 1) {
          // אם יש תרגום טוב (מילה אחת), צור הסבר מלא
          const category = getWordCategory(word);
          let contextExplanation = '';
          
          // הוסף הסבר הקשר לפי סוג המילה והמשפט
          const sentenceLower = sentence.toLowerCase();
          
          // צור הסבר ספציפי שמסביר את הקשר בין המילה למשפט
          if (sentenceLower.includes('i eat')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא אוכל שאפשר לאכול`;
          } else if (sentenceLower.includes('i drink')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא משקה שאפשר לשתות`;
          } else if (sentenceLower.includes('i see')) {
            switch (category) {
              case 'animal':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר לראות ${translationToUse} - זה בעל חיים שאפשר לראות`;
                break;
              case 'object':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר לראות ${translationToUse} - זה חפץ שאפשר לראות`;
                break;
              case 'nature':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר לראות ${translationToUse} - זה דבר מהטבע שאפשר לראות`;
                break;
              case 'place':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר לראות ${translationToUse} - זה מקום שאפשר לראות`;
                break;
              case 'transport':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר לראות ${translationToUse} - זה כלי תחבורה שאפשר לראות`;
                break;
              default:
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר לראות ${translationToUse}`;
            }
          } else if (sentenceLower.includes('i have')) {
            switch (category) {
              case 'animal':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר לגדל ${translationToUse} בבית או להחזיק אותו`;
                break;
              case 'object':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר להחזיק ${translationToUse} או להיות בעלים שלו`;
                break;
              case 'food':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר להחזיק ${translationToUse} בבית או במקרר`;
                break;
              default:
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר להחזיק ${translationToUse} או להיות בעלים שלו`;
            }
          } else if (sentenceLower.includes('i like') || sentenceLower.includes('i love')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי אפשר לאהוב ${translationToUse} - זה דבר שאנשים אוהבים`;
          } else if (sentenceLower.includes('i use')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא חפץ שאפשר להשתמש בו בעבודה או בחיי היומיום`;
          } else if (sentenceLower.includes('i wear')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא בגד או אביזר שאפשר ללבוש`;
          } else if (sentenceLower.includes('i read')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא ספר או חומר קריאה שאפשר לקרוא`;
          } else if (sentenceLower.includes('i play with')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא דבר שאפשר לשחק איתו`;
          } else if (sentenceLower.includes('i go to')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא מקום שאפשר ללכת אליו`;
          } else if (sentenceLower.includes('the') && sentenceLower.includes('is')) {
            // משפטים כמו "The ___ is big/hot/good"
            const adjective = sentenceLower.match(/\bis\s+(\w+)/)?.[1] || '';
            switch (category) {
              case 'color':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא צבע שמתאר את המראה של הדבר במשפט`;
                break;
              case 'adjective':
                switch (adjective) {
                  case 'big':
                    contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} יכול להיות גדול`;
                    break;
                  case 'small':
                    contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} יכול להיות קטן`;
                    break;
                  case 'hot':
                    contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} יכול להיות חם`;
                    break;
                  case 'good':
                    contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} יכול להיות טוב`;
                    break;
                  default:
                    contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא תואר שמתאר את התכונה של הדבר במשפט`;
                }
                break;
              default:
                switch (adjective) {
                  case 'big':
                    contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} יכול להיות גדול`;
                    break;
                  case 'small':
                    contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} יכול להיות קטן`;
                    break;
                  case 'hot':
                    contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} יכול להיות חם`;
                    break;
                  case 'good':
                    contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} יכול להיות טוב`;
                    break;
                  default:
                    contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} מתאים לתיאור במשפט`;
                }
            }
          } else if (sentenceLower.includes('color') || sentenceLower.includes('paint') || sentenceLower.includes('wear') && category === 'color') {
            // משפטים על צבעים
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא צבע שמתאים למשפט`;
          } else {
            // הסבר כללי לפי קטגוריה
            switch (category) {
              case 'animal':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא בעל חיים שמתאים למשפט`;
                break;
              case 'food':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא אוכל שמתאים למשפט`;
                break;
              case 'object':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא חפץ שמתאים למשפט`;
                break;
              case 'nature':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא דבר מהטבע שמתאים למשפט`;
                break;
              case 'person':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא אדם שמתאים למשפט`;
                break;
              case 'place':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא מקום שמתאים למשפט`;
                break;
              case 'transport':
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} הוא כלי תחבורה שמתאים למשפט`;
                break;
              default:
                contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" (${translationToUse}) היא התשובה הנכונה כי ${translationToUse} מתאים למשפט`;
            }
          }
          
          explanationText = contextExplanation;
        } else {
          // אם אין תרגום טוב, צור הסבר בסיסי עם המשפט
          const category = getWordCategory(word);
          const sentenceLower = sentence.toLowerCase();
          let contextExplanation = '';
          
          if (sentenceLower.includes('i see')) {
            switch (category) {
              case 'animal': contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי אפשר לראות בעל חיים כזה`; break;
              case 'object': contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי אפשר לראות חפץ כזה`; break;
              case 'nature': contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי אפשר לראות דבר מהטבע כזה`; break;
              case 'place': contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי אפשר לראות מקום כזה`; break;
              default: contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי אפשר לראות דבר כזה`;
            }
          } else if (sentenceLower.includes('i have')) {
            switch (category) {
              case 'animal': contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי אפשר לגדל בעל חיים כזה בבית`; break;
              case 'object': contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי אפשר להחזיק חפץ כזה`; break;
              case 'food': contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי אפשר להחזיק אוכל כזה בבית`; break;
              default: contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי אפשר להחזיק דבר כזה`;
            }
          } else if (sentenceLower.includes('i eat')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי זה אוכל שאפשר לאכול`;
          } else if (sentenceLower.includes('i drink')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי זה משקה שאפשר לשתות`;
          } else if (sentenceLower.includes('i use')) {
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי זה חפץ שאפשר להשתמש בו`;
          } else {
            let categoryName = '';
            switch (category) {
              case 'animal': categoryName = 'בעל חיים'; break;
              case 'food': categoryName = 'אוכל'; break;
              case 'object': categoryName = 'חפץ'; break;
              case 'nature': categoryName = 'דבר מהטבע'; break;
              case 'person': categoryName = 'אדם'; break;
              case 'place': categoryName = 'מקום'; break;
              case 'transport': categoryName = 'כלי תחבורה'; break;
              default: categoryName = 'מילה';
            }
            contextExplanation = `במשפט "${sentenceWithWord}", המילה "${word}" היא התשובה הנכונה כי זה ${categoryName} שמתאים למשפט`;
          }
          
          explanationText = contextExplanation;
        }
        
        // ודא שכל האופציות הן מילים בודדות תקפות
        let validOptions = options.filter(opt => isValidWord(opt));
        
        // ודא שהמילה הנכונה נמצאת באופציות (אם היא תקפה)
        if (isValidWord(word) && !validOptions.some(opt => opt.toLowerCase() === word.toLowerCase())) {
          validOptions.unshift(word); // הוסף את המילה הנכונה בתחילה
        }
        
        // אם אין מספיק אופציות תקפות, הוסף מילים בסיסיות מאותו תחום
        const basicWordsByCategory: Record<string, string[]> = {
          'animal': ['dog', 'cat', 'bird', 'fish', 'bear', 'lion', 'whale', 'monkey'],
          'food': ['apple', 'banana', 'water', 'milk', 'tea', 'bread', 'rice', 'cake'],
          'object': ['book', 'pen', 'cup', 'ball', 'hat', 'shoes', 'chair', 'bed'],
          'nature': ['sun', 'moon', 'sky', 'tree', 'flower', 'grass', 'cloud', 'snow'],
          'person': ['mom', 'dad', 'sister', 'brother', 'friend', 'teacher', 'baby', 'child'],
          'place': ['home', 'school', 'house', 'bedroom', 'kitchen', 'garden', 'library', 'office'],
          'transport': ['car', 'bus', 'airplane', 'train', 'boat', 'bicycle', 'ship', 'truck'],
        };
        
        // בחר אופציות שגויות שלא הגיוניות במשפט - רק המילה הנכונה צריכה להיות הגיונית
        const categoryBasicWords = basicWordsByCategory[category] || ['dog', 'cat', 'book', 'pen'];
        let optionAttempts = 0;
        while (validOptions.length < 4 && optionAttempts < 50) {
          optionAttempts++;
          const randomWord = categoryBasicWords[Math.floor(Math.random() * categoryBasicWords.length)];
          if (!validOptions.some(opt => opt.toLowerCase() === randomWord.toLowerCase()) && 
              randomWord.toLowerCase() !== word.toLowerCase()) {
            const testSentence = sentence.replace('___', randomWord);
            // בדוק שהמילה לא הגיונית במשפט (רק המילה הנכונה צריכה להיות הגיונית)
            if (!isWordLogicalInSentence(randomWord, testSentence, word)) {
              validOptions.push(randomWord);
            }
          }
        }
        
        // אם עדיין אין מספיק אופציות, נסה מילים מתחומים אחרים שלא הגיוניות במשפט
        if (validOptions.length < 4) {
          const allOtherWords = Object.values(QUESTION_BANK)
            .flat()
            .map(q => q.answer)
            .filter(opt => {
              const optLower = opt.toLowerCase();
              return isValidWord(opt) && 
                     !validOptions.some(v => v.toLowerCase() === optLower) &&
                     optLower !== word.toLowerCase();
            })
            .sort(() => Math.random() - 0.5)
            .slice(0, 30); // קח 30 מילים לבדיקה
          
          for (const opt of allOtherWords) {
            if (validOptions.length >= 4) break;
            const testSentence = sentence.replace('___', opt);
            // בדוק שהמילה לא הגיונית במשפט
            if (!isWordLogicalInSentence(opt, testSentence, word)) {
              validOptions.push(opt);
            }
          }
        }
        
        // אם עדיין אין מספיק, הוסף מילים בסיסיות שלא הגיוניות במשפט
        if (validOptions.length < 4) {
          const fallbackWords = ['rock', 'sand', 'wood', 'stone', 'paper', 'water', 'air', 'fire', 'tree', 'car', 'book', 'pen', 'table', 'chair', 'door', 'window'];
          for (const fallbackWord of fallbackWords) {
            if (validOptions.length >= 4) break;
            if (!validOptions.some(opt => opt.toLowerCase() === fallbackWord.toLowerCase()) && 
                fallbackWord.toLowerCase() !== word.toLowerCase()) {
              const testSentence = sentence.replace('___', fallbackWord);
              // בדוק שהמילה לא הגיונית במשפט
              if (!isWordLogicalInSentence(fallbackWord, testSentence, word)) {
                validOptions.push(fallbackWord);
              }
            }
          }
        }
        
        // אם עדיין אין מספיק, הוסף מילים אקראיות (גיבוי אחרון)
        if (validOptions.length < 4) {
          const emergencyWords = ['rock', 'sand', 'wood', 'stone', 'paper', 'water'];
          for (const emergencyWord of emergencyWords) {
            if (validOptions.length >= 4) break;
            if (!validOptions.some(opt => opt.toLowerCase() === emergencyWord.toLowerCase()) && 
                emergencyWord.toLowerCase() !== word.toLowerCase()) {
              validOptions.push(emergencyWord);
            }
          }
        }
        
        // ודא שיש לפחות 4 אופציות
        while (validOptions.length < 4) {
          validOptions.push('word'); // מילה גנרית כגיבוי
        }
        
        // מערבב את האופציות שוב (אבל ודא שהמילה הנכונה נמצאת)
        const answerIndex = validOptions.findIndex(opt => opt.toLowerCase() === word.toLowerCase());
        const otherOptions = validOptions.filter(opt => opt.toLowerCase() !== word.toLowerCase());
        const shuffledOthers = otherOptions.sort(() => Math.random() - 0.5).slice(0, 3);
        const finalOptions = [word, ...shuffledOthers].sort(() => Math.random() - 0.5);
        
        questions.push({
          id: 10000 + index,
          sentence: sentence,
          options: finalOptions,
          answer: word,
          explanation: explanationText
        });
        usedWords.add(word.toLowerCase());
      }
    }
    
    return questions.slice(0, count);
  };

  useEffect(() => {
    if (started) {
        const diffConfig = DIFFICULTIES.find(d => d.key === difficulty)!;
        
        if (useLearnedWords && learnedWordsData.length > 0) {
          // השתמש במילים שנלמדו - קודם כל בדוק אם יש מילים שנבחרו ספציפית
          let wordsToUse: Array<{word: string, translation: string}>;
          if (selectedWords.length > 0) {
            // אם יש מילים שנבחרו ספציפית, השתמש בהן
            wordsToUse = selectedWords;
          } else if (selectedWordsCount !== null) {
            // אם יש כמות נבחרת, בחר אקראית מהמילים
            wordsToUse = [...learnedWordsData].sort(() => Math.random() - 0.5).slice(0, selectedWordsCount);
          } else {
            // אחרת, השתמש בכל המילים
            wordsToUse = learnedWordsData;
          }
          
          // השתמש ב-setTimeout כדי לא לחסום את ה-UI
          setTimeout(() => {
            try {
              const learnedQuestions = createQuestionsFromLearnedWords(wordsToUse, diffConfig.count);
              if (learnedQuestions.length > 0) {
                setQuestions(learnedQuestions);
              } else {
                // אם אין מספיק שאלות, השתמש בשאלות רגילות
        setQuestions(pickQuestions(QUESTION_BANK, difficulty, diffConfig.count));
              }
            } catch (error) {
              console.error('Error creating questions from learned words:', error);
              // במקרה של שגיאה, השתמש בשאלות רגילות
              setQuestions(pickQuestions(QUESTION_BANK, difficulty, diffConfig.count));
            }
          }, 0);
        } else {
          // השתמש בשאלות רגילות
          setQuestions(pickQuestions(QUESTION_BANK, difficulty, diffConfig.count));
        }
        
        setCurrentQuestionIndex(0);
        setScore(0);
        setCorrectAnswers(0);
        setWrongAnswers(0);
        setTime(0);
        setFinished(false);
        setSelectedOption(null);
        setFeedback(null);
        setShowHint(false);
    }
  }, [started, difficulty, useLearnedWords, learnedWordsData, selectedWordsCount, selectedWords]);

  useEffect(() => {
    // Load inventory from shop
    try {
      const inv = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
      setInventory(inv);
    } catch {}
  }, []);

  useEffect(() => {
    if (!started || finished) return;
    const timerId = setInterval(() => setTime(prev => prev + 1), 1000);
    return () => clearInterval(timerId);
  }, [started, finished]);

  const saveLearnedWord = async (word: string, translation: string, isCorrect: boolean) => {
    if (!user) {
      console.log('Cannot save word - no user logged in');
      return;
    }
    
    try {
      // ודא שהתרגום הוא מהמילון הבסיסי (הכי אמין)
      let finalTranslation = translation;
      
      // קודם כל, נסה למצוא תרגום מהמילון הבסיסי
      const dictTranslation = TRANSLATION_DICT.get(word.toLowerCase());
      if (dictTranslation && dictTranslation !== word && !dictTranslation.includes('המילה') && !dictTranslation.includes('באנגלית')) {
        finalTranslation = dictTranslation;
        console.log(`Using dictionary translation for "${word}": ${finalTranslation}`);
      } else if (!translation || translation === word || translation.includes('המילה') || translation.includes('באנגלית')) {
        // אם התרגום לא טוב, נסה למצוא מהשאלות הקיימות
        const existingQuestion = Object.values(QUESTION_BANK).flat().find(q => 
          q.answer.toLowerCase() === word.toLowerCase()
        );
        if (existingQuestion?.explanation) {
          const parts = existingQuestion.explanation.split('-');
          if (parts.length > 0) {
            const fullTranslation = parts[0].trim();
            const extracted = extractCorrectWordFromText(word, fullTranslation);
            if (extracted && extracted !== word && extracted.length > 1) {
              finalTranslation = extracted;
              console.log(`Using question translation for "${word}": ${finalTranslation}`);
            }
          }
        }
      }
      
      // אם עדיין אין תרגום טוב, שמור את המילה עם התרגום "לא ידוע"
      if (!finalTranslation || finalTranslation === word || finalTranslation.includes('המילה') || finalTranslation.includes('באנגלית')) {
        finalTranslation = 'לא ידוע';
      }
      
      console.log(`Saving word: ${word} (${finalTranslation})`);
      const response = await fetch('/api/learned-words/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          word: word,
          translation: finalTranslation,
          gameName: 'FillInTheBlanks',
          difficulty: difficulty,
          isCorrect: isCorrect
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error(`Failed to save word "${word}":`, response.status, errorData);
        throw new Error(`Failed to save word: ${response.status}`);
      }

      const result = await response.json();
      console.log(`Word "${word}" saved successfully:`, result);
      return result;
    } catch (error) {
      console.error(`Failed to save learned word "${word}":`, error);
      throw error; // זרוק את השגיאה כדי ש-Promise.all יוכל לתפוס אותה
    }
  };

  // אסוף את כל המילים מכל המשפטים במשחק
  const collectAllWordsFromGame = () => {
    const wordsMap = new Map<string, string>();
    
    console.log('Collecting words from', questions.length, 'questions');
    
    if (!questions || questions.length === 0) {
      console.warn('No questions available to collect words from');
      return [];
    }
    
    questions.forEach((question, index) => {
      if (!question || !question.sentence) {
        console.warn(`Question ${index} is missing sentence`);
        return;
      }
      
      // חילוץ כל המילים מהמשפט
      const sentenceWords = extractEnglishWords(question.sentence);
      console.log(`Question ${index} sentence words:`, sentenceWords);
      
      sentenceWords.forEach(word => {
        if (!wordsMap.has(word.toLowerCase())) {
          // קודם כל, נסה למצוא תרגום מהמילון הבסיסי (הכי אמין)
          let translation = TRANSLATION_DICT.get(word.toLowerCase());
          
          // אם אין במילון, נסה למצוא מההסבר
          if (!translation || translation === word || translation.includes('המילה') || translation.includes('באנגלית')) {
          if (question.explanation) {
              // נסה לחלץ תרגום מההסבר
              // ההסבר יכול להיות בפורמט: "במשפט X, המילה Y (תרגום) היא..."
              const translationMatch = question.explanation.match(/\(([^)]+)\)/);
              if (translationMatch && translationMatch[1]) {
                const extracted = translationMatch[1].trim();
                if (extracted && extracted !== word && !extracted.includes('המילה') && !extracted.includes('באנגלית')) {
                  translation = extracted;
            }
          }
            }
          }
          
          // אם עדיין אין תרגום טוב, אל תשמור את המילה
          if (translation && translation !== word && !translation.includes('המילה') && !translation.includes('באנגלית')) {
            wordsMap.set(word.toLowerCase(), translation);
          }
        }
      });
      
      // הוסף גם את המילה הנכונה (התשובה) - תמיד עם התרגום הטוב ביותר
      if (question.answer) {
        const answerWord = question.answer.toLowerCase();
        if (!wordsMap.has(answerWord)) {
          // קודם כל, נסה למצוא תרגום מהמילון הבסיסי
          let translation = TRANSLATION_DICT.get(answerWord);
          
          // אם אין במילון, נסה למצוא מההסבר
          if (!translation || translation === answerWord || translation.includes('המילה') || translation.includes('באנגלית')) {
          if (question.explanation) {
              // נסה לחלץ תרגום מההסבר
              const translationMatch = question.explanation.match(/\(([^)]+)\)/);
              if (translationMatch && translationMatch[1]) {
                const extracted = translationMatch[1].trim();
                if (extracted && extracted !== answerWord && !extracted.includes('המילה') && !extracted.includes('באנגלית')) {
                  translation = extracted;
            }
          }
            }
          }
          
          // אם יש תרגום טוב, שמור אותו
          if (translation && translation !== answerWord && !translation.includes('המילה') && !translation.includes('באנגלית')) {
          wordsMap.set(answerWord, translation);
          }
        }
      }
    });
    
    const result = Array.from(wordsMap.entries())
      .filter(([word, translation]) => translation && translation !== word && !translation.includes('המילה') && !translation.includes('באנגלית'))
      .map(([word, translation]) => ({
      word,
        translation: translation
    }));
    
    console.log('Collected words with valid translations:', result);
    return result;
  };

  const handleSelect = async (option: string) => {
    if (feedback) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.answer;
    
    setFeedback({ correct: isCorrect, answer: currentQuestion.answer });
    setScore(prev => prev + (isCorrect ? 3 : -2));
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    } else {
      setWrongAnswers(prev => prev + 1);
    }
    setSelectedOption(option);

    if (isCorrect) {
      successAudio.current?.play();
    } else {
      addMistake(currentQuestion.id);
      failAudio.current?.play();
    }
  };

  const handleNext = async () => {
      setFeedback(null);
      setSelectedOption(null);
    setShowHint(false);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        // זה השאלה האחרונה - אסוף את כל המילים לפני סיום המשחק
        console.log('Game finished! Collecting words...');
        console.log('Current question index:', currentQuestionIndex);
        console.log('Questions array length:', questions.length);
        console.log('Questions:', questions);
        
        // אסוף את כל המילים מכל השאלות
        const allWords = collectAllWordsFromGame();
        console.log('All collected words:', allWords);
        console.log('Number of words collected:', allWords.length);
        
        // אם המשחק היה עם מילים שנלמדו, לא נציג אותן כ"מילים חדשות שנלמדו"
        // אבל עדיין נעדכן את הסטטיסטיקות (timesSeen, timesCorrect) ב-API
        let wordsToShow: Array<{word: string, translation: string}> = [];
        
        if (useLearnedWords && learnedWordsData.length > 0) {
          // המשחק היה עם מילים שנלמדו - מצא רק מילים חדשות שלא היו ברשימה המקורית
          const learnedWordsSet = new Set(learnedWordsData.map(w => w.word.toLowerCase()));
          wordsToShow = allWords.filter(w => !learnedWordsSet.has(w.word.toLowerCase()));
          console.log('Playing with learned words - showing only new words:', wordsToShow.length);
        } else {
          // המשחק היה עם שאלות רגילות - הצג את כל המילים
          wordsToShow = allWords;
        }
        
        // עדכן את ה-state עם המילים להצגה
        setLearnedWordsList(wordsToShow);
        
        // שמור את כל המילים (רק אם המשתמש מחובר ולא משחק עם מילים שנלמדו)
        // בדוק אילו מילים כבר קיימות במסד הנתונים לפני השמירה
        if (user && allWords.length > 0 && !useLearnedWords) {
          console.log('User is logged in, checking existing words before saving...');
          console.log('User ID:', user.id);
          console.log('Words to check:', allWords.length);
          
          try {
            // טען את כל המילים הקיימות של המשתמש
            const existingWordsResponse = await fetch(`/api/learned-words?userId=${user.id}`);
            if (!existingWordsResponse.ok) {
              throw new Error('Failed to fetch existing words');
            }
            const existingWordsData = await existingWordsResponse.json();
            const existingWords = existingWordsData.learnedWords || [];
            
            // צור Set של מילים קיימות (בכל המשחקים) לבדיקה מהירה
            const existingWordsSet = new Set(
              existingWords.map((w: any) => w.word.toLowerCase())
            );
            
            // סנן רק את המילים החדשות (שאינן קיימות בכל המשחקים)
            const newWords = allWords.filter(wordData => {
              return !existingWordsSet.has(wordData.word.toLowerCase());
            });
            
            console.log(`Found ${existingWords.length} existing words, ${newWords.length} new words to save`);
            
            // עדכן את הרשימה להצגה - הצג את כל המילים שלמד במשחק (לא רק החדשות)
            // אבל שמור רק את המילים החדשות
            setLearnedWordsList(allWords);
            
            // שמור רק את המילים החדשות
            if (newWords.length > 0) {
              console.log('Saving', newWords.length, 'new words to database...');
              const savePromises = newWords.map(wordData => 
            saveLearnedWord(wordData.word, wordData.translation, true)
          );
            const results = await Promise.allSettled(savePromises);
            const successful = results.filter(r => r.status === 'fulfilled').length;
            const failed = results.filter(r => r.status === 'rejected').length;
            console.log(`Words save completed: ${successful} successful, ${failed} failed`);
            
            if (failed > 0) {
              console.error('Some words failed to save:', results.filter(r => r.status === 'rejected'));
              }
            } else {
              console.log('No new words to save - all words already exist');
            }
          } catch (error) {
            console.error('Error checking/saving words:', error);
            // במקרה של שגיאה, נסה לשמור את כל המילים (fallback)
            const savePromises = allWords.map(wordData => 
              saveLearnedWord(wordData.word, wordData.translation, true)
            );
            Promise.allSettled(savePromises).catch(err => 
              console.error('Error in fallback save:', err)
            );
          }
        } else if (!user) {
          console.log('No user logged in, words will be shown but not saved');
        } else {
          console.log('No words collected, skipping save');
        }
        
        // סיים את המשחק
        console.log('Setting finished to true');
        setFinished(true);
        if (user) {
          try {
            const totalQuestions = questions.length;
            const won = correctAnswers > totalQuestions / 2;
            const perfectScore = correctAnswers === totalQuestions && wrongAnswers === 0;
            
            const response = await fetch('/api/games/update-stats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                gameName: 'FillInTheBlanks',
                score,
                won: won,
                time,
                correctAnswers: correctAnswers,
                totalQuestions: totalQuestions,
                perfectScore: perfectScore,
              }),
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.newlyCompletedAchievements && data.newlyCompletedAchievements.length > 0) {
                setNewlyCompletedAchievements(data.newlyCompletedAchievements);
                setShowAchievementModal(true);
              }
            }
          } catch (error) {
            console.error('Failed to update game stats:', error);
          }
        }
      }
  };

  const restart = () => {
    setStarted(false);
    setFinished(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setTime(0);
    setSelectedOption(null);
    setFeedback(null);
    setShowHint(false);
    setLearnedWordsList([]);
    // לא מאפסים את useLearnedWords כדי שהמשתמש יוכל לשחק שוב עם אותה בחירה
    // This will trigger the useEffect to reset the game state
    setTimeout(() => setStarted(true), 50);
  };

  const startGame = () => {
    setStarted(true);
  };

  const useShopItem = (itemId: string) => {
    if (!inventory[itemId] || inventory[itemId] <= 0) return;
    setInventory(inv => {
      const newInv = { ...inv, [itemId]: inv[itemId] - 1 };
      localStorage.setItem('quiz-inventory', JSON.stringify(newInv));
      return newInv;
    });
    
    switch (itemId) {
      case 'hint':
        setShowHint(true);
        break;
      case 'skip':
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(c => c + 1);
          setSelectedOption(null);
          setFeedback(null);
          setShowHint(false);
    } else {
          setFinished(true);
        }
        break;
      case 'extra_time':
        // Add 10 seconds to timer
        setTime(t => t - 10);
        break;
      case 'score_boost':
        // Add bonus points
        setScore(s => s + 50);
        break;
    }
  };
  
  const currentQuestion = questions[currentQuestionIndex];
  
  // טען מילים שנלמדו כשהמשתמש בוחר במצב learned words
  useEffect(() => {
    if (useLearnedWords && user && learnedWordsData.length === 0 && !loadingLearnedWords) {
      loadLearnedWords();
    }
  }, [useLearnedWords, user]);
  
  if (!started) {
  return (
      <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-green-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-2xl w-full">
          <h1 className="text-5xl font-extrabold text-blue-700 mb-4 drop-shadow-lg">השלמת מילים</h1>
          <p className="text-xl text-gray-600 mb-8">בחר את המילה הנכונה להשלמת המשפט.</p>
          
          {/* בחירת מצב משחק - רגיל או מילים שנלמדו */}
          <div className="mb-6 bg-white bg-opacity-90 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">בחר מצב משחק:</h2>
            <div className="flex flex-col gap-4">
          <button
                onClick={() => {
                  setUseLearnedWords(false);
                }}
                className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  !useLearnedWords
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎮 משחק רגיל
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    alert('אנא התחבר כדי לשחק עם המילים שלמדת');
                    return;
                  }
                  setUseLearnedWords(true);
                  if (learnedWordsData.length === 0) {
                    loadLearnedWords();
                  }
                }}
                disabled={!user || loadingLearnedWords}
                className={`px-6 py-3 rounded-xl font-bold text-lg shadow-lg transition-all ${
                  useLearnedWords
                    ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white scale-105'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loadingLearnedWords ? (
                  '⏳ טוען מילים...'
                ) : (
                  <>
                    📚 משחק עם מילים שנלמדו
                    {learnedWordsData.length > 0 && (
                      <span className="block text-sm mt-1">({learnedWordsData.length} מילים זמינות)</span>
                    )}
                  </>
                )}
              </button>
              {!user && (
                <p className="text-sm text-gray-600 text-center mt-2">
                  💡 התחבר כדי לשחק עם המילים שלמדת
                </p>
              )}
            </div>
            {useLearnedWords && learnedWordsData.length === 0 && !loadingLearnedWords && user && (
              <p className="text-red-500 text-center mt-4 font-bold">
                אין מספיק מילים שנלמדו כדי לשחק. אנא שחק במשחקים אחרים כדי ללמוד מילים.
              </p>
            )}
            
            {/* בחירת כמות מילים (רק אם יש מילים שנלמדו) */}
            {useLearnedWords && learnedWordsData.length > 0 && !loadingLearnedWords && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                <label className="block text-sm font-bold text-blue-800 mb-2 text-center">
                  בחר מילים למשחק:
                </label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 justify-center">
                    <input
                      type="radio"
                      id="all-words-fb"
                      name="word-selection-fb"
                      checked={selectedWordsCount === null && selectedWords.length === 0 && !showWordSelector}
                      onChange={() => {
                        setSelectedWordsCount(null);
                        setSelectedWords([]);
                        setShowWordSelector(false);
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="all-words-fb" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      כל המילים ({learnedWordsData.length})
                    </label>
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <input
                      type="radio"
                      id="custom-count-fb"
                      name="word-selection-fb"
                      checked={selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector}
                      onChange={() => {
                        setSelectedWordsCount(Math.min(40, learnedWordsData.length));
                        setSelectedWords([]);
                        setShowWordSelector(false);
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="custom-count-fb" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      כמות אקראית:
                    </label>
                    {selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector && (
                      <input
                        type="number"
                        min="1"
                        max={learnedWordsData.length}
                        value={selectedWordsCount}
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 1;
                          const maxCount = Math.min(count, learnedWordsData.length);
                          setSelectedWordsCount(maxCount);
                          setSelectedWords([]);
                        }}
                        className="w-20 px-2 py-1 border-2 border-blue-300 rounded-lg text-center font-bold"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 justify-center">
                    <input
                      type="radio"
                      id="select-words-fb"
                      name="word-selection-fb"
                      checked={showWordSelector || selectedWords.length > 0}
                      onChange={() => {
                        setSelectedWordsCount(null);
                        setShowWordSelector(true);
                        if (selectedWords.length === 0) {
                          setSelectedWords([]);
                        }
                      }}
                      className="w-5 h-5"
                    />
                    <label htmlFor="select-words-fb" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      בחר מילים ספציפיות
                    </label>
                  </div>
                  {selectedWordsCount !== null && selectedWords.length === 0 && !showWordSelector && (
                    <p className="text-xs text-gray-600 text-center mt-2">
                      המילים נבחרות אקראית מתוך {learnedWordsData.length} מילים זמינות
                    </p>
                  )}
                  {selectedWords.length > 0 && (
                    <p className="text-xs text-green-600 text-center mt-2 font-bold">
                      נבחרו {selectedWords.length} מילים
                    </p>
                  )}
                </div>
                
                {/* רשימת בחירת מילים */}
                {(showWordSelector || selectedWords.length > 0) && (
                  <div className="mt-4 max-h-60 overflow-y-auto border-2 border-blue-300 rounded-lg p-3 bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {learnedWordsData.map((wordData, index) => {
                        const isSelected = selectedWords.some(w => w.word.toLowerCase() === wordData.word.toLowerCase());
                        return (
                          <label
                            key={index}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-blue-100 ${
                              isSelected ? 'bg-blue-200' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedWords([...selectedWords, wordData]);
                                  setSelectedWordsCount(null);
                                  setShowWordSelector(true);
                                } else {
                                  setSelectedWords(selectedWords.filter(w => w.word.toLowerCase() !== wordData.word.toLowerCase()));
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span className="text-sm font-semibold text-gray-800">{wordData.word}</span>
                            <span className="text-xs text-gray-600">({getTranslationWithFallback(wordData.word, undefined, wordData.translation)})</span>
                          </label>
                        );
                      })}
                    </div>
                    {selectedWords.length > 0 && (
                      <div className="mt-3 flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedWords([]);
                            setShowWordSelector(false);
                          }}
                          className="px-4 py-1 bg-red-500 text-white rounded-lg text-sm font-bold hover:bg-red-600"
                        >
                          נקה בחירה
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWords([...learnedWordsData]);
                            setShowWordSelector(true);
                          }}
                          className="px-4 py-1 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600"
                        >
                          בחר הכל
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* בחירת רמת קושי (רק אם לא משחק עם מילים שנלמדו) */}
          {!useLearnedWords && (
            <div className="mb-6 bg-white bg-opacity-90 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">רמת קושי:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => setDifficulty(d.key)}
                    className={`px-4 py-2 rounded-full font-bold shadow text-md ${
                      difficulty === d.key
                        ? 'bg-blue-600 text-white scale-105'
                        : 'bg-white text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={() => {
              if (useLearnedWords && learnedWordsData.length === 0) {
                alert('אין מספיק מילים שנלמדו כדי לשחק. אנא שחק במשחקים אחרים כדי ללמוד מילים.');
                return;
              }
              startGame();
            }}
            disabled={useLearnedWords && learnedWordsData.length === 0}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            התחל משחק
          </button>
        </div>
      </main>
    );
  }

  if (finished) {
    const totalQuestions = questions.length;
    const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
    const perfectScore = correctAnswers === totalQuestions && wrongAnswers === 0;
    let medal, label;
    if (perfectScore) { medal = '🥇'; label = 'ניצחת בבקיאות מלאה!'; }
    else if (accuracy >= 0.9) { medal = '🥇'; label = 'מצוין!'; }
    else if (accuracy >= 0.7) { medal = '🥈'; label = 'כל הכבוד!'; }
    else if (accuracy > 0.4) { medal = '🥉'; label = 'יפה מאוד!'; }
    else { medal = '🤔'; label = 'אפשר להשתפר!'; }

    return (
      <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-green-100 flex flex-col items-center justify-center p-4">
        <div className="text-center bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
          <h2 className="text-4xl font-extrabold text-blue-700 mb-4">המשחק הסתיים!</h2>
          <div className="text-6xl mb-4">{medal}</div>
          <div className="text-2xl font-bold text-blue-700">{label}</div>
          <div className="text-lg font-bold text-blue-700 my-4">ניקוד סופי: {score} | זמן: {time} שניות</div>
          
          {/* הצגת המילים שלמד */}
          {learnedWordsList && learnedWordsList.length > 0 ? (
            <div className="mt-8 mb-6">
              <h3 className="text-2xl font-bold text-purple-700 mb-4 flex items-center justify-center gap-2">
                <span className="text-3xl">📚</span>
                המילים שלמדת במשחק הזה
              </h3>
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                  {learnedWordsList.map((wordData, index) => (
                    <div 
                      key={index}
                      className="bg-white rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow border border-purple-100"
                    >
                      <div className="font-bold text-blue-700 text-lg">{wordData.word}</div>
                      <div className="text-sm text-gray-600 mt-1">{wordData.translation}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-center text-sm text-gray-600">
                  סה"כ {learnedWordsList.length} מילים נלמדו
                </div>
              </div>
            </div>
          ) : null}
          
          <div className="flex gap-4 justify-center mt-6 flex-wrap">
          <button
            onClick={restart}
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-105"
          >
            שחק שוב
          </button>
            <button
              onClick={() => {
                setStarted(false);
                setFinished(false);
                setQuestions([]);
                setCurrentQuestionIndex(0);
                setScore(0);
                setCorrectAnswers(0);
                setWrongAnswers(0);
                setTime(0);
                setSelectedOption(null);
                setFeedback(null);
                setShowHint(false);
                setLearnedWordsList([]);
                setUseLearnedWords(false);
              }}
              className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-purple-500 hover:to-pink-600 transition-transform transform hover:scale-105"
            >
              משחק חדש
            </button>
            {user && (
              <a
                href="/learned-words"
                className="bg-gradient-to-r from-indigo-400 to-purple-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-indigo-500 hover:to-purple-600 transition-transform transform hover:scale-105"
              >
                📚 צפה בכל המילים
              </a>
            )}
          </div>
        </div>
      </main>
    );
  }

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  return (
    <>
    <main className="min-h-screen bg-gradient-to-br from-yellow-200 via-blue-200 to-green-200 flex flex-col items-center justify-center p-4">
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      
      {!currentQuestion ? <div className="text-white text-2xl">טוען משחק...</div> : (
        <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8">
            <div className="w-full h-3 bg-blue-100 rounded-full mb-6 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            
            <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-blue-700 shadow flex items-center gap-2"><span className="text-green-500 text-2xl">★</span> ניקוד: {score}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-green-700 shadow flex items-center gap-2"><span className="text-blue-500 text-2xl">#️⃣</span> שאלה: {currentQuestionIndex + 1}/{questions.length}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow flex items-center gap-2"><span className="text-pink-500 text-2xl">⏰</span> זמן: {time} שניות</div>
          </div>
          {/* כפתורי עזר */}
          {!feedback && (
            <div className="flex flex-wrap gap-2 justify-center mb-4">
              {/* כפתור רמז */}
              {inventory['hint'] > 0 && !showHint && (
                <button
                  onClick={() => useShopItem('hint')}
                  className="px-4 py-2 rounded-full bg-yellow-300 text-yellow-900 font-bold shadow hover:bg-yellow-400 flex items-center gap-2 text-sm"
                >
                  <span className="text-xl">💡</span> רמז ({inventory['hint']})
                </button>
              )}
              {/* כפתור דילוג */}
              {inventory['skip'] > 0 && (
                <button
                  onClick={() => useShopItem('skip')}
                  className="px-4 py-2 rounded-full bg-blue-300 text-blue-900 font-bold shadow hover:bg-blue-400 flex items-center gap-2 text-sm"
                >
                  <span className="text-xl">⏭️</span> דלג ({inventory['skip']})
                </button>
              )}
              {/* כפתור תוספת זמן */}
              {inventory['extra_time'] > 0 && (
                <button
                  onClick={() => useShopItem('extra_time')}
                  className="px-4 py-2 rounded-full bg-green-300 text-green-900 font-bold shadow hover:bg-green-400 flex items-center gap-2 text-sm"
                >
                  <span className="text-xl">⏰</span> זמן ({inventory['extra_time']})
                </button>
              )}
              {/* כפתור בונוס ניקוד */}
              {inventory['score_boost'] > 0 && (
                <button
                  onClick={() => useShopItem('score_boost')}
                  className="px-4 py-2 rounded-full bg-purple-300 text-purple-900 font-bold shadow hover:bg-purple-400 flex items-center gap-2 text-sm"
                >
                  <span className="text-xl">🚀</span> בונוס ({inventory['score_boost']})
                </button>
              )}
            </div>
          )}
          {/* הצג רמז */}
          {showHint && !feedback && (
            <div className="bg-yellow-50 border-4 border-yellow-400 rounded-2xl px-6 py-4 text-lg font-bold text-yellow-900 shadow-lg mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💡</span>
                <span>רמז</span>
              </div>
              <div className="text-md">התשובה הנכונה היא: <strong>{currentQuestion.answer}</strong></div>
          </div>
        )}

            <div>
                <div className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-6 bg-blue-50 rounded-xl px-4 py-3 shadow">
                {currentQuestion.sentence.split('___').map((part, i) => (
                  <span key={i}>
                    {part}
                    {i < currentQuestion.sentence.split('___').length - 1 && <span className="inline-block w-20 border-b-2 border-blue-400 mx-2 align-middle"></span>}
                  </span>
                ))}
                {getMistakeStats()[currentQuestion.id] > 0 && (
                    <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-bold align-middle animate-pulse">💡 חיזוק אישי</span>
                )}
              </div>

                <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option: string, index: number) => (
                <div 
                    key={index}
                  className="relative group"
                  onMouseEnter={() => {
                    if (feedback) {
                      setHoveredWord(option);
                    }
                  }}
                  onMouseLeave={() => {
                    setHoveredWord(null);
                  }}
                >
                <button
                  onClick={() => handleSelect(option)}
                    className={`px-6 py-3 rounded-xl font-bold text-lg shadow transition-all duration-200 disabled:opacity-70 disabled:transform-none w-full ${
                        feedback && selectedOption === option
                        ? feedback.correct
                            ? 'bg-green-400 text-white scale-110 ring-4 ring-green-300 animate-correct'
                            : 'bg-red-400 text-white scale-110 ring-4 ring-red-300 animate-wrong'
                        : 'bg-white text-blue-700 hover:bg-blue-100 hover:scale-105'
                    }`}
                    disabled={!!feedback}
                >
                  {option}
                </button>
                {/* Tooltip עם תרגום - מופיע רק אחרי בחירת תשובה */}
                {feedback && hoveredWord === option && (
                  <div 
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-[9999]"
                    style={{ pointerEvents: 'none' }}
                  >
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl px-5 py-3 shadow-2xl border-2 border-white/20 min-w-[160px] max-w-[200px] text-center relative">
                      <div className="font-bold text-yellow-300 mb-1 text-base break-words">{option}</div>
                      <div className="text-white text-lg font-semibold break-words">{getTranslation(option)}</div>
                      {/* חץ קטן למטה */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                        <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[10px] border-l-transparent border-r-transparent border-t-blue-600"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              ))}
            </div>

                {feedback && !feedback.correct && (
                <div className="text-center mt-4 animate-fade-in">
                    <span className="inline-block bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow">
                        התשובה הנכונה: {feedback.answer}
                  </span>
                </div>
                )}

                {/* הסבר בעברית */}
                {feedback && currentQuestion.explanation && (
                  <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">💬</span>
                      <span className="font-bold text-blue-800">הסבר:</span>
                    </div>
                    <p className="text-gray-700 text-lg">{currentQuestion.explanation}</p>
                  </div>
                )}

                {/* כפתור הבא */}
                {feedback && (
                  <div className="text-center mt-6">
                    <button
                      onClick={handleNext}
                      className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-105"
                    >
                      {currentQuestionIndex < questions.length - 1 ? 'שאלה הבאה ➡️' : 'סיים משחק 🏁'}
                    </button>
                </div>
                )}
            </div>
          </div>
        )}
    </main>
    {showAchievementModal && newlyCompletedAchievements.length > 0 && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAchievementModal(false)}>
        <div className="bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-100 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border-4 border-yellow-400 animate-bounce" onClick={(e) => e.stopPropagation()}>
          <div className="text-center">
            <div className="text-6xl mb-4 animate-pulse">🏆</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">כל הכבוד! הישג חדש!</h2>
            
            {newlyCompletedAchievements.map((achievement, index) => (
              <div key={achievement.id} className="mb-4 p-4 bg-white rounded-xl shadow-lg border-2 border-yellow-300">
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="text-xl font-bold text-gray-800 mb-2">{achievement.name}</div>
                <div className="flex justify-center gap-4 text-lg">
                  <div className="flex items-center text-yellow-600">
                    <span className="mr-1">💎</span>
                    <span className="font-bold">+{achievement.reward}</span>
                  </div>
                  {achievement.xpReward > 0 && (
                    <div className="flex items-center text-blue-600">
                      <span className="mr-1">⭐</span>
                      <span className="font-bold">+{achievement.xpReward} XP</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <button
              onClick={() => {
                setShowAchievementModal(false);
                setNewlyCompletedAchievements([]);
              }}
              className="mt-6 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-xl font-bold shadow-lg hover:from-blue-600 hover:to-purple-700 transition-transform transform hover:scale-105"
            >
              מעולה! 🎉
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
} 