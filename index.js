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
      let dateNow = new Date()
      let day = dateNow.getDate()
      let month = dateNow.getMonth()
      let year = dateNow.getFullYear()

      if (type === 'full') {
         const html = matches.map((match, i) => {
            return `${match.home} - ${match.guest} <b>${match.date}</b>`
         }).join('\n')

         bot.sendMessage(chatId, html, { parse_mode: 'HTML' })
      } else if (type === 'next') {
         for (let i = 0; i < matches.length; i++) {
            let matchDay = matches[i].date[0] + matches[i].date[1]
            let matchMonth = matches[i].date[3] + matches[i].date[4]
            let matchYear = matches[i].date[6] + matches[i].date[7] + matches[i].date[8] + matches[i].date[9]

            matches[i].type === 'Домашка' ? home = true : false

            if (Number(matchYear) >= Number(year) && Number(matchMonth) >= Number(month) && Number(matchDay) >= Number(day)) {
               nextMatch = `${matches[i].home} - ${matches[i].guest} <b>${matches[i].date}</b>`
               break
            }
         }

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
         } : { parse_mode: 'HTML' })
      }
   })
}

const bot = new TelegramBot(process.env.TOKEN, { polling: true })

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