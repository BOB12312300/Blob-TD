(() => {
  "use strict";

  const SAVE_KEY = "castle-clash-slime-wars-v1";
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  const $ = (selector) => document.querySelector(selector);
  const menuScreen = $("#menuScreen");
  const gameScreen = $("#gameScreen");
  const menuContent = $("#menuContent");
  const toast = $("#toast");
  const modalRoot = $("#modalRoot");
  const shopRoot = $("#battleTowerShop");
  const mapPaths = [
    [
    { x: -18, y: 112 }, { x: 190, y: 112 }, { x: 190, y: 460 },
    { x: 450, y: 460 }, { x: 450, y: 158 }, { x: 704, y: 158 },
    { x: 704, y: 418 }, { x: 864, y: 418 }
    ],
    [
      { x: -18, y: 500 }, { x: 160, y: 500 }, { x: 160, y: 170 },
      { x: 385, y: 170 }, { x: 385, y: 435 }, { x: 640, y: 435 },
      { x: 640, y: 115 }, { x: 864, y: 115 }, { x: 864, y: 365 }
    ],
    [
      { x: -18, y: 300 }, { x: 180, y: 300 }, { x: 180, y: 90 },
      { x: 420, y: 90 }, { x: 420, y: 520 }, { x: 670, y: 520 },
      { x: 670, y: 260 }, { x: 864, y: 260 }, { x: 864, y: 418 }
    ],
    [
      { x: -18, y: 170 }, { x: 220, y: 170 }, { x: 220, y: 500 },
      { x: 500, y: 500 }, { x: 500, y: 120 }, { x: 760, y: 120 },
      { x: 760, y: 418 }, { x: 864, y: 418 }
    ],
    [
      { x: -18, y: 470 }, { x: 130, y: 470 }, { x: 130, y: 130 },
      { x: 350, y: 130 }, { x: 350, y: 485 }, { x: 580, y: 485 },
      { x: 580, y: 145 }, { x: 810, y: 145 }, { x: 810, y: 418 },
      { x: 864, y: 418 }
    ]
  ];
  let path = mapPaths[0];
  let pathLengths = path.slice(1).map((point, index) =>
    Math.hypot(point.x - path[index].x, point.y - path[index].y)
  );

  const worlds = [
    { id: 1, name: "Green Grasslands", icon: "🌿", color: ["#79b955", "#669e4b"], levels: 3 },
    { id: 2, name: "Desert Kingdom", icon: "🏜️", color: ["#d9b560", "#bb8b4b"], levels: 3 },
    { id: 3, name: "Frozen Mountains", icon: "❄️", color: ["#91c7c4", "#639da4"], levels: 3 },
    { id: 4, name: "Volcanic Lands", icon: "🌋", color: ["#b9664c", "#80433d"], levels: 3 },
    { id: 5, name: "Moonlit Marshes", icon: "🌙", color: ["#728a77", "#435b62"], levels: 3 },
    { id: 6, name: "Cloudpeak Isles", icon: "☁️", color: ["#9dc8cf", "#678dba"], levels: 3 },
    { id: 7, name: "Starfall Frontier", icon: "🌠", color: ["#7188a9", "#414e79"], levels: 3 },
    { id: 8, name: "Sunken Kingdom", icon: "🐚", color: ["#65aaa5", "#356a75"], levels: 3 },
    { id: 9, name: "Crystal Caverns", icon: "💎", color: ["#8b83c5", "#514b88"], levels: 3 },
    { id: 10, name: "Shadowwood", icon: "🌘", color: ["#637b72", "#35443f"], levels: 3 }
  ];
  const levels = [
    { world: 1, level: 1, name: "First Footprints", difficulty: "Easy", scale: 1 },
    { world: 1, level: 2, name: "Meadow Crossing", difficulty: "Normal", scale: 1.22 },
    { world: 1, level: 3, name: "The Old Orchard", difficulty: "Hard", scale: 1.5 },
    ...[2, 3, 4, 5, 6, 7, 8, 9, 10].flatMap((world) => [1, 2, 3].map((level) => ({
      world, level, name: ["Borderlands", "Deep Wilds", "World's End"][level - 1],
      difficulty: ["Normal", "Hard", "Expert"][level - 1], scale: 1 + (world - 1) * 0.48 + (level - 1) * 0.2
    })))
  ];
  const towerTypes = {
    archer: { name: "Archer Tower", icon: "🏹", cost: 50, damage: 20, cooldown: 1.2, range: 152, color: "#b88a52", attack: "arrow", description: "Reliable long-range shots." },
    fire: { name: "Fire Tower", icon: "🔥", cost: 75, damage: 30, cooldown: 1.8, range: 144, color: "#ec7042", attack: "fire", description: "Burns enemies over time." },
    ice: { name: "Ice Tower", icon: "❄️", cost: 80, damage: 10, cooldown: 1.5, range: 146, color: "#73c7db", attack: "ice", description: "Slows enemies with icy bolts." },
    cannon: { name: "Cannon Tower", icon: "💣", cost: 120, damage: 50, cooldown: 3, range: 190, color: "#6d7180", attack: "cannon", description: "Heavy splash-damage shots." },
    poison: { name: "Bog Tower", icon: "☠️", cost: 90, damage: 16, cooldown: 1.6, range: 150, color: "#83a34a", attack: "poison", description: "Poisons slimes with lingering damage." },
    lightning: { name: "Storm Tower", icon: "⚡", cost: 135, damage: 32, cooldown: 2.4, range: 170, color: "#927dd4", attack: "lightning", description: "Lightning arcs between nearby enemies." },
    wind: { name: "Gale Tower", icon: "🌪️", cost: 105, damage: 14, cooldown: 1.1, range: 138, color: "#59bda9", attack: "wind", description: "Rapid gusts push back the leading slime." },
    arcane: { name: "Arcane Tower", icon: "🔮", cost: 150, damage: 44, cooldown: 2.2, range: 178, color: "#bd83df", attack: "arcane", description: "Piercing magic bolts strike through enemy shields." },
    crystal: { name: "Crystal Tower", icon: "💎", cost: 165, damage: 52, cooldown: 2.7, range: 188, color: "#8adbed", attack: "crystal", description: "Fires focused crystal shards that pierce armor." },
    nature: { name: "Grove Tower", icon: "🌿", cost: 125, damage: 18, cooldown: .85, range: 130, color: "#8fcb6a", attack: "nature", description: "Rapidly fires nature bolts at nearby slimes." }
  };
  const enemies = {
    fire: { name: "Red Fire Slime", health: 100, speed: 58, damage: 10, reward: 10, color: "#ed5148", size: 15, icon: "🔴", description: "A warm-hearted troublemaker with a fiery glow.", special: "None" },
    blob: { name: "Green Blob Slime", health: 100, speed: 58, damage: 10, reward: 10, color: "#68bd56", size: 16, icon: "🟢", description: "A squishy grassland wanderer.", special: "None" },
    fast: { name: "Fast Slime", health: 60, speed: 102, damage: 5, reward: 12, color: "#f3d54e", size: 12, icon: "🟡", description: "Small, sunny, and surprisingly quick.", special: "Quick movement" },
    armored: { name: "Armored Slime", health: 250, speed: 35, damage: 20, reward: 25, color: "#7c99a1", size: 20, icon: "🛡️", description: "A hefty slime protected by sturdy armor.", special: "Heavy armor" },
    boss: { name: "Giant Slime Boss", health: 1500, speed: 27, damage: 50, reward: 100, color: "#a663d2", size: 29, icon: "👑", description: "A crowned colossus leading the slime forces.", special: "Boss-sized health" },
    poison: { name: "Bog Bubbler", health: 130, speed: 49, damage: 12, reward: 18, color: "#a6ce58", size: 16, icon: "🟩", description: "A marsh slime that leaves a poisonous trail.", special: "Poison cloud" },
    frost: { name: "Frost Hopper", health: 95, speed: 74, damage: 8, reward: 20, color: "#72d3e8", size: 14, icon: "🧊", description: "A nimble slime from the frozen passes.", special: "Chilling aura" },
    split: { name: "Splitling", health: 180, speed: 46, damage: 12, reward: 24, color: "#d98ddd", size: 18, icon: "🟣", description: "A strange slime that bursts into smaller blobs.", special: "Splits on defeat" },
    stormBoss: { name: "Tempest Slime", health: 2200, speed: 23, damage: 65, reward: 150, color: "#619be2", size: 33, icon: "🌩️", description: "A storm-wreathed ruler of the Cloudpeak Isles.", special: "Lightning shield" },
    shield: { name: "Crystalguard Slime", health: 210, speed: 41, damage: 16, reward: 28, color: "#69c7d1", size: 19, icon: "🛡️", description: "A crystal-armored slime that restores its protective shell.", special: "Regenerating shield reduces incoming damage." },
    healer: { name: "Glowcap Healer", health: 125, speed: 44, damage: 9, reward: 24, color: "#c5e36d", size: 16, icon: "🍄", description: "A support slime that mends nearby allies as it marches.", special: "Heals nearby enemies over time." },
    sandBoss: { name: "Dune Colossus", health: 1900, speed: 24, damage: 55, reward: 130, color: "#df9a4c", size: 31, icon: "🏜️", description: "The ancient guardian of the Starfall dunes.", special: "Sandstorm armor reduces incoming damage." },
    tideBoss: { name: "Abyssal King", health: 2500, speed: 21, damage: 70, reward: 175, color: "#438ec0", size: 34, icon: "🐙", description: "A deep-sea monarch risen from the Sunken Kingdom.", special: "Summons a protective tide shield." },
    crystal: { name: "Prism Slime", health: 260, speed: 38, damage: 19, reward: 34, color: "#a889eb", size: 20, icon: "🔷", description: "A cavern slime refracting tower shots through its crystal shell.", special: "Reflective armor reduces incoming damage." },
    shadow: { name: "Gloom Drifter", health: 155, speed: 82, damage: 16, reward: 30, color: "#627b70", size: 17, icon: "🌑", description: "A quick shadow slime that slips through the darkest paths.", special: "Moves quickly through shadow." },
    crystalBoss: { name: "Prism Sovereign", health: 2900, speed: 20, damage: 76, reward: 200, color: "#a889eb", size: 35, icon: "💠", description: "A monarch of the Crystal Caverns wrapped in refracting light.", special: "Crystal armor reduces damage until weakened." },
    shadowBoss: { name: "Nightshade Colossus", health: 3200, speed: 19, damage: 82, reward: 225, color: "#53675d", size: 36, icon: "🌘", description: "An ancient guardian awakened beneath Shadowwood.", special: "Gains speed as it approaches the castle." }
  };
  const extraMiniGames = [
    { id: "blob-dodge", title: "Blob Dodge", icon: "↔️🟢", description: "Dodge falling fire slimes and stay in the meadow as long as you can.", mode: "dodge", bestKey: "dodgeBest" },
    { id: "slime-stack", title: "Slime Stack", icon: "🟢🏗️", description: "Drop bouncing slimes carefully to build the tallest stack.", mode: "stack", bestKey: "stackBest" },
    { id: "blob-fishing", title: "Blob Fishing", icon: "🎣🟢", description: "Watch the pond for a nibble and reel in friendly blob fish.", mode: "fishing", bestKey: "fishingBest" },
    { id: "crystal-sort", title: "Crystal Sort", icon: "💎🟢", description: "Sort each colorful slime into the matching crystal basket.", mode: "sort", bestKey: "sortBest" },
    { id: "slime-volleyball", title: "Slime Volleyball", icon: "🏐🟢", description: "Bump the bouncing slime over the net before it hits the ground.", mode: "volleyball", bestKey: "volleyballBest" },
    { id: "blob-maze", title: "Blob Maze", icon: "🧭🟢", description: "Guide your blob through the hedge maze to the golden exit.", mode: "maze", bestKey: "mazeBest" },
    { id: "blob-rhythm", title: "Blob Rhythm", icon: "🎵🟢", description: "Repeat the slime's short rhythm pattern using the arrow keys.", mode: "rhythm", bestKey: "rhythmBest" },
    { id: "slime-cannon", title: "Slime Cannon", icon: "🎯💥", description: "Click the moving targets and score as many direct hits as you can.", mode: "cannon", bestKey: "cannonBest" },
    { id: "blob-garden", title: "Blob Garden", icon: "🌱🟢", description: "Harvest the garden blobs only when they are ripe and glowing.", mode: "garden", bestKey: "gardenBest" },
    { id: "slime-rescue", title: "Slime Rescue", icon: "🛟🟢", description: "Tap the wandering friendly slimes to rescue them before time runs out.", mode: "rescue", bestKey: "rescueBest" }
  ];
  const defaultSlimeboundProgress = () => ({
    seed: Math.floor(Math.random() * 0x7fffffff), x: 0, y: 0, hp: 100, worldTime: 0,
    xp: 0, level: 1, skillPoints: 0, wood: 0, woodArmor: false, kills: 0,
    skills: { health: 0, damage: 0, defence: 0 }, chopped: [], defeated: []
  });
  function normalizeSlimeboundProgress(value) {
    const defaults = defaultSlimeboundProgress();
    if (!value || typeof value !== "object") return defaults;
    const safeInt = (input, fallback, minimum = 0, maximum = Number.MAX_SAFE_INTEGER) =>
      Number.isSafeInteger(input) ? Math.max(minimum, Math.min(maximum, input)) : fallback;
    const ids = (input) => Array.isArray(input) ? input.filter((id) => typeof id === "string").slice(-5000) : [];
    return {
      seed: safeInt(value.seed, defaults.seed, 1, 0x7fffffff),
      x: Number.isFinite(value.x) ? value.x : 0,
      y: Number.isFinite(value.y) ? value.y : 0,
      hp: Number.isFinite(value.hp) ? Math.max(1, Math.min(50000, value.hp)) : 100,
      worldTime: Number.isFinite(value.worldTime) ? Math.max(0, value.worldTime) % 300 : 0,
      xp: safeInt(value.xp, 0), level: safeInt(value.level, 1, 1), skillPoints: safeInt(value.skillPoints, 0),
      wood: safeInt(value.wood, 0), woodArmor: value.woodArmor === true, kills: safeInt(value.kills, 0),
      skills: {
        health: safeInt(value.skills && value.skills.health, 0),
        damage: safeInt(value.skills && value.skills.damage, 0),
        defence: safeInt(value.skills && value.skills.defence, 0)
      },
      chopped: ids(value.chopped), defeated: ids(value.defeated)
    };
  }

  function craftSlimeboundWoodArmor() {
    if (slimebound.woodArmor) {
      slimeboundMessage("You already crafted and equipped wood armor.");
      return;
    }
    if (slimebound.wood < 10) {
      slimeboundMessage("You need 10 wood to craft wood armor. Press U near trees to gather wood.");
      return;
    }
    slimebound.wood -= 10;
    slimebound.woodArmor = true;
    saveSlimebound();
    updateSlimeboundHud();
    slimeboundMessage("Wood armor crafted and equipped! Defence increased by 5.");
    drawSlimeboundWorld();
  }

  function grantSlimeboundBonusSkillPoints() {
    if (!slimebound.active) return;
    slimebound.skillPoints += 200;
    saveSlimebound();
    updateSlimeboundHud(true);
    slimeboundMessage("A surge of knowledge fills you!");
  }
  const skins = {
    classic: { name: "Classic Stone Castle", icon: "🏰", wall: "#c5b99d", roof: "#b64c43", trim: "#756851", requirement: "Available from the beginning." },
    wooden: { name: "Wooden Fortress", icon: "🪵", wall: "#b9824b", roof: "#7c4938", trim: "#efd092", requirement: "Complete any level." },
    ice: { name: "Ice Castle", icon: "🏔️", wall: "#bde8ed", roof: "#66b6cd", trim: "#f1ffff", requirement: "Complete Grasslands Level 3." },
    lava: { name: "Lava Castle", icon: "🌋", wall: "#67505a", roof: "#ef693c", trim: "#ffcf74", requirement: "Defeat the Giant Slime Boss." },
    golden: { name: "Golden Castle", icon: "✨", wall: "#eac75c", roof: "#fff0a0", trim: "#9b6b28", gemCost: 200, requirement: "Purchase for 200 gems." },
    marsh: { name: "Marshlight Keep", icon: "🌙", wall: "#88a18b", roof: "#536c78", trim: "#d2e6a1", requirement: "Complete Moonlit Marshes." },
    cloud: { name: "Cloudpeak Citadel", icon: "☁️", wall: "#d7e9e9", roof: "#7b9cd1", trim: "#f7e6a0", requirement: "Complete Cloudpeak Isles." },
    autumn: { name: "Autumn Keep", icon: "🍂", wall: "#c89056", roof: "#a64f3f", trim: "#f0d182", gemCost: 120, requirement: "Purchase for 120 gems." },
    crystalKeep: { name: "Prism Keep", icon: "💎", wall: "#998bd2", roof: "#6655aa", trim: "#e8d8ff", requirement: "Complete Crystal Caverns." },
    shadowKeep: { name: "Shadowwood Keep", icon: "🌘", wall: "#637b72", roof: "#35443f", trim: "#c4d2a4", requirement: "Complete Shadowwood." }
  };
  const skinThemes = [
    ["Ruby", "❤️"], ["Sapphire", "💎"], ["Emerald", "🍀"], ["Amethyst", "🔮"], ["Amber", "🌟"],
    ["Rose", "🌹"], ["Turquoise", "🐚"], ["Ivory", "🕊️"], ["Obsidian", "🌑"], ["Silver", "🌙"]
  ];
  const skinStructures = [
    "Citadel", "Keep", "Bastion", "Palace", "Stronghold",
    "Manor", "Sanctum", "Fortress", "Hall", "Watchtower"
  ];
  function skinColor(hue, saturation, lightness) {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const section = hue / 60;
    const secondary = chroma * (1 - Math.abs(section % 2 - 1));
    const offset = lightness - chroma / 2;
    const channels = section < 1 ? [chroma, secondary, 0] :
      section < 2 ? [secondary, chroma, 0] :
      section < 3 ? [0, chroma, secondary] :
      section < 4 ? [0, secondary, chroma] :
      section < 5 ? [secondary, 0, chroma] : [chroma, 0, secondary];
    return `#${channels.map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, "0")).join("")}`;
  }
  for (let index = 0; index < 100; index += 1) {
    const themeIndex = Math.floor(index / 10);
    const styleIndex = index % 10;
    const hue = (themeIndex * 36 + styleIndex * 5) % 360;
    const id = `collection-${String(index + 1).padStart(3, "0")}`;
    const price = 75 + (index % 5) * 25;
    skins[id] = {
      name: `${skinThemes[themeIndex][0]} ${skinStructures[styleIndex]}`,
      icon: skinThemes[themeIndex][1],
      wall: skinColor(hue, 0.34 + (styleIndex % 3) * 0.06, 0.7 + (styleIndex % 2) * 0.06),
      roof: skinColor((hue + 185) % 360, 0.48 + (styleIndex % 3) * 0.06, 0.36 + (styleIndex % 2) * 0.07),
      trim: skinColor((hue + 38) % 360, 0.48 + (themeIndex % 3) * 0.06, 0.56 + (styleIndex % 2) * 0.07),
      gemCost: price,
      requirement: `Purchase for ${price} gems.`
    };
  }
  const achievementDefs = [
    { id: "first-victory", name: "First Victory", description: "Complete your first level.", goal: 1, reward: { gems: 20 }, metric: "victories" },
    { id: "slime-slayer", name: "Slime Slayer", description: "Defeat 25 enemies.", goal: 25, reward: { gems: 15 }, metric: "kills" },
    { id: "experienced-defender", name: "Experienced Defender", description: "Defeat 100 enemies.", goal: 100, reward: { gems: 25 }, metric: "kills" },
    { id: "boss-hunter", name: "Boss Hunter", description: "Defeat a Giant Slime Boss.", goal: 1, reward: { gems: 30 }, metric: "bosses" },
    { id: "wave-survivor", name: "Wave Survivor", description: "Complete all five waves in a level.", goal: 5, reward: { gems: 25 }, metric: "waves" },
    { id: "tower-builder", name: "Tower Builder", description: "Place 10 defensive towers.", goal: 10, reward: { gems: 15 }, metric: "towers" },
    { id: "master-strategist", name: "Master Strategist", description: "Win a level without the castle taking damage.", goal: 1, reward: { gems: 20 }, metric: "perfectWins" },
    { id: "world-explorer", name: "World Explorer", description: "Unlock a new world.", goal: 1, reward: { gems: 15 }, metric: "worlds" },
    { id: "castle-collector", name: "Castle Collector", description: "Unlock two additional castle skins.", goal: 2, reward: { gems: 20 }, metric: "skins" },
    { id: "gem-collector", name: "Gem Collector", description: "Earn 100 gems through in-game rewards.", goal: 100, reward: { gems: 25 }, metric: "earnedGems" },
    { id: "endless-veteran", name: "Endless Veteran", description: "Reach wave 10 in Endless mode.", goal: 10, reward: { gems: 30 }, metric: "endlessWave" },
    { id: "storm-breaker", name: "Storm Breaker", description: "Defeat the Tempest Slime.", goal: 1, reward: { gems: 35 }, metric: "stormBosses" },
    { id: "daily-regular", name: "Daily Defender", description: "Complete three daily challenges.", goal: 3, reward: { gems: 30 }, metric: "dailyChallenges" },
    { id: "frontier-voyager", name: "Frontier Voyager", description: "Complete a level in the Starfall Frontier.", goal: 1, reward: { gems: 25 }, metric: "frontierWins" },
    { id: "abyss-walker", name: "Abyss Walker", description: "Complete a level in the Sunken Kingdom.", goal: 1, reward: { gems: 30 }, metric: "abyssWins" },
    { id: "boss-collector", name: "Boss Collector", description: "Defeat three different major slime bosses.", goal: 3, reward: { gems: 40 }, metric: "uniqueBosses" },
    { id: "challenge-champion", name: "Challenge Champion", description: "Complete two of the three special challenge modes.", goal: 2, reward: { gems: 35 }, metric: "challengeWins" }
  ];
  const codeCatalog = {
    WELCOME100: { reward: { gems: 100 }, expires: null, maxRedemptions: 1, enabled: true },
    FROSTFRIEND: { reward: { skin: "ice" }, expires: null, maxRedemptions: 1, enabled: true }
  };

  const defaultSettings = () => ({
    music: true, sound: true, musicVolume: 28, soundVolume: 55,
    fullscreen: false, quality: "high", speed: 1,
    reducedMotion: false, highContrast: false, colorAssist: false
  });
  const defaultProgress = () => ({
    gems: 0, totalGemsEarned: 0, completedLevels: [], completedChallenges: [], defeatedBosses: [],
    discoveredEnemies: ["fire", "blob"], unlockedSkins: ["classic"],
    equippedSkin: "classic", redeemedCodes: [], achievementProgress: {},
    miniGames: {
      clickerCoins: 0, clickPower: 1, clickerLevel: 0, sprintBest: 0, popBest: 0, matchBest: 0, catcherBest: 0,
      dodgeBest: 0, stackBest: 0, fishingBest: 0, sortBest: 0, volleyballBest: 0,
      mazeBest: 0, rhythmBest: 0, cannonBest: 0, gardenBest: 0, rescueBest: 0,
      slimebound: defaultSlimeboundProgress()
    },
    dailyChallenge: { date: "", stats: { kills: 0, waves: 0, towers: 0 }, claimed: false, completions: 0 },
    settings: defaultSettings()
  });

  let progress = loadProgress();
  let menuPage = "main";
  let selectedWorld = 1;
  let activeLevel = levels[0];
  let run = null;
  const pressedShortcutKeys = new Set();
  let allWorldsShortcutActive = false;
  let slimeboundBonusShortcutActive = false;
  let mouse = { x: -100, y: -100 };
  let selectedTower = null;
  let pendingTower = null;
  let paused = false;
  let gameVisible = false;
  let lastFrame = 0;
  let animationTime = 0;
  let battleUiTimer = 0;
  let toastTimer = 0;
  let audioContext = null;
  let musicTimer = 0;
  let musicNote = 0;
  let clickerTimer = 0;
  const sprint = { active: false, over: false, elapsed: 0, score: 0, playerY: 184, velocityY: 0, obstacleTimer: 0, obstacles: [] };
  const popGame = { active: false, over: false, elapsed: 0, score: 0, spawnTimer: 0, targets: [] };
  const matchGame = { active: false, cards: [], first: -1, resolveTimer: 0, moves: 0, matchedPairs: 0 };
  const catcherGame = { active: false, over: false, elapsed: 0, score: 0, playerX: 380, spawnTimer: 0, drops: [] };
  const extraGame = {
    id: "", active: false, over: false, elapsed: 0, score: 0, lives: 3,
    x: 380, y: 170, vx: 160, lane: 1, targetType: "blob",
    spawnTimer: 0, ripe: false, phase: 0, mazeX: 0, mazeY: 0,
    sequence: [], sequenceIndex: 0, message: "", objects: []
  };
  let slimebound = normalizeSlimeboundProgress(progress.miniGames.slimebound);
  let slimeboundEntities = [];
  let slimeboundMonsters = [];
  let slimeboundGeneratedChunks = new Set();
  const slimeboundChopped = new Set(slimebound.chopped);
  const slimeboundDefeated = new Set(slimebound.defeated);
  const slimeboundKeys = new Set();
  let slimeboundAttackCooldown = 0;
  let slimeboundInventoryOpen = false;
  let slimeboundSpawnTimer = 4;
  let slimeboundSaveTimer = 0;
  let slimeboundNight = slimebound.worldTime >= 150;
  const projectiles = [];
  const particles = [];
  const floatingTexts = [];
  const treeSpots = [
    [61, 58], [325, 77], [560, 72], [835, 75], [920, 180], [85, 270],
    [320, 290], [555, 285], [837, 292], [73, 540], [280, 540], [590, 542],
    [831, 550], [905, 540], [355, 88], [770, 80], [305, 385], [552, 535]
  ];
  const flowerSpots = Array.from({ length: 64 }, (_, index) => ({
    x: (index * 167 + 41) % 950, y: (index * 97 + 33) % 600,
    color: ["#ffdf78", "#f6aaa0", "#d9c3ff", "#fff3c9"][index % 4]
  }));
  const dailyChallengeDefs = [
    { id: "slimes", title: "Marsh Patrol", description: "Defeat 20 slimes.", metric: "kills", goal: 20 },
    { id: "waves", title: "Hold the Line", description: "Complete 3 waves.", metric: "waves", goal: 3 },
    { id: "towers", title: "Ready the Defenses", description: "Place 4 towers.", metric: "towers", goal: 4 }
  ];
  const seasonalEvents = [
    { name: "Frostfall Festival", icon: "❄️", months: [11, 0, 1], bonus: 3, description: "Earn bonus battle coins from every slime." },
    { name: "Spring Bloom", icon: "🌷", months: [2, 3, 4], bonus: 3, description: "Earn bonus battle coins from every slime." },
    { name: "Summer Solstice", icon: "☀️", months: [5, 6, 7], bonus: 3, description: "Earn bonus battle coins from every slime." },
    { name: "Harvest Moon", icon: "🍂", months: [8, 9, 10], bonus: 3, description: "Earn bonus battle coins from every slime." }
  ];
  const currentSeason = () => seasonalEvents.find((event) => event.months.includes(new Date().getMonth())) || seasonalEvents[0];
  const todayKey = () => new Date().toISOString().slice(0, 10);
  const dailyChallengeForToday = () => dailyChallengeDefs[Math.floor(Date.now() / 86400000) % dailyChallengeDefs.length];

  function loadProgress() {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (!saved) return defaultProgress();
      const parsed = JSON.parse(saved);
      const defaults = defaultProgress();
      const savedProgress = { ...parsed };
      delete savedProgress.coins;
      const savedMiniGames = parsed.miniGames && typeof parsed.miniGames === "object" ? parsed.miniGames : {};
      const savedDaily = parsed.dailyChallenge && typeof parsed.dailyChallenge === "object" ? parsed.dailyChallenge : {};
      return {
        ...defaults, ...savedProgress,
        gems: Number.isFinite(parsed.gems) && parsed.gems >= 0 ? Math.floor(parsed.gems) : 0,
        totalGemsEarned: Number.isFinite(parsed.totalGemsEarned) && parsed.totalGemsEarned >= 0 ? Math.floor(parsed.totalGemsEarned) : 0,
        completedLevels: Array.isArray(parsed.completedLevels) ? parsed.completedLevels : [],
        completedChallenges: Array.isArray(parsed.completedChallenges) ? parsed.completedChallenges.filter((id) => ["boss-rush", "iron-keep", "slime-swarm"].includes(id)) : [],
        defeatedBosses: Array.isArray(parsed.defeatedBosses) ? parsed.defeatedBosses.filter((id) => ["boss", "stormBoss", "sandBoss", "tideBoss", "crystalBoss", "shadowBoss"].includes(id)) : [],
        miniGames: Object.fromEntries(Object.entries(defaults.miniGames).map(([key, defaultValue]) => {
          const value = savedMiniGames[key];
          if (key === "slimebound") return [key, normalizeSlimeboundProgress(value)];
          return [key, Number.isSafeInteger(value) && value >= 0 ? value : defaultValue];
        })),
        discoveredEnemies: Array.isArray(parsed.discoveredEnemies) ? parsed.discoveredEnemies : defaults.discoveredEnemies,
        unlockedSkins: Array.isArray(parsed.unlockedSkins) ? parsed.unlockedSkins : defaults.unlockedSkins,
        redeemedCodes: Array.isArray(parsed.redeemedCodes) ? parsed.redeemedCodes : [],
        achievementProgress: parsed.achievementProgress && typeof parsed.achievementProgress === "object" ? parsed.achievementProgress : {},
        dailyChallenge: {
          ...defaults.dailyChallenge,
          ...savedDaily,
          stats: Object.fromEntries(Object.keys(defaults.dailyChallenge.stats).map((metric) => [
            metric, Number.isSafeInteger(savedDaily.stats && savedDaily.stats[metric]) && savedDaily.stats[metric] >= 0
              ? savedDaily.stats[metric] : 0
          ])),
          completions: Number.isSafeInteger(savedDaily.completions) && savedDaily.completions >= 0 ? savedDaily.completions : 0
        },
        settings: { ...defaults.settings, ...(parsed.settings || {}) }
      };
    } catch (error) {
      console.warn("Could not load saved Blob TD progress.", error);
      return defaultProgress();
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Could not save Blob TD progress.", error);
      notify("Your progress could not be saved in this browser.");
    }
    updateWallet();
  }

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2500);
  }

  function updateWallet() {
    $("#walletGems").textContent = String(progress.gems);
  }

  function levelId(world, level) {
    return `${world}-${level}`;
  }

  function worldComplete(worldId) {
    const world = worlds.find((item) => item.id === worldId);
    return Boolean(world && Array.from({ length: world.levels }, (_, index) =>
      progress.completedLevels.includes(levelId(worldId, index + 1))
    ).every(Boolean));
  }

  function worldUnlocked(worldId) {
    return worldId === 1 || worldComplete(worldId - 1);
  }

  function levelUnlocked(worldId, levelNumber) {
    if (!worldUnlocked(worldId)) return false;
    return levelNumber === 1 || progress.completedLevels.includes(levelId(worldId, levelNumber - 1));
  }

  function levelCompleted(worldId, levelNumber) {
    return progress.completedLevels.includes(levelId(worldId, levelNumber));
  }

  function metricValue(metric) {
    if (metric === "earnedGems") return progress.totalGemsEarned;
    if (metric === "skins") return Math.max(0, progress.unlockedSkins.length - 1);
    if (metric === "endlessWave") return Number(progress.achievementProgress.endlessWave || 0);
    if (metric === "stormBosses") return Number(progress.achievementProgress.stormBosses || 0);
    if (metric === "dailyChallenges") return progress.dailyChallenge.completions;
    return Number(progress.achievementProgress[metric] || 0);
  }

  function ensureDailyChallenge() {
    if (progress.dailyChallenge.date === todayKey()) return;
    progress.dailyChallenge = {
      ...progress.dailyChallenge,
      date: todayKey(),
      stats: { kills: 0, waves: 0, towers: 0 },
      claimed: false
    };
    saveProgress();
  }

  function trackDailyChallenge(metric, amount = 1) {
    ensureDailyChallenge();
    if (!Object.prototype.hasOwnProperty.call(progress.dailyChallenge.stats, metric)) return;
    progress.dailyChallenge.stats[metric] += amount;
    saveProgress();
  }

  function refreshAchievements() {
    for (const definition of achievementDefs) {
      const value = Math.min(definition.goal, metricValue(definition.metric));
      const previous = progress.achievementProgress[definition.id] || {};
      const wasReady = Boolean(previous.ready);
      const ready = value >= definition.goal;
      progress.achievementProgress[definition.id] = {
        ...previous, value, ready, claimed: Boolean(previous.claimed)
      };
      if (ready && !wasReady && !previous.claimed) {
        notify(`Achievement unlocked: ${definition.name}!`);
        playSound("achievement");
      }
    }
  }

  function bumpMetric(metric, amount = 1) {
    const current = Number(progress.achievementProgress[metric] || 0);
    progress.achievementProgress[metric] = current + amount;
    refreshAchievements();
    ensureDailyChallenge();
    applyAccessibilitySettings();
    saveProgress();
  }

  function grantGems(amount, source, announce = true) {
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      console.error("Rejected invalid gem reward.", { amount, source });
      notify("That gem transaction could not be completed.");
      return false;
    }
    progress.gems += amount;
    if (source !== "demo-purchase") progress.totalGemsEarned += amount;
    refreshAchievements();
    saveProgress();
    if (announce) notify(`+${amount} gems${source === "demo-purchase" ? " · simulated purchase" : " earned"}!`);
    return true;
  }

  function spendGems(amount) {
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      console.error("Rejected invalid gem purchase.", { amount });
      notify("That gem transaction could not be completed.");
      return false;
    }
    if (progress.gems < amount) {
      notify("You don't have enough gems for this purchase.");
      return false;
    }
    progress.gems -= amount;
    saveProgress();
    return true;
  }

  function unlockSkin(skinId) {
    if (!skins[skinId] || progress.unlockedSkins.includes(skinId)) return false;
    progress.unlockedSkins.push(skinId);
    refreshAchievements();
    saveProgress();
    return true;
  }

  function syncProgressUnlocks() {
    if (progress.completedLevels.length > 0) unlockSkin("wooden");
    if (worldComplete(1)) unlockSkin("ice");
    if (worldComplete(5)) unlockSkin("marsh");
    if (worldComplete(6)) unlockSkin("cloud");
    if (worldComplete(9)) unlockSkin("crystalKeep");
    if (worldComplete(10)) unlockSkin("shadowKeep");
    if (progress.achievementProgress.bosses >= 1) unlockSkin("lava");
    if (worlds.some((world) => world.id > 1 && worldUnlocked(world.id))) {
      progress.achievementProgress.worlds = Math.max(1, Number(progress.achievementProgress.worlds || 0));
    }
    refreshAchievements();
    saveProgress();
  }

  function completeAllWorlds() {
    for (const level of levels) {
      const id = levelId(level.world, level.level);
      if (!progress.completedLevels.includes(id)) progress.completedLevels.push(id);
    }
    progress.unlockedSkins = [...new Set([...progress.unlockedSkins, ...Object.keys(skins)])];
    progress.discoveredEnemies = [...new Set([...progress.discoveredEnemies, ...Object.keys(enemies)])];
    syncProgressUnlocks();
    renderMenu();
    notify("All worlds, castle skins, and Enemy Index entries unlocked. Battle rewards were not added.");
  }

  function createRun(level, mode = "campaign") {
    activeLevel = level;
    const pathIndex = level.world >= 7
      ? 3 + ((level.world + level.level) % 2)
      : (level.world + level.level - 2) % 3;
    path = mapPaths[pathIndex];
    pathLengths = path.slice(1).map((point, index) =>
      Math.hypot(point.x - path[index].x, point.y - path[index].y)
    );
    const hazardKinds = ["bog", "frost", "ember"];
    const hazard = { kind: hazardKinds[(level.world + level.level - 2) % hazardKinds.length], segment: 2 + (level.level % 3) };
    const season = currentSeason();
    run = {
      world: level.world, level: level.level, coins: mode === "challenge" ? 200 : 150,
      mode, hazard, season, seasonBonus: season.bonus,
      challengeId: mode === "challenge" ? level.challengeId : null,
      castleHealth: mode === "challenge" && level.challengeId === "iron-keep" ? 60 : 100,
      autoWave: false, autoWaveTimer: 0,
      wave: 0, enemies: [], towers: [], waveQueue: [],
      spawnIndex: 0, spawnTimer: 0, countdown: 0, waveActive: false,
      completedWaves: [], defeated: 0, earnedCoins: 0, status: "ready",
      totalEnemiesDefeated: 0, startHealth: mode === "challenge" && level.challengeId === "iron-keep" ? 60 : 100,
      started: false, completionPaid: false
    };
    selectedTower = null;
    pendingTower = null;
    paused = false;
    projectiles.length = 0;
    particles.length = 0;
    floatingTexts.length = 0;
    updateBattleUI();
  }

  function enterBattle(level) {
    if (level && (!levelUnlocked(level.world, level.level))) {
      notify("Complete the previous level to unlock this one.");
      return;
    }
    if (level) createRun(level);
    else if (!run) createRun(levels[0]);
    gameVisible = true;
    menuScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    menuPage = "main";
    updateBattleUI();
    $("#mapHint").textContent = pendingTower ? "Click open grass to place your tower · Esc to cancel" : "Choose a tower, then place it on open grass.";
    playSound("menu");
  }

  function returnToMenu(page = "main") {
    gameVisible = false;
    gameScreen.classList.add("hidden");
    menuScreen.classList.remove("hidden");
    menuPage = page;
    selectedTower = null;
    pendingTower = null;
    renderMenu();
    updateWallet();
  }

  function renderMenu() {
    const pages = {
      main: renderMainMenu,
      worlds: renderWorlds,
      levels: renderLevels,
      "tower-shop": renderTowerShop,
      "enemy-index": renderEnemyIndex,
      skins: renderSkins,
      "gem-shop": renderGemShop,
      redeem: renderRedeem,
      achievements: renderAchievements,
      daily: renderDailyChallenge,
      challenges: renderChallengeModes,
      endless: renderEndless,
      settings: renderSettings,
      about: renderAbout,
      updates: renderUpdates,
      coming: renderComing,
      minigames: renderMiniGames,
      clicker: renderBlobClicker,
      "slime-sprint": renderSlimeSprint,
      "blob-pop": renderBlobPop,
      "blob-match": renderBlobMatch,
      "blob-catcher": renderBlobCatcher,
      slimebound: renderSlimebound
    };
    const extraPage = extraMiniGames.find((game) => game.id === menuPage);
    slimebound.active = menuPage === "slimebound";
    (pages[menuPage] || (extraPage ? () => renderExtraMiniGame(extraPage) : renderMainMenu))();
    updateWallet();
  }

  function pageHeader(title, subtitle, extra = "") {
    return `<div class="page-header"><div><span class="eyebrow">BLOB TD · SLIME WARS</span><h1>${title}</h1><p>${subtitle}</p></div><div class="page-actions">${extra}<button class="back-button" data-action="home">⌂ Main menu</button></div></div>`;
  }

  function renderMainMenu() {
    const entries = [
      ["▶", "PLAY", "Choose a world and level", "worlds", true],
      ["🏹", "TOWERS", "Browse defensive towers", "tower-shop"],
      ["📖", "ENEMY INDEX", "Study discovered slimes", "enemy-index"],
      ["🏰", "CASTLE SKINS", "Customize your castle", "skins"],
      ["💎", "GEM SHOP", "Optional cosmetic currency", "gem-shop"],
      ["🎟️", "REDEEM CODE", "Claim a promotional reward", "redeem"],
      ["🏆", "ACHIEVEMENTS", "Challenges and rewards", "achievements"],
      ["📅", "DAILY CHALLENGE", "A fresh task every day", "daily"],
      ["♾️", "ENDLESS MODE", "Survive endless waves", "endless"],
      ["⚔️", "CHALLENGE MODES", "Three optional rule sets", "challenges"],
      ["🎮", "MINI GAMES", "16 blob-themed arcade games", "minigames"],
      ["⚙️", "SETTINGS", "Audio, display and progress", "settings"],
      ["✨", "NEW CONTENT", "What was added in version 2.1", "updates"],
      ["🔭", "WHAT'S COMING", "Version 2.1 features are here", "coming"]
    ];
    const resume = run && run.status !== "victory" && run.status !== "gameover";
    menuContent.innerHTML = `
      <section class="hero">
        <span class="eyebrow">A cozy fantasy tower defense adventure</span>
        <div class="hero-art" aria-hidden="true">🏰　🛡️　🟢</div>
        <h1>Blob TD</h1>
        <p>Build brave defenses. Outwit the slime invasion. Save your castle!</p>
        ${resume ? '<button class="primary-button" data-action="resume" style="margin-top:18px">↗ Resume battle</button>' : ""}
      </section>
      <div class="menu-grid">${entries.map(([icon, label, caption, page, primary]) =>
        `<button class="menu-card ${primary ? "play-card" : ""}" data-page="${page}"><span class="menu-icon">${icon}</span><strong>${label}</strong><small>${caption}</small></button>`
      ).join("")}</div>
      <p class="menu-footer">Your castle, your strategy, your story. All core levels are free to play.</p>`;
  }

  function renderWorlds() {
    menuContent.innerHTML = `${pageHeader("Choose your world", "Ten lands await. Finish a world's levels to open the next.")}<div class="content-grid">${worlds.map((world) => {
      const unlocked = worldUnlocked(world.id);
      const complete = worldComplete(world.id);
      return `<article class="content-card ${unlocked ? "" : "locked-card"}">
        <div class="card-icon">${unlocked ? world.icon : "🔒"}</div><h2>World ${world.id}: ${world.name}</h2>
        <p>${unlocked ? `${world.levels} levels · ${complete ? "World complete!" : "Defend the road and push onward."}` : `Locked · Complete every level in ${worlds[world.id - 2].name}.`}</p>
        <div class="card-row"><span class="card-tag">${complete ? "COMPLETE" : unlocked ? "UNLOCKED" : "LOCKED"}</span>
        <button class="small-button" data-action="world" data-world="${world.id}" ${unlocked ? "" : "disabled"}>${unlocked ? "View levels" : "Locked"}</button></div>
      </article>`;
    }).join("")}</div>`;
  }

  function renderLevels() {
    const world = worlds.find((item) => item.id === selectedWorld) || worlds[0];
    menuContent.innerHTML = `${pageHeader(`World ${world.id}: ${world.name}`, "Select an unlocked level. Clear all three levels to open the next world.", '<button class="back-button" data-page="worlds">← Worlds</button>')}<div class="level-grid">${levels.filter((item) => item.world === world.id).map((item) => {
      const unlocked = levelUnlocked(item.world, item.level);
      const complete = levelCompleted(item.world, item.level);
      return `<article class="content-card level-card ${unlocked ? "" : "locked-card"}">
        <div class="level-number">${unlocked ? item.level : "🔒"}</div><h2>Level ${item.level}</h2>
        <p>${item.name} · <span class="${item.difficulty === "Easy" ? "status-good" : ""}">${item.difficulty}</span></p>
        <div class="card-row"><span class="card-tag">${complete ? "✓ COMPLETE" : unlocked ? "READY" : "LOCKED"}</span>
        <button class="small-button" data-action="level" data-world="${item.world}" data-level="${item.level}" ${unlocked ? "" : "disabled"}>${complete ? "Replay" : unlocked ? "Play" : "Locked"}</button></div>
      </article>`;
    }).join("")}</div>`;
  }

  function renderTowerShop() {
    menuContent.innerHTML = `${pageHeader("Defender's tower shop", "Ten trusty towers. Choose one to place in your current battle.")}<div class="content-grid">${Object.entries(towerTypes).map(([id, tower]) =>
      `<article class="content-card"><div class="card-icon">${tower.icon}</div><h2>${tower.name}</h2><p>${tower.description}</p>
        <div class="shop-stats"><span><b>${tower.damage}</b>Damage</span><span><b>${tower.cooldown}s</b>Attack speed</span><span><b>${tower.range}</b>Range</span></div>
        <div class="card-row"><span class="price">🪙 ${tower.cost}</span><button class="purchase-button" data-action="choose-tower" data-type="${id}">Place in battle</button></div></article>`
    ).join("")}</div><p class="menu-footer">Towers are paid for with battle coins when placed. Choose a specialization at level 3 and upgrade to level 7.</p>`;
  }

  function renderEnemyIndex() {
    menuContent.innerHTML = `${pageHeader("Enemy index", "Meet each of the ${Object.keys(enemies).length} slime types. Preview animations use the same artwork as the battlefield.")}<div class="content-grid">${Object.entries(enemies).map(([id, enemy]) => {
      const found = progress.discoveredEnemies.includes(id);
      return `<article class="content-card enemy-card ${found ? "" : "locked-card"}"><div class="enemy-preview-wrap">${found
        ? `<canvas class="enemy-preview-canvas" width="220" height="144" data-enemy-preview="${id}" aria-label="Animated preview of ${enemy.name}"></canvas>`
        : `<div class="enemy-preview-unknown" aria-hidden="true">❔</div>`}</div>
        <h2>${found ? enemy.name : "Unknown slime"}</h2>
        ${found ? `<p>${enemy.description}</p><div class="shop-stats"><span><b>${enemy.health}</b>Health</span><span><b>${enemy.speed}</b>Speed</span><span><b>${enemy.damage}</b>Castle damage</span></div><p>Reward: 🪙 ${enemy.reward} · Special: ${enemy.special}</p>` : "<p>Undiscovered · Continue through the waves to reveal this entry.</p>"}
      </article>`;
    }).join("")}</div>`;
  }

  function renderSkins() {
    menuContent.innerHTML = `${pageHeader("Castle skins", `${Object.keys(skins).length} cosmetic designs · Every skin keeps your castle's strength the same.`)}<div class="content-grid">${Object.entries(skins).map(([id, skin]) => {
      const owned = progress.unlockedSkins.includes(id);
      const equipped = progress.equippedSkin === id;
      const lockedText = skin.gemCost ? `Unlock for ${skin.gemCost} 💎` : skin.requirement;
      const actionLabel = equipped ? "Equipped" : owned ? "Equip" : skin.gemCost ? "Buy with gems" : "Locked";
      return `<article class="content-card ${owned ? "" : "locked-card"}">
        ${castlePreviewMarkup(skin)}
        <h2>${skin.name}</h2><p>${owned ? (equipped ? "Currently equipped. Cosmetic appearance only." : "Unlocked and ready to equip.") : lockedText}</p>
        <div class="card-row"><span class="card-tag">${equipped ? "EQUIPPED" : owned ? "OWNED" : skin.gemCost ? "GEM SHOP" : "PROGRESSION"}</span>
        <button class="quiet-button" data-action="preview-skin" data-skin="${id}">Preview</button>
        <button class="small-button" data-action="skin" data-skin="${id}" ${equipped ? "disabled" : ""}>${actionLabel}</button></div>
      </article>`;
    }).join("")}</div>`;
  }

  function castlePreviewMarkup(skin, large = false) {
    const sizeClass = large ? "castle-preview castle-preview-large" : "castle-preview";
    return `<div class="${sizeClass}" role="img" aria-label="Preview of ${skin.name}" style="--castle-wall:${skin.wall};--castle-roof:${skin.roof};--castle-trim:${skin.trim}">
      <span class="castle-preview-tower castle-preview-left"><i></i></span>
      <span class="castle-preview-body"><i></i><b></b></span>
      <span class="castle-preview-tower castle-preview-right"><i></i></span>
      <span class="castle-preview-base"></span>
    </div>`;
  }

  function previewSkin(skinId) {
    const skin = skins[skinId];
    if (!skin) {
      notify("That castle skin preview is unavailable.");
      return;
    }
    modalRoot.innerHTML = `<div class="modal-backdrop" role="presentation"><section class="modal-card skin-preview-modal" role="dialog" aria-modal="true" aria-labelledby="skinPreviewTitle">
      <h2 id="skinPreviewTitle">${skin.name}</h2>
      ${castlePreviewMarkup(skin, true)}
      <p>Cosmetic preview only. Previewing does not buy or equip this skin.</p>
      <div class="modal-actions"><button class="secondary-button" data-preview-close>Close preview</button></div>
    </section></div>`;
  }

  function renderGemShop() {
    const packages = [
      { gems: 1000, price: "$2.00", id: "small" },
      { gems: 10000, price: "$15.00", id: "medium" },
      { gems: 100000, price: "$50.00", id: "large" }
    ];
    menuContent.innerHTML = `${pageHeader("Gem shop", `Optional cosmetic currency · Balance: 💎 ${progress.gems}`)}<div class="info-banner"><strong>DEMO SHOP — NO REAL PAYMENT.</strong> Purchases are simulated in this browser and do not charge money. A production shop needs a trusted payment provider to verify transactions on a secure backend.</div>
      <div class="content-grid">${packages.map((item) => `<article class="content-card"><div class="card-icon">💎✨</div><h2>${item.gems.toLocaleString()} gems</h2>
        <p>Optional gems for cosmetic castle skins and future visual extras. Core levels never require gems.</p>
        <div class="card-row"><span class="price">${item.price}</span><button class="purchase-button gold" data-action="gem-package" data-package="${item.id}">Simulate purchase</button></div></article>`).join("")}</div>
      <div class="page-actions" style="margin-top:16px"><button class="secondary-button" data-page="redeem">🎟️ Redeem a code</button></div>`;
  }

  function renderRedeem() {
    menuContent.innerHTML = `${pageHeader("Redeem a code", "Promotional codes can award gems or cosmetic items.")}<article class="content-card" style="max-width:620px">
      <h2>Enter your code</h2><p>Codes are case-insensitive and extra spaces are ignored. Demo codes are stored locally in this browser.</p>
      <form id="redeemForm" class="input-row"><input id="redeemInput" type="text" maxlength="40" autocomplete="off" placeholder="e.g. WELCOME100" aria-label="Redemption code"><button class="primary-button" type="submit">Redeem</button></form>
      <p id="redeemFeedback" role="status" style="margin:12px 0 0"></p>
      <div class="info-banner" style="margin:15px 0 0">Demo codes: WELCOME100, FROSTFRIEND. Browser-only code limits can be changed by editing local storage; use an account-backed server for production rewards.</div>
      <div class="page-actions" style="margin-top:13px"><button class="secondary-button" data-page="gem-shop">← Gem shop</button></div></article>`;
  }

  function renderAchievements() {
    refreshAchievements();
    menuContent.innerHTML = `${pageHeader("Achievements", "Real gameplay milestones, with rewards you claim once.")}<div class="content-grid">${achievementDefs.map((achievement) => {
      const state = progress.achievementProgress[achievement.id] || { value: 0 };
      const value = Math.min(achievement.goal, metricValue(achievement.metric));
      const ready = value >= achievement.goal;
      const claimed = Boolean(state.claimed);
      const reward = [
        achievement.reward.gems ? `💎 ${achievement.reward.gems}` : ""
      ].filter(Boolean).join(" + ");
      return `<article class="content-card"><div class="card-row" style="margin:0 0 9px"><h2>${achievement.name}</h2><span class="card-tag">${claimed ? "CLAIMED" : ready ? "COMPLETE" : "IN PROGRESS"}</span></div>
        <p>${achievement.description}</p><div class="progress-track"><span style="width:${Math.min(100, value / achievement.goal * 100)}%"></span></div>
        <p>${value} / ${achievement.goal} · Reward: ${reward}</p>
        <button class="small-button" data-action="claim-achievement" data-id="${achievement.id}" ${ready && !claimed ? "" : "disabled"}>${claimed ? "Reward claimed" : ready ? "Claim reward" : "Keep playing"}</button></article>`;
    }).join("")}</div>`;
  }

  function renderDailyChallenge() {
    ensureDailyChallenge();
    const challenge = dailyChallengeForToday();
    const value = progress.dailyChallenge.stats[challenge.metric];
    const ready = value >= challenge.goal;
    const claimed = progress.dailyChallenge.claimed;
    const season = currentSeason();
    menuContent.innerHTML = `${pageHeader("Daily castle challenge", "A new objective arrives each day. Progress is saved on this device.")}<div class="info-banner">${season.icon} <strong>${season.name}:</strong> ${season.description}</div>
      <article class="content-card" style="max-width:680px"><span class="eyebrow">TODAY'S MISSION · ${todayKey()}</span><div class="card-icon">🎯</div><h2>${challenge.title}</h2><p>${challenge.description}</p>
        <div class="progress-track"><span style="width:${Math.min(100, value / challenge.goal * 100)}%"></span></div>
        <p>${Math.min(value, challenge.goal)} / ${challenge.goal} · Reward: 💎 10</p>
        <div class="card-row"><button class="primary-button" data-action="start-daily">Start a battle</button>
        <button class="small-button" data-action="claim-daily" ${ready && !claimed ? "" : "disabled"}>${claimed ? "Today's reward claimed" : ready ? "Claim 10 gems" : "Keep playing"}</button></div></article>`;
  }

  function renderChallengeModes() {
    const challenges = [
      { id: "boss-rush", title: "Boss Rush", icon: "👑", description: "Five escalating boss encounters with supporting slime squads. Defeat every boss to claim a one-time gem reward.", reward: 25 },
      { id: "iron-keep", title: "Iron Keep", icon: "🛡️", description: "A tougher campaign gauntlet: your castle starts at 60 health, enemies hit harder, and you start with 200 coins.", reward: 25 },
      { id: "slime-swarm", title: "Slime Swarm", icon: "🟢🌊", description: "Twice as many slimes charge in each wave. Defend against the crowd with slightly reduced enemy health.", reward: 25 }
    ];
    menuContent.innerHTML = `${pageHeader("Challenge modes", "Optional rule sets with separate, one-time gem rewards.")}<div class="content-grid">${challenges.map((challenge) => {
      const completed = progress.completedChallenges.includes(challenge.id);
      return `<article class="content-card"><div class="card-icon">${challenge.icon}</div><h2>${challenge.title}</h2><p>${challenge.description}</p>
        <div class="card-row"><span class="card-tag">${completed ? "CLEARED" : `REWARD · 💎 ${challenge.reward}`}</span>
        <button class="primary-button" data-action="start-challenge" data-challenge="${challenge.id}">${completed ? "Replay challenge" : "Start challenge"}</button></div></article>`;
    }).join("")}</div>`;
  }

  function renderEndless() {
    menuContent.innerHTML = `${pageHeader("Endless survival", "Waves keep growing stronger. Your battle coins reset when you start a fresh run.")}<div class="info-banner">Every fifth wave brings a boss. Every tenth wave brings the Tempest Slime. Endless progress is saved to your achievements.</div>
      <article class="content-card" style="max-width:680px"><div class="card-icon">♾️</div><h2>Green Grasslands · Endless Road</h2><p>Start with 150 battle coins and defend the castle for as long as you can. Your best wave counts toward the Endless Veteran achievement.</p>
      <div class="card-row"><span class="card-tag">BEST WAVE: ${Number(progress.achievementProgress.endlessWave || 0)}</span><button class="primary-button" data-action="start-endless">Start endless battle</button></div></article>`;
  }

  function exportSave() {
    const backup =     { game: SAVE_KEY, version: 2, exportedAt: new Date().toISOString(), progress };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `blob-td-save-${todayKey()}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify("Save backup downloaded. Keep the file to restore progress on another device.");
  }

  async function importSave(file) {
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      const candidate = backup && backup.game === SAVE_KEY && [1, 2].includes(backup.version) ? backup.progress : null;
      if (!candidate || typeof candidate !== "object" || !Array.isArray(candidate.completedLevels) ||
          !Array.isArray(candidate.unlockedSkins) || !Array.isArray(candidate.redeemedCodes) ||
          !candidate.settings || typeof candidate.settings !== "object") {
        notify("That save file is invalid or from an unsupported version.");
        return;
      }
      const accepted = window.confirm("Restore this save backup? It will replace progress currently saved in this browser.");
      if (!accepted) return;
      const defaults = defaultProgress();
      const imported = { ...candidate };
      delete imported.coins;
      progress = {
        ...defaults,
        ...imported,
        gems: Number.isSafeInteger(candidate.gems) && candidate.gems >= 0 ? candidate.gems : 0,
        totalGemsEarned: Number.isSafeInteger(candidate.totalGemsEarned) && candidate.totalGemsEarned >= 0 ? candidate.totalGemsEarned : 0,
        completedLevels: candidate.completedLevels.filter((id) => levels.some((level) => levelId(level.world, level.level) === id)),
        completedChallenges: Array.isArray(candidate.completedChallenges) ? candidate.completedChallenges.filter((id) => ["boss-rush", "iron-keep", "slime-swarm"].includes(id)) : [],
        defeatedBosses: Array.isArray(candidate.defeatedBosses) ? candidate.defeatedBosses.filter((id) => ["boss", "stormBoss", "sandBoss", "tideBoss", "crystalBoss", "shadowBoss"].includes(id)) : [],
        miniGames: Object.fromEntries(Object.entries(defaults.miniGames).map(([key, defaultValue]) => {
          const value = candidate.miniGames && candidate.miniGames[key];
          if (key === "slimebound") return [key, normalizeSlimeboundProgress(value)];
          return [key, Number.isSafeInteger(value) && value >= 0 ? value : defaultValue];
        })),
        discoveredEnemies: Array.isArray(candidate.discoveredEnemies) ? candidate.discoveredEnemies.filter((id) => enemies[id]) : defaults.discoveredEnemies,
        unlockedSkins: candidate.unlockedSkins.filter((id) => skins[id]),
        redeemedCodes: candidate.redeemedCodes.filter((entry) => entry && typeof entry.code === "string"),
        achievementProgress: candidate.achievementProgress && typeof candidate.achievementProgress === "object" ? candidate.achievementProgress : {},
        dailyChallenge: {
          ...defaults.dailyChallenge,
          ...(candidate.dailyChallenge && typeof candidate.dailyChallenge === "object" ? candidate.dailyChallenge : {}),
          stats: Object.fromEntries(Object.keys(defaults.dailyChallenge.stats).map((metric) => {
            const value = candidate.dailyChallenge && candidate.dailyChallenge.stats && candidate.dailyChallenge.stats[metric];
            return [metric, Number.isSafeInteger(value) && value >= 0 ? value : 0];
          })),
          completions: Number.isSafeInteger(candidate.dailyChallenge && candidate.dailyChallenge.completions) && candidate.dailyChallenge.completions >= 0
            ? candidate.dailyChallenge.completions : 0
        },
        settings: Object.fromEntries(Object.entries(defaults.settings).map(([key, defaultValue]) => {
          const value = candidate.settings[key];
          if (typeof defaultValue === "boolean") return [key, typeof value === "boolean" ? value : defaultValue];
          if (key === "quality") return [key, ["high", "low"].includes(value) ? value : defaultValue];
          if (key === "speed") return [key, [1, 2, 3, 4, 5].includes(value) ? value : defaultValue];
          return [key, Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : defaultValue];
        }))
      };
      if (!progress.unlockedSkins.includes("classic")) progress.unlockedSkins.unshift("classic");
      if (!progress.unlockedSkins.includes(progress.equippedSkin)) progress.equippedSkin = "classic";
      slimebound = normalizeSlimeboundProgress(progress.miniGames.slimebound);
      slimeboundChopped.clear();
      slimeboundDefeated.clear();
      slimebound.defeated.forEach((id) => slimeboundDefeated.add(id));
      slimebound.chopped.forEach((id) => slimeboundChopped.add(id));
      slimeboundGeneratedChunks.clear();
      slimeboundEntities = [];
      slimeboundMonsters = [];
      slimeboundNight = slimebound.worldTime >= 150;
      run = null;
      applyAccessibilitySettings();
      saveProgress();
      renderMenu();
      notify("Save backup restored successfully.");
    } catch (error) {
      console.error("Could not restore Blob TD save backup.", error);
      notify("Could not read that save file. Choose a valid Blob TD JSON backup.");
    }
  }

  function settingRow(title, note, input) {
    return `<div class="setting-row"><div><strong>${title}</strong><small>${note}</small></div>${input}</div>`;
  }

  function renderSettings() {
    const settings = progress.settings;
    menuContent.innerHTML = `${pageHeader("Settings", "Tune your adventure. Your choices are saved in this browser.")}<div class="settings-list">
      ${settingRow("Background music", "A gentle generated melody; works without downloaded audio.", `<input class="setting-control" type="checkbox" data-setting="music" ${settings.music ? "checked" : ""} aria-label="Background music">`)}
      ${settingRow("Sound effects", "Towers, rewards and menus.", `<input class="setting-control" type="checkbox" data-setting="sound" ${settings.sound ? "checked" : ""} aria-label="Sound effects">`)}
      ${settingRow("Music volume", "Applies to generated background notes.", `<input class="setting-control" type="range" min="0" max="100" data-setting="musicVolume" value="${settings.musicVolume}" aria-label="Music volume">`)}
      ${settingRow("Sound volume", "Applies to gameplay sound effects.", `<input class="setting-control" type="range" min="0" max="100" data-setting="soundVolume" value="${settings.soundVolume}" aria-label="Sound effects volume">`)}
      ${settingRow("Fullscreen", "Use fullscreen where your browser supports it.", `<input class="setting-control" type="checkbox" data-setting="fullscreen" ${settings.fullscreen ? "checked" : ""} aria-label="Fullscreen">`)}
      ${settingRow("Graphics quality", "High adds decorative details and particles.", `<select class="setting-control" data-setting="quality" aria-label="Graphics quality"><option value="high" ${settings.quality === "high" ? "selected" : ""}>High</option><option value="low" ${settings.quality === "low" ? "selected" : ""}>Low</option></select>`)}
      ${settingRow("Game speed", "Battle speed can also be changed during a wave.", `<select class="setting-control" data-setting="speed" aria-label="Game speed">${[1, 2, 3, 4, 5].map((speed) => `<option value="${speed}" ${settings.speed === speed ? "selected" : ""}>${speed}×</option>`).join("")}</select>`)}
      ${settingRow("Reduced motion", "Reduce animated movement and interface transitions.", `<input class="setting-control" type="checkbox" data-setting="reducedMotion" ${settings.reducedMotion ? "checked" : ""} aria-label="Reduced motion">`)}
      ${settingRow("High contrast", "Make interface text and outlines easier to distinguish.", `<input class="setting-control" type="checkbox" data-setting="highContrast" ${settings.highContrast ? "checked" : ""} aria-label="High contrast">`)}
      ${settingRow("Color assistance", "Add stronger outlines and reduce color-only visual cues.", `<input class="setting-control" type="checkbox" data-setting="colorAssist" ${settings.colorAssist ? "checked" : ""} aria-label="Color assistance">`)}
      <div class="setting-row"><div><strong>Portable save backup</strong><small>Download a backup or restore it in another browser. This game does not use a cloud server.</small></div><div class="page-actions"><button class="small-button" data-action="export-save">Export save</button><button class="secondary-button" data-action="import-save">Import save</button><input id="saveImportInput" type="file" accept="application/json,.json" hidden></div></div>
      <div class="setting-row"><div><strong>Reset progress</strong><small>Deletes gems, discoveries, unlocks, codes and achievements. Keeps your settings.</small></div><button class="danger-button" data-action="reset-progress">Reset progress</button></div>
    </div>`;
  }

  function renderAbout() {
    menuContent.innerHTML = `${pageHeader("About the adventure", "A little story about the castle and its very round visitors.")}<article class="content-card" style="max-width:760px">
      <div class="card-icon">🏰⚔️🟢</div><h2>Blob TD · Version 2.1</h2>
      <p>"Defend your castle against waves of dangerous slimes! Build powerful towers, earn battle coins, discover new enemies, unlock castle skins, and become the ultimate castle defender."</p>
      <p><strong>Credits:</strong> A small independent browser-game project. Game art is drawn in Canvas and interface icons use system emoji. Sound is synthesized locally by your browser.</p>
    </article>`;
  }

  function renderUpdates() {
    const added = [
      { title: "Four new worlds and winding routes", description: "Starfall Frontier, Sunken Kingdom, Crystal Caverns, and Shadowwood bring 12 unlockable levels and new routes." },
      { title: "New slime abilities and bosses", description: "Crystalguards regenerate shields, Glowcap Healers mend allies, Prism Slimes resist damage, and two new bosses defend the latest worlds." },
      { title: "Six additional defensive towers", description: "Bog, Storm, Gale, Arcane, Crystal, and Grove Towers add poison, chain lightning, slowing gusts, piercing magic, and rapid nature bolts." },
      { title: "More castle skins and tower upgrades", description: "Collect 100 gem skins, preview them at full size, and specialize towers before upgrading through level 7." },
      { title: "New achievements", description: "Earn gem rewards for frontier and abyss victories, boss hunts, challenge clears, endless survival, and daily challenges." },
      { title: currentSeason().name, description: `${currentSeason().description} Seasonal events rotate automatically through the year.` },
      { title: "New challenge modes", description: "Boss Rush, Iron Keep, and Slime Swarm offer distinct rules and one-time gem rewards, alongside daily and endless modes." },
      { title: "Auto-wave control", description: "Turn on Auto Wave to begin the next wave automatically after a short build break. Pause or switch it off any time." },
      { title: "Enemy Index previews", description: "See animated enemy art rendered from the same slime artwork used in battle." },
      { title: "Blob mini-games", description: "Play 16 blob-themed mini-games, including Slimebound: an endless survival RPG with exploration, combat, crafting materials, and an infinitely growing skill tree." },
      { title: "Battle hazards", description: "Bog, frost, and ember road sections change how enemies move through each map." },
      { title: "Accessibility controls", description: "Toggle reduced motion, high contrast, and color assistance in Settings." },
      { title: "Portable save backups", description: "Export a save file and import it on another device. This browser game has no online cloud account." }
    ];
    menuContent.innerHTML = `${pageHeader("New in version 2.1", "Explore the endless Slimebound survival RPG and its infinite skill tree.")}<div class="info-banner">${currentSeason().icon} <strong>Seasonal event: ${currentSeason().name}.</strong> ${currentSeason().description}</div>
      <div class="content-grid">${added.map(({ title, description }) => `<article class="content-card"><div class="card-row" style="margin:0 0 8px"><h2>${title}</h2><span class="card-tag status-good">LIVE</span></div><p>${description}</p></article>`).join("")}</div>`;
  }

  function renderComing() {
    const shipped = [
      { title: "Ten worlds and winding routes", description: "Explore ten distinct lands, including the new Crystal Caverns and Shadowwood, with escalating levels and multiple routes." },
      { title: "New enemies and slime abilities", description: "Discover shielded, healing, splitting, reflective crystal, shadow-fast, and major boss enemies." },
      { title: "Ten defensive towers", description: "Use Archer, Fire, Ice, Cannon, Bog, Storm, Gale, Arcane, Crystal, and Grove Towers with upgrades and specializations." },
      { title: "Six major boss encounters", description: "Face six major slimes, including the new Prism Sovereign and Nightshade Colossus." },
      { title: "16 blob-themed mini-games", description: "Play five original arcade games, ten new games, and the Slimebound survival RPG." },
      { title: "Slimebound infinite survival RPG", description: "Explore a procedurally generated world, gather wood, fight wildlife and nighttime monster blobs, and endlessly upgrade health, damage, and defence." },
      { title: "Challenge and seasonal modes", description: "Play Boss Rush, Iron Keep, Slime Swarm, daily challenges, endless survival, and rotating seasonal events." },
      { title: "Castle cosmetics and previews", description: "Unlock and preview more than 100 cosmetic castle designs; cosmetics do not change battle strength." }
    ];
    menuContent.innerHTML = `${pageHeader("What's Coming", "The planned features are here in Version 2.1.")}<div class="content-grid">${shipped.map(({ title, description }) =>
    `<article class="content-card"><div class="card-row" style="margin:0 0 8px"><h2>${title}</h2><span class="card-tag status-good">LIVE</span></div><p>${description}</p></article>`
    ).join("")}</div>`;
  }

  function renderMiniGames() {
    menuContent.innerHTML = `${pageHeader("Blob mini-games", "Take a break with 16 slime-themed games. Every game uses the same blob art as battle.")}<div class="content-grid">
      <article class="content-card"><div class="card-icon">🟢🪙</div><h2>Blob Clicker Tycoon</h2><p>Tap the same squishy blobs you know from the battlefield, earn blob coins, and grow your clicker empire.</p>
        <div class="card-row"><span class="card-tag">SAVED LOCALLY</span><button class="primary-button" data-page="clicker">Play clicker</button></div></article>
      <article class="content-card"><div class="card-icon">🏃🟢</div><h2>Slime Sprint</h2><p>Hop over incoming slime obstacles and see how long you can keep your blob on the run.</p>
        <div class="card-row"><span class="card-tag">BEST · ${progress.miniGames.sprintBest}</span><button class="primary-button" data-page="slime-sprint">Play sprint</button></div></article>
      <article class="content-card"><div class="card-icon">🎯🟢</div><h2>Blob Pop</h2><p>Pop as many bouncing battlefield blobs as you can before the 30-second timer runs out.</p>
        <div class="card-row"><span class="card-tag">BEST · ${progress.miniGames.popBest}</span><button class="primary-button" data-page="blob-pop">Play Blob Pop</button></div></article>
      <article class="content-card"><div class="card-icon">🧠🟢</div><h2>Blob Match</h2><p>Flip the slime tiles, remember their looks, and match all four pairs in as few moves as possible.</p>
        <div class="card-row"><span class="card-tag">${progress.miniGames.matchBest ? `BEST · ${progress.miniGames.matchBest} MOVES` : "BEST · NOT PLAYED"}</span><button class="primary-button" data-page="blob-match">Play Blob Match</button></div></article>
      <article class="content-card"><div class="card-icon">🧺🟢</div><h2>Blob Catcher</h2><p>Move your catcher to collect friendly green blobs and dodge the fiery red slimes.</p>
        <div class="card-row"><span class="card-tag">BEST · ${progress.miniGames.catcherBest}</span><button class="primary-button" data-page="blob-catcher">Play Blob Catcher</button></div></article>
      ${extraMiniGames.map((game) => `<article class="content-card"><div class="card-icon">${game.icon}</div><h2>${game.title}</h2><p>${game.description}</p>
        <div class="card-row"><span class="card-tag">BEST · ${progress.miniGames[game.bestKey]}</span><button class="primary-button" data-page="${game.id}">Play</button></div></article>`).join("")}
      <article class="content-card survival-arcade-card"><div class="card-icon">🌲🟢🌙</div><h2>Slimebound: Wilds of Becoming</h2>
        <p>You woke up transformed into a humanoid slime. Explore a limitless forest, hunt wild creatures, mine trees, survive the five-minute day/night cycle, and grow through an endless skill tree.</p>
        <div class="card-row"><span class="card-tag">INFINITE WORLD · ENDLESS SKILLS</span><button class="primary-button" data-page="slimebound">Enter the wilds</button></div></article>
    </div>`;
  }

  function renderSlimebound() {
    if (slimeboundGeneratedChunks.size === 0) generateSlimeboundChunks();
    menuContent.innerHTML = `${pageHeader("Slimebound: Wilds of Becoming", "You woke up as a humanoid slime. The forest goes on forever—explore, fight, gather, and grow.", '<button class="back-button" data-page="minigames">← Mini-games</button>')}
      <section class="survival-layout">
        <div class="content-card survival-world-card">
          <div class="survival-hud">
            <span>❤️ <b id="survivalHp"></b></span><span>⚔️ <b id="survivalDamage"></b></span><span>🛡️ <b id="survivalDefence"></b></span>
            <span>🪵 <b id="survivalWood"></b></span><span>👾 <b id="survivalMonsterCount">0</b></span><span>✨ Lv <b id="survivalLevel"></b></span><span id="survivalClock"></span>
          </div>
          <canvas id="survivalCanvas" width="960" height="540" aria-label="Slimebound infinite wilderness. Move with WASD or arrow keys. Press Y to attack and U to mine trees."></canvas>
          <p class="survival-controls-hint">Move: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or arrows · Attack: <kbd>Y</kbd> · Mine: <kbd>U</kbd> · Inventory: <kbd>G</kbd>.</p>
          <p id="survivalMessage" role="status">Welcome to the wilds. Find a creature with Y or a tree with U.</p>
          <section id="survivalInventory" class="survival-inventory" ${slimeboundInventoryOpen ? "" : "hidden"}>
            <div class="survival-inventory-heading"><div><span class="eyebrow">YOUR GEAR</span><h2>Inventory & crafting</h2></div><span class="card-tag">🎒 <b id="survivalInventoryWood">${slimebound.wood}</b> WOOD</span></div>
            <p id="survivalArmorStatus">${slimebound.woodArmor ? "🪵 Wood armor equipped · Defence +5" : "No armor equipped."}</p>
            <button type="button" class="primary-button" data-survival-craft="wood-armor" ${slimebound.woodArmor || slimebound.wood < 10 ? "disabled" : ""}>Craft wood armor · 10 wood</button>
          </section>
        </div>
        <aside class="content-card survival-skills">
          <div class="survival-skill-heading"><div><span class="eyebrow">INFINITE PROGRESSION</span><h2>Skill tree</h2></div><span class="card-tag">✨ <b id="survivalSkillPoints"></b> POINTS</span></div>
          <p>Gain skill points by earning XP. Each branch extends forever; later ranks cost more and grant stronger stats.</p>
          <div id="survivalSkillTree" class="survival-skill-tree"></div>
          <div class="survival-story"><strong>Backstory</strong><p>You were an ordinary traveler until a strange forest storm changed your body into living slime. Find your place in the wilds and learn what this new form can become.</p></div>
        </aside>
      </section>`;
    updateSlimeboundHud();
    renderSlimeboundSkillTree();
    drawSlimeboundWorld();
  }

  const SLIMEBOUND_CHUNK_SIZE = 768;
  const SLIMEBOUND_TILE_SIZE = 64;
  const slimeboundSkills = {
    health: { title: "Vital Core", icon: "❤️", bonus: "Maximum HP +20" },
    damage: { title: "Ferocity", icon: "⚔️", bonus: "Attack damage +5" },
    defence: { title: "Slimeguard", icon: "🛡️", bonus: "Damage reduction +3" }
  };
  const slimeboundSkillCost = (rank) => Math.floor(1 + rank * .65);
  const slimeboundMaxHp = () => 100 + slimebound.skills.health * 20;
  const slimeboundDamage = () => 18 + slimebound.skills.damage * 5;
  const slimeboundDefence = () => slimebound.skills.defence * 3 + (slimebound.woodArmor ? 5 : 0);
  const slimeboundXpGoal = () => 25 + (slimebound.level - 1) * 15;

  function slimeboundSeededRandom(seed) {
    let value = seed >>> 0;
    return () => {
      value += 0x6d2b79f5;
      let next = value;
      next = Math.imul(next ^ (next >>> 15), next | 1);
      next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
      return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
    };
  }

  function slimeboundHash(text) {
    let hash = slimebound.seed | 0;
    for (let index = 0; index < text.length; index += 1) hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
    return hash >>> 0;
  }

  function saveSlimebound() {
    slimebound.chopped = Array.from(slimeboundChopped).slice(-5000);
    slimebound.defeated = Array.from(slimeboundDefeated).slice(-5000);
    progress.miniGames.slimebound = slimebound;
    saveProgress();
  }

  function generateSlimeboundChunks() {
    const chunkX = Math.floor(slimebound.x / SLIMEBOUND_CHUNK_SIZE);
    const chunkY = Math.floor(slimebound.y / SLIMEBOUND_CHUNK_SIZE);
    for (let cy = chunkY - 2; cy <= chunkY + 2; cy += 1) {
      for (let cx = chunkX - 2; cx <= chunkX + 2; cx += 1) {
        const key = `${cx},${cy}`;
        if (slimeboundGeneratedChunks.has(key)) continue;
        slimeboundGeneratedChunks.add(key);
        const random = slimeboundSeededRandom(slimeboundHash(key));
        if (cx === 0 && cy === 0) {
          if (!slimeboundChopped.has("tree:starter")) slimeboundEntities.push({ id: "tree:starter", kind: "tree", x: 78, y: 0, hp: 3, maxHp: 3, phase: 1 });
          if (!slimeboundDefeated.has("critter:starter")) slimeboundEntities.push({
            id: "critter:starter", kind: "critter", type: "fast", x: -65, y: 0,
            hp: 32 + slimebound.level * 2, maxHp: 32 + slimebound.level * 2,
            phase: 0, wander: 1, attackTimer: 0, provoked: false
          });
        }
        for (let index = 0; index < 17; index += 1) {
          const x = cx * SLIMEBOUND_CHUNK_SIZE + 35 + random() * (SLIMEBOUND_CHUNK_SIZE - 70);
          const y = cy * SLIMEBOUND_CHUNK_SIZE + 35 + random() * (SLIMEBOUND_CHUNK_SIZE - 70);
          const id = `tree:${Math.floor(x / 8)}:${Math.floor(y / 8)}`;
          if (!slimeboundChopped.has(id)) slimeboundEntities.push({ id, kind: "tree", x, y, hp: 3, maxHp: 3, phase: random() * 6 });
        }
        for (let index = 0; index < 6; index += 1) {
          const x = cx * SLIMEBOUND_CHUNK_SIZE + 45 + random() * (SLIMEBOUND_CHUNK_SIZE - 90);
          const y = cy * SLIMEBOUND_CHUNK_SIZE + 45 + random() * (SLIMEBOUND_CHUNK_SIZE - 90);
          const id = `critter:${Math.floor(x / 8)}:${Math.floor(y / 8)}`;
          if (!slimeboundDefeated.has(id)) {
            const type = ["fast", "frost", "blob"][Math.floor(random() * 3)];
            slimeboundEntities.push({ id, kind: "critter", type, x, y, hp: 32 + slimebound.level * 2, maxHp: 32 + slimebound.level * 2, phase: random() * 6, wander: random() * Math.PI * 2, attackTimer: 0, provoked: false });
          }
        }
      }
    }
    slimeboundEntities = slimeboundEntities.filter((entity) =>
      Math.abs(entity.x / SLIMEBOUND_CHUNK_SIZE - chunkX) <= 3 && Math.abs(entity.y / SLIMEBOUND_CHUNK_SIZE - chunkY) <= 3
    );
    slimeboundGeneratedChunks = new Set(Array.from(slimeboundGeneratedChunks).filter((key) => {
      const [x, y] = key.split(",").map(Number);
      return Math.abs(x - chunkX) <= 3 && Math.abs(y - chunkY) <= 3;
    }));
  }

  function slimeboundMessage(message) {
    const element = $("#survivalMessage");
    if (element) element.textContent = message;
  }

  function updateSlimeboundHud(redrawSkills = false) {
    const hp = $("#survivalHp");
    const damage = $("#survivalDamage");
    const defence = $("#survivalDefence");
    const wood = $("#survivalWood");
    const level = $("#survivalLevel");
    const points = $("#survivalSkillPoints");
    const inventoryWood = $("#survivalInventoryWood");
    const armorStatus = $("#survivalArmorStatus");
    const craftButton = menuContent.querySelector('[data-survival-craft="wood-armor"]');
    const clock = $("#survivalClock");
    const monsterCount = $("#survivalMonsterCount");
    if (!hp) return;
    hp.textContent = `${Math.ceil(slimebound.hp ?? slimeboundMaxHp())} / ${slimeboundMaxHp()}`;
    damage.textContent = String(slimeboundDamage());
    defence.textContent = String(slimeboundDefence());
    wood.textContent = String(slimebound.wood);
    if (inventoryWood) inventoryWood.textContent = String(slimebound.wood);
    if (armorStatus) armorStatus.textContent = slimebound.woodArmor ? "🪵 Wood armor equipped · Defence +5" : "No armor equipped.";
    if (craftButton) craftButton.disabled = slimebound.woodArmor || slimebound.wood < 10;
    level.textContent = `${slimebound.level} · ${slimebound.xp}/${slimeboundXpGoal()} XP`;
    points.textContent = String(slimebound.skillPoints);
    if (monsterCount) monsterCount.textContent = String(slimeboundMonsters.length);
    if (clock) {
      const seconds = slimeboundNight ? 300 - (slimebound.worldTime % 300) : 150 - (slimebound.worldTime % 300);
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
      clock.textContent = `${slimeboundNight ? "🌙 NIGHT" : "☀️ DAY"} · ${mins}:${secs}`;
      clock.classList.toggle("night-clock", slimeboundNight);
    }
    if (redrawSkills) renderSlimeboundSkillTree();
  }

  function renderSlimeboundSkillTree() {
    const root = $("#survivalSkillTree");
    if (!root) return;
    root.innerHTML = Object.entries(slimeboundSkills).map(([id, skill]) => {
      const rank = slimebound.skills[id];
      const nodes = Array.from({ length: 3 }, (_, index) => {
        const nextRank = rank + index + 1;
        const cost = slimeboundSkillCost(nextRank);
        return `<button class="survival-skill-node ${index === 0 ? "next-skill" : ""}" type="button" data-survival-skill="${id}" ${slimebound.skillPoints < cost ? "disabled" : ""}>
          <span>${skill.icon} ${skill.title} <b>Rank ${nextRank}</b></span><small>${skill.bonus} · Cost ${cost} point${cost === 1 ? "" : "s"}</small></button>`;
      }).join("");
      return `<section class="survival-skill-branch"><h3>${skill.icon} ${skill.title} <span>Current rank ${rank}</span></h3>${nodes}</section>`;
    }).join("");
  }

  function earnSlimeboundXp(amount) {
    slimebound.xp += amount;
    let leveled = false;
    while (slimebound.xp >= slimeboundXpGoal()) {
      slimebound.xp -= slimeboundXpGoal();
      slimebound.level += 1;
      slimebound.skillPoints += 1;
      slimebound.hp = slimeboundMaxHp();
      leveled = true;
    }
    if (leveled) slimeboundMessage(`Level up! You are level ${slimebound.level} and earned a skill point.`);
    updateSlimeboundHud(leveled);
  }

  function buySlimeboundSkill(skillId) {
    if (!slimeboundSkills[skillId]) return;
    const nextRank = slimebound.skills[skillId] + 1;
    const cost = slimeboundSkillCost(nextRank);
    if (slimebound.skillPoints < cost) {
      slimeboundMessage(`You need ${cost} skill point${cost === 1 ? "" : "s"} for this rank.`);
      return;
    }
    slimebound.skillPoints -= cost;
    slimebound.skills[skillId] = nextRank;
    if (skillId === "health") slimebound.hp = (slimebound.hp || slimeboundMaxHp() - 20) + 20;
    saveSlimebound();
    updateSlimeboundHud(true);
    slimeboundMessage(`${slimeboundSkills[skillId].title} upgraded to rank ${nextRank}. The skill tree keeps growing without a cap.`);
  }

  function attackSlimeboundTarget() {
    if (!slimebound.active) return;
    if (slimeboundAttackCooldown > 0) return;
    const targets = [...slimeboundEntities.filter((entity) => entity.kind === "critter"), ...slimeboundMonsters];
    let target = null;
    let closest = 92;
    for (const entity of targets) {
      const distance = Math.hypot(entity.x - slimebound.x, entity.y - slimebound.y);
      if (distance < closest) { target = entity; closest = distance; }
    }
    if (!target) {
      slimeboundMessage("No hostile creature nearby. Approach an animal or wait for nightfall.");
      return;
    }
    slimeboundAttackCooldown = .35;
    if (target.kind === "critter") target.provoked = true;
    target.hp -= slimeboundDamage();
    slimeboundMessage(`You hit the ${target.kind === "monster" ? "monster blob" : "wild creature"} for ${slimeboundDamage()} damage.`);
    if (target.hp <= 0) {
      if (target.kind === "monster") slimeboundMonsters = slimeboundMonsters.filter((monster) => monster !== target);
      else {
        slimeboundEntities = slimeboundEntities.filter((entity) => entity !== target);
        slimeboundDefeated.add(target.id);
      }
      slimebound.kills += 1;
      const xp = target.kind === "monster" ? 22 : 14;
      earnSlimeboundXp(xp);
      slimeboundMessage(`${target.kind === "monster" ? "Monster blob" : "Wild creature"} defeated! +${xp} XP.`);
      saveSlimebound();
    }
    updateSlimeboundHud();
  }

  function mineSlimeboundTree() {
    if (!slimebound.active) return;
    let target = null;
    let closest = 100;
    for (const entity of slimeboundEntities) {
      if (entity.kind !== "tree") continue;
      const distance = Math.hypot(entity.x - slimebound.x, entity.y - slimebound.y);
      if (distance < closest) { target = entity; closest = distance; }
    }
    if (!target) {
      slimeboundMessage("No tree close enough. Walk up to a tree and press U to mine it.");
      return;
    }
    target.hp -= 1;
    target.phase += 1;
    if (target.hp <= 0) {
      slimeboundEntities = slimeboundEntities.filter((entity) => entity !== target);
      slimeboundChopped.add(target.id);
      slimebound.wood += 3;
      earnSlimeboundXp(3);
      slimeboundMessage("Tree felled! +3 wood and +3 XP.");
      saveSlimebound();
    } else {
      slimeboundMessage(`Chopping tree · ${target.hp}/${target.maxHp} hits left.`);
    }
    updateSlimeboundHud();
  }

  function drawSlimeboundTree(context, entity, screenX, screenY) {
    const wobble = Math.sin(animationTime * 2.2 + entity.phase) * 2;
    context.fillStyle = "rgba(12,35,22,.24)";
    context.beginPath(); context.ellipse(screenX, screenY + 12, 27, 9, 0, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#795638"; context.fillRect(screenX - 7, screenY - 8, 14, 34);
    context.fillStyle = "#347349"; context.beginPath(); context.arc(screenX, screenY - 24 + wobble, 23, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#559859"; context.beginPath(); context.arc(screenX - 12, screenY - 14 + wobble, 16, 0, Math.PI * 2); context.fill();
    context.fillStyle = "#6db262"; context.beginPath(); context.arc(screenX + 12, screenY - 15 + wobble, 15, 0, Math.PI * 2); context.fill();
    if (entity.hp < entity.maxHp) {
      context.fillStyle = "#fff2c6"; context.font = "700 11px sans-serif"; context.textAlign = "center";
      context.fillText(`${entity.hp}/${entity.maxHp}`, screenX, screenY + 31);
    }
  }

  function drawSlimeboundCritter(context, entity, screenX, screenY) {
    const enemy = enemies[entity.type] || enemies.fast;
    context.fillStyle = lighten(enemy.color);
    context.beginPath();
    context.ellipse(screenX - 8, screenY - 13, 5, 11, -.22, 0, Math.PI * 2);
    context.ellipse(screenX + 8, screenY - 13, 5, 11, .22, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#f4c2bd";
    context.beginPath();
    context.ellipse(screenX - 8, screenY - 14, 2, 6, -.22, 0, Math.PI * 2);
    context.ellipse(screenX + 8, screenY - 14, 2, 6, .22, 0, Math.PI * 2);
    context.fill();
    drawSlime({ ...enemy, ...entity, x: screenX, y: screenY, health: entity.hp, maxHealth: entity.maxHp, shield: 0, maxShield: 0, hitFlash: 0 }, context, 1.05);
  }

  function drawSlimeboundCharacter(context, x, y) {
    context.save();
    context.translate(x, y);
    context.fillStyle = "rgba(6,23,17,.32)";
    context.beginPath(); context.ellipse(0, 25, 24, 8, 0, 0, Math.PI * 2); context.fill();
    context.strokeStyle = "#386d48"; context.lineWidth = 8; context.lineCap = "round";
    context.beginPath(); context.moveTo(-8, 13); context.lineTo(-12, 24); context.moveTo(8, 13); context.lineTo(12, 24); context.stroke();
    context.strokeStyle = "#70bd61"; context.lineWidth = 9;
    context.beginPath(); context.moveTo(-8, -2); context.lineTo(-19, 8); context.moveTo(8, -2); context.lineTo(19, 6); context.stroke();
    drawSlime({ ...enemies.blob, type: "blob", x: 0, y: 1, health: 100, maxHealth: 100, shield: 0, maxShield: 0, hitFlash: 0, phase: 0 }, context, 1.1);
    if (slimebound.woodArmor) {
      context.fillStyle = "#98643b"; context.fillRect(-10, 7, 20, 10);
      context.fillStyle = "#c18a51"; context.fillRect(-8, 8, 16, 2);
      context.strokeStyle = "#e0b879"; context.lineWidth = 1.5;
      context.beginPath(); context.moveTo(-6, 9); context.lineTo(-6, 16); context.moveTo(6, 9); context.lineTo(6, 16); context.stroke();
    }
    context.fillStyle = "#2d4934";
    context.beginPath(); context.ellipse(-5, 0, 2.3, 3.3, 0, 0, Math.PI * 2); context.ellipse(5, 0, 2.3, 3.3, 0, 0, Math.PI * 2); context.fill();
    context.strokeStyle = "#fff2ca"; context.lineWidth = 1.5;
    context.beginPath(); context.arc(0, 5, 4, .15, Math.PI - .15); context.stroke();
    context.fillStyle = "#a76c47"; context.fillRect(-10, 11, 20, 7);
    context.restore();
  }

  function drawSlimeboundWorld() {
    const canvasElement = $("#survivalCanvas");
    if (!canvasElement) return;
    const context = canvasElement.getContext("2d");
    const width = canvasElement.width, height = canvasElement.height;
    const cameraX = slimebound.x - width / 2, cameraY = slimebound.y - height / 2;
    const startX = Math.floor(cameraX / SLIMEBOUND_TILE_SIZE);
    const startY = Math.floor(cameraY / SLIMEBOUND_TILE_SIZE);
    const grass = ["#6eaa58", "#74b25f", "#689f52", "#78b766", "#639d51"];
    for (let y = startY; y <= startY + Math.ceil(height / SLIMEBOUND_TILE_SIZE) + 1; y += 1) {
      for (let x = startX; x <= startX + Math.ceil(width / SLIMEBOUND_TILE_SIZE) + 1; x += 1) {
        const tileRandom = slimeboundSeededRandom(slimeboundHash(`${x},${y},tile`));
        context.fillStyle = grass[Math.floor(tileRandom() * grass.length)];
        context.fillRect(x * SLIMEBOUND_TILE_SIZE - cameraX, y * SLIMEBOUND_TILE_SIZE - cameraY, SLIMEBOUND_TILE_SIZE + 1, SLIMEBOUND_TILE_SIZE + 1);
        if (tileRandom() > .83) {
          context.fillStyle = "rgba(240,232,153,.5)";
          context.beginPath(); context.arc(x * 64 + tileRandom() * 64 - cameraX, y * 64 + tileRandom() * 64 - cameraY, 2, 0, Math.PI * 2); context.fill();
        }
      }
    }
    for (const entity of slimeboundEntities) {
      const screenX = entity.x - cameraX, screenY = entity.y - cameraY;
      if (screenX < -60 || screenX > width + 60 || screenY < -60 || screenY > height + 60) continue;
      if (entity.kind === "tree") drawSlimeboundTree(context, entity, screenX, screenY);
      else drawSlimeboundCritter(context, entity, screenX, screenY);
    }
    for (const monster of slimeboundMonsters) {
      drawSlime({ ...enemies.shadow, type: "shadow", x: monster.x - cameraX, y: monster.y - cameraY, health: monster.hp, maxHealth: monster.maxHp, shield: 0, maxShield: 0, hitFlash: 0, phase: monster.phase }, context, 1.45);
    }
    if (slimeboundNight) {
      context.fillStyle = "rgba(12,18,53,.54)";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "rgba(255,244,190,.7)";
      for (let index = 0; index < 42; index += 1) {
        const sx = (index * 197 + 31) % width, sy = (index * 113 + 17) % height;
        context.fillRect(sx, sy, 2, 2);
      }
      context.fillStyle = "#ffe99a";
      context.beginPath(); context.arc(width - 70, 65, 24, 0, Math.PI * 2); context.fill();
      context.fillStyle = "#283255";
      context.beginPath(); context.arc(width - 80, 57, 22, 0, Math.PI * 2); context.fill();
    }
    const hpRatio = Math.max(0, slimebound.hp / slimeboundMaxHp());
    context.fillStyle = "rgba(20,40,28,.8)"; context.fillRect(width / 2 - 33, height / 2 + 37, 66, 7);
    context.fillStyle = hpRatio > .3 ? "#91e47d" : "#f36a56"; context.fillRect(width / 2 - 33, height / 2 + 37, 66 * hpRatio, 7);
    drawSlimeboundCharacter(context, width / 2, height / 2);
    context.fillStyle = "#fff4d1"; context.font = "700 12px sans-serif"; context.textAlign = "center";
    context.fillText(`WORLD ${Math.floor(slimebound.x / SLIMEBOUND_CHUNK_SIZE)}, ${Math.floor(slimebound.y / SLIMEBOUND_CHUNK_SIZE)}`, width / 2, 20);
  }

  function updateSlimebound(dt) {
    if (!slimebound.active) return;
    const directionX = Number(slimeboundKeys.has("d") || slimeboundKeys.has("arrowright")) - Number(slimeboundKeys.has("a") || slimeboundKeys.has("arrowleft"));
    const directionY = Number(slimeboundKeys.has("s") || slimeboundKeys.has("arrowdown")) - Number(slimeboundKeys.has("w") || slimeboundKeys.has("arrowup"));
    const length = Math.hypot(directionX, directionY) || 1;
    const speed = 230;
    slimebound.x += directionX / length * speed * dt;
    slimebound.y += directionY / length * speed * dt;
    slimebound.worldTime = (slimebound.worldTime + dt) % 300;
    const night = slimebound.worldTime >= 150;
    if (night !== slimeboundNight) {
      slimeboundNight = night;
      slimeboundMonsters = [];
      slimeboundMessage(night ? "Night falls! Monster blobs are emerging from the shadows." : "Dawn breaks. The monster blobs retreat until night.");
    }
    generateSlimeboundChunks();
    slimeboundAttackCooldown = Math.max(0, slimeboundAttackCooldown - dt);
    for (const entity of slimeboundEntities) {
      if (entity.kind !== "critter") continue;
      if (!entity.provoked) entity.wander += (Math.random() - .5) * dt;
      else {
        const dx = slimebound.x - entity.x, dy = slimebound.y - entity.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance > 35) { entity.x += dx / distance * 48 * dt; entity.y += dy / distance * 48 * dt; }
        entity.attackTimer -= dt;
        if (distance < 45 && entity.attackTimer <= 0) {
          entity.attackTimer = 1.4;
          slimebound.hp = Math.max(0, slimebound.hp - Math.max(1, 5 - slimeboundDefence()));
          slimeboundMessage("A wild creature hit you!");
        }
      }
      if (!entity.provoked) {
        entity.x += Math.cos(entity.wander) * 9 * dt;
        entity.y += Math.sin(entity.wander) * 9 * dt;
      }
    }
    if (slimeboundNight) {
      slimeboundSpawnTimer -= dt;
      if (slimeboundSpawnTimer <= 0) {
        slimeboundSpawnTimer = Math.max(3, 10 - slimebound.level * .12);
        const angle = Math.random() * Math.PI * 2;
        const distance = 220 + Math.random() * 150;
        slimeboundMonsters.push({
          kind: "monster",
          x: slimebound.x + Math.cos(angle) * distance, y: slimebound.y + Math.sin(angle) * distance,
          hp: 55 + slimebound.level * 4, maxHp: 55 + slimebound.level * 4,
          damage: Math.max(2, 9 + Math.floor(slimebound.level / 3) - slimeboundDefence()), attackTimer: .8,
          phase: Math.random() * 6
        });
      }
      for (const monster of slimeboundMonsters) {
        const dx = slimebound.x - monster.x, dy = slimebound.y - monster.y;
        const distance = Math.hypot(dx, dy) || 1;
        if (distance > 34) { monster.x += dx / distance * (52 + slimebound.level) * dt; monster.y += dy / distance * (52 + slimebound.level) * dt; }
        monster.attackTimer -= dt;
        if (distance < 44 && monster.attackTimer <= 0) {
          monster.attackTimer = 1.1;
          slimebound.hp = Math.max(0, slimebound.hp - monster.damage);
          slimeboundMessage(`Monster blob attack! You took ${monster.damage} damage.`);
        }
      }
    }
    if (slimebound.hp <= 0) {
      slimebound.hp = slimeboundMaxHp();
      slimebound.x = 0; slimebound.y = 0;
      slimeboundMonsters = [];
      slimeboundMessage("You dissolved and reformed at the forest edge. Your skills and gathered wood remain.");
      saveSlimebound();
    }
    slimeboundSaveTimer += dt;
    if (slimeboundSaveTimer >= 8) { slimeboundSaveTimer = 0; saveSlimebound(); }
    updateSlimeboundHud();
    drawSlimeboundWorld();
  }

  function renderExtraMiniGame(game) {
    if (extraGame.id !== game.id) {
      extraGame.id = game.id;
      extraGame.active = false;
      extraGame.over = false;
      extraGame.score = 0;
      extraGame.elapsed = 0;
      extraGame.lives = 3;
      extraGame.message = game.description;
    }
    const controls = {
      dodge: '<div class="extra-controls"><button class="secondary-button" data-extra-action="move" data-direction="-1">← Move left</button><button class="secondary-button" data-extra-action="move" data-direction="1">Move right →</button></div>',
      stack: '<div class="extra-controls"><button class="primary-button" data-extra-action="stack">Drop slime</button></div>',
      fishing: '<div class="extra-controls"><button class="primary-button" data-extra-action="reel">🎣 Reel in</button></div>',
      sort: `<div class="extra-controls">${["blob", "fire", "fast", "frost"].map((type) => `<button class="secondary-button" data-extra-choice="${type}">${enemies[type].icon} ${enemies[type].name.replace(" Slime", "")}</button>`).join("")}</div>`,
      volleyball: '<div class="extra-controls"><button class="primary-button" data-extra-action="bump">🏐 Bump the blob</button></div>',
      maze: '<div class="extra-controls maze-controls"><button class="secondary-button" data-extra-action="maze" data-direction="up">↑</button><button class="secondary-button" data-extra-action="maze" data-direction="left">←</button><button class="secondary-button" data-extra-action="maze" data-direction="down">↓</button><button class="secondary-button" data-extra-action="maze" data-direction="right">→</button></div>',
      rhythm: `<div class="extra-controls">${["left", "up", "down", "right"].map((direction) => `<button class="secondary-button" data-extra-choice="${direction}">${{ left: "←", up: "↑", down: "↓", right: "→" }[direction]}</button>`).join("")}</div>`,
      cannon: '<p class="extra-hint">Click the slime targets on the field to fire.</p>',
      garden: '<div class="extra-controls"><button class="primary-button" data-extra-action="harvest">🌱 Harvest blob</button></div>',
      rescue: '<p class="extra-hint">Click the wandering blobs to rescue them.</p>'
    }[game.mode];
    menuContent.innerHTML = `${pageHeader(game.title, game.description, '<button class="back-button" data-page="minigames">← Mini-games</button>')}
      <article class="content-card arcade-card extra-game-card">
        <div class="arcade-score-row"><span id="extraScore">Score: ${extraGame.score}</span><span id="extraTimer">${extraGame.active ? `${Math.max(0, Math.ceil(30 - extraGame.elapsed))}s left` : "30 seconds"}</span><span id="extraLives">Lives: ${extraGame.lives || 3}</span></div>
        <canvas id="extraCanvas" width="760" height="300" aria-label="${game.title}. ${game.description}"></canvas>
        <p id="extraMessage">${extraGame.message || game.description}</p>
        ${controls}
        <button class="primary-button extra-start" data-extra-action="start">${extraGame.over ? "Play again" : extraGame.active ? "Restart" : `Start ${game.title}`}</button>
      </article>`;
    drawExtraMiniGame(game);
  }

  function startExtraMiniGame(game) {
    extraGame.id = game.id;
    extraGame.active = true; extraGame.over = false; extraGame.elapsed = 0;
    extraGame.score = 0; extraGame.lives = 3; extraGame.x = 380; extraGame.y = 165;
    extraGame.vx = 160; extraGame.lane = 1; extraGame.targetType = "blob";
    extraGame.spawnTimer = .7; extraGame.ripe = false; extraGame.phase = 0;
    extraGame.mazeX = 0; extraGame.mazeY = 0; extraGame.sequenceIndex = 0;
    extraGame.sequence = []; extraGame.objects = []; extraGame.width = 180;
    extraGame.message = game.description;
    if (game.mode === "rhythm") createRhythmSequence();
    if (game.mode === "dodge") extraGame.spawnTimer = .5;
    if (game.mode === "cannon") extraGame.objects = [makeExtraTarget()];
    if (game.mode === "rescue") extraGame.objects = Array.from({ length: 5 }, () => makeExtraTarget());
    renderExtraMiniGame(game);
  }

  function createRhythmSequence() {
    const directions = ["left", "up", "down", "right"];
    extraGame.sequence = Array.from({ length: 4 }, () => directions[Math.floor(Math.random() * directions.length)]);
    extraGame.sequenceIndex = 0;
    extraGame.message = `Repeat the pattern: ${extraGame.sequence.map((item) => ({ left: "←", up: "↑", down: "↓", right: "→" }[item])).join("  ")}`;
  }

  function extraMiniGameAction(action, value = "") {
    if (action === "start") {
      const game = extraMiniGames.find((item) => item.id === menuPage);
      if (game) startExtraMiniGame(game);
      return;
    }
    if (!extraGame.active) return;
    const game = extraMiniGames.find((item) => item.id === extraGame.id);
    if (!game) return;
    if (action === "move" && game.mode === "dodge") {
      extraGame.lane = Math.max(0, Math.min(2, extraGame.lane + Number(value)));
    } else if (action === "stack" && game.mode === "stack") {
      if (Math.abs(extraGame.x - 380) <= extraGame.width / 2) {
        extraGame.score += 1;
        extraGame.width = Math.max(38, extraGame.width - 11);
        extraGame.y = Math.max(82, extraGame.y - 12);
        extraGame.message = `Nice stack! ${extraGame.score} blobs high.`;
      } else {
        extraGame.lives -= 1;
        extraGame.message = "That slime missed the stack!";
      }
    } else if (action === "reel" && game.mode === "fishing") {
      if (extraGame.ripe) {
        extraGame.score += 1; extraGame.ripe = false; extraGame.spawnTimer = 1.2 + Math.random() * 1.8;
        extraGame.message = "A friendly blob fish! Cast again.";
      } else {
        extraGame.message = "No bite yet. Watch the bobber!";
      }
    } else if (action === "bump" && game.mode === "volleyball") {
      if (extraGame.x < 260 && extraGame.y > 72 && extraGame.y < 250) {
        extraGame.score += 1; extraGame.x = 610; extraGame.y = 120 + Math.random() * 120;
        extraGame.vx = -Math.abs(extraGame.vx);
        extraGame.message = "Great bump! Keep the slime in play.";
      } else {
        extraGame.lives -= 1; extraGame.message = "Too early or too late—watch for the blob!";
      }
    } else if (action === "maze" && game.mode === "maze") {
      moveMaze(value);
    } else if (action === "harvest" && game.mode === "garden") {
      if (extraGame.ripe) {
        extraGame.score += 1; extraGame.ripe = false; extraGame.phase = 0;
        extraGame.message = "Ripe blob harvested! Wait for the next one.";
      } else {
        extraGame.lives -= 1; extraGame.message = "Not ripe yet—wait for the glow.";
      }
    }
    updateExtraMiniGameUi(game);
  }

  function moveMaze(direction) {
    const walls = new Set(["1,0", "1,1", "3,1", "4,1", "1,3", "2,3", "4,3", "5,3", "3,4", "3,5", "5,5"]);
    const delta = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[direction];
    if (!delta) return;
    const nextX = extraGame.mazeX + delta[0];
    const nextY = extraGame.mazeY + delta[1];
    if (nextX < 0 || nextX > 6 || nextY < 0 || nextY > 6 || walls.has(`${nextX},${nextY}`)) {
      extraGame.message = "The hedge blocks that way. Find another path!";
      return;
    }
    extraGame.mazeX = nextX; extraGame.mazeY = nextY;
    if (nextX === 6 && nextY === 6) {
      extraGame.score = Math.max(1, Math.ceil(30 - extraGame.elapsed));
      finishExtraMiniGame("You found the golden garden exit!");
    } else {
      extraGame.score += 1;
      extraGame.message = "Keep following the winding hedge path to the exit.";
    }
  }

  function playExtraChoice(choice) {
    if (!extraGame.active) return;
    const game = extraMiniGames.find((item) => item.id === extraGame.id);
    if (!game) return;
    if (game.mode === "sort") {
      if (choice === extraGame.targetType) {
        extraGame.score += 1; extraGame.message = "Correct basket! Sort the next slime.";
        extraGame.targetType = ["blob", "fire", "fast", "frost"][Math.floor(Math.random() * 4)];
      } else {
        extraGame.lives -= 1; extraGame.message = "Wrong basket! Check the slime's color.";
      }
    } else if (game.mode === "rhythm") {
      if (choice === extraGame.sequence[extraGame.sequenceIndex]) {
        extraGame.sequenceIndex += 1;
        if (extraGame.sequenceIndex === extraGame.sequence.length) {
          extraGame.score += 1;
          createRhythmSequence();
        }
      } else {
        extraGame.lives -= 1; extraGame.sequenceIndex = 0;
        extraGame.message = "Oops! Try that pattern again: " + extraGame.sequence.map((item) => ({ left: "←", up: "↑", down: "↓", right: "→" }[item])).join("  ");
      }
    }
    updateExtraMiniGameUi(game);
  }

  function extraMiniGamePointer(event) {
    if (!extraGame.active) return;
    const game = extraMiniGames.find((item) => item.id === extraGame.id);
    const canvasElement = $("#extraCanvas");
    if (!game || !canvasElement) return;
    const rect = canvasElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) * canvasElement.width / rect.width;
    const y = (event.clientY - rect.top) * canvasElement.height / rect.height;
    if (game.mode === "stack") {
      extraMiniGameAction("stack");
    } else if (game.mode === "cannon" || game.mode === "rescue") {
      const hit = extraGame.objects.findIndex((target) => Math.hypot(target.x - x, target.y - y) < 42);
      if (hit >= 0) {
        extraGame.objects.splice(hit, 1);
        extraGame.score += 1;
        if (game.mode === "cannon") extraGame.objects.push(makeExtraTarget());
        updateExtraMiniGameUi(game);
      }
    }
  }

  function makeExtraTarget() {
    return { x: 50 + Math.random() * 660, y: 80 + Math.random() * 160, vx: (Math.random() < .5 ? -1 : 1) * (80 + Math.random() * 100), phase: Math.random() * Math.PI * 2 };
  }

  function finishExtraMiniGame(message = "") {
    extraGame.active = false; extraGame.over = true;
    const game = extraMiniGames.find((item) => item.id === extraGame.id);
    if (game && extraGame.score > progress.miniGames[game.bestKey]) {
      progress.miniGames[game.bestKey] = extraGame.score;
      saveProgress();
    }
    extraGame.message = `${message || "Round over!"} Score: ${extraGame.score} · Best: ${game ? progress.miniGames[game.bestKey] : extraGame.score}.`;
    if (game && menuPage === game.id) renderExtraMiniGame(game);
  }

  function updateExtraMiniGameUi(game) {
    const score = $("#extraScore");
    const lives = $("#extraLives");
    const message = $("#extraMessage");
    if (score) score.textContent = `Score: ${extraGame.score}`;
    if (lives) lives.textContent = `Lives: ${extraGame.lives}`;
    if (message) message.textContent = extraGame.message;
    drawExtraMiniGame(game);
    if (extraGame.lives <= 0) finishExtraMiniGame("Out of lives!");
  }

  function drawExtraMiniGame(game) {
    const canvasElement = $("#extraCanvas");
    if (!canvasElement) return;
    const context = canvasElement.getContext("2d");
    const gradient = context.createLinearGradient(0, 0, 0, canvasElement.height);
    gradient.addColorStop(0, "#83c9a0"); gradient.addColorStop(1, "#d4df91");
    context.fillStyle = gradient; context.fillRect(0, 0, canvasElement.width, canvasElement.height);
    context.fillStyle = "rgba(36,94,58,.28)";
    for (let index = 0; index < 7; index += 1) {
      context.beginPath(); context.ellipse(index * 125 + 35, 285, 76, 24, 0, 0, Math.PI * 2); context.fill();
    }
    const draw = (type, x, y, scale = 1.35) => {
      const enemy = enemies[type] || enemies.blob;
      drawSlime({ ...enemy, type, x, y, health: enemy.health, maxHealth: enemy.health, shield: 0, maxShield: 0, hitFlash: 0, phase: extraGame.phase }, context, scale);
    };
    const center = () => draw("blob", extraGame.x, extraGame.y);
    if (game.mode === "dodge") {
      context.strokeStyle = "rgba(255,255,255,.55)"; context.lineWidth = 3;
      for (let lane = 0; lane < 3; lane += 1) context.beginPath(), context.moveTo(185 + lane * 195, 40), context.lineTo(185 + lane * 195, 275), context.stroke();
      for (const obstacle of extraGame.objects) draw("fire", 185 + obstacle.lane * 195, obstacle.y, 1);
      draw("blob", 185 + extraGame.lane * 195, 238, 1.4);
    } else if (game.mode === "stack") {
      context.fillStyle = "#795a3a"; context.fillRect(280, 247, 200, 15);
      for (let index = 0; index < extraGame.score; index += 1) draw("blob", 380, 232 - index * 18, .8);
      draw("fast", extraGame.x, 100, 1.15);
    } else if (game.mode === "fishing") {
      context.fillStyle = "#579fa0"; context.fillRect(0, 150, 760, 150);
      context.strokeStyle = "#f4e3b4"; context.lineWidth = 4;
      context.beginPath(); context.moveTo(380, 48); context.lineTo(380, 177); context.stroke();
      context.fillStyle = extraGame.ripe ? "#ffcf63" : "#f2f4d0";
      context.beginPath(); context.arc(380, extraGame.ripe ? 188 : 168, 9, 0, Math.PI * 2); context.fill();
      if (extraGame.ripe) draw("blob", 465, 213, 1);
    } else if (game.mode === "sort") {
      context.fillStyle = "#725b49"; context.fillRect(60, 235, 640, 18);
      draw(extraGame.targetType, 380, 165, 1.65);
      context.fillStyle = "#fff4d1"; context.font = "700 18px sans-serif"; context.textAlign = "center";
      context.fillText("WHICH BASKET MATCHES?", 380, 48);
    } else if (game.mode === "volleyball") {
      context.fillStyle = "#f4e0a7"; context.fillRect(0, 260, 760, 40);
      context.fillStyle = "#fff6d8"; context.fillRect(375, 155, 8, 105);
      for (let y = 160; y < 260; y += 14) context.fillRect(365, y, 28, 2);
      center();
    } else if (game.mode === "maze") {
      const walls = new Set(["1,0", "1,1", "3,1", "4,1", "1,3", "2,3", "4,3", "5,3", "3,4", "3,5", "5,5"]);
      const size = 38, originX = 247, originY = 15;
      for (let y = 0; y < 7; y += 1) for (let x = 0; x < 7; x += 1) {
        const key = `${x},${y}`;
        context.fillStyle = walls.has(key) ? "#456747" : "#d7d99a";
        context.fillRect(originX + x * size, originY + y * size, size - 2, size - 2);
      }
      context.fillStyle = "#eac75c"; context.fillText("🏁", originX + 6 * size + 8, originY + 6 * size + 28);
      draw("blob", originX + extraGame.mazeX * size + 18, originY + extraGame.mazeY * size + 24, .45);
    } else if (game.mode === "rhythm") {
      center();
      context.fillStyle = "#fff4d1"; context.font = "700 24px sans-serif"; context.textAlign = "center";
      context.fillText(`BEAT ${extraGame.sequenceIndex + 1} / ${extraGame.sequence.length}`, 380, 55);
      for (let index = 0; index < extraGame.sequence.length; index += 1) {
        context.fillStyle = index < extraGame.sequenceIndex ? "#58a86a" : "#fff3c6";
        context.beginPath(); context.arc(300 + index * 54, 255, 13, 0, Math.PI * 2); context.fill();
      }
    } else if (game.mode === "cannon" || game.mode === "rescue") {
      for (const target of extraGame.objects) draw(game.mode === "cannon" ? "armored" : "blob", target.x, target.y, 1.15);
      if (game.mode === "cannon") {
        context.fillStyle = "#765b3a"; context.fillRect(34, 214, 55, 32);
        context.fillStyle = "#493c32"; context.fillRect(65, 225, 58, 12);
      }
    } else if (game.mode === "garden") {
      context.fillStyle = "#765638"; context.fillRect(90, 234, 580, 30);
      context.strokeStyle = "#4a8f4a"; context.lineWidth = 9;
      context.beginPath(); context.moveTo(380, 235); context.lineTo(380, 130); context.stroke();
      context.fillStyle = extraGame.ripe ? "#ffe475" : "#a8cf72";
      context.beginPath(); context.ellipse(340, 170, 35, 18, -.4, 0, Math.PI * 2); context.fill();
      context.beginPath(); context.ellipse(420, 150, 35, 18, .4, 0, Math.PI * 2); context.fill();
      draw(extraGame.ripe ? "blob" : "frost", 380, 115, 1.1);
    }
    if (!extraGame.active) {
      context.fillStyle = "rgba(18,43,30,.56)"; context.fillRect(0, 0, canvasElement.width, canvasElement.height);
      context.fillStyle = "#fff4d1"; context.font = "700 21px sans-serif"; context.textAlign = "center";
      context.fillText(extraGame.over ? "Round complete!" : "Start to play!", canvasElement.width / 2, canvasElement.height / 2);
    }
  }

  function renderBlobClicker() {
    const mini = progress.miniGames;
    const upgradeCost = 25 * (mini.clickerLevel + 1) ** 2;
    menuContent.innerHTML = `${pageHeader("Blob Clicker Tycoon", "Tap your blob to earn coins. Click power and idle earnings persist on this device.", '<button class="back-button" data-page="minigames">← Mini-games</button>')}
      <article class="content-card clicker-card">
        <div class="clicker-stats"><span>Blob coins<b id="clickerCoins">${mini.clickerCoins.toLocaleString()}</b></span><span>Per tap<b id="clickerPower">+${mini.clickPower}</b></span><span>Idle rate<b id="clickerRate">${mini.clickerLevel} / sec</b></span></div>
        <button class="clicker-blob-button" type="button" data-action="click-blob" aria-label="Tap the blob to earn ${mini.clickPower} coins">
          <canvas id="clickerBlobCanvas" width="300" height="210" aria-hidden="true"></canvas><span>Tap the blob!</span></button>
        <div class="clicker-upgrades"><div><strong>Blob training · Level ${mini.clickerLevel}</strong><small>Increase your tap power by 1 and passive income by 1 coin per second.</small></div>
          <button class="purchase-button" data-action="upgrade-clicker" ${mini.clickerCoins < upgradeCost ? "disabled" : ""}>Train · 🪙 ${upgradeCost}</button></div>
      </article>`;
  }

  function renderSlimeSprint() {
    menuContent.innerHTML = `${pageHeader("Slime Sprint", "Jump over the approaching slime obstacles. Press Space, ↑, or tap the game to jump.", '<button class="back-button" data-page="minigames">← Mini-games</button>')}
      <article class="content-card sprint-card">
        <canvas id="sprintCanvas" width="760" height="260" aria-label="Slime Sprint. Jump over slimes to survive."></canvas>
        <div class="sprint-info"><span id="sprintScore">Score: ${Math.floor(sprint.score)}</span><span>Best: ${progress.miniGames.sprintBest}</span></div>
        <p id="sprintMessage">${sprint.over ? "The run ended. Try to beat your best!" : sprint.active ? "Jump over the slimes!" : "Ready? Start a run and jump to dodge the slimes."}</p>
        <button class="primary-button" data-action="start-sprint">${sprint.over ? "Run again" : sprint.active ? "Restart run" : "Start run"}</button>
      </article>`;
    drawSprint();
  }

  function renderBlobPop() {
    menuContent.innerHTML = `${pageHeader("Blob Pop", "Click bouncing blobs for points. Catch as many as you can before time runs out.", '<button class="back-button" data-page="minigames">← Mini-games</button>')}
      <article class="content-card arcade-card">
        <div class="arcade-score-row"><span id="popScore">Score: ${popGame.score}</span><span id="popTimer">${popGame.active ? `${Math.ceil(30 - popGame.elapsed)}s left` : "30 seconds"}</span><span>Best: ${progress.miniGames.popBest}</span></div>
        <canvas id="popCanvas" width="760" height="340" aria-label="Blob Pop. Click bouncing blobs to score points."></canvas>
        <p id="popMessage">${popGame.over ? "Time's up! Play again to beat your best." : popGame.active ? "Pop the blobs!" : "Start the game, then click the bouncing blobs."}</p>
        <button class="primary-button" data-action="start-pop">${popGame.over ? "Play again" : popGame.active ? "Restart" : "Start Blob Pop"}</button>
      </article>`;
    drawBlobPop();
  }

  function renderBlobMatch() {
    if (matchGame.cards.length === 0) resetMatchGame(false);
    menuContent.innerHTML = `${pageHeader("Blob Match", "Find all four matching slime pairs. Remember each blob's battlefield look.", '<button class="back-button" data-page="minigames">← Mini-games</button>')}
      <article class="content-card arcade-card">
        <div class="arcade-score-row"><span id="matchMoves">Moves: ${matchGame.moves}</span><span id="matchPairs">Pairs: ${matchGame.matchedPairs} / 4</span><span>Best: ${progress.miniGames.matchBest ? `${progress.miniGames.matchBest} moves` : "—"}</span></div>
        <div class="match-grid">${matchGame.cards.map((card, index) => {
          const visible = card.revealed || card.matched;
          return `<button class="match-card ${card.matched ? "matched" : ""}" type="button" data-match-card="${index}" aria-label="${visible ? enemies[card.type].name : "Hidden slime card"}" ${card.matched || !matchGame.active ? "disabled" : ""}>
            <span class="match-card-back" ${visible ? "hidden" : ""}>🟢</span>
            <canvas class="match-card-canvas" width="100" height="84" data-match-preview="${index}" ${visible ? "" : "hidden"} aria-hidden="true"></canvas>
          </button>`;
        }).join("")}</div>
        <p id="matchMessage">${matchGame.matchedPairs === 4 ? `All pairs matched in ${matchGame.moves} moves!` : matchGame.active ? "Flip two cards and find the matching slimes." : "Start a round and match all four pairs."}</p>
        <button class="primary-button" data-action="start-match">${matchGame.matchedPairs === 4 ? "Play again" : matchGame.active ? "Restart" : "Start Blob Match"}</button>
      </article>`;
    drawMatchCards();
  }

  function renderBlobCatcher() {
    menuContent.innerHTML = `${pageHeader("Blob Catcher", "Move your blob under friendly slimes. Avoid the fiery ones! Move with your mouse, finger, or arrow keys.", '<button class="back-button" data-page="minigames">← Mini-games</button>')}
      <article class="content-card arcade-card">
        <div class="arcade-score-row"><span id="catcherScore">Caught: ${catcherGame.score}</span><span id="catcherTimer">${catcherGame.active ? `${Math.ceil(30 - catcherGame.elapsed)}s left` : "30 seconds"}</span><span id="catcherLives">Lives: ${catcherGame.lives || 3}</span></div>
        <canvas id="catcherCanvas" width="760" height="320" aria-label="Blob Catcher. Catch green slimes and avoid red fire slimes."></canvas>
        <p id="catcherMessage">${catcherGame.over ? "Round over! Try another catch." : catcherGame.active ? "Catch green blobs and dodge the red ones!" : "Start a round and move left and right to catch blobs."}</p>
        <button class="primary-button" data-action="start-catcher">${catcherGame.over ? "Play again" : catcherGame.active ? "Restart" : "Start Blob Catcher"}</button>
      </article>`;
    drawBlobCatcher();
  }

  function resetMatchGame(active = true) {
    const types = ["blob", "fire", "fast", "frost"];
    matchGame.cards = [...types, ...types].map((type, index) => ({
      type, revealed: false, matched: false, order: Math.random() + index
    })).sort((a, b) => a.order - b.order);
    matchGame.active = active;
    matchGame.first = -1;
    matchGame.resolveTimer = 0;
    matchGame.moves = 0;
    matchGame.matchedPairs = 0;
  }

  function drawMatchCards() {
    for (const canvasElement of menuContent.querySelectorAll("[data-match-preview]")) {
      const card = matchGame.cards[Number(canvasElement.dataset.matchPreview)];
      const cardCtx = canvasElement.getContext("2d");
      if (!card || !cardCtx || canvasElement.hidden) continue;
      cardCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      const enemy = enemies[card.type];
      drawSlime({
        ...enemy, type: card.type, x: canvasElement.width / 2, y: 48, health: enemy.health,
        maxHealth: enemy.health, shield: 0, maxShield: 0, hitFlash: 0, phase: 0
      }, cardCtx, 1.15);
    }
  }

  function drawBlobPop() {
    const canvasElement = $("#popCanvas");
    if (!canvasElement) return;
    const popCtx = canvasElement.getContext("2d");
    popCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const sky = popCtx.createLinearGradient(0, 0, 0, canvasElement.height);
    sky.addColorStop(0, "#83c9a0"); sky.addColorStop(1, "#d4df91");
    popCtx.fillStyle = sky; popCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    popCtx.fillStyle = "rgba(255,255,218,.12)";
    for (let i = 0; i < 9; i += 1) popCtx.beginPath(), popCtx.arc(40 + i * 95, 45 + (i % 3) * 22, 18, 0, Math.PI * 2), popCtx.fill();
    for (const target of popGame.targets) {
      const enemy = enemies[target.type];
      drawSlime({ ...enemy, type: target.type, x: target.x, y: target.y, health: enemy.health, maxHealth: enemy.health, shield: 0, maxShield: 0, hitFlash: 0, phase: target.phase }, popCtx, 1.2);
    }
    popCtx.fillStyle = "rgba(18,43,30,.7)"; popCtx.fillRect(0, 0, canvasElement.width, 37);
    popCtx.fillStyle = "#fff4d1"; popCtx.font = "700 15px sans-serif"; popCtx.textAlign = "left";
    popCtx.fillText(`BLOBS POPPED: ${popGame.score}`, 17, 25);
    if (!popGame.active) {
      popCtx.fillStyle = "rgba(18,43,30,.64)"; popCtx.fillRect(0, 37, canvasElement.width, canvasElement.height - 37);
      popCtx.fillStyle = "#fff4d1"; popCtx.font = "700 21px sans-serif"; popCtx.textAlign = "center";
      popCtx.fillText(popGame.over ? "Time's up! Try for a bigger score." : "Start and pop the bouncing blobs!", canvasElement.width / 2, canvasElement.height / 2);
    }
  }

  function startBlobPop() {
    popGame.active = true; popGame.over = false; popGame.elapsed = 0;
    popGame.score = 0; popGame.spawnTimer = 0; popGame.targets = [];
    for (let index = 0; index < 5; index += 1) addPopTarget();
    renderBlobPop();
  }

  function addPopTarget() {
    const type = ["blob", "fire", "fast", "frost"][Math.floor(Math.random() * 4)];
    popGame.targets.push({
      type, x: 45 + Math.random() * 670, y: 95 + Math.random() * 205,
      vx: (Math.random() < .5 ? -1 : 1) * (65 + Math.random() * 90),
      vy: (Math.random() < .5 ? -1 : 1) * (42 + Math.random() * 65),
      phase: Math.random() * Math.PI * 2
    });
  }

  function popTargetAt(event) {
    if (!popGame.active) return;
    const canvasElement = $("#popCanvas");
    const rect = canvasElement.getBoundingClientRect();
    const x = (event.clientX - rect.left) * canvasElement.width / rect.width;
    const y = (event.clientY - rect.top) * canvasElement.height / rect.height;
    const targetIndex = popGame.targets.findIndex((target) => Math.hypot(target.x - x, target.y - y) < enemies[target.type].size * 1.6);
    if (targetIndex < 0) return;
    popGame.targets.splice(targetIndex, 1);
    popGame.score += 1;
    addPopTarget();
    const score = $("#popScore");
    if (score) score.textContent = `Score: ${popGame.score}`;
    drawBlobPop();
  }

  function finishBlobPop() {
    popGame.active = false;
    popGame.over = true;
    if (popGame.score > progress.miniGames.popBest) {
      progress.miniGames.popBest = popGame.score;
      saveProgress();
    }
    const message = $("#popMessage");
    const button = menuContent.querySelector('[data-action="start-pop"]');
    if (message) message.textContent = `Time's up! You popped ${popGame.score} blobs. Best: ${progress.miniGames.popBest}.`;
    if (button) button.textContent = "Play again";
    drawBlobPop();
  }

  function selectMatchCard(index) {
    const card = matchGame.cards[index];
    if (!matchGame.active || !card || card.matched || card.revealed || matchGame.resolveTimer > 0) return;
    card.revealed = true;
    if (matchGame.first < 0) {
      matchGame.first = index;
    } else {
      const firstIndex = matchGame.first;
      const first = matchGame.cards[firstIndex];
      matchGame.first = -1;
      matchGame.moves += 1;
      if (first.type === card.type) {
        first.matched = true;
        card.matched = true;
        matchGame.matchedPairs += 1;
        if (matchGame.matchedPairs === 4) finishBlobMatch();
      } else {
        matchGame.resolveTimer = .8;
      }
    }
    renderBlobMatch();
  }

  function finishBlobMatch() {
    matchGame.active = false;
    const best = progress.miniGames.matchBest;
    if (!best || matchGame.moves < best) {
      progress.miniGames.matchBest = matchGame.moves;
      saveProgress();
    }
    const message = $("#matchMessage");
    if (message) message.textContent = `All four pairs matched in ${matchGame.moves} moves!`;
    const button = menuContent.querySelector('[data-action="start-match"]');
    if (button) button.textContent = "Play again";
  }

  function startBlobCatcher() {
    catcherGame.active = true; catcherGame.over = false; catcherGame.elapsed = 0;
    catcherGame.score = 0; catcherGame.lives = 3; catcherGame.playerX = 380;
    catcherGame.spawnTimer = .4; catcherGame.drops = [];
    renderBlobCatcher();
  }

  function drawBlobCatcher() {
    const canvasElement = $("#catcherCanvas");
    if (!canvasElement) return;
    const catcherCtx = canvasElement.getContext("2d");
    catcherCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const sky = catcherCtx.createLinearGradient(0, 0, 0, canvasElement.height);
    sky.addColorStop(0, "#8ccdaa"); sky.addColorStop(1, "#d4df91");
    catcherCtx.fillStyle = sky; catcherCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    catcherCtx.fillStyle = "rgba(53,110,75,.22)";
    for (let i = 0; i < 7; i += 1) catcherCtx.beginPath(), catcherCtx.ellipse(i * 125 + 35, 285, 72, 30, 0, 0, Math.PI * 2), catcherCtx.fill();
    for (const drop of catcherGame.drops) {
      const enemy = enemies[drop.type];
      drawSlime({ ...enemy, type: drop.type, x: drop.x, y: drop.y, health: enemy.health, maxHealth: enemy.health, shield: 0, maxShield: 0, hitFlash: 0, phase: drop.phase }, catcherCtx, .95);
    }
    const catcher = { ...enemies.blob, type: "blob", x: catcherGame.playerX, y: 267, health: 100, maxHealth: 100, shield: 0, maxShield: 0, hitFlash: 0, phase: 0 };
    drawSlime(catcher, catcherCtx, 1.5);
    catcherCtx.fillStyle = "rgba(18,43,30,.7)"; catcherCtx.fillRect(0, 0, canvasElement.width, 35);
    catcherCtx.fillStyle = "#fff4d1"; catcherCtx.font = "700 14px sans-serif"; catcherCtx.textAlign = "left";
    catcherCtx.fillText(`CAUGHT: ${catcherGame.score}  ·  LIVES: ${catcherGame.lives || 3}`, 16, 23);
    if (!catcherGame.active) {
      catcherCtx.fillStyle = "rgba(18,43,30,.64)"; catcherCtx.fillRect(0, 35, canvasElement.width, canvasElement.height - 35);
      catcherCtx.fillStyle = "#fff4d1"; catcherCtx.font = "700 21px sans-serif"; catcherCtx.textAlign = "center";
      catcherCtx.fillText(catcherGame.over ? "Round over! Try to catch a new high score." : "Catch green blobs. Dodge the red slimes!", canvasElement.width / 2, 116);
    }
  }

  function finishBlobCatcher() {
    catcherGame.active = false;
    catcherGame.over = true;
    if (catcherGame.score > progress.miniGames.catcherBest) {
      progress.miniGames.catcherBest = catcherGame.score;
      saveProgress();
    }
    const message = $("#catcherMessage");
    const button = menuContent.querySelector('[data-action="start-catcher"]');
    if (message) message.textContent = `Round over! You caught ${catcherGame.score} blobs. Best: ${progress.miniGames.catcherBest}.`;
    if (button) button.textContent = "Play again";
    drawBlobCatcher();
  }

  function drawEnemyPreviews() {
    for (const canvasElement of menuContent.querySelectorAll("[data-enemy-preview]")) {
      const enemyData = enemies[canvasElement.dataset.enemyPreview];
      const previewCtx = canvasElement.getContext("2d");
      if (!enemyData || !previewCtx) continue;
      previewCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      previewCtx.fillStyle = "rgba(9, 28, 22, .45)";
      previewCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
      const fullHealth = enemyData.health;
      drawSlime({
        ...enemyData, type: canvasElement.dataset.enemyPreview,
        x: canvasElement.width / 2, y: 92, health: fullHealth, maxHealth: fullHealth,
        shield: ["shield", "tideBoss", "crystalBoss"].includes(canvasElement.dataset.enemyPreview) ? fullHealth * .4 : 0,
        maxShield: ["shield", "tideBoss", "crystalBoss"].includes(canvasElement.dataset.enemyPreview) ? fullHealth * .4 : 0,
        hitFlash: 0, phase: 0
      }, previewCtx);
    }
  }

  function drawClickerBlob() {
    const canvasElement = $("#clickerBlobCanvas");
    if (!canvasElement) return;
    const previewCtx = canvasElement.getContext("2d");
    previewCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    drawSlime({
      ...enemies.blob, type: "blob", x: 150, y: 103, health: 100, maxHealth: 100,
      shield: 0, maxShield: 0, hitFlash: 0, phase: 0
    }, previewCtx, 2.2);
  }

  function startSprint() {
    sprint.active = true;
    sprint.over = false;
    sprint.elapsed = 0;
    sprint.score = 0;
    sprint.playerY = 184;
    sprint.velocityY = 0;
    sprint.obstacleTimer = .9;
    sprint.obstacles = [];
    drawSprint();
    const message = $("#sprintMessage");
    const button = menuContent.querySelector('[data-action="start-sprint"]');
    if (message) message.textContent = "Jump over the slimes!";
    if (button) button.textContent = "Restart run";
  }

  function jumpSprint() {
    if (!sprint.active || sprint.playerY < 183) return;
    sprint.velocityY = -405;
  }

  function endSprint() {
    sprint.active = false;
    sprint.over = true;
    const score = Math.floor(sprint.score);
    if (score > progress.miniGames.sprintBest) {
      progress.miniGames.sprintBest = score;
      saveProgress();
    }
    const message = $("#sprintMessage");
    const button = menuContent.querySelector('[data-action="start-sprint"]');
    if (message) message.textContent = `Run over · Score ${score}. Beat your best of ${progress.miniGames.sprintBest}!`;
    if (button) button.textContent = "Run again";
  }

  function drawSprint() {
    const canvasElement = $("#sprintCanvas");
    if (!canvasElement) return;
    const sprintCtx = canvasElement.getContext("2d");
    sprintCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    const sky = sprintCtx.createLinearGradient(0, 0, 0, canvasElement.height);
    sky.addColorStop(0, "#83c9a0"); sky.addColorStop(1, "#d4df91");
    sprintCtx.fillStyle = sky; sprintCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
    sprintCtx.fillStyle = "#795e48"; sprintCtx.fillRect(0, 210, canvasElement.width, 50);
    sprintCtx.fillStyle = "#b79a68"; sprintCtx.fillRect(0, 210, canvasElement.width, 7);
    const player = { ...enemies.blob, type: "blob", x: 100, y: sprint.playerY, health: 100, maxHealth: 100, shield: 0, maxShield: 0, hitFlash: 0, phase: 0 };
    drawSlime(player, sprintCtx);
    for (const obstacle of sprint.obstacles) {
      const slime = { ...enemies[obstacle.type], type: obstacle.type, x: obstacle.x, y: 191, health: 100, maxHealth: 100, shield: 0, maxShield: 0, hitFlash: 0, phase: obstacle.phase };
      drawSlime(slime, sprintCtx);
    }
    sprintCtx.fillStyle = "#254331"; sprintCtx.font = "700 14px sans-serif"; sprintCtx.textAlign = "left";
    sprintCtx.fillText(`SCORE ${Math.floor(sprint.score)}`, 18, 28);
    if (!sprint.active) {
      sprintCtx.fillStyle = "rgba(18, 43, 30, .67)"; sprintCtx.fillRect(0, 0, canvasElement.width, canvasElement.height);
      sprintCtx.fillStyle = "#fff4d1"; sprintCtx.font = "700 21px sans-serif"; sprintCtx.textAlign = "center";
      sprintCtx.fillText(sprint.over ? "Run over! Give it another hop." : "Start a run and dodge the slimes!", canvasElement.width / 2, 95);
    }
  }

  function updateMiniGames(dt) {
    if (menuPage === "slimebound" && !gameVisible) updateSlimebound(dt);
    if (menuPage === "enemy-index" && !gameVisible) drawEnemyPreviews();
    if (menuPage === "clicker" && !gameVisible) {
      drawClickerBlob();
      if (progress.miniGames.clickerLevel > 0) {
        clickerTimer += dt;
        if (clickerTimer >= 1) {
          const income = Math.floor(clickerTimer) * progress.miniGames.clickerLevel;
          clickerTimer %= 1;
          progress.miniGames.clickerCoins += income;
          saveProgress();
          const coins = $("#clickerCoins");
          const upgrade = menuContent.querySelector('[data-action="upgrade-clicker"]');
          const cost = 25 * (progress.miniGames.clickerLevel + 1) ** 2;
          if (coins) coins.textContent = progress.miniGames.clickerCoins.toLocaleString();
          if (upgrade) {
            upgrade.disabled = progress.miniGames.clickerCoins < cost;
            upgrade.textContent = `Train · 🪙 ${cost}`;
          }
        }
      }
    }
    if (menuPage === "blob-pop" && popGame.active && !gameVisible) {
      popGame.elapsed += dt;
      popGame.spawnTimer -= dt;
      if (popGame.spawnTimer <= 0 && popGame.targets.length < 8) {
        popGame.spawnTimer = .7;
        addPopTarget();
      }
      for (const target of popGame.targets) {
        target.x += target.vx * dt;
        target.y += target.vy * dt;
        if (target.x < 30 || target.x > 730) target.vx *= -1;
        if (target.y < 75 || target.y > 310) target.vy *= -1;
      }
      const timer = $("#popTimer");
      if (timer) timer.textContent = `${Math.max(0, Math.ceil(30 - popGame.elapsed))}s left`;
      drawBlobPop();
      if (popGame.elapsed >= 30) finishBlobPop();
    }
    if (menuPage === "blob-match" && matchGame.resolveTimer > 0 && !gameVisible) {
      matchGame.resolveTimer -= dt;
      if (matchGame.resolveTimer <= 0) {
        for (const card of matchGame.cards) if (!card.matched) card.revealed = false;
        renderBlobMatch();
      }
    }
    if (menuPage === "blob-catcher" && catcherGame.active && !gameVisible) {
      catcherGame.elapsed += dt;
      catcherGame.spawnTimer -= dt;
      if (catcherGame.spawnTimer <= 0) {
        catcherGame.spawnTimer = Math.max(.32, .78 - catcherGame.elapsed * .009);
        catcherGame.drops.push({
          x: 28 + Math.random() * 704, y: 38,
          type: Math.random() < .24 ? "fire" : "blob",
          phase: Math.random() * Math.PI * 2
        });
      }
      for (let index = catcherGame.drops.length - 1; index >= 0; index -= 1) {
        const drop = catcherGame.drops[index];
        drop.y += (115 + Math.min(85, catcherGame.elapsed * 2)) * dt;
        if (drop.y >= 246 && drop.y <= 282 && Math.abs(drop.x - catcherGame.playerX) < 38) {
          if (drop.type === "fire") catcherGame.lives -= 1;
          else catcherGame.score += 1;
          catcherGame.drops.splice(index, 1);
        } else if (drop.y > 300) {
          catcherGame.drops.splice(index, 1);
        }
      }
      const timer = $("#catcherTimer");
      const score = $("#catcherScore");
      const lives = $("#catcherLives");
      if (timer) timer.textContent = `${Math.max(0, Math.ceil(30 - catcherGame.elapsed))}s left`;
      if (score) score.textContent = `Caught: ${catcherGame.score}`;
      if (lives) lives.textContent = `Lives: ${catcherGame.lives}`;
      drawBlobCatcher();
      if (catcherGame.elapsed >= 30 || catcherGame.lives <= 0) finishBlobCatcher();
    }
    if (extraMiniGames.some((game) => game.id === menuPage) && extraGame.active && !gameVisible) updateExtraMiniGame(dt);
    if (menuPage !== "slime-sprint" || !sprint.active || gameVisible) return;
    sprint.elapsed += dt;
    sprint.score += dt * 10;
    sprint.playerY += sprint.velocityY * dt;
    sprint.velocityY += 1050 * dt;
    if (sprint.playerY >= 184) { sprint.playerY = 184; sprint.velocityY = 0; }
    sprint.obstacleTimer -= dt;
    if (sprint.obstacleTimer <= 0) {
      sprint.obstacleTimer = Math.max(.72, 1.35 - sprint.elapsed * .012) + Math.random() * .28;
      sprint.obstacles.push({ x: 790, type: Math.random() < .18 ? "fast" : "blob", phase: Math.random() * Math.PI * 2 });
    }
    for (const obstacle of sprint.obstacles) obstacle.x -= (260 + Math.min(160, sprint.elapsed * 7)) * dt;
    sprint.obstacles = sprint.obstacles.filter((obstacle) => obstacle.x > -35);
    if (sprint.obstacles.some((obstacle) => Math.abs(obstacle.x - 100) < 27 && Math.abs(sprint.playerY - 184) < 30)) {
      endSprint();
    }
    drawSprint();
    const score = $("#sprintScore");
    if (score) score.textContent = `Score: ${Math.floor(sprint.score)}`;
  }

  function updateExtraMiniGame(dt) {
    const game = extraMiniGames.find((item) => item.id === extraGame.id);
    if (!game) return;
    extraGame.elapsed += dt;
    extraGame.phase += dt * 3;
    if (game.mode === "dodge") {
      extraGame.spawnTimer -= dt;
      if (extraGame.spawnTimer <= 0) {
        extraGame.spawnTimer = Math.max(.42, .95 - extraGame.elapsed * .012);
        extraGame.objects.push({ lane: Math.floor(Math.random() * 3), y: 42 });
      }
      for (let index = extraGame.objects.length - 1; index >= 0; index -= 1) {
        const hazard = extraGame.objects[index];
        hazard.y += 150 * dt;
        if (hazard.lane === extraGame.lane && hazard.y > 210 && hazard.y < 250) {
          extraGame.lives -= 1;
          extraGame.objects.splice(index, 1);
          extraGame.message = "Ouch! Dodge the falling fire slime.";
        } else if (hazard.y > 310) {
          extraGame.score += 1;
          extraGame.objects.splice(index, 1);
        }
      }
    } else if (game.mode === "stack") {
      extraGame.x += extraGame.vx * dt;
      if (extraGame.x < 80 || extraGame.x > 680) extraGame.vx *= -1;
    } else if (game.mode === "fishing") {
      extraGame.spawnTimer -= dt;
      if (extraGame.spawnTimer <= 0) {
        const wasBiting = extraGame.ripe;
        extraGame.ripe = !extraGame.ripe;
        extraGame.spawnTimer = extraGame.ripe ? 1.15 : 1.4 + Math.random() * 1.8;
        if (extraGame.ripe) extraGame.message = "Bite! Reel in now!";
        else if (wasBiting) extraGame.message = "The blob fish got away. Watch for another bite!";
      }
    } else if (game.mode === "volleyball") {
      extraGame.x += extraGame.vx * dt;
      extraGame.y = 155 + Math.sin(extraGame.phase * 1.4) * 74;
      if (extraGame.x > 710) extraGame.vx = -Math.abs(extraGame.vx);
      if (extraGame.x < 55) extraGame.vx = Math.abs(extraGame.vx);
    } else if (game.mode === "cannon" || game.mode === "rescue") {
      for (const target of extraGame.objects) {
        target.x += target.vx * dt;
        target.y += Math.sin(extraGame.phase + target.phase) * 18 * dt;
        if (target.x < 35 || target.x > 725) target.vx *= -1;
      }
      if (game.mode === "rescue" && extraGame.objects.length < 5) extraGame.objects.push(makeExtraTarget());
    } else if (game.mode === "garden") {
      const wasRipe = extraGame.ripe;
      extraGame.ripe = extraGame.phase % 4 > 2.4;
      if (extraGame.ripe) extraGame.message = "The garden blob is ripe—harvest it!";
      else if (wasRipe) extraGame.message = "The garden blob is growing. Wait for the glow!";
    }
    const timer = $("#extraTimer");
    if (timer) timer.textContent = `${Math.max(0, Math.ceil(30 - extraGame.elapsed))}s left`;
    drawExtraMiniGame(game);
    if (extraGame.elapsed >= 30) finishExtraMiniGame("Time's up!");
    else if (extraGame.lives <= 0) finishExtraMiniGame("Out of lives!");
    else {
      const score = $("#extraScore");
      const lives = $("#extraLives");
      const message = $("#extraMessage");
      if (score) score.textContent = `Score: ${extraGame.score}`;
      if (lives) lives.textContent = `Lives: ${extraGame.lives}`;
      if (message) message.textContent = extraGame.message;
    }
  }

  function buildBattleShop() {
    shopRoot.innerHTML = Object.entries(towerTypes).map(([id, tower]) =>
      `<button class="battle-shop-item" data-battle-tower="${id}" type="button" aria-label="Select ${tower.name}, costs ${tower.cost} coins">
        <span class="battle-shop-icon">${tower.icon}</span><span><strong>${tower.name}</strong><small>${tower.damage} dmg · ${tower.cooldown}s · Range ${tower.range}</small></span><span class="battle-shop-price">🪙 ${tower.cost}</span></button>`
    ).join("");
  }

  function updateBattleUI(refreshDetails = true) {
    if (!run) return;
    const world = worlds.find((item) => item.id === run.world) || worlds[0];
    const challengeName = { "boss-rush": "Boss Rush", "iron-keep": "Iron Keep", "slime-swarm": "Slime Swarm" }[run.challengeId];
    $("#battleLevel").textContent = `${world.name} · Level ${run.level}${run.mode === "endless" ? " · Endless" : run.mode === "daily" ? " · Daily" : run.mode === "challenge" ? ` · ${challengeName || "Challenge"}` : ""}`;
    $("#battleWave").textContent = `${run.wave} / ${run.mode === "endless" ? "∞" : "5"}`;
    $("#battleHealth").textContent = `${Math.max(0, Math.ceil(run.castleHealth))} / ${run.startHealth}`;
    $("#battleCoins").textContent = String(run.coins);
    $("#battleRemaining").textContent = String(run.enemies.filter((enemy) => enemy.alive).length + run.waveQueue.length - run.spawnIndex);
    const labels = {
      ready: run.mode === "endless" ? (run.wave ? "Wave complete · Prepare for the next endless wave!" : "Prepare for endless survival!") : run.wave ? "Wave complete · Build or upgrade, then continue!" : "Prepare your defenses!",
      countdown: `Wave ${run.wave + 1} begins in ${Math.max(1, Math.ceil(run.countdown))}…`,
      wave: `Wave ${run.wave} · ${run.waveQueue.length - run.spawnIndex} yet to arrive`,
      paused: "Battle paused · Take a breather.",
      victory: "Level complete · The castle is safe!",
      gameover: "Castle destroyed · Regroup and try again."
    };
    const autoMessage = run.status === "ready" && run.autoWave && run.autoWaveTimer > 0
      ? ` · Auto wave in ${Math.max(1, Math.ceil(run.autoWaveTimer))}s` : "";
    $("#battleStatus").textContent = paused ? labels.paused : `${labels[run.status] || labels.ready}${autoMessage}`;
    $("#startWaveBtn").textContent = run.status === "ready" && run.wave > 0 ? "Start next wave" : run.status === "countdown" ? "Wave incoming…" : "Start wave";
    $("#startWaveBtn").disabled = paused || run.status !== "ready" || (run.mode !== "endless" && run.wave >= 5);
    $("#pauseBtn").textContent = paused ? "▶ Resume" : "Ⅱ Pause";
    $("#pauseBtn").disabled = run.status === "victory" || run.status === "gameover";
    $("#autoWaveBtn").textContent = `Auto wave: ${run.autoWave ? "On" : "Off"}`;
    $("#autoWaveBtn").setAttribute("aria-pressed", String(run.autoWave));
    $("#autoWaveBtn").disabled = run.status === "victory" || run.status === "gameover";
    $("#speedBtn").textContent = `${progress.settings.speed}× Speed`;
    $("#cancelPlacementBtn").classList.toggle("hidden", !pendingTower);
    const hazardLabels = { bog: "bog speeds slimes up", frost: "frost slows slimes down", ember: "embers burn slimes" };
    const mapInstruction = pendingTower ? "Click open grass to place your tower · Esc to cancel" :
      selectedTower ? "Tower selected · Upgrade or sell it in the panel." : "Choose a tower, then place it on open grass.";
    $("#mapHint").textContent = `${mapInstruction} · Road hazard: ${hazardLabels[run.hazard.kind]}.`;
    shopRoot.querySelectorAll("[data-battle-tower]").forEach((button) => {
      const type = button.dataset.battleTower;
      button.classList.toggle("selected", pendingTower === type);
      button.disabled = run.coins < towerTypes[type].cost || run.status === "victory" || run.status === "gameover";
    });
    if (refreshDetails) updateTowerDetails();
    updateWallet();
  }

  function updateTowerDetails() {
    const details = $("#towerDetails");
    if (!selectedTower || !run || !run.towers.includes(selectedTower)) {
      details.innerHTML = `<h3>Defender's guide</h3><p>${pendingTower ? `Place your ${towerTypes[pendingTower].name} on open grass. It costs ${towerTypes[pendingTower].cost} coins.` : "Slimes follow the road. Place towers nearby and protect the castle!"}</p>`;
      return;
    }
    const tower = selectedTower;
    const upgradeCost = tower.level < 7 ? tower.upgradeCost : null;
    const pathName = tower.specialization === "power" ? " · Power path" : tower.specialization === "rapid" ? " · Rapid path" : "";
    details.innerHTML = `<h3>${towerTypes[tower.type].name} · Level ${tower.level}${pathName}</h3>
      <div class="tower-stat-grid"><span>Damage<b>${tower.damage}</b></span><span>Attack speed<b>${tower.cooldown.toFixed(2)}s</b></span><span>Range<b>${Math.round(tower.range)}</b></span><span>Invested<b>🪙 ${tower.invested}</b></span></div>
      <p>${towerTypes[tower.type].description}</p>
      <div class="tower-detail-actions">${tower.level === 3 && !tower.specialization
        ? `<button class="small-button" data-tower-specialization="power">Power specialization</button><button class="small-button" data-tower-specialization="rapid">Rapid specialization</button>`
        : `<button class="small-button" data-tower-action="upgrade" ${upgradeCost === null || run.coins < upgradeCost ? "disabled" : ""}>${upgradeCost === null ? "Max level" : `Upgrade · 🪙 ${upgradeCost}`}</button>`}
        <button class="danger-button" data-tower-action="sell">Sell · 🪙 ${Math.floor(tower.invested * .5)}</button></div>`;
  }

  function makeWave(waveNumber, scale) {
    const queue = [];
    const challengeScale = run && run.mode === "challenge"
      ? run.challengeId === "iron-keep" ? 1.3 : run.challengeId === "slime-swarm" ? .92 : 1
      : 1;
    const waveScale = scale * challengeScale * (run && run.mode === "endless" ? 1 + Math.max(0, waveNumber - 5) * .1 : 1);
    const add = (type, count = 1) => {
      const swarmCount = run.mode === "challenge" && run.challengeId === "slime-swarm" ? 2 : 1;
      for (let index = 0; index < count * swarmCount; index += 1) {
        const base = enemies[type];
        queue.push({
          type, health: Math.round(base.health * waveScale), maxHealth: Math.round(base.health * waveScale),
          speed: base.speed * (waveScale > 1 ? 1 + (waveScale - 1) * .12 : 1),
          damage: Math.ceil(base.damage * (run && run.challengeId === "iron-keep" ? 1.3 : 1)), reward: base.reward, color: base.color, size: base.size,
          shield: ["shield", "tideBoss", "crystalBoss"].includes(type) ? Math.round(base.health * .4) : 0,
          maxShield: ["shield", "tideBoss", "crystalBoss"].includes(type) ? Math.round(base.health * .4) : 0,
          healTimer: .8,
          burnRemaining: 0, burnTick: 0, poisonRemaining: type === "poison" ? 3 : 0,
          poisonTick: .7, hazardTick: .7, slowRemaining: 0, windSlowRemaining: 0, alive: true, rewarded: false,
          segment: 0, segmentDistance: 0, x: path[0].x, y: path[0].y,
          distance: 0, hitFlash: 0, phase: Math.random() * Math.PI * 2
        });
      }
    };
    if (run.mode === "challenge" && run.challengeId === "boss-rush") {
      const bossByWave = ["boss", "sandBoss", "stormBoss", "tideBoss", "crystalBoss"];
      add("fast", waveNumber + 2);
      add("armored", Math.max(1, waveNumber - 1));
      if (waveNumber >= 3) add("healer", 1 + Math.floor(waveNumber / 3));
      if (waveNumber >= 4) add("shield", waveNumber - 2);
      add(bossByWave[Math.min(waveNumber - 1, bossByWave.length - 1)]);
      if (waveNumber === 5) { add("sandBoss"); add("stormBoss"); add("shadowBoss"); }
      return queue;
    }
    if (waveNumber === 1) { add("fire", 3); add("blob", 2); }
    if (waveNumber === 2) { add("fire", 4); add("blob", 4); }
    if (waveNumber === 3) { add("fire", 4); add("blob", 3); add("fast", 3); }
    if (waveNumber === 4) { add("fire", 4); add("blob", 3); add("fast", 2); add("armored", 3); }
    if (waveNumber === 5) { add("fire", 3); add("blob", 3); add("fast", 2); add("armored", 2); add("boss", 1); }
    if (waveNumber === 5 && run.world === 6) add("stormBoss");
    if (waveNumber === 5 && run.world === 7) add("sandBoss");
    if (waveNumber === 5 && run.world === 8) add("tideBoss");
    if (waveNumber === 5 && run.world === 9) add("crystalBoss");
    if (waveNumber === 5 && run.world === 10) add("shadowBoss");
    if (waveNumber >= 3 && run.world >= 3) add("frost", 2 + Math.floor(waveNumber / 4));
    if (waveNumber >= 4 && run.world >= 5) add("poison", 2 + Math.floor(waveNumber / 5));
    if (waveNumber >= 3 && run.world >= 7) { add("shield", 1 + Math.floor(waveNumber / 3)); add("healer", 1); }
    if (waveNumber >= 4 && run.world >= 8) add("healer", 1 + Math.floor(waveNumber / 4));
    if (waveNumber >= 3 && run.world >= 9) add("crystal", 1 + Math.floor(waveNumber / 4));
    if (waveNumber >= 3 && run.world >= 10) add("shadow", 2 + Math.floor(waveNumber / 4));
    if (waveNumber >= 6) {
      add("split", Math.min(7, 2 + Math.floor(waveNumber / 3)));
      add("fast", Math.min(12, 3 + Math.floor(waveNumber / 2)));
      add("armored", Math.min(8, 1 + Math.floor(waveNumber / 4)));
      if (waveNumber % 5 === 0) add("boss");
      if (waveNumber % 10 === 0) add("stormBoss");
    }
    return queue;
  }

  function startWave() {
    if (!run || run.status !== "ready" || (run.mode !== "endless" && run.wave >= 5) || paused) return;
    run.status = "countdown";
    run.countdown = 3;
    run.started = true;
    run.waveQueue = makeWave(run.wave + 1, activeLevel.scale);
    run.spawnIndex = 0;
    run.spawnTimer = 0;
    run.autoWaveTimer = 0;
    playSound("wave");
    updateBattleUI(false);
  }

  function spawnEnemy(blueprint) {
    const enemy = { ...blueprint };
    run.enemies.push(enemy);
    if (!progress.discoveredEnemies.includes(enemy.type)) {
      progress.discoveredEnemies.push(enemy.type);
      saveProgress();
      notify(`New Enemy Index entry: ${enemies[enemy.type].name}`);
    }
  }

  function finishWave() {
    if (run.completedWaves.includes(run.wave)) return;
    run.completedWaves.push(run.wave);
    run.waveActive = false;
    run.status = "ready";
    run.autoWaveTimer = run.autoWave && (run.mode === "endless" || run.wave < 5) ? 3 : 0;
    const bonus = 25 + run.wave * 5;
    addRunCoins(bonus, `Wave ${run.wave} complete! +${bonus} bonus coins.`);
    trackDailyChallenge("waves");
    if (run.mode === "endless") {
      progress.achievementProgress.endlessWave = Math.max(Number(progress.achievementProgress.endlessWave || 0), run.wave);
      refreshAchievements();
      saveProgress();
      updateBattleUI();
      return;
    }
    if (run.wave >= 5) {
      finishLevel();
      return;
    }
    updateBattleUI();
  }

  function finishLevel() {
    if (!run || run.completionPaid) return;
    run.completionPaid = true;
    run.status = "victory";
    run.waveActive = false;
    const id = levelId(run.world, run.level);
    const firstCompletion = run.mode !== "challenge" && !progress.completedLevels.includes(id);
    if (firstCompletion) progress.completedLevels.push(id);
    bumpMetric("victories", 1);
    bumpMetric("waves", 5);
    if (run.castleHealth >= run.startHealth) bumpMetric("perfectWins", 1);
    if (run.mode === "challenge" && run.challengeId && !progress.completedChallenges.includes(run.challengeId)) {
      progress.completedChallenges.push(run.challengeId);
      progress.achievementProgress.challengeWins = progress.completedChallenges.length;
      grantGems(25, "challenge-completion", false);
      notify("Challenge cleared for the first time! +25 gems.");
    }
    if (run.world === 7) bumpMetric("frontierWins", 1);
    if (run.world === 8) bumpMetric("abyssWins", 1);
    refreshAchievements();
    syncProgressUnlocks();
    saveProgress();
    const defeated = run.defeated;
    showModal("LEVEL COMPLETE!", `All five waves defeated! Enemies defeated: ${defeated}. Coins earned this battle: ${run.earnedCoins}. Any unspent battle coins reset when you leave this battle.`, [
      { label: "Continue", action: "continue", primary: true },
      { label: "Replay", action: "replay", secondary: true },
      { label: "Main menu", action: "home", secondary: true }
    ], "🏆");
    updateBattleUI();
  }

  function gameOver() {
    if (!run || run.status === "gameover" || run.status === "victory") return;
    run.status = "gameover";
    run.waveActive = false;
    paused = false;
    projectiles.length = 0;
    updateBattleUI();
    showModal("CASTLE DESTROYED!", `${run.mode === "endless" ? `Your endless run ended at wave ${run.wave}. ` : `The castle fell during wave ${run.wave}. `}${run.defeated} enemies defeated. Your saved unlocks are safe.`, [
      { label: "Retry", action: "retry", primary: true },
      { label: "Main menu", action: "home", secondary: true }
    ], "🛡️");
  }

  function addRunCoins(amount, message, earned = true, showFloating = true) {
    if (!run || !Number.isSafeInteger(amount) || amount <= 0) return false;
    run.coins += amount;
    if (earned) run.earnedCoins += amount;
    if (showFloating) floatingTexts.push({ x: 850, y: 335, text: `+${amount} 🪙`, color: "#ffdf74", life: 1.3, maxLife: 1.3 });
    if (message) notify(message);
    updateBattleUI();
    return true;
  }

  function spendRunCoins(amount, message) {
    if (!run || !Number.isSafeInteger(amount) || amount <= 0) {
      console.error("Rejected invalid battle coin transaction.", { amount });
      notify("That battle coin transaction could not be completed.");
      return false;
    }
    if (run.coins < amount) {
      notify(message);
      return false;
    }
    run.coins -= amount;
    updateBattleUI();
    return true;
  }

  function damageCastle(enemy) {
    if (!run) return;
    run.castleHealth = Math.max(0, run.castleHealth - enemy.damage);
    run.enemies = run.enemies.filter((item) => item !== enemy);
    spawnBurst(enemy.x, enemy.y, "#ffe8a5", 12);
    floatingTexts.push({ x: 856, y: 388, text: `-${enemy.damage}`, color: "#ff8e77", life: 1.1, maxLife: 1.1 });
    playSound("damage");
    updateBattleUI();
    if (run.castleHealth <= 0) gameOver();
  }

  function pointSegmentDistance(x, y, a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / lengthSq));
    return Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy));
  }

  function isValidPlacement(type, x, y) {
    if (!run || !towerTypes[type] || x < 36 || x > 922 || y < 50 || y > 584) return false;
    const castle = path[path.length - 1];
    if (Math.hypot(x - castle.x, y - castle.y) < 82) return false;
    for (let index = 0; index < path.length - 1; index += 1) {
      if (pointSegmentDistance(x, y, path[index], path[index + 1]) < 58) return false;
    }
    return run.towers.every((tower) => Math.hypot(tower.x - x, tower.y - y) >= 48);
  }

  function placeTower(type, x, y) {
    const definition = towerTypes[type];
    if (!definition || !isValidPlacement(type, x, y)) {
      notify("That spot is blocked. Choose open grass away from the road and castle.");
      return false;
    }
    if (!spendRunCoins(definition.cost, `Not enough coins for a ${definition.name}.`)) return false;
    const tower = {
      type, x, y, level: 1, damage: definition.damage, specialization: null,
      cooldown: definition.cooldown, range: definition.range,
      timer: 0, invested: definition.cost, upgradeCost: 50, recoil: 0
    };
    run.towers.push(tower);
    selectedTower = tower;
    pendingTower = null;
    bumpMetric("towers", 1);
    trackDailyChallenge("towers");
    playSound("build");
    updateBattleUI();
    return true;
  }

  function upgradeTower() {
    if (!selectedTower || !run) return;
    const tower = selectedTower;
    if (tower.level >= 7 || (tower.level === 3 && !tower.specialization)) return;
    const price = tower.upgradeCost;
    if (!spendRunCoins(price, "Not enough coins for this tower upgrade.")) return;
    tower.invested += price;
    tower.level += 1;
    tower.damage = Math.round(tower.damage * 1.45);
    tower.range += 14;
    tower.cooldown = Math.max(.45, tower.cooldown * .88);
    if (tower.specialization === "power") tower.damage = Math.round(tower.damage * 1.18);
    if (tower.specialization === "rapid") tower.cooldown = Math.max(.35, tower.cooldown * .9);
    tower.upgradeCost = Math.round(price * 1.55);
    playSound("build");
    notify(`${towerTypes[tower.type].name} upgraded to level ${tower.level}!`);
    updateBattleUI();
  }

  function specializeTower(specialization) {
    if (!selectedTower || selectedTower.level !== 3 || selectedTower.specialization || !["power", "rapid"].includes(specialization)) return;
    selectedTower.specialization = specialization;
    if (specialization === "power") selectedTower.damage = Math.round(selectedTower.damage * 1.35);
    else {
      selectedTower.cooldown = Math.max(.35, selectedTower.cooldown * .78);
      selectedTower.range = Math.round(selectedTower.range * 1.08);
    }
    notify(`${towerTypes[selectedTower.type].name} chose the ${specialization === "power" ? "Power" : "Rapid"} path.`);
    updateBattleUI();
  }
  function sellTower() {
    if (!selectedTower || !run) return;
    const tower = selectedTower;
    const refund = Math.floor(tower.invested * .5);
    run.towers = run.towers.filter((item) => item !== tower);
    selectedTower = null;
    addRunCoins(refund, null, false, false);
    playSound("coin");
    notify(`Tower sold for ${refund} coins.`);
    updateBattleUI();
  }

  function getTarget(tower) {
    let target = null;
    for (const enemy of run.enemies) {
      if (!enemy.alive || Math.hypot(enemy.x - tower.x, enemy.y - tower.y) > tower.range) continue;
      if (!target || enemy.distance > target.distance) target = enemy;
    }
    return target;
  }

  function fireTower(tower) {
    const target = getTarget(tower);
    if (!target) return;
    tower.timer = tower.cooldown;
    tower.recoil = .22;
    projectiles.push({
      x: tower.x, y: tower.y - 17, target, type: towerTypes[tower.type].attack,
      speed: tower.type === "cannon" ? 310 : 440, damage: tower.damage,
      life: 2, color: tower.type === "ice" ? "#a5f2ff" : tower.type === "fire" ? "#ff8c48" :
        tower.type === "poison" ? "#c2ee70" : tower.type === "lightning" ? "#d5c6ff" :
          tower.type === "wind" ? "#8ff1db" : tower.type === "crystal" ? "#b7f4ff" : tower.type === "nature" ? "#c4ed86" : "#f9e1a3"
    });
    playSound("shot", tower.type);
  }

  function damageEnemy(enemy, damage, type) {
    if (!enemy.alive) return;
    if (enemy.type === "stormBoss" && enemy.health / enemy.maxHealth > .55) damage *= .7;
    if (enemy.type === "sandBoss" && enemy.health / enemy.maxHealth > .5) damage *= .75;
    if (enemy.type === "crystalBoss" && enemy.health / enemy.maxHealth > .5) damage *= .72;
    if (enemy.type === "crystal" && enemy.health / enemy.maxHealth > .6) damage *= .8;
    if (type === "arcane" || type === "crystal") damage *= 1.25;
    else if (enemy.shield > 0) {
      const absorbed = Math.min(enemy.shield, damage * .55);
      enemy.shield -= absorbed;
      damage -= absorbed;
    }
    enemy.health -= damage;
    enemy.hitFlash = .14;
    if (type === "fire") { enemy.burnRemaining = 3; enemy.burnTick = .65; }
    if (type === "ice") enemy.slowRemaining = 1.8;
    if (type === "poison") { enemy.poisonRemaining = 4; enemy.poisonTick = .7; }
    if (type === "wind") enemy.windSlowRemaining = 1.2;
    floatingTexts.push({ x: enemy.x, y: enemy.y - 22, text: `-${Math.round(damage)}`, color: type === "ice" ? "#c9f8ff" : "#fff3d4", life: .65, maxLife: .65 });
    if (enemy.health <= 0) defeatEnemy(enemy);
  }

  function defeatEnemy(enemy) {
    if (!enemy.alive || enemy.rewarded) return;
    enemy.alive = false;
    enemy.rewarded = true;
    run.defeated += 1;
    run.totalEnemiesDefeated += 1;
    const reward = enemy.reward + run.seasonBonus;
    addRunCoins(reward, null, true, false);
    trackDailyChallenge("kills");
    progress.achievementProgress.kills = Number(progress.achievementProgress.kills || 0) + 1;
    const bossTypes = ["boss", "stormBoss", "sandBoss", "tideBoss", "crystalBoss", "shadowBoss"];
    if (bossTypes.includes(enemy.type)) {
      progress.achievementProgress.bosses = Number(progress.achievementProgress.bosses || 0) + 1;
      if (!progress.defeatedBosses.includes(enemy.type)) {
        progress.defeatedBosses.push(enemy.type);
        progress.achievementProgress.uniqueBosses = progress.defeatedBosses.length;
      }
      syncProgressUnlocks();
    }
    if (enemy.type === "stormBoss") {
      progress.achievementProgress.stormBosses = Number(progress.achievementProgress.stormBosses || 0) + 1;
      syncProgressUnlocks();
    } else refreshAchievements();
    if (enemy.type === "split") {
      for (let index = 0; index < 2; index += 1) {
        run.enemies.push({
          ...enemy, type: "fast", health: 35, maxHealth: 35, speed: 92,
          damage: 4, reward: 5, size: 9, x: enemy.x + (index ? 10 : -10),
          y: enemy.y + 8, alive: true, rewarded: false
        });
      }
    }
    spawnBurst(enemy.x, enemy.y, enemy.color, ["boss", "stormBoss", "sandBoss", "tideBoss", "crystalBoss", "shadowBoss"].includes(enemy.type) ? 24 : 12);
    floatingTexts.push({ x: enemy.x, y: enemy.y - 12, text: `+${reward} 🪙`, color: "#ffe17d", life: .95, maxLife: .95 });
    playSound("coin");
    updateBattleUI();
  }

  function updateEnemies(dt) {
    for (const enemy of [...run.enemies]) {
      if (!enemy.alive) {
        run.enemies = run.enemies.filter((item) => item !== enemy);
        continue;
      }
      enemy.hitFlash = Math.max(0, enemy.hitFlash - dt);
      if (enemy.shield < enemy.maxShield) enemy.shield = Math.min(enemy.maxShield, enemy.shield + 13 * dt);
      if (enemy.type === "healer") {
        enemy.healTimer -= dt;
        if (enemy.healTimer <= 0) {
          enemy.healTimer += .8;
          for (const ally of run.enemies) {
            if (ally !== enemy && ally.alive && ally.health < ally.maxHealth && Math.hypot(ally.x - enemy.x, ally.y - enemy.y) < 92) {
              ally.health = Math.min(ally.maxHealth, ally.health + 12);
              spawnBurst(ally.x, ally.y - 8, "#d8f28c", 2);
            }
          }
        }
      }
      if (enemy.burnRemaining > 0) {
        enemy.burnTick -= dt;
        if (enemy.burnTick <= 0) {
          enemy.burnTick += .65;
          enemy.burnRemaining -= 1;
          enemy.health -= Math.max(2, Math.round(4 * activeLevel.scale));
          spawnBurst(enemy.x, enemy.y - 4, "#ff9d4c", 2);
          if (enemy.health <= 0) { defeatEnemy(enemy); continue; }
        }
      }
      if (enemy.poisonRemaining > 0) {
        enemy.poisonTick -= dt;
        if (enemy.poisonTick <= 0) {
          enemy.poisonTick += .7;
          enemy.poisonRemaining -= 1;
          enemy.health -= Math.max(2, Math.round(5 * activeLevel.scale));
          spawnBurst(enemy.x, enemy.y - 4, "#a9e05d", 2);
          if (enemy.health <= 0) { defeatEnemy(enemy); continue; }
        }
      }
      enemy.slowRemaining = Math.max(0, enemy.slowRemaining - dt);
      enemy.windSlowRemaining = Math.max(0, enemy.windSlowRemaining - dt);
      const hazardMultiplier = run.hazard.segment === enemy.segment ? run.hazard.kind === "bog" ? 1.25 : run.hazard.kind === "frost" ? .68 : 1 : 1;
      if (run.hazard.kind === "ember" && run.hazard.segment === enemy.segment) {
        enemy.hazardTick -= dt;
        if (enemy.hazardTick <= 0) {
          enemy.hazardTick += .7;
          enemy.health -= Math.max(2, Math.round(5 * activeLevel.scale));
          spawnBurst(enemy.x, enemy.y, "#ff9b59", 2);
          if (enemy.health <= 0) { defeatEnemy(enemy); continue; }
        }
      }
      const shadowSurge = enemy.type === "shadowBoss" ? 1 + .35 * Math.min(1, enemy.distance / Math.max(1, pathLengths.reduce((sum, length) => sum + length, 0))) : 1;
      let move = enemy.speed * shadowSurge * (enemy.slowRemaining > 0 ? .55 : 1) * (enemy.windSlowRemaining > 0 ? .68 : 1) * hazardMultiplier * dt;
      while (move > 0 && enemy.segment < path.length - 1) {
        const a = path[enemy.segment];
        const b = path[enemy.segment + 1];
        const length = pathLengths[enemy.segment];
        const remaining = length - enemy.segmentDistance;
        const step = Math.min(move, remaining);
        enemy.segmentDistance = (enemy.segmentDistance || 0) + step;
        enemy.distance += step;
        move -= step;
        const t = length ? enemy.segmentDistance / length : 1;
        enemy.x = a.x + (b.x - a.x) * t;
        enemy.y = a.y + (b.y - a.y) * t;
        if (enemy.segmentDistance >= length - .01) {
          enemy.segment += 1;
          enemy.segmentDistance = 0;
        }
      }
      if (enemy.segment >= path.length - 1) damageCastle(enemy);
    }
  }

  function updateProjectiles(dt) {
    for (let index = projectiles.length - 1; index >= 0; index -= 1) {
      const projectile = projectiles[index];
      projectile.life -= dt;
      if (!projectile.target.alive || projectile.life <= 0) {
        projectiles.splice(index, 1);
        continue;
      }
      const dx = projectile.target.x - projectile.x;
      const dy = projectile.target.y - projectile.y;
      const distance = Math.hypot(dx, dy);
      const step = projectile.speed * dt;
      if (distance <= step + 8) {
        const target = projectile.target;
        if (projectile.type === "cannon") {
          for (const enemy of run.enemies) {
            if (enemy.alive && Math.hypot(enemy.x - target.x, enemy.y - target.y) < 58) {
              damageEnemy(enemy, projectile.damage, "cannon");
            }
          }
          spawnBurst(target.x, target.y, "#ffd071", 12);
        } else if (projectile.type === "lightning") {
          damageEnemy(target, projectile.damage, "lightning");
          const nearby = run.enemies.filter((enemy) => enemy.alive && enemy !== target && Math.hypot(enemy.x - target.x, enemy.y - target.y) < 92).slice(0, 2);
          nearby.forEach((enemy) => damageEnemy(enemy, projectile.damage * .65, "lightning"));
          spawnBurst(target.x, target.y, "#d5c6ff", 12);
        } else {
          damageEnemy(target, projectile.damage, projectile.type);
          spawnBurst(target.x, target.y, projectile.color, 5);
        }
        projectiles.splice(index, 1);
      } else {
        projectile.x += dx / distance * step;
        projectile.y += dy / distance * step;
      }
    }
  }

  function updateBattle(dt) {
    if (!run || paused || !gameVisible || !run.started || run.status === "victory" || run.status === "gameover") return;
    const scale = progress.settings.speed;
    const step = dt * scale;
    if (run.status === "countdown") {
      run.countdown -= step;
      if (run.countdown <= 0) {
        run.wave += 1;
        run.status = "wave";
        run.waveActive = true;
      }
    }
    if (run.status === "wave") {
      run.spawnTimer += step;
      if (run.spawnIndex < run.waveQueue.length && run.spawnTimer >= .82) {
        run.spawnTimer = 0;
        spawnEnemy(run.waveQueue[run.spawnIndex]);
        run.spawnIndex += 1;
      }
    }
    updateEnemies(step);
    if (run.status === "gameover" || run.status === "victory") return;
    if (run.status === "ready" && run.autoWave && run.autoWaveTimer > 0) {
      run.autoWaveTimer -= step;
      if (run.autoWaveTimer <= 0) startWave();
    }
    for (const tower of run.towers) {
      const chilled = run.enemies.some((enemy) => enemy.alive && enemy.type === "frost" && Math.hypot(enemy.x - tower.x, enemy.y - tower.y) < 90);
      tower.timer -= step * (chilled ? .65 : 1);
      tower.recoil = Math.max(0, tower.recoil - step);
      if (tower.timer <= 0) fireTower(tower);
    }
    updateProjectiles(step);
    if (run.status === "wave" && run.spawnIndex >= run.waveQueue.length && run.enemies.length === 0) finishWave();
  }

  function spawnBurst(x, y, color, count) {
    if (progress.settings.reducedMotion) return;
    if (progress.settings.quality === "low") count = Math.ceil(count * .4);
    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 25 + Math.random() * 95;
      particles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color, life: .35 + Math.random() * .5, size: 2 + Math.random() * 3 });
    }
  }

  function updateEffects(dt) {
    for (let index = particles.length - 1; index >= 0; index -= 1) {
      const particle = particles[index];
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 38 * dt;
      particle.life -= dt;
      if (particle.life <= 0) particles.splice(index, 1);
    }
    for (let index = floatingTexts.length - 1; index >= 0; index -= 1) {
      const text = floatingTexts[index];
      text.y -= 24 * dt;
      text.life -= dt;
      if (text.life <= 0) floatingTexts.splice(index, 1);
    }
  }

  function drawBackground() {
    const world = worlds.find((item) => item.id === (run ? run.world : 1)) || worlds[0];
    const gradient = ctx.createLinearGradient(0, 0, 960, 620);
    gradient.addColorStop(0, world.color[0]);
    gradient.addColorStop(1, world.color[1]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 960, 620);
    ctx.fillStyle = "rgba(255,255,218,.08)";
    ctx.beginPath(); ctx.ellipse(450, 310, 510, 355, -.08, 0, Math.PI * 2); ctx.fill();
    if (run && run.season) {
      ctx.fillStyle = "rgba(18,38,31,.64)";
      ctx.beginPath(); ctx.roundRect(16, 16, 190, 30, 10); ctx.fill();
      ctx.fillStyle = "#fff0c5"; ctx.font = "700 12px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`${run.season.icon} ${run.season.name} · +${run.seasonBonus} coins`, 26, 36);
    }
    if (progress.settings.quality === "high") {
      for (const flower of flowerSpots) {
        if (isNearRoad(flower.x, flower.y, 47)) continue;
        ctx.fillStyle = flower.color;
        ctx.beginPath(); ctx.arc(flower.x, flower.y, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(31,83,44,.45)";
        ctx.fillRect(flower.x - .5, flower.y + 2, 1, 4);
      }
      for (const [x, y] of treeSpots) {
        if (isNearRoad(x, y, 58)) continue;
        drawTree(x, y);
      }
      drawDecoration(85, 440); drawDecoration(373, 218); drawDecoration(779, 512);
    } else {
      for (const [x, y] of treeSpots.filter((_, index) => index % 2 === 0)) {
        if (!isNearRoad(x, y, 58)) drawTree(x, y);
      }
    }
    drawRoad();
    drawEntrance();
    drawCastle();
  }

  function isNearRoad(x, y, threshold) {
    for (let index = 0; index < path.length - 1; index += 1) {
      if (pointSegmentDistance(x, y, path[index], path[index + 1]) < threshold) return true;
    }
    return false;
  }

  function drawTree(x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = "rgba(26,54,30,.25)"; ctx.beginPath(); ctx.ellipse(2, 10, 23, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#79583b"; ctx.fillRect(-4, -2, 8, 21);
    const colors = ["#39784a", "#46894e", "#579451"];
    for (let index = 0; index < 3; index += 1) {
      ctx.fillStyle = colors[index];
      ctx.beginPath(); ctx.arc(index % 2 ? 9 : -8, -9 - index * 6, 14 - index, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "rgba(208,238,151,.25)"; ctx.beginPath(); ctx.arc(-8, -20, 5, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawDecoration(x, y) {
    if (isNearRoad(x, y, 52)) return;
    ctx.fillStyle = "rgba(255,241,192,.35)";
    ctx.beginPath(); ctx.ellipse(x, y, 17, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#d5bc8e"; ctx.beginPath(); ctx.ellipse(x, y - 3, 10, 5, -.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#a38d6b"; ctx.beginPath(); ctx.ellipse(x + 13, y, 6, 4, .4, 0, Math.PI * 2); ctx.fill();
  }

  function drawRoad() {
    ctx.save();
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    const drawStroke = (color, width) => {
      ctx.beginPath(); ctx.moveTo(path[0].x, path[0].y);
      for (let index = 1; index < path.length; index += 1) ctx.lineTo(path[index].x, path[index].y);
      ctx.lineWidth = width; ctx.strokeStyle = color; ctx.stroke();
    };
    drawStroke("#815d42", 75);
    drawStroke("#d9bd83", 66);
    drawStroke("#aa825b", 54);
    drawStroke("#c09a6b", 42);
    ctx.setLineDash([12, 16]); drawStroke("rgba(255,232,185,.38)", 2); ctx.setLineDash([]);
    ctx.restore();
  }

  function drawEntrance() {
    ctx.save();
    const entrance = path[0];
    ctx.fillStyle = "#6e4935";
    ctx.beginPath(); ctx.ellipse(entrance.x + 42, entrance.y, 22, 38, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2a3829";
    ctx.beginPath(); ctx.ellipse(entrance.x + 42, entrance.y, 13, 27, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f3db9b"; ctx.font = "700 12px sans-serif"; ctx.textAlign = "center"; ctx.fillText("SLIME GATE", entrance.x + 44, entrance.y - 42);
    ctx.restore();
  }

  function drawFlag(x, y, color, phase) {
    ctx.strokeStyle = "#594a3e"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - 45); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(x + 1, y - 44); ctx.lineTo(x + 24 + Math.sin(phase) * 2, y - 38); ctx.lineTo(x + 1, y - 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#ffe69a"; ctx.beginPath(); ctx.arc(x, y - 46, 3, 0, Math.PI * 2); ctx.fill();
  }

  function drawCastle() {
    const skin = skins[progress.equippedSkin] || skins.classic;
    const bob = progress.settings.reducedMotion ? 0 : Math.sin(animationTime * 2.5) * 1.5;
    ctx.save();     const castle = path[path.length - 1];
    ctx.translate(castle.x - 3, castle.y - 28 + bob);
    ctx.fillStyle = "rgba(33,53,31,.28)"; ctx.beginPath(); ctx.ellipse(0, 37, 69, 17, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = skin.trim; ctx.fillRect(-62, -26, 124, 61);
    ctx.fillStyle = skin.wall; ctx.fillRect(-57, -31, 114, 61);
    for (let index = 0; index < 6; index += 1) {
      ctx.fillStyle = skin.wall;
      ctx.fillRect(-58 + index * 20, -40, 12, 10);
      ctx.strokeStyle = "rgba(65,62,53,.19)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-54 + index * 20, -8); ctx.lineTo(-42 + index * 20, -8); ctx.stroke();
    }
    ctx.fillStyle = skin.trim; ctx.fillRect(-21, 2, 42, 33);
    ctx.fillStyle = "#513d30"; ctx.beginPath(); ctx.roundRect(-14, 7, 28, 29, 13, 13); ctx.fill();
    ctx.fillStyle = "rgba(255,239,184,.75)";
    ctx.beginPath(); ctx.roundRect(-45, -19, 13, 17, 6, 6); ctx.fill();
    ctx.beginPath(); ctx.roundRect(32, -19, 13, 17, 6, 6); ctx.fill();
    ctx.fillStyle = "rgba(255,251,220,.75)";
    ctx.fillRect(-42, -15, 3, 9); ctx.fillRect(35, -15, 3, 9);
    for (const [x, color] of [[-53, "#b94f45"], [39, "#dbae4d"]]) {
      ctx.fillStyle = skin.wall; ctx.fillRect(x, -56, 20, 30);
      ctx.fillStyle = skin.roof; ctx.beginPath(); ctx.moveTo(x - 4, -55); ctx.lineTo(x + 10, -75); ctx.lineTo(x + 24, -55); ctx.closePath(); ctx.fill();
      drawFlag(x + 11, -74, color, animationTime * 4);
    }
    ctx.fillStyle = skin.roof; ctx.beginPath(); ctx.moveTo(-25, -31); ctx.lineTo(0, -57); ctx.lineTo(25, -31); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#9c744b"; ctx.fillRect(-63, 31, 126, 6);
    ctx.restore();
  }

  function drawSlime(enemy, targetCtx = ctx, scale = 1) {
    const bounce = progress.settings.reducedMotion ? 0 : Math.sin(animationTime * (enemy.type === "fast" ? 13 : 7) + enemy.phase) * 2.4;
    const squish = progress.settings.reducedMotion ? 1 : 1 + Math.sin(animationTime * 8 + enemy.phase) * .055;
    const radius = enemy.size;
    const draw = targetCtx;
    draw.save(); draw.translate(enemy.x, enemy.y + bounce);
    draw.scale(scale * squish, scale * (2 - squish));
    draw.fillStyle = "rgba(29,48,29,.22)"; draw.beginPath(); draw.ellipse(0, radius + 3, radius * 1.1, 5, 0, 0, Math.PI * 2); draw.fill();
    const gradient = draw.createRadialGradient(-radius * .35, -radius * .45, 2, 0, 0, radius * 1.4);
    gradient.addColorStop(0, enemy.hitFlash > 0 ? "#fff7e2" : lighten(enemy.color));
    gradient.addColorStop(1, enemy.color);
    draw.fillStyle = gradient;
    draw.beginPath(); draw.ellipse(0, 0, radius * 1.15, radius * .9, 0, Math.PI, Math.PI * 2); draw.lineTo(radius * .98, radius * .5);
    draw.quadraticCurveTo(0, radius * 1.25, -radius * .98, radius * .5); draw.closePath(); draw.fill();
    draw.strokeStyle = "rgba(40,56,39,.2)"; draw.lineWidth = 1.5; draw.stroke();
    draw.fillStyle = "#fffdf1";
    draw.beginPath(); draw.ellipse(-radius * .32, -radius * .12, radius * .22, radius * .29, 0, 0, Math.PI * 2); draw.fill();
    draw.beginPath(); draw.ellipse(radius * .32, -radius * .12, radius * .22, radius * .29, 0, 0, Math.PI * 2); draw.fill();
    draw.fillStyle = "#26342d";
    draw.beginPath(); draw.arc(-radius * .27, -radius * .09, radius * .1, 0, Math.PI * 2); draw.fill();
    draw.beginPath(); draw.arc(radius * .37, -radius * .09, radius * .1, 0, Math.PI * 2); draw.fill();
    draw.strokeStyle = "#6c3435"; draw.lineWidth = 1.5; draw.beginPath(); draw.arc(0, radius * .16, radius * .18, .2, Math.PI - .2); draw.stroke();
    if (enemy.type === "armored") {
      draw.fillStyle = "#aebac0"; draw.strokeStyle = "#596974"; draw.lineWidth = 2;
      draw.beginPath(); draw.ellipse(0, -radius * .15, radius * 1.2, radius * .42, 0, Math.PI, Math.PI * 2); draw.fill(); draw.stroke();
      draw.fillStyle = "#f2db83"; draw.beginPath(); draw.arc(0, -radius * .1, 3, 0, Math.PI * 2); draw.fill();
    } else if (["boss", "stormBoss", "sandBoss", "tideBoss", "crystalBoss", "shadowBoss"].includes(enemy.type)) {
      draw.fillStyle = "#f5d76d"; draw.strokeStyle = "#a47735"; draw.lineWidth = 1.5;
      draw.beginPath(); draw.moveTo(-14, -radius * .68); draw.lineTo(-13, -radius - 10); draw.lineTo(-5, -radius - 3); draw.lineTo(0, -radius - 13); draw.lineTo(6, -radius - 3); draw.lineTo(14, -radius - 10); draw.lineTo(13, -radius * .68); draw.closePath(); draw.fill(); draw.stroke();
      draw.fillStyle = "#fff0a2"; draw.beginPath(); draw.arc(0, -radius * .8, 2, 0, Math.PI * 2); draw.fill();
    } else if (enemy.type === "poison") {
      draw.fillStyle = "rgba(187,231,96,.55)"; draw.beginPath(); draw.arc(0, -radius * .55, 5, 0, Math.PI * 2); draw.fill();
    } else if (enemy.type === "frost") {
      draw.fillStyle = "#e3ffff"; draw.beginPath(); draw.moveTo(0, -radius - 4); draw.lineTo(4, -radius); draw.lineTo(0, -radius + 4); draw.lineTo(-4, -radius); draw.closePath(); draw.fill();
    } else if (enemy.type === "healer") {
      draw.fillStyle = "#f4ffd0"; draw.beginPath(); draw.arc(0, -radius * .72, 4, 0, Math.PI * 2); draw.fill();
    } else if (enemy.type === "fire") {
      draw.fillStyle = "rgba(255,193,85,.4)"; draw.beginPath(); draw.arc(-radius * .55, -radius * .5, 3, 0, Math.PI * 2); draw.fill();
    }
    if (enemy.shield > 0) {
      draw.strokeStyle = "rgba(178,245,255,.82)"; draw.lineWidth = 2;
      draw.beginPath(); draw.ellipse(0, 0, radius * 1.42, radius * 1.15, 0, animationTime, animationTime + Math.PI * 1.65); draw.stroke();
    }
    if (enemy.type === "healer") {
      draw.strokeStyle = "rgba(228,255,158,.62)"; draw.lineWidth = 1.5;
      draw.beginPath(); draw.arc(0, 0, radius * 1.5 + Math.sin(animationTime * 4) * 2, 0, Math.PI * 2); draw.stroke();
    }
    draw.restore();
    const barWidth = radius * 2.1 * scale;
    draw.fillStyle = "rgba(31,40,33,.8)"; draw.fillRect(enemy.x - barWidth / 2, enemy.y - (radius + 13) * scale, barWidth, 5 * scale);
    draw.fillStyle = enemy.health / enemy.maxHealth < .3 ? "#f36a56" : "#77db7c";
    draw.fillRect(enemy.x - barWidth / 2, enemy.y - (radius + 13) * scale, barWidth * Math.max(0, enemy.health / enemy.maxHealth), 5 * scale);
    if (enemy.maxShield > 0) {
      draw.fillStyle = "rgba(31,40,33,.8)"; draw.fillRect(enemy.x - barWidth / 2, enemy.y - (radius + 18) * scale, barWidth, 3 * scale);
      draw.fillStyle = "#8ce7f3"; draw.fillRect(enemy.x - barWidth / 2, enemy.y - (radius + 18) * scale, barWidth * Math.max(0, enemy.shield / enemy.maxShield), 3 * scale);
    }
    if (["boss", "stormBoss", "sandBoss", "tideBoss", "crystalBoss", "shadowBoss"].includes(enemy.type)) {
      draw.fillStyle = "#fff0c9"; draw.font = `700 ${10 * scale}px sans-serif`; draw.textAlign = "center";
      draw.fillText(`${Math.ceil(enemy.health)} / ${enemy.maxHealth}`, enemy.x, enemy.y - (radius + 28) * scale);
    }
  }

  function lighten(hex) {
    const value = parseInt(hex.slice(1), 16);
    const r = Math.min(255, ((value >> 16) & 255) + 60);
    const g = Math.min(255, ((value >> 8) & 255) + 60);
    const b = Math.min(255, (value & 255) + 60);
    return `rgb(${r},${g},${b})`;
  }

  function drawTower(tower) {
    const definition = towerTypes[tower.type];
    ctx.save(); ctx.translate(tower.x, tower.y);
    if (selectedTower === tower) {
      ctx.beginPath(); ctx.arc(0, 0, tower.range, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(243,224,151,.09)"; ctx.fill();
      ctx.strokeStyle = "rgba(255,244,195,.56)"; ctx.lineWidth = 1.5; ctx.setLineDash([6, 7]); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.fillStyle = "rgba(33,53,31,.25)"; ctx.beginPath(); ctx.ellipse(2, 11, 23, 8, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#665340"; ctx.beginPath(); ctx.ellipse(0, 5, 20, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = definition.color;
    ctx.beginPath(); ctx.moveTo(-14, 5); ctx.lineTo(-11, -13); ctx.lineTo(-7, -17); ctx.lineTo(7, -17); ctx.lineTo(11, -13); ctx.lineTo(14, 5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = lighten(definition.color); ctx.fillRect(-8, -11, 5, 12);
    ctx.fillStyle = "#463b33"; ctx.beginPath(); ctx.ellipse(0, -15, 13, 6, 0, Math.PI, Math.PI * 2); ctx.fill();
    if (tower.type === "archer") {
      ctx.strokeStyle = "#f8dea0"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(2, -18, 8, -.8, .8); ctx.stroke();
      ctx.strokeStyle = "#fff0b7"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(3, -25); ctx.lineTo(3, -11); ctx.stroke();
    } else if (tower.type === "fire") {
      ctx.fillStyle = "#ffcf64"; ctx.beginPath(); ctx.moveTo(0, -31); ctx.quadraticCurveTo(14, -17, 0, -10); ctx.quadraticCurveTo(-12, -20, 0, -31); ctx.fill();
      ctx.fillStyle = "#ff7347"; ctx.beginPath(); ctx.moveTo(0, -26); ctx.quadraticCurveTo(7, -18, 0, -14); ctx.quadraticCurveTo(-6, -20, 0, -26); ctx.fill();
    } else if (tower.type === "ice") {
      ctx.fillStyle = "#ddfaff"; ctx.beginPath(); ctx.moveTo(0, -31); ctx.lineTo(8, -19); ctx.lineTo(0, -9); ctx.lineTo(-8, -19); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#e7ffff"; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(0, -10); ctx.moveTo(-7, -19); ctx.lineTo(7, -19); ctx.stroke();
    } else if (tower.type === "poison") {
      ctx.fillStyle = "#c2ee70"; ctx.beginPath(); ctx.arc(0, -20, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#365a36"; ctx.beginPath(); ctx.arc(0, -20, 4, 0, Math.PI * 2); ctx.fill();
    } else if (tower.type === "lightning") {
      ctx.fillStyle = "#e6d9ff"; ctx.beginPath(); ctx.moveTo(4, -31); ctx.lineTo(-5, -17); ctx.lineTo(1, -17); ctx.lineTo(-4, -8); ctx.lineTo(8, -21); ctx.lineTo(2, -21); ctx.closePath(); ctx.fill();
    } else if (tower.type === "wind") {
      ctx.strokeStyle = "#b8fff0"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -19, 9, -.8, 1.9); ctx.arc(0, -19, 5, 2.4, 5.2); ctx.stroke();
    } else if (tower.type === "arcane") {
      ctx.fillStyle = "#e8c8ff"; ctx.beginPath(); ctx.arc(0, -20, 9, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#8b51c2"; ctx.beginPath(); ctx.arc(0, -20, 5, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#f4ddff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -20, 13, animationTime, animationTime + Math.PI * 1.35); ctx.stroke();
    } else if (tower.type === "crystal") {
      ctx.fillStyle = "#c4f4ff"; ctx.beginPath(); ctx.moveTo(0, -32); ctx.lineTo(9, -21); ctx.lineTo(0, -9); ctx.lineTo(-9, -21); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = "#f2ffff"; ctx.lineWidth = 1.5; ctx.stroke();
    } else if (tower.type === "nature") {
      ctx.fillStyle = "#b7e88b"; ctx.beginPath(); ctx.ellipse(-4, -20, 5, 10, -.7, 0, Math.PI * 2); ctx.ellipse(5, -20, 5, 10, .7, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = "#393d47"; ctx.beginPath(); ctx.ellipse(0, -17, 8, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#999ca2"; ctx.beginPath(); ctx.ellipse(0, -18, 5, 6, 0, 0, Math.PI * 2); ctx.fill();
    }
    for (let level = 1; level <= tower.level; level += 1) {
      ctx.fillStyle = "#ffe17c"; ctx.beginPath(); ctx.arc(-6 + level * 6, 8, 1.7, 0, Math.PI * 2); ctx.fill();
    }
    if (tower.recoil > 0) { ctx.fillStyle = "rgba(255,255,240,.3)"; ctx.beginPath(); ctx.arc(0, -17, 10 + tower.recoil * 15, 0, Math.PI * 2); ctx.fill(); }
    ctx.restore();
  }

  function drawBattle() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    if (run) {
      for (const tower of run.towers) drawTower(tower);
      for (const enemy of run.enemies) if (enemy.alive) drawSlime(enemy);
      for (const projectile of projectiles) {
        ctx.fillStyle = projectile.color; ctx.strokeStyle = "rgba(255,255,255,.62)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(projectile.x, projectile.y, projectile.type === "cannon" ? 7 : 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (projectile.type === "fire") { ctx.globalAlpha = .25; ctx.beginPath(); ctx.arc(projectile.x, projectile.y, 9, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
      }
      if (pendingTower && gameVisible) {
        const valid = isValidPlacement(pendingTower, mouse.x, mouse.y);
        const definition = towerTypes[pendingTower];
        ctx.fillStyle = valid ? "rgba(97,238,150,.13)" : "rgba(255,87,77,.14)";
        ctx.strokeStyle = valid ? "#91f3ae" : "#ff9281";
        ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mouse.x, mouse.y, definition.range, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.globalAlpha = .62; drawTower({ type: pendingTower, x: mouse.x, y: mouse.y, level: 1, recoil: 0 }); ctx.globalAlpha = 1;
      }
    }
    for (const particle of particles) {
      ctx.globalAlpha = Math.min(1, particle.life * 2); ctx.fillStyle = particle.color;
      ctx.beginPath(); ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const text of floatingTexts) {
      ctx.globalAlpha = Math.min(1, text.life * 1.7); ctx.fillStyle = text.color;
      ctx.font = "700 14px sans-serif"; ctx.textAlign = "center"; ctx.shadowColor = "rgba(27,39,26,.8)"; ctx.shadowBlur = 4;
      ctx.fillText(text.text, text.x, text.y); ctx.shadowBlur = 0;
    }
    ctx.globalAlpha = 1;
    if (run && run.status === "countdown") {
      ctx.fillStyle = "rgba(17,43,29,.78)"; ctx.beginPath(); ctx.roundRect(410, 23, 140, 50, 16); ctx.fill();
      ctx.fillStyle = "#fff0c5"; ctx.font = "700 22px Fredoka, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`WAVE ${run.wave + 1} · ${Math.ceil(run.countdown)}`, 480, 55);
    }
    if (run) {
      const healthRatio = Math.max(0, run.castleHealth / run.startHealth);
      const barColor = healthRatio > .6 ? "#6ecb75" : healthRatio > .3 ? "#e5bd51" : "#e56856";
      ctx.fillStyle = "rgba(19,38,27,.82)"; ctx.beginPath(); ctx.roundRect(762, 315, 150, 18, 7); ctx.fill();
      ctx.fillStyle = barColor; ctx.beginPath(); ctx.roundRect(765, 318, 144 * healthRatio, 12, 5); ctx.fill();
      ctx.fillStyle = "#fff7df"; ctx.font = "700 10px sans-serif"; ctx.textAlign = "center"; ctx.fillText("CASTLE HEALTH", 837, 308);
    }
  }

  function frame(timestamp) {
    if (!lastFrame) lastFrame = timestamp;
    const dt = Math.min(.25, (timestamp - lastFrame) / 1000);
    lastFrame = timestamp;
    if (!progress.settings.reducedMotion) animationTime += dt;
    updateBattle(dt);
    battleUiTimer += dt;
    if (gameVisible && run && battleUiTimer >= .2) {
      battleUiTimer = 0;
      updateBattleUI(false);
    }
    updateMiniGames(dt);
    updateEffects(dt);
    if (gameVisible) drawBattle();
    updateMusic(dt);
    requestAnimationFrame(frame);
  }

  function showModal(title, message, actions, icon = "✨") {
    modalRoot.innerHTML = `<div class="modal-backdrop" role="presentation"><section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="modal-icon">${icon}</div><h2 id="modalTitle">${title}</h2><p>${message}</p>
      <div class="modal-actions">${actions.map((action) => `<button class="${action.primary ? "primary-button" : "secondary-button"}" data-modal-action="${action.action}">${action.label}</button>`).join("")}</div>
    </section></div>`;
  }

  function clearModal() {
    modalRoot.innerHTML = "";
  }

  function onModalAction(action) {
    clearModal();
    if (action === "home") returnToMenu("main");
    if (action === "retry" && run) enterBattle(activeLevel);
    if (action === "replay" && activeLevel) enterBattle(activeLevel);
    if (action === "continue") {
      const next = levels.find((level) => levelUnlocked(level.world, level.level) && !levelCompleted(level.world, level.level));
      if (next) enterBattle(next);
      else returnToMenu("worlds");
    }
  }

  function playSound(kind, subtype = "") {
    if (kind !== "music" && (!progress.settings.sound || progress.settings.soundVolume <= 0)) return;
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioContext) audioContext = new AudioContextClass();
      if (audioContext.state === "suspended") audioContext.resume();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const volume = kind === "music" ? progress.settings.musicVolume / 100 * .035 : progress.settings.soundVolume / 100 * .09;
      const tone = kind === "music" ? Number(subtype) || 520 : kind === "coin" ? 740 : kind === "build" ? 440 : kind === "shot" ? subtype === "ice" ? 570 : 330 : kind === "damage" ? 145 : kind === "achievement" ? 880 : kind === "wave" ? 290 : 520;
      oscillator.type = kind === "shot" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(tone, audioContext.currentTime);
      if (kind === "music") oscillator.frequency.setValueAtTime(tone * 1.25, audioContext.currentTime + .12);
      gain.gain.setValueAtTime(volume, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + (kind === "music" ? .42 : .12));
      oscillator.connect(gain); gain.connect(audioContext.destination);
      oscillator.start(); oscillator.stop(audioContext.currentTime + (kind === "music" ? .43 : .13));
    } catch (error) {
      console.warn("Audio is unavailable in this browser.", error);
    }
  }

  function updateMusic(dt) {
    if (!progress.settings.music || progress.settings.musicVolume <= 0 || !gameVisible || paused) return;
    musicTimer += dt;
    if (musicTimer < .48) return;
    musicTimer = 0;
    const notes = [392, 494, 587, 494, 440, 523, 659, 523];
    const contextTone = notes[musicNote % notes.length];
    musicNote += 1;
    playSound("music", String(contextTone));
  }

  async function purchaseGemPackage(packageId) {
    const packages = { small: { gems: 1000, price: "$2.00" }, medium: { gems: 10000, price: "$15.00" }, large: { gems: 100000, price: "$50.00" } };
    const item = packages[packageId];
    if (!item) {
      notify("That gem package is unavailable.");
      return;
    }
    const accepted = window.confirm(`DEMO PURCHASE — NO MONEY WILL BE CHARGED\n\n${item.gems.toLocaleString()} gems for ${item.price}.\nThis simulated transaction adds gems only on this device. Continue?`);
    if (!accepted) {
      notify("Simulated purchase cancelled. No gems were added.");
      return;
    }
    // Replace this local demo adapter with a trusted server-verified payment provider.
    const transaction = { success: true, provider: "demo", transactionId: `demo-${Date.now()}` };
    if (!transaction.success) {
      notify("The gem purchase could not be completed. No gems were charged.");
      return;
    }
    grantGems(item.gems, "demo-purchase");
    renderMenu();
  }

  function redeemCode(rawCode) {
    const code = String(rawCode || "").trim().toUpperCase();
    const feedback = $("#redeemFeedback");
    const showError = (message) => { if (feedback) { feedback.textContent = message; feedback.className = "status-warn"; } else notify(message); };
    const showSuccess = (message) => { if (feedback) { feedback.textContent = message; feedback.className = "status-good"; } else notify(message); };
    if (!code) { showError("Enter a code before redeeming it."); return; }
    const definition = codeCatalog[code];
    if (!definition || !definition.enabled) { showError("That code is invalid or has been disabled."); return; }
    if (definition.expires && Date.now() > Date.parse(definition.expires)) { showError("That code has expired."); return; }
    const uses = progress.redeemedCodes.filter((entry) => entry.code === code).length;
    if (uses >= definition.maxRedemptions) { showError("You have already redeemed this one-time code."); return; }
    const reward = definition.reward;
    if (reward.skin && progress.unlockedSkins.includes(reward.skin)) {
      showError("You already own that cosmetic. The code was not consumed.");
      return;
    }
    if (reward.gems) grantGems(reward.gems, "redemption", false);
    if (reward.skin) progress.unlockedSkins.push(reward.skin);
    progress.redeemedCodes.push({ code, redeemedAt: new Date().toISOString() });
    refreshAchievements();
    saveProgress();
    const summary = [
      reward.gems ? `${reward.gems} gems` : "",
      reward.skin ? skins[reward.skin].name : ""
    ].filter(Boolean).join(" and ");
    showSuccess(`Code redeemed! You received ${summary}.`);
    playSound("achievement");
  }

  function setSetting(key, value) {
    const allowed = ["music", "sound", "musicVolume", "soundVolume", "fullscreen", "quality", "speed", "reducedMotion", "highContrast", "colorAssist"];
    if (!allowed.includes(key)) return;
    if (["music", "sound", "fullscreen", "reducedMotion", "highContrast", "colorAssist"].includes(key)) value = Boolean(value);
    else if (key === "musicVolume" || key === "soundVolume") value = Math.max(0, Math.min(100, Number(value)));
    else if (key === "speed") value = [1, 2, 3, 4, 5].includes(Number(value)) ? Number(value) : 1;
    else if (key === "quality" && !["high", "low"].includes(value)) return;
    progress.settings[key] = value;
    if (key === "reducedMotion" || key === "highContrast" || key === "colorAssist") applyAccessibilitySettings();
    saveProgress();
    if (key === "fullscreen") {
      if (value && !document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((error) => {
          progress.settings.fullscreen = false; saveProgress();
          notify(`Fullscreen is unavailable: ${error.message}`);
        });
      } else if (!value && document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch((error) => notify(`Could not exit fullscreen: ${error.message}`));
      }
    }
    if (key === "speed" && run) updateBattleUI();
  }

  function applyAccessibilitySettings() {
    const settings = progress.settings;
    document.documentElement.dataset.reducedMotion = String(Boolean(settings.reducedMotion));
    document.documentElement.dataset.highContrast = String(Boolean(settings.highContrast));
    document.documentElement.dataset.colorAssist = String(Boolean(settings.colorAssist));
  }

  function resetProgress() {
    const accepted = window.confirm("Reset saved progress?\n\nThis deletes gems, completed levels, discovered enemies, castle skins, redemption history and achievement rewards. Your sound/display settings will be kept. This cannot be undone.");
    if (!accepted) return;
    const settings = { ...progress.settings };
    progress = defaultProgress();
    slimebound = normalizeSlimeboundProgress(progress.miniGames.slimebound);
    slimeboundChopped.clear();
    slimeboundDefeated.clear();
    slimeboundEntities = [];
    slimeboundMonsters = [];
    slimeboundGeneratedChunks.clear();
    slimeboundNight = false;
    progress.settings = settings;
    run = null;
    activeLevel = levels[0];
    selectedTower = null;
    pendingTower = null;
    saveProgress();
    notify("Progress reset. Your settings were kept.");
    renderMenu();
  }

  menuContent.addEventListener("click", (event) => {
    const craftButton = event.target.closest("[data-survival-craft]");
    if (craftButton) {
      craftSlimeboundWoodArmor();
      return;
    }
    const skillButton = event.target.closest("[data-survival-skill]");
    if (skillButton) {
      buySlimeboundSkill(skillButton.dataset.survivalSkill);
      return;
    }
    const extraAction = event.target.closest("[data-extra-action]");
    if (extraAction) {
      extraMiniGameAction(extraAction.dataset.extraAction, extraAction.dataset.direction || "");
      return;
    }
    const extraChoice = event.target.closest("[data-extra-choice]");
    if (extraChoice) {
      playExtraChoice(extraChoice.dataset.extraChoice);
      return;
    }
    const matchCard = event.target.closest("[data-match-card]");
    if (matchCard) {
      selectMatchCard(Number(matchCard.dataset.matchCard));
      return;
    }
    const pageButton = event.target.closest("[data-page]");
    if (pageButton) {
      menuPage = pageButton.dataset.page;
      renderMenu();
      return;
    }
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;
    if (action === "home") { menuPage = "main"; renderMenu(); }
    if (action === "click-blob") {
      progress.miniGames.clickerCoins += progress.miniGames.clickPower;
      saveProgress();
      const coins = $("#clickerCoins");
      const upgrade = menuContent.querySelector('[data-action="upgrade-clicker"]');
      const cost = 25 * (progress.miniGames.clickerLevel + 1) ** 2;
      if (coins) coins.textContent = progress.miniGames.clickerCoins.toLocaleString();
      if (upgrade) upgrade.disabled = progress.miniGames.clickerCoins < cost;
      playSound("coin");
    }
    if (action === "upgrade-clicker") {
      const mini = progress.miniGames;
      const cost = 25 * (mini.clickerLevel + 1) ** 2;
      if (mini.clickerCoins < cost) {
        notify("Not enough blob coins to train your clicker.");
        return;
      }
      mini.clickerCoins -= cost;
      mini.clickerLevel += 1;
      mini.clickPower += 1;
      saveProgress();
      renderBlobClicker();
      notify("Blob training upgraded!");
    }
    if (action === "start-sprint") startSprint();
    if (action === "start-pop") startBlobPop();
    if (action === "start-match") {
      resetMatchGame(true);
      renderBlobMatch();
    }
    if (action === "start-catcher") startBlobCatcher();
    if (action === "resume") enterBattle();
    if (action === "start-daily") { createRun(levels[0], "daily"); enterBattle(); }
    if (action === "start-endless") { createRun(levels[0], "endless"); enterBattle(); }
    if (action === "start-challenge") {
      const challengeId = actionButton.dataset.challenge;
      if (!["boss-rush", "iron-keep", "slime-swarm"].includes(challengeId)) {
        notify("That challenge is unavailable.");
        return;
      }
      createRun({ ...levels[0], challengeId }, "challenge");
      enterBattle();
    }
    if (action === "export-save") exportSave();
    if (action === "import-save") $("#saveImportInput").click();
    if (action === "claim-daily") {
      ensureDailyChallenge();
      const challenge = dailyChallengeForToday();
      if (progress.dailyChallenge.claimed || progress.dailyChallenge.stats[challenge.metric] < challenge.goal) {
        notify("Complete today's objective before claiming its reward.");
        return;
      }
      progress.dailyChallenge.claimed = true;
      progress.dailyChallenge.completions += 1;
      progress.achievementProgress.dailyChallenges = progress.dailyChallenge.completions;
      grantGems(10, "daily-challenge", false);
      refreshAchievements();
      saveProgress();
      renderMenu();
      notify("Daily challenge claimed · +10 gems!");
    }
    if (action === "world") { selectedWorld = Number(actionButton.dataset.world); menuPage = "levels"; renderMenu(); }
    if (action === "level") {
      const level = levels.find((item) => item.world === Number(actionButton.dataset.world) && item.level === Number(actionButton.dataset.level));
      if (level) enterBattle(level);
    }
    if (action === "choose-tower") {
      if (!run) createRun(levels[0]);
      enterBattle();
      if (run.coins < towerTypes[actionButton.dataset.type].cost) notify("Not enough battle coins for this tower.");
      else { pendingTower = actionButton.dataset.type; selectedTower = null; updateBattleUI(); }
    }
    if (action === "skin") {
      const id = actionButton.dataset.skin;
      if (progress.unlockedSkins.includes(id)) {
        progress.equippedSkin = id; saveProgress(); renderMenu(); notify(`${skins[id].name} equipped.`);
      } else if (skins[id].gemCost) {
        const price = skins[id].gemCost;
        if (progress.gems < price) { notify(`You need ${price - progress.gems} more gems to unlock this skin.`); return; }
        const accepted = window.confirm(`Unlock ${skins[id].name} for ${price} gems?\n\nYour balance after purchase: ${progress.gems - price} gems.`);
        if (!accepted) { notify("Skin purchase cancelled. No gems were spent."); return; }
        if (progress.unlockedSkins.includes(id)) { notify("You already own this castle skin."); return; }
        if (!spendGems(price)) return;
        unlockSkin(id);
        progress.equippedSkin = id;
        saveProgress(); renderMenu(); notify(`${skins[id].name} unlocked and equipped!`);
      } else {
        notify(skins[id].requirement);
      }
    }
    if (action === "preview-skin") previewSkin(actionButton.dataset.skin);
    if (action === "gem-package") purchaseGemPackage(actionButton.dataset.package);
    if (action === "claim-achievement") {
      const definition = achievementDefs.find((item) => item.id === actionButton.dataset.id);
      const state = definition && progress.achievementProgress[definition.id];
      if (!definition || !state || !state.ready || state.claimed) { notify("That achievement reward is not available."); return; }
      state.claimed = true;
      if (definition.reward.gems) grantGems(definition.reward.gems, "achievement", false);
      refreshAchievements();
      saveProgress();
      renderMenu();
      notify(`${definition.name} reward claimed!`);
    }
    if (action === "reset-progress") resetProgress();
  });

  menuContent.addEventListener("pointerdown", (event) => {
    if (event.target.closest("#sprintCanvas")) jumpSprint();
    if (event.target.closest("#popCanvas")) popTargetAt(event);
    if (event.target.closest("#extraCanvas")) extraMiniGamePointer(event);
  });
  menuContent.addEventListener("pointermove", (event) => {
    if (!catcherGame.active) return;
    const catcherCanvas = event.target.closest("#catcherCanvas");
    if (!catcherCanvas) return;
    const rect = catcherCanvas.getBoundingClientRect();
    catcherGame.playerX = Math.max(26, Math.min(734, (event.clientX - rect.left) * catcherCanvas.width / rect.width));
  });

  menuContent.addEventListener("submit", (event) => {
    if (event.target.id !== "redeemForm") return;
    event.preventDefault();
    redeemCode($("#redeemInput").value);
  });

  menuContent.addEventListener("change", (event) => {
    if (event.target.id === "saveImportInput") {
      importSave(event.target.files && event.target.files[0]);
      event.target.value = "";
      return;
    }
    const input = event.target.closest("[data-setting]");
    if (!input) return;
    const key = input.dataset.setting;
    setSetting(key, input.type === "checkbox" ? input.checked : input.value);
  });
  menuContent.addEventListener("input", (event) => {
    const input = event.target.closest("[data-setting]");
    if (!input || input.type !== "range") return;
    setSetting(input.dataset.setting, input.value);
  });

  shopRoot.addEventListener("click", (event) => {
    const button = event.target.closest("[data-battle-tower]");
    if (!button || !run || run.status === "victory" || run.status === "gameover") return;
    const type = button.dataset.battleTower;
    if (run.coins < towerTypes[type].cost) { notify(`Not enough coins for a ${towerTypes[type].name}.`); return; }
    pendingTower = type;
    selectedTower = null;
    updateBattleUI();
  });

  $("#towerDetails").addEventListener("click", (event) => {
    const specialization = event.target.closest("[data-tower-specialization]");
    if (specialization) {
      specializeTower(specialization.dataset.towerSpecialization);
      return;
    }
    const button = event.target.closest("[data-tower-action]");
    if (!button) return;
    if (button.dataset.towerAction === "upgrade") upgradeTower();
    if (button.dataset.towerAction === "sell") sellTower();
  });

  $("#startWaveBtn").addEventListener("click", startWave);
  $("#autoWaveBtn").addEventListener("click", () => {
    if (!run || run.status === "victory" || run.status === "gameover") return;
    run.autoWave = !run.autoWave;
    run.autoWaveTimer = run.autoWave && run.status === "ready" && run.wave > 0 ? 3 : 0;
    updateBattleUI();
    notify(`Auto wave ${run.autoWave ? "enabled" : "disabled"}.`);
  });
  $("#pauseBtn").addEventListener("click", () => {
    if (!run || run.status === "victory" || run.status === "gameover") return;
    paused = !paused;
    updateBattleUI();
  });
  $("#speedBtn").addEventListener("click", () => {
    const speeds = [1, 2, 3, 4, 5];
    const index = speeds.indexOf(progress.settings.speed);
    setSetting("speed", speeds[(index + 1) % speeds.length]);
    notify(`Battle speed: ${progress.settings.speed}×.`);
  });
  $("#battleMenuBtn").addEventListener("click", () => returnToMenu("main"));
  $("#cancelPlacementBtn").addEventListener("click", () => { pendingTower = null; updateBattleUI(); });
  $("#brandHome").addEventListener("click", (event) => { event.preventDefault(); returnToMenu("main"); });

  function canvasPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return { x: (event.clientX - rect.left) * canvas.width / rect.width, y: (event.clientY - rect.top) * canvas.height / rect.height };
  }
  canvas.addEventListener("pointermove", (event) => { mouse = canvasPoint(event); });
  canvas.addEventListener("pointerdown", (event) => {
    if (!gameVisible || !run) return;
    const point = canvasPoint(event);
    if (pendingTower) {
      if (isValidPlacement(pendingTower, point.x, point.y)) placeTower(pendingTower, point.x, point.y);
      else notify("Invalid placement. Towers need clear grass away from the road, castle and other towers.");
      return;
    }
    const tower = run.towers.find((item) => Math.hypot(item.x - point.x, item.y - point.y) < 23);
    selectedTower = tower || null;
    updateBattleUI();
  });
  function shortcutNumber(event) {
    if (event.key === "1" || event.code === "Digit1" || event.code === "Numpad1") return "1";
    if (event.key === "2" || event.code === "Digit2" || event.code === "Numpad2") return "2";
    if (event.key === "6" || event.code === "Digit6" || event.code === "Numpad6") return "6";
    if (event.key === "7" || event.code === "Digit7" || event.code === "Numpad7") return "7";
    return "";
  }

  document.addEventListener("keydown", (event) => {
    if (slimebound.active) {
      const key = event.key.toLowerCase();
      const movementKey = ["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key);
      if (movementKey) {
        event.preventDefault();
        slimeboundKeys.add(key);
      } else if (!event.repeat && key === "y") {
        event.preventDefault();
        attackSlimeboundTarget();
      } else if (!event.repeat && key === "u") {
        event.preventDefault();
        mineSlimeboundTree();
      } else if (!event.repeat && key === "g") {
        event.preventDefault();
        slimeboundInventoryOpen = !slimeboundInventoryOpen;
        const inventory = $("#survivalInventory");
        if (inventory) inventory.hidden = !slimeboundInventoryOpen;
      }
    }
    if (event.key === "Escape" && pendingTower) { pendingTower = null; updateBattleUI(); }
    if (event.key === " " && gameVisible && document.activeElement === document.body) {
      event.preventDefault(); if (run && run.status === "ready") startWave();
    }
    if (menuPage === "slime-sprint" && [" ", "ArrowUp", "w", "W"].includes(event.key)) {
      if (document.activeElement === document.body || event.target.id === "sprintCanvas") {
        event.preventDefault();
        jumpSprint();
      }
    }
    if (menuPage === "blob-catcher" && ["ArrowLeft", "ArrowRight", "a", "A", "d", "D"].includes(event.key)) {
      if (!catcherGame.active) return;
      event.preventDefault();
      const direction = ["ArrowLeft", "a", "A"].includes(event.key) ? -1 : 1;
      catcherGame.playerX = Math.max(26, Math.min(734, catcherGame.playerX + direction * 38));
      drawBlobCatcher();
    }
    if (extraGame.active && extraMiniGames.some((game) => game.id === menuPage)) {
      const direction = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down" }[event.key];
      const game = extraMiniGames.find((item) => item.id === menuPage);
      if (direction && game && (game.mode === "maze" || game.mode === "dodge" || game.mode === "rhythm")) {
        event.preventDefault();
        if (game.mode === "dodge") extraMiniGameAction("move", direction === "left" ? -1 : direction === "right" ? 1 : 0);
        else if (game.mode === "maze") extraMiniGameAction("maze", direction);
        else playExtraChoice(direction);
      }
    }
    const target = event.target;
    const isEditing = target instanceof HTMLElement &&
      (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));
    const number = shortcutNumber(event);
    if (!number || isEditing) return;
    pressedShortcutKeys.add(number);
    if (slimebound.active && !slimeboundBonusShortcutActive &&
        pressedShortcutKeys.has("1") && pressedShortcutKeys.has("2")) {
      slimeboundBonusShortcutActive = true;
      if (!event.repeat) grantSlimeboundBonusSkillPoints();
    }
    if (!allWorldsShortcutActive && pressedShortcutKeys.has("6") && pressedShortcutKeys.has("7")) {
      allWorldsShortcutActive = true;
      if (!event.repeat) completeAllWorlds();
    }
  });
  document.addEventListener("keyup", (event) => {
    slimeboundKeys.delete(event.key.toLowerCase());
    const number = shortcutNumber(event);
    if (!number) return;
    pressedShortcutKeys.delete(number);
    allWorldsShortcutActive = false;
    if (!pressedShortcutKeys.has("1") || !pressedShortcutKeys.has("2")) slimeboundBonusShortcutActive = false;
  });
  window.addEventListener("blur", () => {
    slimeboundKeys.clear();
    pressedShortcutKeys.clear();
    allWorldsShortcutActive = false;
    slimeboundBonusShortcutActive = false;
  });
  modalRoot.addEventListener("click", (event) => {
    if (event.target.closest("[data-preview-close]")) {
      clearModal();
      return;
    }
    const action = event.target.closest("[data-modal-action]");
    if (action) onModalAction(action.dataset.modalAction);
  });
  document.addEventListener("fullscreenchange", () => {
    if (progress.settings.fullscreen !== Boolean(document.fullscreenElement)) {
      progress.settings.fullscreen = Boolean(document.fullscreenElement);
      saveProgress();
    }
  });

  refreshAchievements();
  buildBattleShop();
  updateWallet();
  renderMenu();
  requestAnimationFrame(frame);
})();
