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
আমরা StyleVerse Bangladesh-এ আপনার ব্যক্তিগত গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দেই। আপনি আমাদের উপর যে বিশ্বাস রেখেছেন, সেটি আমরা যত্নের সঙ্গে রক্ষা করি।

আমাদের ওয়েবসাইট বা সেবা ব্যবহার করার মাধ্যমে আপনি সম্মতি দিচ্ছেন যে, এখানে উল্লেখিত নিয়ম অনুযায়ী আমরা আপনার তথ্য সংগ্রহ ও ব্যবহার করতে পারব।

আমরা কোন তথ্য সংগ্রহ করি?

ওয়েবসাইট ব্যবহারের সময় কিছু তথ্য স্বয়ংক্রিয়ভাবে আমাদের সার্ভারে জমা হয়, যেমন—

আইপি ঠিকানা
আপনার ব্যবহৃত ডিভাইস ও ব্রাউজারের ধরন
কুকিজের মাধ্যমে প্রাপ্ত ব্রাউজিং সম্পর্কিত তথ্য

এছাড়াও আমরা আপনার কাছ থেকে ব্যক্তিগত তথ্য সংগ্রহ করতে পারি, যেমন—

নাম
ইমেইল ঠিকানা
মোবাইল নাম্বার ও যোগাযোগের তথ্য
ঠিকানা ও পোস্টাল কোড
প্রয়োজনে পেমেন্ট সংক্রান্ত তথ্য (যেমন কার্ড নাম্বার ইত্যাদি)

তথ্য সংগ্রহের উদ্দেশ্য

আমরা আপনার তথ্য ব্যবহার করি—

আপনার সাথে যোগাযোগ রাখতে
আপনাকে আমাদের সেবা দিতে
আপনার পছন্দ অনুযায়ী সাইট উন্নত করতে
প্রয়োজনীয় আইনি কারণে তথ্য সংরক্ষণে

এছাড়া, আমরা আপনার ভিজিট, ক্লিক করা লিংক বা কেনাকাটার অভ্যাস বিশ্লেষণ করে সাইটকে আরও উন্নত করার চেষ্টা করি।

তথ্য শেয়ারিং

আপনার অনুমতি ছাড়া আমরা আপনার ব্যক্তিগত তথ্য কারও সাথে বিক্রি বা শেয়ার করি না। তবে কিছু বিশেষ ক্ষেত্রে শেয়ার করা হতে পারে, যেমন—

সেবা প্রদানের জন্য প্রয়োজন হলে
আইনি বাধ্যবাধকতা থাকলে (কোর্ট অর্ডার, আইনশৃঙ্খলা বাহিনীর অনুরোধ ইত্যাদি)
অবৈধ কার্যক্রম, প্রতারণা বা নিরাপত্তাজনিত ঝুঁকি প্রতিরোধে
বিজ্ঞাপনদাতাদের সাথে কেবল সামগ্রিক/অজ্ঞাত তথ্য শেয়ার করা হতে পারে

আপনার নিয়ন্ত্রণ ও পছন্দ

আপনি যেকোনো সময় আমাদের মার্কেটিং/প্রোমোশনাল মেইল থেকে Opt-out করতে পারবেন। চাইলে আপনার অ্যাকাউন্টের তথ্য আপডেট বা সম্পূর্ণ মুছে ফেলতেও পারবেন।

আপনি যদি চান আপনার তথ্য StyleVerse Bangladesh-এর সার্ভার থেকে সম্পূর্ণ মুছে ফেলা হোক, অনুগ্রহ করে info@styleversebangladesh.com এ মেইল করুন। আমরা এক কর্মদিবসের মধ্যে প্রক্রিয়া সম্পন্ন করব।

তথ্যের নিরাপত্তা

আমাদের সার্ভার ও সিস্টেমে আপনার তথ্য সুরক্ষার জন্য প্রয়োজনীয় টেকনিক্যাল ও প্রশাসনিক ব্যবস্থা রয়েছে। কেবল অনুমোদিত কর্মীরাই আপনার তথ্য দেখতে পায় এবং শুধুমাত্র প্রয়োজন অনুযায়ী ব্যবহার করতে পারে।

তবে ইন্টারনেটের মাধ্যমে প্রেরিত তথ্য শতভাগ নিরাপদ নয়। তাই কোনো অননুমোদিত প্রবেশ বা ট্রান্সমিশন জনিত সমস্যার কারণে তথ্য ফাঁস হলে StyleVerse Bangladesh দায় নেবে না।

আপনার অধিকার

আপনার তথ্য সম্পর্কে—

আমাদের কাছে কী তথ্য আছে তা জানার অধিকার আপনার আছে
ভুল থাকলে তা সংশোধনের অনুরোধ করতে পারবেন
ডাইরেক্ট মার্কেটিং-এর জন্য তথ্য ব্যবহার বন্ধ করতে বলতে পারবেন
চাইলেই সব তথ্য মুছে ফেলার অনুরোধ করতে পারবেন

নীতিমালা পরিবর্তন

আমরা প্রয়োজনে এই প্রাইভেসি পলিসি আপডেট করতে পারি। ওয়েবসাইটে নোটিশ আকারে আপডেট জানানো হবে এবং সেটি পোস্ট হওয়ার সাথে সাথেই কার্যকর হবে।
`;

const englishContent = `
Styleversebangladesh.com respects your privacy. Styleversebangladesh.com knows that you care how information about you is used and shared, and we appreciate your trust that we will do so carefully and sensibly.

You are advised to read the Privacy Policy carefully. By accessing the services provided by Styleversebangladesh.com you agree to the collection and use of your data by Styleversebangladesh.com in the manner provided in this Privacy Policy.

What information is, or may be, collected from you?

We will automatically receive and collect certain anonymous information in standard usage logs through our Web server, including computer-identification information obtained from "cookies," sent to your browser from a web server cookie stored on your hard drive an IP address, assigned to the computer which you use the domain server through which you access our service the type of computer you're using the type of web browser you're using.

We may collect the following personally identifiable information about you -

Name including first and last name.
Alternate email address.
Mobile phone number and contact details.
ZIP/Postal code.
Financial information (like account or credit card numbers) - Opinions of features on our websites.
Other information as per our registration process.

We may also collect the following information -

About the pages you visit/access.
The links you click on our site.
The number of times you access the page.
The number of times you have shopped on our web site.

You can terminate your account at any time. However, your information may remain stored in archive on our servers even after the deletion or the termination of your account.

Who collects the information?

We will collect anonymous traffic information from you when you visit our site. We will collect personally identifiable information about you only as part of a voluntary registration process, on-line survey, or contest or any combination there of. Our advertisers may collect anonymous traffic information from their own assigned cookies to your browser. The Site contains links to other Web sites. We are not responsible for the privacy practices of such Web sites which we do not own, manage or control.

Usage of Information

We use your personal information to:

Make our bond more stronger by knowing your interests and tailoring our site to that
To get in touch with you when necessary
To provide the services requested by you
To preserve social history as governed by existing law or policy

We use contact information internally to:

direct our efforts for product improvement
contact you as a survey respondent
notify you if you win any contest; and
send you promotional materials from our contest sponsors or advertisers

Generally, we use anonymous traffic information to:

remind us of who you are in order to deliver to you a better and more personalized service from both an advertising and an editorial perspective
recognize your access privileges to our Websites
track your entries in some of our promotions, sweepstakes and contests to indicate a player's progress through the promotion and to track entries, submissions, and status in prize drawings
make sure that you don't see the same ad repeatedly
help diagnose problems with our server
administer our websites, track your session so that we can understand better how people use our sites

Sharing Information to Third Party

We will not use your financial information for any purpose other than to complete a transaction with you. We do not rent, sell or share your personal information and we will not disclose any of your personally identifiable information to third parties unless:

we have your permission
to provide products or services you've requested
to help investigate, prevent or take action regarding unlawful and illegal activities, suspected fraud, potential threat to the safety or security of any person, violations of Styleversebangladesh.com's terms of use or to defend against legal claims
Special circumstances such as compliance with subpoenas, court orders, requests/order, notices from legal authorities or law enforcement agencies requiring such disclosure.
We share your information with advertisers on an aggregate basis only.

Available Choices Regarding Information Collection and Re-distribution

You may change your interests at any time and may opt-in or opt-out of any marketing / promotional / newsletters mailings. Styleversebangladesh.com reserves the right to send you certain service related communication, considered to be a part of your Styleversebangladesh.com account without offering you the facility to opt-out. You may update your information and change your account settings at any time.

Upon request, we will remove/block your personally identifiable information from our database, thereby canceling your registration. However, your information may remain stored in archive on our servers even after the deletion or the termination of your account.

If we plan to use your personally identifiable information for any commercial purposes, we will notify you at the time we collect that information and allow you to opt-out of having your information used for those purposes.

Security Procedures to Protect Information

To protect against the loss, misuse and alteration of the information under our control, we have in place appropriate physical, electronic and managerial procedures. For example, our servers are accessible only to authorized personnel and that your information is shared with respective personnel on need to know basis to complete the transaction and to provide the services requested by you.

Although we will endeavor to safeguard the confidentiality of your personally identifiable information, transmissions made by means of the Internet cannot be made absolutely secure. By using this site, you agree that we will have no liability for disclosure of your information due to errors in transmission or unauthorized acts of third parties.

Your rights

If you are concerned about your data you have the right to request access to the personal data which we may hold or process about you. You have the right to require us to correct any inaccuracies in your data free of charge. At any stage, you also have the right to ask us to stop using your personal data for direct marketing purposes.

If you at any stage want to delete your personal data from StyleVerse Bangladesh, across all platforms, you have the full right to do so. Please send an email to info@styleversebangladesh.com, we will process your request within the next business day and will notify you about the update.

Policy updates

We reserve the right to change or update this policy at any time by placing a prominent notice on our site. Such changes shall be effective immediately upon posting to this site.
`;

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the bilingual Bangla and English Privacy Policy for StyleVerse Bangladesh.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | StyleVerse Bangladesh",
    description:
      "Bilingual Bangla and English Privacy Policy for StyleVerse Bangladesh.",
    url: "/privacy-policy",
    type: "website",
  },
};

function isHeading(block: string) {
  return (
    block.length <= 90 &&
    !block.includes("\n") &&
    !/[।.!:—-]$/.test(block)
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
      <ul className="list-disc space-y-1 pl-5 text-base leading-7 text-zinc-700 sm:text-[17px] sm:leading-8">
        {block.split("\n").map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <p className="text-base leading-7 text-zinc-700 sm:text-[17px] sm:leading-8">
      {block}
    </p>
  );
}

function PrivacyDocument({
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

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white md:bg-transparent">
      <div className={legalContainerClassName}>
        <div className="space-y-16 sm:space-y-20">
          <PrivacyDocument
            title="প্রাইভেসি পলিসি"
            content={banglaContent}
            language="bn"
            className={banglaFont.className}
          />
          <PrivacyDocument
            title="Privacy Policy"
            content={englishContent}
            language="en"
            className={englishFont.className}
          />
        </div>
      </div>
    </main>
  );
}
