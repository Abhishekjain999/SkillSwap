/**
 * SkillSwap Matching Engine
 * Calculates weighted match score between two users:
 * - Mutual Skill Compatibility: 50%
 * - Availability Overlap: 20%
 * - Skill Level Compatibility: 10%
 * - Language Compatibility: 10%
 * - Session Preferences Overlap: 10%
 */

export const calculateMatchScore = (userA, userB) => {
  if (!userA || !userB || userA._id.toString() === userB._id.toString()) {
    return { score: 0, breakdown: [], reasons: [] };
  }

  const reasons = [];
  let mutualSkillScore = 0;
  let matchedExchangePair = null;

  // 1. Mutual Skill Compatibility (Weight: 50 points)
  // Check if User A teaches something User B wants AND User B teaches something User A wants
  const aTeaches = userA.skillsTeaching || [];
  const aWants = userA.skillsLearning || [];
  const bTeaches = userB.skillsTeaching || [];
  const bWants = userB.skillsLearning || [];

  // Find direct pairs
  let aTeachesBwants = null;
  let bTeachesAwants = null;

  for (const tA of aTeaches) {
    const match = bWants.find(wB => wB.skill.toLowerCase() === tA.skill.toLowerCase());
    if (match) {
      aTeachesBwants = { skill: tA.skill, teachLevel: tA.proficiency, targetLevel: match.targetProficiency };
      break;
    }
  }

  for (const tB of bTeaches) {
    const match = aWants.find(wA => wA.skill.toLowerCase() === tB.skill.toLowerCase());
    if (match) {
      bTeachesAwants = { skill: tB.skill, teachLevel: tB.proficiency, targetLevel: match.targetProficiency };
      break;
    }
  }

  if (aTeachesBwants && bTeachesAwants) {
    // Perfect mutual bidirectional exchange!
    mutualSkillScore = 50;
    matchedExchangePair = {
      userATeaches: aTeachesBwants.skill,
      userBTeaches: bTeachesAwants.skill
    };
    reasons.push(`Perfect 2-way skill swap: You teach ${aTeachesBwants.skill} ⇄ They teach ${bTeachesAwants.skill}`);
  } else if (bTeachesAwants) {
    // User B teaches something User A wants
    mutualSkillScore = 30;
    matchedExchangePair = {
      userBTeaches: bTeachesAwants.skill,
      userATeaches: aTeaches[0]?.skill || 'Open'
    };
    reasons.push(`They teach ${bTeachesAwants.skill} which is on your wishlist`);
  } else if (aTeachesBwants) {
    // User A can teach something User B wants
    mutualSkillScore = 25;
    matchedExchangePair = {
      userATeaches: aTeachesBwants.skill,
      userBTeaches: bTeaches[0]?.skill || 'Open'
    };
    reasons.push(`You teach ${aTeachesBwants.skill} which they are eager to learn`);
  } else {
    // Partial semantic or category match
    mutualSkillScore = 10;
    reasons.push('Complementary skill domains with cross-learning potential');
  }

  // 2. Availability Overlap (Weight: 20 points)
  let availabilityScore = 5;
  const daysA = userA.availability?.days || [];
  const daysB = userB.availability?.days || [];
  const commonDays = daysA.filter(d => daysB.includes(d));

  const slotsA = userA.availability?.timeSlots || [];
  const slotsB = userB.availability?.timeSlots || [];
  const commonSlots = slotsA.filter(s => slotsB.includes(s));

  if (commonDays.length > 0 && commonSlots.length > 0) {
    availabilityScore = 20;
    reasons.push(`Overlapping schedule on ${commonDays.slice(0, 2).join(', ')} (${commonSlots[0]})`);
  } else if (commonDays.length > 0) {
    availabilityScore = 14;
    reasons.push(`Shared open days: ${commonDays.slice(0, 3).join(', ')}`);
  } else if (slotsA.length > 0 && slotsB.length > 0) {
    availabilityScore = 10;
    reasons.push('Flexible time slots match');
  }

  // 3. Skill Level Compatibility (Weight: 10 points)
  let levelScore = 5;
  if (bTeachesAwants) {
    const prof = bTeachesAwants.teachLevel;
    if (prof === 'Expert' || prof === 'Advanced') {
      levelScore = 10;
      reasons.push(`Mentor has high proficiency (${prof}) in ${bTeachesAwants.skill}`);
    } else {
      levelScore = 8;
    }
  } else {
    levelScore = 7;
  }

  // 4. Language Compatibility (Weight: 10 points)
  let languageScore = 5;
  const langsA = userA.preferences?.languages || ['English'];
  const langsB = userB.preferences?.languages || ['English'];
  const commonLangs = langsA.filter(l => langsB.map(b => b.toLowerCase()).includes(l.toLowerCase()));

  if (commonLangs.length > 0) {
    languageScore = 10;
    reasons.push(`Common spoken language: ${commonLangs.join(', ')}`);
  }

  // 5. Session Preferences Overlap (Weight: 10 points)
  let prefScore = 4;
  const formatA = userA.preferences?.format || ['Video'];
  const formatB = userB.preferences?.format || ['Video'];
  const commonFormats = formatA.filter(f => formatB.includes(f));

  if (commonFormats.length > 0) {
    prefScore += 4;
    reasons.push(`Both prefer ${commonFormats.join(' & ')} collaboration`);
  }

  if (userA.preferences?.sessionType?.some(t => userB.preferences?.sessionType?.includes(t))) {
    prefScore += 2;
  }
  prefScore = Math.min(prefScore, 10);

  const totalScore = Math.min(100, Math.round(
    mutualSkillScore + availabilityScore + levelScore + languageScore + prefScore
  ));

  return {
    score: totalScore,
    breakdown: {
      mutualSkill: { score: mutualSkillScore, max: 50, label: 'Skill Compatibility' },
      availability: { score: availabilityScore, max: 20, label: 'Availability Overlap' },
      level: { score: levelScore, max: 10, label: 'Experience Level' },
      language: { score: languageScore, max: 10, label: 'Language Match' },
      preferences: { score: prefScore, max: 10, label: 'Learning Preferences' }
    },
    reasons,
    matchedExchangePair
  };
};
