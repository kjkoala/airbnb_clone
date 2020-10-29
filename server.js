const express = require('express')
const next = require('next')
const session = require('express-session')
const bodyParser = require('body-parser')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const Op = require('sequelize').Op
const dotenv = require('dotenv')

const User = require('./models/user.js')
const House = require('./models/house.js')
const Review = require('./models/review.js')
const Booking = require('./models/booking.js')

const sequelize = require('./database.js')
const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const handle = nextApp.getRequestHandler()
const sessionStore = new SequelizeStore({ db: sequelize })

sessionStore.sync()
dotenv.config()

User.sync({ alter: true })
House.sync({ alter: true })
Review.sync({ alter: true })
Booking.sync({ alter: true })

const getDatesBetweenDates = (startDate, endDate) => {
  let dates = []
  while (startDate < endDate) {
    dates = [...dates, new Date(startDate)]
    startDate.setDate(startDate.getDate() + 1)
  }
  dates = [...dates, endDate]
  return dates
}

const canBookThoseDates = async (houseId, startDate, endDate) => {
  const results = await new Booking({
    where: {
      houseId,
      startDate: {
        [Op.lte]: new Date(endDate)
      },
      endDate: {
        [Op.gte]: new Date(startDate)
      }
    }
  })
  return !(results.length > 0)
}

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
},
  async function (email, password, done) {
    if (!email || !password) {
      done('Email and password required!', null)
      return
    }
    const user = await User.findOne({ where: { email } })

    if (!user) {
      done('User not found', null)
      return
    }
    const valid = await user.isPasswordValid(password)

    if (!valid) {
      done('Email and password do not match', null)
      return
    }
    done(null, user)
  }
))

passport.serializeUser((user, done) => {
  done(null, user.email)
})

passport.deserializeUser((email, done) => {
  User.findOne({ where: { email } })
    .then(user => done(null, user))
})

nextApp.prepare()
  .then(() => {
    const server = express()
    // parse application/x-www-form-urlencoded
    server.use(bodyParser.urlencoded({ extended: false }))

    // parse application/json
    server.use(bodyParser.json({
      verify: (req, res, buf) => {
        req.rawBody = buf
      }
    }))

    server.use(session({
      secret: 'pipxjh29jdpw',
      resave: false,
      saveUninitialized: true,
      name: 'airbnb',
      cookie: {
        secure: false,
        maxAge: 30 * 24 * 60 * 60 * 1000
      },
      store: sessionStore
    }),
      passport.initialize(),
      passport.session()
    )


    server.post('/api/auth/register', async (req, res) => {
      try {
        const { password, email, passwordconfirmation } = req.body
        if (password !== passwordconfirmation) {
          res.end(JSON.stringify({ status: 'error', message: 'Password do not match' }))
          return
        }
        const user = await User.create({ email, password })
        req.login(user, (err) => {
          if (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ status: 'error', message: err }))
            return
          }
          return res.end(JSON.stringify({ status: 'success', message: 'Logged in' }))
        })
        res.end(JSON.stringify({ status: 'success', message: 'User added' }))
      }
      catch (error) {
        let message = 'An error occured'
        if (error.name === 'SequelizeUniqueConstraintError') {
          message = 'User already exist'
        }
        res.status(500).end(JSON.stringify({ status: 'error', message }))
      }
    })

    server.post('/api/auth/login', (req, res) => {
      passport.authenticate('local', (err, user, info) => {
        if (err) {
          res.statusCode = 500
          res.end(JSON.stringify({ status: 'error', message: err }))
          return
        }
        if (!user) {
          res.statusCode = 500
          res.end(JSON.stringify({ status: 'error', message: 'No matches user credentials' }))
          return
        }
        req.login(user, err => {
          if (err) {
            res.statusCode = 500
            res.end(JSON.stringify({ status: 'error', message: err }))
            return
          }
          return res.end(JSON.stringify({ status: 'success', message: 'Logged in' }))
        })
      })(req, res, next)
    })

    server.post('/api/auth/logout', (req, res) => {
      req.logout()
      req.session.destroy()

      return res.end(JSON.stringify({ status: 'success', message: 'Logged out' }))
    })

    server.get('/api/houses', (req, res) => {
      House.findAndCountAll()
        .then(result => {
          const houses = result.rows.map(house => house.dataValues)

          res.writeHead(200, {
            'Content-Type': 'application/json'
          })
          res.end(JSON.stringify(houses))
        })
    })

    server.get('/api/houses/:id', (req, res) => {
      const { id } = req.params

      House.findByPk(id)
        .then(house => {
          if (house) {
            Review.findAndCountAll({
              where: { houseId: house.id }
            })
              .then(reviews => {
                house.dataValues.reviews = reviews.rows.map(review => review.dataValues)
                house.dataValues.reviewCount = reviews.count
                res.writeHead(200, {
                  'Content-Type': 'application/json'
                })
                res.end(JSON.stringify(house.dataValues))
              })
          } else {
            res.writeHead(404, {
              'Content-Type': 'application/json'
            })
            res.end(JSON.stringify({ message: 'Not found' }))
          }
        })
    })

    server.post('/api/houses/reserve', async (req, res) => {
      if (!req.session.passport) {
        res.status(403).json({
          status: 'error',
          message: 'Unauthorized'
        })
        return
      }

      const { houseId, startDate, endDate, sessionId } = req.body

      if (!(await canBookThoseDates(houseId, startDate, endDate))) {
        res.status(500).json({
          status: 'error',
          message: 'house is already booked!'
        })
        return
      }
      const userEmail = req.session.passport.user
      User.findOne({
        where: {
          email: userEmail
        }
      })
        .then(user => {
          return Booking.create({
            houseId,
            userId: user.id,
            startDate,
            endDate,
            sessionId
          })
        })
        .then(() => {
          res.json({
            status: 'success',
            message: 'ok'
          })
        })
    })

    server.post('/api/houses/booked', async (req, res) => {
      const houseId = req.body.houseId

      const results = await Booking.findAll({
        where: {
          houseId,
          endDate: {
            [Op.gte]: new Date()
          }
        }
      })

      let bookedDates = []

      for (const result of results) {
        const dates = getDatesBetweenDates(
          new Date(result.startDate),
          new Date(result.endDate)
        )

        bookedDates = [...bookedDates, ...dates]
      }

      //Remove duplicates
      bookedDates = [...new Set(bookedDates.map(date => date))]

      res.json({
        status: 'success',
        message: 'ok',
        dates: bookedDates
      })
    })


    server.post('/api/houses/check', async (req, res) => {
      const { startDate, endDate, houseId } = req.body

      let message = 'free'
      if (!(await canBookThoseDates(houseId, startDate, endDate))) {
        message = 'busy'
      }

      res.json({
        status: ' success',
        message
      })
    })

    server.post('/api/stripe/session', async (req, res) => {
      const { amount } = req.body

      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          name: 'Booking amount on Airbnb clone',
          amount: amount * 100,
          currency: 'usd',
          quantity: 1
        }],
        success_url: process.env.BASE_URL + '/bookings',
        cancel_url: process.env.BASE_URL + '/bookings'
      })
      res.json({
        status: 'success',
        sessionId: session.id,
        stripePublicKey: process.env.STRIPE_PUBLIC_KEY
      })
    })

    server.post('/api/stripe/webhook', async (req, res) => {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET
      const sig = req.headers['stripe-signature']

      let event

      try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret)
      } catch (e) {
        res.status(400).json({
          status: 'error',
          message: 'Webhook Error: ' + e.message
        })
        return
      }

      if (event.type === 'checkout.session.completed') {
        const sessionId = event.data.object.id

        try {
          Booking.update({
            paid: true
          }, {
            where: { sessionId }
          })
        } catch (e) {
          console.log(e)
        }
        res.json({
          received: true
        })
      }
    })

    server.post('/api/bookings/clean', (req, res) => {
      Booking.destroy({
        where: { paid: false }
      })

      res.json({
        status: 'success',
        message: 'ok'
      })
    })

    server.get('/api/bookings/list', async (req, res) => {
      Booking.findAndCountAll({
        where: { paid: false }
      })
        .then(async (result) => {
          const bookings = await Promise.all(
            result.rows.map(async (booking) => {
              const data = {}
              data.booking = booking.dataValues
              data.house = (await House.findByPk(data.booking.houseId)).dataValues
              return data
            })
          )

          res.json({
            bookings
          })
        })
    })

    server.all('*', (req, res) => {
      return handle(req, res)
    })

    server.listen(port, (err) => {
      if (err) throw err
      console.log('> Ready on http://localhost:' + port)
    })
  })