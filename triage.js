(function (root) {
  "use strict";

  const examples = {
    medical: [
      "someone is injured and needs first aid",
      "there is heavy bleeding and a person is hurt",
      "my father is sick and needs medicine from a pharmacy",
      "zakhmi aadmi ko medical help aur dawa chahiye",
      "chest pain and difficulty breathing need a doctor",
      "need an ambulance for a patient",
      "a child has a fever and we need a doctor",
      "woman is ill and cannot reach the hospital"
    ],
    rescue: [
      "people are trapped in a flooded house",
      "family is stranded on the roof water is rising",
      "need rescue team to evacuate people from the building",
      "hum pani mein phans gaye hain aur rescue chahiye",
      "someone is missing after the earthquake",
      "we are stuck and cannot get out of the collapsed house",
      "people are stranded after a landslide and need evacuation",
      "flood water surrounded our house and we need to get out"
    ],
    foodWater: [
      "we need clean drinking water and food",
      "there is no water left for the family",
      "need ration groceries and meals for children",
      "ghar mein pani nahi aur khana chahiye",
      "please deliver safe water bottles to our area",
      "we have run out of food and baby milk",
      "need food packages for flood affected families",
      "piyas lagi hai pani khatam hogaya hai"
    ],
    shelter: [
      "our house collapsed and we need temporary shelter",
      "family needs a safe place to stay tonight",
      "we are homeless after the flood and need a tent",
      "ghar tabah hogaya hai rehne ki jagah chahiye",
      "roof was damaged and we cannot stay inside",
      "need a warm emergency shelter for the children",
      "our home is unsafe after the earthquake",
      "need accommodation after the fire destroyed our house"
    ],
    supplies: [
      "we need blankets clothes and hygiene supplies",
      "please bring diapers and baby supplies",
      "need a torch batteries and first aid supplies",
      "kapray kambal aur zaroori saman chahiye",
      "we are short of sanitary products and clean clothes",
      "need soap water containers and sleeping bags",
      "deliver hygiene kits for displaced families",
      "children need warm clothes and blankets"
    ],
    emotional: [
      "I am scared and need someone to talk to",
      "children are very anxious after the disaster",
      "family needs emotional support and counselling",
      "hum bohat pareshan hain kisi se baat karni hai",
      "a survivor is in distress and feeling overwhelmed",
      "I feel panicked and unsafe after the flood",
      "need a trained counsellor to support our family",
      "people are frightened and need a calm support volunteer"
    ]
  };

  const labels = {
    medical: { name: "Medical / first aid", skill: "Medical / First aid", advice: "Notify a trained medical volunteer and share the exact location. For life-threatening symptoms, contact local emergency services immediately." },
    rescue: { name: "Search & rescue", skill: "Search & rescue", advice: "Share the safest known access point and how many people need help. Contact local emergency services; do not enter an unsafe structure or flood water." },
    foodWater: { name: "Food & clean water", skill: "Delivery & logistics", advice: "Specify the number of people, safe delivery point, and urgent drinking-water needs so a logistics volunteer can coordinate supplies." },
    shelter: { name: "Emergency shelter", skill: "Delivery & logistics", advice: "Share household size and immediate safety needs. A local response team can help identify available temporary shelter." },
    supplies: { name: "Essential supplies", skill: "Delivery & logistics", advice: "List the highest-priority items and quantities, plus a safe delivery point, to help volunteers coordinate a supply drop." },
    emotional: { name: "Emotional support", skill: "Teaching / counselling", advice: "Request a trained, trusted support volunteer. If anyone may be in immediate danger, contact local emergency services or a trusted person now." }
  };

  const stopWords = new Set(["a", "an", "and", "are", "after", "at", "be", "for", "from", "has", "have", "i", "in", "is", "it", "my", "of", "our", "please", "the", "there", "this", "to", "we", "with", "you", "need", "needs", "help", "chahiye"]);
  const criticalPhrases = [
    "cannot breathe", "can't breathe", "difficulty breathing", "not breathing",
    "unconscious", "heavy bleeding", "severe bleeding", "trapped", "phans gaye",
    "water is rising", "rising water", "building is collapsing", "collapsed building",
    "immediate danger", "fire spreading", "missing child"
  ];
  const urgentPhrases = [
    "urgent", "emergency", "asap", "right now", "no drinking water",
    "no water left", "baby", "infant", "pregnant", "elderly", "tonight",
    "medicine", "medical help", "rescue", "evacuate", "blood", "bleeding"
  ];

  function tokenize(text) {
    return String(text || "").toLowerCase().match(/[a-z0-9']+/g)?.filter(word => word.length > 1 && !stopWords.has(word)) || [];
  }

  function train() {
    const model = {};
    const vocabulary = new Set();
    const classNames = Object.keys(examples);
    for (const name of classNames) {
      const counts = Object.create(null);
      let total = 0;
      for (const example of examples[name]) {
        for (const word of tokenize(example)) {
          counts[word] = (counts[word] || 0) + 1;
          total += 1;
          vocabulary.add(word);
        }
      }
      model[name] = { counts, total, documents: examples[name].length };
    }
    return { model, vocabulary, classes: classNames, totalDocuments: classNames.reduce((sum, name) => sum + model[name].documents, 0) };
  }

  const trained = train();

  function matchPhrases(text, phrases) {
    const normalized = String(text || "").toLowerCase().replace(/[’]/g, "'");
    return phrases.filter(phrase => {
      const start = normalized.indexOf(phrase);
      if (start < 0) return false;
      const prefix = normalized.slice(0, start);
      return !/(?:\bnot|\bnever|\bno longer|\baren't|\bisn't|\bwasn't)\s+(?:currently\s+)?$/.test(prefix);
    });
  }

  function classify(text) {
    const tokens = tokenize(text);
    const uniqueTokens = [...new Set(tokens)];
    const urgencySignals = matchPhrases(text, criticalPhrases);
    const urgentSignals = matchPhrases(text, urgentPhrases);
    if (!uniqueTokens.length) {
      return {
        category: "unknown", label: "More details needed", skill: "Local response team",
        confidence: 0, alternatives: [], evidence: [], priority: urgencySignals.length ? "critical" : urgentSignals.length ? "urgent" : "review",
        prioritySignals: [...new Set([...urgencySignals, ...urgentSignals])],
        advice: "Describe the kind of help needed and the affected area. If anyone is in immediate danger, contact local emergency services."
      };
    }

    const vocabularySize = trained.vocabulary.size;
    const scores = trained.classes.map(name => {
      const category = trained.model[name];
      let score = Math.log(category.documents / trained.totalDocuments);
      for (const token of tokens) {
        score += Math.log(((category.counts[token] || 0) + 1) / (category.total + vocabularySize));
      }
      return { name, score };
    }).sort((a, b) => b.score - a.score);
    const maxScore = scores[0].score;
    const weights = scores.map(item => Math.exp((item.score - maxScore) / 2.5));
    const sumWeights = weights.reduce((sum, weight) => sum + weight, 0);
    const confidence = Math.round((weights[0] / sumWeights) * 100);
    const top = scores[0].name;
    const evidence = uniqueTokens.filter(token => (trained.model[top].counts[token] || 0) > 0).slice(0, 5);
    const alternatives = scores.slice(1, 3).map((item, index) => ({
      category: item.name,
      label: labels[item.name].name,
      confidence: Math.round((weights[index + 1] / sumWeights) * 100)
    }));

    return {
      category: top,
      label: labels[top].name,
      skill: labels[top].skill,
      confidence,
      alternatives,
      evidence,
      priority: urgencySignals.length ? "critical" : urgentSignals.length ? "urgent" : "standard",
      prioritySignals: [...new Set([...urgencySignals, ...urgentSignals])],
      advice: labels[top].advice,
      model: "ReliefLink Triage NB v1"
    };
  }

  const api = { classify, version: "1.0.0", method: "Multinomial Naive Bayes with Laplace smoothing" };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.ReliefTriage = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
