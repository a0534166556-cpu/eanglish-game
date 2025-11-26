'use client';

import { useState } from 'react';

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  const faqData = [
    {
      category: "התחלה",
      questions: [
        {
          question: "איך מתחילים להשתמש באתר?",
          answer: "פשוט מאוד! לחצו על 'התחילו עכשיו' בדף הבית, בחרו רמת למידה שמתאימה לכם, והתחילו לשחק במשחקים השונים. כל משחק מותאם לרמה שלכם ויעזור לכם לשפר את האנגלית."
        },
        {
          question: "האם האתר חינמי?",
          answer: "כן! רוב המשחקים והתוכן שלנו זמינים בחינם. יש לנו גם מנוי פרימיום שמציע משחקים נוספים, הסרת פרסומות, והטבות מיוחדות."
        },
        {
          question: "איך בוחרים רמת למידה?",
          answer: "לחצו על 'בחרו רמה' בתפריט הראשי או בדף המשחקים. יש לנו 4 רמות: מתחיל, בינוני, מתקדם ואקסטרים. כל רמה מותאמת לידע הקיים שלכם באנגלית."
        }
      ]
    },
    {
      category: "משחקים",
      questions: [
        {
          question: "איזה סוגי משחקים יש באתר?",
          answer: "יש לנו מגוון רחב של משחקים: משחקי זיכרון, השלמת משפטים, בחירה מרובה, נכון/לא נכון, האזנה, תיאור תמונות, משחקי ילדים מיוחדים, ועוד הרבה יותר!"
        },
        {
          question: "איך עובדת מערכת הנקודות והפרסים?",
          answer: "כל משחק שתשחקו ייתן לכם נקודות, יהלומים ומטבעות. אתם יכולים להשתמש בהם בחנות כדי לקנות פרסים, תעודות הישג, ופריטים מיוחדים לבית שלכם."
        },
        {
          question: "האם יש משחקים לילדים?",
          answer: "בהחלט! יש לנו קטגוריה מיוחדת של משחקי ילדים עם משחקים מותאמים לגילאים צעירים, כולל אותיות, צבעים, ספירה, ומילים פשוטות."
        }
      ]
    },
    {
      category: "מנוי ותשלומים",
      questions: [
        {
          question: "מה כולל המנוי הפרימיום?",
          answer: "המנוי כולל: גישה לכל המשחקים, הסרת כל הפרסומות, משחקים אקסקלוסיביים, הטבות מיוחדות בחנות, ותמיכה עדיפית."
        },
        {
          question: "איך מבטלים מנוי?",
          answer: "אתם יכולים לבטל את המנוי בכל עת מהפרופיל שלכם. המנוי יישאר פעיל עד סוף התקופה ששילמתם עליה, ואז לא יחודש."
        },
        {
          question: "איזה אמצעי תשלום אתם מקבלים?",
          answer: "אנו מקבלים כרטיסי אשראי, PayPal, העברה בנקאית, ותשלום דרך Payoneer. כל התשלומים מאובטחים ומוצפנים."
        }
      ]
    },
    {
      category: "טכני",
      questions: [
        {
          question: "האתר לא עובד לי, מה לעשות?",
          answer: "נסו לרענן את הדף, לנקות את ה-cache של הדפדפן, או לנסות דפדפן אחר. אם הבעיה נמשכת, צרו איתנו קשר דרך דף יצירת הקשר."
        },
        {
          question: "איך משחזרים סיסמה?",
          answer: "לחצו על 'שכחתי סיסמה' בדף ההתחברות, הכניסו את כתובת האימייל שלכם, וקבלו קישור לאיפוס הסיסמה באימייל."
        },
        {
          question: "האם האתר עובד במובייל?",
          answer: "כן! האתר שלנו מותאם לכל המכשירים - מחשב, טאבלט ומובייל. אתם יכולים לשחק בכל מקום ובכל זמן."
        }
      ]
    },
    {
      category: "אחר",
      questions: [
        {
          question: "איך מצטרפים לצוות?",
          answer: "אנחנו תמיד מחפשים אנשים מוכשרים! שלחו לנו קורות חיים דרך דף יצירת הקשר עם הנושא 'הצטרפות לצוות'."
        },
        {
          question: "איך מציעים משחק חדש?",
          answer: "נשמח לשמוע את הרעיונות שלכם! שלחו לנו הודעה דרך דף יצירת הקשר עם הנושא 'הצעה למשחק חדש'."
        },
        {
          question: "איך מקבלים עדכונים על משחקים חדשים?",
          answer: "הירשמו לניוזלטר שלנו או עקבו אחרינו ברשתות החברתיות. נשלח לכם הודעה על כל משחק ותוכן חדש שאנו מוסיפים."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            שאלות נפוצות
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            מצאנו את התשובות לשאלות הנפוצות ביותר. לא מצאתם את מה שחיפשתם? 
            <a href="/contact" className="text-blue-600 hover:text-blue-800 font-semibold"> צרו איתנו קשר!</a>
          </p>
        </div>

        <div className="space-y-8">
          {faqData.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {category.category}
              </h2>
              
              <div className="space-y-4">
                {category.questions.map((item, questionIndex) => {
                  const globalIndex = categoryIndex * 100 + questionIndex;
                  const isOpen = openItems.includes(globalIndex);
                  
                  return (
                    <div key={questionIndex} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 text-right flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-lg font-semibold text-gray-800">
                          {item.question}
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-500 transform transition-transform ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">עדיין יש שאלות?</h2>
          <p className="text-xl mb-6 opacity-90">
            הצוות שלנו כאן לעזור לכם! נשמח לשמוע מכם.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/contact" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              📞 צרו קשר
            </a>
            <a 
              href="/games" 
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition-colors"
            >
              🎮 התחילו לשחק
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


