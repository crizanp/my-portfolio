// Fallback news data in case RSS feeds fail
export const fallbackGlobalNews = [
  {
    title: "RSS Feed Service Currently Unavailable",
    description: "We're working to restore the RSS feed service. Please check back later for the latest global news updates.",
    link: "#",
    pubDate: new Date().toISOString(),
    author: "System",
    category: "System",
    guid: "fallback-1",
    image: "",
    source: "System Notice",
    sourceName: "Portfolio News",
    sourceCategory: "International",
    formattedDate: new Date().toLocaleDateString()
  },
  {
    title: "Alternative News Sources",
    description: "While we work on the RSS feed issue, you can visit BBC News, CNN, or Reuters directly for the latest international news.",
    link: "https://www.bbc.com/news",
    pubDate: new Date().toISOString(),
    author: "System",
    category: "Information",
    guid: "fallback-2",
    image: "",
    source: "System Notice",
    sourceName: "Portfolio News",
    sourceCategory: "International",
    formattedDate: new Date().toLocaleDateString()
  }
];

export const fallbackNepaliNews = [
  {
    title: "आरएसएस फिड सेवा अहिले उपलब्ध छैन",
    description: "हामी आरएसएस फिड सेवा पुनर्स्थापना गर्न काम गरिरहेका छौं। कृपया नवीनतम नेपाली समाचारका लागि पछि फर्केर हेर्नुहोस्।",
    link: "#",
    pubDate: new Date().toISOString(),
    author: "System",
    category: "System",
    guid: "fallback-nepali-1",
    image: "",
    source: "System Notice",
    sourceName: "Portfolio News",
    sourceCategory: "General",
    formattedDate: new Date().toLocaleDateString()
  },
  {
    title: "वैकल्पिक समाचार स्रोतहरू",
    description: "हामीले आरएसएस फिड समस्या समाधान गर्दै गर्दा, तपाईं नवीनतम नेपाली समाचारका लागि कान्तिपुर, हिमालयन टाइम्स, वा सेतोपाटीमा सीधै जान सक्नुहुन्छ।",
    link: "https://ekantipur.com",
    pubDate: new Date().toISOString(),
    author: "System",
    category: "Information",
    guid: "fallback-nepali-2",
    image: "",
    source: "System Notice",
    sourceName: "Portfolio News",
    sourceCategory: "General",
    formattedDate: new Date().toLocaleDateString()
  }
];