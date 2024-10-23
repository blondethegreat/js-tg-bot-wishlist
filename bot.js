const { Telegraf } = require('telegraf');
const fs = require('fs');
const { message } = require('telegraf/filters');

require('dotenv').config();

const { BOT_TOKEN } = process.env;
const ADMIN_ID = Number(process.env.ADMIN_ID);
const YARIK_ID = Number(process.env.YARIK_ID);

const bot = new Telegraf(BOT_TOKEN);

const wishlist = JSON.parse(fs.readFileSync('wishlist.json', 'utf8'));

bot.start((ctx) => ctx.reply('Привет, это вишлист лучшего земели в мире'));

bot.command('wishlist', (ctx) => {
  const gifts = wishlist.map((gift, index) => {
    const bought = gift.boughtBy
      ? `(куплено ${gift.boughtBy})`
      : `(никем не куплено ещё :( )`;
    const row = `${index + 1}. ${gift.title} ${bought}`;
    return row;
  });
  ctx.reply(`Список подарков:\n${gifts.join(`\n`)}`);
});

bot.command('add', (ctx) => {
  if (ctx.from.id !== ADMIN_ID && ctx.from.id !== YARIK_ID) {
    ctx.reply('Вы не можете добавлять подарок');
    return;
  }
  const giftTitle = ctx.message.text.split(' ').slice(1).join(' ');
  const gift = { title: giftTitle, boughtBy: null };
  wishlist.push(gift);
  fs.writeFileSync('wishlist.json', JSON.stringify(wishlist, null, 2), 'utf8');
  ctx.reply(`Подарок ${giftTitle} был успешно добавлен`);
});

bot.command('delete', (ctx) => {
  if (ctx.from.id !== ADMIN_ID && ctx.from.id !== YARIK_ID) {
    ctx.reply('Вы не можете удалять подарок');
    return;
  }
  const giftIndex = Number(ctx.message.text.split(' ')[1]);
  const [deletedGift] = wishlist.splice(giftIndex - 1, 1);
  fs.writeFileSync('wishlist.json', JSON.stringify(wishlist, null, 2), 'utf8');
  ctx.reply(`Подарок ${deletedGift.title} успешно удалён`);
});

bot.command('buy', (ctx) => {
  const giftIndex = Number(ctx.message.text.split(' ')[1]);
  wishlist[giftIndex - 1].boughtBy = ctx.from.username;
  fs.writeFileSync('wishlist.json', JSON.stringify(wishlist, null, 2), 'utf8');

  ctx.reply(`Подарок ${wishlist[giftIndex - 1].title} будет куплен ${ctx.from.username}`);
});

bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
