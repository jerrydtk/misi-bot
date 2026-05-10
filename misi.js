const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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
  'MisiChrupki': { emoji: '🥨', price: 25, type: 'food', hunger: 20, happiness: 5, health: 0, maxUsePerHour: 2, cooldown: 120000 },
  'miód': { emoji: '🍯', price: 40, type: 'food', hunger: 15, happiness: 10, health: 5, maxUsePerHour: 2, cooldown: 120000 },
  'woda': { emoji: '💧', price: 8, type: 'drink', hunger: 0, happiness: 5, health: 10, maxUsePerHour: 3, cooldown: 60000 },
  'sok': { emoji: '🧃', price: 15, type: 'drink', hunger: 10, happiness: 10, health: 5, maxUsePerHour: 2, cooldown: 120000 },
  'herbata': { emoji: '🍵', price: 20, type: 'drink', hunger: 0, happiness: 10, health: 15, maxUsePerHour: 2, cooldown: 120000 },
  'karma': { emoji: '🐾', price: 90, type: 'food', hunger: 40, happiness: 15, health: 0, maxUsePerHour: 2, cooldown: 120000 },
  'lek': { emoji: '💊', price: 60, type: 'medicine', hunger: 0, happiness: 0, health: 30, maxUsePerHour: 2, cooldown: 180000 },
  'ibuprom': { emoji: '💊', price: 70, type: 'medicine', hunger: 0, happiness: 0, health: 35, maxUsePerHour: 2, cooldown: 180000 },
  'altacet': { emoji: '🩹', price: 50, type: 'medicine', hunger: 0, happiness: 0, health: 25, maxUsePerHour: 2, cooldown: 180000 },
  'witaminaC': { emoji: '🍊', price: 35, type: 'medicine', hunger: 0, happiness: 5, health: 20, maxUsePerHour: 2, cooldown: 180000 },
  'mydło': { emoji: '🧼', price: 25, type: 'hygiene', hunger: 0, happiness: 0, cleanliness: 25, maxUsePerHour: 3, cooldown: 60000 },
  'szampon': { emoji: '🧴', price: 30, type: 'hygiene', hunger: 0, happiness: 5, cleanliness: 35, maxUsePerHour: 2, cooldown: 120000 },
  'ręcznik': { emoji: '🧽', price: 15, type: 'hygiene', hunger: 0, happiness: 3, cleanliness: 20, maxUsePerHour: 3, cooldown: 60000 },
  'papier toaletowy': { emoji: '🧻', price: 12, type: 'hygiene', hunger: 0, happiness: 2, cleanliness: 15, maxUsePerHour: 4, cooldown: 45000 },
  'piłka': { emoji: '🎾', price: 30, type: 'toy', hunger: 0, happiness: 20, health: 0, maxUsePerHour: 1, cooldown: 300000 },
  'klocki': { emoji: '🧱', price: 45, type: 'toy', hunger: 0, happiness: 25, health: 0, maxUsePerHour: 1, cooldown: 300000 },
  'lego': { emoji: '🧱', price: 65, type: 'toy', hunger: 0, happiness: 30, health: 0, maxUsePerHour: 1, cooldown: 300000 },
  'pluszak': { emoji: '🧸', price: 35, type: 'toy', hunger: 0, happiness: 20, health: 0, maxUsePerHour: 1, cooldown: 300000 },
  'samochodzik': { emoji: '🚗', price: 40, type: 'toy', hunger: 0, happiness: 22, health: 0, maxUsePerHour: 1, cooldown: 300000 },
  'snusy': { emoji: '🟫', price: 40, type: 'drug', hunger: 0, happiness: 0, health: 0, angerReduce: 18, maxUsePerHour: 2, cooldown: 60000 },
  'e-fajka': { emoji: '🔋', price: 60, type: 'drug', hunger: 0, happiness: 0, health: 0, angerReduce: 25, maxUsePerHour: 2, cooldown: 60000 },
  'fajka': { emoji: '🚬', price: 25, type: 'drug', hunger: 0, happiness: 0, health: -5, angerReduce: 15, maxUsePerHour: 2, cooldown: 60000 },
  'paczka Papierosów': { emoji: '📦', price: 225, type: 'drug', hunger: 0, happiness: 0, health: 0, packFor: 'fajka', packAmount: 10, maxUsePerHour: 1, cooldown: 60000 },
  'krucyfiks': { emoji: '✝️', price: 1500, type: 'religious', possessedRemove: true, maxUsePerHour: 1, cooldown: 60000 },
  'biblia': { emoji: '📖', price: 200, type: 'religious', religion: 15, maxUsePerHour: 2, cooldown: 120000 },
  'box': { emoji: '🎁', price: 250, type: 'mystery', hunger: 30, happiness: 30, health: 20, maxUsePerHour: 1, cooldown: 600000 }
};

// DATA
let data;
let userDataPreserved = false;

function loadData() {
  try {
    // Try to load main data file
    if (fs.existsSync('data.json')) {
      const fileData = fs.readFileSync('data.json');
      const parsedData = JSON.parse(fileData);
      
      // Check if users data exists and is not empty
      if (parsedData.users && Object.keys(parsedData.users).length > 0) {
        console.log('✅ Loaded existing data with users preserved');
        return parsedData;
      }
    }
    
    // Try to load from backup files if main data is empty or doesn't exist
    const backupFiles = fs.readdirSync('.').filter(file => 
      file.startsWith('data.backup.') && file.endsWith('.json')
    );
    
    if (backupFiles.length > 0) {
      // Sort by timestamp to get the latest backup
      backupFiles.sort((a, b) => {
        const timeA = parseInt(a.split('.')[2]);
        const timeB = parseInt(b.split('.')[2]);
        return timeB - timeA;
      });
      
      const latestBackup = backupFiles[0];
      console.log(`🔄 Loading data from backup: ${latestBackup}`);
      const backupData = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));
      
      if (backupData.users && Object.keys(backupData.users).length > 0) {
        userDataPreserved = true;
        console.log('✅ User data preserved from backup');
        return backupData;
      }
    }
    
    // If no valid data found, create new structure
    console.log('🆕 Creating new data structure');
    return {
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
    
  } catch (error) {
    console.error('❌ Error loading data:', error.message);
    // Fallback to empty structure
    return {
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
}

data = loadData();
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
      mood: "neutral",
      coinsSpent: 0
    };
  }

  const u = data.users[userId];
  if (!u.inventory) u.inventory = {};
  if (!u.cooldowns) u.cooldowns = {};
  if (!u.itemCooldowns) u.itemCooldowns = {};
  if (u.coinsSpent === undefined) u.coinsSpent = 0;
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

function getLevelBonus(level) {
  if (level >= 10) return 6;  // 10+ lvl = +6 monet
  if (level >= 5) return 3;   // 5+ lvl = +3 monet
  return 0;  // poniżej 5 lvl = bez bonusu
}

// 🎨 HUD - Ulepszone progress bary
function bar(v, type = 'default') {
  const percentage = Math.round(v);
  const filled = Math.round(percentage / 10);
  const empty = 10 - filled;
  
  // Kolory i emotikony w zależności od typu statystyki
  const styles = {
    hunger: { icon: '🍖', filled: '🟥', empty: '⬛' },
    happiness: { icon: '😊', filled: '🟨', empty: '⬛' },
    health: { icon: '❤️', filled: '🟩', empty: '⬛' },
    cleanliness: { icon: '🧼', filled: '🟦', empty: '⬛' },
    anger: { icon: '😡', filled: '🟧', empty: '⬛' },
    religion: { icon: '✝️', filled: '🟪', empty: '⬛' },
    default: { icon: '📊', filled: '🟩', empty: '⬛' }
  };
  
  const style = styles[type] || styles.default;
  const bar = style.filled.repeat(filled) + style.empty.repeat(empty);
  const status = getStatusEmoji(percentage);
  
  return `${style.icon} ${bar} ${status} ${percentage}/100`;
}

function getStatusEmoji(percentage) {
  if (percentage >= 80) return '✨';
  if (percentage >= 60) return '👍';
  if (percentage >= 40) return '😐';
  if (percentage >= 20) return '😟';
  return '⚠️';
}

function getStatColor(percentage) {
  if (percentage >= 70) return 0x00ff00; // Zielony
  if (percentage >= 40) return 0xffff00; // Żółty
  return 0xff0000; // Czerwony
}

function petStatus() {
  const hunger = Math.round(data.pet.hunger);
  const happiness = Math.round(data.pet.happiness);
  const health = Math.round(data.pet.health);
  const cleanliness = Math.round(data.pet.cleanliness);
  const anger = Math.round(data.pet.anger);
  const religion = Math.round(data.pet.religion);

  return `🐻 **MISI STATUS** 🐻

${bar(hunger, 'hunger')}
${bar(happiness, 'happiness')}
${bar(health, 'health')}
${bar(cleanliness, 'cleanliness')}
${bar(anger, 'anger')}
${bar(religion, 'religion')}

💀 **Liczba śmierci:** ${data.pet.deathCount}`;
}

// 🎮 INTERAKTYWNE PRZYCISKI
function createActionButtons(userId) {
  const now = Date.now();
  const user = data.users[userId] || {};
  
  // Sprawdź cooldowny
  const feedCooldown = user.lastFeed && (now - user.lastFeed < 600000);
  const playCooldown = user.lastPlay && (now - user.lastPlay < 600000);
  const cleanCooldown = user.lastClean && (now - user.lastClean < 600000);
  const healCooldown = user.lastHeal && (now - user.lastHeal < 600000);
  
  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('feed')
        .setLabel(feedCooldown ? '⏳ Odczekaj' : '🍖 Nakarm')
        .setStyle(feedCooldown ? ButtonStyle.Secondary : ButtonStyle.Success)
        .setDisabled(feedCooldown),
      new ButtonBuilder()
        .setCustomId('play')
        .setLabel(playCooldown ? '⏳ Odczekaj' : '🎾 Baw się')
        .setStyle(playCooldown ? ButtonStyle.Secondary : ButtonStyle.Primary)
        .setDisabled(playCooldown),
      new ButtonBuilder()
        .setCustomId('clean')
        .setLabel(cleanCooldown ? '⏳ Odczekaj' : '🧼 Umyj')
        .setStyle(cleanCooldown ? ButtonStyle.Secondary : ButtonStyle.Secondary)
        .setDisabled(cleanCooldown),
      new ButtonBuilder()
        .setCustomId('heal')
        .setLabel(healCooldown ? '⏳ Odczekaj' : '❤️ Ulecz')
        .setStyle(healCooldown ? ButtonStyle.Secondary : ButtonStyle.Danger)
        .setDisabled(healCooldown)
    );
  return row;
}

function createStatusEmbed(userId) {
  const u = data.users[userId];
  const overallStatus = Math.round((data.pet.hunger + data.pet.happiness + data.pet.health + data.pet.cleanliness) / 4);
  const statusEmoji = data.pet.dead ? '💀' : (overallStatus >= 70 ? '😊' : overallStatus >= 40 ? '😐' : '😟');
  
  return new EmbedBuilder()
    .setTitle(`🐻 Status Misia ${statusEmoji}`)
    .setDescription(petStatus())
    .setThumbnail('https://cdn.discordapp.com/attachments/1234567890/1234567890/bear.png') // Można zmienić na prawdziwy obrazek
    .setColor(data.pet.dead ? 0x000000 : getStatColor(overallStatus))
    .addFields(
      { name: '👤 Użytkownik', value: `<@${userId}>`, inline: true },
      { name: '💰 Monety', value: `${u.coins}`, inline: true },
      { name: '🏆 Level', value: `${u.level}`, inline: true },
      { name: '📈 XP', value: `${u.xp}/150`, inline: true },
      { name: '🎯 Ogólny status', value: `${overallStatus}%`, inline: true },
      { name: '⏰ Ostatnia akcja', value: getLastAction(userId), inline: true }
    )
    .setFooter({ text: 'Użyj komend !feed, !play, !clean, !heal', iconURL: client.user.displayAvatarURL() })
    .setTimestamp();
}

function getLastAction(userId) {
  const u = data.users[userId];
  const actions = [];
  if (u.lastFeed) actions.push(`🍖 ${getTimeAgo(u.lastFeed)}`);
  if (u.lastPlay) actions.push(`🎾 ${getTimeAgo(u.lastPlay)}`);
  if (u.lastClean) actions.push(`🧼 ${getTimeAgo(u.lastClean)}`);
  if (u.lastHeal) actions.push(`❤️ ${getTimeAgo(u.lastHeal)}`);
  return actions.length > 0 ? actions.slice(-2).join(', ') : 'Brak';
}

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'teraz';
  if (minutes < 60) return `${minutes}min temu`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h temu`;
}
function getPetMood() {
  const statuses = [];
  
  if (data.pet.hunger < 40) statuses.push("Misi jest jeszcze glodny...");
  if (data.pet.hunger < 15) statuses.push("MISI UMIERA Z GŁODU!");
  
  if (data.pet.happiness < 40) statuses.push("Misi jest smutny...");
  if (data.pet.happiness < 15) statuses.push("MISI JEST BARDZO SMUTNY!");
  
  if (data.pet.health < 40) statuses.push("Misi źle się czuje...");
  if (data.pet.health < 15) statuses.push("MISI SIĘ ŹLE CZUJE!");
  
  if (data.pet.cleanliness < 40) statuses.push("Misi jest brudny...");
  if (data.pet.cleanliness < 15) statuses.push("MISI JEST BARDZO BRUDNY!");
  
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
              .setDescription("Nikt nie zareagował na czas i Misi zmarł. Nie umiesz dbać o Misia.\n\nMożesz adoptować nowego Misia za 6 godzin komendą `!adopt`.")
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

// 🧠 AI - Zaawansowany system rozumienia języka z pamięcią konwersacji
function aiReply(message) {
  const t = message.content.toLowerCase();
  const userId = message.author.id;
  
  // 👹 POSSESSED AI RESPONSES
  if (data.pet.possessed && !data.pet.dead) {
    const possessedResponses = [
      "👹 Misi cię widzi... 👁️‍🗨️",
      "🔥 PŁONĄCE OCZY PATRZĄ NA CIEBIE! 🔥",
      "👁️‍🗨️ WIDZĘ TWOJE GRZECHY... 👁️‍🗨️",
      "🐻 Misi... ale inny... 👹",
      "🩸 KREW... WIĘCEJ KRWI... 🩸",
      "🌑 CIEMNOŚĆ ROZSIERA SIĘ... 🌑",
      "⚡ MOC CIĘ POGŁĄBI... ⚡",
      "🗣️ SŁYSZĘ TWOJE MYŚLI... 🗣️",
      "💀 ŚMIERĆ JEST BLISKO NIŻ MYŚLISZ... 💀",
      "🔮 WIDZĘ CO UKRYWASZ W SERCU... 🔮",
      "🐾 ŁAPY ZOZO DOTKNĄ TWOJEJ DUSZY... 🐾",
      "🌪️ SZTORM W DUSZY MISIA... 🌪️",
      "🎭 MASKA SPADŁA... PRAWDZIWE OBLICZE POJAWIŁO SIĘ... 🎭",
      "🔓 BRAMY PIEKŁA SĄ OTWARTE... 🔓",
      "🕯️ MODLITWA NIC NIE POMOŻE... 🕯️"
    ];
    return message.reply(possessedResponses[Math.floor(Math.random() * possessedResponses.length)]);
  }
  
  // Inicjalizacja pamięci konwersacji dla użytkownika
  if (!data.conversationMemory) data.conversationMemory = {};
  if (!data.conversationMemory[userId]) {
    data.conversationMemory[userId] = {
      messages: [],
      emotions: [],
      lastInteraction: Date.now(),
      mood: 'neutral',
      trustLevel: 50
    };
  }
  
  const memory = data.conversationMemory[userId];
  
  // Dodaj aktualną wiadomość do pamięci
  memory.messages.push({
    text: t,
    timestamp: Date.now(),
    author: userId
  });
  
  // Zachowaj tylko ostatnie 15 wiadomości
  if (memory.messages.length > 15) {
    memory.messages = memory.messages.slice(-15);
  }
  
  memory.lastInteraction = Date.now();
  
  // Funkcje pomocnicze do analizy tekstu
  const words = t.split(/\s+/);
  const hasWord = (word) => words.includes(word);
  const hasAnyWord = (wordList) => wordList.some(word => hasWord(word));
  
  // Zaawansowana analiza emocji i kontekstu
  function analyzeEmotion(text) {
    const emotions = {
      joy: hasAnyWord(['radosny', 'szczęśliwy', 'wesoły', 'super', 'świetnie', 'świetny', 'hehe', 'haha', 'lol', '😊', '😄', '🎉']),
      anger: hasAnyWord(['wkurzony', 'zły', 'pierdolony', 'kurwa', 'cholera', 'gówno', 'do dupy', '😡', '😠', '💢']),
      sadness: hasAnyWord(['smutny', 'przykro', 'płaczę', 'depresja', 'słabo', 'źle', '😢', '😭', '💔']),
      fear: hasAnyWord(['boję', 'strach', 'lek', 'przerażony', '😨', '😱', '😰']),
      love: hasAnyWord(['kocham', 'kochanie', 'missie', 'uwielbiam', 'lubie', 'serce', '❤️', '💕']),
      excitement: hasAnyWord(['ekscytujący', 'super', 'wow', 'och', 'niesamowite', '🤩', '✨', '🔥']),
      confusion: hasAnyWord(['nie rozumiem', 'co', 'jak', 'dlaczego', '🤔', '❓', '🤷']),
      tired: hasAnyWord(['zmęczony', 'śpiący', 'chcę spać', 'sen', '😴', '😪', '🥱'])
    };
    
    // Znajdź dominującą emocję
    for (const [emotion, hasEmotion] of Object.entries(emotions)) {
      if (hasEmotion) return emotion;
    }
    return 'neutral';
  }
  
  // Analiza tonu rozmowy
  function analyzeTone(text) {
    if (hasAnyWord(['kurwa', 'pierdol', 'cholera', 'gówno', 'jebać'])) return 'vulgar';
    if (hasAnyWord(['proszę', 'dziękuję', 'bardzo proszę', 'przepraszam'])) return 'formal';
    if (hasAnyWord(['stary', 'ziom', 'brachu', 'koleś', 'kumplu'])) return 'informal';
    if (hasAnyWord(['lol', 'lmao', 'xd', 'haha', 'hehe'])) return 'playful';
    return 'neutral';
  }
  
  // Inteligentna analiza kontekstu i intencji
  function analyzeIntent(text) {
    const words = text.split(/\s+/);
    const hasWord = (word) => words.includes(word);
    const hasAnyWord = (wordList) => wordList.some(word => hasWord(word));
    
    // Analiza emocji i intencji
    const intent = {
      isGreeting: hasAnyWord(['hej', 'siema', 'cześć', 'witam', 'elo', 'dzień dobry', 'dzien dobry', 'good morning']),
      isGoodbye: hasAnyWord(['dobranoc', 'good night', 'pa', 'żegnam', 'nara']),
      isLove: hasAnyWord(['kocham', 'kochanie', 'missie', 'uwielbiam', 'lubie', 'bardzo lubie']),
      isQuestion: hasAnyWord(['?', 'czy', 'jak', 'co', 'gdzie', 'kiedy', 'dlaczego', 'ile', 'po co']),
      isPain: hasAnyWord(['boli', 'ból', 'ból', 'chory', 'choroba', 'złe', 'źle', 'boleść']),
      isHunger: hasAnyWord(['głód', 'glodny', 'głodny', 'jeść', 'jem', 'chce jeść', 'jedzenie', 'głodny']),
      isThirst: hasAnyWord(['pić', 'pragnie', 'spragniony', 'woda', 'napój', 'chce pić']),
      isPlay: hasAnyWord(['zabawa', 'bawić', 'pobawić', 'nuda', 'nudno', 'grać', 'pobawmy']),
      isFood: hasAnyWord(['jedzenie', 'jeść', 'przepis', 'gotować', 'kanapka', 'pizza', 'obiad', 'kolacja']),
      isMood: hasAnyWord(['mood', 'nastroj', 'samopoczucie', 'czujesz', 'masz się', 'samopoczucie']),
      isLocation: hasAnyWord(['gdzie', 'lokalizacja', 'miejsce', 'pozycja', 'jesteś']),
      isActivity: hasAnyWord(['robisz', 'co robisz', 'działanie', 'aktualność', 'co się dzieje']),
      isMedia: hasAnyWord(['film', 'muzyka', 'piosenka', 'książka', 'serial', 'oglądać']),
      isHealth: hasAnyWord(['zdrowie', 'zdrowy', 'choroba', 'leczenie', 'medycyna', 'leczyć']),
      isCleaning: hasAnyWord(['czystość', 'brudny', 'myć', 'sprzątać', 'umyć', 'czyścić']),
      isReligion: hasAnyWord(['bóg', 'modlić', 'religia', 'wiara', 'modlitwa', 'kościół']),
      isMoney: hasAnyWord(['pieniądze', 'monety', 'coins', 'kasa', 'hajs', 'pieniądze']),
      isAge: hasAnyWord(['wiek', 'lat', 'stary', 'młody', 'urodziny', 'ile masz']),
      isTime: hasAnyWord(['czas', 'godzina', 'termin', 'kiedy', 'pora', 'która godzina']),
      isHelp: hasAnyWord(['pomoc', 'help', 'pomóż', 'instrukcja', 'jak', 'nauka'])
    };
    
    return intent;
  }
  
  // Dynamiczne generowanie odpowiedzi z kontekstem i emocjami
  function generateResponse(text, intent, emotion, tone) {
    const responses = [];
    const misiMood = getMisiMoodFromStats();
    const userTrust = memory.trustLevel;
    
    // Dynamiczne odpowiedzi zależne od statystyk Misia
    if (intent.isGreeting) {
      if (data.pet.happiness < 30) {
        responses.push("🐻 Misi westchnął cicho... cześć...");
      } else if (data.pet.hunger < 30) {
        responses.push("🐻 Misi mruczy cicho... ale myśli o jedzeniu! 🍗");
      } else {
        responses.push("🐻 Misi się cieszy! " + getMisiEmotion());
      }
    }
    
    if (intent.isLove) {
      if (emotion === 'joy') {
        responses.push("🐻 Misi czuje twoją radość i przytula cię! 🤗❤️");
      } else if (userTrust > 70) {
        responses.push("🐻 Misi kocha cię z całego serca! 💕");
      } else {
        responses.push("🐻 Misi też ❤️");
      }
    }
    
    if (intent.isGoodbye) {
      if (data.pet.happiness < 40) {
        responses.push("🐻 Misi smutnie macha łapką... do zobaczenia 🌙");
      } else {
        responses.push("🐻 Misi mruczy na sen! Dobranoc! 🌙");
      }
    }
    
    if (intent.isPain) {
      const bodyParts = [
        "🐻 Misi boli głowa... 🤕", "🐻 Misi boli brzuszek... 🤢", 
        "🐻 Misi boli nóżka... 🦵", "🐻 Misi boli łapka... 🐾",
        "🐻 Misi boli ogonek... 🐕", "🐻 Misi boli uszko... 👂",
        "🐻 Misi boli nosek... 👃", "🐻 Misi boli oczko... 👁️",
        "🐻 Misi boli serduszko... ❤️", "🐻 Misi boli kręgosłup... 🦴",
        "🐻 Misi boli gardło... 😷", "🐻 Misi boli wszystko... 💀",
        "🐻 Że Rychu Peja ma szanse uczciwie zarobić! 🎤💰"
      ];
      if (data.pet.health < 30) {
        responses.push("🐻 Misi i tak już wszystko boli... ale dodatkowo " + bodyParts[Math.floor(Math.random() * bodyParts.length)].substring(8));
      } else {
        responses.push(bodyParts[Math.floor(Math.random() * bodyParts.length)]);
      }
    }
    
    if (intent.isHunger) {
      if (data.pet.hunger < 20) {
        responses.push("🐻 Misi umiera z głodu! 🍗🍗🍗 Pomóż!");
      } else if (data.pet.hunger < 50) {
        responses.push("🐻 Misi bardzo coś zjadłby teraz... 🍖");
      } else {
        responses.push("🐻 Misi zawsze ma miejsce na coś dobrego! 🍗");
      }
    }
    
    if (intent.isThirst) {
      if (data.pet.hunger < 30) {
        responses.push("🐻 Misi jest spragniony i głodny... 💧🍗");
      } else {
        responses.push("🐻 Misi chce pić! 💧");
      }
    }
    
    if (intent.isPlay) {
      if (data.pet.happiness < 30) {
        responses.push("🐻 Misi jest zbyt smutny na zabawę... 🌧️");
      } else if (data.pet.happiness > 70) {
        responses.push("🐻 TAK! Zabawa! Misi czuje energię! 🎾⚡");
      } else {
        responses.push("🐻 Pobaw się ze mną! �");
      }
    }
    
    if (intent.isMood || (intent.isQuestion && hasAnyWord(['jak', 'masz']))) {
      responses.push("🐻 Misi czuje się " + misiMood);
    }
    
    if (intent.isLocation) {
      responses.push("🐻 Misi jest tutaj! Z tobą! " + getMisiEmotion());
    }
    
    if (intent.isActivity) {
      if (data.pet.hunger < 30) {
        responses.push("🐻 Misi myśli o jedzeniu... 🍗");
      } else if (data.pet.happiness < 30) {
        responses.push("🐻 Misi myśli o smutku... 😔");
      } else {
        responses.push("🐻 Misi myśli o życiu... " + getMisiEmotion());
      }
    }
    
    if (intent.isAge) {
      responses.push("🐻 Misi jest wiecznie młody! " + getMisiEmotion());
    }
    
    if (intent.isHelp) {
      responses.push("🐻 Użyj komendy !help aby zobaczyć wszystkie dostępne komendy!");
    }
    
    // Jeśli znaleziono intencję, zwróć pierwszą odpowiedź
    if (responses.length > 0) {
      return responses[0];
    }
    
    // Inteligentne domyślanie się na podstawie kontekstu
    if (text.length < 20 && intent.isQuestion) {
      if (hasAnyWord(['co'])) {
        if (hasAnyWord(['robisz', 'dzieje'])) return "🐻 Misi myśli o życiu... " + getMisiEmotion();
        if (hasAnyWord(['u', 'ciebie'])) return "🐻 Misi czuje się " + misiMood;
      }
      if (hasAnyWord(['jak'])) {
        if (hasAnyWord(['masz', 'sie'])) return "🐻 Misi czuje się " + misiMood;
      }
    }
    
    return null;
  }
  
  // Funkcje pomocnicze dla dynamicznych odpowiedzi
  function getMisiMoodFromStats() {
    if (data.pet.happiness > 70 && data.pet.hunger > 50 && data.pet.health > 50) return 'great';
    if (data.pet.happiness > 40 && data.pet.hunger > 30 && data.pet.health > 30) return 'good';
    if (data.pet.happiness < 20 || data.pet.hunger < 20 || data.pet.health < 20) return 'terrible';
    return 'okay';
  }
  
  function getMisiEmotion() {
    const mood = getMisiMoodFromStats();
    const emotions = {
      great: ['�', '🎉', '✨', '⭐', '🌟'],
      good: ['🙂', '😌', '👍', '😊', '🐻'],
      okay: ['😐', '🤔', '😑', '🐻', '�'],
      terrible: ['😢', '💔', '😭', '💀', '🌧️']
    };
    const emotionList = emotions[mood] || emotions.okay;
    return emotionList[Math.floor(Math.random() * emotionList.length)];
  }
  
  // Analiza zaawansowana
  const intent = analyzeIntent(t);
  const emotion = analyzeEmotion(t);
  const tone = analyzeTone(t);
  
  // Aktualizuj emocje użytkownika w pamięci
  memory.emotions.push({
    emotion: emotion,
    tone: tone,
    timestamp: Date.now()
  });
  
  // Zachowaj tylko ostatnie 10 emocji
  if (memory.emotions.length > 10) {
    memory.emotions = memory.emotions.slice(-10);
  }
  
  // Aktualizuj poziom zaufania na podstawie tonu
  if (tone === 'vulgar') {
    memory.trustLevel = Math.max(0, memory.trustLevel - 5);
  } else if (tone === 'formal') {
    memory.trustLevel = Math.min(100, memory.trustLevel + 2);
  } else if (emotion === 'love') {
    memory.trustLevel = Math.min(100, memory.trustLevel + 3);
  }
  
  // Generuj odpowiedzi z nowym systemem
  const intelligentResponse = generateResponse(t, intent, emotion, tone);
  
  if (intelligentResponse) {
    // Zapisz zmiany w pamięci
    safeSave();
    return message.reply(intelligentResponse);
  }

  // Powitania i podstawowe interakcje
  const greetings = [
    { k: ["hej","siema","cześć","witam","elo","jak sie masz"], r: "🐻 Misi się cieszy!" },
    { k: ["kocham","kocham misia","missie kocham"], r: "🐻 Misi też ❤️" },
    { k: ["dzień dobry","dzien dobry","good morning"], r: "🐻 Dobry dzień! 🌞" },
    { k: ["dobranoc","good night"], r: "🐻 Dobranoc! 🌙" }
  ];

  // Potrzeby Misia
  const needs = [
    { k: ["głodny","mis jest glodny","jestem glodny","misi glodny"], r: "🐻 Misi chce jeść 🍗" },
    { k: ["nuda","jest nudno","mis jest nudny","pobaw sie"], r: "🐻 Pobaw się ze mną 🎾" },
    { k: ["pragnie","chce pic","mis jest spragniony"], r: "🐻 Misi chce pić! 💧" },
    { k: ["śpi","mis spi","spij misiu"], r: "🐻 Misi śpi... zzz 💤" }
  ];

  // Jedzenie i przepisy
  const food = [
    { k: ["daj mi przepis na pierogi","przepis na pierogi","jak zrobic pierogi"], r: "🐻 Oto przepis na pierogi Misia:\n🥟 Składniki: mąka, woda, ser, ziemniaki\n👨‍🍳 Przygotuj ciasto i farsz\n🥟 Gotuj przez 15 minut\n🍽 Smacznego!" },
    { k: ["co jes misiu","co lubisz jesc","mis co lubisz"], r: "🐻 Misi lubi: 🍯 miód, 🍎 jabłka, 🥨 chrupki!" },
    { k: ["zrob mi kanapke","kanapka","zrob kanapke"], r: "🐻 Misi robi kanapkę! 🥪🧀🥬" },
    { k: ["pizza","lubie pizze","chce pizze"], r: "🐻 Misi kocha pizzę! 🍕🧀🍕" }
  ];

  // Zabawa i aktywności
  const activities = [
    { k: ["pobawmy sie","zabawa","chce sie bawic"], r: "🐻 TAK! Zabawa! 🎾🎮🎲" },
    { k: ["oglądajmy film","film","serial"], r: "🐻 Misi chce oglądać film! 🎬🍿" },
    { k: ["sluchajmy muzyki","muzyka","piosenka"], r: "🐻 Misi tańczy! 🎵💃🕺" },
    { k: ["czytajmy","ksiazka","opowiadanie"], r: "🐻 Misi słucha bajki! 📖📚" }
  ];

  // Pytania i rozmowa
  const questions = [
    { k: ["jak sie masz","co u ciebie","jak misi"], r: "🐻 Misi czuje się " + (data.pet.happiness > 70 ? 'świetnie! 😊' : data.pet.happiness > 40 ? 'dobrze 😐' : 'słabo 😟') },
    { k: ["ile masz lat","wiek misia","stary misi"], r: "🐻 Misi jest wiecznie młody! 🐻‍♂️" },
    { k: ["gdzie jestes","mis gdzie jestes"], r: "🐻 Misi jest tutaj! Z tobą! 🐻" },
    { k: ["co robisz","co misi robi"], r: "🐻 Misi myśli o życiu... 🤔" }
  ];

  // Bóle i dolegliwości
  const pains = [
    { k: ["co cie boli","misiu co cie boli","co ci boli misiu","gdzie cie boli","co boli","misi co boli"], 
      r: () => {
        const bodyParts = [
          "🐻 Misi boli głowa... 🤕",
          "🐻 Misi boli brzuszek... 🤢", 
          "🐻 Misi boli nóżka... 🦵",
          "🐻 Misi boli łapka... 🐾",
          "🐻 Misi boli ogonek... 🐕",
          "🐻 Misi boli uszko... 👂",
          "🐻 Misi boli nosek... 👃",
          "🐻 Misi boli oczko... 👁️",
          "🐻 Misi boli serduszko... ❤️",
          "🐻 Misi boli kręgosłup... 🦴",
          "🐻 Misi boli gardło... 😷",
          "🐻 Misi boli wszystko... 💀",
          "🐻 Że Rychu Peja ma szanse uczciwie zarobić! 🎤💰"
        ];
        return bodyParts[Math.floor(Math.random() * bodyParts.length)];
      }
    }
  ];

  // Specjalne odpowiedzi zależne od statystyk
  const statBased = [
    { 
      k: ["jestem glodny","mis glodny"], 
      condition: () => data.pet.hunger < 30,
      r: "🐻 Misi jest bardzo głodny! 🍗🍗🍗" 
    },
    { 
      k: ["jestem smutny","mis smutny"], 
      condition: () => data.pet.happiness < 30,
      r: "🐻 Misi jest smutny... Potrzebuje przytulenia! 🤗" 
    },
    { 
      k: ["jestem chory","mis chory"], 
      condition: () => data.pet.health < 30,
      r: "🐻 Misi jest chory... Potrzebuje lekarstwa! 💊" 
    }
  ];

  // Sprawdź wszystkie kategorie
  const allMaps = [...greetings, ...needs, ...food, ...activities, ...questions, ...pains];
  
  for (const m of allMaps) {
    if (m.k.some(x => t.includes(x))) {
      if (m.condition && !m.condition()) continue; // Pomiń jeśli warunek nie spełniony
      const response = typeof m.r === 'function' ? m.r() : m.r;
      return message.reply(response);
    }
  }

  // Sprawdź odpowiedzi zależne od statystyk
  for (const m of statBased) {
    if (m.k.some(x => t.includes(x))) {
      if (m.condition && !m.condition()) continue;
      return message.reply(m.r);
    }
  }

  // Losowe odpowiedzi (zwiększona szansa)
  const randomResponses = [
    "🐻 Misi mruczy... 🐾",
    "🐻 Misi macha łapką! 👋",
    "🐻 Misi się rozciąga! 🐾",
    "🐻 Misi patrzy z ciekawością... 👀",
    "🐻 Misi chce przytulenia! 🤗",
    "🐻 Misi goni za ogonem! 🐾",
    "🐻 Misi drapie się za uchem 🐾",
    "🐻 Misi ziewa! 💤",
    "🐻 Misi merda! 🐾",
    "🐻 Misi chce spać! 😴",
    "🐻 Misi jest głodny... 🍗",
    "🐻 Misi marzy o miodzie! 🍯",
    "🐻 Misi myśli o Tobie! 💭",
    "🐻 Misi idzie zapalić fajkę 🚬"
  ];

  if (Math.random() < 0.15) { // Zwiększona szansa z 5% do 15%
    const randomResponse = randomResponses[Math.floor(Math.random() * randomResponses.length)];
    return message.reply(randomResponse);
  }
}

// 💰 REWARD
function reward(userId, coins, xp, msg) {
  ensureUser(userId);
  const u = data.users[userId];

  u.coins += coins;
  u.xp += xp;

  // Calculate XP needed for next level: 150 XP dla każdego poziomu
  while (u.xp >= 150) {
    u.xp -= 150;
    u.level++;
    msg.channel.send(`🏆 LEVEL UP → ${u.level}! (XP zresetowane do ${u.xp}/150)`);
  }

  safeSave();
}

// 💬 BOT
client.on('messageCreate', async (message) => {
  if (!message.guild || message.author.bot) return;

  const channel = message.guild.channels.cache.find(
    c => c.name === allowedChannelName && c.isTextBased()
  );

  if (!channel || message.channel.id !== channel.id) return;

  const userId = message.author.id;
  
  // Dodatkowe logowanie dla debugowania problemów z danymi
  try {
    ensureUser(userId);
  } catch (error) {
    log(`Błąd podczas inicjalizacji użytkownika ${userId}: ${error.message}`, 'error');
    log(`Stack trace: ${error.stack}`, 'error');
    return message.reply('❌ Wystąpił błąd z danymi użytkownika. Skontaktuj się z administratorem.');
  }

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

  // � ADMIN SET COMMAND
  if (message.content.startsWith('!set')) {
    if (userId !== ADMIN_ID) {
      return message.reply("❌ Nie masz uprawnień do tej komendy!");
    }

    const args = message.content.split(' ');
    
    if (args.length === 1) {
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("🔧 ADMIN SET - Pomoc")
            .setDescription("Użyj komendy `!set <statystyka> <wartość>` aby ustawić statystyki Misia.")
            .addFields(
              { name: "📊 Dostępne statystyki", value: "`hunger` - Głód (0-100)\n`happiness` - Szczęście (0-100)\n`health` - Zdrowie (0-100)\n`cleanliness` - Czystość (0-100)\n`anger` - Złość (0-100)\n`religion` - Religia (0-100)", inline: false },
              { name: "📝 Przykłady użycia", value: "`!set hunger 75`\n`!set happiness 100`\n`!set health 50`\n`!set anger 0`\n`!set religion 25`", inline: false },
              { name: "⚠️ Uwagi", value: "Wartości muszą być w zakresie 0-100.\nKomenda tylko dla admina!", inline: false }
            )
            .setColor(0x00ff00)
            .setTimestamp()
        ]
      });
    }

    const statName = args[1]?.toLowerCase();
    const value = parseInt(args[2]);

    if (!statName || isNaN(value)) {
      return message.reply("❌ Niepoprawne użycie! Użyj `!set <statystyka> <wartość>`");
    }

    if (value < 0 || value > 100) {
      return message.reply("❌ Wartość musi być w zakresie 0-100!");
    }

    const validStats = {
      'hunger': 'głód',
      'happiness': 'szczęście',
      'health': 'zdrowie',
      'cleanliness': 'czystość',
      'anger': 'złość',
      'religion': 'religia'
    };

    if (!validStats[statName]) {
      return message.reply(`❌ Niepoprawna statystyka! Dostępne: ${Object.keys(validStats).join(', ')}`);
    }

    const oldValue = data.pet[statName];
    data.pet[statName] = value;
    clampPet();
    safeSave();

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🔧 ADMIN SET - Statystyka Zmieniona")
          .setDescription(`Pomyślnie zmieniono statystykę Misia!`)
          .addFields(
            { name: "📊 Statystyka", value: `${validStats[statName]} (${statName})`, inline: true },
            { name: "📉 Stara wartość", value: oldValue.toString(), inline: true },
            { name: "📈 Nowa wartość", value: value.toString(), inline: true }
          )
          .setColor(0x00ff00)
          .setTimestamp()
      ]
    });
  }

  // � ADMIN KILL COMMAND
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
    return message.reply(`🐻 **Misi Bot - Komendy:**

🐻 **Status i Statystyki:**
🐻 !status - sprawdź status Misia i swoje statystyki
💰 !coins - sprawdź swoje monety i XP
🎒 !inv - sprawdź swoje inventory
📅 !dni - sprawdź ile dni Misi żyje

🛒 **Sklep:**
🛒 !shop - zobacz wszystkie dostępne przedmioty
🛍 !buy <przedmiot> - kup przedmiot za monety

🎮 **Przedmioty:**
🎮 !use <przedmiot> - użyj przedmiot z inventory

🐻 **Opieka nad Misim:**
🍗 !feed - nakarm Misia (5-20 monet + bonus levelowy, 5 XP)
🎾 !play - baw się z Misiem (5-20 monet + bonus levelowy, 5 XP)
🧼 !clean - umyj Misia (5-20 monet + bonus levelowy, 5 XP)
❤️ !heal - ulecz Misia (5-20 monet + bonus levelowy, 5 XP)

🙏 **Religia i Spokój:**
🙏 !pray - pomódl się za Misia (+5 religii, 30 min cooldown)
😌 !calm - uspokój Misia (wymaga >85 statystyk)
🧾 !taca - wyślij z tacą (losowe monety, wymaga >80 religii)

🏆 **Rankingi:**
💰 !top coins - top 10 użytkowników wg wydatków w sklepie
🏆 !top level - top 10 użytkowników wg leveli i XP

💰 **Interakcje:**
💝 !gift @user kwota - wyślij monety innemu użytkownikowi

🔮 **Wróżenie i Zabawa:**
🔮 !kula [pytanie] - zapytaj Magiczną Kulę Misia o odpowiedź

🚨 **Admin:**
🚨 !restore - przywróć Misia do życia (emergency)
🔫 !kill - zabij Misia (admin only)

🐻 **Adopcja:**
🐻 !adopt - adoptuj nowego Misia (po śmierci, 6h cooldown)

**⚡ System Levelowy i Bonusy:**
- 5 XP za każdą akcję
- 150 XP potrzebne na KAŻDY poziom (po osiągnięciu 150/150 XP awansujesz i XP resetuje się do 0)
- Bonusy monetowe: 0 monet (lvl 1-4), +3 monety (lvl 5-9), +6 monet (lvl 10+)

**🛡️ Bezpieczeństwo:**
- Automatyczne backupy co 6 godzin
- Pełna walidacja danych
- System logowania i monitorowania`);
  }

  if (message.content === '!status') {
    return message.reply({
      embeds: [createStatusEmbed(userId)]
    });
  }

  if (message.content === '!coins') {
    return message.reply(`💰 ${data.users[userId].coins}`);
  }

  if (message.content === '!lvl') {
    const u = data.users[userId];
    const xpNeeded = 150;
    const xpProgress = u.xp;
    const xpToNext = xpNeeded - xpProgress;
    
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🏆 TWÓJ POZIOM')
          .setDescription(`**Level:** ${u.level}\n**XP:** ${xpProgress}/${xpNeeded}\n**Do następnego levela:** ${xpToNext} XP`)
          .addFields(
            { name: '📈 Postęp', value: `[${'█'.repeat(Math.floor(xpProgress / 15))}${'░'.repeat(10 - Math.floor(xpProgress / 15))}] ${Math.round((xpProgress / xpNeeded) * 100)}%`, inline: false },
            { name: '💰 Monety', value: `${u.coins}`, inline: true },
            { name: '⭐ Bonus monetowy', value: `+${getLevelBonus(u.level)} monet za akcje`, inline: true }
          )
          .setColor(0x00ff00)
          .setTimestamp()
      ]
    });
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
      const remainingMs = 600000 - (now - lastFeed);
      const totalSeconds = Math.ceil(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return message.reply(`⏳ Poczekaj ${minutes}m ${seconds}s przed kolejnym karmieniem!`);
    }

    const feedBefore = data.pet.hunger;
    data.pet.hunger = Math.min(100, data.pet.hunger + 15);
  clampPet();

  // Losowanie monet 5-20 + bonus za level
  const feedCoins = Math.floor(Math.random() * 16) + 5; // 5-20 monet
  const levelBonus = getLevelBonus(data.users[userId].level); // bonus za level
  
  reward(userId, feedCoins + levelBonus, 5, message);
  data.users[userId].lastFeed = now; // zapisz czas karmienia

  return message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("🍗 Nakarmiłeś Misia!")
        .setDescription(`**Głód:** ${Math.round(feedBefore)} → ${Math.round(data.pet.hunger)}\n**Otrzymano:** 💰 ${feedCoins} monet${levelBonus > 0 ? ` + bonus ${levelBonus} za level!` : ''}, 📈 5 XP\n\n${getPetMood()}`)
        .addFields(
          { name: "Głód", value: bar(data.pet.hunger), inline: false },
          { name: "📈 Twoje XP", value: `${data.users[userId].xp}/150`, inline: true },
          { name: "💰 Twoje monety", value: `${data.users[userId].coins}`, inline: true }
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
      const remainingMs = 600000 - (now - lastPlay);
      const totalSeconds = Math.ceil(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return message.reply(`⏳ Poczekaj ${minutes}m ${seconds}s przed kolejną zabawą!`);
    }

    const playBefore = data.pet.happiness;
    data.pet.happiness = Math.min(100, data.pet.happiness + 10);
  data.pet.happinessLossSincePlay = 0;
  data.pet.lastPlayAt = Date.now();
  
  // Zapisz czas ostatniej zabawy dla antyspamu
  data.users[userId].lastPlay = Date.now();
  
  clampPet();

  // Losowanie monet 5-20 + bonus za level
  const playCoins = Math.floor(Math.random() * 16) + 5; // 5-20 monet
  const levelBonus = getLevelBonus(data.users[userId].level); // bonus za level
  
  reward(userId, playCoins + levelBonus, 5, message);
  data.users[userId].lastPlay = Date.now();

  return message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("🎾 Bawiłeś się z Misiem!")
        .setDescription(`**Szczęście:** ${Math.round(playBefore)} → ${Math.round(data.pet.happiness)}\n**Otrzymano:** 💰 ${playCoins} monet${levelBonus > 0 ? ` + bonus ${levelBonus} za level!` : ''}, 📈 5 XP\n\n${getPetMood()}`)
        .addFields(
          { name: "Szczęście", value: bar(data.pet.happiness), inline: false },
          { name: "📈 Twoje XP", value: `${data.users[userId].xp}/150`, inline: true },
          { name: "💰 Twoje monety", value: `${data.users[userId].coins}`, inline: true }
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
      const remainingMs = 600000 - (now - lastClean);
      const totalSeconds = Math.ceil(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return message.reply(`⏳ Poczekaj ${minutes}m ${seconds}s przed kolejnym czyszczeniem!`);
    }

    const cleanBefore = data.pet.cleanliness;
    data.pet.cleanliness = Math.min(100, data.pet.cleanliness + 10);
  clampPet();

  // Losowanie monet 5-20 + bonus za level
  const cleanCoins = Math.floor(Math.random() * 16) + 5; // 5-20 monet
  const levelBonus = getLevelBonus(data.users[userId].level); // bonus za level

  reward(userId, cleanCoins + levelBonus, 5, message);
  data.users[userId].lastClean = now; // zapisz czas czyszczenia

  return message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("🧼 Umył(a)ś Misiego!")
        .setDescription(`**Czystość:** ${Math.round(cleanBefore)} → ${Math.round(data.pet.cleanliness)}\n**Otrzymano:** 💰 ${cleanCoins} monet${levelBonus > 0 ? ` + bonus ${levelBonus} za level!` : ''}, 📈 5 XP\n\n${getPetMood()}`)
        .addFields(
          { name: "Czystość", value: bar(data.pet.cleanliness), inline: false },
          { name: "📈 Twoje XP", value: `${data.users[userId].xp}/150`, inline: true },
          { name: "💰 Twoje monety", value: `${data.users[userId].coins}`, inline: true }
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
      const remainingMs = 600000 - (now - lastHeal);
      const totalSeconds = Math.ceil(remainingMs / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return message.reply(`⏳ Poczekaj ${minutes}m ${seconds}s przed kolejnym leczeniem!`);
    }

    const healBefore = data.pet.health;
    data.pet.health = Math.min(100, data.pet.health + 15);
  clampPet();

  // Losowanie monet 5-20 + bonus za level
  const healCoins = Math.floor(Math.random() * 16) + 5; // 5-20 monet
  const levelBonus = getLevelBonus(data.users[userId].level); // bonus za level
  
  reward(userId, healCoins + levelBonus, 5, message);
  data.users[userId].lastHeal = now; // zapisz czas leczenia

  return message.reply({
    embeds: [
      new EmbedBuilder()
        .setTitle("❤️ Uleczyłeś Misia!")
        .setDescription(`**Zdrowie:** ${Math.round(healBefore)} → ${Math.round(data.pet.health)}\n**Otrzymano:** 💰 ${healCoins} monet${levelBonus > 0 ? ` + bonus ${levelBonus} za level!` : ''}, 📈 5 XP\n\n${getPetMood()}`)
        .addFields(
          { name: "Zdrowie", value: bar(data.pet.health), inline: false },
          { name: "📈 Twoje XP", value: `${data.users[userId].xp}/150`, inline: true },
          { name: "💰 Twoje monety", value: `${data.users[userId].coins}`, inline: true }
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
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("😌 Usunięto zdenerwowanie Misia")
            .setDescription(`Udało Ci się uspokoić Misia!\n\n**Zdenerwowanie:** ${Math.round(before)} → ${Math.round(data.pet.anger)} (-10)\n\n${getPetMood()}`)
            .addFields(
              { name: "😡 Zdenerwowanie", value: bar(data.pet.anger), inline: false },
              { name: "📜 Efekt", value: "-10 do Zdenerwowania", inline: true },
              { name: "⏰ Cooldown", value: "10 minut", inline: true }
            )
            .setColor(data.pet.anger < 30 ? 0x00ff00 : data.pet.anger < 60 ? 0xffff00 : 0xff6347)
            .setTimestamp()
        ]
      });
    }

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🛑 Nie można uspokoić Misia")
          .setDescription("Aby uspokoić Misia, najpierw zadbaj o jego podstawowe potrzeby!")
          .addFields(
            { name: "🍗 Wymagany Głód", value: `> 85 (masz: ${Math.round(data.pet.hunger)})`, inline: true },
            { name: "😄 Wymagane Szczęście", value: `> 85 (masz: ${Math.round(data.pet.happiness)})`, inline: true },
            { name: "🧼 Wymagana Czystość", value: `> 85 (masz: ${Math.round(data.pet.cleanliness)})`, inline: true }
          )
          .setColor(0xff6347)
          .setTimestamp()
      ]
    });
  }
  // 🙏 PRAY - Z COOLDOWNEM 30 Minut
  if (message.content === '!pray') {
    if (data.pet.dead) {
      return message.reply("❌ Misi nie żyje! Użyj `!adopt` lub `!restore`.");
    }
    
    const cd = canUse(userId, 'pray', 1800000); // 30 minut cooldown
    if (!cd.ok) return message.reply(cd.msg);
    
    const now = Date.now();
    const lastPray = data.users[userId].lastPray || 0;
    if (data.pet.dead && now - data.pet.deathTime < 21600000) { // 6h cooldown po śmierci
      return message.reply(`⏳ Musisz poczekać 6 godzin przed adopcją nowego Misia!`);
    }

    data.users[userId].lastPray = now; // zapisz czas modlitwy

    const before = data.pet.religion;
    data.pet.religion += 5;
    clampPet();
    safeSave();

    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🙏 Modlitwa za Misia")
          .setDescription(`Twoja modlitwa została wysłuchana!\n\n**Religia:** ${Math.round(before)} → ${Math.round(data.pet.religion)} (+5)\n\n${getPetMood()}`)
          .addFields(
            { name: "⛪ Religia", value: bar(data.pet.religion), inline: false },
            { name: "📜 Efekt", value: "+5 do Religii", inline: true },
            { name: "⏰ Cooldown", value: "30 minut", inline: true }
          )
          .setColor(data.pet.religion > 70 ? 0x00ff00 : data.pet.religion > 40 ? 0xffff00 : 0xff6347)
          .setTimestamp()
      ]
    });
  }
  // 🧾 TACA
  if (message.content === '!taca') {
    if (data.pet.religion <= 80) {
      return message.reply('🛑 Religia musi być powyżej 80, żeby wysłać z tacą');
    }

    const cd = canUse(userId, 'taca', 43200000);
    if (!cd.ok) return message.reply(cd.msg);

    const coins = Math.floor(Math.random() * 51);
    if (coins > 0) {
      reward(userId, coins, 5, message);
      return message.reply(`🧾 Wysłałeś Misia z tacą i przyniósł Ci ${coins} monet.`);
    }

    return message.reply('🧾 Wysłałeś Misia z tacą, ale tym razem przyniósł 0 monet. Spróbuj ponownie za 12 godzin.');
  }

  // TOP LEADERBOARD
  if (message.content === '!top coins') {
    const sorted = Object.entries(data.users).sort((a, b) => b[1].coinsSpent - a[1].coinsSpent).slice(0, 10);
    const list = sorted.map((entry, i) => `${i + 1}. <@${entry[0]}> - ${entry[1].coinsSpent} monet wydanych`).join('\n');
    
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('💰 TOP 10 - WYDATKI W SKLEPIE')
          .setDescription(list || 'Brak danych')
          .setColor(0xffd700)
      ]
    });
  }

  if (message.content === '!top level') {
    const sorted = Object.entries(data.users).sort((a, b) => b[1].level - a[1].level).slice(0, 10);
    const list = sorted.map((entry, i) => {
      const user = entry[1];
      return `${i + 1}. <@${entry[0]}> - Level ${user.level} (${user.xp}/150 XP)`;
    }).join('\n');
    
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

    if (targetId === userId) {
      return message.reply('❌ Nie możesz wysłać monet samemu sobie!');
    }

    ensureUser(targetId);
    
    try {
      const targetUser = await client.users.fetch(targetId);
      if (!targetUser) {
        return message.reply('❌ Nie znaleziono użytkownika!');
      }
    } catch (error) {
      return message.reply('❌ Nie znaleziono użytkownika!');
    }

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
      `${item.emoji} **${name}** - ${item.price} monet | 🧼${item.cleanliness}${item.happiness ? ` 😄${item.happiness}` : ''}${item.health ? ` ❤️${item.health}` : ''}`
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
    const item = message.content.slice(5).trim(); // Weź wszystko po "!buy "
    const u = data.users[userId];

    const foundItem = findShopItem(item);
    if (!foundItem) return message.reply("❌ Nie ma takiego przedmiotu!");
    const shopItem = foundItem.item;
    const actualName = foundItem.name;
    
    if (u.coins < shopItem.price) return message.reply(`❌ Brak monet! Potrzebujesz ${shopItem.price - u.coins} więcej.`);

    u.coins -= shopItem.price;
    u.coinsSpent += shopItem.price;
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

  // 🔮 KULA - Magiczna 8-ball odpowiedzi
  if (message.content.startsWith('!kula')) {
    const question = message.content.slice(6).trim();
    
    if (!question) {
      return message.reply("🔮 Zadaj pytanie do Magicznej Kuli Misia!\n\nUżycie: `!kula [twoje pytanie]`");
    }

    const responses = [
      "🐻 Tak, na pewno!",
      "🐻 Nie, w żadnym wypadku!",
      "🐻 Możliwe, ale nie pewne...",
      "🐻 Zapytaj ponownie później!",
      "🐻 Misi myśli... tak!",
      "🐻 Misi myśli... nie!",
      "🐻 Absolutnie tak! 🌟",
      "🐻 Absolutnie nie! ❌",
      "🐻 Perspektywy są dobre! 👍",
      "🐻 Perspektywy są złe... 👎",
      "🐻 Misi nie jest pewien... 🤔",
      "🐻 Znaki wskazują na tak! ✨",
      "🐻 Znaki wskazują na nie! 🌑",
      "🐻 Poczekaj musze sprawdzić!",
      "🐻 Misi mówi tak! 🐻",
      "🐻 Misi mówi nie! 🐻",
      "🐻 Oczywiście, że tak! 😊",
      "🐻 Oczywiście, że nie! 😞",
      "🐻 Czas pokaże... ⏰",
      "🐻 Misi w to wierzy! 🙏"
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("🔮 Magiczna Kula Misia")
          .setDescription(`**Pytanie:** ${question}\n\n**Odpowiedź Misia:** ${response}`)
          .setColor(0x9966ff)
          .setThumbnail('https://cdn.discordapp.com/attachments/1234567890/1234567890/magic8ball.gif')
          .addFields(
            { name: "🐻 Misi radzi:", value: "Misi kula nigdy się nie myli!", inline: false }
          )
          .setFooter({ text: `Pytanie zadane przez ${message.author.username}`, iconURL: message.author.displayAvatarURL() })
          .setTimestamp()
      ]
    });
  }

  // 🎮 USE
  if (message.content.startsWith('!use')) {
    const item = message.content.slice(5).trim(); // Weź wszystko po "!use "
    const u = data.users[userId];

    const foundItem = findShopItem(item);
    if (!foundItem) return message.reply("❌ Nie ma takiego przedmiotu!");
    const actualName = foundItem.name;
    const shopItem = foundItem.item;

    if (!u.inventory[actualName]) return message.reply("❌ Nie posiadasz tego przedmiotu!");
    
    const cooldownCheck = checkItemCooldown(u, actualName);
    if (!cooldownCheck.ok) return message.reply(cooldownCheck.msg);

    u.inventory[actualName]--;
    
    // Special handling for pack items (like paczka papierosów)
    if (shopItem.packFor) {
      // Add packAmount items to inventory
      u.inventory[shopItem.packFor] = (u.inventory[shopItem.packFor] || 0) + shopItem.packAmount;
      
      clampPet();
      u.itemCooldowns[actualName].push(Date.now());
      safeSave();
      
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🎮 ${shopItem.emoji} Otworzyłeś ${actualName}!`)
            .setDescription(`Otrzymałeś **${shopItem.packAmount}x ${shopItem.packFor}** do inventory!\n\n${getPetMood()}`)
            .addFields(
              { name: '🎁 Pozostało:', value: `${u.inventory[actualName]} sztuka(i)`, inline: false },
              { name: `📦 Nowe przedmioty:`, value: `${u.inventory[shopItem.packFor]}x ${shopItem.packFor}`, inline: false }
            )
            .setColor(0x00ff00)
        ]
      });
    }
    
    // Special handling for mystery box
    if (shopItem.type === 'mystery') {
      const mysteryEffects = generateMysteryBoxEffects();
      
      // Apply mystery effects
      if (mysteryEffects.hunger !== 0) data.pet.hunger += mysteryEffects.hunger;
      if (mysteryEffects.happiness !== 0) data.pet.happiness += mysteryEffects.happiness;
      if (mysteryEffects.health !== 0) data.pet.health += mysteryEffects.health;
      if (mysteryEffects.cleanliness !== 0) data.pet.cleanliness += mysteryEffects.cleanliness;
      if (mysteryEffects.anger !== 0) data.pet.anger = Math.max(0, Math.min(100, data.pet.anger + mysteryEffects.anger));
      if (mysteryEffects.religion !== 0) data.pet.religion += mysteryEffects.religion;
      
      clampPet();
      u.itemCooldowns[actualName].push(Date.now());
      safeSave();
      
      const rarity = mysteryEffects.rarity;
      const rarityEmoji = rarity === 'legendary' ? '🌟' : rarity === 'cursed' ? '👹' : rarity === 'rare' ? '✨' : rarity === 'uncommon' ? '💫' : '⭐';
      
      return message.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle(`🎁 ${rarityEmoji} Otworzyłeś Mystery Box!`)
            .setDescription(`**Rzadkość:** ${rarity.toUpperCase()}\n\n${mysteryEffects.description}\n\n${getPetMood()}`)
            .addFields(
              { name: '🎯 Efekty:', value: mysteryEffects.effectsList, inline: false },
              { name: '🎁 Pozostało:', value: `${u.inventory[actualName]} sztuka(i)`, inline: false }
            )
            .setColor(mysteryEffects.color)
            .setThumbnail('https://cdn.discordapp.com/attachments/1234567890/1234567890/mysterybox.gif')
            .setTimestamp()
        ]
      });
    }
    
    // Apply normal item effects
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
              { name: "⏰ Czas na reakcję", value: "10 minut", inline: true }
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
  hunger: 100 / 960,      // 16 godzin na 100 punktów
  happiness: 100 / 960,   // 16 godzin na 100 punktów  
  cleanliness: 100 / 960, // 16 godzin na 100 punktów
  health: 100 / 960       // 16 godzin na 100 punktów
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
  { title: 'Misi pobrudził się podczas zabawy.', positive: false, effects: { cleanliness: -25, anger: 5 } },
  { title: 'Misi usłyszał dziwne szepty i poczuł lęk.', positive: false, effects: { happiness: -10, anger: 10 } },
  { title: 'Misi nawiedziły duchy.', positive: false, effects: { religion: -20, happiness: -5 } },
  { title: 'Szatan zakręcił się obok Misia.', positive: false, effects: { religion: -45, anger: 35 } },
  { title: 'Misi poczuł zły wpływ i stracił wiarę.', positive: false, effects: { religion: -25, anger: 10 } },
  { title: 'Misi miał zły sen, poczuł silne zdenerwowanie i stracił apetyt.', positive: false, effects: { anger: 30, hunger: -15 } }
];

// 👹 POSSESSED MESSAGE SYSTEM
function sendPossessedMessage(channel) {
  if (!data.pet.possessed || data.pet.dead) return;

  const possessedMessages = [
    "👹 **MISI JEST W TEJ CHWILI OBECNY...** 👁️‍🗨️",
    "🔥 **PŁONĘCZE OCZY PATRZĄ NA WAS...** 🔥",
    "🩸 **KREW... WIĘCEJ KRWI...** 🩸",
    "👁️‍🗨️ **WIDZĘ WASZE GRZECHY...** 👁️‍🗨️",
    "🐻 **MISI... ALE NIE TEN SAM...** 👹",
    "🔮 **WIEDZĘ CO UKRYWASZ W SERCU...** 🔮",
    "⚡ **MOC CIĘ POGŁĄBI...** ⚡",
    "🌑 **CIEMNOŚĆ ROZSIERA SIĘ...** 🌑",
    "🗣️ **SŁYSZĘ WASZE MYŚLI...** 🗣️",
    "💀 **ŚMIERĆ JEST BLISKO NIŻ MYŚLISZ...** 💀",
    "🕯️ **MODLITWA NIKT NIE POMOŻE...** 🕯️",
    "🐾 **ŁAPY MISIA DOTKNĄ TWOJEJ DUSZY...** 🐾",
    "🌪️ **SZTORM W DUSZY MISIA...** 🌪️",
    "🎭 **MASKA SPADEŁ... PRAWDZIWE OBlicZO POJAWIŁO SIĘ...** 🎭",
    "🔓 **BRAMY PIEKŁA SĄ OTWARTE...** 🔓"
  ];

  const randomMessage = possessedMessages[Math.floor(Math.random() * possessedMessages.length)];
  
  channel.send({
    embeds: [
      new EmbedBuilder()
        .setTitle("👹 OPĘTANY MISI")
        .setDescription(randomMessage)
        .setColor(0x8b0000) // Dark red color
        .setTimestamp()
        .setFooter({ text: "Misi nie sobą jest..." })
    ]
  });
}

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
      if (data.pet.possessed && Math.random() < 0.15) { // ~15% chance per minute (roughly every 5-10 minutes)
        sendPossessedMessage(channel);
      }
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

// 🎁 MYSTERY BOX EFFECTS
function generateMysteryBoxEffects() {
  const rand = Math.random();
  let rarity, color, description;
  
  // Determine rarity (25% common, 40% uncommon, 15% rare, 15% cursed, 5% legendary)
  if (rand < 0.05) {
    rarity = 'legendary';
    color = 0xffd700; // Gold
  } else if (rand < 0.20) {
    rarity = 'cursed';
    color = 0x8b0000; // Dark red
  } else if (rand < 0.35) {
    rarity = 'rare';
    color = 0x9966ff; // Purple
  } else if (rand < 0.75) {
    rarity = 'uncommon';
    color = 0x00ffff; // Cyan
  } else {
    rarity = 'common';
    color = 0x808080; // Gray
  }
  
  // Special handling for cursed box
  if (rarity === 'cursed') {
    return {
      rarity,
      color,
      description: 'To pudełko jest przeklęte! Misi czuje złą energię...',
      effectsList: '🍗 Głód -25\n😄 Szczęście -25\n❤️ Zdrowie -25\n🧼 Czystość -25\n😡 Zdenerwowanie +15',
      hunger: -25,
      happiness: -25,
      health: -25,
      cleanliness: -25,
      anger: 15,
      religion: 0
    };
  }
  
  // Generate random effects (1-3 effects per box)
  const numEffects = Math.floor(Math.random() * 3) + 1;
  const effects = {
    hunger: 0,
    happiness: 0,
    health: 0,
    cleanliness: 0,
    anger: 0,
    religion: 0
  };
  
  const possibleEffects = ['hunger', 'happiness', 'health', 'cleanliness', 'anger', 'religion'];
  const selectedEffects = [];
  
  // Select random effects
  for (let i = 0; i < numEffects; i++) {
    const availableEffects = possibleEffects.filter(e => !selectedEffects.includes(e));
    if (availableEffects.length === 0) break;
    
    const effect = availableEffects[Math.floor(Math.random() * availableEffects.length)];
    selectedEffects.push(effect);
    
    // Generate value based on rarity
    let value;
    if (rarity === 'legendary') {
      value = Math.floor(Math.random() * 31) + 15; // 15-45
    } else if (rarity === 'rare') {
      value = Math.floor(Math.random() * 21) + 10; // 10-30
    } else if (rarity === 'uncommon') {
      value = Math.floor(Math.random() * 16) + 5; // 5-20
    } else {
      value = Math.floor(Math.random() * 11) + 5; // 5-15
    }
    
    // 20% chance for negative value (except for anger which is always positive when reducing)
    if (Math.random() < 0.2 && effect !== 'anger') {
      value = -value;
    }
    
    effects[effect] = value;
  }
  
  // Create description and effects list
  const effectDescriptions = [];
  const effectsList = [];
  
  if (effects.hunger !== 0) {
    effectDescriptions.push(`Głód ${effects.hunger > 0 ? 'wzrasta' : 'spada'} o ${Math.abs(effects.hunger)}`);
    effectsList.push(`${effects.hunger > 0 ? '🍗' : '🍗'} Głód ${effects.hunger > 0 ? '+' : ''}${effects.hunger}`);
  }
  if (effects.happiness !== 0) {
    effectDescriptions.push(`Szczęście ${effects.happiness > 0 ? 'wzrasta' : 'spada'} o ${Math.abs(effects.happiness)}`);
    effectsList.push(`${effects.happiness > 0 ? '😄' : '😢'} Szczęście ${effects.happiness > 0 ? '+' : ''}${effects.happiness}`);
  }
  if (effects.health !== 0) {
    effectDescriptions.push(`Zdrowie ${effects.health > 0 ? 'wzrasta' : 'spada'} o ${Math.abs(effects.health)}`);
    effectsList.push(`${effects.health > 0 ? '❤️' : '💔'} Zdrowie ${effects.health > 0 ? '+' : ''}${effects.health}`);
  }
  if (effects.cleanliness !== 0) {
    effectDescriptions.push(`Czystość ${effects.cleanliness > 0 ? 'wzrasta' : 'spada'} o ${Math.abs(effects.cleanliness)}`);
    effectsList.push(`${effects.cleanliness > 0 ? '🧼' : '🦠'} Czystość ${effects.cleanliness > 0 ? '+' : ''}${effects.cleanliness}`);
  }
  if (effects.anger !== 0) {
    effectDescriptions.push(`Zdenerwowanie ${effects.anger > 0 ? 'wzrasta' : 'spada'} o ${Math.abs(effects.anger)}`);
    effectsList.push(`${effects.anger > 0 ? '😡' : '😌'} Zdenerwowanie ${effects.anger > 0 ? '+' : ''}${effects.anger}`);
  }
  if (effects.religion !== 0) {
    effectDescriptions.push(`Religia ${effects.religion > 0 ? 'wzrasta' : 'spada'} o ${Math.abs(effects.religion)}`);
    effectsList.push(`${effects.religion > 0 ? '🙏' : '👿'} Religia ${effects.religion > 0 ? '+' : ''}${effects.religion}`);
  }
  
  description = `Otwierasz pudełko z niespodzianką i: ${effectDescriptions.join(', ')}!`;
  
  return {
    rarity,
    color,
    description,
    effectsList: effectsList.join('\n'),
    ...effects
  };
}

// �� INTERAKTYWNE PRZYCISKI - HANDLER
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isButton()) return;
  
  const userId = interaction.user.id;
  ensureUser(userId);
  
  // Sprawdź czy to właściwy kanał
  const channel = interaction.guild.channels.cache.find(
    c => c.name === allowedChannelName && c.isTextBased()
  );
  
  if (!channel || interaction.channel.id !== channel.id) {
    return interaction.reply({ content: '❌ Możesz używać przycisków tylko na kanale #misi!', ephemeral: true });
  }
  
  if (data.pet.dead) {
    return interaction.reply({ content: '❌ Misi nie żyje! Użyj `!adopt` lub `!restore`.', ephemeral: true });
  }
  
  const action = interaction.customId;
  let response;
  
  switch (action) {
    case 'feed':
      response = handleFeedAction(userId);
      break;
    case 'play':
      response = handlePlayAction(userId);
      break;
    case 'clean':
      response = handleCleanAction(userId);
      break;
    case 'heal':
      response = handleHealAction(userId);
      break;
    default:
      return;
  }
  
  if (response.success) {
    // Wyślij powiadomienie o akcji z XP i monetami
    await interaction.followUp({
      content: `${response.emoji} ${interaction.user.username} ${response.message}! Otrzymano: 💰 ${response.coins} monet, 📈 ${response.xp} XP`,
      ephemeral: false
    });
    
    // Zaktualizuj oryginalną wiadomość
    await interaction.update({
      embeds: [createStatusEmbed(userId)]
    });
  } else {
    // Pokaż błąd tylko użytkownikowi
    await interaction.reply({ content: response.message, ephemeral: true });
  }
});

// Funkcje pomocnicze dla przycisków
function handleFeedAction(userId) {
  const now = Date.now();
  const lastFeed = data.users[userId].lastFeed || 0;
  if (now - lastFeed < 600000) {
    const remainingMs = 600000 - (now - lastFeed);
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { success: false, message: `⏳ Poczekaj ${minutes}m ${seconds}s przed kolejnym karmieniem!` };
  }
  
  const feedBefore = data.pet.hunger;
  data.pet.hunger = Math.min(100, data.pet.hunger + 15);
  clampPet();
  
  const feedCoins = Math.floor(Math.random() * 16) + 5;
  const levelBonus = getLevelBonus(data.users[userId].level);
  
  data.users[userId].coins += feedCoins + levelBonus;
  data.users[userId].xp += 5;
  data.users[userId].lastFeed = now;
  safeSave();
  
  return { 
    success: true, 
    message: 'nakarmił Misia', 
    emoji: '🍗',
    coins: feedCoins + levelBonus,
    xp: 5
  };
}

function handlePlayAction(userId) {
  const now = Date.now();
  const lastPlay = data.users[userId].lastPlay || 0;
  if (now - lastPlay < 600000) {
    const remainingMs = 600000 - (now - lastPlay);
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { success: false, message: `⏳ Poczekaj ${minutes}m ${seconds}s przed kolejną zabawą!` };
  }
  
  const playBefore = data.pet.happiness;
  data.pet.happiness = Math.min(100, data.pet.happiness + 10);
  data.pet.happinessLossSincePlay = 0;
  data.pet.lastPlayAt = Date.now();
  clampPet();
  
  const playCoins = Math.floor(Math.random() * 16) + 5;
  const levelBonus = getLevelBonus(data.users[userId].level);
  
  data.users[userId].coins += playCoins + levelBonus;
  data.users[userId].xp += 5;
  data.users[userId].lastPlay = now;
  safeSave();
  
  return { 
    success: true, 
    message: 'bawił się z Misiem', 
    emoji: '🎾',
    coins: playCoins + levelBonus,
    xp: 5
  };
}

function handleCleanAction(userId) {
  const now = Date.now();
  const lastClean = data.users[userId].lastClean || 0;
  if (now - lastClean < 600000) {
    const remainingMs = 600000 - (now - lastClean);
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { success: false, message: `⏳ Poczekaj ${minutes}m ${seconds}s przed kolejnym czyszczeniem!` };
  }
  
  const cleanBefore = data.pet.cleanliness;
  data.pet.cleanliness = Math.min(100, data.pet.cleanliness + 10);
  clampPet();

  const cleanCoins = Math.floor(Math.random() * 16) + 5;
  const levelBonus = getLevelBonus(data.users[userId].level);

  data.users[userId].coins += cleanCoins + levelBonus;
  data.users[userId].xp += 5;
  data.users[userId].lastClean = now;
  safeSave();

  return { 
    success: true, 
    message: 'umył Misia', 
    emoji: '🧼',
    coins: cleanCoins + levelBonus,
    xp: 5
  };
}

function handleHealAction(userId) {
  const now = Date.now();
  const lastHeal = data.users[userId].lastHeal || 0;
  if (now - lastHeal < 600000) {
    const remainingMs = 600000 - (now - lastHeal);
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { success: false, message: `⏳ Poczekaj ${minutes}m ${seconds}s przed kolejnym leczeniem!` };
  }
  
  const healBefore = data.pet.health;
  data.pet.health = Math.min(100, data.pet.health + 15);
  clampPet();
  
  const healCoins = Math.floor(Math.random() * 16) + 5;
  const levelBonus = getLevelBonus(data.users[userId].level);
  
  data.users[userId].coins += healCoins + levelBonus;
  data.users[userId].xp += 5;
  data.users[userId].lastHeal = now;
  safeSave();
  
  return { 
    success: true, 
    message: 'uleczył Misia', 
    emoji: '❤️',
    coins: healCoins + levelBonus,
    xp: 5
  };
}

// 📊 MONITOROWANIE I LOGOWANIE
const log = (message, level = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '🚨' : level === 'warn' ? '⚠️' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
};

const backupData = () => {
  try {
    const backup = JSON.stringify(data, null, 2);
    fs.writeFileSync(`data.backup.${Date.now()}.json`, backup);
    log('Backup danych utworzony pomyślnie', 'info');
  } catch (error) {
    log(`Błąd podczas tworzenia backupu: ${error.message}`, 'error');
  }
};

const recoverFromBackup = () => {
  try {
    const files = fs.readdirSync('.').filter(file => file.startsWith('data.backup.') && file.endsWith('.json'));
    if (files.length === 0) {
      log('Brak plików backup do przywrócenia', 'warn');
      return false;
    }
    
    // Sortuj pliki po dacie i weź najnowszy
    files.sort((a, b) => {
      const timeA = parseInt(a.split('.')[2]);
      const timeB = parseInt(b.split('.')[2]);
      return timeB - timeA;
    });
    
    const latestBackup = files[0];
    log(`Przywracanie z backupu: ${latestBackup}`, 'info');
    
    const backupData = JSON.parse(fs.readFileSync(latestBackup, 'utf8'));
    
    // Waliduj dane z backupu
    const originalData = data;
    data = backupData;
    
    if (validateData()) {
      log('Dane przywrócone pomyślnie z backupu', 'info');
      return true;
    } else {
      log('Dane z backupu są uszkodzone, przywracanie oryginalnych danych', 'error');
      data = originalData;
      return false;
    }
  } catch (error) {
    log(`Błąd podczas przywracania z backupu: ${error.message}`, 'error');
    return false;
  }
};

const safeSave = () => {
  try {
    clampPet();
    fs.writeFileSync('data.json', JSON.stringify(data, null, 2));
  } catch (error) {
    log(`Krytyczny błąd zapisu danych: ${error.message}`, 'error');
    log('Próba przywrócenia z ostatniego backupu...', 'warn');
    if (recoverFromBackup()) {
      log('Dane przywrócone z backupu', 'info');
    } else {
      log('Nie udało się przywrócić danych - aplikacja może być niestabilna', 'error');
    }
  }
};

const validateData = () => {
  const issues = [];
  let criticalErrors = [];
  
  // Sprawdź strukturę danych
  if (!data.pet) {
    criticalErrors.push('Brak danych pet');
  } else if (typeof data.pet !== 'object') {
    criticalErrors.push('Dane pet nie są obiektem');
  }
  
  if (!data.users) {
    criticalErrors.push('Brak danych użytkowników');
  } else if (typeof data.users !== 'object') {
    criticalErrors.push('Dane użytkowników nie są obiektem');
  }
  
  // Sprawdź statystyki pet
  const petStats = ['hunger', 'happiness', 'health', 'cleanliness', 'anger', 'religion'];
  for (const stat of petStats) {
    if (typeof data.pet[stat] !== 'number' || data.pet[stat] < 0 || data.pet[stat] > 100) {
      issues.push(`Niepoprawna wartość statystyki: ${stat} (${data.pet[stat]})`);
    }
  }
  
  // Sprawdź użytkowników - szczegółowa walidacja
  for (const [userId, user] of Object.entries(data.users)) {
    if (typeof user !== 'object') {
      criticalErrors.push(`Użytkownik ${userId} ma niepoprawny typ danych`);
      continue;
    }
    
    if (!user.coins || user.coins < 0) {
      issues.push(`Użytkownik ${userId} ma niepoprawne monety (${user.coins})`);
    }
    if (!user.xp || user.xp < 0) {
      issues.push(`Użytkownik ${userId} ma niepoprawne XP (${user.xp})`);
    }
    if (!user.level || user.level < 1 || user.level > 1000) {
      issues.push(`Użytkownik ${userId} ma niepoprawny level (${user.level})`);
    }
    if (!user.inventory || typeof user.inventory !== 'object') {
      criticalErrors.push(`Użytkownik ${userId} ma niepoprawne inventory`);
    }
    if (!user.cooldowns || typeof user.cooldowns !== 'object') {
      criticalErrors.push(`Użytkownik ${userId} ma niepoprawne cooldowns`);
    }
    if (!user.itemCooldowns || typeof user.itemCooldowns !== 'object') {
      criticalErrors.push(`Użytkownik ${userId} ma niepoprawne itemCooldowns`);
    }
  }
  
  // Logowanie wyników walidacji
  if (criticalErrors.length > 0) {
    log('KRYTYCZNE BŁĘDY DANYCH:', 'error');
    criticalErrors.forEach(error => log(`  - ${error}`, 'error'));
    log('Aplikacja zostanie zatrzymana dla bezpieczeństwa danych!', 'error');
    return false;
  }
  
  if (issues.length > 0) {
    log(`Ostrzeżenia w danych: ${issues.join(', ')}`, 'warn');
  }
  
  return true;
};

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
if (!DISCORD_TOKEN) {
  console.error('ERROR: Missing DISCORD_TOKEN environment variable. Set it in Railway variables.');
  process.exit(1);
}

// Walidacja przy starcie
if (!validateData()) {
  log('Krytyczne błędy danych - aplikacja zostanie zatrzymana', 'error');
  process.exit(1);
}

// Automatyczny backup co 6 godzin
setInterval(backupData, 6 * 60 * 60 * 1000);

// Logowanie startu aplikacji
log('Aplikacja Misi Bot uruchomiona pomyślnie', 'info');
log(`Token Discord: ${DISCORD_TOKEN ? 'OK' : 'BRAK'}`, 'info');
log(`Kanał docelowy: ${allowedChannelName}`, 'info');

client.login(DISCORD_TOKEN);
