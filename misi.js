const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const allowedChannelName = 'misi';
const ADMIN_ID = '276047431534379010'; // Zmień na swoje Discord ID

// SHOP ITEMS
const SHOP = {
  'jabłko': { emoji: '🍎', price: 10, type: 'food', hunger: 10, happiness: 0, health: 0, maxUsePerHour: 3, cooldown: 60000 },
  'MisiChrupki': { emoji: '🥨', price: 15, type: 'food', hunger: 20, happiness: 5, health: 0, maxUsePerHour: 2, cooldown: 120000 },
  'miód': { emoji: '🍯', price: 20, type: 'food', hunger: 15, happiness: 10, health: 5, maxUsePerHour: 2, cooldown: 120000 },
  'woda': { emoji: '💧', price: 8, type: 'drink', hunger: 0, happiness: 5, health: 10, maxUsePerHour: 3, cooldown: 60000 },
  'sok': { emoji: '🧃', price: 12, type: 'drink', hunger: 10, happiness: 10, health: 5, maxUsePerHour: 2, cooldown: 120000 },
  'herbata': { emoji: '🍵', price: 15, type: 'drink', hunger: 0, happiness: 10, health: 15, maxUsePerHour: 2, cooldown: 120000 },
  'karma': { emoji: '🐾', price: 50, type: 'food', hunger: 40, happiness: 15, health: 0, maxUsePerHour: 2, cooldown: 120000 },
  'lek': { emoji: '💊', price: 40, type: 'medicine', hunger: 0, happiness: 0, health: 30, maxUsePerHour: 2, cooldown: 180000 },
  'ibuprom': { emoji: '💊', price: 45, type: 'medicine', hunger: 0, happiness: 0, health: 35, maxUsePerHour: 2, cooldown: 180000 },
  'altacet': { emoji: '🩹', price: 35, type: 'medicine', hunger: 0, happiness: 0, health: 25, maxUsePerHour: 2, cooldown: 180000 },
  'witaminaC': { emoji: '🍊', price: 30, type: 'medicine', hunger: 0, happiness: 5, health: 20, maxUsePerHour: 2, cooldown: 180000 },
  'mydło': { emoji: '🧼', price: 25, type: 'hygiene', hunger: 0, happiness: 0, cleanliness: 25, maxUsePerHour: 3, cooldown: 60000 },
  'piłka': { emoji: '🎾', price: 30, type: 'toy', hunger: 0, happiness: 20, health: 0, maxUsePerHour: 1, cooldown: 300000 },
  'klocki': { emoji: '🧱', price: 45, type: 'toy', hunger: 0, happiness: 25, health: 0, maxUsePerHour: 1, cooldown: 300000 },
  'lego': { emoji: '🧱', price: 55, type: 'toy', hunger: 0, happiness: 30, health: 0, maxUsePerHour: 1, cooldown: 300000 },
  'pluszak': { emoji: '🧸', price: 35, type: 'toy', hunger: 0, happiness: 20, health: 0, maxUsePerHour: 1, cooldown: 300000 },
  'samochodzik': { emoji: '🚗', price: 40, type: 'toy', hunger: 0, happiness: 22, health: 0, maxUsePerHour: 1, cooldown: 300000 },
  'snusy': { emoji: '🟫', price: 40, type: 'drug', hunger: 0, happiness: 0, health: 0, angerReduce: 10, maxUsePerHour: 2, cooldown: 60000 },
  'e-fajka': { emoji: '🔋', price: 60, type: 'drug', hunger: 0, happiness: 0, health: 0, angerReduce: 18, maxUsePerHour: 2, cooldown: 60000 },
  'fajki': { emoji: '🚬', price: 20, type: 'drug', hunger: 0, happiness: 0, health: -2, angerReduce: 35, maxUsePerHour: 2, cooldown: 60000 },
  'paczka Papierosów': { emoji: '📦', price: 180, type: 'drug', hunger: 0, happiness: 0, health: 0, packFor: 'fajki', packAmount: 10, maxUsePerHour: 1, cooldown: 60000 },
  'krucyfiks': { emoji: '✝️', price: 500, type: 'religious', possessedRemove: true, maxUsePerHour: 1, cooldown: 60000 },
  'biblia': { emoji: '📖', price: 200, type: 'religious', religion: 15, maxUsePerHour: 2, cooldown: 120000 },
  'box': { emoji: '🎁', price: 100, type: 'mystery', hunger: 30, happiness: 30, health: 20, maxUsePerHour: 1, cooldown: 600000 }
};

// DATA
let data;
try {
  data = JSON.parse(fs.readFileSync('data.json'));
} catch {
  data = {
    pet: {
      hunger: 50,
      happiness: 50,
      health: 100,
      cleanliness: 100,
      anger: 0,
      religion: 100,
      happinessLossSincePlay: 0,
      lastPlayAt: Date.now(),
      possessed: false,
      dead: false,
      deathTime: null,
      zeroStatsTime: null,
      deathDoorTime: null,
      deathDoorReminderSent: false,
      survivalDays: 0,
      deathCount: 0,
      adoptedAt: Date.now()
    },
    alerts: { hunger: false, happiness: false, health: false, cleanliness: false },
    users: {}
  };
}
// Ensure alerts object exists (for existing data.json files)
if (!data.alerts) {
  data.alerts = { hunger: false, happiness: false, health: false, cleanliness: false };
}
if (data.pet.anger === undefined) data.pet.anger = 0;
if (data.pet.religion === undefined) data.pet.religion = 100;
if (data.pet.happinessLossSincePlay === undefined) data.pet.happinessLossSincePlay = 0;
if (data.pet.lastPlayAt === undefined) data.pet.lastPlayAt = Date.now();
if (data.pet.possessed === undefined) data.pet.possessed = false;
if (data.pet.dead === undefined) data.pet.dead = false;
if (data.pet.deathTime === undefined) data.pet.deathTime = null;
if (data.pet.zeroStatsTime === undefined) data.pet.zeroStatsTime = null;
if (data.pet.deathDoorTime === undefined) data.pet.deathDoorTime = null;
if (data.pet.deathDoorReminderSent === undefined) data.pet.deathDoorReminderSent = false;
if (data.pet.survivalDays === undefined) data.pet.survivalDays = 0;
if (data.pet.deathCount === undefined) data.pet.deathCount = 0;
if (data.pet.adoptedAt === undefined) data.pet.adoptedAt = Date.now();
function save() {
  fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
}

function safeSave() {
  clampPet();
  save();
}

// 🧠 USER INIT
function ensureUser(userId) {
  if (!data.users[userId]) {
    data.users[userId] = {
      coins: 0,
      xp: 0,
      level: 1,
      inventory: {},
      cooldowns: {},
      itemCooldowns: {},
      trust: 50,
      mood: "neutral"
    };
  }

  const u = data.users[userId];
  if (!u.inventory) u.inventory = {};
  if (!u.cooldowns) u.cooldowns = {};
  if (!u.itemCooldowns) u.itemCooldowns = {};
}

// 📊 CLAMP
function clampPet() {
  data.pet.hunger = Math.max(0, Math.min(100, data.pet.hunger));
  data.pet.happiness = Math.max(0, Math.min(100, data.pet.happiness));
  data.pet.health = Math.max(0, Math.min(100, data.pet.health));
  data.pet.cleanliness = Math.max(0, Math.min(100, data.pet.cleanliness));
  data.pet.anger = Math.max(0, Math.min(100, data.pet.anger));
  data.pet.religion = Math.max(0, Math.min(100, data.pet.religion));
}

function findShopItem(itemName) {
  const lowerName = itemName.toLowerCase();
  for (const [key, value] of Object.entries(SHOP)) {
    if (key.toLowerCase() === lowerName) {
      return { name: key, item: value };
    }
  }
  return null;
}

function getActionCoins() {
  return getRandomInt(5, 20);
}

function getLuckyBonus() {
  return Math.random() < 0.08 ? getRandomInt(1, 6) : 0;
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 🎨 HUD
function bar(v) {
  const n = Math.round(v / 10);
  return "🟩".repeat(n) + "⬜".repeat(10 - n);
}

function petStatus() {
  const hunger = Math.round(data.pet.hunger);
  const happiness = Math.round(data.pet.happiness);
  const health = Math.round(data.pet.health);
  const cleanliness = Math.round(data.pet.cleanliness);
  const anger = Math.round(data.pet.anger);
  const religion = Math.round(data.pet.religion);

  return `MISI STATUS

Glod: ${bar(hunger)} ${hunger}/100
Szczescie: ${bar(happiness)} ${happiness}/100
Zdrowie: ${bar(health)} ${health}/100
Czystosc: ${bar(cleanliness)} ${cleanliness}/100
Zdenerwowanie: ${bar(anger)} ${anger}/100
Religia: ${bar(religion)} ${religion}/100

💀 Liczba śmierci: ${data.pet.deathCount}`;
}

// STATUS DESCRIPTIONS
function getPetMood() {
  const statuses = [];
  
  if (data.pet.hunger < 40) statuses.push("Misi jest jeszcze glodny...");
  if (data.pet.hunger < 20) statuses.push("MISI UMIERA Z GŁODU!");
  
  if (data.pet.happiness < 40) statuses.push("Misi jest smutny...");
  if (data.pet.happiness < 20) statuses.push("MISI JEST BARDZO SMUTNY!");
  
  if (data.pet.health < 40) statuses.push("Misi źle się czuje...");
  if (data.pet.health < 20) statuses.push("MISI SIĘ ŹLE CZUJE!");
  
  if (data.pet.cleanliness < 40) statuses.push("Misi jest brudny...");
  if (data.pet.cleanliness < 20) statuses.push("MISI JEST BARDZO BRUDNY!");
  
  if (data.pet.anger > 60) statuses.push("Misi jest zdenerwowany...");
  if (data.pet.anger > 85) statuses.push("Misi jest bardzo zdenerwowany!");
  
  if (data.pet.religion < 40) statuses.push("Misi stracił wiarę...");
  if (data.pet.religion < 20) statuses.push("Misi jest zagubiony duchowo!");
  
  if (statuses.length === 0) return "Misi czuje się świetnie!";
  return statuses.join("\n");
}

// 🚨 DEATH DOOR REMINDER
function checkDeathDoorReminder(channel) {
  if (data.pet.dead) return;

  try {
    const anyStatZero = data.pet.hunger <= 0 || data.pet.happiness <= 0 || data.pet.health <= 0 || data.pet.cleanliness <= 0;
    const now = Date.now();

    // Check if at death door (any stat is 0)
    if (anyStatZero && !data.pet.deathDoorReminderSent) {
      data.pet.deathDoorTime = now;
      data.pet.deathDoorReminderSent = true;
      
      const zeroStats = [];
      if (data.pet.hunger <= 0) zeroStats.push("Głód");
      if (data.pet.happiness <= 0) zeroStats.push("Szczęście");
      if (data.pet.health <= 0) zeroStats.push("Zdrowie");
      if (data.pet.cleanliness <= 0) zeroStats.push("Czystość");
      
      // Send initial reminder
      sendDeathDoorReminder(channel, zeroStats);
      
      safeSave();
    } else if (!anyStatZero && data.pet.deathDoorReminderSent) {
      // Reset reminder if stats improved
      data.pet.deathDoorTime = null;
      data.pet.deathDoorReminderSent = false;
      safeSave();
    }
  } catch (error) {
    console.error('ERROR in death door reminder:', error);
  }
}

// 📢 DEATH DOOR REMINDER MESSAGE
function sendDeathDoorReminder(channel, zeroStats) {
  const now = Date.now();
  const elapsed = now - data.pet.deathDoorTime;
  const remaining = Math.max(0, 900000 - elapsed); // 15 minutes = 900000 ms
  const minutes = Math.ceil(remaining / 60000);
  
  channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("⚠️ MISI JEST U BRAM ŚMIERCI!")
        .setDescription(`Misi ma **0** w statystyce: ${zeroStats.join(", ")}!\n\n**MAC ${minutes} MINUT** aby uratować Misia!\nUżyj komend \`!feed\`, \`!play\`, \`!clean\`, \`!heal\` lub przedmiotów z inventory!\n\nJeśli nikt nie zareaguje w ciągu ${minutes} minut, odbędzie się losowanie o życie Misia!`)
        .addFields(
          { name: "🐻 Status Misiego", value: petStatus(), inline: false },
          { name: "⏰ Czas na reakcję", value: `${minutes} minut`, inline: true },
          { name: "🎲 Szansa na przeżycie", value: "25%", inline: true }
        )
        .setColor(0xff0000)
        .setTimestamp()
    ]
  });
}

// 💀 DEATH CHECK
function checkDeath(channel) {
  if (data.pet.dead) return;

  const allZero = data.pet.hunger <= 0 && data.pet.happiness <= 0 && data.pet.health <= 0 && data.pet.cleanliness <= 0;
  const now = Date.now();

  // Check death door lottery (15 minutes after reminder)
  if (data.pet.deathDoorReminderSent && data.pet.deathDoorTime && (now - data.pet.deathDoorTime >= 900000)) { // 15 minutes
    try {
      channel.send("⏰ Czas minął! Losuję czy Misi przeżyje...");
      
      if (Math.random() < 0.25) { // 25% chance to survive
        channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("🎉 MISI PRZEŻYŁ!")
              .setDescription("Misi cudem przeżył dzięki waszej modlitwie! Statystyki zostały zresetowane do minimum.")
              .addFields(
                { name: "🐻 Nowy status", value: "Głód: 1, Szczęście: 1, Zdrowie: 1, Czystość: 1", inline: false }
              )
              .setColor(0x00ff00)
              .setTimestamp()
          ]
        });
        data.pet.hunger = 1;
        data.pet.happiness = 1;
        data.pet.health = 1;
        data.pet.cleanliness = 1;
        data.pet.deathDoorTime = null;
        data.pet.deathDoorReminderSent = false;
      } else {
        // Misi dies
        data.pet.dead = true;
        data.pet.deathTime = now;
        data.pet.deathDoorTime = null;
        data.pet.deathDoorReminderSent = false;
        data.pet.deathCount++;
        
        // Reset all user cooldowns when Misi dies
        for (const userId in data.users) {
          if (data.users[userId].cooldowns) {
            data.users[userId].cooldowns = {};
          }
          if (data.users[userId].itemCooldowns) {
            data.users[userId].itemCooldowns = {};
          }
        }
        
        channel.send({
          embeds: [
            new EmbedBuilder()
              .setTitle("💀 MISI ZMARŁ")
              .setDescription("Nikt nie zareagował na czas i Misi zmarł. Nie umiesz dbać o Misia.\n\nMożesz adoptować nowego Misia za 24 godzin komendą `!adopt`.")
              .setColor(0xff0000)
              .setTimestamp()
          ]
        });
      }
      safeSave();
    } catch (error) {
      console.error('ERROR in death door lottery:', error);
    }
    return;
  }

  // Original death check for all zero stats
  if (allZero) {
    if (!data.pet.zeroStatsTime) {
      data.pet.zeroStatsTime = now;
    } else if (now - data.pet.zeroStatsTime >= 3600000) { // 1 hour
      // Misi at death's door
      try {
        channel.send("Misi jest u bram Smierci! Losuje czy przezyje...");
        
        if (Math.random() < 0.25) { // 25% chance to survive
          channel.send("Misi cudem przezyl! Ale statystyki zostaly zresetowane do minimum.");
          data.pet.hunger = 1;
          data.pet.happiness = 1;
          data.pet.health = 1;
          data.pet.cleanliness = 1;
          data.pet.zeroStatsTime = null;
        } else {
          // Misi dies
          data.pet.dead = true;
          data.pet.deathTime = now;
          data.pet.deathCount++;
          
          // Reset all user cooldowns when Misi dies
          for (const userId in data.users) {
            if (data.users[userId].cooldowns) {
              data.users[userId].cooldowns = {};
            }
            if (data.users[userId].itemCooldowns) {
              data.users[userId].itemCooldowns = {};
            }
          }
          
          channel.send("Twoj Misi zmarl. Nie umiesz dbac o Misi.");
        }
        safeSave();
      } catch (error) {
        console.error('ERROR in death check:', error);
      }
    }
  } else {
    data.pet.zeroStatsTime = null;
  }
}

// ⏳ COOLDOWN
function canUse(userId, action, ms) {
  ensureUser(userId);

  const last = data.users[userId].cooldowns[action] || 0;
  const now = Date.now();

  if (now - last < ms) {
    const remainingMs = ms - (now - last);
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const actionNames = {
      'feed': 'nakarmiłeś',
      'play': 'bawiłeś się z',
      'clean': 'umyłeś',
      'heal': 'uleczyłeś'
    };
    
    const actionName = actionNames[action] || 'użyłeś tej komendy';
    
    return { 
      ok: false, 
      msg: `⏳ Dopiero co ${actionName} Misim! Odczekaj ${minutes}m ${seconds}s` 
    };
  }

  data.users[userId].cooldowns[action] = now;
  return { ok: true };
}

// 💊 ITEM COOLDOWN CHECK
function checkItemCooldown(user, item) {
  const shopItem = SHOP[item];
  if (!shopItem) return { ok: false, msg: '❌ Item not found' };
  
  if (!user.itemCooldowns[item]) user.itemCooldowns[item] = [];
  
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  
  // Clean old cooldowns
  user.itemCooldowns[item] = user.itemCooldowns[item].filter(t => t > oneHourAgo);
  
  if (user.itemCooldowns[item].length >= shopItem.maxUsePerHour) {
    const cooldownMs = shopItem.cooldown - (now - user.itemCooldowns[item][user.itemCooldowns[item].length - 1]);
    const totalSeconds = Math.ceil(cooldownMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return { ok: false, msg: `⏳ Dopiero co użyłeś ${item}! Odczekaj ${minutes}m ${seconds}s` };
  }
  
  return { ok: true };
}

// 🧠 AI
function aiReply(message) {
  const t = message.content.toLowerCase();

  const map = [
    { k: ["hej","siema","cześć"], r: "🐻 Misi się cieszy!" },
    { k: ["kocham"], r: "🐻 Misi też ❤️" },
    { k: ["głodny"], r: "🐻 Misi chce jeść 🍗" },
    { k: ["nuda"], r: "🐻 Pobaw się ze mną 🎾" }
  ];

  for (const m of map) {
    if (m.k.some(x => t.includes(x))) return message.reply(m.r);
  }

  if (Math.random() < 0.05) {
    return message.reply("🐻 Misi patrzy...");
  }
}

// 💰 REWARD
function reward(userId, coins, xp, msg) {
  ensureUser(userId);
  const u = data.users[userId];

  u.coins += coins;
  u.xp += xp;

  while (u.xp >= u.level * 50) {
    u.xp -= u.level * 50;
    u.level++;
    msg.channel.send(`🏆 LEVEL UP → ${u.level}`);
  }

  safeSave();
}

// 💬 BOT
client.on('messageCreate', (message) => {
  if (!message.guild || message.author.bot) return;

  const channel = message.guild.channels.cache.find(
    c => c.name === allowedChannelName && c.isTextBased()
  );

  if (!channel || message.channel.id !== channel.id) return;

  const userId = message.author.id;
  ensureUser(userId);

  // 🚨 EMERGENCY RESTORE (ADMIN ONLY) - PRZED blokadą śmierci!
  if (message.content === '!restore') {
    if (userId !== ADMIN_ID) {
      return message.reply("❌ Nie masz uprawnień do tej komendy!");
    }

    if (!data.pet.dead) {
      return message.reply("❌ Misi żyje! Nie trzeba go przywracać.");
    }

    // Emergency restore - reset to safe values
    data.pet.dead = false;
    data.pet.deathTime = null;
    data.pet.deathDoorTime = null;
    data.pet.deathDoorReminderSent = false;
    data.pet.zeroStatsTime = null;
    data.pet.hunger = 50;
    data.pet.happiness = 50;
    data.pet.health = 75;
    data.pet.cleanliness = 75;
    data.pet.anger = 0;
    data.pet.religion = 50;
    data.pet.possessed = false;
    data.pet.happinessLossSincePlay = 0;
    data.pet.lastPlayAt = Date.now();
    
    // Reset alerts
    data.alerts = { hunger: false, happiness: false, health: false, cleanliness: false };
    
    // Reset all user cooldowns (emergency restore)
    for (const userId in data.users) {
      if (data.users[userId].cooldowns) {
        data.users[userId].cooldowns = {};
      }
      if (data.users[userId].itemCooldowns) {
        data.users[userId].itemCooldowns = {};
      }
    }
    
    safeSave();

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🚨 EMERGENCY RESTORE")
          .setDescription("Misi został przywrócony do życia!\n\nStatystyki zostały zresetowane do bezpiecznych wartości.")
          .addFields(
            { name: "🐻 Nowy status", value: `Głód: 50, Szczęście: 50, Zdrowie: 75, Czystość: 75`, inline: false },
            { name: "⚠️ Uwaga", value: "To jest emergency restore! Dbaj lepiej o Misia!", inline: false }
          )
          .setColor(0xff9900)
          .setTimestamp()
      ]
    });
  }

  // 🔫 ADMIN KILL COMMAND
  if (message.content === '!kill') {
    if (userId !== ADMIN_ID) {
      return message.reply("❌ Nie masz uprawnień do tej komendy!");
    }

    if (data.pet.dead) {
      return message.reply("❌ Misi już jest martwy!");
    }

    // Kill Misi
    data.pet.dead = true;
    data.pet.deathTime = Date.now();
    data.pet.deathCount++;
    safeSave();

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("💀 ADMIN KILL")
          .setDescription("Misi został zabity przez admina!\n\nUżyj `!restore` aby przywrócić go do życia.")
          .addFields(
            { name: "🐻 Status", value: "Martwy", inline: true },
            { name: "💀 Liczba śmierci", value: data.pet.deathCount, inline: true }
          )
          .setColor(0xff0000)
          .setTimestamp()
      ]
    });
  }

  // Check if Misi is dead
  if (data.pet.dead) {
    if (message.content === '!adopt') {
      const now = Date.now();
      if (data.pet.deathTime && now - data.pet.deathTime >= 21600000) { // 6 hours
        // Reset everything
        data.pet = {
          hunger: 50,
          happiness: 50,
          health: 100,
          cleanliness: 100,
          anger: 0,
          religion: 100,
          happinessLossSincePlay: 0,
          lastPlayAt: Date.now(),
          possessed: false,
          dead: false,
          deathTime: null,
          zeroStatsTime: null,
          deathDoorTime: null,
          deathDoorReminderSent: false,
          survivalDays: 0,
          adoptedAt: Date.now()
        };
        data.alerts = { hunger: false, happiness: false, health: false, cleanliness: false };
        safeSave();
        return message.reply("🐻 Adoptowałeś nowego Misia! Opieka zaczyna się od nowa.");
      } else {
        const remainingMs = 21600000 - (now - (data.pet.deathTime || 0));
        const hours = Math.floor(remainingMs / 3600000);
        const minutes = Math.floor((remainingMs % 3600000) / 60000);
        return message.reply(`⏳ Możesz adoptować nowego Misia za ${hours}h ${minutes}m.`);
      }
    }
    return message.reply("Twoj Misi zmarl, nie umiesz dbac o Misi.");
  }

  if (!message.content.startsWith('!')) aiReply(message);

  if (message.content === '!help') {
    return message.reply(`🐻 Misi:

🐻 !status - sprawdź status Misia
💰 !coins - sprawdź swoje monety
🎒 !inv - sprawdź inventory

🛒 !shop - zobacz sklep
🛍 !buy <item> - kup przedmiot

🍗 !feed - nakarm Misia
🎾 !play - baw się z Misiem
🧼 !clean - umyj Misia
❤️ !heal - ulecz Misia
😌 !calm - uspokój Misia (wymaga wysokich statystyk)
🙏 !pray - pomódl się za Misia
🧾 !taca - wyślij z tacą
💰 !top coins - top 10 po monetach
🏆 !top level - top 10 po levelach
📅 !dni - ile dni Misi zyje
💝 !gift @user monety - wyslij monety

🎮 !use <item> - użyj przedmiot z inventory
🐻 !adopt - adoptuj nowego Misia (po śmierci, po 6h)`);
  }

  if (message.content === '!status') {
    const u = data.users[userId];

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🐻 Misi")
          .setDescription(petStatus())
          .addFields(
            { name: "💰 Coins", value: `${u.coins}`, inline: true },
            { name: "🏆 Level", value: `${u.level}`, inline: true }
          )
      ]
    });
  }

  if (message.content === '!coins') {
    return message.reply(`💰 ${data.users[userId].coins}`);
  }

  // 🍗 FEED - NOWA WERSJA Z ANTYSPAMEM
  if (message.content === '!feed') {
    if (data.pet.dead) {
      return message.reply("❌ Misi nie żyje! Użyj `!adopt` lub `!restore`.");
    }

    // Antyspam - sprawdzanie ostatniego użycia
    const now = Date.now();
    const lastFeed = data.users[userId].lastFeed || 0;
    if (now - lastFeed < 600000) { // 10 minut cooldown
      // Dodatkowa ochrona antyspamowa - wiadomość o cooldownzie
      setTimeout(() => {
        message.channel.send(`⏰ ${message.author.username} poczekaj jeszcze 10 minut przed kolejnym karmieniem Misia! 🍗`);
      }, 3000);
      return message.reply("⏳ Poczekaj 10 minut przed kolejnym karmieniem!");
    }

    const feedBefore = data.pet.hunger;
    data.pet.hunger = Math.min(100, data.pet.hunger + 15);
  clampPet();

  // Losowanie monet 5-20 + bonus 12% na 1-6
  const feedCoins = Math.floor(Math.random() * 16) + 5; // 5-20 monet
  let feedBonus = 0;
  if (Math.random() < 0.12) { // 12% szansa
    feedBonus = Math.floor(Math.random() * 6) + 1; // 1-6 dodatkowych monet
  }
  
  data.users[userId].coins += feedCoins + feedBonus;
  data.users[userId].xp += 5;
  data.users[userId].lastFeed = now; // zapisz czas karmienia

  safeSave();

  return message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("🍗 Nakarmiłeś Misia!")
        .setDescription(`**Głód:** ${Math.round(feedBefore)} → ${Math.round(data.pet.hunger)}\n**Otrzymano:** 💰 ${feedCoins} monet${feedBonus > 0 ? ` + bonus ${feedBonus} dodatkowych!` : ''}\n\n${getPetMood()}`)
        .addFields(
          { name: "Głód", value: bar(data.pet.hunger), inline: false },
          { name: "💰 Szansa bonusu", value: "12%", inline: true },
          { name: "🎲 Zakres monet", value: "5-20", inline: true }
        )
        .setColor(data.pet.hunger > 70 ? 0x00ff00 : data.pet.hunger > 40 ? 0xffff00 : 0xff0000)
    ]
  });

  // Powiadomienie o wykonaniu akcji
  setTimeout(() => {
    message.channel.send(`📝 ${message.author.username} nakarmił Misia! 🍗`);
  }, 2000);
  }

  // 🎾 PLAY - NOWA WERSJA Z ANTYSPAMEM
  if (message.content === '!play') {
    if (data.pet.dead) {
      return message.reply("❌ Misi nie żyje! Użyj `!adopt` lub `!restore`.");
    }

    // Antyspam - sprawdzanie ostatniego użycia
    const now = Date.now();
    const lastPlay = data.users[userId].lastPlay || 0;
    if (now - lastPlay < 600000) { // 10 minut cooldown
      // Dodatkowa ochrona antyspamowa - wiadomość o cooldownzie
      setTimeout(() => {
        message.channel.send(`⏰ ${message.author.username} poczekaj jeszcze 10 minut przed kolejną zabawą z Misiem! 🎾`);
      }, 3000);
      return message.reply("⏳ Poczekaj 10 minut przed kolejną zabawą!");
    }

    const playBefore = data.pet.happiness;
    data.pet.happiness = Math.min(100, data.pet.happiness + 10);
  data.pet.happinessLossSincePlay = 0;
  data.pet.lastPlayAt = Date.now();
  clampPet();

  // Losowanie monet 5-20 + bonus 12% na 1-6
  const playCoins = Math.floor(Math.random() * 16) + 5; // 5-20 monet
  let playBonus = 0;
  if (Math.random() < 0.12) { // 12% szansa
    playBonus = Math.floor(Math.random() * 6) + 1; // 1-6 dodatkowych monet
  }
  
  data.users[userId].coins += playCoins + playBonus;
  data.users[userId].xp += 5;

  safeSave();

  return message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("🎾 Bawiłeś się z Misiem!")
        .setDescription(`**Szczęście:** ${Math.round(playBefore)} → ${Math.round(data.pet.happiness)}\n**Otrzymano:** 💰 ${playCoins} monet${playBonus > 0 ? ` + bonus ${playBonus} dodatkowych!` : ''}\n\n${getPetMood()}`)
        .addFields(
          { name: "Szczęście", value: bar(data.pet.happiness), inline: false },
          { name: "💰 Szansa bonusu", value: "12%", inline: true },
          { name: "🎲 Zakres monet", value: "5-20", inline: true }
        )
        .setColor(data.pet.happiness > 70 ? 0x00ff00 : data.pet.happiness > 40 ? 0xffff00 : 0xff0000)
    ]
  });

  // Powiadomienie o wykonaniu akcji
  setTimeout(() => {
    message.channel.send(`📝 ${message.author.username} bawił się z Misiem! 🎾`);
  }, 2000);
  }

  // 🧼 CLEAN - NOWA WERSJA Z ANTYSPAMEM
  if (message.content === '!clean') {
    if (data.pet.dead) {
      return message.reply("❌ Misi nie żyje! Użyj `!adopt` lub `!restore`.");
    }

    // Antyspam - sprawdzanie ostatniego użycia
    const now = Date.now();
    const lastClean = data.users[userId].lastClean || 0;
    if (now - lastClean < 600000) { // 10 minut cooldown
      // Dodatkowa ochrona antyspamowa - wiadomość o cooldownzie
      setTimeout(() => {
        message.channel.send(`⏰ ${message.author.username} poczekaj jeszcze 10 minut przed kolejnym czyszczeniem Misia! 🧼`);
      }, 3000);
      return message.reply("⏳ Poczekaj 10 minut przed kolejnym czyszczeniem!");
    }

    const cleanBefore = data.pet.cleanliness;
    data.pet.cleanliness = Math.min(100, data.pet.cleanliness + 10);
  clampPet();

  // Losowanie monet 5-20
  const cleanCoins = Math.floor(Math.random() * 16) + 5; // 5-20 monet
  
  // Szansa 12% na dodatkowe monety 1-6
  let cleanBonus = 0;
  if (Math.random() < 0.12) { // 12% szansa
    cleanBonus = Math.floor(Math.random() * 6) + 1; // 1-6 dodatkowych monet
  }

  data.users[userId].coins += cleanCoins + cleanBonus;
  data.users[userId].xp += 5;
  data.users[userId].lastClean = now; // zapisz czas czyszczenia

  safeSave();

  return message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("🧼 Umył(a)ś Misiego!")
        .setDescription(`**Czystość:** ${Math.round(cleanBefore)} → ${Math.round(data.pet.cleanliness)}\n**Otrzymano:** 💰 ${cleanCoins} monet${cleanBonus > 0 ? ` + bonus ${cleanBonus} dodatkowych!` : ''}\n\n${getPetMood()}`)
        .addFields(
          { name: "Czystość", value: bar(data.pet.cleanliness), inline: false },
          { name: "💰 Szansa bonusu", value: "12%", inline: true },
          { name: "🎲 Zakres monet", value: "5-20", inline: true }
        )
        .setColor(data.pet.cleanliness > 70 ? 0x00ff00 : data.pet.cleanliness > 40 ? 0xffff00 : 0xff0000)
    ]
  });

  // Powiadomienie o wykonaniu akcji
  setTimeout(() => {
    message.channel.send(`📝 ${message.author.username} umył Misiego! 🧼`);
  }, 2000);
  }

  // ❤️ HEAL - NOWA WERSJA Z ANTYSPAMEM
  if (message.content === '!heal') {
    if (data.pet.dead) {
      return message.reply("❌ Misi nie żyje! Użyj `!adopt` lub `!restore`.");
    }

    // Antyspam - sprawdzanie ostatniego użycia
    const now = Date.now();
    const lastHeal = data.users[userId].lastHeal || 0;
    if (now - lastHeal < 600000) { // 10 minut cooldown
      // Dodatkowa ochrona antyspamowa - wiadomość o cooldownzie
      setTimeout(() => {
        message.channel.send(`⏰ ${message.author.username} poczekaj jeszcze 10 minut przed kolejnym leczeniem Misia! ❤️`);
      }, 3000);
      return message.reply("⏳ Poczekaj 10 minut przed kolejnym leczeniem!");
    }

    const healBefore = data.pet.health;
    data.pet.health = Math.min(100, data.pet.health + 15);
  clampPet();

  // Losowanie monet 5-20 + bonus 12% na 1-6
  const healCoins = Math.floor(Math.random() * 16) + 5; // 5-20 monet
  let healBonus = 0;
  if (Math.random() < 0.12) { // 12% szansa
    healBonus = Math.floor(Math.random() * 6) + 1; // 1-6 dodatkowych monet
  }
  
  data.users[userId].coins += healCoins + healBonus;
  data.users[userId].xp += 5;
  data.users[userId].lastHeal = now; // zapisz czas leczenia

  safeSave();

  return message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("❤️ Uleczyłeś Misia!")
        .setDescription(`**Zdrowie:** ${Math.round(healBefore)} → ${Math.round(data.pet.health)}\n**Otrzymano:** 💰 ${healCoins} monet${healBonus > 0 ? ` + bonus ${healBonus} dodatkowych!` : ''}\n\n${getPetMood()}`)
        .addFields(
          { name: "Zdrowie", value: bar(data.pet.health), inline: false },
          { name: "💰 Szansa bonusu", value: "12%", inline: true },
          { name: "🎲 Zakres monet", value: "5-20", inline: true }
        )
        .setColor(data.pet.health > 70 ? 0x00ff00 : data.pet.health > 40 ? 0xffff00 : 0xff0000)
    ]
  });

  // Powiadomienie o wykonaniu akcji
  setTimeout(() => {
    message.channel.send(`📝 ${message.author.username} uleczył Misia! ❤️`);
  }, 2000);
  }

  if (message.content === '!calm') {
    if (data.pet.dead) {
      return message.reply("❌ Misi nie żyje! Użyj `!adopt` lub `!restore`.");
    }
    
    const cd = canUse(userId,'calm',600000);
    if (!cd.ok) return message.reply(cd.msg);

    if (data.pet.hunger > 85 && data.pet.happiness > 85 && data.pet.cleanliness > 85) {
      const before = data.pet.anger;
      data.pet.anger = Math.max(0, data.pet.anger - 10);
      safeSave();
      return message.reply(`😌 Uspokoiłeś Misia! Zdenerwowanie: ${Math.round(before)} → ${Math.round(data.pet.anger)}`);
    }

    return message.reply('🛑 Aby uspokoić Misia, najpierw zadbaj o Głód, Szczęście i Czystość na poziomie powyżej 85.');
  }
  // 🙏 PRAY - Z COOLDOWNEM 5 GODZIN
  if (message.content === '!pray') {
    if (data.pet.dead) {
      return message.reply("❌ Misi nie żyje! Użyj `!adopt` lub `!restore`.");
    }
    
    const now = Date.now();
    const lastPray = data.users[userId].lastPray || 0;
    if (data.pet.dead && now - data.pet.deathTime < 21600000) { // 6h cooldown po śmierci
      return message.reply(`⏳ Musisz poczekać 6 godzin przed adopcją nowego Misia!`);
    }

    data.users[userId].lastPray = now; // zapisz czas modlitwy

    data.pet.religion += 5;
    clampPet();
    safeSave();

    return message.reply('🙏 Pomodliłeś się za Misia! Religia +5');
  }
  // 🧾 TACA
  if (message.content === '!taca') {
    const cd = canUse(userId, 'taca', 43200000);
    if (!cd.ok) return message.reply(cd.msg);

    if (data.pet.religion <= 99) {
      return message.reply('🛑 Religia musi być powyżej 99, żeby dać tacę.');
    }

    const coins = Math.floor(Math.random() * 51);
    if (coins > 0) {
      reward(userId, coins, 5, message);
      return message.reply(`🧾 Wysłałeś Misia z tacą i przyniósł Ci ${coins} monet.`);
    }

    return message.reply('🧾 Wysłałeś Misia z tacą, ale tym razem przyniósł 0 monet. Spróbuj ponownie za 12 godzin.');
  }

  // TOP LEADERBOARD
  if (message.content === '!top coins') {
    const sorted = Object.entries(data.users).sort((a, b) => b[1].coins - a[1].coins).slice(0, 10);
    const list = sorted.map((entry, i) => `${i + 1}. <@${entry[0]}> - ${entry[1].coins} monet`).join('\n');
    
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('💰 TOP 10 - MONETY')
          .setDescription(list || 'Brak danych')
          .setColor(0xffd700)
      ]
    });
  }

  if (message.content === '!top level') {
    const sorted = Object.entries(data.users).sort((a, b) => b[1].level - a[1].level).slice(0, 10);
    const list = sorted.map((entry, i) => `${i + 1}. <@${entry[0]}> - Level ${entry[1].level}`).join('\n');
    
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🏆 TOP 10 - LEVEL')
          .setDescription(list || 'Brak danych')
          .setColor(0xffd700)
      ]
    });
  }

  // SURVIVAL DAYS
  if (message.content === '!dni') {
    const adoptedAt = data.pet.adoptedAt || Date.now();
    const daysSince = Math.floor((Date.now() - adoptedAt) / 86400000);
    
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('📅 Dni przetrwania Misia')
          .setDescription(`Misi żyje od **${daysSince}** dni`)
          .setColor(0x00ff00)
      ]
    });
  }

  // GIFT
  if (message.content.startsWith('!gift')) {
    const args = message.content.split(' ');
    const targetId = args[1]?.replace(/[<@!>]/g, '');
    const amount = parseInt(args[2]);

    if (!targetId || !amount || amount <= 0) {
      return message.reply('❌ Użycie: `!gift @user kwota`');
    }

    if (data.users[userId].coins < amount) {
      return message.reply(`❌ Nie masz tyle monet! Masz: ${data.users[userId].coins}`);
    }

    ensureUser(targetId);
    data.users[userId].coins -= amount;
    data.users[targetId].coins += amount;
    safeSave();

    return message.reply(`💝 Wysłałeś **${amount}** monet użytkownikowi <@${targetId}>`);
  }

  // 🛒 SHOP
  if (message.content === '!shop') {
    const shopEmbed = new EmbedBuilder()
      .setTitle('🛒 SKLEP MISIA')
      .setColor(0xffd700)
      .setDescription('Kup przedmioty dla Misiego komendą: `!buy <nazwa>`');
    
    const foodItems = Object.entries(SHOP).filter(([,v]) => v.type.includes('food')).map(([name, item]) => 
      `${item.emoji} **${name}** - ${item.price} monet | 🍗${item.hunger} 😄${item.happiness}`
    ).join('\n');
    
    const toyItems = Object.entries(SHOP).filter(([,v]) => v.type === 'toy').map(([name, item]) => 
      `${item.emoji} **${name}** - ${item.price} monet | 😄${item.happiness}`
    ).join('\n');
    
    const medicineItems = Object.entries(SHOP).filter(([,v]) => v.type.includes('medicine')).map(([name, item]) => 
      `${item.emoji} **${name}** - ${item.price} monet | ❤️${item.health}`
    ).join('\n');
    
    const hygieneItems = Object.entries(SHOP).filter(([,v]) => v.type.includes('hygiene')).map(([name, item]) => 
      `${item.emoji} **${name}** - ${item.price} monet | 🧼${item.cleanliness}`
    ).join('\n');
    
    const drugItems = Object.entries(SHOP).filter(([,v]) => v.type === 'drug').map(([name, item]) => {
      if (item.packFor) {
        return `${item.emoji} **${name}** - ${item.price} monet | ${item.packAmount}x ${item.packFor} (pakiet)`;
      }
      const effects = [];
      if (item.angerReduce) effects.push(`😡-${item.angerReduce}`);
      if (item.religion) effects.push(`🙏${item.religion}`);
      return `${item.emoji} **${name}** - ${item.price} monet | ${effects.join(' ')}`;
    }).join('\n');
    
    const religiousItems = Object.entries(SHOP).filter(([,v]) => v.type === 'religious').map(([name, item]) => {
      const effects = [];
      if (item.religion) effects.push(`🙏+${item.religion}`);
      if (item.possessedRemove) effects.push('Usuwa opętanie');
      return `${item.emoji} **${name}** - ${item.price} monet | ${effects.join(' ')}`;
    }).join('\n');
    
    const mysteryItems = Object.entries(SHOP).filter(([,v]) => v.type === 'mystery').map(([name, item]) => 
      `${item.emoji} **${name}** - ${item.price} monet | Bonus Box!`
    ).join('\n');
    
    const userCoins = data.users[userId].coins;
    shopEmbed.addFields(
      { name: '🍗 JEDZENIE', value: foodItems, inline: false },
      { name: '🎾 ZABAWKI', value: toyItems, inline: false },
      { name: '💊 MEDYCYNA', value: medicineItems, inline: false },
      { name: '🧼 HIGIENA', value: hygieneItems, inline: false },
      { name: '🔥 UŻYWKI', value: drugItems, inline: false },
      { name: '🙏 RELIGIA', value: religiousItems, inline: false },
      { name: '🎁 SPECJALNE', value: mysteryItems, inline: false },
      { name: '💰 TWOJE MONETY', value: `${userCoins}`, inline: false }
    );
    
    return message.reply({ embeds: [shopEmbed] });
  }

  // 🛍 BUY
  if (message.content.startsWith('!buy')) {
    const item = message.content.split(' ')[1];
    const u = data.users[userId];

    const foundItem = findShopItem(item);
    if (!foundItem) return message.reply("❌ Nie ma takiego przedmiotu!");
    const shopItem = foundItem.item;
    const actualName = foundItem.name;
    
    if (u.coins < shopItem.price) return message.reply(`❌ Brak monet! Potrzebujesz ${shopItem.price - u.coins} więcej.`);

    u.coins -= shopItem.price;
    if (shopItem.packFor) {
      u.inventory[shopItem.packFor] = (u.inventory[shopItem.packFor] || 0) + shopItem.packAmount;
    } else {
      u.inventory[actualName] = (u.inventory[actualName]||0)+1;
    }

    safeSave();
    const inventoryName = shopItem.packFor || actualName;
    const inventoryCount = u.inventory[inventoryName] || 0;
    
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🛍 ${shopItem.emoji} Kupiłeś ${actualName}!`)
          .setDescription(`**Cena:** ${shopItem.price} monet\n**W inventory:** ${inventoryCount} sztuka(i) ${shopItem.packFor ? `(${inventoryName})` : ''}\n**Pozostało monet:** ${u.coins}`)
          .setColor(0x00ff00)
      ]
    });
  }

  // 🎒 INV
  if (message.content === '!inv') {
    const inv = data.users[userId].inventory;
    const items = Object.entries(inv)
      .filter(([,v]) => v > 0)
      .map(([k,v]) => `${SHOP[k]?.emoji || '📦'} **${k}** x${v}`)
      .join('\n');
    
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🎒 TWOJE PRZEDMIOTY')
          .setDescription(items || '🎒 Puste')
          .setColor(0x8b4513)
      ]
    });
  }

  // 🎮 USE
  if (message.content.startsWith('!use')) {
    const item = message.content.split(' ')[1];
    const u = data.users[userId];

    const foundItem = findShopItem(item);
    if (!foundItem) return message.reply("❌ Nie ma takiego przedmiotu!");
    const actualName = foundItem.name;
    const shopItem = foundItem.item;

    if (!u.inventory[actualName]) return message.reply("❌ Nie posiadasz tego przedmiotu!");
    
    const cooldownCheck = checkItemCooldown(u, actualName);
    if (!cooldownCheck.ok) return message.reply(cooldownCheck.msg);

    u.inventory[actualName]--;
    // Apply effects
    if (shopItem.hunger > 0) data.pet.hunger += shopItem.hunger;
    if (shopItem.happiness > 0) data.pet.happiness += shopItem.happiness;
    if (shopItem.health > 0) data.pet.health += shopItem.health;
    if (shopItem.cleanliness > 0) data.pet.cleanliness += shopItem.cleanliness;
    if (shopItem.angerReduce) data.pet.anger = Math.max(0, data.pet.anger - shopItem.angerReduce);
    if (shopItem.religion) data.pet.religion += shopItem.religion;
    if (shopItem.possessedRemove) data.pet.possessed = false;

    clampPet();
    u.itemCooldowns[actualName].push(Date.now());
    safeSave();

    const effects = [];
    if (shopItem.hunger > 0) effects.push(`🍗 Głód +${shopItem.hunger}`);
    if (shopItem.happiness > 0) effects.push(`😄 Szczęście +${shopItem.happiness}`);
    if (shopItem.health > 0) effects.push(`❤️ Zdrowie +${shopItem.health}`);
    if (shopItem.cleanliness > 0) effects.push(`🧼 Czystość +${shopItem.cleanliness}`);
    if (shopItem.angerReduce) effects.push(`😡 Zdenerwowanie -${shopItem.angerReduce}`);
    if (shopItem.religion) effects.push(`🙏 Religia ${shopItem.religion > 0 ? '+' : ''}${shopItem.religion}`);
    if (shopItem.possessedRemove) effects.push('Opętanie usunięte');

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(`🎮 ${shopItem.emoji} Użyłeś ${actualName}!`)
          .setDescription(effects.join('\n') + `\n\n${getPetMood()}`)
          .addFields({ name: 'W inventory:', value: `${u.inventory[actualName]} sztuka(i)`, inline: false })
          .setColor(0x9966ff)
      ]
    });
  }
});

// ← FIX NA BŁĄD

// POSSESSED MESSAGES
function sendPossessedMessage(channel) {
  const users = Object.keys(data.users);
  if (users.length === 0) return;

  const randomUser = users[Math.floor(Math.random() * users.length)];
  const messages = [
    `Opetany <@${randomUser}> dlaczego sie ze mna nie bawisz? Czuje sie samotny...`,
    `Opetany Odwracam sie od ciebie <@${randomUser}>, bo mnie ignorujesz!`,
    `Opetany <@${randomUser}> pamietaj, ze jestem tu dla ciebie, ale ty mnie zostawiasz samego!`,
    `Opetany Czuje zlość <@${randomUser}>, dlaczego mnie zaniedbujesz?`,
    `Opetany <@${randomUser}> wroc do mnie, inaczej bede jeszcze bardziej zly!`
  ];

  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  channel.send(randomMessage);
}

// �🚨 CRITICAL ALERTS
function checkCriticalStates(channel) {
  const alerts = [];
  
  if (data.pet.hunger <= 10 && !data.alerts.hunger) {
    alerts.push({
      title: "🚨 Misi umiera z głodu!",
      description: "Statystyki spadły do krytycznego poziomu!\nUżyj `!feed` w ciągu 5 minut!",
      color: 0xff0000,
      stat: "hunger"
    });
    data.alerts.hunger = true;
  } else if (data.pet.hunger > 15) {
    data.alerts.hunger = false; // Reset alert when improved
  }
  
  if (data.pet.happiness <= 10 && !data.alerts.happiness) {
    alerts.push({
      title: "😭 Misi jest bardzo smutny!",
      description: "Misi potrzebuje zabawy!\nUżyj `!play` w ciągu 5 minut!",
      color: 0xff6b6b,
      stat: "happiness"
    });
    data.alerts.happiness = true;
  } else if (data.pet.happiness > 15) {
    data.alerts.happiness = false;
  }
  
  if (data.pet.health <= 10 && !data.alerts.health) {
    alerts.push({
      title: "🤒 Misi jest bardzo chory!",
      description: "Misi potrzebuje leczenia!\nUżyj `!heal` w ciągu 5 minut!",
      color: 0xdc143c,
      stat: "health"
    });
    data.alerts.health = true;
  } else if (data.pet.health > 15) {
    data.alerts.health = false;
  }
  
  if (data.pet.cleanliness <= 10 && !data.alerts.cleanliness) {
    alerts.push({
      title: "🧼 Misi jest bardzo brudny!",
      description: "Misi potrzebuje kąpieli!\nUżyj `!clean` w ciągu 5 minut!",
      color: 0x8b4513,
      stat: "cleanliness"
    });
    data.alerts.cleanliness = true;
  } else if (data.pet.cleanliness > 15) {
    data.alerts.cleanliness = false;
  }
  
  // Send alerts
  alerts.forEach(async (alert) => {
    try {
      await channel.send({
        embeds: [
          new EmbedBuilder()
            .setTitle(alert.title)
            .setDescription(alert.description)
            .addFields(
              { name: "🐻 Status Misiego", value: petStatus(), inline: false },
              { name: "⏰ Czas na reakcję", value: "5 minut", inline: true }
            )
            .setColor(alert.color)
            .setTimestamp()
        ]
      });
    } catch (error) {
      console.error('Failed to send critical alert:', error);
    }
  });
}

const STAT_DECAY_PER_MINUTE = {
  hunger: 100 / 3600,
  happiness: 100 / 1800,
  cleanliness: 100 / 3600,
  health: 100 / 3600
};
const RELIGION_DECAY_PER_MINUTE = 100 / (72 * 60); // 72 hours
const ANGER_THRESHOLD = 40;
const ANGER_RISE_PER_MINUTE = 0.5;
const ANGER_AUTO_REDUCE = 1;
const RELIGION_RESTORE_PER_MINUTE = 0.05;

const EVENT_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4h
const RANDOM_EVENTS = [
  { title: 'Misi znalazł ukryty smakołyk i zyskał energię!', positive: true, effects: { hunger: 10, happiness: 20 } },
  { title: 'Misi dostał pieszczoty i poczuł się pewniej.', positive: true, effects: { happiness: 15, anger: -10 } },
  { title: 'Misi sam posprzątał zabawki i jest czyściej.', positive: true, effects: { cleanliness: 15 } },
  { title: 'Misi wyspał się i odnowił swoje zdrowie.', positive: true, effects: { health: 15 } },
  { title: 'Misi pobiegł po świeżym powietrzu i poczuł się lepiej.', positive: true, effects: { health: 10, happiness: 10 } },
  { title: 'Misi pomógł przy sprzątaniu i stał się spokojniejszy.', positive: true, effects: { cleanliness: 10, happiness: 10, anger: -10 } },
  { title: 'Misi przestraszył się w nocy i stracił pewność siebie.', positive: false, effects: { happiness: -15, anger: 10 } },
  { title: 'Misi przewrócił się i trochę się potłukł.', positive: false, effects: { health: -15, anger: 5 } },
  { title: 'Misi nie zdążył z jedzeniem i poczuł głód.', positive: false, effects: { hunger: -15 } },
  { title: 'Misi pobrudził się podczas zabawy.', positive: false, effects: { cleanliness: -15, anger: 5 } },
  { title: 'Misi usłyszał dziwne szepty i poczuł lęk.', positive: false, effects: { happiness: -10, anger: 10 } },
  { title: 'Misi nawiedziły duchy.', positive: false, effects: { religion: -20, happiness: -5 } },
  { title: 'Szatan zakręcił się obok Misia.', positive: false, effects: { religion: -45, anger: 15 } },
  { title: 'Misi poczuł zły wpływ i stracił wiarę.', positive: false, effects: { religion: -25, anger: 10 } },
  { title: 'Misi miał zły sen, poczuł silne zdenerwowanie i stracił apetyt.', positive: false, effects: { anger: 15, hunger: -15 } }
];

function triggerRandomEvent(channel) {
  if (data.pet.dead) return;

  const event = RANDOM_EVENTS[Math.floor(Math.random() * RANDOM_EVENTS.length)];
  const statLabels = {
    hunger: 'Głód',
    happiness: 'Szczęście',
    health: 'Zdrowie',
    cleanliness: 'Czystość',
    anger: 'Zdenerwowanie',
    religion: 'Religia'
  };

  for (const [stat, value] of Object.entries(event.effects)) {
    data.pet[stat] += value;
  }

  clampPet();
  save();

  const effectLines = Object.entries(event.effects)
    .map(([stat, value]) => `${statLabels[stat] || stat}: ${value > 0 ? '+' : ''}${value}`)
    .join('\n');

  channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle('🎲 Wydarzenie dla Misia')
        .setDescription(`${event.title}\n\n${effectLines}`)
        .setColor(event.positive ? 0x00ff00 : 0xff6347)
        .setTimestamp()
    ]
  });
}

// ⏱️ TICK
setInterval(() => {
  const happinessBefore = data.pet.happiness;

  data.pet.hunger -= STAT_DECAY_PER_MINUTE.hunger;
  data.pet.happiness -= STAT_DECAY_PER_MINUTE.happiness;
  data.pet.cleanliness -= STAT_DECAY_PER_MINUTE.cleanliness;
  data.pet.health -= STAT_DECAY_PER_MINUTE.health;
  data.pet.religion -= RELIGION_DECAY_PER_MINUTE;

  const happinessLost = Math.max(0, happinessBefore - data.pet.happiness);
  if (happinessLost > 0) {
    data.pet.happinessLossSincePlay += happinessLost;
  }

  if (data.pet.happinessLossSincePlay >= ANGER_THRESHOLD) {
    data.pet.anger += ANGER_RISE_PER_MINUTE;
  }

  if (data.pet.hunger > 85 && data.pet.happiness > 85 && data.pet.cleanliness > 85) {
    data.pet.anger = Math.max(0, data.pet.anger - ANGER_AUTO_REDUCE);
    data.pet.religion = Math.min(100, data.pet.religion + RELIGION_RESTORE_PER_MINUTE);
  }

  // Possession logic
  if (data.pet.religion < 30 && !data.pet.possessed) {
    data.pet.possessed = true;
  } else if (data.pet.religion >= 30 && data.pet.possessed) {
    data.pet.possessed = false;
  }

  clampPet();
  save();
  
  // Check for critical states every minute
  if (client.readyAt) {
    const channel = client.channels.cache.find(c => c.name === allowedChannelName && c.isTextBased());
    if (channel) {
      checkCriticalStates(channel);
      checkDeathDoorReminder(channel);
      checkDeath(channel);
      // Possessed messages
      // if (data.pet.possessed && Math.random() < 0.1) { // ~10% chance per minute
      //   sendPossessedMessage(channel);
      // }
    }
  }
}, 60000);

// Daily survival counter
setInterval(() => {
  if (!data.pet.dead) {
    data.pet.survivalDays = (data.pet.survivalDays || 0) + 1;
    safeSave();
  }
}, 24 * 60 * 60 * 1000); // 24 hours

setInterval(() => {
  if (!client.readyAt) return;
  const channel = client.channels.cache.find(c => c.name === allowedChannelName && c.isTextBased());
  if (!channel) return;

  triggerRandomEvent(channel);
}, EVENT_INTERVAL_MS);

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
if (!DISCORD_TOKEN) {
  console.error('ERROR: Missing DISCORD_TOKEN environment variable. Set it in Railway variables.');
  process.exit(1);
}

client.login(DISCORD_TOKEN);
