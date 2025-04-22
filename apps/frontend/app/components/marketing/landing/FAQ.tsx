import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@flarekit/ui/components/ui/accordion";

const faqs = [
  {
    question: "Is it really free to use?",
    answer:
      "Yes, the core features are completely free and open source. You can use it for personal or commercial projects without any cost. The Pro version offers additional features for scaling applications.",
  },
  {
    question: "Do I need a Cloudflare account?",
    answer:
      "Yes, you'll need a free Cloudflare account to deploy your application. The free tier includes generous limits for D1 database, Workers, and Pages.",
  },
  {
    question: "Can I use it for commercial projects?",
    answer:
      "Absolutely! The starter kit is MIT licensed, meaning you can use it in personal or commercial projects. You own your code and can modify it as needed.",
  },
  {
    question: "How is this different from other starter kits?",
    answer:
      "Our starter kit focuses on edge computing with Cloudflare, offering integrated D1 database, HonoJS for API routes, and React Router for client-side navigation - all optimized for global performance.",
  },
  {
    question: "What about updates and maintenance?",
    answer:
      "We regularly update the starter kit with security patches, new features, and dependency updates. You can easily pull updates from our repository while keeping your custom changes.",
  },
  {
    question: "Do you offer technical support?",
    answer:
      "Community support is available through GitHub discussions. Pro plan users get priority email support and direct access to the development team.",
  },
];

export default function FAQ() {
  return (
    <section id="FAQ" className="py-20 px-4 bg-white dark:bg-black">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Everything you need to know about the starter kit
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold hover:text-blue-500 dark:hover:text-blue-400">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 dark:text-gray-400">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
