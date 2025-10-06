'use client';

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';

interface Question {
  id: number;
  sentence: string;
  answer: string;
  options: string[];
}

interface QuestionBank {
  [key: string]: Question[];
}

// Expanded question bank with 200+ questions for better learning experience
const QUESTION_BANK: QuestionBank = {
  easy: [
    // Animals (בעלי חיים)
    { id: 1, sentence: 'The ___ is barking loudly.', answer: 'dog', options: ['dog', 'cat', 'car', 'book'] },
    { id: 2, sentence: 'The ___ is sleeping on the sofa.', answer: 'cat', options: ['cat', 'dog', 'bird', 'fish'] },
    { id: 3, sentence: 'The ___ is flying in the sky.', answer: 'bird', options: ['bird', 'car', 'dog', 'book'] },
    { id: 4, sentence: 'The ___ is swimming in the pool.', answer: 'fish', options: ['fish', 'car', 'dog', 'book'] },
    { id: 5, sentence: 'The ___ is jumping in the water.', answer: 'frog', options: ['frog', 'car', 'dog', 'book'] },
    { id: 6, sentence: 'The ___ is running in the park.', answer: 'dog', options: ['dog', 'car', 'cat', 'book'] },
    { id: 7, sentence: 'The ___ is sitting on the chair.', answer: 'cat', options: ['cat', 'car', 'dog', 'book'] },
    { id: 8, sentence: 'The ___ is singing a song.', answer: 'bird', options: ['bird', 'car', 'dog', 'book'] },
    { id: 9, sentence: 'The ___ is sleeping in the bed.', answer: 'baby', options: ['baby', 'car', 'dog', 'book'] },
    { id: 10, sentence: 'The ___ is playing in the garden.', answer: 'child', options: ['child', 'car', 'dog', 'book'] },
    
    // Food (אוכל)
    { id: 11, sentence: 'I like to eat a red ___.', answer: 'apple', options: ['apple', 'car', 'sun', 'pen'] },
    { id: 12, sentence: 'I drink ___.', answer: 'water', options: ['water', 'milk', 'juice', 'tea'] },
    { id: 13, sentence: 'The ___ is hot.', answer: 'soup', options: ['soup', 'ice', 'car', 'dog'] },
    { id: 14, sentence: 'I eat ___ for breakfast.', answer: 'cereal', options: ['cereal', 'car', 'dog', 'pen'] },
    { id: 15, sentence: 'She is drinking a glass of ___.', answer: 'milk', options: ['milk', 'car', 'dog', 'pen'] },
    { id: 16, sentence: 'I like to eat a yellow ___.', answer: 'banana', options: ['banana', 'car', 'dog', 'pen'] },
    { id: 17, sentence: 'The ___ is sweet.', answer: 'cake', options: ['cake', 'car', 'dog', 'pen'] },
    { id: 18, sentence: 'I drink ___ in the morning.', answer: 'coffee', options: ['coffee', 'car', 'dog', 'pen'] },
    { id: 19, sentence: 'The ___ is orange.', answer: 'orange', options: ['orange', 'car', 'dog', 'pen'] },
    { id: 20, sentence: 'I eat ___ for lunch.', answer: 'sandwich', options: ['sandwich', 'car', 'dog', 'pen'] },
    
    // Nature (טבע)
    { id: 21, sentence: 'The ___ is shining in the sky.', answer: 'sun', options: ['sun', 'moon', 'car', 'dog'] },
    { id: 22, sentence: 'The ___ is blue.', answer: 'sky', options: ['sky', 'car', 'dog', 'apple'] },
    { id: 23, sentence: 'The ___ is green.', answer: 'tree', options: ['tree', 'car', 'dog', 'book'] },
    { id: 24, sentence: 'I see a yellow ___.', answer: 'flower', options: ['flower', 'car', 'dog', 'pen'] },
    { id: 25, sentence: 'The ___ is growing in the garden.', answer: 'plant', options: ['plant', 'car', 'dog', 'book'] },
    { id: 26, sentence: 'The ___ is white and fluffy.', answer: 'cloud', options: ['cloud', 'car', 'dog', 'pen'] },
    { id: 27, sentence: 'The ___ is cold.', answer: 'snow', options: ['snow', 'car', 'dog', 'pen'] },
    { id: 28, sentence: 'The ___ is falling from the sky.', answer: 'rain', options: ['rain', 'car', 'dog', 'pen'] },
    { id: 29, sentence: 'The ___ is big and blue.', answer: 'ocean', options: ['ocean', 'car', 'dog', 'pen'] },
    { id: 30, sentence: 'The ___ is tall and green.', answer: 'mountain', options: ['mountain', 'car', 'dog', 'pen'] },
    
    // Objects (חפצים)
    { id: 31, sentence: 'She is reading a ___.', answer: 'book', options: ['book', 'pen', 'dog', 'car'] },
    { id: 32, sentence: 'I write with a ___.', answer: 'pen', options: ['pen', 'spoon', 'book', 'car'] },
    { id: 33, sentence: 'She has a red ___.', answer: 'ball', options: ['ball', 'car', 'dog', 'pen'] },
    { id: 34, sentence: 'I use a ___ to cut paper.', answer: 'scissors', options: ['scissors', 'car', 'dog', 'pen'] },
    { id: 35, sentence: 'She is reading a ___.', answer: 'magazine', options: ['magazine', 'car', 'dog', 'pen'] },
    { id: 36, sentence: 'I wear ___ on my feet.', answer: 'shoes', options: ['shoes', 'car', 'dog', 'pen'] },
    { id: 37, sentence: 'She is wearing a blue ___.', answer: 'dress', options: ['dress', 'car', 'dog', 'pen'] },
    { id: 38, sentence: 'She is wearing a red ___.', answer: 'hat', options: ['hat', 'car', 'dog', 'pen'] },
    { id: 39, sentence: 'I ride my ___ to school.', answer: 'bike', options: ['bike', 'car', 'dog', 'pen'] },
    { id: 40, sentence: 'She is playing the ___.', answer: 'piano', options: ['piano', 'car', 'dog', 'pen'] },
    
    // Colors (צבעים)
    { id: 41, sentence: 'The ___ is red.', answer: 'apple', options: ['apple', 'sky', 'dog', 'pen'] },
    { id: 42, sentence: 'The ___ is blue.', answer: 'sky', options: ['sky', 'apple', 'dog', 'pen'] },
    { id: 43, sentence: 'The ___ is green.', answer: 'grass', options: ['grass', 'apple', 'dog', 'pen'] },
    { id: 44, sentence: 'The ___ is yellow.', answer: 'sun', options: ['sun', 'apple', 'dog', 'pen'] },
    { id: 45, sentence: 'The ___ is white.', answer: 'snow', options: ['snow', 'apple', 'dog', 'pen'] },
    { id: 46, sentence: 'The ___ is black.', answer: 'night', options: ['night', 'apple', 'dog', 'pen'] },
    { id: 47, sentence: 'The ___ is brown.', answer: 'bear', options: ['bear', 'apple', 'dog', 'pen'] },
    { id: 48, sentence: 'The ___ is purple.', answer: 'grape', options: ['grape', 'apple', 'dog', 'pen'] },
    { id: 49, sentence: 'The ___ is pink.', answer: 'rose', options: ['rose', 'apple', 'dog', 'pen'] },
    { id: 50, sentence: 'The ___ is orange.', answer: 'carrot', options: ['carrot', 'apple', 'dog', 'pen'] },
    
    // Family (משפחה)
    { id: 51, sentence: 'My ___ is very kind.', answer: 'mother', options: ['mother', 'car', 'dog', 'pen'] },
    { id: 52, sentence: 'My ___ is tall.', answer: 'father', options: ['father', 'car', 'dog', 'pen'] },
    { id: 53, sentence: 'My ___ is young.', answer: 'sister', options: ['sister', 'car', 'dog', 'pen'] },
    { id: 54, sentence: 'My ___ is funny.', answer: 'brother', options: ['brother', 'car', 'dog', 'pen'] },
    { id: 55, sentence: 'My ___ is old.', answer: 'grandmother', options: ['grandmother', 'car', 'dog', 'pen'] },
    { id: 56, sentence: 'My ___ is wise.', answer: 'grandfather', options: ['grandfather', 'car', 'dog', 'pen'] },
    { id: 57, sentence: 'My ___ is cute.', answer: 'baby', options: ['baby', 'car', 'dog', 'pen'] },
    { id: 58, sentence: 'My ___ is friendly.', answer: 'uncle', options: ['uncle', 'car', 'dog', 'pen'] },
    { id: 59, sentence: 'My ___ is helpful.', answer: 'aunt', options: ['aunt', 'car', 'dog', 'pen'] },
    { id: 60, sentence: 'My ___ is smart.', answer: 'cousin', options: ['cousin', 'car', 'dog', 'pen'] },
    
    // School (בית ספר)
    { id: 61, sentence: 'I go to ___ every day.', answer: 'school', options: ['school', 'car', 'dog', 'pen'] },
    { id: 62, sentence: 'My ___ is very nice.', answer: 'teacher', options: ['teacher', 'car', 'dog', 'pen'] },
    { id: 63, sentence: 'I sit at my ___.', answer: 'desk', options: ['desk', 'car', 'dog', 'pen'] },
    { id: 64, sentence: 'I write in my ___.', answer: 'notebook', options: ['notebook', 'car', 'dog', 'pen'] },
    { id: 65, sentence: 'I use a ___ to write.', answer: 'pencil', options: ['pencil', 'car', 'dog', 'pen'] },
    { id: 66, sentence: 'I read my ___.', answer: 'textbook', options: ['textbook', 'car', 'dog', 'pen'] },
    { id: 67, sentence: 'I carry my books in my ___.', answer: 'backpack', options: ['backpack', 'car', 'dog', 'pen'] },
    { id: 68, sentence: 'I eat lunch in the ___.', answer: 'cafeteria', options: ['cafeteria', 'car', 'dog', 'pen'] },
    { id: 69, sentence: 'I play in the ___.', answer: 'playground', options: ['playground', 'car', 'dog', 'pen'] },
    { id: 70, sentence: 'I study in the ___.', answer: 'library', options: ['library', 'car', 'dog', 'pen'] },
    
    // Home (בית)
    { id: 71, sentence: 'I live in a ___.', answer: 'house', options: ['house', 'car', 'dog', 'pen'] },
    { id: 72, sentence: 'I sleep in my ___.', answer: 'bedroom', options: ['bedroom', 'car', 'dog', 'pen'] },
    { id: 73, sentence: 'I cook in the ___.', answer: 'kitchen', options: ['kitchen', 'car', 'dog', 'pen'] },
    { id: 74, sentence: 'I watch TV in the ___.', answer: 'living room', options: ['living room', 'car', 'dog', 'pen'] },
    { id: 75, sentence: 'I take a shower in the ___.', answer: 'bathroom', options: ['bathroom', 'car', 'dog', 'pen'] },
    { id: 76, sentence: 'I park my car in the ___.', answer: 'garage', options: ['garage', 'car', 'dog', 'pen'] },
    { id: 77, sentence: 'I play in the ___.', answer: 'garden', options: ['garden', 'car', 'dog', 'pen'] },
    { id: 78, sentence: 'I store things in the ___.', answer: 'basement', options: ['basement', 'car', 'dog', 'pen'] },
    { id: 79, sentence: 'I go up the ___.', answer: 'stairs', options: ['stairs', 'car', 'dog', 'pen'] },
    { id: 80, sentence: 'I open the ___.', answer: 'door', options: ['door', 'car', 'dog', 'pen'] },
    
    // Transportation (תחבורה)
    { id: 81, sentence: 'I drive my ___.', answer: 'car', options: ['car', 'dog', 'pen', 'book'] },
    { id: 82, sentence: 'I ride my ___.', answer: 'bike', options: ['bike', 'car', 'dog', 'pen'] },
    { id: 83, sentence: 'I take the ___.', answer: 'bus', options: ['bus', 'car', 'dog', 'pen'] },
    { id: 84, sentence: 'I fly in an ___.', answer: 'airplane', options: ['airplane', 'car', 'dog', 'pen'] },
    { id: 85, sentence: 'I ride the ___.', answer: 'train', options: ['train', 'car', 'dog', 'pen'] },
    { id: 86, sentence: 'I sail on a ___.', answer: 'boat', options: ['boat', 'car', 'dog', 'pen'] },
    { id: 87, sentence: 'I ride a ___.', answer: 'motorcycle', options: ['motorcycle', 'car', 'dog', 'pen'] },
    { id: 88, sentence: 'I take a ___.', answer: 'taxi', options: ['taxi', 'car', 'dog', 'pen'] },
    { id: 89, sentence: 'I walk on the ___.', answer: 'sidewalk', options: ['sidewalk', 'car', 'dog', 'pen'] },
    { id: 90, sentence: 'I cross the ___.', answer: 'street', options: ['street', 'car', 'dog', 'pen'] },
    
    // Weather (מזג אוויר)
    { id: 91, sentence: 'It is ___ today.', answer: 'sunny', options: ['sunny', 'car', 'dog', 'pen'] },
    { id: 92, sentence: 'It is ___ outside.', answer: 'rainy', options: ['rainy', 'car', 'dog', 'pen'] },
    { id: 93, sentence: 'It is ___ and cold.', answer: 'snowy', options: ['snowy', 'car', 'dog', 'pen'] },
    { id: 94, sentence: 'It is ___ and windy.', answer: 'cloudy', options: ['cloudy', 'car', 'dog', 'pen'] },
    { id: 95, sentence: 'It is ___ and hot.', answer: 'sunny', options: ['sunny', 'car', 'dog', 'pen'] },
    { id: 96, sentence: 'The ___ is strong.', answer: 'wind', options: ['wind', 'car', 'dog', 'pen'] },
    { id: 97, sentence: 'The ___ is falling.', answer: 'rain', options: ['rain', 'car', 'dog', 'pen'] },
    { id: 98, sentence: 'The ___ is white.', answer: 'snow', options: ['snow', 'car', 'dog', 'pen'] },
    { id: 99, sentence: 'The ___ is bright.', answer: 'sun', options: ['sun', 'car', 'dog', 'pen'] },
    { id: 100, sentence: 'The ___ is dark.', answer: 'cloud', options: ['cloud', 'car', 'dog', 'pen'] },
  ],
  medium: [
    // Advanced Animals (בעלי חיים מתקדמים)
    { id: 101, sentence: 'The ___ is hunting for food.', answer: 'lion', options: ['lion', 'cat', 'dog', 'bird'] },
    { id: 102, sentence: 'The ___ is swimming in the ocean.', answer: 'whale', options: ['whale', 'fish', 'shark', 'dolphin'] },
    { id: 103, sentence: 'The ___ is climbing the tree.', answer: 'monkey', options: ['monkey', 'cat', 'dog', 'bird'] },
    { id: 104, sentence: 'The ___ is running in the forest.', answer: 'deer', options: ['deer', 'car', 'dog', 'cat'] },
    { id: 105, sentence: 'The ___ is flying at night.', answer: 'owl', options: ['owl', 'bird', 'bat', 'eagle'] },
    { id: 106, sentence: 'The ___ is sleeping in the cave.', answer: 'bear', options: ['bear', 'cat', 'dog', 'lion'] },
    { id: 107, sentence: 'The ___ is jumping in the grass.', answer: 'rabbit', options: ['rabbit', 'cat', 'dog', 'mouse'] },
    { id: 108, sentence: 'The ___ is swimming in the river.', answer: 'duck', options: ['duck', 'fish', 'swan', 'goose'] },
    { id: 109, sentence: 'The ___ is flying over the mountains.', answer: 'eagle', options: ['eagle', 'bird', 'owl', 'hawk'] },
    { id: 110, sentence: 'The ___ is crawling on the ground.', answer: 'snake', options: ['snake', 'worm', 'lizard', 'frog'] },
    
    // Advanced Food (אוכל מתקדם)
    { id: 111, sentence: 'I eat ___ for dinner.', answer: 'pasta', options: ['pasta', 'rice', 'bread', 'soup'] },
    { id: 112, sentence: 'The ___ is spicy.', answer: 'curry', options: ['curry', 'soup', 'salad', 'pizza'] },
    { id: 113, sentence: 'I drink ___ with ice.', answer: 'lemonade', options: ['lemonade', 'water', 'juice', 'tea'] },
    { id: 114, sentence: 'The ___ is sweet and sticky.', answer: 'honey', options: ['honey', 'sugar', 'jam', 'syrup'] },
    { id: 115, sentence: 'I eat ___ with butter.', answer: 'toast', options: ['toast', 'bread', 'cracker', 'cookie'] },
    { id: 116, sentence: 'The ___ is cold and creamy.', answer: 'ice cream', options: ['ice cream', 'yogurt', 'milk', 'cheese'] },
    { id: 117, sentence: 'I eat ___ with chopsticks.', answer: 'sushi', options: ['sushi', 'rice', 'noodles', 'salad'] },
    { id: 118, sentence: 'The ___ is hot and cheesy.', answer: 'pizza', options: ['pizza', 'sandwich', 'burger', 'pasta'] },
    { id: 119, sentence: 'I drink ___ in the morning.', answer: 'orange juice', options: ['orange juice', 'apple juice', 'grape juice', 'water'] },
    { id: 120, sentence: 'The ___ is crunchy and salty.', answer: 'chips', options: ['chips', 'crackers', 'nuts', 'popcorn'] },
    
    // Advanced Nature (טבע מתקדם)
    { id: 121, sentence: 'The ___ is very tall.', answer: 'mountain', options: ['mountain', 'hill', 'tree', 'building'] },
    { id: 122, sentence: 'The ___ is deep and blue.', answer: 'ocean', options: ['ocean', 'lake', 'river', 'pond'] },
    { id: 123, sentence: 'The ___ is falling from the sky.', answer: 'snow', options: ['snow', 'rain', 'hail', 'sleet'] },
    { id: 124, sentence: 'The ___ is very old.', answer: 'forest', options: ['forest', 'garden', 'park', 'field'] },
    { id: 125, sentence: 'The ___ is hot and bright.', answer: 'volcano', options: ['volcano', 'mountain', 'hill', 'rock'] },
    { id: 126, sentence: 'The ___ is wide and long.', answer: 'river', options: ['river', 'stream', 'lake', 'ocean'] },
    { id: 127, sentence: 'The ___ is green and tall.', answer: 'bamboo', options: ['bamboo', 'tree', 'grass', 'plant'] },
    { id: 128, sentence: 'The ___ is cold and white.', answer: 'glacier', options: ['glacier', 'ice', 'snow', 'mountain'] },
    { id: 129, sentence: 'The ___ is colorful and beautiful.', answer: 'rainbow', options: ['rainbow', 'sky', 'cloud', 'sun'] },
    { id: 130, sentence: 'The ___ is dark and scary.', answer: 'cave', options: ['cave', 'hole', 'tunnel', 'basement'] },
    
    // Advanced Objects (חפצים מתקדמים)
    { id: 131, sentence: 'I use a ___ to take pictures.', answer: 'camera', options: ['camera', 'phone', 'tablet', 'computer'] },
    { id: 132, sentence: 'I watch movies on my ___.', answer: 'television', options: ['television', 'computer', 'phone', 'tablet'] },
    { id: 133, sentence: 'I listen to music with ___.', answer: 'headphones', options: ['headphones', 'speakers', 'radio', 'phone'] },
    { id: 134, sentence: 'I use a ___ to measure time.', answer: 'clock', options: ['clock', 'watch', 'timer', 'calendar'] },
    { id: 135, sentence: 'I use a ___ to open doors.', answer: 'key', options: ['key', 'card', 'code', 'button'] },
    { id: 136, sentence: 'I use a ___ to see far away.', answer: 'telescope', options: ['telescope', 'microscope', 'glasses', 'camera'] },
    { id: 137, sentence: 'I use a ___ to keep warm.', answer: 'blanket', options: ['blanket', 'towel', 'sheet', 'pillow'] },
    { id: 138, sentence: 'I use a ___ to clean my teeth.', answer: 'toothbrush', options: ['toothbrush', 'brush', 'comb', 'sponge'] },
    { id: 139, sentence: 'I use a ___ to dry my hair.', answer: 'hair dryer', options: ['hair dryer', 'fan', 'towel', 'brush'] },
    { id: 140, sentence: 'I use a ___ to lock the door.', answer: 'lock', options: ['lock', 'key', 'chain', 'bolt'] },
    
    // Advanced Colors (צבעים מתקדמים)
    { id: 141, sentence: 'The ___ is silver.', answer: 'coin', options: ['coin', 'ring', 'watch', 'spoon'] },
    { id: 142, sentence: 'The ___ is gold.', answer: 'ring', options: ['ring', 'coin', 'watch', 'necklace'] },
    { id: 143, sentence: 'The ___ is turquoise.', answer: 'ocean', options: ['ocean', 'sky', 'lake', 'river'] },
    { id: 144, sentence: 'The ___ is burgundy.', answer: 'wine', options: ['wine', 'juice', 'soda', 'water'] },
    { id: 145, sentence: 'The ___ is emerald.', answer: 'gem', options: ['gem', 'stone', 'crystal', 'diamond'] },
    { id: 146, sentence: 'The ___ is coral.', answer: 'reef', options: ['reef', 'ocean', 'beach', 'island'] },
    { id: 147, sentence: 'The ___ is lavender.', answer: 'flower', options: ['flower', 'plant', 'herb', 'tree'] },
    { id: 148, sentence: 'The ___ is crimson.', answer: 'rose', options: ['rose', 'flower', 'plant', 'tree'] },
    { id: 149, sentence: 'The ___ is indigo.', answer: 'sky', options: ['sky', 'ocean', 'lake', 'river'] },
    { id: 150, sentence: 'The ___ is magenta.', answer: 'flower', options: ['flower', 'plant', 'herb', 'tree'] },
    
    // Advanced Family (משפחה מתקדמת)
    { id: 151, sentence: 'My ___ is getting married.', answer: 'sister', options: ['sister', 'brother', 'cousin', 'friend'] },
    { id: 152, sentence: 'My ___ is having a baby.', answer: 'daughter', options: ['daughter', 'son', 'sister', 'brother'] },
    { id: 153, sentence: 'My ___ is retiring.', answer: 'father', options: ['father', 'mother', 'grandfather', 'grandmother'] },
    { id: 154, sentence: 'My ___ is graduating.', answer: 'son', options: ['son', 'daughter', 'brother', 'sister'] },
    { id: 155, sentence: 'My ___ is moving away.', answer: 'brother', options: ['brother', 'sister', 'cousin', 'friend'] },
    { id: 156, sentence: 'My ___ is visiting us.', answer: 'grandmother', options: ['grandmother', 'grandfather', 'aunt', 'uncle'] },
    { id: 157, sentence: 'My ___ is getting a promotion.', answer: 'father', options: ['father', 'mother', 'brother', 'sister'] },
    { id: 158, sentence: 'My ___ is learning to drive.', answer: 'teenager', options: ['teenager', 'child', 'adult', 'baby'] },
    { id: 159, sentence: 'My ___ is celebrating a birthday.', answer: 'mother', options: ['mother', 'father', 'sister', 'brother'] },
    { id: 160, sentence: 'My ___ is going to college.', answer: 'daughter', options: ['daughter', 'son', 'sister', 'brother'] },
    
    // Advanced School (בית ספר מתקדם)
    { id: 161, sentence: 'I study ___ in college.', answer: 'mathematics', options: ['mathematics', 'science', 'history', 'art'] },
    { id: 162, sentence: 'My ___ is very strict.', answer: 'professor', options: ['professor', 'teacher', 'instructor', 'tutor'] },
    { id: 163, sentence: 'I take notes in my ___.', answer: 'notebook', options: ['notebook', 'textbook', 'workbook', 'journal'] },
    { id: 164, sentence: 'I use a ___ to calculate.', answer: 'calculator', options: ['calculator', 'computer', 'phone', 'tablet'] },
    { id: 165, sentence: 'I study in the ___.', answer: 'library', options: ['library', 'classroom', 'laboratory', 'office'] },
    { id: 166, sentence: 'I eat lunch in the ___.', answer: 'cafeteria', options: ['cafeteria', 'restaurant', 'kitchen', 'dining room'] },
    { id: 167, sentence: 'I play sports in the ___.', answer: 'gymnasium', options: ['gymnasium', 'stadium', 'field', 'court'] },
    { id: 168, sentence: 'I conduct experiments in the ___.', answer: 'laboratory', options: ['laboratory', 'classroom', 'office', 'library'] },
    { id: 169, sentence: 'I attend ___ every semester.', answer: 'lectures', options: ['lectures', 'classes', 'seminars', 'workshops'] },
    { id: 170, sentence: 'I take ___ at the end of the semester.', answer: 'exams', options: ['exams', 'tests', 'quizzes', 'assignments'] },
    
    // Advanced Home (בית מתקדם)
    { id: 171, sentence: 'I store my car in the ___.', answer: 'garage', options: ['garage', 'driveway', 'parking lot', 'street'] },
    { id: 172, sentence: 'I relax in the ___.', answer: 'living room', options: ['living room', 'bedroom', 'kitchen', 'bathroom'] },
    { id: 173, sentence: 'I cook dinner in the ___.', answer: 'kitchen', options: ['kitchen', 'dining room', 'living room', 'basement'] },
    { id: 174, sentence: 'I sleep in my ___.', answer: 'bedroom', options: ['bedroom', 'living room', 'kitchen', 'bathroom'] },
    { id: 175, sentence: 'I take a shower in the ___.', answer: 'bathroom', options: ['bathroom', 'kitchen', 'bedroom', 'living room'] },
    { id: 176, sentence: 'I store old things in the ___.', answer: 'basement', options: ['basement', 'attic', 'garage', 'closet'] },
    { id: 177, sentence: 'I store things in the ___.', answer: 'attic', options: ['attic', 'basement', 'garage', 'closet'] },
    { id: 178, sentence: 'I hang my clothes in the ___.', answer: 'closet', options: ['closet', 'wardrobe', 'dresser', 'cabinet'] },
    { id: 179, sentence: 'I eat meals in the ___.', answer: 'dining room', options: ['dining room', 'kitchen', 'living room', 'bedroom'] },
    { id: 180, sentence: 'I work in my ___.', answer: 'office', options: ['office', 'study', 'bedroom', 'living room'] },
    
    // Advanced Transportation (תחבורה מתקדמת)
    { id: 181, sentence: 'I drive my ___ to work.', answer: 'car', options: ['car', 'truck', 'van', 'suv'] },
    { id: 182, sentence: 'I ride my ___ for exercise.', answer: 'bicycle', options: ['bicycle', 'motorcycle', 'scooter', 'skateboard'] },
    { id: 183, sentence: 'I take the ___ to the city.', answer: 'train', options: ['train', 'bus', 'subway', 'taxi'] },
    { id: 184, sentence: 'I fly in an ___ to Europe.', answer: 'airplane', options: ['airplane', 'helicopter', 'jet', 'glider'] },
    { id: 185, sentence: 'I sail on a ___ across the ocean.', answer: 'ship', options: ['ship', 'boat', 'yacht', 'cruise'] },
    { id: 186, sentence: 'I ride a ___ in the city.', answer: 'motorcycle', options: ['motorcycle', 'bicycle', 'scooter', 'skateboard'] },
    { id: 187, sentence: 'I take a ___ to the airport.', answer: 'taxi', options: ['taxi', 'bus', 'train', 'car'] },
    { id: 188, sentence: 'I ride the ___ underground.', answer: 'subway', options: ['subway', 'train', 'bus', 'tram'] },
    { id: 189, sentence: 'I drive a ___ for work.', answer: 'truck', options: ['truck', 'van', 'car', 'suv'] },
    { id: 190, sentence: 'I ride a ___ in the park.', answer: 'scooter', options: ['scooter', 'bicycle', 'skateboard', 'roller skates'] },
    
    // Advanced Weather (מזג אוויר מתקדם)
    { id: 191, sentence: 'It is ___ and humid.', answer: 'hot', options: ['hot', 'cold', 'warm', 'cool'] },
    { id: 192, sentence: 'It is ___ and foggy.', answer: 'cold', options: ['cold', 'hot', 'warm', 'cool'] },
    { id: 193, sentence: 'It is ___ and breezy.', answer: 'pleasant', options: ['pleasant', 'hot', 'cold', 'stormy'] },
    { id: 194, sentence: 'It is ___ and stormy.', answer: 'dark', options: ['dark', 'bright', 'cloudy', 'sunny'] },
    { id: 195, sentence: 'It is ___ and clear.', answer: 'sunny', options: ['sunny', 'cloudy', 'rainy', 'snowy'] },
    { id: 196, sentence: 'The ___ is howling.', answer: 'wind', options: ['wind', 'storm', 'rain', 'snow'] },
    { id: 197, sentence: 'The ___ is pouring.', answer: 'rain', options: ['rain', 'snow', 'hail', 'sleet'] },
    { id: 198, sentence: 'The ___ is falling gently.', answer: 'snow', options: ['snow', 'rain', 'hail', 'sleet'] },
    { id: 199, sentence: 'The ___ is shining brightly.', answer: 'sun', options: ['sun', 'moon', 'star', 'light'] },
    { id: 200, sentence: 'The ___ is covering the sky.', answer: 'clouds', options: ['clouds', 'fog', 'mist', 'smoke'] },
  ],
  hard: [
    // Professional Vocabulary (אוצר מילים מקצועי)
    { id: 201, sentence: 'The ___ is analyzing the data.', answer: 'scientist', options: ['scientist', 'teacher', 'doctor', 'lawyer'] },
    { id: 202, sentence: 'The ___ is performing surgery.', answer: 'surgeon', options: ['surgeon', 'nurse', 'doctor', 'dentist'] },
    { id: 203, sentence: 'The ___ is defending the client.', answer: 'lawyer', options: ['lawyer', 'judge', 'police', 'detective'] },
    { id: 204, sentence: 'The ___ is designing a building.', answer: 'architect', options: ['architect', 'engineer', 'builder', 'contractor'] },
    { id: 205, sentence: 'The ___ is programming software.', answer: 'developer', options: ['developer', 'designer', 'analyst', 'manager'] },
    { id: 206, sentence: 'The ___ is managing the project.', answer: 'manager', options: ['manager', 'director', 'supervisor', 'coordinator'] },
    { id: 207, sentence: 'The ___ is teaching mathematics.', answer: 'professor', options: ['professor', 'teacher', 'instructor', 'tutor'] },
    { id: 208, sentence: 'The ___ is conducting research.', answer: 'researcher', options: ['researcher', 'scientist', 'analyst', 'investigator'] },
    { id: 209, sentence: 'The ___ is creating artwork.', answer: 'artist', options: ['artist', 'designer', 'painter', 'sculptor'] },
    { id: 210, sentence: 'The ___ is writing a novel.', answer: 'author', options: ['author', 'writer', 'journalist', 'editor'] },
    
    // Advanced Technology (טכנולוגיה מתקדמת)
    { id: 211, sentence: 'I use a ___ to process data.', answer: 'computer', options: ['computer', 'calculator', 'phone', 'tablet'] },
    { id: 212, sentence: 'The ___ is connecting to the internet.', answer: 'router', options: ['router', 'modem', 'server', 'network'] },
    { id: 213, sentence: 'I store files on the ___.', answer: 'hard drive', options: ['hard drive', 'memory', 'processor', 'motherboard'] },
    { id: 214, sentence: 'The ___ is displaying the image.', answer: 'monitor', options: ['monitor', 'screen', 'display', 'television'] },
    { id: 215, sentence: 'I type on the ___.', answer: 'keyboard', options: ['keyboard', 'mouse', 'touchpad', 'stylus'] },
    { id: 216, sentence: 'The ___ is processing information.', answer: 'processor', options: ['processor', 'memory', 'storage', 'graphics'] },
    { id: 217, sentence: 'I connect devices with a ___.', answer: 'cable', options: ['cable', 'wire', 'cord', 'connection'] },
    { id: 218, sentence: 'The ___ is providing wireless connection.', answer: 'wifi', options: ['wifi', 'bluetooth', 'ethernet', 'cellular'] },
    { id: 219, sentence: 'I use a ___ to scan documents.', answer: 'scanner', options: ['scanner', 'printer', 'copier', 'fax'] },
    { id: 220, sentence: 'The ___ is printing the document.', answer: 'printer', options: ['printer', 'scanner', 'copier', 'fax'] },
    
    // Advanced Science (מדע מתקדם)
    { id: 221, sentence: 'The ___ is studying the stars.', answer: 'astronomer', options: ['astronomer', 'scientist', 'physicist', 'researcher'] },
    { id: 222, sentence: 'The ___ is examining the specimen.', answer: 'microscope', options: ['microscope', 'telescope', 'magnifier', 'lens'] },
    { id: 223, sentence: 'The ___ is measuring temperature.', answer: 'thermometer', options: ['thermometer', 'barometer', 'hygrometer', 'anemometer'] },
    { id: 224, sentence: 'The ___ is analyzing the chemical.', answer: 'laboratory', options: ['laboratory', 'workshop', 'studio', 'office'] },
    { id: 225, sentence: 'The ___ is conducting experiments.', answer: 'scientist', options: ['scientist', 'researcher', 'analyst', 'technician'] },
    { id: 226, sentence: 'The ___ is studying the weather.', answer: 'meteorologist', options: ['meteorologist', 'climatologist', 'geologist', 'biologist'] },
    { id: 227, sentence: 'The ___ is researching the ocean.', answer: 'oceanographer', options: ['oceanographer', 'marine biologist', 'geologist', 'ecologist'] },
    { id: 228, sentence: 'The ___ is studying the earth.', answer: 'geologist', options: ['geologist', 'geographer', 'archaeologist', 'paleontologist'] },
    { id: 229, sentence: 'The ___ is examining the patient.', answer: 'doctor', options: ['doctor', 'nurse', 'surgeon', 'specialist'] },
    { id: 230, sentence: 'The ___ is analyzing the blood.', answer: 'laboratory', options: ['laboratory', 'clinic', 'hospital', 'medical center'] },
    
    // Advanced Business (עסקים מתקדמים)
    { id: 231, sentence: 'The ___ is managing the company.', answer: 'executive', options: ['executive', 'manager', 'director', 'supervisor'] },
    { id: 232, sentence: 'The ___ is analyzing the market.', answer: 'analyst', options: ['analyst', 'researcher', 'consultant', 'advisor'] },
    { id: 233, sentence: 'The ___ is handling the finances.', answer: 'accountant', options: ['accountant', 'bookkeeper', 'auditor', 'financial advisor'] },
    { id: 234, sentence: 'The ___ is selling the product.', answer: 'salesperson', options: ['salesperson', 'marketer', 'representative', 'agent'] },
    { id: 235, sentence: 'The ___ is creating the advertisement.', answer: 'advertiser', options: ['advertiser', 'marketer', 'designer', 'copywriter'] },
    { id: 236, sentence: 'The ___ is managing the inventory.', answer: 'warehouse', options: ['warehouse', 'storage', 'depot', 'facility'] },
    { id: 237, sentence: 'The ___ is processing the order.', answer: 'fulfillment', options: ['fulfillment', 'shipping', 'delivery', 'logistics'] },
    { id: 238, sentence: 'The ___ is handling customer service.', answer: 'representative', options: ['representative', 'agent', 'specialist', 'coordinator'] },
    { id: 239, sentence: 'The ___ is developing the strategy.', answer: 'strategist', options: ['strategist', 'planner', 'consultant', 'advisor'] },
    { id: 240, sentence: 'The ___ is overseeing the operations.', answer: 'supervisor', options: ['supervisor', 'manager', 'director', 'coordinator'] },
    
    // Advanced Medicine (רפואה מתקדמת)
    { id: 241, sentence: 'The ___ is examining the heart.', answer: 'cardiologist', options: ['cardiologist', 'neurologist', 'dermatologist', 'oncologist'] },
    { id: 242, sentence: 'The ___ is studying the brain.', answer: 'neurologist', options: ['neurologist', 'psychiatrist', 'psychologist', 'therapist'] },
    { id: 243, sentence: 'The ___ is treating the skin.', answer: 'dermatologist', options: ['dermatologist', 'cosmetologist', 'aesthetician', 'beautician'] },
    { id: 244, sentence: 'The ___ is caring for children.', answer: 'pediatrician', options: ['pediatrician', 'family doctor', 'general practitioner', 'internist'] },
    { id: 245, sentence: 'The ___ is treating the eyes.', answer: 'ophthalmologist', options: ['ophthalmologist', 'optometrist', 'optician', 'eye doctor'] },
    { id: 246, sentence: 'The ___ is treating the teeth.', answer: 'dentist', options: ['dentist', 'orthodontist', 'oral surgeon', 'dental hygienist'] },
    { id: 247, sentence: 'The ___ is treating the bones.', answer: 'orthopedist', options: ['orthopedist', 'rheumatologist', 'chiropractor', 'physical therapist'] },
    { id: 248, sentence: 'The ___ is treating the mind.', answer: 'psychiatrist', options: ['psychiatrist', 'psychologist', 'therapist', 'counselor'] },
    { id: 249, sentence: 'The ___ is treating cancer.', answer: 'oncologist', options: ['oncologist', 'hematologist', 'radiologist', 'pathologist'] },
    { id: 250, sentence: 'The ___ is treating the elderly.', answer: 'geriatrician', options: ['geriatrician', 'internist', 'family doctor', 'specialist'] },
    
    // Advanced Arts (אמנות מתקדמת)
    { id: 251, sentence: 'The ___ is conducting the orchestra.', answer: 'conductor', options: ['conductor', 'director', 'composer', 'musician'] },
    { id: 252, sentence: 'The ___ is playing the violin.', answer: 'violinist', options: ['violinist', 'pianist', 'guitarist', 'drummer'] },
    { id: 253, sentence: 'The ___ is singing the aria.', answer: 'soprano', options: ['soprano', 'tenor', 'baritone', 'bass'] },
    { id: 254, sentence: 'The ___ is painting the portrait.', answer: 'portraitist', options: ['portraitist', 'landscapist', 'still life painter', 'abstract artist'] },
    { id: 255, sentence: 'The ___ is sculpting the statue.', answer: 'sculptor', options: ['sculptor', 'carver', 'molder', 'artist'] },
    { id: 256, sentence: 'The ___ is directing the film.', answer: 'director', options: ['director', 'producer', 'cinematographer', 'editor'] },
    { id: 257, sentence: 'The ___ is acting in the play.', answer: 'actor', options: ['actor', 'actress', 'performer', 'entertainer'] },
    { id: 258, sentence: 'The ___ is choreographing the dance.', answer: 'choreographer', options: ['choreographer', 'dancer', 'instructor', 'performer'] },
    { id: 259, sentence: 'The ___ is writing the screenplay.', answer: 'screenwriter', options: ['screenwriter', 'playwright', 'novelist', 'poet'] },
    { id: 260, sentence: 'The ___ is designing the set.', answer: 'set designer', options: ['set designer', 'costume designer', 'lighting designer', 'art director'] },
    
    // Advanced Sports (ספורט מתקדם)
    { id: 261, sentence: 'The ___ is coaching the team.', answer: 'coach', options: ['coach', 'manager', 'trainer', 'instructor'] },
    { id: 262, sentence: 'The ___ is refereeing the game.', answer: 'referee', options: ['referee', 'umpire', 'judge', 'official'] },
    { id: 263, sentence: 'The ___ is playing tennis.', answer: 'tennis player', options: ['tennis player', 'golfer', 'swimmer', 'runner'] },
    { id: 264, sentence: 'The ___ is swimming in the pool.', answer: 'swimmer', options: ['swimmer', 'diver', 'water polo player', 'synchronized swimmer'] },
    { id: 265, sentence: 'The ___ is running the marathon.', answer: 'marathon runner', options: ['marathon runner', 'sprinter', 'jogger', 'athlete'] },
    { id: 266, sentence: 'The ___ is playing basketball.', answer: 'basketball player', options: ['basketball player', 'volleyball player', 'handball player', 'athlete'] },
    { id: 267, sentence: 'The ___ is playing soccer.', answer: 'soccer player', options: ['soccer player', 'football player', 'rugby player', 'athlete'] },
    { id: 268, sentence: 'The ___ is playing baseball.', answer: 'baseball player', options: ['baseball player', 'softball player', 'cricket player', 'athlete'] },
    { id: 269, sentence: 'The ___ is playing golf.', answer: 'golfer', options: ['golfer', 'tennis player', 'bowler', 'athlete'] },
    { id: 270, sentence: 'The ___ is playing hockey.', answer: 'hockey player', options: ['hockey player', 'ice skater', 'figure skater', 'athlete'] },
    
    // Advanced Environment (סביבה מתקדמת)
    { id: 271, sentence: 'The ___ is studying climate change.', answer: 'climatologist', options: ['climatologist', 'meteorologist', 'environmentalist', 'ecologist'] },
    { id: 272, sentence: 'The ___ is protecting wildlife.', answer: 'conservationist', options: ['conservationist', 'environmentalist', 'ecologist', 'biologist'] },
    { id: 273, sentence: 'The ___ is studying ecosystems.', answer: 'ecologist', options: ['ecologist', 'biologist', 'environmentalist', 'conservationist'] },
    { id: 274, sentence: 'The ___ is researching pollution.', answer: 'environmental scientist', options: ['environmental scientist', 'chemist', 'biologist', 'engineer'] },
    { id: 275, sentence: 'The ___ is studying marine life.', answer: 'marine biologist', options: ['marine biologist', 'oceanographer', 'aquarist', 'fisheries biologist'] },
    { id: 276, sentence: 'The ___ is analyzing water quality.', answer: 'hydrologist', options: ['hydrologist', 'oceanographer', 'environmental engineer', 'chemist'] },
    { id: 277, sentence: 'The ___ is studying soil composition.', answer: 'soil scientist', options: ['soil scientist', 'geologist', 'agricultural scientist', 'environmental scientist'] },
    { id: 278, sentence: 'The ___ is researching renewable energy.', answer: 'energy researcher', options: ['energy researcher', 'engineer', 'scientist', 'technologist'] },
    { id: 279, sentence: 'The ___ is studying air quality.', answer: 'atmospheric scientist', options: ['atmospheric scientist', 'meteorologist', 'climatologist', 'environmental scientist'] },
    { id: 280, sentence: 'The ___ is protecting endangered species.', answer: 'wildlife biologist', options: ['wildlife biologist', 'conservationist', 'ecologist', 'zoologist'] },
    
    // Advanced Literature (ספרות מתקדמת)
    { id: 281, sentence: 'The ___ is writing poetry.', answer: 'poet', options: ['poet', 'novelist', 'playwright', 'essayist'] },
    { id: 282, sentence: 'The ___ is writing a novel.', answer: 'novelist', options: ['novelist', 'poet', 'playwright', 'essayist'] },
    { id: 283, sentence: 'The ___ is writing a play.', answer: 'playwright', options: ['playwright', 'screenwriter', 'novelist', 'poet'] },
    { id: 284, sentence: 'The ___ is writing an essay.', answer: 'essayist', options: ['essayist', 'journalist', 'critic', 'columnist'] },
    { id: 285, sentence: 'The ___ is writing a biography.', answer: 'biographer', options: ['biographer', 'historian', 'memoirist', 'autobiographer'] },
    { id: 286, sentence: 'The ___ is writing a memoir.', answer: 'memoirist', options: ['memoirist', 'biographer', 'autobiographer', 'historian'] },
    { id: 287, sentence: 'The ___ is writing a critique.', answer: 'critic', options: ['critic', 'reviewer', 'analyst', 'commentator'] },
    { id: 288, sentence: 'The ___ is writing a column.', answer: 'columnist', options: ['columnist', 'journalist', 'reporter', 'correspondent'] },
    { id: 289, sentence: 'The ___ is writing a report.', answer: 'reporter', options: ['reporter', 'journalist', 'correspondent', 'investigator'] },
    { id: 290, sentence: 'The ___ is writing a review.', answer: 'reviewer', options: ['reviewer', 'critic', 'analyst', 'evaluator'] },
    
    // Advanced History (היסטוריה מתקדמת)
    { id: 291, sentence: 'The ___ is studying ancient civilizations.', answer: 'archaeologist', options: ['archaeologist', 'historian', 'anthropologist', 'paleontologist'] },
    { id: 292, sentence: 'The ___ is researching historical documents.', answer: 'historian', options: ['historian', 'archaeologist', 'researcher', 'scholar'] },
    { id: 293, sentence: 'The ___ is studying human cultures.', answer: 'anthropologist', options: ['anthropologist', 'sociologist', 'ethnologist', 'cultural researcher'] },
    { id: 294, sentence: 'The ___ is studying ancient fossils.', answer: 'paleontologist', options: ['paleontologist', 'archaeologist', 'geologist', 'biologist'] },
    { id: 295, sentence: 'The ___ is studying ancient artifacts.', answer: 'archaeologist', options: ['archaeologist', 'historian', 'anthropologist', 'curator'] },
    { id: 296, sentence: 'The ___ is studying ancient texts.', answer: 'philologist', options: ['philologist', 'linguist', 'historian', 'scholar'] },
    { id: 297, sentence: 'The ___ is studying ancient languages.', answer: 'linguist', options: ['linguist', 'philologist', 'translator', 'interpreter'] },
    { id: 298, sentence: 'The ___ is studying ancient art.', answer: 'art historian', options: ['art historian', 'curator', 'critic', 'scholar'] },
    { id: 299, sentence: 'The ___ is studying ancient music.', answer: 'musicologist', options: ['musicologist', 'composer', 'musician', 'scholar'] },
    { id: 300, sentence: 'The ___ is studying ancient philosophy.', answer: 'philosopher', options: ['philosopher', 'theologian', 'scholar', 'thinker'] },
  ]
};

const DIFFICULTIES = [
  { key: 'easy', label: 'קל', count: 20 },
  { key: 'medium', label: 'בינוני', count: 20 },
  { key: 'hard', label: 'קשה', count: 20 },
];

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

const allWords = Array.from(new Set(Object.values(QUESTION_BANK).flat().map(q => q.answer)));

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
  const [time, setTime] = useState(0);
  const [finished, setFinished] = useState(false);
  const [started, setStarted] = useState(false);
  const [feedback, setFeedback] = useState<{ correct: boolean, answer: string } | null>(null);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState(false);
  
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);

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

  useEffect(() => {
    if (started) {
        const diffConfig = DIFFICULTIES.find(d => d.key === difficulty)!;
        setQuestions(pickQuestions(QUESTION_BANK, difficulty, diffConfig.count));
        setCurrentQuestionIndex(0);
        setScore(0);
        setTime(0);
        setFinished(false);
        setSelectedOption(null);
        setFeedback(null);
        setShowHint(false);
    }
  }, [started, difficulty]);

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

  const handleSelect = async (option: string) => {
    if (feedback) return;

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.answer;
    
    setFeedback({ correct: isCorrect, answer: currentQuestion.answer });
    setScore(prev => prev + (isCorrect ? 10 : -2));
    setSelectedOption(option);

    if (isCorrect) {
      successAudio.current?.play();
    } else {
      addMistake(currentQuestion.id);
      failAudio.current?.play();
    }

    setTimeout(async () => {
      setFeedback(null);
      setSelectedOption(null);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setFinished(true);
        if (user) {
          try {
            await fetch('/api/games/update-stats', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: user.id,
                gameName: 'FillInTheBlanks',
                score,
                time,
              }),
            });
          } catch (error) {
            console.error('Failed to update game stats:', error);
          }
        }
      }
    }, 1500);
  };

  const restart = () => {
    setStarted(false);
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
  
  if (!started) {
  return (
      <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-green-100 flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-blue-700 mb-4 drop-shadow-lg">השלמת מילים</h1>
          <p className="text-xl text-gray-600 mb-8">בחר את המילה הנכונה להשלמת המשפט.</p>
          <button
            onClick={startGame}
            className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-green-500 hover:to-blue-600 transition-transform transform hover:scale-105"
          >
            התחל משחק
          </button>
        </div>
      </main>
    );
  }

  if (finished) {
    const accuracy = score > 0 ? score / (questions.length * 10) : 0;
    let medal, label;
    if (accuracy >= 0.9) { medal = '🥇'; label = 'מצוין!'; }
    else if (accuracy >= 0.7) { medal = '🥈'; label = 'כל הכבוד!'; }
    else if (accuracy > 0.4) { medal = '🥉'; label = 'יפה מאוד!'; }
    else { medal = '🤔'; label = 'אפשר להשתפר!'; }

    return (
      <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-blue-100 to-green-100 flex flex-col items-center justify-center p-4">
        <div className="text-center bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8 max-w-lg w-full">
          <h2 className="text-4xl font-extrabold text-blue-700 mb-4">המשחק הסתיים!</h2>
          <div className="text-6xl mb-4">{medal}</div>
          <div className="text-2xl font-bold text-blue-700">{label}</div>
          <div className="text-lg font-bold text-blue-700 my-4">ניקוד סופי: {score} | זמן: {time} שניות</div>
          <div className="flex gap-4 justify-center mt-6">
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
                setTime(0);
                setSelectedOption(null);
                setFeedback(null);
                setShowHint(false);
              }}
              className="bg-gradient-to-r from-purple-400 to-pink-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-purple-500 hover:to-pink-600 transition-transform transform hover:scale-105"
            >
              משחק חדש
            </button>
          </div>
        </div>
      </main>
    );
  }

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  return (
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
                <button
                    key={index}
                  onClick={() => handleSelect(option)}
                    className={`px-6 py-3 rounded-xl font-bold text-lg shadow transition-all duration-200 disabled:opacity-70 disabled:transform-none ${
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
              ))}
            </div>

                {feedback && !feedback.correct && (
                <div className="text-center mt-4 animate-fade-in">
                    <span className="inline-block bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow">
                        התשובה הנכונה: {feedback.answer}
                  </span>
                </div>
                )}
            </div>
          </div>
        )}
    </main>
  );
} 