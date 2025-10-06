"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import useAuthUser from "@/lib/useAuthUser";
import AdManager from "@/app/components/ads/AdManager";

interface MultipleChoiceQuestion {
  id: number;
  lang: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  explanationHe?: string;
}

const QUESTIONS: MultipleChoiceQuestion[] = [
  { id: 1, lang: "en", question: "What color is the sky?", options: ["Blue", "Red", "Green", "Yellow"], answer: "Blue", explanation: "The sky appears blue due to the scattering of sunlight." },
  { id: 2, lang: "en", question: "Which animal barks?", options: ["Cat", "Dog", "Fish", "Bird"], answer: "Dog", explanation: "Dogs bark; cats meow." },
  { id: 3, lang: "en", question: "What do you drink in the morning?", options: ["Tea", "Juice", "Soda", "Wine"], answer: "Tea", explanation: "Tea is a common morning drink." },
  { id: 4, lang: "en", question: "Which is a fruit?", options: ["Apple", "Car", "Chair", "Book"], answer: "Apple", explanation: "Apple is a fruit; the others are not." },
  { id: 5, lang: "en", question: "What do you use to write?", options: ["Pen", "Spoon", "Shoe", "Hat"], answer: "Pen" },
  { id: 6, lang: "en", question: "Which is a day of the week?", options: ["Monday", "January", "Summer", "Dog"], answer: "Monday" },
  { id: 7, lang: "en", question: "What do you wear on your feet?", options: ["Socks", "Gloves", "Hat", "Shirt"], answer: "Socks" },
  { id: 8, lang: "en", question: "Which is a vegetable?", options: ["Carrot", "Apple", "Cake", "Milk"], answer: "Carrot" },
  { id: 9, lang: "en", question: "What do you read?", options: ["Book", "Shoe", "Egg", "Tree"], answer: "Book" },
  { id: 10, lang: "en", question: "Which is a season?", options: ["Winter", "Monday", "Dog", "Pen"], answer: "Winter" },
  { id: 11, lang: "en", question: "What do you eat for breakfast?", options: ["Eggs", "Shoes", "Books", "Cars"], answer: "Eggs" },
  { id: 12, lang: "en", question: "Which animal can fly?", options: ["Bird", "Dog", "Cat", "Fish"], answer: "Bird" },
  { id: 13, lang: "en", question: "What do you use to cut paper?", options: ["Scissors", "Pen", "Book", "Spoon"], answer: "Scissors" },
  { id: 14, lang: "en", question: "Which is a drink?", options: ["Juice", "Chair", "Hat", "Shoe"], answer: "Juice" },
  { id: 15, lang: "en", question: "What do you wear on your head?", options: ["Hat", "Socks", "Book", "Car"], answer: "Hat" },
  { id: 16, lang: "en", question: "Which is a pet?", options: ["Cat", "Car", "Book", "Tree"], answer: "Cat" },
  { id: 17, lang: "en", question: "What do you use to eat soup?", options: ["Spoon", "Pen", "Shoe", "Hat"], answer: "Spoon" },
  { id: 18, lang: "en", question: "Which is a color?", options: ["Red", "Dog", "Book", "Car"], answer: "Red" },
  { id: 19, lang: "en", question: "What do you use to call someone?", options: ["Phone", "Book", "Shoe", "Pen"], answer: "Phone" },
  { id: 20, lang: "en", question: "Which is a vehicle?", options: ["Car", "Dog", "Book", "Pen"], answer: "Car" },
  { id: 21, lang: "en", question: "Which animal can swim?", options: ["Fish", "Cat", "Dog", "Bird"], answer: "Fish" },
  { id: 22, lang: "en", question: "What do you use to open a door?", options: ["Key", "Book", "Pen", "Spoon"], answer: "Key" },
  { id: 23, lang: "en", question: "Which is a month?", options: ["January", "Monday", "Summer", "Dog"], answer: "January" },
  { id: 24, lang: "en", question: "What do you wear on your hands?", options: ["Gloves", "Socks", "Hat", "Shirt"], answer: "Gloves" },
  { id: 25, lang: "en", question: "Which is a drink?", options: ["Water", "Book", "Car", "Pen"], answer: "Water" },
  { id: 26, lang: "en", question: "What do you use to see?", options: ["Eyes", "Ears", "Nose", "Mouth"], answer: "Eyes" },
  { id: 27, lang: "en", question: "Which is a fruit?", options: ["Banana", "Carrot", "Milk", "Dog"], answer: "Banana" },
  { id: 28, lang: "en", question: "What do you use to listen to music?", options: ["Ears", "Eyes", "Nose", "Mouth"], answer: "Ears" },
  { id: 29, lang: "en", question: "Which is a vegetable?", options: ["Tomato", "Apple", "Cake", "Milk"], answer: "Tomato" },
  { id: 30, lang: "en", question: "What do you use to eat with?", options: ["Fork", "Pen", "Book", "Shoe"], answer: "Fork" },
  { id: 31, lang: "en", question: "Which is a color?", options: ["Green", "Dog", "Book", "Car"], answer: "Green" },
  { id: 32, lang: "en", question: "What do you use to write on?", options: ["Paper", "Spoon", "Shoe", "Hat"], answer: "Paper" },
  { id: 33, lang: "en", question: "Which animal can fly?", options: ["Bird", "Dog", "Cat", "Fish"], answer: "Bird" },
  { id: 34, lang: "en", question: "What do you use to cut food?", options: ["Knife", "Pen", "Book", "Spoon"], answer: "Knife" },
  { id: 35, lang: "en", question: "Which is a pet?", options: ["Dog", "Car", "Book", "Tree"], answer: "Dog" },
  { id: 36, lang: "en", question: "What do you use to call someone?", options: ["Phone", "Book", "Shoe", "Pen"], answer: "Phone" },
  { id: 37, lang: "en", question: "Which is a vehicle?", options: ["Bus", "Dog", "Book", "Pen"], answer: "Bus" },
  { id: 38, lang: "en", question: "What do you use to drink soup?", options: ["Spoon", "Pen", "Shoe", "Hat"], answer: "Spoon" },
  { id: 39, lang: "en", question: "Which is a day of the week?", options: ["Friday", "January", "Summer", "Dog"], answer: "Friday", explanation: "Friday is a day of the week." },
  { id: 40, lang: "en", question: "What do you wear on your body?", options: ["Shirt", "Socks", "Book", "Car"], answer: "Shirt", explanation: "A shirt is clothing worn on the body." },
  { id: 41, lang: "en", question: "Which animal has a long neck?", options: ["Giraffe", "Dog", "Cat", "Fish"], answer: "Giraffe", explanation: "A giraffe is known for its very long neck." },
  { id: 42, lang: "en", question: "What do you use to brush your teeth?", options: ["Toothbrush", "Spoon", "Pen", "Book"], answer: "Toothbrush", explanation: "A toothbrush is used for dental hygiene." },
  { id: 43, lang: "en", question: "Which is a type of transport?", options: ["Train", "Dog", "Book", "Tree"], answer: "Train" },
  { id: 44, lang: "en", question: "What do you use to see the time?", options: ["Clock", "Shoe", "Car", "Pen"], answer: "Clock" },
  { id: 45, lang: "en", question: "Which is a farm animal?", options: ["Cow", "Dog", "Cat", "Fish"], answer: "Cow" },
  { id: 46, lang: "en", question: "What do you use to write on a blackboard?", options: ["Chalk", "Pen", "Book", "Spoon"], answer: "Chalk" },
  { id: 47, lang: "en", question: "Which is a wild animal?", options: ["Lion", "Dog", "Cat", "Fish"], answer: "Lion" },
  { id: 48, lang: "en", question: "What do you use to eat ice cream?", options: ["Spoon", "Pen", "Book", "Shoe"], answer: "Spoon" },
  { id: 49, lang: "en", question: "Which is a fruit?", options: ["Orange", "Carrot", "Milk", "Dog"], answer: "Orange" },
  { id: 50, lang: "en", question: "What do you use to wash your hands?", options: ["Soap", "Book", "Car", "Pen"], answer: "Soap" },
  { id: 51, lang: "en", question: "Which is a color?", options: ["Yellow", "Dog", "Book", "Car"], answer: "Yellow" },
  { id: 52, lang: "en", question: "What do you use to make a phone call?", options: ["Phone", "Book", "Shoe", "Pen"], answer: "Phone" },
  { id: 53, lang: "en", question: "Which is a pet?", options: ["Rabbit", "Car", "Book", "Tree"], answer: "Rabbit" },
  { id: 54, lang: "en", question: "What do you use to drink tea?", options: ["Cup", "Pen", "Book", "Shoe"], answer: "Cup" },
  { id: 55, lang: "en", question: "Which is a vegetable?", options: ["Cucumber", "Apple", "Cake", "Milk"], answer: "Cucumber" },
  { id: 56, lang: "en", question: "What do you use to see far away?", options: ["Binoculars", "Spoon", "Shoe", "Hat"], answer: "Binoculars" },
  { id: 57, lang: "en", question: "Which animal can jump?", options: ["Kangaroo", "Dog", "Cat", "Fish"], answer: "Kangaroo" },
  { id: 58, lang: "en", question: "What do you use to eat salad?", options: ["Fork", "Pen", "Book", "Shoe"], answer: "Fork" },
  { id: 59, lang: "en", question: "Which is a day of the week?", options: ["Sunday", "January", "Summer", "Dog"], answer: "Sunday" },
  { id: 60, lang: "en", question: "What do you wear on your legs?", options: ["Pants", "Socks", "Book", "Car"], answer: "Pants" },
  
  // Easy level - Additional questions (61-80)
  { id: 61, lang: "en", question: "What do you use to brush your hair?", options: ["Comb", "Spoon", "Book", "Car"], answer: "Comb" },
  { id: 62, lang: "en", question: "Which is a sweet food?", options: ["Candy", "Salt", "Vinegar", "Pepper"], answer: "Candy" },
  { id: 63, lang: "en", question: "What do you use to clean your teeth?", options: ["Toothbrush", "Spoon", "Book", "Car"], answer: "Toothbrush" },
  { id: 64, lang: "en", question: "Which is a cold drink?", options: ["Ice cream", "Coffee", "Tea", "Soup"], answer: "Ice cream" },
  { id: 65, lang: "en", question: "What do you use to open a can?", options: ["Can opener", "Spoon", "Book", "Car"], answer: "Can opener" },
  { id: 66, lang: "en", question: "Which is a hot drink?", options: ["Coffee", "Ice", "Snow", "Cold water"], answer: "Coffee" },
  { id: 67, lang: "en", question: "What do you use to measure time?", options: ["Clock", "Spoon", "Book", "Car"], answer: "Clock" },
  { id: 68, lang: "en", question: "Which is a round fruit?", options: ["Orange", "Banana", "Carrot", "Cucumber"], answer: "Orange" },
  { id: 69, lang: "en", question: "What do you use to cut bread?", options: ["Knife", "Spoon", "Book", "Car"], answer: "Knife" },
  { id: 70, lang: "en", question: "Which is a green vegetable?", options: ["Lettuce", "Tomato", "Carrot", "Potato"], answer: "Lettuce" },
  { id: 71, lang: "en", question: "What do you use to dry your hands?", options: ["Towel", "Spoon", "Book", "Car"], answer: "Towel" },
  { id: 72, lang: "en", question: "Which is a yellow fruit?", options: ["Banana", "Apple", "Grape", "Orange"], answer: "Banana" },
  { id: 73, lang: "en", question: "What do you use to light a room?", options: ["Lamp", "Spoon", "Book", "Car"], answer: "Lamp" },
  { id: 74, lang: "en", question: "Which is a red fruit?", options: ["Strawberry", "Banana", "Lemon", "Lime"], answer: "Strawberry" },
  { id: 75, lang: "en", question: "What do you use to listen to music?", options: ["Headphones", "Spoon", "Book", "Car"], answer: "Headphones" },
  { id: 76, lang: "en", question: "Which is a white drink?", options: ["Milk", "Coffee", "Tea", "Juice"], answer: "Milk" },
  { id: 77, lang: "en", question: "What do you use to take photos?", options: ["Camera", "Spoon", "Book", "Car"], answer: "Camera" },
  { id: 78, lang: "en", question: "Which is a brown food?", options: ["Chocolate", "Milk", "Snow", "Ice"], answer: "Chocolate" },
  { id: 79, lang: "en", question: "What do you use to play music?", options: ["Radio", "Spoon", "Book", "Car"], answer: "Radio" },
  { id: 80, lang: "en", question: "Which is a purple fruit?", options: ["Grape", "Apple", "Banana", "Orange"], answer: "Grape" },
  
  // Medium level - Additional questions (81-120)
  { id: 81, lang: "en", question: "What do you use to store food in the refrigerator?", options: ["Container", "Spoon", "Book", "Car"], answer: "Container" },
  { id: 82, lang: "en", question: "Which is a type of transportation?", options: ["Bicycle", "Book", "Pen", "Spoon"], answer: "Bicycle" },
  { id: 83, lang: "en", question: "What do you use to clean windows?", options: ["Window cleaner", "Spoon", "Book", "Car"], answer: "Window cleaner" },
  { id: 84, lang: "en", question: "Which is a type of weather?", options: ["Rainy", "Book", "Pen", "Spoon"], answer: "Rainy" },
  { id: 85, lang: "en", question: "What do you use to measure weight?", options: ["Scale", "Spoon", "Book", "Car"], answer: "Scale" },
  { id: 86, lang: "en", question: "Which is a type of sport?", options: ["Tennis", "Book", "Pen", "Spoon"], answer: "Tennis" },
  { id: 87, lang: "en", question: "What do you use to water plants?", options: ["Watering can", "Spoon", "Book", "Car"], answer: "Watering can" },
  { id: 88, lang: "en", question: "Which is a type of building?", options: ["Hospital", "Book", "Pen", "Spoon"], answer: "Hospital" },
  { id: 89, lang: "en", question: "What do you use to lock a door?", options: ["Lock", "Spoon", "Book", "Car"], answer: "Lock" },
  { id: 90, lang: "en", question: "Which is a type of clothing?", options: ["Jacket", "Book", "Pen", "Spoon"], answer: "Jacket" },
  { id: 91, lang: "en", question: "What do you use to iron clothes?", options: ["Iron", "Spoon", "Book", "Car"], answer: "Iron" },
  { id: 92, lang: "en", question: "Which is a type of furniture?", options: ["Sofa", "Book", "Pen", "Spoon"], answer: "Sofa" },
  { id: 93, lang: "en", question: "What do you use to vacuum the floor?", options: ["Vacuum cleaner", "Spoon", "Book", "Car"], answer: "Vacuum cleaner" },
  { id: 94, lang: "en", question: "Which is a type of animal?", options: ["Elephant", "Book", "Pen", "Spoon"], answer: "Elephant" },
  { id: 95, lang: "en", question: "What do you use to wash dishes?", options: ["Dish soap", "Spoon", "Book", "Car"], answer: "Dish soap" },
  { id: 96, lang: "en", question: "Which is a type of fruit?", options: ["Pineapple", "Book", "Pen", "Spoon"], answer: "Pineapple" },
  { id: 97, lang: "en", question: "What do you use to hang clothes?", options: ["Hanger", "Spoon", "Book", "Car"], answer: "Hanger" },
  { id: 98, lang: "en", question: "Which is a type of vegetable?", options: ["Broccoli", "Book", "Pen", "Spoon"], answer: "Broccoli" },
  { id: 99, lang: "en", question: "What do you use to clean your face?", options: ["Face wash", "Spoon", "Book", "Car"], answer: "Face wash" },
  { id: 100, lang: "en", question: "Which is a type of drink?", options: ["Smoothie", "Book", "Pen", "Spoon"], answer: "Smoothie" },
  { id: 101, lang: "en", question: "What do you use to organize papers?", options: ["Folder", "Spoon", "Book", "Car"], answer: "Folder" },
  { id: 102, lang: "en", question: "Which is a type of tool?", options: ["Hammer", "Book", "Pen", "Spoon"], answer: "Hammer" },
  { id: 103, lang: "en", question: "What do you use to measure temperature?", options: ["Thermometer", "Spoon", "Book", "Car"], answer: "Thermometer" },
  { id: 104, lang: "en", question: "Which is a type of flower?", options: ["Rose", "Book", "Pen", "Spoon"], answer: "Rose" },
  { id: 105, lang: "en", question: "What do you use to cut paper?", options: ["Scissors", "Spoon", "Book", "Car"], answer: "Scissors" },
  { id: 106, lang: "en", question: "Which is a type of bird?", options: ["Eagle", "Book", "Pen", "Spoon"], answer: "Eagle" },
  { id: 107, lang: "en", question: "What do you use to stick things together?", options: ["Glue", "Spoon", "Book", "Car"], answer: "Glue" },
  { id: 108, lang: "en", question: "Which is a type of fish?", options: ["Salmon", "Book", "Pen", "Spoon"], answer: "Salmon" },
  { id: 109, lang: "en", question: "What do you use to wrap gifts?", options: ["Wrapping paper", "Spoon", "Book", "Car"], answer: "Wrapping paper" },
  { id: 110, lang: "en", question: "Which is a type of tree?", options: ["Oak", "Book", "Pen", "Spoon"], answer: "Oak" },
  { id: 111, lang: "en", question: "What do you use to clean your ears?", options: ["Cotton swab", "Spoon", "Book", "Car"], answer: "Cotton swab" },
  { id: 112, lang: "en", question: "Which is a type of insect?", options: ["Butterfly", "Book", "Pen", "Spoon"], answer: "Butterfly" },
  { id: 113, lang: "en", question: "What do you use to store money?", options: ["Wallet", "Spoon", "Book", "Car"], answer: "Wallet" },
  { id: 114, lang: "en", question: "Which is a type of meat?", options: ["Chicken", "Book", "Pen", "Spoon"], answer: "Chicken" },
  { id: 115, lang: "en", question: "What do you use to clean your shoes?", options: ["Shoe polish", "Spoon", "Book", "Car"], answer: "Shoe polish" },
  { id: 116, lang: "en", question: "Which is a type of grain?", options: ["Rice", "Book", "Pen", "Spoon"], answer: "Rice" },
  { id: 117, lang: "en", question: "What do you use to clean your nails?", options: ["Nail clipper", "Spoon", "Book", "Car"], answer: "Nail clipper" },
  { id: 118, lang: "en", question: "Which is a type of nut?", options: ["Almond", "Book", "Pen", "Spoon"], answer: "Almond" },
  { id: 119, lang: "en", question: "What do you use to clean your glasses?", options: ["Lens cleaner", "Spoon", "Book", "Car"], answer: "Lens cleaner" },
  { id: 120, lang: "en", question: "Which is a type of spice?", options: ["Cinnamon", "Book", "Pen", "Spoon"], answer: "Cinnamon" },
  
  // Hard level - Additional questions (121-160)
  { id: 121, lang: "en", question: "What do you use to measure distance?", options: ["Ruler", "Spoon", "Book", "Car"], answer: "Ruler" },
  { id: 122, lang: "en", question: "Which is a type of instrument?", options: ["Violin", "Book", "Pen", "Spoon"], answer: "Violin" },
  { id: 123, lang: "en", question: "What do you use to clean your computer screen?", options: ["Screen cleaner", "Spoon", "Book", "Car"], answer: "Screen cleaner" },
  { id: 124, lang: "en", question: "Which is a type of gemstone?", options: ["Diamond", "Book", "Pen", "Spoon"], answer: "Diamond" },
  { id: 125, lang: "en", question: "What do you use to measure volume?", options: ["Measuring cup", "Spoon", "Book", "Car"], answer: "Measuring cup" },
  { id: 126, lang: "en", question: "Which is a type of metal?", options: ["Gold", "Book", "Pen", "Spoon"], answer: "Gold" },
  { id: 127, lang: "en", question: "What do you use to clean your keyboard?", options: ["Keyboard cleaner", "Spoon", "Book", "Car"], answer: "Keyboard cleaner" },
  { id: 128, lang: "en", question: "Which is a type of planet?", options: ["Mars", "Book", "Pen", "Spoon"], answer: "Mars" },
  { id: 129, lang: "en", question: "What do you use to measure speed?", options: ["Speedometer", "Spoon", "Book", "Car"], answer: "Speedometer" },
  { id: 130, lang: "en", question: "Which is a type of chemical element?", options: ["Oxygen", "Book", "Pen", "Spoon"], answer: "Oxygen" },
  { id: 131, lang: "en", question: "What do you use to clean your car?", options: ["Car wash", "Spoon", "Book", "Car"], answer: "Car wash" },
  { id: 132, lang: "en", question: "Which is a type of constellation?", options: ["Orion", "Book", "Pen", "Spoon"], answer: "Orion" },
  { id: 133, lang: "en", question: "What do you use to measure pressure?", options: ["Barometer", "Spoon", "Book", "Car"], answer: "Barometer" },
  { id: 134, lang: "en", question: "Which is a type of bacteria?", options: ["E.coli", "Book", "Pen", "Spoon"], answer: "E.coli" },
  { id: 135, lang: "en", question: "What do you use to clean your jewelry?", options: ["Jewelry cleaner", "Spoon", "Book", "Car"], answer: "Jewelry cleaner" },
  { id: 136, lang: "en", question: "Which is a type of virus?", options: ["Influenza", "Book", "Pen", "Spoon"], answer: "Influenza" },
  { id: 137, lang: "en", question: "What do you use to measure humidity?", options: ["Hygrometer", "Spoon", "Book", "Car"], answer: "Hygrometer" },
  { id: 138, lang: "en", question: "Which is a type of fungus?", options: ["Mushroom", "Book", "Pen", "Spoon"], answer: "Mushroom" },
  { id: 139, lang: "en", question: "What do you use to clean your watch?", options: ["Watch cleaner", "Spoon", "Book", "Car"], answer: "Watch cleaner" },
  { id: 140, lang: "en", question: "Which is a type of mineral?", options: ["Quartz", "Book", "Pen", "Spoon"], answer: "Quartz" },
  { id: 141, lang: "en", question: "What do you use to measure light intensity?", options: ["Light meter", "Spoon", "Book", "Car"], answer: "Light meter" },
  { id: 142, lang: "en", question: "Which is a type of protein?", options: ["Hemoglobin", "Book", "Pen", "Spoon"], answer: "Hemoglobin" },
  { id: 143, lang: "en", question: "What do you use to clean your camera lens?", options: ["Lens cleaner", "Spoon", "Book", "Car"], answer: "Lens cleaner" },
  { id: 144, lang: "en", question: "Which is a type of enzyme?", options: ["Amylase", "Book", "Pen", "Spoon"], answer: "Amylase" },
  { id: 145, lang: "en", question: "What do you use to measure sound intensity?", options: ["Decibel meter", "Spoon", "Book", "Car"], answer: "Decibel meter" },
  { id: 146, lang: "en", question: "Which is a type of hormone?", options: ["Insulin", "Book", "Pen", "Spoon"], answer: "Insulin" },
  { id: 147, lang: "en", question: "What do you use to clean your microscope?", options: ["Microscope cleaner", "Spoon", "Book", "Car"], answer: "Microscope cleaner" },
  { id: 148, lang: "en", question: "Which is a type of vitamin?", options: ["Vitamin C", "Book", "Pen", "Spoon"], answer: "Vitamin C" },
  { id: 149, lang: "en", question: "What do you use to measure magnetic field?", options: ["Magnetometer", "Spoon", "Book", "Car"], answer: "Magnetometer" },
  { id: 150, lang: "en", question: "Which is a type of amino acid?", options: ["Glycine", "Book", "Pen", "Spoon"], answer: "Glycine" },
  { id: 151, lang: "en", question: "What do you use to clean your telescope?", options: ["Telescope cleaner", "Spoon", "Book", "Car"], answer: "Telescope cleaner" },
  { id: 152, lang: "en", question: "Which is a type of carbohydrate?", options: ["Glucose", "Book", "Pen", "Spoon"], answer: "Glucose" },
  { id: 153, lang: "en", question: "What do you use to measure radiation?", options: ["Geiger counter", "Spoon", "Book", "Car"], answer: "Geiger counter" },
  { id: 154, lang: "en", question: "Which is a type of lipid?", options: ["Cholesterol", "Book", "Pen", "Spoon"], answer: "Cholesterol" },
  { id: 155, lang: "en", question: "What do you use to clean your spectroscope?", options: ["Spectroscope cleaner", "Spoon", "Book", "Car"], answer: "Spectroscope cleaner" },
  { id: 156, lang: "en", question: "Which is a type of nucleic acid?", options: ["DNA", "Book", "Pen", "Spoon"], answer: "DNA" },
  { id: 157, lang: "en", question: "What do you use to measure pH level?", options: ["pH meter", "Spoon", "Book", "Car"], answer: "pH meter" },
  { id: 158, lang: "en", question: "Which is a type of antibody?", options: ["Immunoglobulin", "Book", "Pen", "Spoon"], answer: "Immunoglobulin" },
  { id: 159, lang: "en", question: "What do you use to clean your centrifuge?", options: ["Centrifuge cleaner", "Spoon", "Book", "Car"], answer: "Centrifuge cleaner" },
  { id: 160, lang: "en", question: "Which is a type of neurotransmitter?", options: ["Dopamine", "Book", "Pen", "Spoon"], answer: "Dopamine" },
  
  // Easy level - More questions (161-200)
  { id: 161, lang: "en", question: "What do you use to clean your hair?", options: ["Shampoo", "Spoon", "Book", "Car"], answer: "Shampoo" },
  { id: 162, lang: "en", question: "Which is a type of weather?", options: ["Sunny", "Book", "Pen", "Spoon"], answer: "Sunny" },
  { id: 163, lang: "en", question: "What do you use to dry your hair?", options: ["Hair dryer", "Spoon", "Book", "Car"], answer: "Hair dryer" },
  { id: 164, lang: "en", question: "Which is a type of fruit?", options: ["Mango", "Book", "Pen", "Spoon"], answer: "Mango" },
  { id: 165, lang: "en", question: "What do you use to brush your teeth?", options: ["Toothbrush", "Spoon", "Book", "Car"], answer: "Toothbrush" },
  { id: 166, lang: "en", question: "Which is a type of vegetable?", options: ["Spinach", "Book", "Pen", "Spoon"], answer: "Spinach" },
  { id: 167, lang: "en", question: "What do you use to wash your hands?", options: ["Soap", "Spoon", "Book", "Car"], answer: "Soap" },
  { id: 168, lang: "en", question: "Which is a type of drink?", options: ["Coffee", "Book", "Pen", "Spoon"], answer: "Coffee" },
  { id: 169, lang: "en", question: "What do you use to cut your nails?", options: ["Nail clipper", "Spoon", "Book", "Car"], answer: "Nail clipper" },
  { id: 170, lang: "en", question: "Which is a type of animal?", options: ["Penguin", "Book", "Pen", "Spoon"], answer: "Penguin" },
  { id: 171, lang: "en", question: "What do you use to clean your glasses?", options: ["Lens cleaner", "Spoon", "Book", "Car"], answer: "Lens cleaner" },
  { id: 172, lang: "en", question: "Which is a type of sport?", options: ["Swimming", "Book", "Pen", "Spoon"], answer: "Swimming" },
  { id: 173, lang: "en", question: "What do you use to measure your height?", options: ["Ruler", "Spoon", "Book", "Car"], answer: "Ruler" },
  { id: 174, lang: "en", question: "Which is a type of music?", options: ["Jazz", "Book", "Pen", "Spoon"], answer: "Jazz" },
  { id: 175, lang: "en", question: "What do you use to open a bottle?", options: ["Bottle opener", "Spoon", "Book", "Car"], answer: "Bottle opener" },
  { id: 176, lang: "en", question: "Which is a type of building?", options: ["School", "Book", "Pen", "Spoon"], answer: "School" },
  { id: 177, lang: "en", question: "What do you use to clean your shoes?", options: ["Shoe polish", "Spoon", "Book", "Car"], answer: "Shoe polish" },
  { id: 178, lang: "en", question: "Which is a type of flower?", options: ["Tulip", "Book", "Pen", "Spoon"], answer: "Tulip" },
  { id: 179, lang: "en", question: "What do you use to clean your car?", options: ["Car wash", "Spoon", "Book", "Car"], answer: "Car wash" },
  { id: 180, lang: "en", question: "Which is a type of tree?", options: ["Pine", "Book", "Pen", "Spoon"], answer: "Pine" },
  { id: 181, lang: "en", question: "What do you use to clean your windows?", options: ["Window cleaner", "Spoon", "Book", "Car"], answer: "Window cleaner" },
  { id: 182, lang: "en", question: "Which is a type of bird?", options: ["Parrot", "Book", "Pen", "Spoon"], answer: "Parrot" },
  { id: 183, lang: "en", question: "What do you use to clean your floor?", options: ["Mop", "Spoon", "Book", "Car"], answer: "Mop" },
  { id: 184, lang: "en", question: "Which is a type of fish?", options: ["Tuna", "Book", "Pen", "Spoon"], answer: "Tuna" },
  { id: 185, lang: "en", question: "What do you use to clean your dishes?", options: ["Dish soap", "Spoon", "Book", "Car"], answer: "Dish soap" },
  { id: 186, lang: "en", question: "Which is a type of insect?", options: ["Bee", "Book", "Pen", "Spoon"], answer: "Bee" },
  { id: 187, lang: "en", question: "What do you use to clean your clothes?", options: ["Laundry detergent", "Spoon", "Book", "Car"], answer: "Laundry detergent" },
  { id: 188, lang: "en", question: "Which is a type of nut?", options: ["Walnut", "Book", "Pen", "Spoon"], answer: "Walnut" },
  { id: 189, lang: "en", question: "What do you use to clean your bathroom?", options: ["Bathroom cleaner", "Spoon", "Book", "Car"], answer: "Bathroom cleaner" },
  { id: 190, lang: "en", question: "Which is a type of spice?", options: ["Pepper", "Book", "Pen", "Spoon"], answer: "Pepper" },
  { id: 191, lang: "en", question: "What do you use to clean your kitchen?", options: ["Kitchen cleaner", "Spoon", "Book", "Car"], answer: "Kitchen cleaner" },
  { id: 192, lang: "en", question: "Which is a type of meat?", options: ["Beef", "Book", "Pen", "Spoon"], answer: "Beef" },
  { id: 193, lang: "en", question: "What do you use to clean your furniture?", options: ["Furniture polish", "Spoon", "Book", "Car"], answer: "Furniture polish" },
  { id: 194, lang: "en", question: "Which is a type of grain?", options: ["Wheat", "Book", "Pen", "Spoon"], answer: "Wheat" },
  { id: 195, lang: "en", question: "What do you use to clean your computer?", options: ["Computer cleaner", "Spoon", "Book", "Car"], answer: "Computer cleaner" },
  { id: 196, lang: "en", question: "Which is a type of cheese?", options: ["Cheddar", "Book", "Pen", "Spoon"], answer: "Cheddar" },
  { id: 197, lang: "en", question: "What do you use to clean your phone?", options: ["Phone cleaner", "Spoon", "Book", "Car"], answer: "Phone cleaner" },
  { id: 198, lang: "en", question: "Which is a type of bread?", options: ["Sourdough", "Book", "Pen", "Spoon"], answer: "Sourdough" },
  { id: 199, lang: "en", question: "What do you use to clean your jewelry?", options: ["Jewelry cleaner", "Spoon", "Book", "Car"], answer: "Jewelry cleaner" },
  { id: 200, lang: "en", question: "Which is a type of pasta?", options: ["Spaghetti", "Book", "Pen", "Spoon"], answer: "Spaghetti" },
  
  // Medium level - More questions (201-240)
  { id: 201, lang: "en", question: "What do you use to measure temperature?", options: ["Thermometer", "Spoon", "Book", "Car"], answer: "Thermometer" },
  { id: 202, lang: "en", question: "Which is a type of instrument?", options: ["Guitar", "Book", "Pen", "Spoon"], answer: "Guitar" },
  { id: 203, lang: "en", question: "What do you use to measure weight?", options: ["Scale", "Spoon", "Book", "Car"], answer: "Scale" },
  { id: 204, lang: "en", question: "Which is a type of vehicle?", options: ["Motorcycle", "Book", "Pen", "Spoon"], answer: "Motorcycle" },
  { id: 205, lang: "en", question: "What do you use to measure distance?", options: ["Ruler", "Spoon", "Book", "Car"], answer: "Ruler" },
  { id: 206, lang: "en", question: "Which is a type of profession?", options: ["Engineer", "Book", "Pen", "Spoon"], answer: "Engineer" },
  { id: 207, lang: "en", question: "What do you use to measure time?", options: ["Stopwatch", "Spoon", "Book", "Car"], answer: "Stopwatch" },
  { id: 208, lang: "en", question: "Which is a type of art?", options: ["Painting", "Book", "Pen", "Spoon"], answer: "Painting" },
  { id: 209, lang: "en", question: "What do you use to measure volume?", options: ["Measuring cup", "Spoon", "Book", "Car"], answer: "Measuring cup" },
  { id: 210, lang: "en", question: "Which is a type of science?", options: ["Biology", "Book", "Pen", "Spoon"], answer: "Biology" },
  { id: 211, lang: "en", question: "What do you use to measure speed?", options: ["Speedometer", "Spoon", "Book", "Car"], answer: "Speedometer" },
  { id: 212, lang: "en", question: "Which is a type of literature?", options: ["Poetry", "Book", "Pen", "Spoon"], answer: "Poetry" },
  { id: 213, lang: "en", question: "What do you use to measure pressure?", options: ["Barometer", "Spoon", "Book", "Car"], answer: "Barometer" },
  { id: 214, lang: "en", question: "Which is a type of dance?", options: ["Ballet", "Book", "Pen", "Spoon"], answer: "Ballet" },
  { id: 215, lang: "en", question: "What do you use to measure humidity?", options: ["Hygrometer", "Spoon", "Book", "Car"], answer: "Hygrometer" },
  { id: 216, lang: "en", question: "Which is a type of theater?", options: ["Drama", "Book", "Pen", "Spoon"], answer: "Drama" },
  { id: 217, lang: "en", question: "What do you use to measure light?", options: ["Light meter", "Spoon", "Book", "Car"], answer: "Light meter" },
  { id: 218, lang: "en", question: "Which is a type of film?", options: ["Documentary", "Book", "Pen", "Spoon"], answer: "Documentary" },
  { id: 219, lang: "en", question: "What do you use to measure sound?", options: ["Decibel meter", "Spoon", "Book", "Car"], answer: "Decibel meter" },
  { id: 220, lang: "en", question: "Which is a type of photography?", options: ["Portrait", "Book", "Pen", "Spoon"], answer: "Portrait" },
  { id: 221, lang: "en", question: "What do you use to measure radiation?", options: ["Geiger counter", "Spoon", "Book", "Car"], answer: "Geiger counter" },
  { id: 222, lang: "en", question: "Which is a type of sculpture?", options: ["Statue", "Book", "Pen", "Spoon"], answer: "Statue" },
  { id: 223, lang: "en", question: "What do you use to measure pH?", options: ["pH meter", "Spoon", "Book", "Car"], answer: "pH meter" },
  { id: 224, lang: "en", question: "Which is a type of architecture?", options: ["Gothic", "Book", "Pen", "Spoon"], answer: "Gothic" },
  { id: 225, lang: "en", question: "What do you use to measure magnetic field?", options: ["Magnetometer", "Spoon", "Book", "Car"], answer: "Magnetometer" },
  { id: 226, lang: "en", question: "Which is a type of design?", options: ["Graphic", "Book", "Pen", "Spoon"], answer: "Graphic" },
  { id: 227, lang: "en", question: "What do you use to measure current?", options: ["Ammeter", "Spoon", "Book", "Car"], answer: "Ammeter" },
  { id: 228, lang: "en", question: "Which is a type of fashion?", options: ["Haute couture", "Book", "Pen", "Spoon"], answer: "Haute couture" },
  { id: 229, lang: "en", question: "What do you use to measure voltage?", options: ["Voltmeter", "Spoon", "Book", "Car"], answer: "Voltmeter" },
  { id: 230, lang: "en", question: "Which is a type of cuisine?", options: ["Italian", "Book", "Pen", "Spoon"], answer: "Italian" },
  { id: 231, lang: "en", question: "What do you use to measure resistance?", options: ["Ohmmeter", "Spoon", "Book", "Car"], answer: "Ohmmeter" },
  { id: 232, lang: "en", question: "Which is a type of wine?", options: ["Chardonnay", "Book", "Pen", "Spoon"], answer: "Chardonnay" },
  { id: 233, lang: "en", question: "What do you use to measure frequency?", options: ["Frequency meter", "Spoon", "Book", "Car"], answer: "Frequency meter" },
  { id: 234, lang: "en", question: "Which is a type of coffee?", options: ["Espresso", "Book", "Pen", "Spoon"], answer: "Espresso" },
  { id: 235, lang: "en", question: "What do you use to measure capacitance?", options: ["Capacitance meter", "Spoon", "Book", "Car"], answer: "Capacitance meter" },
  { id: 236, lang: "en", question: "Which is a type of tea?", options: ["Green tea", "Book", "Pen", "Spoon"], answer: "Green tea" },
  { id: 237, lang: "en", question: "What do you use to measure inductance?", options: ["Inductance meter", "Spoon", "Book", "Car"], answer: "Inductance meter" },
  { id: 238, lang: "en", question: "Which is a type of beer?", options: ["Lager", "Book", "Pen", "Spoon"], answer: "Lager" },
  { id: 239, lang: "en", question: "What do you use to measure power?", options: ["Wattmeter", "Spoon", "Book", "Car"], answer: "Wattmeter" },
  { id: 240, lang: "en", question: "Which is a type of cocktail?", options: ["Martini", "Book", "Pen", "Spoon"], answer: "Martini" },
  
  // Hard level - More questions (241-280)
  { id: 241, lang: "en", question: "What do you use to measure energy?", options: ["Energy meter", "Spoon", "Book", "Car"], answer: "Energy meter" },
  { id: 242, lang: "en", question: "Which is a type of quantum particle?", options: ["Photon", "Book", "Pen", "Spoon"], answer: "Photon" },
  { id: 243, lang: "en", question: "What do you use to measure force?", options: ["Force meter", "Spoon", "Book", "Car"], answer: "Force meter" },
  { id: 244, lang: "en", question: "Which is a type of subatomic particle?", options: ["Electron", "Book", "Pen", "Spoon"], answer: "Electron" },
  { id: 245, lang: "en", question: "What do you use to measure acceleration?", options: ["Accelerometer", "Spoon", "Book", "Car"], answer: "Accelerometer" },
  { id: 246, lang: "en", question: "Which is a type of fundamental force?", options: ["Gravity", "Book", "Pen", "Spoon"], answer: "Gravity" },
  { id: 247, lang: "en", question: "What do you use to measure velocity?", options: ["Velocimeter", "Spoon", "Book", "Car"], answer: "Velocimeter" },
  { id: 248, lang: "en", question: "Which is a type of wave?", options: ["Electromagnetic", "Book", "Pen", "Spoon"], answer: "Electromagnetic" },
  { id: 249, lang: "en", question: "What do you use to measure wavelength?", options: ["Wavelength meter", "Spoon", "Book", "Car"], answer: "Wavelength meter" },
  { id: 250, lang: "en", question: "Which is a type of field?", options: ["Magnetic", "Book", "Pen", "Spoon"], answer: "Magnetic" },
  { id: 251, lang: "en", question: "What do you use to measure amplitude?", options: ["Amplitude meter", "Spoon", "Book", "Car"], answer: "Amplitude meter" },
  { id: 252, lang: "en", question: "Which is a type of spectrum?", options: ["Electromagnetic", "Book", "Pen", "Spoon"], answer: "Electromagnetic" },
  { id: 253, lang: "en", question: "What do you use to measure phase?", options: ["Phase meter", "Spoon", "Book", "Car"], answer: "Phase meter" },
  { id: 254, lang: "en", question: "Which is a type of resonance?", options: ["Nuclear", "Book", "Pen", "Spoon"], answer: "Nuclear" },
  { id: 255, lang: "en", question: "What do you use to measure impedance?", options: ["Impedance meter", "Spoon", "Book", "Car"], answer: "Impedance meter" },
  { id: 256, lang: "en", question: "Which is a type of oscillation?", options: ["Harmonic", "Book", "Pen", "Spoon"], answer: "Harmonic" },
  { id: 257, lang: "en", question: "What do you use to measure torque?", options: ["Torque meter", "Spoon", "Book", "Car"], answer: "Torque meter" },
  { id: 258, lang: "en", question: "Which is a type of vibration?", options: ["Mechanical", "Book", "Pen", "Spoon"], answer: "Mechanical" },
  { id: 259, lang: "en", question: "What do you use to measure strain?", options: ["Strain gauge", "Spoon", "Book", "Car"], answer: "Strain gauge" },
  { id: 260, lang: "en", question: "Which is a type of stress?", options: ["Tensile", "Book", "Pen", "Spoon"], answer: "Tensile" },
  { id: 261, lang: "en", question: "What do you use to measure elasticity?", options: ["Elasticity meter", "Spoon", "Book", "Car"], answer: "Elasticity meter" },
  { id: 262, lang: "en", question: "Which is a type of deformation?", options: ["Plastic", "Book", "Pen", "Spoon"], answer: "Plastic" },
  { id: 263, lang: "en", question: "What do you use to measure viscosity?", options: ["Viscometer", "Spoon", "Book", "Car"], answer: "Viscometer" },
  { id: 264, lang: "en", question: "Which is a type of fluid?", options: ["Newtonian", "Book", "Pen", "Spoon"], answer: "Newtonian" },
  { id: 265, lang: "en", question: "What do you use to measure density?", options: ["Densimeter", "Spoon", "Book", "Car"], answer: "Densimeter" },
  { id: 266, lang: "en", question: "Which is a type of material?", options: ["Composite", "Book", "Pen", "Spoon"], answer: "Composite" },
  { id: 267, lang: "en", question: "What do you use to measure hardness?", options: ["Hardness tester", "Spoon", "Book", "Car"], answer: "Hardness tester" },
  { id: 268, lang: "en", question: "Which is a type of crystal?", options: ["Cubic", "Book", "Pen", "Spoon"], answer: "Cubic" },
  { id: 269, lang: "en", question: "What do you use to measure conductivity?", options: ["Conductivity meter", "Spoon", "Book", "Car"], answer: "Conductivity meter" },
  { id: 270, lang: "en", question: "Which is a type of semiconductor?", options: ["Silicon", "Book", "Pen", "Spoon"], answer: "Silicon" },
  { id: 271, lang: "en", question: "What do you use to measure resistivity?", options: ["Resistivity meter", "Spoon", "Book", "Car"], answer: "Resistivity meter" },
  { id: 272, lang: "en", question: "Which is a type of insulator?", options: ["Ceramic", "Book", "Pen", "Spoon"], answer: "Ceramic" },
  { id: 273, lang: "en", question: "What do you use to measure permittivity?", options: ["Permittivity meter", "Spoon", "Book", "Car"], answer: "Permittivity meter" },
  { id: 274, lang: "en", question: "Which is a type of dielectric?", options: ["Polymer", "Book", "Pen", "Spoon"], answer: "Polymer" },
  { id: 275, lang: "en", question: "What do you use to measure permeability?", options: ["Permeability meter", "Spoon", "Book", "Car"], answer: "Permeability meter" },
  { id: 276, lang: "en", question: "Which is a type of ferromagnet?", options: ["Iron", "Book", "Pen", "Spoon"], answer: "Iron" },
  { id: 277, lang: "en", question: "What do you use to measure coercivity?", options: ["Coercivity meter", "Spoon", "Book", "Car"], answer: "Coercivity meter" },
  { id: 278, lang: "en", question: "Which is a type of superconductor?", options: ["Type I", "Book", "Pen", "Spoon"], answer: "Type I" },
  { id: 279, lang: "en", question: "What do you use to measure critical temperature?", options: ["Critical temperature meter", "Spoon", "Book", "Car"], answer: "Critical temperature meter" },
  { id: 280, lang: "en", question: "Which is a type of quantum state?", options: ["Ground", "Book", "Pen", "Spoon"], answer: "Ground" },
  
  { id: 101, lang: "he", question: "איזה צבע יש לשמים?", options: ["כחול", "אדום", "ירוק", "צהוב"], answer: "כחול" },
  { id: 102, lang: "he", question: "איזה חיה נובחת?", options: ["חתול", "כלב", "דג", "ציפור"], answer: "כלב" },
  { id: 103, lang: "he", question: "מה שותים בבוקר?", options: ["תה", "מיץ", "סודה", "יין"], answer: "תה" },
  { id: 104, lang: "he", question: "מהו פרי?", options: ["תפוח", "מכונית", "כיסא", "ספר"], answer: "תפוח" },
  { id: 105, lang: "he", question: "במה כותבים?", options: ["עט", "כף", "נעל", "כובע"], answer: "עט" },
  { id: 106, lang: "he", question: "איזה יום בשבוע?", options: ["שני", "ינואר", "קיץ", "כלב"], answer: "שני" },
  { id: 107, lang: "he", question: "מה לובשים על הרגליים?", options: ["גרביים", "כפפות", "כובע", "חולצה"], answer: "גרביים" },
  { id: 108, lang: "he", question: "מהו ירק?", options: ["גזר", "תפוח", "עוגה", "חלב"], answer: "גזר" },
  { id: 109, lang: "he", question: "מה קוראים?", options: ["ספר", "נעל", "ביצה", "עץ"], answer: "ספר" },
  { id: 110, lang: "he", question: "איזו עונה?", options: ["חורף", "שני", "כלב", "עט"], answer: "חורף" },
];

const difficulties = [
  { key: "easy", label: "קל", min: 0, max: 4, count: 15 },
  { key: "medium", label: "בינוני", min: 5, max: 7, count: 20 },
  { key: "hard", label: "קשה", min: 8, max: 9, count: 25 },
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

const levelLabels: Record<string, { label: string, icon: string, color: string }> = {
  easy: { label: 'קל', icon: '🌱', color: 'from-green-400 to-green-600' },
  medium: { label: 'בינוני', icon: '🌿', color: 'from-yellow-400 to-yellow-600' },
  hard: { label: 'קשה', icon: '🌳', color: 'from-purple-400 to-purple-600' },
};

function getMistakeStats() {
  try {
    return JSON.parse(localStorage.getItem('mc-mistakes') || '{}');
  } catch {
    return {};
  }
}

function addMistake(id: number) {
  const stats = getMistakeStats();
  stats[id] = (stats[id] || 0) + 1;
  localStorage.setItem('mc-mistakes', JSON.stringify(stats));
}

function resetMistakes() {
  localStorage.removeItem('mc-mistakes');
}

function pickQuestions(all: MultipleChoiceQuestion[], lang: string, count: number) {
  const pool = all.filter((q: MultipleChoiceQuestion) => q.lang === lang);
  const stats = getMistakeStats();
  
  // מערבב את כל השאלות כדי לקבל שאלות שונות בכל פעם
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);
  
  // לוקח רק כמה שאלות עם שגיאות (אם יש)
  const mistakeQuestions = shuffledPool.filter((q: MultipleChoiceQuestion) => stats[q.id] > 0);
  const boostedCount = Math.min(3, mistakeQuestions.length); // רק 3 שאלות עם שגיאות
  const boosted = mistakeQuestions.slice(0, boostedCount);

  // לוקח שאלות אקראיות מהשאר
  const remainingQuestions = shuffledPool.filter((q: MultipleChoiceQuestion) => !boosted.includes(q));
  const randomRest = remainingQuestions.slice(0, count - boosted.length);
  
  // מערבב הכל יחד
  return [...boosted, ...randomRest].sort(() => Math.random() - 0.5);
}

export default function MultipleChoiceWrapper() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <MultipleChoice />
    </Suspense>
  );
}

function MultipleChoice() {
  const { user } = useAuthUser();
  const searchParams = useSearchParams();
  const levelParam = searchParams?.get('level') || 'easy';
  const mappedLevel = levelMap[levelParam] || 'easy';
  const [difficulty] = useState(mappedLevel);
  const [lang, setLang] = useState<'en' | 'he'>('en');
  const [questions, setQuestions] = useState<MultipleChoiceQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [showHint, setShowHint] = useState(false);
  const successAudio = useRef<HTMLAudioElement | null>(null);
  const failAudio = useRef<HTMLAudioElement | null>(null);

  const finalScore = score;
  const gamesWon = finalScore > (questions.length * 100) / 2;

  useEffect(() => {
    if (finished && user) {
      fetch('/api/games/update-stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          gameName: 'multiple-choice',
          score: finalScore,
          won: gamesWon,
        }),
      }).catch(err => console.error("Failed to update stats:", err));
    }
  }, [finished, user, finalScore, gamesWon]);

  useEffect(() => {
    if (!started) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started]);

  useEffect(() => {
    const diff = difficulties.find((d) => d.key === difficulty)!;
    // Filter questions by difficulty level
    const levelQuestions = QUESTIONS.filter(q => {
      if (difficulty === 'easy') return q.id >= 1 && q.id <= 200;
      if (difficulty === 'medium') return q.id >= 201 && q.id <= 240;
      if (difficulty === 'hard') return q.id >= 241 && q.id <= 280;
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

  const handleSelect = (option: string) => {
    setSelected(option);
    const question = questions[current];
    const isCorrect = option === question.answer;

    if (isCorrect) {
      setFeedback('נכון!');
      setScore((s) => s + 100);
      if (successAudio.current) {
        successAudio.current.currentTime = 0;
        successAudio.current.play();
      }
    } else {
      const explanation = question.explanation || `התשובה הנכונה היא "${question.answer}".`;
      setFeedback(explanation);
      addMistake(question.id);
      if (failAudio.current) {
        failAudio.current.currentTime = 0;
        failAudio.current.play();
      }
    }
  };

  const handleNext = () => {
    setFeedback(null);
    setSelected(null);
    if (current === questions.length - 1) {
      setFinished(true);
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
      {/* Top Banner Ad */}
      <AdManager showBanner={true} bannerPosition="top" testMode={false} />
      
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
            בחירה מרובה
            <span className={`inline-flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xl shadow bg-gradient-to-r ${levelLabels[difficulty].color} text-white ml-4`}>
              <span className="text-2xl">{levelLabels[difficulty].icon}</span> {levelLabels[difficulty].label}
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
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-blue-700 shadow">ניקוד: {score}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-green-700 shadow">שאלה: {current+1}/{questions.length}</div>
              <div className="bg-white bg-opacity-80 rounded-xl px-6 py-2 text-lg font-bold text-pink-700 shadow">זמן: {timer} שניות</div>
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
              <div className="text-xl font-bold text-center mb-4 animate-fade-in-slow">{questions[current].question}
                {getMistakeStats()[questions[current].id] > 0 && (
                  <span className="ml-2 px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700 font-bold align-middle">חיזוק אישי</span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {questions[current].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(option)}
                    className={`px-6 py-4 rounded-full font-bold text-lg shadow transition-all duration-200
                      ${selected === option && feedback ? (option === questions[current].answer ? 'bg-green-400 text-white scale-110 ring-4 ring-green-300 animate-correct' : 'bg-red-400 text-white scale-110 ring-4 ring-red-300 animate-wrong') : 'bg-blue-100 text-blue-700 hover:bg-blue-200 hover:scale-105'}`}
                    disabled={!!selected}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {feedback && (
                <div className={`text-center mb-4 text-2xl font-bold ${feedback==='נכון!'?'text-green-600':'text-red-500'} animate-fade-in`}>
                  {feedback}
                  {selected !== null && feedback === 'לא נכון' && (questions[current].explanation || questions[current].explanationHe) && (
                    <div className="mt-2 text-lg font-normal text-gray-700 bg-yellow-100 rounded-xl px-4 py-2 shadow animate-fade-in">
                      {questions[current].explanation && (
                        <div>הסבר: {questions[current].explanation}</div>
                      )}
                      {questions[current].explanationHe && (
                        <div className="text-blue-700 font-bold mt-2">הסבר בעברית: {questions[current].explanationHe}</div>
                      )}
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
            <div className="text-2xl font-bold text-blue-700 mb-4">כל הכבוד! סיימת את כל השאלות 🎉</div>
            <div className="text-lg font-bold text-green-700 mb-2">ניקוד סופי: {score} | זמן: {timer} שניות</div>
            <button onClick={restart} className="bg-gradient-to-r from-yellow-400 via-green-400 to-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold shadow-lg hover:from-blue-500 hover:to-green-400 transition-all duration-200 mt-4">שחק שוב</button>
          </div>
        )}
      </div>
      
      {/* Bottom Banner Ad */}
      <AdManager showBanner={true} bannerPosition="bottom" testMode={false} />
      
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