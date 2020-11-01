import Head from 'next/head'
import axios from 'axios'

import Layout from '../../components/Layout'
import { HouseForm } from '../../components/HouseForm'

const NewHouse = () => {

  return (<Layout
    content={<>
      <Head>
        <title>Add a new house</title>
      </Head>
      <HouseForm /></>}
  />)
}

export default NewHouse