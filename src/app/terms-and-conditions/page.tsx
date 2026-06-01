import type { Metadata } from "next";
import { Lora, Noto_Serif_Bengali } from "next/font/google";
import { legalContainerClassName } from "@/lib/constants/layout";

const banglaFont = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500"],
  display: "swap",
});

const englishFont = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const banglaContent = `
Styleversebangladesh.com-এ (Styleversebangladesh.com-e) স্বাগতাম! আমরা এখানে "আমরা", "আমাদের" বা "StyleVerse Bangladesh" নামেও পরিচিত। এই ওয়েবসাইট ব্যবহার করার আগে, নিচের নিয়মাবলী (niyomāboli) সাবধানে পড়ুন। এই সাইটটি ব্যবহার করার মাধ্যমে, আপনি এই নিয়মাবলীকে স্বীকার করছেন এবং এই শর্তাবলী (niyomāboli o shortobali) মেনে চলতে সম্মত হচ্ছেন (যাকে বলা হয় "ব্যবহারকারী চুক্তি" [byabaharkari chukti])। সাইটটি ব্যবহার করার মধ্য দিয়ে আপনি এই চুক্তিটি মেনে চলতে রাজি হয়েছেন বলে বিবেচিত হবে। যদি আপনি এই ব্যবহারকারী চুক্তি দ্বারা আবদ্ধ হতে না চান, তাহলে এই সাইটটি অ্যাক্সেস করবেন না, নিবন্ধন করবেন না বা ব্যবহার করবেন না। এই সাইটটি StyleVerse Bangladesh এর মালিকানাধীন এবং পরিচালিত। (নিবন্ধন নম্বর: TRAD/DNCC/057277/2022)

ভূমিকা

এই ওয়েবসাইটটি যে কোনো সময় আগে থেকে জানিয়ে এই নিয়মাবলীরযেকোনো অংশ পরিবর্তন, সংশোধন, যুক্ত বা অপসারণ করার অধিকার রাখে। পরিবর্তনগুলি সাইটে পোস্ট করা হলেই কার্যকর হবে। দয়া করে আপডেটের জন্য নিয়মিত এই নিয়মাবলী পরীক্ষা করুন। নিবন্ধন এবং শর্তাবলী পরিবर्तনের পরে সাইটটির অবিরাম ব্যবহার মানে হলো আপনি সেই পরিবর্তনগুলি মেনে নিয়েছেন।

ব্যবহারকারী আপনার, পাসওয়ার্ড এবং নিরাপত্তা

নিবন্ধন করার পর ওয়েবসাইট আপনাকে একটা পাসওয়ার্ড এবং অ্যাকাউন্ট দেবে। আপনার এই অ্যাকাউন্টের গোপনীয়তা রক্ষা করতে আপনি দায়ী। এটা মানে হলো, আপনার পাসওয়ার্ড দিয়ে কেউ যদি অন্য কিছু করে ফেলে বা আপনার অ্যাকাউন্ট ব্যবহার করে সমস্যা করে, সেক্ষেত্রে আপনিই দায়ী হবেন। তাই, কখনো যদি কেউ আপনার অ্যাকাউন্টে ঢুকে পড়ার চেষ্টা করে বা আপনার পাসওয়ার্ড জেনে ফেলে, তাহলে দেরী না করেই Styleversebangladesh.com-কে জানাতে হবে। এছাড়াও, কাজ শেষ হয়ে গেলে অবশ্যই আপনার অ্যাকাউন্ট থেকে লগ আউট করে বেরিয়ে আসতে হবে। যদি আপনি এই সব নিয়ম না মানেন, কোনো সমস্যা হলে Styleversebangladesh.com (Styleversebangladesh.com) কোনো দায় নেবে না।

সেবা

Styleversebangladesh.com (Styleversebangladesh.com) এই ওয়েবসাইটের মাধ্যমে অনেক রকমের ইন্টারনেট সেবা দেয়। এই সব সেবাকে মিলে "পরিষেবা" বলা হয়। এর মধ্যে একটা হলো ব্যবহারকারীদেরকে StyleVerse Bangladesh (StyleVerse Bangladesh) এবং অন্য বিক্রেতাদের কাছ থেকে নিজের মনের মতো জিনিসপত্র কেনার সুযোগ দেওয়া। এসব জিনিসপত্রকে মিলে "পণ্য" (পণ্য) বলা হয়। ওয়েবসাইটে দেওয়া বিভিন্ন পেমেন্ট পদ্ধতির মধ্যে যে কোনোটা দিয়ে পণ্য কেনা যায়। অর্ডার করার পর, Styleversebangladesh.com আপনাকে পণ্যটি পাঠিয়ে দেবে এবং আপনি তার মূল্যায়ন মেটানোর দায়ী হবেন।

গোপনীয়তা

ব্যবহারকারী (byabahar kari) এ দ্বারা সম্মতি জানান, স্বীকার করেন এবং একমত হন যে, তিনি Styleversebangladesh.comের (Styleversebangladesh.com) গোপনীয়তা নীতি (goponiyo niiti) পড়েছেন এবং পুরোপুরি বুঝতে পেরেছেন। এছাড়াও, ব্যবহারকারী এই গোপনীয়তা নীতির শর্তাবলী ও বিষয়বস্তু তার কাছে গ্রহণযোগ্য বলে সম্মতি জানান।

সীমিত ব্যবহারকারী

Styleversebangladesh.com ওয়েবসাইট থেকে পাওয়া তথ্য বা সফটওয়্যার কপি করা, পরিবর্তন করা, বিভিন্ন জায়গায় ছড়ানো, দেখানো বা বিক্রি করা যাবে না। এই তথ্য অন্য কোন কিছু বানাতেও না চলবে। তবে, StyleVerse Bangladeshকে উৎস হিসেবে উল্লেখ করে এবং আগে থেকে লিখিত অনুমতি নেওয়া সাপেক্ষে ওয়েবসাইটের সামগ্রী সীমিত পরিসরে কপি করা যাবে। বেশি পরিমাণে কপি করা বা বাণিজ্যিক/অবাণিজ্যিক কাজে ব্যবহারের জন্য এই তথ্য নকল করা বা ওয়েবসাইটের তথ্য পরিবর্তন করা যাবে না।

ব্যবহারকারীর আচরণ এবং নিয়ম

Styleversebangladesh.com ওয়েবসাইট এবং সেবার সুবিধা কেবল সঠিক বার্তা ও তথ্য পোস্ট এবং আপলোড করার জন্যই ব্যবহার করবেন, সে সম্পর্কে আপনি সম্মত হচ্ছেন এবং অঙ্গীকার করছেন। উদাহরণ হিসেবে ধরা যাক, কোনো সেবা ব্যবহার করার সময় আপনি নিম্নলিখিত কাজগুলো করবেন না:

মানহানি, অপব্যবহার, হয়রানি, ডাঁটা, হুমকি বা অন্যথায় অন্যের আইনি অধিকার লঙ্ঘন
কোনো অনুপযুক্ত, অপবিত্র, মানহানিকর, লঙ্ঘনকারী, অশ্লীল, অশালীন বা বেআইনি বিষয়, নাম, উপাদান বা তথ্য প্রকাশ, পোস্ট, আপলোড, বিতরণ বা প্রচার করা
সফ্টওয়্যার বা মেধা সম্পত্তি আইন দ্বারা সুরক্ষিত অন্যান্য উপাদান ধারণ করা ফাইল আপলোড করুন যদি না আপনি এর অধিকারের মালিক হন বা নিয়ন্ত্রণ করেন বা সমস্ত প্রয়োজনীয় সম্মতি না পান; আপনি এর মালিক বা নিয়ন্ত্রণ করেন বা সমস্ত প্রয়োজনীয় সম্মতি পেয়েছেন
ভাইরাস, ফাইল বা অন্য কোন অনুরূপ সফ্টওয়্যার বা প্রোগ্রাম যা ওয়েবসাইট বা অন্যের কম্পিউটারের অপারেশনকে ক্ষতিগ্রস্ত করতে পারে এমন ফাইলগুলি আপলোড বা বিতরণ
জরিপ, প্রতিযোগিতা, পিরামিড স্কিম বা চেইন লেটার পরিচালনা বা ফরওয়ার্ড
একটি পরিষেবার অন্য ব্যবহারকারীর দ্বারা পোস্ট করা কোনও ফাইল ডাউনলোড যা আপনি জানেন বা যুক্তিসঙ্গতভাবে জানা উচিত, এইভাবে আইনত বিতরণ করা যাবে না
কোনো লেখকের অ্যাট্রিবিউশন, আইনি বা অন্যান্য যথাযথ নোটিশ বা মালিকানা উপাধি বা সফ্টওয়্যারের উত্স বা উত্সের লেবেল বা আপলোড করা ফাইলে থাকা অন্যান্য উপাদান মিথ্যা বা মুছে ফেলা
কোনো আচরণবিধি বা অন্যান্য নির্দেশিকা লঙ্ঘন, যা কোনো নির্দিষ্ট পরিষেবার জন্য বা জন্য প্রযোজ্য হতে পারে
বাংলাদেশে বা বাইরে আপাতত বলবৎ কোনো প্রযোজ্য আইন বা প্রবিধান লঙ্ঘন
অপব্যবহার লঙ্ঘন, অনৈতিকভাবে ম্যানিপুলেট বা এই চুক্তির শর্তাবলী বা অন্য কোথাও থাকা ওয়েবসাইট ব্যবহারের জন্য অন্য কোন শর্তাবলীর ব্যবহার।

বিশেষ ছাড়

Styleversebangladesh.com (Styleversebangladesh.com)-এ একসাথে একটা ছাড় এর সুবিধাই পাওয়া যাবে। আপনি ফ্রি ডেলিভারি, কুপন ছাড় বা পেমেন্ট গেটওয়ে ছাড় এর মধ্যে যে কোনো একটা ব্যবহার করতে পারবেন।

কার্টে যদি কোনো ফ্রি ডেলিভারি পণ্য থাকে: তাহলে কুপন ছাড় শুধুমাত্র সেই পণ্যগুলোতেই পাওয়া যাবে যারা ফ্রী ডেলিভারির অন্তর্ভুক্ত নয়।
আপনি যদি কোনো ছাড় দেওয়া পেমেন্ট গেটওয়ে দিয়ে পেমেন্ট করেন: তাহলে কুপন ছাড় পাওয়া যাবে না।

পণ্যের বর্ণনা

Styleversebangladesh.com যথাসম্ভব নির্ভুল হওয়ার চেষ্টা করে। যাইহোক, Styleversebangladesh.com ওয়্যারেন্টি দেয় না যে পণ্যের বিবরণ বা সাইটের অন্যান্য বিষয়বস্তু সঠিক, সম্পূর্ণ, নির্ভরযোগ্য, বর্তমান বা ত্রুটি-মুক্ত। Styleversebangladesh.com দ্বারা অফার করা একটি পণ্য যদি বর্ণনা অনুযায়ী না হয়, তাহলে আপনার একমাত্র প্রতিকার হল অব্যবহৃত অবস্থায় ফেরত দেওয়া।

তৃতীয় পক্ষের সাইটের লিঙ্ক

ওয়েবসাইটটিতে অন্যান্য ওয়েবসাইটের লিঙ্ক থাকতে পারে ("লিঙ্ক করা সাইট")। লিঙ্কযুক্ত সাইটগুলি Styleversebangladesh.com বা ওয়েবসাইট-এর নিয়ন্ত্রণে নয় এবং Styleversebangladesh.com কোনও লিঙ্কযুক্ত সাইটের বিষয়বস্তুর জন্য দায়বদ্ধ নয়, যার মধ্যে সীমাবদ্ধতা ছাড়াই লিঙ্কযুক্ত সাইটে থাকা কোনও লিঙ্ক বা লিঙ্কযুক্ত সাইটে কোনও পরিবর্তন বা আপডেট . Styleversebangladesh.com যেকোন ধরনের ট্রান্সমিশনের জন্য দায়ী নয়, যাই হোক না কেন, যেকোন লিঙ্কড সাইট থেকে আপনার দ্বারা প্রাপ্ত। Styleversebangladesh.com শুধুমাত্র একটি সুবিধা হিসাবে আপনাকে এই লিঙ্কগুলি প্রদান করছে, এবং যেকোন লিঙ্কের অন্তর্ভুক্তি Styleversebangladesh.com বা লিঙ্কড সাইটগুলির ওয়েবসাইট বা এর অপারেটর বা মালিকদের সাথে আইনি উত্তরাধিকারী বা বরাদ্দ সহ কোনও অ্যাসোসিয়েশন দ্বারা অনুমোদন বোঝায় না। . ব্যবহারকারীদের অনুরোধ করা হচ্ছে এই ধরনের তথ্যের উপর নির্ভর করার আগে নিজেরাই সমস্ত তথ্যের যথার্থতা যাচাই করার জন্য।

Styleversebangladesh.com এর অপব্যবহার

এই শর্তাবলী অনুযায়ী, ব্যবহারকারীরা ওয়েবসাইটে আপলোড করা প্রতিটি উপাদান বা বিষয়বস্তুর জন্য সম্পূর্ণরূপে দায়ী। ব্যবহারকারীদের তাদের বিষয়বস্তুর জন্য আইনগতভাবে দায়বদ্ধ রাখা যেতে পারে এবং তাদের বিষয়বস্তু বা উপাদানের মধ্যে রয়েছে, উদাহরণস্বরূপ, মানহানিকর মন্তব্য বা কপিরাইট, ট্রেডমার্ক, ইত্যাদি দ্বারা সুরক্ষিত উপাদান থাকলে আইনগতভাবে দায়বদ্ধ হতে পারে। অনুগ্রহ করে আমাদের কাছে সমস্যা, আপত্তিকর বিষয়বস্তু এবং নীতি লঙ্ঘনের প্রতিবেদন করুন। আমরা নিশ্চিত করতে কাজ করি যে তালিকাভুক্ত আইটেমগুলি কপিরাইট, ট্রেডমার্ক বা তৃতীয় পক্ষের অন্যান্য মেধা সম্পত্তি অধিকার লঙ্ঘন না করে। আপনি যদি বিশ্বাস করেন যে আপনার মেধা সম্পত্তির অধিকার লঙ্ঘন করা হয়েছে, অনুগ্রহ করে আমাদের টিমকে জানান এবং আমরা তদন্ত করব৷

অর্ডার গ্রহণ এবং মূল্য নির্ধারণ

অনুগ্রহ করে মনে রাখবেন যে এমন কিছু ক্ষেত্রে রয়েছে যখন বিভিন্ন কারণে একটি আদেশ প্রক্রিয়া করা যায় না। সাইটটি যে কোনো সময় যেকোনো কারণে যেকোনো আদেশ প্রত্যাখ্যান বা বাতিল করার অধিকার সংরক্ষণ করে। আমরা অর্ডার গ্রহণ করার আগে আপনাকে ফোন নম্বর এবং ঠিকানা সহ কিন্তু সীমাবদ্ধ নয় অতিরিক্ত যাচাই বা তথ্য প্রদান করতে বলা হতে পারে। আমরা আমাদের ব্যবহারকারীদের সাইটে সবচেয়ে সঠিক মূল্যের তথ্য প্রদান করতে বদ্ধপরিকর; যাইহোক, ত্রুটিগুলি এখনও ঘটতে পারে, যেমন ক্ষেত্রে যখন কোনও আইটেমের মূল্য ওয়েবসাইটে সঠিকভাবে প্রদর্শিত হয় না। যেমন, আমরা কোনো আদেশ প্রত্যাখ্যান বা বাতিল করার অধিকার সংরক্ষণ করি। কোনো আইটেমের মূল্য ভুল হলে, আমরা আমাদের নিজস্ব বিবেচনার ভিত্তিতে নির্দেশের জন্য আপনার সাথে যোগাযোগ করতে পারি বা আপনার অর্ডার বাতিল করতে পারি এবং এই ধরনের বাতিলকরণের বিষয়ে আপনাকে অবহিত করতে পারি।

এই ওয়েবসাইটে পোস্ট করা সমস্ত মূল্য বিজ্ঞপ্তি ছাড়াই পরিবর্তন সাপেক্ষে। অর্ডার দেওয়ার শুরুতে প্রচলিত মূল্য প্রযোজ্য হবে। পোস্ট করা দামে সব ট্যাক্স এবং চার্জ অন্তর্ভুক্ত থাকে। যদি কোনো অতিরিক্ত চার্জ বা ট্যাক্স থাকে তাহলে ওয়েবসাইটে উল্লেখ করা হবে।

ট্রেডমার্ক এবং কপিরাইট

অন্যথায় নির্দেশিত না হলে বা তৃতীয় পক্ষের মালিকানাধীন কোনো মালিকানাধীন উপাদানের বিপরীতে থাকা এবং তাই স্পষ্টভাবে উল্লেখ করা না থাকলে, Styleversebangladesh.com ওয়েবসাইটের সমস্ত মেধা সম্পত্তির অধিকারের মালিক, যার মধ্যে সীমাবদ্ধতা ছাড়াই, যেকোনো এবং সমস্ত অধিকার, শিরোনাম এবং স্বার্থ রয়েছে। কপিরাইট, সম্পর্কিত অধিকার, পেটেন্ট, ইউটিলিটি মডেল, ট্রেডমার্ক, ট্রেড নেম, সার্ভিস মার্ক, ডিজাইন, জান-কী, ট্রেড সিক্রেট এবং উদ্ভাবন (পেটেন্টযোগ্য হোক বা না হোক), শুভেচ্ছা, সোর্স কোড, মেটা ট্যাগ, ডাটাবেস, টেক্সট, বিষয়বস্তু, গ্রাফিক্স, আইকন এবং হাইপারলিঙ্ক। আপনি স্বীকার করেন এবং সম্মত হন যে আপনি Styleversebangladesh.com-এর কাছ থেকে অনুমোদন না নিয়ে Styleversebangladesh.com-এর ওয়েবসাইট থেকে কোনো সামগ্রী ব্যবহার, পুনরুত্পাদন বা বিতরণ করবেন না।

পূর্বোক্তগুলি সত্ত্বেও, এটি স্পষ্টভাবে স্পষ্ট করা হয়েছে যে আপনি মালিকানা বজায় রাখবেন এবং যে কোনও পাঠ্য, ডেটা, তথ্য, ছবি, ফটোগ্রাফ, সঙ্গীত, শব্দ, ভিডিও বা যে কোনও পরিষেবা ব্যবহার করার সময় আপনি যে কোনও সামগ্রী সরবরাহ করেন বা আপলোড করেন তার জন্য সম্পূর্ণরূপে দায়ী থাকবেন। আমাদের বিভিন্ন পরিষেবা ব্যবহার করার সময় অন্যান্য উপাদান যা আপনি আপলোড, প্রেরণ বা সংরক্ষণ করতে পারেন। যাইহোক, পণ্য কাস্টমাইজেশন পরিষেবার বিষয়ে (ব্লগ এবং ফোরামের মতো অন্যান্য পরিষেবাগুলির বিপরীতে) আপনি স্পষ্টভাবে সম্মত হন যে তৃতীয় পক্ষের ব্যবহারকারীদের দ্বারা আপনার সামগ্রীর সর্বজনীন দেখার এবং পুনরুত্পাদন/ব্যবহারের জন্য ওয়েবসাইটে সামগ্রী আপলোড এবং পোস্ট করার মাধ্যমে, আপনি স্বীকার করেন ব্যবহারকারী যার দ্বারা আপনি এটি ব্যবহারের জন্য একটি অ-এক্সক্লুসিভ লাইসেন্স প্রদান করেন।

প্রত্যাবর্তন এবং প্রতিস্থাপন নীতি

এটি StyleVerse Bangladesh-এর জন্য একটি বিরল ঘটনা যেখানে গ্রাহকরা তাদের পণ্যগুলিকে ক্ষতিগ্রস্থ করেনি। কিন্তু কখনো কখনো আমরা আপনার প্রত্যাশা পূরণ করতে ব্যর্থ হতে পারি, কখনো কখনো পরিস্থিতি আমাদের পাশে থাকে না। কিন্তু এখন গ্রাহকদের এবং StyleVerse Bangladesh-এর মধ্যে একটি আস্থার বন্ধন রয়েছে, তাই, বিশ্বাসের এই বন্ধনটিকে আরও নিশ্চিত করতে এবং উত্সাহিত করার জন্য Styleversebangladesh.com আপনার কাছে পাওয়া পণ্যগুলি ফেরত দেওয়ার বিকল্প নিয়ে আসে (যদি পণ্যটি ক্ষতিগ্রস্ত হয় বা ভুলভাবে ডিজাইন করা হয়)। সেক্ষেত্রে StyleVerse Bangladesh আপনাকে বিনিময়ে তাজা পণ্য দেবে।

যদি কোনো কারণে আপনি আপনার অর্ডারের সাথে অসন্তুষ্ট হন, আপনি যতক্ষণ না আপনার আইটেম নিম্নলিখিত মানদণ্ড পূরণ করে ততক্ষণ আপনি এটি ফেরত দিতে পারেন:

এটি প্রসবের তারিখ থেকে 03 দিনের মধ্যে।
ফেরত দেওয়া বা বিনিময় করা সমস্ত আইটেম অবশ্যই অব্যবহৃত হতে হবে এবং তাদের আসল অবস্থায় সমস্ত আসল ট্যাগ এবং প্যাকেজিং অক্ষত থাকতে হবে এবং ভাঙা বা টেম্পার করা উচিত নয়।
যদি আইটেমটি একটি বিনামূল্যের প্রচারমূলক আইটেম নিয়ে আসে, তাহলে বিনামূল্যের আইটেমটিও ফেরত দিতে হবে।
পণ্যের জন্য অর্থ ফেরত/প্রতিস্থাপন StyleVerse Bangladesh টিম দ্বারা পরিদর্শন এবং চেক সাপেক্ষে।
প্রতিস্থাপন সরবরাহকারীর কাছে স্টকের প্রাপ্যতা সাপেক্ষে। যদি পণ্যটি স্টকের বাইরে থাকে তবে আপনি সম্পূর্ণ অর্থ ফেরত পাবেন, কোন প্রশ্ন জিজ্ঞাসা করা হয়নি।
অনুগ্রহ করে মনে রাখবেন যে ক্যাশ অন ডেলিভারি সুবিধার চার্জ এবং শিপিং চার্জ আপনার অর্ডারের ফেরত মূল্যে অন্তর্ভুক্ত করা হবে না কারণ এইগুলি অ-ফেরতযোগ্য চার্জ।

রিটার্ন এবং প্রতিস্থাপন জন্য কারণ

পণ্য ক্ষতিগ্রস্থ, ত্রুটিপূর্ণ বা বর্ণিত হিসাবে না.
পোশাকের জন্য মাপ অমিল।
পোশাকের রঙের অমিল।
ভুল পণ্য পাঠানো হয়েছে.

কিভাবে ফিরবেন:

আপনার অর্ডার পাওয়ার পর 03 দিনের মধ্যে info@Styleversebangladesh.com এ ইমেল করে StyleVerse Bangladesh কাস্টমার কেয়ার টিমের সাথে যোগাযোগ করুন।

একবার আমরা আপনার রিটার্ন গ্রহণ করি বা গ্রহণ করি, আমরা আমাদের শেষে পণ্যটির গুণমান পরীক্ষা করব এবং যদি ফেরত দেওয়ার কারণটি বৈধ হয়, আমরা পণ্যটিকে একটি নতুন দিয়ে প্রতিস্থাপন করব বা আমরা ফেরত নিয়ে এগিয়ে যাব।

প্রত্যর্পণ নীতি

আমরা আপনার রিটার্ন মূল্যায়ন সম্পূর্ণ করার পরে ফেরত প্রক্রিয়া করা হবে।
প্রতিস্থাপন সরবরাহকারীর কাছে স্টকের প্রাপ্যতা সাপেক্ষে। যদি পণ্যটি স্টকের বাইরে থাকে তবে আপনি সম্পূর্ণ অর্থ ফেরত পাবেন, কোন প্রশ্ন জিজ্ঞাসা করা হয়নি।
অনুগ্রহ করে মনে রাখবেন যে ক্যাশ অন ডেলিভারি সুবিধার চার্জ এবং শিপিং চার্জ আপনার অর্ডারের ফেরত মূল্যে অন্তর্ভুক্ত করা হবে না কারণ এইগুলি অ-ফেরতযোগ্য চার্জ।
আপনি যদি ক্যাশ অন ডেলিভারি (সিওডি) নির্বাচন করে থাকেন, তাহলে ফেরত দিতে হবে না কারণ আপনি আপনার অর্ডারের জন্য অর্থপ্রদান করেননি।
ক্রেডিট কার্ড, ডেবিট কার্ড, মোবাইল ব্যাঙ্কিং বা ব্যাঙ্ক ট্রান্সফার ব্যবহার করে করা অর্থপ্রদানের জন্য, আপনি আপনার নিজ নিজ অর্থ ফেরত পাবেন।
কারিগরি ত্রুটির কারণে আরও একবার অনলাইনে পেমেন্ট করা হলে, পেমেন্ট ফেরত দেওয়া হবে।
আপনি 7-10 কার্যদিবসের মধ্যে যেকোনো সময় ফেরত পাবেন। আপনি যদি এই সময়ের মধ্যে ফেরত না পান, অনুগ্রহ করে আমাদের info@Styleversebangladesh.com এ লিখুন এবং আমরা তদন্ত করব।

নির্দেশ বাতিলকরণ

আপনি একটি অর্ডার দেওয়ার পরে আপনি একটি ফোন নিশ্চিতকরণ পাবেন। আপনি যদি চান, আমাদের নিশ্চিতকরণ কল পেলে আপনি সেই অর্ডারটি বাতিল করতে পারেন। আপনি আমাদের নিশ্চিতকরণ কলে পণ্য গ্রহণ করতে সম্মত হওয়ার পরে আপনি আপনার অর্ডার বাতিল করতে পারবেন না।

আপনি যদি ক্যাশ অন ডেলিভারি (সিওডি) নির্বাচন করে থাকেন, তাহলে ফেরত দিতে হবে না কারণ আপনি আপনার অর্ডারের জন্য অর্থপ্রদান করেননি।

ক্রেডিট কার্ড, ডেবিট কার্ড, মোবাইল ব্যাঙ্কিং বা ব্যাঙ্ক ট্রান্সফার ব্যবহার করে করা অর্থপ্রদানের জন্য, আপনার অর্ডার বাতিল হওয়ার পরে আপনি আপনার নিজ অ্যাকাউন্টে ফেরত পাবেন। আপনার পুরো অর্ডারের পরিমাণ ফেরত দেওয়া হবে।

সরকারি আইন

এই শর্তাবলী আইনের নীতির বিরোধের রেফারেন্স ছাড়াই বাংলাদেশের আইন অনুসারে পরিচালিত হবে এবং নির্মিত হবে এবং এর সাথে সম্পর্কিত বিরোধগুলি ঢাকার আদালতের একচেটিয়া এখতিয়ারের অধীন হবে৷

আইনি বিরোধ

যদি আপনার এবং Styleversebangladesh.com-এর মধ্যে কোনো বিরোধ দেখা দেয়, আমাদের লক্ষ্য হল আপনাকে বিরোধ দ্রুত সমাধান করার জন্য একটি নিরপেক্ষ এবং সাশ্রয়ী উপায় প্রদান করা। তদনুসারে, আপনি এবং 'Styleversebangladesh.com' সম্মত হন যে আমরা এই চুক্তি বা আমাদের পরিষেবাগুলি থেকে উদ্ভূত আইন বা ইক্যুইটিতে যে কোনও দাবি বা বিতর্কের সমাধান করব নীচের উপধারাগুলির একটি অনুসারে বা আমরা এবং আপনি অন্যথায় লিখিতভাবে সম্মত হন৷ এই বিকল্পগুলি অবলম্বন করার আগে, আমরা আপনাকে দৃঢ়ভাবে উত্সাহিত করি যে আপনি একটি সমাধানের জন্য প্রথমে আমাদের সাথে সরাসরি যোগাযোগ করুন৷ আমরা বিকল্প বিরোধ নিষ্পত্তি পদ্ধতির মাধ্যমে বিরোধের সমাধান করার জন্য যুক্তিসঙ্গত অনুরোধ বিবেচনা করব, যেমন সালিস, মামলার বিকল্প হিসাবে।

প্রযোজ্য আইন এবং এখতিয়ার: এই শর্তাবলী বাংলাদেশে বলবৎ আইন দ্বারা ব্যাখ্যা এবং নিয়ন্ত্রিত হবে। নীচের সালিশি বিভাগ সাপেক্ষে, প্রতিটি পক্ষ এতদ্বারা ঢাকার আদালতের এখতিয়ারে জমা দিতে সম্মত হয়।
মধ্যস্থতা: এই শর্তাবলীর কারণে বা এর সাথে সম্পর্কিত যে কোনও বিতর্ক, দাবি বা বিরোধ ঢাকা, বাংলাদেশে অনুষ্ঠিত একক সালিসের সামনে ব্যক্তিগত এবং গোপনীয় বাধ্যতামূলক সালিসি দ্বারা উল্লেখ করা হবে এবং শেষ পর্যন্ত নিষ্পত্তি করা হবে। সালিসকারী এমন একজন ব্যক্তি হবেন যিনি আইনগতভাবে প্রশিক্ষিত এবং যিনি ঢাকার তথ্য প্রযুক্তি ক্ষেত্রে অভিজ্ঞতাসম্পন্ন এবং যে কোনো পক্ষ থেকে স্বাধীন। পূর্বোক্ত সত্ত্বেও, সাইটটি আদালতের মাধ্যমে আদেশমূলক বা অন্যান্য ন্যায়সঙ্গত ত্রাণের মাধ্যমে মেধা সম্পত্তি অধিকার এবং গোপনীয় তথ্য রক্ষা করার অধিকার সংরক্ষণ করে।

আপনার কার্ডে অননুমোদিত চার্জ

আপনি যদি Styleversebangladesh.com-এ করা কেনাকাটার জন্য আপনার ক্রেডিট/ডেবিট কার্ডে চার্জ দেখতে পান, কিন্তু আপনি কখনই একটি অ্যাকাউন্ট তৈরি করেননি বা সাইন আপ করেননি, তাহলে অনুগ্রহ করে আপনার পরিবারের সদস্যদের বা আপনার পক্ষ থেকে কেনাকাটা করার জন্য অনুমোদিত ব্যবসায়িক সহকর্মীদের সাথে চেক করুন, নিশ্চিত করুন যে তারা আছে কিনা। অর্ডার দেননি। আপনি যদি এখনও চার্জ চিনতে না পারেন, তাহলে অনুগ্রহ করে লেনদেনের 60 দিনের মধ্যে অননুমোদিত কেনাকাটার রিপোর্ট করুন যাতে Styleversebangladesh.com-কে তদন্ত শুরু করতে সক্ষম হয়।

প্রতারণামূলক/ব্যবসায়িক আদেশের ক্ষতি বাতিলকরণ

একটি নিরাপদ এবং নিরাপদ কেনাকাটার অভিজ্ঞতা প্রদানের জন্য, আমরা নিয়মিতভাবে প্রতারণামূলক কার্যকলাপের জন্য লেনদেন পর্যবেক্ষণ করি। কোনো সন্দেহজনক কার্যকলাপ শনাক্ত করার ক্ষেত্রে, Styleversebangladesh.com কোনো দায় ছাড়াই সমস্ত অতীত, মুলতুবি এবং ভবিষ্যতের আদেশ বাতিল করার অধিকার সংরক্ষণ করে। Styleversebangladesh.com ওয়েবসাইটে পণ্যের মূল্য নির্ধারণ এবং স্টক অনুপলব্ধতার মতো পরিস্থিতিতে অর্ডার প্রত্যাখ্যান বা বাতিল করার অধিকারও সংরক্ষণ করে। কোনো অর্ডার গ্রহণ করার আগে আমাদের অতিরিক্ত যাচাই বা তথ্যের প্রয়োজন হতে পারে। আপনার অর্ডারের সমস্ত বা কোনো অংশ বাতিল হলে বা আপনার অর্ডার গ্রহণ করার জন্য অতিরিক্ত তথ্যের প্রয়োজন হলে আমরা আপনার সাথে যোগাযোগ করব। আপনার কার্ডে চার্জ নেওয়ার পরে যদি আপনার অর্ডার বাতিল করা হয়, তাহলে উল্লিখিত পরিমাণটি আপনার কার্ড অ্যাকাউন্টে ফিরিয়ে দেওয়া হবে। বাতিল করা অর্ডারের জন্য ব্যবহৃত কোনো প্রচারমূলক ভাউচার ফেরত নাও হতে পারে।

নিম্নলিখিত পরিস্থিতিগুলির মধ্যে যেকোনটি পূরণ হলে গ্রাহককে প্রতারণামূলক হিসাবে বিবেচনা করা যেতে পারে:

গ্রাহক Styleversebangladesh.com দ্বারা পাঠানো অর্থপ্রদান যাচাইকরণ মেইলের উত্তর দেয় না
পেমেন্টের বিশদ যাচাইয়ের সময় গ্রাহক পর্যাপ্ত নথি তৈরি করতে ব্যর্থ হন
অন্য গ্রাহকের ফোন/ইমেলের অপব্যবহার
গ্রাহক অবৈধ ইমেল এবং ফোন নম্বর ব্যবহার করে।
গ্রাহক ভুল পণ্য ফেরত দেন
গ্রাহক একটি অর্ডারের জন্য অর্থ প্রদান করতে অস্বীকার করে
গ্রাহক যে কোনো অর্ডারের জন্য ছিনতাইয়ের সাথে জড়িত

ক্ষতিপূরণ

আপনি ক্ষতিপূরণ, প্রতিরক্ষা এবং Styleversebangladesh.com থেকে এবং StyleVerse Bangladesh এর বিরুদ্ধে যে কোনো এবং সমস্ত ক্ষতি, দায়, দাবি, ক্ষয়ক্ষতি, খরচ এবং ব্যয় (এর সাথে সম্পর্কিত আইনী ফি এবং বিতরণ এবং তার উপর প্রযোজ্য সুদ সহ) ক্ষতিপূরণ দিতে সম্মত হন। com যা এই শর্তাবলী অনুসারে আপনার দ্বারা সঞ্চালিত কোনো প্রতিনিধিত্ব, ওয়ারেন্টি, চুক্তি বা চুক্তি বা বাধ্যবাধকতার কোনো লঙ্ঘন বা অ-কর্মক্ষমতার কারণে উদ্ভূত, এর ফলে বা প্রদেয় হতে পারে।

ওয়ারেন্টির অস্বীকৃতি/দায়ের সীমাবদ্ধতা

Styleversebangladesh.com ওয়েবসাইটের সমস্ত তথ্য সঠিক কিনা তা নিশ্চিত করার চেষ্টা করেছে, কিন্তু Styleversebangladesh.com কোনো ডেটা, তথ্য, পণ্য বা পরিষেবার গুণমান, নির্ভুলতা বা সম্পূর্ণতা সম্পর্কিত কোনো প্রতিনিধিত্ব করে না বা কোনো প্রতিনিধিত্ব করে না। Styleversebangladesh.com কোনো প্রত্যক্ষ, পরোক্ষ, শাস্তিমূলক, আনুষঙ্গিক, বিশেষ, আনুষঙ্গিক ক্ষতি বা অন্য কোনো ক্ষতির জন্য দায়ী থাকবে না যার ফলে: (ক) পরিষেবা বা পণ্য ব্যবহার বা ব্যবহারে অক্ষমতা; (b) ব্যবহারকারীর ট্রান্সমিশন বা ডেটাতে অননুমোদিত অ্যাক্সেস বা পরিবর্তন; (গ) পরিষেবা সম্পর্কিত অন্য কোন বিষয়; সহ, সীমাবদ্ধতা ছাড়াই, ওয়েবসাইট বা পরিষেবার ব্যবহার বা কার্যকারিতার সাথে যুক্ত বা যে কোনও উপায়ে উদ্ভূত ব্যবহারের ক্ষতি, ডেটা বা লাভের ক্ষতি। StyleVerse Bangladeshও করবে না। com ওয়েবসাইট বা সম্পর্কিত পরিষেবাগুলি ব্যবহার করতে বিলম্ব বা অক্ষমতার জন্য, পরিষেবা প্রদানের বিধান বা ব্যর্থতার জন্য, বা ওয়েবসাইটের মাধ্যমে প্রাপ্ত কোনও তথ্য, সফ্টওয়্যার, পণ্য, পরিষেবা এবং সম্পর্কিত গ্রাফিক্সের জন্য, বা অন্যথায় ব্যবহারের ফলে উদ্ভূত হওয়ার জন্য দায়ী। ওয়েবসাইটের, চুক্তির ভিত্তিতে হোক না কেন, নির্যাতন, অবহেলা, কঠোর দায়বদ্ধতা বা অন্যথায়। অধিকন্তু, পর্যায়ক্রমিক রক্ষণাবেক্ষণের ক্রিয়াকলাপের সময় ওয়েবসাইটটির অনুপলব্ধতা বা প্রযুক্তিগত কারণে বা StyleVerse Bangladesh-এর নিয়ন্ত্রণের বাইরে যে কোনও কারণে ওয়েবসাইটটিতে অ্যাক্সেসের অপরিকল্পিত স্থগিতাদেশের জন্য Styleversebangladesh.com-কে দায়ী করা হবে না।

পেমেন্ট এবং শিপিং

Styleversebangladesh.com অর্থ প্রদানের পদ্ধতি হিসাবে ক্যাশ অন ডেলিভারি (সিওডি), ডেবিট/ক্রেডিট কার্ড (ভিসা, মাস্টার কার্ড, ডিবিবিএল নেক্সাস ইত্যাদি), মোবাইল ব্যাংকিং (বিকাশ, রকেট) অফার করে।

আমরা আপনার কাছে পণ্য চালানের ব্যবস্থা করব। শিপিং সময়সূচী শুধুমাত্র আনুমানিক এবং নিশ্চিত করা যাবে না। চালানে কোনো বিলম্বের জন্য আমরা দায়ী নই। কখনও কখনও, খারাপ আবহাওয়া, রাজনৈতিক প্রতিবন্ধকতা এবং অন্যান্য অপ্রত্যাশিত পরিস্থিতির কারণে বিতরণে বেশি সময় লাগতে পারে। আপনার কাছে পণ্য সরবরাহের সময় শিরোনাম এবং ক্ষতি এবং ক্ষতির ঝুঁকি আপনার কাছে চলে যায়।

ক্ষতির ঝুঁকি

Styleversebangladesh.com থেকে কেনা সমস্ত আইটেম একটি চালান চুক্তি অনুযায়ী তৈরি করা হয়। এর অর্থ হল ক্ষতির ঝুঁকি Styleversebangladesh.com-এর সাথে থাকবে যতক্ষণ না আইটেমটি আপনার কাছে হস্তান্তর করা হয়। প্রাপ্তির পরে আইটেমগুলি ক্ষতিগ্রস্ত হলে, ঝুঁকি গ্রাহকের উপর পড়ে।

জালিয়াতি সুরক্ষা নীতি

Styleversebangladesh.com একটি শক্তিশালী জালিয়াতি সনাক্তকরণ এবং সমাধান ক্ষমতার গুরুত্ব উপলব্ধি করে৷ আমরা এবং আমাদের অনলাইন পেমেন্ট অংশীদাররা সন্দেহজনক কার্যকলাপের জন্য ক্রমাগত লেনদেনগুলি নিরীক্ষণ করি এবং আমাদের দল দ্বারা ম্যানুয়াল যাচাইয়ের জন্য সম্ভাব্য প্রতারণামূলক লেনদেনগুলিকে চিহ্নিত করি৷

বিরলতম ক্ষেত্রে, যখন আমাদের দল স্পষ্টভাবে জালিয়াতির সম্ভাবনা উড়িয়ে দিতে অক্ষম হয়, তখন লেনদেন আটকে রাখা হয় এবং গ্রাহককে পরিচয় নথি সরবরাহ করার জন্য অনুরোধ করা হয়। আইডি নথিগুলি আমাদের নিশ্চিত করতে সাহায্য করে যে কেনাকাটাগুলি প্রকৃতপক্ষে একজন প্রকৃত কার্ডধারকের দ্বারা করা হয়েছে। গ্রাহকদের যেকোন অসুবিধার জন্য আমরা ক্ষমাপ্রার্থী এবং অনলাইন লেনদেনের জন্য নিরাপদ ও নিরাপদ পরিবেশ নিশ্চিত করার বৃহত্তর স্বার্থে আমাদের সাথে সহ্য করার জন্য তাদের অনুরোধ করছি।

সমাপ্তি

Styleversebangladesh.com আপনার ওয়েবসাইট বা যেকোনো পরিষেবার ব্যবহার স্থগিত বা বন্ধ করতে পারে যদি এটি বিশ্বাস করে যে, আপনি এই শর্তাবলীর কোনো শর্ত লঙ্ঘন করেছেন, লঙ্ঘন করেছেন, অপব্যবহার করেছেন বা অনৈতিকভাবে ব্যবহার করেছেন বা শোষণ করেছেন বা অন্যথায় অনৈতিকভাবে কাজ করেছেন।
এই শর্তাদি অনির্দিষ্টকালের জন্য টিকে থাকবে যতক্ষণ না এবং যতক্ষণ না Styleversebangladesh.com তাদের সমাপ্ত করতে বেছে নেয়।
যদি আপনি বা Styleversebangladesh.com আপনার ওয়েবসাইট বা যেকোন পরিষেবার ব্যবহার বন্ধ করে দেন, Styleversebangladesh.com আপনার পরিষেবার ব্যবহার সম্পর্কিত কোনও সামগ্রী বা অন্যান্য সামগ্রী মুছে ফেলতে পারে এবং এটি করার জন্য Styleversebangladesh.com-এর আপনার বা কোনও তৃতীয় পক্ষের কোনও দায় থাকবে না৷ .
আপনি যেকোন পরিষেবা বা পণ্যের জন্য অর্থপ্রদান করতে দায়বদ্ধ থাকবেন যা আপনি ইতিমধ্যে যেকোন পক্ষের দ্বারা সমাপ্তির সময় পর্যন্ত অর্ডার করেছেন। উপরন্তু, আপনি ব্যবহারকারী লাইসেন্স চুক্তি অনুযায়ী আপনার রয়্যালটি অর্থপ্রদানের অধিকারী হবেন যা আপনার কাছে বৈধভাবে জমা হয়েছে বা বলে গণ্য হয়েছে।

মেয়াদ এবং নীতি আপডেট

আমরা আমাদের সাইটে একটি বিশিষ্ট নোটিশ স্থাপন করে যে কোন সময় এই শর্তাদি এবং নীতিগুলি পরিবর্তন বা আপডেট করার অধিকার সংরক্ষণ করি। এই ধরনের পরিবর্তনগুলি এই সাইটে পোস্ট করার সাথে সাথে কার্যকর হবে৷
`;

const englishContent = `
Welcome to Styleversebangladesh.com also hereby known as “we”, “us” or “StyleVerse Bangladesh”. Please read these Terms & conditions carefully before using this Site. By using the Site, you hereby accept these terms and conditions and represent that you agree to comply with these terms and conditions (the “User Agreement”). This User Agreement is deemed effective upon your use of the Site which signifies your acceptance of these terms. If you do not agree to be bound by this User Agreement please do not access, register with or use this Site. This Site is owned and operated by StyleVerse Bangladesh. (Registration number: TRAD/DNCC/057277/2022)

The Site reserves the right to change, modify, add, or remove portions of these Terms and Conditions at any time without any prior notification. Changes will be effective when posted on the Site with no other notice provided. Please check these Terms and Conditions regularly for updates. Your continued use of the Site following the posting of changes to Terms and Conditions of use constitutes your acceptance of those changes.

Introduction

The domain name Styleversebangladesh.com (referred to as "Website") is owned by "StyleVerse Bangladesh" a company incorporated under the Companies Act, 1994(Act XVIII of 1994).

By accessing this Site, you confirm your understanding of the Terms of Use. If you do not agree to these Terms, you shall not use this website. The Site reserves the right to change, modify, add, or remove portions of these Terms at any time. Changes will be effective when posted on the Site with no other notice provided. Please check these Terms of Use regularly for updates. Your continued use of the Site following the posting of changes to these Terms of Use constitutes your acceptance of those changes.

User Account, Password, and Security

You will receive a password and account designation upon completing the Website's registration process. You shall be responsible for maintaining the confidentiality of your account & its password as well as all the transactions/requests done/received under your password or account. You agree to (a) immediately notify Styleversebangladesh.com of any unauthorized use of your password or account or any other breach of security, and (b) ensure that you exit from your account at the end of each session. Styleversebangladesh.com shall not be liable for any loss or damage arising from your failure to comply with the T&C.

Services

Styleversebangladesh.com provides a number of Internet-based services through the Web Site (all such services, collectively, the "Service"). One such service enables users to purchase custom merchandise from StyleVerse Bangladesh and various sellers.(Collectively, "Products"). The Products can be purchased through the Website through various methods of payments offered. Upon placing an order, Styleversebangladesh.com shall ship the product to you and you shall be responsible for its payment.

Privacy

The User hereby consents, expresses and agrees that he has read and fully understands the Privacy Policy of Styleversebangladesh.com. The user further consents that the terms and contents of such Privacy Policy are acceptable to him.

Limited User

The User agrees and undertakes not to reverse engineer, modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information or software obtained from the Website. Limited reproduction and copying of the content of the Website is permitted provided that StyleVerse Bangladesh's name is stated as the source and prior written permission of Styleversebangladesh.com is sought. For the removal of doubt, it is clarified that unlimited or wholesale reproduction, copying of the content for commercial or non-commercial purposes and unwarranted modification of data and information within the content of the Website is not permitted.

User Conduct and Rules

You agree and undertake to use the Website and the Service only to post and upload messages and material that are proper. By way of example, and not as a limitation, you agree and undertake that when using a Service, you will not:

Defame, abuse, harass, stalk, threaten or otherwise violate the legal rights of others
Publish, post, upload, distribute or disseminate any inappropriate, profane, defamatory, infringing, obscene, indecent or unlawful topic, name, material or information
Upload files that contain software or other material protected by intellectual property laws unless you own or control the rights thereto or have received all necessary consents; you own or control the rights thereto or have received all necessary consents
Upload or distribute files that contain viruses, corrupted files, or any other similar software or programs that may damage the operation of the Website or another's computer
Conduct or forward surveys, contests, pyramid schemes or chain letters
Download any file posted by another user of a Service that you know, or reasonably should know, cannot be legally distributed in such manner
Falsify or delete any author attributions, legal or other proper notices or proprietary designations or labels of the origin or source of software or other material contained in a file that is uploaded
Violate any code of conduct or other guidelines, which may be applicable for or to any particular Service
Violate any applicable laws or regulations for the time being in force in or outside Bangladesh
Violate abuse, unethically manipulate or exploit any of the terms and conditions of this Agreement or any other terms and conditions for the use of the Website contained elsewhere.

Discount Policy

User can avail only one method of discount at a time (free delivery, coupon discount, payment gateway discount).

if cart contains free delivery product then coupon discount will only be applicable to non free delivery products.
if customer uses a payment gateway that offers discount, then coupon discount will not be applicable.

Product Description

Styleversebangladesh.com attempts to be as accurate as possible. However, Styleversebangladesh.com does not warrant that product descriptions or other content of the site is accurate, complete, reliable, current, or error-free. If a product offered by Styleversebangladesh.com itself is not as described, your sole remedy is to return it in unused condition.

Links to Third Party Site

The Website may contain links to other websites ("Linked Sites"). The Linked Sites are not under the control of Styleversebangladesh.com or the Website and Styleversebangladesh.com is not responsible for the contents of any Linked Site, including without limitation any link contained in a Linked Site, or any changes or updates to a Linked Site. Styleversebangladesh.com is not responsible for any form of transmission, whatsoever, received by you from any Linked Site. Styleversebangladesh.com is providing these links to you only as a convenience, and the inclusion of any link does not imply endorsement by Styleversebangladesh.com or the Website of the Linked Sites or any association with its operators or owners including the legal heirs or assigns thereof. The users are requested to verify the accuracy of all information on their own before undertaking any reliance on such information.

Abusing Styleversebangladesh.com

As per these Terms, users are solely responsible for every material or content uploaded on to the Website. Users can be held legally liable for their contents and may be held legally accountable if their contents or material include, for example, defamatory comments or material protected by copyright, trademark, etc. Please report problems, offensive content and policy breaches to us. We work to ensure that listed items do not infringe upon the copyright, trademark or other intellectual property rights of third parties. If you believe that your intellectual property rights have been infringed, please notify our team and we will investigate.

Order Acceptance and Pricing

Please note that there are cases when an order cannot be processed for various reasons. The Site reserves the right to refuse or cancel any order for any reason at any given time. You may be asked to provide additional verifications or information, including but not limited to phone number and address, before we accept the order. We are determined to provide the most accurate pricing information on the Site to our users; however, errors may still occur, such as cases when the price of an item is not displayed correctly on the website. As such, we reserve the right to refuse or cancel any order. In the event that an item is mispriced, we may, at our own discretion, either contact you for instructions or cancel your order and notify you of such cancellation. We shall have the right to refuse or cancel any such orders whether or not the order has been confirmed and your debit/credit card charged.

All prices posted on this website are subject to change without notice. Prices prevailing at commencement of placing the order will apply. Posted prices do includes all taxes and charges. In case there are any additional charges or taxes the same will be mentioned on the website.

Trademarks and Copyrights

Unless otherwise indicated or anything contained to the contrary or any proprietary material owned by a third party and so expressly mentioned, Styleversebangladesh.com owns all Intellectual Property Rights to and into the Website, including, without limitation, any and all rights, title and interest in and to copyright, related rights, patents, utility models, trademarks, trade names, service marks, designs, know-how, trade secrets and inventions (whether patentable or not), goodwill, source code, meta tags, databases, text, content, graphics, icons, and hyperlinks. You acknowledge and agree that you shall not use, reproduce or distribute any content from the Website belonging to Styleversebangladesh.com without obtaining authorization from Styleversebangladesh.com.

Notwithstanding the foregoing, it is expressly clarified that you will retain ownership and shall solely be responsible for any content that you provide or upload when using any Service, including any text, data, information, images, photographs, music, sound, video or any other material which you may upload, transmit or store when making use of our various Service. However, with regard to the product customization Service (as against other Services like blogs and forums) you expressly agree that by uploading and posting content on to the Website for public viewing and reproduction/use of your content by third party users, you accept the User whereby you grant a non-exclusive license for the use of the same.

Return & Replacement Policy

It's a rare case for StyleVerse Bangladesh where customers didn't get their products unharmed. But sometimes we may fail to fulfill your expectations, sometimes situations aren't by our side. But there is now a bond of trust between customers and StyleVerse Bangladesh, So, for further ensuring and encouraging this bond of trust Styleversebangladesh.com brings you option to return the products you got (If the product is damaged or designed mistakenly.). In that case StyleVerse Bangladesh will give you fresh products in return.

If for any reason you are unsatisfied with your order, you may return it as long as your item meets the following criteria:

It is within 03 Days from the delivery date.
All items to be returned or exchanged must be unused and in their original condition with all original tags and packaging intact and should not be broken or tampered with.
If the item came with a free promotional item, the free item must also be returned.
Refund/ replacement for products are subject to inspection and checking by StyleVerse Bangladesh team.
Replacement is subject to availability of stock with the Supplier. If the product is out of stock, you will receive a full refund, no questions asked.
Please note that the Cash on Delivery convenience charge and the shipping charge would not be included in the refund value of your order as these are non-refundable charges.

Reasons for returns & replacement

Product is damaged, defective or not as described.
Size Mismatch for clothing.
Color Mismatch for clothing.
Wrong product sent.

How to return:

Contact StyleVerse Bangladesh Customer Care team by emailing info@Styleversebangladesh.com within 03 days after receiving your order.

Once we pick up or receive your return, we will do a quality check of the product at our end and if the reason for return is valid, we will replace the product with a new one or we will proceed with the refund.

Refund Policy

The refund will be processed after we have completed evaluating your return.
Replacement is subject to availability of stock with the Supplier. If the product is out of stock, you will receive a full refund, no questions asked.
Please note that the Cash on Delivery convenience charge and the shipping charge would not be included in the refund value of your order as these are non-refundable charges.
If you have selected Cash on Delivery (COD), there is no amount to refund because you haven't paid for your order.
For payments made using a Credit Card, Debit Card, Mobile Banking or Bank Transfer, you will receive a refund in your respective.
If online payment is made once more due to technical error, payment refund will be made.
You will receive a refund anytime between 7-10 working days. If you don't receive refund within this time, please write to us at info@Styleversebangladesh.com and we shall investigate.

Order Cancellation

You will get a phone confirmation after you place an order. If you wish, you can cancel that order when you receive our confirmation call. You may not be able to cancel your order after you agree to receive product on our confirmation call.

If you have selected Cash on Delivery (COD), there is no amount to refund because you haven't paid for your order.

For payments made using a Credit Card, Debit Card, Mobile Banking or Bank Transfer, you will receive a refund in your respective account after your order has been cancelled. Your entire order amount will be refunded.

Governing Law

These terms shall be governed by and constructed in accordance with the laws of Bangladesh without reference to conflict of laws principles and disputes arising in relation hereto shall be subject to the exclusive jurisdiction of the courts at Dhaka.

Legal Disputes

If a dispute arises between you and Styleversebangladesh.com, our goal is to provide you with a neutral and cost effective means of resolving the dispute quickly. Accordingly, you and 'Styleversebangladesh.com' agree that we will resolve any claim or controversy at law or equity that arises out of this Agreement or our services in accordance with one of the subsections below or as we and you otherwise agree in writing. Before resorting to these alternatives, we strongly encourage you to first contact us directly to seek a resolution. We will consider reasonable requests to resolve the dispute through alternative dispute resolution procedures, such as arbitration, as alternatives to litigation.

APPLICABLE LAW AND JURISDICTION: These Terms and Conditions shall be interpreted and governed by the laws in force in Bangladesh. Subject to the Arbitration section below, each party hereby agrees to submit to the jurisdiction of the courts of Dhaka.
ARBITRATION: Any controversy, claim or dispute arising out of or relating to these Terms and Conditions will be referred to and finally settled by private and confidential binding arbitration before a single arbitrator held in Dhaka, Bangladesh. The arbitrator shall be a person who is legally trained and who has experience in the information technology field in Dhaka and is independent of either party. Notwithstanding the foregoing, the Site reserves the right to pursue the protection of intellectual property rights and confidential information through injunctive or other equitable relief through the courts.

Unauthorized Charges on your card

If you see charges on your credit/debit card for purchases made on Styleversebangladesh.com, but you never created an account or signed up, please check with your family members or business colleagues authorized to make purchases on your behalf, to confirm that they haven't placed the order. If you're still unable to recognize the charge, please report the unauthorized purchase within 60 days of the transaction to enable Styleversebangladesh.com to begin an investigation.

Cancellation of Fraudulent/Loss to business Orders

To provide a safe and secure shopping experience, we regularly monitor transactions for fraudulent activity. In the event of detecting any suspicious activity, Styleversebangladesh.com reserves the right to cancel all past, pending and future orders without any liability. Styleversebangladesh.com also reserves the right to refuse or cancel orders in scenarios like inaccuracies in pricing of product on website and stock unavailability. We may also require additional verifications or information before accepting any order. We will contact you if all or any portion of your order is cancelled or if additional information is required to accept your order. If your order is cancelled after your card has been charged, the said amount will be reversed to your Card Account. Any promotional voucher used for the cancelled orders may not be refunded.

The customer may be considered fraudulent if any of the following scenarios are met:

Customer doesn't reply to the payment verification mail sent by Styleversebangladesh.com
Customer fails to produce adequate documents during the payment details verification
Misuse of another customer's phone/email
Customer uses invalid email and phone no.
Customer returns the wrong product
Customer refuses to pay for an order
Customer is involved in the snatch and run for any order

Indemnifications

You agree to indemnify, defend and hold harmless Styleversebangladesh.com from and against any and all losses, liabilities, claims, damages, costs and expenses (including legal fees and disbursements in connection therewith and interest chargeable thereon) asserted against or incurred by Styleversebangladesh.com that arise out of, result from, or may be payable by virtue of, any breach or non-performance of any representation, warranty, covenant or agreement made or obligation to be performed by you pursuant to these Terms.

Disclaimer of Warranties/Limitation of Liability

Styleversebangladesh.com has endeavored to ensure that all the information on the Website is correct, but Styleversebangladesh.com neither warrants nor makes any representations regarding the quality, accuracy or completeness of any data, information, product or Service. In no event shall Styleversebangladesh.com be liable for any direct, indirect, punitive, incidental, special, consequential damages or any other damages resulting from: (a) the use or the inability to use the Services or Products; (b) unauthorized access to or alteration of the user's transmissions or data; (c) any other matter relating to the services; including, without limitation, damages for loss of use, data or profits, arising out of or in any way connected with the use or performance of the Website or Service. Neither shall Styleversebangladesh.com be responsible for the delay or inability to use the Website or related services, the provision of or failure to provide Services, or for any information, software, products, services and related graphics obtained through the Website, or otherwise arising out of the use of the website, whether based on contract, tort, negligence, strict liability or otherwise. Further, Styleversebangladesh.com shall not be held responsible for non-availability of the Website during periodic maintenance operations or any unplanned suspension of access to the website that may occur due to technical reasons or for any reason beyond StyleVerse Bangladesh's control. The user understands and agrees that any material and/or data downloaded or otherwise obtained through the Website is done entirely at their own discretion and risk and they will be solely responsible for any damage to their computer systems or loss of data that results from the download of such material and/or data.

Payment & Shipping

Styleversebangladesh.com offers Cash on Delivery (COD), Debit/Credit Card (VISA, Master Card, DBBL Nexus etc.), Mobile Banking (bKash, Rocket) as payment method.

We will arrange for shipment of the products to you. Shipping schedules are estimates only and cannot be guaranteed. We are not liable for any delays in the shipments. Sometimes, delivery may take longer due to bad weather, political disruptions and other unforeseen circumstances. Title and risk of loss and damages pass on to you upon the products delivery to you.

Risk of Loss

All items purchased from Styleversebangladesh.com are made pursuant to a shipment contract. This means that the Risk of Loss shall remain with Styleversebangladesh.com until the item is transferred to you. In the event that the items are damaged after receipt, the risk falls on the customer.

Fraud Protection Policy

Styleversebangladesh.com realizes the importance of a strong fraud detection and resolution capability. We and our online payments partners monitor transactions continuously for suspicious activity and flag potentially fraudulent transactions for manual verification by our team.

In the rarest of rare cases, when our team is unable to rule out the possibility of fraud categorically, the transaction is kept on hold, and the customer is requested to provide identity documents. The ID documents help us ensure that the purchases were indeed made by a genuine card holder. We apologize for any inconvenience that may be caused to customers and request them to bear with us in the larger interest of ensuring a safe and secure environment for online transactions.

Termination

Styleversebangladesh.com may suspend or terminate your use of the Website or any Service if it believes, in its sole and absolute discretion that you have breached, violated, abused, or unethically manipulated or exploited any term of these Terms or anyway otherwise acted unethically.
These Terms will survive indefinitely unless and until Styleversebangladesh.com chooses to terminate them.
If you or Styleversebangladesh.com terminates your use of the Website or any Service, Styleversebangladesh.com may delete any content or other materials relating to your use of the Service and Styleversebangladesh.com will have no liability to you or any third party for doing so.
You shall be liable to pay for any Service or product that you have already ordered till the time of Termination by either party whatsoever. Further, you shall be entitled to your royalty payments as per the User License Agreement that has or is legally deemed accrued to you.

Term and Policy updates

We reserve the right to change or update these terms and policies at any time by placing a prominent notice on our site. Such changes shall be effective immediately upon posting to this site.
`;

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the bilingual Bangla and English Terms & Conditions for StyleVerse Bangladesh.",
  alternates: {
    canonical: "/terms-and-conditions",
  },
  openGraph: {
    title: "Terms & Conditions | StyleVerse Bangladesh",
    description:
      "Bilingual Bangla and English Terms & Conditions for StyleVerse Bangladesh.",
    url: "/terms-and-conditions",
    type: "website",
  },
};

function isHeading(block: string) {
  return (
    block.length <= 90 &&
    !block.includes("\n") &&
    !/[।.!?]$/.test(block)
  );
}

function isList(block: string) {
  const lines = block.split("\n").filter(Boolean);

  return lines.length > 1;
}

function TextBlock({ block }: { block: string }) {
  if (isHeading(block)) {
    return (
      <div className="pt-9 sm:pt-11">
        <h3 className="text-center text-3xl font-normal leading-tight text-zinc-800 sm:text-4xl lg:text-[2.45rem]">
          {block}
        </h3>
        <div className="mt-4 border-t border-zinc-200" />
      </div>
    );
  }

  if (isList(block)) {
    return (
      <ul className="list-disc space-y-2 pl-5 text-base leading-8 text-zinc-700 sm:text-[17px] sm:leading-9">
        {block.split("\n").map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-base leading-8 text-zinc-700 sm:text-[17px] sm:leading-9">
      {block}
    </p>
  );
}

function TermsDocument({
  title,
  content,
  language,
  className,
}: {
  title: string;
  content: string;
  language: string;
  className: string;
}) {
  const blocks = content
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <section lang={language} className={`${className} scroll-mt-24`}>
      <header className="text-center">
        <h2 className="text-5xl font-normal leading-tight text-zinc-800 sm:text-6xl lg:text-[4.25rem]">
          {title}
        </h2>
        <div className="mt-5 border-t border-zinc-200" />
      </header>

      <div className="mt-5 space-y-5 break-words">
        {blocks.map((block) => (
          <TextBlock key={block} block={block} />
        ))}
      </div>
    </section>
  );
}

export default function TermsAndConditionsPage() {
  return (
    <main className="bg-white">
      <div className={legalContainerClassName}>
        <div className="space-y-16 sm:space-y-20">
          <TermsDocument
            title="নিয়ম ও শর্তাদি"
            content={banglaContent}
            language="bn"
            className={banglaFont.className}
          />
          <TermsDocument
            title="Terms and Conditions"
            content={englishContent}
            language="en"
            className={englishFont.className}
          />
        </div>
      </div>
    </main>
  );
}
