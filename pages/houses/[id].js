import { useState } from 'react'
import Head from 'next/head'
import Layout from '../../components/Layout'
import DateRangePicker from '../../components/DateRangePicker'

import { useStoreActions, useStoreState } from 'easy-peasy'

import fetch from 'isomorphic-unfetch'

import axios from 'axios'

const calcNumerOfNightsBetweenDates = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  let dayCount = 0

  while (end > start) {
    dayCount++
    start.setDate(start.getDate() + 1)
  }
  return dayCount
}

const getBookedDates = async (houseId) => {
  try {
    const response = await axios.post('http://localhost:3000/api/houses/booked', { houseId })
    if (response.data.status === 'error') {
      alert(response.data.message)
      return
    }
    return response.data.dates
  } catch (e) {
    console.log(e)
    return
  }
}

const canReverse = async (houseId, startDate, endDate) => {
  try {
    const response = await axios.post('http://localhost:3000/api/houses/check', {
      houseId, startDate, endDate
    })
    if (response.data.status === 'error') {
      alert(response.data.message)
      return
    }
    if (response.data.message === 'busy') return false
    return true
  } catch (e) {
    console.error(e)
  }
}


const House = ({ house, bookedDates, url }) => {
  const { user } = useStoreState(({ user }) => user)

  const [dateChosen, setDateChosen] = useState(false)
  const [numberOfNightsBetweenDates, setNumberOfNightsBetweenDates] = useState(0)
  const [startDate, setStartDate] = useState()
  const [endDate, setEndDate] = useState()

  const { setShowLoginModal } = useStoreActions(actions => actions.modals)
  return (<Layout content={
    <div className="container">
      <Head>
        <title>{house.title}</title>
      </Head>
      <article>
        <img src={house.picture} width="100%" alt="House Picture" />
        <p>
          {house.type} - {house.town}
        </p>
        <p>{house.title}</p>
        {house.reviewCount &&
          <div className="reviews">
            <h3>{house.countReviews} Reviews</h3>
            {house.reviews.map((review, index) => <div key={index}>
              <p>{new Date(review.createAt).toDateString()}</p>
              <p>{review.comment}</p>
            </div>)}
          </div>}
        {/* <p>
          {house.rating} ({house.reviewsCount})
        </p> */}
      </article>
      <aside>
        <h2>
          Add dates for prices
          <DateRangePicker bookedDates={bookedDates} datesChanged={(startDate, endDate) => {
            setNumberOfNightsBetweenDates(
              calcNumerOfNightsBetweenDates(startDate, endDate)
            );
            setDateChosen(true)
            setStartDate(startDate)
            setEndDate(endDate)
          }} />
        </h2>
        {dateChosen && <>
          <h2>Price per night</h2>
          <p>${house.price}</p>
          <h2>Total price for booking</h2>
          <p>${(numberOfNightsBetweenDates * house.price).toFixed(2)}</p>
          {user ? <button className="reserve" onClick={async () => {
            try {
              if (!(await canReverse(house.id, startDate, endDate))) {
                alert('The dates choosen are not valid')
                return
              }
              const sessionResponse = await axios.post('/api/stripe/session', {
                amount: house.price * numberOfNightsBetweenDates
              })
              if (sessionResponse.data.status === 'error') {
                alert(sessionResponse.data.message)
                return
              }
              const sessionId = sessionResponse.data.sessionId
              const stripePublicKey = sessionResponse.data.stripePublicKey
              const reserveResponse = await axios.post('/api/houses/reserve', {
                houseId: house.id,
                startDate,
                endDate,
                sessionId
              })
              if (reserveResponse.data.status === 'error') {
                alert(reserveResponse.data.message)
                return
              }
              const stripe = Stripe(stripePublicKey)
              const { error } = await stripe.redirectToCheckout({
                sessionId
              })
              console.log('[STRIPE_ERROR]',error)
            } catch (e) {
              console.log(e)
              return
            }
          }}>Reserve</button> :
            <button className="reserve" onClick={setShowLoginModal}>Reserve</button>}
        </>}
      </aside>
      <style jsx>
        {`
        .container {
          display: grid;
          grid-template-columns: 60% 40%;
          grid-gap: 30px;
        }

        aside {
          border: 1px solid #ccc;
          padding: 20px;
        }
      `}
      </style>
    </div>
  } />)
}

House.getInitialProps = async ({ query }) => {
  const { id } = query

  const res = await fetch('http://localhost:3000/api/houses/' + id)
  const house = await res.json()
  const bookedDates = await getBookedDates(id)
  return { house, bookedDates }
}

export default House