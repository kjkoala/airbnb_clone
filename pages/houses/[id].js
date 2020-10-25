import Head from 'next/head'
import houses from '../houses.json'
import Layout from '../../components/Layout'
import DateRangePicker from '../../components/DateRangePicker'
import { useState } from 'react'

import { useStoreActions } from 'easy-peasy'

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

const House = ({ house, url }) => {
  const [dateChosen, setDateChosen] = useState(false)
  const [numberOfNightsBetweenDates, setNumberOfNightsBetweenDates] = useState(0)

  const { setShowLoginModal } =useStoreActions(actions => actions.modals)
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
        <p>
          {house.rating} ({house.reviewsCount})
        </p>
      </article>
      <aside>
        <h2>
          Add dates for prices
          <DateRangePicker datesChanged={(startDate, endDate) => {
            setNumberOfNightsBetweenDates(
              calcNumerOfNightsBetweenDates(startDate, endDate)
            );
            setDateChosen(true)
          }} />
        </h2>
        {dateChosen && <>
          <h2>Price per night</h2>
          <p>${house.price}</p>
          <h2>Total price for booking</h2>
          <p>${(numberOfNightsBetweenDates * house.price).toFixed(2)}</p>
          <button className="reserve" onClick={setShowLoginModal}>Reserve</button>
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

House.getInitialProps = ({ query }) => {
  return ({
    house: houses.filter(house => house.id === query.id)[0]
  })
}

export default House