require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api')
const mongoose = require('mongoose')
require('./matches.model')

mongoose.connect(process.env.BDURL, {
   useNewUrlParser: true,
   useUnifiedTopology: true
})
   .then(() => console.log('Mongo connected'))
   .catch((err) => console.log(err))

const Matches = mongoose.model('matches')

function sendMatches(chatId, type) {
   Matches.find({}).then(matches => {
      let nextMatch
      let home

      if (type === 'full') {
         const html = matches.map((match, i) => {
            return `${match.home} - ${match.guest} <b>${match.date}</b>`
         }).join('\n')

         bot.sendMessage(chatId, html, { parse_mode: 'HTML' })
      } else if (type === 'next') {
         let matchData = matches[0]
         matchData.type === 'Домашка' ? home = true : false
         nextMatch = `${matchData.home} - ${matchData.guest} <b>${matchData.date}</b>`

         bot.sendMessage(chatId, nextMatch, home ? {
            parse_mode: 'HTML', reply_markup: {
               inline_keyboard: [
                  [
                     {
                        text: 'Купить билет',
                        url: `${process.env.TICKETS}`
                     }
                  ]
               ]
            }
         } : {
            parse_mode: 'HTML', reply_markup: {
               inline_keyboard: [
                  [
                     {
                        text: 'Подобрать билет на самолет',
                        url: `${process.env.AVIASALES}`
                     }
                  ]
               ]
            }
         })
      }
   })
}

const bot = new TelegramBot(process.env.TOKEN, { polling: true })
bot.onText(/\/start/, ctx => {
   bot.sendMessage(ctx.chat.id, 'Здравствуйте!\nДля просмотра меню бота, отправьте команду /menu или выбирете её из списка команд, доступных по нажатию на "/" внизу страницы')
})

bot.onText(/\/menu/, ctx => {
   bot.sendMessage(ctx.chat.id, 'Меню', {
      reply_markup: {
         keyboard: [
            ['Расписание'],
            ['Следующий матч'],
            ['Дополнительная информация'],
            ['Закрыть']
         ]
      }
   })
})

bot.on('message', ctx => {
   if (ctx.text === 'Закрыть') {
      bot.sendMessage(ctx.chat.id, 'Закрываю', {
         reply_markup: {
            remove_keyboard: true
         }
      })
   } else if (ctx.text === 'Расписание') {
      sendMatches(ctx.chat.id, 'full')
   } else if (ctx.text === 'Следующий матч') {
      sendMatches(ctx.chat.id, 'next')
   } else if (ctx.text === 'Дополнительная информация') {
      bot.sendMessage(ctx.chat.id, 'Подписывайся, дорогой, лайки, комменты, ну сам в курсе', {
         reply_markup: {
            inline_keyboard: [
               [
                  {
                     text: 'Torpedo Rave',
                     url: `${process.env.INST1}`
                  }
               ],
               [
                  {
                     text: 'Torpedo Stickers',
                     url: `${process.env.INST2}`
                  }
               ]
            ]
         }
      })
   }
})
