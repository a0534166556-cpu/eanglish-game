"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import useAuthUser from '@/lib/useAuthUser';
import AdManager from "@/app/components/ads/AdManager";

interface TrueFalseQuestion {
  id: number;
  lang: string;
  text: string;
  answer: boolean;
  explanation?: string;
}

const QUESTIONS: TrueFalseQuestion[] = [
  // English
  { id: 1, lang: "en", text: "The sky is blue.", answer: true, explanation: "The sky appears blue due to the scattering of sunlight." },
  { id: 2, lang: "en", text: "Cats can fly.", answer: false, explanation: "Cats cannot fly; they do not have wings." },
  { id: 3, lang: "en", text: "Fish live in water.", answer: true, explanation: "Fish are aquatic animals and live in water." },
  { id: 4, lang: "en", text: "The sun is cold.", answer: false, explanation: "The sun is very hot, not cold." },
  { id: 5, lang: "en", text: "Birds have wings.", answer: true, explanation: "Birds have wings to help them fly." },
  { id: 6, lang: "en", text: "Dogs say meow.", answer: false, explanation: "Dogs bark; cats say meow." },
  { id: 7, lang: "en", text: "Milk is white.", answer: true, explanation: "Milk is usually white in color." },
  { id: 8, lang: "en", text: "Books are for eating.", answer: false, explanation: "Books are for reading, not eating." },
  { id: 9, lang: "en", text: "Bananas are yellow.", answer: true, explanation: "Bananas are yellow when ripe." },
  { id: 10, lang: "en", text: "Cars swim in the sea.", answer: false, explanation: "Cars cannot swim; they drive on roads." },
  { id: 11, lang: "en", text: "Winter is hot.", answer: false, explanation: "Winter is usually cold." },
  { id: 12, lang: "en", text: "The moon shines at night.", answer: true, explanation: "The moon is visible and shines at night." },
  { id: 13, lang: "en", text: "Apples are a fruit.", answer: true, explanation: "Apples are a type of fruit." },
  { id: 14, lang: "en", text: "Dogs can talk.", answer: false, explanation: "Dogs cannot talk like humans." },
  { id: 15, lang: "en", text: "Water is wet.", answer: true, explanation: "Water is considered wet because it is a liquid." },
  { id: 16, lang: "en", text: "Fire is cold.", answer: false, explanation: "Fire is hot, not cold." },
  { id: 17, lang: "en", text: "The earth is round.", answer: true, explanation: "The earth is round in shape." },
  { id: 18, lang: "en", text: "Fish can walk on land.", answer: false, explanation: "Fish cannot walk on land; they swim in water." },
  { id: 19, lang: "en", text: "Grass is green.", answer: true, explanation: "Grass is green in color." },
  { id: 20, lang: "en", text: "Eggs grow on trees.", answer: false, explanation: "Eggs do not grow on trees; they come from animals." },
  
  // Easy level - Additional questions (21-40)
  { id: 21, lang: "en", text: "Cats can swim.", answer: true, explanation: "Cats can swim, though they generally don't like water." },
  { id: 22, lang: "en", text: "The moon is made of cheese.", answer: false, explanation: "The moon is made of rock and dust, not cheese." },
  { id: 23, lang: "en", text: "Birds can fly.", answer: true, explanation: "Most birds can fly, though some cannot." },
  { id: 24, lang: "en", text: "Fish live on land.", answer: false, explanation: "Fish live in water, not on land." },
  { id: 25, lang: "en", text: "The sun is a star.", answer: true, explanation: "The sun is indeed a star, the closest one to Earth." },
  { id: 26, lang: "en", text: "Dogs can talk.", answer: false, explanation: "Dogs cannot talk like humans, though they can make sounds." },
  { id: 27, lang: "en", text: "Apples are red.", answer: true, explanation: "Many apples are red, though they can be other colors too." },
  { id: 28, lang: "en", text: "Cars can fly.", answer: false, explanation: "Cars cannot fly; they drive on roads." },
  { id: 29, lang: "en", text: "Water is wet.", answer: true, explanation: "Water is considered wet because it is a liquid." },
  { id: 30, lang: "en", text: "Books can eat.", answer: false, explanation: "Books cannot eat; they are inanimate objects." },
  { id: 31, lang: "en", text: "The sky is blue.", answer: true, explanation: "The sky appears blue due to the scattering of sunlight." },
  { id: 32, lang: "en", text: "Trees can walk.", answer: false, explanation: "Trees cannot walk; they are rooted in the ground." },
  { id: 33, lang: "en", text: "Birds have feathers.", answer: true, explanation: "Birds have feathers which help them fly and stay warm." },
  { id: 34, lang: "en", text: "Fish can breathe air.", answer: false, explanation: "Fish breathe through gills in water, not air." },
  { id: 35, lang: "en", text: "The earth is round.", answer: true, explanation: "The earth is round in shape, like a ball." },
  { id: 36, lang: "en", text: "Cats can bark.", answer: false, explanation: "Cats meow; dogs bark." },
  { id: 37, lang: "en", text: "Flowers are beautiful.", answer: true, explanation: "Flowers are generally considered beautiful." },
  { id: 38, lang: "en", text: "Cars can swim.", answer: false, explanation: "Cars cannot swim; they would sink in water." },
  { id: 39, lang: "en", text: "The moon shines at night.", answer: true, explanation: "The moon is visible and shines at night." },
  { id: 40, lang: "en", text: "Books can fly.", answer: false, explanation: "Books cannot fly; they are inanimate objects." },
  
  // Medium level - Additional questions (41-60)
  { id: 41, lang: "en", text: "Dolphins are mammals.", answer: true, explanation: "Dolphins are mammals that live in water." },
  { id: 42, lang: "en", text: "Sharks are fish.", answer: true, explanation: "Sharks are a type of fish, not mammals." },
  { id: 43, lang: "en", text: "Bats are birds.", answer: false, explanation: "Bats are mammals, not birds." },
  { id: 44, lang: "en", text: "Penguins can fly.", answer: false, explanation: "Penguins cannot fly; they swim instead." },
  { id: 45, lang: "en", text: "Whales are fish.", answer: false, explanation: "Whales are mammals, not fish." },
  { id: 46, lang: "en", text: "Snakes have legs.", answer: false, explanation: "Snakes do not have legs; they slither." },
  { id: 47, lang: "en", text: "Frogs can jump.", answer: true, explanation: "Frogs are known for their ability to jump." },
  { id: 48, lang: "en", text: "Spiders are insects.", answer: false, explanation: "Spiders are arachnids, not insects." },
  { id: 49, lang: "en", text: "Butterflies can fly.", answer: true, explanation: "Butterflies can fly with their colorful wings." },
  { id: 50, lang: "en", text: "Ants can lift heavy objects.", answer: true, explanation: "Ants can lift objects much heavier than themselves." },
  { id: 51, lang: "en", text: "Bees make honey.", answer: true, explanation: "Bees collect nectar and make honey." },
  { id: 52, lang: "en", text: "Crocodiles are reptiles.", answer: true, explanation: "Crocodiles are large reptiles that live in water." },
  { id: 53, lang: "en", text: "Turtles can fly.", answer: false, explanation: "Turtles cannot fly; they walk or swim." },
  { id: 54, lang: "en", text: "Lions are herbivores.", answer: false, explanation: "Lions are carnivores; they eat meat." },
  { id: 55, lang: "en", text: "Elephants are the largest land animals.", answer: true, explanation: "Elephants are the largest land animals on Earth." },
  { id: 56, lang: "en", text: "Giraffes have long necks.", answer: true, explanation: "Giraffes are known for their very long necks." },
  { id: 57, lang: "en", text: "Monkeys can climb trees.", answer: true, explanation: "Monkeys are excellent climbers and live in trees." },
  { id: 58, lang: "en", text: "Rabbits can fly.", answer: false, explanation: "Rabbits cannot fly; they hop on the ground." },
  { id: 59, lang: "en", text: "Bears hibernate in winter.", answer: true, explanation: "Many bears hibernate during the winter months." },
  { id: 60, lang: "en", text: "Fish can live without water.", answer: false, explanation: "Fish need water to survive; they cannot live without it." },
  
  // Hard level - Additional questions (61-80)
  { id: 61, lang: "en", text: "The human brain contains approximately 86 billion neurons.", answer: true, explanation: "The human brain has about 86 billion neurons." },
  { id: 62, lang: "en", text: "Light travels faster than sound.", answer: true, explanation: "Light travels much faster than sound." },
  { id: 63, lang: "en", text: "The Great Wall of China is visible from space.", answer: false, explanation: "The Great Wall is not visible from space with the naked eye." },
  { id: 64, lang: "en", text: "The human body is made up of about 60% water.", answer: true, explanation: "The human body is approximately 60% water." },
  { id: 65, lang: "en", text: "Sharks can get cancer.", answer: true, explanation: "Sharks can get cancer, contrary to popular belief." },
  { id: 66, lang: "en", text: "The Earth is the only planet with water.", answer: false, explanation: "Other planets and moons also have water." },
  { id: 67, lang: "en", text: "The human heart has four chambers.", answer: true, explanation: "The human heart has four chambers: two atria and two ventricles." },
  { id: 68, lang: "en", text: "Goldfish have a memory span of only 3 seconds.", answer: false, explanation: "Goldfish can remember things for much longer than 3 seconds." },
  { id: 69, lang: "en", text: "The speed of light is approximately 300,000 km/s.", answer: true, explanation: "Light travels at about 300,000 kilometers per second." },
  { id: 70, lang: "en", text: "Humans use only 10% of their brain.", answer: false, explanation: "Humans use all parts of their brain, not just 10%." },
  { id: 71, lang: "en", text: "The human body has 206 bones.", answer: true, explanation: "An adult human body has 206 bones." },
  { id: 72, lang: "en", text: "Bats are blind.", answer: false, explanation: "Bats can see, though they also use echolocation." },
  { id: 73, lang: "en", text: "The human eye can distinguish about 10 million colors.", answer: true, explanation: "The human eye can distinguish approximately 10 million different colors." },
  { id: 74, lang: "en", text: "Sharks must keep swimming to breathe.", answer: true, explanation: "Most sharks must keep swimming to pass water over their gills." },
  { id: 75, lang: "en", text: "The human brain weighs about 3 pounds.", answer: true, explanation: "The average human brain weighs about 3 pounds." },
  { id: 76, lang: "en", text: "All spiders spin webs.", answer: false, explanation: "Not all spiders spin webs; some hunt without webs." },
  { id: 77, lang: "en", text: "The human body produces about 25,000 quarts of saliva in a lifetime.", answer: true, explanation: "The human body produces approximately 25,000 quarts of saliva over a lifetime." },
  { id: 78, lang: "en", text: "Octopuses have three hearts.", answer: true, explanation: "Octopuses have three hearts: two pump blood to the gills, one to the body." },
  { id: 79, lang: "en", text: "The human body has more bacteria cells than human cells.", answer: true, explanation: "The human body has more bacterial cells than human cells." },
  { id: 80, lang: "en", text: "All birds can fly.", answer: false, explanation: "Not all birds can fly; penguins, ostriches, and kiwis cannot fly." },
  
  // Easy level - More questions (81-120)
  { id: 81, lang: "en", text: "Cats can see in the dark.", answer: true, explanation: "Cats have excellent night vision and can see in low light conditions." },
  { id: 82, lang: "en", text: "The moon is bigger than the sun.", answer: false, explanation: "The sun is much larger than the moon; the moon only appears larger because it's closer." },
  { id: 83, lang: "en", text: "Dogs can smell better than humans.", answer: true, explanation: "Dogs have a much stronger sense of smell than humans." },
  { id: 84, lang: "en", text: "Fish can breathe underwater.", answer: true, explanation: "Fish have gills that allow them to extract oxygen from water." },
  { id: 85, lang: "en", text: "The earth is flat.", answer: false, explanation: "The earth is round, not flat." },
  { id: 86, lang: "en", text: "Birds have feathers.", answer: true, explanation: "All birds have feathers, which help them fly and stay warm." },
  { id: 87, lang: "en", text: "Cars can fly.", answer: false, explanation: "Cars cannot fly; they drive on roads." },
  { id: 88, lang: "en", text: "The sun is hot.", answer: true, explanation: "The sun is extremely hot, with surface temperatures of about 5,500°C." },
  { id: 89, lang: "en", text: "Books can talk.", answer: false, explanation: "Books cannot talk; they are inanimate objects." },
  { id: 90, lang: "en", text: "Trees can grow very tall.", answer: true, explanation: "Some trees can grow to be over 100 meters tall." },
  { id: 91, lang: "en", text: "The ocean is made of milk.", answer: false, explanation: "The ocean is made of saltwater, not milk." },
  { id: 92, lang: "en", text: "Flowers are beautiful.", answer: true, explanation: "Flowers are generally considered beautiful by most people." },
  { id: 93, lang: "en", text: "Cars can swim.", answer: false, explanation: "Cars cannot swim; they would sink in water." },
  { id: 94, lang: "en", text: "The moon shines at night.", answer: true, explanation: "The moon is visible and reflects sunlight at night." },
  { id: 95, lang: "en", text: "Books can eat.", answer: false, explanation: "Books cannot eat; they are inanimate objects." },
  { id: 96, lang: "en", text: "The sky is blue during the day.", answer: true, explanation: "The sky appears blue during the day due to the scattering of sunlight." },
  { id: 97, lang: "en", text: "Cats can bark.", answer: false, explanation: "Cats meow; dogs bark." },
  { id: 98, lang: "en", text: "The grass is green.", answer: true, explanation: "Grass is typically green in color." },
  { id: 99, lang: "en", text: "Cars can walk.", answer: false, explanation: "Cars cannot walk; they have wheels and drive." },
  { id: 100, lang: "en", text: "The stars twinkle at night.", answer: true, explanation: "Stars appear to twinkle due to atmospheric turbulence." },
  { id: 101, lang: "en", text: "Books can fly.", answer: false, explanation: "Books cannot fly; they are inanimate objects." },
  { id: 102, lang: "en", text: "The wind can blow.", answer: true, explanation: "Wind is moving air that can blow objects around." },
  { id: 103, lang: "en", text: "Cats can swim like fish.", answer: false, explanation: "Cats can swim but not as well as fish." },
  { id: 104, lang: "en", text: "The rain falls from clouds.", answer: true, explanation: "Rain forms in clouds and falls to the ground." },
  { id: 105, lang: "en", text: "Books can grow.", answer: false, explanation: "Books cannot grow; they are inanimate objects." },
  { id: 106, lang: "en", text: "The snow is white.", answer: true, explanation: "Snow is typically white in color." },
  { id: 107, lang: "en", text: "Cats can talk like humans.", answer: false, explanation: "Cats cannot talk like humans; they communicate through sounds and body language." },
  { id: 108, lang: "en", text: "The ice is cold.", answer: true, explanation: "Ice is frozen water and is cold to the touch." },
  { id: 109, lang: "en", text: "Books can run.", answer: false, explanation: "Books cannot run; they are inanimate objects." },
  { id: 110, lang: "en", text: "The fire is hot.", answer: true, explanation: "Fire produces heat and is hot to the touch." },
  { id: 111, lang: "en", text: "Cats can fly like birds.", answer: false, explanation: "Cats cannot fly; they don't have wings." },
  { id: 112, lang: "en", text: "The water is wet.", answer: true, explanation: "Water is a liquid and feels wet to the touch." },
  { id: 113, lang: "en", text: "Books can jump.", answer: false, explanation: "Books cannot jump; they are inanimate objects." },
  { id: 114, lang: "en", text: "The sun rises in the east.", answer: true, explanation: "The sun appears to rise in the east due to Earth's rotation." },
  { id: 115, lang: "en", text: "Cats can breathe underwater.", answer: false, explanation: "Cats cannot breathe underwater; they need air to breathe." },
  { id: 116, lang: "en", text: "The moon orbits the earth.", answer: true, explanation: "The moon orbits around the earth approximately every 27 days." },
  { id: 117, lang: "en", text: "Books can see.", answer: false, explanation: "Books cannot see; they are inanimate objects." },
  { id: 118, lang: "en", text: "The earth orbits the sun.", answer: true, explanation: "The earth orbits around the sun once every 365 days." },
  { id: 119, lang: "en", text: "Cats can live forever.", answer: false, explanation: "Cats cannot live forever; they have a natural lifespan." },
  { id: 120, lang: "en", text: "The stars are very far away.", answer: true, explanation: "Stars are extremely far away, many light-years from Earth." },
  
  // Medium level - More questions (121-140)
  { id: 121, lang: "en", text: "Dolphins are intelligent animals.", answer: true, explanation: "Dolphins are known for their high intelligence and problem-solving abilities." },
  { id: 122, lang: "en", text: "Sharks are mammals.", answer: false, explanation: "Sharks are fish, not mammals." },
  { id: 123, lang: "en", text: "Bats are the only flying mammals.", answer: true, explanation: "Bats are the only mammals capable of true flight." },
  { id: 124, lang: "en", text: "Penguins can fly.", answer: false, explanation: "Penguins cannot fly; they swim instead." },
  { id: 125, lang: "en", text: "Whales are the largest animals on Earth.", answer: true, explanation: "Blue whales are the largest animals that have ever lived on Earth." },
  { id: 126, lang: "en", text: "Snakes have legs.", answer: false, explanation: "Snakes do not have legs; they move by slithering." },
  { id: 127, lang: "en", text: "Frogs can live both in water and on land.", answer: true, explanation: "Frogs are amphibians that can live in both aquatic and terrestrial environments." },
  { id: 128, lang: "en", text: "Spiders have six legs.", answer: false, explanation: "Spiders have eight legs, not six." },
  { id: 129, lang: "en", text: "Butterflies undergo metamorphosis.", answer: true, explanation: "Butterflies go through complete metamorphosis from caterpillar to adult." },
  { id: 130, lang: "en", text: "Ants can lift objects heavier than themselves.", answer: true, explanation: "Ants can lift objects up to 50 times their own body weight." },
  { id: 131, lang: "en", text: "Bees make honey from flowers.", answer: true, explanation: "Bees collect nectar from flowers and convert it into honey." },
  { id: 132, lang: "en", text: "Crocodiles are warm-blooded.", answer: false, explanation: "Crocodiles are cold-blooded reptiles." },
  { id: 133, lang: "en", text: "Turtles can live for over 100 years.", answer: true, explanation: "Some turtle species can live for over 100 years." },
  { id: 134, lang: "en", text: "Lions are herbivores.", answer: false, explanation: "Lions are carnivores; they eat meat." },
  { id: 135, lang: "en", text: "Elephants have excellent memories.", answer: true, explanation: "Elephants are known for their exceptional memory and intelligence." },
  { id: 136, lang: "en", text: "Giraffes have the same number of neck vertebrae as humans.", answer: true, explanation: "Giraffes have 7 neck vertebrae, the same as humans." },
  { id: 137, lang: "en", text: "Monkeys are primates.", answer: true, explanation: "Monkeys are indeed primates, along with apes and humans." },
  { id: 138, lang: "en", text: "Rabbits can fly.", answer: false, explanation: "Rabbits cannot fly; they hop on the ground." },
  { id: 139, lang: "en", text: "Bears hibernate during winter.", answer: true, explanation: "Many bear species hibernate during the winter months." },
  { id: 140, lang: "en", text: "Fish can live without water.", answer: false, explanation: "Fish need water to survive; they cannot live without it." },
  
  // Hard level - More questions (141-160)
  { id: 141, lang: "en", text: "The human brain contains approximately 86 billion neurons.", answer: true, explanation: "The human brain has about 86 billion neurons." },
  { id: 142, lang: "en", text: "Light travels faster than sound.", answer: true, explanation: "Light travels much faster than sound in air." },
  { id: 143, lang: "en", text: "The Great Wall of China is visible from space.", answer: false, explanation: "The Great Wall is not visible from space with the naked eye." },
  { id: 144, lang: "en", text: "The human body is made up of about 60% water.", answer: true, explanation: "The human body is approximately 60% water by weight." },
  { id: 145, lang: "en", text: "Sharks can get cancer.", answer: true, explanation: "Sharks can get cancer, contrary to popular belief." },
  { id: 146, lang: "en", text: "The Earth is the only planet with water.", answer: false, explanation: "Other planets and moons also have water in various forms." },
  { id: 147, lang: "en", text: "The human heart has four chambers.", answer: true, explanation: "The human heart has four chambers: two atria and two ventricles." },
  { id: 148, lang: "en", text: "Goldfish have a memory span of only 3 seconds.", answer: false, explanation: "Goldfish can remember things for much longer than 3 seconds." },
  { id: 149, lang: "en", text: "The speed of light is approximately 300,000 km/s.", answer: true, explanation: "Light travels at about 300,000 kilometers per second in a vacuum." },
  { id: 150, lang: "en", text: "Humans use only 10% of their brain.", answer: false, explanation: "Humans use all parts of their brain, not just 10%." },
  { id: 151, lang: "en", text: "The human body has 206 bones.", answer: true, explanation: "An adult human body has 206 bones." },
  { id: 152, lang: "en", text: "Bats are blind.", answer: false, explanation: "Bats can see, though they also use echolocation." },
  { id: 153, lang: "en", text: "The human eye can distinguish about 10 million colors.", answer: true, explanation: "The human eye can distinguish approximately 10 million different colors." },
  { id: 154, lang: "en", text: "Sharks must keep swimming to breathe.", answer: true, explanation: "Most sharks must keep swimming to pass water over their gills." },
  { id: 155, lang: "en", text: "The human brain weighs about 3 pounds.", answer: true, explanation: "The average human brain weighs about 3 pounds (1.4 kg)." },
  { id: 156, lang: "en", text: "All spiders spin webs.", answer: false, explanation: "Not all spiders spin webs; some hunt without webs." },
  { id: 157, lang: "en", text: "The human body produces about 25,000 quarts of saliva in a lifetime.", answer: true, explanation: "The human body produces approximately 25,000 quarts of saliva over a lifetime." },
  { id: 158, lang: "en", text: "Octopuses have three hearts.", answer: true, explanation: "Octopuses have three hearts: two pump blood to the gills, one to the body." },
  { id: 159, lang: "en", text: "The human body has more bacteria cells than human cells.", answer: true, explanation: "The human body has more bacterial cells than human cells." },
  { id: 160, lang: "en", text: "All birds can fly.", answer: false, explanation: "Not all birds can fly; penguins, ostriches, and kiwis cannot fly." },
  
  // Hebrew
  { id: 101, lang: "he", text: "השמים כחולים.", answer: true, explanation: "השמים נראים כחולים בגלל פיזור אור השמש." },
  { id: 102, lang: "he", text: "חתולים יכולים לעוף.", answer: false, explanation: "חתולים לא יכולים לעוף; אין להם כנפיים." },
  { id: 103, lang: "he", text: "דגים חיים במים.", answer: true, explanation: "דגים הם חיות מים וחיים במים." },
  { id: 104, lang: "he", text: "השמש קרה.", answer: false, explanation: "השמש חמה מאוד, לא קרה." },
  { id: 105, lang: "he", text: "לציפורים יש כנפיים.", answer: true, explanation: "לציפורים יש כנפיים כדי לעוף." },
  { id: 106, lang: "he", text: "כלבים אומרים מיאו.", answer: false, explanation: "כלבים נובחים; חתולים אומרים מיאו." },
  { id: 107, lang: "he", text: "החלב לבן.", answer: true, explanation: "החלב בדרך כלל לבן." },
  { id: 108, lang: "he", text: "ספרים מיועדים לאכילה.", answer: false, explanation: "ספרים מיועדים לקריאה, לא לאכילה." },
  { id: 109, lang: "he", text: "בננות צהובות.", answer: true, explanation: "בננות צהובות כשהן בשלות." },
  { id: 110, lang: "he", text: "מכוניות שוחות בים.", answer: false, explanation: "מכוניות לא שוחות; הן נוסעות על כבישים." },
  { id: 111, lang: "he", text: "החורף חם.", answer: false, explanation: "החורף בדרך כלל קר." },
  { id: 112, lang: "he", text: "הירח זורח בלילה.", answer: true, explanation: "הירח נראה וזורח בלילה." },
  { id: 113, lang: "he", text: "תפוחים הם פרי.", answer: true, explanation: "תפוחים הם סוג של פרי." },
  { id: 114, lang: "he", text: "כלבים יכולים לדבר.", answer: false, explanation: "כלבים לא יכולים לדבר כמו בני אדם." },
  { id: 115, lang: "he", text: "המים רטובים.", answer: true, explanation: "המים נחשבים רטובים כי הם נוזל." },
  { id: 116, lang: "he", text: "האש קרה.", answer: false, explanation: "האש חמה, לא קרה." },
  { id: 117, lang: "he", text: "העולם עגול.", answer: true, explanation: "העולם עגול בצורתו." },
  { id: 118, lang: "he", text: "דגים הולכים על היבשה.", answer: false, explanation: "דגים לא הולכים על היבשה; הם שוחים במים." },
  { id: 119, lang: "he", text: "הדשא ירוק.", answer: true, explanation: "הדשא ירוק בצבעו." },
  { id: 120, lang: "he", text: "ביצים גדלות על עצים.", answer: false, explanation: "ביצים לא גדלות על עצים; הן מגיעות מבעלי חיים." },
];

const difficulties = [
  { key: "easy", label: "קל", count: 10 },
  { key: "medium", label: "בינוני", count: 15 },
  { key: "hard", label: "קשה", count: 20 },
];

const levelMap: Record<string, string> = {
  beginner: 'easy',
  intermediate: 'medium',
  advanced: 'hard',
  extreme: 'hard',
  easy: 'easy',
  medium: 'medium',
  hard: 'hard',
};

// 1. אלגוריתם תגבור חכם
function getMistakeStats(): Record<number, number> {
  try {
    return JSON.parse(localStorage.getItem('tf-mistakes') || '{}');
  } catch {
    return {};
  }
}
function addMistake(id: number) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('tf-mistakes', JSON.stringify(stats));
}
function pickQuestions(all: TrueFalseQuestion[], lang: string, count: number): TrueFalseQuestion[] {
  const pool = all.filter((q) => q.lang === lang);
  const stats = getMistakeStats();
  
  // מערבב את כל השאלות כדי לקבל שאלות שונות בכל פעם
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  
  // לוקח רק כמה שאלות עם שגיאות (אם יש)
  const mistakeQuestions = shuffledPool.filter((q) => stats[q.id] > 0);
  const boostedCount = Math.min(3, mistakeQuestions.length); // רק 3 שאלות עם שגיאות
  const boosted = mistakeQuestions.slice(0, boostedCount);

  // לוקח שאלות אקראיות מהשאר
  const remainingQuestions = shuffledPool.filter((q) => !boosted.includes(q));
  const randomRest = remainingQuestions.slice(0, count - boosted.length);
  
  // מערבב הכל יחד
  return [...boosted, ...randomRest].sort(() => Math.random() - 0.5);
}

export default function TrueFalseWrapper() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <TrueFalse />
    </Suspense>
  );
}

function TrueFalse() {
  const { user } = useAuthUser();
  const searchParams = useSearchParams();
  const levelParam = searchParams?.get('level') || 'easy';
  const mappedLevel = levelMap[levelParam] || 'easy';
  const [difficulty] = useState(mappedLevel);
  const [lang, setLang] = useState<'en' | 'he'>('en');
  const [questions, setQuestions] = useState<typeof QUESTIONS>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState(false);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  useEffect(() => {
    const diff = difficulties.find((d) => d.key === difficulty)!;
    // Filter questions by difficulty level
    const levelQuestions = QUESTIONS.filter(q => {
      if (difficulty === 'easy') return q.id >= 1 && q.id <= 120;
      if (difficulty === 'medium') return q.id >= 121 && q.id <= 140;
      if (difficulty === 'hard') return q.id >= 141 && q.id <= 160;
      return true; // fallback
    });
    setQuestions(pickQuestions(levelQuestions, lang, diff.count));
    setCurrent(0);
    setScore(0);
    setTimer(0);
    setFinished(false);
    setFeedback(null);
    setStarted(false);
    setSelected(null);
    setShowHint(false);
  }, [difficulty, lang]);

  useEffect(() => {
    // Load inventory from shop
    try {
      const inv = JSON.parse(localStorage.getItem('quiz-inventory') || '{}');
      setInventory(inv);
    } catch {}
  }, []);

  const handleSelect = (ans: boolean) => {
    setSelected(ans);
    const isCorrect = ans === questions[current].answer;
    setFeedback(isCorrect ? 'נכון!' : 'לא נכון');
    if (isCorrect) {
      setScore((s) => s + 10);
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play();
      }
    } else {
      setScore((s) => Math.max(0, s - 2)); // עונש של 2 נקודות על טעות
      addMistake(questions[current].id);
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play();
      }
    }
  };

  const handleNext = async () => {
    setFeedback(null);
    setSelected(null);
    if (current === questions.length - 1) {
      setFinished(true);
      if (user) {
        try {
          await fetch('/api/games/update-stats', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              gameName: 'TrueOrFalse',
              score: score,
              time: timer,
            }),
          });
        } catch (error) {
          console.error('Failed to update game stats:', error);
        }
      }
    } else {
      setCurrent((c) => c + 1);
    }
  };

  const startGame = () => {
    setStarted(true);
    setTimer(0);
    setScore(0);
    setCurrent(0);
    setFinished(false);
    setFeedback(null);
    setSelected(null);
  };

  const restart = () => {
    setStarted(false);
    setCurrent(0);
    setScore(0);
    setTimer(0);
    setFinished(false);
    setFeedback(null);
    setSelected(null);
    setShowHint(false);
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
        if (current < questions.length - 1) {
          setCurrent(c => c + 1);
          setSelected(null);
          setFeedback(null);
          setShowHint(false);
        } else {
          setFinished(true);
        }
        break;
      case 'extra_time':
        // Add 10 seconds to timer
        setTimer(t => t - 10);
        break;
      case 'score_boost':
        // Add bonus points
        setScore(s => s + 50);
        break;
    }
  };

  const isRTL = lang === 'he';
  const progress = questions.length > 0 ? ((current + 1) / questions.length) * 100 : 0;

  return (
    <main className={`min-h-screen bg-gradient-to-br from-blue-200 via-yellow-200 to-green-200 flex flex-col items-center justify-center p-4 ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <audio ref={successAudio} src="/voise/הצלחה.dat" preload="auto" />
      <audio ref={failAudio} src="/voise/כשלון.dat" preload="auto" />
      <div className="max-w-2xl w-full mx-auto bg-white bg-opacity-90 rounded-2xl shadow-2xl p-8">
        {/* Progress Bar */}
        {started && questions.length > 0 && (
          <div className="w-full h-3 bg-blue-100 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        )}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 text-center drop-shadow-lg flex items-center gap-4">
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white text-3xl shadow-lg mr-2">❓</span>
            נכון או לא נכון
            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xl shadow bg-gradient-to-r from-green-400 to-green-600 text-white ml-4`}>
              <span className="text-2xl">✔️</span> {difficulties.find(d=>d.key===difficulty)?.label}
            </span>
          </h1>
        </div>
        {!started && (
          <div className="flex flex-col gap-4 items-center mb-8">
            <div className="flex gap-4 mb-4">
              <button onClick={() => setLang('en')} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${lang==='en'?'bg-green-600 text-white scale-105':'bg-white text-green-700 hover:bg-green-100'}`}>English</button>
              <button onClick={() => setLang('he')} className={`px-6 py-2 rounded-full font-bold shadow text-lg ${lang==='he'?'bg-pink-600 text-white scale-105':'bg-white text-pink-700 hover:bg-pink-100'}`}>עברית</button>
            </div>
            <button onClick={startGame} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-12 py-4 rounded-full text-2xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4">התחל</button>
          </div>
        )}
        {started && !finished && questions.length > 0 && (
          <>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-blue-700 shadow flex items-center gap-2"><span className="text-green-500 text-2xl">★</span> ניקוד: {score}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-green-700 shadow flex items-center gap-2"><span className="text-blue-500 text-2xl">#️⃣</span> שאלה: {current+1}/{questions.length}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow flex items-center gap-2"><span className="text-pink-500 text-2xl">⏰</span> זמן: {timer} שניות</div>
            </div>
            {/* כפתורי עזר */}
            {selected === null && (
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
            {showHint && selected === null && questions[current]?.explanation && (
              <div className="bg-yellow-50 border-4 border-yellow-400 rounded-2xl px-6 py-4 text-lg font-bold text-yellow-900 shadow-lg mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💡</span>
                  <span>רמז</span>
                </div>
                <div className="text-md">{questions[current].explanation}</div>
              </div>
            )}
            <div className="mb-6">
              <div className="text-xl font-bold text-center mb-4 animate-fade-in-slow flex items-center justify-center gap-2">
                {questions[current].text}
                {getMistakeStats()[questions[current].id] > 0 && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-bold align-middle animate-pulse">💡 חיזוק אישי</span>
                )}
              </div>
              <div className="flex gap-8 justify-center mb-4">
                <button
                  onClick={() => handleSelect(true)}
                  className={`px-10 py-4 rounded-full font-bold text-2xl shadow transition-all duration-200
                    ${selected === true && feedback ? (questions[current].answer ? 'bg-green-400 text-white scale-110 ring-4 ring-green-300 animate-correct' : 'bg-red-400 text-white scale-110 ring-4 ring-red-300 animate-wrong') : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'}`}
                  disabled={!!selected}
                >
                  <span className="text-2xl mr-2">✔️</span>{lang === 'he' ? 'נכון' : 'True'}
                </button>
                <button
                  onClick={() => handleSelect(false)}
                  className={`px-10 py-4 rounded-full font-bold text-2xl shadow transition-all duration-200
                    ${selected === false && feedback ? (!questions[current].answer ? 'bg-green-400 text-white scale-110 ring-4 ring-green-300 animate-correct' : 'bg-red-400 text-white scale-110 ring-4 ring-red-300 animate-wrong') : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'}`}
                  disabled={!!selected}
                >
                  <span className="text-2xl mr-2">❌</span>{lang === 'he' ? 'לא נכון' : 'False'}
                </button>
              </div>
              {feedback && (
                <div className={`text-center mb-4 text-2xl font-bold ${feedback==='נכון!'?'text-green-600':'text-red-500'} animate-fade-in`}>
                  {feedback}
                  {selected !== null && feedback === 'לא נכון' && questions[current].explanation && (
                    <div className="mt-2 text-lg font-normal text-gray-700 bg-yellow-100 rounded-xl px-4 py-2 shadow animate-fade-in">
                      הסבר: {questions[current].explanation}
                    </div>
                  )}
                  <button
                    onClick={handleNext}
                    className="mt-4 px-8 py-3 bg-blue-500 text-white rounded-full font-bold text-xl shadow hover:bg-blue-600 transition-all duration-200"
                  >
                    {current === questions.length - 1 ? 'סיום' : 'המשך'}
                  </button>
                </div>
              )}
            </div>
          </>
        )}
        {finished && (
          <div className="text-center mt-6 animate-fade-in">
            <div className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center gap-2"><span className="text-green-500 text-3xl">🏆</span> כל הכבוד! סיימת את כל השאלות 🎉</div>
            <div className="text-lg font-bold text-green-700 mb-2 flex items-center justify-center gap-2"><span className="text-blue-500 text-2xl">★</span> ניקוד סופי: {score} | <span className="text-pink-500 text-2xl">⏰</span> זמן: {timer} שניות</div>
            <button onClick={restart} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4 flex items-center gap-2"><span className="text-2xl">🔄</span> שחק שוב</button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes fade-in { from{opacity:0;transform:translateY(30px);} to{opacity:1;transform:translateY(0);} }
        .animate-fade-in { animation: fade-in 1s cubic-bezier(.4,0,.2,1) both; }
        @keyframes fade-in-slow { from{opacity:0;} to{opacity:1;} }
        .animate-fade-in-slow { animation: fade-in-slow 1.5s; }
        @keyframes correct { 0%,100%{background:#60d394;} 50%{background:#38b000;} }
        .animate-correct { animation: correct 0.7s; }
        @keyframes wrong { 0%,100%{background:#f87171;} 50%{background:#dc2626;} }
        .animate-wrong { animation: wrong 0.7s; }
      `}</style>
    </main>
  );
} 